import { useEffect, useRef, useState, type FormEvent } from 'react';
import { HeroArt } from '../components/HeroArt';
import { MonsterArt } from '../components/MonsterArt';
import { SpeakAnswer } from '../components/SpeakAnswer';
import { fetchPlayableQuestions, flagQuestion } from '../lib/content';
import { fillNames, pickQuestions, shuffle, shuffleChoices } from '../lib/game/battle';
import { attackOf, damageTo, hitsToDefeat } from '../lib/game/attack';
import { splitExpReward } from '../lib/game/foes';
import { isDue } from '../lib/game/growth';
import { heroNameOf, type Player } from '../lib/game/player';
import { EXP_CORRECT, EXP_CORRECT_REVIEW, EXP_FLAWLESS_BONUS, EXP_HALF } from '../lib/game/rules';
import { gradeAnswer, RATING_LABELS, type Rating } from '../lib/grading';
import type { MonsterRow, QuestionRow } from '../lib/questionFile';
import { addSkillExp, fetchProgress, finishBattle, markBossDefeated, saveAnswer, type QuestionProgress } from '../lib/records';
import type { Skill } from '../lib/skills';
import { canSpeak, speakEnglish, stopSpeaking } from '../lib/speech';

/**
 * 決着がついてから戦闘結果へ移るまでの、最低限の待ち時間（ミリ秒）。
 * 倒れる動き（styles.css の monster-defeated：ふつう2秒、ボス2.6秒。負けたときの主人公も2秒）が終わって、少し間をおいてから移る。
 * 動きを減らす設定のときは、すっと消える0.6秒だけ待つ。
 */
const DEFEAT_MS = { normal: 2000, boss: 2600, reduced: 600 };
/** 倒れたあと・ちからつきたあとに、結果へ移る前におく間 */
const AFTER_END_PAUSE_MS = 600;

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

type Phase = 'loading' | 'error' | 'question' | 'grading' | 'self-grade' | 'feedback' | 'finishing';

export function BattleScreen({
  monster,
  kind,
  skills,
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
  player: Player;
  isAdmin: boolean;
  onEnd: (result: BattleResult) => void;
  onRunAway: () => void;
}) {
  const [phase, setPhase] = useState<Phase>('loading');
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
        const bySkill = await Promise.all(skills.map((sk) => fetchPlayableQuestions(monster.town_id, sk)));
        const questions = bySkill.flat();
        if (questions.length === 0) throw new Error('この能力値の問題がありません。教材を取り込んでください。');
        const progress = await fetchProgress(questions.map((q) => q.id));
        if (cancelled) return;
        progressRef.current = progress;
        // いちばん長く続いても「倒すのに必要な正解の数 + 自分のHP - 1」問で終わる
        const count = hitsToDefeat(monster, player, skills) + player.maxHp - 1;
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
        if (picked[0].skill === 'listening' && picked[0].audio_text) speakEnglish(picked[0].audio_text);
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
    const base = o.rating === 'good' ? (shown.due ? EXP_CORRECT_REVIEW : EXP_CORRECT) : o.rating === 'close' ? EXP_HALF : 0;
    const gained = base;
    const damage = hit ? damageTo(monster, attackOf(player, skill)) : 0;
    setOutcome({ ...o, damage });
    setPhase('feedback');
    setAnswered((n) => n + 1);
    setAskedSkills((set) => new Set(set).add(skill));
    if ((hit && monsterHp - damage <= 0) || (!hit && playerHp - 1 <= 0)) endedAtRef.current = Date.now();
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
    if (monsterHp <= 0 || playerHp <= 0) {
      void finish(monsterHp <= 0);
      return;
    }
    const nextIndex = index + 1;
    const q = queue[nextIndex % queue.length];
    setIndex(nextIndex);
    setShown(present(q, progressRef.current));
    setOutcome(null);
    setDraft('');
    setGradeError(null);
    setPhase('question');
    window.scrollTo(0, 0);
    // ボタンを押した処理の中で読み上げると、iPhone でも音が出る
    if (q.skill === 'listening' && q.audio_text) speakEnglish(q.audio_text);
  }

  async function finish(won: boolean) {
    setPhase('finishing');
    stopSpeaking();
    // 答えの解説を読んで下のほうにいても、倒れるところが見えるように上へ戻す
    window.scrollTo(0, 0);
    const flawless = won && correctCount === answered;
    const gold = won ? monster.gold : 0;
    // ミスなしのボーナスは、この戦闘で出た能力値それぞれに入る
    const total: Partial<Record<Skill, number>> = { ...expBySkill };
    if (flawless) {
      for (const sk of askedSkills) {
        const bonus = EXP_FLAWLESS_BONUS;
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
    const animMs = prefersReducedMotion() ? DEFEAT_MS.reduced : won && kind === 'boss' ? DEFEAT_MS.boss : DEFEAT_MS.normal;
    const elapsed = Date.now() - (endedAtRef.current ?? Date.now());
    const rest = animMs + AFTER_END_PAUSE_MS - elapsed;
    if (rest > 0) await sleep(rest);
    onEnd({
      monster,
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
  const over = monsterHp <= 0 || playerHp <= 0;
  const hit = outcome ? outcome.rating !== 'bad' : false;
  const models = (q.model_answers ?? []).map((m) => fillNames(m));
  const isSpeaking = !isChoice && skill === 'speaking';

  return (
    <main className="screen battle">
      <section className="battle__enemy">
        <MonsterArt
          skill={monster.skill}
          image={monster.image}
          hurt={phase === 'feedback' && hit}
          defeated={monsterHp <= 0}
          revival={kind === 'revival'}
          size={kind === 'boss' ? 'huge' : 'large'}
        />
        <div className="battle__enemy-info">
          <p className="battle__enemy-name">{monster.name}</p>
          <HpBar label="HP" value={monsterHp} max={monster.hp} />
        </div>
      </section>

      <section className="window battle__question">
        <p className="battle__prompt">{fillNames(q.prompt)}</p>
        {skill === 'grammar' && q.sentence && <p className="battle__sentence">{fillNames(q.sentence)}</p>}
        {!isChoice && q.sentence && (
          <p className="battle__sentence battle__sentence--ja">
            {q.sentence_ja && <small className="note">{fillNames(q.sentence_ja)}</small>}
            {fillNames(q.sentence)}
          </p>
        )}
        {q.format === 'respond' && q.sentence && canSpeak && (
          <button className="command command--listen" type="button" onClick={() => speakEnglish(fillNames(q.sentence!))}>
            ▶ 質問を聞く
          </button>
        )}
        {skill === 'listening' && q.audio_text && (
          <>
            {canSpeak ? (
              <button className="command command--listen" type="button" onClick={() => speakEnglish(q.audio_text!)}>
                ▶ 聞く
              </button>
            ) : (
              <p className="message message--error">この端末では読み上げが使えません。</p>
            )}
            {phase === 'feedback' && <p className="battle__sentence">{q.audio_text}</p>}
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
      ) : isSpeaking ? (
        phase === 'question' ? (
          <SpeakAnswer
            key={`${q.id}-${index}`}
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
              rows={3}
              maxLength={300}
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
          {!isChoice && !outcome.selfGraded && (
            <p className={`rating rating--${outcome.rating}`}>{RATING_LABELS[outcome.rating]}</p>
          )}
          <p>
            {hit
              ? `${outcome.rating === 'close' ? 'おしい！ ' : 'せいかい！ '}${monster.name}に ${outcome.damage} のダメージ！${shown!.due && outcome.rating === 'good' ? '（復習ボーナス）' : ''}`
              : `ざんねん… ${heroNameOf(player)}は 1 のダメージを うけた！`}
          </p>
          {outcome.advice && <p>{outcome.advice}</p>}
          {outcome.better && outcome.better.trim() !== outcome.answer.trim() && (
            <div>
              <p className="note">より自然な言い方</p>
              <p className="battle__sentence">{outcome.better}</p>
            </div>
          )}
          {!isChoice && (
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
          {monsterHp <= 0 && (
            <p>
              {heroNameOf(player)}は {monster.name}を たおした！
            </p>
          )}
          {playerHp <= 0 && <p>{heroNameOf(player)}は ちからつきた…</p>}
          <button className="command" type="button" onClick={handleNext} autoFocus={isChoice}>
            {over ? '▶ 戦闘をおえる' : '▶ つぎへ'}
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

      {phase === 'finishing' && (
        <section className="window">
          <p>記録しています…</p>
        </section>
      )}

      <section className="battle__player">
        <div className="battle__player-row">
          <HeroArt
            size={64}
            className={playerHp <= 0 ? 'hero-art--defeated' : phase === 'feedback' && !hit ? 'hero-art--hurt' : ''}
          />
          <HpBar label={heroNameOf(player)} value={playerHp} max={player.maxHp} />
        </div>
        {saveFailed && <p className="message message--error">通信できず、記録できなかった答えがあります。</p>}
      </section>

      {phase === 'question' && (
        <button className="command command--quiet" type="button" onClick={onRunAway}>
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
