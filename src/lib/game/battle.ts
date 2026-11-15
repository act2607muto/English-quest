/**
 * 戦闘で使う計算（出題の選び方、選択肢の並べ替え、名前の置き換え）。画面やデータベースには触らない。
 */
import type { QuestionRow } from '../questionFile';
import type { Skill } from '../skills';
import { isDue, localDate, type ReviewState } from './growth';

/** 今戦える能力値（スピーキングは録音と文字起こしができたら足す） */
export const PLAYABLE_SKILLS: readonly Skill[] = ['vocabulary', 'grammar', 'listening', 'writing'];

export type Rng = () => number;

export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 出題する問題を選ぶ。
 * 1. 復習の時期が来た問題（復習日の古い順）
 * 2. まだ答えたことのない問題
 * 3. 残り（次の復習日が近い順）
 * 足りなければ、最初から繰り返す。
 */
export function pickQuestions(
  questions: QuestionRow[],
  progress: Map<string, ReviewState>,
  count: number,
  today: string = localDate(),
  rng: Rng = Math.random,
): QuestionRow[] {
  if (questions.length === 0) return [];
  const due: QuestionRow[] = [];
  const fresh: QuestionRow[] = [];
  const rest: QuestionRow[] = [];
  for (const q of questions) {
    const p = progress.get(q.id) ?? null;
    if (!p) fresh.push(q);
    else if (isDue(p, today)) due.push(q);
    else rest.push(q);
  }
  const byNextReview = (a: QuestionRow, b: QuestionRow) =>
    (progress.get(a.id)?.nextReviewOn ?? '').localeCompare(progress.get(b.id)?.nextReviewOn ?? '');
  const ordered = [
    ...shuffle(due, rng).sort(byNextReview),
    ...shuffle(fresh, rng),
    ...shuffle(rest, rng).sort(byNextReview),
  ];
  const out: QuestionRow[] = [];
  while (out.length < count) out.push(...ordered.slice(0, count - out.length));
  return out;
}

/** 選択肢を毎回並べ替える。ファイル上の正解の位置の偏りが出題に出ないように */
export function shuffleChoices(q: QuestionRow, rng: Rng = Math.random): { choices: string[]; answerIndex: number } {
  const choices = q.choices ?? [];
  const order = shuffle(
    choices.map((_, i) => i),
    rng,
  );
  return { choices: order.map((i) => choices[i]), answerIndex: order.indexOf(q.answer ?? 0) };
}

export type PlayerNames = { nameJa: string; givenJa: string; nameEn: string; givenEn: string };

/** 名前が未設定の間に使う名前 */
export const DEFAULT_NAMES: PlayerNames = { nameJa: '田中ユキ', givenJa: 'ユキ', nameEn: 'Yuki Tanaka', givenEn: 'Yuki' };

/** 文中の {{name_ja}} などを本人の名前に置き換える */
export function fillNames(text: string, names: PlayerNames = DEFAULT_NAMES): string {
  const map: Record<string, string> = {
    name_ja: names.nameJa,
    given_ja: names.givenJa,
    name_en: names.nameEn,
    given_en: names.givenEn,
  };
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (all, key: string) => map[key] ?? all);
}
