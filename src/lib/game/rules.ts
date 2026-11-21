/**
 * ゲームの数値。すべて初期値で、第1段階を遊びながら調整する（docs/spec.md）。
 * 数値を変えるときはこのファイルだけを直す。
 */

/** 経験値 */
export const EXP_CORRECT = 10;
export const EXP_CORRECT_REVIEW = 15; // 復習の時期が来ていた問題に正解
export const EXP_HALF = 5; // AI採点で「惜しい」（手順4以降）
export const EXP_FLAWLESS_BONUS = 10;
/** 単語の書庫の正解（単語は数が多いので少なめ。復習の時期が来ていた単語は多め） */
export const EXP_WORDBOOK = 4;
export const EXP_WORDBOOK_REVIEW = 6; // ミスなしで勝つ（出た能力値に同じだけ分ける。合計はこれを下回らない）

/**
 * レベル：必要な累計経験値は「30 ×（レベル − 1）の2.5乗」。
 * 王道のRPGのように、レベル2はすぐ上がり、上がるほど次までの経験値が大きく増える。
 * 正解（10）の数でいうと、レベル2が3問、5が96問、10が729問。
 */
export const EXP_LEVEL_FACTOR = 30;
export const EXP_LEVEL_POWER = 2.5;
export const MAX_LEVEL = 99;

/** 能力値の低下 */
export const DECAY_GRACE_DAYS = 3; // 最後に練習してから3日間は下がらない
export const DECAY_RATE_PER_DAY = 0.01; // 4日目から1日ごとに1%
export const DECAY_FLOOR_RATIO = 0.7; // 過去最高の70%より下がらない

/** 復習の間隔（日）。正解するたびに次の段階へ、不正解なら最初に戻る */
export const REVIEW_INTERVALS = [1, 3, 7, 14, 30] as const;

/** 戦闘 */
export const PLAYER_BASE_HP = 3;
export const PLAYER_HP_PER_10_LEVELS = 1;
/** 攻撃力：総合レベル1のとき6。総合レベルが1上がるごとに+3。武器は、その能力値の問題のときだけ上乗せ */
export const ATTACK_BASE = 6;
export const ATTACK_PER_LEVEL = 3;
/** どんなに強くなっても、モンスターを倒すには最低この数の正解が要る（練習が減りすぎないように） */
export const MIN_HITS_TO_DEFEAT = 2;

/** マップでの出会い */
export const ENCOUNTER_MIN_STEPS = 3; // 戦闘のあと、この歩数までは出会わない
export const ENCOUNTER_WEAK_BONUS = 0.5; // いちばん高いレベルより1低いごとに、出やすさ +50%
export const ENCOUNTER_DECAY_BONUS = 1.5; // 下がり始めている能力値は、出やすさ1.5倍
export const ENCOUNTER_REVIVAL_CHANCE = 0.4; // 復習の時期が来た問題があれば、この割合で復活モンスターになる

/** ボスと復活モンスター */
export const BOSS_RECOMMEND_RATIO = 0.8; // ボスはいつでも挑めるが、街の問題の8割に1回以上正解してからがおすすめ（目安）
export const BOSS_REMATCH_GOLD = 10; // 2回目以降にボスを倒したときのお金（100Gは最初の1回だけ）
export const REVIVAL_GOLD = 15; // 復活モンスターを倒したときのお金

/** 六角形の目盛りの上限。いちばん高いレベルが収まる最小の段を使う */
export const HEXAGON_SCALE_STEPS = [10, 25, 50, 99] as const;

/** リスニング：この語数以上の英文（アナウンスや説明。5つ目の街から）には「ゆっくり聞く」を出す */
export const LONG_AUDIO_WORDS = 30;

/** 最後の街（ここのボスを初めて倒したら、エンディングのお知らせを出す。5つの街の計画、2026-11-21） */
export const FINAL_TOWN_ID = 'town05';
