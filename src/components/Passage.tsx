import { dialogueLines } from '../lib/dialogue';

/**
 * リーディングの文章（4つ目の街から、メールとメッセージを見た目で分ける。2026-11-21）。
 * - メール：文章の最初が「From:」「To:」「Subject:」「Date:」の行なら、上に差出人などの欄、下に本文のカードにする。
 * - メッセージ：どの行も「名前: 本文」（名前は1語）なら、スマホのメッセージのような吹き出しにする（1人目は左、ほかは右）。
 *   にぎわいの市の短い会話（A: … / B: …）も吹き出しで出る。
 * - 記事（5つ目の街から。2026-11-22）：最初の行が「# 見出し」なら、見出しつきの記事のカードにする。
 * - いくつかの文書（5つ目の街から）：「---」だけの行で区切ると、文書ごとに分けて「文書1」「文書2」…と並べる。
 *   それぞれの文書は、上のメール・メッセージ・記事・ふつうの文のどれかで出る。
 * - ほかは、今までどおり金色の字で改行どおりに出す（battle__passage）。
 * 問題ファイルの書き方は変えない（sentence にそのまま書く）。
 */
const HEADER = /^(From|To|Cc|Subject|Date):\s*(.*)$/i;
const HEADER_LABELS: Record<string, string> = { from: '差出人', to: '宛先', cc: 'CC', subject: '件名', date: '日時' };
const DOC_SEPARATOR = /^\s*-{3,}\s*$/;

/** 「---」の行で文書に分ける（区切りがなければ1つ） */
export function splitDocuments(text: string): string[] {
  const docs: string[][] = [[]];
  for (const line of text.split('\n')) {
    if (DOC_SEPARATOR.test(line)) docs.push([]);
    else docs[docs.length - 1].push(line);
  }
  return docs.map((d) => d.join('\n').trim()).filter(Boolean);
}

export function Passage({ text }: { text: string }) {
  const docs = splitDocuments(text);
  if (docs.length <= 1) return <Document text={docs[0] ?? text} />;
  return (
    <div className="docs">
      {docs.map((d, i) => (
        <section key={i} className="docs__item" aria-label={`文書${i + 1}`}>
          <p className="docs__label">文書{i + 1}</p>
          <Document text={d} />
        </section>
      ))}
    </div>
  );
}

function Document({ text }: { text: string }) {
  const lines = text.split('\n');
  const headerCount = lines.findIndex((l) => !HEADER.test(l.trim()));
  const headers = lines.slice(0, headerCount === -1 ? lines.length : headerCount);
  if (headers.length >= 2) {
    const body = lines.slice(headers.length).join('\n').trim();
    return (
      <div className="mail" aria-label="メール">
        <dl className="mail__head">
          {headers.map((l, i) => {
            const m = l.trim().match(HEADER)!;
            return (
              <div key={i} className="mail__row">
                <dt>{HEADER_LABELS[m[1].toLowerCase()] ?? m[1]}</dt>
                <dd lang="en">{m[2]}</dd>
              </div>
            );
          })}
        </dl>
        <p className="mail__body" lang="en">
          {body}
        </p>
      </div>
    );
  }
  const title = lines[0].trim().match(/^#\s+(.+)$/);
  if (title) {
    return (
      <article className="article" aria-label="記事">
        <h3 className="article__title" lang="en">
          {title[1]}
        </h3>
        <p className="article__body" lang="en">
          {lines.slice(1).join('\n').trim()}
        </p>
      </article>
    );
  }
  // 名前は1語（A・Ken など）のときだけ。「Special offer: …」のような値段表を吹き出しにしないため
  const chat = dialogueLines(text);
  if (chat && chat.every((c) => /^[A-Za-z']+$/.test(c.speaker))) {
    const first = chat[0].speaker;
    return (
      <div className="chat" aria-label="メッセージ">
        {chat.map((c, i) => (
          <div key={i} className={`chat__msg${c.speaker === first ? '' : ' chat__msg--me'}`}>
            <span className="chat__name">{c.speaker}</span>
            <p className="chat__bubble" lang="en">
              {c.text}
            </p>
          </div>
        ))}
      </div>
    );
  }
  return <p className="battle__passage">{text}</p>;
}
