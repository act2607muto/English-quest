import { useEffect, useRef, useState, type FormEvent } from 'react';
import { MonsterArt } from '../components/MonsterArt';
import { SpeakAnswer } from '../components/SpeakAnswer';
import { fetchPlayableQuestions, flagQuestion } from '../lib/content';
import { fillNames, pickQuestions, shuffleChoices } from '../lib/game/battle';
import { withExpBonus } from '../lib/game/equipment';
import { isDue } from '../lib/game/growth';
import type { Player } from '../lib/game/player';
import { EXP_CORRECT, EXP_CORRECT_REVIEW, EXP_FLAWLESS_BONUS, EXP_HALF } from '../lib/game/rules';
import { gradeAnswer, RATING_LABELS, type Rating } from '../lib/grading';
import type { MonsterRow, QuestionRow } from '../lib/questionFile';
import { addSkillExp, fetchProgress, finishBattle, saveAnswer, type QuestionProgress } from '../lib/records';
import type { Skill } from '../lib/skills';
import { canSpeak, speakEnglish, stopSpeaking } from '../lib/speech';

/**
 * 戦闘。正解（AI採点で「通じる」「惜しい」）なら相手に1ダメージ、不正解（「通じない」）なら自分が1ダメージ。
 * 答えるたびに、問題の学習状態と経験値を保存する（途中で閉じても、正解した分は残る）。
 *
 * 4択（語彙・文法・リスニング）と、英文を書いてAIが採点する問題（ライティング）の両方を扱う。
 * AI採点ができないとき（通信できない等）は、模範解答を見て自分で「書けた／書けなかった」を選ぶ。
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
  /** 武器の上乗せが効いたか */
  weaponBonus: boolean;
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
};

type Phase = 'loading' | 'error' | 'question' | 'grading' | 'self-grade' | 'feedback' | 'finishing';

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
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [draft, setDraft] = useState('');
  const [gradeError, setGradeError] = useState<string | null>(null);
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
    const base = o.rating === 'good' ? (shown.due ? EXP_CORRECT_REVIEW : EXP_CORRECT) : o.rating === 'close' ? EXP_HALF : 0;
    const gained = withExpBonus(base, skill, player.mods);
    setOutcome(o);
    setPhase('feedback');
    setAnswered((n) => n + 1);
    if (hit) {
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
    if (skill === 'listening' && q.audio_text) speakEnglish(q.audio_text);
  }

  async function finish(won: boolean) {
    setPhase('finishing');
    stopSpeaking();
    const flawless = won && correctCount === answered;
    const bonus = flawless ? withExpBonus(EXP_FLAWLESS_BONUS, skill, player.mods) : 0;
    const gold = won ? monster.gold : 0;
    if (bonus > 0) queueSave(() => addSkillExp(skill, bonus, player.mods.graceDays));
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
      weaponBonus: player.mods.expBonus?.skill === skill,
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
  const isChoice = q.format === 'choice4';
  const over = monsterHp <= 0 || playerHp <= 0;
  const hit = outcome ? outcome.rating !== 'bad' : false;
  const models = (q.model_answers ?? []).map((m) => fillNames(m));
  const isSpeaking = !isChoice && skill === 'speaking';

  return (
    <main className="screen battle">
      <section className="battle__enemy">
        <MonsterArt skill={skill} image={monster.image} hurt={phase === 'feedback' && hit} />
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
              ? `${outcome.rating === 'close' ? 'おしい！ ' : 'せいかい！ '}${monster.name}に 1 のダメージ！${shown!.due && outcome.rating === 'good' ? '（復習ボーナス）' : ''}`
              : `ざんねん… 1 のダメージを うけた！`}
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
          {monsterHp <= 0 && <p>{monster.name}を たおした！</p>}
          {playerHp <= 0 && <p>ちからつきた…</p>}
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
