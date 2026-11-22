import { useEffect, useMemo, useState } from 'react';
import { fetchAdminStats, type AdminStats } from '../lib/content';
import { daysBetween, effectiveExp, levelFromExp, localDate, overallLevel } from '../lib/game/growth';
import { SKILLS, SKILL_LABELS, type Skill } from '../lib/skills';

type User = AdminStats['users'][number];
type HardQuestion = AdminStats['hard_questions'][number];

/** 表で見せる日数（新しい日から） */
const DAILY_ROWS = 14;
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];
const FORMAT_LABELS: Record<string, string> = {
  choice4: '4択',
  translate: '英訳',
  respond: '答える',
  order: '並べかえ',
  dictation: '書き取り',
};

/** 「11/17（月）」の形 */
function dayLabel(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return `${m}/${d}（${WEEKDAYS[new Date(y, m - 1, d).getDay()]}）`;
}

function percent(correct: number, total: number): string {
  return total > 0 ? `${Math.round((correct / total) * 100)}%` : '—';
}

/** 「今日」「きのう」「3日前」 */
function agoLabel(iso: string | null, today: string): string {
  if (!iso) return 'まだ';
  const day = localDate(new Date(iso));
  const n = daysBetween(day, today);
  const date = dayLabel(day);
  if (n <= 0) return `${date}・今日`;
  if (n === 1) return `${date}・きのう`;
  return `${date}・${n}日前`;
}

/** 総合レベル（自分の画面と同じ計算。装備の猶予は入れないので、目安） */
function overallOf(user: User, today: string): number {
  const levels = user.skills.map((s) => {
    const exp = effectiveExp({ exp: s.exp, maxExp: s.max_exp, lastPracticedAt: s.last_practiced_at }, today);
    return { level: levelFromExp(exp), unlocked: s.unlocked, practiced: exp > 0 || s.last_practiced_at !== null };
  });
  return overallLevel(levels.filter((l) => l.practiced));
}

/**
 * みんなの記録（管理者だけ）。登録した人の数、日ごとに練習した人の数、一人ずつの進み具合、
 * 街と能力値ごとの正解率、まちがえやすい問題、ボスを倒した人の数。設定から開く。
 * メールアドレスは出さない（登録した順の番号と主人公の名前で見分ける）。
 */
export function AdminStatsScreen({ onBack }: { onBack: () => void }) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminStats()
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : String((err as { message?: string })?.message ?? err)));
  }, []);

  const townName = useMemo(() => {
    const names = new Map((stats?.towns ?? []).map((t) => [t.id, t.name ?? t.scene]));
    return (id: string | null) => (id ? (names.get(id) ?? id) : '—');
  }, [stats]);

  return (
    <main className="screen">
      <section className="window">
        <h2 className="window__title">みんなの記録</h2>
        <p className="note">管理者だけが見られます。メールアドレスは出さず、登録した順の番号と主人公の名前で表します。日付は日本の時間です。</p>
        {error && <p className="message message--error">読み込めませんでした（{error}）</p>}
        {!stats && !error && <p>読み込み中…</p>}
        {stats && <Summary stats={stats} />}
      </section>

      {stats && <Daily stats={stats} />}
      {stats && <Users stats={stats} townName={townName} />}
      {stats && <TownSkills stats={stats} townName={townName} />}
      {stats && <Bosses stats={stats} townName={townName} />}
      {stats && <HardQuestions stats={stats} townName={townName} />}

      <button className="command" type="button" onClick={onBack}>
        ▶ 設定にもどる
      </button>
    </main>
  );
}

/** 数字のまとめ */
function Summary({ stats }: { stats: AdminStats }) {
  const week = stats.daily.slice(-7);
  const today = stats.daily[stats.daily.length - 1];
  const weekQuestions = week.reduce((s, d) => s + d.questions, 0);
  const weekCorrect = week.reduce((s, d) => s + d.correct, 0);
  const weekUsers = stats.users.filter((u) => u.active_days_7 > 0).length;
  const everUsers = stats.users.filter((u) => u.battles > 0).length;
  const tiles: [string, string][] = [
    ['登録した人', `${stats.users.length} 人`],
    ['今日練習した人', `${today?.users ?? 0} 人`],
    ['この7日に練習した人', `${weekUsers} 人`],
    ['この7日に解いた問題', `${weekQuestions} 問`],
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
      <p className="note">
        一度でも練習した人：{everUsers} 人／この7日の正解率：{percent(weekCorrect, weekQuestions)}
      </p>
    </>
  );
}

/** この2週間の、日ごとの人数と問題数（新しい日から） */
function Daily({ stats }: { stats: AdminStats }) {
  const rows = stats.daily.slice(-DAILY_ROWS).reverse();
  const maxUsers = Math.max(1, ...rows.map((d) => d.users));
  return (
    <section className="window">
      <h2 className="window__title">この2週間</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>日付</th>
            <th>練習した人</th>
            <th>問題</th>
            <th>正解率</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((d) => (
            <tr key={d.day}>
              <td>{dayLabel(d.day)}</td>
              <td>
                <span className="admin-bar" style={{ width: `${(d.users / maxUsers) * 48}px` }} aria-hidden="true" />
                {d.users}
              </td>
              <td>{d.questions}</td>
              <td>{percent(d.correct, d.questions)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

/** 一人ずつ（最後に練習した日が新しい順。まだ練習していない人は最後） */
function Users({ stats, townName }: { stats: AdminStats; townName: (id: string | null) => string }) {
  const users = [...stats.users].sort((a, b) => {
    if (a.last_fought_at && b.last_fought_at) return b.last_fought_at.localeCompare(a.last_fought_at);
    if (a.last_fought_at) return -1;
    if (b.last_fought_at) return 1;
    return a.no - b.no;
  });
  return (
    <section className="window">
      <h2 className="window__title">一人ずつ</h2>
      <p className="note">総合レベルは、装備の効果を入れない目安です。</p>
      <ul className="admin-users">
        {users.map((u) => (
          <li key={u.no} className="admin-user">
            <p className="admin-user__name">
              No.{u.no}　{u.hero_name ?? '（名前をまだつけていない）'}
              {u.is_admin && <span className="admin-user__tag">管理者</span>}
            </p>
            <table className="stats">
              <tbody>
                <tr>
                  <th>総合レベル</th>
                  <td>Lv {overallOf(u, stats.today)}</td>
                </tr>
                <tr>
                  <th>今いる街</th>
                  <td>{townName(u.current_town_id)}</td>
                </tr>
                <tr>
                  <th>最後に練習した日</th>
                  <td>{agoLabel(u.last_fought_at, stats.today)}</td>
                </tr>
                <tr>
                  <th>練習した日</th>
                  <td>
                    7日のうち {u.active_days_7} 日・計 {u.active_days} 日
                  </td>
                </tr>
                <tr>
                  <th>解いた問題</th>
                  <td>
                    {u.questions} 問（正解率 {percent(u.correct, u.questions)}）
                  </td>
                </tr>
                <tr>
                  <th>倒したボス</th>
                  <td>{u.defeated_bosses.length} 体</td>
                </tr>
                <tr>
                  <th>登録した日</th>
                  <td>{dayLabel(localDate(new Date(u.joined_at)))}</td>
                </tr>
              </tbody>
            </table>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** 街ごとの、能力値ごとの正解率（まだだれも答えていない街は出さない） */
function TownSkills({ stats, townName }: { stats: AdminStats; townName: (id: string | null) => string }) {
  const rowsOf = (townId: string) => {
    const order: (Skill | 'wordbook')[] = [...SKILLS, 'wordbook'];
    return stats.skills
      .filter((r) => r.town_id === townId)
      .sort((a, b) => order.indexOf(a.skill) - order.indexOf(b.skill));
  };
  const towns = stats.towns.filter((t) => rowsOf(t.id).some((r) => r.correct + r.wrong > 0));
  return (
    <section className="window">
      <h2 className="window__title">街と能力値ごとの正解率</h2>
      <p className="note">回数は、全員が答えた回数の合計です。「答えた問題」は、だれかが1回以上答えた問題の数です。</p>
      {towns.length === 0 && <p>まだだれも答えていません。</p>}
      {towns.map((t) => (
        <div key={t.id} className="admin-town">
          <h3 className="admin-town__name">{townName(t.id)}</h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>能力値</th>
                <th>正解率</th>
                <th>回数</th>
                <th>答えた問題</th>
              </tr>
            </thead>
            <tbody>
              {rowsOf(t.id).map((r) => (
                <tr key={r.skill}>
                  <td>{r.skill === 'wordbook' ? '単語の書庫' : SKILL_LABELS[r.skill]}</td>
                  <td>{percent(r.correct, r.correct + r.wrong)}</td>
                  <td>{r.correct + r.wrong}</td>
                  <td>
                    {r.answered_questions}/{r.total_questions}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </section>
  );
}

/** ボスを倒した人の数 */
function Bosses({ stats, townName }: { stats: AdminStats; townName: (id: string | null) => string }) {
  return (
    <section className="window">
      <h2 className="window__title">ボスを倒した人</h2>
      <table className="admin-table admin-table--wrap">
        <tbody>
          {stats.bosses.map((b) => (
            <tr key={b.id}>
              <td>
                {b.name}
                <span className="note">（{townName(b.town_id)}）</span>
              </td>
              <td>{b.users} 人</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

/** 問題の見出し（文があれば文、リスニングは読み上げる英文、なければ指示文） */
function questionText(q: HardQuestion): string {
  const text = q.sentence ?? q.audio_text ?? q.prompt;
  return text.length > 120 ? `${text.slice(0, 120)}…` : text;
}

function correctAnswer(q: HardQuestion): string | null {
  if (q.choices && q.answer !== null && q.format === 'choice4') return q.choices[q.answer] ?? null;
  return q.model_answers?.[0] ?? null;
}

/** まちがえやすい問題 */
function HardQuestions({ stats, townName }: { stats: AdminStats; townName: (id: string | null) => string }) {
  return (
    <section className="window">
      <h2 className="window__title">まちがえやすい問題</h2>
      <p className="note">3回以上答えられた問題のうち、正解の割合が低いもの（30問まで）。直すときは、問題の ID で教材のスクリプトを探します。</p>
      {stats.hard_questions.length === 0 && <p>まだ数が足りません。</p>}
      <ol className="admin-questions">
        {stats.hard_questions.map((q) => {
          const answer = correctAnswer(q);
          return (
            <li key={q.id} className="admin-question">
              <p className="admin-question__meta">
                {townName(q.town_id)}・{q.wordbook ? '単語の書庫' : SKILL_LABELS[q.skill]}・{FORMAT_LABELS[q.format] ?? q.format}
                <code>{q.id}</code>
              </p>
              <p className="admin-question__text">{questionText(q)}</p>
              {answer && <p className="note">正解：{answer}</p>}
              <p className="admin-question__rate">
                正解率 {percent(q.correct, q.correct + q.wrong)}（{q.correct + q.wrong} 回・{q.users} 人）
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
