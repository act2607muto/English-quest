import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type AuthState = {
  /** 起動直後、保存されたログイン状態を確かめている間は true */
  loading: boolean;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

const LOGIN_TIMEOUT_MS = 20_000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
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

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ loading, session, signIn, signOut }}>
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
