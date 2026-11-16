import { PLAYABLE_SKILLS } from '../lib/game/battle';
import { HeroArt } from '../components/HeroArt';
import { heroNameOf, type Player, type PlayerSkill } from '../lib/game/player';
import type { TownRow } from '../lib/questionFile';
import type { TownStatus } from '../lib/game/town';
import { SKILL_LABELS } from '../lib/skills';

/**
 * 街。冒険の拠点で、行き先を選ぶ。
 * 下がりかけの能力値を「今日のおすすめ」として出す。
 */
export function TownScreen({
  player,
  town,
  onField,
  onStatus,
  onShop,
  onBoss,
  onSettings,
  status,
}: {
  player: Player;
  town: TownRow | null;
  onField: () => void;
  onStatus: () => void;
  onShop: () => void;
  onBoss: () => void;
  onSettings: () => void;
  status: TownStatus | null;
}) {
  const playable = player.skills.filter((s) => s.unlocked && PLAYABLE_SKILLS.includes(s.skill));
  const revivalSkills = playable.filter((s) => (status?.dueBySkill[s.skill] ?? 0) > 0);
  const advice = recommendation(playable);
  const bossDefeated = player.defeatedBosses.length > 0;
  return (
    <main className="screen">
      <section className="town-banner" aria-label="街">
        {town?.background_image && (
          <div className="town-banner__scene">
            <img className="town-banner__bg" src={town.background_image} alt="" aria-hidden="true" />
            <HeroArt size={64} className="town-banner__hero" />
          </div>
        )}
        <div className="town-banner__text">
          <p className="town-banner__sub">はじまりの街</p>
          <h1 className="town-banner__name">{town?.scene ?? ''}</h1>
        </div>
      </section>

      <section className="window">
        <table className="stats">
          <tbody>
            <tr>
              <th>なまえ</th>
              <td>{heroNameOf(player)}</td>
            </tr>
            <tr>
              <th>総合レベル</th>
              <td>Lv {player.overall}</td>
            </tr>
            <tr>
              <th>HP</th>
              <td>{player.maxHp}</td>
            </tr>
            <tr>
              <th>おかね</th>
              <td>{player.gold} G</td>
            </tr>
          </tbody>
        </table>
      </section>

      {(advice || revivalSkills.length > 0) && (
        <section className="window">
          <h2 className="window__title">今日のおすすめ</h2>
          {revivalSkills.length > 0 && (
            <p>
              街の外に{names(revivalSkills)}の復活モンスターが現れています。倒すと、おかねが多めに入ります。
            </p>
          )}
          {advice && <p>{advice}</p>}
        </section>
      )}

      <nav className="window commands" aria-label="行き先">
        <button className="command command--plain" type="button" onClick={onField}>
          ▶ 街の外へ
        </button>
        <button className="command command--plain" type="button" onClick={onStatus}>
          ▶ ステータス
        </button>
        <button className="command command--plain" type="button" onClick={onShop}>
          ▶ 店
        </button>
        <button className="command command--plain" type="button" onClick={onBoss}>
          ▶ ボス
          {status &&
            (bossDefeated
              ? '（たおした）'
              : status.bossUnlocked
                ? '（挑める！）'
                : `（あと ${Math.max(0, status.needed - status.correctOnce)} 問）`)}
        </button>
        <button className="command command--plain" type="button" onClick={onSettings}>
          ▶ 設定
        </button>
      </nav>
    </main>
  );
}

function recommendation(skills: PlayerSkill[]): string | null {
  const decaying = skills.filter((s) => s.daysUntilDecay !== null && s.daysUntilDecay <= 0);
  if (decaying.length > 0) {
    return `${names(decaying)}が下がり始めています。今日練習すると、下がるのが止まります。`;
  }
  const soon = skills.filter((s) => s.daysUntilDecay === 1);
  if (soon.length > 0) return `${names(soon)}は、明日から下がり始めます。`;
  const never = skills.filter((s) => s.daysUntilDecay === null);
  if (never.length > 0) return `まだ${names(never)}のモンスターと戦っていません。街の外で戦ってみましょう。`;
  return null;
}

function names(skills: PlayerSkill[]): string {
  return skills.map((s) => SKILL_LABELS[s.skill]).join('・');
}
