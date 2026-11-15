/**
 * 問題ファイル（data/town01_questions.json の形）を読み、取り込める形に直す。
 * データベースには触らない。おかしいところは、問題ごとに日本語で返す。
 */
import { SKILLS, type Skill } from './skills';

export const FORMATS = ['choice4', 'translate', 'respond'] as const;
export type QuestionFormat = (typeof FORMATS)[number];

/** 文中で本人の名前に置き換える印 */
export const NAME_PLACEHOLDERS = ['name_ja', 'given_ja', 'name_en', 'given_en'] as const;

export type TownRow = {
  id: string;
  scene: string;
  difficulty: number;
  sort_order: number;
};

/** questions テーブルの1行（要修正の印は取り込みで変えないので含めない） */
export type QuestionRow = {
  id: string;
  town_id: string;
  skill: Skill;
  format: QuestionFormat;
  prompt: string;
  sentence: string | null;
  sentence_ja: string | null;
  audio_text: string | null;
  choices: string[] | null;
  answer: number | null;
  model_answers: string[] | null;
  explanation: string | null;
  difficulty: number;
  tags: string[];
};

export type ParsedFile = {
  town: TownRow | null;
  questions: QuestionRow[];
  /** 取り込めない理由。1つでもあれば取り込まない */
  errors: string[];
};

const DIFFICULTY_WORDS: Record<string, number> = { 基本: 1, 標準: 2, 目標: 3 };

export function parseQuestionFile(text: string): ParsedFile {
  const errors: string[] = [];
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (err) {
    return { town: null, questions: [], errors: [`JSONとして読めません（${(err as Error).message}）`] };
  }
  if (!isObject(data)) {
    return { town: null, questions: [], errors: ['ファイルの中身が {…} の形ではありません'] };
  }
  if (data.format_version !== 1) {
    errors.push(`format_version が 1 ではありません（${JSON.stringify(data.format_version)}）`);
  }

  const town = parseTown(data.town, errors);

  if (!Array.isArray(data.questions) || data.questions.length === 0) {
    errors.push('questions に問題が入っていません');
    return { town, questions: [], errors };
  }

  const questions: QuestionRow[] = [];
  const seen = new Set<string>();
  data.questions.forEach((raw: unknown, index: number) => {
    const label = isObject(raw) && typeof raw.id === 'string' ? raw.id : `${index + 1}問目`;
    const problems: string[] = [];
    const row = parseQuestion(raw, town?.id ?? null, problems);
    if (row) {
      if (seen.has(row.id)) problems.push('同じIDの問題がほかにもあります');
      seen.add(row.id);
    }
    if (problems.length > 0) {
      errors.push(...problems.map((p) => `${label}：${p}`));
    } else if (row) {
      questions.push(row);
    }
  });

  return { town, questions, errors };
}

function parseTown(raw: unknown, errors: string[]): TownRow | null {
  if (!isObject(raw)) {
    errors.push('town（街の情報）がありません');
    return null;
  }
  const id = raw.id;
  const scene = raw.scene;
  const order = raw.order;
  const difficulty =
    typeof raw.difficulty === 'number' ? raw.difficulty : DIFFICULTY_WORDS[String(raw.difficulty)];
  const before = errors.length;
  if (!isId(id)) errors.push('town.id がありません（例：town01）');
  if (!nonEmpty(scene)) errors.push('town.scene（会話の場面）がありません');
  if (!Number.isInteger(order) || (order as number) < 1) errors.push('town.order（順番）が1以上の整数ではありません');
  if (!difficulty || difficulty < 1 || difficulty > 3) {
    errors.push(`town.difficulty は「基本」「標準」「目標」か 1〜3 にしてください（${JSON.stringify(raw.difficulty)}）`);
  }
  if (errors.length > before) return null;
  return { id: id as string, scene: (scene as string).trim(), difficulty: difficulty!, sort_order: order as number };
}

function parseQuestion(raw: unknown, townId: string | null, problems: string[]): QuestionRow | null {
  if (!isObject(raw)) {
    problems.push('問題が {…} の形ではありません');
    return null;
  }
  const id = raw.id;
  if (!isId(id)) problems.push('id がないか、使えない文字が入っています（英数字・ハイフン・下線のみ）');
  if (townId && raw.town !== townId) problems.push(`town が「${townId}」ではありません（${JSON.stringify(raw.town)}）`);

  const skill = raw.skill as Skill;
  if (!SKILLS.includes(skill)) problems.push(`skill が正しくありません（${JSON.stringify(raw.skill)}）`);
  const format = raw.format as QuestionFormat;
  if (!FORMATS.includes(format)) problems.push(`format が正しくありません（${JSON.stringify(raw.format)}）`);
  if (!nonEmpty(raw.prompt)) problems.push('prompt（指示文）がありません');

  const sentence = optionalText(raw.sentence, 'sentence', problems);
  const sentenceJa = optionalText(raw.sentence_ja, 'sentence_ja', problems);
  const audioText = optionalText(raw.audio_text, 'audio_text', problems);
  const explanation = optionalText(raw.explanation, 'explanation', problems);

  let choices: string[] | null = null;
  let answer: number | null = null;
  let modelAnswers: string[] | null = null;

  if (format === 'choice4') {
    if (!isStringArray(raw.choices) || raw.choices.length !== 4) {
      problems.push('4択なのに choices が4つの文字ではありません');
    } else if (raw.choices.some((c) => !c.trim())) {
      problems.push('choices に空の選択肢があります');
    } else if (new Set(raw.choices.map((c) => c.trim())).size !== 4) {
      problems.push('choices に同じ選択肢が2つあります');
    } else {
      choices = raw.choices.map((c) => c.trim());
    }
    if (!Number.isInteger(raw.answer) || (raw.answer as number) < 0 || (raw.answer as number) > 3) {
      problems.push(`answer（正解の位置）は 0〜3 にしてください（${JSON.stringify(raw.answer)}）`);
    } else {
      answer = raw.answer as number;
    }
    if (skill === 'listening' && !audioText) problems.push('リスニングなのに audio_text（読み上げる英文）がありません');
    if (skill !== 'listening' && !sentence) problems.push('sentence（出題する文）がありません');
  } else if (format === 'translate' || format === 'respond') {
    if (!isStringArray(raw.model_answers) || raw.model_answers.length === 0) {
      problems.push('model_answers（模範解答）が1つ以上の文字の並びではありません');
    } else if (raw.model_answers.some((m) => !m.trim())) {
      problems.push('model_answers に空の模範解答があります');
    } else if (new Set(raw.model_answers.map((m) => m.trim())).size !== raw.model_answers.length) {
      problems.push('model_answers に同じ文が2つあります');
    } else {
      modelAnswers = raw.model_answers.map((m) => m.trim());
    }
    if (!sentence) problems.push('sentence（出題する文）がありません');
    if (format === 'respond' && !sentenceJa) problems.push('respond なのに sentence_ja（質問の日本語訳）がありません');
  }

  const difficulty = raw.difficulty ?? 1;
  if (!Number.isInteger(difficulty) || (difficulty as number) < 1 || (difficulty as number) > 3) {
    problems.push(`difficulty は 1〜3 にしてください（${JSON.stringify(raw.difficulty)}）`);
  }

  let tags: string[] = [];
  if (raw.tags !== undefined) {
    if (!isStringArray(raw.tags)) problems.push('tags が文字の並びではありません');
    else tags = raw.tags.map((t) => t.trim()).filter(Boolean);
  }

  const texts = [raw.prompt, sentence, sentenceJa, audioText, explanation, ...(choices ?? []), ...(modelAnswers ?? [])];
  for (const t of texts) {
    if (typeof t !== 'string') continue;
    for (const m of t.matchAll(/\{\{\s*([^}]*?)\s*\}\}/g)) {
      if (!(NAME_PLACEHOLDERS as readonly string[]).includes(m[1])) {
        problems.push(`{{${m[1]}}} は使えない印です（使えるのは ${NAME_PLACEHOLDERS.map((p) => `{{${p}}}`).join(' ')}）`);
      }
    }
  }

  if (problems.length > 0) return null;
  return {
    id: id as string,
    town_id: raw.town as string,
    skill,
    format,
    prompt: (raw.prompt as string).trim(),
    sentence,
    sentence_ja: sentenceJa,
    audio_text: audioText,
    choices,
    answer,
    model_answers: modelAnswers,
    explanation,
    difficulty: difficulty as number,
    tags,
  };
}

/** 2つの行の中身が同じか（取り込みで「変更なし」を見分ける） */
export function sameQuestion(a: QuestionRow, b: QuestionRow): boolean {
  const keys: (keyof QuestionRow)[] = [
    'town_id', 'skill', 'format', 'prompt', 'sentence', 'sentence_ja', 'audio_text',
    'choices', 'answer', 'model_answers', 'explanation', 'difficulty', 'tags',
  ];
  return keys.every((k) => JSON.stringify(a[k] ?? null) === JSON.stringify(b[k] ?? null));
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === 'string');
}

function nonEmpty(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function isId(v: unknown): v is string {
  return typeof v === 'string' && /^[A-Za-z0-9_-]{1,100}$/.test(v);
}

function optionalText(v: unknown, name: string, problems: string[]): string | null {
  if (v === undefined || v === null) return null;
  if (typeof v !== 'string') {
    problems.push(`${name} が文字ではありません`);
    return null;
  }
  return v.trim() || null;
}
