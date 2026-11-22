import { useState, type FormEvent } from 'react';
import { deleteMyAccount } from '../lib/records';
import { supabase } from '../lib/supabase';

/** まちがえて押さないように、この文字を入れてから消す */
const CONFIRM_WORD = 'けす';

/**
 * アカウントを自分で消す（設定から開く）。アカウントと、すべての記録を消す。元にはもどせない。
 * 管理者は消せない（データベースの関数でも止める）。
 */
export function DeleteAccountScreen({ isAdmin, onBack }: { isAdmin: boolean; onBack: () => void }) {
  const [word, setWord] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (word.trim() !== CONFIRM_WORD) return setError(`「${CONFIRM_WORD}」と入れてください。`);
    setBusy(true);
    setError(null);
    try {
      await deleteMyAccount();
      setDone(true);
    } catch (err) {
      setError(`消せませんでした（${err instanceof Error ? err.message : String(err)}）`);
    } finally {
      setBusy(false);
    }
  }

  /** アカウントはもうないので、この端末のログインの情報だけを消して、ログインの画面にもどる */
  async function toLogin() {
    await supabase?.auth.signOut({ scope: 'local' }).catch(() => {});
  }

  if (done) {
    return (
      <main className="screen screen--center">
        <section className="window name-form">
          <h2 className="window__title">アカウントを消しました</h2>
          <p>これまで遊んでくれて、ありがとうございました。</p>
          <button className="command" type="button" onClick={() => void toLogin()} autoFocus>
            ▶ ログインの画面へ
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="screen screen--center">
      <form className="window name-form delete-account" onSubmit={handleSubmit}>
        <h2 className="window__title">アカウントを消す</h2>
        <p>アカウントと、次の記録がすべて消えます。</p>
        <ul className="delete-account__list">
          <li>主人公の名前と見た目</li>
          <li>レベル・経験値・おかね・装備・倒したボス</li>
          <li>答えた問題と、AI の採点・助言</li>
          <li>戦闘の記録</li>
        </ul>
        <p className="message message--error">消したあとは、元にもどせません。</p>
        <p className="note">
          同じ Google アカウントやメールアドレスでまたログインすると、新しいアカウントとして、はじめからになります。
        </p>
        {isAdmin ? (
          <p className="message message--error">管理者のアカウントは、ここからは消せません。</p>
        ) : (
          <>
            <label className="field">
              <span>消してよければ「{CONFIRM_WORD}」と入れてください</span>
              <input
                type="text"
                autoComplete="off"
                value={word}
                onChange={(e) => {
                  setWord(e.target.value);
                  setError(null);
                }}
              />
            </label>
            {error && (
              <p className="message message--error" role="alert">
                {error}
              </p>
            )}
            <button className="command command--danger" type="submit" disabled={busy || word.trim() !== CONFIRM_WORD}>
              {busy ? '消しています…' : '▶ アカウントを消す'}
            </button>
          </>
        )}
        <button className="command command--quiet" type="button" onClick={onBack} disabled={busy}>
          ▶ やめる
        </button>
      </form>
    </main>
  );
}
