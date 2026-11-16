import { useState, type CSSProperties } from 'react';

/** 主人公の絵（64×64 のドット絵。Pixellab で作ったもの） */
export const HERO_IMAGE = '/hero/hero.png';
/** 息を吸ったときの2コマ目（腰から上を1マス下げたもの）。2枚を交互に出して呼吸に見せる */
export const HERO_BREATH_IMAGE = '/hero/hero-breath.png';

export function HeroArt({ size = 64, className = '' }: { size?: number; className?: string }) {
  const [broken, setBroken] = useState(false);
  const [breathBroken, setBreathBroken] = useState(false);
  if (broken) return null;
  return (
    <span className={`hero-art ${className}`} aria-hidden="true" style={{ '--hero-size': `${size}px` } as CSSProperties}>
      <img src={HERO_IMAGE} alt="" width={size} height={size} onError={() => setBroken(true)} />
      {!breathBroken && (
        <img
          className="hero-art__breath"
          src={HERO_BREATH_IMAGE}
          alt=""
          width={size}
          height={size}
          onError={() => setBreathBroken(true)}
        />
      )}
    </span>
  );
}
