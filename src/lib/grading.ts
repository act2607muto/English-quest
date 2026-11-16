/**
 * AI採点の呼び出し。画面側から採点を頼む処理はこのファイルにまとめる。
 * 実際のAIサービスへの依頼は Edge Function（supabase/functions/grade）が行い、利用キーもそちらにある。
 */
import { requireSupabase } from './supabase';

export type Rating = 'good' | 'close' | 'bad';

export const RATING_LABELS: Record<Rating, string> = {
  good: '通じる',
  close: '惜しい',
  bad: '通じない',
};

export type GradeResult = {
  provider: string;
  model: string;
  ms: number;
} & ({ ok: true; rating: Rating; advice: string; better: string } | { ok: false; error: string });

const TIMEOUT_MS = 45_000;

async function invoke<T>(body: Record<string, unknown>): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('採点に時間がかかりすぎています')), TIMEOUT_MS),
  );
  const call = requireSupabase().functions.invoke<T>('grade', { body });
  const { data, error } = await Promise.race([call, timeout]);
  if (error) {
    // Edge Function が返した日本語のエラー文があれば、それを使う
    let message = /failed to send/i.test(error.message)
      ? '採点の仕組みにつながりませんでした。通信できる場所で、もう一度試してください'
      : error.message;
    const ctx = (error as { context?: unknown }).context;
    if (ctx instanceof Response) {
      try {
        const j = (await ctx.json()) as { error?: string };
        if (j.error) message = j.error;
      } catch {
        // そのまま
      }
    }
    throw new Error(message);
  }
  if (!data) throw new Error('採点の結果が空でした');
  return data;
}

/** ふだんのサービスで採点する。失敗したら例外（画面は自己採点に切り替える） */
export async function gradeAnswer(input: { questionId: string; answer: string; spoken?: boolean }): Promise<GradeResult & { ok: true }> {
  const { results } = await invoke<{ results: GradeResult[] }>(input);
  const r = results[0];
  if (!r) throw new Error('採点の結果が空でした');
  if (!r.ok) throw new Error(r.error);
  return r;
}

/**
 * 録音を英語の文字にする（Edge Function の transcribe が文字起こしのサービスに送る）。
 * 録音は保存しない。
 */
export async function transcribeAudio(recording: { blob: Blob; mimeType: string }): Promise<string> {
  const form = new FormData();
  const type = recording.mimeType || recording.blob.type || 'audio/mp4';
  form.append('audio', new File([recording.blob], 'answer', { type }));
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('文字起こしに時間がかかりすぎています')), TIMEOUT_MS),
  );
  const call = requireSupabase().functions.invoke<{ text?: string; error?: string }>('transcribe', { body: form });
  const { data, error } = await Promise.race([call, timeout]);
  if (error) {
    let message = /failed to send/i.test(error.message)
      ? '文字起こしの仕組みにつながりませんでした。通信できる場所で、もう一度試してください'
      : error.message;
    const ctx = (error as { context?: unknown }).context;
    if (ctx instanceof Response) {
      try {
        const j = (await ctx.json()) as { error?: string };
        if (j.error) message = j.error;
      } catch {
        // そのまま
      }
    }
    throw new Error(message);
  }
  return (data?.text ?? '').trim();
}
