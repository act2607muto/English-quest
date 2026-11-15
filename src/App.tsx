import { useState } from 'react';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import { isSupabaseConfigured } from './lib/supabase';
import { HomeScreen } from './screens/HomeScreen';
import { LoginScreen } from './screens/LoginScreen';
import { ImportScreen } from './screens/ImportScreen';
import { MicTestScreen } from './screens/MicTestScreen';

type Screen = 'home' | 'mic-test' | 'import';

export function App() {
  if (!isSupabaseConfigured) return <SetupNeeded />;
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}

function Router() {
  const { loading, session } = useAuth();
  const [screen, setScreen] = useState<Screen>('home');
  if (loading) {
    return (
      <main className="screen screen--center">
        <p>読み込み中…</p>
      </main>
    );
  }
  if (!session) return <LoginScreen />;
  if (screen === 'mic-test') return <MicTestScreen onBack={() => setScreen('home')} />;
  if (screen === 'import') return <ImportScreen onBack={() => setScreen('home')} />;
  return <HomeScreen onOpenMicTest={() => setScreen('mic-test')} onOpenImport={() => setScreen('import')} />;
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
