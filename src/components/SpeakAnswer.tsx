import { useEffect, useRef, useState } from 'react';
import { transcribeAudio } from '../lib/grading';
import { describeRecordingError, isRecordingSupported, startRecording, type RecordingSession } from '../lib/recorder';
import { holdBgm } from '../lib/sound';

/**
 * 声で答える欄（スピーキング）。
 * 1. 録音する  2. 文字起こしに送る  3. 文字を確かめる（聞き取りが違っていれば直せる）  4. 採点に回す
 * 録音や文字起こしができないときは onFail を呼び、戦闘画面が自己採点に切り替える。
 */

const MAX_SECONDS = 30;

type State =
  | { kind: 'idle' }
  | { kind: 'starting' }
  | { kind: 'recording'; elapsed: number }
  | { kind: 'transcribing' }
  | { kind: 'review'; text: string }
  | { kind: 'error'; message: string };

export function SpeakAnswer({
  onSubmit,
  onFail,
}: {
  onSubmit: (text: string) => void;
  onFail: (message: string) => void;
}) {
  const [state, setState] = useState<State>({ kind: 'idle' });
  const sessionRef = useRef<RecordingSession | null>(null);
  const startedRef = useRef(0);

  // 画面を離れるときはマイクを放す
  useEffect(() => () => sessionRef.current?.cancel(), []);

  // 録音中は秒数を数え、上限で自動的に止める
  // 録音の途中で画面を離れても、BGM が消えたままにならないように
  useEffect(() => () => holdBgm('mic', false), []);

  useEffect(() => {
    if (state.kind !== 'recording') return;
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedRef.current) / 1000);
      if (elapsed >= MAX_SECONDS) void stop();
      else setState((s) => (s.kind === 'recording' ? { kind: 'recording', elapsed } : s));
    }, 250);
    return () => clearInterval(timer);
    // stop は毎回作り直されるが、録音中の状態だけを見ればよい
  }, [state.kind]);

  async function start() {
    if (!isRecordingSupported()) {
      onFail('この端末では録音が使えません');
      return;
    }
    setState({ kind: 'starting' });
    try {
      // 録音している間は BGM を消す（BGM が録音に入らないように）
      holdBgm('mic', true);
      sessionRef.current = await startRecording();
      startedRef.current = Date.now();
      setState({ kind: 'recording', elapsed: 0 });
    } catch (err) {
      sessionRef.current = null;
      holdBgm('mic', false);
      onFail(describeRecordingError(err));
    }
  }

  async function stop() {
    const session = sessionRef.current;
    if (!session) return;
    sessionRef.current = null;
    holdBgm('mic', false);
    setState({ kind: 'transcribing' });
    try {
      const rec = await session.stop();
      if (rec.blob.size === 0) throw new Error('録音が空でした');
      const text = await transcribeAudio(rec);
      if (!text) {
        setState({ kind: 'error', message: '声が聞き取れませんでした。もう少し大きな声で、もう一度録ってください。' });
        return;
      }
      setState({ kind: 'review', text });
    } catch (err) {
      setState({ kind: 'error', message: err instanceof Error ? err.message : String(err) });
    }
  }

  switch (state.kind) {
    case 'idle':
    case 'starting':
      return (
        <div className="speak">
          <button className="command command--record" type="button" onClick={() => void start()} disabled={state.kind === 'starting'}>
            {state.kind === 'starting' ? 'マイクを準備中…' : '● 録音して答える'}
          </button>
          <p className="note">押してから英語で言い、言い終わったら「とめる」を押します。</p>
        </div>
      );
    case 'recording':
      return (
        <div className="speak">
          <button className="command command--recording" type="button" onClick={() => void stop()}>
            ■ とめる（{state.elapsed}秒 / {MAX_SECONDS}秒）
          </button>
        </div>
      );
    case 'transcribing':
      return (
        <div className="speak">
          <p className="note">文字にしています…</p>
        </div>
      );
    case 'review':
      return (
        <form
          className="write"
          onSubmit={(e) => {
            e.preventDefault();
            if (state.text.trim()) onSubmit(state.text.trim());
          }}
        >
          <label className="field">
            <span className="note">聞き取った文（違っていたら直せます）</span>
            <textarea
              value={state.text}
              onChange={(e) => setState({ kind: 'review', text: e.target.value })}
              rows={3}
              maxLength={300}
              lang="en"
              autoCapitalize="sentences"
              autoCorrect="off"
              spellCheck={false}
            />
          </label>
          <button className="command" type="submit" disabled={!state.text.trim()}>
            ▶ この答えで採点する
          </button>
          <button className="command command--quiet" type="button" onClick={() => setState({ kind: 'idle' })}>
            ▶ 録り直す
          </button>
        </form>
      );
    case 'error':
      return (
        <div className="speak">
          <p className="message message--error">{state.message}</p>
          <button className="command" type="button" onClick={() => setState({ kind: 'idle' })}>
            ▶ もう一度録る
          </button>
          <button className="command command--quiet" type="button" onClick={() => onFail(state.message)}>
            ▶ 自分で採点する
          </button>
        </div>
      );
  }
}
