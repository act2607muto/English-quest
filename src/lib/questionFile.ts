/**
 * 問題ファイル（data/town01_questions.json の形）を読み、取り込める形に直す。
 * データベースには触らない。おかしいところは、問題ごとに日本語で返す。
 */
import { dialogueLines } from './dialogue';
import { isSecondFormId } from './game/secondForm';
import { sameWords } from './game/wordOrder';
import { SKILLS, type Skill } from './skills';

/** order は単語の並べかえ（3つ目の街から。lib/game/wordOrder.ts）、dictation は書き取り（4つ目の街から。lib/game/dictation.ts） */
export const FORMATS = ['choice4', 'translate', 'respond', 'order', 'dictation'] as const;
/** 意見と理由を答える問題の印（respond の tags。5つ目の街から。AI採点で理由があるかも見て、答えは長めに書ける） */
export const OPINION_TAG = 'opinion';
/** AI採点の答えの長さの上限（意見の問題は2〜3文になるので長め）。Edge Function の grade と同じ値にする */
export const MAX_ANSWER_LENGTH = 300;
export const MAX_OPINION_LENGTH = 600;
export type QuestionFormat = (typeof FORMATS)[number];

/** 文中で本人の名前に置き換える印 */
export const NAME_PLACEHOLDERS = ['name_ja', 'given_ja', 'name_en', 'given_en'] as const;

export type TownRow = {
  id: string;
  /** 街の名前（例：はじまりの街）。ファイルに書いてあるときだけ入る */
  name?: string | null;
  scene: string;
  difficulty: number;
  sort_order: number;
  /** 街の背景の絵。ファイルに書いてあるときだけ入る（書いていないファイルを取り込んでも消さない） */
  background_image?: string | null;
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
  /** 勝ったときに足す経験値（出た能力値で分ける）。ふつうは 0 */
  exp_reward: number;
  /** めずらしいモンスター（街の外でだけ出会う）：出会いのうち、このモンスターになる割合。ほかは null */
  encounter_rate: number | null;
  /** 図鑑の説明文。なければ null */
  description: string | null;
};

/**
 * 装備品の効果。英語の正誤を変える効果（ヒント、選択肢を減らす等）は作らない。
 *   attack      : その能力値の問題に正解したときの攻撃力が amount 増える（武器）。skill が "all" なら、どの能力値の問題でも増える
 *   max_hp      : 自分のHPが amount 増える
 *   decay_grace : 能力値が下がり始めるまでの猶予が days 日延びる
 */
export type EquipmentEffect =
  | { type: 'attack'; skill: Skill | 'all'; amount: number }
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
  if (effect && slot === 'weapon' && effect.type !== 'attack') problems.push('武器の効果は attack（攻撃力の上乗せ）にしてください');
  if (effect && slot === 'armor' && effect.type === 'attack') problems.push('防具の効果は max_hp か decay_grace にしてください');
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
    case 'attack': {
      const skill = raw.skill as Skill | 'all';
      if (skill !== 'all' && !SKILLS.includes(skill)) problems.push(`effect.skill が正しくありません（${JSON.stringify(raw.skill)}）`);
      if (!Number.isInteger(raw.amount) || (raw.amount as number) < 1) {
        problems.push(`effect.amount は1以上の整数にしてください（${JSON.stringify(raw.amount)}）`);
      }
      return problems.length > 0 ? null : { type: 'attack', skill, amount: raw.amount as number };
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
      problems.push(`effect.type は attack・max_hp・decay_grace のどれかにしてください（${JSON.stringify(raw.type)}）`);
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
  const rate = raw.encounter_rate ?? null;
  if (rate !== null && (typeof rate !== 'number' || !(rate > 0 && rate <= 1))) {
    problems.push(`encounter_rate は 0 より大きく 1 以下の数にしてください（${JSON.stringify(raw.encounter_rate)}）`);
  }
  if (rate !== null && (isBoss || skill !== null)) {
    problems.push('encounter_rate は、skill のないめずらしいモンスター（ボスではない）だけに書けます');
  }
  // ボスの第二形態（ID の最後が -form2）は、skill も encounter_rate もなくてよい（lib/game/secondForm.ts）
  if (!isBoss && skill === null && rate === null && !isSecondFormId(raw.id)) {
    problems.push('ボスでないモンスターには skill が必要です（めずらしいモンスターなら encounter_rate を書いてください）');
  }
  const expReward = raw.exp_reward ?? 0;
  if (!Number.isInteger(expReward) || (expReward as number) < 0) {
    problems.push(`exp_reward は0以上の整数にしてください（${JSON.stringify(raw.exp_reward)}）`);
  }
  if (!Number.isInteger(raw.hp) || (raw.hp as number) < 1) problems.push(`hp は1以上の整数にしてください（${JSON.stringify(raw.hp)}）`);
  const gold = raw.gold ?? 0;
  if (!Number.isInteger(gold) || (gold as number) < 0) problems.push(`gold は0以上の整数にしてください（${JSON.stringify(raw.gold)}）`);
  const image = optionalText(raw.image, 'image', problems);
  const description = optionalText(raw.description, 'description', problems);
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
    exp_reward: expReward as number,
    encounter_rate: rate as number | null,
    description,
  };
}

export function sameMonster(a: MonsterRow, b: MonsterRow): boolean {
  const keys: (keyof MonsterRow)[] = [
    'name',
    'town_id',
    'skill',
    'hp',
    'gold',
    'is_boss',
    'image',
    'exp_reward',
    'encounter_rate',
    'description',
  ];
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
  if (raw.name !== undefined && raw.name !== null && typeof raw.name !== 'string') {
    errors.push('town.name（街の名前）は文字にしてください');
  }
  if (raw.background_image !== undefined && raw.background_image !== null && typeof raw.background_image !== 'string') {
    errors.push('town.background_image（背景の絵）は文字にしてください');
  }
  if (errors.length > before) return null;
  const row: TownRow = { id: id as string, scene: (scene as string).trim(), difficulty: difficulty!, sort_order: order as number };
  if (raw.name !== undefined) row.name = ((raw.name as string | null) ?? '').trim() || null;
  if (raw.background_image !== undefined) row.background_image = (raw.background_image as string | null) || null;
  return row;
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
    // 会話のリスニング：2行以上なら、どの行も「A: 英文」の形にする（話す人ごとに声を変えるため）
    if (audioText && audioText.includes('\n') && !dialogueLines(audioText)) {
      problems.push('audio_text が2行以上なのに、どの行も「A: 英文」の形になっていません（会話は1行に1人ずつ書く）');
    }
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
  } else if (format === 'order') {
    // 並べかえ：choices は並べる単語のカード、model_answers は正しい英文（カードと同じ単語でできていること）
    if (!isStringArray(raw.choices) || raw.choices.length < 2 || raw.choices.length > 14) {
      problems.push('並べかえなのに choices（並べる単語のカード）が2〜14個の文字ではありません');
    } else if (raw.choices.some((c) => !c.trim())) {
      problems.push('choices に空のカードがあります');
    } else {
      choices = raw.choices.map((c) => c.trim());
    }
    if (!isStringArray(raw.model_answers) || raw.model_answers.length === 0 || raw.model_answers.some((m) => !m.trim())) {
      problems.push('model_answers（正しい英文）が1つ以上の文字の並びではありません');
    } else {
      modelAnswers = raw.model_answers.map((m) => m.trim());
      if (choices) {
        const tiles = choices;
        const wrong = modelAnswers.filter((m) => !sameWords(tiles, m));
        if (wrong.length > 0) problems.push(`model_answers の英文が、choices のカードと同じ単語でできていません（${wrong.join(' / ')}）`);
      }
    }
    if (!sentenceJa) problems.push('並べかえなのに sentence_ja（画面に出す日本語）がありません');
  } else if (format === 'dictation') {
    // 書き取り：audio_text を読み上げ、model_answers（1つ目は audio_text と同じ英文）と比べる
    if (!audioText) problems.push('書き取りなのに audio_text（読み上げる英文）がありません');
    if (!isStringArray(raw.model_answers) || raw.model_answers.length === 0 || raw.model_answers.some((m) => !m.trim())) {
      problems.push('書き取りなのに model_answers（正解とする英文）が1つ以上の文字の並びではありません');
    } else {
      modelAnswers = raw.model_answers.map((m) => m.trim());
      if (audioText && modelAnswers[0] !== audioText) problems.push('書き取りの model_answers の1つ目は、audio_text と同じ英文にしてください');
    }
    if (audioText?.includes('\n')) problems.push('書き取りの audio_text は1行の英文にしてください（会話は書き取りにしない）');
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
  // 意見と理由を答える問題（5つ目の街。tags に opinion）：AI採点で「理由があるか」も見る。英語の質問に答える形（respond）だけ
  if (tags.includes(OPINION_TAG) && format !== 'respond') problems.push('tags の opinion（意見と理由）は respond の問題だけにつけてください');

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
