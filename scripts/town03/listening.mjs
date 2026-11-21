/**
 * 3つ目の街（食事と道案内）のリスニング 60問。
 *
 * 前半30問は1文を聞く：[読み上げる英文, 正解, 誤答3つ]
 * 後半30問は2人の会話を聞く（この街から）：[会話（1行に1人「A: 英文」）, 質問, 正解, 誤答3つ, 解説]
 *   会話は話す人ごとに声を変えて読む（src/lib/speech.ts）。A・B の名前は読まないので、質問は「客」「店員」「道をたずねた人」のように役で書く。
 */
export const LISTENING = [
  // ---------- 食事 ----------
  ['Could we have a table for three, please?', '3人用の席をお願いできますか', ['3人分の料理をお願いできますか', '3時に席を予約できますか', '3番のテーブルに座れますか']],
  ["I'm sorry, but we're fully booked tonight.", 'すみません、今夜は予約でいっぱいです', ['すみません、今夜は早めに閉店します', 'すみません、今夜は貸し切りです', '今夜は予約がいりません']],
  ['Can I have my steak medium, please?', 'ステーキはミディアムの焼き加減でお願いします', ['ステーキは中くらいの大きさでお願いします', 'ステーキを半分に切ってください', 'ステーキは少なめでお願いします']],
  ["Is there anything you can't eat?", '何か食べられないものはありますか', ['何か食べたいものはありますか', 'もう食べ終わりましたか', '食べきれない量ですか']],
  ["We'll wait at the bar until our table is ready.", '席が用意できるまでカウンターで待ちます', ['カウンター席を予約します', '席が空いたらすぐに帰ります', '席の用意ができたら呼んでください']],
  ['Could you put the leftovers in a box?', '残った料理を箱に入れてもらえますか', ['料理をもう1つ箱で作ってもらえますか', '箱を開けてもらえますか', '空いたお皿を下げてもらえますか']],
  ["This isn't what I ordered.", 'これは注文したものとちがいます', ['これはまだ注文していません', 'これを注文し直したいです', 'これは注文したより多いです']],
  ['The kitchen closes in thirty minutes, so please order soon.', 'あと30分で料理の注文が終わるので、早めに注文してほしい', ['30分後に料理ができる', '30分前に店が開いた', '30分以内に食べ終えてほしい']],
  ['Would you like your coffee now or after your meal?', 'コーヒーは今にしますか、食後にしますか', ['コーヒーと食事、どちらにしますか', 'コーヒーのおかわりはいりますか', '食事の前にコーヒーを飲みましたか']],
  ['Everything was delicious. Thank you.', '全部おいしかったです。ありがとう', ['全部は食べきれませんでした', '全部いただきます', 'おいしいものを全部ください']],
  ["I'll have the same as her.", '彼女と同じものにします', ['彼女の分も払います', '彼女はもう注文しました', '彼女と分けて食べます']],
  ['Can we sit outside on the terrace?', '外のテラス席に座れますか', ['屋上で食べられますか', '外で待っていてもいいですか', 'テラス席は寒いですか']],
  ["Sorry, we've run out of the chocolate cake.", 'すみません、チョコレートケーキは売り切れです', ['チョコレートケーキは今焼いています', 'チョコレートケーキを落としてしまいました', 'チョコレートケーキは予約が必要です']],
  ["The bill seems to be wrong. We didn't order the salad.", 'サラダを頼んでいないので、伝票がまちがっていそう', ['サラダがまだ来ていない', 'サラダの代金をまだ払っていない', 'サラダを追加で頼みたい']],
  ["I'd like to cancel my reservation for Friday.", '金曜日の予約を取り消したい', ['金曜日に予約したい', '金曜日の予約を変更したい', '金曜日の予約を確認したい']],
  // ---------- 道案内 ----------
  ['Go straight for two blocks, then turn left.', '2ブロックまっすぐ進んで、左に曲がる', ['2つ目の角を右に曲がる', '左に曲がって2ブロック進む', '2ブロック先の左側にある']],
  ['The post office is on the corner, across from the park.', '郵便局は角にあって、公園の向かい側', ['郵便局は公園の中の角にある', '郵便局は公園のとなり', '郵便局は公園を通り過ぎた先']],
  ["You'd better take a taxi. It's too far to walk.", '歩くには遠すぎるので、タクシーがいい', ['タクシーは高いので歩いたほうがいい', 'タクシー乗り場は遠い', 'タクシーで行くと遠回りになる']],
  ['Take the number five bus and get off at City Hall.', '5番のバスに乗って、市役所で降りる', ['バスに5分乗って、市役所で降りる', '5つ目のバス停で降りる', '市役所から5番のバスに乗る']],
  ['The museum is about a ten-minute walk from here.', '博物館はここから歩いて10分くらい', ['博物館までは車で10分くらい', '博物館は10時に開く', '博物館までは10キロくらい']],
  ['Turn right when you see the gas station.', 'ガソリンスタンドが見えたら右に曲がる', ['ガソリンスタンドの手前で止まる', 'ガソリンスタンドの右側にある', 'ガソリンスタンドを過ぎたら左に曲がる']],
  ["I'm sorry, I'm not from around here.", 'すみません、このあたりの者ではないんです', ['すみません、ここに来たのは初めてではありません', 'すみません、ここから遠くへは行けません', 'すみません、ここで待ち合わせをしています']],
  ["This train doesn't stop at Green Park.", 'この電車はグリーンパーク駅には止まらない', ['この電車はグリーンパーク駅が終点', 'この電車はグリーンパーク駅から出る', 'この電車はグリーンパーク駅で止まったまま']],
  ["You're going the wrong way. The station is behind you.", '道がちがう。駅はうしろの方', ['駅は右側にある', '駅はもう少し先', '駅への近道がある']],
  ['Excuse me, is this seat taken?', 'すみません、この席はふさがっていますか', ['この席を予約しましたか', 'この席に座ってもらえますか', 'この席で写真をとってもいいですか']],
  ['The next train to the airport leaves at 9:45.', '空港行きの次の電車は9時45分に出る', ['空港行きの電車は9時45分に着く', '空港行きの次の電車は4時45分に出る', '空港から9時45分に電車が出る']],
  ["Walk through the park and you'll find the library on the other side.", '公園を通り抜けると、反対側に図書館がある', ['公園のまわりを歩くと図書館がある', '公園の中に図書館がある', '公園の手前に図書館がある']],
  ["There's a lot of traffic, so it may take longer.", '道が混んでいるので、もっと時間がかかるかもしれない', ['人が多いので歩きにくい', '信号が多くて遠回りになる', '道が工事中で通れない']],
  ['Could you tell me which exit to use for the stadium?', 'スタジアムへはどの出口を使えばいいか教えてもらえますか', ['スタジアムの入口はどこですか', 'スタジアムから出る方法を教えてください', 'スタジアムへの出口は閉まっていますか']],
  ["It's the third building on the right after the bank.", '銀行を過ぎて、右側の3つ目の建物', ['銀行の右どなりの建物', '銀行の3階', '銀行の手前の、右側の3つ目の建物']],
];

export const DIALOGUES = [
  ["A: Are you ready to order?\nB: Yes. I'll have the chicken salad and an orange juice.", '客が注文したものは？', 'チキンサラダとオレンジジュース', ['チキンカレーとオレンジジュース', 'チキンサラダとりんごジュース', 'サラダだけ'], "I'll have 〜 で「〜にします」。chicken salad and an orange juice。"],
  ['A: How many people are in your party?\nB: Four, but one more person will join us later.', '最後には何人になる？', '5人', ['4人', '3人', '6人'], 'Four（4人）に、one more person will join us later（あとでもう1人来る）。'],
  ['A: Excuse me, how do I get to the train station?\nB: Go down this street and turn right at the bank.', '銀行のところでどうする？', '右に曲がる', ['左に曲がる', 'まっすぐ進む', '電車に乗る'], 'turn right at the bank = 銀行のところで右に曲がる。'],
  ['A: Would you like something for dessert?\nB: No, thanks. Just the check, please.', '客がしたいことは？', 'デザートはいらず、会計をしたい', ['デザートを注文したい', 'メニューをもう一度見たい', '飲み物を追加したい'], 'Just the check, please. = お会計だけお願いします。'],
  ["A: Is the museum far from here?\nB: Not really. It's about a fifteen-minute walk.", '博物館までは？', '歩いて15分くらい', ['歩いて50分くらい', 'バスで15分くらい', 'すぐとなり'], 'a fifteen-minute walk = 歩いて15分。fifteen（15）と fifty（50）は聞き分けがむずかしい。'],
  ["A: Do you have a reservation?\nB: No, we don't. Is there a table for two?\nA: Yes, but you'll have to wait about twenty minutes.", '客はどうなる？', '予約がないので、20分ほど待つ', ['予約があるので、すぐ座れる', '席がないので帰る', '2時間待つ'], "No, we don't（予約はない）。you'll have to wait about twenty minutes（20分ほど待つ必要がある）。"],
  ['A: Which bus goes to the airport?\nB: Number twelve. It leaves from stop C.', '空港へ行くバスは？', '12番のバスで、Cの乗り場から出る', ['20番のバスで、Cの乗り場から出る', '12番のバスで、Dの乗り場から出る', '2番のバスで、Cの乗り場から出る'], 'Number twelve（12番）、stop C（C乗り場）。'],
  ["A: How's your soup?\nB: It's good, but it's a little too salty for me.", 'スープについて言っていることは？', 'おいしいが、少ししょっぱい', ['おいしいが、少し冷めている', 'まずくて、しょっぱい', '少し辛すぎる'], "It's good, but … too salty = おいしいけれど、しょっぱすぎる。"],
  ["A: Excuse me, is there a bank near here?\nB: Yes, there's one next to the supermarket on Main Street.", '銀行はどこにある？', 'メイン通りのスーパーのとなり', ['メイン通りのスーパーの向かい', 'スーパーの中', '駅のとなり'], 'next to the supermarket = スーパーのとなり。'],
  ["A: Shall we eat out tonight?\nB: Sure. How about that new Italian restaurant?\nA: Sounds great. I'll book a table.", 'このあと、最初に話した人がすることは？', '席を予約する', ['料理を作る', 'イタリアへ行く', '本を買う'], "I'll book a table. = 席を予約します（book = 予約する）。"],
  ["A: Can I pay by card?\nB: I'm sorry, we only take cash. There's an ATM across the street.", '客はどうすればいい？', '通りの向かいのATMで現金をおろす', ['カードで払う', '明日払いに来る', 'となりの店で両替する'], "we only take cash（現金だけ）。There's an ATM across the street（通りの向かいにATMがある）。"],
  ['A: Excuse me, does this train go to Riverside?\nB: No, you need to change at the next station.', 'リバーサイドへ行くには？', '次の駅で乗りかえる', ['この電車でそのまま行ける', '次の駅で降りて歩く', '反対方向の電車に乗る'], 'change at the next station = 次の駅で乗りかえる。'],
  ["A: What would you recommend?\nB: The fish of the day is very popular. It's grilled with lemon.", '店員がすすめたものは？', '本日の魚料理（レモンと焼いたもの）', ['レモンケーキ', '魚のフライ', '人気のパスタ'], 'the fish of the day = 本日の魚料理。grilled = 焼いた。'],
  ["A: I'm looking for the city library.\nB: It's on the second floor of that tall building.", '図書館はどこにある？', 'あの高い建物の2階', ['あの高い建物の2つ先', 'あの高い建物の地下', '2つ目の高い建物'], 'on the second floor = 2階に。'],
  ["A: Could I have some more water, please?\nB: Of course. I'll bring it right away.", '店員がすることは？', 'すぐに水を持ってくる', ['水を片付ける', 'あとで水を持ってくる', 'お茶を持ってくる'], 'right away = すぐに。'],
  ["A: How long does it take to get to the beach by bus?\nB: About forty minutes, but it's faster by train.", '正しいのは？', 'バスで40分くらい。電車のほうが速い', ['バスで14分くらい。電車のほうが速い', '電車で40分くらい。バスのほうが速い', 'バスで40分くらい。電車は走っていない'], "About forty minutes（バスで40分くらい）、it's faster by train（電車のほうが速い）。"],
  ["A: Are you finished with your plate?\nB: Not yet. I'm still eating.", '客の様子は？', 'まだ食べている', ['もう食べ終わった', 'お皿をかえてほしい', 'おなかがいっぱい'], "Not yet. I'm still eating. = まだです。食べているところです。"],
  ['A: Excuse me, where can I buy a ticket?\nB: You can use the machines over there, or the window next to the gate.', '切符を買える場所は？', 'あそこの券売機か、改札のとなりの窓口', ['改札の中の窓口だけ', 'あそこの売店', '電車の中'], 'the machines over there（あそこの機械）、the window next to the gate（改札のとなりの窓口）。'],
  ["A: I'm sorry, I spilled my juice.\nB: Don't worry. I'll get a towel and a new glass.", '店員がすることは？', 'タオルと新しいグラスを持ってくる', ['ジュースの代金を返す', '席をかえる', 'ほかの店員を呼ぶ'], "I'll get a towel and a new glass. = タオルと新しいグラスを持ってきます。"],
  ['A: Is the shopping mall open on Sundays?\nB: Yes, but it closes early, at six.', '日曜日のショッピングモールは？', '開いているが、6時に早めに閉まる', ['休み', '6時に開く', 'いつもより遅くまで開いている'], 'it closes early, at six = 6時に早めに閉まる。'],
  ["A: Let's meet in front of the station at noon.\nB: OK. Which exit?\nA: The north exit, near the clock.", '待ち合わせは？', '正午に、駅の北口の時計の近く', ['正午に、駅の南口の時計の近く', '午後2時に、駅の北口で', '正午に、時計店の前で'], 'at noon（正午に）、the north exit, near the clock（北口の時計の近く）。'],
  ["A: This place is so crowded.\nB: Yeah. Why don't we get some sandwiches and eat in the park?", '提案されたことは？', 'サンドイッチを買って公園で食べる', ['ほかの店にならぶ', '公園で料理を作る', 'この店でサンドイッチを食べる'], "Why don't we 〜? = 〜しませんか。"],
  ["A: Excuse me, is the City Museum this way?\nB: No, it's the other way. Go back to the traffic light and turn left.", '博物館へ行くには？', '信号までもどって左に曲がる', ['このまま進んで左に曲がる', '信号を過ぎて右に曲がる', 'となりの道に入る'], "it's the other way（反対の方向）。Go back to the traffic light and turn left.（信号までもどって左）。"],
  ['A: How would you like your coffee?\nB: With milk, no sugar, please.', '客のコーヒーは？', 'ミルクを入れて、砂糖なし', ['砂糖を入れて、ミルクなし', 'ミルクも砂糖もなし', 'ミルクも砂糖も入れる'], 'With milk, no sugar = ミルク入り、砂糖なし。'],
  ["A: Excuse me. We ordered twenty minutes ago, but our food hasn't come yet.\nB: I'm very sorry. I'll check with the kitchen.", '客がこまっていることは？', '20分前に注文した料理が、まだ来ない', ['料理がまちがっている', '20分待ってもメニューが来ない', '料理が冷めている'], "our food hasn't come yet = 料理がまだ来ない。"],
  ["A: Can you recommend a good place for lunch near here?\nB: There's a nice noodle shop around the corner. It's cheap and fast.", 'すすめられた店は？', '角を曲がったところの、安くて早いめん類の店', ['駅前の高いめん類の店', '角のパン屋', '遠いけれどおいしいすし屋'], 'around the corner = 角を曲がったところに。cheap and fast = 安くて早い。'],
  ["A: Which platform is the train for Hill Town?\nB: Platform three. But it's delayed by ten minutes.", 'ヒルタウン行きの電車は？', '3番線で、10分おくれている', ['3番線で、10分早く出る', '10番線で、3分おくれている', '3番線で、時間どおり'], "Platform three（3番線）、delayed by ten minutes（10分おくれ）。"],
  ["A: Would you like to share a dessert?\nB: Good idea. Let's get the apple pie.", '2人はどうする？', 'アップルパイを1つ分けて食べる', ['アップルパイを2つ頼む', 'デザートは頼まない', 'アップルパイを持ち帰る'], 'share a dessert = デザートを分け合う。'],
  ["A: I think we're lost. Let's ask someone.\nB: Good idea. Excuse me, where is Lake Street?", '2人はどんな様子？', '道に迷ったので、人にたずねる', ['湖を見に行く', '友だちを探している', '地図を買う'], "we're lost = 道に迷った。"],
  ["A: Thank you for coming. How was everything?\nB: It was wonderful. We'll definitely come back.", '客の感想は？', 'とてもよかったので、また来る', ['よかったが、もう来ない', '料理がおそかった', '次は別の店に行く'], "We'll definitely come back. = 必ずまた来ます。"],
];
