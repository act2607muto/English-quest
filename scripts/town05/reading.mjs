/**
 * 5つ目の街（旅行と仕事）のリーディング 100問（50の文章 × 2問）。高3〜大学・TOEIC 750〜800 くらい。
 * この街から：記事（最初の行を「# 見出し」にすると見出しつきの記事のカード）と、いくつかの文書（「---」だけの行で区切ると
 * 「文書1」「文書2」…と並ぶ）。ほかに、メール（From:/To:/Subject:）・メッセージ（「名前: 本文」）・お知らせ・広告など。
 * いくつかの文書の問題は、2つの文書を読み合わせないと答えられない質問を入れる。
 * 2026-11-22 本人の希望で、質問も選択肢も英語にした（解説は日本語のまま）。
 * 形：[英文（改行は \n）, [[質問, 正解, 誤答3つ, 解説, 難しさ（書かなければ 3）], …]]
 */
export const READING = [
  // ---------- 記事 ----------
  ['# City Airport to Open New Terminal\nRiverton City Airport will open its new international terminal on April 1. The terminal has 20 new gates, a larger security area, and more than 40 shops and restaurants. Airport officials say waiting times at security should be cut in half. The old terminal will be used only for domestic flights.', [
    ['What is expected to happen at the new terminal?', 'Waiting times at security will be about half as long.', ['Only domestic flights will use it.', 'It will have 40 gates.', 'It will close on April 1.'], 'waiting times at security should be cut in half = 保安検査の待ち時間が半分になる見こみ。'],
    ['What will happen to the old terminal?', 'It will be used only for domestic flights.', ['It will be torn down.', 'It will become shops and restaurants.', 'It will be used only for international flights.'], 'The old terminal will be used only for domestic flights.'],
  ]],
  ['# More Companies Allow Remote Work\nA new survey shows that 62 percent of companies in the region now allow employees to work from home at least two days a week. Many workers say they save time and money on commuting. However, some managers worry that it is harder to build strong teams when people rarely meet in person.', [
    ['What did the survey show?', '62 percent of companies allow remote work at least two days a week.', ['62 percent of workers work from home every day.', 'One in five companies stopped remote work.', 'Most workers enjoy commuting.'], '62 percent of companies ... allow employees to work from home at least two days a week.'],
    ['What are some managers worried about?', 'It is harder to build strong teams when people rarely meet.', ['Commuting costs are rising.', 'Workers go home too early.', 'People work too long at home.'], 'it is harder to build strong teams when people rarely meet in person.'],
  ]],
  ['# Tourism Returns to Coastal Town\nAfter two quiet years, the small coastal town of Bayford welcomed a record 150,000 visitors last summer. Local businesses credit a new ferry service that connects the town with the capital in just 90 minutes. Hotel owners now hope to attract more visitors in the winter season as well.', [
    ['What do local businesses say brought more visitors?', 'A new ferry that reaches the capital in 90 minutes', ['A new airport', 'A winter festival', 'Lower hotel prices'], 'Local businesses credit a new ferry service that connects the town with the capital in just 90 minutes.'],
    ['What do hotel owners hope for?', 'More visitors in the winter too', ['Fewer summer visitors', 'Cheaper ferry tickets', 'New hotels'], 'Hotel owners now hope to attract more visitors in the winter season as well.'],
  ]],
  ['# Local Bakery Expands Overseas\nSunny Bread, a bakery that started in a small shop ten years ago, will open its first store abroad in Singapore this fall. The company now has 35 shops across the country. Its founder, Lisa Grant, says the secret of their success is using only local ingredients and baking everything fresh every morning.', [
    ['What is true about Sunny Bread?', 'It will open its first overseas store this fall.', ['It started in Singapore ten years ago.', 'It has ten shops in the country.', 'It uses only foreign ingredients.'], 'will open its first store abroad in Singapore this fall.'],
    ['According to the founder, what is the secret of their success?', 'Local ingredients and baking fresh every morning', ['Low prices', 'Large shops', 'A lot of advertising'], 'using only local ingredients and baking everything fresh every morning.'],
  ]],
  ['# Train Fares to Rise in July\nThe national railway announced that fares will increase by an average of 4 percent from July 1. The company says the extra money will be used to replace old trains and improve station facilities. Monthly passes for students will not be affected.', [
    ['What is true about the fare increase?', 'Fares will rise by an average of 4 percent from July 1.', ['Fares will rise by 7 percent from April 1.', 'Student passes will also cost more.', 'Only old trains will cost more.'], 'fares will increase by an average of 4 percent from July 1.'],
    ['How will the extra money be used?', 'To replace old trains and improve stations', ["To raise workers' pay", 'To build a new line', 'To make student passes cheaper'], 'used to replace old trains and improve station facilities.'],
  ]],
  ['# Hotel Chain Goes Plastic-Free\nThe Greenleaf hotel chain will stop providing single-use plastic items in all of its 80 hotels by the end of the year. Shampoo will come in large refillable bottles, and plastic water bottles will be replaced by free water stations on every floor. The chain expects to cut its plastic waste by 70 percent.', [
    ['How will guests get water at Greenleaf hotels?', 'From free water stations on every floor', ['From free plastic bottles', 'By buying it in their rooms', 'Only at the front desk'], 'plastic water bottles will be replaced by free water stations on every floor.'],
    ['What does the chain expect?', 'To cut its plastic waste by 70 percent', ['To increase its hotels to 80', 'To lower its room prices', 'To start selling shampoo'], 'expects to cut its plastic waste by 70 percent.'],
  ]],
  ['# Young People Choose Experiences Over Things\nAccording to a recent study, people in their twenties now spend more money on travel and concerts than on clothes or electronics. Researchers say social media plays a big role, since people enjoy sharing photos of their experiences. Travel companies are responding by offering short, low-cost trips for young customers.', [
    ['According to the study, what do people in their twenties spend more on?', 'Travel and concerts', ['Clothes and electronics', 'Houses and cars', 'Books and study'], 'spend more money on travel and concerts than on clothes or electronics.'],
    ['How are travel companies responding?', 'By offering short, low-cost trips for young people', ['By leaving social media', 'By raising prices for long trips', 'By holding concerts'], 'offering short, low-cost trips for young customers.'],
  ]],
  ['# Four-Day Work Week Trial a Success\nA software company in Dublin tested a four-day work week for six months. Employees worked 32 hours instead of 40 but received the same salary. The company reports that productivity stayed the same, while sick days fell by 25 percent. It has decided to continue the system permanently.', [
    ["What happened to employees' salaries during the trial?", 'They stayed the same.', ['They fell by 20 percent.', 'They were paid for four days only.', 'They went up.'], 'received the same salary.'],
    ['What did the company decide?', 'To keep the four-day week permanently', ['To return to a five-day week', 'To test it for six more months', 'To recommend it to other companies'], 'It has decided to continue the system permanently.'],
  ]],
  // ---------- いくつかの文書 ----------
  ['From: Anna Ruiz\nTo: Front Desk, Lakeside Inn\nSubject: Late arrival\nHello,\nI have a reservation for May 14. My flight lands at 11 p.m., so I will probably arrive at the hotel around midnight. Will someone be at the front desk?\nAnna Ruiz\n---\nFrom: Front Desk, Lakeside Inn\nTo: Anna Ruiz\nSubject: Re: Late arrival\nDear Ms. Ruiz,\nOur front desk is open until 11 p.m. After that, please use the key box next to the entrance. Your code is 4471. We look forward to your stay.', [
    ['About what time will Anna arrive at the hotel?', 'Around midnight', ['Around 11 p.m.', 'Around 4 a.m.', 'Around 5 p.m.'], 'I will probably arrive at the hotel around midnight.'],
    ['How will Anna get her room key?', 'From the key box next to the entrance', ['From the front desk staff', 'At the airport', 'At the front desk the next morning'], 'フロントは11時まで。アンナは12時ごろ着くので、After that, please use the key box next to the entrance.'],
  ]],
  ['# Summer Tour Prices\nCity Bus Tour: $25 (2 hours)\nCastle and Garden Tour: $40 (half day, lunch not included)\nWine Country Tour: $85 (full day, lunch included)\nAll tours: 10% off for groups of 5 or more.\n---\nKen: Hi Mia! For Saturday, I think the Castle and Garden Tour looks fun.\nMia: Me too. There will be six of us, right?\nKen: Yes. And we can eat lunch in town after the tour.', [
    ["What is the regular price per person for the tour Ken chose?", '$40', ['$25', '$85', '$36'], 'Castle and Garden Tour: $40'],
    ["What is true about the price of Ken's group tour?", 'They will get 10% off because there are six people.', ['Lunch is included.', 'There is no discount for up to five people.', 'It finishes in two hours.'], 'There will be six of us. 5人以上は10% off なので割引になる。'],
  ]],
  ['Notice: Office Move\nFrom Monday, June 3, the Sales Department will move from the 2nd floor to the 5th floor, Room 502. Phone numbers will not change.\n---\nFrom: Tom Reed\nTo: Sales Team\nSubject: Packing\nHi team,\nPlease pack your desks by Friday afternoon. Boxes are in the storage room on the 2nd floor. The movers will come on Saturday morning.\nTom', [
    ['Where will the Sales Department be after the move?', 'Room 502 on the 5th floor', ['Room 502 on the 2nd floor', 'Room 205 on the 5th floor', 'Next to the storage room'], 'will move from the 2nd floor to the 5th floor, Room 502.'],
    ['By when must the team pack their desks?', 'By Friday afternoon, before the move', ['By Monday, June 3', 'By Saturday morning', 'By the Friday after the move'], 'Please pack your desks by Friday afternoon. 引っこし業者は土曜日、新しい場所は6月3日の月曜日から。'],
  ]],
  ['# Job Opening: Hotel Receptionist\nThe Seaview Hotel is looking for a full-time receptionist. Requirements: at least two years of experience in customer service, good English skills. Experience with booking software is a plus. Apply by March 31.\n---\nFrom: Jun Park\nTo: Seaview Hotel\nSubject: Receptionist position\nDear Hiring Manager,\nI am writing to apply for the receptionist position. I have worked at a café for three years, and I am familiar with several booking systems from my previous job at a travel agency.', [
    ['What is required for this job?', 'Two or more years of customer service experience and good English', ['Experience with booking software', 'Experience working at a hotel', 'Three or more years at a travel agency'], 'Requirements: at least two years of experience in customer service, good English skills. 予約ソフトは「あればなおよい」（a plus）。'],
    ['What is true about Jun?', 'He has the required experience and has also used booking systems.', ['He has less than two years of customer service experience.', 'He worked at a hotel for three years.', 'He applied after the deadline.'], 'カフェで3年（接客の経験）、旅行会社で予約システムを使った。'],
  ]],
  ['Conference Schedule – Day 1\n9:00 Opening speech (Hall A)\n10:00 Workshop: Social Media Marketing (Room 3)\n12:00 Lunch (Cafeteria)\n13:30 Panel: The Future of Travel (Hall A)\n---\nFrom: Conference Office\nTo: All Participants\nSubject: Change\nDue to the speaker\'s travel delay, the workshop on social media marketing will start one hour later than planned. It will be held in Room 5 instead.', [
    ['What time will the workshop start?', '11:00', ['10:00', '9:00', '13:30'], '予定は10:00。one hour later than planned なので11時。'],
    ['Where will the workshop be held?', 'Room 5', ['Room 3', 'Hall A', 'The cafeteria'], 'It will be held in Room 5 instead.'],
  ]],
  ['From: Kate Wilson\nTo: Daniel Cho\nSubject: Order #5521\nHi Daniel,\nWe would like to order 300 notebooks. Could you tell us the price? We need them by October 10.\nKate\n---\nFrom: Daniel Cho\nTo: Kate Wilson\nSubject: Re: Order #5521\nHi Kate,\nThe price is $2 per notebook, but orders over 250 get a 10% discount. We can deliver by October 8.\nDaniel', [
    ["What will be the price per notebook for Kate's order?", '$1.80', ['$2.00', '$2.20', '$1.00'], '1冊2ドル。250冊をこえる注文は10%引きなので1ドル80セント。'],
    ['What is true about the delivery?', 'It will arrive before Kate needs it.', ['It will be too late.', 'It will arrive exactly on October 10.', 'The date has not been decided.'], 'ケイトは10月10日までに必要。ダニエルは10月8日までに届けられる。'],
  ]],
  ['Lost & Found Report – Central Station\nItem: Black backpack with a red tag\nFound: Platform 4, June 12, 6:40 p.m.\nNow kept at: Station office (open 7 a.m. – 9 p.m.)\n---\nLisa: Hi! I think they found my backpack at Central Station!\nOmar: Great! Are you going to get it tonight?\nLisa: It\'s already 9:30, so I\'ll go tomorrow morning before work.', [
    ['Where was the backpack found?', 'On Platform 4', ['In the station office', 'On a train', 'At the station entrance'], 'Found: Platform 4.'],
    ['Why will Lisa not get it tonight?', 'The office is already closed.', ['She has to work.', 'The backpack is a different color.', 'Omar will get it.'], '事務所は午後9時まで。今はもう9時30分。'],
  ]],
  ['# Riverside Hotel – Room Rates\nStandard room: $120 per night\nDeluxe room (river view): $160 per night\nBreakfast: $15 per person\nStay 3 nights or more and get breakfast free!\n---\nFrom: Paul Green\nTo: Riverside Hotel\nSubject: Booking\nHello,\nI would like to book a deluxe room for two nights, June 5 to 7, for my wife and me. We would also like breakfast both days.', [
    ['How much is the room Paul wants per night?', '$160', ['$120', '$175', '$15'], 'Deluxe room (river view): $160 per night'],
    ["What is true about Paul's breakfast?", 'It is not free because he is staying only two nights.', ['It is free because he is staying three nights.', 'It is free for one person.', 'His room does not offer breakfast.'], '3泊以上で無料。ポールは2泊なので、1人15ドルかかる。'],
  ]],
  ['Memo\nTo: All Staff\nFrom: Human Resources\nThe annual health check will take place on September 18 and 19 in Meeting Room B. Please sign up for a time slot online by September 10.\n---\nFrom: Rina Sato\nTo: Human Resources\nSubject: Health check\nHello,\nI will be on a business trip from September 17 to 20. Is it possible to take the health check on another day?\nRina', [
    ['What is the deadline to sign up for the health check?', 'September 10', ['September 18', 'September 17', 'September 20'], 'Please sign up for a time slot online by September 10.'],
    ['Why is Rina asking for another day?', 'She will be on a business trip during the health check.', ['Meeting Room B is not available.', 'She forgot to sign up.', 'She is not feeling well.'], '健康診断は9月18・19日。リナは17日から20日まで出張。'],
  ]],
  ['Sale! 20% off all suitcases this weekend only (Saturday and Sunday).\nMembers get an extra 5% off.\n---\nMax: I bought a new suitcase yesterday. It was 20% off!\nYuki: Lucky you! Did you get the member discount too?\nMax: No, I forgot my member card at home.', [
    ['When did Max buy the suitcase?', 'On the weekend (Saturday or Sunday)', ['On the Friday before the weekend', 'The day before the sale', 'On Monday'], '「昨日」買って20% offだった。セールは土日だけなので、昨日は週末。'],
    ['What discount did Max get?', '20%', ['25%', '5%', 'None'], '会員カードを忘れたので、会員の5%は受けていない。'],
  ]],
  ['From: Grand Tours\nTo: Customers\nSubject: Tour change\nDue to road construction, our Mountain Lake Tour on July 22 will take a different route. The tour will now take 30 minutes longer and return at 6:30 p.m. instead of 6:00 p.m.\n---\nSue: My train home leaves at 6:45 p.m. from the station near the tour office.\nTim: That will be tight! The office is a ten-minute walk from the station.', [
    ['Why will the tour take longer?', 'It will take a different road because of construction.', ['There will be a long break at the lake.', 'It will start late.', 'There will be many people.'], 'Due to road construction ... will take a different route.'],
    ['Why does Tim say "That will be tight"?', 'The tour ends at 6:30, the walk takes ten minutes, and the train leaves at 6:45.', ['The tour ends at 6:00.', 'The station is too far from the tour office.', "Sue's train leaves at 6:30."], '6:30に終わって駅まで10分、電車は6:45。'],
  ]],
  ['Shuttle Bus Timetable (Airport → City Center)\nDeparts: 7:00, 7:40, 8:20, 9:00 (every 40 minutes until 22:20)\nTravel time: about 35 minutes\nFare: $8 (pay the driver, cash only)\n---\nMessage from Emma: My plane lands at 8:00. After getting my bag, I should be at the bus stop by 8:15.', [
    ['What is the earliest bus Emma can take?', 'The 8:20 bus', ['The 8:00 bus', 'The 7:40 bus', 'The 9:00 bus'], '8:15にバス停に着くので、次は8:20。'],
    ['About what time will Emma arrive in the city center?', 'Around 8:55', ['Around 8:35', 'Around 9:20', 'Around 8:20'], '8:20に出て、35分くらいかかる。'],
  ]],
  // ---------- メール ----------
  ['From: Laura Kim\nTo: Marketing Team\nSubject: Budget for next year\nHi everyone,\nThank you for sending your ideas for next year\'s campaigns. Unfortunately, our budget has been cut by 15 percent, so we will not be able to do all of them. Please choose your top two ideas and send them to me by Wednesday. We will discuss them at Friday\'s meeting.\nLaura', [
    ['What should the team members do?', 'Choose their top two ideas and send them by Wednesday', ['Rewrite all their ideas', 'Increase the budget by 15 percent', 'Send fifteen ideas by Friday'], 'Please choose your top two ideas and send them to me by Wednesday.'],
    ['Why can they not do all of the ideas?', 'The budget has been cut by 15 percent.', ['There is not enough time.', 'The ideas are not good.', 'There are not enough people.'], 'our budget has been cut by 15 percent.'],
  ]],
  ['From: Customer Service, ShopNow\nTo: Mr. Hill\nSubject: Your return\nDear Mr. Hill,\nWe have received the jacket you returned. Since it was returned within 30 days and has not been worn, you will receive a full refund. The money will be sent to your credit card within 5 to 7 business days.', [
    ['Why will Mr. Hill get a full refund?', 'He returned it within 30 days and did not wear it.', ['The jacket was broken.', 'He is a member.', 'The shop sent the wrong item.'], 'returned within 30 days and has not been worn.'],
    ['How will the money be returned?', 'To his credit card within 5 to 7 business days', ['In cash right away', 'To his bank account after 30 days', 'As shop points'], 'sent to your credit card within 5 to 7 business days.'],
  ]],
  ['From: Mark Evans\nTo: Jenny Lim\nSubject: Thank you\nDear Jenny,\nThank you for showing me around your factory last week. I was very impressed by how clean and efficient it is. I have shared your proposal with my manager, and we would like to discuss a possible contract. Would you be available for a video call next Tuesday?\nBest regards,\nMark', [
    ['Why did Mark write this email?', 'To thank Jenny for the tour and ask to talk about a contract', ['To turn down a contract', 'To ask for a factory tour', 'To show Jenny his own factory'], 'Thank you for showing me around ... we would like to discuss a possible contract.'],
    ['What did Mark think of the factory?', 'It was clean and efficient.', ['It was old and small.', 'It was far and inconvenient.', 'It had too many people.'], 'impressed by how clean and efficient it is.'],
  ]],
  ['From: Westside Rail\nTo: Pass Holders\nSubject: Important: Card renewal\nDear Customer,\nYour monthly pass will expire on March 31. To avoid any interruption, please renew it online or at any ticket machine before that date. Renewing online gives you 50 bonus points.', [
    ['What should the reader do?', 'Renew the pass before March 31', ['Pick up a new card on March 31', 'Use their points', 'Cancel the pass'], 'please renew it ... before that date.'],
    ['What happens if you renew online?', 'You get 50 bonus points.', ['You get 50 percent off.', 'You get one free month.', 'It arrives faster.'], 'Renewing online gives you 50 bonus points.'],
  ]],
  ['From: Olivia Brown\nTo: All Team Members\nSubject: Farewell lunch for James\nHi everyone,\nAs you know, James is retiring at the end of this month after 25 years with the company. We are planning a farewell lunch on Friday, the 28th, at Bella Italia. Please let me know by Monday if you can come. We are also collecting money for a gift – $10 per person.\nOlivia', [
    ['What is true about James?', 'He is retiring this month after 25 years.', ['He is turning 25.', 'He is moving to another company.', 'He is joining next month.'], 'James is retiring ... after 25 years with the company.'],
    ['What should people who want to come do?', 'Tell Olivia by Monday and give $10 for a gift', ['Pay $25 by Friday', 'Book the restaurant themselves', 'Each buy their own gift'], 'let me know by Monday ... $10 per person.'],
  ]],
  ['From: Dr. Hassan\'s Clinic\nTo: Mr. Tanaka\nSubject: Appointment reminder\nThis is a reminder that you have an appointment on Thursday, May 9, at 10:30 a.m. Please arrive 15 minutes early to fill out a form. If you need to cancel, please call us at least one day in advance, or a fee of $20 will be charged.', [
    ['What time should Mr. Tanaka arrive?', '10:15 a.m.', ['10:30 a.m.', '10:45 a.m.', '9:30 a.m.'], '10:30の予約で、15分早く来るように。'],
    ['When will there be a fee?', 'If he cancels without calling at least a day before', ['If he is 15 minutes late', 'If he does not fill out the form', 'If he comes on Thursday'], 'call us at least one day in advance, or a fee of $20 will be charged.'],
  ]],
  ['From: Chris Wong\nTo: Amy Park\nSubject: Re: Proposal draft\nHi Amy,\nI read your draft. The design section is excellent, but I think the cost estimate is too optimistic. Shipping prices have gone up recently, so please check the latest rates and update the figures. Everything else looks ready.\nChris', [
    ['Which part does Chris want Amy to change?', 'The cost estimate', ['The design section', 'The whole draft', 'The delivery address'], 'the cost estimate is too optimistic ... update the figures.'],
    ['Why does Chris think the estimate is too optimistic?', 'Shipping prices have gone up recently.', ['The design is expensive.', 'Materials have become cheaper.', 'There are fewer orders.'], 'Shipping prices have gone up recently.'],
  ]],
  ['From: Hotel Belmont\nTo: Guests\nSubject: Your upcoming stay\nDear Guest,\nWe look forward to welcoming you. Please note that our parking lot is under construction until the end of the month. Guests arriving by car can use the public parking garage across the street at a 50% discount by showing their room key.', [
    ['Where should guests with cars park?', 'In the public parking garage across the street', ["In the hotel's parking lot", 'At the station parking lot', 'On the street behind the hotel'], 'can use the public parking garage across the street.'],
    ['How can guests get the discount?', 'By showing their room key', ['By showing their booking email', 'By waiting until the end of the month', 'By asking at the front desk'], 'at a 50% discount by showing their room key.'],
  ]],
  ['From: IT Support\nTo: All Employees\nSubject: System update this weekend\nOur email system will be updated on Saturday from 10 p.m. to Sunday 6 a.m. During this time, you will not be able to send or receive emails. If you have urgent business, please use the phone. No action is needed from you.', [
    ['What will people NOT be able to do during the update?', 'Send or receive emails', ['Make phone calls', 'Use their computers', 'Enter the office'], 'you will not be able to send or receive emails.'],
    ['What do employees need to do?', 'Nothing in particular', ['Change their passwords', 'Turn off their computers', 'Come to work on Saturday'], 'No action is needed from you.'],
  ]],
  ['From: Sophie Martin\nTo: Event Team\nSubject: Venue for the product launch\nHi all,\nWe have two options for the product launch venue. The Crystal Hall holds 300 people and costs $5,000. The Park Pavilion holds 150 people and costs $2,500, but it is outdoors. Since we expect about 200 guests and the event is in November, I recommend the Crystal Hall.\nSophie', [
    ['Why does Sophie recommend the Crystal Hall?', 'About 200 guests are expected and it will be cold outside in November.', ['It is cheaper.', 'About 150 guests are expected.', 'She wants an outdoor event.'], 'パーク・パビリオンは150人まで、しかも外。200人の客、11月の行事。'],
    ['What is true about the Park Pavilion?', 'It costs half as much as the Crystal Hall.', ['It holds 300 people.', 'It is indoors.', 'It costs $5,000.'], '$2,500 は $5,000 の半分。'],
  ]],
  // ---------- メッセージ ----------
  ["Nina: Hi Leo, are you still at the office?\nLeo: Yes, I'm finishing the sales report.\nNina: Could you bring the client files to tomorrow's meeting? I left them on my desk.\nLeo: Sure. Which client?\nNina: Greenway Foods. The blue folder.", [
    ['What does Nina ask Leo to do?', "Bring the client files to tomorrow's meeting", ['Write the sales report', 'Clean her desk', 'Call the client'], "Could you bring the client files to tomorrow's meeting?"],
    ['What is true about the files?', "They are in a blue folder on Nina's desk.", ["They are on Leo's desk.", 'They are in the meeting room.', 'They are in a red folder.'], 'I left them on my desk ... The blue folder.'],
  ]],
  ["Ben: Our flight to Rome is canceled!\nCara: Oh no. Did they offer another flight?\nBen: Yes, tomorrow at 9 a.m. They'll pay for a hotel near the airport tonight.\nCara: That's not bad. Should I cancel our first night in Rome?\nBen: Yes, please. We'll arrive there around noon tomorrow.", [
    ['What will the airline provide?', "A flight tomorrow and tonight's hotel near the airport", ['Another flight tonight', 'Only a full refund', 'A hotel in Rome'], 'tomorrow at 9 a.m. ... pay for a hotel near the airport tonight.'],
    ['What will Cara do?', 'Cancel their first night in Rome', ['Book a hotel near the airport', "Cancel tomorrow's flight", 'Go to Rome first'], 'Should I cancel our first night in Rome? / Yes, please.'],
  ]],
  ["Manager: Hi Sam, the client wants to move our meeting to 3 p.m. today. Can you make it?\nSam: I have a dentist appointment at 2, but I should be back by 3:30.\nManager: OK. I'll start the meeting, and you can join when you get back.", [
    ["Why can't Sam be at the meeting at 3?", 'He has a dentist appointment at 2.', ['He is meeting a client.', 'He has another meeting.', 'He is going out at 3:30.'], 'I have a dentist appointment at 2.'],
    ['What will happen with the meeting?', 'The manager will start it, and Sam will join later.', ['It will start at 3:30.', 'It will be moved to tomorrow.', 'Sam will start it.'], "I'll start the meeting, and you can join when you get back."],
  ]],
  ["Ava: Are you going to the trade fair next week?\nJoe: Only on Thursday. I have to stay in the office on Friday.\nAva: Me too, Thursday only. Shall we take the 8 o'clock train together?\nJoe: Sounds good. I'll book the tickets.", [
    ['What is true about Ava and Joe?', 'Both are going to the fair only on Thursday.', ['Both are going on Friday.', 'Only Joe is going.', 'Both are going on both days.'], 'Only on Thursday. / Me too, Thursday only.'],
    ['What will Joe do?', 'Book the tickets', ['Stay in the office', 'Cancel the fair', 'Call at 8'], "I'll book the tickets."],
  ]],
  ["Hana: The hotel says our room has a view of the old town, not the sea.\nKai: But we paid for a sea view!\nHana: They're full tonight, but they'll move us tomorrow and give us free breakfast.\nKai: OK, that's fair.", [
    ["What is true about tonight's room?", 'It has a view of the old town, not the sea.', ['It has a sea view.', 'It has no window.', 'It does not include breakfast.'], 'our room has a view of the old town, not the sea.'],
    ['What did the hotel offer?', 'To move them tomorrow and give them free breakfast', ['To move them right away tonight', 'To give them a full refund', 'To find them another hotel'], "they'll move us tomorrow and give us free breakfast."],
  ]],
  ["Ella: I'm stuck in traffic. I might be 20 minutes late for the interview.\nRyan: Don't worry. I'll let the manager know. Just come straight to the 4th floor when you arrive.\nElla: Thank you so much!", [
    ['Why might Ella be late?', 'She is stuck in traffic.', ['She got lost.', 'Her train stopped.', 'She forgot her papers.'], "I'm stuck in traffic."],
    ['What will Ryan do?', 'Tell the manager', ['Cancel the interview', 'Go and pick Ella up', 'Move the interview to tomorrow'], "I'll let the manager know."],
  ]],
  // ---------- お知らせ・広告・案内 ----------
  ['Welcome to the National Museum\nOpening hours: 9:00–17:00 (closed Mondays)\nLate opening on Fridays until 20:00\nAdmission: Adults $15, Students $8, Children under 12 free\nAudio guides are available in 8 languages for $3.', [
    ['What time does the museum close on Fridays?', '8 p.m.', ['5 p.m.', '6 p.m.', '9 p.m.'], 'Late opening on Fridays until 20:00.'],
    ['How much is admission for a ten-year-old child?', "It's free.", ['$8', '$3', '$15'], 'Children under 12 free.'],
  ]],
  ['NOTICE TO GUESTS\nThe hotel swimming pool will be closed from June 1 to June 7 for maintenance. During this period, guests may use the pool at our partner hotel, the Plaza, free of charge. Please show your room key at the Plaza reception.', [
    ['What can guests do while the pool is closed?', "Use the partner hotel's pool for free", ['Get their money back', 'Use the gym for free', 'Use part of the pool'], 'guests may use the pool at our partner hotel, the Plaza, free of charge.'],
    ['What must guests do at the Plaza?', 'Show their room key', ['Make a reservation', 'Pay a fee', 'Rent a swimsuit'], 'Please show your room key at the Plaza reception.'],
  ]],
  ['Careful Travel Insurance\nCovers: medical costs, lost or stolen luggage, flight cancellations\nDoes not cover: injuries from extreme sports, items left unattended in public places\nTo make a claim, contact us within 14 days of returning home.', [
    ['What is NOT covered by this insurance?', 'Items stolen after being left alone in a public place', ['Flight cancellations', 'Hospital costs', 'Stolen luggage'], 'Does not cover: items left unattended in public places.'],
    ['By when must you make a claim?', 'Within 14 days of coming home', ['Before the trip', 'During the trip', 'Within a month of coming home'], 'contact us within 14 days of returning home.'],
  ]],
  ['Staff Wanted – Summer Season\nBlue Bay Resort is hiring tour guides and restaurant staff for July and August.\n- Free accommodation and meals\n- Must speak English; a second language is an advantage\n- Weekend work required\nSend your CV to jobs@bluebay.example by May 15.', [
    ['What is true about these jobs?', 'Housing and meals are free.', ['They last one year.', 'Weekends are off.', 'You must speak two languages.'], 'Free accommodation and meals.'],
    ['How do you apply?', 'Email your CV by May 15', ['Visit in person in July', 'Apply by phone', 'Have an interview on May 15'], 'Send your CV ... by May 15.'],
  ]],
  ['Meeting Room Rules\n1. Book rooms through the online calendar at least one day in advance.\n2. If you finish early, please cancel the rest of your booking.\n3. Clean the whiteboard and take your trash with you.\n4. Food is not allowed, but drinks are OK.', [
    ['What are you allowed to do in the meeting rooms?', 'Have drinks', ['Eat food', 'Book a room on the same day', 'Leave your trash'], 'Food is not allowed, but drinks are OK.'],
    ['What should you do if you finish early?', 'Cancel the rest of your booking', ['Tell the next group', 'Keep using the room', 'Call the reception desk'], 'If you finish early, please cancel the rest of your booking.'],
  ]],
  ['Coffee & Co. Loyalty Card\nGet one stamp for every drink you buy. Collect 10 stamps and get a free drink of any size. Stamps expire after 6 months. Cards cannot be shared or exchanged for cash.', [
    ['How can you get a free drink?', 'Collect 10 stamps', ['Visit for six months', 'Buy a large size', 'Collect two cards'], 'Collect 10 stamps and get a free drink.'],
    ['What is true about the card?', 'Stamps expire after six months.', ['It can be shared with others.', 'It can be exchanged for cash.', 'Stamps never expire.'], 'Stamps expire after 6 months.'],
  ]],
  ['City Marathon – Road Closures\nOn Sunday, October 6, the following roads will be closed from 6 a.m. to 2 p.m.: Main Street, River Road, and Park Avenue. Buses will take different routes. Residents are advised to use the subway, which will run extra trains in the morning.', [
    ['When will the roads be closed?', 'From 6 a.m. to 2 p.m. on Sunday', ['All day Saturday', 'From 2 p.m. on Sunday', 'On Monday morning'], 'On Sunday, October 6, ... from 6 a.m. to 2 p.m.'],
    ['What are residents advised to do?', 'Use the subway', ['Use the bus', 'Drive their cars', 'Stay at home'], 'Residents are advised to use the subway.'],
  ]],
  ['SkyHigh Airlines – Baggage Policy\nEconomy: one checked bag up to 23 kg\nBusiness: two checked bags up to 32 kg each\nExtra bags: $60 each\nBags over the weight limit: $75 each', [
    ['What happens if an economy passenger checks a second bag?', 'It costs $60.', ['It costs $75.', 'It is free.', 'It is not allowed.'], 'Extra bags: $60 each.'],
    ['What can business class passengers check?', 'Two bags of up to 32 kg each', ['One bag of up to 23 kg', 'One bag of up to 32 kg', 'Any number of bags for free'], 'two checked bags up to 32 kg each.'],
  ]],
  ['Online Course: Business English for Beginners\nStart date: April 10\nLength: 8 weeks (two 60-minute live lessons per week)\nPrice: $240 ($200 if you register by March 31)\nAll lessons are recorded, so you can watch them later if you miss one.', [
    ['How much will it cost if you register on March 20?', '$200', ['$240', '$120', '$40'], '3月31日までに申しこむと200ドル。'],
    ['What can you do if you miss a lesson?', 'Watch the recording later', ['Take two lessons the next week', 'Get your money back', 'Nothing, because it cannot be retaken'], 'All lessons are recorded, so you can watch them later.'],
  ]],
  ['Parking Information – Seaside Office Park\nVisitors: Park in the area marked "V" near the main entrance. Parking is free for up to 3 hours. Register your car number at the reception desk on arrival.\nEmployees: Use the underground parking. Monthly fee: $50.', [
    ['What should visitors do?', 'Register their car number at the reception desk when they arrive', ['Pay $50 a month', 'Park underground', 'Move their car every three hours'], 'Register your car number at the reception desk on arrival.'],
    ['What is true about visitor parking?', 'It is free for up to three hours.', ['It is free all day.', 'It costs $50 an hour.', 'Visitors cannot park there.'], 'Parking is free for up to 3 hours.'],
  ]],
  ['Language Exchange Café\nEvery Wednesday 7–9 p.m. at Library Café\nPractice English, Spanish, or Japanese with native speakers.\nFree for library members; $5 for others (includes one drink).\nNo booking needed – just drop in!', [
    ['What do you need to do to join?', 'Nothing special — you can just come without booking.', ['Book the day before', 'Become a library member', 'Buy two $5 drinks'], 'No booking needed – just drop in!'],
    ['What is true for people who are not members?', 'It costs $5, and one drink is included.', ['They can join for free.', 'They cannot join.', 'It costs $7.'], '$5 for others (includes one drink).'],
  ]],
  ['Pine Valley Campsite – Rules\n- Check-in after 2 p.m.; check-out by 11 a.m.\n- Quiet hours: 10 p.m. to 7 a.m.\n- Campfires only in the fire pits provided.\n- Pets are welcome but must be kept on a leash.', [
    ['When must campers be quiet?', 'From 10 p.m. to 7 a.m.', ['From 2 p.m. to 11 p.m.', 'All day', 'From 7 a.m. to 10 p.m.'], 'Quiet hours: 10 p.m. to 7 a.m.'],
    ['What is true about pets?', 'They can come if they are kept on a leash.', ['They are not allowed.', 'They can run freely.', 'There is an extra fee for them.'], 'Pets are welcome but must be kept on a leash.'],
  ]],
  ['# Night Trains Make a Comeback\nAfter years of decline, overnight trains are becoming popular again in Europe. Many travelers say they choose night trains because they produce far less carbon than flights. Others like the fact that they save the cost of one night in a hotel. Several new routes, including Paris to Berlin, started this year.', [
    ['According to the article, why do travelers choose night trains?', 'They produce much less carbon than flights.', ['They are faster than flights.', 'Meals are free on board.', 'Tickets are half the price of flights.'], 'they produce far less carbon than flights（飛行機よりずっと炭素が少ない）。ほかに、ホテル1泊分がうくこと。'],
    ['Which route is given as an example of a new route?', 'Paris to Berlin', ['Berlin to Rome', 'Paris to London', 'London to Berlin'], 'Several new routes, including Paris to Berlin, started this year.'],
  ]],
  ['From: Office Manager\nTo: All Staff\nSubject: New coffee machine\nWe have installed a new coffee machine in the kitchen on the 3rd floor. Coffee is free, but please bring your own cup, as paper cups will no longer be provided.\n---\nLiam: Did you see the new coffee machine?\nZoe: Yes! But I had to buy a cup at the shop downstairs.\nLiam: Me too. I forgot to bring mine from home.', [
    ['What is true about the new coffee machine?', 'The coffee is free, but you need your own cup.', ['The coffee costs money, and paper cups are provided.', 'It is in the kitchen on the 1st floor.', 'Only paper cups can be used.'], 'Coffee is free, but please bring your own cup.'],
    ['Why did Zoe and Liam buy cups?', 'Paper cups are no longer provided.', ['The coffee is no longer free.', 'Their cups broke.', 'The machine only works with new cups.'], 'paper cups will no longer be provided.'],
  ]],
];
