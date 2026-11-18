/**
 * 記録の画面で使う集計（日ごとの練習量、続けた日数、能力値の推移）。画面やデータベースには触らない。
 * もとは戦闘の履歴（battle_logs）。にげた戦闘も、1問でも答えていれば履歴に残る。
 */
import type { Skill } from '../skills';
import { addDays, localDate, preciseLevelFromExp } from './growth';

export type BattleLogRow = {
  foughtAt: string;
  questions: number;
  correct: number;
  expBySkill: Partial<Record<Skill, number>>;
};

export type DayTotal = {
  /** YYYY-MM-DD（この端末の日付） */
  date: string;
  questions: number;
  correct: number;
};

/** 戦闘をした日（この端末の日付） */
function dayOf(log: BattleLogRow): string {
  return localDate(new Date(log.foughtAt));
}

/** 今日までの days 日分の、日ごとの問題数と正解数（古い日から順に。練習しなかった日は 0） */
export function dailyTotals(logs: BattleLogRow[], days: number, today: string = localDate()): DayTotal[] {
  const out: DayTotal[] = [];
  const index = new Map<string, DayTotal>();
  for (let i = days - 1; i >= 0; i--) {
    const d: DayTotal = { date: addDays(today, -i), questions: 0, correct: 0 };
    out.push(d);
    index.set(d.date, d);
  }
  for (const log of logs) {
    const d = index.get(dayOf(log));
    if (!d) continue;
    d.questions += log.questions;
    d.correct += log.correct;
  }
  return out;
}

/**
 * 続けて練習した日数。今日練習していれば今日から、まだなら昨日からさかのぼって数える
 * （朝に開いたとき、昨日までの連続が 0 に見えないように）。
 */
export function practiceStreak(logs: BattleLogRow[], today: string = localDate()): number {
  const practiced = new Set(logs.filter((l) => l.questions > 0).map(dayOf));
  let day = practiced.has(today) ? today : addDays(today, -1);
  let count = 0;
  while (practiced.has(day)) {
    count++;
    day = addDays(day, -1);
  }
  return count;
}

/**
 * 能力値のレベルの推移（今日までの days 日分、それぞれの日の終わりのレベル。小数つき）。
 * 今の経験値から、その日より後に入った経験値を引いて、さかのぼって求める。
 * 下がった分（練習しない日の低下）は記録に残っていないので入れない。おおよその値。
 */
export function levelHistory(
  logs: BattleLogRow[],
  skill: Skill,
  currentExp: number,
  days: number,
  today: string = localDate(),
): { date: string; level: number }[] {
  const gainedByDay = new Map<string, number>();
  for (const log of logs) {
    const gained = log.expBySkill[skill] ?? 0;
    if (gained > 0) gainedByDay.set(dayOf(log), (gainedByDay.get(dayOf(log)) ?? 0) + gained);
  }
  const out: { date: string; level: number }[] = [];
  let exp = currentExp;
  // 今日から古い日へ：その日の終わりの経験値 → 前の日の終わりは、その日に入った分を引いたもの
  for (let i = 0; i < days; i++) {
    const date = addDays(today, -i);
    out.push({ date, level: preciseLevelFromExp(Math.max(0, exp)) });
    exp -= gainedByDay.get(date) ?? 0;
  }
  return out.reverse();
}
