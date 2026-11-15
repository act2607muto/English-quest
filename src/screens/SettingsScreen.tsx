import { useAuth } from '../auth/AuthProvider';

/** 設定。自分の名前・音声の速さは、この後の手順で足す */
export function SettingsScreen({
  isAdmin,
  onImport,
  onMicTest,
  onBack,
}: {
  isAdmin: boolean;
  onImport: () => void;
  onMicTest: () => void;
  onBack: () => void;
}) {
  const { session, signOut } = useAuth();
  return (
    <main className="screen">
      <section className="window">
        <h2 className="window__title">設定</h2>
        <p>ログイン中：{session?.user.email}</p>
      </section>
      <nav className="window commands" aria-label="設定の項目">
        {isAdmin && (
          <button className="command command--plain" type="button" onClick={onImport}>
            ▶ 教材の取り込み
          </button>
        )}
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
