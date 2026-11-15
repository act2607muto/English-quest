import { hexagonScale } from '../lib/game/growth';
import { preciseLevel, type PlayerSkill } from '../lib/game/player';
import { SKILL_LABELS } from '../lib/skills';

/**
 * 6つの能力値の六角形。
 * 実線が今のレベル、点線が過去最高。下がった分がすき間として見える。
 * previous を渡すと、戦闘前の形を薄く重ねて、伸びた分を見せる。
 */

const W = 340;
const H = 300;
const CX = W / 2;
const CY = H / 2 + 4;
const R = 100;

function point(i: number, ratio: number): [number, number] {
  const a = ((-90 + 60 * i) * Math.PI) / 180;
  return [CX + Math.cos(a) * R * ratio, CY + Math.sin(a) * R * ratio];
}

function polygon(ratios: number[]): string {
  return ratios.map((r, i) => point(i, r).map((v) => v.toFixed(1)).join(',')).join(' ');
}

export function Hexagon({ skills, previous }: { skills: PlayerSkill[]; previous?: PlayerSkill[] }) {
  const highest = Math.max(...skills.map((s) => Math.max(s.level, s.maxLevel)));
  const scale = hexagonScale(highest);
  const ratio = (level: number) => Math.min(1, level / scale);

  const now = skills.map((s) => (s.unlocked ? ratio(preciseLevel(s.exp)) : 0));
  // 過去最高は整数のレベルで描く（max_exp から求めたもの）
  const best = skills.map((s) => (s.unlocked ? ratio(Math.max(s.maxLevel, preciseLevel(s.exp))) : 0));
  const before = previous?.map((s) => (s.unlocked ? ratio(preciseLevel(s.exp)) : 0));

  return (
    <figure className="hexagon">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={describe(skills)}>
        {[0.25, 0.5, 0.75, 1].map((r) => (
          <polygon key={r} points={polygon(Array(6).fill(r))} className="hexagon__grid" />
        ))}
        {skills.map((_, i) => {
          const [x, y] = point(i, 1);
          return <line key={i} x1={CX} y1={CY} x2={x} y2={y} className="hexagon__grid" />;
        })}
        <polygon points={polygon(best)} className="hexagon__best" />
        {before && <polygon points={polygon(before)} className="hexagon__before" />}
        <polygon points={polygon(now)} className="hexagon__now" />
        {skills.map((s, i) => {
          const [x, y] = point(i, 1.27);
          const anchor = Math.abs(x - CX) < 4 ? 'middle' : x > CX ? 'start' : 'end';
          const dx = anchor === 'start' ? -18 : anchor === 'end' ? 18 : 0;
          return (
            <text
              key={s.skill}
              x={x + dx}
              y={y}
              textAnchor={anchor}
              className={s.unlocked ? 'hexagon__label' : 'hexagon__label hexagon__label--locked'}
            >
              <tspan x={x + dx} dy="-0.2em">
                {SKILL_LABELS[s.skill]}
              </tspan>
              <tspan x={x + dx} dy="1.2em" className="hexagon__value">
                {s.unlocked ? `Lv ${s.level}` : '未解放'}
              </tspan>
            </text>
          );
        })}
      </svg>
      <figcaption className="hexagon__caption">
        目盛りの上限 Lv {scale}　<span className="hexagon__key-now">━</span> 今
        <span className="hexagon__key-best">┅</span> 過去最高
      </figcaption>
    </figure>
  );
}

function describe(skills: PlayerSkill[]): string {
  return skills
    .map((s) => `${SKILL_LABELS[s.skill]} ${s.unlocked ? `レベル${s.level}（過去最高${s.maxLevel}）` : '未解放'}`)
    .join('、');
}
