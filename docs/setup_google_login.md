# Google ログインの設定

ログイン画面の「▶ Google でログイン」を使えるようにする手順。
Google 側（Google Cloud）と Supabase 側の両方で設定する。どちらも無料。

- はじめての人も、Google でログインするとそのままアカウントができる（だれでも参加できる）。
- メールアドレスとパスワードでのログインも、今までどおり使える。
- 「Client Secret」はパスワードと同じくらい大事な値。Supabase の画面に貼るだけにして、ほかの所（チャット、ファイル、GitHub）には書かない。

以下の「アプリの URL」は、Vercel で公開しているアドレス（例：`https://english-status-xxxx.vercel.app`、最後の `/` は付けない）。

## 1. Supabase で、Google から戻ってくる先の URL を確かめる

1. Supabase の管理画面で、このアプリのプロジェクトを開く。
2. 左のメニューの「Authentication」→「Sign In / Providers」（または「Providers」）を開く。
3. 一覧の「Google」を開く。
4. 「Callback URL (for OAuth)」に出ている URL をコピーしておく。
   `https://vjesfbengdyecwhnwtfv.supabase.co/auth/v1/callback` の形になっている。
5. この画面は開いたままにしておく（手順3で戻ってくる）。

## 2. Google Cloud で、Google ログインの登録をする

1. https://console.cloud.google.com を開き、自分の Google アカウントでログインする。
2. 画面上の「プロジェクトを選択」→「新しいプロジェクト」を押す。名前は `english-status` などにして「作成」。作ったプロジェクトが選ばれていることを確かめる。
3. 左のメニュー（☰）から「API とサービス」→「OAuth 同意画面」（または「Google Auth Platform」）を開き、「開始」を押す。
   - アプリ名：`English Quest`
   - ユーザー サポートメール：自分のメールアドレス
   - 対象：**外部**
   - 連絡先のメールアドレス：自分のメールアドレス
   - 同意して「作成」。
   - 作ったあと「ブランディング」を開き、次も入れて保存する（公開するのに必要）。
     - アプリケーションのホームページ：アプリの URL
     - アプリケーション プライバシー ポリシー リンク：アプリの URL のあとに `/privacy.html` を付けたもの
     - 承認済みドメイン：`vjesfbengdyecwhnwtfv.supabase.co` と、アプリの URL のドメイン（例：`english-status-xxxx.vercel.app`）
     - ロゴと利用規約は空のままにする（ロゴを入れると Google の審査が要る）
4. 「対象」（Audience）を開き、公開ステータスの「アプリを公開」を押して **本番環境** にする。
   テストのままだと、自分で登録したテストユーザーしかログインできない。
   使うのは名前とメールアドレスだけなので、Google の審査は要らない。
5. 「クライアント」（Clients）→「クライアントを作成」を押す。
   - アプリケーションの種類：**ウェブ アプリケーション**
   - 名前：`english-status-web`
   - 承認済みの JavaScript 生成元：「URI を追加」で次の2つ
     - アプリの URL
     - `http://localhost:5173`（PC で試すとき用）
   - 承認済みのリダイレクト URI：「URI を追加」で、手順1でコピーした Callback URL
   - 「作成」を押す。
6. 「クライアント ID」と「クライアント シークレット」が出る。次の手順で Supabase に貼る。

## 3. Supabase で Google ログインをオンにする

1. 手順1の「Google」の画面に戻る。
2. 「Enable Sign in with Google」（Google でのログインを有効）をオンにする。
3. 「Client IDs」にクライアント ID、「Client Secret (for OAuth)」にクライアント シークレットを貼る。
4. 「Save」を押す。

## 4. Supabase で、戻ってきてよいアプリのアドレスを登録する

1. 「Authentication」→「URL Configuration」を開く。
2. 「Site URL」をアプリの URL にする。
3. 「Redirect URLs」に「Add URL」で次の2つを足して保存する。
   - アプリの URL のあとに `/**` を付けたもの（例：`https://english-status-xxxx.vercel.app/**`）
   - `http://localhost:5173/**`

## 5. Supabase で新規登録を開く

1. 「Authentication」→「Sign In / Providers」の上のほうにある **Allow new users to sign up** をオンにして保存する。
2. 同じ画面の「Email」の **Confirm email** はオンのままにする（メールアドレスで新しく登録する人は、確認のメールを受け取る）。

これで、だれでも参加できる状態になる。新しい人は、最初のログインで主人公に名前をつける画面が出て、Lv1 から始まる。
教材の取り込みは管理者（`app_admins`）にしか出ないので、新しい人には見えない。

## 6. 試す

1. PC の Safari や Chrome で、アプリの URL を開く（ログイン中ならいったんログアウト）。
2. 「▶ Google でログイン」を押し、Google のアカウントを選ぶ。
3. アプリに戻って、街（はじめての人は名前をつける画面）が出れば完了。
4. iPhone でも、ホーム画面から開いたアプリで同じように試す。
   Google の画面から戻ったとき、ホーム画面のアプリではなく Safari のほうでログインされることがある。そのときは知らせる（直し方を考える）。

自分（今までメールアドレスとパスワードで使っていた人）が、同じメールアドレスの Google でログインすると、同じアカウントとして入れる（記録はそのまま）。

## AI の料金について

ライティングの採点（Claude）とスピーキングの文字起こし（OpenAI）は、参加した人の分も、このアプリのキーで払う。
Anthropic と OpenAI の管理画面で、1か月に使える金額の上限を決めておく。上限に届くと、その月は採点と文字起こしが止まり、アプリは「自分で選ぶ」答え合わせに切り替わる。
