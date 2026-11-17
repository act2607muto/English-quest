import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { fetchIsAdmin } from '../lib/content';
import { getDpadSide, setDpadSide, type DpadSide } from '../lib/preferences';

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
          ▶ 主人公の名前を変える
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
      <section className="window" aria-labelledby="dpad-side-title">
        <h2 className="window__title" id="dpad-side-title">
          十字ボタンの位置
        </h2>
        <p className="note">街の外のマップで、歩くボタンを出す側です。左手で持つときは「左」が押しやすくなります。この端末に覚えておきます。</p>
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
      <button className="command" type="button" onClick={onBack}>
        ▶ 街にもどる
      </button>
    </main>
  );
}
