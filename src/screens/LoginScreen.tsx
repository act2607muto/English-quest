import { useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthProvider';

/**
 * ログイン画面。自分専用なので新規登録の入口は置かない。
 * アカウントは Supabase の管理画面で作る（docs/setup_supabase.md の手順4）。
 */
export function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="screen screen--center">
      <h1 className="title">英語ステータス</h1>
      <form className="window" onSubmit={handleSubmit}>
        <label className="field">
          <span>メールアドレス</span>
          <input
            type="email"
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>パスワード</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && (
          <p className="message message--error" role="alert">
            {error}
          </p>
        )}
        <button className="command" type="submit" disabled={busy}>
          {busy ? 'ログイン中…' : '▶ ぼうけんをはじめる'}
        </button>
      </form>
    </main>
  );
}
