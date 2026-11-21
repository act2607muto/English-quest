/**
 * 5つ目の街（旅行と仕事）のリスニング 100問。
 *
 * LISTENING（20問）：1文を聞く。[読み上げる英文, 正解, 誤答3つ]
 * DIALOGUES（30問）：旅行や仕事の会話を聞く。[会話（1行に1人「A: 英文」）, 質問, 正解, 誤答3つ, 解説]
 *   A・B の名前は読まないので、質問は役や名前（会話の中に出てくる名前）で書く。
 * ANNOUNCEMENTS（30問）：アナウンスや説明を聞く（この街から）。1人が話す長めの英文（30語以上なら「ゆっくり聞く」も出る）。
 *   [読み上げる英文, 質問, 正解, 誤答3つ, 解説]。1つの英文から2問出すものもある（質問を変える）。
 * DICTATION（20問）：聞いた英文を書く。[読み上げる英文, ほかに正解とする英文のリスト（なければ省く）]
 */
export const LISTENING = [
  ['Could you tell me where the baggage claim is?', '手荷物の受け取り場所はどこか教えてもらえますか', ['手荷物を預ける場所はどこですか', '荷物の重さを量ってもらえますか', '荷物をなくしてしまいました']],
  ['I would like to change my seat to an aisle seat.', '席を通路側に変えたいのですが', ['席を窓側に変えたいのですが', '席を前のほうに変えたいのですが', '通路に荷物を置きたいのですが']],
  ["I'm afraid your room won't be ready until three.", 'あいにく、お部屋は3時まで準備ができません', ['お部屋は3時に掃除します', 'お部屋は3つしか空いていません', '3時までにお部屋を出てください']],
  ['Is there a shuttle bus from the airport to the hotel?', '空港からホテルまでのシャトルバスはありますか', ['ホテルから駅までバスはありますか', '空港までタクシーで行けますか', 'シャトルバスの料金はいくらですか']],
  ['The next train to Manchester leaves from platform six.', 'マンチェスター行きの次の電車は6番線から出ます', ['マンチェスター行きの電車は6時に出ます', 'マンチェスターからの電車は6番線に着きます', 'マンチェスター行きの電車は6分遅れています']],
  ['Could you recommend a good restaurant nearby?', '近くのいいレストランを勧めてもらえますか', ['レストランを予約してもらえますか', '近くにレストランはありますか', 'このレストランの名物は何ですか']],
  ["I'd like to exchange some yen for dollars.", '円をドルに両替したいのですが', ['ドルを円に両替したいのですが', 'ドルで払いたいのですが', '円で払ってもいいですか']],
  ['Our flight has been moved to gate twenty-two.', '私たちの便は22番ゲートに変わりました', ['私たちの便は22分遅れています', '私たちの便は2時22分に出ます', '22番ゲートは閉まりました']],
  ['Please make sure you have all your belongings before leaving.', '降りる前に、持ち物を全部お持ちか確かめてください', ['出発の前に、切符を確かめてください', '荷物は座席の下に置いてください', '持ち物を預けてから出てください']],
  ["I'm calling to confirm my reservation for tomorrow night.", '明日の夜の予約を確認するために電話しています', ['明日の夜の予約を取り消したいのです', '明日の夜に予約を取りたいのです', '今夜の予約を明日に変えたいのです']],
  ["Let's go over the schedule before the client arrives.", 'お客様が来る前に、予定を確認しましょう', ['お客様が帰ったあと、予定を立てましょう', 'お客様に予定を送りましょう', 'お客様と予定を決めましょう']],
  ['Could you make twenty copies of this report?', 'この報告書のコピーを20部とってもらえますか', ['この報告書を20ページにしてもらえますか', 'この報告書を20日までに書いてもらえますか', 'この報告書を2部コピーしてもらえますか']],
  ['The meeting has been pushed back to four o\'clock.', '会議は4時に延ばされました', ['会議は4時に早まりました', '会議は4時に終わりました', '会議は4回目です']],
  ["I'll be out of the office until next Monday.", '来週の月曜日まで会社にいません', ['来週の月曜日から会社を休みます', '来週の月曜日に会社を出ます', '月曜日の朝だけ会社にいません']],
  ['We are pleased to offer you the position.', '喜んで、あなたにその職をお願いします（採用です）', ['あなたにその仕事を断られて残念です', 'その職に応募してくれてありがとう', 'その職はもう埋まりました']],
  ["Sales have been lower than we expected this quarter.", 'この四半期の売り上げは、予想より低い', ['この四半期の売り上げは、予想より高い', '今年の売り上げは予想どおりだ', 'この四半期の費用は予想より低い']],
  ['Could you send me the slides after the presentation?', '発表のあとでスライドを送ってもらえますか', ['発表の前にスライドを見せてもらえますか', 'スライドを直してもらえますか', '発表でスライドを使ってもいいですか']],
  ["I'm afraid that price is a bit over our budget.", 'あいにく、その値段は予算を少しこえています', ['その値段なら予算内です', 'その値段は少し安すぎます', '予算を少し増やすことにしました']],
  ['Please sign here and keep a copy for your records.', 'ここにサインして、控えを保管してください', ['ここにサインして、控えを返してください', 'ここに名前を書いて、記録を消してください', 'コピーをとってからサインしてください']],
  ['Would you be available for a quick call this afternoon?', '今日の午後、少し電話でお話しできますか', ['今日の午後、すぐに来てもらえますか', '今日の午後、電話をかけ直してもらえますか', '今日の午後は電話に出られません']],
];

export const DIALOGUES = [
  // ---------- 旅行 ----------
  ["A: I'd like to check in, please. The name is Lopez.\nB: Thank you, Ms. Lopez. You're in room 512 on the fifth floor. Breakfast is served from seven.", 'ロペスさんの部屋は？', '5階の512号室', ['5階の521号室', '7階の512号室', '2階の512号室'], "room 512 on the fifth floor = 5階の512号室。"],
  ["A: Excuse me, is this seat taken?\nB: No, it's free. But the train is very crowded, so you were lucky.", '席について正しいのは？', '空いていた', ['ほかの人の席だった', '予約が必要だった', '窓側だった'], "it's free = 空いている。"],
  ["A: My flight was canceled. What are my options?\nB: We can put you on the next flight at 6 p.m., or you can get a full refund.", '乗客にすすめられたのは？', '午後6時の便に乗るか、全額払いもどしを受ける', ['明日の便に乗るか、ホテルに泊まる', '午後6時の便に乗るしかない', '払いもどしだけ受けられる'], 'the next flight at 6 p.m., or a full refund = 午後6時の便か全額払いもどし。'],
  ["A: How much is a round-trip ticket to Boston?\nB: It's 85 dollars. If you book online, you get a ten percent discount.", 'オンラインで予約するとどうなる？', '10%安くなる', ['10ドル安くなる', '座席が選べる', '片道が無料になる'], 'a ten percent discount = 10%の割引。'],
  ["A: Excuse me, I think I left my jacket on the bus.\nB: Let me check the lost and found. What color is it?\nA: It's dark blue with a hood.", 'なくした上着は？', 'フードつきの紺色', ['フードつきの黒', 'フードなしの紺色', '青いもようの白'], 'dark blue with a hood = フードつきの紺色。'],
  ["A: Is there anywhere you'd recommend for dinner?\nB: Try the seafood place by the harbor. It's a bit pricey, but the view is amazing.", 'すすめられた店について正しいのは？', '少し高いが景色がすばらしい', ['安くて景色がいい', '港から遠い', '予約がいらない'], "a bit pricey, but the view is amazing = 少し高いが景色がすばらしい。"],
  ["A: Could I get a wake-up call tomorrow morning?\nB: Certainly. What time would you like it?\nA: Six thirty, please. I have an early flight.", '客がモーニングコールを頼んだ理由は？', '朝早い飛行機に乗るから', ['朝ごはんを食べたいから', '会議が早いから', '目覚まし時計がこわれたから'], 'I have an early flight. = 朝早い便に乗る。'],
  ["A: The air conditioner in my room isn't working.\nB: I'm sorry about that. I'll send someone up right away. If it can't be fixed, we'll move you to another room.", 'ホテルの人はどうする？', 'すぐに人を行かせ、直らなければ部屋を変える', ['すぐに部屋を変える', '明日の朝に直す', '料金を安くする'], "I'll send someone up right away. ... we'll move you to another room."],
  ["A: How long does it take to get to the museum on foot?\nB: About twenty minutes. But there's a tram that stops right in front of it.", '博物館について正しいのは？', '歩いて20分くらいで、目の前に路面電車がとまる', ['歩いて2分くらい', '路面電車では行けない', 'バスで20分くらい'], 'About twenty minutes ... a tram that stops right in front of it.'],
  ["A: I'd like to rent a car for three days.\nB: Sure. Would you like insurance? It's an extra twelve dollars a day.", '保険はいくら？', '1日につき12ドル', ['3日で12ドル', '1日につき20ドル', '無料'], "an extra twelve dollars a day = 1日につき12ドル追加。"],
  ["A: Our tour leaves at eight sharp tomorrow.\nB: Where should we meet?\nA: In the hotel lobby. Please don't be late, because the bus can't wait.", 'ツアーの集合は？', '明日の8時ちょうどにホテルのロビー', ['明日の8時ごろにバス乗り場', '今夜8時にホテルのロビー', '明日の9時にホテルの前'], 'leaves at eight sharp ... In the hotel lobby.'],
  ["A: Do I need a visa to enter the country?\nB: Not if you're staying less than ninety days as a tourist.", 'ビザがいらないのは？', '観光で90日より短く滞在するとき', ['仕事で90日より短く滞在するとき', '90日より長く滞在するとき', '19日より短く滞在するとき'], "Not if you're staying less than ninety days as a tourist."],
  ["A: Is it possible to check out a little later tomorrow?\nB: We can extend it to one o'clock at no charge. After that, there's a fee.", '1時までのチェックアウトは？', '無料でできる', ['料金がかかる', 'できない', '朝食がつかない'], "at no charge = 無料で。"],
  ["A: Excuse me, which platform does the express to the airport leave from?\nB: Platform three. But it's been delayed by about ten minutes.", '空港行きの急行について正しいのは？', '3番線から出て、10分ほど遅れている', ['3番線から出て、時間どおり', '10番線から出る', '運休になった'], "Platform three ... delayed by about ten minutes."],
  ["A: I'm afraid your bag is two kilograms over the limit.\nB: Oh no. Can I move some things to my carry-on?\nA: Sure, go ahead.", '客はどうする？', '荷物の一部を機内持ちこみのかばんに移す', ['追加の料金を払う', '荷物を捨てる', 'もう1つ荷物を預ける'], 'move some things to my carry-on = 機内持ちこみのかばんに移す。'],
  // ---------- 仕事 ----------
  ["A: Did you get a chance to look at the proposal?\nB: Yes, I did. Overall it looks good, but I think the budget section needs more detail.", '提案書について言われたことは？', '全体はいいが、予算の部分をもっとくわしく', ['全部書き直したほうがいい', '予算の部分は完ぺき', 'まだ読んでいない'], 'the budget section needs more detail = 予算の部分にもっとくわしい説明が必要。'],
  ["A: Can we push the meeting back to Thursday?\nB: Thursday is fine, but it has to be after lunch. I'm with a client in the morning.", '会議はいつになりそう？', '木曜日の昼食のあと', ['木曜日の朝', '火曜日の昼食のあと', '今日の午後'], "Thursday ... after lunch."],
  ["A: How did the presentation go?\nB: Better than I expected. The client asked a lot of questions, which is a good sign.", '発表はどうだった？', '思ったよりよかった', ['思ったより悪かった', '中止になった', 'お客様が来なかった'], 'Better than I expected. = 思ったよりよかった。'],
  ["A: I need someone to cover the front desk on Saturday.\nB: I can do it in the morning, but I have plans in the afternoon.", 'Bの人は土曜日にどうする？', '午前だけ受付をかわる', ['一日じゅう受付をかわる', '午後だけ受付をかわる', '受付をかわれない'], 'I can do it in the morning, but I have plans in the afternoon.'],
  ["A: The printer on the third floor is out of order again.\nB: I'll call the repair company. In the meantime, you can use the one on the second floor.", '修理されるまでの間は？', '2階のプリンターを使う', ['3階のプリンターを使う', '印刷をやめる', '自分で修理する'], 'In the meantime, you can use the one on the second floor.'],
  ["A: We've received several complaints about late deliveries.\nB: That's because one of our trucks broke down. It should be fixed by Wednesday.", '配達が遅れている理由は？', 'トラックが1台こわれたから', ['運転手が足りないから', '注文が多すぎるから', '天気が悪いから'], 'one of our trucks broke down = トラックが1台故障した。'],
  ["A: I'm calling about the sales manager position.\nB: Thank you for your interest. Could you send us your résumé by Friday?", '電話した人は何をするように言われた？', '金曜日までに履歴書を送る', ['金曜日に面接に来る', 'もう一度電話する', '推薦状を送る'], 'send us your résumé by Friday = 金曜日までに履歴書を送る。'],
  ["A: Who's going to lead the new project?\nB: Maria is. She has the most experience with overseas clients.", 'マリアが選ばれた理由は？', '海外のお客様との経験がいちばん多いから', ['いちばん長く働いているから', '自分から希望したから', '外国語が話せないから'], 'She has the most experience with overseas clients.'],
  ["A: Should we order lunch for the training session?\nB: Yes, there will be about thirty people. Let's get sandwiches and some fruit.", '研修には何人くらい来る？', '30人くらい', ['13人くらい', '40人くらい', '3人くらい'], 'about thirty people = 30人くらい。'],
  ["A: I'm sorry, but I won't be able to finish the report today.\nB: That's OK. As long as I have it by tomorrow noon, it's fine.", '報告書の締め切りは？', '明日の正午', ['今日の夕方', '明日の夕方', '来週'], 'by tomorrow noon = 明日の正午までに。'],
  ["A: Our flight to Seoul is on Monday morning.\nB: Great. Did you book the hotel near the conference center?\nA: Yes, it's only a five-minute walk.", 'ホテルについて正しいのは？', '会議場から歩いて5分', ['空港から歩いて5分', '会議場から車で5分', 'まだ予約していない'], "a five-minute walk = 歩いて5分。"],
  ["A: The new software saves us about two hours a week.\nB: That's impressive. Should we introduce it to the other teams too?", 'Bの人の提案は？', 'ほかのチームにも入れる', ['使うのをやめる', '2時間の研修をする', '新しいものを買う'], 'introduce it to the other teams too = ほかのチームにも導入する。'],
  ["A: Could you look over my email before I send it to the client?\nB: Sure. Just forward it to me and I'll check it within the hour.", 'Bの人は何をする？', '1時間以内にメールを確かめる', ['メールをお客様に送る', 'メールを書き直す', '明日メールを確かめる'], "I'll check it within the hour = 1時間以内に確かめる。"],
  ["A: How was your business trip to Singapore?\nB: Busy but productive. We signed a contract with two new partners.", '出張の結果は？', '新しい2社と契約した', ['契約できなかった', '2日間休んだ', '新しい支店を開いた'], 'We signed a contract with two new partners.'],
  ["A: I'm thinking of taking a few days off next week.\nB: That's fine, but please make sure someone can answer your client calls.", '休むときに頼まれたことは？', 'お客様の電話に出られる人を決めておく', ['休みを来月にする', '毎日メールを読む', '会社に連絡する'], 'make sure someone can answer your client calls.'],
];

export const ANNOUNCEMENTS = [
  // ---------- 空港・機内 ----------
  ['Attention, please. Flight 427 to Vancouver has been delayed due to a technical problem. The new departure time is 3:45 p.m. Passengers are asked to remain near gate 18. We apologize for the inconvenience.', 'バンクーバー行きの便が遅れている理由は？', '機械の問題があるから', ['天気が悪いから', '乗客が多いから', '乗務員が遅れているから'], 'due to a technical problem = 機械の問題のため。'],
  ['Attention, please. Flight 427 to Vancouver has been delayed due to a technical problem. The new departure time is 3:45 p.m. Passengers are asked to remain near gate 18. We apologize for the inconvenience.', '乗客がたのまれていることは？', '18番ゲートの近くで待つ', ['別のゲートに移る', '受付で払いもどしを受ける', '3時45分までに搭乗する'], 'remain near gate 18 = 18番ゲートの近くにいる。'],
  ['Good morning, ladies and gentlemen. This is your captain speaking. We are now flying at 35,000 feet. We expect to arrive in Sydney about twenty minutes ahead of schedule. The weather there is sunny, with a temperature of 24 degrees.', '飛行機の到着について正しいのは？', '予定より20分ほど早く着く', ['予定より20分ほど遅れる', '予定どおりに着く', '天気のため別の空港に着く'], 'about twenty minutes ahead of schedule = 予定より20分ほど早く。'],
  ['We will soon begin boarding for flight 88 to Paris. Passengers traveling with small children and those who need extra help may board first. All other passengers, please wait until your group number is called.', '最初に搭乗できるのは？', '小さな子ども連れの人と、手助けが必要な人', ['グループ番号1の人', 'ビジネスクラスの人だけ', '荷物が少ない人'], 'Passengers traveling with small children and those who need extra help may board first.'],
  ['This is the final call for passenger Daniel Kim, traveling to Seoul on flight 702. Please proceed immediately to gate 31. The gate will close in five minutes.', 'キムさんがすべきことは？', 'すぐに31番ゲートへ行く', ['受付で切符を受け取る', '5分後に搭乗する', '別の便に乗りかえる'], 'Please proceed immediately to gate 31.'],
  ['Passengers arriving from international flights, please have your passport and customs form ready. If you have nothing to declare, follow the green signs. If you have goods to declare, follow the red signs.', '申告する物がない人は？', '緑の案内にしたがう', ['赤の案内にしたがう', '係の人に話す', '税関の書類を書かない'], 'If you have nothing to declare, follow the green signs.'],
  // ---------- 駅・電車 ----------
  ['The train now arriving at platform two is the 10:15 express to Edinburgh. This train will not stop at Newcastle. Passengers for Newcastle should take the local train departing at 10:30 from platform four.', 'ニューカッスルへ行く人は？', '4番線から10時30分の普通電車に乗る', ['2番線の急行に乗る', '10時15分の急行に乗る', '4番線から10時15分の電車に乗る'], 'Passengers for Newcastle should take the local train departing at 10:30 from platform four.'],
  ['Due to track repairs, there will be no trains between Central Station and Riverside this weekend. Free shuttle buses will run every fifteen minutes from the station entrance. Please allow extra time for your journey.', '週末に電車が走らない理由は？', '線路の修理があるから', ['大雨が予想されるから', '祭りがあるから', '電車が古いから'], 'Due to track repairs = 線路の修理のため。'],
  ['Due to track repairs, there will be no trains between Central Station and Riverside this weekend. Free shuttle buses will run every fifteen minutes from the station entrance. Please allow extra time for your journey.', 'かわりのバスについて正しいのは？', '無料で15分おきに出る', ['有料で15分おきに出る', '無料で50分おきに出る', '週末は出ない'], 'Free shuttle buses will run every fifteen minutes.'],
  ['Ladies and gentlemen, we are sorry to announce that this train will be held at this station for approximately ten minutes because of a signal problem. We will keep you updated. Thank you for your patience.', '電車がとまっている理由は？', '信号の問題があるから', ['事故があったから', '乗客が具合が悪くなったから', '前の電車が遅れているから'], 'because of a signal problem = 信号の問題のため。'],
  // ---------- ホテル・観光 ----------
  ["Welcome to the Grand Harbor Hotel. Breakfast is served in the Ocean Room on the second floor from 6:30 to 10:00. The pool and fitness center are open until 9 p.m. If you need anything, just dial zero from your room phone.", '朝食はどこで食べる？', '2階のオーシャンルーム', ['1階のロビー', 'プールのそば', '自分の部屋'], 'in the Ocean Room on the second floor.'],
  ["Welcome to the Grand Harbor Hotel. Breakfast is served in the Ocean Room on the second floor from 6:30 to 10:00. The pool and fitness center are open until 9 p.m. If you need anything, just dial zero from your room phone.", '何か必要なときは？', '部屋の電話で0番を押す', ['フロントまで行く', '9番を押す', 'メールを送る'], 'just dial zero from your room phone.'],
  ["Good morning, everyone, and welcome to the city walking tour. Today we'll visit the old cathedral, the central market, and the castle. The tour takes about three hours, and we'll stop for lunch at the market. Please stay with the group and ask me if you have any questions.", 'ツアーで昼食をとるのは？', '市場', ['大聖堂', 'お城', 'ホテル'], "we'll stop for lunch at the market."],
  ["Good morning, everyone, and welcome to the city walking tour. Today we'll visit the old cathedral, the central market, and the castle. The tour takes about three hours, and we'll stop for lunch at the market. Please stay with the group and ask me if you have any questions.", 'ツアーの長さは？', '3時間くらい', ['30分くらい', '1日じゅう', '13時間くらい'], 'The tour takes about three hours.'],
  ['The museum will close in thirty minutes. Please make your way to the exit. The gift shop on the ground floor will remain open until 6 p.m. We hope you enjoyed your visit.', '6時まで開いているのは？', '1階のおみやげ店', ['博物館の展示', '地下のカフェ', '博物館の入口'], 'The gift shop on the ground floor will remain open until 6 p.m.'],
  ["Thank you for calling Sunrise Travel. Our office is currently closed. Our business hours are Monday to Friday, 9 a.m. to 6 p.m. To change or cancel a booking, please visit our website. For emergencies during your trip, press 1.", '予約を変えたいときは？', 'ウェブサイトを見る', ['1番を押す', '月曜日に電話する', 'メールを送る'], 'To change or cancel a booking, please visit our website.'],
  // ---------- 職場・会議 ----------
  ["Good morning, everyone. Just a reminder that the fire drill will take place this Thursday at 10 a.m. When the alarm sounds, please leave by the nearest stairs, not the elevators, and gather in the parking lot.", '避難訓練で集まる場所は？', '駐車場', ['1階のロビー', '屋上', '会議室'], 'gather in the parking lot = 駐車場に集まる。'],
  ["Good morning, everyone. Just a reminder that the fire drill will take place this Thursday at 10 a.m. When the alarm sounds, please leave by the nearest stairs, not the elevators, and gather in the parking lot.", 'ベルが鳴ったら何を使う？', 'いちばん近い階段', ['エレベーター', '非常用のはしご', '正面の入口だけ'], 'leave by the nearest stairs, not the elevators.'],
  ["Hi, this is Laura from Bright Office Supplies. I'm calling about your order of printer paper. Unfortunately, one item is out of stock, so we'll send it separately next Tuesday. The rest of your order will arrive tomorrow as planned.", '在庫切れの品はいつ届く？', '来週の火曜日', ['明日', '今週の火曜日', 'まだわからない'], "we'll send it separately next Tuesday."],
  ["Hi, this is Laura from Bright Office Supplies. I'm calling about your order of printer paper. Unfortunately, one item is out of stock, so we'll send it separately next Tuesday. The rest of your order will arrive tomorrow as planned.", '電話をしてきたのは？', '事務用品の会社の人', ['印刷会社の人', '配達の運転手', '同じ会社の人'], 'Laura from Bright Office Supplies = 事務用品の会社。'],
  ["Welcome to today's training session. This morning we'll learn how to use the new customer database. After lunch, you'll practice in small groups. Please make sure your laptop is fully charged, because there are only a few outlets in this room.", 'ノートパソコンを充電しておく理由は？', 'この部屋にはコンセントが少ないから', ['午後は電気が止まるから', '昼ごはんのあとに使わないから', 'データベースが重いから'], 'there are only a few outlets in this room.'],
  ["Welcome to today's training session. This morning we'll learn how to use the new customer database. After lunch, you'll practice in small groups. Please make sure your laptop is fully charged, because there are only a few outlets in this room.", '午後にすることは？', '少人数のグループで練習する', ['新しいデータベースの説明を聞く', 'お客様に会う', 'テストを受ける'], "After lunch, you'll practice in small groups."],
  ["Let me give you a quick update on our sales. In the first quarter, our sales rose by eight percent, mainly thanks to our new online shop. However, costs also went up, so our profits stayed about the same.", '売り上げが伸びたおもな理由は？', '新しいネットショップ', ['新しい支店', '値上げ', '広告'], 'mainly thanks to our new online shop.'],
  ["Let me give you a quick update on our sales. In the first quarter, our sales rose by eight percent, mainly thanks to our new online shop. However, costs also went up, so our profits stayed about the same.", '利益はどうなった？', 'ほとんど変わらなかった', ['8%増えた', '大きく減った', '2倍になった'], 'our profits stayed about the same = 利益はほぼ同じ。'],
  ["Hello, this message is for Mr. Patel. This is Dr. Lee's office calling to remind you of your appointment tomorrow at 2:30. If you need to reschedule, please call us at least twenty-four hours in advance.", '予約を変えたいときは？', '24時間前までに電話する', ['当日に電話する', '2時30分までに来る', 'メールを送る'], 'please call us at least twenty-four hours in advance.'],
  ["Attention, all staff. The cafeteria will be closed tomorrow for cleaning. Lunch boxes will be available in the lobby from 11:30. Please order yours by 3 p.m. today using the online form.", 'お弁当を頼むには？', '今日の3時までにオンラインで申しこむ', ['明日の11時半にロビーで申しこむ', '食堂に電話する', '明日の朝、受付で申しこむ'], 'Please order yours by 3 p.m. today using the online form.'],
  ["Thank you all for coming. Before we start, I'd like to welcome our new team member, Ken Ito. Ken joins us from our Tokyo office and will be in charge of our Asian clients. Please make him feel at home.", 'ケン・イトウさんが担当するのは？', 'アジアのお客様', ['東京の事務所', '新しい社員の研修', '会議の進行'], 'will be in charge of our Asian clients.'],
  ["This product comes with a two-year warranty. If it stops working during that time, we will repair or replace it free of charge. Please keep your receipt, as you will need it to make a claim.", 'レシートが必要なのは？', '保証の修理や交換を頼むとき', ['返品するときだけ', '2年後に買いかえるとき', '使い方を聞くとき'], 'you will need it to make a claim = 保証を申し立てるときに必要。'],
  ["Good afternoon. I'm happy to announce that our company has been chosen as one of the best places to work in the region. This is thanks to all of you. To celebrate, we will hold a party next Friday evening.", '何を祝う？', '会社がこの地域の働きやすい会社に選ばれた', ['売り上げが2倍になった', '新しい支店が開いた', '社長が交代した'], 'chosen as one of the best places to work in the region.'],
  ["Please note that from next month, all travel expenses must be submitted through the new online system within two weeks of returning from a trip. Paper forms will no longer be accepted.", '出張の費用はどうやって出す？', '帰ってから2週間以内に新しいオンラインのしくみで出す', ['紙の書類で出す', '出張の前に出す', '1か月以内にメールで出す'], 'submitted through the new online system within two weeks of returning.'],
];

export const DICTATION = [
  ['Could you tell me how to get to the airport?'],
  ['I would like to book a table for four at seven.', ["I'd like to book a table for four at seven.", 'I would like to book a table for 4 at 7.']],
  ['Our flight has been delayed by two hours.', ['Our flight has been delayed by 2 hours.']],
  ['Is breakfast included in the price?'],
  ['Please keep your receipt for your records.'],
  ['The meeting has been moved to next Tuesday.'],
  ['I am afraid the item is out of stock.', ["I'm afraid the item is out of stock."]],
  ['Could you send me the invoice by email?'],
  ['We look forward to working with you.'],
  ['Thank you for your patience and understanding.'],
  ['The train to London leaves from platform three.', ['The train to London leaves from platform 3.']],
  ['Please fill out this form and sign at the bottom.'],
  ['I would like to change my reservation.', ["I'd like to change my reservation."]],
  ['Our sales increased by ten percent this year.', ['Our sales increased by 10 percent this year.', 'Our sales increased by 10% this year.']],
  ['Could we schedule a call for tomorrow morning?'],
  ['If you have any questions, please let me know.'],
  ['The hotel is a five minute walk from the station.', ['The hotel is a five-minute walk from the station.', 'The hotel is a 5 minute walk from the station.', 'The hotel is a 5-minute walk from the station.']],
  ['She is in charge of the sales team.', ["She's in charge of the sales team."]],
  ['We apologize for any inconvenience.'],
  ['I will send you the details after the meeting.', ["I'll send you the details after the meeting."]],
];
