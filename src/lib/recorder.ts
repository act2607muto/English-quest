/**
 * マイク録音。ブラウザ標準の音声認識（SpeechRecognition）は使わず、
 * MediaRecorder で録音した音声を文字起こしに送る（文字起こしは手順5で足す）。
 */

/** 試す順。iPhone の Safari は audio/mp4、Chrome などは audio/webm を使う */
export const MIME_CANDIDATES = [
  'audio/mp4',
  'audio/mp4;codecs=mp4a.40.2',
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
] as const;

export function isRecordingSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof MediaRecorder !== 'undefined' &&
    Boolean(navigator.mediaDevices?.getUserMedia)
  );
}

export function supportedMimeTypes(): string[] {
  if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) return [];
  return MIME_CANDIDATES.filter((t) => MediaRecorder.isTypeSupported(t));
}

export type Recording = {
  blob: Blob;
  mimeType: string;
  durationMs: number;
};

export type RecordingSession = {
  /** 録音を止めて、録れた音声を返す */
  stop: () => Promise<Recording>;
  /** 録音を捨てて、マイクを放す */
  cancel: () => void;
};

/**
 * 録音を始める。マイクの許可を求めるので、ボタンを押した処理の中から呼ぶこと。
 * 止めたらマイクを放す（iPhone の画面上部の録音中の表示を消すため）。
 */
export async function startRecording(): Promise<RecordingSession> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const preferred = supportedMimeTypes()[0];
  let recorder: MediaRecorder;
  try {
    recorder = preferred ? new MediaRecorder(stream, { mimeType: preferred }) : new MediaRecorder(stream);
  } catch (err) {
    releaseStream(stream);
    throw err;
  }

  const chunks: Blob[] = [];
  recorder.addEventListener('dataavailable', (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  });

  const startedAt = performance.now();
  recorder.start();

  return {
    stop: () =>
      new Promise<Recording>((resolve, reject) => {
        recorder.addEventListener(
          'stop',
          () => {
            releaseStream(stream);
            const mimeType = recorder.mimeType || preferred || chunks[0]?.type || '';
            resolve({
              blob: new Blob(chunks, mimeType ? { type: mimeType } : undefined),
              mimeType,
              durationMs: performance.now() - startedAt,
            });
          },
          { once: true },
        );
        recorder.addEventListener('error', (e) => {
          releaseStream(stream);
          reject((e as ErrorEvent).error ?? new Error('録音中にエラーが起きました'));
        });
        if (recorder.state === 'inactive') {
          recorder.dispatchEvent(new Event('stop'));
        } else {
          recorder.stop();
        }
      }),
    cancel: () => {
      if (recorder.state !== 'inactive') recorder.stop();
      releaseStream(stream);
    },
  };
}

function releaseStream(stream: MediaStream) {
  stream.getTracks().forEach((t) => t.stop());
}

/** 録音に失敗したときの理由を日本語にする */
export function describeRecordingError(err: unknown): string {
  const name = err instanceof DOMException || err instanceof Error ? err.name : '';
  const message = err instanceof Error ? err.message : String(err);
  switch (name) {
    case 'NotAllowedError':
      return 'マイクの使用が許可されていません。許可を求められたら「許可」を選んでください。前に「許可しない」を選んだ場合は、iPhone の「設定」→「アプリ」→「Safari」→「マイク」を確かめてください。';
    case 'NotFoundError':
      return 'マイクが見つかりません。';
    case 'NotReadableError':
      return 'マイクを使えませんでした。ほかのアプリが使っているかもしれません。';
    case 'SecurityError':
      return '安全な接続（https）で開いていないため、マイクを使えません。';
    case 'NotSupportedError':
      return 'この端末では録音の形式に対応していません。';
    default:
      return `録音できませんでした（${name || 'Error'}: ${message}）`;
  }
}
