import { useEffect, useState } from 'react';
import { fetchEquipmentOfTown } from '../lib/content';
import { describeEffect } from '../lib/game/equipment';
import type { Player } from '../lib/game/player';
import type { EquipmentRow } from '../lib/questionFile';
import { buyEquipment, equip } from '../lib/records';
import { SKILLS } from '../lib/skills';

/**
 * 店（ことのは工房）：武器と防具を買い、付け替える。
 * 装備できるのは武器1つと防具1つ。装備は英語の正誤を変えない。ガチャはない。
 */
export function ShopScreen({
  player,
  onChanged,
  onBack,
}: {
  player: Player;
  onChanged: () => Promise<unknown>;
  onBack: () => void;
}) {
  const [items, setItems] = useState<EquipmentRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<EquipmentRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  useEffect(() => {
    fetchEquipmentOfTown(player.currentTownId)
      .then(setItems)
      .catch((err) => setLoadError(err instanceof Error ? err.message : String(err)));
  }, [player.currentTownId]);

  async function run(task: () => Promise<unknown>, done: string) {
    setBusy(true);
    setMessage(null);
    try {
      await task();
      await onChanged();
      setMessage({ text: done });
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : String(err), error: true });
    } finally {
      setBusy(false);
      setConfirming(null);
    }
  }

  // 武器は能力値の並び（語彙・文法・リスニング…）にそろえる
  // すべてに効く武器は最後に出す
  const skillOrder = (i: EquipmentRow) =>
    i.effect.type !== 'attack' ? 99 : i.effect.skill === 'all' ? SKILLS.length : SKILLS.indexOf(i.effect.skill);
  const weapons = (items?.filter((i) => i.slot === 'weapon') ?? []).sort(
    (a, b) => skillOrder(a) - skillOrder(b) || a.price - b.price,
  );
  const armors = items?.filter((i) => i.slot === 'armor') ?? [];

  function renderItem(item: EquipmentRow) {
    const owned = player.ownedEquipment.includes(item.id);
    const equipped = player.weapon?.id === item.id || player.armor?.id === item.id;
    const short = item.price - player.gold;
    return (
      <li key={item.id} className={`shop-item${equipped ? ' shop-item--equipped' : ''}`}>
        <div className="shop-item__head">
          <ItemArt image={item.image} />
          <div className="shop-item__body">
            <p className="shop-item__name">
              {item.name}
              {equipped && <span className="shop-item__tag">E</span>}
            </p>
            <p className="shop-item__effect">{describeEffect(item.effect)}</p>
          </div>
          <p className="shop-item__price">{owned ? '所持' : `${item.price} G`}</p>
        </div>

        {confirming?.id === item.id ? (
          <div className="shop-item__confirm">
            <p>
              {item.name}を {item.price} G で買いますか？
            </p>
            <div className="shop-item__actions">
              <button
                className="command"
                type="button"
                disabled={busy}
                onClick={() => void run(() => buyEquipment(item), `${item.name}を 買った！`)}
              >
                ▶ はい
              </button>
              <button className="command" type="button" disabled={busy} onClick={() => setConfirming(null)}>
                ▶ いいえ
              </button>
            </div>
          </div>
        ) : (
          <div className="shop-item__actions">
            {!owned &&
              (short > 0 ? (
                <p className="note">おかねが足りません（あと {short} G）</p>
              ) : (
                <button className="command" type="button" disabled={busy} onClick={() => setConfirming(item)}>
                  ▶ 買う
                </button>
              ))}
            {owned && !equipped && (
              <button
                className="command"
                type="button"
                disabled={busy}
                onClick={() => void run(() => equip(item.slot, item.id), `${item.name}を そうびした！`)}
              >
                ▶ そうびする
              </button>
            )}
            {equipped && (
              <button
                className="command"
                type="button"
                disabled={busy}
                onClick={() => void run(() => equip(item.slot, null), `${item.name}を はずした`)}
              >
                ▶ はずす
              </button>
            )}
          </div>
        )}
      </li>
    );
  }

  return (
    <main className="screen">
      <section className="window">
        <h2 className="window__title">ことのは工房</h2>
        <p>いらっしゃい！ 武器は1つ、防具は1つまで装備できるよ。</p>
        <table className="stats">
          <tbody>
            <tr>
              <th>おかね</th>
              <td>{player.gold} G</td>
            </tr>
            <tr>
              <th>ぶき</th>
              <td>{player.weapon?.name ?? 'なし'}</td>
            </tr>
            <tr>
              <th>ぼうぐ</th>
              <td>{player.armor?.name ?? 'なし'}</td>
            </tr>
          </tbody>
        </table>
        <p className="note">装備は英語の正解・不正解を変えません。こうげき・HP・低下までの日数に効きます。</p>
      </section>

      {message && (
        <section className="window" aria-live="polite">
          <p className={message.error ? 'message message--error' : 'levelup'}>{message.text}</p>
        </section>
      )}

      {loadError && <p className="message message--error">品物を読み込めませんでした（{loadError}）</p>}
      {!items && !loadError && <p>読み込み中…</p>}
      {items && items.length === 0 && (
        <section className="window">
          <p className="message message--error">
            まだ品物がありません。「設定」→「教材の取り込み」で town01_equipment.json を取り込んでください。
          </p>
        </section>
      )}

      {weapons.length > 0 && (
        <section className="window">
          <h2 className="window__title">ぶき</h2>
          <ul className="shop-list">{weapons.map(renderItem)}</ul>
        </section>
      )}
      {armors.length > 0 && (
        <section className="window">
          <h2 className="window__title">ぼうぐ</h2>
          <ul className="shop-list">{armors.map(renderItem)}</ul>
        </section>
      )}

      <button className="command" type="button" onClick={onBack} disabled={busy}>
        ▶ 街にもどる
      </button>
    </main>
  );
}

export function ItemArt({ image }: { image: string | null }) {
  const [broken, setBroken] = useState(false);
  if (!image || broken) return <span className="item-art item-art--empty" aria-hidden="true" />;
  return (
    <span className="item-art" aria-hidden="true">
      <img src={image} alt="" width={16} height={16} onError={() => setBroken(true)} />
    </span>
  );
}
