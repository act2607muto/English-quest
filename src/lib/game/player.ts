/**
 * 自分の今の状態（能力値・レベル・HP・お金・装備）をまとめて読む。
 */
import { fetchEquipmentByIds } from '../content';
import type { EquipmentRow } from '../questionFile';
import { fetchAdventureState, fetchSkillStats } from '../records';
import { SKILLS, type Skill } from '../skills';
import { modifiersOf, type Modifiers } from './equipment';
import { daysUntilDecay, effectiveExp, levelFromExp, localDate, overallLevel, playerMaxHp, type SkillLevel } from './growth';
import { EXP_PER_LEVEL_SQUARED, MAX_LEVEL } from './rules';

export type PlayerSkill = SkillLevel & {
  /** 低下が始まるまでの残り日数。まだ練習していなければ null */
  daysUntilDecay: number | null;
};

export type Player = {
  /** 主人公の名前。まだつけていなければ null（名前をつける画面を出す） */
  heroName: string | null;
  skills: PlayerSkill[];
  overall: number;
  maxHp: number;
  gold: number;
  currentTownId: string;
  ownedEquipment: string[];
  /** 倒したボスの monsters.id */
  defeatedBosses: string[];
  weapon: EquipmentRow | null;
  armor: EquipmentRow | null;
  mods: Modifiers;
};

export async function loadPlayer(): Promise<Player> {
  const [stats, adventure] = await Promise.all([fetchSkillStats(), fetchAdventureState()]);
  const equippedIds = [adventure?.equippedWeaponId, adventure?.equippedArmorId].filter((x): x is string => !!x);
  const equipped = await fetchEquipmentByIds(equippedIds);
  const weapon = equipped.find((e) => e.id === adventure?.equippedWeaponId) ?? null;
  const armor = equipped.find((e) => e.id === adventure?.equippedArmorId) ?? null;
  const mods = modifiersOf(weapon, armor);

  const today = localDate();
  const bySkill = new Map(stats.map((s) => [s.skill, s]));
  const skills: PlayerSkill[] = SKILLS.map((skill) => {
    const s = bySkill.get(skill);
    const exp = s ? effectiveExp(s, today, mods.graceDays) : 0;
    return {
      skill,
      unlocked: s?.unlocked ?? false,
      exp,
      level: levelFromExp(exp),
      maxLevel: levelFromExp(s?.maxExp ?? 0),
      daysUntilDecay: s ? daysUntilDecay(s.lastPracticedAt, today, mods.graceDays) : null,
    };
  });
  const overall = overallLevel(skills);
  return {
    heroName: adventure?.heroName ?? null,
    skills,
    overall,
    maxHp: playerMaxHp(overall, mods.hpBonus),
    gold: adventure?.gold ?? 0,
    currentTownId: adventure?.currentTownId ?? 'town01',
    ownedEquipment: adventure?.ownedEquipment ?? [],
    defeatedBosses: adventure?.defeatedBosses ?? [],
    weapon,
    armor,
    mods,
  };
}

/** 六角形を滑らかに伸ばすための、小数のレベル */
export function preciseLevel(exp: number): number {
  return Math.min(MAX_LEVEL, Math.max(1, Math.sqrt(Math.max(0, exp) / EXP_PER_LEVEL_SQUARED)));
}

/** 画面で使う主人公の名前。まだつけていなければ「あなた」 */
export function heroNameOf(player: Player): string {
  return player.heroName ?? 'あなた';
}

export function skillOf(player: Player, skill: Skill): PlayerSkill {
  return player.skills.find((s) => s.skill === skill)!;
}
