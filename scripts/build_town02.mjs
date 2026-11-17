/**
 * 2つ目の街「買い物」（にぎわいの市）の問題ファイルを作る。
 *
 * 使い方: node scripts/build_town02.mjs data/town02_questions.json
 *
 * 1つ目の街より一段上（中学2〜3年、TOEIC 500〜600 くらい）。比較・現在完了・受け身・関係代名詞など。
 * 6つの能力値を30問ずつ（リーディングはこの街から）。
 * 選択肢は「正解を先頭」に書き、ここで並びを混ぜて正解の位置を記録する。
 * 並びは問題IDだけで決まるので、選択肢の文字を直しても並びは変わらない。
 * （このPCには Python がないので、1つ目の街の build_town01.py と同じ形を Node で書いた）
 */
import { writeFileSync } from 'node:fs';

const TOWN = 'town02';
const LEVEL = 2;

// ---------- 語彙（4択）: [英文, 注目する語句 or null, 正解, 誤答3つ] ----------
const VOCAB = [
  ['Can I try this on?', 'try this on', '試着する', ['交換する', '返品する', '包装する']],
  ['Is this on sale?', 'on sale', 'セール中で（安くなって）', ['売り切れで', '入荷待ちで', '展示用で']],
  ["I'd like a refund, please.", 'refund', '返金', ['領収書', '割引', '交換']],
  ['Could I get a receipt?', 'receipt', 'レシート（領収書）', ['袋', 'おつり', '保証書']],
  ["Here's your change.", 'change', 'おつり', ['変更', '小銭入れ', '商品']],
  ['This shirt is out of stock.', 'out of stock', '在庫切れ', ['流行遅れ', 'サイズ違い', '値下げ中']],
  ['Can I pay by credit card?', 'pay by', '〜で支払う', ['〜を預ける', '〜を申し込む', '〜を落とす']],
  ["It's too expensive for me.", 'expensive', '値段が高い', ['重い', '派手な', '地味な']],
  ["That's a good deal.", 'a good deal', 'お買い得', ['よい取引先', '大量の品', 'よい品質']],
  ['Where is the fitting room?', 'fitting room', '試着室', ['待合室', '休憩室', '倉庫']],
  ['Could you gift-wrap it?', 'gift-wrap', 'プレゼント用に包む', ['配達する', '値引きする', '取り置きする']],
  ['Can you hold this for me until tomorrow?', 'hold', '取り置く', ['持ち上げる', '修理する', '値下げする']],
  ['The total comes to 30 dollars.', 'total', '合計', ['割引', '税金', 'おつり']],
  ['Tax is included.', 'included', '含まれている', ['別の', '免除された', '値上がりした']],
  ["I'm just browsing.", 'browsing', '（買わずに）見ている', ['急いでいる', '迷っている', '待っている']],
  ['This item is non-refundable.', 'non-refundable', '返金できない', ['持ち帰れない', '割引できない', '試着できない']],
  ["It's buy one, get one free.", null, '1つ買うと、もう1つ無料', ['1つ目だけ無料', '2つ買うと半額', '1人1つまで']],
  ['These shoes are a bit tight.', 'tight', 'きつい', ['ゆるい', '重い', 'すべりやすい']],
  ['The checkout is over there.', 'checkout', 'レジ（会計所）', ['出口', '入口', '案内所']],
  ["I'll take it.", null, 'これにします（買います）', ['持って帰ってもいいですか', '少し考えます', '取っておいてください']],
  ['Can I exchange this for a larger size?', 'exchange', '交換する', ['返品する', '注文する', '測る']],
  ["We're closing in ten minutes.", 'closing', '閉店する', ['開店する', '休憩する', '掃除する']],
  ["It's twenty percent off.", 'off', '〜引き（割引）', ['〜増し', '〜税込み', '〜送料']],
  ['Is there a warranty on this?', 'warranty', '保証', ['説明書', '送料', '在庫']],
  ["I'm looking for a gift for my mother.", 'looking for', '〜を探している', ['〜をながめている', '〜を待っている', '〜の世話をしている']],
  ['Do you deliver?', 'deliver', '配達する', ['包装する', '値引きする', '修理する']],
  ['This is the latest model.', 'latest', '最新の', ['最後の', 'いちばん安い', '中古の']],
  ['Do you sell secondhand books?', 'secondhand', '中古の', ['新刊の', '子ども向けの', '外国の']],
  ['Sorry, we only accept cash.', 'accept', '受け付ける', ['数える', '返す', '両替する']],
  ['Could you give me a discount?', 'discount', '値引き', ['見本', '保証', '説明']],
];

// ---------- 文法（穴埋め4択）: [英文, 正解, 誤答3つ, 解説, 難しさ] ----------
const GRAMMAR = [
  ['This bag is ___ than that one.', 'cheaper', ['cheap', 'cheapest', 'more cheap'], '2つを比べるときは比較級。cheap → cheaper。'],
  ['This is the ___ expensive watch in the store.', 'most', ['more', 'much', 'very'], '3つ以上の中で「いちばん〜」は、長い語なら the most + 形容詞。'],
  ["I'd like ___ this shirt on.", 'to try', ['try', 'trying', 'tried'], 'would like のあとは to + 動詞の原形。'],
  ['___ much is this hat?', 'How', ['What', 'Which', 'Where'], '値段をたずねるときは How much。'],
  ['How ___ apples do you need?', 'many', ['much', 'long', 'often'], '数えられるもの（apples）の数は How many。'],
  ['These shoes are too small ___ me.', 'for', ['to', 'with', 'at'], '「〜には小さすぎる」は too small for 〜。'],
  ['Do you have this shirt ___ blue?', 'in', ['on', 'at', 'by'], '色やサイズを言うときは in blue、in a medium のように in を使う。'],
  ['I have ___ been to this shop before.', 'never', ['ever', 'yet', 'ago'], '「一度も〜したことがない」は have never + 過去分詞。'],
  ['Have you found a nice jacket ___?', 'yet', ['already', 'ago', 'since'], '疑問文で「もう〜しましたか」は文の最後に yet。'],
  ['These cups are ___ in Japan.', 'made', ['make', 'making', 'to make'], '「〜で作られている」は受け身（be動詞 + 過去分詞）で are made。'],
  ['The staff member ___ helped me was very kind.', 'who', ['which', 'what', 'where'], '人を説明する関係代名詞は who。'],
  ['___ I help you?', 'May', ['Do', 'Am', 'Have'], '店員の決まり文句 May I help you?（いらっしゃいませ・何かお探しですか）。'],
  ['Could you show me ___ one?', 'another', ['other', 'others', 'the others'], '「別のもう1つ」は another one。'],
  ["I'm thinking ___ buying a new phone.", 'about', ['to', 'for', 'at'], 'think about -ing で「〜しようかと考えている」。'],
  ['This one is ___ expensive as that one.', 'as', ['so', 'more', 'than'], 'as 〜 as … で「…と同じくらい〜」。'],
  ['Which is ___, the red one or the blue one?', 'better', ['good', 'best', 'more good'], '2つを比べて「どちらがよいか」は good の比較級 better。'],
  ['The shop is ___ crowded to walk around.', 'too', ['very', 'so', 'enough'], 'too 〜 to … で「〜すぎて…できない」。'],
  ['Is this jacket big ___ for me?', 'enough', ['too', 'so', 'much'], '形容詞 + enough で「十分に〜」。'],
  ['I enjoyed ___ at the market.', 'shopping', ['shop', 'to shop', 'shopped'], 'enjoy のあとは -ing（〜すること）。'],
  ['She ___ shopping every Saturday.', 'goes', ['go', 'going', 'is go'], '主語が she（3人称単数）で、いつもすることは goes。'],
  ['We ___ out of milk, so I went to the store.', 'were', ['was', 'are', 'is'], '主語 we の過去形の be動詞は were。'],
  ['I ___ this watch last week.', 'bought', ['buy', 'buyed', 'have bought'], 'last week（過去の時）があるので過去形。buy の過去形は bought。'],
  ['How long have you ___ in line?', 'been waiting', ['waiting', 'waited been', 'be waiting'], '「ずっと〜している」は have been -ing（現在完了進行形）。'],
  ['The store will be closed ___ Sunday.', 'on', ['in', 'at', 'by'], '曜日の前は on。'],
  ['Please pay ___ the counter.', 'at', ['in', 'on', 'to'], '場所の一点（カウンターで）は at。'],
  ['This is the shirt ___ I bought yesterday.', 'that', ['who', 'where', 'what'], '物を説明する関係代名詞は that（which）。'],
  ['Do you know what time the store ___?', 'opens', ['open', 'opening', 'does open'], '文の中の疑問（間接疑問）は「主語 + 動詞」の順。the store は3人称単数なので opens。'],
  ['There ___ many people at the market yesterday.', 'were', ['was', 'is', 'be'], 'people は複数。yesterday（過去）なので There were。'],
  ['If I ___ more money, I would buy it.', 'had', ['have', 'has', 'will have'], '今の事実と違う「もし〜なら…だろうに」は、if + 過去形 + would。', 3],
  ["You don't have to pay ___ the bag.", 'for', ['to', 'with', 'by'], 'pay for 〜 で「〜の代金を払う」。'],
];

// ---------- リスニング（4択）: [読み上げる英文, 正解, 誤答3つ] ----------
const LISTENING = [
  ['Excuse me, do you have this in a medium?', 'これのMサイズはありますか', ['これは中くらいの値段ですか', 'これを中に入れてもいいですか', 'これはまん中の棚にありますか']],
  ["I'm afraid we're sold out.", 'あいにく売り切れです', ['あいにく閉店です', 'あいにく現金のみです', 'あいにく準備中です']],
  ['Would you like to pay by cash or card?', '現金とカード、どちらで払いますか', ['現金を両替しますか', 'カードを作りますか', 'ポイントを使いますか']],
  ['The fitting rooms are next to the stairs.', '試着室は階段のとなりです', ['試着室は2階です', 'トイレは階段の下です', 'レジは階段の前です']],
  ['It was on sale, so I got two.', 'セール中だったので2つ買った', ['売り切れだったので2つ注文した', '2つで1つの値段だった', '2つ目は無料だった']],
  ['Can I get this delivered to my house?', 'これを家に配達してもらえますか', ['これを家で使えますか', '家まで取りに来てもらえますか', 'これを家族に送れますか']],
  ['Sorry, this coupon expired last month.', 'このクーポンは先月で期限が切れています', ['このクーポンは来月から使えます', 'このクーポンは1人1枚です', 'このクーポンは先月もらいました']],
  ['That comes to twelve fifty.', '合計12ドル50セントです', ['合計12ドル15セントです', '合計20ドル50セントです', '合計1250ドルです']],
  ['Do you have anything cheaper?', 'もっと安いものはありますか', ['もっと大きいものはありますか', '安いのはどれですか', 'これより高いものはありますか']],
  ["I'd like to return this. It doesn't fit.", 'サイズが合わないので返品したい', ['色が合わないので交換したい', 'こわれているので返品したい', 'サイズを測ってほしい']],
  ['We open at ten and close at eight.', '10時に開いて8時に閉まる', ['8時に開いて10時に閉まる', '10時間営業している', '10日から8日まで休む']],
  ['Is it okay if I just look around?', '見て回るだけでもいいですか', ['案内してもらえますか', 'まわりを片付けてもいいですか', 'あとで来てもいいですか']],
  ['The shoes are buy one, get one half price.', '靴は1足買うと、2足目が半額', ['靴は2足で半額', '靴は1足だけ半額', '靴は半額で1足だけ買える']],
  ['Could you wrap it as a gift, please?', 'プレゼント用に包んでもらえますか', ['プレゼントを選んでもらえますか', 'プレゼントを送ってもらえますか', '袋に入れなくて大丈夫です']],
  ['Oh no, I left my wallet at home.', '財布を家に忘れた', ['財布を家で見つけた', '財布をなくした場所がわからない', '家の鍵を忘れた']],
  ['The vegetables came fresh from the farm this morning.', '野菜は今朝、農場からとれたてで届いた', ['野菜は今朝、全部売れた', '農場は今朝から開いている', '野菜は明日の朝に届く']],
  ['You can get a free bag if you spend over thirty dollars.', '30ドルより多く買うと、袋が無料', ['30ドルで袋が買える', '袋は30セント', '30ドル以下なら袋が無料']],
  ['Let me check if we have it in the back.', '奥に在庫があるか確認します', ['奥の棚を見てください', 'あとで取りに来てください', '奥に置いておきます']],
  ["How about this one? It's lighter and easier to carry.", 'こちらのほうが軽くて持ち運びやすい', ['こちらのほうが明るくて目立つ', 'こちらのほうが安くて丈夫', 'こちらのほうが小さくて使いやすい']],
  ["I'm looking for a birthday present for my sister.", '妹（姉）の誕生日プレゼントを探している', ['妹（姉）から誕生日プレゼントをもらった', '妹（姉）と誕生日プレゼントを買いに来た', '妹（姉）の誕生日を忘れていた']],
  ["Sorry, we don't take credit cards.", 'クレジットカードは使えません', ['クレジットカードは預かれません', 'クレジットカードは作れません', 'カードを持っていません']],
  ["Could I have a bigger bag? This one's full.", 'いっぱいなので、もっと大きい袋をもらえますか', ['袋はいりません', 'この袋は大きすぎます', '袋を2枚に分けてください']],
  ['These apples are three for two dollars.', 'りんごは3個で2ドル', ['りんごは2個で3ドル', 'りんごは1個3ドル', 'りんごは1個2ドル']],
  ['The store is having a closing-down sale.', '店は閉店セールをしている', ['店はもうすぐ今日の営業を終える', '店は年末セールの準備中', '店は開店セールをしている']],
  ["I'll think about it and come back later.", '考えて、あとでまた来ます', ['あとで届けてください', '今すぐ決めます', 'もう来ません']],
  ['Do you need a receipt?', 'レシートは必要ですか', ['作り方は必要ですか', '袋は必要ですか', 'おつりは必要ですか']],
  ['This sweater shrank after I washed it.', 'このセーターは洗ったら縮んだ', ['このセーターは洗ったら色が落ちた', 'このセーターは洗えない', 'このセーターは乾くのが遅い']],
  ["We'll give you a call when it comes in.", '入荷したら電話します', ['来店したら呼んでください', '届いたら取りに来てください', '電話で注文してください']],
  ['Is this the line for the cashier?', 'これはレジの列ですか', ['レジはどこですか', 'この線を越えてもいいですか', '会計はもう済みましたか']],
  ["It's a little out of my price range.", '予算を少しこえている', ['値段が書いていない', '少し安すぎる', '値段の幅が広い']],
];

// ---------- リーディング（4択）: [英文（改行は \n）, 質問, 正解, 誤答3つ, 解説] ----------
const READING = [
  ['SUMMER SALE\nAll T-shirts 30% off\nUntil Sunday, July 20', 'Tシャツのセールはいつまで？', '7月20日（日）まで', ['7月30日まで', '日曜日から', '7月20日から'], 'Until Sunday, July 20 = 7月20日（日）まで。'],
  ['Store Hours\nMon–Fri: 9 a.m. – 8 p.m.\nSat–Sun: 10 a.m. – 6 p.m.', '土曜日は何時に閉まる？', '午後6時', ['午後8時', '午前10時', '午前9時'], 'Sat–Sun（土・日）は 10 a.m. – 6 p.m.。'],
  ['Sorry! We are out of eggs today.\nNew eggs will arrive tomorrow morning.', '卵について正しいのは？', '今日は売り切れで、明日の朝に入荷する', ['今日の朝に入荷した', '明日は売り切れになる', '今日は半額で売っている'], 'out of eggs = 卵を切らしている。arrive tomorrow morning = 明日の朝に届く。'],
  ['Returns are accepted within 14 days.\nPlease bring your receipt.', '返品するのに必要なものは？', 'レシート', ['身分証', 'クレジットカード', '箱と袋'], 'Please bring your receipt. = レシートを持ってきてください。'],
  ['Buy 2 bottles of juice, get 1 free!', 'ジュースを3本手に入れるには、何本分の代金が要る？', '2本分', ['1本分', '3本分', '4本分'], '2本買うと、1本無料（get 1 free）。'],
  ["Hi Mom, I'm at the supermarket.\nThey don't have whole milk. Is low-fat okay?\n— Ken", 'ケンが聞きたいことは？', '低脂肪の牛乳でもいいか', ['牛乳を何本買うか', 'スーパーがどこにあるか', '卵も買うか'], 'Is low-fat okay? = 低脂肪（の牛乳）でもいい？'],
  ['Free delivery on orders over $50.\nOrders under $50: $5 delivery fee.', '40ドルの注文の送料は？', '5ドル', ['無料', '50ドル', '4ドル'], '50ドル未満（under $50）の注文は、送料 $5。'],
  ['Fitting Room\nMaximum 3 items at a time', '試着室に一度に持ちこめるのは？', '3点まで', ['3分まで', '3人まで', '1点だけ'], 'Maximum 3 items = いちどに最大3点まで。'],
  ['RECEIPT\nBread $3.00\nCheese $5.50\nTotal $8.50\nCash $10.00\nChange $1.50', 'おつりはいくら？', '1ドル50セント', ['8ドル50セント', '10ドル', '5ドル50セント'], 'Change = おつり。$1.50。'],
  ['The bakery on Main Street is closed for repairs until May 3.\nWe will open again on May 4.', 'パン屋がまた開くのは？', '5月4日', ['5月3日', '今日', '5月30日'], 'We will open again on May 4. = 5月4日に再開します。'],
  ['Customers with a member card get 10% off every Tuesday.', '割引を受けられるのは？', '会員カードを持つ人が、火曜日に買うとき', ['火曜日に来た全員', '会員カードを作った日だけ', '10個以上買った人'], 'Customers with a member card（会員カードを持つお客さん）が every Tuesday（毎週火曜日）に10%引き。'],
  ["A: Excuse me, how much are these sunglasses?\nB: They're $25, but they're 20% off today.\nA: Great, I'll take them.", 'Aはどうした？', 'サングラスを買うことにした', ['高いので買わなかった', '別の色をたのんだ', '明日また来ることにした'], "I'll take them. = それを買います。"],
  ['NOTICE\nPlease do not eat or drink in the bookstore.', '本屋でしてはいけないことは？', '飲んだり食べたりすること', ['本を読むこと', '写真をとること', '大きな声で話すこと'], 'do not eat or drink = 飲食しないでください。'],
  ['Lost and Found\nA black umbrella was found near the entrance.\nPlease ask at the service counter.', '黒い傘をなくした人は、どこへ行けばいい？', 'サービスカウンター', ['入口', 'レジ', '駐車場'], 'Please ask at the service counter. = サービスカウンターでたずねてください。'],
  ["Farmers' Market\nEvery Saturday 8 a.m. – noon\nCity Park", '朝市が開かれるのは？', '毎週土曜日の午前中', ['毎日の午前中', '毎週土曜日の夜', '毎週日曜日の正午から'], 'Every Saturday 8 a.m. – noon = 毎週土曜日、朝8時から正午まで。'],
  ['Hi Lisa,\nThe blue dress you ordered has arrived.\nYou can pick it up anytime this week.\n— Rose Boutique', 'リサがすることは？', '今週中に、店へドレスを受け取りに行く', ['ドレスを注文する', 'ドレスを返品する', '家にドレスが届くのを待つ'], 'pick it up = 受け取りに来る。anytime this week = 今週ならいつでも。'],
  ['Special offer: Any 3 books for $20.\nSingle books: $8 each.', '本を3冊買うといくら？', '20ドル', ['24ドル', '8ドル', '60ドル'], 'Any 3 books for $20 = どれでも3冊で20ドル。'],
  ['This product contains nuts.\nNot suitable for people with nut allergies.', 'この商品について正しいのは？', 'ナッツが入っている', ['ナッツは入っていない', 'アレルギーの人のために作られた', 'ナッツの代わりに豆を使っている'], 'contains nuts = ナッツを含む。'],
  ['Gift cards are available in $10, $25, and $50 amounts.\nThey cannot be exchanged for cash.', 'ギフトカードについて正しいのは？', '現金にはかえられない', ['好きな金額で作れる', '100ドルのものもある', '現金で返金してもらえる'], 'cannot be exchanged for cash = 現金とは交換できない。'],
  ['A: Do you have this jacket in black?\nB: Sorry, only in brown and gray right now.\n   Black will be back next week.', '黒のジャケットは？', '来週また入荷する', ['今日買える', 'もう作られていない', '茶色より安い'], 'Black will be back next week. = 黒は来週また入ってくる。'],
  ['Parking is free for 2 hours with any purchase.\nAfter that, $2 per hour.', '何か買って、3時間とめたら駐車料金は？', '2ドル', ['無料', '6ドル', '4ドル'], '2時間は無料。そのあと1時間ごとに$2なので、3時間なら$2。'],
  ["Hi Tom,\nCan you buy some bread on your way home?\nWe have butter, so you don't need to get that.\n— Amy", 'トムが買うものは？', 'パンだけ', ['パンとバター', 'バターだけ', '何も買わなくていい'], "We have butter, so you don't need to get that. = バターはあるので買わなくていい。"],
  ['Our coffee prices will go up on April 1.\nBuy before the end of March and save!', 'コーヒーをお得に買うには？', '3月の終わりまでに買う', ['4月1日に買う', '4月中に買う', '3月1日を待つ'], 'Buy before the end of March and save! = 3月末までに買うとお得。'],
  ['Sale items cannot be returned or exchanged.', 'セール品について正しいのは？', '返品も交換もできない', ['交換だけならできる', '返品だけならできる', 'レシートがあれば返品できる'], 'cannot be returned or exchanged = 返品も交換もできない。'],
  ['Today only!\nShow this coupon at the checkout\nto get a free coffee with any sandwich.', '無料のコーヒーをもらう条件は？', '今日、サンドイッチを買ってクーポンを見せる', ['今日、コーヒーを2杯買う', 'いつでもクーポンを見せる', 'サンドイッチを2つ買う'], 'Today only（今日だけ）、with any sandwich（サンドイッチを買うと）クーポンでコーヒー無料。'],
  ['The shoe section has moved\nfrom the 2nd floor to the 4th floor.', '靴売り場は今どこにある？', '4階', ['2階', '1階', '3階'], 'moved from the 2nd floor to the 4th floor = 2階から4階へ移った。'],
  ["A: This TV is $400. Can you do any better?\nB: I can give you $50 off if you pay in cash.", '現金で払うと、テレビはいくら？', '350ドル', ['400ドル', '450ドル', '50ドル'], '$400 から $50 引き（$50 off）で $350。'],
  ["We're hiring!\nPart-time cashiers wanted. Weekends only.\nAsk a staff member for details.", 'この店がさがしているのは？', '週末に働くレジ係', ['平日に働く店長', '週末に来るお客さん', '毎日働く配達係'], 'cashiers wanted = レジ係を募集。Weekends only = 週末だけ。'],
  ['Your order #2381 has been shipped.\nIt will arrive in 3–5 business days.', '注文した品について正しいのは？', 'もう発送された', ['まだ準備中', '今日届いた', 'キャンセルされた'], 'has been shipped = 発送された。'],
  ['Please keep your receipt.\nYou will need it for the free gift drawing on Sunday.', 'レシートを取っておく理由は？', '日曜日の景品の抽選に使うから', ['日曜日に返品するため', 'ポイントをためるため', '日曜日に値引きされるため'], 'free gift drawing = 景品の抽選。'],
];

// ---------- ライティング（AI採点）: [日本語, 模範解答のリスト] ----------
const WRITING = [
  ['このシャツの、もっと大きいサイズはありますか。', ['Do you have this shirt in a larger size?', 'Do you have a bigger size of this shirt?', 'Do you have this shirt in a bigger size?']],
  ['これを試着してもいいですか。', ['Can I try this on?', 'May I try this on?', 'Could I try this on?']],
  ['全部でいくらですか。', ['How much is it altogether?', 'How much is it in total?', 'How much is everything?']],
  ['カードで払えますか。', ['Can I pay by card?', 'Can I pay with a card?', 'Do you take cards?', 'Do you accept credit cards?']],
  ['見ているだけです、ありがとう。', ["I'm just looking, thanks.", "I'm just browsing, thank you."]],
  ['これをプレゼント用に包んでもらえますか。', ['Could you gift-wrap this?', 'Could you wrap this as a gift?', 'Can you wrap this as a present?']],
  ['このかばんを返品したいのですが。', ["I'd like to return this bag.", 'I would like to return this bag.']],
  ['もう少し安いものはありますか。', ['Do you have anything a little cheaper?', 'Do you have something a bit cheaper?']],
  ['これは私には少し高すぎます。', ['This is a little too expensive for me.', "It's a bit too expensive for me."]],
  ['レシートをもらえますか。', ['Could I have a receipt?', 'Can I get a receipt, please?', 'May I have a receipt?']],
  ['この靴は少しきついです。', ['These shoes are a little tight.', 'These shoes are a bit tight.']],
  ['これの別の色はありますか。', ['Do you have this in another color?', 'Do you have this in a different color?']],
  ['母への誕生日プレゼントを探しています。', ["I'm looking for a birthday present for my mother.", "I'm looking for a birthday gift for my mom."]],
  ['このお店は何時に閉まりますか。', ['What time does this store close?', 'What time do you close?']],
  ['これにします。', ["I'll take this one.", "I'll take it.", "I'll take this."]],
  ['袋はいりません。', ["I don't need a bag.", 'No bag, thank you.', "I don't need a bag, thanks."]],
  ['これはセール中ですか。', ['Is this on sale?', 'Is this item on sale?']],
  ['明日まで取っておいてもらえますか。', ['Could you hold this until tomorrow?', 'Can you keep this for me until tomorrow?']],
  ['このりんごは1個いくらですか。', ['How much is one apple?', 'How much are these apples each?', 'How much is each apple?']],
  ['Mサイズに交換できますか。', ['Can I exchange this for a medium?', 'Could I exchange it for a medium size?']],
  ['これは日本で作られたものですか。', ['Was this made in Japan?', 'Is this made in Japan?']],
  ['昨日ここでこのシャツを買いました。', ['I bought this shirt here yesterday.']],
  ['もう少し考えてみます。', ["I'll think about it a little more.", 'Let me think about it a bit more.']],
  ['家まで配達してもらえますか。', ['Can you deliver it to my house?', 'Could you deliver this to my home?']],
  ['店員さんはとても親切でした。', ['The staff member was very kind.', 'The salesclerk was very kind.', 'The staff were very friendly.']],
  ['牛乳がなくなったので、買いに行かなければなりません。', ["We're out of milk, so I have to go buy some.", 'I ran out of milk, so I need to go and buy some.']],
  ['このクーポンは使えますか。', ['Can I use this coupon?', 'Is this coupon valid?']],
  ['これは、私が今まで買った中でいちばん高い時計です。', ["This is the most expensive watch I've ever bought.", 'It is the most expensive watch I have ever bought.']],
  ['もしもっと安ければ、2つ買うのに。', ['If it were cheaper, I would buy two.', "If it was cheaper, I'd buy two."]],
  ['赤と青、どちらがいいと思いますか。', ['Which do you think is better, the red one or the blue one?', 'Which one do you think is better, red or blue?']],
];

// ---------- スピーキング（AI採点）----------
// 日本語を見て英語で言う: [日本語, 模範解答のリスト]
const SPEAK_SAY = [
  ['このジャケットはいくらですか。', ['How much is this jacket?']],
  ['試着室はどこですか。', ['Where is the fitting room?', 'Where are the fitting rooms?']],
  ['もっと小さいサイズはありますか。', ['Do you have a smaller size?', 'Do you have this in a smaller size?']],
  ['これを2つください。', ["I'll take two of these.", 'Two of these, please.', 'Can I have two of these?']],
  ['現金で払います。', ["I'll pay in cash.", "I'll pay by cash.", 'Cash, please.']],
  ['少し値引きしてもらえますか。', ['Could you give me a small discount?', 'Can you give me a little discount?', 'Could you lower the price a little?']],
  ['おつりがまちがっていると思います。', ['I think the change is wrong.', 'I think you gave me the wrong change.']],
  ['これの黒はありますか。', ['Do you have this in black?', 'Do you have a black one?']],
  ['レジはどこですか。', ['Where is the checkout?', 'Where is the cashier?', 'Where can I pay?']],
  ['これを返品したいです。', ["I'd like to return this.", 'I want to return this.']],
  ['もう少し見てまわります。', ["I'll look around a bit more.", "I'm going to look around a little more."]],
  ['これはいつ入荷しますか。', ['When will this come in?', 'When will you have this in stock?', 'When will this be back in stock?']],
  ['袋を1枚もらえますか。', ['Can I have a bag?', 'Could I get a bag, please?']],
  ['これは私の妹にぴったりです。', ['This is perfect for my sister.', 'This is just right for my sister.']],
  ['このパンは今朝焼いたものですか。', ['Was this bread baked this morning?', 'Is this bread from this morning?']],
];
// 英語の質問に自分の言葉で答える: [英語の質問, 質問の意味, 答えの例のリスト]
const SPEAK_ANSWER = [
  ['What do you usually buy at the supermarket?', 'スーパーで、ふだん何を買いますか？', ['I usually buy vegetables, milk, and bread.', 'I often buy fruit and snacks.']],
  ['Do you prefer shopping online or in stores? Why?', 'ネットと店、どちらで買い物するのが好きですか？それはなぜ？', ["I prefer shopping online because it's easy.", 'I like shopping in stores because I can see the items.']],
  ["What's the last thing you bought?", '最後に買ったものは何ですか？', ['The last thing I bought was a new pair of shoes.', 'I bought a book yesterday.']],
  ['How often do you go shopping?', 'どのくらいの頻度で買い物に行きますか？', ['I go shopping about twice a week.', 'I go shopping every weekend.']],
  ['Can I help you find something?', '何かお探しですか？', ["Yes, I'm looking for a winter jacket.", "I'm just looking, thank you."]],
  ['What size do you wear?', 'サイズはいくつですか？', ['I wear a medium.', 'I usually wear a large.']],
  ['Would you like to pay by cash or card?', '現金とカード、どちらでお支払いですか？', ['By card, please.', "I'll pay in cash."]],
  ['Is this a gift?', 'プレゼント用ですか？', ["Yes, it's a gift for my friend.", "No, it's for me."]],
  ["What's the best present you've ever received?", '今までにもらった中で、いちばんうれしかったプレゼントは何ですか？', ['The best present was a watch from my parents.', 'My best present was a bike.']],
  ['Where is your favorite place to shop?', '買い物でいちばん好きな場所はどこですか？', ['My favorite place is a shopping mall near my house.', "I like the farmers' market in my town."]],
  ['Do you need a bag?', '袋はご入用ですか？', ['No, thank you. I have my own bag.', 'Yes, please.']],
  ['What would you buy if you had a lot of money?', 'お金がたくさんあったら、何を買いますか？', ['I would buy a big house.', "If I had a lot of money, I'd buy a new car."]],
  ['Do you like going to sales? Why or why not?', 'セールに行くのは好きですか？それはなぜ？', ['Yes, because I can buy things cheaply.', "Not really, because they're too crowded."]],
  ['How do you usually decide what to buy?', 'ふだん、何を買うかをどうやって決めますか？', ['I usually read reviews online before I buy something.', 'I compare prices at a few stores.']],
  ['We have this in blue and green. Which would you like?', '青と緑があります。どちらにしますか？', ["I'd like the blue one, please.", 'The green one, please.']],
];

/** 問題IDから決まる乱数（同じIDなら毎回同じ並びになる） */
function seeded(text) {
  let h = 2166136261;
  for (const ch of text) h = Math.imul(h ^ ch.codePointAt(0), 16777619) >>> 0;
  return () => {
    h = (h + 0x6d2b79f5) >>> 0;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 選択肢を混ぜ、正解の位置（0始まり）を返す */
function shuffled(qid, correct, wrong) {
  const choices = [correct, ...wrong];
  const rng = seeded(qid);
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return { choices, answer: choices.indexOf(correct) };
}

const id = (kind, n) => `${TOWN}-${kind}-${String(n).padStart(3, '0')}`;

function build() {
  const out = [];
  VOCAB.forEach(([sentence, word, correct, wrong], i) => {
    const qid = id('voc', i + 1);
    const { choices, answer } = shuffled(qid, correct, wrong);
    out.push({
      id: qid, town: TOWN, skill: 'vocabulary', format: 'choice4',
      prompt: word ? `「${sentence}」の ${word} の意味は？` : `「${sentence}」の意味は？`,
      sentence, choices, answer,
      explanation: word ? `${word} = ${correct}` : `${sentence} = ${correct}`,
      difficulty: LEVEL, needs_fix: false,
    });
  });
  GRAMMAR.forEach(([sentence, correct, wrong, why, level], i) => {
    const qid = id('gra', i + 1);
    const { choices, answer } = shuffled(qid, correct, wrong);
    out.push({
      id: qid, town: TOWN, skill: 'grammar', format: 'choice4',
      prompt: '空欄に入る語句は？', sentence, choices, answer,
      explanation: why, difficulty: level ?? LEVEL, needs_fix: false,
    });
  });
  LISTENING.forEach(([audio, correct, wrong], i) => {
    const qid = id('lis', i + 1);
    const { choices, answer } = shuffled(qid, correct, wrong);
    out.push({
      id: qid, town: TOWN, skill: 'listening', format: 'choice4',
      prompt: '聞こえた英文の意味は？', audio_text: audio, choices, answer,
      explanation: `${audio} = ${correct}`, difficulty: LEVEL, needs_fix: false,
    });
  });
  READING.forEach(([passage, question, correct, wrong, why], i) => {
    const qid = id('rea', i + 1);
    const { choices, answer } = shuffled(qid, correct, wrong);
    out.push({
      id: qid, town: TOWN, skill: 'reading', format: 'choice4',
      prompt: question, sentence: passage, choices, answer,
      explanation: why, difficulty: LEVEL, needs_fix: false,
    });
  });
  WRITING.forEach(([ja, models], i) => {
    out.push({
      id: id('wri', i + 1), town: TOWN, skill: 'writing', format: 'translate',
      prompt: '英語で書こう', sentence: ja, model_answers: models, difficulty: LEVEL, needs_fix: false,
    });
  });
  let n = 0;
  for (const [ja, models] of SPEAK_SAY) {
    n++;
    out.push({
      id: id('spe', n), town: TOWN, skill: 'speaking', format: 'translate',
      prompt: '英語で言おう', sentence: ja, model_answers: models, difficulty: LEVEL, needs_fix: false,
    });
  }
  for (const [en, ja, models] of SPEAK_ANSWER) {
    n++;
    out.push({
      id: id('spe', n), town: TOWN, skill: 'speaking', format: 'respond',
      prompt: '質問に英語で答えよう', sentence: en, sentence_ja: ja, model_answers: models,
      difficulty: LEVEL, needs_fix: false,
    });
  }
  return out;
}

/** 機械的に確かめられることを確かめる。おかしければ止める */
function check(questions) {
  const assert = (ok, msg) => {
    if (!ok) throw new Error(msg);
  };
  const ids = questions.map((q) => q.id);
  assert(ids.length === new Set(ids).size, 'IDが重複している');
  const perSkill = {};
  const pos = [0, 0, 0, 0];
  const seen = new Set();
  for (const q of questions) {
    perSkill[q.skill] = (perSkill[q.skill] ?? 0) + 1;
    if (q.format === 'choice4') {
      assert(q.choices.length === 4, q.id);
      assert(new Set(q.choices).size === 4, `選択肢が重複: ${q.id}`);
      assert(q.answer >= 0 && q.answer <= 3, q.id);
      if (q.skill === 'grammar') assert(q.sentence.split('___').length === 2, `空欄が1つでない: ${q.id}`);
      pos[q.answer]++;
    } else {
      assert(q.model_answers.length > 0 && q.model_answers.every((m) => m.trim()), q.id);
      assert(new Set(q.model_answers).size === q.model_answers.length, `模範解答が重複: ${q.id}`);
    }
    const key = `${q.skill}|${q.sentence ?? q.audio_text}|${q.prompt}`;
    assert(!seen.has(key), `出題が重複: ${q.id}`);
    seen.add(key);
  }
  for (const s of ['vocabulary', 'grammar', 'listening', 'reading', 'writing', 'speaking']) {
    assert(perSkill[s] === 30, `${s} が30問ではない（${perSkill[s]}）`);
  }
  return { perSkill, pos };
}

const questions = build();
const { perSkill, pos } = check(questions);
const data = {
  format_version: 1,
  town: { id: TOWN, name: 'にぎわいの市', scene: '買い物', difficulty: '標準', order: 2 },
  questions,
};
const outPath = process.argv[2];
if (!outPath) throw new Error('出力先を指定してください（例：data/town02_questions.json）');
writeFileSync(outPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log('問題数:', questions.length, perSkill);
console.log('正解の位置（1番目〜4番目）:', pos);
