/**
 * 自分の今の状態（能力値・レベル・HP・お金）をまとめて読む。
 */
import { fetchAdventureState, fetchSkillStats } from '../records';
import { SKILLS, type Skill } from '../skills';
import { daysUntilDecay, effectiveExp, levelFromExp, overallLevel, playerMaxHp, type SkillLevel } from './growth';
import { EXP_PER_LEVEL_SQUARED, MAX_LEVEL } from './rules';

export type PlayerSkill = SkillLevel & {
  /** 低下が始まるまでの残り日数。まだ練習していなければ null */
  daysUntilDecay: number | null;
};

export type Player = {
  skills: PlayerSkill[];
  overall: number;
  maxHp: number;
  gold: number;
  currentTownId: string;
};

export async function loadPlayer(): Promise<Player> {
  const [stats, adventure] = await Promise.all([fetchSkillStats(), fetchAdventureState()]);
  const bySkill = new Map(stats.map((s) => [s.skill, s]));
  const skills: PlayerSkill[] = SKILLS.map((skill) => {
    const s = bySkill.get(skill);
    const exp = s ? effectiveExp(s) : 0;
    return {
      skill,
      unlocked: s?.unlocked ?? false,
      exp,
      level: levelFromExp(exp),
      maxLevel: levelFromExp(s?.maxExp ?? 0),
      daysUntilDecay: s ? daysUntilDecay(s.lastPracticedAt) : null,
    };
  });
  const overall = overallLevel(skills);
  return {
    skills,
    overall,
    maxHp: playerMaxHp(overall),
    gold: adventure?.gold ?? 0,
    currentTownId: adventure?.currentTownId ?? 'town01',
  };
}

/** 六角形を滑らかに伸ばすための、小数のレベル */
export function preciseLevel(exp: number): number {
  return Math.min(MAX_LEVEL, Math.max(1, Math.sqrt(Math.max(0, exp) / EXP_PER_LEVEL_SQUARED)));
}

export function skillOf(player: Player, skill: Skill): PlayerSkill {
  return player.skills.find((s) => s.skill === skill)!;
}
