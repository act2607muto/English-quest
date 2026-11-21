/**
 * にぎわいの市の「単語の書庫」：中学2年〜高校1年・TOEIC 500〜600 くらいの600語（2026-11-21）。買い物の単語を多めに。
 * 1行に「英語|品詞|日本語の意味|例文」。品詞は n（名詞）v（動詞）a（形容詞）o（そのほか：副詞・前置詞など）。
 * 意味が重なる単語（fix「直す・修理する」と repair「修理する」など）は、意味の文字を重ねておくと、おたがいのまちがいの選択肢に出ない。
 * はじまりの街の書庫（town01.mjs）と同じ単語は入れない（作るときに確かめる）。
 * 直したら：node scripts/build_wordbook.mjs town02 data/town02_wordbook.json
 */
export const TOWN = { id: 'town02', name: 'にぎわいの市', scene: '買い物', difficulty: '標準', order: 2 };
export const LEVEL = 2;
export const EXPECTED_COUNT = 600;
export const EARLIER_TOWNS = ['town01'];
export const MONSTER = {
  id: 'town02-wordbook',
  name: 'ふせんチョウ',
  skill: 'vocabulary',
  hp: 160,
  gold: 15,
  is_boss: false,
  image: '/monsters/town02-wordbook.png',
  description: '色とりどりのふせんが羽になったチョウ。覚えたい単語を見つけると、ぺたりと羽を一枚はりつけていく。',
};

export const WORDS = `
# 買い物・お金
customer|n|客（店の）|The customer asked for a refund.
clerk|n|店員|The clerk was very helpful.
cashier|n|レジ係|Please pay the cashier.
counter|n|カウンター|Please wait at the counter.
receipt|n|レシート|Keep your receipt.
refund|n|返金|I'd like a refund.
discount|n|割引|Can I get a discount?
sale|n|特売|The shoes are on sale.
coupon|n|クーポン券|I have a coupon.
cash|n|現金|Do you take cash?
credit card|n|クレジットカード|Can I pay by credit card?
coin|n|硬貨|I need some coins for the machine.
bill|n|請求書|Can I have the bill, please?
wallet|n|財布|I left my wallet at home.
purse|n|ハンドバッグ|She keeps her phone in her purse.
item|n|品物|This item is out of stock.
product|n|製品|This product is made in Japan.
goods|n|商品|The store sells sports goods.
brand|n|銘柄・ブランド|What brand is this?
size|n|大きさ・サイズ|Do you have this in a larger size?
quality|n|品質|The quality is very good.
total|n|合計|The total is thirty dollars.
tax|n|税金|Tax is included.
cart|n|カート|Put it in the cart.
basket|n|かご|Take a basket at the entrance.
shelf|n|棚|The milk is on the top shelf.
aisle|n|通路（店の）|Shampoo is in aisle five.
entrance|n|入口|Meet me at the entrance.
exit|n|出口|The exit is over there.
stairs|n|階段|Take the stairs to the second floor.
elevator|n|エレベーター|Let's take the elevator.
market|n|市場|I buy fish at the market.
mall|n|ショッピングモール|Let's go to the mall.
supermarket|n|スーパー|The supermarket opens at nine.
bakery|n|パン屋|The bakery smells great.
pharmacy|n|薬局|Is there a pharmacy near here?
department store|n|デパート|I bought it at a department store.
convenience store|n|コンビニ|There's a convenience store on the corner.
order|n|注文|Your order is ready.
delivery|n|配達|Delivery is free.
package|n|小包|A package arrived for you.
service|n|応対・サービス|The service here is excellent.
staff|n|職員|The staff are friendly.
manager|n|責任者|Can I speak to the manager?
owner|n|持ち主|Who is the owner of this bike?
list|n|一覧|Make a shopping list.
choice|n|選択|You made a good choice.
sign|n|看板|The sign says the shop is closed.
advertisement|n|広告|I saw an advertisement for the sale.
budget|n|予算|It's over my budget.
fee|n|料金・手数料|There is no fee.
rent|n|家賃|The rent is high in Tokyo.
salary|n|給料|He gets a good salary.
account|n|口座|I opened a bank account.
card|n|カード|Here's my card.
warranty|n|保証|Is there a warranty on this?
stock|n|在庫|This item is out of stock.
brochure|n|パンフレット|Take a brochure.
catalog|n|カタログ|I ordered it from a catalog.
label|n|ラベル・値札|Check the label for the price.
tag|n|札・値札|The price tag says ten dollars.
fitting room|n|試着室|The fitting room is over there.
checkout|n|レジ（会計所）|Please pay at the checkout.
line|n|列|There's a long line at the checkout.
bargain|n|掘り出し物|This coat was a real bargain.
gift card|n|ギフトカード|I got a gift card for my birthday.
payment|n|支払い|We accept payment by card.
purchase|n|購入品|Thank you for your purchase.
material|n|素材・材料|What material is this shirt made of?
cotton|n|綿|This shirt is 100% cotton.
leather|n|革|These are leather shoes.
silver|n|銀|This ring is made of silver.
gold|n|金（きん）|She wears a gold necklace.
plastic|n|プラスチック|Plastic bags cost five yen.
wood|n|木材|The table is made of wood.
metal|n|金属|This box is made of metal.
model|n|型・モデル|This is the newest model.
detail|n|詳細|Check the details before you buy.
stamp|n|切手|I need a stamp for this letter.
envelope|n|封筒|Put the letter in an envelope.
scissors|n|はさみ|Can I borrow your scissors?
tool|n|道具|I need a tool to fix this.
machine|n|機械|The machine is broken.
quantity|n|量|We need a large quantity.
# 服・持ち物
jacket|n|上着|This jacket is warm.
coat|n|コート|Take your coat.
sweater|n|セーター|My sweater is too small.
pants|n|ズボン|These pants are too long.
skirt|n|スカート|She bought a new skirt.
dress|n|ワンピース|That dress looks nice.
socks|n|靴下|I need new socks.
boots|n|ブーツ|These boots are warm.
glasses|n|めがね|I can't read without my glasses.
ring|n|指輪|She wears a silver ring.
necklace|n|ネックレス|This necklace was a gift.
pocket|n|ポケット|Put it in your pocket.
button|n|ボタン|Press the red button.
toy|n|おもちゃ|The child wants a new toy.
battery|n|電池|The battery is dead.
towel|n|タオル|Can I have a towel?
soap|n|せっけん|Wash your hands with soap.
medicine|n|薬|Take this medicine after meals.
hat|n|ぼうし|Wear a hat in summer.
shirt|n|シャツ|This shirt is too small.
camera|n|カメラ|This is my new camera.
clock|n|時計|The clock is five minutes fast.
newspaper|n|新聞|My father reads the newspaper.
paper|n|紙|I need a piece of paper.
# 食べ物
juice|n|ジュース|This juice is too sweet.
sugar|n|砂糖|No sugar, please.
salt|n|塩|Pass me the salt, please.
cake|n|ケーキ|She made a birthday cake.
glass|n|コップ|A glass of water, please.
butter|n|バター|I put butter on my bread.
cheese|n|チーズ|This cheese is from France.
soup|n|スープ|The soup is hot.
salad|n|サラダ|I'll have a salad.
sandwich|n|サンドイッチ|I made a sandwich for lunch.
snack|n|軽食・おやつ|Let's have a snack.
dessert|n|デザート|What's for dessert?
potato|n|じゃがいも|I'm peeling the potatoes.
tomato|n|トマト|These tomatoes are fresh.
onion|n|玉ねぎ|Onions make me cry.
chicken|n|鶏肉|I'll have the chicken.
beef|n|牛肉|This beef is tender.
pork|n|豚肉|I don't eat pork.
bottle|n|びん|A bottle of water, please.
piece|n|1切れ|Can I have a piece of cake?
pair|n|1組|I bought a pair of shoes.
dozen|n|1ダース（12個）|A dozen eggs, please.
half|n|半分|Cut it in half.
ingredient|n|食材|Buy the ingredients for dinner.
flavor|n|風味|Which flavor do you want?
recipe|n|レシピ|This is my mother's recipe.
# 場所・町
village|n|村|The village is quiet.
bridge|n|橋|Let's cross the bridge.
island|n|島|They live on an island.
beach|n|浜辺|Let's go to the beach.
lake|n|湖|The lake is beautiful.
museum|n|博物館|The museum is closed today.
center|n|中心|The shop is in the center of town.
area|n|地域|This area is quiet.
block|n|区画|The bank is two blocks away.
building|n|建物|That building is very tall.
parking lot|n|駐車場|The parking lot is full.
post office|n|郵便局|Where is the post office?
city hall|n|市役所|City hall is next to the park.
factory|n|工場|He works at a factory.
farm|n|農場|They have a farm in the country.
garden|n|庭園|My mother grows flowers in the garden.
temple|n|寺|We visited an old temple.
church|n|教会|There is a church on the hill.
castle|n|城|The castle is four hundred years old.
tower|n|塔|You can see the tower from here.
middle|n|真ん中|Stand in the middle.
# 人
neighbor|n|近所の人|Our neighbor has a dog.
cousin|n|いとこ|My cousin plays tennis.
aunt|n|おば|My aunt is a nurse.
uncle|n|おじ|My uncle lives in Canada.
engineer|n|技術者|She is an engineer.
farmer|n|農家の人|The farmer grows rice.
police officer|n|警察官|Ask the police officer.
guest|n|招待客|We have guests tonight.
visitor|n|訪問者|Many visitors come here.
tourist|n|観光客|The city is full of tourists.
guide|n|案内人|Our guide spoke English well.
passenger|n|乗客|The passengers got off the bus.
pilot|n|パイロット|My cousin is a pilot.
artist|n|芸術家|She is a famous artist.
writer|n|作家|He wants to be a writer.
singer|n|歌手|She is a popular singer.
scientist|n|科学者|My dream is to be a scientist.
volunteer|n|ボランティア|She works as a volunteer.
adult|n|大人|Tickets are ten dollars for adults.
kid|n|子ども|The kids are playing in the park.
human|n|人間|Humans need water.
king|n|王|The king lived in the castle.
queen|n|女王|The queen waved to the people.
member|n|一員|I'm a member of the tennis club.
hero|n|英雄|He is a hero.
# 生活・考え
number|n|番号|What's your phone number?
address|n|住所|What's your address?
email|n|電子メール|I got an email from my boss.
message|n|伝言|Can I leave a message?
information|n|情報|I need more information.
reason|n|理由|What's the reason?
result|n|結果|The result was good.
chance|n|機会|This is a good chance.
experience|n|経験|I have no experience.
interest|n|興味|I have an interest in art.
habit|n|習慣|Reading is a good habit.
rule|n|規則|Follow the rules.
law|n|法律|It's against the law.
safety|n|安全|Safety comes first.
accident|n|事故|There was an accident on the road.
danger|n|危険|Danger! Keep out.
trouble|n|困ったこと|I'm in trouble.
energy|n|元気・エネルギー|I have no energy today.
noise|n|騒音|The noise kept me awake.
smell|n|におい|I love the smell of coffee.
taste|n|味|This soup has a strong taste.
voice|n|声|She has a beautiful voice.
sound|n|音|What's that sound?
fire|n|火|Be careful with fire.
air|n|空気|The air is fresh here.
earth|n|地球|The earth goes around the sun.
nature|n|自然|I love nature.
environment|n|環境|We must protect the environment.
culture|n|文化|I'm interested in Japanese culture.
history|n|歴史|I like history.
science|n|科学|She studies science.
art|n|芸術|I like modern art.
subject|n|教科|What's your favorite subject?
club|n|部・クラブ|I joined the tennis club.
event|n|行事|The event starts at noon.
festival|n|祭り|The summer festival is fun.
concert|n|演奏会・コンサート|Let's go to the concert.
contest|n|競技会・コンテスト|She won the speech contest.
prize|n|賞|He won first prize.
# 体・健康
fever|n|熱（病気の）|I have a fever.
headache|n|頭痛|I have a headache.
stomach|n|胃・おなか|My stomach hurts.
tooth|n|歯|I have a bad tooth.
neck|n|首|My neck is stiff.
shoulder|n|肩|My shoulders are tired.
arm|n|腕|I broke my arm.
leg|n|脚|My legs are tired.
finger|n|指|I cut my finger.
nose|n|鼻|My nose is running.
blood|n|血|He gave blood at the hospital.
# 時
moment|n|瞬間|Wait a moment, please.
future|n|未来|What do you want to do in the future?
past|n|過去|Forget the past.
century|n|世紀|This castle was built in the 17th century.
schedule|n|予定表|What's your schedule today?
calendar|n|カレンダー|Check the calendar.
noon|n|正午|Let's meet at noon.
midnight|n|真夜中|I went to bed at midnight.
# 旅・乗り物
passport|n|パスポート|Show me your passport.
seat|n|座席|Is this seat free?
traffic|n|交通|The traffic is heavy today.
taxi|n|タクシー|Let's take a taxi.
subway|n|地下鉄|I take the subway to work.
platform|n|（駅の）ホーム|The train leaves from platform 3.
journey|n|旅|Have a nice journey.
tour|n|見学旅行・ツアー|We joined a bus tour.
souvenir|n|おみやげ|I bought some souvenirs.
luggage|n|手荷物|Where is my luggage?
# 家・自然
furniture|n|家具|We bought new furniture.
sofa|n|ソファー|Sit on the sofa.
mirror|n|鏡|Look in the mirror.
garbage|n|ごみ|Take out the garbage.
roof|n|屋根|The roof is red.
yard|n|（家の）庭|The kids are playing in the yard.
horse|n|馬|He can ride a horse.
insect|n|昆虫|I don't like insects.
pet|n|ペット|Do you have a pet?
leaf|n|葉|The leaves are turning red.
forest|n|森|We walked in the forest.
field|n|野原|The cows are in the field.
hill|n|丘|There's a house on the hill.
ocean|n|大洋|The ocean is calm today.
cloud|n|雲|There's not a cloud in the sky.
temperature|n|気温|The temperature is rising.
ship|n|船|The ship is very big.
# 動き
cost|v|（費用が）かかる|How much does it cost?
save|v|節約する|I want to save money.
waste|v|むだにする|Don't waste food.
deliver|v|配達する|They deliver pizza.
exchange|v|交換する|Can I exchange this?
check|v|確かめる|Let me check.
compare|v|比べる|Compare the prices.
count|v|数える|Count the money.
fit|v|（大きさが）合う|These shoes fit well.
suit|v|似合う|That color suits you.
try on|v|試着する|Can I try this on?
afford|v|買う余裕がある|I can't afford a new car.
offer|v|申し出る|They offered me a job.
accept|v|受け入れる|We accept credit cards.
refuse|v|断る|She refused my offer.
receive|v|受け取る|I received your letter.
include|v|含む|The price includes tax.
contain|v|含む|This drink contains sugar.
reserve|v|予約する|I'd like to reserve a table.
cancel|v|取り消す|I need to cancel my order.
prepare|v|準備する|I'm preparing dinner.
serve|v|（食事を）出す|Breakfast is served at seven.
fill|v|満たす|Fill the glass with water.
pour|v|注ぐ|Pour the milk into the cup.
cut|v|切る|Cut the bread into pieces.
boil|v|ゆでる|Boil the eggs for five minutes.
bake|v|（オーブンで）焼く|She bakes bread every Sunday.
fry|v|炒める・揚げる|Fry the onions first.
mix|v|混ぜる|Mix the eggs and sugar.
add|v|加える|Add some salt.
break|v|壊す|Don't break the glass.
fix|v|直す・修理する|Can you fix my bike?
repair|v|修理する|They repaired the road.
pick up|v|拾う・迎えに行く|I'll pick you up at six.
drop|v|落とす|I dropped my phone.
throw|v|投げる|Throw me the ball.
push|v|押す|Push the button.
pull|v|引く|Pull the door.
hit|v|打つ|He hit the ball.
kick|v|ける|Kick the ball.
shake|v|振る|Shake the bottle well.
touch|v|触る|Don't touch the paintings.
climb|v|登る|Let's climb the hill.
jump|v|跳ぶ|The cat jumped onto the table.
hurry|v|急ぐ|Hurry up!
rest|v|休む|Let's rest for a while.
relax|v|くつろぐ|Relax and enjoy the music.
exercise|v|運動する|I exercise every morning.
shout|v|叫ぶ|Don't shout.
whisper|v|ささやく|She whispered in my ear.
explain|v|説明する|Can you explain this?
describe|v|描写する・説明する|Describe the man you saw.
discuss|v|話し合う|Let's discuss the plan.
introduce|v|紹介する|Let me introduce my friend.
invite|v|招待する|I invited him to dinner.
join|v|加わる|Can I join you?
welcome|v|歓迎する|We welcome new members.
thank|v|感謝する|I thank you for your help.
apologize|v|謝る|I apologize for being late.
promise|v|約束する|I promise to come.
guess|v|推測する|Guess what happened.
imagine|v|想像する|Imagine a world without music.
wonder|v|～かなと思う|I wonder where she is.
notice|v|気づく|I didn't notice the sign.
realize|v|気づく・悟る|I realized my mistake.
mean|v|意味する|What does this word mean?
spell|v|つづる|How do you spell your name?
pronounce|v|発音する|How do you pronounce this word?
translate|v|翻訳する|Can you translate this?
repeat|v|繰り返す|Repeat after me.
copy|v|写す|Copy these words.
print|v|印刷する|Please print this page.
type|v|入力する|Type your password.
search|v|探す|I searched the internet.
look for|v|探す|I'm looking for my keys.
collect|v|集める|I collect stamps.
share|v|分け合う|Let's share the cake.
divide|v|分ける|Divide it into three.
own|v|所有する|He owns three cars.
belong|v|属する|This bag belongs to me.
cover|v|覆う|Snow covered the town.
protect|v|守る|We must protect nature.
attack|v|攻撃する|The dog attacked the cat.
fight|v|戦う|They fought for freedom.
hide|v|隠れる|The cat is hiding under the bed.
appear|v|現れる|A rainbow appeared.
disappear|v|消える|The sun disappeared behind the clouds.
happen|v|起こる|What happened?
continue|v|続ける|Please continue.
complete|v|完成させる|I completed the report.
fail|v|失敗する|I failed the test.
succeed|v|成功する|She succeeded in business.
improve|v|よくなる・改善する|My English is improving.
increase|v|増える|Prices are increasing.
decrease|v|減る|The number of students decreased.
develop|v|発展する|The town developed quickly.
produce|v|生産する|This factory produces cars.
invent|v|発明する|Who invented the telephone?
discover|v|発見する|They discovered a new star.
create|v|創り出す|She created a new website.
design|v|設計する|He designed this house.
plant|v|植える|We planted trees.
pick|v|摘む|We picked strawberries.
feed|v|えさをやる|Don't feed the birds.
raise|v|上げる|Raise your hand.
lift|v|持ち上げる|Can you lift this box?
lie|v|横になる|Lie down on the bed.
marry|v|結婚する|They married last year.
celebrate|v|祝う|We celebrated her birthday.
graduate|v|卒業する|I graduated from college in 2010.
retire|v|引退する|My father retired last year.
hire|v|雇う|The company hired ten people.
earn|v|稼ぐ|He earns a lot of money.
owe|v|借りがある|I owe you ten dollars.
check in|v|チェックインする|We checked in at three.
check out|v|チェックアウトする|We checked out at ten.
get on|v|（乗り物に）乗る|Get on the bus here.
get off|v|（乗り物を）降りる|Get off at the next stop.
take off|v|脱ぐ|Take off your shoes.
put on|v|着る・身につける|Put on your coat.
turn on|v|（電気などを）つける|Turn on the light.
turn off|v|（電気などを）消す|Turn off the TV.
look after|v|世話をする|I look after my little sister.
give up|v|あきらめる|Don't give up.
find out|v|わかる・知る|I found out the truth.
grow up|v|成長する|I grew up in Osaka.
die|v|死ぬ|My goldfish died.
allow|v|許可する・許す|Smoking is not allowed here.
forgive|v|許す|Please forgive me.
prefer|v|～のほうを好む|I prefer tea to coffee.
miss|v|乗り遅れる|I missed the bus.
recommend|v|勧める|What do you recommend?
suggest|v|提案する|I suggest we take a taxi.
advise|v|助言する|The doctor advised me to rest.
expect|v|予期する・期待する|I expect a call from him.
seem|v|～のように見える|You seem tired.
point|v|指さす|Don't point at people.
wave|v|手を振る|She waved goodbye.
nod|v|うなずく|He nodded and smiled.
knock|v|ノックする|Knock before you enter.
wrap|v|包む|Could you wrap it as a gift?
pack|v|荷造りする|I'm packing for my trip.
weigh|v|重さを量る|Please weigh these apples.
measure|v|測る|Let me measure your size.
charge|v|（料金を）請求する|They charged me ten dollars.
match|v|調和する|This bag matches your shoes.
display|v|展示する|The new shoes are displayed in the window.
advertise|v|宣伝する|They advertise on TV.
reduce|v|減らす|We reduced the price.
rise|v|上がる|Prices rose last year.
gain|v|（体重などが）増える・得る|I gained two kilos.
select|v|選び出す|Select a size.
remove|v|取り除く|Please remove your shoes.
replace|v|取り替える|We'll replace the broken item.
handle|v|扱う|Handle with care.
# ようす
available|a|利用できる|Is this seat available?
comfortable|a|快適な|This chair is comfortable.
convenient|a|便利な|This store is very convenient.
useful|a|役に立つ|This book is useful.
helpful|a|助けになる・役に立つ|The staff were very helpful.
reasonable|a|手ごろな|The price is reasonable.
special|a|特別な|Today is a special day.
fresh|a|新鮮な|These vegetables are fresh.
ripe|a|熟した|The bananas are ripe.
raw|a|生の|I can't eat raw fish.
spicy|a|辛い|This curry is spicy.
salty|a|塩辛い|The soup is too salty.
sour|a|すっぱい|Lemons are sour.
bitter|a|苦い|This coffee is bitter.
soft|a|やわらかい|This bread is soft.
hard|a|かたい|This bread is hard.
smooth|a|なめらかな|The road is smooth.
wide|a|（幅が）広い|The river is wide.
narrow|a|（幅が）狭い|The street is narrow.
deep|a|深い|The lake is deep.
thick|a|厚い|This book is thick.
thin|a|薄い|The ice is thin.
round|a|丸い|The table is round.
square|a|四角い|The box is square.
loose|a|ゆるい|These pants are loose.
tight|a|きつい|These shoes are tight.
plain|a|無地の|I like plain shirts.
modern|a|現代的な|This building is modern.
traditional|a|伝統的な|This is a traditional Japanese house.
ancient|a|古代の|We visited an ancient city.
foreign|a|外国の|I like foreign movies.
local|a|地元の|Try the local food.
national|a|国の|Today is a national holiday.
public|a|公共の|This is a public park.
private|a|個人の|This is a private beach.
main|a|主な|This is the main street.
simple|a|単純な|The rules are simple.
clear|a|はっきりした|The instructions are clear.
correct|a|正しい・正確な|Your answer is correct.
exact|a|正確な|What's the exact time?
possible|a|可能な|Is it possible?
impossible|a|不可能な|It's impossible.
necessary|a|必要な|Is it necessary?
certain|a|確信して|I'm certain he'll come.
careful|a|注意深い|Be careful.
careless|a|不注意な|That was careless of me.
polite|a|礼儀正しい|He is very polite.
rude|a|失礼な|Don't be rude.
honest|a|正直な|She is an honest person.
gentle|a|穏やかな|He is gentle with children.
brave|a|勇敢な|The firefighter was brave.
smart|a|頭のいい・賢い|She is a smart student.
clever|a|賢い|What a clever idea!
lazy|a|怠けた|Don't be lazy.
proud|a|誇りに思って|I'm proud of you.
shy|a|恥ずかしがりの|She is shy.
nervous|a|緊張した|I'm nervous about the test.
afraid|a|怖がって|I'm afraid of dogs.
angry|a|怒った|He was angry.
surprised|a|驚いた|I was surprised at the news.
excited|a|わくわくした|I'm excited about the trip.
bored|a|退屈した|I'm bored.
lonely|a|さびしい|I felt lonely.
worried|a|心配した|I'm worried about him.
satisfied|a|満足した|I'm satisfied with the result.
healthy|a|健康な|Eat healthy food.
alive|a|生きている|The fish is still alive.
dead|a|死んだ・（電池が）切れた|The battery is dead.
awake|a|目が覚めて|I was awake all night.
asleep|a|眠って|The baby is asleep.
absent|a|欠席の|He was absent from school.
crowded|a|混雑した|The train was crowded.
closed|a|閉まっている|The shop is closed today.
broken|a|壊れた|My phone is broken.
wet|a|ぬれた|The road is wet.
dry|a|乾いた|The towel is dry.
cloudy|a|くもりの|It's cloudy today.
sunny|a|晴れた|It's sunny today.
rainy|a|雨の|It's a rainy day.
windy|a|風の強い|It's windy today.
huge|a|巨大な|That's a huge building.
tiny|a|ちっぽけな|The room is tiny.
whole|a|全体の|I ate the whole cake.
extra|a|追加の|Is there an extra charge?
daily|a|毎日の|This is my daily routine.
weekly|a|毎週の|It's a weekly magazine.
recent|a|最近の|This is a recent photo.
final|a|最後の|This is the final sale.
last|a|この前の・最後の|I saw him last week.
next|a|次の|See you next week.
previous|a|前の|The previous owner lived here.
quick|a|すばやい|Let's have a quick lunch.
loud|a|（音が）大きい|The music is too loud.
silent|a|無言の|The room was silent.
calm|a|落ち着いた|Stay calm.
wonderful|a|すばらしい|We had a wonderful time.
excellent|a|優れた|The food was excellent.
terrible|a|ひどい|The weather was terrible.
perfect|a|完ぺきな|Your English is perfect.
real|a|本物の・本当の|Is this a real diamond?
true|a|本当の|Is it true?
native|a|母国の|English is his native language.
international|a|国際的な|This is an international school.
rare|a|珍しい|This bird is rare.
common|a|よくある|It's a common name.
usual|a|いつもの|I'll have the usual.
strange|a|奇妙な|I heard a strange sound.
affordable|a|手の届く値段の|This phone is affordable.
valuable|a|高価な・貴重な|This ring is valuable.
used|a|中古の|I bought a used car.
brand-new|a|真新しい|This bike is brand-new.
limited|a|限られた|This is a limited offer.
regular|a|ふつうの・定期的な|Is this the regular price?
attractive|a|魅力的な|The design is attractive.
colorful|a|色とりどりの|The market is colorful.
fashionable|a|流行の|She wears fashionable clothes.
similar|a|似ている|These two bags are similar.
# そのほか（副詞・前置詞など）
anyway|o|とにかく|Anyway, let's go.
instead|o|その代わりに|Let's have tea instead.
probably|o|おそらく・たぶん|He'll probably come.
perhaps|o|もしかすると・たぶん|Perhaps you're right.
especially|o|特に|I like fruit, especially apples.
finally|o|ついに|Finally, the bus came.
suddenly|o|突然|Suddenly, it started to rain.
quickly|o|すばやく|He ran quickly.
slowly|o|ゆっくりと|Please speak slowly.
carefully|o|注意深く|Drive carefully.
easily|o|簡単に|I can do it easily.
quietly|o|静かに|Close the door quietly.
recently|o|最近|I recently moved here.
once|o|一度|I've been there once.
twice|o|二度|I visit my parents twice a month.
ago|o|～前に|I came here two years ago.
later|o|あとで|See you later.
yet|o|（疑問文で）もう|Have you finished yet?
ever|o|今までに|Have you ever been to Kyoto?
enough|o|十分に|Is it big enough?
even|o|～でさえ|Even children can do it.
else|o|ほかに|Anything else?
away|o|離れて|Go away!
back|o|戻って|I'll be back soon.
outside|o|外で|Let's play outside.
inside|o|中に|Come inside.
upstairs|o|上の階へ|My room is upstairs.
downstairs|o|下の階へ|The kitchen is downstairs.
everywhere|o|どこでも|I looked everywhere.
somewhere|o|どこかに|I left my key somewhere.
nearby|o|近くに|Is there a bank nearby?
straight|o|まっすぐに|Go straight.
across|o|～を横切って|Walk across the bridge.
along|o|～に沿って|Walk along the river.
through|o|～を通って|We drove through the tunnel.
around|o|～のまわりに|We walked around the lake.
behind|o|～の後ろに|The park is behind the station.
beside|o|～のそばに|Sit beside me.
above|o|～の上に|The light is above the table.
below|o|～より下に|Write your name below the line.
against|o|～に反対して|I'm against the plan.
toward|o|～の方へ|He walked toward the door.
since|o|～以来|I've lived here since 2020.
while|o|～する間に|I listened to music while I cooked.
though|o|～だけれども|Though it was raining, we went out.
unless|o|～しない限り|You can't enter unless you have a ticket.
however|o|しかしながら|It's cheap. However, the quality is low.
both|o|両方|Both of us like coffee.
either|o|どちらか|You can have either cake.
neither|o|どちらも～ない|Neither answer is right.
each|o|それぞれの|Each room has a TV.
every|o|すべての|Every student has a book.
few|o|ほとんどない|Few people came.
several|o|いくつかの|I have several questions.
plenty|o|たくさん|We have plenty of time.
per|o|～につき|It's ten dollars per person.
nearly|o|ほぼ|It's nearly six o'clock.
exactly|o|ちょうど・正確に|It costs exactly ten dollars.
rather|o|むしろ|I'd rather stay home.
anymore|o|もう（～ない）|I don't go there anymore.
actually|o|実は|Actually, I'm a teacher.
of course|o|もちろん|Of course you can.
for example|o|たとえば|I like fruit, for example apples.
`;
