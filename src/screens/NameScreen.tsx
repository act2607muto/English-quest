import { useState, type FormEvent } from 'react';
import { HeroArt } from '../components/HeroArt';
import { HERO_LOOK_LABELS, HERO_LOOKS, type HeroLook } from '../lib/heroLook';
import { HERO_NAME_MAX, normalizeHeroName, saveHeroName } from '../lib/records';

/**
 * 主人公に名前をつけ、見た目（男の子・女の子）を選ぶ。
 * 名前がまだないとき（最初のログインのあと）は、街より先にこの画面を出す。設定からも変えられる。
 * 問題文に出てくる名前（{{name_ja}} など）とは別。
 */
export function NameScreen({
  current,
  currentLook,
  onSaved,
  onBack,
}: {
  /** 今の名前。まだなければ null */
  current: string | null;
  /** 今の見た目 */
  currentLook: HeroLook;
  onSaved: () => Promise<unknown>;
  /** 戻る先。最初に名前をつけるときは null（戻れない） */
  onBack: (() => void) | null;
}) {
  const [name, setName] = useState(current ?? '');
  const [look, setLook] = useState<HeroLook>(currentLook);
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
      await saveHeroName(checked.name, look);
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  }

  return (
    <main className="screen screen--center">
      <form className="window name-form" onSubmit={handleSubmit}>
        <h2 className="window__title">{first ? '主人公を 決めてください' : '主人公の名前と見た目を変える'}</h2>
        <div className="choice-pair name-form__looks" role="radiogroup" aria-label="主人公の見た目">
          {HERO_LOOKS.map((l) => (
            <button
              key={l}
              type="button"
              role="radio"
              aria-checked={look === l}
              className={`command choice-pair__button name-form__look${look === l ? ' choice-pair__button--on' : ''}`}
              onClick={() => setLook(l)}
              disabled={busy}
            >
              <HeroArt size={96} look={l} />
              <span>{HERO_LOOK_LABELS[l]}</span>
            </button>
          ))}
        </div>
        {first && <p className="note">名前と見た目は、冒険の画面で使います。あとから設定で変えられます。</p>}
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
          {busy ? '保存しています…' : first ? '▶ この主人公で ぼうけんに出る' : '▶ これにする'}
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
