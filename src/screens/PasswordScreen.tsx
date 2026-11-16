import { useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthProvider';

/** 新しいパスワードの最低の長さ */
const PASSWORD_MIN = 8;

/**
 * パスワードを変える（設定から開く）。
 * 管理画面で仮のパスワードを決めて作ったアカウントでも、自分で変えられるようにする。
 */
export function PasswordScreen({ onDone, onBack }: { onDone: () => void; onBack: () => void }) {
  const { session, changePassword } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [again, setAgain] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!current) return setError('今のパスワードを入れてください。');
    if ([...next].length < PASSWORD_MIN) return setError(`新しいパスワードは${PASSWORD_MIN}文字以上にしてください。`);
    if (next !== again) return setError('新しいパスワードが2つの欄で違います。');
    if (next === current) return setError('今と同じパスワードです。別のパスワードにしてください。');
    setBusy(true);
    setError(null);
    try {
      await changePassword(current, next);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <main className="screen screen--center">
        <section className="window name-form">
          <h2 className="window__title">パスワードを変えました</h2>
          <p>次からは新しいパスワードでログインしてください。</p>
          <button className="command" type="button" onClick={onDone} autoFocus>
            ▶ 設定にもどる
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="screen screen--center">
      <form className="window name-form" onSubmit={handleSubmit}>
        <h2 className="window__title">パスワードを変える</h2>
        {/* パスワードを覚えておく機能が、どのアカウントのものか分かるように */}
        <input type="email" autoComplete="username" value={session?.user.email ?? ''} readOnly hidden />
        <label className="field">
          <span>今のパスワード</span>
          <input
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => {
              setCurrent(e.target.value);
              setError(null);
            }}
          />
        </label>
        <label className="field">
          <span>新しいパスワード（{PASSWORD_MIN}文字以上）</span>
          <input
            type="password"
            autoComplete="new-password"
            value={next}
            onChange={(e) => {
              setNext(e.target.value);
              setError(null);
            }}
          />
        </label>
        <label className="field">
          <span>新しいパスワード（もう一度）</span>
          <input
            type="password"
            autoComplete="new-password"
            value={again}
            onChange={(e) => {
              setAgain(e.target.value);
              setError(null);
            }}
          />
        </label>
        {error && (
          <p className="message message--error" role="alert">
            {error}
          </p>
        )}
        <button className="command" type="submit" disabled={busy}>
          {busy ? '変えています…' : '▶ パスワードを変える'}
        </button>
        <button className="command command--quiet" type="button" onClick={onBack} disabled={busy}>
          ▶ やめる
        </button>
      </form>
    </main>
  );
}
