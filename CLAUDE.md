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
- `data/town02_questions.json`・`town02_monsters.json`・`town02_equipment.json`：2つ目の街「にぎわいの市」（買い物）の教材180問・モンスター・装備品（2026-11-18）。問題は `scripts/build_town02.mjs` で作る（`node scripts/build_town02.mjs data/town02_questions.json`。このPCには Python がないので Node で書いた）

## 決まったこと（2026-11-16）

- 採点は Claude（claude-haiku-5-5）、文字起こしは OpenAI（gpt-transcribe）。各社の比較はしない。
- 名前は、今のもの（ページムシ・ことだまの門番など）を当面そのまま使う。
- 絵は Pixellab（Claude Code に MCP でつないである）で作る。モンスター 64×64、ボス 96×96、主人公 64×64、装備品 32×32、街の背景と工房の絵 256×112（工房は public/shops/{街のID}.png）。指示文に既存ゲームの名前は入れない。差し替えは `public/` の同じ名前の PNG を置き換える（2026-11-16 に15枚を差し替え済み）。
- 主人公とモンスターは、2コマ目の絵（同じ名前に `-breath` をつけた PNG。足元より上を1マス下げたもの）と交互に出して、呼吸しているように動かす。2コマ目は `scripts/make_breath_frames.ps1` で作る（PowerShell で動く）。絵を差し替えたり足したりしたら、このスクリプトの一覧を直して動かし直す。2コマ目がない絵は止まったまま出る。復活モンスターは、同じ名前に `-revival` をつけた色違いの絵（2026-11-17、Pixellab で薄紫と水色に塗り直し。呼吸の2コマ目は `-revival-breath`）を使い、なければ画面で色をずらす。
- アプリのアイコン（2026-11-17）は、主人公の顔（`art/icon-candidates/icon-A.png`、Pixellab）をひとまわり大きい 80×80 に置き、下に金のドット文字「ENGLISH QUEST」を入れたもの。作り直しは `powershell -ExecutionPolicy Bypass -File scripts/make_icon.ps1 -Source art/icon-candidates/icon-A.png -Out art/icon-candidates/icon-A-title.png -Export`（public の icon-512・icon-192・apple-touch-icon を書き出す）。前の六角形のアイコンを作る `scripts/make_icons.mjs` は、動かすと上書きされるので使わない。
- 街の画面は、ゲームのトップ画面の形（2026-11-17）：上に主人公とおかね・右上に「？（あそびかた）」と歯車（設定）、下に行き先のボタンを固定（components/BottomNav。App の withNav が、街・スキルダンジョン・ステータス・図鑑・工房の画面の下に出し、いまの画面のボタンを金色にする。戦闘・結果・マップ・設定には出さない）。アイコンは `public/ui/icon-*.png`（map＝街の外へはコンパス、status＝ステータスは六角形の模様が描かれた巻物。どちらも本人が3案から選んだ。ほかに dungeon・book・workshop・settings・help・coin。どれも Pixellab、32×32）。
- 画面のわく（2026-11-17）：ウインドウ・ボタン・答えの選択肢・カード・マップのわくは、ドット絵の `public/ui/frame-{white,gold,grey,purple,red,green}.png`（`scripts/make_ui_frames.ps1` で描いた。Pixellab は使っていない）を CSS の border-image で使う。ふつうは白、選んでいるときは金、使えないときは灰色、正解は緑、まちがい・録音は赤、復活は紫。ウインドウの中は深い青。
- `scripts/make_sprites.mjs` は前の仮の絵を作るスクリプト。実行すると Pixellab の絵が上書きされるので使わない。前の絵そのものは `art/old-sprites/` に残してある（`art/README.md`）。

- だれでも参加できるようにする（2026-11-16）。ログイン画面に「Google でログイン」を置き、はじめての人はそのままアカウントができる。メールアドレス＋パスワードのログインも残す。設定は `docs/setup_google_login.md`。教材の取り込みは管理者（`app_admins`）だけ。AI の料金は参加した人の分もこのアプリのキーで払うので、各社の管理画面で上限を決めておく。
- 街の外はマップを歩いてモンスターに出会う形（2026-11-16）。選んで戦う入口は、街の「スキルダンジョン」に分けた（戦闘のあとは始めた場所にもどる）。マップは `public/maps/{街のID}.json`（地形・場所・出やすい能力値。街を足すときはファイルを足すだけ）、出会いの計算は `src/lib/game/fieldMap.ts`、数値は `rules.ts`。マップの絵は Pixellab で作った（32×32）。地面は Wang タイルの組（2つの地形をつなぐ絵。境目は角ごとに絵を選んでなめらかにつなぐ）で、マップのファイルの `ground.sets` に書く：`public/maps/terrain-path.png`（道と草）・`terrain-water.png`（湖と草、砂の岸つき）・`terrain-forest.png`（森の地面と草）・`terrain-stone.png`（石だたみと草）・`terrain-path-forest.png`（道と森の地面）。組のない地形どうし（例：水と道）はとなりに置かない。2026-11-17 に Pixellab の pro で作り直し、マップを 24×20 に広げた（前の絵とマップは `art/old-map/`）。新しい地面の絵は `node scripts/fetch_tileset.mjs <ID> <保存先>` で取ってきて、表示された corners を書く。置く物は `public/maps/obj-*.png`（木・松・しげみ・岩・切り株・立て札・草むら・花・きのこ・あし・はす・街・門）、マップ用の小さい主人公は `public/hero/hero-map.png`（真横の左向き。右へ歩くときは反転）、上へ歩くときの後ろ姿は `hero-map-up.png`、下へ歩くときの正面は `hero-map-down.png`（どれも Pixellab で、もとの絵から作った）。歩いている間は、足をふみ出した2コマ（同じ名前に `-walk1`・`-walk2` をつけた PNG。Pixellab の動き生成から選んだ）を1歩ごとに交互に出す。ボスは街のメニューではなく、マップの奥のボスの場所（tiles の "boss": true。最初の街は、ささやきの森の奥「ことだまの門」、`public/maps/obj-bossgate.png`）を踏んで会いに行く（2026-11-17）。戦闘の背景（2026-11-17、Pixellab 256×144）は出会った場所の絵：マップの area_defs の battle_background（`public/battle/town01-meadow.png`・`forest`・`flowers`・`lake`）、スキルダンジョンは能力値ごとの部屋の絵 `public/battle/{街のID}-dungeon-{能力値}.png`（2026-11-17。一覧のカードの背景にも使う。なければ `{街のID}-dungeon.png`）、ボスと門のまえは `{街のID}-boss.png`。絵がなければ背景なしで出る。攻撃の動き（2026-11-17）：正解は主人公がとびだし、モンスターに斬る光（`public/battle/fx-slash.png`）とダメージの数、まちがいはモンスターが飛びかかり、主人公にひっかき傷（`fx-claw.png`）と赤い光。動きは styles.css（battle-fx・damage-pop など）。差し替えは同じ名前・同じ並びの PNG で上書きする。
- ボスはいつでも挑める（2026-11-18）。英語が得意な人が待たされて離れないように、「街の問題の8割に1回以上正解」は鍵ではなく、ボスの画面と街の画面に出す「おすすめの目安」にした（数値は rules.ts の BOSS_RECOMMEND_RATIO）。まだ練習していない人は、戦えるすべての能力値の問題で挑む。
- 公開先は自分のドメイン `https://english-quest.app`（2026-11-21、Vercel で購入。www ともとの vercel.app は 308 で飛ばす。手順は docs/deploy_vercel.md の最後）。
- OGP（2026-11-21）：index.html に題名・説明文・画像（public/ogp.png、1200×630）を書いた。画像は scripts/make_ogp.ps1 の案 A（街の前に男の子と女の子、本人が3案から選んだ）。説明文は「毎日少しずつ、英語で冒険しよう。…ドット絵のRPGで楽しくきたえる英語アプリ。」
- 音（2026-11-20）：Web Audio でその場で合成する（src/lib/sound.ts、音のファイルなし。Pixellab の音楽は Tier 2 からなので使っていない）。BGM は街・街の外・戦闘・ボスの4曲（オリジナルのメロディ、App の bgmFor で画面ごとに選ぶ）、効果音はボタン・出会い・正解・まちがい・倒す・勝ち負け・レベルアップ・買う・街の移動。読み上げ中と録音中は holdBgm で BGM を消す。設定で BGM と効果音をそれぞれオン・オフ（preferences.ts、端末ごと）。
- 記録の画面（2026-11-18）：ステータスの「▶ 記録を見る」から。集計は src/lib/game/history.ts、画面は screens/RecordsScreen.tsx（グラフは SVG を手で描いている）。にげたときも、1問でも答えていれば戦闘の履歴を負けとして残す（記録で数えるため）。
- 主人公は男の子か女の子を選べる（2026-11-18）。はじめて名前をつける画面と、設定の「主人公の名前と見た目を変える」で選ぶ。記録は adventure_state.hero_look（SQL は supabase/migrations/20261118000000_hero_look.sql。列がまだなくても男の子として読める）。女の子の絵は public/hero/girl/ に男の子と同じ名前で置く（本人が3案から B：茶色の長い髪の三つ編みとスカートを選んだ。案は art/hero-candidates/。マップ用と歩く絵は男の子の絵を Pixellab の edit_image_pixen で髪だけ変えたもの）。今の見た目は src/lib/heroLook.ts（heroSrc で絵の場所を変える）。
- 2つ目の街「にぎわいの市」（2026-11-18）：場面は買い物、1つ目より一段上（中学2〜3年、TOEIC 500〜600）、ここでリーディングが解放される。モンスターはねふだネズミ・てんびんガニ・よびこみオウム・レシートヘビ・ちょうめんフクロウ・ねぎりダヌキ、めずらしいモンスターはほしくずリス（1%、経験値400）・ちょきんブタ（4%、120G）、ボスは東の関所の「せきもりの大ガメ」（HP180、200G）。絵はすべて Pixellab（pixen）。街の行き来は、ボスを倒すとボスの画面の「門をくぐって次の街へ」、戻るのはマップの西の端の道（tiles の exit。踏むと「向かいますか？」と聞く）。着くと、その街に問題がある未解放の能力値を解放する（records.ts の moveToTown）。総合レベルは一度も練習していない能力値を除いて計算する。街の名前は街のファイルの town.name、ボスのいる場所の説明はマップの boss_place。
- めずらしいモンスター（2026-11-17）：街の外でだけ、まれに出会う。skill なし・encounter_rate（出会う割合）つきで `data/town01_monsters.json` に書く。ひらめきボタル（1%、勝つと経験値300を出た能力値で分ける）、こばんガエル（4%、80G）。データベースに列を足す SQL は `supabase/migrations/20261117000000_rare_monsters.sql`。

## 未決

- 戦闘・経験値・低下の数値（第1段階を使ってから調整。数値は `src/lib/game/rules.ts`）
- 称号と職業の中身（第2段階以降）
