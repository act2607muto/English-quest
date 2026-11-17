-- モンスター図鑑の説明文（2026-11-17 追加）
-- モンスターのファイル（data/town01_monsters.json）の description を入れる。なければ null（図鑑では説明なし）。
-- Supabase の SQL Editor に貼りつけて実行する。何度実行しても同じ結果になる。

alter table public.monsters
  add column if not exists description text;
