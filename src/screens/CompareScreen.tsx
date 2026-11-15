import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { fetchQuestionsOfTown } from '../lib/content';
import { fillNames } from '../lib/game/battle';
import { compareGraders, fetchGraderStatus, RATING_LABELS, type GradeResult, type ProviderStatus } from '../lib/grading';
import type { QuestionRow } from '../lib/questionFile';

/**
 * AI採点のサービスを比べる（仕様書：同じ答えを各社に採点させ、日本語の助言のわかりやすさで決める）。
 * 利用キーを設定したサービスだけで、同じ答えを同時に採点して並べる。ここでの採点は記録に残らない。
 */

const PROVIDER_LABELS: Record<string, string> = {
  claude: 'Claude（Anthropic）',
  openai: 'OpenAI',
  gemini: 'Gemini（Google）',
};

export function CompareScreen({ townId, onBack }: { townId: string; onBack: () => void }) {
  const [status, setStatus] = useState<{ defaultProvider: string; providers: ProviderStatus[] } | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [questionId, setQuestionId] = useState('');
  const [answer, setAnswer] = useState('');
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<GradeResult[] | null>(null);
  const [runError, setRunError] = useState<string | null>(null);

  useEffect(() => {
    fetchGraderStatus()
      .then(setStatus)
      .catch((err) => setStatusError(err instanceof Error ? err.message : String(err)));
    fetchQuestionsOfTown(townId)
      .then((qs) => {
        const ai = qs.filter((q) => q.format === 'translate' || q.format === 'respond');
        setQuestions(ai);
        if (ai.length > 0) setQuestionId(ai[Math.floor(Math.random() * ai.length)].id);
      })
      .catch(() => setQuestions([]));
  }, [townId]);

  const question = useMemo(() => questions.find((q) => q.id === questionId) ?? null, [questions, questionId]);
  const available = status?.providers.filter((p) => p.available).map((p) => p.provider) ?? [];

  async function handleRun(e: FormEvent) {
    e.preventDefault();
    if (!question || !answer.trim() || available.length === 0) return;
    setRunning(true);
    setRunError(null);
    setResults(null);
    try {
      setResults(await compareGraders({ questionId: question.id, answer: answer.trim(), providers: available }));
    } catch (err) {
      setRunError(err instanceof Error ? err.message : String(err));
    } finally {
      setRunning(false);
    }
  }

  return (
    <main className="screen">
      <section className="window">
        <h2 className="window__title">AI採点を比べる</h2>
        <p>同じ答えを、利用キーを設定したサービスに同時に採点させて並べます。日本語の助言がわかりやすいかで選んでください。ここでの採点は記録に残りません。</p>
      </section>

      <section className="window">
        <h2 className="window__title">使えるサービス</h2>
        {statusError && (
          <p className="message message--error">
            採点の仕組みにつながりませんでした（{statusError}）。docs/setup_grading.md の手順を確かめてください。
          </p>
        )}
        {!status && !statusError && <p>確かめています…</p>}
        {status && (
          <table className="stats">
            <tbody>
              {status.providers.map((p) => (
                <tr key={p.provider}>
                  <th>{PROVIDER_LABELS[p.provider] ?? p.provider}</th>
                  <td>
                    {p.available ? p.model : <span className="note">キー未設定</span>}
                    {p.provider === status.defaultProvider && p.available && <span className="note">（ふだん使う）</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <form className="window write" onSubmit={(e) => void handleRun(e)}>
        <label className="field">
          <span>問題</span>
          <select className="select" value={questionId} onChange={(e) => setQuestionId(e.target.value)}>
            {questions.map((q) => (
              <option key={q.id} value={q.id}>
                {q.id.replace(/^town\d+-/, '')}　{fillNames(q.sentence ?? '')}
              </option>
            ))}
          </select>
        </label>
        {question && (
          <p className="battle__sentence battle__sentence--ja">
            {question.sentence_ja && <small className="note">{fillNames(question.sentence_ja)}</small>}
            {fillNames(question.sentence ?? '')}
          </p>
        )}
        <label className="field">
          <span>答え（わざと間違えた答えも試すと、違いがよくわかります）</span>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={3}
            maxLength={300}
            lang="en"
            autoCapitalize="sentences"
            autoCorrect="off"
            spellCheck={false}
          />
        </label>
        <button
          className="command"
          type="submit"
          disabled={running || !answer.trim() || !question || available.length === 0}
        >
          {running ? '採点しています…' : `▶ ${available.length}社で採点する`}
        </button>
      </form>

      {runError && <p className="message message--error">採点できませんでした（{runError}）</p>}

      {results && (
        <div className="compare">
          {results.map((r) => (
            <section key={r.provider} className="window">
              <h2 className="window__title">
                {PROVIDER_LABELS[r.provider] ?? r.provider}
                <span className="note">　{r.model}・{(r.ms / 1000).toFixed(1)}秒</span>
              </h2>
              {r.ok ? (
                <>
                  <p className={`rating rating--${r.rating}`}>{RATING_LABELS[r.rating]}</p>
                  <p>{r.advice}</p>
                  <p className="note">より自然な言い方</p>
                  <p className="battle__sentence">{r.better}</p>
                </>
              ) : (
                <p className="message message--error">失敗しました（{r.error}）</p>
              )}
            </section>
          ))}
        </div>
      )}

      <button className="command" type="button" onClick={onBack} disabled={running}>
        ▶ もどる
      </button>
    </main>
  );
}
