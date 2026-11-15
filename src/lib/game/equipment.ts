/**
 * 装備の効果。英語の正誤は変えない。効くのは経験値の上乗せ・HP・低下までの猶予だけ。
 */
import type { EquipmentEffect, EquipmentRow } from '../questionFile';
import { SKILL_LABELS, type Skill } from '../skills';
import { DECAY_GRACE_DAYS } from './rules';

export type Modifiers = {
  /** 武器が上乗せする能力値と割合（0.1 で 10%） */
  expBonus: { skill: Skill; rate: number } | null;
  hpBonus: number;
  graceDays: number;
};

export function modifiersOf(weapon: EquipmentRow | null, armor: EquipmentRow | null): Modifiers {
  const mods: Modifiers = { expBonus: null, hpBonus: 0, graceDays: DECAY_GRACE_DAYS };
  for (const item of [weapon, armor]) {
    const e = item?.effect;
    if (!e) continue;
    if (e.type === 'exp_bonus') mods.expBonus = { skill: e.skill, rate: e.rate };
    if (e.type === 'max_hp') mods.hpBonus += e.amount;
    if (e.type === 'decay_grace') mods.graceDays += e.days;
  }
  return mods;
}

/** 武器の上乗せを足した経験値（四捨五入） */
export function withExpBonus(base: number, skill: Skill, mods: Modifiers): number {
  if (base <= 0 || !mods.expBonus || mods.expBonus.skill !== skill) return base;
  return Math.round(base * (1 + mods.expBonus.rate));
}

export function describeEffect(effect: EquipmentEffect): string {
  switch (effect.type) {
    case 'exp_bonus':
      return `${SKILL_LABELS[effect.skill]}の経験値 +${Math.round(effect.rate * 100)}%`;
    case 'max_hp':
      return `HP +${effect.amount}`;
    case 'decay_grace':
      return `能力値が下がり始めるまで +${effect.days}日`;
  }
}
