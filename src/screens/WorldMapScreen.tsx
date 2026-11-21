import { useState } from 'react';
import { heroSrc, useHeroLook } from '../lib/heroLook';
import type { Player } from '../lib/game/player';
import type { WorldState } from '../lib/game/worldMap';

/**
 * 旅の地図（点と道の世界地図）。3つ目の街に着くと、街の画面の右上から開ける。
 * 行ったことのある街を押すと「〇〇へ 向かいますか？」と聞き、すぐにその街へ移る。
 * まだ行っていない街は「？？？」と出す（場所だけわかる）。
 */
export function WorldMapScreen({
  player,
  world,
  onTravel,
  backLabel,
  onBack,
}: {
  player: Player;
  world: WorldState | null;
  onTravel: (townId: string) => void;
  /** もどるボタンの文字（開いた画面による） */
  backLabel: string;
  onBack: () => void;
}) {
  const look = useHeroLook();
  const [ask, setAsk] = useState<{ id: string; name: string } | null>(null);

  if (!world) {
    return (
      <main className="screen">
        <section className="window">
          <p>地図を読み込み中…</p>
        </section>
        <button className="command" type="button" onClick={onBack}>
          ▶ {backLabel}
        </button>
      </main>
    );
  }

  const nodeOf = new Map(world.map.nodes.map((n) => [n.town, n]));
  const townOf = new Map(world.towns.map((t) => [t.id, t]));
  const nameOf = (id: string) => {
    const t = townOf.get(id);
    return t && world.reached.has(id) ? (t.name ?? nodeOf.get(id)?.name ?? t.scene) : '？？？';
  };

  return (
    <main className="screen">
      <section className="window">
        <h2 className="window__title">旅の地図</h2>
        <p className="note">行ったことのある街を押すと、すぐにその街へ行けます。</p>
        <div className="world-map">
          <img className="world-map__bg" src={world.map.background} alt="" aria-hidden="true" />
          <svg className="world-map__roads" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {world.map.roads.map(([a, b]) => {
              const na = nodeOf.get(a);
              const nb = nodeOf.get(b);
              if (!na || !nb) return null;
              // 両はしの街に行ったことがあれば、はっきりした道。そうでなければ、うすい道
              const open = world.reached.has(a) && world.reached.has(b);
              return (
                <g key={`${a}-${b}`} className={open ? 'world-map__road' : 'world-map__road world-map__road--far'}>
                  <line x1={na.x * 100} y1={na.y * 100} x2={nb.x * 100} y2={nb.y * 100} className="world-map__road-edge" />
                  <line x1={na.x * 100} y1={na.y * 100} x2={nb.x * 100} y2={nb.y * 100} className="world-map__road-dots" />
                </g>
              );
            })}
          </svg>
          {world.map.nodes.map((n) => {
            const reached = world.reached.has(n.town) && townOf.has(n.town);
            const here = n.town === player.currentTownId;
            const name = nameOf(n.town);
            return (
              <button
                key={n.town}
                type="button"
                className={`world-node${reached ? '' : ' world-node--unknown'}${here ? ' world-node--here' : ''}`}
                style={{ left: `${n.x * 100}%`, top: `${n.y * 100}%` }}
                disabled={!reached || here}
                aria-label={here ? `${name}（いまいる街）` : reached ? `${name}へ行く` : 'まだ行っていない街'}
                onClick={() => setAsk({ id: n.town, name })}
              >
                {here && (
                  <img className="world-node__hero" src={heroSrc('/hero/hero-map-down.png', look)} alt="" width={32} height={32} />
                )}
                {reached && n.icon ? (
                  <img className="world-node__icon" src={n.icon} alt="" />
                ) : (
                  <span className="world-node__dot" aria-hidden="true" />
                )}
                <span className="world-node__name">{name}</span>
              </button>
            );
          })}
          {ask && (
            <div className="map-ask" role="dialog" aria-label={ask.name}>
              <div className="window map-exit">
                <p>{ask.name}へ 向かいますか？</p>
                <button className="command" type="button" onClick={() => onTravel(ask.id)}>
                  ▶ 向かう
                </button>
                <button className="command command--quiet" type="button" onClick={() => setAsk(null)}>
                  やめる
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
      <button className="command" type="button" onClick={onBack}>
        ▶ {backLabel}
      </button>
    </main>
  );
}
