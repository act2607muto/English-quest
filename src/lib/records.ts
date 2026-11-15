/**
 * 自分の記録の読み書き。データベースに触る処理はこのファイルにまとめる。
 * 保存先を変えるときは、ここだけ直せば済むようにする。
 *
 * 行の絞り込み（本人の記録だけ）はデータベースの RLS が行うので、
 * ここでは user_id を指定しない。
 */
import { requireSupabase } from './supabase';
import type { Skill } from './skills';
import { effectiveExp, localDate, nextReview, type ReviewState } from './game/growth';

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

/** ログイン中の利用者のID（書き込む行を本人のものに絞るため） */
async function currentUserId(): Promise<string> {
  const { data } = await requireSupabase().auth.getSession();
  const id = data.session?.user.id;
  if (!id) throw new Error('ログインが切れました。ログインし直してください。');
  return id;
}

export type QuestionProgress = ReviewState & {
  questionId: string;
  correctCount: number;
  wrongCount: number;
  lastAnsweredAt: string | null;
};

/** 問題ごとの学習状態（まだ答えていない問題は入らない） */
export async function fetchProgress(questionIds: string[]): Promise<Map<string, QuestionProgress>> {
  const result = new Map<string, QuestionProgress>();
  for (let i = 0; i < questionIds.length; i += 100) {
    const { data, error } = await requireSupabase()
      .from('question_progress')
      .select('question_id, stage, next_review_on, correct_count, wrong_count, last_answered_at')
      .in('question_id', questionIds.slice(i, i + 100));
    if (error) throw error;
    for (const row of data) {
      result.set(row.question_id, {
        questionId: row.question_id,
        stage: row.stage,
        nextReviewOn: row.next_review_on,
        correctCount: row.correct_count,
        wrongCount: row.wrong_count,
        lastAnsweredAt: row.last_answered_at,
      });
    }
  }
  return result;
}

/** 1問答えた結果を記録し、次の復習日を決める */
export async function saveAnswer(input: {
  questionId: string;
  correct: boolean;
  answer: string;
  before: QuestionProgress | null;
}): Promise<QuestionProgress> {
  const today = localDate();
  const review = nextReview(input.before, input.correct, today);
  const now = new Date().toISOString();
  const next: QuestionProgress = {
    questionId: input.questionId,
    stage: review.stage,
    nextReviewOn: review.nextReviewOn,
    correctCount: (input.before?.correctCount ?? 0) + (input.correct ? 1 : 0),
    wrongCount: (input.before?.wrongCount ?? 0) + (input.correct ? 0 : 1),
    lastAnsweredAt: now,
  };
  const userId = await currentUserId();
  const { error } = await requireSupabase()
    .from('question_progress')
    .upsert(
      {
        user_id: userId,
        question_id: next.questionId,
        stage: next.stage,
        next_review_on: next.nextReviewOn,
        correct_count: next.correctCount,
        wrong_count: next.wrongCount,
        last_answered_at: now,
        last_answer: input.answer,
      },
      { onConflict: 'user_id,question_id' },
    );
  if (error) throw error;
  return next;
}

/**
 * 能力値に経験値を足す。低下を反映した今の値に足して保存し、最後に練習した日を今日にする。
 * 不正解（gained = 0）でも、練習したことになる。
 */
export async function addSkillExp(skill: Skill, gained: number): Promise<{ before: number; after: number }> {
  const client = requireSupabase();
  const userId = await currentUserId();
  const { data, error } = await client
    .from('skill_stats')
    .select('exp, max_exp, last_practiced_at')
    .eq('user_id', userId)
    .eq('skill', skill)
    .single();
  if (error) throw error;
  const before = effectiveExp({ exp: data.exp, maxExp: data.max_exp, lastPracticedAt: data.last_practiced_at });
  const after = before + Math.max(0, Math.round(gained));
  const update = await client
    .from('skill_stats')
    .update({ exp: after, max_exp: Math.max(data.max_exp, after), last_practiced_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('skill', skill);
  if (update.error) throw update.error;
  return { before, after };
}

/** 戦闘の終わりに、履歴を残し、勝っていればお金を足す */
export async function finishBattle(input: {
  townId: string;
  monsterId: string;
  questionCount: number;
  correctCount: number;
  won: boolean;
  expBySkill: Partial<Record<Skill, number>>;
  gold: number;
}): Promise<void> {
  const client = requireSupabase();
  const expGained = Object.values(input.expBySkill).reduce((a, b) => a + (b ?? 0), 0);
  const log = await client.from('battle_logs').insert({
    town_id: input.townId,
    monster_id: input.monsterId,
    question_count: input.questionCount,
    correct_count: input.correctCount,
    won: input.won,
    exp_gained: expGained,
    exp_by_skill: input.expBySkill,
    gold_gained: input.gold,
  });
  if (log.error) throw log.error;

  if (input.gold > 0) {
    const userId = await currentUserId();
    const { data, error } = await client.from('adventure_state').select('gold').eq('user_id', userId).single();
    if (error) throw error;
    const update = await client
      .from('adventure_state')
      .update({ gold: data.gold + input.gold })
      .eq('user_id', userId);
    if (update.error) throw update.error;
  }
}
