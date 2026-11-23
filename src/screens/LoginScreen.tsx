import { useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthProvider';

/**
 * ログイン画面。Google でログインすると、はじめての人はそのままアカウントができる（だれでも参加できる）。
 * メールアドレスとパスワードでのログインも残す（Supabase の管理画面で作ったアカウント用）。
 * Google ログインの設定は docs/setup_google_login.md。
 */
export function LoginScreen() {
  const { signIn, signInWithGoogle, signInAsGuest, oauthError, clearOAuthError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  /** ゲストで始められなかった理由（ゲストのボタンの下に出す） */
  const [guestError, setGuestError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    clearOAuthError();
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    setError(null);
    try {
      // うまくいけば Google の画面へ移るので、ここには戻らない
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  }

  async function handleGuest() {
    setBusy(true);
    setError(null);
    setGuestError(null);
    clearOAuthError();
    try {
      // うまくいけば、そのまま主人公の名前をつける画面へ移る
      await signInAsGuest();
    } catch (err) {
      setGuestError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  }

  const shownError = error ?? oauthError;

  return (
    <main className="screen screen--center">
      <h1 className="title">English Quest</h1>
      <section className="window login-panel login-google">
        <button className="command" type="button" onClick={() => void handleGoogle()} disabled={busy}>
          ▶ Google でログイン
        </button>
        <p className="note">
          はじめての人も、Google のアカウントでそのまま始められます。受け取る情報と使い方は
          <a href="/privacy.html">プライバシーポリシー</a>にあります。
        </p>
      </section>
      <section className="window login-panel login-guest">
        <button className="command" type="button" onClick={() => void handleGuest()} disabled={busy}>
          ▶ ゲストで遊んでみる
        </button>
        <p className="note">
          アカウントを作らずに、すぐ始められます。記録はこの端末のこのブラウザだけに残ります。
          気に入ったら、設定から Google につなぐと、記録をそのまま引き継げます。
        </p>
        <p className="note">
          iPhone は、Safari とホーム画面のアプリで記録が別々になります。ホーム画面に追加してから始めてください。
        </p>
        {guestError && (
          <p className="message message--error" role="alert">
            {guestError}
          </p>
        )}
      </section>
      <p className="login-or">または メールアドレスで</p>
      <form className="window login-panel" onSubmit={handleSubmit}>
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
        {shownError && (
          <p className="message message--error" role="alert">
            {shownError}
          </p>
        )}
        <button className="command" type="submit" disabled={busy}>
          {busy ? 'ログイン中…' : '▶ ぼうけんをはじめる'}
        </button>
      </form>
    </main>
  );
}
