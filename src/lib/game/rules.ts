/**
 * ゲームの数値。すべて初期値で、第1段階を遊びながら調整する（docs/spec.md）。
 * 数値を変えるときはこのファイルだけを直す。
 */

/** 経験値 */
export const EXP_CORRECT = 10;
export const EXP_CORRECT_REVIEW = 15; // 復習の時期が来ていた問題に正解
export const EXP_HALF = 5; // AI採点で「惜しい」（手順4以降）
export const EXP_FLAWLESS_BONUS = 10; // ミスなしで勝つ

/** レベル：必要な累計経験値は「20 × レベルの2乗」 */
export const EXP_PER_LEVEL_SQUARED = 20;
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

/** ボスと復活モンスター */
export const BOSS_UNLOCK_RATIO = 0.8; // 街の問題の8割に1回以上正解するとボスに挑める
export const BOSS_REMATCH_GOLD = 10; // 2回目以降にボスを倒したときのお金（100Gは最初の1回だけ）
export const REVIVAL_GOLD = 15; // 復活モンスターを倒したときのお金

/** 六角形の目盛りの上限。いちばん高いレベルが収まる最小の段を使う */
export const HEXAGON_SCALE_STEPS = [10, 25, 50, 99] as const;
