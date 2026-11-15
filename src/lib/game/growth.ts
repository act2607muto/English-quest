/**
 * 成長の計算（レベル、低下、復習の時期、HP）。画面やデータベースには触らない。
 */
import type { Skill } from '../skills';
import {
  DECAY_FLOOR_RATIO,
  DECAY_GRACE_DAYS,
  DECAY_RATE_PER_DAY,
  EXP_PER_LEVEL_SQUARED,
  HEXAGON_SCALE_STEPS,
  MAX_LEVEL,
  PLAYER_BASE_HP,
  PLAYER_HP_PER_10_LEVELS,
  REVIEW_INTERVALS,
} from './rules';

/** 経験値からレベル（1〜99） */
export function levelFromExp(exp: number): number {
  const level = Math.floor(Math.sqrt(Math.max(0, exp) / EXP_PER_LEVEL_SQUARED));
  return Math.min(MAX_LEVEL, Math.max(1, level));
}

/** そのレベルになるのに必要な累計経験値 */
export function expForLevel(level: number): number {
  return EXP_PER_LEVEL_SQUARED * level * level;
}

/** 端末の暦での日付（YYYY-MM-DD） */
export function localDate(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** 日付（YYYY-MM-DD）同士の日数の差。b が後なら正 */
export function daysBetween(a: string, b: string): number {
  const toUtc = (s: string) => {
    const [y, m, d] = s.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUtc(b) - toUtc(a)) / 86_400_000);
}

export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number);
  return localDate(new Date(y, m - 1, d + days));
}

/**
 * 低下を反映した、今の経験値。
 * 最後に練習した日から graceDays 日は下がらず、その後1日ごとに1%ずつ減る。
 * 過去最高の70%より下には下がらない。
 */
export function effectiveExp(
  stat: { exp: number; maxExp: number; lastPracticedAt: string | null },
  today: string = localDate(),
  graceDays: number = DECAY_GRACE_DAYS,
): number {
  if (!stat.lastPracticedAt) return stat.exp;
  const last = localDate(new Date(stat.lastPracticedAt));
  const decayDays = daysBetween(last, today) - graceDays;
  if (decayDays <= 0) return stat.exp;
  const decayed = Math.floor(stat.exp * Math.pow(1 - DECAY_RATE_PER_DAY, decayDays));
  const floor = Math.floor(stat.maxExp * DECAY_FLOOR_RATIO);
  return Math.min(stat.exp, Math.max(decayed, floor));
}

/** 低下が始まるまでの残り日数（0なら今日から下がる、負ならすでに下がっている） */
export function daysUntilDecay(
  lastPracticedAt: string | null,
  today: string = localDate(),
  graceDays: number = DECAY_GRACE_DAYS,
): number | null {
  if (!lastPracticedAt) return null;
  return graceDays + 1 - daysBetween(localDate(new Date(lastPracticedAt)), today);
}

/** 総合レベル：解放済みの能力値のレベルの平均（切り捨て） */
export function overallLevel(levels: { level: number; unlocked: boolean }[]): number {
  const open = levels.filter((l) => l.unlocked);
  if (open.length === 0) return 1;
  return Math.floor(open.reduce((sum, l) => sum + l.level, 0) / open.length);
}

/** 自分のHP：基本3、総合レベル10ごとに1増える */
export function playerMaxHp(overall: number, bonus = 0): number {
  return PLAYER_BASE_HP + Math.floor(overall / 10) * PLAYER_HP_PER_10_LEVELS + bonus;
}

/** 六角形の目盛りの上限 */
export function hexagonScale(highestLevel: number): number {
  return HEXAGON_SCALE_STEPS.find((s) => highestLevel <= s) ?? MAX_LEVEL;
}

export type ReviewState = { stage: number; nextReviewOn: string | null };

/**
 * 答えたあとの復習の段階と次の復習日。
 * 正解なら間隔を1段階延ばし（1日→3日→7日→14日→30日）、不正解なら1日に戻す。
 * 復習日より前に正解しても間隔は延ばさない（同じ日に何度も正解して30日先まで飛ぶのを防ぐ）。
 */
export function nextReview(before: ReviewState | null, correct: boolean, today: string = localDate()): ReviewState {
  if (correct && before?.nextReviewOn && before.nextReviewOn > today) return before;
  const max = REVIEW_INTERVALS.length;
  const stage = correct ? Math.min((before?.stage ?? 0) + 1, max) : 1;
  return { stage, nextReviewOn: addDays(today, REVIEW_INTERVALS[stage - 1]) };
}

/** 復習の時期が来ているか */
export function isDue(review: ReviewState | null, today: string = localDate()): boolean {
  return Boolean(review?.nextReviewOn && review.nextReviewOn <= today);
}

/** 能力値ごとのレベル表示用 */
export type SkillLevel = {
  skill: Skill;
  unlocked: boolean;
  exp: number; // 低下を反映した今の経験値
  level: number;
  maxLevel: number; // 過去最高のレベル
};
