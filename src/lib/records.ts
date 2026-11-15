/**
 * 自分の記録の読み書き。データベースに触る処理はこのファイルにまとめる。
 * 保存先を変えるときは、ここだけ直せば済むようにする。
 *
 * 行の絞り込み（本人の記録だけ）はデータベースの RLS が行うので、
 * ここでは user_id を指定しない。
 */
import { requireSupabase } from './supabase';
import type { Skill } from './skills';

export type SkillStat = {
  skill: Skill;
  exp: number;
  maxExp: number;
  lastPracticedAt: string | null;
  unlocked: boolean;
};

export type AdventureState = {
  currentTownId: string;
  gold: number;
  ownedEquipment: string[];
  equippedWeaponId: string | null;
  equippedArmorId: string | null;
  defeatedBosses: string[];
};

export async function fetchSkillStats(): Promise<SkillStat[]> {
  const { data, error } = await requireSupabase()
    .from('skill_stats')
    .select('skill, exp, max_exp, last_practiced_at, unlocked');
  if (error) throw error;
  return data.map((row) => ({
    skill: row.skill as Skill,
    exp: row.exp,
    maxExp: row.max_exp,
    lastPracticedAt: row.last_practiced_at,
    unlocked: row.unlocked,
  }));
}

export async function fetchAdventureState(): Promise<AdventureState | null> {
  const { data, error } = await requireSupabase()
    .from('adventure_state')
    .select(
      'current_town_id, gold, owned_equipment, equipped_weapon_id, equipped_armor_id, defeated_bosses',
    )
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    currentTownId: data.current_town_id,
    gold: data.gold,
    ownedEquipment: data.owned_equipment,
    equippedWeaponId: data.equipped_weapon_id,
    equippedArmorId: data.equipped_armor_id,
    defeatedBosses: data.defeated_bosses,
  };
}
