/**
 * 4つ目の街（予定・電話・雑談）の文法 80問。高2・TOEIC 650〜720 くらい。
 * 文法の中心：現在完了の使い分け（継続・経験・完了、for と since、現在完了進行形）・関係詞（who / which / whose / what / where / when）・
 * 分詞（〜している・〜された）・使役（make / let / have / get）・仮定法過去（If I were / I wish）・句動詞・時や条件を表す文。
 *
 * 前半55問は穴埋め4択：[英文（空欄は ___）, 正解, 誤答3つ, 解説, 難しさ（書かなければ 3）]
 *   誤答は、その文では文法的に入らないものにする（入れても正しい英文になるものは誤答にしない）。
 * 後半25問は単語の並べかえ（format order）：[日本語, 正しい英文のリスト, 解説]
 *   カードは1つ目の英文から作る。ほかの並べ方でも正しい英文になるときは、リストに足す（カードと同じ単語でできていること）。
 */
export const GRAMMAR = [
  // ---------- 現在完了 ----------
  ['I ___ known her since high school.', 'have', ['am', 'was', 'did'], '「ずっと〜している」（継続）は have + 過去分詞。know の過去分詞は known。'],
  ['We have lived here ___ ten years.', 'for', ['since', 'during', 'while'], '「〜の間」と長さを言うときは for。since は始まった時（since 2019）。'],
  ['She has worked here ___ 2019.', 'since', ['for', 'during', 'ago'], '「〜から（ずっと）」と始まった時を言うときは since。'],
  ['Have you ___ been to Canada?', 'ever', ['yet', 'ago', 'still'], '「今までに〜したことがありますか」は Have you ever + 過去分詞?'],
  ['I have ___ finished my report.', 'just', ['yet', 'ago', 'ever'], '「ちょうど〜したところだ」は have just + 過去分詞。'],
  ['How long have you been ___ for the bus?', 'waiting', ['wait', 'waited', 'to wait'], '「ずっと〜し続けている」は現在完了進行形（have been + -ing）。'],
  ['It ___ raining since this morning.', 'has been', ['is', 'was', 'have been'], '今朝からずっと続いているので現在完了進行形。主語 it なので has been。'],
  ["I've ___ my keys. Have you seen them?", 'lost', ['lose', 'losing', 'loses'], 'have のあとは過去分詞。lose の過去分詞は lost（なくしてしまって、今もない）。'],
  ['She ___ to Paris twice.', 'has been', ['have been', 'is being', 'was'], '「〜へ行ったことがある」は have been to。主語 she なので has been。'],
  ["I haven't seen him ___ last month.", 'since', ['for', 'from', 'ago'], 'last month（始まった時）があるので since。'],
  ['I ___ him yesterday.', 'called', ['have called', 'call', 'am calling'], 'yesterday（はっきりした過去の時）があるときは、現在完了ではなく過去形。'],
  ['When ___ you arrive in Tokyo?', 'did', ['have', 'has', 'are'], 'When（いつ）でたずねるときは、現在完了ではなく過去形（When did you 〜?）。'],
  ['This is the best movie I have ___ seen.', 'ever', ['never', 'ago', 'since'], '「今まで見た中でいちばん」は the best 〜 I have ever + 過去分詞。'],
  ['She ___ English for three years, and she still loves it.', 'has been studying', ['is studying', 'study', 'have been studying'], '3年間ずっと続けていて今も続くので現在完了進行形。主語 she なので has。'],
  // ---------- 関係詞 ----------
  ['The man ___ called you is my boss.', 'who', ['which', 'whose', 'what'], '人を説明するときは who（that も使える）。'],
  ['This is the phone ___ I bought last week.', 'which', ['who', 'where', 'what'], '物を説明するときは which（that も使える）。'],
  ['I have a friend ___ father is a pilot.', 'whose', ['who', 'which', 'that'], '「その人の〜が」と続けるときは whose。'],
  ['___ you said is true.', 'What', ['That', 'Which', 'Who'], 'what で「〜すること・〜するもの」。What you said = あなたが言ったこと。'],
  ['Do you remember the day ___ we first met?', 'when', ['which', 'who', 'what'], '時を説明して「その日に〜した」と続けるときは when。'],
  ['The café ___ we usually meet is closed today.', 'where', ['which', 'who', 'when'], '場所を説明して「そこで〜する」と続けるときは where。'],
  ["There's something ___ I want to tell you.", 'that', ['what', 'who', 'where'], 'something のあとで物を説明するときは that。'],
  ['Everyone ___ came to the party had fun.', 'who', ['which', 'whose', 'what'], '人（everyone）を説明するときは who。'],
  ['The person ___ I talked to on the phone was very kind.', 'whom', ['whose', 'which', 'what'], '人を説明し、あとの文の目的語になるときは whom（who・that も使える。書かなくてもよい）。', 3],
  // ---------- 分詞 ----------
  ['The man ___ in the corner is my uncle.', 'sitting', ['sits', 'sat', 'to sit'], '「〜している人」は名詞 + -ing（現在分詞）。'],
  ['I got an email ___ in English.', 'written', ['writing', 'wrote', 'write'], '「〜された（書かれた）もの」は名詞 + 過去分詞。'],
  ['The movie was really ___.', 'boring', ['bored', 'bore', 'bores'], '物が人を「退屈させる」ときは boring。人が「退屈している」ときは bored。'],
  ['I was ___ to hear the news.', 'surprised', ['surprising', 'surprise', 'surprises'], '人が「おどろいた」ときは surprised。'],
  // ---------- 使役 ----------
  ['My boss made me ___ the report again.', 'write', ['to write', 'writing', 'wrote'], 'make + 人 + 動詞の原形で「（むりに）〜させる」。'],
  ['My parents let me ___ out late on weekends.', 'stay', ['to stay', 'staying', 'stayed'], 'let + 人 + 動詞の原形で「（したいように）〜させてあげる」。'],
  ['I had my hair ___ yesterday.', 'cut', ['cutting', 'to cut', 'cuts'], 'have + 物 + 過去分詞で「〜してもらう」。cut の過去分詞は cut。'],
  ["I'll get him ___ you back.", 'to call', ['call', 'calls', 'called'], 'get + 人 + to + 動詞の原形で「（人に）〜してもらう」。'],
  ['She asked me ___ her the file.', 'to send', ['send', 'sending', 'sent'], 'ask + 人 + to + 動詞の原形で「（人に）〜するようたのむ」。'],
  // ---------- 仮定法 ----------
  ['If I ___ you, I would take the job.', 'were', ['am', 'be', 'will be'], '今の事実とちがう「もし私があなたなら」は If I were you（仮定法過去）。'],
  ['I wish I ___ more free time.', 'had', ['have', 'will have', 'having'], '「〜だったらいいのに」は I wish + 過去形（仮定法過去）。'],
  ['If I had a car, I ___ drive you to the station.', 'could', ['can', 'will', 'am'], '仮定法過去は「If + 過去形, 主語 + would / could + 動詞の原形」。'],
  // ---------- 句動詞・決まった言い方 ----------
  ["I'd ___ meet on Friday than on Thursday.", 'rather', ['better', 'prefer', 'like'], "would rather A than B で「BよりAしたい」。"],
  ["You'd ___ call her before it's too late.", 'better', ['rather', 'prefer', 'like'], 'had better + 動詞の原形で「〜したほうがいい」。'],
  ["Could you ___ up the phone? I'm busy.", 'pick', ['go', 'get', 'make'], 'pick up the phone で「電話に出る」。'],
  ['The line went dead, so I had to hang ___ and call again.', 'up', ['at', 'for', 'of'], 'hang up で「電話を切る」。'],
  ["I'm looking ___ to the weekend.", 'forward', ['front', 'after', 'over'], 'look forward to 〜 で「〜を楽しみにする」。'],
  ['We had to put ___ the meeting until next week.', 'off', ['up', 'down', 'away'], 'put off で「延期する」。'],
  ['Would you mind ___ the window?', 'opening', ['open', 'to open', 'opened'], 'mind のあとは -ing。Would you mind 〜ing? で「〜していただけませんか」。'],
  ["I'm used to ___ up early.", 'getting', ['get', 'got', 'gets'], 'be used to のあとは -ing（〜するのに慣れている）。'],
  ['I used to ___ in Osaka.', 'live', ['living', 'lived', 'lives'], 'used to + 動詞の原形で「前は〜していた」。'],
  ['Thank you for ___ me back.', 'calling', ['call', 'to call', 'called'], '前置詞 for のあとは -ing。'],
  ["I don't know what ___.", 'to say', ['saying', 'say', 'said'], 'what to 〜 で「何を〜すればいいか」。'],
  ["It's too noisy here. I can ___ hear you.", 'hardly', ['hard', 'harder', 'hardest'], 'hardly で「ほとんど〜ない」。hard（一生けんめい・かたい）とは意味がちがう。'],
  // ---------- 時・条件・つなぐ言葉 ----------
  ["I'll call you as soon as I ___ home.", 'get', ['will get', 'got', 'getting'], '時を表す as soon as のあとは、未来のことでも現在形。'],
  ["If it ___ tomorrow, we'll cancel the picnic.", 'rains', ['will rain', 'rained', 'raining'], '条件を表す if のあとは、未来のことでも現在形。'],
  ["Let's meet ___ noon on Saturday.", 'at', ['on', 'in', 'for'], '時刻（noon も）の前は at。'],
  ['The meeting is ___ Monday morning.', 'on', ['in', 'at', 'to'], '曜日のついた朝・夜（Monday morning）の前は on。'],
  ['Let me know ___ you can come on Saturday.', 'if', ['so', 'what', 'which'], '「〜かどうか」は if（whether も使える）。'],
  ['Do you know ___ the meeting starts?', 'what time', ['what', 'which', 'whose'], '「何時に〜するか」は what time + 主語 + 動詞。'],
  ['Neither Ken ___ Mia can come on Friday.', 'nor', ['or', 'and', 'but'], 'neither A nor B で「AもBも〜ない」。', 3],
  ['Not only Tom ___ also his sister came to the party.', 'but', ['and', 'or', 'so'], 'not only A but also B で「AだけでなくBも」。', 3],
];

export const ORDER = [
  ['あなたはここにどのくらい住んでいますか。', ['How long have you lived here?'], '「どのくらい（ずっと）〜していますか」は How long have you + 過去分詞?'],
  ['私はまだ昼ごはんを食べていません。', ["I haven't had lunch yet."], '「まだ〜していない」は haven\'t + 過去分詞 + yet。'],
  ['彼女は今朝からずっと電話で話しています。', ['She has been talking on the phone since this morning.', 'Since this morning she has been talking on the phone.'], 'ずっと続いていることは現在完了進行形（has been + -ing）。'],
  ['これは私が昨日買った本です。', ['This is the book I bought yesterday.'], '物を説明するとき、which / that は書かなくてもよい（the book I bought）。'],
  ['駅で私を待っている男の人は兄です。', ['The man waiting for me at the station is my brother.'], '「〜している人」は名詞 + -ing（the man waiting 〜）。'],
  ['母は私に部屋をそうじさせた。', ['My mother made me clean my room.'], 'make + 人 + 動詞の原形で「〜させる」。'],
  ['もし時間があれば、あなたと行くのに。', ['If I had time, I would go with you.', 'I would go with you if I had time.'], '今の事実とちがうことは仮定法過去（If + 過去形, would + 動詞の原形）。'],
  ['もっと上手に英語が話せたらいいのに。', ['I wish I could speak English better.'], 'I wish + could で「〜できたらいいのに」。'],
  ['会議を来週まで延期しましょう。', ["Let's put off the meeting until next week.", "Let's put the meeting off until next week."], 'put off で「延期する」。put the meeting off の順でもよい。'],
  ['金曜日は都合がいいですか。', ['Does Friday work for you?'], 'work for 〜 で「〜にとって都合がいい」。'],
  ['あとで折り返し電話してもいいですか。', ['Can I call you back later?'], 'call 〜 back で「〜に折り返し電話する」。'],
  ['彼に伝言を残してもいいですか。', ['Can I leave a message for him?'], 'leave a message for 〜 で「〜に伝言を残す」。'],
  ['何時に会うか決めましょう。', ["Let's decide what time to meet."], 'what time to 〜 で「何時に〜するか」。'],
  ['会えるのを楽しみにしています。', ["I'm looking forward to seeing you."], 'look forward to のあとは -ing。'],
  ['これは私たちが初めて会ったカフェです。', ['This is the café where we first met.'], '場所を説明して「そこで〜した」と続けるときは where。'],
  ['彼は私にパソコンを使わせてくれた。', ['He let me use his computer.'], 'let + 人 + 動詞の原形で「〜させてあげる」。'],
  ['私は髪を切ってもらった。', ['I had my hair cut.'], 'have + 物 + 過去分詞で「〜してもらう」。'],
  ['最近どうしていましたか。', ['What have you been up to lately?'], 'What have you been up to? で「（最近）何をしていたの？」。'],
  ['彼女がだれか知っていますか。', ['Do you know who she is?'], '文の中の疑問（間接疑問）は「疑問詞 + 主語 + 動詞」の順（who she is）。'],
  ['私は東京に3回行ったことがあります。', ['I have been to Tokyo three times.'], '「〜へ行ったことがある」は have been to。'],
  ['パーティーに来た人はみんな楽しんだ。', ['Everyone who came to the party had fun.'], '人を説明するときは who（Everyone who came 〜）。'],
  ['雨が降ったら、試合は中止になります。', ['If it rains, the game will be canceled.', 'The game will be canceled if it rains.'], '条件の if のあとは、未来のことでも現在形（rains）。'],
  ['電話をくれてありがとう。', ['Thank you for calling me.'], 'Thank you for のあとは -ing。'],
  ['その知らせを聞いておどろいた。', ['I was surprised to hear the news.'], 'be surprised to 〜 で「〜しておどろく」。'],
  ['彼女は話しやすい人です。', ['She is easy to talk to.'], 'easy to talk to で「話しやすい」（最後の to を忘れない）。'],
];
