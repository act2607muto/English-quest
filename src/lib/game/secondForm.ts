/**
 * ボスの第二形態（2026-11-22、ほしぞらの王城の「そらの関所の大グリフォン」から）。
 *
 * - モンスターのファイルに、ボスの ID の最後に "-form2" をつけたモンスターを書く（skill なし、is_boss は false）。
 *   例：town05-boss の第二形態は town05-boss-form2。
 * - ボス戦で1回目の姿の HP を0にすると、倒れずに第二形態へ変身し、HP が満タンで戦いが続く。
 *   第二形態を倒すと勝ち（ボスを倒した記録・エンディングは、もとのボスの ID で数える）。
 * - 第二形態は街の外にもスキルダンジョンにも出ない。図鑑には「ボス（第二形態）」として、もとのボスを倒すと出る。
 * - 第二形態のないボスは、今までどおり1回で決着する。
 */
import type { MonsterRow } from '../questionFile';

export const SECOND_FORM_SUFFIX = '-form2';

export function secondFormIdOf(bossId: string): string {
  return `${bossId}${SECOND_FORM_SUFFIX}`;
}

export function isSecondFormId(id: unknown): boolean {
  return typeof id === 'string' && id.endsWith(SECOND_FORM_SUFFIX);
}

export function isSecondForm(monster: MonsterRow): boolean {
  return isSecondFormId(monster.id);
}

/** 第二形態の ID から、もとのボスの ID */
export function baseBossIdOf(id: string): string {
  return id.slice(0, -SECOND_FORM_SUFFIX.length);
}
