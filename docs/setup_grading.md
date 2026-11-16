# AI採点と文字起こしの準備手順

第1段階の手順4・5。ライティングとスピーキングの答えをAIが採点し、スピーキングの録音を文字にする仕組みを動かす。

採点は Supabase の Edge Function（`supabase/functions/grade`）、文字起こしは `supabase/functions/transcribe` が行う。AIサービスの利用キーは Supabase の中にだけ置き、画面側やGitHubには置かない。

## 1. AIサービスの利用キーを用意する

採点は、比べたいサービスのキーを用意する。1つだけでも動く（その1つで採点する）。

文字起こし（スピーキング）には **OpenAI のキーが必要**（モデルは `gpt-transcribe`）。Claude には文字起こしの機能がない。

どれも使った分だけ料金がかかる。

**利用キーはパスワードと同じ。チャットやファイル、GitHubに貼らない。** 次の手順2で Supabase に直接入れる。

### Claude（Anthropic）

1. https://console.anthropic.com を開いて登録する。
2. 「Settings」→「Billing」で、クレジットを買う（5ドルからで十分）。
3. 「API Keys」→「Create Key」でキーを作り、表示された `sk-ant-...` を控える（一度しか表示されない）。

### OpenAI

1. https://platform.openai.com を開いて登録する。
2. 「Settings」→「Billing」で、クレジットを買う（5ドルからで十分）。
3. 「API keys」→「Create new secret key」でキーを作り、`sk-...` を控える。

### Gemini（Google）

1. https://aistudio.google.com を開き、Google アカウントでログインする。
2. 「Get API key」→「Create API key」でキーを作り、控える。
3. 料金と、送った内容の扱い（無料の枠ではサービスの改善に使われることがある）を、Google の料金ページで確かめる。

## 2. Supabase に利用キーを登録する

1. Supabase の管理画面で、左のメニューの「Edge Functions」を開く。
2. 「Secrets」（または「Manage secrets」）を開く。
3. 次の名前で、用意したキーを入れて保存する。用意しなかったサービスの行は入れなくてよい。

| Name | Value |
| --- | --- |
| `ANTHROPIC_API_KEY` | Claude のキー（`sk-ant-...`） |
| `OPENAI_API_KEY` | OpenAI のキー（スピーキングの文字起こしに使う） |
| `GEMINI_API_KEY` | Gemini のキー |
| `GRADER_PROVIDER` | ふだんの採点に使うサービス。`claude`・`openai`・`gemini` のどれか（今は `claude`） |

文字起こしに使うモデルは `gpt-transcribe`。変えたいときは `TRANSCRIBE_MODEL` を足す。

採点に使うモデルは、Claude が `claude-haiku-5-5`、OpenAI が `gpt-6-luna`、Gemini が `gemini-3.5-flash-lite`（どれも各社の安いモデル）。変えたいときは `CLAUDE_MODEL`・`OPENAI_MODEL`・`GEMINI_MODEL` を足す。

## 3. 採点と文字起こしの仕組みを Supabase に送る

PC のターミナルで、このフォルダ（`handoff`）にいる状態で次を実行する。

1. Supabase にログインする（ブラウザが開くので、許可する）。

```bash
npm run supabase:login
```

2. 採点と文字起こしの仕組みを送る。

```bash
npm run deploy:functions
```

「Deployed Functions.」と出れば完了。管理画面の「Edge Functions」に `grade` と `transcribe` が出る。

`supabase/functions/` の中を直したときは、2 をもう一度実行する。

## 4. 試す

ライティングの戦闘は「街の外」→「インクつぼ」、スピーキングは「おしゃべりどり」。スピーキングでは、録音した声を文字にしたあと、聞き取りが違っていれば手で直してから採点に回せる。録音や文字起こしができないときは「言えた／言えなかった」を自分で選ぶ。

採点できないとき（キーが未設定、通信できない等）は、模範解答を見て自分で「書けた／書けなかった」を選ぶ形に切り替わる。

## 料金の目安

1日30問を採点した場合の、ひと月の目安（各社の安いモデル）。

| サービス | 目安 |
| --- | --- |
| Claude Haiku 5.5 | 0.5ドル前後 |
| OpenAI gpt-6-luna | 0.5ドル前後 |
| Gemini 3.5 Flash-Lite | 未確認（Google の料金ページで確かめる） |

採点はいつも1社（`GRADER_PROVIDER`）だけに送る。サービスを変えたいときは `GRADER_PROVIDER` を書き換える（送り直しは要らない）。
