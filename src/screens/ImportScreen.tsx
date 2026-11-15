import { useState, type ChangeEvent } from 'react';
import {
  fetchQuestionsByIds,
  fetchQuestionsOfTown,
  fetchTowns,
  importTownAndQuestions,
} from '../lib/content';
import { parseQuestionFile, sameQuestion, type QuestionRow, type TownRow } from '../lib/questionFile';
import { SKILLS, SKILL_LABELS } from '../lib/skills';

/**
 * 教材の取り込み（第1段階の手順4）。
 * 問題ファイルを読んで点検し、何が増えて何が変わるかを見せてから登録する。
 * アプリに同梱した data/ の教材と、端末で選んだファイルのどちらでも取り込める。
 */

// data/ にある問題ファイル。中身は選んだときに読み込む
const BUNDLED = import.meta.glob('../../data/*_questions.json', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>;

const DIFFICULTY_LABEL = ['', '基本', '標準', '目標'];
const MAX_ERRORS_SHOWN = 30;

type Plan = {
  fileName: string;
  town: TownRow;
  townIsNew: boolean;
  townChanged: boolean;
  questions: QuestionRow[];
  added: string[];
  changed: string[];
  unchanged: number;
  notInFile: string[];
};

type State =
  | { kind: 'idle' }
  | { kind: 'checking'; fileName: string }
  | { kind: 'invalid'; fileName: string; errors: string[] }
  | { kind: 'ready'; plan: Plan }
  | { kind: 'importing'; plan: Plan }
  | { kind: 'done'; plan: Plan }
  | { kind: 'failed'; plan: Plan; message: string };

export function ImportScreen({ onBack }: { onBack: () => void }) {
  const [state, setState] = useState<State>({ kind: 'idle' });

  async function check(fileName: string, text: string) {
    setState({ kind: 'checking', fileName });
    try {
      const plan = await makePlan(fileName, text);
      if ('errors' in plan) setState({ kind: 'invalid', fileName, errors: plan.errors });
      else setState({ kind: 'ready', plan });
    } catch (err) {
      setState({ kind: 'invalid', fileName, errors: [`データベースを読めませんでした（${errorMessage(err)}）`] });
    }
  }

  async function handleBundled(path: string) {
    const name = path.split('/').pop()!;
    setState({ kind: 'checking', fileName: name });
    try {
      await check(name, await BUNDLED[path]());
    } catch (err) {
      setState({ kind: 'invalid', fileName: name, errors: [`ファイルを読めませんでした（${errorMessage(err)}）`] });
    }
  }

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      await check(file.name, await file.text());
    } catch (err) {
      setState({ kind: 'invalid', fileName: file.name, errors: [`ファイルを読めませんでした（${errorMessage(err)}）`] });
    }
  }

  async function handleImport(plan: Plan) {
    setState({ kind: 'importing', plan });
    try {
      const toWrite = new Set([...plan.added, ...plan.changed]);
      await importTownAndQuestions(plan.town, plan.questions.filter((q) => toWrite.has(q.id)));
      setState({ kind: 'done', plan });
    } catch (err) {
      setState({ kind: 'failed', plan, message: errorMessage(err) });
    }
  }

  const busy = state.kind === 'checking' || state.kind === 'importing';

  return (
    <main className="screen">
      <section className="window">
        <h2 className="window__title">教材の取り込み</h2>
        <p>問題ファイルを読んで中身を確かめてから、データベースに登録します。同じIDの問題は上書きします。</p>
      </section>

      {state.kind === 'idle' || state.kind === 'invalid' ? (
        <section className="window">
          <h2 className="window__title">取り込むファイル</h2>
          {Object.keys(BUNDLED)
            .sort()
            .map((path) => (
              <button key={path} className="command" type="button" disabled={busy} onClick={() => void handleBundled(path)}>
                ▶ {path.split('/').pop()}
              </button>
            ))}
          <label className="command command--file">
            ▶ ほかのファイルを選ぶ
            <input type="file" accept=".json,application/json" onChange={(e) => void handleFile(e)} disabled={busy} />
          </label>
        </section>
      ) : null}

      {state.kind === 'checking' && (
        <section className="window">
          <p>{state.fileName} を確かめています…</p>
        </section>
      )}

      {state.kind === 'invalid' && (
        <section className="window">
          <h2 className="window__title">取り込めません</h2>
          <p>
            {state.fileName} に、直す必要があるところが {state.errors.length} か所あります。
          </p>
          <ul className="errors">
            {state.errors.slice(0, MAX_ERRORS_SHOWN).map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
          {state.errors.length > MAX_ERRORS_SHOWN && <p>ほか {state.errors.length - MAX_ERRORS_SHOWN} か所</p>}
        </section>
      )}

      {(state.kind === 'ready' || state.kind === 'importing' || state.kind === 'failed') && (
        <PlanView plan={state.plan} />
      )}

      {state.kind === 'ready' &&
        (state.plan.added.length + state.plan.changed.length > 0 || state.plan.townIsNew || state.plan.townChanged ? (
          <button className="command" type="button" onClick={() => void handleImport(state.plan)}>
            ▶ 取り込む（新しい問題 {state.plan.added.length}・変わる問題 {state.plan.changed.length}）
          </button>
        ) : (
          <section className="window">
            <p>データベースの中身と同じなので、取り込むものはありません。</p>
          </section>
        ))}

      {state.kind === 'importing' && (
        <section className="window">
          <p>取り込んでいます…</p>
        </section>
      )}

      {state.kind === 'failed' && (
        <section className="window">
          <p className="message message--error">取り込めませんでした（{state.message}）。もう一度試してください。</p>
          <button className="command" type="button" onClick={() => void handleImport(state.plan)}>
            ▶ もう一度取り込む
          </button>
        </section>
      )}

      {state.kind === 'done' && (
        <section className="window">
          <h2 className="window__title">取り込みました</h2>
          <p>
            街「{state.plan.town.scene}」に、新しい問題 {state.plan.added.length} 問を足し、
            {state.plan.changed.length} 問を更新しました。
          </p>
        </section>
      )}

      {state.kind !== 'idle' && !busy && (
        <button className="command" type="button" onClick={() => setState({ kind: 'idle' })}>
          ▶ 別のファイルを選ぶ
        </button>
      )}
      <button className="command" type="button" onClick={onBack} disabled={busy}>
        ▶ もどる
      </button>
    </main>
  );
}

function PlanView({ plan }: { plan: Plan }) {
  const perSkill = SKILLS.map((s) => [s, plan.questions.filter((q) => q.skill === s).length] as const).filter(
    ([, n]) => n > 0,
  );
  return (
    <section className="window">
      <h2 className="window__title">{plan.fileName} の中身</h2>
      <table className="stats">
        <tbody>
          <tr>
            <th>街</th>
            <td>
              {plan.town.id}「{plan.town.scene}」
              {plan.townIsNew ? '（新しい街）' : plan.townChanged ? '（街の情報が変わります）' : ''}
            </td>
          </tr>
          <tr>
            <th>難易度・順番</th>
            <td>
              {DIFFICULTY_LABEL[plan.town.difficulty]}・{plan.town.sort_order}番目
            </td>
          </tr>
          {perSkill.map(([s, n]) => (
            <tr key={s}>
              <th>{SKILL_LABELS[s]}</th>
              <td>{n}問</td>
            </tr>
          ))}
          <tr>
            <th>新しい問題</th>
            <td>{plan.added.length}問</td>
          </tr>
          <tr>
            <th>変わる問題</th>
            <td>{plan.changed.length}問</td>
          </tr>
          <tr>
            <th>変わらない問題</th>
            <td>{plan.unchanged}問</td>
          </tr>
        </tbody>
      </table>
      {plan.changed.length > 0 && plan.changed.length <= 30 && <p>変わる問題：{plan.changed.join('、')}</p>}
      {plan.notInFile.length > 0 && (
        <p>
          データベースにあってファイルにない問題が {plan.notInFile.length} 問あります。これらは消さずに残します。
        </p>
      )}
      <p className="note">要修正の印は、取り込みでは変わりません。</p>
    </section>
  );
}

async function makePlan(fileName: string, text: string): Promise<Plan | { errors: string[] }> {
  const parsed = parseQuestionFile(text);
  if (parsed.errors.length > 0 || !parsed.town) return { errors: parsed.errors };
  const town = parsed.town;

  const [towns, inTown, sameIds] = await Promise.all([
    fetchTowns(),
    fetchQuestionsOfTown(town.id),
    fetchQuestionsByIds(parsed.questions.map((q) => q.id)),
  ]);

  const errors: string[] = [];
  const orderTaken = towns.find((t) => t.sort_order === town.sort_order && t.id !== town.id);
  if (orderTaken) {
    errors.push(`順番 ${town.sort_order} は、すでに街「${orderTaken.scene}」（${orderTaken.id}）が使っています`);
  }
  for (const q of sameIds) {
    if (q.town_id !== town.id) errors.push(`${q.id}：同じIDの問題が、ほかの街（${q.town_id}）にあります`);
  }
  if (errors.length > 0) return { errors };

  const existing = new Map(inTown.map((q) => [q.id, q]));
  const fileIds = new Set(parsed.questions.map((q) => q.id));
  const added: string[] = [];
  const changed: string[] = [];
  let unchanged = 0;
  for (const q of parsed.questions) {
    const now = existing.get(q.id);
    if (!now) added.push(q.id);
    else if (!sameQuestion(now, q)) changed.push(q.id);
    else unchanged++;
  }
  const townNow = towns.find((t) => t.id === town.id);
  const townChanged =
    !!townNow &&
    (townNow.scene !== town.scene || townNow.difficulty !== town.difficulty || townNow.sort_order !== town.sort_order);

  return {
    fileName,
    town,
    townIsNew: !townNow,
    townChanged,
    questions: parsed.questions,
    added,
    changed,
    unchanged,
    notInFile: inTown.filter((q) => !fileIds.has(q.id)).map((q) => q.id),
  };
}

function errorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err) return String((err as { message: unknown }).message);
  return String(err);
}
