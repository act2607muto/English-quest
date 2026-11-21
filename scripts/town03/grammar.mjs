/**
 * 3つ目の街（食事と道案内）の文法 60問。高1・TOEIC 600〜650 くらい。
 * 文法の中心：未来（will / be going to）・助動詞（should, must, have to, may, shall, would）・過去進行形・場所と方向の前置詞。
 *
 * 前半40問は穴埋め4択：[英文（空欄は ___）, 正解, 誤答3つ, 解説, 難しさ（書かなければ 2）]
 *   誤答は、その文では文法的に入らないものにする（入れても正しい英文になるものは誤答にしない）。
 * 後半20問は単語の並べかえ（format order）：[日本語, 正しい英文のリスト, 解説]
 *   カードは1つ目の英文から作る（終わりの . ? を除き、文の最初の単語は I のほかは小文字にする）。
 *   ほかの並べ方でも正しい英文になるときは、リストに足す（カードと同じ単語でできていること）。
 */
export const GRAMMAR = [
  ['I think I ___ have the pasta.', 'will', ['am', 'was', 'have'], 'その場で決めたことは will + 動詞の原形（〜にします）。'],
  ['We ___ going to eat out tonight.', 'are', ['will', 'do', 'have'], '前から決めている予定は be going to + 動詞の原形。主語 we なので are。'],
  ['Look at those dark clouds. It is ___ to rain.', 'going', ['go', 'will', 'goes'], '目に見える様子から「〜しそうだ」と言うときは be going to。'],
  ['___ you like something to drink?', 'Would', ['Will', 'Are', 'Have'], '「〜はいかがですか」とていねいにすすめるのは Would you like 〜?'],
  ['___ I take your order?', 'May', ['Am', 'Does', 'Was'], '店員の「ご注文をうかがってもよろしいですか」は May I take your order?'],
  ["You ___ try the cheesecake. It's really good.", 'should', ['are', 'did', 'were'], 'すすめるときは should + 動詞の原形（〜したほうがいい）。'],
  ['You ___ smoke in this restaurant. It is not allowed.', 'must not', ['must', 'have to', 'should'], 'must not + 動詞の原形で「〜してはいけない」（禁止）。'],
  ["You don't ___ to make a reservation.", 'have', ['must', 'should', 'can'], "don't have to + 動詞の原形で「〜しなくてよい」。"],
  ["It's a nice day. ___ we sit outside?", 'Shall', ['Are', 'Did', 'Have'], '「〜しましょうか」と誘うときは Shall we 〜?'],
  ['Could you tell me how ___ get to the station?', 'to', ['for', 'can', 'do'], '「〜への行き方」は how to get to 〜。'],
  ['What ___ you doing when I called you?', 'were', ['are', 'did', 'was'], '過去のある時に「〜していた」は過去進行形（was / were + -ing）。主語 you なので were。'],
  ['I ___ cooking dinner when the phone rang.', 'was', ['am', 'were', 'did'], '電話が鳴った（過去）ときにしていたことは過去進行形。主語 I なので was。'],
  ['While we ___ eating, it started to rain.', 'were', ['are', 'was', 'did'], 'while（〜している間に）のあとは、過去なら過去進行形。主語 we なので were。'],
  ['The bank is ___ the post office and the hotel.', 'between', ['among', 'from', 'across'], '2つのものの「あいだに」は between A and B。'],
  ['The café is ___ the corner.', 'on', ['to', 'of', 'with'], '「角に（面して）」は on the corner（at the corner とも言う）。'],
  ['Walk ___ the river for five minutes.', 'along', ['into', 'between', 'at'], '「〜に沿って」は along。'],
  ['Go ___ the bridge and turn left.', 'across', ['between', 'among', 'into'], '「（橋や道を）渡って」は across。'],
  ['The restaurant is ___ the second floor.', 'on', ['in', 'over', 'to'], '「〜階に」は on the 〜 floor。'],
  ['Turn left ___ the next traffic light.', 'at', ['on', 'in', 'to'], '「〜のところで（曲がる）」と一点を言うときは at。'],
  ['The station is ___ the end of this street.', 'at', ['on', 'in', 'to'], 'at the end of 〜 で「〜の突き当たりに」。'],
  ['How long does it take ___ here to the airport?', 'from', ['at', 'in', 'on'], 'from A to B で「AからBまで」。'],
  ['It takes about twenty minutes ___ bus.', 'by', ['on', 'with', 'in'], '乗り物で行くときは by bus（a や the をつけない）。'],
  ["I'm looking forward to ___ at the new restaurant.", 'eating', ['eat', 'ate', 'eaten'], 'look forward to のあとは -ing（〜するのを楽しみにしている）。'],
  ['This is the restaurant ___ I had my birthday dinner.', 'where', ['which', 'who', 'what'], '場所を説明して「そこで〜した」と続けるときは where。'],
  ['The pasta ___ by a chef from Italy.', 'was cooked', ['cooked', 'was cooking', 'cooks'], '「〜によって作られた」は受け身（was + 過去分詞）。'],
  ['Could you tell me where the restroom ___?', 'is', ['are', 'does', 'be'], '文の中の疑問（間接疑問）は「主語 + 動詞」の順。the restroom は1つなので is。'],
  ["If you're hungry, I ___ make you a sandwich.", 'can', ['did', 'was', 'have'], '「（よければ）〜してあげられる」は can + 動詞の原形。'],
  ['___ you mind if I sit here?', 'Would', ['Are', 'Did', 'Have'], 'Would you mind if 〜? で「〜してもかまいませんか」。'],
  ["I'm going to ___ a table for four.", 'book', ['booking', 'booked', 'books'], 'be going to のあとは動詞の原形。book = 予約する。'],
  ['She ___ dinner when I got home.', 'was making', ['makes', 'is making', 'has made'], '私が帰った（過去）ときにしていたことは過去進行形。'],
  ["We ___ go to that café tomorrow if it's sunny.", 'will', ['were', 'did', 'have'], 'tomorrow（これから）のことは will + 動詞の原形。'],
  ['The tea is too hot ___ drink.', 'to', ['for', 'that', 'and'], 'too 〜 to … で「〜すぎて…できない」。'],
  ['Is there a pharmacy ___ here?', 'near', ['next', 'close', 'between'], '「この近くに」は near here。'],
  ['Go straight ___ you see a big red sign.', 'until', ['by', 'during', 'since'], '「〜するまで（ずっと）」は until。'],
  ['The bus stop is in ___ of the bank.', 'front', ['face', 'head', 'before'], 'in front of 〜 で「〜の前に」。'],
  ['You ___ order at the counter before you sit down.', 'have to', ['has to', 'having to', 'had better to'], '主語 you なので have to（〜しなければならない）。'],
  ['Would you like ___ more coffee?', 'some', ['many', 'a', 'few'], 'ものをすすめる疑問文では some を使う。coffee は数えられないので many・a・few は使わない。'],
  ['How ___ is it from here to the museum?', 'far', ['often', 'many', 'much'], '距離をたずねるときは How far。'],
  ['The waiter brought us the menus ___ we sat down.', 'as soon as', ['so that', 'even if', 'unless'], 'as soon as で「〜するとすぐに」。', 3],
  ['I ___ to this restaurant three times.', 'have been', ['have went', 'am going', 'was'], '「〜へ行ったことがある」は have been to 〜。go の過去分詞は gone（went は過去形）。', 3],
];

export const ORDER = [
  ['駅への行き方を教えてくれませんか。', ['Could you tell me the way to the station?'], 'Could you tell me 〜? で「〜を教えてくれませんか」。the way to 〜 で「〜への道」。'],
  ['（注文で）魚にします。', ['I will have the fish.'], '注文で「〜にします」は I will have 〜（I\'ll have 〜）。'],
  ['私たちは公園でお昼ごはんを食べる予定です。', ['We are going to have lunch at the park.', 'At the park we are going to have lunch.'], '予定は be going to + 動詞の原形。'],
  ['何をお飲みになりますか。', ['What would you like to drink?'], 'What would you like to 〜? で「何を〜なさいますか」。'],
  ['2つ目の角を右に曲がってください。', ['Turn right at the second corner.', 'At the second corner, turn right.'], '道案内は動詞から始める（命令文）。「〜で」は at。'],
  ['銀行は郵便局のとなりにあります。', ['The bank is next to the post office.'], 'next to 〜 で「〜のとなりに」。'],
  ['あなたが電話をくれたとき、私は夕食を食べていました。', ['I was eating dinner when you called.', 'When you called, I was eating dinner.'], '過去のある時にしていたことは過去進行形（was + -ing）。'],
  ['チョコレートケーキを食べてみるといいですよ。', ['You should try the chocolate cake.'], 'should + 動詞の原形で「〜したほうがいい」。'],
  ['そこへ行くのにどれくらい時間がかかりますか。', ['How long does it take to get there?'], 'How long does it take to 〜? で「〜するのにどれくらいかかるか」。'],
  ['メニューを見せていただけますか。', ['May I see the menu?'], 'May I 〜? で「〜してもよろしいですか」（ていねいな頼み方）。'],
  ['ここではチップを置かなくてもいいですよ。', ["You don't have to leave a tip here.", "Here you don't have to leave a tip."], "don't have to で「〜しなくてよい」。"],
  ['この近くにいいレストランはありますか。', ['Is there a good restaurant near here?'], 'Is there 〜? で「〜はありますか」。near here で「この近くに」。'],
  ['川が見えるまで、この通りを進んでください。', ['Go along this street until you see the river.', 'Until you see the river, go along this street.'], 'along で「〜に沿って」、until で「〜するまで」。'],
  ['タクシーで10分くらいかかるでしょう。', ['It will take about ten minutes by taxi.', 'By taxi, it will take about ten minutes.'], 'It takes 〜 で「（時間が）かかる」。by taxi で「タクシーで」。'],
  ['ピザを分けて食べませんか。', ['Shall we share a pizza?'], 'Shall we 〜? で「〜しませんか」。share = 分け合う。'],
  ['昨夜8時に何をしていましたか。', ['What were you doing at eight last night?', 'What were you doing last night at eight?'], '過去のある時にしていたことをたずねるのは What were you doing 〜?'],
  ['博物館は図書館と公園のあいだにあります。', ['The museum is between the library and the park.', 'The museum is between the park and the library.'], 'between A and B で「AとBのあいだに」。'],
  ['お水を1杯もらえますか。', ['Could I have a glass of water?'], 'Could I have 〜? で「〜をもらえますか」。a glass of water = コップ1杯の水。'],
  ['今夜はカレーを作るつもりです。', ['I am going to cook curry tonight.', 'Tonight I am going to cook curry.'], '予定は be going to + 動詞の原形。'],
  ['どのバスが空港へ行きますか。', ['Which bus goes to the airport?'], 'Which bus が主語なので、そのあとはすぐ動詞（goes）。'],
];
