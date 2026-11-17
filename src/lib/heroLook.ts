/**
 * 主人公の見た目（男の子か女の子か）。2026-11-18 に本人の希望で足した。
 *
 * 記録は adventure_state.hero_look。画面のどこからでも同じ見た目を使えるよう、ここに今の見た目を持っておき、
 * 記録を読んだとき（App の reload）に setHeroLook で入れる。
 *
 * 絵は男の子が public/hero/、女の子が public/hero/girl/ に、同じ名前で置く（hero.png・hero-map.png など）。
 */
import { useSyncExternalStore } from 'react';

export const HERO_LOOKS = ['boy', 'girl'] as const;
export type HeroLook = (typeof HERO_LOOKS)[number];

export const HERO_LOOK_LABELS: Record<HeroLook, string> = { boy: '男の子', girl: '女の子' };

export function isHeroLook(v: unknown): v is HeroLook {
  return typeof v === 'string' && (HERO_LOOKS as readonly string[]).includes(v);
}

let current: HeroLook = 'boy';
const listeners = new Set<() => void>();

export function setHeroLook(look: HeroLook): void {
  if (look === current) return;
  current = look;
  listeners.forEach((f) => f());
}

export function getHeroLook(): HeroLook {
  return current;
}

/** 今の主人公の見た目（変わると、使っている画面が描き直される） */
export function useHeroLook(): HeroLook {
  return useSyncExternalStore(
    (onChange) => {
      listeners.add(onChange);
      return () => listeners.delete(onChange);
    },
    () => current,
  );
}

/** 主人公の絵の場所を、見た目に合わせて変える（/hero/ の絵だけ。ほかの絵はそのまま） */
export function heroSrc(path: string, look: HeroLook = current): string {
  return look === 'girl' && path.startsWith('/hero/') && !path.startsWith('/hero/girl/')
    ? path.replace('/hero/', '/hero/girl/')
    : path;
}
