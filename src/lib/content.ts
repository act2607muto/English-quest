/**
 * 教材とゲームの設定（街・問題など）の読み書き。
 * 自分の記録の読み書きは records.ts。データベースに触る処理はこの2つにまとめる。
 *
 * 書き換えは管理者だけができる（データベースの RLS で制限している）。
 */
import { requireSupabase } from './supabase';
import type { EquipmentRow, MonsterRow, QuestionRow, TownRow } from './questionFile';
import type { Skill } from './skills';

const QUESTION_COLUMNS =
  'id, town_id, skill, format, prompt, sentence, sentence_ja, audio_text, choices, answer, model_answers, explanation, difficulty, tags';
const MONSTER_COLUMNS = 'id, name, town_id, skill, hp, gold, is_boss, image, exp_reward, encounter_rate, description';
const EQUIPMENT_COLUMNS = 'id, name, slot, effect, price, town_id, image';

/** 街の店の品ぞろえ（武器が先、安い順） */
export async function fetchEquipmentOfTown(townId: string): Promise<EquipmentRow[]> {
  const { data, error } = await requireSupabase()
    .from('equipment')
    .select(EQUIPMENT_COLUMNS)
    .eq('town_id', townId)
    .order('slot', { ascending: false })
    .order('price')
    .order('id');
  if (error) throw error;
  return data as EquipmentRow[];
}

export async function fetchEquipmentByIds(ids: string[]): Promise<EquipmentRow[]> {
  if (ids.length === 0) return [];
  const { data, error } = await requireSupabase().from('equipment').select(EQUIPMENT_COLUMNS).in('id', ids);
  if (error) throw error;
  return data as EquipmentRow[];
}

/** URL が長くなりすぎないよう、まとめて読む件数 */
const READ_CHUNK = 100;

export async function fetchIsAdmin(): Promise<boolean> {
  const { data, error } = await requireSupabase().rpc('is_admin');
  if (error) throw error;
  return data === true;
}

/** 指定した街に今ある問題 */
export async function fetchQuestionsOfTown(townId: string): Promise<QuestionRow[]> {
  const rows: QuestionRow[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await requireSupabase()
      .from('questions')
      .select(QUESTION_COLUMNS)
      .eq('town_id', townId)
      .order('id')
      .range(from, from + 999);
    if (error) throw error;
    rows.push(...(data as QuestionRow[]));
    if (data.length < 1000) return rows;
  }
}

/** 指定したIDの問題（ほかの街に同じIDがないかを確かめるため） */
export async function fetchQuestionsByIds(ids: string[]): Promise<QuestionRow[]> {
  const rows: QuestionRow[] = [];
  for (let i = 0; i < ids.length; i += READ_CHUNK) {
    const { data, error } = await requireSupabase()
      .from('questions')
      .select(QUESTION_COLUMNS)
      .in('id', ids.slice(i, i + READ_CHUNK));
    if (error) throw error;
    rows.push(...(data as QuestionRow[]));
  }
  return rows;
}

export async function fetchTowns(): Promise<TownRow[]> {
  const { data, error } = await requireSupabase()
    .from('towns')
    .select('id, name, scene, difficulty, sort_order, background_image')
    .order('sort_order');
  if (error) throw error;
  return data as TownRow[];
}

export async function fetchTown(townId: string): Promise<TownRow | null> {
  const { data, error } = await requireSupabase()
    .from('towns')
    .select('id, name, scene, difficulty, sort_order, background_image')
    .eq('id', townId)
    .maybeSingle();
  if (error) throw error;
  return data as TownRow | null;
}

export async function fetchMonstersOfTown(townId: string): Promise<MonsterRow[]> {
  const { data, error } = await requireSupabase()
    .from('monsters')
    .select(MONSTER_COLUMNS)
    .eq('town_id', townId)
    .order('id');
  if (error) throw error;
  return data as MonsterRow[];
}

export async function fetchMonstersByIds(ids: string[]): Promise<MonsterRow[]> {
  if (ids.length === 0) return [];
  const { data, error } = await requireSupabase().from('monsters').select(MONSTER_COLUMNS).in('id', ids);
  if (error) throw error;
  return data as MonsterRow[];
}

/** 出題に使う問題（要修正の印がついたものは除く） */
export async function fetchPlayableQuestions(townId: string, skill: Skill): Promise<QuestionRow[]> {
  const { data, error } = await requireSupabase()
    .from('questions')
    .select(QUESTION_COLUMNS)
    .eq('town_id', townId)
    .eq('skill', skill)
    .eq('needs_fix', false)
    .order('id');
  if (error) throw error;
  return data as QuestionRow[];
}

/** 練習中に見つけたおかしい問題に印をつける（管理者だけ） */
export async function flagQuestion(id: string, note: string): Promise<void> {
  const { error } = await requireSupabase()
    .from('questions')
    .update({ needs_fix: true, fix_note: note || null })
    .eq('id', id);
  if (error) throw error;
}

/**
 * 街と、問題・モンスターを登録する。同じIDがあれば上書きし、なければ足す。
 * 要修正の印（needs_fix）は送らないので、今の値のまま残る。街の名前・背景は、ファイルに書いてあるときだけ変える。
 */
export async function importTownFile(
  town: TownRow,
  questions: QuestionRow[],
  monsters: MonsterRow[],
  equipment: EquipmentRow[] = [],
): Promise<void> {
  const client = requireSupabase();
  const townResult = await client.from('towns').upsert(town, { onConflict: 'id' });
  if (townResult.error) throw townResult.error;

  for (let i = 0; i < questions.length; i += 500) {
    const { error } = await client
      .from('questions')
      .upsert(questions.slice(i, i + 500), { onConflict: 'id', defaultToNull: false });
    if (error) throw error;
  }
  if (monsters.length > 0) {
    const { error } = await client.from('monsters').upsert(monsters, { onConflict: 'id', defaultToNull: false });
    if (error) throw error;
  }
  if (equipment.length > 0) {
    const { error } = await client.from('equipment').upsert(equipment, { onConflict: 'id', defaultToNull: false });
    if (error) throw error;
  }
}

/** 街の問題のIDと能力値と印だけ（ボスの目安や、復習の数を数えるため。要修正の印つきは除く） */
export async function fetchTownQuestionIndex(townId: string): Promise<{ id: string; skill: Skill; tags: string[] }[]> {
  const { data, error } = await requireSupabase()
    .from('questions')
    .select('id, skill, tags')
    .eq('town_id', townId)
    .eq('needs_fix', false)
    .order('id');
  if (error) throw error;
  return data as { id: string; skill: Skill; tags: string[] }[];
}
