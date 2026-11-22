import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { fetchIsAdmin } from '../lib/content';
import {
  getBgmOn,
  getDpadSide,
  getNoEncounters,
  getSfxOn,
  getWorldMapDebug,
  setBgmOn,
  setDpadSide,
  setNoEncounters,
  setSfxOn,
  setWorldMapDebug,
  type DpadSide,
} from '../lib/preferences';
import { bgmSettingChanged, playSfx } from '../lib/sound';
import { canSpeak, englishVoiceName, speakEnglish } from '../lib/speech';

/** 設定。問題文に使う自分の名前・音声の速さは、この後の手順で足す */
export function SettingsScreen({
  isAdmin,
  onImport,
  onAdminStats,
  onMicTest,
  onHeroName,
  onPassword,
  onGuide,
  onBack,
}: {
  isAdmin: boolean;
  onImport: () => void;
  onAdminStats: () => void;
  onMicTest: () => void;
  onHeroName: () => void;
  onPassword: () => void;
  onGuide: () => void;
  onBack: () => void;
}) {
  const { session, signOut } = useAuth();
  // 起動直後の確認に失敗していることがあるので、開くたびに確かめ直す
  const [admin, setAdmin] = useState(isAdmin);
  useEffect(() => {
    fetchIsAdmin()
      .then(setAdmin)
      .catch(() => {});
  }, []);
  const [dpadSide, setSide] = useState<DpadSide>(getDpadSide);
  const chooseSide = (side: DpadSide) => {
    setDpadSide(side);
    setSide(side);
  };
  const [bgm, setBgmState] = useState(getBgmOn);
  const chooseBgm = (on: boolean) => {
    setBgmOn(on);
    setBgmState(on);
    bgmSettingChanged();
  };
  const [sfx, setSfxState] = useState(getSfxOn);
  const chooseSfx = (on: boolean) => {
    setSfxOn(on);
    setSfxState(on);
    if (on) playSfx('coin');
  };
  // 英語の読み上げに使う声（声の一覧はあとから届くことがあるので、届いたら読み直す）
  const [voiceName, setVoiceName] = useState<string | null>(englishVoiceName);
  /** 少し待っても声が見つからなかった */
  const [voiceMissing, setVoiceMissing] = useState(false);
  useEffect(() => {
    if (!canSpeak) return;
    const update = () => window.setTimeout(() => setVoiceName(englishVoiceName()), 0);
    speechSynthesis.addEventListener?.('voiceschanged', update);
    update();
    const timer = window.setTimeout(() => setVoiceMissing(true), 2000);
    return () => {
      speechSynthesis.removeEventListener?.('voiceschanged', update);
      window.clearTimeout(timer);
    };
  }, []);
  const [noEncounters, setNoEnc] = useState(getNoEncounters);
  const chooseEncounters = (off: boolean) => {
    setNoEncounters(off);
    setNoEnc(off);
  };
  const [worldDebug, setWorldDebugState] = useState(getWorldMapDebug);
  const chooseWorldDebug = (on: boolean) => {
    setWorldMapDebug(on);
    setWorldDebugState(on);
  };
  return (
    <main className="screen">
      <section className="window">
        <h2 className="window__title">設定</h2>
        <p>ログイン中：{session?.user.email}</p>
      </section>
      <nav className="window commands" aria-label="設定の項目">
        <button className="command command--plain" type="button" onClick={onGuide}>
          ▶ あそびかた
        </button>
        {admin && (
          <button className="command command--plain" type="button" onClick={onImport}>
            ▶ 教材の取り込み
          </button>
        )}
        {admin && (
          <button className="command command--plain" type="button" onClick={onAdminStats}>
            ▶ みんなの記録
          </button>
        )}
        <button className="command command--plain" type="button" onClick={onHeroName}>
          ▶ 主人公の名前と見た目を変える
        </button>
        <button className="command command--plain" type="button" onClick={onPassword}>
          ▶ パスワードを変える
        </button>
        <button className="command command--plain" type="button" onClick={onMicTest}>
          ▶ マイクのテスト
        </button>
        <button className="command command--plain" type="button" onClick={() => void signOut()}>
          ▶ ログアウト
        </button>
      </nav>
      <section className="window" aria-labelledby="sound-title">
        <h2 className="window__title" id="sound-title">
          音
        </h2>
        <p className="note">
          この端末に覚えておきます。iPhone のマナーモードのときは鳴りません。リスニングの読み上げ中と録音中は、BGM が消えます。
        </p>
        {(
          [
            ['BGM', bgm, chooseBgm],
            ['効果音', sfx, chooseSfx],
          ] as const
        ).map(([label, value, choose]) => (
          <div key={label} className="sound-row">
            <span className="sound-row__label">{label}</span>
            <div className="choice-pair" role="group" aria-label={label}>
              {(
                [
                  [true, 'オン'],
                  [false, 'オフ'],
                ] as const
              ).map(([on, text]) => (
                <button
                  key={text}
                  type="button"
                  className={`command choice-pair__button${value === on ? ' choice-pair__button--on' : ''}`}
                  aria-pressed={value === on}
                  onClick={() => choose(on)}
                >
                  {value === on ? '● ' : '○ '}
                  {text}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className="sound-row">
          <span className="sound-row__label">英語の読み上げの声</span>
          <p className="note">
            {!canSpeak
              ? 'この端末では読み上げが使えません。'
              : voiceName
                ? voiceName
                : voiceMissing
                  ? '英語の声が見つかりません（端末の設定で英語の声を入れると使えます）。'
                  : '声を読み込んでいます…'}
          </p>
          <p className="note">Windows のパソコンでは、Edge で開くといちばん自然な声になります（Chrome でも Google の声になります）。</p>
          {canSpeak && (
            <button className="command command--listen" type="button" onClick={() => speakEnglish('Hello! Nice to meet you. How much is this jacket?')}>
              ▶ 聞いてみる
            </button>
          )}
        </div>
      </section>
      <section className="window" aria-labelledby="dpad-side-title">
        <h2 className="window__title" id="dpad-side-title">
          十字ボタンの位置
        </h2>
        <p className="note">冒険のマップで、歩くボタンを出す側です。左手で持つときは「左」が押しやすくなります。この端末に覚えておきます。</p>
        <div className="choice-pair" role="group" aria-labelledby="dpad-side-title">
          {(
            [
              ['left', '左'],
              ['right', '右'],
            ] as const
          ).map(([side, label]) => (
            <button
              key={side}
              type="button"
              className={`command choice-pair__button${dpadSide === side ? ' choice-pair__button--on' : ''}`}
              aria-pressed={dpadSide === side}
              onClick={() => chooseSide(side)}
            >
              {dpadSide === side ? '● ' : '○ '}
              {label}
            </button>
          ))}
        </div>
      </section>
      {admin && (
        <section className="window" aria-labelledby="debug-encounter-title">
          <h2 className="window__title" id="debug-encounter-title">
            デバッグ用：モンスターとの出会い
          </h2>
          <p className="note">
            管理者だけに出る設定です。「出会わない」にすると、冒険のマップを歩いてもモンスターに出会いません（マップや門を確かめるときに使います）。この端末に覚えておきます。
          </p>
          <div className="choice-pair" role="group" aria-labelledby="debug-encounter-title">
            {(
              [
                [false, '出会う'],
                [true, '出会わない'],
              ] as const
            ).map(([off, label]) => (
              <button
                key={label}
                type="button"
                className={`command choice-pair__button${noEncounters === off ? ' choice-pair__button--on' : ''}`}
                aria-pressed={noEncounters === off}
                onClick={() => chooseEncounters(off)}
              >
                {noEncounters === off ? '● ' : '○ '}
                {label}
              </button>
            ))}
          </div>
        </section>
      )}
      {admin && (
        <section className="window" aria-labelledby="debug-world-title">
          <h2 className="window__title" id="debug-world-title">
            デバッグ用：旅の地図
          </h2>
          <p className="note">
            管理者だけに出る設定です。旅の地図は、ふつうは3つ目の街に着くと使えるようになります。「使える」にすると、その前でも街の画面の右上に地図のボタンが出ます（行けるのは、行ったことのある街だけ）。この端末に覚えておきます。
          </p>
          <div className="choice-pair" role="group" aria-labelledby="debug-world-title">
            {(
              [
                [false, 'ふつう'],
                [true, '使える'],
              ] as const
            ).map(([on, label]) => (
              <button
                key={label}
                type="button"
                className={`command choice-pair__button${worldDebug === on ? ' choice-pair__button--on' : ''}`}
                aria-pressed={worldDebug === on}
                onClick={() => chooseWorldDebug(on)}
              >
                {worldDebug === on ? '● ' : '○ '}
                {label}
              </button>
            ))}
          </div>
        </section>
      )}
      <button className="command" type="button" onClick={onBack}>
        ▶ 街にもどる
      </button>
    </main>
  );
}
