/**
 * 戦う相手の組み立て。復活モンスターとボスは、ファイルのモンスターをもとに、名前・HP・お金を調整して作る。
 */
import type { MonsterRow } from '../questionFile';
import type { Skill } from '../skills';
import { attackOf, damageTo } from './attack';
import { PLAYABLE_SKILLS } from './battle';
import type { Player } from './player';
import { BOSS_REMATCH_GOLD, EXP_FLAWLESS_BONUS, REVIVAL_GOLD } from './rules';

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

/** めずらしいモンスター（街の外でだけ、まれに出会う。いろいろな能力値の問題を出す） */
export function isRare(monster: MonsterRow): boolean {
  return !monster.is_boss && monster.skill === null && monster.encounter_rate !== null;
}

/**
 * 出会いのとき、めずらしいモンスターになるかを決める。
 * それぞれの encounter_rate の割合で選ばれ、どれにも当たらなければ null（ふつうのモンスター）。
 */
export function rollRare(rares: MonsterRow[], roll = Math.random()): MonsterRow | null {
  let edge = 0;
  for (const m of [...rares].sort((a, b) => (a.encounter_rate ?? 0) - (b.encounter_rate ?? 0))) {
    edge += m.encounter_rate ?? 0;
    if (roll < edge) return m;
  }
  return null;
}

/** めずらしいモンスターが出す能力値：今戦える能力値のうち、問題があるものすべて */
export function rareSkills(player: Player, available: Set<Skill>): Skill[] {
  return player.skills.filter((s) => s.unlocked && available.has(s.skill)).map((s) => s.skill);
}

/**
 * 勝ったときの経験値のおまけを、出た能力値で分ける（合計が exp_reward になるよう、余りは前から1ずつ）。
 */
export function splitExpReward(total: number, skills: Skill[]): Partial<Record<Skill, number>> {
  const out: Partial<Record<Skill, number>> = {};
  if (total <= 0 || skills.length === 0) return out;
  const each = Math.floor(total / skills.length);
  const rest = total - each * skills.length;
  skills.forEach((s, i) => {
    const v = each + (i < rest ? 1 : 0);
    if (v > 0) out[s] = v;
  });
  return out;
}

/**
 * ミスなしのボーナス：出た能力値に同じだけ分ける。合計が EXP_FLAWLESS_BONUS を下回らないよう切り上げる。
 * 1種類なら10、2種類なら5ずつ、3種類なら4ずつ、4種類なら3ずつ、5〜6種類なら2ずつ。
 */
export function flawlessBonusEach(skillCount: number): number {
  return skillCount > 0 ? Math.ceil(EXP_FLAWLESS_BONUS / skillCount) : 0;
}

/**
 * ボスが出す能力値：今戦える能力値のうち、練習したことがあるもの。
 * townSkills を渡すと、その街に問題がある能力値だけにする（はじまりの街にはリーディングの問題がないので）。
 */
export function bossSkills(player: Player, townSkills?: Skill[]): Skill[] {
  const open = player.skills.filter(
    (s) => s.unlocked && PLAYABLE_SKILLS.includes(s.skill) && (!townSkills || townSkills.includes(s.skill)),
  );
  const practiced = open.filter((s) => s.exp > 0 || s.daysUntilDecay !== null);
  // まだどの能力値も練習していない人（はじめてすぐボスに挑む人）は、戦えるすべての能力値から出す
  return (practiced.length > 0 ? practiced : open).map((s) => s.skill);
}
