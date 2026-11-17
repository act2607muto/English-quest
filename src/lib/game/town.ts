/**
 * 街の進み具合：ボスに挑むおすすめの目安（問題の8割に1回以上正解）に届いたか、復習の時期が来た問題がいくつあるか。
 * ボスはいつでも挑める（2026-11-18 本人が決定）。目安は、勝ちやすくなる目印として出すだけ。
 */
import { fetchMonstersOfTown, fetchTownQuestionIndex } from '../content';
import { fetchProgress, type QuestionProgress } from '../records';
import type { Skill } from '../skills';
import { isDue, localDate } from './growth';
import { BOSS_RECOMMEND_RATIO } from './rules';

export type TownStatus = {
  /** 街の問題の数（要修正の印つきは除く） */
  total: number;
  /** 1回以上正解した問題の数 */
  correctOnce: number;
  /** ボスに挑むおすすめの目安の数 */
  needed: number;
  /** 目安に届いたか（届いていなくても挑める） */
  bossReady: boolean;
  /** 能力値ごとの、復習の時期が来た問題の数 */
  dueBySkill: Partial<Record<Skill, number>>;
  /** この街に問題がある能力値（ボスやめずらしいモンスターは、この中から出す） */
  skills: Skill[];
  /** この街のボス（いなければ null） */
  boss: { id: string; name: string } | null;
};

export function summarizeTown(
  questions: { id: string; skill: Skill }[],
  progress: Map<string, Pick<QuestionProgress, 'correctCount' | 'nextReviewOn' | 'stage'>>,
  today: string = localDate(),
): TownStatus {
  let correctOnce = 0;
  const dueBySkill: Partial<Record<Skill, number>> = {};
  for (const q of questions) {
    const p = progress.get(q.id);
    if (!p) continue;
    if (p.correctCount > 0) correctOnce++;
    if (isDue(p, today)) dueBySkill[q.skill] = (dueBySkill[q.skill] ?? 0) + 1;
  }
  const total = questions.length;
  const needed = Math.ceil(total * BOSS_RECOMMEND_RATIO);
  const skills = [...new Set(questions.map((q) => q.skill))];
  return { total, correctOnce, needed, bossReady: total > 0 && correctOnce >= needed, dueBySkill, skills, boss: null };
}

export async function loadTownStatus(townId: string): Promise<TownStatus> {
  const [questions, monsters] = await Promise.all([fetchTownQuestionIndex(townId), fetchMonstersOfTown(townId)]);
  const progress = await fetchProgress(questions.map((q) => q.id));
  const boss = monsters.find((m) => m.is_boss);
  return { ...summarizeTown(questions, progress), boss: boss ? { id: boss.id, name: boss.name } : null };
}
