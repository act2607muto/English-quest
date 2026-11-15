# Vercel で公開する手順

第1段階の手順3。iPhone で録音を試すには https で開く必要があるので、アプリを Vercel に置く。

流れは「GitHub にコードを置く → Vercel が GitHub から取り込んで公開する」。一度つなげば、GitHub にコードを送るたびに自動で公開し直される。

## 1. GitHub にコードの置き場所を作る

1. https://github.com を開き、アカウントがなければ作る。
2. 右上の「＋」→「New repository」を押す。
3. 次のように入れる。
   - **Repository name**：`english-status`（何でもよい）
   - **Private** を選ぶ（自分だけが見られる）
   - 「Add a README file」などのチェックは**すべて外したまま**にする（中身は手元から送る）
4. 「Create repository」を押す。
5. 表示された `https://github.com/（ユーザー名）/english-status.git` の形の URL を控える。

この URL を Claude に伝えると、手元のコードを送る。初めて送るときは、GitHub へのログインを求める画面が開くので、ログインする。

## 2. Vercel につないで公開する

1. https://vercel.com を開き、「Sign Up」を押す。
2. プランは **Hobby**（無料、個人で使う場合）を選び、「Continue with GitHub」で GitHub のアカウントを使って登録する。
3. 「Add New…」→「Project」を押す。
4. 「Import Git Repository」に `english-status` が出たら「Import」を押す。出ないときは「Configure GitHub App」から、このリポジトリへのアクセスを許可する。
5. 設定の画面で次を確かめる。
   - **Framework Preset**：`Vite`（自動で選ばれる）
   - **Build Command**：`npm run build`、**Output Directory**：`dist`（どちらも自動のままでよい）
6. **Environment Variables** を開き、`.env.local` と同じ2つを入れる。

| Key | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | `https://xxxx.supabase.co`（末尾に `/rest/v1/` を付けない） |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_...` |

7. 「Deploy」を押す。1分ほどで終わり、`https://english-status-xxxx.vercel.app` のような URL ができる。

## 3. Supabase に公開先を伝える

1. Supabase の「Authentication」→「URL Configuration」を開く。
2. **Site URL** を手順2でできた URL に変えて保存する。

パスワードでログインする間は必須ではないが、Supabase から送られるメールのリンク先がこの URL になる。

## 4. iPhone のホーム画面に追加する

1. iPhone の Safari で、手順2の URL を開く。
2. 画面下の共有ボタン（四角から上向きの矢印）→「ホーム画面に追加」を押す。
3. 「Webアプリとして開く」が表示されたらオンにして、「追加」を押す。
4. ホーム画面に六角形のアイコンができる。

## 5. 録音を試す

ホーム画面のアイコンから開いて試す。Safari から開いた状態では確認にならない。

1. ログインする。
2. 「マイクのテスト」を押す。「開き方」が **ホーム画面から** になっていることを確かめる。
3. 「録音する」を押し、マイクの許可を求められたら「許可」を選ぶ。
4. 英語で一言話して「とめる」を押す。結果の欄で再生して、声が聞こえるか確かめる。
5. 続けてあと2回録音する。2回目以降も録れるかを確かめる。
6. 止めたあと、画面上部のマイク使用中の表示（オレンジの点など）が消えるか確かめる。
7. アプリを一度閉じて（上にスワイプして終了）開き直し、もう一度録音する。
8. 「結果をコピー」を押し、Claude に貼り付けて伝える。

### 確かめたいこと

| 項目 | 期待すること |
| --- | --- |
| 開き方 | ホーム画面から |
| 録音の形式 | `audio/mp4` が含まれる |
| 録音1〜3 | すべて成功し、再生すると声が聞こえる |
| マイクの表示 | 止めると消える |
| 開き直したあと | 録音できる（許可をもう一度聞かれることはある） |
