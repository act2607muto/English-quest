/**
 * 単語の並べかえ（format "order"。3つ目の街から。2026-11-21）。
 *
 * 問題ファイルの書き方：
 *   sentence_ja   … 画面に出す日本語（この意味になるように並べる）
 *   choices       … 並べる単語のカード（文の終わりの . ? ! は入れない。文の最初の単語も、名前と I のほかは小文字で書く）
 *   model_answers … 正しい英文（並べ方が2通りあるときは2つ書く）。1つ目を「正解」として見せる
 *
 * 答え合わせは、大文字・小文字と . , ! ? を無視して、並べた文が model_answers のどれかと同じかを見る。
 * 英語の正誤は変えない（ヒントやカードを減らす仕組みは入れない）。
 */

/** 比べるための形：小文字にし、. , ! ? を消し、空白を1つにそろえる */
export function normalizeOrder(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 並べたカードが、正しい英文のどれかと同じか */
export function isOrderCorrect(picked: string[], models: string[]): boolean {
  const answer = normalizeOrder(picked.join(' '));
  return models.some((m) => normalizeOrder(m) === answer);
}

/** 文の終わりの記号（. ? !）。カードのあとに、決まった記号として出す */
export function endMarkOf(model: string): string {
  const m = model.trim().match(/[.?!]$/);
  return m ? m[0] : '';
}

/** カードの単語と、英文の単語が（順番を問わず）同じか。問題ファイルの確かめに使う */
export function sameWords(tiles: string[], model: string): boolean {
  const a = tiles.map(normalizeOrder).filter(Boolean).sort();
  const b = normalizeOrder(model).split(' ').filter(Boolean).sort();
  return a.length === b.length && a.every((w, i) => w === b[i]);
}
