import { useEffect, useState } from 'react';
import { MonsterArt } from '../components/MonsterArt';
import { fetchMonstersOfTown, fetchTowns } from '../lib/content';
import { bossFor, bossSkills } from '../lib/game/foes';
import type { Player } from '../lib/game/player';
import { BOSS_RECOMMEND_RATIO } from '../lib/game/rules';
import type { TownStatus } from '../lib/game/town';
import type { MonsterRow, TownRow } from '../lib/questionFile';
import { SKILL_LABELS, type Skill } from '../lib/skills';

/**
 * ボスへの入口。街の外のマップで、ボスのいる場所（ことだまの門）を踏むと開く。
 * いつでも挑める。街の問題の8割に1回以上正解するのは「おすすめの目安」として出す。
 * 出題は、練習した能力値の問題を混ぜたもの。倒すと、門をくぐって次の街（順番が次の街）へ進める。
 */
export function BossScreen({
  player,
  status,
  onFight,
  onTravel,
  onBack,
}: {
  player: Player;
  status: TownStatus | null;
  onFight: (boss: MonsterRow, skills: Skill[]) => void;
  /** 門をくぐって次の街へ（行き先の街のID） */
  onTravel: (townId: string) => void;
  onBack: () => void;
}) {
  const [boss, setBoss] = useState<MonsterRow | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  /** 次の街（順番が次の街。まだなければ null） */
  const [nextTown, setNextTown] = useState<TownRow | null>(null);

  useEffect(() => {
    fetchMonstersOfTown(player.currentTownId)
      .then((m) => setBoss(m.find((x) => x.is_boss) ?? null))
      .catch((err) => setError(err instanceof Error ? err.message : String(err)));
    fetchTowns()
      .then((towns) => {
        const here = towns.find((t) => t.id === player.currentTownId);
        setNextTown(here ? (towns.find((t) => t.sort_order > here.sort_order) ?? null) : null);
      })
      .catch(() => setNextTown(null));
  }, [player.currentTownId]);

  const skills = bossSkills(player, status?.skills);
  const defeated = boss ? player.defeatedBosses.includes(boss.id) : false;
  const rest = status ? Math.max(0, status.needed - status.correctOnce) : null;
  const ratio = status && status.total > 0 ? status.correctOnce / status.total : 0;

  return (
    <main className="screen">
      {error && <p className="message message--error">ボスを読み込めませんでした（{error}）</p>}
      {boss === undefined && !error && <p>読み込み中…</p>}
      {boss === null && (
        <section className="window">
          <p className="message message--error">
            この街にはまだボスがいません。「設定」→「教材の取り込み」で {player.currentTownId}_monsters.json を取り込み直してください。
          </p>
        </section>
      )}

      {boss && (
        <>
          <section className="window boss-gate">
            <MonsterArt skill={null} image={boss.image} size="huge" />
            <h2 className="boss-gate__name">{boss.name}</h2>
            <p className="note">
              HP {boss.hp}　出題：{skills.length > 0 ? skills.map((s) => SKILL_LABELS[s]).join('・') : '練習した能力値'}の混合
            </p>
            {defeated && (
              <p className="levelup">
                たおした！ {nextTown ? '門の先に、次の街への道が開けています。' : '次の街への道が開けています（次の街は準備中です）。'}
              </p>
            )}
          </section>

          <section className="window">
            <h2 className="window__title">おすすめの目安</h2>
            <p>この街の問題の{Math.round(BOSS_RECOMMEND_RATIO * 100)}%に1回以上正解してから挑むと、勝ちやすくなります。</p>
            {status ? (
              <>
                <div className="meter-bar" aria-hidden="true">
                  <span style={{ width: `${Math.min(100, ratio * 100)}%` }} />
                  <span className="meter-bar__goal" style={{ left: `${BOSS_RECOMMEND_RATIO * 100}%` }} />
                </div>
                <p>
                  正解した問題 {status.correctOnce} / {status.total}
                  {rest && rest > 0 ? `（目安まで あと ${rest} 問）` : '（目安クリア！）'}
                </p>
              </>
            ) : (
              <p>確かめています…</p>
            )}
          </section>

          {status && !status.bossReady && !defeated && (
            <p className="note">まだ目安に届いていません。挑むことはできます（負けても、正解した分の経験値は残ります）。</p>
          )}
          {skills.length > 0 ? (
            <button className="command command--boss" type="button" onClick={() => onFight(bossFor(boss, player), skills)}>
              {defeated ? `▶ もう一度挑む（${bossFor(boss, player).gold} G）` : `▶ ${boss.name}に挑む（${boss.gold} G）`}
            </button>
          ) : (
            <p className="message message--error">戦える能力値がありません。</p>
          )}
        </>
      )}

      {boss && defeated && nextTown && (
        <button className="command command--boss" type="button" onClick={() => onTravel(nextTown.id)}>
          ▶ 門をくぐって「{nextTown.name ?? nextTown.scene}」へ
        </button>
      )}
      <button className="command" type="button" onClick={onBack}>
        ▶ 引き返す
      </button>
    </main>
  );
}
