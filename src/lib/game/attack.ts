/**
 * 攻撃力とダメージの計算。画面やデータベースには触らない。
 * 攻撃力は総合レベルで決まり、その能力値の武器を持っていれば、その能力値の問題のときだけ上乗せする（英語の正誤は変えない）。
 */
import type { MonsterRow } from '../questionFile';
import type { Skill } from '../skills';
import type { Player } from './player';
import { ATTACK_BASE, ATTACK_PER_LEVEL, MIN_HITS_TO_DEFEAT } from './rules';

/** 武器を除いた攻撃力（総合レベルで決まる） */
export function baseAttackOf(player: Pick<Player, 'overall'>): number {
  return ATTACK_BASE + Math.floor((player.overall - 1) * ATTACK_PER_LEVEL);
}

/** 武器による上乗せ（その能力値の武器を持っていなければ 0） */
export function weaponAttackOf(player: Player, skill: Skill): number {
  const bonus = player.mods.attackBonus;
  return bonus && bonus.skill === skill ? bonus.amount : 0;
}

/** その能力値の問題に正解したときの攻撃力 */
export function attackOf(player: Player, skill: Skill): number {
  return baseAttackOf(player) + weaponAttackOf(player, skill);
}

/** 1回の正解で与えるダメージ。どんなに強くても、最低 MIN_HITS_TO_DEFEAT 回は正解が要る */
export function damageTo(monster: MonsterRow, attack: number): number {
  return Math.max(1, Math.min(attack, Math.ceil(monster.hp / MIN_HITS_TO_DEFEAT)));
}

/** 倒すのに必要な正解の数（ボスのように能力値がまざるときは、いちばん多くかかる場合） */
export function hitsToDefeat(monster: MonsterRow, player: Player, skills: Skill[]): number {
  return Math.max(1, ...skills.map((s) => Math.ceil(monster.hp / damageTo(monster, attackOf(player, s)))));
}
