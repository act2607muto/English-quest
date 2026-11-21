/**
 * 単語の書庫の問題ファイルを作る（2026-11-21）。
 *
 *   node scripts/build_wordbook.mjs town01 data/town01_wordbook.json
 *
 * scripts/wordbook/{街のID}.mjs の単語の一覧（英語・品詞・日本語の意味・例文）から、
 * 「「英語」の意味は？」の4択の問題を1語に1問ずつ作る。まちがいの選択肢は、同じ品詞のほかの単語の意味から選ぶ。
 * 意味が重なるもの（「見る」と「見る・見える」など）は、まちがいの選択肢にしない。
 * 書庫のモンスター（ID の最後が -wordbook）も同じファイルに入れる。取り込みは「教材の取り込み」から。
 *
 * 単語の一覧は、よく使われる英語の単語から作ったオリジナル（市販の単語帳の並びや例文は写していない）。
 * 選択肢の並びは単語の ID だけで決まるので、意味の文字を直しても並びは変わらない。
 */
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const [townId, outPath] = process.argv.slice(2);
if (!townId || !outPath) throw new Error('使い方：node scripts/build_wordbook.mjs town01 data/town01_wordbook.json');
const source = await import(pathToFileURL(resolve('scripts/wordbook', `${townId}.mjs`)).href);
const { TOWN, MONSTER, EXPECTED_COUNT, LEVEL } = source;

/** 1行「英語|品詞|意味|例文」を読む。品詞は n（名詞）v（動詞）a（形容詞）o（そのほか） */
const words = source.WORDS.split('\n')
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'))
  .map((line, i) => {
    const [word, pos, meaning, example] = line.split('|').map((s) => s?.trim());
    if (!word || !pos || !meaning || !example) throw new Error(`${i + 1}行目の形が正しくありません：${line}`);
    if (!['n', 'v', 'a', 'o'].includes(pos)) throw new Error(`${word} の品詞が n・v・a・o ではありません`);
    return { word, pos, meaning, example };
  });

// 確かめ：同じ単語が2回ないか、数が合っているか
const seen = new Set();
for (const w of words) {
  const key = w.word.toLowerCase();
  if (seen.has(key)) throw new Error(`同じ単語が2回あります：${w.word}`);
  seen.add(key);
}
if (EXPECTED_COUNT && words.length !== EXPECTED_COUNT) {
  throw new Error(`単語の数が ${EXPECTED_COUNT} ではありません（${words.length}）`);
}

/** 意味の部分（「見る・見える」なら「見る」「見える」。かっこの中は除く） */
const parts = (meaning) =>
  meaning
    .replace(/（[^）]*）/g, '')
    .split('・')
    .map((s) => s.trim())
    .filter(Boolean);
/** 2つの意味が重なるか（どちらかの部分が、もう一方の部分にふくまれる） */
const overlaps = (a, b) => parts(a).some((x) => parts(b).some((y) => x.includes(y) || y.includes(x)));

function seeded(text) {
  let h = 2166136261;
  for (const ch of text) h = Math.imul(h ^ ch.codePointAt(0), 16777619) >>> 0;
  return () => {
    h = (h + 0x6d2b79f5) >>> 0;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle(items, rng) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const questions = words.map((w, i) => {
  const id = `${townId}-wb-${String(i + 1).padStart(3, '0')}`;
  const rng = seeded(id);
  const pick = (pool) => shuffle(pool, rng).filter((x) => x.word !== w.word && !overlaps(x.meaning, w.meaning));
  let pool = pick(words.filter((x) => x.pos === w.pos));
  if (pool.length < 3) pool = pick(words);
  const wrong = [];
  for (const x of pool) {
    if (wrong.length === 3) break;
    if (wrong.some((m) => overlaps(m, x.meaning))) continue;
    wrong.push(x.meaning);
  }
  if (wrong.length < 3) throw new Error(`${w.word} のまちがいの選択肢が足りません`);
  const choices = shuffle([w.meaning, ...wrong], rng);
  return {
    id,
    town: townId,
    skill: 'vocabulary',
    format: 'choice4',
    prompt: `「${w.word}」の意味は？`,
    sentence: w.example,
    choices,
    answer: choices.indexOf(w.meaning),
    explanation: `${w.word} = ${w.meaning}　例：${w.example}`,
    difficulty: LEVEL,
    tags: ['wordbook', w.pos],
    needs_fix: false,
  };
});

const pos = [0, 0, 0, 0];
questions.forEach((q) => pos[q.answer]++);
writeFileSync(
  outPath,
  JSON.stringify({ format_version: 1, town: TOWN, monsters: [MONSTER], questions }, null, 2) + '\n',
  'utf8',
);
const byPos = words.reduce((m, w) => ((m[w.pos] = (m[w.pos] ?? 0) + 1), m), {});
console.log(`単語：${words.length}語`, byPos);
console.log('正解の位置（1番目〜4番目）:', pos);
