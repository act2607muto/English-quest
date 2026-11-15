import { useEffect, useRef, useState } from 'react';
import {
  describeRecordingError,
  isRecordingSupported,
  startRecording,
  supportedMimeTypes,
  type RecordingSession,
} from '../lib/recorder';

/**
 * 録音の試作ページ（第1段階の手順3）。
 * iPhone でホーム画面から開いた状態で、MediaRecorder の録音と再生ができるかを確かめる。
 * 何度か続けて録れるかも確かめるため、試した結果を一覧で残す。
 */

const MAX_SECONDS = 30;

type Attempt = {
  no: number;
  ok: boolean;
  detail: string;
  url?: string;
};

export function MicTestScreen({ onBack }: { onBack: () => void }) {
  const [env] = useState(readEnvironment);
  const [session, setSession] = useState<RecordingSession | null>(null);
  const [starting, setStarting] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [copied, setCopied] = useState(false);
  const sessionRef = useRef<RecordingSession | null>(null);
  const urlsRef = useRef<string[]>([]);

  // 録音中は経過秒数を数え、上限で自動的に止める
  useEffect(() => {
    if (!session) return;
    const started = Date.now();
    const timer = setInterval(() => {
      const sec = Math.floor((Date.now() - started) / 1000);
      setElapsed(sec);
      if (sec >= MAX_SECONDS) void handleStop();
    }, 250);
    return () => clearInterval(timer);
  }, [session]);

  // 画面を離れるときはマイクを放し、作った音声のURLを片付ける
  useEffect(() => {
    return () => {
      sessionRef.current?.cancel();
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  function addAttempt(a: Omit<Attempt, 'no'>) {
    setAttempts((prev) => [{ ...a, no: prev.length + 1 }, ...prev]);
  }

  async function handleStart() {
    setStarting(true);
    setElapsed(0);
    try {
      const s = await startRecording();
      sessionRef.current = s;
      setSession(s);
    } catch (err) {
      addAttempt({ ok: false, detail: describeRecordingError(err) });
    } finally {
      setStarting(false);
    }
  }

  async function handleStop() {
    const s = sessionRef.current;
    if (!s) return;
    sessionRef.current = null;
    setSession(null);
    try {
      const rec = await s.stop();
      const sec = (rec.durationMs / 1000).toFixed(1);
      const kb = (rec.blob.size / 1024).toFixed(1);
      if (rec.blob.size === 0) {
        addAttempt({ ok: false, detail: `音声が空でした（${sec}秒、形式 ${rec.mimeType || '不明'}）` });
        return;
      }
      const url = URL.createObjectURL(rec.blob);
      urlsRef.current.push(url);
      addAttempt({ ok: true, detail: `${sec}秒、${kb} KB、形式 ${rec.mimeType || '不明'}`, url });
    } catch (err) {
      addAttempt({ ok: false, detail: describeRecordingError(err) });
    }
  }

  async function handleCopy() {
    const lines = [
      ...envLines(env),
      ...[...attempts].reverse().map((a) => `録音${a.no}：${a.ok ? '成功' : '失敗'} ${a.detail}`),
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const recording = session !== null;

  return (
    <main className="screen">
      <section className="window">
        <h2 className="window__title">マイクのテスト</h2>
        <p>録音して、聞き直せるかを確かめます。2〜3回続けて試してください。</p>
      </section>

      <section className="window">
        <h2 className="window__title">この端末</h2>
        <table className="stats">
          <tbody>
            {envLines(env).map((line) => {
              const [k, v] = line.split('：');
              return (
                <tr key={k}>
                  <th>{k}</th>
                  <td>{v}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {recording ? (
        <button className="command command--recording" type="button" onClick={() => void handleStop()}>
          ■ とめる（{elapsed}秒 / {MAX_SECONDS}秒）
        </button>
      ) : (
        <button
          className="command"
          type="button"
          onClick={() => void handleStart()}
          disabled={starting || !env.recorder}
        >
          {starting ? 'マイクを準備中…' : '● 録音する'}
        </button>
      )}

      {attempts.length > 0 && (
        <section className="window">
          <h2 className="window__title">結果</h2>
          {attempts.map((a) => (
            <div key={a.no} className="attempt">
              <p className={a.ok ? undefined : 'message--error'}>
                録音{a.no}：{a.ok ? '成功' : '失敗'}　{a.detail}
              </p>
              {a.url && <audio controls src={a.url} preload="metadata" />}
            </div>
          ))}
          <button className="command" type="button" onClick={() => void handleCopy()}>
            {copied ? 'コピーしました' : '▶ 結果をコピー'}
          </button>
        </section>
      )}

      <button className="command" type="button" onClick={onBack} disabled={recording}>
        ▶ もどる
      </button>
    </main>
  );
}

type Environment = {
  standalone: boolean;
  secure: boolean;
  recorder: boolean;
  mimeTypes: string[];
  userAgent: string;
};

function readEnvironment(): Environment {
  const nav = navigator as Navigator & { standalone?: boolean };
  return {
    standalone: nav.standalone === true || window.matchMedia('(display-mode: standalone)').matches,
    secure: window.isSecureContext,
    recorder: isRecordingSupported(),
    mimeTypes: supportedMimeTypes(),
    userAgent: navigator.userAgent,
  };
}

function envLines(env: Environment): string[] {
  return [
    `開き方：${env.standalone ? 'ホーム画面から' : 'ブラウザから'}`,
    `安全な接続：${env.secure ? 'はい' : 'いいえ'}`,
    `録音の機能：${env.recorder ? 'あり' : 'なし'}`,
    `録音の形式：${env.mimeTypes.join(', ') || 'なし'}`,
    `端末：${shortUserAgent(env.userAgent)}`,
  ];
}

function shortUserAgent(ua: string): string {
  const ios = ua.match(/OS (\d+[_\d]*) like Mac OS X/);
  if (ios) return `iOS ${ios[1].replace(/_/g, '.')}`;
  if (/Windows/.test(ua)) return 'Windows';
  if (/Mac OS X/.test(ua)) return 'Mac';
  if (/Android/.test(ua)) return 'Android';
  return 'その他';
}
