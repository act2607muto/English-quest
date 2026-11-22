import { useEffect, useState } from 'react';
import { MonsterArt } from '../components/MonsterArt';
import { fetchMonstersOfTown } from '../lib/content';
import { isRare } from '../lib/game/foes';
import { baseBossIdOf, isSecondForm } from '../lib/game/secondForm';
import { isWordbookMonster } from '../lib/game/wordbook';
import type { Player } from '../lib/game/player';
import type { MonsterRow } from '../lib/questionFile';
import { fetchMonsterRecords, type MonsterRecord } from '../lib/records';
import { SKILLS, SKILL_LABELS } from '../lib/skills';

/**
 * モンスター図鑑：この街のモンスターを並べる。
 * 戦ったことのあるモンスターは、絵・名前・説明・記録を出す。まだ出会っていないモンスターは、影と「？？？」だけ。
 * 復活モンスターは、もとのモンスターの記録に数える。
 * ボスの第二形態は、もとのボスを倒すと（＝第二形態まで倒すと）出る。戦った回数・倒した回数は、もとのボスを倒した回数。
 */
export function BestiaryScreen({ player, onBack }: { player: Player; onBack: () => void }) {
  const [monsters, setMonsters] = useState<MonsterRow[] | null>(null);
  const [records, setRecords] = useState<Map<string, MonsterRecord> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchMonstersOfTown(player.currentTownId), fetchMonsterRecords()])
      .then(([m, r]) => {
        setMonsters(sortForBook(m));
        setRecords(r);
      })
      .catch((err) => setError(err instanceof Error ? err.message : String(err)));
  }, [player.currentTownId]);

  /** 図鑑に出す記録（ボスの第二形態は、もとのボスを倒した記録から作る） */
  const recordOf = (m: MonsterRow): MonsterRecord | undefined => {
    if (!records) return undefined;
    if (!isSecondForm(m)) return records.get(m.id);
    const base = records.get(baseBossIdOf(m.id));
    return base && base.defeated > 0 ? { fought: base.defeated, defeated: base.defeated, firstDefeatedAt: base.firstDefeatedAt } : undefined;
  };
  const found = monsters && records ? monsters.filter((m) => (recordOf(m)?.fought ?? 0) > 0).length : 0;

  return (
    <main className="screen">
      <section className="window">
        <h2 className="window__title">モンスター図鑑</h2>
        <p>出会ったモンスターが、ここに記録されていきます。</p>
        {monsters && records && (
          <p className="levelup">
            見つけた数 {found} / {monsters.length}
          </p>
        )}
      </section>

      {error && <p className="message message--error">図鑑を読み込めませんでした（{error}）</p>}
      {!error && (!monsters || !records) && <p>読み込み中…</p>}

      {monsters &&
        records &&
        monsters.map((m, i) => {
          const r = recordOf(m);
          const met = (r?.fought ?? 0) > 0;
          return (
            <section key={m.id} className={`window bestiary-entry${met ? '' : ' bestiary-entry--unknown'}`}>
              <p className="bestiary-entry__no">No.{String(i + 1).padStart(3, '0')}</p>
              <div className="bestiary-entry__head">
                <span className="bestiary-entry__art">
                  <MonsterArt skill={m.skill} image={m.image} size="large" />
                </span>
                <div className="bestiary-entry__title">
                  <h3 className="bestiary-entry__name">{met ? m.name : '？？？'}</h3>
                  <p className="note">{met ? kindOf(m) : 'まだ出会っていない'}</p>
                </div>
              </div>
              {met && r && (
                <>
                  {m.description && <p className="bestiary-entry__text">{m.description}</p>}
                  <table className="stats">
                    <tbody>
                      <tr>
                        <th>HP</th>
                        <td>{m.hp}</td>
                      </tr>
                      <tr>
                        <th>おかね</th>
                        <td>{m.gold} G</td>
                      </tr>
                      {m.exp_reward > 0 && (
                        <tr>
                          <th>経験値のおまけ</th>
                          <td>{m.exp_reward}</td>
                        </tr>
                      )}
                      <tr>
                        <th>戦った回数</th>
                        <td>{r.fought} 回</td>
                      </tr>
                      <tr>
                        <th>倒した回数</th>
                        <td>{r.defeated} 回</td>
                      </tr>
                      <tr>
                        <th>はじめて倒した日</th>
                        <td>{r.firstDefeatedAt ? formatDate(r.firstDefeatedAt) : 'まだ'}</td>
                      </tr>
                    </tbody>
                  </table>
                </>
              )}
            </section>
          );
        })}

      <button className="command" type="button" onClick={onBack}>
        ▶ 街にもどる
      </button>
    </main>
  );
}

/** 図鑑の並び：能力値の順のモンスター → めずらしいモンスター → ボス */
function sortForBook(list: MonsterRow[]): MonsterRow[] {
  const rank = (m: MonsterRow) =>
    m.is_boss ? 2000 : isSecondForm(m) ? 2001 : isRare(m) ? 1000 + (m.encounter_rate ?? 0) * -100 : isWordbookMonster(m) ? 900 : SKILLS.indexOf(m.skill!);
  return [...list].sort((a, b) => rank(a) - rank(b) || a.id.localeCompare(b.id));
}

function kindOf(m: MonsterRow): string {
  if (m.is_boss) return 'この街のボス';
  if (isSecondForm(m)) return 'この街のボス（第二形態）';
  if (isRare(m)) return 'めずらしいモンスター';
  if (isWordbookMonster(m)) return '単語の書庫のモンスター';
  return m.skill ? `${SKILL_LABELS[m.skill]}のモンスター` : '';
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}
