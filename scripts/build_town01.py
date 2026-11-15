"""最初の街「あいさつと自己紹介」の問題ファイルを作る。

使い方: python3 build_town01.py 出力先.json
選択肢は「正解を先頭」に書き、ここで並びを混ぜて正解の位置を記録する。
並びは問題IDと選択肢の数だけで決まるので、選択肢の文字を直しても並びは変わらない。

文中の {{name_ja}} {{given_ja}} {{name_en}} {{given_en}} は、アプリが出題するときに
本人の名前（フルネーム・下の名前、日本語・英語）に置き換える。
"""
import json
import random
import sys

TOWN = "town01"

# ---------- 語彙（4択）: (英文, 注目する語句 or None, 正解, 誤答3つ) ----------
VOCAB = [
    ("Nice to meet you.", "meet", "会う", ["食べる", "待つ", "話す"]),
    ("Where are you from?", "from", "〜から（出身）", ["〜まで", "〜の上に", "〜と一緒に"]),
    ("What do you do for a living?", "for a living", "仕事として", ["趣味として", "休みの日に", "生まれつき"]),
    ("I work at a hospital.", "hospital", "病院", ["学校", "銀行", "郵便局"]),
    ("This is my coworker, Ken.", "coworker", "同僚", ["上司", "親戚", "隣人"]),
    ("I'm originally from Osaka.", "originally", "もともとは", ["たぶん", "ときどき", "すぐに"]),
    ("What are your hobbies?", "hobbies", "趣味", ["仕事", "予定", "家族"]),
    ("I live with my family.", "live", "住む", ["去る", "働く", "遊ぶ"]),
    ("Let me introduce myself.", "introduce", "紹介する", ["説明する", "招待する", "案内する"]),
    ("Have we met before?", "before", "以前に", ["あとで", "すぐに", "一緒に"]),
    ("I'm a big fan of soccer.", "a big fan of", "〜が大好きだ", ["〜が苦手だ", "〜に詳しい", "〜を習っている"]),
    ("How do you spell your name?", "spell", "つづる", ["呼ぶ", "発音する", "覚える"]),
    ("I'm in my thirties.", "in my thirties", "30代だ", ["30歳だ", "30年間", "30人で"]),
    ("What brought you here?", None, "どうしてここに来たのですか", ["何を持ってきましたか", "ここは何ですか", "いつ来ましたか"]),
    ("I'm glad to be here.", "glad", "うれしい", ["疲れた", "驚いた", "緊張した"]),
    ("I grew up in a small town.", "grew up", "育った", ["引っ越した", "生まれた", "訪れた"]),
    ("I'm an office worker.", "office worker", "会社員", ["公務員", "店員", "学生"]),
    ("My nickname is Taka.", "nickname", "あだ名", ["名字", "本名", "肩書き"]),
    ("I moved here last year.", "moved", "引っ越した", ["旅行した", "働いた", "泊まった"]),
    ("How's it going?", None, "調子はどう？", ["どこへ行くの？", "いつ始まるの？", "何をしているの？"]),
    ("Long time no see.", None, "久しぶり", ["はじめまして", "また明日", "お先にどうぞ"]),
    ("I'm married and have two kids.", "married", "結婚している", ["独身だ", "忙しい", "引退している"]),
    ("I'm interested in cooking.", "interested in", "〜に興味がある", ["〜が得意だ", "〜に飽きた", "〜を心配している"]),
    ("Please call me Yuki.", "call", "呼ぶ", ["電話を切る", "待つ", "探す"]),
    ("It was nice talking to you.", None, "お話しできてよかったです", ["はじめまして", "お待たせしました", "お世話になります"]),
    ("I'm on vacation.", "on vacation", "休暇中", ["出張中", "勤務中", "留学中"]),
    ("I'm here on business.", "on business", "仕事で", ["観光で", "留学で", "偶然"]),
    ("What's your favorite food?", "favorite", "お気に入りの",["いちばん高い", "苦手な", "珍しい"]),
    ("I've been learning English for two years.", "for two years", "2年間", ["2年前に", "2年後に", "2回"]),
    ("See you around.", None, "またね", ["お大事に", "ようこそ", "失礼しました"]),
]

# ---------- 文法（穴埋め4択）: (英文, 正解, 誤答3つ, 解説) ----------
GRAMMAR = [
    ("I ___ from Japan.", "am", ["is", "are", "be"], "主語が I のとき、be動詞は am。"),
    ("She ___ a teacher.", "is", ["am", "are", "be"], "主語が she / he / it のとき、be動詞は is。"),
    ("Where ___ you from?", "are", ["is", "am", "do"], "主語が you のとき、be動詞は are。"),
    ("What ___ you do?", "do", ["are", "does", "is"], "一般動詞の疑問文は do を使う。主語が you なので do。"),
    ("He ___ in Tokyo.", "lives", ["live", "living", "is live"], "主語が he で現在のことなので、動詞に s がつく。"),
    ("Nice ___ meet you.", "to", ["for", "at", "in"], "Nice to meet you. は決まった言い方。to + 動詞の原形。"),
    ("I ___ two brothers.", "have", ["has", "am", "having"], "主語が I なので have。has は he / she のとき。"),
    ("___ you like sports?", "Do", ["Are", "Does", "Is"], "like は一般動詞なので Do で始める。"),
    ("This is ___ friend, Mika.", "my", ["me", "I", "mine"], "名詞の前に置く「私の」は my。"),
    ("I'm interested ___ music.", "in", ["on", "at", "for"], "be interested in 〜 で「〜に興味がある」。"),
    ("How long ___ you lived here?", "have", ["are", "do", "did"], "今まで続いている期間をたずねるときは have + 過去分詞。"),
    ("I've lived here ___ 2020.", "since", ["for", "from", "in"], "始まった時点を言うときは since。"),
    ("I've worked here ___ three years.", "for", ["since", "during", "in"], "期間の長さを言うときは for。"),
    ("What does your father ___?", "do", ["does", "did", "doing"], "does のあとの動詞は原形。"),
    ("I enjoy ___ movies.", "watching", ["watch", "to watch", "watched"], "enjoy のあとは動詞の ing 形。"),
    ("I ___ born in Osaka.", "was", ["am", "did", "were"], "「生まれた」は was born。主語が I なので was。"),
    ("My sister ___ at a bank.", "works", ["work", "working", "is work"], "主語が my sister（3人称単数）なので works。"),
    ("I'm ___ engineer.", "an", ["a", "the", "（何も入れない）"], "母音の音で始まる語の前は an。"),
    ("Are you a student? — Yes, I ___.", "am", ["do", "are", "is"], "Are you 〜? には Yes, I am. で答える。"),
    ("Do you live near here? — No, I ___.", "don't", ["am not", "doesn't", "not"], "Do you 〜? には No, I don't. で答える。"),
    ("I ___ speak English very well.", "can't", ["am not", "don't can", "not"], "「〜できない」は can't + 動詞の原形。"),
    ("I'd like ___ introduce my wife.", "to", ["for", "at", "of"], "I'd like to + 動詞の原形 で「〜したいのですが」。"),
    ("What's ___ name?", "your", ["you", "yours", "you're"], "名詞の前に置く「あなたの」は your。"),
    ("I'm looking forward to ___ with you.", "working", ["work", "worked", "be work"], "look forward to のあとは動詞の ing 形。"),
    ("I ___ here last month.", "came", ["come", "comes", "coming"], "last month は過去なので、come の過去形 came。"),
    ("___ is your birthday?", "When", ["Where", "Who", "What time"], "日付をたずねるときは When。"),
    ("I'm good ___ cooking.", "at", ["in", "on", "with"], "be good at 〜 で「〜が得意だ」。"),
    ("She ___ like coffee.", "doesn't", ["don't", "isn't", "not"], "主語が she のときの否定は doesn't + 動詞の原形。"),
    ("We ___ classmates ten years ago.", "were", ["was", "are", "did"], "ten years ago は過去。主語が we なので were。"),
    ("There ___ four people in my family.", "are", ["is", "have", "has"], "あとに続く名詞が複数（four people）なので There are。"),
]

# ---------- リスニング（4択）: (読み上げる英文, 正解, 誤答3つ) ----------
LISTENING = [
    ("Nice to meet you.", "はじめまして", ["また会いましょう", "お久しぶりです", "お元気ですか"]),
    ("How are you doing?", "調子はどうですか", ["何をしていますか", "どこへ行きますか", "どうやって来ましたか"]),
    ("Where are you from?", "ご出身はどちらですか", ["どこに住んでいますか", "どこへ行きますか", "どこで働いていますか"]),
    ("What do you do?", "お仕事は何ですか", ["今何をしていますか", "何がしたいですか", "何が好きですか"]),
    ("I work for a travel company.", "旅行会社で働いています", ["旅行が好きです", "旅行会社を探しています", "仕事で旅行しています"]),
    ("I've lived here for five years.", "ここに5年間住んでいます", ["ここに5回来たことがあります", "あと5年ここに住みます", "5歳までここに住んでいました"]),
    ("What do you do in your free time?", "暇なときは何をしていますか", ["いつ暇ですか", "自由な時間はありますか", "仕事は何時に終わりますか"]),
    ("I'm sorry, I didn't catch your name.", "すみません、お名前が聞き取れませんでした", ["すみません、お名前を忘れました", "すみません、名前を間違えました", "すみません、名乗るのを忘れました"]),
    ("Could you say that again?", "もう一度言っていただけますか", ["もう少しゆっくり話していただけますか", "それを書いていただけますか", "それは本当ですか"]),
    ("Please call me Ken.", "ケンと呼んでください", ["ケンに電話してください", "ケンを呼んでください", "ケンと話してください"]),
    ("This is my wife, Emi.", "こちらは妻のエミです", ["妻のエミはここにいます", "これは妻のエミのものです", "妻のエミを探しています"]),
    ("How long have you been in Japan?", "日本に来てどのくらいですか", ["日本にはいつまでいますか", "日本は何回目ですか", "日本のどこに行きましたか"]),
    ("I'm from a small town in the north.", "北のほうの小さな町の出身です", ["北にある小さな町に住みたいです", "北の小さな町へ行きます", "小さな町の北側に住んでいます"]),
    ("Do you have any brothers or sisters?", "きょうだいはいますか", ["ご両親はお元気ですか", "お子さんはいますか", "ご家族は何人ですか"]),
    ("I have one older sister.", "姉が1人います", ["妹が1人います", "兄が1人います", "姉が2人います"]),
    ("What kind of music do you like?", "どんな音楽が好きですか", ["音楽は好きですか", "楽器は弾けますか", "誰の曲を聴いていますか"]),
    ("I like watching baseball.", "野球を見るのが好きです", ["野球をするのが好きです", "野球を見に行きました", "野球は好きではありません"]),
    ("It's nice to finally meet you.", "やっとお会いできてうれしいです", ["また会えてうれしいです", "最後に会えてよかったです", "会うのは久しぶりですね"]),
    ("I've heard a lot about you.", "お噂はかねがね伺っています", ["あなたに話したいことがたくさんあります", "あなたのことをよく知りません", "あなたから多くを学びました"]),
    ("What do you think of Japan?", "日本をどう思いますか", ["日本について何を知っていますか", "日本で何をしたいですか", "日本にはなぜ来たのですか"]),
    ("I'm still learning English.", "英語はまだ勉強中です", ["英語はもう勉強していません", "英語を教えています", "英語の勉強を始めたいです"]),
    ("Please speak a little more slowly.", "もう少しゆっくり話してください", ["もう少し大きな声で話してください", "もう一度話してください", "少し待ってください"]),
    ("How was your weekend?", "週末はどうでしたか", ["週末は何をしますか", "週末は空いていますか", "週末はいつですか"]),
    ("I'm doing great, thanks.", "元気です、ありがとう", ["よくできました、ありがとう", "手伝ってくれてありがとう", "大丈夫です、結構です"]),
    ("Are you here on vacation?", "休暇でこちらに来ているのですか", ["ここで休んでもいいですか", "休暇はいつですか", "ここは休みですか"]),
    ("I work from home.", "在宅で働いています", ["家の近くで働いています", "仕事から家に帰ります", "家で仕事を探しています"]),
    ("What's your job like?", "お仕事はどんな感じですか", ["どんな仕事が好きですか", "お仕事は何ですか", "仕事は好きですか"]),
    ("I'll see you later.", "またあとで", ["お先にどうぞ","あとで見ておきます", "遅れてすみません"]),
    ("Take care.", "気をつけてね（お元気で）", ["任せてください", "持っていってください", "落ち着いてください"]),
    ("Let's keep in touch.", "これからも連絡を取り合いましょう", ["そのまま触らないでください", "また今度会いましょう", "少し休憩しましょう"]),
]

# ---------- ライティング（AI採点）: (日本語, 模範解答のリスト) ----------
WRITING = [
    ("はじめまして。", ["Nice to meet you."]),
    ("私の名前は{{name_ja}}です。", ["My name is {{name_en}}.", "I'm {{name_en}}."]),
    ("日本の出身です。", ["I'm from Japan.", "I come from Japan."]),
    ("東京に住んでいます。", ["I live in Tokyo."]),
    ("会社員です。", ["I'm an office worker.", "I work for a company."]),
    ("お仕事は何ですか。", ["What do you do?", "What do you do for a living?"]),
    ("ご出身はどちらですか。", ["Where are you from?"]),
    ("趣味は料理です。", ["My hobby is cooking.", "I like cooking."]),
    ("兄が1人います。", ["I have an older brother.", "I have one older brother."]),
    ("{{given_ja}}と呼んでください。", ["Please call me {{given_en}}."]),
    ("お会いできてうれしいです。", ["I'm glad to meet you.", "I'm happy to meet you.", "It's nice to meet you."]),
    ("英語を勉強しています。", ["I'm studying English.", "I'm learning English."]),
    ("ここに3年住んでいます。", ["I've lived here for three years.", "I have lived here for three years.", "I've been living here for three years."]),
    ("週末は何をしていますか。", ["What do you do on weekends?", "What do you do on the weekend?"]),
    ("映画を見るのが好きです。", ["I like watching movies.", "I like to watch movies."]),
    ("こちらは友人のケンです。", ["This is my friend, Ken."]),
    ("大阪で生まれました。", ["I was born in Osaka."]),
    ("もう一度言ってもらえますか。", ["Could you say that again?", "Can you say that again?"]),
    ("病院で働いています。", ["I work at a hospital.", "I work in a hospital."]),
    ("元気ですか。", ["How are you?", "How are you doing?", "How's it going?"]),
    ("元気です。あなたは？", ["I'm good. How about you?", "I'm fine. And you?", "I'm doing well. How about you?"]),
    ("家族は4人です。", ["There are four people in my family.", "I have a family of four."]),
    ("音楽に興味があります。", ["I'm interested in music."]),
    ("去年ここに引っ越してきました。", ["I moved here last year."]),
    ("日本に来てどのくらいですか。", ["How long have you been in Japan?"]),
    ("お話しできてよかったです。", ["It was nice talking to you.", "It was nice talking with you."]),
    ("また会いましょう。", ["See you again.", "Let's meet again.", "I hope to see you again."]),
    ("私は30代です。", ["I'm in my thirties.", "I'm in my 30s."]),
    ("英語はあまり上手に話せません。", ["I can't speak English very well.", "I don't speak English very well."]),
    ("お名前はどうつづりますか。", ["How do you spell your name?"]),
]

# ---------- スピーキング（AI採点）----------
# 日本語を見て英語で言う: (日本語, 模範解答のリスト)
SPEAK_SAY = [
    ("こんにちは、はじめまして。", ["Hello, nice to meet you.", "Hi, nice to meet you."]),
    ("こちらこそ、はじめまして。", ["Nice to meet you, too."]),
    ("調子はどうですか。", ["How are you doing?", "How's it going?", "How are you?"]),
    ("私は大阪の出身です。", ["I'm from Osaka."]),
    ("お名前をもう一度お願いします。", ["Could you tell me your name again?", "Can I have your name again?", "What was your name again?"]),
    ("私は教師をしています。", ["I'm a teacher.", "I work as a teacher."]),
    ("暇なときは本を読みます。", ["I read books in my free time."]),
    ("妹が2人います。", ["I have two younger sisters."]),
    ("あなたの趣味は何ですか。", ["What are your hobbies?", "What is your hobby?"]),
    ("もう少しゆっくり話してもらえますか。", ["Could you speak a little more slowly?", "Can you speak more slowly?"]),
    ("仕事でここに来ています。", ["I'm here on business.", "I'm here for work."]),
    ("英語はまだ勉強中です。", ["I'm still learning English.", "I'm still studying English."]),
    ("お久しぶりです。", ["Long time no see.", "It's been a while.", "It's been a long time."]),
    ("お話しできて楽しかったです。", ["It was nice talking to you.", "I enjoyed talking with you.", "I enjoyed talking to you."]),
    ("また近いうちに会いましょう。", ["See you soon.", "Let's meet again soon.", "I hope to see you again soon."]),
]
# 英語の質問に自分の言葉で答える: (英語の質問, 質問の意味, 答えの例のリスト)
SPEAK_ANSWER = [
    ("What's your name?", "お名前は何ですか。", ["My name is {{given_en}}.", "I'm {{given_en}}."]),
    ("Where are you from?", "ご出身はどちらですか。", ["I'm from Japan."]),
    ("What do you do?", "お仕事は何ですか。", ["I'm an office worker.", "I work at a hospital."]),
    ("How are you today?", "今日の調子はどうですか。", ["I'm good, thank you.", "I'm doing well, thanks."]),
    ("Where do you live?", "どこに住んでいますか。", ["I live in Tokyo."]),
    ("What do you do in your free time?", "暇なときは何をしていますか。", ["I like watching movies.", "I usually read books."]),
    ("Do you have any brothers or sisters?", "きょうだいはいますか。", ["Yes, I have one older brother.", "No, I'm an only child."]),
    ("What kind of food do you like?", "どんな食べ物が好きですか。", ["I like Japanese food.", "I love ramen."]),
    ("How long have you been studying English?", "英語を勉強してどのくらいですか。", ["I've been studying English for two years.", "For about a year."]),
    ("Why are you learning English?", "なぜ英語を学んでいるのですか。", ["Because I want to talk with people from other countries.", "I want to use English when I travel."]),
    ("What's your favorite season?", "いちばん好きな季節は何ですか。", ["My favorite season is spring.", "I like summer the best."]),
    ("What do you like about your town?", "自分の町のどこが好きですか。", ["I like the food there.", "It's quiet, and the people are kind."]),
    ("Have you ever been abroad?", "海外に行ったことはありますか。", ["Yes, I've been to Korea.", "No, I haven't."]),
    ("What are you going to do this weekend?", "今週末は何をする予定ですか。", ["I'm going to see my friends.", "I'm going to stay home and relax."]),
    ("Could you tell me a little about yourself?", "少し自己紹介をしていただけますか。", ["My name is {{given_en}}. I'm from Japan, and I work at a hospital.", "I'm {{given_en}}. I live in Tokyo, and I like cooking."]),
]


def shuffled(qid, correct, wrong):
    """選択肢を混ぜ、正解の位置（0始まり）を返す。IDごとに毎回同じ並びになる。"""
    choices = [correct] + list(wrong)
    random.Random(qid).shuffle(choices)
    return choices, choices.index(correct)


def build():
    out = []

    for i, (sentence, word, correct, wrong) in enumerate(VOCAB, 1):
        qid = f"{TOWN}-voc-{i:03d}"
        choices, answer = shuffled(qid, correct, wrong)
        if word:
            prompt = f"「{sentence}」の {word} の意味は？"
            explanation = f"{word} = {correct}"
        else:
            prompt = f"「{sentence}」の意味は？"
            explanation = f"{sentence} = {correct}"
        out.append({
            "id": qid, "town": TOWN, "skill": "vocabulary", "format": "choice4",
            "prompt": prompt, "sentence": sentence,
            "choices": choices, "answer": answer,
            "explanation": explanation, "difficulty": 1, "needs_fix": False,
        })

    for i, (sentence, correct, wrong, why) in enumerate(GRAMMAR, 1):
        qid = f"{TOWN}-gra-{i:03d}"
        choices, answer = shuffled(qid, correct, wrong)
        out.append({
            "id": qid, "town": TOWN, "skill": "grammar", "format": "choice4",
            "prompt": "空欄に入る語句は？", "sentence": sentence,
            "choices": choices, "answer": answer,
            "explanation": why, "difficulty": 1, "needs_fix": False,
        })

    for i, (audio, correct, wrong) in enumerate(LISTENING, 1):
        qid = f"{TOWN}-lis-{i:03d}"
        choices, answer = shuffled(qid, correct, wrong)
        out.append({
            "id": qid, "town": TOWN, "skill": "listening", "format": "choice4",
            "prompt": "聞こえた英文の意味は？", "audio_text": audio,
            "choices": choices, "answer": answer,
            "explanation": f"{audio} = {correct}", "difficulty": 1, "needs_fix": False,
        })

    for i, (ja, models) in enumerate(WRITING, 1):
        out.append({
            "id": f"{TOWN}-wri-{i:03d}", "town": TOWN, "skill": "writing", "format": "translate",
            "prompt": "英語で書こう", "sentence": ja,
            "model_answers": models, "difficulty": 1, "needs_fix": False,
        })

    n = 0
    for ja, models in SPEAK_SAY:
        n += 1
        out.append({
            "id": f"{TOWN}-spe-{n:03d}", "town": TOWN, "skill": "speaking", "format": "translate",
            "prompt": "英語で言おう", "sentence": ja,
            "model_answers": models, "difficulty": 1, "needs_fix": False,
        })
    for en, ja, models in SPEAK_ANSWER:
        n += 1
        out.append({
            "id": f"{TOWN}-spe-{n:03d}", "town": TOWN, "skill": "speaking", "format": "respond",
            "prompt": "質問に英語で答えよう", "sentence": en, "sentence_ja": ja,
            "model_answers": models, "difficulty": 1, "needs_fix": False,
        })
    return out


def check(questions):
    """機械的に確認できることを全部確かめる。問題があれば止める。"""
    ids = [q["id"] for q in questions]
    assert len(ids) == len(set(ids)), "IDが重複している"
    per_skill = {}
    for q in questions:
        per_skill[q["skill"]] = per_skill.get(q["skill"], 0) + 1
        if q["format"] == "choice4":
            assert len(q["choices"]) == 4, q["id"]
            assert len(set(q["choices"])) == 4, f"選択肢が重複: {q['id']}"
            assert 0 <= q["answer"] <= 3, q["id"]
            if q["skill"] == "grammar":
                assert q["sentence"].count("___") == 1, f"空欄が1つでない: {q['id']}"
        else:
            assert q["model_answers"] and all(m.strip() for m in q["model_answers"]), q["id"]
            assert len(set(q["model_answers"])) == len(q["model_answers"]), f"模範解答が重複: {q['id']}"
    assert per_skill == {"vocabulary": 30, "grammar": 30, "listening": 30, "writing": 30, "speaking": 30}, per_skill
    # 同じ能力値の中で、同じ出題が2回ないか
    seen = set()
    for q in questions:
        key = (q["skill"], q.get("sentence") or q.get("audio_text"))
        assert key not in seen, f"出題が重複: {q['id']}"
        seen.add(key)
    # 正解の位置が偏っていないか
    pos = [0, 0, 0, 0]
    for q in questions:
        if q["format"] == "choice4":
            pos[q["answer"]] += 1
    return per_skill, pos


if __name__ == "__main__":
    questions = build()
    per_skill, pos = check(questions)
    data = {
        "format_version": 1,
        "town": {"id": TOWN, "scene": "あいさつと自己紹介", "difficulty": "基本", "order": 1},
        "questions": questions,
    }
    with open(sys.argv[1], "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print("問題数:", len(questions), per_skill)
    print("正解の位置（1番目〜4番目）:", pos)
