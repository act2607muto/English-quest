-- めずらしいモンスター（2026-11-17 追加）
-- 街の外（マップ）でだけ、まれに出会うモンスター。能力値を持たず（skill が null）、
-- ボスと同じように、いろいろな能力値の問題を出す。
--   encounter_rate : 出会いのうち、このモンスターになる割合（0.01 なら 1%）。めずらしいモンスターだけが持つ
--   exp_reward     : 勝ったときに足す経験値（出た能力値で分ける）。ふつうのモンスターは 0
-- Supabase の SQL Editor に貼りつけて実行する。何度実行しても同じ結果になる。

alter table public.monsters
  add column if not exists exp_reward integer not null default 0;

alter table public.monsters
  add column if not exists encounter_rate real;

alter table public.monsters
  drop constraint if exists monsters_exp_reward_check;
alter table public.monsters
  add constraint monsters_exp_reward_check check (exp_reward >= 0);

alter table public.monsters
  drop constraint if exists monsters_encounter_rate_check;
alter table public.monsters
  add constraint monsters_encounter_rate_check
  check (encounter_rate is null or (encounter_rate > 0 and encounter_rate <= 1 and not is_boss and skill is null));

-- 前の決まり「ボスでなければ skill が必要」を、「めずらしいモンスターも skill なしでよい」に変える。
-- 前の決まりには名前をつけていなかったので、中身で探して消す。
do $$
declare
  c record;
begin
  for c in
    select conname
    from pg_constraint
    where conrelid = 'public.monsters'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%is_boss OR (skill IS NOT NULL)%'
  loop
    execute format('alter table public.monsters drop constraint %I', c.conname);
  end loop;
end $$;

alter table public.monsters
  drop constraint if exists monsters_skill_needed_check;
alter table public.monsters
  add constraint monsters_skill_needed_check
  check (is_boss or skill is not null or encounter_rate is not null);
