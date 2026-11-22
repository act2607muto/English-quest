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
- `data/town04_questions.json`：4つ目の街「とけいだいの城下町」（予定・電話・雑談）の教材（作成中、2026-11-21〜。全部で480問＝6つの能力値×80問。この街から書き取りが加わる）。問題は `scripts/town04/{vocabulary,grammar,…}.mjs` に書き、`node scripts/build_town04.mjs data/town04_questions.json docs/review/town04.md` で作る。そろうまで取り込まない
- `data/town05_questions.json`：5つ目の街「ほしぞらの王城」（旅行と仕事）の教材（2026-11-22。600問＝6つの能力値×100問。アナウンスや説明を聞く・記事やいくつかの文書を読む・意見と理由を書く／話す）。問題は `scripts/town05/{vocabulary,grammar,…}.mjs` に書き、`node scripts/build_town05.mjs data/town05_questions.json docs/review/town05.md` で作る。書庫は data/town05_wordbook.json（1,200語）。名前・モンスター・マップ・装備はまだ
- `data/town03_questions.json`：3つ目の街「食事と道案内」の教材（2026-11-21。360問＝6つの能力値×60問）。問題は能力値ごとに `scripts/town03/{vocabulary,grammar,…}.mjs` に書き、`node scripts/build_town03.mjs data/town03_questions.json docs/review/town03.md` で作る（2つ目は本人に見てもらう一覧）。モンスター・書庫・装備は data/town03_monsters.json・town03_wordbook.json・town03_equipment.json

## 決まったこと（2026-11-16）

- 採点は Claude（claude-haiku-5-5）、文字起こしは OpenAI（gpt-transcribe）。各社の比較はしない。
- 名前は、今のもの（ページムシ・ことだまの門番など）を当面そのまま使う。
- 絵は Pixellab（Claude Code に MCP でつないである）で作る。モンスター 64×64、ボス 96×96、主人公 64×64、装備品 32×32、街の背景と工房の絵 256×112（工房は public/shops/{街のID}.png）。指示文に既存ゲームの名前は入れない。差し替えは `public/` の同じ名前の PNG を置き換える（2026-11-16 に15枚を差し替え済み）。
- 主人公とモンスターは、2コマ目の絵（同じ名前に `-breath` をつけた PNG。足元より上を1マス下げたもの）と交互に出して、呼吸しているように動かす。2コマ目は `scripts/make_breath_frames.ps1` で作る（PowerShell で動く）。絵を差し替えたり足したりしたら、このスクリプトの一覧を直して動かし直す。2コマ目がない絵は止まったまま出る。復活モンスターは、同じ名前に `-revival` をつけた色違いの絵（2026-11-17、Pixellab で薄紫と水色に塗り直し。呼吸の2コマ目は `-revival-breath`）を使い、なければ画面で色をずらす。
- アプリのアイコン（2026-11-17）は、主人公の顔（`art/icon-candidates/icon-A.png`、Pixellab）をひとまわり大きい 80×80 に置き、下に金のドット文字「ENGLISH QUEST」を入れたもの。作り直しは `powershell -ExecutionPolicy Bypass -File scripts/make_icon.ps1 -Source art/icon-candidates/icon-A.png -Out art/icon-candidates/icon-A-title.png -Export`（public の icon-512・icon-192・apple-touch-icon を書き出す）。前の六角形のアイコンを作る `scripts/make_icons.mjs` は、動かすと上書きされるので使わない。
- 街の画面は、ゲームのトップ画面の形（2026-11-17）：上に主人公とおかね・右上に「？（あそびかた）」と歯車（設定）、下に行き先のボタンを固定（components/BottomNav。App の withNav が、街・スキルダンジョン・ステータス・図鑑・工房の画面の下に出し、いまの画面のボタンを金色にする。戦闘・結果・マップ・設定には出さない）。アイコンは `public/ui/icon-*.png`（map＝冒険へ（2026-11-21 に「街の外へ」から改名。画面の言い方も「冒険のマップ」にそろえた）はコンパス、status＝ステータスは六角形の模様が描かれた巻物。どちらも本人が3案から選んだ。ほかに dungeon・book・workshop・settings・help・coin。どれも Pixellab、32×32）。
- 画面のわく（2026-11-17）：ウインドウ・ボタン・答えの選択肢・カード・マップのわくは、ドット絵の `public/ui/frame-{white,gold,grey,purple,red,green}.png`（`scripts/make_ui_frames.ps1` で描いた。Pixellab は使っていない）を CSS の border-image で使う。ふつうは白、選んでいるときは金、使えないときは灰色、正解は緑、まちがい・録音は赤、復活は紫。ウインドウの中は深い青。
- `scripts/make_sprites.mjs` は前の仮の絵を作るスクリプト。実行すると Pixellab の絵が上書きされるので使わない。前の絵そのものは `art/old-sprites/` に残してある（`art/README.md`）。

- だれでも参加できるようにする（2026-11-16）。ログイン画面に「Google でログイン」を置き、はじめての人はそのままアカウントができる。メールアドレス＋パスワードのログインも残す。設定は `docs/setup_google_login.md`。教材の取り込みは管理者（`app_admins`）だけ。AI の料金は参加した人の分もこのアプリのキーで払うので、各社の管理画面で上限を決めておく。
- 街の外はマップを歩いてモンスターに出会う形（2026-11-16）。選んで戦う入口は、街の「スキルダンジョン」に分けた（戦闘のあとは始めた場所にもどる）。マップは `public/maps/{街のID}.json`（地形・場所・出やすい能力値。街を足すときはファイルを足すだけ）、出会いの計算は `src/lib/game/fieldMap.ts`、数値は `rules.ts`。マップの絵は Pixellab で作った（32×32）。地面は Wang タイルの組（2つの地形をつなぐ絵。境目は角ごとに絵を選んでなめらかにつなぐ）で、マップのファイルの `ground.sets` に書く：`public/maps/terrain-path.png`（道と草）・`terrain-water.png`（湖と草、砂の岸つき）・`terrain-forest.png`（森の地面と草）・`terrain-stone.png`（石だたみと草）・`terrain-path-forest.png`（道と森の地面）。組のない地形どうし（例：水と道）はとなりに置かない。2026-11-17 に Pixellab の pro で作り直し、マップを 24×20 に広げた（前の絵とマップは `art/old-map/`）。新しい地面の絵は `node scripts/fetch_tileset.mjs <ID> <保存先>` で取ってきて、表示された corners を書く。置く物は `public/maps/obj-*.png`（木・松・しげみ・岩・切り株・立て札・草むら・花・きのこ・あし・はす・街・門）。置く物は 2026-11-21 に、本人の希望で「ななめ上から見る」絵（木の幹・家の正面のかべが見える、Pixellab の low top-down）に作り直し、草原に木の林を足した。街・門・関所・風車は斜めの土台がない、正面から見た絵（Pixellab の view: side）にし、門と関所は 64×64 に大きくした（前の真上から見た絵は `art/old-map/topdown-objects/`、見え方の案は `art/map-style-candidates/`）、マップ用の小さい主人公は `public/hero/hero-map.png`（真横の左向き。右へ歩くときは反転）、上へ歩くときの後ろ姿は `hero-map-up.png`、下へ歩くときの正面は `hero-map-down.png`（どれも Pixellab で、もとの絵から作った）。歩いている間は、足をふみ出した2コマ（同じ名前に `-walk1`・`-walk2` をつけた PNG。Pixellab の動き生成から選んだ）を1歩ごとに交互に出す。ボスは街のメニューではなく、マップの奥のボスの場所（tiles の "boss": true。最初の街は、ささやきの森の奥「ことだまの門」、`public/maps/obj-bossgate.png`）を踏んで会いに行く（2026-11-17）。戦闘の背景（2026-11-17、Pixellab 256×144）は出会った場所の絵：マップの area_defs の battle_background（`public/battle/town01-meadow.png`・`forest`・`flowers`・`lake`）、スキルダンジョンは能力値ごとの部屋の絵 `public/battle/{街のID}-dungeon-{能力値}.png`（2026-11-17。一覧のカードの背景にも使う。なければ `{街のID}-dungeon.png`）、ボスと門のまえは `{街のID}-boss.png`。絵がなければ背景なしで出る。攻撃の動き（2026-11-17）：正解は主人公がとびだし、モンスターに斬る光（`public/battle/fx-slash.png`）とダメージの数、まちがいはモンスターが飛びかかり、主人公にひっかき傷（`fx-claw.png`）と赤い光。動きは styles.css（battle-fx・damage-pop など）。差し替えは同じ名前・同じ並びの PNG で上書きする。
- ボスはいつでも挑める（2026-11-18）。英語が得意な人が待たされて離れないように、「街の問題の8割に1回以上正解」は鍵ではなく、ボスの画面と街の画面に出す「おすすめの目安」にした（数値は rules.ts の BOSS_RECOMMEND_RATIO）。まだ練習していない人は、戦えるすべての能力値の問題で挑む。
- 5つの街の計画（2026-11-21）：5つ目の街を一旦の最後にし、TOEIC 800 くらいに届かせる。問題は街3＝360・街4＝480・街5＝600、ほかに「単語の書庫」で単語を合計4,000語（街1＝400・街2＝600・街3＝800・街4＝1,000・街5＝1,200）。くわしくは docs/spec.md の「5つの街の計画」。
- 旅の地図（2026-11-21）：街を点、道でつないだ世界地図（public/maps/world.json、背景は Pixellab の public/maps/world.png 192×256、ボタンの絵は public/ui/icon-worldmap.png）。3つ目の街に着くと「旅の地図を手に入れた！」と出て、街の画面の右上と、冒険のマップの下（「▶ 旅の地図」。もどると同じ場所から歩ける）に地図のボタンが出る（本人の希望。最初から行き来できると味気ないため）。行けるのは行ったことのある街だけ（1つ目・今いる街・前の街のボスを倒した街）。処理は src/lib/game/worldMap.ts、画面は screens/WorldMapScreen.tsx。街を足すときは world.json に点（town・x・y は 0〜1・icon・名前がファイルにない街は name）と道を足す。管理者は設定の「デバッグ用：旅の地図」で前から見られる。背景のもう1案は art/world-map-candidates/。
- 3つ目の街の新しい問題の形（2026-11-21）：単語の並べかえ（format "order"。choices に単語のカード、model_answers に正しい英文、sentence_ja に日本語。判定は src/lib/game/wordOrder.ts、答えの欄は components/OrderAnswer.tsx。SQL は supabase/migrations/20261121000000_word_order.sql）と、会話のリスニング（choice4 の audio_text を1行に1人「A: 英文」で書く。src/lib/dialogue.ts で分け、speech.ts が話す人ごとに声を変える）。
- 4つ目の街の新しい問題の形（2026-11-21）：書き取り（format "dictation"。audio_text と model_answers。判定は src/lib/game/dictation.ts、SQL は supabase/migrations/20261121010000_dictation.sql）と、リーディングのメール・メッセージの見せ方（components/Passage.tsx。From:/Subject: の行で始まればメールのカード、「名前: 本文」の行なら吹き出し）。
- 5つ目の街の新しい問題の形（2026-11-22）：意見と理由（respond の tags に opinion。AI採点で理由があるかも見る。書く欄600字・録音60秒。採点の決まりは supabase/functions/_shared/graders.ts で、直したら npm run deploy:functions を本人が動かす）、長いアナウンスに「▶ ゆっくり聞く」（rules.ts の LONG_AUDIO_WORDS）、記事（最初の行「# 見出し」）といくつかの文書（「---」の行で区切る。components/Passage.tsx）、最後の街 town05（rules.ts の FINAL_TOWN_ID）のボスを初めて倒すとエンディング「～ 旅のおわりに ～」（screens/ResultScreen.tsx）。SQL は要らない。
- リーディングの質問と選択肢（2026-11-22）：本人の希望で、3つ目の街から英語にした（解説は日本語のまま）。にぎわいの市（2つ目）は日本語のまま。スピーキング・ライティングの英語の質問（respond）には日本語訳を出さない（sentence_ja は AI 採点だけに使う）。
- ボスの第二形態（2026-11-22）：モンスターのファイルに「ボスのID-form2」を書くと、ボス戦で1回目の姿のHPを0にしたとき倒れずに変身し（光って絵が入れかわる、3秒）、満タンのHPで戦いが続く。処理は src/lib/game/secondForm.ts と BattleScreen（transform）。データベースの決まりを直す SQL は supabase/migrations/20261122000000_boss_second_form.sql（本人が実行済み）。記録・エンディングはもとのボスのIDで数え、結果の画面には第二形態の名前を出す。図鑑には、もとのボスを倒すと「ボス（第二形態）」で出る。今あるのは王城の「ほしぞらの大グリフォン」（town05-boss-form2、HP300。本人が4案から A-1 星座を選んだ。ほかの案は art/town05-candidates/boss2/）。
- 単語の書庫（2026-11-21）：スキルダンジョンの中の部屋。書庫のモンスター（ID の最後が -wordbook。街1は「しおりオバケ」400語、街2は「ふせんチョウ」600語、街3は「じびきモグラ」800語、街4は「てちょうヤギ」1,000語、街5は「たびにっきラクダ」1,200語。街3〜5は量が多いので scripts/wordbook/town03/・town04/・town05/ に分けて書き、town03.mjs などでつなぐ）と戦うと、書庫の単語だけが4択で出る。単語の一覧は scripts/wordbook/{街のID}.mjs（英語|品詞|意味|例文）、`node scripts/build_wordbook.mjs town01 data/town01_wordbook.json` で問題ファイルを作る（tags に wordbook）。一覧の EARLIER_TOWNS に前の街を書くと、前の街の書庫と同じ単語がないか確かめる。書庫の単語は街の外・ボス・復活モンスター・ボスの目安に入れない（src/lib/game/wordbook.ts）。経験値は少なめ（rules.ts の EXP_WORDBOOK）。
- 公開先は自分のドメイン `https://english-quest.app`（2026-11-21、Vercel で購入。www ともとの vercel.app は 308 で飛ばす。手順は docs/deploy_vercel.md の最後）。
- OGP（2026-11-21）：index.html に題名・説明文・画像（public/ogp.png、1200×630）を書いた。画像は scripts/make_ogp.ps1 の案 A（街の前に男の子と女の子、本人が3案から選んだ）。説明文は「毎日少しずつ、英語で冒険しよう。…ドット絵のRPGで楽しくきたえる英語アプリ。」
- 英語の読み上げの声（2026-11-21）：Windows では古い「Microsoft Zira Desktop」が選ばれて機械っぽかったので、src/lib/speech.ts の voiceScore で自然な声（Edge の Natural／Online、Chrome の Google、iPhone・Mac の Enhanced・Premium）を優先し、おもしろ声は使わないようにした。設定の「音」に今の声と「▶ 聞いてみる」。
- 音（2026-11-20）：Web Audio でその場で合成する（src/lib/sound.ts、音のファイルなし。Pixellab の音楽は Tier 2 からなので使っていない）。BGM は街・街の外・戦闘・ボスの4曲（オリジナルのメロディ、App の bgmFor で画面ごとに選ぶ）、効果音はボタン・出会い・正解・まちがい・倒す・勝ち負け・レベルアップ・買う・街の移動。読み上げ中と録音中は holdBgm で BGM を消す。設定で BGM と効果音をそれぞれオン・オフ（preferences.ts、端末ごと）。
- 記録の画面（2026-11-18）：ステータスの「▶ 記録を見る」から。集計は src/lib/game/history.ts、画面は screens/RecordsScreen.tsx（グラフは SVG を手で描いている）。にげたときも、1問でも答えていれば戦闘の履歴を負けとして残す（記録で数えるため）。
- 主人公は男の子か女の子を選べる（2026-11-18）。はじめて名前をつける画面と、設定の「主人公の名前と見た目を変える」で選ぶ。記録は adventure_state.hero_look（SQL は supabase/migrations/20261118000000_hero_look.sql。列がまだなくても男の子として読める）。女の子の絵は public/hero/girl/ に男の子と同じ名前で置く（本人が3案から B：茶色の長い髪の三つ編みとスカートを選んだ。案は art/hero-candidates/。マップ用と歩く絵は男の子の絵を Pixellab の edit_image_pixen で髪だけ変えたもの）。今の見た目は src/lib/heroLook.ts（heroSrc で絵の場所を変える）。
- 2つ目の街「にぎわいの市」（2026-11-18）：場面は買い物、1つ目より一段上（中学2〜3年、TOEIC 500〜600）、ここでリーディングが解放される。モンスターはねふだネズミ・てんびんガニ・よびこみオウム・レシートヘビ・ちょうめんフクロウ・ねぎりダヌキ、めずらしいモンスターはほしくずリス（1%、経験値400）・ちょきんブタ（4%、120G）、ボスは東の関所の「せきもりの大ガメ」（HP180、200G）。絵はすべて Pixellab（pixen）。街の行き来は、ボスを倒すとボスの画面の「門をくぐって次の街へ」、戻るのはマップの西の端の道（tiles の exit。踏むと「向かいますか？」と聞く）。着くと、その街に問題がある未解放の能力値を解放する（records.ts の moveToTown）。総合レベルは一度も練習していない能力値を除いて計算する。街の名前は街のファイルの town.name、ボスのいる場所の説明はマップの boss_place。
- 3つ目の街「みちしるべの宿場町」（2026-11-21）：場面は食事と道案内、高1・TOEIC 600〜650。モンスターはおしながきイモムシ・ぎょうれつアリ（文法。並べかえ）・ちゅうもんコウモリ・たてふだカカシ・でんぴょうカモメ・よびりんペンギン、めずらしいモンスターはほうせきカタツムリ（1%、経験値500）・おさいふペリカン（4%、160G）、書庫はじびきモグラ、ボスはみちまよいの大ダコ（HP240、250G。8本の足が道しるべ）。ファイルは data/town03_monsters.json、絵は Pixellab（pixen）で public/monsters/town03-*.png（復活の色違い town03-mon-*-revival.png は 2026-11-21 に Pixellab で薄紫と水色に塗り直した）。ほかの案は art/town03-candidates/。マップは public/maps/town03.json（北西に茶畑・北東にすぎ並木の峠道とその先のボスの「まよいの分かれ道」・まん中にやたい通りと宿場の街道・南にわたし場の湖・西の端ににぎわいの市への道。置く物に宿場町 obj-town03・分かれ道 obj-crossroads・屋台 obj-stall を足した）、全体図は art/map-overview/town03.png。戦闘の背景 public/battle/town03-*.png（場所6・ダンジョン7）、街の背景 public/towns/town03.png、工房の絵 public/shops/town03.png。工房の装備は data/town03_equipment.json（おしながきの短刀・みちじゅんの槍・こだまの弓・みちしるべの杖・でんぴょうの筆・よびこえの鈴・しゅくばの名刀＝攻撃6〜7、どうちゅう合羽＝HP+3、みちしるべの笠＝猶予3日）、絵は public/equipment/town03-*.png。
- 4つ目の街「とけいだいの城下町」（2026-11-22、本人が3案から選んだ）：場面は予定・電話・雑談、高2・TOEIC 650〜750。モンスターはこよみトカゲ・ふりこヤドカリ（文法）・いとでんわグモ・ゆうびんバト・ペンさきハリネズミ・あいづちアザラシ、めずらしいモンスターはすいしょうクラゲ（1%、経験値600）・こぜにアナグマ（4%、200G）、書庫はてちょうヤギ（1,000語）、ボスはお城の東の湖の「すれちがいの大クジラ」（HP300、300G）。ファイルは data/town04_monsters.json、絵は Pixellab（pixen）で public/monsters/town04-*.png（ほかの案は art/town04-candidates/）。マップは public/maps/town04.json（本人の希望で、道は一直線にせず曲げ、和風ではなく洋風の城下町にした。北西にお堀に囲まれたお城 obj-castle（96×96）と桜・北東にボスのいる「ときの湖」と船着き場 obj-pier、そこへ石だたみの道と街灯 obj-streetlamp・まん中に時計台の城下町 obj-town04 と曲がった道（道ぞいの家は本人の希望で置かない。家と店の絵は art/town04-candidates/）・東に古いやかたの松林・南に花の川べり・西の端に宿場町への道。桜は obj-sakura。前の一直線の案は art/town04-candidates/map-straight-road.png、和風の案は art/town04-candidates/wafu/）と桜・北東にボスのいる「ときの湖」と船着き場 obj-pier、そこへ石だたみの道と石どうろう obj-lantern・まん中に時計台の城下町 obj-town04 と町家 obj-machiya・obj-shophouse の並ぶ曲がった道・東に武家屋敷の松林・南に桜の川べり・西の端に宿場町への道。桜は obj-sakura。前の一直線の案は art/town04-candidates/map-straight-road.png）、全体図は art/map-overview/town04.png。戦闘の背景 public/battle/town04-*.png（場所5・ダンジョン7。ダンジョンは時計台の中の部屋）、街の背景 public/towns/town04.png、工房の絵 public/shops/town04.png。工房の装備は data/town04_equipment.json（こよみのレイピア・はぐるまの斧・ききみみのボウガン・ゆうびんの魔導書・まんねんひつの槍・おしゃべりのリュート・ときつげの剣＝攻撃8〜9、しろがねの胸当て＝HP+4、すなどけいのかんむり＝猶予4日）、絵は public/equipment/town04-*.png。復活の色違い town04-mon-*-revival.png は Pixellab で薄紫と水色に塗り直した（呼吸の2コマ目つき）。
- 5つ目で最後の街「ほしぞらの王城」（2026-11-22、本人が「城下町の次だから城系」と決めた）：場面は旅行と仕事、高3〜大学・TOEIC 750〜800。モンスターはにふだカワウソ・もしもギツネ（文法。仮定法）・ほうそうイルカ・しんぶんアルマジロ・はねペンクジャク・えんぜつライオン、めずらしいモンスターはにじいろハチドリ（1%、経験値700）・きんかコガネムシ（4%、250G）、書庫はたびにっきラクダ（1,200語）、ボスは旅のさいごの関所を守る「そらの関所の大グリフォン」（HP360、400G。倒すとエンディング）。ファイルは data/town05_monsters.json、絵は Pixellab（pixen）で public/monsters/town05-*.png（ほかの案は art/town05-candidates/）。マップは public/maps/town05.json（洋風。北にボスのいる石段の上の「そらの関所」obj-skygate、まん中に石だたみの大広場と噴水 obj-fountain・街灯、北西に王城 obj-royalcastle（96×96）と花、東に王家の花園、南に船 obj-ship の浮かぶ港と桟橋、西の端に城下町への道。道は曲げてある）、全体図は art/map-overview/town05.png。戦闘の背景 public/battle/town05-*.png（場所5・ダンジョン7。ダンジョンは王城の中の部屋）、街の背景 public/towns/town05.png、工房の絵 public/shops/town05.png。工房の装備は data/town05_equipment.json（せかいちずのサーベル・ほしよみの槌・とおみみの長弓・ほしぞらの星図・くじゃくばねの槍・えんぜつの王笏・おうじゃの聖剣＝攻撃10〜11、ほしぞらのよろい＝HP+5、ほしくずのティアラ＝猶予5日）、絵は public/equipment/town05-*.png。復活の色違い town05-mon-*-revival.png は Pixellab で薄紫と水色に塗り直した（呼吸の2コマ目つき）。
- ふりかえりノート（2026-11-22）：ステータスの「▶ ふりかえりノート」から。書く・話す問題の、いちばん最近の自分の答え・AI の評価と助言・より自然な言い方・模範解答（▶ 聞く）を新しい順に出す。「すべて／書く／話す」と「惜しい・通じないだけ」でしぼれる。もとは question_progress の last_answer と last_feedback（問題ごとに最近の1つだけ。SQL は要らない）。画面は screens/NotesScreen.tsx、読む処理は records.ts の fetchAnswerNotes。
- みんなの記録（2026-11-22）：管理者だけが設定の「▶ みんなの記録」から見る集計の画面（screens/AdminStatsScreen.tsx）。登録した人の数・日ごとに練習した人の数・一人ずつの進み具合・街と能力値ごとの正解率・まちがえやすい問題・ボスを倒した人の数。データはデータベースの関数 admin_stats()（supabase/migrations/20261122010000_admin_stats.sql。管理者でなければ止まる。メールアドレスは返さず、登録した順の番号と主人公の名前で表す。日付は日本の時間）。外のアナリティクスは入れていない。
- めずらしいモンスター（2026-11-17）：街の外でだけ、まれに出会う。skill なし・encounter_rate（出会う割合）つきで `data/town01_monsters.json` に書く。ひらめきボタル（1%、勝つと経験値300を出た能力値で分ける）、こばんガエル（4%、80G）。データベースに列を足す SQL は `supabase/migrations/20261117000000_rare_monsters.sql`。

## 未決

- 戦闘・経験値・低下の数値（第1段階を使ってから調整。数値は `src/lib/game/rules.ts`）
- 称号と職業の中身（第2段階以降）
