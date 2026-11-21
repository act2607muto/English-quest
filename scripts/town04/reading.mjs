/**
 * 4つ目の街（予定・電話・雑談）のリーディング 80問。メール（From:/To:/Subject: で始めるとメールのカードで出る）、
 * スマホのメッセージ（「名前: 本文」の行で書くと吹き出しで出る）、張り紙・伝言メモ・予定表など。
 * 形：[英文（改行は \n）, [[質問, 正解, 誤答3つ, 解説, 難しさ（書かなければ 3）], …]]
 */
export const READING = [
  // ---------- メール ----------
  ["From: Sarah Lee\nTo: Tom Baker\nSubject: Lunch on Friday\nHi Tom,\nAre you free for lunch on Friday? There's a new Thai restaurant near the office. How about 12:30?\nSarah", [
    ['サラが提案していることは？', '金曜日の12時30分に、タイ料理店で昼食', ['金曜日の夜に、タイ料理店で夕食', '月曜日の12時30分に昼食', '会社の中で昼食'], 'Are you free for lunch on Friday? … How about 12:30?'],
    ['タイ料理店について正しいのは？', '新しい店で、会社の近くにある', ['古い店で、駅の近くにある', 'トムが好きな店', '金曜日は休み'], "There's a new Thai restaurant near the office."],
  ]],
  ["From: Tom Baker\nTo: Sarah Lee\nSubject: Re: Lunch on Friday\nHi Sarah,\nI'd love to, but I have a client meeting until one. Could we meet at 1:15 instead?\nTom", [
    ['トムの返事は？', '行きたいが、1時15分にしてほしい', ['行けないので、別の日にしてほしい', '12時30分で大丈夫', '客も連れて行きたい'], "I'd love to, but … Could we meet at 1:15 instead?"],
    ['トムが1時まで忙しい理由は？', '客との打ち合わせがある', ['電話をかける', '報告書を書く', '昼食を食べる'], 'I have a client meeting until one.'],
  ]],
  ['From: City Library\nTo: Members\nSubject: Holiday hours\nThe library will be closed on May 3 and 4. We will open again on May 5 at 9 a.m. Books due on those days can be returned on May 5 without a late fee.', [
    ['図書館が休みなのは？', '5月3日と4日', ['5月4日と5日', '5月3日だけ', '5月5日'], 'closed on May 3 and 4'],
    ['休みの日が返す日だった本は？', '5月5日に返せば、遅れた料金はかからない', ['5月2日までに返さなければならない', '遅れた料金がかかる', '返さなくてよい'], 'can be returned on May 5 without a late fee'],
  ]],
  ['From: Mike Johnson\nTo: Project Team\nSubject: Meeting moved\nHi all,\nTomorrow\'s meeting has been moved from 10 a.m. to 2 p.m. because the room is not available in the morning. The place is the same, Room 5B.\nThanks,\nMike', [
    ['会議はどうなった？', '午前10時から午後2時に変わった', ['午後2時から午前10時に変わった', '明日からあさってに変わった', '中止になった'], 'moved from 10 a.m. to 2 p.m.'],
    ['変わった理由は？', '午前中は部屋が使えないから', ['マイクが午前中忙しいから', 'チームの人が来られないから', '部屋が5Bに変わったから'], 'because the room is not available in the morning'],
  ]],
  ['From: Green Hotel\nTo: Ms. Kato\nSubject: Your reservation\nDear Ms. Kato,\nThank you for booking with us. Your room is reserved for two nights, from June 10 to June 12. Check-in is from 3 p.m. Breakfast is included.', [
    ['何泊の予約？', '2泊', ['3泊', '1泊', '10泊'], 'for two nights'],
    ['予約について正しいのは？', '朝食がついている', ['チェックインは午後1時から', '6月12日にホテルに着く', '朝食は別の料金'], 'Breakfast is included.'],
  ]],
  ["From: Anna\nTo: Ken\nSubject: Thank you!\nHi Ken,\nThanks so much for the birthday present. I've always wanted a scarf like this! Let's get together soon.\nAnna", [
    ['アンナがメールを書いた理由は？', '誕生日のプレゼントのお礼', ['誕生日パーティーに招待するため', 'スカーフを返すため', '会う日を変えるため'], 'Thanks so much for the birthday present.'],
    ['アンナがもらったものは？', 'スカーフ', ['かばん', '手ぶくろ', 'ぼうし'], "I've always wanted a scarf like this!"],
  ]],
  ['From: ABC Dental Clinic\nTo: Mr. Wilson\nSubject: Appointment reminder\nThis is a reminder of your appointment on Tuesday, March 8, at 4:00 p.m. If you need to change the time, please call us at least 24 hours before.', [
    ['このメールは何のため？', '予約を忘れないように知らせるため', ['予約を取り消すため', '新しい歯医者を紹介するため', '料金を知らせるため'], 'reminder = 忘れないように知らせるもの。'],
    ['時間を変えたいときは？', '少なくとも24時間前に電話する', ['当日にメールする', '24時間後に電話する', '直接、医院に行く'], 'please call us at least 24 hours before'],
  ]],
  ['From: HR Department\nTo: All Staff\nSubject: New office hours\nStarting next month, the office will open at 8:30 a.m. instead of 9 a.m. The closing time will not change.', [
    ['来月から変わることは？', '会社が開く時間が30分早くなる', ['会社が閉まる時間が早くなる', '会社が開く時間が30分遅くなる', '会社が土曜日も開く'], 'open at 8:30 a.m. instead of 9 a.m.'],
    ['閉まる時間は？', '変わらない', ['30分早くなる', '30分遅くなる', 'まだ決まっていない'], 'The closing time will not change.'],
  ]],
  ["From: Jake\nTo: Emily\nSubject: Sorry!\nHi Emily,\nI'm really sorry I missed your call yesterday. My phone was in my bag and I didn't hear it. I'll call you tonight after eight.\nJake", [
    ['ジェイクが電話に出られなかった理由は？', '電話がかばんの中にあって、聞こえなかった', ['電池が切れていた', '会議中だった', '電話をなくした'], "My phone was in my bag and I didn't hear it."],
    ['ジェイクがこれからすることは？', '今夜8時すぎに電話する', ['今夜8時前に電話する', '明日の朝に電話する', 'メールで返事を待つ'], "I'll call you tonight after eight."],
  ]],
  ['From: Sunrise Gym\nTo: Members\nSubject: Pool closed\nThe swimming pool will be closed for cleaning from July 1 to July 7. All other areas of the gym will stay open as usual.', [
    ['7月1日から7日までは？', 'プールだけが使えない', ['ジム全体が休み', 'プールだけが使える', 'プールの料金が変わる'], 'All other areas of the gym will stay open.'],
    ['プールが閉まる理由は？', 'そうじのため', ['工事のため', '水が足りないため', '大会のため'], 'closed for cleaning'],
  ]],
  ["From: Paul\nTo: Team\nSubject: Welcome Rina!\nHi everyone,\nPlease welcome Rina Sato, who joins our team today. She has worked in marketing for five years. Let's have lunch together at noon to welcome her!\nPaul", [
    ['リナについて正しいのは？', 'マーケティングの仕事を5年している', ['今日でチームをやめる', '15年働いている', 'ポールの上司'], 'She has worked in marketing for five years.'],
    ['ポールの提案は？', 'お昼にみんなで昼食をとる', ['夕方に歓迎会をする', '明日、昼食に行く', 'リナに昼食を作ってもらう'], "Let's have lunch together at noon"],
  ]],
  ['From: Online Shop\nTo: Mr. Clark\nSubject: Your order has shipped\nYour order (No. 4521) was shipped today. It should arrive in two to three days. You can check where it is on our website.', [
    ['注文した品はいつごろ届く？', '2〜3日で', ['今日', '1週間後', '2〜3週間で'], 'It should arrive in two to three days.'],
    ['荷物の場所を確かめるには？', 'ウェブサイトで確かめる', ['店に電話する', 'メールで聞く', '店に行く'], 'You can check where it is on our website.'],
  ]],
  ["From: Lisa\nTo: Book Club\nSubject: Next meeting\nHi all,\nOur next meeting is on Saturday, the 20th, at my place. We'll talk about the book we finished last month. Please bring something to eat if you can!", [
    ['次の集まりの場所は？', 'リサの家', ['図書館', 'カフェ', '本屋'], 'at my place = 私の家で。'],
    ['できればしてほしいことは？', '食べ物を持ってくる', ['新しい本を買う', '本を読み終える', '先月の本を返す'], 'Please bring something to eat if you can!'],
  ]],
  ["From: Daniel\nTo: Mark\nSubject: Can you cover for me?\nHi Mark,\nI have a doctor's appointment on Thursday morning. Could you lead the 9 a.m. meeting for me? I'll be back by noon.\nDaniel", [
    ['ダニエルのたのみは？', '木曜日の9時の会議を代わりに進めてほしい', ['いっしょに病院に行ってほしい', '会議を正午にしてほしい', '会議に出なくてよいか聞きたい'], 'Could you lead the 9 a.m. meeting for me?'],
    ['ダニエルが会社にもどるのは？', '正午まで', ['午前9時', '木曜日の夜', '金曜日'], "I'll be back by noon."],
  ]],
  ['From: Train Line Info\nTo: Subscribers\nSubject: Service change\nOn Sunday, trains on the Blue Line will run every 20 minutes instead of every 10 minutes because of track work.', [
    ['日曜日のブルーラインは？', '20分ごとに走る', ['10分ごとに走る', '止まって動かない', '5分ごとに走る'], 'every 20 minutes instead of every 10 minutes'],
    ['電車の数が減る理由は？', '線路の工事', ['大雪', '乗る人が少ない', '新しい電車'], 'because of track work'],
  ]],
  // ---------- スマホのメッセージ ----------
  ["Ken: Are you still coming to the movie tonight?\nMia: Sorry, I'm stuck at work. Can we go tomorrow instead?\nKen: Sure, no problem.", [
    ['ミアの今の様子は？', '仕事が終わらず、抜けられない', ['映画館に向かっている', 'もう映画館に着いた', '家で休んでいる'], "I'm stuck at work. = 仕事で抜けられない。"],
    ['2人はどうする？', '明日、映画を見に行く', ['今夜、映画を見に行く', '映画はやめる', '来週に行く'], 'Can we go tomorrow instead? — Sure.'],
  ]],
  ["Amy: I'm at the station. Where are you?\nJoe: I'm by the north exit, next to the flower shop.", [
    ['ジョーがいる場所は？', '北口の、花屋のとなり', ['南口の、花屋のとなり', '北口の、本屋のとなり', '花屋の中'], 'by the north exit, next to the flower shop'],
    ['エイミーがいる場所は？', '駅', ['花屋', '会社', '家'], "I'm at the station."],
  ]],
  ["Sam: Did you get my email about the meeting?\nKate: Yes, thanks. I'll be there at 3.\nSam: Great. Don't forget to bring your laptop.", [
    ['ケイトがたのまれたことは？', 'ノートパソコンを持ってくる', ['メールを送り直す', '3時に電話する', '会議の資料を印刷する'], "Don't forget to bring your laptop."],
    ['ケイトが会議に着くのは？', '3時', ['2時', '4時', 'まだ決まっていない'], "I'll be there at 3."],
  ]],
  ["Dad: What time will you be home?\nYuki: Around 9. I'm having dinner with friends.\nDad: OK. Text me when you're on the train.", [
    ['ユキの帰りは？', '友だちと夕食を食べて、9時ごろ', ['7時ごろ', '9時に家で夕食を食べる', '今夜は帰らない'], "Around 9. I'm having dinner with friends."],
    ['お父さんのたのみは？', '電車に乗ったらメッセージを送る', ['駅に着いたら電話する', '早く帰ってくる', '夕食を買ってくる'], "Text me when you're on the train."],
  ]],
  ['Lily: Guess what! I got the job!\nTom: That\'s great news! Congratulations!\nLily: Thanks! I start next month.', [
    ['リリーについて正しいのは？', '仕事が決まり、来月から働く', ['仕事をやめた', '今月から働いている', 'これから面接を受ける'], 'I got the job! … I start next month.'],
    ['トムの気持ちは？', 'よろこんでいる', ['悲しんでいる', 'うらやましがっている', '心配している'], "That's great news! Congratulations!"],
  ]],
  ['Ben: Is the party still on for Saturday?\nNina: Yes, but it starts at 7, not 6.\nBen: Got it. See you then!', [
    ['パーティーについて正しいのは？', '土曜日の7時から', ['土曜日の6時から', '中止になった', '日曜日の7時から'], 'it starts at 7, not 6'],
    ['ベンが言った Got it. の意味は？', 'わかった', ['手に入れた', 'つかまえた', 'もう持っている'], 'Got it. = わかった（了解）。'],
  ]],
  ["Emma: I'm running 10 minutes late. Sorry!\nRyo: No worries. I'll grab us a table.\nEmma: Thanks! Order me a coffee?", [
    ['リョウがすることは？', '席を取っておく', ['店の外で待つ', '先に帰る', 'エマを迎えに行く'], "I'll grab us a table. = 席を取っておくよ。"],
    ['エマのたのみは？', 'コーヒーを注文しておいてほしい', ['席を予約してほしい', '10分待ってほしい', 'ケーキを買ってほしい'], 'Order me a coffee?'],
  ]],
  ["Mom: Did you remember to buy milk?\nKai: Oh no, I forgot. I'll stop by the store on my way home.", [
    ['カイがこれからすることは？', '帰り道に店に寄って、牛乳を買う', ['もう牛乳を買った', 'お母さんに買ってきてもらう', '明日、牛乳を買う'], "I'll stop by the store on my way home."],
    ['カイが忘れていたことは？', '牛乳を買うこと', ['店に行く道', '家に帰る時間', 'お母さんに電話すること'], 'Did you remember to buy milk? — Oh no, I forgot.'],
  ]],
  ["Leo: Are you free to talk now?\nSara: I'm in a meeting. Can I call you in an hour?\nLeo: Sure. It's not urgent.", [
    ['サラは？', '会議中なので、1時間後に電話する', ['運転中なので、あとで電話する', '今すぐ話せる', '会議に1時間遅れる'], "I'm in a meeting. Can I call you in an hour?"],
    ['レオの用件は？', '急ぎではない', ['とても急いでいる', '会議のこと', 'もう終わった'], "It's not urgent."],
  ]],
  ['Jun: Do you want to try the new ramen place this weekend?\nAya: I\'d love to! Saturday or Sunday?\nJun: Saturday lunch works best for me.', [
    ['ジュンの希望は？', '土曜日の昼', ['日曜日の昼', '土曜日の夜', '日曜日の夜'], 'Saturday lunch works best for me.'],
    ['アヤの返事は？', 'ぜひ行きたい', ['行けない', 'ラーメンは好きではない', '週末は忙しい'], "I'd love to!"],
  ]],
  ["Kim: The printer on the 2nd floor isn't working.\nLee: You can use the one on the 3rd floor. I just used it.", [
    ['リーがすすめていることは？', '3階のプリンターを使う', ['2階のプリンターを直す', 'あとで印刷する', 'リーに印刷をたのむ'], 'You can use the one on the 3rd floor.'],
    ['2階のプリンターは？', '動かない', ['紙がない', '3階に移った', '新しくなった'], "isn't working = 動かない。"],
  ]],
  ['Max: Happy birthday! Any plans for tonight?\nZoe: Thanks! Just a quiet dinner with my family.', [
    ['ゾーイの今夜の予定は？', '家族と静かに夕食', ['友だちとパーティー', 'ひとりで外食', '仕事'], 'Just a quiet dinner with my family.'],
    ['ゾーイについて正しいのは？', '今日が誕生日', ['明日が誕生日', '家族の誕生日', 'マックスの誕生日'], 'Happy birthday! — Thanks!'],
  ]],
  // ---------- 張り紙・伝言メモ・予定表 ----------
  ['Notice\nThe 3rd floor meeting rooms will be closed for repairs from Monday to Wednesday. Please use the rooms on the 5th floor.', [
    ['月曜日から水曜日は？', '3階の会議室が使えないので、5階を使う', ['5階の会議室が使えない', '3階の会議室だけ使える', '会議は中止になる'], 'Please use the rooms on the 5th floor.'],
    ['3階の会議室が使えない理由は？', '修理のため', ['予約でいっぱい', 'そうじのため', '引っこしのため'], 'closed for repairs'],
  ]],
  ['Phone Message\nTo: Mr. Hill\nFrom: Ms. Young (Star Travel)\nTime: 2:15 p.m.\nMessage: Your flight tickets are ready. Please call her back before 5 p.m.', [
    ['ヤングさんの用件は？', '飛行機の切符が用意できた', ['飛行機が遅れている', '旅行が中止になった', '切符の値段が変わった'], 'Your flight tickets are ready.'],
    ['ヒルさんがすることは？', '午後5時までに折り返し電話する', ['午後2時15分に電話する', '5時に切符を取りに行く', 'メールで返事をする'], 'Please call her back before 5 p.m.'],
  ]],
  ['Yoga Class for Beginners\nEvery Tuesday, 7–8 p.m.\nCommunity Center, Room 2\nFirst class free! Sign up at the front desk.', [
    ['初めてのクラスは？', '無料', ['半額', '予約がいらない', '金曜日'], 'First class free!'],
    ['申しこむ場所は？', '受付', ['ウェブサイト', '2番の部屋', '電話'], 'Sign up at the front desk.'],
  ]],
  ['Staff Party\nFriday, December 15, 6:30 p.m.\nRiver Restaurant\nPlease tell Ms. Ito by December 8 if you can come.', [
    ['出席できるかを伝える期限は？', '12月8日まで', ['12月15日まで', '12月6日まで', '当日まで'], 'Please tell Ms. Ito by December 8 if you can come.'],
    ['パーティーの場所は？', 'リバー・レストラン', ['会社', '伊藤さんの家', 'ホテル'], 'River Restaurant'],
  ]],
  ['Lost: Black umbrella\nLeft in Meeting Room A on Monday afternoon.\nIf you find it, please call Ken (ext. 204).', [
    ['かさをなくしたのは？', '月曜日の午後、会議室Aで', ['月曜日の朝、会議室Bで', '駅で', 'ケンのいる204号室で'], 'Left in Meeting Room A on Monday afternoon.'],
    ['見つけたら？', 'ケン（内線204）に電話する', ['会議室Aに置く', '受付に届ける', 'メールを送る'], 'please call Ken (ext. 204)'],
  ]],
  ['Weekend Weather\nSat: Sunny, 25°C\nSun: Rain in the afternoon, 18°C', [
    ['日曜日の天気は？', '午後に雨', ['一日中晴れ', '午前に雨', '雪'], 'Sun: Rain in the afternoon'],
    ['外で遊ぶのによい日は？', '土曜日', ['日曜日の午後', '日曜日', 'どちらも雨'], 'Sat: Sunny'],
  ]],
  ['Office Closing\nOur office will close early at 3 p.m. on Friday for the year-end party. Phone calls will go to voicemail after 3.', [
    ['金曜日の3時からの電話は？', '留守番電話につながる', ['ほかの事務所につながる', '社長につながる', 'パーティー会場につながる'], 'Phone calls will go to voicemail after 3.'],
    ['早く閉まる理由は？', '年末のパーティーのため', ['電話の工事のため', '大そうじのため', '休日だから'], 'for the year-end party'],
  ]],
  ["Dr. Brown's Clinic\nOpen: Mon–Fri 9–6, Sat 9–12\nClosed: Sundays and holidays\nAppointments: call 555-0123", [
    ['土曜日に開いている時間は？', '9時から12時', ['9時から6時', '休み', '12時から6時'], 'Sat 9–12'],
    ['予約のしかたは？', '電話する', ['ウェブサイトで', '直接行く', 'メールで'], 'Appointments: call 555-0123'],
  ]],
  ['Book Sale!\nAll used books $2 each, or 3 for $5.\nThis Saturday only, 10 a.m.–4 p.m., Main Library', [
    ['古本を3冊買うといくら？', '5ドル', ['6ドル', '2ドル', '3ドル'], '3 for $5 = 3冊で5ドル。'],
    ['セールの日は？', '今週の土曜日だけ', ['毎週土曜日', '土曜日と日曜日', '今月ずっと'], 'This Saturday only'],
  ]],
  ['Please turn off your phone or set it to silent mode during the performance. Photos are not allowed.', [
    ['公演中にしてはいけないことは？', '写真をとること', ['静かにすること', '電話をマナーモードにすること', 'すわっていること'], 'Photos are not allowed.'],
    ['電話は？', '電源を切るか、音が出ないようにする', ['受付にあずける', '使ってよい', '席に置いていく'], 'turn off your phone or set it to silent mode'],
  ]],
  ['Bus Schedule Change\nFrom April 1, the last bus to the airport will leave at 10:30 p.m. instead of 11 p.m.', [
    ['4月1日から、空港行きの最終バスは？', '30分早くなる', ['30分遅くなる', 'なくなる', '午後11時に出る'], 'at 10:30 p.m. instead of 11 p.m.'],
    ['今までの最終バスは？', '午後11時', ['午後10時30分', '午後10時', '午前0時'], 'instead of 11 p.m. = 午後11時のかわりに。'],
  ]],
  ['Meeting Notes\n- Next meeting: Thursday 10 a.m.\n- Emma will send the report by Wednesday.\n- Ken will book the room.', [
    ['部屋を予約するのは？', 'ケン', ['エマ', '会議の司会', '全員'], 'Ken will book the room.'],
    ['エマがすることは？', '水曜日までに報告書を送る', ['木曜日に報告書を送る', '部屋を予約する', '会議を進める'], 'Emma will send the report by Wednesday.'],
  ]],
  ["Hi! I'll be away from my desk until 2 p.m. If it's urgent, please call my mobile. — Ryan", [
    ['ライアンについて正しいのは？', '午後2時まで席を外している', ['午後2時に席を外す', '今日はもう帰った', '携帯電話を持っていない'], "I'll be away from my desk until 2 p.m."],
    ['急ぎの用は？', '携帯電話にかける', ['メールを送る', '2時まで待つ', '机にメモを置く'], "If it's urgent, please call my mobile."],
  ]],
];
