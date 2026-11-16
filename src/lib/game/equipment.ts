/**
 * 装備の効果。英語の正誤は変えない。効くのは攻撃力・HP・低下までの猶予だけ。
 */
import type { EquipmentEffect, EquipmentRow } from '../questionFile';
import { SKILL_LABELS, type Skill } from '../skills';
import { DECAY_GRACE_DAYS } from './rules';

export type Modifiers = {
  /** 武器が上乗せする攻撃力と、効く能力値 */
  attackBonus: { skill: Skill; amount: number } | null;
  hpBonus: number;
  graceDays: number;
};

export function modifiersOf(weapon: EquipmentRow | null, armor: EquipmentRow | null): Modifiers {
  const mods: Modifiers = { attackBonus: null, hpBonus: 0, graceDays: DECAY_GRACE_DAYS };
  for (const item of [weapon, armor]) {
    const e = item?.effect;
    if (!e) continue;
    if (e.type === 'attack') mods.attackBonus = { skill: e.skill, amount: e.amount };
    if (e.type === 'max_hp') mods.hpBonus += e.amount;
    if (e.type === 'decay_grace') mods.graceDays += e.days;
  }
  return mods;
}

export function describeEffect(effect: EquipmentEffect): string {
  switch (effect.type) {
    case 'attack':
      return `${SKILL_LABELS[effect.skill]}の こうげき +${effect.amount}`;
    case 'max_hp':
      return `HP +${effect.amount}`;
    case 'decay_grace':
      return `能力値が下がり始めるまで +${effect.days}日`;
    default:
      // 前の形の効果（取り込み直す前のデータ）
      return '効果なし（装備品のファイルを取り込み直してください）';
  }
}
