import { useEffect, useRef, useState, type FormEvent } from 'react';
import { HeroArt } from '../components/HeroArt';
import { MonsterArt } from '../components/MonsterArt';
import { OrderAnswer } from '../components/OrderAnswer';
import { Passage } from '../components/Passage';
import { SpeakAnswer } from '../components/SpeakAnswer';
import { fetchMonstersByIds, fetchPlayableQuestions, flagQuestion } from '../lib/content';
import { secondFormIdOf } from '../lib/game/secondForm';
import { fillNames, pickQuestions, shuffle, shuffleChoices } from '../lib/game/battle';
import { attackOf, damageTo, hitsToDefeat } from '../lib/game/attack';
import { flawlessBonusEach, splitExpReward } from '../lib/game/foes';
import { isDue } from '../lib/game/growth';
import { heroNameOf, type Player } from '../lib/game/player';
import { EXP_CORRECT, EXP_CORRECT_REVIEW, EXP_HALF, EXP_WORDBOOK, EXP_WORDBOOK_REVIEW, LONG_AUDIO_WORDS } from '../lib/game/rules';
import { isWordbookMonster, isWordbookQuestion } from '../lib/game/wordbook';
import { endMarkOf, isOrderCorrect } from '../lib/game/wordOrder';
import { gradeDictation, markDictation } from '../lib/game/dictation';
import { gradeAnswer, RATING_LABELS, type Rating } from '../lib/grading';
import { MAX_ANSWER_LENGTH, MAX_OPINION_LENGTH, OPINION_TAG, type MonsterRow, type QuestionRow } from '../lib/questionFile';
import { addSkillExp, fetchProgress, finishBattle, markBossDefeated, saveAnswer, type QuestionProgress } from '../lib/records';
import type { Skill } from '../lib/skills';
import { canSpeak, speakEnglish, stopSpeaking } from '../lib/speech';
import { playSfx } from '../lib/sound';

/**
 * 決着がついてから戦闘結果へ移るまでの、最低限の待ち時間（ミリ秒）。
 * 倒れる動き（styles.css の monster-defeated：ふつう2秒、ボス2.6秒。負けたときの主人公も2秒）が終わって、少し間をおいてから移る。
 * 動きを減らす設定のときは、すっと消える0.6秒だけ待つ。
 */
const DEFEAT_MS = { normal: 2000, boss: 2600, reduced: 600 };
/** 倒れたあと・ちからつきたあとに、結果へ移る前におく間 */
const AFTER_END_PAUSE_MS = 600;
/**
 * 最後の一撃（倒したとき）のスローモーション（2026-11-22 本人の希望）。
 * 斬る動きをゆっくり見せてから倒れはじめるので、倒れる動きをこの長さだけ遅らせる（styles.css の battle--finisher と同じ）。
 */
const FINISHER_DELAY_MS = 1400;
/** ボスが第二形態へ変身する長さ（styles.css の monster-transform と同じ。半分のところで絵が入れかわる） */
const TRANSFORM_MS = { normal: 3000, reduced: 800 };

function prefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * 戦闘。正解（AI採点で「通じる」「惜しい」）なら相手に攻撃力ぶんのダメージ、不正解（「通じない」）なら自分が1ダメージ。
 * 攻撃力は、その問題の能力値のレベルと武器で決まる（lib/game/attack.ts）。
 * 答えるたびに、問題の学習状態と経験値を保存する（途中で閉じても、正解した分は残る）。
 *
 * 4択（語彙・文法・リスニング）と、AIが採点する問題（ライティング・スピーキング）の両方を扱う。
 * AI採点ができないとき（通信できない等）は、模範解答を見て自分で「書けた／書けなかった」を選ぶ。
 *
 * 相手は3種類：ふつうのモンスター、復活モンスター（復習の時期が来た問題を先に出す）、
 * ボス（練習した能力値の問題を混ぜて出す）。経験値は、問題ごとにその能力値に入る。
 */

/** rare：街の外でだけ出会う、めずらしいモンスター */
export type BattleKind = 'normal' | 'revival' | 'boss' | 'rare';

export type BattleResult = {
  monster: MonsterRow;
  kind: BattleKind;
  won: boolean;
  correct: number;
  total: number;
  flawless: boolean;
  /** 能力値ごとの獲得経験値 */
  expBySkill: Partial<Record<Skill, number>>;
  gold: number;
  /** 勝ったときの経験値のおまけ（めずらしいモンスター）。expBySkill に含まれている */
  rewardExp: number;
  saveFailed: boolean;
};

type Shown = {
  question: QuestionRow;
  choices: string[];
  answerIndex: number;
  due: boolean;
};

/** 1問の答えの結果 */
type Outcome = {
  rating: Rating; // 4択は good（正解）か bad（不正解）
  answer: string;
  picked?: number;
  advice?: string;
  better?: string;
  selfGraded?: boolean;
  /** 相手に与えたダメージ（正解のときだけ） */
  damage?: number;
};

/** transforming：ボスが第二形態へ変身しているところ（lib/game/secondForm.ts） */
type Phase = 'loading' | 'error' | 'question' | 'grading' | 'self-grade' | 'feedback' | 'transforming' | 'finishing';

export function BattleScreen({
  monster,
  kind,
  skills,
  background = null,
  backgroundFallback = null,
  player,
  isAdmin,
  onEnd,
  onRunAway,
}: {
  /** 相手。復活モンスターやボスは、名前・HP・お金を呼び出し側で調整して渡す */
  monster: MonsterRow;
  kind: BattleKind;
  /** 出題する能力値。ふつうは1つ、ボスは練習した能力値すべて */
  skills: Skill[];
  /** 戦闘の背景の絵（出会った場所など）。なければ背景なし */
  background?: string | null;
  /** background が読めないときに使う絵 */
  backgroundFallback?: string | null;
  player: Player;
  isAdmin: boolean;
  onEnd: (result: BattleResult) => void;
  onRunAway: () => void;
}) {
  const [phase, setPhase] = useState<Phase>('loading');
  // 背景の絵：background → backgroundFallback の順に試し、どちらも読めなければ背景なし
  const [bgTry, setBgTry] = useState(0);
  const bgSrc = bgTry === 0 ? background : bgTry === 1 ? backgroundFallback : null;
  const bgBroken = !bgSrc;
  const [error, setError] = useState<string | null>(null);
  const [queue, setQueue] = useState<QuestionRow[]>([]);
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState<Shown | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [draft, setDraft] = useState('');
  const [gradeError, setGradeError] = useState<string | null>(null);
  const [monsterHp, setMonsterHp] = useState(monster.hp);
  const [playerHp, setPlayerHp] = useState(player.maxHp);
  const [correctCount, setCorrectCount] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [expBySkill, setExpBySkill] = useState<Partial<Record<Skill, number>>>({});
  const [askedSkills, setAskedSkills] = useState<Set<Skill>>(new Set());
  const [saveFailed, setSaveFailed] = useState(false);
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  /** ボスの第二形態（ファイルに「ボスのID-form2」があるときだけ）と、もう変身したか */
  const [secondForm, setSecondForm] = useState<MonsterRow | null>(null);
  const [inSecondForm, setInSecondForm] = useState(false);
  /** いま戦っている姿（第二形態に変身したあとは第二形態） */
  const foe = inSecondForm && secondForm ? secondForm : monster;
  /** 今の HP を0にしても倒れずに変身するか */
  const willTransform = !inSecondForm && secondForm !== null;

  const progressRef = useRef(new Map<string, QuestionProgress>());
  /** 決着がついた時刻（倒れる動きを最後まで見せてから結果へ移るため） */
  const endedAtRef = useRef<number | null>(null);
  const saveChain = useRef<Promise<void>>(Promise.resolve());
  const saveFailedRef = useRef(false);

  // 出題する問題を決める
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // 書庫のモンスターは書庫の単語だけ、ほかのモンスターは書庫の単語を除いて出す
        const wordbook = isWordbookMonster(monster);
        const bySkill = (await Promise.all(skills.map((sk) => fetchPlayableQuestions(monster.town_id, sk)))).map((list) =>
          list.filter((q) => isWordbookQuestion(q) === wordbook),
        );
        const questions = bySkill.flat();
        if (questions.length === 0) throw new Error('この能力値の問題がありません。教材を取り込んでください。');
        const progress = await fetchProgress(questions.map((q) => q.id));
        // ボスに第二形態があれば、いっしょに読んでおく（なければ今までどおり1回で決着）
        const [form2] = kind === 'boss' ? await fetchMonstersByIds([secondFormIdOf(monster.id)]) : [];
        if (cancelled) return;
        progressRef.current = progress;
        setSecondForm(form2 ?? null);
        // いちばん長く続いても「倒すのに必要な正解の数（第二形態の分も） + 自分のHP - 1」問で終わる
        const count =
          hitsToDefeat(monster, player, skills) + (form2 ? hitsToDefeat(form2, player, skills) : 0) + player.maxHp - 1;
        let picked: QuestionRow[];
        if (bySkill.length === 1) {
          picked = pickQuestions(questions, progress, count);
        } else {
          // ボス・めずらしいモンスター：能力値ごとに選んでから、交互に並べる
          const lists = shuffle(bySkill.filter((l) => l.length > 0).map((l) => pickQuestions(l, progress, count)));
          picked = [];
          for (let i = 0; picked.length < count; i++) picked.push(lists[i % lists.length][Math.floor(i / lists.length)]);
        }
        setQueue(picked);
        setShown(present(picked[0], progress));
        setPhase('question');
        // リスニングの英文は自動では流さず、「▶ 聞く」を押して聞く（自動だと最初が聞こえないため。2026-11-18 本人の希望）
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
        setPhase('error');
      }
    })();
    return () => {
      cancelled = true;
      stopSpeaking();
    };
    // skills は呼び出しごとに新しい配列になるので、中身の文字列で比べる
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monster, skills.join(','), player.maxHp]);

  function present(q: QuestionRow, progress: Map<string, QuestionProgress>): Shown {
    const { choices, answerIndex } = q.format === 'choice4' ? shuffleChoices(q) : { choices: [], answerIndex: -1 };
    return {
      question: q,
      choices: choices.map((c) => fillNames(c)),
      answerIndex,
      due: isDue(progress.get(q.id) ?? null),
    };
  }

  function queueSave(task: () => Promise<unknown>) {
    saveChain.current = saveChain.current.then(task).then(
      () => undefined,
      () => {
        saveFailedRef.current = true;
        setSaveFailed(true);
      },
    );
  }

  /** 答えの結果を反映する（ダメージ、経験値、保存） */
  function resolve(o: Outcome) {
    if (!shown) return;
    const hit = o.rating !== 'bad';
    const skill = shown.question.skill;
    const base = isWordbookMonster(monster)
      ? o.rating === 'good'
        ? shown.due
          ? EXP_WORDBOOK_REVIEW
          : EXP_WORDBOOK
        : 0
      : o.rating === 'good'
        ? shown.due
          ? EXP_CORRECT_REVIEW
          : EXP_CORRECT
        : o.rating === 'close'
          ? EXP_HALF
          : 0;
    const gained = base;
    const damage = hit ? damageTo(foe, attackOf(player, skill)) : 0;
    setOutcome({ ...o, damage });
    setPhase('feedback');
    setAnswered((n) => n + 1);
    setAskedSkills((set) => new Set(set).add(skill));
    // 第二形態へ変身するときは、まだ決着ではない
    const knockedOut = hit && monsterHp - damage <= 0 && !willTransform;
    if (knockedOut || (!hit && playerHp - 1 <= 0)) endedAtRef.current = Date.now();
    // 音：正解は斬る音（倒したら倒れる音も）、まちがいはダメージの音
    playSfx(hit ? 'hit' : 'hurt');
    // 最後の一撃はスローモーションなので、倒れる音も斬り終わってから
    if (knockedOut) window.setTimeout(() => playSfx('defeat'), prefersReducedMotion() ? 350 : FINISHER_DELAY_MS + 100);
    if (hit) {
      setMonsterHp((hp) => hp - damage);
      setCorrectCount((n) => n + 1);
      setExpBySkill((m) => ({ ...m, [skill]: (m[skill] ?? 0) + gained }));
    } else {
      setPlayerHp((hp) => hp - 1);
    }
    const q = shown.question;
    queueSave(async () => {
      const next = await saveAnswer({
        questionId: q.id,
        // 「惜しい」は攻撃にはなるが、復習の間隔は延ばさない（また近いうちに出す）
        correct: o.rating === 'good',
        answer: o.answer,
        before: progressRef.current.get(q.id) ?? null,
        feedback:
          o.advice || o.selfGraded
            ? { rating: o.rating, advice: o.advice ?? null, better: o.better ?? null, self_graded: o.selfGraded ?? false }
            : null,
      });
      progressRef.current.set(q.id, next);
      await addSkillExp(skill, gained, player.mods.graceDays);
    });
  }

  function handlePick(i: number) {
    if (!shown || phase !== 'question') return;
    resolve({ rating: i === shown.answerIndex ? 'good' : 'bad', answer: shown.choices[i], picked: i });
  }

  /** 単語の並べかえ：並べた文が、正しい英文のどれかと同じなら正解 */
  function handleOrder(picked: string[]) {
    if (!shown || phase !== 'question') return;
    const models = (shown.question.model_answers ?? []).map((m) => fillNames(m));
    const mark = endMarkOf(models[0] ?? '');
    resolve({ rating: isOrderCorrect(picked, models) ? 'good' : 'bad', answer: picked.join(' ') + mark });
  }

  /** 書き取り：聞いた英文と同じなら正解、1語だけちがえば惜しい（アプリの中で採点する） */
  function handleDictation(e: FormEvent) {
    e.preventDefault();
    if (!shown || phase !== 'question' || !draft.trim()) return;
    const models = (shown.question.model_answers ?? []).map((m) => fillNames(m));
    stopSpeaking();
    resolve({ rating: gradeDictation(draft, models), answer: draft.trim() });
  }

  function handleWrite(e: FormEvent) {
    e.preventDefault();
    void submitText(draft.trim(), false);
  }

  /** 書いた答え・声の答え（文字起こし後）をAIに採点させる */
  async function submitText(answer: string, spoken: boolean) {
    if (!shown || phase !== 'question' || !answer) return;
    setDraft(answer);
    setPhase('grading');
    setGradeError(null);
    try {
      const r = await gradeAnswer({ questionId: shown.question.id, answer, spoken });
      resolve({ rating: r.rating, answer, advice: r.advice, better: r.better });
    } catch (err) {
      setGradeError(err instanceof Error ? err.message : String(err));
      setPhase('self-grade');
    }
  }

  function handleSelfGrade(ok: boolean) {
    resolve({ rating: ok ? 'good' : 'bad', answer: draft.trim(), selfGraded: true });
  }

  function handleNext() {
    // ボスの1回目の姿を倒したら、倒れずに第二形態へ変身して戦いが続く
    if (monsterHp <= 0 && willTransform) {
      void transform();
      return;
    }
    if (monsterHp <= 0 || playerHp <= 0) {
      void finish(monsterHp <= 0);
      return;
    }
    showNextQuestion();
  }

  /** 第二形態への変身：光って姿が入れかわり（半分のところで絵とHPが変わる）、そのあと次の問題へ */
  async function transform() {
    if (!secondForm) return;
    setPhase('transforming');
    stopSpeaking();
    window.scrollTo(0, 0);
    playSfx('warp');
    const half = (prefersReducedMotion() ? TRANSFORM_MS.reduced : TRANSFORM_MS.normal) / 2;
    await sleep(half);
    setInSecondForm(true);
    setMonsterHp(secondForm.hp);
    await sleep(half);
    showNextQuestion();
  }

  function showNextQuestion() {
    const nextIndex = index + 1;
    const q = queue[nextIndex % queue.length];
    setIndex(nextIndex);
    setShown(present(q, progressRef.current));
    setOutcome(null);
    setDraft('');
    setGradeError(null);
    setPhase('question');
    window.scrollTo(0, 0);
    // 前の問題の読み上げが続いていれば止める（次のリスニングは「▶ 聞く」を押して流す）
    stopSpeaking();
  }

  async function finish(won: boolean) {
    setPhase('finishing');
    stopSpeaking();
    // 答えの解説を読んで下のほうにいても、倒れるところが見えるように上へ戻す
    window.scrollTo(0, 0);
    const flawless = won && correctCount === answered;
    const gold = won ? monster.gold : 0;
    // ミスなしのボーナスは、この戦闘で出た能力値に同じだけ分ける（合計が10を下回らないよう切り上げ）
    const total: Partial<Record<Skill, number>> = { ...expBySkill };
    if (flawless) {
      const bonus = flawlessBonusEach(askedSkills.size);
      for (const sk of askedSkills) {
        total[sk] = (total[sk] ?? 0) + bonus;
        queueSave(() => addSkillExp(sk, bonus, player.mods.graceDays));
      }
    }
    // めずらしいモンスターの経験値のおまけは、この戦闘で出た能力値で分ける
    const rewardExp = won ? monster.exp_reward : 0;
    for (const [sk, amount] of Object.entries(splitExpReward(rewardExp, [...askedSkills])) as [Skill, number][]) {
      total[sk] = (total[sk] ?? 0) + amount;
      queueSave(() => addSkillExp(sk, amount, player.mods.graceDays));
    }
    queueSave(() =>
      finishBattle({
        townId: monster.town_id,
        monsterId: monster.id,
        questionCount: answered,
        correctCount,
        won,
        expBySkill: total,
        gold,
      }),
    );
    if (won && kind === 'boss') queueSave(() => markBossDefeated(monster.id));
    await saveChain.current;
    // 倒れる動きが終わるまで待つ（記録の保存と同時に進むので、保存が遅いときは待ち足さない）
    // 負けたときは主人公が倒れる（ふつうのモンスターと同じ長さ）
    // 勝ったときは、最後の一撃のスローモーションの分だけ倒れはじめるのが遅い
    const animMs = prefersReducedMotion()
      ? DEFEAT_MS.reduced
      : (won && kind === 'boss' ? DEFEAT_MS.boss : DEFEAT_MS.normal) + (won ? FINISHER_DELAY_MS : 0);
    const elapsed = Date.now() - (endedAtRef.current ?? Date.now());
    const rest = animMs + AFTER_END_PAUSE_MS - elapsed;
    if (rest > 0) await sleep(rest);
    onEnd({
      // 第二形態を倒したときは、結果の画面に第二形態の名前を出す（記録・エンディングは、もとのボスの ID で数える）
      monster: inSecondForm && secondForm ? { ...monster, name: secondForm.name, image: secondForm.image } : monster,
      kind,
      won,
      correct: correctCount,
      total: answered,
      flawless,
      expBySkill: total,
      gold,
      rewardExp,
      saveFailed: saveFailedRef.current,
    });
  }

  /**
   * にげる。1問でも答えていれば、記録の画面で数えられるよう、負けとして戦闘の履歴を残す（経験値は答えるたびに入っている）
   */
  async function handleRunAway() {
    stopSpeaking();
    if (answered > 0) {
      queueSave(() =>
        finishBattle({
          townId: monster.town_id,
          monsterId: monster.id,
          questionCount: answered,
          correctCount,
          won: false,
          expBySkill,
          gold: 0,
        }),
      );
      await saveChain.current;
    }
    onRunAway();
  }

  async function handleFlag(q: QuestionRow) {
    try {
      await flagQuestion(q.id, '戦闘中に印をつけた');
      setFlagged((s) => new Set(s).add(q.id));
    } catch {
      setSaveFailed(true);
    }
  }

  if (phase === 'loading') {
    return (
      <main className="screen screen--center">
        <p>{monster.name}が あらわれた！</p>
      </main>
    );
  }
  if (phase === 'error') {
    return (
      <main className="screen">
        <section className="window">
          <p className="message message--error">戦闘を始められませんでした（{error}）</p>
        </section>
        <button className="command" type="button" onClick={onRunAway}>
          ▶ もどる
        </button>
      </main>
    );
  }

  const q = shown!.question;
  const skill = q.skill;
  const isChoice = q.format === 'choice4';
  /** 単語の並べかえ（答え合わせはアプリの中でする。AI採点はしない） */
  const isOrder = q.format === 'order';
  /** 書き取り（聞いた英文を書く。答え合わせはアプリの中でする） */
  const isDictation = q.format === 'dictation';
  /** 決着したか（ボスの1回目の姿を倒しただけなら、まだ変身して続く） */
  const over = (monsterHp <= 0 && !willTransform) || playerHp <= 0;
  const transforming = phase === 'transforming';
  // 攻撃の動きを見せている間（答えた直後と、決着して結果の画面へ進むまで）
  const acting = (phase === 'feedback' || phase === 'finishing') && !!outcome;
  /** 答えたあと（結果を見ているところと、決着して結果の画面へ進むまで） */
  const showResult = acting;
  const hit = outcome ? outcome.rating !== 'bad' : false;
  /** 最後の一撃を見せているところ（スローモーションにする。styles.css の battle--finisher） */
  const finisher = acting && hit && monsterHp <= 0 && !willTransform;
  const models = (q.model_answers ?? []).map((m) => fillNames(m));
  const isSpeaking = !isChoice && !isOrder && !isDictation && skill === 'speaking';
  /** AI採点の問題か（書く・話す。並べかえと書き取りはアプリの中で採点する） */
  const isGraded = !isChoice && !isOrder && !isDictation;
  /** 意見と理由を答える問題（5つ目の街）。答えは長めに書ける・話せる */
  const isOpinion = q.format === 'respond' && (q.tags ?? []).includes(OPINION_TAG);
  /** アナウンスや説明のような長い英文（5つ目の街）は、ゆっくりも聞ける */
  const isLongAudio = (q.audio_text ?? '').split(/\s+/).filter(Boolean).length >= LONG_AUDIO_WORDS;

  return (
    <main className={`screen battle${acting && !hit ? ' battle--hurt' : ''}${finisher ? ' battle--finisher' : ''}`}>
      <section
        className={`battle__enemy${!bgBroken ? ' battle__enemy--scene' : ''}${kind === 'boss' ? ' battle__enemy--boss' : ''}`}
      >
        <div className="battle__stage">
          {bgSrc && (
            <img
              key={bgSrc}
              className="battle__bg"
              src={bgSrc}
              alt=""
              aria-hidden="true"
              onError={() => setBgTry((n) => (n === 0 && backgroundFallback ? 1 : 2))}
            />
          )}
          {/* 主人公（左下でモンスターと向き合う）。まちがえると、ひっかき傷と「-1」 */}
          <span className="battle__hero">
            <HeroArt
              size={96}
              className={
                playerHp <= 0
                  ? 'hero-art--defeated'
                  : acting
                    ? hit
                      ? 'hero-art--attack'
                      : 'hero-art--hurt'
                    : ''
              }
            />
            {acting && !hit && (
              <>
                <span key={`claw-${answered}`} className="battle-fx battle-fx--claw" aria-hidden="true" />
                <span key={`hurt-${answered}`} className="damage-pop damage-pop--player" aria-hidden="true">
                  -1
                </span>
              </>
            )}
          </span>
          {/* 攻撃の動き：正解なら斬る光とダメージの数、まちがいならモンスターが飛びかかる */}
          <span
            className={`battle__target${acting && !hit ? ' battle__target--attack' : ''}${transforming ? ' battle__target--transform' : ''}`}
          >
            <MonsterArt
              key={foe.id}
              skill={foe.skill}
              image={foe.image}
              hurt={acting && hit}
              defeated={monsterHp <= 0 && !willTransform}
              revival={kind === 'revival'}
              size={kind === 'boss' ? 'huge' : 'large'}
            />
            {acting && hit && (
              <>
                <span key={`slash-${answered}`} className="battle-fx battle-fx--slash" aria-hidden="true" />
                <span key={`dmg-${answered}`} className="damage-pop" aria-hidden="true">
                  -{outcome?.damage ?? 0}
                </span>
              </>
            )}
          </span>
        </div>
        {/* 自分とモンスターの HP を1列に（画面を下へ動かしても、背景といっしょに上に残る） */}
        <div className="battle__status">
          <div className="battle__status-side">
            <p className="battle__status-name">{heroNameOf(player)}</p>
            <HpBar label="HP" value={playerHp} max={player.maxHp} />
          </div>
          <div className="battle__status-side">
            <p className="battle__status-name">{foe.name}</p>
            <HpBar label="HP" value={monsterHp} max={foe.hp} />
          </div>
        </div>
        {saveFailed && <p className="message message--error">通信できず、記録できなかった答えがあります。</p>}
      </section>

      {/* 答えたあとは、問題と答えの欄を消して、下の「結果」のウインドウにまとめる（画面を下へ動かさずにすむように） */}
      {/* 第二形態への変身（光って姿が入れかわる） */}
      {transforming && secondForm && (
        <section className="window battle__message" aria-live="polite">
          <p className="levelup">
            {inSecondForm ? `${secondForm.name}が すがたを あらわした！` : `${monster.name}の すがたが かわっていく…！`}
          </p>
        </section>
      )}

      {!showResult && !transforming && (
        <>
        <section className="window battle__question">
          <p className="battle__prompt">{fillNames(q.prompt)}</p>
          {skill === 'grammar' && q.sentence && <p className="battle__sentence">{fillNames(q.sentence)}</p>}
          {skill === 'reading' && q.sentence && <Passage text={fillNames(q.sentence)} />}
          {isOrder && q.sentence_ja && <p className="battle__sentence battle__sentence--ja">{fillNames(q.sentence_ja)}</p>}
          {/* 英語の質問に答える問題（respond）でも、質問の日本語訳は出さない（2026-11-22 本人の希望。英語のまま読んで答える） */}
          {!isChoice && !isOrder && q.sentence && (
            <p className="battle__sentence battle__sentence--ja">{fillNames(q.sentence)}</p>
          )}
          {q.format === 'respond' && q.sentence && canSpeak && (
            <button className="command command--listen" type="button" onClick={() => speakEnglish(fillNames(q.sentence!))}>
              ▶ 質問を聞く
            </button>
          )}
          {skill === 'listening' && q.audio_text && (
            <>
              {canSpeak ? (
                <>
                  <button className="command command--listen" type="button" onClick={() => speakEnglish(q.audio_text!)}>
                    ▶ 聞く
                  </button>
                  {/* 書き取りと、アナウンスのような長い英文は、ゆっくりも聞ける（何度でも） */}
                  {(isDictation || isLongAudio) && (
                    <button className="command" type="button" onClick={() => speakEnglish(q.audio_text!, 0.65)}>
                      ▶ ゆっくり聞く
                    </button>
                  )}
                </>
              ) : (
                <p className="message message--error">この端末では読み上げが使えません。</p>
              )}
            </>
          )}
        </section>

        {isChoice ? (
          <div className="choices">
            {shown!.choices.map((c, i) => {
              const state =
                phase === 'feedback' && i === shown!.answerIndex
                  ? 'right'
                  : phase === 'feedback' && i === outcome?.picked
                    ? 'wrong'
                    : '';
              return (
                <button
                  key={i}
                  type="button"
                  className={`choice ${state ? `choice--${state}` : ''}`}
                  disabled={phase !== 'question'}
                  onClick={() => handlePick(i)}
                >
                  {state === 'right' ? '◯ ' : state === 'wrong' ? '✕ ' : ''}
                  {c}
                </button>
              );
            })}
          </div>
        ) : isOrder ? (
          <OrderAnswer
            key={`${q.id}-${index}`}
            tiles={(q.choices ?? []).map((c) => fillNames(c))}
            endMark={endMarkOf(models[0] ?? '')}
            onSubmit={handleOrder}
          />
        ) : isDictation ? (
          <form className="write" onSubmit={handleDictation}>
            <label className="field">
              <span className="note">聞こえた英文を書く</span>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={phase !== 'question'}
                rows={2}
                maxLength={300}
                lang="en"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                placeholder="ここに英文を書く"
              />
            </label>
            {phase === 'question' && (
              <button className="command" type="submit" disabled={!draft.trim()}>
                ▶ こたえる
              </button>
            )}
          </form>
        ) : isSpeaking ? (
          phase === 'question' ? (
            <SpeakAnswer
              key={`${q.id}-${index}`}
              long={isOpinion}
              onSubmit={(text) => void submitText(text, true)}
              onFail={(message) => {
                setGradeError(message);
                setPhase('self-grade');
              }}
            />
          ) : (
            <>
              {draft && (
                <div>
                  <p className="note">あなたの答え</p>
                  <p className="battle__sentence">{draft}</p>
                </div>
              )}
              {phase === 'grading' && <p className="note">採点しています…</p>}
            </>
          )
        ) : (
          <form className="write" onSubmit={handleWrite}>
            <label className="field">
              <span className="note">英語で入力</span>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={phase !== 'question'}
                rows={isOpinion ? 5 : 3}
                maxLength={isOpinion ? MAX_OPINION_LENGTH : MAX_ANSWER_LENGTH}
                lang="en"
                autoCapitalize="sentences"
                autoCorrect="off"
                spellCheck={false}
                placeholder="ここに英文を書く"
              />
            </label>
            {phase === 'question' && (
              <button className="command" type="submit" disabled={!draft.trim()}>
                ▶ こたえる
              </button>
            )}
            {phase === 'grading' && <p className="note">採点しています…</p>}
          </form>
        )}
        </>
      )}

      {phase === 'self-grade' && (
        <section className="window" aria-live="polite">
          <p className="message message--error">
            {isSpeaking ? '録音か採点ができませんでした' : 'AIの採点ができませんでした'}（{gradeError}）。
          </p>
          <p>模範解答と比べて、自分で選んでください。</p>
          {!isSpeaking && draft.trim() && (
            <>
              <p className="note">あなたの答え</p>
              <p className="battle__sentence">{draft.trim()}</p>
            </>
          )}
          <p className="note">模範解答</p>
          <ul className="models">
            {models.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
          <div className="shop-item__actions">
            <button className="command" type="button" onClick={() => handleSelfGrade(true)}>
              {isSpeaking ? '▶ 言えた' : '▶ 書けた'}
            </button>
            <button className="command" type="button" onClick={() => handleSelfGrade(false)}>
              {isSpeaking ? '▶ 言えなかった' : '▶ 書けなかった'}
            </button>
          </div>
        </section>
      )}

      {phase === 'feedback' && outcome && (
        <section className="window battle__message" aria-live="polite">
          {isGraded && !outcome.selfGraded && (
            <p className={`rating rating--${outcome.rating}`}>{RATING_LABELS[outcome.rating]}</p>
          )}
          <p>
            {hit
              ? `${outcome.rating === 'close' ? 'おしい！ ' : 'せいかい！ '}${foe.name}に ${outcome.damage} のダメージ！${shown!.due && outcome.rating === 'good' ? '（復習ボーナス）' : ''}`
              : `ざんねん… ${heroNameOf(player)}は 1 のダメージを うけた！`}
          </p>
          {/* 何を選んだか・正解はどれか（4択） */}
          {isChoice && (
            <div className="answer-summary">
              {outcome.picked !== undefined && outcome.picked !== shown!.answerIndex && (
                <p className="answer-summary__row answer-summary__row--wrong">
                  <span className="note">あなたの答え</span>✕ {shown!.choices[outcome.picked]}
                </p>
              )}
              <p className="answer-summary__row answer-summary__row--right">
                <span className="note">{hit ? 'あなたの答え' : '正解'}</span>◯ {shown!.choices[shown!.answerIndex]}
              </p>
            </div>
          )}
          {/* 並べかえは、並べた文と正しい文 */}
          {isOrder && (
            <div className="answer-summary">
              {!hit && (
                <p className="answer-summary__row answer-summary__row--wrong">
                  <span className="note">あなたの答え</span>✕ {outcome.answer}
                </p>
              )}
              <p className="answer-summary__row answer-summary__row--right">
                <span className="note">{hit ? 'あなたの答え' : '正解'}</span>◯ {hit ? outcome.answer : models[0]}
              </p>
            </div>
          )}
          {/* 書き取りは、書いた答えと、正しい英文（まちがえた単語は赤） */}
          {isDictation && (
            <div className="answer-summary">
              {outcome.rating !== 'good' && (
                <p className="answer-summary__row answer-summary__row--wrong">
                  <span className="note">あなたの答え</span>
                  {outcome.rating === 'close' ? '△ ' : '✕ '}
                  {outcome.answer}
                </p>
              )}
              <p className="answer-summary__row answer-summary__row--right">
                <span className="note">{outcome.rating === 'good' ? 'あなたの答え' : '正しい英文（赤い単語がちがっていた）'}</span>◯{' '}
                {markDictation(outcome.answer, models[0] ?? '').map((w, i) => (
                  <span key={i} className={w.ok ? undefined : 'dictation__miss'}>
                    {w.word}{' '}
                  </span>
                ))}
              </p>
            </div>
          )}
          {/* 書く・話す問題は、自分の答え */}
          {isGraded && draft.trim() && (
            <div>
              <p className="note">あなたの答え</p>
              <p className="battle__sentence">{draft.trim()}</p>
            </div>
          )}
          {/* リスニングは、聞こえた英文 */}
          {skill === 'listening' && q.audio_text && !isDictation && (
            <div>
              <p className="note">読み上げた英文</p>
              <p className={`battle__sentence${q.audio_text.includes('\n') ? ' battle__sentence--dialogue' : ''}`}>{q.audio_text}</p>
            </div>
          )}
          {/* 最後の答えで決着がついたとき（解説を読んでから「戦闘を終える」で結果の画面へ。2026-11-18 本人の希望） */}
          {over && (
            <p className="levelup">
              {monsterHp <= 0 ? `${heroNameOf(player)}は ${foe.name}を たおした！` : `${heroNameOf(player)}は ちからつきた…`}
            </p>
          )}
          {/* ボスの1回目の姿を倒したとき（「つぎへ」で第二形態へ変身する） */}
          {monsterHp <= 0 && willTransform && <p className="levelup">{monster.name}は まだ たおれない…！</p>}
          {outcome.advice && <p>{outcome.advice}</p>}
          {outcome.better && outcome.better.trim() !== outcome.answer.trim() && (
            <div>
              <p className="note">より自然な言い方</p>
              <p className="battle__sentence">{outcome.better}</p>
            </div>
          )}
          {isGraded && (
            <div>
              <p className="note">模範解答</p>
              <ul className="models">
                {models.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          )}
          {q.explanation && <p className="note">{fillNames(q.explanation)}</p>}
          <button className="command" type="button" onClick={handleNext} autoFocus={isChoice || isOrder || isDictation}>
            {over ? '▶ 戦闘を終える' : '▶ つぎへ'}
          </button>
          {isAdmin &&
            (flagged.has(q.id) ? (
              <p className="note">この問題に要修正の印をつけました。次から出題しません。</p>
            ) : (
              <button className="flag" type="button" onClick={() => void handleFlag(q)}>
                ⚑ この問題はおかしい
              </button>
            ))}
        </section>
      )}

      {/* 「戦闘を終える」を押したあと：記録を保存し、倒れる動きが終わっていなければ待ってから結果の画面へ */}
      {phase === 'finishing' && (
        <section className="window battle__message" aria-live="polite">
          <p className="levelup">
            {monsterHp <= 0
              ? `${heroNameOf(player)}は ${foe.name}を たおした！`
              : `${heroNameOf(player)}は ちからつきた…`}
          </p>
          {outcome && q.explanation && <p className="note">{fillNames(q.explanation)}</p>}
        </section>
      )}

      {phase === 'question' && (
        <button className="command command--quiet" type="button" onClick={() => void handleRunAway()}>
          ▶ にげる（ここまでの正解は残ります）
        </button>
      )}
    </main>
  );
}

/** HP がこの数までなら1マスずつ、多ければゲージで出す */
const HP_CELLS_MAX = 10;

function HpBar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="hp" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.max(0, value)}>
      <span className="hp__label">{label}</span>
      {max > HP_CELLS_MAX ? (
        // HP が大きい（モンスター）ときは、1本のゲージで出す
        <span className="hp__gauge">
          <span className="hp__gauge-fill" style={{ width: `${(Math.max(0, value) / max) * 100}%` }} />
        </span>
      ) : (
        <span className="hp__cells">
          {Array.from({ length: max }, (_, i) => (
            <span key={i} className={i < value ? 'hp__cell hp__cell--on' : 'hp__cell'} />
          ))}
        </span>
      )}
      <span className="hp__num">
        {Math.max(0, value)}/{max}
      </span>
    </div>
  );
}
