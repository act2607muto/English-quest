import { useState } from 'react';
import type { Skill } from '../lib/skills';

/**
 * モンスターの絵。monsters.image のドット絵（16×16）を拡大して出す。
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
}: {
  skill: Skill | null;
  image?: string | null;
  size?: 'small' | 'large';
  hurt?: boolean;
  dim?: boolean;
}) {
  const [broken, setBroken] = useState(false);
  const classes = [
    'monster-art',
    `monster-art--${size}`,
    `monster-art--${skill ?? 'boss'}`,
    hurt ? 'monster-art--hurt' : '',
    dim ? 'monster-art--dim' : '',
  ].join(' ');

  if (image && !broken) {
    return (
      <span className={`${classes} monster-art--sprite`} aria-hidden="true">
        <img src={image} alt="" width={16} height={16} onError={() => setBroken(true)} />
      </span>
    );
  }
  return (
    <span className={classes} aria-hidden="true">
      {skill ? GLYPH[skill] : '主'}
    </span>
  );
}
