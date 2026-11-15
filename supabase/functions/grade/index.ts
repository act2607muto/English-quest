/**
 * AI採点の Edge Function。
 *
 * 呼べるのはログインした本人だけ。問題文と模範解答はデータベースから読むので、
 * 画面側から採点の材料を書き換えることはできない。
 *
 * 受け取るもの（POST, JSON）:
 *   { mode: "status" }                                   → 使えるサービスの一覧
 *   { questionId, answer, spoken? }                      → ふだんのサービスで採点
 *   { questionId, answer, spoken?, providers: [...] }    → 指定したサービスで同時に採点（比べる用）
 */
import { createClient } from 'npm:@supabase/supabase-js@2.119.0';
import {
  configuredProviders,
  defaultProvider,
  grade,
  providerModel,
  PROVIDERS,
  type Provider,
} from '../_shared/graders.ts';

const MAX_ANSWER_LENGTH = 300;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

/** 文中の {{given_en}} などを置き換える（画面側 src/lib/game/battle.ts の fillNames と同じ既定の名前） */
function fillNames(text: string): string {
  const names: Record<string, string> = {
    name_ja: '田中ユキ',
    given_ja: 'ユキ',
    name_en: 'Yuki Tanaka',
    given_en: 'Yuki',
  };
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (all, key: string) => names[key] ?? all);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (req.method !== 'POST') return json({ error: 'POST で呼んでください' }, 405);

  // ログインした本人かを確かめる
  const authHeader = req.headers.get('Authorization') ?? '';
  // 画面側の supabase-js は publishable key を apikey ヘッダーで送ってくる。環境変数にない場合はそれを使う
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || req.headers.get('apikey') || '';
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
  const { data: userData, error: userError } = await supabase.auth.getUser(authHeader.replace(/^Bearer\s+/i, ''));
  if (userError || !userData.user) return json({ error: 'ログインが必要です' }, 401);

  let body: { mode?: string; questionId?: string; answer?: string; spoken?: boolean; providers?: string[] };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'JSON で送ってください' }, 400);
  }

  if (body.mode === 'status') {
    const available = configuredProviders();
    return json({
      defaultProvider: defaultProvider(),
      providers: PROVIDERS.map((p) => ({ provider: p, model: providerModel(p), available: available.includes(p) })),
    });
  }

  const answer = (body.answer ?? '').trim();
  if (!body.questionId || !answer) return json({ error: 'questionId と answer が必要です' }, 400);
  if (answer.length > MAX_ANSWER_LENGTH) return json({ error: `答えは${MAX_ANSWER_LENGTH}文字までにしてください` }, 400);

  const { data: q, error: qError } = await supabase
    .from('questions')
    .select('id, format, sentence, sentence_ja, model_answers')
    .eq('id', body.questionId)
    .maybeSingle();
  if (qError) return json({ error: `問題を読めませんでした（${qError.message}）` }, 500);
  if (!q) return json({ error: '問題が見つかりません' }, 404);
  if (q.format !== 'translate' && q.format !== 'respond') return json({ error: 'AI採点の問題ではありません' }, 400);

  const task = {
    format: q.format as 'translate' | 'respond',
    sentence: fillNames(q.sentence ?? ''),
    sentenceJa: q.sentence_ja ? fillNames(q.sentence_ja) : null,
    modelAnswers: ((q.model_answers ?? []) as string[]).map(fillNames),
    answer,
    spoken: body.spoken === true,
  };

  const requested = (body.providers ?? [defaultProvider()]).filter((p): p is Provider =>
    (PROVIDERS as readonly string[]).includes(p),
  );
  if (requested.length === 0) return json({ error: '使えるサービスが指定されていません' }, 400);

  const results = await Promise.all(
    requested.map(async (provider) => {
      const started = Date.now();
      try {
        const result = await grade(provider, task);
        return { provider, model: providerModel(provider), ok: true, ms: Date.now() - started, ...result };
      } catch (err) {
        console.error(provider, err);
        return {
          provider,
          model: providerModel(provider),
          ok: false,
          ms: Date.now() - started,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    }),
  );
  return json({ results });
});
