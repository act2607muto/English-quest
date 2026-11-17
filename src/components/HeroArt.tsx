import { useState, type CSSProperties } from 'react';
import { heroSrc, useHeroLook, type HeroLook } from '../lib/heroLook';

/** 主人公の絵（64×64 のドット絵。Pixellab で作ったもの）。女の子は public/hero/girl/ の同じ名前の絵 */
export const HERO_IMAGE = '/hero/hero.png';
/** 息を吸ったときの2コマ目（腰から上を1マス下げたもの）。2枚を交互に出して呼吸に見せる */
export const HERO_BREATH_IMAGE = '/hero/hero-breath.png';

export function HeroArt({
  size = 64,
  className = '',
  look,
}: {
  size?: number;
  className?: string;
  /** 見た目を決めて出すとき（選ぶ画面）。なければ今の主人公の見た目 */
  look?: HeroLook;
}) {
  const currentLook = useHeroLook();
  const shown = look ?? currentLook;
  // 見た目が変わったら、読めなかった印を消して読み直す
  const [brokenFor, setBrokenFor] = useState<string | null>(null);
  const [breathBrokenFor, setBreathBrokenFor] = useState<string | null>(null);
  const broken = brokenFor === shown;
  const breathBroken = breathBrokenFor === shown;
  if (broken) return null;
  return (
    <span className={`hero-art ${className}`} aria-hidden="true" style={{ '--hero-size': `${size}px` } as CSSProperties}>
      <img src={heroSrc(HERO_IMAGE, shown)} alt="" width={size} height={size} onError={() => setBrokenFor(shown)} />
      {!breathBroken && (
        <img
          className="hero-art__breath"
          src={heroSrc(HERO_BREATH_IMAGE, shown)}
          alt=""
          width={size}
          height={size}
          onError={() => setBreathBrokenFor(shown)}
        />
      )}
    </span>
  );
}
