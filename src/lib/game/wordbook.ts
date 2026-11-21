/**
 * 単語の書庫（2026-11-21）。スキルダンジョンの中の、単語だけをたくさん練習する部屋。
 *
 * - 単語は、ふつうの語彙の問題（questions）として取り込む。印として tags に "wordbook" をつける
 *   （scripts/build_wordbook.mjs が、単語の一覧から4択の問題を作る）。
 * - 書庫のモンスターは、モンスターのファイルに ID の最後を "-wordbook" にして書く（skill は vocabulary）。
 * - 書庫の単語は、書庫のモンスターとの戦闘でだけ出す。街の外のモンスター・ボス・復活モンスター・
 *   ボスの目安（問題の8割）には入れない。
 * - 単語は数が多いので、正解の経験値は少なめ（rules.ts の EXP_WORDBOOK）。
 */
export const WORDBOOK_TAG = 'wordbook';

export function isWordbookMonster(monster: { id: string }): boolean {
  return monster.id.endsWith('-wordbook');
}

export function isWordbookQuestion(question: { tags?: string[] | null }): boolean {
  return Boolean(question.tags?.includes(WORDBOOK_TAG));
}
