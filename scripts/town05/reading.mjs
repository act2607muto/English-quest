/**
 * 5つ目の街（旅行と仕事）のリーディング 100問（50の文章 × 2問）。高3〜大学・TOEIC 750〜800 くらい。
 * この街から：記事（最初の行を「# 見出し」にすると見出しつきの記事のカード）と、いくつかの文書（「---」だけの行で区切ると
 * 「文書1」「文書2」…と並ぶ）。ほかに、メール（From:/To:/Subject:）・メッセージ（「名前: 本文」）・お知らせ・広告など。
 * いくつかの文書の問題は、2つの文書を読み合わせないと答えられない質問を入れる。
 * 形：[英文（改行は \n）, [[質問, 正解, 誤答3つ, 解説, 難しさ（書かなければ 3）], …]]
 */
export const READING = [
  // ---------- 記事 ----------
  ['# City Airport to Open New Terminal\nRiverton City Airport will open its new international terminal on April 1. The terminal has 20 new gates, a larger security area, and more than 40 shops and restaurants. Airport officials say waiting times at security should be cut in half. The old terminal will be used only for domestic flights.', [
    ['新しいターミナルについて正しいのは？', '保安検査の待ち時間が半分ほどになると見られている', ['国内線だけが使う', 'ゲートが40ある', '4月1日に閉まる'], 'waiting times at security should be cut in half = 保安検査の待ち時間が半分になる見こみ。'],
    ['古いターミナルはどうなる？', '国内線だけに使われる', ['取りこわされる', '店とレストランになる', '国際線だけに使われる'], 'The old terminal will be used only for domestic flights.'],
  ]],
  ['# More Companies Allow Remote Work\nA new survey shows that 62 percent of companies in the region now allow employees to work from home at least two days a week. Many workers say they save time and money on commuting. However, some managers worry that it is harder to build strong teams when people rarely meet in person.', [
    ['調査でわかったことは？', '62%の会社が週2日以上の在宅勤務を認めている', ['62%の社員が毎日在宅で働いている', '2割の会社が在宅勤務をやめた', '社員の多くが通勤を楽しんでいる'], '62 percent of companies ... allow employees to work from home at least two days a week.'],
    ['一部の管理職が心配していることは？', '会って話す機会が少ないとチームを作りにくい', ['通勤の費用が増える', '社員が早く帰りすぎる', '家での仕事の時間が長すぎる'], 'it is harder to build strong teams when people rarely meet in person.'],
  ]],
  ['# Tourism Returns to Coastal Town\nAfter two quiet years, the small coastal town of Bayford welcomed a record 150,000 visitors last summer. Local businesses credit a new ferry service that connects the town with the capital in just 90 minutes. Hotel owners now hope to attract more visitors in the winter season as well.', [
    ['観光客が増えた理由として、地元の店があげているのは？', '首都と90分で結ぶ新しいフェリー', ['新しい空港', '冬の祭り', 'ホテルの値下げ'], 'Local businesses credit a new ferry service that connects the town with the capital in just 90 minutes.'],
    ['ホテルの持ち主が望んでいることは？', '冬にももっと客が来ること', ['夏の客を減らすこと', 'フェリーの値段を下げること', '新しいホテルを建てること'], 'Hotel owners now hope to attract more visitors in the winter season as well.'],
  ]],
  ['# Local Bakery Expands Overseas\nSunny Bread, a bakery that started in a small shop ten years ago, will open its first store abroad in Singapore this fall. The company now has 35 shops across the country. Its founder, Lisa Grant, says the secret of their success is using only local ingredients and baking everything fresh every morning.', [
    ['サニー・ブレッドについて正しいのは？', '今年の秋、初めて海外に店を出す', ['10年前にシンガポールで始まった', '国内に10の店がある', '外国の材料だけを使っている'], 'will open its first store abroad in Singapore this fall.'],
    ['創業者が言う成功の理由は？', '地元の材料を使い、毎朝焼きたてにしていること', ['値段が安いこと', '店が大きいこと', '広告をたくさん出していること'], 'using only local ingredients and baking everything fresh every morning.'],
  ]],
  ['# Train Fares to Rise in July\nThe national railway announced that fares will increase by an average of 4 percent from July 1. The company says the extra money will be used to replace old trains and improve station facilities. Monthly passes for students will not be affected.', [
    ['値上げについて正しいのは？', '7月1日から平均4%上がる', ['4月1日から7%上がる', '学生の定期券も上がる', '古い電車だけ値上げする'], 'fares will increase by an average of 4 percent from July 1.'],
    ['値上げで増えたお金の使い道は？', '古い電車を取りかえ、駅の設備をよくする', ['社員の給料を上げる', '新しい路線を作る', '学生の定期券を安くする'], 'used to replace old trains and improve station facilities.'],
  ]],
  ['# Hotel Chain Goes Plastic-Free\nThe Greenleaf hotel chain will stop providing single-use plastic items in all of its 80 hotels by the end of the year. Shampoo will come in large refillable bottles, and plastic water bottles will be replaced by free water stations on every floor. The chain expects to cut its plastic waste by 70 percent.', [
    ['グリーンリーフのホテルでは、水はどうなる？', '各階の無料の給水所で飲める', ['ペットボトルが無料になる', '部屋で売られる', 'フロントでだけもらえる'], 'plastic water bottles will be replaced by free water stations on every floor.'],
    ['この取り組みで期待されていることは？', 'プラスチックごみを70%減らす', ['ホテルを80に増やす', '宿泊料金を下げる', 'シャンプーを売る'], 'expects to cut its plastic waste by 70 percent.'],
  ]],
  ['# Young People Choose Experiences Over Things\nAccording to a recent study, people in their twenties now spend more money on travel and concerts than on clothes or electronics. Researchers say social media plays a big role, since people enjoy sharing photos of their experiences. Travel companies are responding by offering short, low-cost trips for young customers.', [
    ['研究によると、20代の人がより多くお金を使うのは？', '旅行やコンサート', ['服や電子機器', '家や車', '本や勉強'], 'spend more money on travel and concerts than on clothes or electronics.'],
    ['旅行会社がしていることは？', '若い客向けに短くて安い旅行を出している', ['ソーシャルメディアをやめている', '長い旅行を値上げしている', 'コンサートを開いている'], 'offering short, low-cost trips for young customers.'],
  ]],
  ['# Four-Day Work Week Trial a Success\nA software company in Dublin tested a four-day work week for six months. Employees worked 32 hours instead of 40 but received the same salary. The company reports that productivity stayed the same, while sick days fell by 25 percent. It has decided to continue the system permanently.', [
    ['試しの間、社員の給料はどうだった？', '変わらなかった', ['2割減った', '4日分だけになった', '上がった'], 'received the same salary.'],
    ['会社の決定は？', 'この働き方をずっと続ける', ['5日勤務にもどす', 'もう6か月試す', 'ほかの会社にすすめる'], 'It has decided to continue the system permanently.'],
  ]],
  // ---------- いくつかの文書 ----------
  ['From: Anna Ruiz\nTo: Front Desk, Lakeside Inn\nSubject: Late arrival\nHello,\nI have a reservation for May 14. My flight lands at 11 p.m., so I will probably arrive at the hotel around midnight. Will someone be at the front desk?\nAnna Ruiz\n---\nFrom: Front Desk, Lakeside Inn\nTo: Anna Ruiz\nSubject: Re: Late arrival\nDear Ms. Ruiz,\nOur front desk is open until 11 p.m. After that, please use the key box next to the entrance. Your code is 4471. We look forward to your stay.', [
    ['アンナがホテルに着くのは何時ごろ？', '夜の12時ごろ', ['夜の11時ごろ', '朝の4時ごろ', '夕方の5時ごろ'], 'I will probably arrive at the hotel around midnight.'],
    ['アンナはどうやって部屋のかぎを受け取る？', '入口の横のキーボックスを使う', ['フロントの人から受け取る', '空港で受け取る', '翌朝フロントで受け取る'], 'フロントは11時まで。アンナは12時ごろ着くので、After that, please use the key box next to the entrance.'],
  ]],
  ['# Summer Tour Prices\nCity Bus Tour: $25 (2 hours)\nCastle and Garden Tour: $40 (half day, lunch not included)\nWine Country Tour: $85 (full day, lunch included)\nAll tours: 10% off for groups of 5 or more.\n---\nKen: Hi Mia! For Saturday, I think the Castle and Garden Tour looks fun.\nMia: Me too. There will be six of us, right?\nKen: Yes. And we can eat lunch in town after the tour.', [
    ['ケンたちが選んだツアーは1人いくら（割引の前）？', '40ドル', ['25ドル', '85ドル', '36ドル'], 'Castle and Garden Tour: $40'],
    ['ケンたちのツアーの料金について正しいのは？', '6人なので10%安くなる', ['昼食がついている', '5人までなら割引がない', '2時間で終わる'], 'There will be six of us. 5人以上は10% off なので割引になる。'],
  ]],
  ['Notice: Office Move\nFrom Monday, June 3, the Sales Department will move from the 2nd floor to the 5th floor, Room 502. Phone numbers will not change.\n---\nFrom: Tom Reed\nTo: Sales Team\nSubject: Packing\nHi team,\nPlease pack your desks by Friday afternoon. Boxes are in the storage room on the 2nd floor. The movers will come on Saturday morning.\nTom', [
    ['営業部の新しい場所は？', '5階の502号室', ['2階の502号室', '5階の205号室', '倉庫のとなり'], 'will move from the 2nd floor to the 5th floor, Room 502.'],
    ['机の荷物をまとめる期限は？', '引っこしの前の金曜日の午後', ['6月3日の月曜日', '土曜日の朝', '引っこしのあとの金曜日'], 'Please pack your desks by Friday afternoon. 引っこし業者は土曜日、新しい場所は6月3日の月曜日から。'],
  ]],
  ['# Job Opening: Hotel Receptionist\nThe Seaview Hotel is looking for a full-time receptionist. Requirements: at least two years of experience in customer service, good English skills. Experience with booking software is a plus. Apply by March 31.\n---\nFrom: Jun Park\nTo: Seaview Hotel\nSubject: Receptionist position\nDear Hiring Manager,\nI am writing to apply for the receptionist position. I have worked at a café for three years, and I am familiar with several booking systems from my previous job at a travel agency.', [
    ['この仕事に必ず必要なものは？', '2年以上の接客の経験と英語力', ['予約ソフトの経験', 'ホテルで働いた経験', '3年以上の旅行会社の経験'], 'Requirements: at least two years of experience in customer service, good English skills. 予約ソフトは「あればなおよい」（a plus）。'],
    ['ジュンについて正しいのは？', '必要な経験に加えて、予約システムも使ったことがある', ['接客の経験が2年に足りない', 'ホテルで3年働いた', '応募の締め切りを過ぎている'], 'カフェで3年（接客の経験）、旅行会社で予約システムを使った。'],
  ]],
  ['Conference Schedule – Day 1\n9:00 Opening speech (Hall A)\n10:00 Workshop: Social Media Marketing (Room 3)\n12:00 Lunch (Cafeteria)\n13:30 Panel: The Future of Travel (Hall A)\n---\nFrom: Conference Office\nTo: All Participants\nSubject: Change\nDue to the speaker\'s travel delay, the workshop on social media marketing will start one hour later than planned. It will be held in Room 5 instead.', [
    ['ワークショップは何時に始まる？', '11時', ['10時', '9時', '13時30分'], '予定は10:00。one hour later than planned なので11時。'],
    ['ワークショップの部屋は？', '5号室', ['3号室', 'ホールA', '食堂'], 'It will be held in Room 5 instead.'],
  ]],
  ['From: Kate Wilson\nTo: Daniel Cho\nSubject: Order #5521\nHi Daniel,\nWe would like to order 300 notebooks. Could you tell us the price? We need them by October 10.\nKate\n---\nFrom: Daniel Cho\nTo: Kate Wilson\nSubject: Re: Order #5521\nHi Kate,\nThe price is $2 per notebook, but orders over 250 get a 10% discount. We can deliver by October 8.\nDaniel', [
    ['ケイトの注文の値段は1冊いくらになる？', '1ドル80セント', ['2ドル', '2ドル20セント', '1ドル'], '1冊2ドル。250冊をこえる注文は10%引きなので1ドル80セント。'],
    ['配達について正しいのは？', '必要な日より前に届く', ['必要な日に間に合わない', '10月10日ちょうどに届く', 'まだ決まっていない'], 'ケイトは10月10日までに必要。ダニエルは10月8日までに届けられる。'],
  ]],
  ['Lost & Found Report – Central Station\nItem: Black backpack with a red tag\nFound: Platform 4, June 12, 6:40 p.m.\nNow kept at: Station office (open 7 a.m. – 9 p.m.)\n---\nLisa: Hi! I think they found my backpack at Central Station!\nOmar: Great! Are you going to get it tonight?\nLisa: It\'s already 9:30, so I\'ll go tomorrow morning before work.', [
    ['リュックサックが見つかった場所は？', '4番線のホーム', ['駅の事務所', '電車の中', '駅の入口'], 'Found: Platform 4.'],
    ['リサが今夜取りに行かない理由は？', '事務所がもう閉まっているから', ['仕事があるから', 'リュックの色がちがうから', 'オマールが取りに行くから'], '事務所は午後9時まで。今はもう9時30分。'],
  ]],
  ['# Riverside Hotel – Room Rates\nStandard room: $120 per night\nDeluxe room (river view): $160 per night\nBreakfast: $15 per person\nStay 3 nights or more and get breakfast free!\n---\nFrom: Paul Green\nTo: Riverside Hotel\nSubject: Booking\nHello,\nI would like to book a deluxe room for two nights, June 5 to 7, for my wife and me. We would also like breakfast both days.', [
    ['ポールが予約したい部屋の1泊の料金は？', '160ドル', ['120ドル', '175ドル', '15ドル'], 'Deluxe room (river view): $160 per night'],
    ['ポールの朝食について正しいのは？', '2泊なので朝食は無料にならない', ['3泊なので無料になる', '1人だけ無料になる', '朝食はついていない部屋だ'], '3泊以上で無料。ポールは2泊なので、1人15ドルかかる。'],
  ]],
  ['Memo\nTo: All Staff\nFrom: Human Resources\nThe annual health check will take place on September 18 and 19 in Meeting Room B. Please sign up for a time slot online by September 10.\n---\nFrom: Rina Sato\nTo: Human Resources\nSubject: Health check\nHello,\nI will be on a business trip from September 17 to 20. Is it possible to take the health check on another day?\nRina', [
    ['健康診断の申しこみの期限は？', '9月10日', ['9月18日', '9月17日', '9月20日'], 'Please sign up for a time slot online by September 10.'],
    ['リナがほかの日を頼んでいる理由は？', '健康診断の日に出張しているから', ['会議室Bが使えないから', '申しこみを忘れたから', '体の具合が悪いから'], '健康診断は9月18・19日。リナは17日から20日まで出張。'],
  ]],
  ['Sale! 20% off all suitcases this weekend only (Saturday and Sunday).\nMembers get an extra 5% off.\n---\nMax: I bought a new suitcase yesterday. It was 20% off!\nYuki: Lucky you! Did you get the member discount too?\nMax: No, I forgot my member card at home.', [
    ['マックスがスーツケースを買った日は？', '週末（土曜日か日曜日）', ['週末の前の金曜日', 'セールの前の日', '月曜日'], '「昨日」買って20% offだった。セールは土日だけなので、昨日は週末。'],
    ['マックスが受けた割引は？', '20%', ['25%', '5%', 'なし'], '会員カードを忘れたので、会員の5%は受けていない。'],
  ]],
  ['From: Grand Tours\nTo: Customers\nSubject: Tour change\nDue to road construction, our Mountain Lake Tour on July 22 will take a different route. The tour will now take 30 minutes longer and return at 6:30 p.m. instead of 6:00 p.m.\n---\nSue: My train home leaves at 6:45 p.m. from the station near the tour office.\nTim: That will be tight! The office is a ten-minute walk from the station.', [
    ['ツアーが長くなる理由は？', '道路工事のため別の道を通るから', ['湖で長く休むから', '出発が遅れるから', '参加者が多いから'], 'Due to road construction ... will take a different route.'],
    ['ティムが「ぎりぎりだ」と言う理由は？', 'ツアーが6時30分に終わり、駅まで10分かかり、電車は6時45分だから', ['ツアーが6時に終わるから', '駅がツアーの事務所から遠すぎるから', 'スーの電車が6時30分に出るから'], '6:30に終わって駅まで10分、電車は6:45。'],
  ]],
  ['Shuttle Bus Timetable (Airport → City Center)\nDeparts: 7:00, 7:40, 8:20, 9:00 (every 40 minutes until 22:20)\nTravel time: about 35 minutes\nFare: $8 (pay the driver, cash only)\n---\nMessage from Emma: My plane lands at 8:00. After getting my bag, I should be at the bus stop by 8:15.', [
    ['エマが乗れるいちばん早いバスは？', '8時20分', ['8時', '7時40分', '9時'], '8:15にバス停に着くので、次は8:20。'],
    ['エマは市の中心に何時ごろ着く？', '8時55分ごろ', ['8時35分ごろ', '9時20分ごろ', '8時20分ごろ'], '8:20に出て、35分くらいかかる。'],
  ]],
  // ---------- メール ----------
  ['From: Laura Kim\nTo: Marketing Team\nSubject: Budget for next year\nHi everyone,\nThank you for sending your ideas for next year\'s campaigns. Unfortunately, our budget has been cut by 15 percent, so we will not be able to do all of them. Please choose your top two ideas and send them to me by Wednesday. We will discuss them at Friday\'s meeting.\nLaura', [
    ['チームの人がすることは？', 'いちばんいい案を2つ選んで水曜日までに送る', ['案を全部書き直す', '予算を15%増やす', '金曜日までに15の案を出す'], 'Please choose your top two ideas and send them to me by Wednesday.'],
    ['すべての案を実行できない理由は？', '予算が15%減らされたから', ['時間が足りないから', '案がよくないから', '人が足りないから'], 'our budget has been cut by 15 percent.'],
  ]],
  ['From: Customer Service, ShopNow\nTo: Mr. Hill\nSubject: Your return\nDear Mr. Hill,\nWe have received the jacket you returned. Since it was returned within 30 days and has not been worn, you will receive a full refund. The money will be sent to your credit card within 5 to 7 business days.', [
    ['全額払いもどしになる理由は？', '30日以内に返され、着ていないから', ['上着がこわれていたから', '会員だから', '店がまちがえて送ったから'], 'returned within 30 days and has not been worn.'],
    ['お金はどうやってもどる？', '5〜7営業日以内にクレジットカードに', ['すぐに現金で', '30日後に銀行口座に', '店のポイントで'], 'sent to your credit card within 5 to 7 business days.'],
  ]],
  ['From: Mark Evans\nTo: Jenny Lim\nSubject: Thank you\nDear Jenny,\nThank you for showing me around your factory last week. I was very impressed by how clean and efficient it is. I have shared your proposal with my manager, and we would like to discuss a possible contract. Would you be available for a video call next Tuesday?\nBest regards,\nMark', [
    ['マークがこのメールを書いた目的は？', '工場の案内のお礼と、話し合いの申しこみ', ['契約を断るため', '工場の見学を申しこむため', '自分の工場を案内するため'], 'Thank you for showing me around ... we would like to discuss a possible contract.'],
    ['マークが工場について感じたことは？', 'きれいで効率がいい', ['古くてせまい', '遠くて不便', '人が多すぎる'], 'impressed by how clean and efficient it is.'],
  ]],
  ['From: Westside Rail\nTo: Pass Holders\nSubject: Important: Card renewal\nDear Customer,\nYour monthly pass will expire on March 31. To avoid any interruption, please renew it online or at any ticket machine before that date. Renewing online gives you 50 bonus points.', [
    ['メールを受け取った人がすべきことは？', '3月31日より前に定期券を更新する', ['3月31日に新しいカードを受け取る', 'ポイントを使う', '定期券をやめる'], 'please renew it ... before that date.'],
    ['オンラインで更新するとどうなる？', '50ポイントもらえる', ['50%安くなる', '1か月無料になる', '早く届く'], 'Renewing online gives you 50 bonus points.'],
  ]],
  ['From: Olivia Brown\nTo: All Team Members\nSubject: Farewell lunch for James\nHi everyone,\nAs you know, James is retiring at the end of this month after 25 years with the company. We are planning a farewell lunch on Friday, the 28th, at Bella Italia. Please let me know by Monday if you can come. We are also collecting money for a gift – $10 per person.\nOlivia', [
    ['ジェームズについて正しいのは？', '25年勤めて、今月で退職する', ['25歳になる', '別の会社に移る', '来月入社する'], 'James is retiring ... after 25 years with the company.'],
    ['参加する人がすることは？', '月曜日までに知らせ、プレゼントのために10ドル出す', ['金曜日までに25ドル出す', '自分でレストランを予約する', 'プレゼントを1人ずつ買う'], 'let me know by Monday ... $10 per person.'],
  ]],
  ['From: Dr. Hassan\'s Clinic\nTo: Mr. Tanaka\nSubject: Appointment reminder\nThis is a reminder that you have an appointment on Thursday, May 9, at 10:30 a.m. Please arrive 15 minutes early to fill out a form. If you need to cancel, please call us at least one day in advance, or a fee of $20 will be charged.', [
    ['タナカさんは何時に着くべき？', '10時15分', ['10時30分', '10時45分', '9時30分'], '10:30の予約で、15分早く来るように。'],
    ['料金がかかるのはどんなとき？', '前日までに連絡せずに取り消したとき', ['15分遅れたとき', '書類を書かなかったとき', '木曜日に来たとき'], 'call us at least one day in advance, or a fee of $20 will be charged.'],
  ]],
  ['From: Chris Wong\nTo: Amy Park\nSubject: Re: Proposal draft\nHi Amy,\nI read your draft. The design section is excellent, but I think the cost estimate is too optimistic. Shipping prices have gone up recently, so please check the latest rates and update the figures. Everything else looks ready.\nChris', [
    ['クリスが直してほしいところは？', '費用の見積もり', ['デザインの部分', '全体', '送り先'], 'the cost estimate is too optimistic ... update the figures.'],
    ['見積もりが楽観的すぎる理由は？', '最近、送料が上がったから', ['デザインが高いから', '材料が安くなったから', '注文が減ったから'], 'Shipping prices have gone up recently.'],
  ]],
  ['From: Hotel Belmont\nTo: Guests\nSubject: Your upcoming stay\nDear Guest,\nWe look forward to welcoming you. Please note that our parking lot is under construction until the end of the month. Guests arriving by car can use the public parking garage across the street at a 50% discount by showing their room key.', [
    ['車で来た客はどこにとめる？', '道の向かいの公共の駐車場', ['ホテルの駐車場', '駅の駐車場', 'ホテルの裏の道'], 'can use the public parking garage across the street.'],
    ['割引を受けるには？', '部屋のかぎを見せる', ['予約のメールを見せる', '月末まで待つ', 'フロントで申しこむ'], 'at a 50% discount by showing their room key.'],
  ]],
  ['From: IT Support\nTo: All Employees\nSubject: System update this weekend\nOur email system will be updated on Saturday from 10 p.m. to Sunday 6 a.m. During this time, you will not be able to send or receive emails. If you have urgent business, please use the phone. No action is needed from you.', [
    ['システムの更新中にできないことは？', 'メールの送受信', ['電話をかけること', 'パソコンを使うこと', '会社に入ること'], 'you will not be able to send or receive emails.'],
    ['社員がしなければならないことは？', '特にない', ['パスワードを変える', 'パソコンの電源を切る', '土曜日に出社する'], 'No action is needed from you.'],
  ]],
  ['From: Sophie Martin\nTo: Event Team\nSubject: Venue for the product launch\nHi all,\nWe have two options for the product launch venue. The Crystal Hall holds 300 people and costs $5,000. The Park Pavilion holds 150 people and costs $2,500, but it is outdoors. Since we expect about 200 guests and the event is in November, I recommend the Crystal Hall.\nSophie', [
    ['ソフィーがクリスタル・ホールをすすめる理由として合うものは？', '客が200人くらいで、11月は外が寒いから', ['安いから', '客が150人くらいだから', '外でやりたいから'], 'パーク・パビリオンは150人まで、しかも外。200人の客、11月の行事。'],
    ['パーク・パビリオンについて正しいのは？', '費用はクリスタル・ホールの半分', ['300人入る', '屋内にある', '5,000ドルかかる'], '$2,500 は $5,000 の半分。'],
  ]],
  // ---------- メッセージ ----------
  ["Nina: Hi Leo, are you still at the office?\nLeo: Yes, I'm finishing the sales report.\nNina: Could you bring the client files to tomorrow's meeting? I left them on my desk.\nLeo: Sure. Which client?\nNina: Greenway Foods. The blue folder.", [
    ['ニーナがレオに頼んだことは？', '明日の会議に客のファイルを持ってくる', ['売り上げの報告書を書く', '机をかたづける', '客に電話する'], "Could you bring the client files to tomorrow's meeting?"],
    ['ファイルについて正しいのは？', 'ニーナの机にある青いフォルダー', ['レオの机にある', '会議室にある', '赤いフォルダー'], 'I left them on my desk ... The blue folder.'],
  ]],
  ["Ben: Our flight to Rome is canceled!\nCara: Oh no. Did they offer another flight?\nBen: Yes, tomorrow at 9 a.m. They'll pay for a hotel near the airport tonight.\nCara: That's not bad. Should I cancel our first night in Rome?\nBen: Yes, please. We'll arrive there around noon tomorrow.", [
    ['航空会社がしてくれることは？', '明日の便と、今夜の空港近くのホテル', ['今夜の別の便', '全額の払いもどしだけ', 'ローマのホテル代'], 'tomorrow at 9 a.m. ... pay for a hotel near the airport tonight.'],
    ['カーラがすることは？', 'ローマでの最初の1泊を取り消す', ['空港のホテルを予約する', '明日の便を取り消す', 'ローマに先に行く'], 'Should I cancel our first night in Rome? / Yes, please.'],
  ]],
  ["Manager: Hi Sam, the client wants to move our meeting to 3 p.m. today. Can you make it?\nSam: I have a dentist appointment at 2, but I should be back by 3:30.\nManager: OK. I'll start the meeting, and you can join when you get back.", [
    ['サムが3時に会議に出られない理由は？', '2時に歯医者の予約があるから', ['客と会うから', '別の会議があるから', '3時30分に出かけるから'], 'I have a dentist appointment at 2.'],
    ['会議はどうなる？', '上司が始めて、サムはもどってから加わる', ['3時30分に始まる', '明日に延びる', 'サムが始める'], "I'll start the meeting, and you can join when you get back."],
  ]],
  ["Ava: Are you going to the trade fair next week?\nJoe: Only on Thursday. I have to stay in the office on Friday.\nAva: Me too, Thursday only. Shall we take the 8 o'clock train together?\nJoe: Sounds good. I'll book the tickets.", [
    ['2人について正しいのは？', '2人とも木曜日だけ見本市に行く', ['2人とも金曜日に行く', 'ジョーだけが行く', '2人とも両日行く'], 'Only on Thursday. / Me too, Thursday only.'],
    ['ジョーがすることは？', '切符を予約する', ['事務所に残る', '見本市を取り消す', '8時に電話する'], "I'll book the tickets."],
  ]],
  ["Hana: The hotel says our room has a view of the old town, not the sea.\nKai: But we paid for a sea view!\nHana: They're full tonight, but they'll move us tomorrow and give us free breakfast.\nKai: OK, that's fair.", [
    ['今夜の部屋について正しいのは？', '海ではなく旧市街が見える', ['海が見える', '窓がない', '朝食がつかない'], 'our room has a view of the old town, not the sea.'],
    ['ホテルが申し出たことは？', '明日部屋を移し、朝食を無料にする', ['今夜すぐに部屋を移す', '料金を全額返す', '別のホテルを紹介する'], "they'll move us tomorrow and give us free breakfast."],
  ]],
  ["Ella: I'm stuck in traffic. I might be 20 minutes late for the interview.\nRyan: Don't worry. I'll let the manager know. Just come straight to the 4th floor when you arrive.\nElla: Thank you so much!", [
    ['エラが遅れそうな理由は？', '渋滞につかまっているから', ['道に迷ったから', '電車が止まったから', '書類を忘れたから'], "I'm stuck in traffic."],
    ['ライアンがすることは？', '担当者に知らせる', ['面接を中止する', 'エラをむかえに行く', '面接を明日にする'], "I'll let the manager know."],
  ]],
  // ---------- お知らせ・広告・案内 ----------
  ['Welcome to the National Museum\nOpening hours: 9:00–17:00 (closed Mondays)\nLate opening on Fridays until 20:00\nAdmission: Adults $15, Students $8, Children under 12 free\nAudio guides are available in 8 languages for $3.', [
    ['金曜日の閉館時間は？', '20時', ['17時', '18時', '21時'], 'Late opening on Fridays until 20:00.'],
    ['10歳の子どもの入館料は？', '無料', ['8ドル', '3ドル', '15ドル'], 'Children under 12 free.'],
  ]],
  ['NOTICE TO GUESTS\nThe hotel swimming pool will be closed from June 1 to June 7 for maintenance. During this period, guests may use the pool at our partner hotel, the Plaza, free of charge. Please show your room key at the Plaza reception.', [
    ['プールが閉まっている間、客はどうできる？', '提携ホテルのプールを無料で使える', ['料金を返してもらえる', 'ジムを無料で使える', 'プールの一部を使える'], 'guests may use the pool at our partner hotel, the Plaza, free of charge.'],
    ['プラザで必要なことは？', '部屋のかぎを見せる', ['予約をする', '料金を払う', '水着を借りる'], 'Please show your room key at the Plaza reception.'],
  ]],
  ['Careful Travel Insurance\nCovers: medical costs, lost or stolen luggage, flight cancellations\nDoes not cover: injuries from extreme sports, items left unattended in public places\nTo make a claim, contact us within 14 days of returning home.', [
    ['この保険で補償されないのは？', '公共の場所に置いたままにして取られた物', ['飛行機の欠航', '病院の費用', '盗まれた荷物'], 'Does not cover: items left unattended in public places.'],
    ['補償を申し立てる期限は？', '家に帰ってから14日以内', ['旅行の前', '旅行中', '帰ってから1か月以内'], 'contact us within 14 days of returning home.'],
  ]],
  ['Staff Wanted – Summer Season\nBlue Bay Resort is hiring tour guides and restaurant staff for July and August.\n- Free accommodation and meals\n- Must speak English; a second language is an advantage\n- Weekend work required\nSend your CV to jobs@bluebay.example by May 15.', [
    ['この仕事について正しいのは？', '住む所と食事が無料', ['1年間の仕事', '週末は休み', '2か国語を話せないといけない'], 'Free accommodation and meals.'],
    ['応募するには？', '5月15日までに履歴書をメールで送る', ['7月に直接行く', '電話で申しこむ', '5月15日に面接を受ける'], 'Send your CV ... by May 15.'],
  ]],
  ['Meeting Room Rules\n1. Book rooms through the online calendar at least one day in advance.\n2. If you finish early, please cancel the rest of your booking.\n3. Clean the whiteboard and take your trash with you.\n4. Food is not allowed, but drinks are OK.', [
    ['会議室でしてもよいことは？', '飲み物を飲む', ['食べ物を食べる', '当日に予約する', 'ごみを置いていく'], 'Food is not allowed, but drinks are OK.'],
    ['早く終わったときにすることは？', '残りの予約を取り消す', ['次の人に知らせる', 'そのまま使い続ける', '受付に電話する'], 'If you finish early, please cancel the rest of your booking.'],
  ]],
  ['Coffee & Co. Loyalty Card\nGet one stamp for every drink you buy. Collect 10 stamps and get a free drink of any size. Stamps expire after 6 months. Cards cannot be shared or exchanged for cash.', [
    ['無料の飲み物をもらうには？', 'スタンプを10個集める', ['6か月通う', '大きいサイズを買う', 'カードを2枚集める'], 'Collect 10 stamps and get a free drink.'],
    ['このカードについて正しいのは？', 'スタンプは6か月で使えなくなる', ['ほかの人と分けられる', '現金にかえられる', 'スタンプに期限はない'], 'Stamps expire after 6 months.'],
  ]],
  ['City Marathon – Road Closures\nOn Sunday, October 6, the following roads will be closed from 6 a.m. to 2 p.m.: Main Street, River Road, and Park Avenue. Buses will take different routes. Residents are advised to use the subway, which will run extra trains in the morning.', [
    ['道路が閉まるのは？', '日曜日の朝6時から午後2時まで', ['土曜日の一日じゅう', '日曜日の午後2時から', '月曜日の朝'], 'On Sunday, October 6, ... from 6 a.m. to 2 p.m.'],
    ['住民にすすめられていることは？', '地下鉄を使う', ['バスを使う', '車で出かける', '家にいる'], 'Residents are advised to use the subway.'],
  ]],
  ['SkyHigh Airlines – Baggage Policy\nEconomy: one checked bag up to 23 kg\nBusiness: two checked bags up to 32 kg each\nExtra bags: $60 each\nBags over the weight limit: $75 each', [
    ['エコノミーの客が2つ目の荷物を預けると？', '60ドルかかる', ['75ドルかかる', '無料', '預けられない'], 'Extra bags: $60 each.'],
    ['ビジネスの客が預けられるのは？', '1つ32kgまでの荷物を2つ', ['23kgまでの荷物を1つ', '32kgまでの荷物を1つ', '何個でも無料'], 'two checked bags up to 32 kg each.'],
  ]],
  ['Online Course: Business English for Beginners\nStart date: April 10\nLength: 8 weeks (two 60-minute live lessons per week)\nPrice: $240 ($200 if you register by March 31)\nAll lessons are recorded, so you can watch them later if you miss one.', [
    ['3月20日に申しこむと、いくらになる？', '200ドル', ['240ドル', '120ドル', '40ドル'], '3月31日までに申しこむと200ドル。'],
    ['授業を休んだときは？', '録画をあとで見られる', ['次の週に2回受ける', 'お金が返ってくる', '受けなおせない'], 'All lessons are recorded, so you can watch them later.'],
  ]],
  ['Parking Information – Seaside Office Park\nVisitors: Park in the area marked "V" near the main entrance. Parking is free for up to 3 hours. Register your car number at the reception desk on arrival.\nEmployees: Use the underground parking. Monthly fee: $50.', [
    ['訪問者がすることは？', '着いたら受付で車の番号を登録する', ['月50ドル払う', '地下にとめる', '3時間ごとに車を動かす'], 'Register your car number at the reception desk on arrival.'],
    ['訪問者の駐車について正しいのは？', '3時間まで無料', ['一日じゅう無料', '1時間50ドル', 'とめられない'], 'Parking is free for up to 3 hours.'],
  ]],
  ['Language Exchange Café\nEvery Wednesday 7–9 p.m. at Library Café\nPractice English, Spanish, or Japanese with native speakers.\nFree for library members; $5 for others (includes one drink).\nNo booking needed – just drop in!', [
    ['参加するのに必要なことは？', '特にない（予約なしで行ける）', ['前の日に予約する', '図書館の会員になる', '5ドルの飲み物を2つ買う'], 'No booking needed – just drop in!'],
    ['会員でない人について正しいのは？', '5ドルで、飲み物が1つつく', ['無料で参加できる', '参加できない', '7ドルかかる'], '$5 for others (includes one drink).'],
  ]],
  ['Pine Valley Campsite – Rules\n- Check-in after 2 p.m.; check-out by 11 a.m.\n- Quiet hours: 10 p.m. to 7 a.m.\n- Campfires only in the fire pits provided.\n- Pets are welcome but must be kept on a leash.', [
    ['キャンプ場で静かにしなければならないのは？', '夜10時から朝7時まで', ['午後2時から11時まで', '一日じゅう', '朝7時から夜10時まで'], 'Quiet hours: 10 p.m. to 7 a.m.'],
    ['ペットについて正しいのは？', 'つなぎひもをつければ連れてこられる', ['連れてこられない', '自由に放してよい', '別の料金がかかる'], 'Pets are welcome but must be kept on a leash.'],
  ]],
  ['# Night Trains Make a Comeback\nAfter years of decline, overnight trains are becoming popular again in Europe. Many travelers say they choose night trains because they produce far less carbon than flights. Others like the fact that they save the cost of one night in a hotel. Several new routes, including Paris to Berlin, started this year.', [
    ['夜行列車を選ぶ理由として書かれているのは？', '飛行機より二酸化炭素がずっと少ないから', ['飛行機より速いから', '食事が無料だから', '切符が飛行機の半分の値段だから'], 'they produce far less carbon than flights（飛行機よりずっと炭素が少ない）。ほかに、ホテル1泊分がうくこと。'],
    ['今年始まった路線の例は？', 'パリからベルリン', ['ベルリンからローマ', 'パリからロンドン', 'ロンドンからベルリン'], 'Several new routes, including Paris to Berlin, started this year.'],
  ]],
  ['From: Office Manager\nTo: All Staff\nSubject: New coffee machine\nWe have installed a new coffee machine in the kitchen on the 3rd floor. Coffee is free, but please bring your own cup, as paper cups will no longer be provided.\n---\nLiam: Did you see the new coffee machine?\nZoe: Yes! But I had to buy a cup at the shop downstairs.\nLiam: Me too. I forgot to bring mine from home.', [
    ['新しいコーヒーマシンについて正しいのは？', 'コーヒーは無料だが、自分のカップが必要', ['コーヒーは有料で、紙コップがある', '1階の台所にある', '紙コップだけ使える'], 'Coffee is free, but please bring your own cup.'],
    ['ゾーイとリアムがカップを買った理由は？', '紙コップがもう置かれていないから', ['コーヒーが有料になったから', 'カップがこわれたから', 'マシンが新しいカップしか使えないから'], 'paper cups will no longer be provided.'],
  ]],
];
