# 英語ステータス育成アプリ（アプリ名：English Quest）

ドラクエ風の冒険で英語を練習し、自分の6つの能力値が六角形として伸びていく、自分専用のWebアプリ。

詳しい仕様は `docs/spec.md` にある。作業を始める前に必ず読むこと。

## 前提

- 利用者は自分1人（iPhoneとPCで同じ記録を使う）。後から公開する可能性があるので、利用者IDを持たせた設計にする。
- 学習の目的は日常会話が滞りなくできること（TOEIC 750点程度）。今は簡単な単語でぎこちなく会話できるくらい。
- 技術は React（Vite）＋ Supabase（認証、Postgres、Edge Functions）。
- 主に使う端末は iPhone（Safari、ホーム画面に追加して起動する想定）。

## 守ること

- 装備やアイテムで英語の正誤を変えない（ヒント、選択肢を減らす等は入れない）。
- ガチャと、練習回数を制限するスタミナは入れない。
- モンスター・街・装備の名前とデザインはすべてオリジナルにする。既存ゲームの名前や絵は使わない。
- AIサービスの利用キーは画面側に置かず、Edge Functions の中に置く。
- AI採点と文字起こしの呼び出しは1か所にまとめ、サービスを差し替えられるようにする。
- ブラウザ標準の音声認識（SpeechRecognition）は使わない。録音して文字起こしに送る。
- 能力値の低下は毎日動く処理にせず、アプリを開いたときに「最後に練習した日」から計算する。
- 街・モンスター・装備品・問題はファイル（JSON）で用意し、街を足すときにプログラムを直さずに済むようにする。

## 最初にやること

第1段階の手順1から始める。

1. Supabase のプロジェクトを作る手順を案内し、`docs/spec.md` の「データ設計」をもとにテーブル定義（SQL）と Row Level Security を作る。
2. React（Vite）の土台を作り、Supabase のログインをつなぐ。自分専用なので新規登録は閉じる。
3. iPhone のホーム画面から開いた状態で、マイク録音ができるかを確かめる小さな試作ページを作る（MediaRecorder）。
4. `data/town01_questions.json` を取り込む処理を作る。

各手順の終わりに、何ができて、次に何をするかを短く伝えること。

## ファイル

- `docs/spec.md`：仕様書（2026-11-15 時点）
- `data/town01_questions.json`：最初の街「あいさつと自己紹介」の教材150問（各能力値30問）。2026-11-16に本人が確認済み
- `scripts/build_town01.py`：上の教材ファイルを作ったスクリプト。問題の修正はここを直して作り直す（`python3 scripts/build_town01.py data/town01_questions.json`）

## 決まったこと（2026-11-16）

- 採点は Claude（claude-haiku-5-5）、文字起こしは OpenAI（gpt-transcribe）。各社の比較はしない。
- 名前は、今のもの（ページムシ・ことだまの門番など）を当面そのまま使う。
- 絵は Pixellab（Claude Code に MCP でつないである）で作る。モンスター 64×64、ボス 96×96、主人公 64×64、装備品 32×32、街の背景と工房の絵 256×112（工房は public/shops/{街のID}.png）。指示文に既存ゲームの名前は入れない。差し替えは `public/` の同じ名前の PNG を置き換える（2026-11-16 に15枚を差し替え済み）。
- 主人公とモンスターは、2コマ目の絵（同じ名前に `-breath` をつけた PNG。足元より上を1マス下げたもの）と交互に出して、呼吸しているように動かす。2コマ目は `scripts/make_breath_frames.ps1` で作る（PowerShell で動く）。絵を差し替えたり足したりしたら、このスクリプトの一覧を直して動かし直す。2コマ目がない絵は止まったまま出る。
- アプリのアイコン（2026-11-17）は、主人公の顔（`art/icon-candidates/icon-A.png`、Pixellab）をひとまわり大きい 80×80 に置き、下に金のドット文字「ENGLISH QUEST」を入れたもの。作り直しは `powershell -ExecutionPolicy Bypass -File scripts/make_icon.ps1 -Source art/icon-candidates/icon-A.png -Out art/icon-candidates/icon-A-title.png -Export`（public の icon-512・icon-192・apple-touch-icon を書き出す）。前の六角形のアイコンを作る `scripts/make_icons.mjs` は、動かすと上書きされるので使わない。
- `scripts/make_sprites.mjs` は前の仮の絵を作るスクリプト。実行すると Pixellab の絵が上書きされるので使わない。前の絵そのものは `art/old-sprites/` に残してある（`art/README.md`）。

- だれでも参加できるようにする（2026-11-16）。ログイン画面に「Google でログイン」を置き、はじめての人はそのままアカウントができる。メールアドレス＋パスワードのログインも残す。設定は `docs/setup_google_login.md`。教材の取り込みは管理者（`app_admins`）だけ。AI の料金は参加した人の分もこのアプリのキーで払うので、各社の管理画面で上限を決めておく。
- 街の外はマップを歩いてモンスターに出会う形（2026-11-16）。選んで戦う入口は、街の「スキルダンジョン」に分けた（戦闘のあとは始めた場所にもどる）。マップは `public/maps/{街のID}.json`（地形・場所・出やすい能力値。街を足すときはファイルを足すだけ）、出会いの計算は `src/lib/game/fieldMap.ts`、数値は `rules.ts`。マップの絵は Pixellab で作った（32×32）。地面は Wang タイルの組（2つの地形をつなぐ絵。境目は角ごとに絵を選んでなめらかにつなぐ）で、マップのファイルの `ground.sets` に書く：`public/maps/terrain-path.png`（道と草）・`terrain-water.png`（湖と草、砂の岸つき）・`terrain-forest.png`（森の地面と草）・`terrain-stone.png`（石だたみと草）・`terrain-path-forest.png`（道と森の地面）。組のない地形どうし（例：水と道）はとなりに置かない。2026-11-17 に Pixellab の pro で作り直し、マップを 24×20 に広げた（前の絵とマップは `art/old-map/`）。新しい地面の絵は `node scripts/fetch_tileset.mjs <ID> <保存先>` で取ってきて、表示された corners を書く。置く物は `public/maps/obj-*.png`（木・松・しげみ・岩・切り株・立て札・草むら・花・きのこ・あし・はす・街・門）、マップ用の小さい主人公は `public/hero/hero-map.png`（真横の左向き。右へ歩くときは反転）、上へ歩くときの後ろ姿は `hero-map-up.png`、下へ歩くときの正面は `hero-map-down.png`（どれも Pixellab で、もとの絵から作った）。ボスは街のメニューではなく、マップの奥のボスの場所（tiles の "boss": true。最初の街は、ささやきの森の奥「ことだまの門」、`public/maps/obj-bossgate.png`）を踏んで会いに行く（2026-11-17）。差し替えは同じ名前・同じ並びの PNG で上書きする。
- めずらしいモンスター（2026-11-17）：街の外でだけ、まれに出会う。skill なし・encounter_rate（出会う割合）つきで `data/town01_monsters.json` に書く。ひらめきボタル（1%、勝つと経験値300を出た能力値で分ける）、こばんガエル（4%、80G）。データベースに列を足す SQL は `supabase/migrations/20261117000000_rare_monsters.sql`。

## 未決

- 戦闘・経験値・低下の数値（第1段階を使ってから調整。数値は `src/lib/game/rules.ts`）
- 称号と職業の中身（第2段階以降）
