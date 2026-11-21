/**
 * 3つ目の街（食事と道案内）のリーディング 60問。メニュー・張り紙・案内・時刻表・短いメッセージやメールなど。
 * 1つの文章に、質問を1〜2問つける。
 * 形：[英文（改行は \n）, [[質問, 正解, 誤答3つ, 解説], …]]
 */
export const READING = [
  ['LUNCH MENU (11 a.m. – 2 p.m.)\nPasta of the day ... $9\nChicken curry ... $10\nGreen salad ... $6\nAll lunches come with free coffee or tea.', [
    ['ランチの時間は？', '午前11時から午後2時', ['午後11時から午前2時', '午前11時から正午', '午後2時から'], '11 a.m. – 2 p.m. = 午前11時から午後2時。'],
    ['ランチに無料でつくものは？', 'コーヒーか紅茶', ['サラダ', 'デザート', 'パン'], 'come with free coffee or tea = 無料のコーヒーか紅茶がつく。'],
  ]],
  ['Café Hours\nMon–Fri: 7 a.m. – 7 p.m.\nSat: 8 a.m. – 5 p.m.\nClosed on Sundays', [
    ['日曜日は？', '休み', ['午前8時から開く', '午後5時に閉まる', '午前7時から開く'], 'Closed on Sundays = 日曜日は休み。'],
    ['土曜日に閉まる時間は？', '午後5時', ['午後7時', '午前8時', '午後8時'], 'Sat: 8 a.m. – 5 p.m.'],
  ]],
  ["Today's Special\nBeef stew with bread ... $12\n(Only 20 servings!)", [
    ['本日のおすすめは何食限定？', '20食', ['12食', '2食', '限定なし'], 'Only 20 servings = 20食だけ。'],
    ['ビーフシチューについてくるものは？', 'パン', ['ごはん', 'サラダ', 'スープ'], 'with bread = パンつき。'],
  ]],
  ['Allergy information:\nThis dish contains nuts and milk.\nPlease ask our staff if you have any allergies.', [
    ['この料理に入っているものは？', 'ナッツと牛乳', ['ナッツと卵', '小麦と牛乳', '何も入っていない'], 'contains nuts and milk = ナッツと牛乳が入っている。'],
    ['アレルギーがある人は、どうするように書いてある？', 'お店の人にたずねる', ['自分でメニューを調べる', 'となりの店に行く', '席をかえる'], 'Please ask our staff = 店員にたずねてください。'],
  ]],
  ['Sorry! The kitchen is closed for cleaning from 3 p.m. to 5 p.m.\nDrinks are still available.', [
    ['午後3時から5時のあいだは？', '料理はないが、飲み物は頼める', ['店が全部閉まる', '飲み物もない', '料理だけ頼める'], 'Drinks are still available. = 飲み物は頼める。'],
    ['キッチンが閉まる理由は？', 'そうじのため', ['休けいのため', '材料がないため', '工事のため'], 'closed for cleaning = そうじのために閉まる。'],
  ]],
  ['Hi Ken! From the station, take the south exit. Walk straight for five minutes. My house is the blue one next to the bakery.', [
    ['駅のどの出口から出る？', '南口', ['北口', '東口', '西口'], 'take the south exit = 南口から出る。'],
    ['家の目印は？', 'パン屋のとなりの青い家', ['パン屋の向かいの青い家', '青い看板のパン屋', '駅のとなりの家'], 'the blue one next to the bakery = パン屋のとなりの青い家。'],
  ]],
  ['Due to track repairs, trains will not stop at Park Station this weekend.\nPlease use the bus service instead.', [
    ['今週末、パーク駅では？', '電車が止まらない', ['電車が無料になる', '電車が早く出る', '駅が新しくなる'], 'trains will not stop at Park Station = パーク駅に電車は止まらない。'],
    ['かわりに何を使うように書いてある？', 'バス', ['タクシー', '自転車', 'となりの駅の電車'], 'use the bus service instead = かわりにバスを使って。'],
  ]],
  ['The library is on Oak Street, between the post office and the flower shop.\nIt is across from the city park.', [
    ['図書館の両どなりにあるのは？', '郵便局と花屋', ['郵便局と公園', '花屋と公園', '郵便局と銀行'], 'between the post office and the flower shop = 郵便局と花屋のあいだ。'],
    ['図書館の向かいにあるのは？', '市の公園', ['郵便局', '花屋', 'オーク通りの駅'], 'across from the city park = 市の公園の向かい。'],
  ]],
  ['★★★★☆\nGreat pizza and friendly staff! But the place is small, so it gets crowded on weekends. Go early!', [
    ['この人がほめているのは？', 'ピザと、店員の感じのよさ', ['店の広さ', '週末のすいていること', '値段の安さ'], 'Great pizza and friendly staff = ピザがおいしく、店員が親切。'],
    ['すすめていることは？', '早めに行くこと', ['予約すること', '週末に行くこと', '持ち帰りにすること'], 'Go early! = 早めに行こう。'],
  ]],
  ['Easy Pancakes\n1. Mix flour, milk, and an egg.\n2. Heat a pan.\n3. Cook each side for about two minutes.', [
    ['材料として書かれていないものは？', '砂糖', ['小麦粉', '牛乳', '卵'], 'flour（小麦粉）、milk（牛乳）、an egg（卵）。砂糖（sugar）はない。'],
    ['片面を焼く時間は？', '約2分', ['約20分', '約1分', '約12分'], 'Cook each side for about two minutes. = 片面を約2分焼く。'],
  ]],
  ['Restrooms are for customers only.\nPlease ask staff for the key.', [
    ['トイレについて正しいのは？', '客だけが使え、カギは店員にもらう', ['だれでも自由に使える', '客だけが使え、カギはいらない', '店員だけが使える'], 'for customers only（客だけ）、ask staff for the key（店員にカギをもらう）。'],
  ]],
  ['Bus 7 to Central Station\nEvery 15 minutes from 6 a.m. to 9 p.m.\nAfter 9 p.m.: every 30 minutes', [
    ['午後10時ごろのバスは？', '30分ごとに来る', ['15分ごとに来る', '走っていない', '1時間ごとに来る'], 'After 9 p.m.: every 30 minutes = 午後9時からは30分ごと。'],
    ['7番のバスの行き先は？', '中央駅', ['空港', '市役所', '7番通り'], 'Bus 7 to Central Station = 中央駅行き。'],
  ]],
  ['Dear Ms. Brown,\nThank you for your reservation. We will see you on May 3 at 7 p.m. for a party of six.\nRiverside Grill', [
    ['予約の人数は？', '6人', ['3人', '7人', '2人'], 'a party of six = 6人の一行。'],
    ['予約の日時は？', '5月3日の午後7時', ['3月5日の午後7時', '5月3日の午前7時', '5月7日の午後3時'], 'May 3 at 7 p.m. = 5月3日の午後7時。'],
  ]],
  ['Free Wi-Fi\nThe password is on your receipt.', [
    ['Wi-Fi のパスワードはどこにある？', 'レシート', ['メニュー', 'テーブルの上', '入口の看板'], 'on your receipt = レシートに書いてある。'],
  ]],
  ['City Tour Bus\nStarts at the Tourist Center at 10 a.m.\nTakes about 2 hours\nTickets: Adults $15, Children $8', [
    ['大人2人と子ども1人の料金は？', '38ドル', ['30ドル', '23ドル', '46ドル'], '15 × 2 + 8 = 38 ドル。'],
    ['ツアーが終わるのは何時ごろ？', '正午ごろ', ['午前10時ごろ', '午後2時ごろ', '午前11時ごろ'], '10時に出て約2時間なので、12時（正午）ごろ。'],
  ]],
  ["Sorry, I'm going to be 15 minutes late. The bus is stuck in traffic. Please order without me!", [
    ['おくれる理由は？', 'バスが渋滞につかまっている', ['バスに乗りおくれた', '道に迷った', '寝ぼうした'], 'The bus is stuck in traffic. = バスが渋滞で動けない。'],
    ['この人がたのんでいることは？', '先に注文していてほしい', ['待たずに帰ってほしい', '迎えに来てほしい', '席を予約してほしい'], 'Please order without me! = 私を待たずに注文して。'],
  ]],
  ["Kids' Menu\nFor children under 10\nEach meal comes with juice and a small ice cream.", [
    ['キッズメニューを頼めるのは？', '10歳未満の子ども', ['10歳以上の子ども', '大人も子どもも', '12歳未満の子ども'], 'under 10 = 10歳未満。'],
    ['キッズメニューについてくるものは？', 'ジュースと小さいアイスクリーム', ['ジュースとケーキ', 'おもちゃ', '牛乳とクッキー'], 'comes with juice and a small ice cream。'],
  ]],
  ['Parking for Restaurant Guests Only\nFirst 2 hours free\nAfter that: $3 per hour', [
    ['3時間とめると、いくら？', '3ドル', ['6ドル', '9ドル', '無料'], '最初の2時間は無料、そのあと1時間3ドルなので、3時間なら3ドル。'],
    ['この駐車場を使えるのは？', 'レストランの客', ['だれでも', '駅を使う人', '近所の人'], 'for Restaurant Guests Only = レストランの客だけ。'],
  ]],
  ['Getting here:\nFrom Green Station, take Exit 2. Turn left and walk along the river. We are next to the bridge.', [
    ['駅を出てからどうする？', '左に曲がって、川沿いを歩く', ['右に曲がって、川を渡る', '橋を渡って左に曲がる', 'まっすぐ橋まで歩く'], 'Turn left and walk along the river. = 左に曲がって川沿いを歩く。'],
    ['店の場所は？', '橋のとなり', ['橋の向こう側', '川の中の島', '駅のとなり'], 'next to the bridge = 橋のとなり。'],
  ]],
  ['Our restaurant will be closed from August 10 to 16 for summer holidays.\nWe will open again on August 17.', [
    ['8月17日は？', '店がまた開く', ['夏休みが始まる', '店が閉まる', '特別メニューがある'], 'We will open again on August 17. = 8月17日にまた開く。'],
    ['休みは何日間？', '7日間', ['6日間', '10日間', '16日間'], '10日から16日まで（両方ふくむ）で7日間。', 3],
  ]],
  ['Coffee Card\nBuy 9 coffees, get the 10th free!\nStamps: ● ● ● ● ● ● ●', [
    ['無料の1杯をもらうには、あと何杯買えばいい？', 'あと2杯', ['あと3杯', 'あと1杯', 'あと10杯'], 'スタンプは7つ。9杯買うと10杯目が無料なので、あと2杯。', 3],
  ]],
  ['Taxi →\nBus ←\nTrain: go down one floor', [
    ['電車に乗るには？', '1つ下の階へ行く', ['左へ行く', '右へ行く', '1つ上の階へ行く'], 'go down one floor = 1つ下の階へ行く。'],
    ['バス乗り場は？', '左', ['右', '下の階', '上の階'], 'Bus ← = バスは左。'],
  ]],
  ['Table 5\n2 x Hamburger\n1 x Fish and chips\n3 x Lemonade', [
    ['テーブル5の客は、何人だと考えられる？', '3人', ['2人', '5人', '6人'], '料理が3つ（ハンバーガー2つとフィッシュアンドチップス1つ）、レモネードが3つなので3人。', 3],
    ['ハンバーガーはいくつ？', '2つ', ['1つ', '3つ', '5つ'], '2 x Hamburger = ハンバーガー2つ。'],
  ]],
  ['Wet Floor\nPlease use the other entrance.', [
    ['この入口について正しいのは？', '床がぬれているので、別の入口を使う', ['入口は工事中で使えない', '足をふいてから入る', '傘を置いてから入る'], 'Wet Floor = 床がぬれている。use the other entrance = 別の入口を使う。'],
  ]],
  ['The new food market opened last Saturday near Central Park. It has more than 30 food stalls from around the world. It is open every day until 10 p.m.', [
    ['市場について正しいのは？', '世界中の料理の屋台が30より多くある', ['30か国の料理がある', '先週の日曜日に開いた', '夜10時に開く'], 'more than 30 food stalls from around the world = 世界中の屋台が30より多い。'],
    ['市場が開いているのは？', '毎日、夜10時まで', ['週末だけ', '平日の夜10時から', '毎日、夜10時から'], 'open every day until 10 p.m. = 毎日、夜10時まで。'],
  ]],
  ['Breakfast is served in the restaurant on the 2nd floor from 6:30 to 9:30 a.m.', [
    ['朝食の場所は？', '2階のレストラン', ['1階のロビー', '部屋', '9階のレストラン'], 'in the restaurant on the 2nd floor = 2階のレストランで。'],
    ['朝食が終わる時間は？', '午前9時30分', ['午前6時30分', '午前9時', '午前10時'], 'from 6:30 to 9:30 a.m. = 午前6時30分から9時30分まで。'],
  ]],
  ["Let's meet at the café across from the bookstore. I'll wait inside by the window.", [
    ['カフェの場所は？', '本屋の向かい', ['本屋のとなり', '本屋の中', '本屋の2階'], 'across from the bookstore = 本屋の向かい。'],
    ['この人が待っている場所は？', 'カフェの中の窓ぎわ', ['カフェの外', '本屋の窓ぎわ', 'カフェの入口'], 'inside by the window = 中の窓ぎわで。'],
  ]],
  ['Last Order 9:30 p.m.\nWe close at 10 p.m.', [
    ['午後9時45分に店に入ると？', 'もう料理を注文できない', ['まだ料理を注文できる', '店はもう閉まっている', '10時まで外で待つ'], 'Last Order 9:30 p.m. = 最後の注文は午後9時30分まで。店は10時まで開いている。'],
  ]],
  ['Food Festival\nSaturday, June 8\nCity Square, 11 a.m. – 8 p.m.\nIf it rains, the event will be held on Sunday.', [
    ['雨が降ったら？', '日曜日に行う', ['中止になる', '屋内で行う', '次の週の土曜日に行う'], 'If it rains, … on Sunday. = 雨なら日曜日に行う。'],
    ['どこで行う？', '市の広場', ['市役所の中', '公園', '学校'], 'City Square = 市の広場。'],
  ]],
  ["How to get to the castle:\nTake the Red Line to Castle Hill. It's a 5-minute walk from the station.\nOpen 9 a.m. – 5 p.m. (last entry 4:30 p.m.)", [
    ['城に入れる最後の時間は？', '午後4時30分', ['午後5時', '午前9時', '午後4時'], 'last entry 4:30 p.m. = 最後の入場は午後4時30分。'],
    ['城へ行くには？', 'レッドラインでキャッスルヒル駅へ行き、5分歩く', ['レッドラインに5駅乗る', 'キャッスルヒル駅からバスに乗る', '駅から50分歩く'], "Take the Red Line to Castle Hill. It's a 5-minute walk from the station."],
  ]],
  ['Self-service\n1. Take a tray.\n2. Choose your food.\n3. Pay at the end of the line.', [
    ['お金を払うのはいつ？', '料理を選んだあと、列の最後で', ['席についてから', 'トレーを取る前に', '食べ終わってから'], 'Pay at the end of the line. = 列の最後で払う。'],
    ['最初にすることは？', 'トレーを取る', ['料理を選ぶ', 'お金を払う', '席を取る'], '1. Take a tray. = まずトレーを取る。'],
  ]],
  ['Bike Rental\n$5 for 1 hour, $15 for the whole day\nPlease return bikes by 6 p.m.', [
    ['1日借りるといくら？', '15ドル', ['5ドル', '6ドル', '30ドル'], '$15 for the whole day = 1日15ドル。'],
    ['自転車を返す時間は？', '午後6時まで', ['午後5時まで', '1時間後', '次の日の朝まで'], 'return bikes by 6 p.m. = 午後6時までに返す。'],
  ]],
  ['Notice: The elevator is not working today.\nPlease use the stairs on your right.', [
    ['今日は、どうやって上の階へ行く？', '右側の階段を使う', ['左側の階段を使う', 'エレベーターを使う', 'エスカレーターを使う'], 'use the stairs on your right = 右側の階段を使う。'],
  ]],
];
