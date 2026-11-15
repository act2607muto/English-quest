import { useCallback, useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import { fetchIsAdmin, fetchTown } from './lib/content';
import { loadPlayer, type Player } from './lib/game/player';
import type { MonsterRow } from './lib/questionFile';
import { isSupabaseConfigured } from './lib/supabase';
import { BattleScreen, type BattleResult } from './screens/BattleScreen';
import { FieldScreen } from './screens/FieldScreen';
import { ImportScreen } from './screens/ImportScreen';
import { LoginScreen } from './screens/LoginScreen';
import { MicTestScreen } from './screens/MicTestScreen';
import { ResultScreen } from './screens/ResultScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { StatusScreen } from './screens/StatusScreen';
import { TownScreen } from './screens/TownScreen';

/** 毎日の流れは「街 → 街の外 → 戦闘 → 戦闘結果 → 街」 */
type Route =
  | { name: 'town' }
  | { name: 'status' }
  | { name: 'field' }
  | { name: 'battle'; monster: MonsterRow; before: Player; key: number }
  | { name: 'result'; result: BattleResult; before: Player }
  | { name: 'settings' }
  | { name: 'import' }
  | { name: 'mic-test' };

export function App() {
  if (!isSupabaseConfigured) return <SetupNeeded />;
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}

function Gate() {
  const { loading, session } = useAuth();
  if (loading) return <Loading />;
  if (!session) return <LoginScreen />;
  return <Game />;
}

function Game() {
  const [route, setRoute] = useState<Route>({ name: 'town' });
  const [player, setPlayer] = useState<Player | null>(null);
  const [townScene, setTownScene] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const p = await loadPlayer();
    setPlayer(p);
    return p;
  }, []);

  useEffect(() => {
    reload()
      .then((p) => fetchTown(p.currentTownId))
      .then((t) => setTownScene(t?.scene ?? ''))
      .catch((err) => setError(err instanceof Error ? err.message : String(err)));
    fetchIsAdmin()
      .then(setIsAdmin)
      .catch(() => setIsAdmin(false));
  }, [reload]);

  // アプリに戻ってきたとき（日付が変わったときなど）に、低下を計算し直す
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && route.name === 'town') void reload().catch(() => {});
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [reload, route.name]);

  if (error) {
    return (
      <main className="screen screen--center">
        <section className="window">
          <p className="message message--error">記録を読み込めませんでした（{error}）</p>
          <button className="command" type="button" onClick={() => location.reload()}>
            ▶ 読み込み直す
          </button>
        </section>
      </main>
    );
  }
  if (!player) return <Loading />;

  const go = (r: Route) => {
    window.scrollTo(0, 0);
    setRoute(r);
  };
  const toTown = () => {
    void reload().catch(() => {});
    go({ name: 'town' });
  };
  const fight = (monster: MonsterRow) => go({ name: 'battle', monster, before: player, key: Date.now() });

  switch (route.name) {
    case 'status':
      return <StatusScreen player={player} onBack={() => go({ name: 'town' })} />;
    case 'field':
      return <FieldScreen player={player} onFight={fight} onBack={() => go({ name: 'town' })} />;
    case 'battle':
      return (
        <BattleScreen
          key={route.key}
          monster={route.monster}
          player={route.before}
          isAdmin={isAdmin}
          onEnd={(result) => {
            void reload()
              .catch(() => player)
              .then(() => go({ name: 'result', result, before: route.before }));
          }}
          onRunAway={() => {
            void reload().catch(() => {});
            go({ name: 'field' });
          }}
        />
      );
    case 'result':
      return (
        <ResultScreen
          result={route.result}
          before={route.before}
          after={player}
          onAgain={() => fight(route.result.monster)}
          onField={() => go({ name: 'field' })}
          onTown={toTown}
        />
      );
    case 'settings':
      return (
        <SettingsScreen
          isAdmin={isAdmin}
          onImport={() => go({ name: 'import' })}
          onMicTest={() => go({ name: 'mic-test' })}
          onBack={() => go({ name: 'town' })}
        />
      );
    case 'import':
      return <ImportScreen onBack={() => go({ name: 'settings' })} />;
    case 'mic-test':
      return <MicTestScreen onBack={() => go({ name: 'settings' })} />;
    default:
      return (
        <TownScreen
          player={player}
          townScene={townScene}
          onField={() => go({ name: 'field' })}
          onStatus={() => go({ name: 'status' })}
          onSettings={() => go({ name: 'settings' })}
        />
      );
  }
}

function Loading() {
  return (
    <main className="screen screen--center">
      <p>読み込み中…</p>
    </main>
  );
}

function SetupNeeded() {
  return (
    <main className="screen screen--center">
      <section className="window">
        <h2 className="window__title">設定が必要です</h2>
        <p>
          <code>.env.example</code> を <code>.env.local</code> という名前でコピーし、Supabase の
          Project URL と publishable key を入れてください。
        </p>
        <p>入れたら開発用サーバーを起動し直します。</p>
      </section>
    </main>
  );
}
