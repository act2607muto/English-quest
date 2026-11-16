import { useState, type FormEvent } from 'react';
import { HeroArt } from '../components/HeroArt';
import { HERO_NAME_MAX, normalizeHeroName, saveHeroName } from '../lib/records';

/**
 * 主人公に名前をつける。
 * 名前がまだないとき（最初のログインのあと）は、街より先にこの画面を出す。設定からも変えられる。
 * 問題文に出てくる名前（{{name_ja}} など）とは別。
 */
export function NameScreen({
  current,
  onSaved,
  onBack,
}: {
  /** 今の名前。まだなければ null */
  current: string | null;
  onSaved: () => Promise<unknown>;
  /** 戻る先。最初に名前をつけるときは null（戻れない） */
  onBack: (() => void) | null;
}) {
  const [name, setName] = useState(current ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const first = current === null;
  const length = [...name.trim()].length;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const checked = normalizeHeroName(name);
    if ('error' in checked) {
      setError(checked.error);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await saveHeroName(checked.name);
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  }

  return (
    <main className="screen screen--center">
      <form className="window name-form" onSubmit={handleSubmit}>
        <div className="name-form__hero">
          <HeroArt size={128} />
        </div>
        <h2 className="window__title">{first ? '主人公に 名前を つけてください' : '主人公の名前を変える'}</h2>
        {first && <p className="note">冒険の画面で使う名前です。あとから設定で変えられます。</p>}
        <label className="field">
          <span>
            なまえ（{HERO_NAME_MAX}文字まで）
            <span className={`name-form__count${length > HERO_NAME_MAX ? ' name-form__count--over' : ''}`}>
              {length} / {HERO_NAME_MAX}
            </span>
          </span>
          <input
            type="text"
            autoComplete="off"
            enterKeyHint="done"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            autoFocus
          />
        </label>
        {error && (
          <p className="message message--error" role="alert">
            {error}
          </p>
        )}
        <button className="command" type="submit" disabled={busy}>
          {busy ? '保存しています…' : first ? '▶ この名前で ぼうけんに出る' : '▶ この名前にする'}
        </button>
        {onBack && (
          <button className="command command--quiet" type="button" onClick={onBack} disabled={busy}>
            ▶ やめる
          </button>
        )}
      </form>
    </main>
  );
}
