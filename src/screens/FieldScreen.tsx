import { useEffect, useState } from 'react';
import { fetchMonstersOfTown } from '../lib/content';
import { PLAYABLE_SKILLS } from '../lib/game/battle';
import type { Player } from '../lib/game/player';
import type { MonsterRow } from '../lib/questionFile';
import { SKILLS, SKILL_LABELS } from '../lib/skills';
import { MonsterArt } from '../components/MonsterArt';

/**
 * 街の外。戦うモンスターを選ぶ。モンスターの種類が能力値に対応する。
 * まだ戦えない能力値（AI採点が要るもの）は「準備中」、未解放の能力値は鍵つきで出す。
 */
export function FieldScreen({
  player,
  onFight,
  onBack,
}: {
  player: Player;
  onFight: (monster: MonsterRow) => void;
  onBack: () => void;
}) {
  const [monsters, setMonsters] = useState<MonsterRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMonstersOfTown(player.currentTownId)
      .then((m) => setMonsters(m.filter((x) => !x.is_boss)))
      .catch((err) => setError(err instanceof Error ? err.message : String(err)));
  }, [player.currentTownId]);

  const bySkill = new Map(monsters?.map((m) => [m.skill, m]));
  const unlocked = new Map(player.skills.map((s) => [s.skill, s.unlocked]));

  return (
    <main className="screen">
      <section className="window">
        <h2 className="window__title">街の外</h2>
        <p>戦う相手を選んでください。倒すと、その能力値が伸びます。</p>
      </section>

      {error && <p className="message message--error">モンスターを読み込めませんでした（{error}）</p>}
      {!monsters && !error && <p>読み込み中…</p>}
      {monsters && monsters.length === 0 && (
        <section className="window">
          <p className="message message--error">
            この街にはまだモンスターがいません。「設定」→「教材の取り込み」で town01_monsters.json を取り込んでください。
          </p>
        </section>
      )}

      {monsters && monsters.length > 0 && (
        <div className="monster-list">
          {SKILLS.map((skill) => {
            const m = bySkill.get(skill);
            const isUnlocked = unlocked.get(skill);
            const playable = Boolean(m && isUnlocked && PLAYABLE_SKILLS.includes(skill));
            const status = !isUnlocked ? '🔒 未解放' : !m ? 'いない' : !PLAYABLE_SKILLS.includes(skill) ? '準備中' : null;
            return (
              <button
                key={skill}
                type="button"
                className="monster-card"
                disabled={!playable}
                onClick={() => m && onFight(m)}
              >
                <MonsterArt skill={skill} image={isUnlocked ? m?.image : null} size="small" dim={!playable} />
                <span className="monster-card__body">
                  <span className="monster-card__name">{m?.name ?? '？？？'}</span>
                  <span className="monster-card__meta">
                    {SKILL_LABELS[skill]}
                    {m && playable && `　HP ${m.hp}`}
                  </span>
                </span>
                {status && <span className="monster-card__status">{status}</span>}
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
