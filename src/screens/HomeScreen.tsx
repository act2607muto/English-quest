import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { fetchAdventureState, fetchSkillStats, type AdventureState, type SkillStat } from '../lib/records';
import { SKILLS, SKILL_LABELS } from '../lib/skills';

/**
 * 仮のホーム画面。ログインと記録の読み込みがつながったことを確かめる。
 * 第1段階の手順2以降で、街の画面に置き換える。
 */
export function HomeScreen({ onOpenMicTest }: { onOpenMicTest: () => void }) {
  const { session, signOut } = useAuth();
  const [stats, setStats] = useState<SkillStat[] | null>(null);
  const [adventure, setAdventure] = useState<AdventureState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchSkillStats(), fetchAdventureState()])
      .then(([s, a]) => {
        setStats(s);
        setAdventure(a);
      })
      .catch((err) => setError(err instanceof Error ? err.message : String(err)));
  }, []);

  const bySkill = new Map(stats?.map((s) => [s.skill, s]));

  return (
    <main className="screen">
      <section className="window">
        <p>ログイン中：{session?.user.email}</p>
        {adventure && <p>所持金：{adventure.gold} G</p>}
      </section>

      <section className="window">
        <h2 className="window__title">のうりょく</h2>
        {error && <p className="message message--error">記録を読み込めませんでした（{error}）</p>}
        {!stats && !error && <p>読み込み中…</p>}
        {stats && stats.length === 0 && (
          <p className="message message--error">
            能力値の記録がありません。docs/setup_supabase.md の手順5を確かめてください。
          </p>
        )}
        {stats && stats.length > 0 && (
          <table className="stats">
            <tbody>
              {SKILLS.map((skill) => {
                const s = bySkill.get(skill);
                return (
                  <tr key={skill}>
                    <th>{SKILL_LABELS[skill]}</th>
                    <td>{s?.unlocked ? `経験値 ${s.exp}` : '未解放'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <button className="command" type="button" onClick={onOpenMicTest}>
        ▶ マイクのテスト
      </button>

      <button className="command" type="button" onClick={signOut}>
        ▶ ログアウト
      </button>
    </main>
  );
}
