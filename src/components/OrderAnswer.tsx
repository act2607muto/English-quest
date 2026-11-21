import { useMemo, useState } from 'react';
import { shuffle } from '../lib/game/battle';

/**
 * 単語の並べかえの答えの欄（format "order"）。
 * 下のカードを押すと、上の答えの列のうしろに並ぶ。答えの列のカードを押すと、下にもどる。
 * 全部のカードを並べると「▶ こたえる」が押せる。文の終わりの記号（. ?）は、決まった記号として最後に出す。
 */
export function OrderAnswer({
  tiles,
  endMark,
  onSubmit,
}: {
  /** 並べる単語のカード（名前の印は置き換えずみ） */
  tiles: string[];
  endMark: string;
  onSubmit: (picked: string[]) => void;
}) {
  // カードを出す順番は、毎回混ぜる（同じ単語が2枚あっても見分けられるよう、番号で持つ）
  const pool = useMemo(() => shuffle(tiles.map((_, i) => i)), [tiles]);
  const [picked, setPicked] = useState<number[]>([]);
  const rest = pool.filter((i) => !picked.includes(i));
  const done = rest.length === 0;

  return (
    <div className="order">
      <div className="order__line" aria-label="あなたの並べた文">
        {picked.length === 0 && <span className="note order__empty">下の単語を、順番に押してください</span>}
        {picked.map((i) => (
          <button
            key={i}
            type="button"
            className="choice order__tile order__tile--placed"
            onClick={() => setPicked((p) => p.filter((x) => x !== i))}
            aria-label={`${tiles[i]}（押すと、もどす）`}
          >
            {tiles[i]}
          </button>
        ))}
        {endMark && <span className="order__mark">{endMark}</span>}
      </div>
      <div className="order__pool" aria-label="並べる単語">
        {rest.map((i) => (
          <button key={i} type="button" className="choice order__tile" onClick={() => setPicked((p) => [...p, i])}>
            {tiles[i]}
          </button>
        ))}
      </div>
      <div className="order__actions">
        <button className="command command--quiet" type="button" onClick={() => setPicked([])} disabled={picked.length === 0}>
          やり直す
        </button>
        <button className="command" type="button" onClick={() => onSubmit(picked.map((i) => tiles[i]))} disabled={!done}>
          ▶ こたえる
        </button>
      </div>
    </div>
  );
}
