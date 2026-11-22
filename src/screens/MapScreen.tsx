import { useCallback, useEffect, useRef, useState } from 'react';
import { HERO_IMAGE } from '../components/HeroArt';
import { heroSrc, useHeroLook } from '../lib/heroLook';
import { playSfx } from '../lib/sound';
import { isSecondForm } from '../lib/game/secondForm';
import { isWordbookMonster } from '../lib/game/wordbook';
import { fetchMonstersOfTown } from '../lib/content';
import { PLAYABLE_SKILLS } from '../lib/game/battle';
import {
  areaAt,
  canWalk,
  chooseEncounterSkill,
  DIRECTION_STEP,
  fetchFieldMap,
  groundAt,
  rollEncounter,
  rollRevival,
  tileAt,
  type Direction,
  type FieldMap,
} from '../lib/game/fieldMap';
import { isRare, rareSkills, revivalOf, rollRare } from '../lib/game/foes';
import type { Player } from '../lib/game/player';
import type { TownStatus } from '../lib/game/town';
import { getDpadSide, getNoEncounters } from '../lib/preferences';
import type { MonsterRow } from '../lib/questionFile';
import { SKILL_LABELS, type Skill } from '../lib/skills';
import type { BattleKind } from './BattleScreen';

/** マップの上の主人公の位置。戦闘から戻ったときに同じ場所から歩けるよう、呼び出し側で覚えておく */
export type MapPosition = { x: number; y: number; steps: number; facing: Facing };
/** 主人公の向き。上へ歩くと後ろ姿、下へ歩くと正面 */
type Facing = 'left' | 'right' | 'up' | 'down';

/**
 * 1マスの大きさ（画面上の点）。マップの枠の幅に、だいたい CELLS_ACROSS マスが入る大きさにする。
 * 絵の点がそろって見えるよう、4の倍数にする。
 */
const CELLS_ACROSS = 8.5;
const CELL_MIN = 32;
const CELL_MAX = 64;

/** マップの枠が縦に長いときは、マップの外が見えないよう、縦がマップの高さに収まるまで大きくする */
function cellFor(width: number, height: number, mapRows: number): number {
  const byWidth = Math.floor(width / CELLS_ACROSS / 4) * 4;
  const byHeight = mapRows > 0 ? Math.ceil(height / mapRows / 4) * 4 : 0;
  return Math.min(CELL_MAX, Math.max(CELL_MIN, byWidth, byHeight));
}
/**
 * マップで使う主人公の小さい絵（32×32、Pixellab）。ないときは戦闘の絵（64×64）を半分の大きさで使う。
 * 女の子のときは public/hero/girl/ の同じ名前の絵を読む（読んだ絵は、ここの名前で覚えておく）
 */
const HERO_MAP_IMAGE = '/hero/hero-map.png';
/** 上へ歩くときの後ろ姿と、下へ歩くときの正面（なければ横向きの絵で代わりにする） */
const HERO_MAP_UP_IMAGE = '/hero/hero-map-up.png';
const HERO_MAP_DOWN_IMAGE = '/hero/hero-map-down.png';
/**
 * 歩いているときの絵（足をふみ出した2コマ）。1歩ごとに 1 と 2 を交互に出し、止まると立っている絵にもどる。
 * 同じ名前に -walk1・-walk2 をつけた PNG。なければ、立っている絵を上下にゆらす。
 */
const walkImages = (stand: string) => [stand.replace(/.png$/, '-walk1.png'), stand.replace(/.png$/, '-walk2.png')];
const HERO_WALK_IMAGES = [HERO_MAP_IMAGE, HERO_MAP_UP_IMAGE, HERO_MAP_DOWN_IMAGE].flatMap(walkImages);
/** 絵そのものが向いている向き。歩く向きと違うときだけ左右を反転して描く（マップ用の主人公は左向き、戦闘用は右向き） */
const HERO_MAP_IMAGE_FACES = 'left';
const HERO_IMAGE_FACES = 'right';
/** 主人公の足の下の行が分からないときの値 */
const HERO_FEET_DEFAULT = 30;
/** 1マス歩くのにかける時間 */
const STEP_MS = 170;
/** 「あらわれた！」を見せてから戦闘に移るまで */
const ENCOUNTER_MS = 1100;

type Encounter = { monster: MonsterRow; kind: BattleKind; skills?: Skill[]; background: string | null };

function prefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** 絵のいちばん下の、色のある行（透明でない行） */
function lowestOpaqueRow(img: HTMLImageElement): number {
  try {
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext('2d');
    if (!ctx) return HERO_FEET_DEFAULT;
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, img.width, img.height).data;
    for (let y = img.height - 1; y >= 0; y--) {
      for (let x = 0; x < img.width; x++) if (data[(y * img.width + x) * 4 + 3] > 0) return y;
    }
  } catch {
    // 読めなければ決まった値
  }
  return HERO_FEET_DEFAULT;
}

/** 別の街への道の案内（例：◀ 西の門から はじまりの街へ）。道がマップのどの端に近いかで向きを決める */
function exitHintsOf(map: FieldMap): string[] {
  const hints = new Set<string>();
  map.rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      const tile = map.tiles[ch];
      if (!tile?.exit || !tile.exitName) return;
      const [arrow, side] =
        x <= 1
          ? ['◀', '西']
          : x >= map.width - 2
            ? ['▶', '東']
            : y <= 1
              ? ['▲', '北']
              : y >= map.height - 2
                ? ['▼', '南']
                : ['●', 'マップ'];
      hints.add(`${arrow} ${side}の門から ${tile.exitName}`);
    }),
  );
  return [...hints];
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * 街の外のマップ。十字のボタン（PC は矢印キーでも）で歩き、草むらなどでモンスターに出会う。
 * 場所ごとに出やすい能力値が違い、苦手な能力値や下がり始めた能力値ほど出やすい（lib/game/fieldMap.ts）。
 * 選んで戦いたいときは、街の「スキルダンジョン」から（マップのない街では、ここからも行ける）。
 */
export function MapScreen({
  player,
  status,
  position,
  onMove,
  onEncounter,
  onChoose,
  onTown,
  onBoss,
  onExit,
  onWorldMap,
}: {
  player: Player;
  status: TownStatus | null;
  position: MapPosition | null;
  onMove: (pos: MapPosition) => void;
  /** skills：めずらしいモンスターが出す能力値（ほかは省く）。background：出会った場所の戦闘の背景 */
  onEncounter: (monster: MonsterRow, kind: BattleKind, skills: Skill[] | undefined, background: string | null) => void;
  onChoose: () => void;
  onTown: () => void;
  /** ボスのいる場所を踏んだとき */
  onBoss: () => void;
  /** 別の街への道を進むと決めたとき（行き先の街のID） */
  onExit: (townId: string) => void;
  /** 旅の地図を開く（まだ使えないときは null で、ボタンを出さない） */
  onWorldMap: (() => void) | null;
}) {
  const [map, setMap] = useState<FieldMap | null | undefined>(undefined);
  const [monsters, setMonsters] = useState<MonsterRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pos, setPos] = useState<MapPosition | null>(position);
  const [encounter, setEncounter] = useState<Encounter | null>(null);
  /** 別の街への道を踏んだとき：行くかどうかをたずねる（やめたら、1歩もどる） */
  const [exitAsk, setExitAsk] = useState<{ to: string; name: string; back: MapPosition } | null>(null);
  /** 十字ボタンを出す側（設定で選ぶ） */
  const [dpadSide] = useState(getDpadSide);
  /** デバッグ用の設定で「出会わない」にしているか */
  const [noEncounters] = useState(getNoEncounters);
  /** 主人公の見た目（男の子・女の子）。絵の読み先が変わる */
  const heroLook = useHeroLook();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewElRef = useRef<HTMLDivElement | null>(null);
  /** マップの枠の大きさ（画面上の点）と、1マスの大きさ */
  const viewRef = useRef({ w: 352, h: 288, cell: 32 });
  const [viewSize, setViewSize] = useState(0);
  /** 読んだ絵（ファイル名ごと）。読めなかった絵は null */
  const imagesRef = useRef(new Map<string, HTMLImageElement | null>());
  /** 主人公の絵ごとの、足の下の行（足元をマスの下にそろえるため） */
  const heroFeetRef = useRef(new Map<HTMLImageElement, number>());
  /** 今の位置（描くときは、歩いている途中の小数の位置を使う） */
  const posRef = useRef<MapPosition | null>(position);
  const drawRef = useRef<{ x: number; y: number }>({ x: position?.x ?? 0, y: position?.y ?? 0 });
  const movingRef = useRef(false);
  const heldRef = useRef<Direction | null>(null);
  const busyRef = useRef(false); // 出会った・街に入ったあとは歩かない
  const stepRef = useRef<(dir: Direction) => void>(() => {});

  // マップ・絵・モンスターを読む
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [m, list] = await Promise.all([
          fetchFieldMap(player.currentTownId),
          fetchMonstersOfTown(player.currentTownId),
        ]);
        if (cancelled) return;
        const sources = [
          HERO_MAP_IMAGE,
          HERO_MAP_UP_IMAGE,
          HERO_MAP_DOWN_IMAGE,
          ...HERO_WALK_IMAGES,
          HERO_IMAGE,
          ...(m ? m.ground.sets.map((s) => s.sheet) : []),
          ...(m ? Object.values(m.objects).map((o) => o.image) : []),
        ];
        const loaded = await Promise.all(sources.map((src) => loadImage(heroSrc(src, heroLook))));
        if (cancelled) return;
        imagesRef.current = new Map(sources.map((src, i) => [src, loaded[i]]));
        for (const src of [HERO_MAP_IMAGE, HERO_MAP_UP_IMAGE, HERO_MAP_DOWN_IMAGE, ...HERO_WALK_IMAGES, HERO_IMAGE]) {
          const img = imagesRef.current.get(src);
          if (img) heroFeetRef.current.set(img, lowestOpaqueRow(img));
        }
        // 書庫のモンスターはスキルダンジョンにだけいる
        setMonsters(list.filter((x) => !x.is_boss && !isWordbookMonster(x) && !isSecondForm(x)));
        if (m && !posRef.current) {
          const start: MapPosition = { x: m.start.x, y: m.start.y, steps: 0, facing: 'down' };
          posRef.current = start;
          drawRef.current = { x: start.x, y: start.y };
          setPos(start);
        }
        setMap(m);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [player.currentTownId, heroLook]);

  /** 今の位置のまわりを描く（地面 → 草むらなど → 木・岩・街と主人公を、下の行ほど手前に） */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const p = posRef.current;
    if (!canvas || !map || !p) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const { w: viewPxW, h: viewPxH, cell: CELL } = viewRef.current;
    const VIEW_W = viewPxW / CELL;
    const VIEW_H = viewPxH / CELL;
    if (canvas.width !== Math.round(viewPxW * dpr) || canvas.height !== Math.round(viewPxH * dpr)) {
      canvas.width = Math.round(viewPxW * dpr);
      canvas.height = Math.round(viewPxH * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, viewPxW, viewPxH);

    const { x: hx, y: hy } = drawRef.current;
    const clamp = (v: number, size: number, view: number) =>
      size <= view ? (size - view) / 2 : Math.min(Math.max(v, 0), size - view);
    const camX = clamp(hx - (VIEW_W - 1) / 2, map.width, VIEW_W);
    const camY = clamp(hy - (VIEW_H - 1) / 2, map.height, VIEW_H);
    // 画面の左上がマップのどこかを、整数の点で決める。マスごとに小数を丸めると、ときどき1点のすき間ができる
    const ox = Math.round(-camX * CELL);
    const oy = Math.round(-camY * CELL);
    const images = imagesRef.current;
    const scale = CELL / map.tileSize;
    const ts = map.tileSize;
    const x0 = Math.floor(camX) - 1;
    const x1 = Math.ceil(camX + VIEW_W) + 1;
    const y0 = Math.floor(camY) - 1;
    const y1 = Math.ceil(camY + VIEW_H) + 1;

    // 1. 地面：マスの角ごとに、4方の地面からつながる絵を選ぶ（半マスずらして置く）
    for (let vy = y0 + 1; vy <= y1; vy++) {
      for (let vx = x0 + 1; vx <= x1; vx++) {
        const g = groundAt(map, vx, vy);
        const sheet = g ? images.get(g.sheet) : null;
        const dx = ox + Math.round((vx - 0.5) * CELL);
        const dy = oy + Math.round((vy - 0.5) * CELL);
        if (g && sheet) ctx.drawImage(sheet, g.sx, g.sy, ts, ts, dx, dy, CELL, CELL);
        else {
          ctx.fillStyle = '#4a9c3c';
          ctx.fillRect(dx, dy, CELL, CELL);
        }
      }
    }

    /** 置く物を、マスの下ぞろえ・左右まんなかで描く */
    const drawObject = (tx: number, ty: number, under: boolean) => {
      const tile = tileAt(map, tx, ty);
      const obj = tile?.object ? map.objects[tile.object] : null;
      if (!obj || obj.underHero !== under) return;
      const img = images.get(obj.image);
      if (!img) return;
      const w = img.width * scale;
      const h = img.height * scale;
      const dx = ox + tx * CELL + Math.round((CELL - w) / 2);
      const dy = oy + (ty + 1) * CELL - Math.round(h);
      ctx.drawImage(img, dx, dy, w, h);
    };

    // 2. 草むら・花など（主人公が上に立つもの）
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) drawObject(tx, ty, true);

    // 3. 木・岩・街と主人公。下の行ほどあとに描いて、手前に見せる
    const heroRow = Math.round(hy);
    for (let ty = y0; ty <= y1; ty++) {
      for (let tx = x0; tx <= x1; tx++) drawObject(tx, ty, false);
      if (ty !== heroRow) continue;
      // 主人公：上下に歩くときは後ろ姿・正面の絵。なければ横向きの絵を使う
      // 歩いている間は、足をふみ出した絵（1歩ごとに左右の足を交互に）。その絵がなければ、上下にゆらす
      const standSrc = p.facing === 'up' ? HERO_MAP_UP_IMAGE : p.facing === 'down' ? HERO_MAP_DOWN_IMAGE : HERO_MAP_IMAGE;
      const stand = images.get(standSrc) ?? null;
      const walking = movingRef.current ? (images.get(walkImages(standSrc)[p.steps % 2]) ?? null) : null;
      const front = p.facing === 'up' || p.facing === 'down' ? (walking ?? stand) : null;
      const small = walking ?? stand ?? images.get(HERO_MAP_IMAGE) ?? null;
      const frame = small ?? images.get(HERO_IMAGE) ?? null;
      const heroScale = small ? scale : scale / 2;
      const bob = !walking && p.steps % 2 === 1 ? heroScale : 0;
      const cx = ox + Math.round(hx * CELL + CELL / 2);
      const feetY = oy + Math.round((hy + 1) * CELL) - 2;
      if (!frame) {
        ctx.fillStyle = '#ffd84a';
        ctx.fillRect(cx - 8, feetY - 24, 16, 24);
        continue;
      }
      const w = frame.width * heroScale;
      const h = frame.height * heroScale;
      const top = feetY - ((heroFeetRef.current.get(frame) ?? HERO_FEET_DEFAULT) + 1) * heroScale - bob;
      ctx.save();
      const drawnFacing = small ? HERO_MAP_IMAGE_FACES : HERO_IMAGE_FACES;
      // 左右に歩くときだけ、絵の向きと違えば反転する（後ろ姿・正面はそのまま）
      const sideways = p.facing === 'left' || p.facing === 'right';
      if (!front && sideways && p.facing !== drawnFacing) {
        ctx.translate(cx + w / 2, top);
        ctx.scale(-1, 1);
        ctx.drawImage(frame, 0, 0, w, h);
      } else {
        ctx.drawImage(frame, cx - w / 2, top, w, h);
      }
      ctx.restore();
    }
  }, [map]);

  useEffect(() => {
    draw();
  }, [draw, pos, viewSize]);

  // マップの枠の大きさに合わせて描き直す（画面の向きや大きさが変わったとき）
  useEffect(() => {
    const el = viewElRef.current;
    if (!el) return;
    const measure = () => {
      // 白い枠の内側の大きさ（枠を含めると、絵が少し縮んで縦の線が出る）
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w < 1 || h < 1) return;
      viewRef.current = { w, h, cell: cellFor(w, h, map?.height ?? 0) };
      setViewSize((n) => n + 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [map]);

  const available = new Set<Skill>(
    monsters.map((m) => m.skill).filter((s): s is Skill => !!s && PLAYABLE_SKILLS.includes(s)),
  );

  /** 1歩すすんだあと：街の入口か、ボスの場所か、別の街への道か、出会うか（prev は1歩まえの位置） */
  const arrive = useCallback(
    (next: MapPosition, prev: MapPosition) => {
      if (!map) return;
      const tile = tileAt(map, next.x, next.y);
      if (tile?.exit) {
        busyRef.current = true;
        heldRef.current = null;
        setExitAsk({ to: tile.exit, name: tile.exitName ?? 'となりの街へ', back: prev });
        return;
      }
      if (tile?.town) {
        busyRef.current = true;
        heldRef.current = null;
        onTown();
        return;
      }
      if (tile?.boss) {
        busyRef.current = true;
        heldRef.current = null;
        onBoss();
        return;
      }
      const area = areaAt(map, next.x, next.y);
      if (!area || noEncounters || !rollEncounter(tile, area, next.steps)) return;
      // まれに、めずらしいモンスター（いろいろな能力値の問題を出す）に出会う
      const rare = rollRare(monsters.filter(isRare));
      const mixed = rareSkills(player, available);
      let found: Encounter;
      if (rare && mixed.length > 0) {
        found = { monster: rare, kind: 'rare', skills: mixed, background: area.battleBackground };
      } else {
        const skill = chooseEncounterSkill(area, player.skills, available);
        const base = skill ? monsters.find((m) => m.skill === skill) : null;
        if (!skill || !base) return;
        const due = status?.dueBySkill[skill] ?? 0;
        found = rollRevival(due)
          ? { monster: revivalOf(base, due, player), kind: 'revival', background: area.battleBackground }
          : { monster: base, kind: 'normal', background: area.battleBackground };
      }
      busyRef.current = true;
      heldRef.current = null;
      setEncounter(found);
      playSfx('encounter');
      const reset = { ...next, steps: 0 };
      posRef.current = reset;
      onMove(reset);
      window.setTimeout(
        () => onEncounter(found.monster, found.kind, found.skills, found.background),
        prefersReducedMotion() ? 500 : ENCOUNTER_MS,
      );
    },
    // available は monsters から作るので monsters を見ればよい
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [map, monsters, player, status, noEncounters, onMove, onTown, onBoss, onEncounter],
  );

  /** 1歩すすむ（歩けないマスなら向きだけ変える） */
  const step = useCallback(
    (dir: Direction) => {
      const p = posRef.current;
      if (!map || !p || movingRef.current || busyRef.current) return;
      const { dx, dy } = DIRECTION_STEP[dir];
      const facing: Facing = dx < 0 ? 'left' : dx > 0 ? 'right' : dy < 0 ? 'up' : dy > 0 ? 'down' : p.facing;
      const nx = p.x + dx;
      const ny = p.y + dy;
      if (!canWalk(map, nx, ny)) {
        if (facing !== p.facing) {
          posRef.current = { ...p, facing };
          setPos(posRef.current);
        }
        return;
      }
      const next: MapPosition = { x: nx, y: ny, steps: p.steps + 1, facing };
      posRef.current = next;
      const finish = () => {
        movingRef.current = false;
        drawRef.current = { x: nx, y: ny };
        setPos(next);
        onMove(next);
        arrive(next, p);
        // 押したままなら、続けて歩く
        const held = heldRef.current;
        if (held && !busyRef.current) stepRef.current(held);
      };
      if (prefersReducedMotion()) {
        finish();
        return;
      }
      movingRef.current = true;
      const from = { x: p.x, y: p.y };
      const started = performance.now();
      const frame = (now: number) => {
        const t = Math.min(1, (now - started) / STEP_MS);
        drawRef.current = { x: from.x + (nx - from.x) * t, y: from.y + (ny - from.y) * t };
        draw();
        if (t < 1) requestAnimationFrame(frame);
        else finish();
      };
      requestAnimationFrame(frame);
    },
    [map, draw, arrive, onMove],
  );
  stepRef.current = step;

  // PC の矢印キー（WASD でも）
  useEffect(() => {
    const keys: Record<string, Direction> = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
      w: 'up',
      s: 'down',
      a: 'left',
      d: 'right',
    };
    const down = (e: KeyboardEvent) => {
      const dir = keys[e.key];
      if (!dir) return;
      e.preventDefault();
      if (e.repeat) return;
      heldRef.current = dir;
      stepRef.current(dir);
    };
    const up = (e: KeyboardEvent) => {
      if (keys[e.key] === heldRef.current) heldRef.current = null;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  /** 別の街へ行くのをやめて、1歩もどる */
  function stayHere() {
    if (!exitAsk) return;
    const back = { ...exitAsk.back, steps: posRef.current?.steps ?? 0, facing: exitAsk.back.facing };
    posRef.current = back;
    drawRef.current = { x: back.x, y: back.y };
    setPos(back);
    onMove(back);
    setExitAsk(null);
    busyRef.current = false;
  }

  function press(dir: Direction) {
    heldRef.current = dir;
    stepRef.current(dir);
  }
  function release() {
    heldRef.current = null;
  }

  if (error) {
    return (
      <main className="screen">
        <section className="window">
          <p className="message message--error">マップを読み込めませんでした（{error}）</p>
        </section>
        <button className="command" type="button" onClick={onChoose}>
          ▶ スキルダンジョンへ
        </button>
        <button className="command" type="button" onClick={onTown}>
          ▶ 街にもどる
        </button>
      </main>
    );
  }
  if (map === undefined) {
    return (
      <main className="screen screen--center">
        <p>読み込み中…</p>
      </main>
    );
  }
  if (map === null) {
    return (
      <main className="screen">
        <section className="window">
          <h2 className="window__title">冒険</h2>
          <p>この街には、まだ歩けるマップがありません。スキルダンジョンで戦ってください。</p>
        </section>
        <button className="command" type="button" onClick={onChoose}>
          ▶ スキルダンジョンへ
        </button>
        <button className="command" type="button" onClick={onTown}>
          ▶ 街にもどる
        </button>
      </main>
    );
  }

  const area = pos ? areaAt(map, pos.x, pos.y) : null;
  // 別の街への道（tiles の exit）があれば、上の欄に「◀ 西の門から はじまりの街へ」のように出す
  const exitHints = exitHintsOf(map);
  const areaSkills = area
    ? (Object.keys(area.skills) as Skill[]).filter((s) => available.has(s)).map((s) => SKILL_LABELS[s])
    : [];

  return (
    <main className="screen map-screen">
      <section className="window map-place" aria-live="polite">
        <p className="map-place__name">{area ? area.name : '街のまわり'}</p>
        <p className="note">
          {noEncounters
            ? 'デバッグ用の設定で、モンスターに出会いません'
            : area && areaSkills.length > 0
              ? `出やすい：${areaSkills.join('・')}`
              : 'ここではモンスターは出ません'}
        </p>
        {exitHints.map((hint) => (
          <p key={hint} className="note map-place__exit">
            {hint}
          </p>
        ))}
      </section>

      <div className="map-view" ref={viewElRef}>
        <canvas
          ref={canvasRef}
          className="map-view__canvas"
          role="img"
          aria-label={`マップ。${area ? area.name : '街のまわり'}にいます`}
        />
        {encounter && (
          <div className="map-encounter" role="alert">
            <p className="window map-encounter__text">{encounter.monster.name}が あらわれた！</p>
          </div>
        )}
        {exitAsk && (
          <div className="map-ask" role="dialog" aria-label={exitAsk.name}>
            <div className="window map-exit">
              <p>{exitAsk.name} 向かいますか？</p>
              <button className="command" type="button" onClick={() => onExit(exitAsk.to)}>
                ▶ 向かう
              </button>
              <button className="command command--quiet" type="button" onClick={stayHere}>
                やめる
              </button>
            </div>
          </div>
        )}
        {/* 十字のボタン：マップに重ねて、うすく出す（出会ったとき・別の街へ行くかをたずねているときは消す） */}
        {!encounter && !exitAsk && (
          <div className={`dpad dpad--${dpadSide}`} aria-label="歩く">
            {(
              [
                ['up', '▲', '上へ'],
                ['left', '◀', '左へ'],
                ['right', '▶', '右へ'],
                ['down', '▼', '下へ'],
              ] as const
            ).map(([dir, mark, label]) => (
              <button
                key={dir}
                type="button"
                className={`dpad__button dpad__button--${dir}`}
                aria-label={label}
                onPointerDown={(e) => {
                  e.preventDefault();
                  (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
                  press(dir);
                }}
                onPointerUp={release}
                onPointerCancel={release}
                onLostPointerCapture={release}
                onContextMenu={(e) => e.preventDefault()}
              >
                {mark}
              </button>
            ))}
          </div>
        )}
      </div>

      <nav className="map-menu" aria-label="冒険の項目">
        <button className="command" type="button" onClick={onTown} disabled={!!encounter}>
          ▶ 街にもどる
        </button>
        {onWorldMap && (
          <button className="command" type="button" onClick={onWorldMap} disabled={!!encounter}>
            ▶ 旅の地図
          </button>
        )}
      </nav>
    </main>
  );
}
