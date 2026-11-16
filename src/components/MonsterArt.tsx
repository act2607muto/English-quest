import { useState } from 'react';
import type { Skill } from '../lib/skills';

/**
 * モンスターの絵。monsters.image のドット絵（64×64、ボスは96×96）を拡大して出す。
 * 同じ場所に「-breath」をつけた2コマ目（例：town01-mon-voc-breath.png）があれば、交互に出して呼吸に見せる。
 * 2コマ目は scripts/make_breath_frames.ps1 で作る。ないときは止まった絵のまま。
 * 絵がないとき・読み込めないときは、能力値の1文字を枠に入れて代わりにする。
 */
const GLYPH: Record<Skill, string> = {
  vocabulary: '語',
  grammar: '文',
  listening: '聴',
  reading: '読',
  speaking: '話',
  writing: '書',
};

export function MonsterArt({
  skill,
  image,
  size = 'large',
  hurt = false,
  dim = false,
  revival = false,
}: {
  skill: Skill | null;
  image?: string | null;
  size?: 'small' | 'large' | 'huge';
  hurt?: boolean;
  dim?: boolean;
  /** 復活モンスター（色違い） */
  revival?: boolean;
}) {
  const [broken, setBroken] = useState(false);
  const [breathBroken, setBreathBroken] = useState(false);
  const breathImage = image && /\.png$/.test(image) ? image.replace(/\.png$/, '-breath.png') : null;
  const classes = [
    'monster-art',
    `monster-art--${size}`,
    `monster-art--${skill ?? 'boss'}`,
    hurt ? 'monster-art--hurt' : '',
    dim ? 'monster-art--dim' : '',
    revival ? 'monster-art--revival' : '',
  ].join(' ');

  if (image && !broken) {
    return (
      <span className={`${classes} monster-art--sprite`} aria-hidden="true">
        <img src={image} alt="" onError={() => setBroken(true)} />
        {breathImage && !breathBroken && (
          <img className="monster-art__breath" src={breathImage} alt="" onError={() => setBreathBroken(true)} />
        )}
      </span>
    );
  }
  return (
    <span className={classes} aria-hidden="true">
      {skill ? GLYPH[skill] : '主'}
    </span>
  );
}
