/**
 * 書き取り（format "dictation"。4つ目の街から。2026-11-21）：読み上げた英文を聞いて、そのまま書く。
 *
 * 問題ファイルの書き方：
 *   audio_text    … 読み上げる英文（画面には出さない）
 *   model_answers … 正解とする英文（1つ目は audio_text と同じ。数字を文字でも書けるときなどは足す）
 *
 * 答え合わせはアプリの中でする（AI採点はしない）。大文字・小文字、. , ! ? と、
 * よく使う短縮形（I'm と I am など）のちがいは無視する。
 * 1語だけちがう（4語以上の文で、つづりのまちがいや抜け・足しが1つ）ときは「惜しい」にする。
 */

/** 短縮形をもとの形にそろえる（I'm → i am）。どちらで書いても同じとみなすため */
const CONTRACTIONS: [RegExp, string][] = [
  [/\bi'm\b/g, 'i am'],
  [/\b(you|we|they)'re\b/g, '$1 are'],
  [/\b(he|she|it|that|there|what|where|who)'s\b/g, '$1 is'],
  [/\b(i|you|we|they|he|she|it|that)'ll\b/g, '$1 will'],
  [/\b(i|you|we|they)'ve\b/g, '$1 have'],
  [/\b(i|you|we|they|he|she)'d\b/g, '$1 would'],
  [/\bcan't\b/g, 'cannot'],
  [/\bwon't\b/g, 'will not'],
  [/\b(do|does|did|is|are|was|were|has|have|had|could|would|should)n't\b/g, '$1 not'],
  [/\bcan not\b/g, 'cannot'],
  // スマホで ' を打ち忘れた短縮形も同じとみなす（ほかの単語と区別がつくものだけ。its・were・ill などは別の単語なので入れない）
  [/\bim\b/g, 'i am'],
  [/\b(you|they)re\b/g, '$1 are'],
  [/\b(that|what|there)s\b/g, '$1 is'],
  [/\b(i|you|we|they)ve\b/g, '$1 have'],
  [/\bcant\b/g, 'cannot'],
  [/\b(do|does|did|is|are|was|were|has|have|had|could|would|should)nt\b/g, '$1 not'],
];

/** 比べるための単語の並び */
export function dictationWords(text: string): string[] {
  let t = text.toLowerCase().replace(/[‘’`]/g, "'");
  for (const [re, to] of CONTRACTIONS) t = t.replace(re, to);
  return t
    .replace(/[.,!?;:"“”()]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/** 単語の並びの編集距離（入れかえ・抜け・足しの数） */
function wordDistance(a: string[], b: string[]): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[a.length][b.length];
}

export type DictationRating = 'good' | 'close' | 'bad';

/** 書いた答えの採点：同じなら good、4語以上の文で1語だけちがえば close、ほかは bad */
export function gradeDictation(answer: string, models: string[]): DictationRating {
  const mine = dictationWords(answer);
  if (mine.length === 0) return 'bad';
  let best = Infinity;
  let bestLength = 0;
  for (const m of models) {
    const words = dictationWords(m);
    const d = wordDistance(mine, words);
    if (d < best) {
      best = d;
      bestLength = words.length;
    }
  }
  if (best === 0) return 'good';
  if (best === 1 && bestLength >= 4) return 'close';
  // it's を its と書いた（' の打ち忘れ。its は別の単語なので正解にはしない）だけなら「惜しい」
  const fixed = dictationWords(answer.replace(/\bits\b/gi, "it's"));
  if (models.some((m) => wordDistance(fixed, dictationWords(m)) === 0)) return 'close';
  return 'bad';
}

/**
 * 正しい英文の単語ごとに、書いた答えに合っていたかの印（答えたあとに、まちがえた単語を色で示すため）。
 * 正しい英文はそのままの形（大文字や記号つき）で返す。
 */
export function markDictation(answer: string, model: string): { word: string; ok: boolean }[] {
  const mine = dictationWords(answer);
  const shown = model.split(/\s+/).filter(Boolean);
  // 書いた答えの単語を、順番を保ちながら正しい英文の単語に当てはめる（いちばん長く一致する並び）
  const target = shown.map((w) => dictationWords(w).join(' '));
  const n = target.length;
  const m = mine.length;
  const lcs = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      // 短縮形（I'm）は2語（i am）になるので、続けて合っていれば一致とみなす
      const parts = target[i].split(' ');
      const match = parts.every((p, k) => mine[j + k] === p);
      lcs[i][j] = match ? 1 + (lcs[i + 1][j + parts.length] ?? 0) : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }
  const out: { word: string; ok: boolean }[] = [];
  let i = 0;
  let j = 0;
  while (i < n) {
    const parts = target[i].split(' ');
    const match = j < m && parts.every((p, k) => mine[j + k] === p);
    if (match && lcs[i][j] === 1 + (lcs[i + 1][j + parts.length] ?? 0)) {
      out.push({ word: shown[i], ok: true });
      i++;
      j += parts.length;
    } else if (j < m && lcs[i][j + 1] >= lcs[i + 1][j]) {
      j++;
    } else {
      out.push({ word: shown[i], ok: false });
      i++;
    }
  }
  return out;
}
