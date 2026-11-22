/**
 * はじまりの街の「単語の書庫」：中学の基本の400語（2026-11-21）。
 * 1行に「英語|品詞|日本語の意味|例文」。品詞は n（名詞）v（動詞）a（形容詞）o（そのほか：副詞・前置詞など）。
 * 意味が重なる単語（speak「話す」と talk「話す・しゃべる」など）は、意味の文字を重ねておくと、おたがいのまちがいの選択肢に出ない。
 * 同じ意味の単語（big と large など）は、意味の文字をそろえておくと、まちがいの選択肢に出ない。
 * 直したら：node scripts/build_wordbook.mjs town01 data/town01_wordbook.json
 */
export const TOWN = { id: 'town01', name: 'はじまりの街', scene: 'あいさつと自己紹介', difficulty: '基本', order: 1 };
export const LEVEL = 1;
export const EXPECTED_COUNT = 400;
export const MONSTER = {
  id: 'town01-wordbook',
  name: 'しおりオバケ',
  skill: 'vocabulary',
  hp: 120,
  gold: 10,
  is_boss: false,
  image: '/monsters/town01-wordbook.png',
  description: '書庫にすむ、しおりのオバケ。読んだ単語を忘れかけると、そっとページにはさんで、もう一度見せてくる。',
};

export const WORDS = `
# 家族・人
family|n|家族|My family is small.
father|n|父|My father is a cook.
mother|n|母|My mother works at a bank.
brother|n|兄弟|I have one brother.
sister|n|姉妹|My sister is a student.
parent|n|親|My parents live in Osaka.
child|n|子ども|The child is sleeping.
baby|n|赤ちゃん|The baby is crying.
husband|n|夫|Her husband is kind.
wife|n|妻|This is my wife.
son|n|息子|Their son is ten years old.
daughter|n|娘|My daughter likes music.
grandfather|n|祖父|My grandfather is eighty.
grandmother|n|祖母|I visit my grandmother on Sundays.
friend|n|友だち|She is my best friend.
people|n|人々|Many people live in this city.
man|n|男性|That man is my teacher.
woman|n|女性|The woman is a doctor.
boy|n|男の子|The boy is my son.
girl|n|女の子|The girl is reading a book.
group|n|集団・グループ|We work in a group.
# 自分のこと
name|n|名前|What is your name?
age|n|年齢|Age is just a number.
birthday|n|誕生日|Happy birthday!
hobby|n|趣味|My hobby is cooking.
dream|n|夢|My dream is to live abroad.
job|n|仕事|I like my job.
company|n|会社|He works for a big company.
office|n|事務所|The office opens at nine.
teacher|n|先生|Our teacher is from London.
student|n|学生|I am a college student.
doctor|n|医者|You should see a doctor.
nurse|n|看護師|The nurse is very kind.
driver|n|運転手|The bus driver said hello.
# 学校・ことば
school|n|学校|School starts in April.
class|n|授業|The class starts at nine.
homework|n|宿題|I finished my homework.
test|n|試験|I passed the test.
question|n|質問|Can I ask a question?
answer|n|答え|That is the right answer.
word|n|単語|What does this word mean?
language|n|言語|English is a world language.
example|n|例|Can you give me an example?
idea|n|考え|That's a good idea.
problem|n|問題|No problem.
plan|n|計画|What's your plan for tomorrow?
story|n|物語|Tell me a story.
news|n|知らせ・ニュース|Did you hear the news?
mistake|n|間違い|Everyone makes mistakes.
# 場所・町
world|n|世界|I want to travel around the world.
country|n|国|Japan is an island country.
city|n|都市|Tokyo is a big city.
town|n|町|I live in a small town.
street|n|通り|The shop is on this street.
road|n|道路|The road is wet.
station|n|駅|Where is the station?
airport|n|空港|We arrived at the airport.
hospital|n|病院|She works at a hospital.
bank|n|銀行|The bank closes at three.
library|n|図書館|I study at the library.
park|n|公園|Let's walk in the park.
restaurant|n|レストラン|This restaurant is popular.
hotel|n|ホテル|We stayed at a nice hotel.
store|n|店|The store sells shoes.
place|n|場所|This is a nice place.
way|n|方法|This is the best way.
side|n|側|The bank is on the left side.
front|n|前|Wait in front of the station.
corner|n|角|Turn right at the corner.
end|n|終わり|See you at the end of the month.
# 家・持ち物
house|n|家|Their house is big.
room|n|部屋|My room is on the second floor.
kitchen|n|台所|Mom is in the kitchen.
bathroom|n|浴室|Where is the bathroom?
door|n|ドア|Please close the door.
window|n|窓|Open the window, please.
floor|n|床|The floor is clean.
wall|n|壁|There is a picture on the wall.
table|n|テーブル|The keys are on the table.
chair|n|いす|Sit on the chair.
bed|n|ベッド|I go to bed at eleven.
desk|n|机|My desk is messy.
box|n|箱|What is in the box?
bag|n|かばん|This bag is heavy.
key|n|鍵|I lost my key.
phone|n|電話|My phone is ringing.
computer|n|コンピューター|I use a computer at work.
umbrella|n|かさ|Take an umbrella.
money|n|お金|I don't have much money.
ticket|n|切符|I bought a train ticket.
picture|n|写真|Can I take a picture?
letter|n|手紙|I wrote a letter to my friend.
book|n|本|This book is interesting.
pen|n|ペン|Can I borrow a pen?
map|n|地図|Let's check the map.
thing|n|もの|I have many things to do.
clothes|n|服|I bought new clothes.
shoes|n|靴|These shoes are comfortable.
present|n|贈り物|Thank you for the present.
gift|n|贈り物|This is a gift for you.
price|n|値段|What's the price of this bag?
# 乗り物
car|n|車|He has a red car.
bus|n|バス|I go to work by bus.
train|n|電車|The train is late.
bike|n|自転車|I ride my bike to school.
plane|n|飛行機|The plane leaves at noon.
# 食べ物
food|n|食べ物|Japanese food is healthy.
breakfast|n|朝食|I eat breakfast at seven.
lunch|n|昼食|Let's have lunch together.
dinner|n|夕食|Dinner is ready.
rice|n|米|I eat rice every day.
bread|n|パン|I buy bread at the bakery.
meat|n|肉|I don't eat much meat.
fish|n|魚|This fish is fresh.
egg|n|卵|I had an egg for breakfast.
vegetable|n|野菜|Eat more vegetables.
fruit|n|果物|I like fruit.
apple|n|りんご|I eat an apple every morning.
water|n|水|Can I have some water?
milk|n|牛乳|I drink milk every morning.
tea|n|お茶|Would you like some tea?
coffee|n|コーヒー|I need a cup of coffee.
dish|n|料理|This dish is spicy.
cup|n|カップ|I broke my cup.
# 自然・生き物
animal|n|動物|I love animals.
dog|n|犬|My dog is very friendly.
cat|n|猫|The cat is sleeping.
bird|n|鳥|A bird is singing.
flower|n|花|These flowers are beautiful.
tree|n|木|There is a big tree in the yard.
river|n|川|We swam in the river.
mountain|n|山|We climbed the mountain.
sea|n|海|I want to swim in the sea.
sky|n|空|The sky is blue.
sun|n|太陽|The sun is hot today.
moon|n|月（天体）|The moon is bright tonight.
star|n|星|I can see many stars.
rain|n|雨|We had a lot of rain.
snow|n|雪|We had snow last night.
wind|n|風|The wind is strong.
weather|n|天気|How is the weather?
# 時・季節
season|n|季節|Spring is my favorite season.
spring|n|春|Flowers bloom in spring.
summer|n|夏|Summer in Japan is hot.
fall|n|秋|The leaves turn red in fall.
winter|n|冬|Winter is cold here.
morning|n|朝|I run every morning.
afternoon|n|午後|See you in the afternoon.
evening|n|夕方|We eat dinner in the evening.
night|n|夜|I study at night.
day|n|日|Have a nice day.
week|n|週|I work five days a week.
month|n|月（暦の）|I visit my parents once a month.
year|n|年|I started this job last year.
weekend|n|週末|What did you do last weekend?
holiday|n|祝日|Monday is a holiday.
vacation|n|休暇|I'm on vacation.
time|n|時間|What time is it?
hour|n|1時間|The movie is two hours long.
minute|n|分|Wait a minute, please.
date|n|日付|What's the date today?
# 楽しみ
party|n|パーティー|Come to my party.
game|n|試合|The game starts at six.
music|n|音楽|I listen to music every day.
song|n|歌|This is my favorite song.
movie|n|映画|Let's watch a movie.
sport|n|スポーツ|What sport do you like?
team|n|チーム|Our team won the game.
trip|n|旅行|How was your trip?
shopping|n|買い物|I went shopping yesterday.
color|n|色|What color do you like?
# 体
body|n|体|Exercise is good for your body.
head|n|頭|My head hurts.
face|n|顔|Wash your face.
eye|n|目|She has blue eyes.
ear|n|耳|The rabbit has long ears.
mouth|n|口|Open your mouth, please.
hand|n|手|Raise your hand.
foot|n|足|My foot hurts.
hair|n|髪|She has long hair.
heart|n|心臓|My heart is beating fast.
health|n|健康|Sleep is important for health.
# 動き
go|v|行く|I go to school by bus.
come|v|来る|Come here, please.
eat|v|食べる|I eat breakfast every day.
drink|v|飲む|I drink coffee in the morning.
sleep|v|眠る|I sleep eight hours a day.
wake up|v|目を覚ます・起きる|I wake up at six.
get up|v|起きる・起床する|What time do you get up?
walk|v|歩く|I walk to the station.
run|v|走る|He runs very fast.
swim|v|泳ぐ|Can you swim?
sit|v|座る|Please sit down.
stand|v|立つ|Stand up, please.
see|v|見る・見える|I can see the mountain.
look|v|見る|Look at this picture.
watch|v|じっと見る|I watch TV after dinner.
hear|v|聞こえる|Can you hear me?
listen|v|聞く|Listen to me carefully.
speak|v|話す|Do you speak English?
talk|v|話す・しゃべる|Let's talk about it later.
say|v|言う|What did you say?
tell|v|伝える|Tell me your name.
ask|v|たずねる|Can I ask you something?
read|v|読む|I read a book every week.
write|v|書く|Please write your name here.
study|v|勉強する|I study English every day.
learn|v|学ぶ|I want to learn Spanish.
teach|v|教える|She teaches math.
know|v|知っている|I know that man.
think|v|思う|I think so too.
understand|v|理解する|I don't understand.
remember|v|覚えている|I remember his name.
forget|v|忘れる|Don't forget your umbrella.
like|v|好きだ|I like cats.
love|v|愛する|I love this song.
want|v|ほしい|I want a new bike.
need|v|必要とする|I need your help.
have|v|持っている|I have two sisters.
get|v|手に入れる|Where did you get that bag?
give|v|与える|I gave her a present.
take|v|持っていく|Take your umbrella with you.
bring|v|持ってくる|Bring your lunch tomorrow.
buy|v|買う|I bought a new phone.
sell|v|売る|They sell fresh fruit.
pay|v|払う|Can I pay by card?
make|v|作る|I made a cake.
cook|v|料理する|I cook dinner every night.
wash|v|洗う|Wash your hands.
clean|v|掃除する|I clean my room on Sundays.
open|v|開ける|Open the door, please.
close|v|閉める|Close the window, please.
start|v|始める・始まる|Let's start the meeting.
finish|v|終える|I finished my work.
stop|v|止まる|Stop the car!
wait|v|待つ|Wait here, please.
stay|v|滞在する|I stayed in Kyoto for three days.
live|v|住む|I live in Tokyo.
work|v|働く|I work at a hotel.
play|v|遊ぶ|The children are playing outside.
sing|v|歌う|She sings very well.
dance|v|踊る|Let's dance!
draw|v|描く|He draws pictures well.
use|v|使う|Can I use your pen?
try|v|やってみる|Try this cake.
help|v|手伝う|Can you help me?
call|v|電話する|I'll call you later.
meet|v|会う|Nice to meet you.
visit|v|訪れる|I visited Kyoto last year.
travel|v|旅行する|I like to travel.
drive|v|運転する|Can you drive?
ride|v|乗る|I ride a bike to work.
fly|v|飛ぶ|Birds fly south in winter.
leave|v|出発する|The train leaves at six.
arrive|v|到着する|We arrived at noon.
return|v|戻る|I returned home late.
send|v|送る|I sent you an email.
show|v|見せる|Show me your ticket, please.
find|v|見つける|I can't find my key.
lose|v|なくす|I lost my wallet.
win|v|勝つ|Our team won.
carry|v|運ぶ|Can you carry this box?
move|v|引っ越す|We moved to Osaka last year.
change|v|変える|I changed my plan.
turn|v|曲がる|Turn left at the bank.
cross|v|渡る|Cross the street carefully.
enjoy|v|楽しむ|I enjoyed the party.
laugh|v|笑う|Everyone laughed.
cry|v|泣く|The baby cried all night.
smile|v|ほほえむ|She smiled at me.
feel|v|感じる|I feel tired today.
hope|v|望む|I hope you like it.
believe|v|信じる|I believe you.
choose|v|選ぶ|Choose one color.
decide|v|決める|I decided to study abroad.
agree|v|賛成する|I agree with you.
practice|v|練習する|I practice the piano every day.
borrow|v|借りる|Can I borrow your pen?
lend|v|貸す|Can you lend me some money?
grow|v|育てる|My father grows tomatoes.
become|v|～になる|She became a doctor.
begin|v|始まる・始める|The class begins at nine.
build|v|建てる|They built a new school.
catch|v|捕まえる|The cat caught a mouse.
hold|v|手に持つ|Hold my hand.
keep|v|取っておく|Keep the change.
put|v|置く|Put your bag here.
spend|v|過ごす|I spent the weekend at home.
wear|v|身につけている|She is wearing a red coat.
worry|v|心配する|Don't worry.
# ようす
big|a|大きい|That is a big house.
large|a|大きい|I'd like a large coffee.
small|a|小さい|My room is small.
long|a|長い|She has long hair.
short|a|短い|The movie was short.
tall|a|背が高い|He is very tall.
high|a|高い（高さ）|The mountain is high.
low|a|低い|The price is low.
new|a|新しい|I bought a new car.
old|a|古い|This is an old temple.
young|a|若い|She looks young.
good|a|よい|That's a good idea.
bad|a|悪い|I have bad news.
nice|a|すてきな|What a nice day!
beautiful|a|美しい|The view is beautiful.
pretty|a|かわいい|What a pretty flower!
cute|a|かわいい|Your dog is cute.
hot|a|暑い|It's hot today.
cold|a|寒い|It's cold outside.
warm|a|暖かい|It's warm in spring.
cool|a|涼しい|The evening is cool.
easy|a|簡単な|This test is easy.
difficult|a|難しい|This question is difficult.
busy|a|忙しい|I'm busy today.
free|a|ひまな|Are you free tomorrow?
happy|a|うれしい・幸せな|I'm happy to see you.
glad|a|うれしい|I'm glad you came.
sad|a|悲しい|The movie was sad.
tired|a|疲れた|I'm tired after work.
hungry|a|おなかがすいた|I'm hungry.
thirsty|a|のどがかわいた|I'm thirsty.
sick|a|病気の|She is sick in bed.
fine|a|元気な|I'm fine, thank you.
kind|a|親切な|He is very kind.
friendly|a|人なつっこい|The people here are friendly.
famous|a|有名な|This temple is famous.
popular|a|人気のある|This song is popular.
interesting|a|興味深い|The book is interesting.
funny|a|おかしい|He told a funny story.
boring|a|退屈な|The class was boring.
important|a|大切な|Health is important.
favorite|a|いちばん好きな|What's your favorite food?
different|a|違う|We have different ideas.
same|a|同じ|We are in the same class.
right|a|正しい|You are right.
wrong|a|間違った|I took the wrong train.
late|a|遅れた|I'm late for school.
fast|a|速い|This train is fast.
slow|a|遅い（速さ）|The bus is slow.
quiet|a|静かな|The library is quiet.
noisy|a|うるさい|The street is noisy.
dirty|a|汚い|My shoes are dirty.
expensive|a|高価な|This watch is expensive.
cheap|a|安い|The food here is cheap.
heavy|a|重い|This bag is heavy.
light|a|軽い|This box is light.
full|a|満腹の|I'm full.
empty|a|空の|The bottle is empty.
delicious|a|とてもおいしい|This soup is delicious.
sweet|a|甘い|This cake is very sweet.
strong|a|強い|He is very strong.
weak|a|弱い|The signal is weak.
rich|a|お金持ちの|He is rich.
poor|a|貧しい|They were poor.
dark|a|暗い|It's dark outside.
bright|a|明るい|The room is bright.
safe|a|安全な|This town is safe.
dangerous|a|危険な|Swimming here is dangerous.
sure|a|確かな|Are you sure?
ready|a|準備ができた|Dinner is ready.
sorry|a|すまなく思って|I'm sorry I'm late.
# そのほか（副詞・前置詞など）
today|o|今日|It's sunny today.
tomorrow|o|明日|See you tomorrow.
yesterday|o|昨日|I was busy yesterday.
now|o|今|I'm busy now.
soon|o|すぐに|I'll be back soon.
again|o|もう一度|Say that again, please.
always|o|いつも|I always get up early.
usually|o|たいてい|I usually walk to work.
often|o|よく・しばしば|I often eat out.
sometimes|o|ときどき|I sometimes cook.
never|o|一度も～ない|I have never been to Paris.
very|o|とても|It's very cold.
too|o|～すぎる|This shirt is too big.
also|o|～もまた|I also play tennis.
only|o|～だけ|I have only one brother.
just|o|ちょうど|I just arrived.
here|o|ここに|Come here.
there|o|そこに|Put it there.
together|o|一緒に|Let's go together.
early|o|早く|I got up early.
well|o|上手に|She sings well.
abroad|o|外国に|I want to study abroad.
before|o|以前に|Have we met before?
after|o|～のあとで|After dinner, I watch TV.
because|o|なぜなら|I stayed home because it rained.
but|o|しかし|I like it, but it's expensive.
if|o|もし～なら|If it rains, I'll stay home.
when|o|～するとき|Call me when you arrive.
under|o|～の下に|The cat is under the table.
between|o|～と～の間に|The bank is between the station and the park.
near|o|～の近くに|I live near the station.
with|o|～と一緒に|I live with my family.
without|o|～なしで|I can't live without coffee.
during|o|～のあいだずっと|I slept during the movie.
until|o|～まで|Wait until five.
maybe|o|たぶん|Maybe it will rain.
almost|o|ほとんど|I'm almost ready.
already|o|すでに|I already ate lunch.
still|o|まだ|It's still raining.
`;
