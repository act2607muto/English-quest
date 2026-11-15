/**
 * 教材とゲームの設定（街・問題など）の読み書き。
 * 自分の記録の読み書きは records.ts。データベースに触る処理はこの2つにまとめる。
 *
 * 書き換えは管理者だけができる（データベースの RLS で制限している）。
 */
import { requireSupabase } from './supabase';
import type { QuestionRow, TownRow } from './questionFile';

const QUESTION_COLUMNS =
  'id, town_id, skill, format, prompt, sentence, sentence_ja, audio_text, choices, answer, model_answers, explanation, difficulty, tags';

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
    .select('id, scene, difficulty, sort_order')
    .order('sort_order');
  if (error) throw error;
  return data as TownRow[];
}

/**
 * 街と問題を登録する。同じIDがあれば上書きし、なければ足す。
 * 要修正の印（needs_fix）と街の名前・背景は送らないので、今の値のまま残る。
 */
export async function importTownAndQuestions(town: TownRow, questions: QuestionRow[]): Promise<void> {
  const client = requireSupabase();
  const townResult = await client.from('towns').upsert(town, { onConflict: 'id' });
  if (townResult.error) throw townResult.error;

  for (let i = 0; i < questions.length; i += 500) {
    const { error } = await client
      .from('questions')
      .upsert(questions.slice(i, i + 500), { onConflict: 'id', defaultToNull: false });
    if (error) throw error;
  }
}
