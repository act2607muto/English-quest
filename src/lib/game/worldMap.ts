/**
 * 旅の地図（点と道の世界地図。2026-11-21）。街を「点」、街どうしを「道」でつなぎ、行ったことのある街へすぐ移れる。
 *
 * - 地図のファイルは public/maps/world.json（背景の絵・街の点の位置・道・使えるようになる街の順番）。
 *   街を足すときは、このファイルに点と道を足すだけでよい。
 * - 使えるようになるのは、unlock_order 番目（3つ目）の街に着いてから（本人の希望で、最初から行き来できると味気ないため）。
 *   それまでは、管理者がデバッグ用の設定で見られるだけ（preferences.ts の getWorldMapDebug）。
 * - 「行ったことのある街」は、記録からわかる：1つ目の街、今いる街、それと1つ前の街のボスを倒した街（門をくぐって行ける）。
 */
import { fetchBosses, fetchTowns } from '../content';
import type { TownRow } from '../questionFile';
import type { Player } from './player';

export type WorldNode = {
  town: string;
  /** 背景の絵の中の位置（左上が 0、右下が 1） */
  x: number;
  y: number;
  /** 点に出す街の絵（なければ印だけ） */
  icon: string | null;
  /** 街のファイルに名前（town.name）がないときに出す名前（はじまりの街など） */
  name: string | null;
};

export type WorldMap = {
  background: string;
  unlockOrder: number;
  nodes: WorldNode[];
  roads: [string, string][];
};

export type WorldState = {
  map: WorldMap;
  /** 順番に並んだ街（取り込まれている街だけ） */
  towns: TownRow[];
  /** 行ったことのある街の ID */
  reached: Set<string>;
  /** 旅の地図が使えるか（3つ目の街に行ったことがある） */
  unlocked: boolean;
};

export async function fetchWorldMap(): Promise<WorldMap | null> {
  const res = await fetch('/maps/world.json', { cache: 'no-cache' });
  if (!res.ok || !(res.headers.get('content-type') ?? '').includes('json')) return null;
  const raw = (await res.json()) as {
    background?: string;
    unlock_order?: number;
    nodes?: { town: string; x: number; y: number; icon?: string; name?: string }[];
    roads?: [string, string][];
  };
  return {
    background: raw.background ?? '',
    unlockOrder: raw.unlock_order ?? 3,
    nodes: (raw.nodes ?? []).map((n) => ({ town: n.town, x: n.x, y: n.y, icon: n.icon ?? null, name: n.name ?? null })),
    roads: raw.roads ?? [],
  };
}

/**
 * 行ったことのある街の ID。bossOf は街の ID からその街のボスの ID。
 * 1つ目の街と今いる街は行ったことがある。ほかの街は、1つ前の街のボスを倒していれば行ける（門の先）。
 */
export function reachedTowns(
  player: Pick<Player, 'currentTownId' | 'defeatedBosses'>,
  towns: TownRow[],
  bossOf: Map<string, string>,
): Set<string> {
  const sorted = [...towns].sort((a, b) => a.sort_order - b.sort_order);
  const reached = new Set<string>([player.currentTownId]);
  sorted.forEach((t, i) => {
    if (i === 0) reached.add(t.id);
    const prev = sorted[i - 1];
    const prevBoss = prev ? bossOf.get(prev.id) : undefined;
    if (prevBoss && player.defeatedBosses.includes(prevBoss)) reached.add(t.id);
  });
  return reached;
}

/** 旅の地図が使えるか：unlockOrder 番目（1から数える）より後の街に、行ったことがある */
export function worldMapUnlocked(reached: Set<string>, towns: TownRow[], unlockOrder: number): boolean {
  const sorted = [...towns].sort((a, b) => a.sort_order - b.sort_order);
  return sorted.some((t, i) => i + 1 >= unlockOrder && reached.has(t.id));
}

/** 地図のファイル・街・ボスを読んで、どこまで行けるかを調べる（地図のファイルがなければ null） */
export async function loadWorldState(player: Pick<Player, 'currentTownId' | 'defeatedBosses'>): Promise<WorldState | null> {
  const [map, towns, bosses] = await Promise.all([fetchWorldMap(), fetchTowns(), fetchBosses()]);
  if (!map) return null;
  const bossOf = new Map(bosses.map((b) => [b.town_id, b.id]));
  const reached = reachedTowns(player, towns, bossOf);
  return { map, towns, reached, unlocked: worldMapUnlocked(reached, towns, map.unlockOrder) };
}
