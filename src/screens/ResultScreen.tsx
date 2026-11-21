import { useEffect } from 'react';
import { Hexagon } from '../components/Hexagon';
import { playSfx } from '../lib/sound';
import { heroNameOf, skillOf, type Player } from '../lib/game/player';
import { SKILLS, SKILL_LABELS } from '../lib/skills';
import { baseAttackOf } from '../lib/game/attack';
import type { BattleResult } from './BattleScreen';

/** 戦闘結果：もらった経験値とお金、レベルアップ、六角形の変化 */
export function ResultScreen({
  result,
  before,
  after,
  onAgain,
  onField,
  fieldLabel,
  onTown,
}: {
  result: BattleResult;
  before: Player;
  after: Player;
  onAgain: (() => void) | null;
  onField: () => void;
  /** 戦った場所にもどるボタンの文（街の外・スキルダンジョン） */
  fieldLabel: string;
  /** 街にもどる（冒険のマップで勝ったときは出さない。マップの「街にもどる」で帰れるので。2026-11-21） */
  onTown: (() => void) | null;
}) {
  const gained = SKILLS.filter((s) => (result.expBySkill[s] ?? 0) > 0);
  const levelUps = SKILLS.map((s) => [s, skillOf(before, s).level, skillOf(after, s).level] as const).filter(
    ([, b, a]) => a > b,
  );
  const overallUp = after.overall > before.overall;
  const firstBossWin =
    result.kind === 'boss' && result.won && !before.defeatedBosses.includes(result.monster.id);

  // 音：勝ったらファンファーレ、負けたら下がっていく音。レベルが上がっていれば、そのあとに上がる音
  const leveledUp = levelUps.length > 0 || overallUp;
  useEffect(() => {
    const timers = [window.setTimeout(() => playSfx(result.won ? 'win' : 'lose'), 50)];
    if (leveledUp) timers.push(window.setTimeout(() => playSfx('levelup'), 1500));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [result.won, leveledUp]);

  return (
    <main className="screen">
      <section className="window">
        <h2 className="window__title">{heroNameOf(after)}は {result.won ? `${result.monster.name}を たおした！` : 'ちからつきた…'}</h2>
        <p>
          {result.total}問中 {result.correct}問 せいかい
          {result.flawless && '（ミスなし！）'}
        </p>
        <table className="stats">
          <tbody>
            {gained.length === 0 && (
              <tr>
                <th>経験値</th>
                <td>なし</td>
              </tr>
            )}
            {gained.map((s) => (
              <tr key={s}>
                <th>{SKILL_LABELS[s]}の経験値</th>
                <td>+{result.expBySkill[s]}</td>
              </tr>
            ))}
            <tr>
              <th>おかね</th>
              <td>{result.won ? `+${result.gold} G` : 'なし'}</td>
            </tr>
          </tbody>
        </table>
        {!result.won && <p className="note">正解した分の経験値は残っています。</p>}
        {result.rewardExp > 0 && (
          <p className="levelup">
            {result.monster.name}から、おまけの経験値 {result.rewardExp}！（出た能力値で分けて入りました）
          </p>
        )}
        {firstBossWin && (
          <p className="levelup">
            {result.monster.name}を はじめて たおした！ 次の街への道が開けた。ボスのいた場所から、門の先へ進めます。
          </p>
        )}
        {levelUps.map(([s, b, a]) => (
          <p key={s} className="levelup">
            {SKILL_LABELS[s]}が Lv {b} → Lv {a} に上がった！
          </p>
        ))}
        {overallUp && <p className="levelup">総合レベルが {after.overall} に上がった！</p>}
        {baseAttackOf(after) > baseAttackOf(before) && <p className="levelup">こうげきが {baseAttackOf(after)} に上がった！</p>}
        {after.maxHp > before.maxHp &&<p className="levelup">HPが {after.maxHp} に増えた！</p>}
        {result.saveFailed && (
          <p className="message message--error">通信できず、記録できなかった答えがあります。経験値が少なく見えるかもしれません。</p>
        )}
      </section>

      <section className="window">
        <Hexagon skills={after.skills} previous={before.skills} />
      </section>

      {result.won ? (
        <>
          {onAgain && (
            <button className="command" type="button" onClick={onAgain}>
              ▶ もう一度 {result.monster.name}と戦う
            </button>
          )}
          <button className="command" type="button" onClick={onField}>
            ▶ {fieldLabel}
          </button>
          {onTown && (
            <button className="command" type="button" onClick={onTown}>
              ▶ 街にもどる
            </button>
          )}
        </>
      ) : (
        <>
          {onTown && (
            <button className="command" type="button" onClick={onTown}>
              ▶ 街にもどる
            </button>
          )}
          <button className="command" type="button" onClick={onField}>
            ▶ {fieldLabel}
          </button>
        </>
      )}
    </main>
  );
}
