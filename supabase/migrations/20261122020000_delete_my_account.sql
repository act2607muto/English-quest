-- アカウントを自分で消す（2026-11-22）
-- 設定の「アカウントを消す」から呼ぶ。ログインしている本人のアカウント（auth.users の行）を消す。
-- 記録（question_progress・skill_stats・adventure_state・battle_logs）は、どれも auth.users に
-- on delete cascade でつながっているので、いっしょに消える。元にはもどせない。
-- 管理者（app_admins）は、まちがえて消さないように、ここからは消せない。
-- 何度実行しても同じ結果になる。

create or replace function public.delete_my_account()
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'ログインが必要です' using errcode = '42501';
  end if;
  if exists (select 1 from public.app_admins where user_id = uid) then
    raise exception '管理者のアカウントは、ここからは消せません' using errcode = '42501';
  end if;
  delete from auth.users where id = uid;
end;
$$;

-- ログインしていない状態からは呼べない。ログイン中の人が消せるのは自分だけ（上の auth.uid()）
revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
