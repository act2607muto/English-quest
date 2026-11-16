import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { fetchIsAdmin } from '../lib/content';

/** 設定。問題文に使う自分の名前・音声の速さは、この後の手順で足す */
export function SettingsScreen({
  isAdmin,
  onImport,
  onCompare,
  onMicTest,
  onHeroName,
  onPassword,
  onBack,
}: {
  isAdmin: boolean;
  onImport: () => void;
  onCompare: () => void;
  onMicTest: () => void;
  onHeroName: () => void;
  onPassword: () => void;
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
  return (
    <main className="screen">
      <section className="window">
        <h2 className="window__title">設定</h2>
        <p>ログイン中：{session?.user.email}</p>
      </section>
      <nav className="window commands" aria-label="設定の項目">
        {admin && (
          <button className="command command--plain" type="button" onClick={onImport}>
            ▶ 教材の取り込み
          </button>
        )}
        {admin && (
          <button className="command command--plain" type="button" onClick={onCompare}>
            ▶ AI採点を比べる
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
      <button className="command" type="button" onClick={onBack}>
        ▶ 街にもどる
      </button>
    </main>
  );
}
