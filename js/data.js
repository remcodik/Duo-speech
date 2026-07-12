/* Lingo Isle — static game content: languages, scenarios, scripted dialogue, mini-games.
   Japanese content is authored with spaces between words (wakachigaki, common in
   learner materials) so word-based games work; comparison logic strips spaces. */
"use strict";

window.LINGO = window.LINGO || {};

LINGO.LANGUAGES = {
  sv: { name: "Swedish",  flag: "🇸🇪", bcp47: "sv-SE" },
  it: { name: "Italian",  flag: "🇮🇹", bcp47: "it-IT" },
  ja: { name: "Japanese", flag: "🇯🇵", bcp47: "ja-JP" },
};

LINGO.LEVELS = {
  beginner:     { emoji: "🐣", label: "Just starting",   cefr: "an absolute beginner (CEFR A1) — use very short, very simple sentences" },
  elementary:   { emoji: "🌱", label: "I know a little", cefr: "an elementary learner (CEFR A2) — simple sentences, everyday vocabulary" },
  intermediate: { emoji: "🦜", label: "Conversational",  cefr: "an intermediate learner (CEFR B1) — natural but clear language" },
  advanced:     { emoji: "🏄", label: "Pretty confident", cefr: "an advanced learner (CEFR B2-C1) — speak naturally and also coach style and nuance" },
};

/*
 * Scenarios. Each has a character, a mission, and a scripted dialogue tree used
 * when AI is off (and as the opening line when AI is on). Every step:
 *   line:   what the character says, per language
 *   tr:     English translation
 *   hint:   suggestion of what to say, per language
 *   expect: keywords (normalized: lowercase, accent-insensitive) counting as success
 */
LINGO.SCENARIOS = [
  {
    id: "cafe", emoji: "☕", name: "Sunny Café", color: "#f59e0b",
    character: { name: "Mila", emoji: "😀", persona: "Mila, a cheerful barista who loves puns and gets theatrically excited about pastries" },
    mission: "Order a drink and something to eat",
    unlockStars: 0,
    steps: [
      {
        line: { sv: "Hej! Välkommen till kaféet. Vad vill du dricka?", it: "Ciao! Benvenuto al caffè. Cosa vuoi da bere?", ja: "こんにちは！カフェへようこそ。何を飲みますか？" },
        tr: "Hi! Welcome to the café. What do you want to drink?",
        hint: { sv: "Jag skulle vilja ha en kaffe, tack", it: "Vorrei un caffè, per favore", ja: "コーヒーをください" },
        expect: { sv: ["kaffe", "te", "vatten", "juice", "mjolk", "choklad", "vill"], it: ["caffe", "te", "acqua", "succo", "latte", "cioccolata", "vorrei"], ja: ["コーヒー", "こーひー", "お茶", "おちゃ", "紅茶", "水", "みず", "ジュース", "ミルク", "ココア", "ください"] },
      },
      {
        line: { sv: "Bra val! Vill du äta något också? Vi har kanelbullar och tårta.", it: "Ottima scelta! Vuoi anche mangiare qualcosa? Abbiamo cornetti e torta.", ja: "いいですね！何か食べますか？クロワッサンとケーキがありますよ。" },
        tr: "Great choice! Do you want to eat something too? We have pastries and cake.",
        hint: { sv: "En kanelbulle, tack", it: "Un cornetto, per favore", ja: "クロワッサンをください" },
        expect: { sv: ["kanelbulle", "tarta", "inget", "ja", "tack"], it: ["cornetto", "torta", "niente", "si", "favore"], ja: ["クロワッサン", "ケーキ", "何も", "なにも", "はい", "ください"] },
      },
      {
        line: { sv: "Perfekt! Det blir fem euro. Tack och ha en bra dag!", it: "Perfetto! Sono cinque euro. Grazie e buona giornata!", ja: "はい！五百円です。ありがとうございました！良い一日を！" },
        tr: "Perfect! That'll be five (euros/yen). Thanks and have a nice day!",
        hint: { sv: "Tack, hej då!", it: "Grazie, arrivederci!", ja: "ありがとう、さようなら！" },
        expect: { sv: ["tack", "hej da", "hejda", "adjo", "vi ses"], it: ["grazie", "arrivederci", "ciao"], ja: ["ありがとう", "さようなら", "またね", "どうも"] },
      },
    ],
  },
  {
    id: "market", emoji: "🍉", name: "Fruit Market", color: "#22c55e",
    character: { name: "Rafa", emoji: "🧑‍🌾", persona: "Rafa, a booming-voiced fruit seller who claims every fruit is 'the best on the island' and haggles playfully" },
    mission: "Buy two kinds of fruit and ask the price",
    unlockStars: 0,
    steps: [
      {
        line: { sv: "Färsk frukt! Öns bästa! Vad vill du köpa?", it: "Frutta fresca! La migliore dell'isola! Cosa vuoi comprare?", ja: "新鮮なフルーツだよ！島で一番！何を買いますか？" },
        tr: "Fresh fruit! The best on the island! What do you want to buy?",
        hint: { sv: "Jag skulle vilja ha två äpplen", it: "Vorrei due mele", ja: "りんごを二つください" },
        expect: { sv: ["apple", "applen", "banan", "apelsin", "vattenmelon", "druvor", "jordgubb", "vill"], it: ["mela", "mele", "banana", "arancia", "anguria", "uva", "fragola", "vorrei"], ja: ["りんご", "リンゴ", "林檎", "バナナ", "オレンジ", "みかん", "スイカ", "すいか", "ぶどう", "いちご", "ください"] },
      },
      {
        line: { sv: "Utmärkt! Något mer? Bananerna är söta som solen!", it: "Eccellente! Qualcos'altro? Le banane sono dolci come il sole!", ja: "いいね！他には？バナナは太陽みたいに甘いよ！" },
        tr: "Excellent! Anything else? The bananas are as sweet as the sun!",
        hint: { sv: "Vad kostar det?", it: "Quanto costa?", ja: "いくらですか？" },
        expect: { sv: ["kostar", "mycket", "banan", "ocksa", "mer"], it: ["quanto", "costa", "banana", "anche", "altro"], ja: ["いくら", "バナナ", "ほかに", "他に", "もっと"] },
      },
      {
        line: { sv: "För dig, bara tre euro! Har vi en deal?", it: "Per te, solo tre euro! Affare fatto?", ja: "あなたには特別に三百円！どう？" },
        tr: "For you, only three (euros/yen)! Deal?",
        hint: { sv: "Ja, tack", it: "Sì, grazie", ja: "はい、ありがとう" },
        expect: { sv: ["ja", "tack", "okej", "visst", "deal"], it: ["si", "grazie", "bene", "affare"], ja: ["はい", "ありがとう", "いいです", "オーケー", "オッケー"] },
      },
    ],
  },
  {
    id: "taxi", emoji: "🚕", name: "Tuk-tuk Taxi", color: "#38bdf8",
    character: { name: "Kiko", emoji: "🦎", persona: "Kiko, a laid-back gecko taxi driver who drives a tuk-tuk, knows every shortcut, and hums constantly" },
    mission: "Tell the driver where to go and make small talk",
    unlockStars: 2,
    steps: [
      {
        line: { sv: "Hoppa in! Vart ska vi åka idag, kompis?", it: "Sali, sali! Dove andiamo oggi, amico?", ja: "乗って乗って！今日はどこへ行きますか？" },
        tr: "Hop in! Where are we going today, my friend?",
        hint: { sv: "Till stranden, tack", it: "Alla spiaggia, per favore", ja: "ビーチまでお願いします" },
        expect: { sv: ["strand", "hotell", "marknad", "centrum", "hamn"], it: ["spiaggia", "hotel", "albergo", "mercato", "centro", "porto"], ja: ["ビーチ", "海", "うみ", "ホテル", "市場", "いちば", "町", "まち", "港", "みなと"] },
      },
      {
        line: { sv: "Bra idé! Det är soligt idag, eller hur? Gillar du ön?", it: "Buona idea! C'è tanto sole oggi, vero? Ti piace l'isola?", ja: "いいね！今日はいい天気だね。島は好きですか？" },
        tr: "Good idea! It's sunny today, right? Do you like the island?",
        hint: { sv: "Ja, jag gillar den mycket", it: "Sì, mi piace molto", ja: "はい、大好きです" },
        expect: { sv: ["ja", "gillar", "mycket", "fin", "vacker", "nej"], it: ["si", "piace", "molto", "bella", "no"], ja: ["はい", "好き", "すき", "大好き", "とても", "きれい", "いいえ"] },
      },
      {
        line: { sv: "Vi är framme! Det blir fyra euro… eller ett leende!", it: "Siamo arrivati! Sono quattro euro… o un sorriso!", ja: "着きましたよ！四百円です…笑顔でもいいよ！" },
        tr: "We're here! That's four (euros/yen)… or one smile!",
        hint: { sv: "Tack, hej då!", it: "Grazie, ciao!", ja: "ありがとう、さようなら！" },
        expect: { sv: ["tack", "hej da", "hejda", "varsagod"], it: ["grazie", "ciao", "arrivederci", "ecco"], ja: ["ありがとう", "さようなら", "どうぞ", "またね"] },
      },
    ],
  },
  {
    id: "party", emoji: "🎉", name: "Beach Party", color: "#e879f9",
    character: { name: "Luna", emoji: "🧜‍♀️", persona: "Luna, a bubbly mermaid DJ at a beach party who asks lots of questions and celebrates every answer" },
    mission: "Introduce yourself and make a friend",
    unlockStars: 4,
    steps: [
      {
        line: { sv: "Hej! Vilken fest! Vad heter du?", it: "Ciao! Che bella festa! Come ti chiami?", ja: "こんにちは！すごいパーティーだね！お名前は？" },
        tr: "Hi! What a great party! What's your name?",
        hint: { sv: "Jag heter… ", it: "Mi chiamo… ", ja: "わたしは…です" },
        expect: { sv: ["jag heter", "jag ar"], it: ["mi chiamo", "sono"], ja: ["です", "といいます", "申します", "名前"] },
      },
      {
        line: { sv: "Trevligt att träffas! Var kommer du ifrån?", it: "Piacere! Di dove sei?", ja: "はじめまして！どこから来ましたか？" },
        tr: "Nice to meet you! Where are you from?",
        hint: { sv: "Jag kommer från Nederländerna", it: "Vengo dai Paesi Bassi", ja: "オランダから来ました" },
        expect: { sv: ["kommer fran", "ar fran", "fran"], it: ["vengo", "sono di", "dall", "dai"], ja: ["から", "出身", "来ました", "きました"] },
      },
      {
        line: { sv: "Vad kul! Vill du dansa med mig?", it: "Che bello! Vuoi ballare con me?", ja: "いいね！一緒に踊りませんか？" },
        tr: "So cool! Do you want to dance with me?",
        hint: { sv: "Ja, vi dansar!", it: "Sì, balliamo!", ja: "はい、踊りましょう！" },
        expect: { sv: ["ja", "dansa", "garna", "nej"], it: ["si", "ballare", "balliamo", "volentieri", "no"], ja: ["はい", "踊", "おどり", "いいえ"] },
      },
    ],
  },
];

/* Mini-game phrases (echo = repeat aloud; salad = reorder words).
   Japanese uses spaced words; kanji forms match what speech recognition outputs. */
LINGO.PHRASES = {
  sv: [
    { text: "Jag gillar stranden väldigt mycket", tr: "I like the beach very much" },
    { text: "Var är marknaden?", tr: "Where is the market?" },
    { text: "Jag skulle vilja ha en apelsinjuice", tr: "I would like an orange juice" },
    { text: "Katten sover i solen", tr: "The cat sleeps in the sun" },
    { text: "Imorgon ska vi dansa", tr: "Tomorrow we're going to dance" },
    { text: "Vattenmelonen är väldigt söt", tr: "The watermelon is very sweet" },
  ],
  it: [
    { text: "Mi piace molto la spiaggia", tr: "I really like the beach" },
    { text: "Dov'è il mercato?", tr: "Where is the market?" },
    { text: "Vorrei un succo d'arancia", tr: "I would like an orange juice" },
    { text: "Il gatto dorme al sole", tr: "The cat sleeps in the sun" },
    { text: "Domani andiamo a ballare", tr: "Tomorrow we're going dancing" },
    { text: "L'anguria è molto dolce", tr: "The watermelon is very sweet" },
  ],
  ja: [
    { text: "私 は 海 が 大好き です", tr: "I love the sea" },
    { text: "市場 は どこ です か", tr: "Where is the market?" },
    { text: "オレンジジュース を ください", tr: "An orange juice, please" },
    { text: "猫 は 外 で 寝ます", tr: "The cat sleeps outside" },
    { text: "明日 一緒 に 踊りましょう", tr: "Let's dance together tomorrow" },
    { text: "この スイカ は とても 甘い", tr: "This watermelon is very sweet" },
  ],
};

/* Badges: earned by simple thresholds, checked in state.js */
LINGO.BADGES = [
  { id: "first-words", emoji: "🐣", name: "First words", test: (s) => s.utterances >= 1 },
  { id: "chatterbox", emoji: "🦜", name: "Chatterbox", test: (s) => s.utterances >= 25 },
  { id: "star-1", emoji: "⭐", name: "First star", test: (s) => LINGO.state.totalStars() >= 1 },
  { id: "star-6", emoji: "🌟", name: "Half the island", test: (s) => LINGO.state.totalStars() >= 6 },
  { id: "star-12", emoji: "👑", name: "Island royalty", test: (s) => LINGO.state.totalStars() >= 12 },
  { id: "collector", emoji: "📚", name: "Word collector", test: (s) => Object.keys(s.words).length >= 15 },
  { id: "grammar-pro", emoji: "📐", name: "Grammar surfer", test: (s) => s.skills.grammar >= 70 },
  { id: "gamer", emoji: "🎮", name: "Playtime", test: (s) => s.miniGames >= 5 },
];
