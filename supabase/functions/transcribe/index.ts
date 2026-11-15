/**
 * 文字起こしの Edge Function。録音した声を英語の文字にして返す。
 *
 * 呼べるのはログインした本人だけ。録音はここで文字にするだけで、保存しない。
 *
 * 受け取るもの（POST, multipart/form-data）:
 *   audio : 録音（mp4 / m4a / webm / ogg / wav / mp3。5MB まで）
 * 返すもの（JSON）:
 *   { text }  または  { error }
 */
import { CORS_HEADERS, json, requireUser } from '../_shared/http.ts';
import { isTranscribeConfigured, transcribe } from '../_shared/transcribers.ts';

const MAX_BYTES = 5 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = {
  'audio/mp4': 'mp4',
  'audio/x-m4a': 'm4a',
  'audio/m4a': 'm4a',
  'audio/aac': 'm4a',
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/mpeg': 'mp3',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (req.method !== 'POST') return json({ error: 'POST で呼んでください' }, 405);

  const auth = await requireUser(req);
  if (auth instanceof Response) return auth;

  if (!isTranscribeConfigured()) return json({ error: '文字起こしの利用キーが設定されていません' }, 503);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ error: '録音を multipart/form-data で送ってください' }, 400);
  }
  const audio = form.get('audio');
  if (!(audio instanceof File) || audio.size === 0) return json({ error: '録音が空です' }, 400);
  if (audio.size > MAX_BYTES) return json({ error: '録音が大きすぎます（5MB まで）' }, 413);

  // 「audio/mp4;codecs=...」のような種類から、拡張子つきの名前にする（サービスが形式を見分けるため）
  const baseType = (audio.type || 'audio/mp4').split(';')[0].trim().toLowerCase();
  const ext = EXTENSIONS[baseType];
  if (!ext) return json({ error: `この録音の形式には対応していません（${audio.type}）` }, 415);
  const file = new File([await audio.arrayBuffer()], `answer.${ext}`, { type: baseType });

  try {
    const text = await transcribe(file);
    return json({ text });
  } catch (err) {
    console.error('transcribe', err);
    return json({ error: `文字起こしができませんでした（${err instanceof Error ? err.message : String(err)}）` }, 502);
  }
});
