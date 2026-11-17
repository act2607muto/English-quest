/**
 * 自分の記録の読み書き。データベースに触る処理はこのファイルにまとめる。
 * 保存先を変えるときは、ここだけ直せば済むようにする。
 *
 * 行の絞り込み（本人の記録だけ）はデータベースの RLS が行うので、
 * ここでは user_id を指定しない。
 */
import { requireSupabase } from './supabase';
import type { Skill } from './skills';
import { isHeroLook, type HeroLook } from './heroLook';
import { effectiveExp, localDate, nextReview, type ReviewState } from './game/growth';
import { DECAY_GRACE_DAYS } from './game/rules';

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
  /** 主人公の名前。まだつけていなければ null */
  heroName: string | null;
  /** 主人公の見た目（男の子・女の子） */
  heroLook: HeroLook;
};

/** 主人公の名前の長さ（データベースの制約と同じ） */
export const HERO_NAME_MAX = 8;

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

const ADVENTURE_COLUMNS =
  'current_town_id, gold, owned_equipment, equipped_weapon_id, equipped_armor_id, defeated_bosses, hero_name';

export async function fetchAdventureState(): Promise<AdventureState | null> {
  const client = requireSupabase();
  let { data, error } = await client
    .from('adventure_state')
    .select(`${ADVENTURE_COLUMNS}, hero_look`)
    .maybeSingle();
  // 見た目の列（hero_look）をまだデータベースに足していないときは、それ抜きで読む（男の子として遊べる）
  if (error?.code === '42703') {
    ({ data, error } = await client.from('adventure_state').select(ADVENTURE_COLUMNS).maybeSingle());
  }
  if (error) throw error;
  if (!data) return null;
  return {
    currentTownId: data.current_town_id,
    gold: data.gold,
    ownedEquipment: data.owned_equipment,
    equippedWeaponId: data.equipped_weapon_id,
    equippedArmorId: data.equipped_armor_id,
    defeatedBosses: data.defeated_bosses,
    heroName: data.hero_name,
    heroLook: 'hero_look' in data && isHeroLook(data.hero_look) ? data.hero_look : 'boy',
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
  /** AI採点の評価と助言（4択では空） */
  feedback?: Record<string, unknown> | null;
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
        last_feedback: input.feedback ?? null,
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
export async function addSkillExp(
  skill: Skill,
  gained: number,
  graceDays: number = DECAY_GRACE_DAYS,
): Promise<{ before: number; after: number }> {
  const client = requireSupabase();
  const userId = await currentUserId();
  const { data, error } = await client
    .from('skill_stats')
    .select('exp, max_exp, last_practiced_at')
    .eq('user_id', userId)
    .eq('skill', skill)
    .single();
  if (error) throw error;
  const before = effectiveExp(
    { exp: data.exp, maxExp: data.max_exp, lastPracticedAt: data.last_practiced_at },
    localDate(),
    graceDays,
  );
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

/**
 * 装備品を買う。おかねが足りない、すでに持っている場合は買わない。
 * おかねと持ち物は同じ1行にあるので、1回の更新でまとめて変える。
 */
export async function buyEquipment(item: { id: string; price: number }): Promise<AdventureState> {
  const client = requireSupabase();
  const userId = await currentUserId();
  const { data, error } = await client
    .from('adventure_state')
    .select('gold, owned_equipment')
    .eq('user_id', userId)
    .single();
  if (error) throw error;
  if ((data.owned_equipment as string[]).includes(item.id)) throw new Error('もう持っています');
  if (data.gold < item.price) throw new Error('おかねが足りません');
  const update = await client
    .from('adventure_state')
    .update({ gold: data.gold - item.price, owned_equipment: [...data.owned_equipment, item.id] })
    .eq('user_id', userId)
    .eq('gold', data.gold); // 別の端末で同時に変わっていたら更新しない
  if (update.error) throw update.error;
  const after = await fetchAdventureState();
  if (!after || !after.ownedEquipment.includes(item.id)) {
    throw new Error('ほかの端末で同時に変わったため、買えませんでした。もう一度試してください。');
  }
  return after;
}

/** ボスを倒したことを記録する（すでに記録してあれば何もしない） */
export async function markBossDefeated(bossId: string): Promise<void> {
  const client = requireSupabase();
  const userId = await currentUserId();
  const now = await fetchAdventureState();
  if (!now || now.defeatedBosses.includes(bossId)) return;
  const { error } = await client
    .from('adventure_state')
    .update({ defeated_bosses: [...now.defeatedBosses, bossId] })
    .eq('user_id', userId);
  if (error) throw error;
}

/**
 * 別の街へ移る。その街で出る能力値のうち、まだ解放されていないもの（2つ目の街のリーディングなど）を解放する。
 * 解放した能力値を返す（街に着いたときに知らせるため）。
 */
export async function moveToTown(townId: string, townSkills: Skill[]): Promise<Skill[]> {
  const client = requireSupabase();
  const userId = await currentUserId();
  const { error } = await client.from('adventure_state').update({ current_town_id: townId }).eq('user_id', userId);
  if (error) throw error;
  const stats = await fetchSkillStats();
  const toUnlock = stats.filter((s) => !s.unlocked && townSkills.includes(s.skill)).map((s) => s.skill);
  if (toUnlock.length > 0) {
    const update = await client.from('skill_stats').update({ unlocked: true }).eq('user_id', userId).in('skill', toUnlock);
    if (update.error) throw update.error;
  }
  return toUnlock;
}

/** 武器か防具を付け替える。null ならはずす。持っている物しか装備できない */
export async function equip(slot: 'weapon' | 'armor', itemId: string | null): Promise<void> {
  const client = requireSupabase();
  const userId = await currentUserId();
  if (itemId) {
    const now = await fetchAdventureState();
    if (!now?.ownedEquipment.includes(itemId)) throw new Error('持っていない装備です');
  }
  const column = slot === 'weapon' ? 'equipped_weapon_id' : 'equipped_armor_id';
  const { error } = await client
    .from('adventure_state')
    .update({ [column]: itemId })
    .eq('user_id', userId);
  if (error) throw error;
}

/**
 * 名前の入力を整える。前後の空白を取り、長すぎるものや空のものは理由を返す。
 * 文字数は、データベースの制約（char_length）と同じ数え方にする。
 */
export function normalizeHeroName(input: string): { name: string } | { error: string } {
  const name = input.trim().replace(/\s+/g, ' ');
  const length = [...name].length;
  if (length === 0) return { error: '名前を入れてください。' };
  if (length > HERO_NAME_MAX) return { error: `名前は${HERO_NAME_MAX}文字までです。` };
  return { name };
}

/** 主人公の名前と見た目をつける・変える */
export async function saveHeroName(input: string, look: HeroLook): Promise<void> {
  const checked = normalizeHeroName(input);
  if ('error' in checked) throw new Error(checked.error);
  const client = requireSupabase();
  const userId = await currentUserId();
  const { data, error } = await client
    .from('adventure_state')
    .update({ hero_name: checked.name, hero_look: look })
    .eq('user_id', userId)
    .select('hero_name');
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('冒険の記録が見つからず、名前を保存できませんでした。');
}

/** モンスター図鑑の記録：モンスターごとの、戦った回数・倒した回数・はじめて倒した日 */
export type MonsterRecord = { fought: number; defeated: number; firstDefeatedAt: string | null };

/**
 * 戦闘の履歴から、モンスターごとの記録を作る。復活モンスター（ID の最後が -revival）は、もとのモンスターに数える。
 * 履歴が多くても読めるよう、1000件ずつ読む。
 */
export async function fetchMonsterRecords(): Promise<Map<string, MonsterRecord>> {
  const client = requireSupabase();
  const records = new Map<string, MonsterRecord>();
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await client
      .from('battle_logs')
      .select('monster_id, won, fought_at')
      .order('fought_at')
      .range(from, from + PAGE - 1);
    if (error) throw error;
    for (const row of data as { monster_id: string; won: boolean; fought_at: string }[]) {
      const id = row.monster_id.replace(/-revival$/, '');
      const r = records.get(id) ?? { fought: 0, defeated: 0, firstDefeatedAt: null };
      r.fought += 1;
      if (row.won) {
        r.defeated += 1;
        r.firstDefeatedAt ??= row.fought_at;
      }
      records.set(id, r);
    }
    if (data.length < PAGE) break;
  }
  return records;
}
