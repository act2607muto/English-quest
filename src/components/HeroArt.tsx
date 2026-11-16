import { useState } from 'react';

/** 主人公の絵（32×32 のドット絵。scripts/make_sprites.mjs で作る） */
export const HERO_IMAGE = '/hero/hero.png';

export function HeroArt({ size = 64, className = '' }: { size?: number; className?: string }) {
  const [broken, setBroken] = useState(false);
  if (broken) return null;
  return (
    <img
      className={`hero-art ${className}`}
      src={HERO_IMAGE}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      onError={() => setBroken(true)}
    />
  );
}
