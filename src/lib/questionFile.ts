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

/** monsters テーブルの1行 */
export type MonsterRow = {
  id: string;
  name: string;
  town_id: string;
  skill: Skill | null;
  hp: number;
  gold: number;
  is_boss: boolean;
  image: string | null;
};

/**
 * 装備品の効果。英語の正誤を変える効果（ヒント、選択肢を減らす等）は作らない。
 *   exp_bonus   : その能力値の獲得経験値が rate 倍だけ増える（0.1 で 10%）
 *   max_hp      : 自分のHPが amount 増える
 *   decay_grace : 能力値が下がり始めるまでの猶予が days 日延びる
 */
export type EquipmentEffect =
  | { type: 'exp_bonus'; skill: Skill; rate: number }
  | { type: 'max_hp'; amount: number }
  | { type: 'decay_grace'; days: number };

/** equipment テーブルの1行 */
export type EquipmentRow = {
  id: string;
  name: string;
  slot: 'weapon' | 'armor';
  effect: EquipmentEffect;
  price: number;
  town_id: string;
  image: string | null;
};

export type ParsedFile = {
  town: TownRow | null;
  questions: QuestionRow[];
  monsters: MonsterRow[];
  equipment: EquipmentRow[];
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
    return { ...EMPTY, errors: [`JSONとして読めません（${(err as Error).message}）`] };
  }
  if (!isObject(data)) {
    return { ...EMPTY, errors: ['ファイルの中身が {…} の形ではありません'] };
  }
  if (data.format_version !== 1) {
    errors.push(`format_version が 1 ではありません（${JSON.stringify(data.format_version)}）`);
  }

  const town = parseTown(data.town, errors);

  const hasQuestions = Array.isArray(data.questions) && data.questions.length > 0;
  const hasMonsters = Array.isArray(data.monsters) && data.monsters.length > 0;
  const hasEquipment = Array.isArray(data.equipment) && data.equipment.length > 0;
  if (!hasQuestions && !hasMonsters && !hasEquipment) {
    errors.push('questions（問題）・monsters（モンスター）・equipment（装備品）のどれかが必要です');
    return { ...EMPTY, town, errors };
  }
  if (data.questions !== undefined && !Array.isArray(data.questions)) errors.push('questions が [ … ] の形ではありません');
  if (data.monsters !== undefined && !Array.isArray(data.monsters)) errors.push('monsters が [ … ] の形ではありません');
  if (data.equipment !== undefined && !Array.isArray(data.equipment)) errors.push('equipment が [ … ] の形ではありません');

  const equipment: EquipmentRow[] = [];
  const seenEquipment = new Set<string>();
  (hasEquipment ? (data.equipment as unknown[]) : []).forEach((raw, index) => {
    const label = isObject(raw) && typeof raw.id === 'string' ? raw.id : `${index + 1}個目`;
    const problems: string[] = [];
    const row = parseEquipment(raw, town?.id ?? null, problems);
    if (row) {
      if (seenEquipment.has(row.id)) problems.push('同じIDの装備品がほかにもあります');
      seenEquipment.add(row.id);
    }
    if (problems.length > 0) errors.push(...problems.map((p) => `${label}：${p}`));
    else if (row) equipment.push(row);
  });

  const monsters: MonsterRow[] = [];
  const seenMonsters = new Set<string>();
  (hasMonsters ? (data.monsters as unknown[]) : []).forEach((raw, index) => {
    const label = isObject(raw) && typeof raw.id === 'string' ? raw.id : `${index + 1}体目`;
    const problems: string[] = [];
    const row = parseMonster(raw, town?.id ?? null, problems);
    if (row) {
      if (seenMonsters.has(row.id)) problems.push('同じIDのモンスターがほかにもいます');
      seenMonsters.add(row.id);
    }
    if (problems.length > 0) errors.push(...problems.map((p) => `${label}：${p}`));
    else if (row) monsters.push(row);
  });

  const questions: QuestionRow[] = [];
  const seen = new Set<string>();
  (hasQuestions ? (data.questions as unknown[]) : []).forEach((raw: unknown, index: number) => {
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

  return { town, questions, monsters, equipment, errors };
}

const EMPTY: ParsedFile = { town: null, questions: [], monsters: [], equipment: [], errors: [] };

function parseEquipment(raw: unknown, townId: string | null, problems: string[]): EquipmentRow | null {
  if (!isObject(raw)) {
    problems.push('装備品が {…} の形ではありません');
    return null;
  }
  if (!isId(raw.id)) problems.push('id がないか、使えない文字が入っています（英数字・ハイフン・下線のみ）');
  if (!nonEmpty(raw.name)) problems.push('name（名前）がありません');
  if (townId && raw.town !== undefined && raw.town !== townId) {
    problems.push(`town が「${townId}」ではありません（${JSON.stringify(raw.town)}）`);
  }
  const slot = raw.slot;
  if (slot !== 'weapon' && slot !== 'armor') problems.push(`slot は weapon（武器）か armor（防具）にしてください（${JSON.stringify(slot)}）`);
  if (!Number.isInteger(raw.price) || (raw.price as number) < 0) problems.push(`price は0以上の整数にしてください（${JSON.stringify(raw.price)}）`);
  const effect = parseEffect(raw.effect, problems);
  if (effect && slot === 'weapon' && effect.type !== 'exp_bonus') problems.push('武器の効果は exp_bonus（経験値の上乗せ）にしてください');
  if (effect && slot === 'armor' && effect.type === 'exp_bonus') problems.push('防具の効果は max_hp か decay_grace にしてください');
  const image = optionalText(raw.image, 'image', problems);
  if (problems.length > 0 || !townId || !effect) return null;
  return {
    id: raw.id as string,
    name: (raw.name as string).trim(),
    slot: slot as 'weapon' | 'armor',
    effect,
    price: raw.price as number,
    town_id: townId,
    image,
  };
}

function parseEffect(raw: unknown, problems: string[]): EquipmentEffect | null {
  if (!isObject(raw)) {
    problems.push('effect（効果）がありません');
    return null;
  }
  switch (raw.type) {
    case 'exp_bonus': {
      const skill = raw.skill as Skill;
      if (!SKILLS.includes(skill)) problems.push(`effect.skill が正しくありません（${JSON.stringify(raw.skill)}）`);
      if (typeof raw.rate !== 'number' || raw.rate <= 0 || raw.rate > 1) {
        problems.push(`effect.rate は 0 より大きく 1 以下にしてください（0.1 で 10%）（${JSON.stringify(raw.rate)}）`);
      }
      return problems.length > 0 ? null : { type: 'exp_bonus', skill, rate: raw.rate as number };
    }
    case 'max_hp':
      if (!Number.isInteger(raw.amount) || (raw.amount as number) < 1) {
        problems.push(`effect.amount は1以上の整数にしてください（${JSON.stringify(raw.amount)}）`);
        return null;
      }
      return { type: 'max_hp', amount: raw.amount as number };
    case 'decay_grace':
      if (!Number.isInteger(raw.days) || (raw.days as number) < 1) {
        problems.push(`effect.days は1以上の整数にしてください（${JSON.stringify(raw.days)}）`);
        return null;
      }
      return { type: 'decay_grace', days: raw.days as number };
    default:
      problems.push(`effect.type は exp_bonus・max_hp・decay_grace のどれかにしてください（${JSON.stringify(raw.type)}）`);
      return null;
  }
}

export function sameEquipment(a: EquipmentRow, b: EquipmentRow): boolean {
  return (
    a.name === b.name &&
    a.slot === b.slot &&
    a.price === b.price &&
    a.town_id === b.town_id &&
    (a.image ?? null) === (b.image ?? null) &&
    JSON.stringify(sortKeys(a.effect)) === JSON.stringify(sortKeys(b.effect))
  );
}

function sortKeys(o: object): object {
  return Object.fromEntries(Object.entries(o).sort(([x], [y]) => x.localeCompare(y)));
}

function parseMonster(raw: unknown, townId: string | null, problems: string[]): MonsterRow | null {
  if (!isObject(raw)) {
    problems.push('モンスターが {…} の形ではありません');
    return null;
  }
  if (!isId(raw.id)) problems.push('id がないか、使えない文字が入っています（英数字・ハイフン・下線のみ）');
  if (!nonEmpty(raw.name)) problems.push('name（名前）がありません');
  if (townId && raw.town !== undefined && raw.town !== townId) {
    problems.push(`town が「${townId}」ではありません（${JSON.stringify(raw.town)}）`);
  }
  const isBoss = raw.is_boss === true;
  if (raw.is_boss !== undefined && typeof raw.is_boss !== 'boolean') problems.push('is_boss は true か false にしてください');
  const skill = raw.skill === undefined || raw.skill === null ? null : (raw.skill as Skill);
  if (skill !== null && !SKILLS.includes(skill)) problems.push(`skill が正しくありません（${JSON.stringify(raw.skill)}）`);
  if (!isBoss && skill === null) problems.push('ボスでないモンスターには skill が必要です');
  if (!Number.isInteger(raw.hp) || (raw.hp as number) < 1) problems.push(`hp は1以上の整数にしてください（${JSON.stringify(raw.hp)}）`);
  const gold = raw.gold ?? 0;
  if (!Number.isInteger(gold) || (gold as number) < 0) problems.push(`gold は0以上の整数にしてください（${JSON.stringify(raw.gold)}）`);
  const image = optionalText(raw.image, 'image', problems);
  if (problems.length > 0 || !townId) return null;
  return {
    id: raw.id as string,
    name: (raw.name as string).trim(),
    town_id: townId,
    skill,
    hp: raw.hp as number,
    gold: gold as number,
    is_boss: isBoss,
    image,
  };
}

export function sameMonster(a: MonsterRow, b: MonsterRow): boolean {
  const keys: (keyof MonsterRow)[] = ['name', 'town_id', 'skill', 'hp', 'gold', 'is_boss', 'image'];
  return keys.every((k) => (a[k] ?? null) === (b[k] ?? null));
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
