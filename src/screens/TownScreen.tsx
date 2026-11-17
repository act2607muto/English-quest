import { PLAYABLE_SKILLS } from '../lib/game/battle';
import { HeroArt } from '../components/HeroArt';
import { heroNameOf, type Player, type PlayerSkill } from '../lib/game/player';
import type { TownRow } from '../lib/questionFile';
import type { TownStatus } from '../lib/game/town';
import { SKILL_LABELS } from '../lib/skills';

/**
 * 街（ゲームのトップ画面）。冒険の拠点で、行き先を選ぶ。
 * 上の帯：主人公の名前・レベル・HP、右におかねと「あそびかた」「設定」。
 * まん中：街の絵、ボスのいる場所、今日のおすすめ（下がりかけの能力値）。
 * 下の列：行き先のボタン（街の外・スキルダンジョン・ステータス・図鑑・工房）。画面の下に固定する。
 * ボタンの絵は public/ui/icon-*.png（Pixellab）。
 */
export function TownScreen({
  player,
  town,
  onField,
  onDungeon,
  onStatus,
  onBestiary,
  onShop,
  onSettings,
  onGuide,
  status,
}: {
  player: Player;
  town: TownRow | null;
  onField: () => void;
  /** スキルダンジョン（練習したい能力値のモンスターを選んで戦う） */
  onDungeon: () => void;
  onStatus: () => void;
  onBestiary: () => void;
  onShop: () => void;
  onSettings: () => void;
  onGuide: () => void;
  status: TownStatus | null;
}) {
  const playable = player.skills.filter((s) => s.unlocked && PLAYABLE_SKILLS.includes(s.skill));
  const revivalSkills = playable.filter((s) => (status?.dueBySkill[s.skill] ?? 0) > 0);
  const advice = recommendation(playable);
  const bossDefeated = player.defeatedBosses.length > 0;

  const tabs = [
    { label: '街の外へ', icon: 'map', onClick: onField },
    { label: 'ダンジョン', icon: 'dungeon', onClick: onDungeon },
    { label: 'ステータス', icon: 'status', onClick: onStatus },
    { label: '図鑑', icon: 'book', onClick: onBestiary },
    { label: '工房', icon: 'workshop', onClick: onShop },
  ];

  return (
    <main className="town-home">
      <header className="town-topbar">
        <button className="town-topbar__hero" type="button" onClick={onStatus} aria-label="ステータスを見る">
          <HeroArt size={40} />
          <span className="town-topbar__who">
            <span className="town-topbar__name">{heroNameOf(player)}</span>
            <span className="town-topbar__level">
              Lv {player.overall}　HP {player.maxHp}
            </span>
          </span>
        </button>
        <div className="town-topbar__right">
          <span className="town-topbar__gold" aria-label={`おかね ${player.gold} G`}>
            <img src="/ui/icon-coin.png" alt="" width={24} height={24} />
            {player.gold}
          </span>
          <button className="icon-button" type="button" onClick={onGuide} aria-label="あそびかた">
            <img src="/ui/icon-help.png" alt="" width={32} height={32} />
          </button>
          <button className="icon-button" type="button" onClick={onSettings} aria-label="設定">
            <img src="/ui/icon-settings.png" alt="" width={32} height={32} />
          </button>
        </div>
      </header>

      <div className="town-home__body">
        <section className="town-banner" aria-label="街">
          {town?.background_image && (
            <div className="town-banner__scene">
              <img className="town-banner__bg" src={town.background_image} alt="" aria-hidden="true" />
              <HeroArt size={64} className="town-banner__hero" />
            </div>
          )}
          <div className="town-banner__text">
            <p className="town-banner__sub">はじまりの街</p>
            <h1 className="town-banner__name">{town?.scene ?? ''}</h1>
          </div>
        </section>

        {status && (
          <section className="window">
            <p className="town-boss-hint">
              {bossDefeated
                ? '門番を たおした！ 次の街への道が開けている。'
                : status.bossUnlocked
                  ? 'ささやきの森の奥「ことだまの門」の門番に、挑めるようになった！'
                  : `ささやきの森の奥「ことだまの門」に、門番がいるらしい…（あと ${Math.max(0, status.needed - status.correctOnce)} 問 正解すると挑める）`}
            </p>
          </section>
        )}

        {(advice || revivalSkills.length > 0) && (
          <section className="window">
            <h2 className="window__title">今日のおすすめ</h2>
            {revivalSkills.length > 0 && (
              <p>
                {names(revivalSkills)}の復活モンスターが現れています。スキルダンジョンで選べるほか、街の外でもときどき出会います。倒すと、おかねが多めに入ります。
              </p>
            )}
            {advice && <p>{advice}</p>}
          </section>
        )}
      </div>

      <nav className="town-tabbar" aria-label="行き先">
        {tabs.map((t) => (
          <button
            key={t.label}
            className="town-tabbar__button"
            type="button"
            onClick={t.onClick}
            aria-label={t.label}
          >
            <img src={`/ui/icon-${t.icon}.png`} alt="" width={40} height={40} />
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}

function recommendation(skills: PlayerSkill[]): string | null {
  const decaying = skills.filter((s) => s.daysUntilDecay !== null && s.daysUntilDecay <= 0);
  if (decaying.length > 0) {
    return `${names(decaying)}が下がり始めています。今日練習すると、下がるのが止まります。`;
  }
  const soon = skills.filter((s) => s.daysUntilDecay === 1);
  if (soon.length > 0) return `${names(soon)}は、明日から下がり始めます。`;
  const never = skills.filter((s) => s.daysUntilDecay === null);
  if (never.length > 0) return `まだ${names(never)}のモンスターと戦っていません。街の外で戦ってみましょう。`;
  return null;
}

function names(skills: PlayerSkill[]): string {
  return skills.map((s) => SKILL_LABELS[s.skill]).join('・');
}
