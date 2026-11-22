-- 管理者用の集計（2026-11-22）
-- 設定の「みんなの記録」（管理者だけに出る）で使う。ふだんの記録は RLS で本人しか読めないので、
-- 管理者かどうかを確かめてから、全員の記録をまとめて返す関数を1つ置く。
-- メールアドレスは返さない（人は、登録した順の番号と主人公の名前で見分ける）。
-- 日付の区切りは日本の時間（Asia/Tokyo）。何度実行しても同じ結果になる。

create or replace function public.admin_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  today date := (now() at time zone 'Asia/Tokyo')::date;
  v_users jsonb;
  v_daily jsonb;
  v_skills jsonb;
  v_hard jsonb;
  v_bosses jsonb;
  v_towns jsonb;
begin
  if not public.is_admin() then
    raise exception '管理者だけが見られます' using errcode = '42501';
  end if;

  -- 一人ずつ：主人公・今いる街・能力値・戦闘の数・練習した日
  select coalesce(jsonb_agg(to_jsonb(x) order by x.no), '[]'::jsonb)
  into v_users
  from (
    select
      u.no,
      a.hero_name,
      a.current_town_id,
      coalesce(a.defeated_bosses, '{}') as defeated_bosses,
      u.created_at as joined_at,
      u.last_sign_in_at,
      exists (select 1 from public.app_admins ad where ad.user_id = u.id) as is_admin,
      (
        select coalesce(jsonb_agg(jsonb_build_object(
          'skill', s.skill,
          'exp', s.exp,
          'max_exp', s.max_exp,
          'last_practiced_at', s.last_practiced_at,
          'unlocked', s.unlocked
        )), '[]'::jsonb)
        from public.skill_stats s
        where s.user_id = u.id
      ) as skills,
      l.battles,
      l.questions,
      l.correct,
      l.last_fought_at,
      l.active_days,
      l.active_days_7
    from (
      select au.id, au.created_at, au.last_sign_in_at,
             row_number() over (order by au.created_at, au.id) as no
      from auth.users au
    ) u
    left join public.adventure_state a on a.user_id = u.id
    left join lateral (
      select
        count(*)::int as battles,
        coalesce(sum(b.question_count), 0)::int as questions,
        coalesce(sum(b.correct_count), 0)::int as correct,
        max(b.fought_at) as last_fought_at,
        count(distinct (b.fought_at at time zone 'Asia/Tokyo')::date)::int as active_days,
        count(distinct (b.fought_at at time zone 'Asia/Tokyo')::date)
          filter (where (b.fought_at at time zone 'Asia/Tokyo')::date > today - 7)::int as active_days_7
      from public.battle_logs b
      where b.user_id = u.id
    ) l on true
  ) x;

  -- この30日の、日ごとの人数・戦闘・問題の数
  select coalesce(jsonb_agg(to_jsonb(x) order by x.day), '[]'::jsonb)
  into v_daily
  from (
    select
      d.day::date as day,
      count(distinct b.user_id)::int as users,
      count(b.id)::int as battles,
      coalesce(sum(b.question_count), 0)::int as questions,
      coalesce(sum(b.correct_count), 0)::int as correct
    from generate_series(today - 29, today, interval '1 day') as d(day)
    left join public.battle_logs b
      on (b.fought_at at time zone 'Asia/Tokyo')::date = d.day::date
    group by d.day
  ) x;

  -- 街と能力値ごとの、答えた回数と正解の数（単語の書庫は wordbook として分ける）
  select coalesce(jsonb_agg(to_jsonb(x)), '[]'::jsonb)
  into v_skills
  from (
    select
      q.town_id,
      case when 'wordbook' = any (q.tags) then 'wordbook' else q.skill end as skill,
      count(distinct q.id)::int as total_questions,
      count(distinct p.question_id)::int as answered_questions,
      count(distinct p.user_id)::int as users,
      coalesce(sum(p.correct_count), 0)::int as correct,
      coalesce(sum(p.wrong_count), 0)::int as wrong
    from public.questions q
    left join public.question_progress p on p.question_id = q.id
    group by 1, 2
  ) x;

  -- まちがえやすい問題（3回以上答えられた問題のうち、正解の割合が低いもの30問）
  select coalesce(jsonb_agg(to_jsonb(x) order by x.rate, x.wrong desc, x.id), '[]'::jsonb)
  into v_hard
  from (
    select
      q.id,
      q.town_id,
      q.skill,
      q.format,
      ('wordbook' = any (q.tags)) as wordbook,
      q.prompt,
      q.sentence,
      q.audio_text,
      q.choices,
      q.answer,
      q.model_answers,
      sum(p.correct_count)::int as correct,
      sum(p.wrong_count)::int as wrong,
      count(distinct p.user_id)::int as users,
      sum(p.correct_count)::float / nullif(sum(p.correct_count + p.wrong_count), 0) as rate
    from public.question_progress p
    join public.questions q on q.id = p.question_id
    group by q.id
    having sum(p.correct_count + p.wrong_count) >= 3
    order by rate, wrong desc, q.id
    limit 30
  ) x;

  -- ボスを倒した人の数
  select coalesce(jsonb_agg(to_jsonb(x) order by x.sort_order), '[]'::jsonb)
  into v_bosses
  from (
    select
      m.id,
      m.name,
      m.town_id,
      t.sort_order,
      (select count(*)::int from public.adventure_state a where m.id = any (a.defeated_bosses)) as users
    from public.monsters m
    join public.towns t on t.id = m.town_id
    where m.is_boss
  ) x;

  -- 街の名前と順番
  select coalesce(jsonb_agg(jsonb_build_object('id', t.id, 'name', t.name, 'scene', t.scene) order by t.sort_order), '[]'::jsonb)
  into v_towns
  from public.towns t;

  return jsonb_build_object(
    'today', today,
    'users', v_users,
    'daily', v_daily,
    'skills', v_skills,
    'hard_questions', v_hard,
    'bosses', v_bosses,
    'towns', v_towns
  );
end;
$$;

-- ログインしていない状態からは呼べない。ログイン中でも、管理者でなければ上の確認で止まる
revoke execute on function public.admin_stats() from public, anon;
grant execute on function public.admin_stats() to authenticated;
