/**
 * Edge Function で共通に使う、返事の作り方とログインの確認。
 */
import { createClient, type SupabaseClient, type User } from 'npm:@supabase/supabase-js@2.119.0';

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

/**
 * ログインした本人かを確かめ、本人として読み書きする Supabase の接続を返す。
 * 本人でなければ、そのまま返せる 401 の Response を返す。
 */
export async function requireUser(req: Request): Promise<{ supabase: SupabaseClient; user: User } | Response> {
  const authHeader = req.headers.get('Authorization') ?? '';
  // 画面側の supabase-js は publishable key を apikey ヘッダーで送ってくる。環境変数にない場合はそれを使う
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || req.headers.get('apikey') || '';
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
  const { data, error } = await supabase.auth.getUser(authHeader.replace(/^Bearer\s+/i, ''));
  if (error || !data.user) return json({ error: 'ログインが必要です' }, 401);
  return { supabase, user: data.user };
}
