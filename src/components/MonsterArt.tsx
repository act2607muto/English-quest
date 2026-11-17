import { useState } from 'react';
import type { Skill } from '../lib/skills';

/**
 * モンスターの絵。monsters.image のドット絵（64×64、ボスは96×96）を拡大して出す。
 * 同じ場所に「-breath」をつけた2コマ目（例：town01-mon-voc-breath.png）があれば、交互に出して呼吸に見せる。
 * 2コマ目は scripts/make_breath_frames.ps1 で作る。ないときは止まった絵のまま。
 * 絵がないとき・読み込めないときは、能力値の1文字を枠に入れて代わりにする。
 * 復活モンスターは、同じ名前に「-revival」をつけた色違いの絵（例：town01-mon-voc-revival.png）を使う。
 * その絵がなければ、もとの絵の色を画面でずらして代わりにする。
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
  defeated = false,
  dim = false,
  revival = false,
}: {
  skill: Skill | null;
  image?: string | null;
  size?: 'small' | 'large' | 'huge';
  hurt?: boolean;
  /** 倒された（ゆれてから倒れて消える。消えたまま） */
  defeated?: boolean;
  dim?: boolean;
  /** 復活モンスター（色違い） */
  revival?: boolean;
}) {
  const [broken, setBroken] = useState(false);
  const [breathBroken, setBreathBroken] = useState(false);
  const [revivalBroken, setRevivalBroken] = useState(false);
  // 復活モンスターは色違いの絵（なければ、もとの絵の色をずらす）
  const useRevivalArt = revival && !revivalBroken && !!image && /\.png$/.test(image);
  const shown = useRevivalArt && image ? image.replace(/\.png$/, '-revival.png') : image;
  const breathImage = shown && /\.png$/.test(shown) ? shown.replace(/\.png$/, '-breath.png') : null;
  const classes = [
    'monster-art',
    `monster-art--${size}`,
    `monster-art--${skill ?? 'boss'}`,
    hurt && !defeated ? 'monster-art--hurt' : '',
    defeated ? 'monster-art--defeated' : '',
    dim ? 'monster-art--dim' : '',
    revival && !useRevivalArt ? 'monster-art--revival' : '',
  ].join(' ');

  if (shown && !broken) {
    return (
      <span className={`${classes} monster-art--sprite`} aria-hidden="true">
        <img
          key={shown}
          src={shown}
          alt=""
          onError={() => (useRevivalArt ? setRevivalBroken(true) : setBroken(true))}
        />
        {breathImage && !breathBroken && (
          <img
            key={breathImage}
            className="monster-art__breath"
            src={breathImage}
            alt=""
            onError={() => setBreathBroken(true)}
          />
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
