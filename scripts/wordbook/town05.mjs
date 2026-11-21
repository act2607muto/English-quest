/**
 * 5つ目の街（旅行と仕事）の「単語の書庫」：高3〜大学・TOEIC 750〜800 くらいの1,200語（2026-11-22）。
 * 量が多いので、scripts/wordbook/town05/ に分けて書く（旅行／仕事／動詞／名詞／形容詞と副詞／そのつづき）。
 * 1行に「英語|品詞|日本語の意味|例文」。品詞は n（名詞）v（動詞）a（形容詞）o（そのほか：副詞・前置詞・つなぎのことばなど）。
 * 2語以上で1つの意味になることば（carry out・in terms of など）も1語として数える。
 * 意味が重なる単語（execute「実行する」と carry out「行う・実行する」など）は、意味の文字を重ねておくと、おたがいのまちがいの選択肢に出ない。
 * 前の4つの街の書庫と同じ単語は入れない（作るときに確かめる）。
 * 直したら：node scripts/build_wordbook.mjs town05 data/town05_wordbook.json
 */
import { BUSINESS } from './town05/business.mjs';
import { MORE_ADJECTIVES, MORE_ADVERBS, MORE_NOUNS, MORE_VERBS } from './town05/more.mjs';
import { NOUNS } from './town05/nouns.mjs';
import { ADJECTIVES, ADVERBS } from './town05/others.mjs';
import { TRAVEL } from './town05/travel.mjs';
import { VERBS } from './town05/verbs.mjs';

export const TOWN = { id: 'town05', name: 'ほしぞらの王城', scene: '旅行と仕事', difficulty: '目標', order: 5 };
export const LEVEL = 3;
export const EXPECTED_COUNT = 1200;
export const EARLIER_TOWNS = ['town01', 'town02', 'town03', 'town04'];
export const MONSTER = {
  id: 'town05-wordbook',
  name: 'たびにっきラクダ',
  skill: 'vocabulary',
  hp: 280,
  gold: 30,
  is_boss: false,
  image: '/monsters/town05-wordbook.png',
  description: 'こぶの中に、世界じゅうの旅の日記をつめこんで歩くラクダ。休むたびに一冊ずつ開いて、知らない国のことばを読み上げる。',
};

export const WORDS =
  TRAVEL + BUSINESS + VERBS + MORE_VERBS + NOUNS + MORE_NOUNS + ADJECTIVES + MORE_ADJECTIVES + ADVERBS + MORE_ADVERBS;
