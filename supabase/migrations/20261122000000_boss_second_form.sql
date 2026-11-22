-- ボスの第二形態（2026-11-22）。
-- モンスターのファイルに「ボスのID-form2」と書いたモンスターは、ボスでもめずらしいモンスターでもないが、
-- 能力値（skill）を持たない（ボス戦で変身したあとの姿。src/lib/game/secondForm.ts）。
-- 今までの決まり「ボスか、能力値があるか、めずらしいモンスター（encounter_rate あり）」に、
-- 「ID の最後が -form2」を足す。何度実行しても同じ結果になる。

alter table public.monsters
  drop constraint if exists monsters_skill_needed_check;
alter table public.monsters
  add constraint monsters_skill_needed_check
  check (is_boss or skill is not null or encounter_rate is not null or id like '%-form2');
