import { Hexagon } from '../components/Hexagon';
import { skillOf, type Player } from '../lib/game/player';
import { SKILL_LABELS, type Skill } from '../lib/skills';
import type { BattleResult } from './BattleScreen';

/** 戦闘結果：もらった経験値とお金、レベルアップ、六角形の変化 */
export function ResultScreen({
  result,
  before,
  after,
  onAgain,
  onField,
  onTown,
}: {
  result: BattleResult;
  before: Player;
  after: Player;
  onAgain: () => void;
  onField: () => void;
  onTown: () => void;
}) {
  const skill = result.monster.skill as Skill;
  const b = skillOf(before, skill);
  const a = skillOf(after, skill);
  const levelUp = a.level > b.level;
  const overallUp = after.overall > before.overall;

  return (
    <main className="screen">
      <section className="window">
        <h2 className="window__title">{result.won ? `${result.monster.name}を たおした！` : 'ちからつきた…'}</h2>
        <p>
          {result.total}問中 {result.correct}問 せいかい
          {result.flawless && '（ミスなし！）'}
        </p>
        <table className="stats">
          <tbody>
            <tr>
              <th>{SKILL_LABELS[skill]}の経験値</th>
              <td>
                +{result.exp}
                {result.weaponBonus && result.exp > 0 && <span className="note">（ぶきの効果つき）</span>}
              </td>
            </tr>
            <tr>
              <th>おかね</th>
              <td>{result.won ? `+${result.gold} G` : 'なし'}</td>
            </tr>
          </tbody>
        </table>
        {!result.won && <p className="note">正解した分の経験値は残っています。</p>}
        {levelUp && (
          <p className="levelup">
            {SKILL_LABELS[skill]}が Lv {b.level} → Lv {a.level} に上がった！
          </p>
        )}
        {overallUp && <p className="levelup">総合レベルが {after.overall} に上がった！</p>}
        {after.maxHp > before.maxHp && <p className="levelup">HPが {after.maxHp} に増えた！</p>}
        {result.saveFailed && (
          <p className="message message--error">通信できず、記録できなかった答えがあります。経験値が少なく見えるかもしれません。</p>
        )}
      </section>

      <section className="window">
        <Hexagon skills={after.skills} previous={before.skills} />
      </section>

      {result.won ? (
        <>
          <button className="command" type="button" onClick={onAgain}>
            ▶ もう一度 {result.monster.name}と戦う
          </button>
          <button className="command" type="button" onClick={onField}>
            ▶ ほかのモンスターを選ぶ
          </button>
          <button className="command" type="button" onClick={onTown}>
            ▶ 街にもどる
          </button>
        </>
      ) : (
        <>
          <button className="command" type="button" onClick={onTown}>
            ▶ 街にもどる
          </button>
          <button className="command" type="button" onClick={onField}>
            ▶ 街の外へ
          </button>
        </>
      )}
    </main>
  );
}
