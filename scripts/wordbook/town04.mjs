/**
 * 4つ目の街（予定・電話・雑談）の「単語の書庫」：高校2年・TOEIC 650〜750 くらいの1,000語（2026-11-22）。
 * 量が多いので、scripts/wordbook/town04/ に分けて書く（予定・電話・仕事／雑談／動詞／名詞と形容詞と副詞／そのつづき）。
 * 1行に「英語|品詞|日本語の意味|例文」。品詞は n（名詞）v（動詞）a（形容詞）o（そのほか：副詞・前置詞・つなぎのことばなど）。
 * 2語以上で1つの意味になることば（put off・run into・in advance など）も1語として数える。
 * 意味が重なる単語（postpone「延期する」と put off「先に延ばす・延期する」など）は、意味の文字を重ねておくと、おたがいのまちがいの選択肢に出ない。
 * 前の3つの街の書庫と同じ単語は入れない（作るときに確かめる）。
 * 直したら：node scripts/build_wordbook.mjs town04 data/town04_wordbook.json
 */
import { CHAT } from './town04/chat.mjs';
import { MORE_ADJECTIVES, MORE_ADVERBS, MORE_NOUNS, MORE_VERBS } from './town04/more.mjs';
import { ADJECTIVES, ADVERBS, NOUNS } from './town04/others.mjs';
import { SCHEDULE_PHONE } from './town04/schedule_phone.mjs';
import { VERBS } from './town04/verbs.mjs';

export const TOWN = { id: 'town04', name: 'とけいだいの城下町', scene: '予定・電話・雑談', difficulty: '目標', order: 4 };
export const LEVEL = 3;
export const EXPECTED_COUNT = 1000;
export const EARLIER_TOWNS = ['town01', 'town02', 'town03'];
export const MONSTER = {
  id: 'town04-wordbook',
  name: 'てちょうヤギ',
  skill: 'vocabulary',
  hp: 240,
  gold: 25,
  is_boss: false,
  image: '/monsters/town04-wordbook.png',
  description: '予定でびっしりの手帳をもぐもぐ食べてしまうヤギ。食べたページの単語は、ひとつ残らずおなかの中で覚えている。',
};

export const WORDS =
  SCHEDULE_PHONE + CHAT + VERBS + MORE_VERBS + NOUNS + MORE_NOUNS + ADJECTIVES + MORE_ADJECTIVES + ADVERBS + MORE_ADVERBS;
