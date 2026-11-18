import { useEffect, useMemo, useState } from 'react';
import { daysBetween, localDate } from '../lib/game/growth';
import { dailyTotals, levelHistory, practiceStreak, type BattleLogRow } from '../lib/game/history';
import type { Player } from '../lib/game/player';
import { fetchBattleHistory } from '../lib/records';
import { SKILL_LABELS, type Skill } from '../lib/skills';

/** 棒グラフ・線グラフで見せる日数 */
const BAR_DAYS = 14;
const LINE_DAYS = 30;
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

/** 「11/17（月）」の形 */
function dayLabel(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return `${m}/${d}（${WEEKDAYS[new Date(y, m - 1, d).getDay()]}）`;
}

/**
 * 記録：日ごとに何問解いたか（この2週間の棒グラフ）と、能力値のレベルの推移（30日の線グラフ）。
 * ステータスの画面から開く。もとは戦闘の履歴（にげた戦闘も、1問でも答えていれば入る）。
 */
export function RecordsScreen({ player, onBack }: { player: Player; onBack: () => void }) {
  const [logs, setLogs] = useState<BattleLogRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBattleHistory()
      .then(setLogs)
      .catch((err) => setError(err instanceof Error ? err.message : String(err)));
  }, []);

  return (
    <main className="screen">
      <section className="window">
        <h2 className="window__title">記録</h2>
        {error && <p className="message message--error">記録を読み込めませんでした（{error}）</p>}
        {!logs && !error && <p>読み込み中…</p>}
        {logs && <Summary logs={logs} />}
      </section>

      {logs && <DailyChart logs={logs} />}
      {logs && <LevelChart logs={logs} player={player} />}

      <button className="command" type="button" onClick={onBack}>
        ▶ ステータスにもどる
      </button>
    </main>
  );
}

/** 数字のまとめ（続けた日数・今日・この7日・正解率・これまで） */
function Summary({ logs }: { logs: BattleLogRow[] }) {
  const today = localDate();
  const week = dailyTotals(logs, 7, today);
  const weekQuestions = week.reduce((s, d) => s + d.questions, 0);
  const weekCorrect = week.reduce((s, d) => s + d.correct, 0);
  const todayQuestions = week[week.length - 1].questions;
  const total = logs.reduce((s, l) => s + l.questions, 0);
  const streak = practiceStreak(logs, today);
  const tiles: [string, string][] = [
    ['続けた日数', `${streak} 日`],
    ['今日', `${todayQuestions} 問`],
    ['この7日', `${weekQuestions} 問`],
    ['正解率（7日）', weekQuestions > 0 ? `${Math.round((weekCorrect / weekQuestions) * 100)} %` : '—'],
  ];
  return (
    <>
      <dl className="record-tiles">
        {tiles.map(([label, value]) => (
          <div key={label} className="record-tile">
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <p className="note">これまでに解いた問題：{total} 問</p>
    </>
  );
}

/** グラフの目盛りの上限（きりのいい数） */
function niceMax(value: number): number {
  for (const step of [10, 20, 30, 50, 100, 150, 200, 300, 500]) if (value <= step) return step;
  return Math.ceil(value / 500) * 500;
}

/** この2週間の、日ごとの問題数（棒グラフ）。棒を押すと、その日の数を下に出す */
function DailyChart({ logs }: { logs: BattleLogRow[] }) {
  const days = useMemo(() => dailyTotals(logs, BAR_DAYS), [logs]);
  const [selected, setSelected] = useState(days.length - 1);
  const W = 320;
  const H = 150;
  const left = 28;
  const bottom = 22;
  const top = 8;
  const plotH = H - top - bottom;
  const max = niceMax(Math.max(...days.map((d) => d.questions), 1));
  const slot = (W - left) / days.length;
  const barW = Math.max(6, Math.round(slot * 0.6));
  const y = (v: number) => top + plotH - (v / max) * plotH;
  const day = days[selected];

  return (
    <section className="window">
      <h2 className="window__title">この2週間の練習</h2>
      <svg className="record-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="この2週間の、日ごとに解いた問題の数">
        {[0, max / 2, max].map((v) => (
          <g key={v}>
            <line className="record-chart__grid" x1={left} x2={W} y1={y(v)} y2={y(v)} />
            <text className="record-chart__axis" x={left - 4} y={y(v) + 4} textAnchor="end">
              {v}
            </text>
          </g>
        ))}
        {days.map((d, i) => {
          const x = left + i * slot + (slot - barW) / 2;
          const h = (d.questions / max) * plotH;
          const isToday = i === days.length - 1;
          return (
            <g key={d.date}>
              {d.questions > 0 && (
                <rect
                  className={`record-chart__bar${i === selected ? ' record-chart__bar--on' : ''}`}
                  x={x}
                  y={y(d.questions)}
                  width={barW}
                  height={h}
                />
              )}
              {(i % 2 === 1 || isToday) && (
                <text className="record-chart__axis" x={x + barW / 2} y={H - 6} textAnchor="middle">
                  {isToday ? '今日' : Number(d.date.slice(8))}
                </text>
              )}
              {/* 押しやすいよう、棒より大きい当たりの範囲 */}
              <rect
                className="record-chart__hit"
                x={left + i * slot}
                y={0}
                width={slot}
                height={H}
                onClick={() => setSelected(i)}
                onPointerEnter={(e) => e.pointerType === 'mouse' && setSelected(i)}
              >
                <title>{`${dayLabel(d.date)} ${d.questions}問・正解 ${d.correct}`}</title>
              </rect>
            </g>
          );
        })}
      </svg>
      <p className="record-chart__info" aria-live="polite">
        {dayLabel(day.date)}　{day.questions > 0 ? `${day.questions} 問（正解 ${day.correct}）` : '練習なし'}
      </p>
      <details className="record-table">
        <summary>数字で見る</summary>
        <table className="stats">
          <tbody>
            {[...days].reverse().map((d) => (
              <tr key={d.date}>
                <th>{dayLabel(d.date)}</th>
                <td>{d.questions > 0 ? `${d.questions} 問（正解 ${d.correct}）` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  );
}

/** 能力値のレベルの推移（はじめて戦った日の前の日から、長くても30日の線グラフ）。上のボタンで能力値を選ぶ。線を押すと、その日のレベルを下に出す */
function LevelChart({ logs, player }: { logs: BattleLogRow[]; player: Player }) {
  const open = player.skills.filter((s) => s.unlocked);
  const [skill, setSkill] = useState<Skill>(open[0]?.skill ?? 'vocabulary');
  const current = player.skills.find((s) => s.skill === skill);
  // 線は、はじめて戦った日の前の日から（長くても30日）。それより前は記録がないので出さない
  const span = useMemo(() => {
    if (logs.length === 0) return 2;
    const first = localDate(new Date(logs[0].foughtAt));
    return Math.min(LINE_DAYS, Math.max(2, daysBetween(first, localDate()) + 2));
  }, [logs]);
  const series = useMemo(
    () => levelHistory(logs, skill, current?.exp ?? 0, span),
    [logs, skill, current?.exp, span],
  );
  const [selected, setSelected] = useState<number | null>(null);
  const W = 320;
  const H = 150;
  const left = 28;
  const right = 12;
  const bottom = 22;
  const top = 10;
  const plotW = W - left - right;
  const plotH = H - top - bottom;
  const minLv = Math.floor(Math.min(...series.map((p) => p.level)));
  const maxLv = Math.max(Math.ceil(Math.max(...series.map((p) => p.level))), minLv + 1);
  const x = (i: number) => left + (i / (series.length - 1)) * plotW;
  const y = (lv: number) => top + plotH - ((lv - minLv) / (maxLv - minLv)) * plotH;
  const path = series.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.level).toFixed(1)}`).join(' ');
  const step = maxLv - minLv <= 6 ? 1 : Math.ceil((maxLv - minLv) / 5);
  const ticks: number[] = [];
  for (let lv = minLv; lv <= maxLv; lv += step) ticks.push(lv);
  const shown = selected ?? series.length - 1;
  const point = series[shown];

  /** 押した・なぞった位置にいちばん近い日 */
  const pick = (clientX: number, rect: DOMRect) => {
    const vx = ((clientX - rect.left) / rect.width) * W;
    const i = Math.round(((vx - left) / plotW) * (series.length - 1));
    setSelected(Math.min(series.length - 1, Math.max(0, i)));
  };

  return (
    <section className="window">
      <h2 className="window__title">能力値の推移</h2>
      <div className="record-skills" role="radiogroup" aria-label="能力値">
        {open.map((s) => (
          <button
            key={s.skill}
            type="button"
            role="radio"
            aria-checked={s.skill === skill}
            className={`record-skill${s.skill === skill ? ' record-skill--on' : ''}`}
            onClick={() => {
              setSkill(s.skill);
              setSelected(null);
            }}
          >
            {SKILL_LABELS[s.skill]}
          </button>
        ))}
      </div>
      <svg
        className="record-chart"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${SKILL_LABELS[skill]}のレベルの推移`}
        onPointerDown={(e) => pick(e.clientX, e.currentTarget.getBoundingClientRect())}
        onPointerMove={(e) => (e.pointerType === 'mouse' || e.buttons > 0) && pick(e.clientX, e.currentTarget.getBoundingClientRect())}
      >
        {ticks.map((lv) => (
          <g key={lv}>
            <line className="record-chart__grid" x1={left} x2={W - right} y1={y(lv)} y2={y(lv)} />
            <text className="record-chart__axis" x={left - 4} y={y(lv) + 4} textAnchor="end">
              {lv}
            </text>
          </g>
        ))}
        <text className="record-chart__axis" x={left} y={H - 6} textAnchor="start">
          {Number(series[0].date.slice(5, 7))}/{Number(series[0].date.slice(8))}
        </text>
        <text className="record-chart__axis" x={W - right} y={H - 6} textAnchor="end">
          今日
        </text>
        <line className="record-chart__cursor" x1={x(shown)} x2={x(shown)} y1={top} y2={top + plotH} />
        <path className="record-chart__line" d={path} />
        <circle className="record-chart__dot" cx={x(shown)} cy={y(point.level)} r={4} />
      </svg>
      <p className="record-chart__info" aria-live="polite">
        {dayLabel(point.date)}　{SKILL_LABELS[skill]} Lv {Math.floor(point.level)}
        {point.level < 99 && `（つぎのレベルまで ${Math.round((point.level % 1) * 100)}%）`}
      </p>
      <p className="note">
        戦闘の記録から計算した、おおよそのレベルです（練習しない日に下がった分は入っていません）。
      </p>
    </section>
  );
}
