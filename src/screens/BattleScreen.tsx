import { useEffect, useRef, useState } from 'react';
import { MonsterArt } from '../components/MonsterArt';
import { fetchPlayableQuestions, flagQuestion } from '../lib/content';
import { pickQuestions, shuffleChoices, fillNames } from '../lib/game/battle';
import { isDue } from '../lib/game/growth';
import type { Player } from '../lib/game/player';
import { EXP_CORRECT, EXP_CORRECT_REVIEW, EXP_FLAWLESS_BONUS } from '../lib/game/rules';
import type { MonsterRow, QuestionRow } from '../lib/questionFile';
import { addSkillExp, fetchProgress, finishBattle, saveAnswer, type QuestionProgress } from '../lib/records';
import type { Skill } from '../lib/skills';
import { canSpeak, speakEnglish, stopSpeaking } from '../lib/speech';

/**
 * 戦闘。正解すると相手に1ダメージ、不正解なら自分が1ダメージ。
 * 答えるたびに、問題の学習状態と経験値を保存する（途中で閉じても、正解した分は残る）。
 */

export type BattleResult = {
  monster: MonsterRow;
  won: boolean;
  correct: number;
  total: number;
  flawless: boolean;
  exp: number;
  gold: number;
  saveFailed: boolean;
};

type Shown = { question: QuestionRow; choices: string[]; answerIndex: number; due: boolean };

type Phase = 'loading' | 'error' | 'question' | 'feedback' | 'finishing';

export function BattleScreen({
  monster,
  player,
  isAdmin,
  onEnd,
  onRunAway,
}: {
  monster: MonsterRow;
  player: Player;
  isAdmin: boolean;
  onEnd: (result: BattleResult) => void;
  onRunAway: () => void;
}) {
  const skill = monster.skill as Skill;
  const [phase, setPhase] = useState<Phase>('loading');
  const [error, setError] = useState<string | null>(null);
  const [queue, setQueue] = useState<QuestionRow[]>([]);
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState<Shown | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [monsterHp, setMonsterHp] = useState(monster.hp);
  const [playerHp, setPlayerHp] = useState(player.maxHp);
  const [correctCount, setCorrectCount] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [exp, setExp] = useState(0);
  const [saveFailed, setSaveFailed] = useState(false);
  const [flagged, setFlagged] = useState<Set<string>>(new Set());

  const progressRef = useRef(new Map<string, QuestionProgress>());
  const saveChain = useRef<Promise<void>>(Promise.resolve());
  const saveFailedRef = useRef(false);

  // 出題する問題を決める
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const questions = await fetchPlayableQuestions(monster.town_id, skill);
        if (questions.length === 0) throw new Error('この能力値の問題がありません。教材を取り込んでください。');
        const progress = await fetchProgress(questions.map((q) => q.id));
        if (cancelled) return;
        progressRef.current = progress;
        // いちばん長く続いても「相手のHP + 自分のHP - 1」問で終わる
        const picked = pickQuestions(questions, progress, monster.hp + player.maxHp - 1);
        setQueue(picked);
        setShown(present(picked[0], progress));
        setPhase('question');
        if (skill === 'listening' && picked[0].audio_text) speakEnglish(picked[0].audio_text);
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
  }, [monster, skill, player.maxHp]);

  function present(q: QuestionRow, progress: Map<string, QuestionProgress>): Shown {
    const { choices, answerIndex } = shuffleChoices(q);
    return { question: q, choices: choices.map((c) => fillNames(c)), answerIndex, due: isDue(progress.get(q.id) ?? null) };
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

  function handlePick(i: number) {
    if (!shown || phase !== 'question') return;
    const correct = i === shown.answerIndex;
    const gained = correct ? (shown.due ? EXP_CORRECT_REVIEW : EXP_CORRECT) : 0;
    setPicked(i);
    setPhase('feedback');
    setAnswered((n) => n + 1);
    if (correct) {
      setMonsterHp((hp) => hp - 1);
      setCorrectCount((n) => n + 1);
      setExp((e) => e + gained);
    } else {
      setPlayerHp((hp) => hp - 1);
    }
    const q = shown.question;
    queueSave(async () => {
      const next = await saveAnswer({
        questionId: q.id,
        correct,
        answer: shown.choices[i],
        before: progressRef.current.get(q.id) ?? null,
      });
      progressRef.current.set(q.id, next);
      await addSkillExp(skill, gained);
    });
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
    setPicked(null);
    setPhase('question');
    // ボタンを押した処理の中で読み上げると、iPhone でも音が出る
    if (skill === 'listening' && q.audio_text) speakEnglish(q.audio_text);
  }

  async function finish(won: boolean) {
    setPhase('finishing');
    stopSpeaking();
    const flawless = won && correctCount === answered;
    const bonus = flawless ? EXP_FLAWLESS_BONUS : 0;
    const gold = won ? monster.gold : 0;
    if (bonus > 0) queueSave(() => addSkillExp(skill, bonus));
    queueSave(() =>
      finishBattle({
        townId: monster.town_id,
        monsterId: monster.id,
        questionCount: answered,
        correctCount,
        won,
        expBySkill: { [skill]: exp + bonus },
        gold,
      }),
    );
    await saveChain.current;
    onEnd({
      monster,
      won,
      correct: correctCount,
      total: answered,
      flawless,
      exp: exp + bonus,
      gold,
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
  const isCorrect = picked !== null && picked === shown!.answerIndex;
  const over = monsterHp <= 0 || playerHp <= 0;

  return (
    <main className="screen battle">
      <section className="battle__enemy">
        <MonsterArt skill={skill} image={monster.image} hurt={phase === 'feedback' && isCorrect} />
        <div className="battle__enemy-info">
          <p className="battle__enemy-name">{monster.name}</p>
          <HpBar label="HP" value={monsterHp} max={monster.hp} />
        </div>
      </section>

      <section className="window battle__question">
        <p className="battle__prompt">{fillNames(q.prompt)}</p>
        {skill === 'grammar' && q.sentence && <p className="battle__sentence">{fillNames(q.sentence)}</p>}
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

      <div className="choices">
        {shown!.choices.map((c, i) => {
          const state =
            phase === 'feedback' && i === shown!.answerIndex ? 'right' : phase === 'feedback' && i === picked ? 'wrong' : '';
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

      {phase === 'feedback' && (
        <section className="window battle__message" aria-live="polite">
          <p>
            {isCorrect
              ? `せいかい！ ${monster.name}に 1 のダメージ！${shown!.due ? '（復習ボーナス）' : ''}`
              : `ざんねん… 1 のダメージを うけた！`}
          </p>
          {q.explanation && <p className="note">{fillNames(q.explanation)}</p>}
          {monsterHp <= 0 && <p>{monster.name}を たおした！</p>}
          {playerHp <= 0 && <p>ちからつきた…</p>}
          <button className="command" type="button" onClick={handleNext} autoFocus>
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
        <HpBar label="じぶん" value={playerHp} max={player.maxHp} />
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

function HpBar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="hp" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.max(0, value)}>
      <span className="hp__label">{label}</span>
      <span className="hp__cells">
        {Array.from({ length: max }, (_, i) => (
          <span key={i} className={i < value ? 'hp__cell hp__cell--on' : 'hp__cell'} />
        ))}
      </span>
      <span className="hp__num">
        {Math.max(0, value)}/{max}
      </span>
    </div>
  );
}
