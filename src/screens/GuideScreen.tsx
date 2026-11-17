import { useState, type ReactNode } from 'react';
import { HeroArt } from '../components/HeroArt';
import { Hexagon } from '../components/Hexagon';
import { MonsterArt } from '../components/MonsterArt';
import { heroNameOf, type Player } from '../lib/game/player';
import { BOSS_UNLOCK_RATIO, DECAY_FLOOR_RATIO, DECAY_GRACE_DAYS } from '../lib/game/rules';

/**
 * あそびかた。はじめての人は、主人公に名前をつけたすぐあとに読む（とばしてもよい）。
 * 設定の「あそびかた」から、いつでも見返せる。
 */
export function GuideScreen({
  player,
  first,
  onDone,
}: {
  player: Player;
  /** 名前をつけた直後（最後のボタンが「ぼうけんに出る」になり、「とばす」が出る） */
  first: boolean;
  onDone: () => void;
}) {
  const [page, setPage] = useState(0);
  const name = heroNameOf(player);
  const pages = guidePages(name, player);
  const last = page === pages.length - 1;
  const current = pages[page];

  const move = (to: number) => {
    window.scrollTo(0, 0);
    setPage(to);
  };

  return (
    <main className="screen">
      <section className="window guide">
        <p className="guide__count">
          あそびかた {page + 1} / {pages.length}
        </p>
        <h2 className="window__title">{current.title}</h2>
        {current.art && <div className="guide__art">{current.art}</div>}
        <div className="guide__body">{current.body}</div>
      </section>

      <button className="command" type="button" onClick={() => (last ? onDone() : move(page + 1))}>
        {last ? (first ? '▶ ぼうけんに出る' : '▶ 設定にもどる') : '▶ つぎへ'}
      </button>
      {page > 0 && (
        <button className="command" type="button" onClick={() => move(page - 1)}>
          ◀ まえへ
        </button>
      )}
      {!last && (
        <button className="command command--quiet" type="button" onClick={onDone}>
          {first ? 'せつめいを とばす' : '設定にもどる'}
        </button>
      )}
    </main>
  );
}

type Page = { title: string; art?: ReactNode; body: ReactNode };

function guidePages(name: string, player: Player): Page[] {
  const percent = (r: number) => `${Math.round(r * 100)}%`;
  return [
    {
      title: 'English Quest へ ようこそ',
      art: <HeroArt size={128} />,
      body: (
        <>
          <p>英語の問題を解いてモンスターを倒し、{name}の英語の力を育てていく冒険です。</p>
          <p>
            英語の力は、<strong>語彙・文法・リスニング・リーディング・スピーキング・ライティング</strong>
            の6つの「能力値」で表します。
          </p>
        </>
      ),
    },
    {
      title: '六角形が 英語の力',
      art: <Hexagon skills={player.skills} />,
      body: (
        <>
          <p>6つの能力値は、この六角形で見られます。練習するほど、六角形が大きく広がります。</p>
          <p>リーディングは、先の街で使えるようになります。</p>
        </>
      ),
    },
    {
      title: '戦いかた',
      art: <MonsterArt skill="vocabulary" image="/monsters/town01-mon-voc.png" size="large" />,
      body: (
        <>
          <p>モンスターに出会うと、英語の問題が出ます。</p>
          <ul className="guide__list">
            <li>
              <strong>正解</strong>すると、モンスターにダメージ。その問題の能力値に経験値が入ります。
            </li>
            <li>
              <strong>まちがえる</strong>と、{name}のHPが1へります。0になると負けです（正解した分の経験値は残ります）。
            </li>
          </ul>
          <p>
            問題は、4つから選ぶもの・英語で書くもの・英語で話すもの（マイクを使います）があります。書く問題と話す問題は、AIが採点します。
          </p>
        </>
      ),
    },
    {
      title: '街で できること',
      body: (
        <dl className="guide__menu">
          <dt>▶ 街の外へ</dt>
          <dd>マップを歩くと、モンスターに出会います。場所によって、出やすい能力値がちがいます。まれに、めずらしいモンスターも。</dd>
          <dt>▶ スキルダンジョンへ</dt>
          <dd>練習したい能力値を選んで、そのモンスターと戦えます。</dd>
          <dt>▶ ステータス</dt>
          <dd>六角形と、能力値ごとのレベルを見られます。</dd>
          <dt>▶ ことのは工房</dt>
          <dd>倒して手に入れたお金で、武器や防具を買えます。武器は、こうげきを上げます（英語の正解・不正解は変わりません）。</dd>
          <dt>ボス</dt>
          <dd>
            街の外の、ささやきの森の奥にある「ことだまの門」にいます。街の問題の{percent(BOSS_UNLOCK_RATIO)}
            に1回以上正解すると、挑めます。倒すと次の街への道が開けます。
          </dd>
        </dl>
      ),
    },
    {
      title: '毎日 少しずつが コツ',
      body: (
        <>
          <ul className="guide__list">
            <li>
              練習しない日が{DECAY_GRACE_DAYS}日より長く続くと、能力値が少しずつ下がります（いちばん高かったときの
              {percent(DECAY_FLOOR_RATIO)}より下がりません）。
            </li>
            <li>
              前に答えた問題は、日をあけて<strong>「復活モンスター」</strong>として出てきます。もう一度正解すると、よく覚えられます。
            </li>
          </ul>
          <p>まずは「街の外へ」で、モンスターと戦ってみましょう。</p>
          <p className="note">この説明は「設定」→「あそびかた」で、いつでも見返せます。</p>
        </>
      ),
    },
  ];
}
