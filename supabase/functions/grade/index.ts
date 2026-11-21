/**
 * AI採点の Edge Function。
 *
 * 呼べるのはログインした本人だけ。問題文と模範解答はデータベースから読むので、
 * 画面側から採点の材料を書き換えることはできない。
 *
 * 受け取るもの（POST, JSON）:
 *   { questionId, answer, spoken? }  → ふだんのサービス（Secrets の GRADER_PROVIDER）で採点
 * サービスを選ぶのはサーバー側だけ。画面からは選べない（1回の答えで何社にも送られないように）。
 */
import { CORS_HEADERS, json, requireUser } from '../_shared/http.ts';
import { defaultProvider, grade, providerModel } from '../_shared/graders.ts';

/** 答えの長さの上限（画面側 src/lib/questionFile.ts と同じ値。意見と理由を答える問題は長め） */
const MAX_ANSWER_LENGTH = 300;
const MAX_OPINION_LENGTH = 600;

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
  const auth = await requireUser(req);
  if (auth instanceof Response) return auth;
  const { supabase } = auth;

  let body: { questionId?: string; answer?: string; spoken?: boolean };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'JSON で送ってください' }, 400);
  }

  const answer = (body.answer ?? '').trim();
  if (!body.questionId || !answer) return json({ error: 'questionId と answer が必要です' }, 400);
  if (answer.length > MAX_OPINION_LENGTH) return json({ error: `答えは${MAX_OPINION_LENGTH}文字までにしてください` }, 400);

  const { data: q, error: qError } = await supabase
    .from('questions')
    .select('id, format, sentence, sentence_ja, model_answers, tags')
    .eq('id', body.questionId)
    .maybeSingle();
  if (qError) return json({ error: `問題を読めませんでした（${qError.message}）` }, 500);
  if (!q) return json({ error: '問題が見つかりません' }, 404);
  if (q.format !== 'translate' && q.format !== 'respond') return json({ error: 'AI採点の問題ではありません' }, 400);
  const opinion = q.format === 'respond' && ((q.tags ?? []) as string[]).includes('opinion');
  if (!opinion && answer.length > MAX_ANSWER_LENGTH) {
    return json({ error: `答えは${MAX_ANSWER_LENGTH}文字までにしてください` }, 400);
  }

  const task = {
    format: q.format as 'translate' | 'respond',
    sentence: fillNames(q.sentence ?? ''),
    sentenceJa: q.sentence_ja ? fillNames(q.sentence_ja) : null,
    modelAnswers: ((q.model_answers ?? []) as string[]).map(fillNames),
    answer,
    spoken: body.spoken === true,
    opinion,
  };

  const provider = defaultProvider();
  const started = Date.now();
  try {
    const result = await grade(provider, task);
    return json({ results: [{ provider, model: providerModel(provider), ok: true, ms: Date.now() - started, ...result }] });
  } catch (err) {
    console.error(provider, err);
    return json({
      results: [
        {
          provider,
          model: providerModel(provider),
          ok: false,
          ms: Date.now() - started,
          error: err instanceof Error ? err.message : String(err),
        },
      ],
    });
  }
});
