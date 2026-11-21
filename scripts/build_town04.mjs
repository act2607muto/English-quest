/**
 * 4つ目の街「予定・電話・雑談」の問題ファイルを作る。
 *
 * 使い方: node scripts/build_town04.mjs data/town04_questions.json [docs/review/town04.md]
 *   2つ目に場所を書くと、本人に見てもらうための一覧（Markdown）も作る。
 *
 * 高2・TOEIC 650〜720 くらい。6つの能力値を80問ずつ（480問）。問題の中身は scripts/town04/ に能力値ごとに分けて書く。
 * この街から書き取り（format dictation。リスニングの DICTATION）が加わる。
 * まだ書いていない能力値のファイルは飛ばす（そろうまでは取り込まない）。
 * 選択肢は「正解を先頭」に書き、ここで並びを混ぜて正解の位置を記録する。並びは問題IDだけで決まる。
 * 単語の並べかえ（format order）のカードは、正しい英文の1つ目から作る。
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const TOWN = 'town04';
const LEVEL = 3;
const PER_SKILL = 80;

async function load(name) {
  const path = new URL(`./town04/${name}.mjs`, import.meta.url);
  return existsSync(path) ? await import(path) : null;
}

function seeded(text) {
  let h = 2166136261;
  for (const ch of text) {
    h ^= ch.codePointAt(0);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    h >>>= 0;
    return h / 4294967296;
  };
}

function shuffled(qid, correct, wrong) {
  const rng = seeded(qid);
  const all = [correct, ...wrong];
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return { choices: all, answer: all.indexOf(correct) };
}

const id = (kind, n) => `${TOWN}-${kind}-${String(n).padStart(3, '0')}`;

/** 並べかえの比べ方（アプリの src/lib/game/wordOrder.ts と同じ） */
const normalize = (t) => t.toLowerCase().replace(/[.,!?]/g, '').replace(/\s+/g, ' ').trim();
const sameWords = (tiles, model) => {
  const a = tiles.map(normalize).sort();
  const b = normalize(model).split(' ').sort();
  return a.length === b.length && a.every((w, i) => w === b[i]);
};

/** 正しい英文からカードを作る：終わりの記号と , を除き、最初の単語は I のほかは小文字にする */
function tilesOf(model) {
  const words = model.trim().replace(/[.?!]$/, '').replace(/,/g, '').split(/\s+/);
  if (!/^I('|$)/.test(words[0])) words[0] = words[0].toLowerCase();
  return words;
}

async function build() {
  const out = [];
  const vocab = await load('vocabulary');
  vocab?.VOCAB.forEach(([sentence, word, correct, wrong, level], i) => {
    const qid = id('voc', i + 1);
    const { choices, answer } = shuffled(qid, correct, wrong);
    out.push({
      id: qid, town: TOWN, skill: 'vocabulary', format: 'choice4',
      prompt: word ? `「${sentence}」の ${word} の意味は？` : `「${sentence}」の意味は？`,
      sentence, choices, answer,
      explanation: word ? `${word} = ${correct}` : `${sentence} = ${correct}`,
      difficulty: level ?? LEVEL, needs_fix: false,
    });
  });
  const grammar = await load('grammar');
  grammar?.GRAMMAR.forEach(([sentence, correct, wrong, why, level], i) => {
    const qid = id('gra', i + 1);
    const { choices, answer } = shuffled(qid, correct, wrong);
    out.push({
      id: qid, town: TOWN, skill: 'grammar', format: 'choice4',
      prompt: '空欄に入る語句は？', sentence, choices, answer,
      explanation: why, difficulty: level ?? LEVEL, needs_fix: false,
    });
  });
  grammar?.ORDER.forEach(([ja, models, why], i) => {
    out.push({
      id: id('gra', (grammar.GRAMMAR.length ?? 0) + i + 1), town: TOWN, skill: 'grammar', format: 'order',
      prompt: '日本語に合うように、単語を並べかえよう', sentence_ja: ja,
      choices: tilesOf(models[0]), model_answers: models,
      explanation: why, difficulty: LEVEL, needs_fix: false,
    });
  });
  const listening = await load('listening');
  listening?.LISTENING.forEach(([audio, correct, wrong], i) => {
    const qid = id('lis', i + 1);
    const { choices, answer } = shuffled(qid, correct, wrong);
    out.push({
      id: qid, town: TOWN, skill: 'listening', format: 'choice4',
      prompt: '聞こえた英文の意味は？', audio_text: audio, choices, answer,
      explanation: `${audio} = ${correct}`, difficulty: LEVEL, needs_fix: false,
    });
  });
  // 会話のリスニング：audio_text を「A: 英文」の行で書く（話す人ごとに声を変えて読む）
  listening?.DIALOGUES.forEach(([audio, question, correct, wrong, why], i) => {
    const qid = id('lis', listening.LISTENING.length + i + 1);
    const { choices, answer } = shuffled(qid, correct, wrong);
    out.push({
      id: qid, town: TOWN, skill: 'listening', format: 'choice4',
      prompt: `会話を聞いて答えよう：${question}`, audio_text: audio, choices, answer,
      explanation: why, difficulty: LEVEL, needs_fix: false,
    });
  });
  // 書き取り：[読み上げる英文, ほかに正解とする英文のリスト（なければ省く）]
  listening?.DICTATION?.forEach(([audio, more], i) => {
    out.push({
      id: id('lis', listening.LISTENING.length + listening.DIALOGUES.length + i + 1), town: TOWN, skill: 'listening', format: 'dictation',
      prompt: '聞こえた英文を書こう', audio_text: audio, model_answers: [audio, ...(more ?? [])],
      explanation: `${audio}`, difficulty: LEVEL, needs_fix: false,
    });
  });
  const reading = await load('reading');
  let r = 0;
  for (const [passage, items] of reading?.READING ?? []) {
    for (const [question, correct, wrong, why, level] of items) {
      const qid = id('rea', ++r);
      const { choices, answer } = shuffled(qid, correct, wrong);
      out.push({
        id: qid, town: TOWN, skill: 'reading', format: 'choice4',
        prompt: question, sentence: passage, choices, answer,
        explanation: why, difficulty: level ?? LEVEL, needs_fix: false,
      });
    }
  }
  const writing = await load('writing');
  writing?.WRITING.forEach(([ja, models], i) => {
    out.push({
      id: id('wri', i + 1), town: TOWN, skill: 'writing', format: 'translate',
      prompt: '英語で書こう', sentence: ja, model_answers: models, difficulty: LEVEL, needs_fix: false,
    });
  });
  const speaking = await load('speaking');
  let n = 0;
  for (const [ja, models] of speaking?.SPEAK_SAY ?? []) {
    out.push({
      id: id('spe', ++n), town: TOWN, skill: 'speaking', format: 'translate',
      prompt: '英語で言おう', sentence: ja, model_answers: models, difficulty: LEVEL, needs_fix: false,
    });
  }
  for (const [en, ja, models] of speaking?.SPEAK_ANSWER ?? []) {
    out.push({
      id: id('spe', ++n), town: TOWN, skill: 'speaking', format: 'respond',
      prompt: '質問に英語で答えよう', sentence: en, sentence_ja: ja, model_answers: models,
      difficulty: LEVEL, needs_fix: false,
    });
  }
  return out;
}

/** 機械的に確かめられることを確かめる。おかしければ止める */
function check(questions) {
  const assert = (ok, msg) => {
    if (!ok) throw new Error(msg);
  };
  const ids = questions.map((q) => q.id);
  assert(ids.length === new Set(ids).size, 'IDが重複している');
  const perSkill = {};
  const pos = [0, 0, 0, 0];
  const seen = new Set();
  for (const q of questions) {
    perSkill[q.skill] = (perSkill[q.skill] ?? 0) + 1;
    if (q.format === 'choice4') {
      assert(q.choices.length === 4, q.id);
      assert(new Set(q.choices).size === 4, `選択肢が重複: ${q.id}`);
      assert(q.choices.every((c) => c.trim()), `空の選択肢: ${q.id}`);
      if (q.skill === 'grammar') assert(q.sentence.split('___').length === 2, `空欄が1つでない: ${q.id}`);
      pos[q.answer]++;
    } else if (q.format === 'dictation') {
      assert(q.model_answers[0] === q.audio_text && !q.audio_text.includes('\n'), `書き取りの形: ${q.id}`);
    } else if (q.format === 'order') {
      assert(q.choices.length >= 3 && q.choices.length <= 14, `カードの数: ${q.id}`);
      for (const m of q.model_answers) assert(sameWords(q.choices, m), `カードと英文の単語がちがう: ${q.id} ${m}`);
      assert(new Set(q.model_answers).size === q.model_answers.length, `正しい英文が重複: ${q.id}`);
    } else {
      assert(q.model_answers.length > 0 && q.model_answers.every((m) => m.trim()), q.id);
      assert(new Set(q.model_answers).size === q.model_answers.length, `模範解答が重複: ${q.id}`);
    }
    const key = `${q.skill}|${q.sentence ?? q.sentence_ja ?? q.audio_text}|${q.prompt}`;
    assert(!seen.has(key), `出題が重複: ${q.id}`);
    seen.add(key);
  }
  for (const [s, n] of Object.entries(perSkill)) assert(n === PER_SKILL, `${s} が${PER_SKILL}問ではない（${n}）`);
  return { perSkill, pos };
}

/** 本人に見てもらうための一覧（Markdown） */
function review(questions) {
  const cell = (t) => String(t ?? '').replace(/\|/g, '｜').replace(/\n/g, '<br>');
  const lines = ['# 4つ目の街（予定・電話・雑談）の問題（見てもらう用）', '', '◯ が正解です。気になる問題は、番号（例：voc-012）を教えてください。', ''];
  const sections = [
    ['vocabulary', '語彙'],
    ['grammar', '文法'],
    ['listening', 'リスニング'],
    ['reading', 'リーディング'],
    ['writing', 'ライティング'],
    ['speaking', 'スピーキング'],
  ];
  /** 4択の「問題」の欄：語彙は指示文、リスニングは読み上げる英文（会話は質問も）、リーディングは文章と質問 */
  const choiceText = (q) => {
    if (q.skill === 'vocabulary') return q.prompt;
    if (q.skill === 'listening') return q.prompt.startsWith('会話') ? `${q.audio_text}\n→ ${q.prompt.replace('会話を聞いて答えよう：', '')}` : q.audio_text;
    if (q.skill === 'reading') return `${q.sentence}\n→ ${q.prompt}`;
    return q.sentence;
  };
  for (const [skill, label] of sections) {
    const list = questions.filter((q) => q.skill === skill);
    if (list.length === 0) continue;
    lines.push(`## ${label}（${list.length}問）`, '');
    const choice = list.filter((q) => q.format === 'choice4');
    if (choice.length) {
      lines.push('| 番号 | 問題 | 選択肢 | 解説 |', '|---|---|---|---|');
      for (const q of choice) {
        const opts = q.choices.map((c, i) => (i === q.answer ? `**◯ ${c}**` : c)).join('<br>');
        lines.push(`| ${q.id.replace(`${TOWN}-`, '')} | ${cell(choiceText(q))} | ${cell(opts)} | ${cell(q.explanation)} |`);
      }
      lines.push('');
    }
    const dictation = list.filter((q) => q.format === 'dictation');
    if (dictation.length) {
      lines.push('### 書き取り', '', '| 番号 | 読み上げる英文 | ほかに正解とする英文 |', '|---|---|---|');
      for (const q of dictation) lines.push(`| ${q.id.replace(`${TOWN}-`, '')} | ${cell(q.audio_text)} | ${cell(q.model_answers.slice(1).join('\n'))} |`);
      lines.push('');
    }
    const graded = list.filter((q) => q.format === 'translate' || q.format === 'respond');
    if (graded.length) {
      lines.push('| 番号 | 問題 | 模範解答（一例。AIが採点する） |', '|---|---|---|');
      for (const q of graded) {
        const text = q.format === 'respond' ? `${q.sentence}\n（${q.sentence_ja}）` : q.sentence;
        lines.push(`| ${q.id.replace(`${TOWN}-`, '')} | ${cell(text)} | ${cell(q.model_answers.join('\n'))} |`);
      }
      lines.push('');
    }
    const order = list.filter((q) => q.format === 'order');
    if (order.length) {
      lines.push('### 単語の並べかえ', '', '| 番号 | 日本語 | カード（画面では混ぜて出す） | 正解（どれでも正解） |', '|---|---|---|---|');
      for (const q of order) {
        lines.push(`| ${q.id.replace(`${TOWN}-`, '')} | ${cell(q.sentence_ja)} | ${cell(q.choices.join(' / '))} | ${cell(q.model_answers.join('<br>'))} |`);
      }
      lines.push('');
    }
  }
  return lines.join('\n');
}

const questions = await build();
const { perSkill, pos } = check(questions);
const data = {
  format_version: 1,
  town: { id: TOWN, name: 'とけいだいの城下町', scene: '予定・電話・雑談', difficulty: '目標', order: 4 },
  questions,
};
const outPath = process.argv[2];
if (!outPath) throw new Error('出力先を指定してください（例：data/town04_questions.json）');
writeFileSync(outPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log('問題数:', questions.length, perSkill);
console.log('正解の位置（1番目〜4番目）:', pos);
const reviewPath = process.argv[3];
if (reviewPath) {
  mkdirSync(dirname(reviewPath), { recursive: true });
  writeFileSync(reviewPath, review(questions) + '\n', 'utf8');
  console.log('一覧:', reviewPath);
}
