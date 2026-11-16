/**
 * 戦う相手の組み立て。復活モンスターとボスは、ファイルのモンスターをもとに、名前・HP・お金を調整して作る。
 */
import type { MonsterRow } from '../questionFile';
import type { Skill } from '../skills';
import { attackOf, damageTo } from './attack';
import { PLAYABLE_SKILLS } from './battle';
import type { Player } from './player';
import { BOSS_REMATCH_GOLD, REVIVAL_GOLD } from './rules';

/**
 * 復活モンスター：復習の時期が来た問題で現れる色違い。
 * HP は「もとのHP」と「復習の問題の数だけ正解すると倒せるHP」の小さいほう（復習の問題を先に出す）。
 */
export function revivalOf(monster: MonsterRow, dueCount: number, player: Player): MonsterRow {
  const perHit = monster.skill ? damageTo(monster, attackOf(player, monster.skill)) : 1;
  return {
    ...monster,
    id: `${monster.id}-revival`,
    name: `${monster.name}（復活）`,
    hp: Math.max(1, Math.min(monster.hp, dueCount * perHit)),
    gold: REVIVAL_GOLD,
  };
}

/** ボス：100 G は最初に倒したときだけ。2回目からは少なめ */
export function bossFor(boss: MonsterRow, player: Player): MonsterRow {
  const defeated = player.defeatedBosses.includes(boss.id);
  return { ...boss, gold: defeated ? BOSS_REMATCH_GOLD : boss.gold };
}

/** ボスが出す能力値：今戦える能力値のうち、練習したことがあるもの */
export function bossSkills(player: Player): Skill[] {
  return player.skills
    .filter((s) => s.unlocked && PLAYABLE_SKILLS.includes(s.skill) && (s.exp > 0 || s.daysUntilDecay !== null))
    .map((s) => s.skill);
}
