import { Hexagon } from '../components/Hexagon';
import { describeEffect } from '../lib/game/equipment';
import { expForLevel } from '../lib/game/growth';
import type { Player } from '../lib/game/player';
import { MAX_LEVEL } from '../lib/game/rules';
import { SKILL_LABELS } from '../lib/skills';

/** ステータス：六角形、総合レベル、お金、装備 */
export function StatusScreen({ player, onBack }: { player: Player; onBack: () => void }) {
  return (
    <main className="screen">
      <section className="window">
        <h2 className="window__title">ステータス</h2>
        <Hexagon skills={player.skills} />
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
            <tr>
              <th>ぶき</th>
              <td>{player.weapon ? `${player.weapon.name}（${describeEffect(player.weapon.effect)}）` : 'なし'}</td>
            </tr>
            <tr>
              <th>ぼうぐ</th>
              <td>{player.armor ? `${player.armor.name}（${describeEffect(player.armor.effect)}）` : 'なし'}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="window">
        <h2 className="window__title">のうりょく</h2>
        <table className="stats">
          <tbody>
            {player.skills.map((s) => (
              <tr key={s.skill}>
                <th>{SKILL_LABELS[s.skill]}</th>
                <td>
                  {!s.unlocked
                    ? '未解放'
                    : s.level >= MAX_LEVEL
                      ? `Lv ${s.level}`
                      : `Lv ${s.level}　つぎまで ${expForLevel(s.level + 1) - s.exp}`}
                  {s.unlocked && s.daysUntilDecay !== null && s.daysUntilDecay <= 0 && (
                    <span className="decay">（低下中）</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <button className="command" type="button" onClick={onBack}>
        ▶ 街にもどる
      </button>
    </main>
  );
}
