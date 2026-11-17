/**
 * 自分の今の状態（能力値・レベル・HP・お金・装備）をまとめて読む。
 */
import { fetchEquipmentByIds } from '../content';
import type { EquipmentRow } from '../questionFile';
import { fetchAdventureState, fetchSkillStats } from '../records';
import { SKILLS, type Skill } from '../skills';
import type { HeroLook } from '../heroLook';
import { modifiersOf, type Modifiers } from './equipment';
import {
  daysUntilDecay,
  effectiveExp,
  levelFromExp,
  localDate,
  overallLevel,
  playerMaxHp,
  preciseLevelFromExp,
  type SkillLevel,
} from './growth';

export type PlayerSkill = SkillLevel & {
  /** 低下が始まるまでの残り日数。まだ練習していなければ null */
  daysUntilDecay: number | null;
};

export type Player = {
  /** 主人公の名前。まだつけていなければ null（名前をつける画面を出す） */
  heroName: string | null;
  /** 主人公の見た目（男の子・女の子） */
  heroLook: HeroLook;
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
  // 解放されたばかりで、まだ一度も練習していない能力値（リーディングなど）は、総合レベルに入れない
  // （入れると、新しい街に着いたとたんに総合レベルが下がってしまうため）
  const overall = overallLevel(skills.filter((s) => s.exp > 0 || s.daysUntilDecay !== null));
  return {
    heroName: adventure?.heroName ?? null,
    heroLook: adventure?.heroLook ?? 'boy',
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
  return preciseLevelFromExp(exp);
}

/** 画面で使う主人公の名前。まだつけていなければ「あなた」 */
export function heroNameOf(player: Player): string {
  return player.heroName ?? 'あなた';
}

export function skillOf(player: Player, skill: Skill): PlayerSkill {
  return player.skills.find((s) => s.skill === skill)!;
}
