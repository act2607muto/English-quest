/**
 * 3つ目の街（食事と道案内）のスピーキング 60問（録音を文字にしてAI採点）。
 * SPEAK_SAY（30問）：日本語を見て英語で言う。[日本語, 模範解答のリスト]
 * SPEAK_ANSWER（30問）：英語の質問に自分のことで答える。[英語の質問, 質問の意味, 答えの例のリスト]
 */
export const SPEAK_SAY = [
  // ---------- 食事 ----------
  ['3人ですが、席はありますか。', ['Do you have a table for three?', "There are three of us. Do you have a table?"]],
  ['注文をお願いします。', ["We're ready to order.", "Excuse me, we'd like to order."]],
  ['これにします。', ["I'll have this.", "I'll have this one, please."]],
  ['チキンカレーを1つと、サラダを2つください。', ["One chicken curry and two salads, please.", "I'll have one chicken curry and two salads."]],
  ['氷なしでお願いします。', ['No ice, please.', 'Without ice, please.']],
  ['それは辛いですか。', ['Is it spicy?', 'Is that spicy?']],
  ['取り皿をもらえますか。', ['Could we have some small plates?', 'Can I get an extra plate?']],
  ['おかわりをもらえますか。', ['Can I get a refill?', 'Could I have a refill, please?']],
  ['デザートは結構です。', ['No dessert, thank you.', "I'll pass on dessert, thanks."]],
  ['トイレはどこですか。', ['Where is the restroom?', 'Where is the bathroom?']],
  ['予約をキャンセルしたいのですが。', ["I'd like to cancel my reservation.", 'I want to cancel my reservation.']],
  ['ここに座ってもいいですか。', ['Can I sit here?', 'Is this seat free?', 'May I sit here?']],
  ['もう少し待ってもらえますか。まだ決めていません。', ["Could you give us a few more minutes? We haven't decided yet.", "Can we have a little more time? We haven't decided."]],
  ['ケーキを2つに分けてもらえますか。', ['Could you cut the cake in two?', 'Could you cut the cake in half?']],
  ['ごちそうさまでした。とてもおいしかったです。', ['Thank you. It was really delicious.', 'Thanks for the meal. It was very good.']],
  // ---------- 道案内 ----------
  ['すみません、道に迷いました。', ["Excuse me, I'm lost.", "Excuse me, I think I'm lost."]],
  ['市役所はどこですか。', ['Where is the city hall?', 'Where is City Hall?']],
  ['駅まで歩いてどれくらいですか。', ['How long does it take to walk to the station?', 'How far is it to the station on foot?']],
  ['この電車は空港に行きますか。', ['Does this train go to the airport?']],
  ['どこで乗りかえればいいですか。', ['Where should I change trains?', 'Where do I change trains?']],
  ['まっすぐ行って、右に曲がってください。', ['Go straight and turn right.', 'Go straight, then turn right.']],
  ['あの高い建物のとなりです。', ["It's next to that tall building.", 'It is next to that tall building.']],
  ['郵便局の向かいです。', ["It's across from the post office.", "It's opposite the post office."]],
  ['この地図のどこにいますか。', ['Where are we on this map?', 'Where am I on this map?']],
  ['タクシーで行ったほうがいいですよ。', ['You should take a taxi.', "You'd better take a taxi."]],
  ['次のバスは何時ですか。', ['What time is the next bus?', 'When is the next bus?']],
  ['2番線から出ます。', ['It leaves from platform two.', 'It departs from track two.']],
  ['いっしょに行きましょうか。', ['Shall I go with you?', 'Shall I take you there?']],
  ['この道で合っていますか。', ['Is this the right way?', 'Am I going the right way?']],
  ['駅に着いたら電話します。', ["I'll call you when I get to the station.", "I'll call you when I arrive at the station."]],
];

export const SPEAK_ANSWER = [
  // ---------- 食事 ----------
  ["What's your favorite food?", 'いちばん好きな食べ物は何ですか？', ['My favorite food is sushi.', 'I love curry and rice.']],
  ['What did you have for breakfast this morning?', '今朝、朝ごはんに何を食べましたか？', ['I had toast and coffee.', 'I had rice and miso soup.']],
  ['Do you cook at home? What do you make?', '家で料理をしますか？何を作りますか？', ['Yes, I often make pasta.', "Not much, but sometimes I make fried rice."]],
  ['Are you ready to order?', 'ご注文はお決まりですか？', ["Yes, I'll have the fish, please.", 'Could you give me a few more minutes?']],
  ['How many people are in your party?', '何名さまですか？', ['Two, please.', 'There are four of us.']],
  ['Would you like something to drink?', '何かお飲みになりますか？', ["I'll have an iced tea, please.", "Just water, thanks."]],
  ['For here or to go?', '店内でお召し上がりですか、お持ち帰りですか？', ['For here, please.', 'To go, please.']],
  ['How was your meal?', 'お食事はいかがでしたか？', ['It was great, thank you.', 'It was delicious. I really liked the soup.']],
  ['Is there anything you cannot eat?', '何か食べられないものはありますか？', ["I can't eat shrimp.", "No, I can eat anything."]],
  ['Where do you usually eat lunch?', 'ふだん、どこで昼ごはんを食べますか？', ['I usually eat lunch at my office.', 'I often eat at a café near my school.']],
  ['What are you going to eat for dinner tonight?', '今夜の夕食は何を食べるつもりですか？', ["I'm going to have curry tonight.", "I'm going to eat pasta with my family."]],
  ['Do you prefer eating out or eating at home? Why?', '外食と家で食べるのと、どちらが好きですか？それはなぜ？', ['I prefer eating at home because it is relaxing.', 'I like eating out because I can try new food.']],
  ['What were you doing at seven last night?', '昨夜7時に何をしていましたか？', ['I was eating dinner with my family.', 'I was cooking dinner.']],
  ['Can you recommend a good restaurant in your town?', 'あなたの町のいいレストランをすすめてくれますか？', ["There's a nice ramen shop near the station.", 'You should try the Italian restaurant on Main Street.']],
  ['What food from your country should visitors try?', '旅行者が試すべき、あなたの国の食べ物は何ですか？', ['They should try sushi and ramen.', 'I think they should try okonomiyaki.']],
  // ---------- 道案内 ----------
  ['Excuse me, is there a station near here?', 'すみません、この近くに駅はありますか？', ["Yes, it's about five minutes from here.", "Yes. Go straight and turn left at the corner."]],
  ['How do you usually get to school or work?', 'ふだん学校や仕事にどうやって行きますか？', ['I usually go by train.', 'I walk to work.', 'I ride my bike to school.']],
  ['How long does it take to get there?', 'そこへ行くのにどれくらいかかりますか？', ['It takes about thirty minutes by train.', 'It takes about ten minutes on foot.']],
  ["What's near your house?", 'あなたの家の近くには何がありますか？', ["There's a supermarket and a park near my house.", 'There is a station next to my house.']],
  ['Could you tell me the way to the post office?', '郵便局への行き方を教えてくれませんか？', ["Sure. Go straight and it's on your right.", "Sorry, I'm not from around here."]],
  ['Is it far from here?', 'ここから遠いですか？', ["No, it's only a few minutes' walk.", "Yes, you should take a bus."]],
  ['Which do you like better, buses or trains? Why?', 'バスと電車、どちらが好きですか？それはなぜ？', ['I like trains better because they are fast.', 'I like buses because I can see the town.']],
  ['Where is your favorite place in your town?', 'あなたの町で好きな場所はどこですか？', ['My favorite place is the park by the river.', 'I like the library near my house.']],
  ['Have you ever gotten lost? What did you do?', '道に迷ったことはありますか？どうしましたか？', ['Yes. I asked someone for directions.', 'Yes, once. I used the map on my phone.']],
  ['Where are you going to go this weekend?', '今週末はどこへ行くつもりですか？', ["I'm going to go to the beach.", "I'm going to visit my grandparents."]],
  ['Shall we meet at the station?', '駅で会いましょうか？', ["Sure. Let's meet at the north exit.", 'OK. What time shall we meet?']],
  ['What time does your nearest station close?', 'いちばん近い駅は何時に閉まりますか？', ['I think it closes around midnight.', 'The last train is at about twelve.']],
  ['How would you explain the way from the station to your house?', '駅からあなたの家への道をどう説明しますか？', ['Go out of the north exit and walk straight for five minutes.', 'Turn left at the station and my house is next to the bakery.']],
  ['What were you doing at this time yesterday?', '昨日の今ごろ、何をしていましたか？', ['I was working at my office.', 'I was studying at home.']],
  ['Do you use a map app when you go somewhere new?', '新しい場所へ行くとき、地図アプリを使いますか？', ['Yes, I always use a map app.', 'Sometimes, but I also ask people.']],
];
