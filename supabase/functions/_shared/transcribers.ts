/**
 * 文字起こしの呼び出し。録音した声を文字にする依頼は、すべてこのファイルにまとめる。
 * サービスを差し替えるときは、ここに足して TRANSCRIBE_PROVIDER を変える。
 *
 * ブラウザ標準の音声認識（SpeechRecognition）は使わない。録音を送ってここで文字にする。
 *
 *   OPENAI_API_KEY      : OpenAI の利用キー
 *   TRANSCRIBE_PROVIDER : 使うサービス（今は openai のみ。既定も openai）
 *   TRANSCRIBE_MODEL    : モデルを変えたいときだけ（既定は gpt-transcribe）
 */
import OpenAI from 'npm:openai@7.47.0';

export const TRANSCRIBE_PROVIDERS = ['openai'] as const;
export type TranscribeProvider = (typeof TRANSCRIBE_PROVIDERS)[number];

const DEFAULT_MODEL: Record<TranscribeProvider, string> = { openai: 'gpt-transcribe' };
const KEY_NAMES: Record<TranscribeProvider, string> = { openai: 'OPENAI_API_KEY' };

/**
 * 文字起こしへの指示。模範解答は渡さない（渡すと言い間違いが正しい英語に寄せて聞き取られ、
 * 採点の意味がなくなる）。聞こえたとおりに書くことだけを頼む。
 */
const VERBATIM_PROMPT =
  'An English learner is answering a question. Transcribe exactly what the speaker says, word for word. Keep grammatical mistakes, missing words and wrong word forms as spoken. Do not correct or complete the sentence.';

export function transcribeProvider(): TranscribeProvider {
  const chosen = (Deno.env.get('TRANSCRIBE_PROVIDER') || 'openai') as TranscribeProvider;
  return TRANSCRIBE_PROVIDERS.includes(chosen) ? chosen : 'openai';
}

export function transcribeModel(p: TranscribeProvider): string {
  return Deno.env.get('TRANSCRIBE_MODEL') || DEFAULT_MODEL[p];
}

export function isTranscribeConfigured(p: TranscribeProvider = transcribeProvider()): boolean {
  return Boolean(Deno.env.get(KEY_NAMES[p]));
}

/** 録音を英語の文字にする */
export async function transcribe(audio: File): Promise<string> {
  const provider = transcribeProvider();
  const apiKey = Deno.env.get(KEY_NAMES[provider]);
  if (!apiKey) throw new Error(`文字起こしの利用キー（${KEY_NAMES[provider]}）が設定されていません`);

  switch (provider) {
    case 'openai': {
      const client = new OpenAI({ apiKey, maxRetries: 1, timeout: 60_000 });
      const res = await client.audio.transcriptions.create({
        file: audio,
        model: transcribeModel(provider),
        languages: ['en'],
        prompt: VERBATIM_PROMPT,
      });
      return res.text.trim();
    }
  }
}
