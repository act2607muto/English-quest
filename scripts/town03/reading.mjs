/**
 * 3つ目の街（食事と道案内）のリーディング 60問。メニュー・張り紙・案内・時刻表・短いメッセージやメールなど。
 * 1つの文章に、質問を1〜2問つける。
 * 2026-11-22 本人の希望で、3つ目の街からは質問も選択肢も英語にした（解説は日本語のまま）。にぎわいの市は日本語のまま。
 * 形：[英文（改行は \n）, [[質問, 正解, 誤答3つ, 解説, 難しさ（書かなければ 2）], …]]
 */
export const READING = [
  ['LUNCH MENU (11 a.m. – 2 p.m.)\nPasta of the day ... $9\nChicken curry ... $10\nGreen salad ... $6\nAll lunches come with free coffee or tea.', [
    ['When is lunch served?', 'From 11 a.m. to 2 p.m.', ['From 11 p.m. to 2 a.m.', 'From 11 a.m. to noon', 'After 2 p.m.'], '11 a.m. – 2 p.m. = 午前11時から午後2時。'],
    ['What comes free with every lunch?', 'Coffee or tea', ['A salad', 'A dessert', 'Some bread'], 'come with free coffee or tea = 無料のコーヒーか紅茶がつく。'],
  ]],
  ['Café Hours\nMon–Fri: 7 a.m. – 7 p.m.\nSat: 8 a.m. – 5 p.m.\nClosed on Sundays', [
    ['What happens on Sundays?', 'The café is closed.', ['It opens at 8 a.m.', 'It closes at 5 p.m.', 'It opens at 7 a.m.'], 'Closed on Sundays = 日曜日は休み。'],
    ['What time does the café close on Saturdays?', 'At 5 p.m.', ['At 7 p.m.', 'At 8 a.m.', 'At 8 p.m.'], 'Sat: 8 a.m. – 5 p.m.'],
  ]],
  ["Today's Special\nBeef stew with bread ... $12\n(Only 20 servings!)", [
    ["How many servings of today's special are there?", 'Twenty', ['Twelve', 'Two', 'There is no limit.'], 'Only 20 servings = 20食だけ。'],
    ['What comes with the beef stew?', 'Bread', ['Rice', 'A salad', 'Soup'], 'with bread = パンつき。'],
  ]],
  ['Allergy information:\nThis dish contains nuts and milk.\nPlease ask our staff if you have any allergies.', [
    ['What is in this dish?', 'Nuts and milk', ['Nuts and eggs', 'Wheat and milk', 'Nothing special'], 'contains nuts and milk = ナッツと牛乳が入っている。'],
    ['What should people with allergies do?', 'Ask the staff', ['Check the menu by themselves', 'Go to another restaurant', 'Change their seats'], 'Please ask our staff = 店員にたずねてください。'],
  ]],
  ['Sorry! The kitchen is closed for cleaning from 3 p.m. to 5 p.m.\nDrinks are still available.', [
    ['What can customers do between 3 p.m. and 5 p.m.?', 'Order drinks but not food', ['Nothing, because the whole shop is closed', 'Order food but not drinks', 'Order both food and drinks'], 'Drinks are still available. = 飲み物は頼める。'],
    ['Why is the kitchen closed?', 'For cleaning', ['For a break', 'Because there is no food', 'For repairs'], 'closed for cleaning = そうじのために閉まる。'],
  ]],
  ['Hi Ken! From the station, take the south exit. Walk straight for five minutes. My house is the blue one next to the bakery.', [
    ['Which exit should Ken use?', 'The south exit', ['The north exit', 'The east exit', 'The west exit'], 'take the south exit = 南口から出る。'],
    ['How can Ken find the house?', "It's the blue house next to the bakery.", ["It's the blue house across from the bakery.", "It's a bakery with a blue sign.", "It's the house next to the station."], 'the blue one next to the bakery = パン屋のとなりの青い家。'],
  ]],
  ['Due to track repairs, trains will not stop at Park Station this weekend.\nPlease use the bus service instead.', [
    ['What will happen at Park Station this weekend?', 'Trains will not stop there.', ['Trains will be free.', 'Trains will leave early.', 'The station will open again.'], 'trains will not stop at Park Station = パーク駅に電車は止まらない。'],
    ['What should people use instead?', 'The bus', ['A taxi', 'A bicycle', 'Trains from the next station'], 'use the bus service instead = かわりにバスを使って。'],
  ]],
  ['The library is on Oak Street, between the post office and the flower shop.\nIt is across from the city park.', [
    ['What is on each side of the library?', 'The post office and the flower shop', ['The post office and the park', 'The flower shop and the park', 'The post office and a bank'], 'between the post office and the flower shop = 郵便局と花屋のあいだ。'],
    ['What is across from the library?', 'The city park', ['The post office', 'The flower shop', 'Oak Street Station'], 'across from the city park = 市の公園の向かい。'],
  ]],
  ['★★★★☆\nGreat pizza and friendly staff! But the place is small, so it gets crowded on weekends. Go early!', [
    ['What does the writer like?', 'The pizza and the staff', ['The size of the restaurant', 'The quiet weekends', 'The low prices'], 'Great pizza and friendly staff = ピザがおいしく、店員が親切。'],
    ['What does the writer suggest?', 'Going early', ['Making a reservation', 'Going on weekends', 'Ordering takeout'], 'Go early! = 早めに行こう。'],
  ]],
  ['Easy Pancakes\n1. Mix flour, milk, and an egg.\n2. Heat a pan.\n3. Cook each side for about two minutes.', [
    ['Which is NOT in the recipe?', 'Sugar', ['Flour', 'Milk', 'An egg'], 'flour（小麦粉）、milk（牛乳）、an egg（卵）。砂糖（sugar）はない。'],
    ['How long should you cook each side?', 'About two minutes', ['About twenty minutes', 'About one minute', 'About twelve minutes'], 'Cook each side for about two minutes. = 片面を約2分焼く。'],
  ]],
  ['Restrooms are for customers only.\nPlease ask staff for the key.', [
    ['What is true about the restrooms?', 'Only customers can use them, and staff have the key.', ['Anyone can use them freely.', 'Only customers can use them, and no key is needed.', 'Only staff can use them.'], 'for customers only（客だけ）、ask staff for the key（店員にカギをもらう）。'],
  ]],
  ['Bus 7 to Central Station\nEvery 15 minutes from 6 a.m. to 9 p.m.\nAfter 9 p.m.: every 30 minutes', [
    ['How often does the bus come at around 10 p.m.?', 'Every 30 minutes', ['Every 15 minutes', 'It does not run.', 'Every hour'], 'After 9 p.m.: every 30 minutes = 午後9時からは30分ごと。'],
    ['Where does Bus 7 go?', 'To Central Station', ['To the airport', 'To City Hall', 'To Seventh Street'], 'Bus 7 to Central Station = 中央駅行き。'],
  ]],
  ['Dear Ms. Brown,\nThank you for your reservation. We will see you on May 3 at 7 p.m. for a party of six.\nRiverside Grill', [
    ['How many people is the reservation for?', 'Six', ['Three', 'Seven', 'Two'], 'a party of six = 6人の一行。'],
    ['When is the reservation?', 'May 3 at 7 p.m.', ['March 5 at 7 p.m.', 'May 3 at 7 a.m.', 'May 7 at 3 p.m.'], 'May 3 at 7 p.m. = 5月3日の午後7時。'],
  ]],
  ['Free Wi-Fi\nThe password is on your receipt.', [
    ['Where can you find the Wi-Fi password?', 'On the receipt', ['On the menu', 'On the table', 'On the sign at the entrance'], 'on your receipt = レシートに書いてある。'],
  ]],
  ['City Tour Bus\nStarts at the Tourist Center at 10 a.m.\nTakes about 2 hours\nTickets: Adults $15, Children $8', [
    ['How much is it for two adults and one child?', '$38', ['$30', '$23', '$46'], '15 × 2 + 8 = 38 ドル。'],
    ['What time does the tour finish?', 'Around noon', ['Around 10 a.m.', 'Around 2 p.m.', 'Around 11 a.m.'], '10時に出て約2時間なので、12時（正午）ごろ。'],
  ]],
  ["Sorry, I'm going to be 15 minutes late. The bus is stuck in traffic. Please order without me!", [
    ['Why is the writer late?', 'The bus is stuck in traffic.', ['The writer missed the bus.', 'The writer got lost.', 'The writer overslept.'], 'The bus is stuck in traffic. = バスが渋滞で動けない。'],
    ['What does the writer ask?', 'To order without waiting', ['To go home without waiting', 'To come and pick them up', 'To reserve a table'], 'Please order without me! = 私を待たずに注文して。'],
  ]],
  ["Kids' Menu\nFor children under 10\nEach meal comes with juice and a small ice cream.", [
    ["Who can order from the kids' menu?", 'Children under 10', ['Children over 10', 'Both adults and children', 'Children under 12'], 'under 10 = 10歳未満。'],
    ["What comes with each kids' meal?", 'Juice and a small ice cream', ['Juice and a cake', 'A toy', 'Milk and cookies'], 'comes with juice and a small ice cream。'],
  ]],
  ['Parking for Restaurant Guests Only\nFirst 2 hours free\nAfter that: $3 per hour', [
    ['How much does it cost to park for three hours?', '$3', ['$6', '$9', 'Nothing'], '最初の2時間は無料、そのあと1時間3ドルなので、3時間なら3ドル。'],
    ['Who can use this parking lot?', 'Restaurant guests', ['Anyone', 'People using the station', 'People who live nearby'], 'for Restaurant Guests Only = レストランの客だけ。'],
  ]],
  ['Getting here:\nFrom Green Station, take Exit 2. Turn left and walk along the river. We are next to the bridge.', [
    ['What should you do after leaving the station?', 'Turn left and walk along the river.', ['Turn right and cross the river.', 'Cross the bridge and turn left.', 'Walk straight to the bridge.'], 'Turn left and walk along the river. = 左に曲がって川沿いを歩く。'],
    ['Where is the restaurant?', 'Next to the bridge', ['On the other side of the bridge', 'On an island in the river', 'Next to the station'], 'next to the bridge = 橋のとなり。'],
  ]],
  ['Our restaurant will be closed from August 10 to 16 for summer holidays.\nWe will open again on August 17.', [
    ['What will happen on August 17?', 'The restaurant will open again.', ['The summer holidays will start.', 'The restaurant will close.', 'There will be a special menu.'], 'We will open again on August 17. = 8月17日にまた開く。'],
    ['How many days will the restaurant be closed?', 'Seven days', ['Six days', 'Ten days', 'Sixteen days'], '10日から16日まで（両方ふくむ）で7日間。', 3],
  ]],
  ['Coffee Card\nBuy 9 coffees, get the 10th free!\nStamps: ● ● ● ● ● ● ●', [
    ['How many more coffees do you need to buy to get a free one?', 'Two more', ['Three more', 'One more', 'Ten more'], 'スタンプは7つ。9杯買うと10杯目が無料なので、あと2杯。', 3],
  ]],
  ['Taxi →\nBus ←\nTrain: go down one floor', [
    ['How do you get to the trains?', 'Go down one floor.', ['Go to the left.', 'Go to the right.', 'Go up one floor.'], 'go down one floor = 1つ下の階へ行く。'],
    ['Where are the buses?', 'To the left', ['To the right', 'On the floor below', 'On the floor above'], 'Bus ← = バスは左。'],
  ]],
  ['Table 5\n2 x Hamburger\n1 x Fish and chips\n3 x Lemonade', [
    ['How many people are probably at Table 5?', 'Three', ['Two', 'Five', 'Six'], '料理が3つ（ハンバーガー2つとフィッシュアンドチップス1つ）、レモネードが3つなので3人。', 3],
    ['How many hamburgers did Table 5 order?', 'Two', ['One', 'Three', 'Five'], '2 x Hamburger = ハンバーガー2つ。'],
  ]],
  ['Wet Floor\nPlease use the other entrance.', [
    ['What does the sign say?', 'The floor is wet, so use the other entrance.', ['The entrance is closed for repairs.', 'Clean your shoes before you come in.', 'Leave your umbrella before you come in.'], 'Wet Floor = 床がぬれている。use the other entrance = 別の入口を使う。'],
  ]],
  ['The new food market opened last Saturday near Central Park. It has more than 30 food stalls from around the world. It is open every day until 10 p.m.', [
    ['What is true about the market?', 'It has over 30 food stalls from around the world.', ['It has food from exactly 30 countries.', 'It opened last Sunday.', 'It opens at 10 p.m.'], 'more than 30 food stalls from around the world = 世界中の屋台が30より多い。'],
    ['When is the market open?', 'Every day until 10 p.m.', ['Only on weekends', 'On weekdays from 10 p.m.', 'Every day from 10 p.m.'], 'open every day until 10 p.m. = 毎日、夜10時まで。'],
  ]],
  ['Breakfast is served in the restaurant on the 2nd floor from 6:30 to 9:30 a.m.', [
    ['Where is breakfast served?', 'In the restaurant on the second floor', ['In the lobby on the first floor', 'In the guest rooms', 'In the restaurant on the ninth floor'], 'in the restaurant on the 2nd floor = 2階のレストランで。'],
    ['What time does breakfast end?', 'At 9:30 a.m.', ['At 6:30 a.m.', 'At 9 a.m.', 'At 10 a.m.'], 'from 6:30 to 9:30 a.m. = 午前6時30分から9時30分まで。'],
  ]],
  ["Let's meet at the café across from the bookstore. I'll wait inside by the window.", [
    ['Where is the café?', 'Across from the bookstore', ['Next to the bookstore', 'Inside the bookstore', 'Above the bookstore'], 'across from the bookstore = 本屋の向かい。'],
    ['Where will the writer wait?', 'Inside the café, by the window', ['Outside the café', 'By the window of the bookstore', 'At the café entrance'], 'inside by the window = 中の窓ぎわで。'],
  ]],
  ['Last Order 9:30 p.m.\nWe close at 10 p.m.', [
    ['What happens if you come in at 9:45 p.m.?', 'You can no longer order food.', ['You can still order food.', 'The restaurant is already closed.', 'You have to wait outside until 10.'], 'Last Order 9:30 p.m. = 最後の注文は午後9時30分まで。店は10時まで開いている。'],
  ]],
  ['Food Festival\nSaturday, June 8\nCity Square, 11 a.m. – 8 p.m.\nIf it rains, the event will be held on Sunday.', [
    ['What will happen if it rains?', 'The festival will be held on Sunday.', ['The festival will be canceled.', 'The festival will be held indoors.', 'The festival will be held next Saturday.'], 'If it rains, … on Sunday. = 雨なら日曜日に行う。'],
    ['Where is the festival?', 'In City Square', ['Inside City Hall', 'In a park', 'At a school'], 'City Square = 市の広場。'],
  ]],
  ["How to get to the castle:\nTake the Red Line to Castle Hill. It's a 5-minute walk from the station.\nOpen 9 a.m. – 5 p.m. (last entry 4:30 p.m.)", [
    ['What is the latest time you can enter the castle?', '4:30 p.m.', ['5 p.m.', '9 a.m.', '4 p.m.'], 'last entry 4:30 p.m. = 最後の入場は午後4時30分。'],
    ['How do you get to the castle?', 'Take the Red Line to Castle Hill and walk five minutes.', ['Ride the Red Line for five stops.', 'Take a bus from Castle Hill Station.', 'Walk fifty minutes from the station.'], "Take the Red Line to Castle Hill. It's a 5-minute walk from the station."],
  ]],
  ['Self-service\n1. Take a tray.\n2. Choose your food.\n3. Pay at the end of the line.', [
    ['When do you pay?', 'At the end of the line, after choosing your food', ['After you sit down', 'Before you take a tray', 'After you finish eating'], 'Pay at the end of the line. = 列の最後で払う。'],
    ['What do you do first?', 'Take a tray.', ['Choose your food.', 'Pay.', 'Find a seat.'], '1. Take a tray. = まずトレーを取る。'],
  ]],
  ['Bike Rental\n$5 for 1 hour, $15 for the whole day\nPlease return bikes by 6 p.m.', [
    ['How much is it to rent a bike for the whole day?', '$15', ['$5', '$6', '$30'], '$15 for the whole day = 1日15ドル。'],
    ['When must you return the bike?', 'By 6 p.m.', ['By 5 p.m.', 'After one hour', 'By the next morning'], 'return bikes by 6 p.m. = 午後6時までに返す。'],
  ]],
  ['Notice: The elevator is not working today.\nPlease use the stairs on your right.', [
    ['How can you go upstairs today?', 'Use the stairs on the right.', ['Use the stairs on the left.', 'Use the elevator.', 'Use the escalator.'], 'use the stairs on your right = 右側の階段を使う。'],
  ]],
];
