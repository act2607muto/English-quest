import { useEffect, useState } from 'react';
import { PLAYABLE_SKILLS } from '../lib/game/battle';
import { fetchFieldMap } from '../lib/game/fieldMap';
import { HeroArt } from '../components/HeroArt';
import { heroNameOf, type Player, type PlayerSkill } from '../lib/game/player';
import type { TownRow } from '../lib/questionFile';
import type { TownStatus } from '../lib/game/town';
import { SKILL_LABELS, type Skill } from '../lib/skills';

/**
 * 街（ゲームのトップ画面）。冒険の拠点で、行き先を選ぶ。
 * 上の帯：主人公の名前・レベル・HP、右におかねと「あそびかた」「設定」。
 * まん中：街の絵、ボスのいる場所、今日のおすすめ（下がりかけの能力値）。
 * 下の列：行き先のボタン（components/BottomNav。App が街などの画面の下に出す）。
 */
export function TownScreen({
  player,
  town,
  arrival,
  onStatus,
  onSettings,
  onGuide,
  status,
}: {
  player: Player;
  town: TownRow | null;
  /** 先の街に着いたばかりなら、解放された能力値（着いた！と知らせる。前の街へもどったときは null） */
  arrival: { unlocked: Skill[] } | null;
  /** 上の帯の主人公を押したとき（ステータスへ） */
  onStatus: () => void;
  onSettings: () => void;
  onGuide: () => void;
  status: TownStatus | null;
}) {
  // この街に問題がある能力値だけ（はじまりの街にはリーディングがない）
  const playable = player.skills.filter(
    (s) => s.unlocked && PLAYABLE_SKILLS.includes(s.skill) && (!status || status.skills.includes(s.skill)),
  );
  const revivalSkills = playable.filter((s) => (status?.dueBySkill[s.skill] ?? 0) > 0);
  const advice = recommendation(playable);
  const boss = status?.boss ?? null;
  const bossDefeated = boss ? player.defeatedBosses.includes(boss.id) : false;
  /** ボスのいる場所の説明（マップのファイルの boss_place） */
  const [bossPlace, setBossPlace] = useState<string | null>(null);
  useEffect(() => {
    setBossPlace(null);
    fetchFieldMap(player.currentTownId)
      .then((m) => setBossPlace(m?.bossPlace ?? null))
      .catch(() => setBossPlace(null));
  }, [player.currentTownId]);
  const place = bossPlace ?? '街の外の奥';

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
            {town?.name && <p className="town-banner__sub">{town.name}</p>}
            <h1 className="town-banner__name">{town?.scene ?? ''}</h1>
          </div>
        </section>

        {arrival && (
          <section className="window">
            <h2 className="window__title">{town?.name ?? town?.scene ?? '新しい街'}に 着いた！</h2>
            {arrival.unlocked.length > 0 ? (
              <p className="levelup">
                {arrival.unlocked.map((s) => SKILL_LABELS[s]).join('・')}が 使えるようになった！ 六角形の、あいていた頂点が伸びはじめます。
              </p>
            ) : (
              <p>この街のモンスターは、前の街より少し手ごわい。</p>
            )}
          </section>
        )}

        {status && boss && (
          <section className="window">
            <p className="town-boss-hint">
              {bossDefeated
                ? `${boss.name}を たおした！ ${place}の先に、次の街への道が開けている。`
                : status.bossReady
                  ? `${place}の${boss.name}に、挑む準備ができた！`
                  : `${place}に、${boss.name}がいるらしい…。いつでも挑めるが、あと ${Math.max(0, status.needed - status.correctOnce)} 問 正解してからがおすすめ。`}
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
