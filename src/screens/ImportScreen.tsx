import { useState, type ChangeEvent } from 'react';
import {
  fetchEquipmentByIds,
  fetchEquipmentOfTown,
  fetchMonstersByIds,
  fetchMonstersOfTown,
  fetchQuestionsByIds,
  fetchQuestionsOfTown,
  fetchTowns,
  importTownFile,
} from '../lib/content';
import {
  parseQuestionFile,
  sameEquipment,
  sameMonster,
  sameQuestion,
  type EquipmentRow,
  type MonsterRow,
  type QuestionRow,
  type TownRow,
} from '../lib/questionFile';
import { SKILLS, SKILL_LABELS } from '../lib/skills';

/**
 * 教材の取り込み（第1段階の手順4）。
 * 街のファイル（問題・モンスター）を読んで点検し、何が増えて何が変わるかを見せてから登録する。
 * アプリに同梱した data/ のファイルと、端末で選んだファイルのどちらでも取り込める。
 */

// data/ にある街のファイル。中身は選んだときに読み込む
const BUNDLED = import.meta.glob('../../data/town*.json', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>;

const DIFFICULTY_LABEL = ['', '基本', '標準', '目標'];
const MAX_ERRORS_SHOWN = 30;

type Diff = { added: string[]; changed: string[]; unchanged: number; notInFile: string[] };

type Plan = {
  fileName: string;
  town: TownRow;
  townIsNew: boolean;
  townChanged: boolean;
  questions: QuestionRow[];
  monsters: MonsterRow[];
  equipment: EquipmentRow[];
  q: Diff;
  m: Diff;
  e: Diff;
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
      const qWrite = new Set([...plan.q.added, ...plan.q.changed]);
      const mWrite = new Set([...plan.m.added, ...plan.m.changed]);
      const eWrite = new Set([...plan.e.added, ...plan.e.changed]);
      await importTownFile(
        plan.town,
        plan.questions.filter((q) => qWrite.has(q.id)),
        plan.monsters.filter((m) => mWrite.has(m.id)),
        plan.equipment.filter((e) => eWrite.has(e.id)),
      );
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
        <p>街のファイル（問題・モンスター・装備品）を読んで中身を確かめてから、データベースに登録します。同じIDのものは上書きします。</p>
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
        (hasWork(state.plan) ? (
          <button className="command" type="button" onClick={() => void handleImport(state.plan)}>
            ▶ 取り込む
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
            街「{state.plan.town.scene}」に登録しました。
            {state.plan.questions.length > 0 &&
              ` 問題は新しく ${state.plan.q.added.length} 問、更新 ${state.plan.q.changed.length} 問。`}
            {state.plan.monsters.length > 0 &&
              ` モンスターは新しく ${state.plan.m.added.length} 体、更新 ${state.plan.m.changed.length} 体。`}
            {state.plan.equipment.length > 0 &&
              ` 装備品は新しく ${state.plan.e.added.length} 個、更新 ${state.plan.e.changed.length} 個。`}
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

function hasWork(plan: Plan): boolean {
  return (
    plan.townIsNew ||
    plan.townChanged ||
    plan.q.added.length +
      plan.q.changed.length +
      plan.m.added.length +
      plan.m.changed.length +
      plan.e.added.length +
      plan.e.changed.length >
      0
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
          {plan.questions.length > 0 && <DiffRows label="問題" unit="問" diff={plan.q} />}
          {plan.monsters.length > 0 && (
            <>
              <tr>
                <th>モンスター</th>
                <td>{plan.monsters.map((m) => m.name).join('、')}</td>
              </tr>
              <DiffRows label="モンスター" unit="体" diff={plan.m} />
            </>
          )}
          {plan.equipment.length > 0 && (
            <>
              <tr>
                <th>装備品</th>
                <td>{plan.equipment.map((e) => e.name).join('、')}</td>
              </tr>
              <DiffRows label="装備品" unit="個" diff={plan.e} />
            </>
          )}
        </tbody>
      </table>
      {plan.q.changed.length > 0 && plan.q.changed.length <= 30 && <p>変わる問題：{plan.q.changed.join('、')}</p>}
      {plan.q.notInFile.length > 0 && (
        <p>データベースにあってファイルにない問題が {plan.q.notInFile.length} 問あります。消さずに残します。</p>
      )}
      {plan.questions.length > 0 && <p className="note">要修正の印は、取り込みでは変わりません。</p>}
    </section>
  );
}

function DiffRows({ label, unit, diff }: { label: string; unit: string; diff: Diff }) {
  return (
    <>
      <tr>
        <th>新しい{label}</th>
        <td>
          {diff.added.length}
          {unit}
        </td>
      </tr>
      <tr>
        <th>変わる{label}</th>
        <td>
          {diff.changed.length}
          {unit}
        </td>
      </tr>
      <tr>
        <th>変わらない{label}</th>
        <td>
          {diff.unchanged}
          {unit}
        </td>
      </tr>
    </>
  );
}

function diffRows<T extends { id: string }>(fileRows: T[], dbRows: T[], same: (a: T, b: T) => boolean): Diff {
  const existing = new Map(dbRows.map((r) => [r.id, r]));
  const fileIds = new Set(fileRows.map((r) => r.id));
  const added: string[] = [];
  const changed: string[] = [];
  let unchanged = 0;
  for (const r of fileRows) {
    const now = existing.get(r.id);
    if (!now) added.push(r.id);
    else if (!same(now, r)) changed.push(r.id);
    else unchanged++;
  }
  return { added, changed, unchanged, notInFile: dbRows.filter((r) => !fileIds.has(r.id)).map((r) => r.id) };
}

async function makePlan(fileName: string, text: string): Promise<Plan | { errors: string[] }> {
  const parsed = parseQuestionFile(text);
  if (parsed.errors.length > 0 || !parsed.town) return { errors: parsed.errors };
  const town = parsed.town;

  const [towns, qInTown, qSameIds, mInTown, mSameIds, eInTown, eSameIds] = await Promise.all([
    fetchTowns(),
    parsed.questions.length > 0 ? fetchQuestionsOfTown(town.id) : Promise.resolve([]),
    fetchQuestionsByIds(parsed.questions.map((q) => q.id)),
    parsed.monsters.length > 0 ? fetchMonstersOfTown(town.id) : Promise.resolve([]),
    fetchMonstersByIds(parsed.monsters.map((m) => m.id)),
    parsed.equipment.length > 0 ? fetchEquipmentOfTown(town.id) : Promise.resolve([]),
    fetchEquipmentByIds(parsed.equipment.map((e) => e.id)),
  ]);

  const errors: string[] = [];
  const orderTaken = towns.find((t) => t.sort_order === town.sort_order && t.id !== town.id);
  if (orderTaken) {
    errors.push(`順番 ${town.sort_order} は、すでに街「${orderTaken.scene}」（${orderTaken.id}）が使っています`);
  }
  for (const r of [...qSameIds, ...mSameIds, ...eSameIds]) {
    if (r.town_id !== town.id) errors.push(`${r.id}：同じIDのものが、ほかの街（${r.town_id}）にあります`);
  }
  if (errors.length > 0) return { errors };

  const townNow = towns.find((t) => t.id === town.id);
  return {
    fileName,
    town,
    townIsNew: !townNow,
    townChanged:
      !!townNow &&
      (townNow.scene !== town.scene || townNow.difficulty !== town.difficulty || townNow.sort_order !== town.sort_order),
    questions: parsed.questions,
    monsters: parsed.monsters,
    equipment: parsed.equipment,
    q: diffRows(parsed.questions, qInTown, sameQuestion),
    m: diffRows(parsed.monsters, mInTown, sameMonster),
    e: diffRows(parsed.equipment, eInTown, sameEquipment),
  };
}

function errorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err) return String((err as { message: unknown }).message);
  return String(err);
}
