import { useEffect, useState, type CSSProperties } from 'react';
import { MonsterArt } from '../components/MonsterArt';
import { fetchMonstersOfTown } from '../lib/content';
import { PLAYABLE_SKILLS } from '../lib/game/battle';
import { isRare, revivalOf } from '../lib/game/foes';
import type { Player } from '../lib/game/player';
import type { TownStatus } from '../lib/game/town';
import type { MonsterRow } from '../lib/questionFile';
import { SKILLS, SKILL_LABELS, type Skill } from '../lib/skills';
import type { BattleKind } from './BattleScreen';

/**
 * スキルダンジョン（街の「スキルダンジョンへ」から開く）。練習したい能力値のモンスターを選んで戦う。
 * モンスターの種類が能力値に対応する。歩いて出会うのは「街の外」のマップ（MapScreen）。
 * 復習の時期が来た問題があると、その能力値の「復活モンスター」（色違い）が現れる。
 * 未解放の能力値は鍵つきで出す。
 */
export function FieldScreen({
  player,
  status,
  onFight,
  onBack,
}: {
  player: Player;
  status: TownStatus | null;
  onFight: (monster: MonsterRow, kind: BattleKind) => void;
  onBack: () => void;
}) {
  const [monsters, setMonsters] = useState<MonsterRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMonstersOfTown(player.currentTownId)
      .then((m) => setMonsters(m.filter((x) => !x.is_boss && !isRare(x))))
      .catch((err) => setError(err instanceof Error ? err.message : String(err)));
  }, [player.currentTownId]);

  const bySkill = new Map(monsters?.map((m) => [m.skill, m]));
  const unlocked = new Map(player.skills.map((s) => [s.skill, s.unlocked]));

  const revivals = (monsters ?? [])
    .filter((m) => m.skill && unlocked.get(m.skill) && PLAYABLE_SKILLS.includes(m.skill))
    .map((m) => ({ base: m, due: status?.dueBySkill[m.skill!] ?? 0 }))
    .filter((r) => r.due > 0)
    .map((r) => ({ monster: revivalOf(r.base, r.due, player), due: r.due }));

  return (
    <main className="screen">
      <section className="window">
        <h2 className="window__title">スキルダンジョン</h2>
        <p>能力値ごとの部屋に、モンスターが待っています。練習したい相手を選んでください。倒すと、その能力値が伸びます。</p>
      </section>

      {error && <p className="message message--error">モンスターを読み込めませんでした（{error}）</p>}
      {!monsters && !error && <p>読み込み中…</p>}
      {monsters && monsters.length === 0 && (
        <section className="window">
          <p className="message message--error">
            この街にはまだモンスターがいません。「設定」→「教材の取り込み」で {player.currentTownId}_monsters.json を取り込んでください。
          </p>
        </section>
      )}

      {revivals.length > 0 && (
        <section className="window revival">
          <h2 className="window__title">復活モンスター</h2>
          <p className="note">復習の時期が来た問題で現れます。倒すとおかねが多めに入ります。</p>
          <div className="monster-list">
            {revivals.map(({ monster, due }) => (
              <button
                key={monster.id}
                type="button"
                className="monster-card monster-card--revival monster-card--room"
                style={roomStyle(player.currentTownId, monster.skill)}
                onClick={() => onFight(monster, 'revival')}
              >
                <MonsterArt skill={monster.skill} image={monster.image} size="small" revival />
                <span className="monster-card__body">
                  <span className="monster-card__name">{monster.name}</span>
                  <span className="monster-card__meta">
                    {SKILL_LABELS[monster.skill!]}　HP {monster.hp}　{monster.gold} G
                  </span>
                </span>
                <span className="monster-card__status">復習 {due}問</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {monsters && monsters.length > 0 && (
        <div className="monster-list">
          {SKILLS.map((skill) => {
            const m = bySkill.get(skill);
            const isUnlocked = unlocked.get(skill);
            const playable = Boolean(m && isUnlocked && PLAYABLE_SKILLS.includes(skill));
            const label = !isUnlocked ? '🔒 未解放' : !m ? 'いない' : !PLAYABLE_SKILLS.includes(skill) ? '準備中' : null;
            return (
              <button
                key={skill}
                type="button"
                className={`monster-card${playable ? ' monster-card--room' : ''}`}
                style={playable ? roomStyle(player.currentTownId, skill) : undefined}
                disabled={!playable}
                onClick={() => m && onFight(m, 'normal')}
              >
                <MonsterArt skill={skill} image={isUnlocked ? m?.image : null} size="small" dim={!playable} />
                <span className="monster-card__body">
                  <span className="monster-card__name">{m?.name ?? '？？？'}</span>
                  <span className="monster-card__meta">
                    {SKILL_LABELS[skill]}
                    {m && playable && `　HP ${m.hp}`}
                  </span>
                </span>
                {label && <span className="monster-card__status">{label}</span>}
              </button>
            );
          })}
        </div>
      )}

      <button className="command" type="button" onClick={onBack}>
        ▶ 街にもどる
      </button>
    </main>
  );
}

/** 能力値ごとの部屋の絵（public/battle/{街のID}-dungeon-{能力値}.png）をカードの背景にする */
function roomStyle(townId: string, skill: Skill | null): CSSProperties | undefined {
  if (!skill) return undefined;
  return { '--room': `url('/battle/${townId}-dungeon-${skill}.png')` } as CSSProperties;
}
