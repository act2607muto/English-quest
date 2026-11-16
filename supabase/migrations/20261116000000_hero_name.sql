-- 主人公の名前（2026-11-16 追加）
-- 冒険の画面（街・ステータス・戦闘）で使う。問題文の名前（{{name_ja}} など）とは別。
-- 空（null）の間は、ログインしたあとに名前をつける画面を出す。
-- 前後の空白を除いて1〜8文字。

alter table public.adventure_state
  add column if not exists hero_name text;

alter table public.adventure_state
  drop constraint if exists adventure_state_hero_name_check;

alter table public.adventure_state
  add constraint adventure_state_hero_name_check
  check (hero_name is null or (hero_name = btrim(hero_name) and char_length(hero_name) between 1 and 8));
