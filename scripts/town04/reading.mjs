/**
 * 4つ目の街（予定・電話・雑談）のリーディング 80問。メール（From:/To:/Subject: で始めるとメールのカードで出る）、
 * スマホのメッセージ（「名前: 本文」の行で書くと吹き出しで出る）、張り紙・伝言メモ・予定表など。
 * 2026-11-22 本人の希望で、質問も選択肢も英語にした（解説は日本語のまま）。
 * 形：[英文（改行は \n）, [[質問, 正解, 誤答3つ, 解説, 難しさ（書かなければ 3）], …]]
 */
export const READING = [
  // ---------- メール ----------
  ["From: Sarah Lee\nTo: Tom Baker\nSubject: Lunch on Friday\nHi Tom,\nAre you free for lunch on Friday? There's a new Thai restaurant near the office. How about 12:30?\nSarah", [
    ['What does Sarah suggest?', 'Having lunch at a Thai restaurant at 12:30 on Friday', ['Having dinner at a Thai restaurant on Friday night', 'Having lunch at 12:30 on Monday', 'Having lunch in the office'], 'Are you free for lunch on Friday? … How about 12:30?'],
    ['What is true about the Thai restaurant?', 'It is new and near the office.', ['It is old and near the station.', "It is Tom's favorite restaurant.", 'It is closed on Fridays.'], "There's a new Thai restaurant near the office."],
  ]],
  ["From: Tom Baker\nTo: Sarah Lee\nSubject: Re: Lunch on Friday\nHi Sarah,\nI'd love to, but I have a client meeting until one. Could we meet at 1:15 instead?\nTom", [
    ["What is Tom's answer?", 'He wants to go, but at 1:15.', ['He cannot go, so he wants another day.', '12:30 is fine for him.', 'He wants to bring a client.'], "I'd love to, but … Could we meet at 1:15 instead?"],
    ['Why is Tom busy until one?', 'He has a meeting with a client.', ['He has to make a phone call.', 'He has to write a report.', 'He is eating lunch.'], 'I have a client meeting until one.'],
  ]],
  ['From: City Library\nTo: Members\nSubject: Holiday hours\nThe library will be closed on May 3 and 4. We will open again on May 5 at 9 a.m. Books due on those days can be returned on May 5 without a late fee.', [
    ['When will the library be closed?', 'On May 3 and 4', ['On May 4 and 5', 'Only on May 3', 'On May 5'], 'closed on May 3 and 4'],
    ['What about books that are due on the closed days?', 'They can be returned on May 5 with no late fee.', ['They must be returned by May 2.', 'There will be a late fee.', 'They do not need to be returned.'], 'can be returned on May 5 without a late fee'],
  ]],
  ['From: Mike Johnson\nTo: Project Team\nSubject: Meeting moved\nHi all,\nTomorrow\'s meeting has been moved from 10 a.m. to 2 p.m. because the room is not available in the morning. The place is the same, Room 5B.\nThanks,\nMike', [
    ['What happened to the meeting?', 'It was moved from 10 a.m. to 2 p.m.', ['It was moved from 2 p.m. to 10 a.m.', 'It was moved to the day after tomorrow.', 'It was canceled.'], 'moved from 10 a.m. to 2 p.m.'],
    ['Why was it changed?', 'The room is not available in the morning.', ['Mike is busy in the morning.', 'Some team members cannot come.', 'The room changed to 5B.'], 'because the room is not available in the morning'],
  ]],
  ['From: Green Hotel\nTo: Ms. Kato\nSubject: Your reservation\nDear Ms. Kato,\nThank you for booking with us. Your room is reserved for two nights, from June 10 to June 12. Check-in is from 3 p.m. Breakfast is included.', [
    ['How many nights is the reservation for?', 'Two nights', ['Three nights', 'One night', 'Ten nights'], 'for two nights'],
    ['What is true about the reservation?', 'Breakfast is included.', ['Check-in is from 1 p.m.', 'Ms. Kato arrives on June 12.', 'Breakfast costs extra.'], 'Breakfast is included.'],
  ]],
  ["From: Anna\nTo: Ken\nSubject: Thank you!\nHi Ken,\nThanks so much for the birthday present. I've always wanted a scarf like this! Let's get together soon.\nAnna", [
    ['Why did Anna write this email?', 'To thank Ken for a birthday present', ['To invite Ken to a birthday party', 'To give a scarf back', 'To change the day they meet'], 'Thanks so much for the birthday present.'],
    ['What did Anna get?', 'A scarf', ['A bag', 'Gloves', 'A hat'], "I've always wanted a scarf like this!"],
  ]],
  ['From: ABC Dental Clinic\nTo: Mr. Wilson\nSubject: Appointment reminder\nThis is a reminder of your appointment on Tuesday, March 8, at 4:00 p.m. If you need to change the time, please call us at least 24 hours before.', [
    ['What is the purpose of this email?', 'To remind Mr. Wilson of his appointment', ['To cancel the appointment', 'To introduce a new dentist', 'To tell him the price'], 'reminder = 忘れないように知らせるもの。'],
    ['What should Mr. Wilson do to change the time?', 'Call at least 24 hours before', ['Send an email on the day', 'Call 24 hours after', 'Go to the clinic in person'], 'please call us at least 24 hours before'],
  ]],
  ['From: HR Department\nTo: All Staff\nSubject: New office hours\nStarting next month, the office will open at 8:30 a.m. instead of 9 a.m. The closing time will not change.', [
    ['What will change next month?', 'The office will open 30 minutes earlier.', ['The office will close earlier.', 'The office will open 30 minutes later.', 'The office will also open on Saturdays.'], 'open at 8:30 a.m. instead of 9 a.m.'],
    ['What about the closing time?', 'It will stay the same.', ['It will be 30 minutes earlier.', 'It will be 30 minutes later.', 'It has not been decided.'], 'The closing time will not change.'],
  ]],
  ["From: Jake\nTo: Emily\nSubject: Sorry!\nHi Emily,\nI'm really sorry I missed your call yesterday. My phone was in my bag and I didn't hear it. I'll call you tonight after eight.\nJake", [
    ["Why didn't Jake answer the phone?", "His phone was in his bag and he didn't hear it.", ['His battery was dead.', 'He was in a meeting.', 'He lost his phone.'], "My phone was in my bag and I didn't hear it."],
    ['What will Jake do?', 'Call Emily tonight after eight', ['Call Emily tonight before eight', 'Call Emily tomorrow morning', 'Wait for an email'], "I'll call you tonight after eight."],
  ]],
  ['From: Sunrise Gym\nTo: Members\nSubject: Pool closed\nThe swimming pool will be closed for cleaning from July 1 to July 7. All other areas of the gym will stay open as usual.', [
    ['What happens from July 1 to July 7?', 'Only the pool cannot be used.', ['The whole gym is closed.', 'Only the pool is open.', 'The pool price changes.'], 'All other areas of the gym will stay open.'],
    ['Why will the pool be closed?', 'For cleaning', ['For construction', 'Because there is not enough water', 'For a competition'], 'closed for cleaning'],
  ]],
  ["From: Paul\nTo: Team\nSubject: Welcome Rina!\nHi everyone,\nPlease welcome Rina Sato, who joins our team today. She has worked in marketing for five years. Let's have lunch together at noon to welcome her!\nPaul", [
    ['What is true about Rina?', 'She has worked in marketing for five years.', ['She is leaving the team today.', 'She has worked for fifteen years.', "She is Paul's boss."], 'She has worked in marketing for five years.'],
    ['What does Paul suggest?', 'Having lunch together at noon', ['Having a welcome party in the evening', 'Going out for lunch tomorrow', 'Asking Rina to make lunch'], "Let's have lunch together at noon"],
  ]],
  ['From: Online Shop\nTo: Mr. Clark\nSubject: Your order has shipped\nYour order (No. 4521) was shipped today. It should arrive in two to three days. You can check where it is on our website.', [
    ['When should the order arrive?', 'In two to three days', ['Today', 'In one week', 'In two to three weeks'], 'It should arrive in two to three days.'],
    ['How can Mr. Clark check where his package is?', 'On the website', ['By calling the shop', 'By sending an email', 'By visiting the shop'], 'You can check where it is on our website.'],
  ]],
  ["From: Lisa\nTo: Book Club\nSubject: Next meeting\nHi all,\nOur next meeting is on Saturday, the 20th, at my place. We'll talk about the book we finished last month. Please bring something to eat if you can!", [
    ['Where is the next meeting?', "At Lisa's home", ['At the library', 'At a café', 'At a bookstore'], 'at my place = 私の家で。'],
    ['What does Lisa ask members to do if they can?', 'Bring something to eat', ['Buy a new book', 'Finish reading the book', "Return last month's book"], 'Please bring something to eat if you can!'],
  ]],
  ["From: Daniel\nTo: Mark\nSubject: Can you cover for me?\nHi Mark,\nI have a doctor's appointment on Thursday morning. Could you lead the 9 a.m. meeting for me? I'll be back by noon.\nDaniel", [
    ['What does Daniel ask Mark to do?', 'Lead the 9 a.m. meeting on Thursday', ['Go to the doctor with him', 'Move the meeting to noon', 'Skip the meeting'], 'Could you lead the 9 a.m. meeting for me?'],
    ['When will Daniel be back?', 'By noon', ['At 9 a.m.', 'On Thursday night', 'On Friday'], "I'll be back by noon."],
  ]],
  ['From: Train Line Info\nTo: Subscribers\nSubject: Service change\nOn Sunday, trains on the Blue Line will run every 20 minutes instead of every 10 minutes because of track work.', [
    ['How often will Blue Line trains run on Sunday?', 'Every 20 minutes', ['Every 10 minutes', 'They will not run at all.', 'Every 5 minutes'], 'every 20 minutes instead of every 10 minutes'],
    ['Why will there be fewer trains?', 'Because of track work', ['Because of heavy snow', 'Because few people ride them', 'Because of new trains'], 'because of track work'],
  ]],
  // ---------- スマホのメッセージ ----------
  ["Ken: Are you still coming to the movie tonight?\nMia: Sorry, I'm stuck at work. Can we go tomorrow instead?\nKen: Sure, no problem.", [
    ['What is Mia doing now?', 'She is busy at work and cannot leave.', ['She is on her way to the theater.', 'She is already at the theater.', 'She is resting at home.'], "I'm stuck at work. = 仕事で抜けられない。"],
    ['What will they do?', 'Go to the movie tomorrow', ['Go to the movie tonight', 'Not go to the movie', 'Go next week'], 'Can we go tomorrow instead? — Sure.'],
  ]],
  ["Amy: I'm at the station. Where are you?\nJoe: I'm by the north exit, next to the flower shop.", [
    ['Where is Joe?', 'By the north exit, next to the flower shop', ['By the south exit, next to the flower shop', 'By the north exit, next to the bookstore', 'Inside the flower shop'], 'by the north exit, next to the flower shop'],
    ['Where is Amy?', 'At the station', ['At the flower shop', 'At work', 'At home'], "I'm at the station."],
  ]],
  ["Sam: Did you get my email about the meeting?\nKate: Yes, thanks. I'll be there at 3.\nSam: Great. Don't forget to bring your laptop.", [
    ['What does Sam ask Kate to do?', 'Bring her laptop', ['Send the email again', 'Call at 3', 'Print the meeting papers'], "Don't forget to bring your laptop."],
    ['When will Kate arrive at the meeting?', 'At 3', ['At 2', 'At 4', 'She has not decided.'], "I'll be there at 3."],
  ]],
  ["Dad: What time will you be home?\nYuki: Around 9. I'm having dinner with friends.\nDad: OK. Text me when you're on the train.", [
    ['When will Yuki come home?', 'Around 9, after dinner with friends', ['Around 7', 'At 9 to eat dinner at home', 'She will not come home tonight.'], "Around 9. I'm having dinner with friends."],
    ['What does Dad ask Yuki to do?', "Send a message when she's on the train", ['Call when she gets to the station', 'Come home early', 'Buy dinner on the way'], "Text me when you're on the train."],
  ]],
  ['Lily: Guess what! I got the job!\nTom: That\'s great news! Congratulations!\nLily: Thanks! I start next month.', [
    ['What is true about Lily?', 'She got a job and starts next month.', ['She quit her job.', 'She started working this month.', 'She has an interview soon.'], 'I got the job! … I start next month.'],
    ['How does Tom feel?', 'Happy', ['Sad', 'Jealous', 'Worried'], "That's great news! Congratulations!"],
  ]],
  ['Ben: Is the party still on for Saturday?\nNina: Yes, but it starts at 7, not 6.\nBen: Got it. See you then!', [
    ['What is true about the party?', 'It starts at 7 on Saturday.', ['It starts at 6 on Saturday.', 'It was canceled.', 'It starts at 7 on Sunday.'], 'it starts at 7, not 6'],
    ['What does Ben mean by "Got it"?', 'I understand.', ['I bought it.', 'I caught it.', 'I already have it.'], 'Got it. = わかった（了解）。'],
  ]],
  ["Emma: I'm running 10 minutes late. Sorry!\nRyo: No worries. I'll grab us a table.\nEmma: Thanks! Order me a coffee?", [
    ['What will Ryo do?', 'Get a table for them', ['Wait outside the shop', 'Go home first', 'Go and pick Emma up'], "I'll grab us a table. = 席を取っておくよ。"],
    ['What does Emma ask Ryo to do?', 'Order a coffee for her', ['Reserve a table', 'Wait ten minutes', 'Buy a cake'], 'Order me a coffee?'],
  ]],
  ["Mom: Did you remember to buy milk?\nKai: Oh no, I forgot. I'll stop by the store on my way home.", [
    ['What will Kai do?', 'Stop at the store and buy milk on the way home', ['Nothing, because he already bought milk', 'Ask his mom to buy it', 'Buy milk tomorrow'], "I'll stop by the store on my way home."],
    ['What did Kai forget?', 'To buy milk', ['The way to the store', 'The time to go home', 'To call his mom'], 'Did you remember to buy milk? — Oh no, I forgot.'],
  ]],
  ["Leo: Are you free to talk now?\nSara: I'm in a meeting. Can I call you in an hour?\nLeo: Sure. It's not urgent.", [
    ['What will Sara do?', 'Call Leo in an hour because she is in a meeting', ['Call Leo later because she is driving', 'Talk to Leo right now', 'Be an hour late for her meeting'], "I'm in a meeting. Can I call you in an hour?"],
    ["What is true about Leo's call?", 'It is not urgent.', ['It is very urgent.', 'It is about the meeting.', 'It is already finished.'], "It's not urgent."],
  ]],
  ['Jun: Do you want to try the new ramen place this weekend?\nAya: I\'d love to! Saturday or Sunday?\nJun: Saturday lunch works best for me.', [
    ['When does Jun want to go?', 'Saturday lunch', ['Sunday lunch', 'Saturday night', 'Sunday night'], 'Saturday lunch works best for me.'],
    ["What is Aya's answer?", 'She would love to go.', ['She cannot go.', 'She does not like ramen.', 'She is busy this weekend.'], "I'd love to!"],
  ]],
  ["Kim: The printer on the 2nd floor isn't working.\nLee: You can use the one on the 3rd floor. I just used it.", [
    ['What does Lee suggest?', 'Using the printer on the 3rd floor', ['Fixing the printer on the 2nd floor', 'Printing later', 'Asking Lee to print it'], 'You can use the one on the 3rd floor.'],
    ['What is wrong with the printer on the 2nd floor?', 'It is not working.', ['It has no paper.', 'It moved to the 3rd floor.', 'It is brand-new.'], "isn't working = 動かない。"],
  ]],
  ['Max: Happy birthday! Any plans for tonight?\nZoe: Thanks! Just a quiet dinner with my family.', [
    ["What are Zoe's plans for tonight?", 'A quiet dinner with her family', ['A party with friends', 'Eating out alone', 'Working'], 'Just a quiet dinner with my family.'],
    ['What is true about Zoe?', 'Today is her birthday.', ['Tomorrow is her birthday.', "It's a family member's birthday.", "It's Max's birthday."], 'Happy birthday! — Thanks!'],
  ]],
  // ---------- 張り紙・伝言メモ・予定表 ----------
  ['Notice\nThe 3rd floor meeting rooms will be closed for repairs from Monday to Wednesday. Please use the rooms on the 5th floor.', [
    ['What should people do from Monday to Wednesday?', 'Use the meeting rooms on the 5th floor', ['Not use the rooms on the 5th floor', 'Use only the rooms on the 3rd floor', 'Cancel all meetings'], 'Please use the rooms on the 5th floor.'],
    ['Why are the 3rd floor rooms closed?', 'For repairs', ['They are fully booked.', 'For cleaning', 'Because of a move'], 'closed for repairs'],
  ]],
  ['Phone Message\nTo: Mr. Hill\nFrom: Ms. Young (Star Travel)\nTime: 2:15 p.m.\nMessage: Your flight tickets are ready. Please call her back before 5 p.m.', [
    ['Why did Ms. Young call?', 'The flight tickets are ready.', ['The flight is delayed.', 'The trip was canceled.', 'The ticket price changed.'], 'Your flight tickets are ready.'],
    ['What should Mr. Hill do?', 'Call her back before 5 p.m.', ['Call her at 2:15 p.m.', 'Pick up the tickets at 5', 'Reply by email'], 'Please call her back before 5 p.m.'],
  ]],
  ['Yoga Class for Beginners\nEvery Tuesday, 7–8 p.m.\nCommunity Center, Room 2\nFirst class free! Sign up at the front desk.', [
    ['What is true about the first class?', 'It is free.', ['It is half price.', 'No sign-up is needed.', 'It is on Friday.'], 'First class free!'],
    ['Where do you sign up?', 'At the front desk', ['On the website', 'In Room 2', 'By phone'], 'Sign up at the front desk.'],
  ]],
  ['Staff Party\nFriday, December 15, 6:30 p.m.\nRiver Restaurant\nPlease tell Ms. Ito by December 8 if you can come.', [
    ['By when should you tell Ms. Ito if you can come?', 'December 8', ['December 15', 'December 6', 'The day of the party'], 'Please tell Ms. Ito by December 8 if you can come.'],
    ['Where is the party?', 'At River Restaurant', ['At the office', "At Ms. Ito's home", 'At a hotel'], 'River Restaurant'],
  ]],
  ['Lost: Black umbrella\nLeft in Meeting Room A on Monday afternoon.\nIf you find it, please call Ken (ext. 204).', [
    ['Where was the umbrella left?', 'In Meeting Room A on Monday afternoon', ['In Meeting Room B on Monday morning', 'At the station', 'In Room 204'], 'Left in Meeting Room A on Monday afternoon.'],
    ['What should you do if you find it?', 'Call Ken at extension 204', ['Leave it in Meeting Room A', 'Take it to the reception desk', 'Send an email'], 'please call Ken (ext. 204)'],
  ]],
  ['Weekend Weather\nSat: Sunny, 25°C\nSun: Rain in the afternoon, 18°C', [
    ['What will the weather be like on Sunday?', 'Rainy in the afternoon', ['Sunny all day', 'Rainy in the morning', 'Snowy'], 'Sun: Rain in the afternoon'],
    ['Which day is better for playing outside?', 'Saturday', ['Sunday afternoon', 'Sunday', 'Neither, because both days are rainy.'], 'Sat: Sunny'],
  ]],
  ['Office Closing\nOur office will close early at 3 p.m. on Friday for the year-end party. Phone calls will go to voicemail after 3.', [
    ['What happens to phone calls after 3 p.m. on Friday?', 'They go to voicemail.', ['They go to another office.', 'They go to the president.', 'They go to the party place.'], 'Phone calls will go to voicemail after 3.'],
    ['Why will the office close early?', 'For the year-end party', ['For phone repairs', 'For a big cleaning', 'Because it is a holiday'], 'for the year-end party'],
  ]],
  ["Dr. Brown's Clinic\nOpen: Mon–Fri 9–6, Sat 9–12\nClosed: Sundays and holidays\nAppointments: call 555-0123", [
    ['When is the clinic open on Saturdays?', 'From 9 to 12', ['From 9 to 6', 'It is closed.', 'From 12 to 6'], 'Sat 9–12'],
    ['How do you make an appointment?', 'By phone', ['On the website', 'By going there', 'By email'], 'Appointments: call 555-0123'],
  ]],
  ['Book Sale!\nAll used books $2 each, or 3 for $5.\nThis Saturday only, 10 a.m.–4 p.m., Main Library', [
    ['How much are three used books?', '$5', ['$6', '$2', '$3'], '3 for $5 = 3冊で5ドル。'],
    ['When is the sale?', 'Only this Saturday', ['Every Saturday', 'Saturday and Sunday', 'All this month'], 'This Saturday only'],
  ]],
  ['Please turn off your phone or set it to silent mode during the performance. Photos are not allowed.', [
    ['What must you NOT do during the performance?', 'Take photos', ['Stay quiet', 'Set your phone to silent mode', 'Stay in your seat'], 'Photos are not allowed.'],
    ['What should you do with your phone?', 'Turn it off or make it silent', ['Leave it at the front desk', 'Use it freely', 'Leave it on your seat'], 'turn off your phone or set it to silent mode'],
  ]],
  ['Bus Schedule Change\nFrom April 1, the last bus to the airport will leave at 10:30 p.m. instead of 11 p.m.', [
    ['What happens to the last bus to the airport from April 1?', 'It leaves 30 minutes earlier.', ['It leaves 30 minutes later.', 'It stops running.', 'It leaves at 11 p.m.'], 'at 10:30 p.m. instead of 11 p.m.'],
    ['When did the last bus leave before the change?', 'At 11 p.m.', ['At 10:30 p.m.', 'At 10 p.m.', 'At midnight'], 'instead of 11 p.m. = 午後11時のかわりに。'],
  ]],
  ['Meeting Notes\n- Next meeting: Thursday 10 a.m.\n- Emma will send the report by Wednesday.\n- Ken will book the room.', [
    ['Who will book the room?', 'Ken', ['Emma', 'The meeting leader', 'Everyone'], 'Ken will book the room.'],
    ['What will Emma do?', 'Send the report by Wednesday', ['Send the report on Thursday', 'Book the room', 'Lead the meeting'], 'Emma will send the report by Wednesday.'],
  ]],
  ["Hi! I'll be away from my desk until 2 p.m. If it's urgent, please call my mobile. — Ryan", [
    ['What is true about Ryan?', 'He is away from his desk until 2 p.m.', ['He will leave his desk at 2 p.m.', 'He has already gone home.', 'He does not have a mobile phone.'], "I'll be away from my desk until 2 p.m."],
    ['What should you do if it is urgent?', 'Call his mobile phone', ['Send an email', 'Wait until 2', 'Leave a note on his desk'], "If it's urgent, please call my mobile."],
  ]],
];
