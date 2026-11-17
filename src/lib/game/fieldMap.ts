/**
 * 街の外のマップ（歩きまわってモンスターに出会う）。画面には触らない。
 *
 * マップは街ごとのファイル public/maps/{街のID}.json に置く。街を足すときは、ファイルを足すだけでよい。
 *   ground     : 地面。base（草など）と、2つの地形をつなぐ絵の組（sets：水と草、道と森の地面など）。
 *                地形の境目は角ごとに絵を選んでなめらかにつなぐ。前の形（terrains：base とつながる地形ごとの絵）も読める
 *   objects    : 木・岩・草むら・街などの、地面の上に置く絵（マスの下ぞろえ、左右まんなか）
 *   tiles      : 地形の文字ごとの決まり（地面、置く物、歩けるか、出会いやすさ、街の入口か）
 *   rows       : 地形を文字で並べたもの（1文字が1マス）
 *   areas      : 場所を文字で並べたもの（rows と同じ大きさ。「-」は出会わない）
 *   area_defs  : 場所の文字ごとの名前と、出てくる能力値の割合、戦闘の背景の絵（battle_background）
 *   start      : 街から出たときに立つマス
 * 出会いやすさ（encounter）は「1歩で出会う確率の逆数」。10 なら、だいたい10歩に1回。
 */
import type { Skill } from '../skills';
import { SKILLS } from '../skills';
import type { PlayerSkill } from './player';
import {
  ENCOUNTER_DECAY_BONUS,
  ENCOUNTER_MIN_STEPS,
  ENCOUNTER_REVIVAL_CHANCE,
  ENCOUNTER_WEAK_BONUS,
} from './rules';

export type TileDef = {
  /** 地面の種類（ground.base か、ground.sets に出てくる地形の名前） */
  ground: string;
  /** 上に置く物（objects の名前）。なければ null */
  object: string | null;
  walk: boolean;
  /** 1歩で出会う確率の逆数。なければ出会わない */
  encounter: number | null;
  /** 街の入口（踏むと街にもどる） */
  town: boolean;
  /** ボスのいる場所（踏むとボスの画面を開く） */
  boss: boolean;
};

export type AreaDef = {
  name: string;
  /** この場所で出会ったときの、戦闘の背景の絵（なければ null） */
  battleBackground: string | null;
  /** 能力値ごとの出やすさ（大きいほど出やすい） */
  skills: Partial<Record<Skill, number>>;
};

/**
 * 2つの地形をつなぐ絵の組。corners は「北西・北東・南西・南東」の角が u（upper の地形）か l（lower の地形）かで、絵の位置を引く
 */
export type TerrainSet = { lower: string; upper: string; sheet: string; corners: Record<string, [number, number]> };

export type ObjectDef = { image: string; /** 主人公より下に描く（草むら・花など） */ underHero: boolean };

export type FieldMap = {
  townId: string;
  tileSize: number;
  ground: { base: string; sets: TerrainSet[] };
  objects: Record<string, ObjectDef>;
  width: number;
  height: number;
  tiles: Record<string, TileDef>;
  rows: string[];
  areas: string[];
  areaDefs: Record<string, AreaDef>;
  start: { x: number; y: number };
};

export type Direction = 'up' | 'down' | 'left' | 'right';

export const DIRECTION_STEP: Record<Direction, { dx: number; dy: number }> = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};

/** 街のマップを読む。ファイルがなければ null（その街は、モンスターを選ぶ形だけで遊ぶ） */
export async function fetchFieldMap(townId: string): Promise<FieldMap | null> {
  const res = await fetch(`/maps/${encodeURIComponent(townId)}.json`, { cache: 'no-cache' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`マップを読み込めませんでした（${res.status}）`);
  // 開発用サーバーは、ないファイルにアプリの画面（HTML）を返すことがある
  if (!(res.headers.get('content-type') ?? '').includes('json')) return null;
  return parseFieldMap(await res.json());
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** マップのファイルを点検して読む。おかしいところがあれば、まとめて日本語で知らせる */
export function parseFieldMap(raw: unknown): FieldMap {
  const problems: string[] = [];
  if (!isObject(raw)) throw new Error('マップのファイルの形が正しくありません');

  const townId = typeof raw.town_id === 'string' ? raw.town_id : '';
  if (!townId) problems.push('town_id がありません');
  const tileSize = Number.isInteger(raw.tile_size) ? (raw.tile_size as number) : 32;

  const groundRaw = isObject(raw.ground) ? raw.ground : {};
  const base = typeof groundRaw.base === 'string' ? groundRaw.base : '';
  if (!base) problems.push('ground.base（いちばん下の地面）がありません');
  const sets: TerrainSet[] = [];
  const readCorners = (label: string, def: Record<string, unknown>) => {
    const corners: Record<string, [number, number]> = {};
    for (const [key, xy] of Object.entries(isObject(def.corners) ? def.corners : {})) {
      if (/^[ul]{4}$/.test(key) && Array.isArray(xy) && xy.length === 2) corners[key] = [Number(xy[0]), Number(xy[1])];
    }
    if (Object.keys(corners).length !== 16) problems.push(`${label} の corners は16通りそろえてください`);
    return corners;
  };
  // 前の形：base とつながる地形ごとの絵（lower がその地形、upper が base）
  for (const [name, def] of Object.entries(isObject(groundRaw.terrains) ? groundRaw.terrains : {})) {
    if (!isObject(def) || typeof def.sheet !== 'string') {
      problems.push(`ground.terrains の「${name}」の形が正しくありません`);
      continue;
    }
    sets.push({ lower: name, upper: base, sheet: def.sheet, corners: readCorners(`ground.terrains の「${name}」`, def) });
  }
  // 今の形：2つの地形をつなぐ絵の組
  (Array.isArray(groundRaw.sets) ? groundRaw.sets : []).forEach((def: unknown, i: number) => {
    const label = `ground.sets の ${i + 1} 番目`;
    if (!isObject(def) || typeof def.sheet !== 'string' || typeof def.lower !== 'string' || typeof def.upper !== 'string') {
      problems.push(`${label} の形が正しくありません（lower・upper・sheet・corners）`);
      return;
    }
    sets.push({ lower: def.lower, upper: def.upper, sheet: def.sheet, corners: readCorners(label, def) });
  });
  if (sets.length === 0) problems.push('ground.sets がありません（base の絵もここから取る）');
  const groundNames = new Set([base, ...sets.flatMap((s) => [s.lower, s.upper])]);

  const objects: Record<string, ObjectDef> = {};
  for (const [name, def] of Object.entries(isObject(raw.objects) ? raw.objects : {})) {
    if (!isObject(def) || typeof def.image !== 'string') problems.push(`objects の「${name}」の image がありません`);
    else objects[name] = { image: def.image, underHero: def.under_hero === true };
  }

  const tiles: Record<string, TileDef> = {};
  if (!isObject(raw.tiles)) problems.push('tiles がありません');
  else {
    for (const [ch, def] of Object.entries(raw.tiles)) {
      if ([...ch].length !== 1 || !isObject(def)) {
        problems.push(`tiles の「${ch}」の形が正しくありません`);
        continue;
      }
      const ground = typeof def.ground === 'string' ? def.ground : '';
      if (!groundNames.has(ground)) problems.push(`tiles の「${ch}」の ground「${ground}」が ground にありません`);
      const object = typeof def.object === 'string' ? def.object : null;
      if (object && !objects[object]) problems.push(`tiles の「${ch}」の object「${object}」が objects にありません`);
      const encounter = def.encounter === undefined || def.encounter === null ? null : Number(def.encounter);
      if (encounter !== null && !(encounter >= 1)) problems.push(`tiles の「${ch}」の encounter は1以上にしてください`);
      tiles[ch] = { ground, object, walk: def.walk === true, encounter, town: def.town === true, boss: def.boss === true };
    }
  }

  const rows = Array.isArray(raw.rows) ? raw.rows.filter((r): r is string => typeof r === 'string') : [];
  const areas = Array.isArray(raw.areas) ? raw.areas.filter((r): r is string => typeof r === 'string') : [];
  const height = rows.length;
  const width = height > 0 ? [...rows[0]].length : 0;
  if (height === 0) problems.push('rows（地形）がありません');
  rows.forEach((r, y) => {
    if ([...r].length !== width) problems.push(`rows の ${y} 行目の長さが、1行目と違います`);
    [...r].forEach((ch, x) => {
      if (!tiles[ch]) problems.push(`rows の ${y} 行目 ${x} 列目の「${ch}」が tiles にありません`);
    });
  });
  if (areas.length !== height || areas.some((r) => [...r].length !== width)) {
    problems.push('areas（場所）は rows と同じ大きさにしてください');
  }

  const areaDefs: Record<string, AreaDef> = {};
  if (!isObject(raw.area_defs)) problems.push('area_defs がありません');
  else {
    for (const [ch, def] of Object.entries(raw.area_defs)) {
      if (!isObject(def) || typeof def.name !== 'string' || !isObject(def.skills)) {
        problems.push(`area_defs の「${ch}」の形が正しくありません`);
        continue;
      }
      const skills: Partial<Record<Skill, number>> = {};
      for (const [skill, weight] of Object.entries(def.skills)) {
        if (!SKILLS.includes(skill as Skill)) problems.push(`area_defs の「${ch}」に、ない能力値「${skill}」があります`);
        else if (typeof weight !== 'number' || weight <= 0) problems.push(`area_defs の「${ch}」の ${skill} は0より大きい数にしてください`);
        else skills[skill as Skill] = weight;
      }
      areaDefs[ch] = {
        name: def.name,
        skills,
        battleBackground: typeof def.battle_background === 'string' ? def.battle_background : null,
      };
    }
  }
  areas.forEach((r, y) =>
    [...r].forEach((ch, x) => {
      if (ch !== '-' && !areaDefs[ch]) problems.push(`areas の ${y} 行目 ${x} 列目の「${ch}」が area_defs にありません`);
    }),
  );

  const start = isObject(raw.start) ? { x: Number(raw.start.x), y: Number(raw.start.y) } : { x: -1, y: -1 };
  const map: FieldMap = {
    townId,
    tileSize,
    ground: { base, sets },
    objects,
    width,
    height,
    tiles,
    rows,
    areas,
    areaDefs,
    start,
  };
  if (problems.length === 0 && !canWalk(map, start.x, start.y)) problems.push('start は歩けるマスにしてください');

  if (problems.length > 0) throw new Error(`マップのファイルに直すところがあります：${problems.slice(0, 5).join('／')}`);
  return map;
}

export function tileAt(map: FieldMap, x: number, y: number): TileDef | null {
  if (x < 0 || y < 0 || x >= map.width || y >= map.height) return null;
  return map.tiles[[...map.rows[y]][x]] ?? null;
}

/**
 * 地面の絵を選ぶ。絵はマスの角（頂点）ごとに1枚置き、その4方のマスの地面で、どの絵にするかを決める
 * （vx, vy は頂点の位置。0〜width, 0〜height）。マップの外は、いちばん近いマスと同じにする。
 * 4方の地面をいちばん多く含む絵の組を使う（同じなら sets の先のほう）。組にない地面は upper として扱う。
 */
export function groundAt(map: FieldMap, vx: number, vy: number): { sheet: string; sx: number; sy: number } | null {
  const cell = (x: number, y: number) =>
    tileAt(map, Math.min(Math.max(x, 0), map.width - 1), Math.min(Math.max(y, 0), map.height - 1))?.ground ?? map.ground.base;
  const four = [cell(vx - 1, vy - 1), cell(vx, vy - 1), cell(vx - 1, vy), cell(vx, vy)];
  let best: TerrainSet | null = null;
  let bestScore = -1;
  for (const set of map.ground.sets) {
    const score = four.filter((g) => g === set.lower || g === set.upper).length;
    if (score > bestScore) {
      best = set;
      bestScore = score;
    }
  }
  if (!best) return null;
  const key = four.map((g) => (g === best.lower ? 'l' : 'u')).join('');
  const xy = best.corners[key];
  return xy ? { sheet: best.sheet, sx: xy[0], sy: xy[1] } : null;
}

export function areaAt(map: FieldMap, x: number, y: number): AreaDef | null {
  if (x < 0 || y < 0 || x >= map.width || y >= map.height) return null;
  const ch = [...map.areas[y]][x];
  return ch === '-' ? null : (map.areaDefs[ch] ?? null);
}

export function canWalk(map: FieldMap, x: number, y: number): boolean {
  return tileAt(map, x, y)?.walk === true;
}

export type Rng = () => number;

/** その1歩で出会うか。戦闘のあと ENCOUNTER_MIN_STEPS 歩までは出会わない */
export function rollEncounter(tile: TileDef | null, area: AreaDef | null, steps: number, rng: Rng = Math.random): boolean {
  if (!tile?.encounter || !area || steps < ENCOUNTER_MIN_STEPS) return false;
  return rng() < 1 / tile.encounter;
}

/**
 * 出てくる能力値を選ぶ。場所の割合に、苦手さ（いちばん高いレベルとの差）と、下がり始めているかを掛ける。
 * 戦えない能力値（未解放、モンスターがいない）は除く。
 */
export function chooseEncounterSkill(
  area: AreaDef,
  skills: PlayerSkill[],
  available: ReadonlySet<Skill>,
  rng: Rng = Math.random,
): Skill | null {
  const open = skills.filter((s) => s.unlocked && available.has(s.skill));
  const top = Math.max(1, ...open.map((s) => s.level));
  const weighted = open
    .map((s) => {
      const base = area.skills[s.skill] ?? 0;
      const weak = 1 + ENCOUNTER_WEAK_BONUS * Math.max(0, top - s.level);
      const decay = s.daysUntilDecay !== null && s.daysUntilDecay <= 0 ? ENCOUNTER_DECAY_BONUS : 1;
      return { skill: s.skill, weight: base * weak * decay };
    })
    .filter((w) => w.weight > 0);
  const total = weighted.reduce((sum, w) => sum + w.weight, 0);
  if (total <= 0) return null;
  let r = rng() * total;
  for (const w of weighted) {
    r -= w.weight;
    if (r < 0) return w.skill;
  }
  return weighted[weighted.length - 1].skill;
}

/** 復習の時期が来た問題があるとき、復活モンスターにするか */
export function rollRevival(dueCount: number, rng: Rng = Math.random): boolean {
  return dueCount > 0 && rng() < ENCOUNTER_REVIVAL_CHANCE;
}
