import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type AuthState = {
  /** 起動直後、保存されたログイン状態を確かめている間は true */
  loading: boolean;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  /** Google のログイン画面へ移る（戻ってくるとログインが終わる） */
  signInWithGoogle: () => Promise<void>;
  /** Google から戻ってきたときに失敗していれば、その理由 */
  oauthError: string | null;
  clearOAuthError: () => void;
  signOut: () => Promise<void>;
  /** ゲスト（匿名ログイン）で始める。記録はこの端末のこのブラウザだけにつながる */
  signInAsGuest: () => Promise<void>;
  /** 今ゲストで遊んでいるか */
  isGuest: boolean;
  /** ゲストの記録のまま、Google のアカウントにつなぐ（Google の画面へ移り、戻ってくると終わる） */
  linkGoogle: () => Promise<void>;
  /** Google につないで戻ってきたときの結果（'ok' か、失敗の理由）。設定の画面で出す */
  linkResult: string | null;
  clearLinkResult: () => void;
  /** 今のパスワードを確かめてから、新しいパスワードに変える */
  changePassword: (current: string, next: string) => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

const LOGIN_TIMEOUT_MS = 20_000;

/** Google から戻ってきたところで開かれたか（?code=... つき） */
const STARTED_WITH_CODE = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('code');

/** Google につなぎに行く前に置いておく印（戻ってきたら、設定の画面を開いて結果を出す） */
const LINKING_KEY = 'eq-linking-google';

/** Google につなぎに行って、戻ってきたところか（一度読んだら印を消す） */
function takeLinkingMark(): boolean {
  try {
    const marked = sessionStorage.getItem(LINKING_KEY) === '1';
    sessionStorage.removeItem(LINKING_KEY);
    return marked;
  } catch {
    return false;
  }
}
const RETURNED_FROM_LINK = typeof window !== 'undefined' && takeLinkingMark();

/** 起動したのが、Google につないで戻ってきたところか（App が設定の画面から始めるのに使う） */
export function returnedFromLink(): boolean {
  return RETURNED_FROM_LINK;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [oauthError, setOAuthError] = useState<string | null>(() => (RETURNED_FROM_LINK ? null : readOAuthError()));
  const [linkResult, setLinkResult] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data, error }) => {
      setSession(data.session);
      setLoading(false);
      if (RETURNED_FROM_LINK) {
        const linkError = readOAuthError(toLinkMessage) ?? (error ? toLinkMessage(error.message) : null);
        if (linkError) setLinkResult(linkError);
        else if (data.session && !data.session.user.is_anonymous) setLinkResult('ok');
        else setLinkResult(toLinkMessage(''));
      } else if (error && hasOAuthParams()) setOAuthError(toOAuthMessage(error.message));
      else if (!data.session && STARTED_WITH_CODE) setOAuthError(toOAuthMessage('pkce'));
      // Google から戻ってきたときの ?code=... などを、アドレスから消す
      cleanOAuthParams();
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    if (!supabase) throw new Error('Supabase の設定がありません');
    // 電波が悪いと返事が来ないまま待ち続けることがあるので、時間を区切る
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), LOGIN_TIMEOUT_MS),
    );
    const { error } = await Promise.race([
      supabase.auth.signInWithPassword({ email, password }),
      timeout,
    ]).catch((err: unknown) => {
      throw new Error(toJapaneseMessage(err instanceof Error ? err.message : String(err)));
    });
    if (error) throw new Error(toJapaneseMessage(error.message));
  }

  async function changePassword(current: string, next: string) {
    if (!supabase) throw new Error('Supabase の設定がありません');
    const email = session?.user.email;
    if (!email) throw new Error('ログインが切れました。ログインし直してください。');
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), LOGIN_TIMEOUT_MS),
    );
    const run = async () => {
      // 端末を他の人に使われても変えられないように、今のパスワードを確かめる
      const check = await supabase!.auth.signInWithPassword({ email, password: current });
      if (check.error) {
        throw new Error(/invalid login credentials/i.test(check.error.message) ? '今のパスワードが違います。' : check.error.message);
      }
      const { error } = await supabase!.auth.updateUser({ password: next });
      if (error) throw new Error(toPasswordMessage(error.message));
    };
    await Promise.race([run(), timeout]).catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(/failed to fetch|network|load failed|timeout/i.test(message) ? toJapaneseMessage(message) : message);
    });
  }

  async function signInWithGoogle() {
    if (!supabase) throw new Error('Supabase の設定がありません');
    setOAuthError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) throw new Error(toOAuthMessage(error.message));
  }

  async function signInAsGuest() {
    if (!supabase) throw new Error('Supabase の設定がありません');
    setOAuthError(null);
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), LOGIN_TIMEOUT_MS),
    );
    const { error } = await Promise.race([supabase.auth.signInAnonymously(), timeout]).catch((err: unknown) => {
      throw new Error(toGuestMessage(err instanceof Error ? err.message : String(err)));
    });
    if (error) throw new Error(toGuestMessage(error.message));
  }

  async function linkGoogle() {
    if (!supabase) throw new Error('Supabase の設定がありません');
    setLinkResult(null);
    try {
      sessionStorage.setItem(LINKING_KEY, '1');
    } catch {
      // 印を置けなくても、つなぐことはできる（結果が出ないだけ）
    }
    const { error } = await supabase.auth.linkIdentity({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) {
      try {
        sessionStorage.removeItem(LINKING_KEY);
      } catch {
        // そのまま
      }
      throw new Error(toLinkMessage(error.message));
    }
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{
        loading,
        session,
        signIn,
        signInWithGoogle,
        oauthError,
        clearOAuthError: () => setOAuthError(null),
        signOut,
        changePassword,
        signInAsGuest,
        isGuest: session?.user.is_anonymous === true,
        linkGoogle,
        linkResult,
        clearLinkResult: () => setLinkResult(null),
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const value = useContext(AuthContext);
  if (!value) throw new Error('AuthProvider の外で useAuth が呼ばれました');
  return value;
}

function toJapaneseMessage(message: string): string {
  if (/invalid login credentials/i.test(message)) {
    return 'メールアドレスかパスワードが違います。';
  }
  if (/email not confirmed/i.test(message)) {
    return 'メールアドレスの確認が済んでいません。Supabase の管理画面で確認済みにしてください。';
  }
  if (/failed to fetch|network|load failed|timeout/i.test(message)) {
    return '通信できませんでした。電波の届く場所でもう一度試してください。';
  }
  return `ログインできませんでした（${message}）`;
}

function toPasswordMessage(message: string): string {
  if (/same/i.test(message)) return '今と同じパスワードです。別のパスワードにしてください。';
  if (/at least|weak|short/i.test(message)) return 'パスワードが短すぎるか、簡単すぎます。もっと長くしてください。';
  if (/reauthentication|nonce/i.test(message)) return 'Supabase の設定で、パスワードの変更に確認が要るようになっています（Secure password change）。';
  return `パスワードを変えられませんでした（${message}）`;
}

const OAUTH_PARAMS = ['code', 'error', 'error_code', 'error_description', 'state'];

function hasOAuthParams(): boolean {
  const q = new URLSearchParams(window.location.search);
  return OAUTH_PARAMS.some((k) => q.has(k));
}

/** Google から戻ってきたアドレスに、失敗の理由がついていれば読む */
function readOAuthError(toMessage: (m: string) => string = toOAuthMessage): string | null {
  if (typeof window === 'undefined') return null;
  const q = new URLSearchParams(window.location.search);
  const h = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const description = q.get('error_description') ?? h.get('error_description');
  const error = q.get('error') ?? h.get('error');
  if (!description && !error) return null;
  return toMessage(description ?? error ?? '');
}

function cleanOAuthParams() {
  const url = new URL(window.location.href);
  const had = OAUTH_PARAMS.some((k) => url.searchParams.has(k)) || /error/.test(url.hash);
  if (!had) return;
  for (const k of OAUTH_PARAMS) url.searchParams.delete(k);
  url.hash = '';
  window.history.replaceState(null, '', url.pathname + url.search);
}

function toOAuthMessage(message: string): string {
  if (/access_denied|denied|cancel/i.test(message)) return 'Google でのログインが取り消されました。';
  if (/signups? not allowed|signup.*disabled/i.test(message)) {
    return '新しいアカウントを作れない設定になっています（Supabase の「Allow new users to sign up」）。';
  }
  if (/provider is not enabled|unsupported provider/i.test(message)) {
    return 'Google でのログインが、まだ Supabase でオンになっていません。';
  }
  if (/code verifier|flow state|pkce/i.test(message)) {
    return 'ログインの途中で画面が切り替わったため、完了できませんでした。もう一度「Google でログイン」を押してください。';
  }
  return `Google でログインできませんでした（${message}）`;
}

function toGuestMessage(message: string): string {
  if (/anonymous sign-?ins? (are|is) disabled|anonymous.*disabled/i.test(message)) {
    return 'ゲストで遊ぶ仕組みが、まだ Supabase でオンになっていません（Allow anonymous sign-ins）。';
  }
  if (/rate limit|too many/i.test(message)) {
    return 'ゲストを始める人が多すぎるため、少し時間をおいてから試してください。';
  }
  if (/failed to fetch|network|load failed|timeout/i.test(message)) {
    return '通信できませんでした。電波の届く場所でもう一度試してください。';
  }
  return `ゲストで始められませんでした（${message}）`;
}

function toLinkMessage(message: string): string {
  if (/already (linked|exists|registered)|identity_already_exists|in use/i.test(message)) {
    return 'この Google アカウントは、もう別のアカウントで使われています。ほかの Google アカウントを選んでください。';
  }
  if (/manual linking.*disabled|linking.*not enabled/i.test(message)) {
    return 'Google につなぐ仕組みが、まだ Supabase でオンになっていません（Allow manual linking）。';
  }
  if (/access_denied|denied|cancel/i.test(message)) return 'Google につなぐのが取り消されました。記録はゲストのまま残っています。';
  if (/code verifier|flow state|pkce/i.test(message)) {
    return 'つなぐ途中で画面が切り替わったため、完了できませんでした。もう一度「Google につなぐ」を押してください。';
  }
  return message
    ? `Google につなげませんでした（${message}）。記録はゲストのまま残っています。`
    : 'Google につなげませんでした。記録はゲストのまま残っています。';
}
