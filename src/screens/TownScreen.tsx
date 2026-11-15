import { PLAYABLE_SKILLS } from '../lib/game/battle';
import type { Player, PlayerSkill } from '../lib/game/player';
import { SKILL_LABELS } from '../lib/skills';

/**
 * 街。冒険の拠点で、行き先を選ぶ。
 * 下がりかけの能力値を「今日のおすすめ」として出す。
 */
export function TownScreen({
  player,
  townScene,
  onField,
  onStatus,
  onSettings,
}: {
  player: Player;
  townScene: string;
  onField: () => void;
  onStatus: () => void;
  onSettings: () => void;
}) {
  const advice = recommendation(player.skills.filter((s) => s.unlocked && PLAYABLE_SKILLS.includes(s.skill)));
  return (
    <main className="screen">
      <section className="town-banner" aria-label="街">
        <p className="town-banner__sub">はじまりの街</p>
        <h1 className="town-banner__name">{townScene}</h1>
      </section>

      <section className="window">
        <table className="stats">
          <tbody>
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

      {advice && (
        <section className="window">
          <h2 className="window__title">今日のおすすめ</h2>
          <p>{advice}</p>
        </section>
      )}

      <nav className="window commands" aria-label="行き先">
        <button className="command command--plain" type="button" onClick={onField}>
          ▶ 街の外へ
        </button>
        <button className="command command--plain" type="button" onClick={onStatus}>
          ▶ ステータス
        </button>
        <button className="command command--plain" type="button" disabled>
          ▶ 店（準備中）
        </button>
        <button className="command command--plain" type="button" disabled>
          ▶ ボス（準備中）
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
