import { useEffect, useMemo, useState } from 'react';
import { fetchQuestionsByIds, fetchTowns } from '../lib/content';
import { fillNames } from '../lib/game/battle';
import { RATING_LABELS } from '../lib/grading';
import type { QuestionRow } from '../lib/questionFile';
import { fetchAnswerNotes, type AnswerNote } from '../lib/records';
import { SKILL_LABELS } from '../lib/skills';
import { canSpeak, speakEnglish } from '../lib/speech';

/** 一度に出す数（「もっと見る」で増やす） */
const PAGE = 20;
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

type Entry = { note: AnswerNote; question: QuestionRow };
type SkillFilter = 'all' | 'writing' | 'speaking';

/** 「11/21（土）」の形 */
function dateLabel(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}（${WEEKDAYS[d.getDay()]}）`;
}

/**
 * ふりかえりノート：書く・話す問題の、いちばん最近の自分の答えと、AI の評価・助言・より自然な言い方・模範解答。
 * ステータスの画面から開く。「惜しい・通じない」だけにしぼれる。
 * 問題ごとに最近の1つだけが残っている（前の答えは、新しく答えると上書きされる）。
 */
export function NotesScreen({ onBack }: { onBack: () => void }) {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [townNames, setTownNames] = useState<Map<string, string>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const [skill, setSkill] = useState<SkillFilter>('all');
  const [onlyMissed, setOnlyMissed] = useState(false);
  const [shownCount, setShownCount] = useState(PAGE);

  useEffect(() => {
    (async () => {
      const [notes, towns] = await Promise.all([fetchAnswerNotes(), fetchTowns()]);
      setTownNames(new Map(towns.map((t) => [t.id, t.name ?? t.scene])));
      const questions = await fetchQuestionsByIds(notes.map((n) => n.questionId));
      const byId = new Map(questions.map((q) => [q.id, q]));
      const list: Entry[] = [];
      for (const note of notes) {
        const question = byId.get(note.questionId);
        // 書く・話す問題（AI が採点する問題）だけ
        if (!question || (question.skill !== 'writing' && question.skill !== 'speaking')) continue;
        if (question.format !== 'translate' && question.format !== 'respond') continue;
        list.push({ note, question });
      }
      setEntries(list);
    })().catch((err) => setError(err instanceof Error ? err.message : String((err as { message?: string })?.message ?? err)));
  }, []);

  const filtered = useMemo(
    () =>
      (entries ?? []).filter(
        (e) =>
          (skill === 'all' || e.question.skill === skill) &&
          (!onlyMissed || (e.note.feedback?.rating !== undefined && e.note.feedback.rating !== 'good')),
      ),
    [entries, skill, onlyMissed],
  );

  const chooseSkill = (s: SkillFilter) => {
    setSkill(s);
    setShownCount(PAGE);
  };
  const chooseMissed = (on: boolean) => {
    setOnlyMissed(on);
    setShownCount(PAGE);
  };

  return (
    <main className="screen">
      <section className="window">
        <h2 className="window__title">ふりかえりノート</h2>
        <p className="note">
          書く・話す問題の、いちばん最近の答えと AI の助言です。同じ問題にまた答えると、新しい答えに入れかわります。
        </p>
        {error && <p className="message message--error">読み込めませんでした（{error}）</p>}
        {!entries && !error && <p>読み込み中…</p>}
        {entries && (
          <>
            <div className="choice-pair notes__filter notes__filter--three" role="group" aria-label="能力値">
              {(
                [
                  ['all', 'すべて'],
                  ['writing', '書く'],
                  ['speaking', '話す'],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={`command choice-pair__button${skill === value ? ' choice-pair__button--on' : ''}`}
                  aria-pressed={skill === value}
                  onClick={() => chooseSkill(value)}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className={`command choice-pair__button notes__missed${onlyMissed ? ' choice-pair__button--on' : ''}`}
              aria-pressed={onlyMissed}
              onClick={() => chooseMissed(!onlyMissed)}
            >
              {onlyMissed ? '● ' : '○ '}惜しい・通じないだけ
            </button>
            <p className="note">{filtered.length} 問</p>
          </>
        )}
      </section>

      {entries && filtered.length === 0 && (
        <section className="window">
          <p>
            {entries.length === 0
              ? 'まだありません。ライティングやスピーキングのモンスターと戦うと、ここに残ります。'
              : 'この条件の問題はありません。'}
          </p>
        </section>
      )}

      {filtered.slice(0, shownCount).map((e) => (
        <NoteCard key={e.question.id} entry={e} townName={townNames.get(e.question.town_id) ?? e.question.town_id} />
      ))}

      {filtered.length > shownCount && (
        <button className="command" type="button" onClick={() => setShownCount((n) => n + PAGE)}>
          ▶ もっと見る（あと {filtered.length - shownCount} 問）
        </button>
      )}
      <button className="command" type="button" onClick={onBack}>
        ▶ ステータスにもどる
      </button>
    </main>
  );
}

function NoteCard({ entry, townName }: { entry: Entry; townName: string }) {
  const { note, question: q } = entry;
  const fb = note.feedback;
  const answer = note.answer?.trim() ?? '';
  const better = fb?.better?.trim() ?? '';
  const models = (q.model_answers ?? []).map((m) => fillNames(m));
  return (
    <article className="window note-card">
      <p className="note-card__meta">
        【{SKILL_LABELS[q.skill]}】{townName}・{dateLabel(note.answeredAt)}
      </p>
      <p className="note">{fillNames(q.prompt)}</p>
      {q.sentence && <p className="note-card__question">{fillNames(q.sentence)}</p>}
      {fb?.rating && (
        <p className={`rating rating--${fb.rating} note-card__rating`}>
          {RATING_LABELS[fb.rating]}
          {fb.self_graded && <span className="note">（自己採点）</span>}
        </p>
      )}
      <div>
        <p className="note">あなたの答え</p>
        <p className="note-card__answer">{answer || '（文字に残っていません）'}</p>
      </div>
      {fb?.advice && <p className="note-card__advice">{fb.advice}</p>}
      {better && better !== answer && (
        <div>
          <p className="note">より自然な言い方</p>
          <p className="note-card__better">{better}</p>
        </div>
      )}
      {models.length > 0 && (
        <div>
          <p className="note">模範解答</p>
          <ul className="models">
            {models.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="note-card__footer">
        <span className="note">
          正解 {note.correctCount} 回・まちがい {note.wrongCount} 回
        </span>
        {canSpeak && (better || models[0]) && (
          <button className="command command--listen" type="button" onClick={() => speakEnglish(better || models[0])}>
            ▶ 聞く
          </button>
        )}
      </div>
    </article>
  );
}
