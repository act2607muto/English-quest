import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import { BottomNav, type NavTab } from './components/BottomNav';
import { fetchIsAdmin, fetchTown, fetchTownQuestionIndex } from './lib/content';
import { moveToTown } from './lib/records';
import { loadPlayer, type Player } from './lib/game/player';
import { setHeroLook } from './lib/heroLook';
import { loadTownStatus, type TownStatus } from './lib/game/town';
import { loadWorldState, type WorldState } from './lib/game/worldMap';
import { getWorldMapDebug } from './lib/preferences';
import type { Skill } from './lib/skills';
import type { MonsterRow, TownRow } from './lib/questionFile';
import { isSupabaseConfigured } from './lib/supabase';
import { installAudio, playSfx, setBgm, type BgmName } from './lib/sound';
import { AdminStatsScreen } from './screens/AdminStatsScreen';
import { BattleScreen, type BattleKind, type BattleResult } from './screens/BattleScreen';
import { BestiaryScreen } from './screens/BestiaryScreen';
import { BossScreen } from './screens/BossScreen';
import { FieldScreen } from './screens/FieldScreen';
import { GuideScreen } from './screens/GuideScreen';
import { ImportScreen } from './screens/ImportScreen';
import { LoginScreen } from './screens/LoginScreen';
import { MapScreen, type MapPosition } from './screens/MapScreen';
import { MicTestScreen } from './screens/MicTestScreen';
import { NameScreen } from './screens/NameScreen';
import { NotesScreen } from './screens/NotesScreen';
import { PasswordScreen } from './screens/PasswordScreen';
import { RecordsScreen } from './screens/RecordsScreen';
import { ResultScreen } from './screens/ResultScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { ShopScreen } from './screens/ShopScreen';
import { StatusScreen } from './screens/StatusScreen';
import { TownScreen } from './screens/TownScreen';
import { WorldMapScreen } from './screens/WorldMapScreen';

/** 戦闘を始めた場所（戦闘のあと、そこへもどる） */
type BattleFrom = 'map' | 'dungeon' | 'boss';

/**
 * 毎日の流れは「街 → 街の外（マップを歩いて出会う）→ 戦闘 → 戦闘結果 → 街」。
 * 練習したい能力値を選んで戦うときは「街 → スキルダンジョン（field）→ 戦闘」。
 */

type Route =
  | { name: 'town' }
  | { name: 'status' }
  /** 記録（日ごとの練習量と能力値の推移）。ステータスから開く */
  | { name: 'records' }
  /** ふりかえりノート（書く・話す問題の、最近の答えと AI の助言）。ステータスから開く */
  | { name: 'notes' }
  | { name: 'bestiary' }
  | { name: 'map' }
  /** 旅の地図（点と道の世界地図）。3つ目の街に着くと、街の画面の右上と冒険のマップの下から開ける。back は開いた画面 */
  | { name: 'world'; back: 'town' | 'map' }
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
      /** 戦闘の背景の絵（なければ null） */
      background: string | null;
      /** background が読めないときに使う絵 */
      backgroundFallback: string | null;
    }
  | { name: 'result'; result: BattleResult; before: Player; from: BattleFrom; background: string | null }
  | { name: 'settings' }
  | { name: 'hero-name' }
  /** あそびかた。first は名前をつけた直後（読み終わると街へ。ほかは設定へもどる） */
  | { name: 'guide'; first: boolean; back?: 'town' | 'settings' }
  | { name: 'password' }
  | { name: 'import' }
  /** みんなの記録（管理者だけ）。設定から開く */
  | { name: 'admin-stats' }
  | { name: 'mic-test' };

// 音：最初のタップで音を使えるようにし、ボタンを押したら「ピッ」と鳴らす（lib/sound.ts）
installAudio();

/** 画面ごとの BGM（結果の画面は勝ち負けの音を鳴らすので止める。マイクのテストは録音に入らないよう止める） */
function bgmFor(route: Route): BgmName | null {
  switch (route.name) {
    case 'map':
    case 'world':
      return 'field';
    case 'battle':
      return route.kind === 'boss' ? 'boss' : 'battle';
    case 'result':
    case 'mic-test':
      return null;
    default:
      return 'town';
  }
}

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
  /** 別の街に着いたばかりのとき（街の画面に「着いた！」と、解放された能力値を出す。街を離れると消す） */
  const [arrival, setArrival] = useState<{ unlocked: Skill[]; worldMap: boolean } | null>(null);
  /** 旅の地図：どの街まで行ったか・使えるか（読めなくても遊べるので、失敗したら null のまま） */
  const [world, setWorld] = useState<WorldState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const p = await loadPlayer();
    setHeroLook(p.heroLook);
    setPlayer(p);
    // 街の進み具合（ボスの条件、復習の数）は、読めなくても遊べるので失敗しても止めない
    loadTownStatus(p.currentTownId)
      .then(setTownStatus)
      .catch(() => {});
    loadWorldState(p)
      .then(setWorld)
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

  // 画面が変わったら、その画面の BGM にする
  useEffect(() => {
    setBgm(player ? bgmFor(route) : null);
  }, [route, player]);

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

  // 主人公の名前がまだないとき（最初のログインのあと）は、先に名前をつけてもらい、続けて「あそびかた」を出す
  if (player.heroName === null) {
    return (
      <NameScreen
        current={null}
        currentLook={player.heroLook}
        onSaved={() => {
          setRoute({ name: 'guide', first: true });
          return reload();
        }}
        onBack={null}
      />
    );
  }

  // 旅の地図のボタンを出すか：3つ目の街に着いてから（管理者はデバッグの設定で、その前でも）
  const worldMapOpen = !!world && (world.unlocked || (isAdmin && getWorldMapDebug()));
  const go = (r: Route) => {
    window.scrollTo(0, 0);
    if (r.name !== 'town') setArrival(null);
    setRoute(r);
  };
  /**
   * 別の街へ移る（ボスの門の先や、マップの端の道から）。その街に問題がある能力値のうち、
   * まだ解放されていないもの（リーディングなど）を解放して、着いた街の画面を出す。
   */
  const travel = async (townId: string) => {
    playSfx('warp');
    try {
      const index = await fetchTownQuestionIndex(townId);
      if (index.length === 0) throw new Error('その街の教材が、まだ取り込まれていません');
      const unlocked = await moveToTown(townId, [...new Set(index.map((q) => q.skill))]);
      setTownStatus(null);
      const before = town;
      const wasWorldUnlocked = world?.unlocked ?? false;
      const p = await reload();
      // 旅の地図をはじめて手に入れたか（3つ目の街に、はじめて着いたとき）
      const nowWorld = await loadWorldState(p).catch(() => null);
      setWorld(nowWorld);
      const worldMap = !wasWorldUnlocked && (nowWorld?.unlocked ?? false);
      const next = await fetchTown(p.currentTownId);
      setTown(next);
      setMapPos(null);
      go({ name: 'town' });
      // 「着いた！」は、順番が先の街へ進んだときだけ出す（前の街へもどったときは、いつもの街の画面）
      const forward = !before || !next || next.sort_order > before.sort_order;
      if (forward || unlocked.length > 0 || worldMap) setArrival({ unlocked, worldMap });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };
  const toTown = () => {
    void reload().catch(() => {});
    setMapPos(null);
    go({ name: 'town' });
  };
  /**
   * 戦闘を始める。背景は、街の外なら出会った場所の絵、スキルダンジョンとボスは街ごとの決まった名前の絵
   * （public/battle/{街のID}-dungeon.png・-boss.png）。
   */
  const fight = (monster: MonsterRow, kind: BattleKind, from: BattleFrom, skills?: Skill[], background?: string | null) =>
    go({
      name: 'battle',
      monster,
      kind,
      skills: skills ?? (monster.skill ? [monster.skill] : []),
      before: player,
      key: Date.now(),
      from,
      // スキルダンジョンは、その能力値の部屋の絵（なければ、ダンジョン共通の絵）
      background:
        from === 'dungeon'
          ? monster.skill
            ? `/battle/${monster.town_id}-dungeon-${monster.skill}.png`
            : `/battle/${monster.town_id}-dungeon.png`
          : from === 'boss'
            ? `/battle/${monster.town_id}-boss.png`
            : (background ?? null),
      backgroundFallback: from === 'dungeon' ? `/battle/${monster.town_id}-dungeon.png` : null,
    });
  /** 画面の下の行き先のボタンを、その画面の下に出す（active はいま開いている画面） */
  const NAV_ROUTES: Record<NavTab, Route> = {
    map: { name: 'map' },
    dungeon: { name: 'field' },
    status: { name: 'status' },
    bestiary: { name: 'bestiary' },
    shop: { name: 'shop' },
  };
  const withNav = (active: NavTab | null, screen: ReactNode) => (
    <div className="with-tabbar">
      {screen}
      <BottomNav active={active} onSelect={(tab) => (tab !== active ? go(NAV_ROUTES[tab]) : window.scrollTo(0, 0))} />
    </div>
  );
  /** 戦闘を始めた場所へもどる（ボスは街の外のマップの、ボスのいる場所へ） */
  const backTo = (from: BattleFrom) => {
    go({ name: from === 'dungeon' ? 'field' : 'map' });
  };

  switch (route.name) {
    case 'bestiary':
      return withNav('bestiary', <BestiaryScreen player={player} onBack={() => go({ name: 'town' })} />);
    case 'status':
      return withNav(
        'status',
        <StatusScreen player={player} onRecords={() => go({ name: 'records' })} onNotes={() => go({ name: 'notes' })} onBack={() => go({ name: 'town' })} />,
      );
    case 'notes':
      return withNav('status', <NotesScreen onBack={() => go({ name: 'status' })} />);
    case 'records':
      return withNav('status', <RecordsScreen player={player} onBack={() => go({ name: 'status' })} />);
    case 'shop':
      return withNav('shop', <ShopScreen player={player} onChanged={reload} onBack={() => go({ name: 'town' })} />);
    case 'map':
      return (
        <MapScreen
          player={player}
          status={townStatus}
          position={mapPos}
          onMove={setMapPos}
          onEncounter={(m, kind, skills, background) => fight(m, kind, 'map', skills, background)}
          onChoose={() => go({ name: 'field' })}
          onTown={toTown}
          onBoss={() => go({ name: 'boss' })}
          onExit={(townId) => void travel(townId)}
          onWorldMap={worldMapOpen ? () => go({ name: 'world', back: 'map' }) : null}
        />
      );
    case 'world':
      return (
        <WorldMapScreen
          player={player}
          world={world}
          onTravel={(townId) => void travel(townId)}
          backLabel={route.back === 'map' ? '冒険にもどる' : '街にもどる'}
          // 冒険のマップから開いたときは、マップの同じ場所にもどる（位置は mapPos に残っている）
          onBack={() => go({ name: route.back })}
        />
      );
    case 'field':
      return withNav(
        'dungeon',
        <FieldScreen
          player={player}
          status={townStatus}
          onFight={(m, kind) => fight(m, kind, 'dungeon')}
          onBack={toTown}
        />,
      );
    case 'boss':
      return (
        <BossScreen
          player={player}
          status={townStatus}
          onFight={(boss, skills) => fight(boss, 'boss', 'boss', skills)}
          onTravel={(townId) => void travel(townId)}
          onBack={() => go({ name: 'map' })}
        />
      );
    case 'battle':
      return (
        <BattleScreen
          key={route.key}
          monster={route.monster}
          kind={route.kind}
          skills={route.skills}
          background={route.background}
          backgroundFallback={route.backgroundFallback}
          player={route.before}
          isAdmin={isAdmin}
          onEnd={(result) => {
            void reload()
              .catch(() => player)
              .then(() => go({ name: 'result', result, before: route.before, from: route.from, background: route.background }));
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
          // 「もう一度戦う」はスキルダンジョンだけ（冒険のマップは歩いて出会う形なので出さない。2026-11-21）
          onAgain={
            route.result.kind === 'normal' && route.from === 'dungeon'
              ? () => fight(route.result.monster, 'normal', 'dungeon', undefined, route.background)
              : null
          }
          onField={() => go({ name: route.from === 'dungeon' ? 'field' : 'map' })}
          fieldLabel={route.from === 'dungeon' ? 'スキルダンジョンへ' : '冒険へ'}
          // 冒険のマップ（ボスも）で勝ったあとは、マップにもどる。街へはマップの「街にもどる」で帰れる
          onTown={route.from === 'dungeon' || !route.result.won ? toTown : null}
        />
      );
    case 'settings':
      return (
        <SettingsScreen
          isAdmin={isAdmin}
          onImport={() => go({ name: 'import' })}
          onAdminStats={() => go({ name: 'admin-stats' })}
          onMicTest={() => go({ name: 'mic-test' })}
          onHeroName={() => go({ name: 'hero-name' })}
          onPassword={() => go({ name: 'password' })}
          onGuide={() => go({ name: 'guide', first: false })}
          onBack={() => go({ name: 'town' })}
        />
      );
    case 'guide':
      return (
        <GuideScreen
          player={player}
          first={route.first}
          onDone={() => go({ name: route.first ? 'town' : (route.back ?? 'settings') })}
        />
      );
    case 'password':
      return <PasswordScreen onDone={() => go({ name: 'settings' })} onBack={() => go({ name: 'settings' })} />;
    case 'hero-name':
      return (
        <NameScreen
          current={player.heroName}
          currentLook={player.heroLook}
          onSaved={() => reload().then(() => go({ name: 'settings' }))}
          onBack={() => go({ name: 'settings' })}
        />
      );
    case 'import':
      return <ImportScreen onBack={() => go({ name: 'settings' })} />;
    case 'admin-stats':
      return <AdminStatsScreen onBack={() => go({ name: 'settings' })} />;
    case 'mic-test':
      return <MicTestScreen onBack={() => go({ name: 'settings' })} />;
    default:
      return withNav(
        null,
        <TownScreen
          player={player}
          town={town}
          arrival={arrival}
          onStatus={() => go({ name: 'status' })}
          status={townStatus}
          onSettings={() => go({ name: 'settings' })}
          onGuide={() => go({ name: 'guide', first: false, back: 'town' })}
          onWorldMap={worldMapOpen ? () => go({ name: 'world', back: 'town' }) : null}
        />,
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
