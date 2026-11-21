import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { fetchIsAdmin } from '../lib/content';
import {
  getBgmOn,
  getDpadSide,
  getNoEncounters,
  getSfxOn,
  setBgmOn,
  setDpadSide,
  setNoEncounters,
  setSfxOn,
  type DpadSide,
} from '../lib/preferences';
import { bgmSettingChanged, playSfx } from '../lib/sound';

/** 設定。問題文に使う自分の名前・音声の速さは、この後の手順で足す */
export function SettingsScreen({
  isAdmin,
  onImport,
  onMicTest,
  onHeroName,
  onPassword,
  onGuide,
  onBack,
}: {
  isAdmin: boolean;
  onImport: () => void;
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
  const [noEncounters, setNoEnc] = useState(getNoEncounters);
  const chooseEncounters = (off: boolean) => {
    setNoEncounters(off);
    setNoEnc(off);
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
      <button className="command" type="button" onClick={onBack}>
        ▶ 街にもどる
      </button>
    </main>
  );
}
