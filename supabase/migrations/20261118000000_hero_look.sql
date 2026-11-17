-- 主人公の見た目（2026-11-18 追加）
-- 男の子（boy）か女の子（girl）か。はじめて名前をつける画面と、設定の「主人公の名前と見た目」で選ぶ。
-- 今までの人は男の子のまま。

alter table public.adventure_state
  add column if not exists hero_look text not null default 'boy';

alter table public.adventure_state
  drop constraint if exists adventure_state_hero_look_check;

alter table public.adventure_state
  add constraint adventure_state_hero_look_check
  check (hero_look in ('boy', 'girl'));
