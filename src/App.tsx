import { useCallback, useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import { fetchIsAdmin, fetchTown } from './lib/content';
import { loadPlayer, type Player } from './lib/game/player';
import { loadTownStatus, type TownStatus } from './lib/game/town';
import type { Skill } from './lib/skills';
import type { MonsterRow, TownRow } from './lib/questionFile';
import { isSupabaseConfigured } from './lib/supabase';
import { BattleScreen, type BattleKind, type BattleResult } from './screens/BattleScreen';
import { BossScreen } from './screens/BossScreen';
import { FieldScreen } from './screens/FieldScreen';
import { ImportScreen } from './screens/ImportScreen';
import { LoginScreen } from './screens/LoginScreen';
import { MapScreen, type MapPosition } from './screens/MapScreen';
import { MicTestScreen } from './screens/MicTestScreen';
import { NameScreen } from './screens/NameScreen';
import { PasswordScreen } from './screens/PasswordScreen';
import { ResultScreen } from './screens/ResultScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { ShopScreen } from './screens/ShopScreen';
import { StatusScreen } from './screens/StatusScreen';
import { TownScreen } from './screens/TownScreen';

/** 戦闘を始めた場所（戦闘のあと、そこへもどる） */
type BattleFrom = 'map' | 'dungeon' | 'boss';

/**
 * 毎日の流れは「街 → 街の外（マップを歩いて出会う）→ 戦闘 → 戦闘結果 → 街」。
 * 練習したい能力値を選んで戦うときは「街 → スキルダンジョン（field）→ 戦闘」。
 */

type Route =
  | { name: 'town' }
  | { name: 'status' }
  | { name: 'map' }
  | { name: 'field' }
  | { name: 'shop' }
  | { name: 'boss' }
  | {
      name: 'battle';
      monster: MonsterRow;
      kind: BattleKind;
      skills: Skill[];
      before: Player;
      key: number;
      from: BattleFrom;
    }
  | { name: 'result'; result: BattleResult; before: Player; from: BattleFrom }
  | { name: 'settings' }
  | { name: 'hero-name' }
  | { name: 'password' }
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
  const [town, setTown] = useState<TownRow | null>(null);
  const [townStatus, setTownStatus] = useState<TownStatus | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  /** マップの上の位置（戦闘から戻ったとき、同じ場所から歩く。街に入ると忘れる） */
  const [mapPos, setMapPos] = useState<MapPosition | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const p = await loadPlayer();
    setPlayer(p);
    // 街の進み具合（ボスの条件、復習の数）は、読めなくても遊べるので失敗しても止めない
    loadTownStatus(p.currentTownId)
      .then(setTownStatus)
      .catch(() => {});
    return p;
  }, []);

  useEffect(() => {
    reload()
      .then((p) => fetchTown(p.currentTownId))
      .then((t) => setTown(t))
      .catch((err) => setError(err instanceof Error ? err.message : String(err)));
    // 起動直後はログインの更新と重なって失敗することがあるので、失敗したら少し待って1回だけやり直す
    fetchIsAdmin()
      .catch(() => new Promise<boolean>((resolve) => setTimeout(() => resolve(fetchIsAdmin()), 2000)))
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

  // 主人公の名前がまだないとき（最初のログインのあと）は、先に名前をつけてもらう
  if (player.heroName === null) return <NameScreen current={null} onSaved={reload} onBack={null} />;

  const go = (r: Route) => {
    window.scrollTo(0, 0);
    setRoute(r);
  };
  const toTown = () => {
    void reload().catch(() => {});
    setMapPos(null);
    go({ name: 'town' });
  };
  const fight = (monster: MonsterRow, kind: BattleKind, from: BattleFrom, skills?: Skill[]) =>
    go({
      name: 'battle',
      monster,
      kind,
      skills: skills ?? (monster.skill ? [monster.skill] : []),
      before: player,
      key: Date.now(),
      from,
    });
  /** 戦闘を始めた場所へもどる（ボスは街へ） */
  const backTo = (from: BattleFrom) => {
    if (from === 'boss') toTown();
    else go({ name: from === 'dungeon' ? 'field' : 'map' });
  };

  switch (route.name) {
    case 'status':
      return <StatusScreen player={player} onBack={() => go({ name: 'town' })} />;
    case 'shop':
      return <ShopScreen player={player} onChanged={reload} onBack={() => go({ name: 'town' })} />;
    case 'map':
      return (
        <MapScreen
          player={player}
          status={townStatus}
          position={mapPos}
          onMove={setMapPos}
          onEncounter={(m, kind) => fight(m, kind, 'map')}
          onChoose={() => go({ name: 'field' })}
          onTown={toTown}
        />
      );
    case 'field':
      return (
        <FieldScreen
          player={player}
          status={townStatus}
          onFight={(m, kind) => fight(m, kind, 'dungeon')}
          onBack={toTown}
        />
      );
    case 'boss':
      return (
        <BossScreen
          player={player}
          status={townStatus}
          onFight={(boss, skills) => fight(boss, 'boss', 'boss', skills)}
          onBack={toTown}
        />
      );
    case 'battle':
      return (
        <BattleScreen
          key={route.key}
          monster={route.monster}
          kind={route.kind}
          skills={route.skills}
          player={route.before}
          isAdmin={isAdmin}
          onEnd={(result) => {
            void reload()
              .catch(() => player)
              .then(() => go({ name: 'result', result, before: route.before, from: route.from }));
          }}
          onRunAway={() => {
            void reload().catch(() => {});
            backTo(route.from);
          }}
        />
      );
    case 'result':
      return (
        <ResultScreen
          result={route.result}
          before={route.before}
          after={player}
          onAgain={
            route.result.kind === 'normal'
              ? () => fight(route.result.monster, 'normal', route.from === 'dungeon' ? 'dungeon' : 'map')
              : null
          }
          onField={() => go({ name: route.from === 'dungeon' ? 'field' : 'map' })}
          fieldLabel={route.from === 'dungeon' ? 'スキルダンジョンへ' : '街の外へ'}
          onTown={toTown}
        />
      );
    case 'settings':
      return (
        <SettingsScreen
          isAdmin={isAdmin}
          onImport={() => go({ name: 'import' })}
          onMicTest={() => go({ name: 'mic-test' })}
          onHeroName={() => go({ name: 'hero-name' })}
          onPassword={() => go({ name: 'password' })}
          onBack={() => go({ name: 'town' })}
        />
      );
    case 'password':
      return <PasswordScreen onDone={() => go({ name: 'settings' })} onBack={() => go({ name: 'settings' })} />;
    case 'hero-name':
      return (
        <NameScreen
          current={player.heroName}
          onSaved={() => reload().then(() => go({ name: 'settings' }))}
          onBack={() => go({ name: 'settings' })}
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
          town={town}
          onField={() => go({ name: 'map' })}
          onDungeon={() => go({ name: 'field' })}
          onStatus={() => go({ name: 'status' })}
          onShop={() => go({ name: 'shop' })}
          onBoss={() => go({ name: 'boss' })}
          status={townStatus}
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
