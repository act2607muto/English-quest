/**
 * 3つ目の街（食事と道案内）の「単語の書庫」：高校1年・TOEIC 600〜650 くらいの800語（2026-11-21）。
 * 量が多いので、scripts/wordbook/town03/ に分けて書く（食事と道案内・動詞・名詞と形容詞と副詞）。
 * 1行に「英語|品詞|日本語の意味|例文」。品詞は n（名詞）v（動詞）a（形容詞）o（そのほか：副詞・前置詞など）。
 * 意味が重なる単語（heal「治す・いやす」と cure「治す」など）は、意味の文字を重ねておくと、おたがいのまちがいの選択肢に出ない。
 * はじまりの街・にぎわいの市の書庫と同じ単語は入れない（作るときに確かめる）。
 * 直したら：node scripts/build_wordbook.mjs town03 data/town03_wordbook.json
 */
import { FOOD_TRAVEL } from './town03/food_travel.mjs';
import { ADJECTIVES, ADVERBS, NOUNS } from './town03/others.mjs';
import { VERBS } from './town03/verbs.mjs';

export const TOWN = { id: 'town03', name: 'みちしるべの宿場町', scene: '食事と道案内', difficulty: '標準', order: 3 };
export const LEVEL = 2;
export const EXPECTED_COUNT = 800;
export const EARLIER_TOWNS = ['town01', 'town02'];
export const MONSTER = {
  id: 'town03-wordbook',
  name: 'じびきモグラ',
  skill: 'vocabulary',
  hp: 200,
  gold: 20,
  is_boss: false,
  image: '/monsters/town03-wordbook.png',
  description: '分厚い字引の中にトンネルを掘ってくらすモグラ。掘り出した単語を、鼻先でくるりとめくって読んでみせる。',
};

export const WORDS = FOOD_TRAVEL + VERBS + NOUNS + ADJECTIVES + ADVERBS;
