import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// 管理画面から「https://xxxx.supabase.co/rest/v1/」の形でコピーしても動くよう、末尾を取り除く
const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)
  ?.trim()
  .replace(/\/rest\/v1\/?$/, '')
  .replace(/\/+$/, '');
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

/** .env.local に Supabase の値が入っているか */
export const isSupabaseConfigured = Boolean(url && key);

/**
 * Supabase への接続。画面側に置いてよいのは URL と publishable key だけ。
 * ログインはパスワードで行うので、URL からログイン情報を読み取る機能は切っておく。
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, key!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;

export function requireSupabase(): SupabaseClient {
  if (!supabase) throw new Error('Supabase の設定（.env.local）がありません');
  return supabase;
}
