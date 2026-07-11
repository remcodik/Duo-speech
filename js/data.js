/* Lingo Isle — static game content: languages, scenarios, scripted dialogue, mini-games. */
"use strict";

window.LINGO = window.LINGO || {};

LINGO.LANGUAGES = {
  es: { name: "Spanish", flag: "🇪🇸", bcp47: "es-ES" },
  fr: { name: "French",  flag: "🇫🇷", bcp47: "fr-FR" },
  de: { name: "German",  flag: "🇩🇪", bcp47: "de-DE" },
  en: { name: "English", flag: "🇬🇧", bcp47: "en-GB" },
};

/*
 * Scenarios. Each has a character, a mission, and a scripted dialogue tree used
 * when AI is off (and as the opening line when AI is on). Every step:
 *   line:   what the character says, per language
 *   tr:     English translation
 *   hint:   suggestion of what to say, per language
 *   expect: keywords (lowercase, accent-insensitive) that count as success
 */
LINGO.SCENARIOS = [
  {
    id: "cafe", emoji: "☕", name: "Sunny Café", color: "#f59e0b",
    character: { name: "Mila", emoji: "😀", persona: "Mila, a cheerful barista who loves puns and gets theatrically excited about pastries" },
    mission: "Order a drink and something to eat",
    unlockStars: 0,
    steps: [
      {
        line: { es: "¡Hola! Bienvenido al café. ¿Qué quieres beber?", fr: "Bonjour ! Bienvenue au café. Qu'est-ce que tu veux boire ?", de: "Hallo! Willkommen im Café. Was möchtest du trinken?", en: "Hi! Welcome to the café. What would you like to drink?" },
        tr: "Hi! Welcome to the café. What do you want to drink?",
        hint: { es: "Quiero un café, por favor", fr: "Je voudrais un café, s'il vous plaît", de: "Ich möchte einen Kaffee, bitte", en: "I would like a coffee, please" },
        expect: { es: ["cafe", "te", "agua", "zumo", "leche", "quiero", "chocolate"], fr: ["cafe", "the", "eau", "jus", "lait", "voudrais", "chocolat"], de: ["kaffee", "tee", "wasser", "saft", "milch", "mochte", "möchte"], en: ["coffee", "tea", "water", "juice", "milk", "like", "chocolate"] },
      },
      {
        line: { es: "¡Buena elección! ¿Y quieres comer algo? Tenemos croissants y tarta.", fr: "Bon choix ! Et tu veux manger quelque chose ? On a des croissants et de la tarte.", de: "Gute Wahl! Und möchtest du etwas essen? Wir haben Croissants und Kuchen.", en: "Great choice! And would you like something to eat? We have croissants and cake." },
        tr: "Great choice! And do you want to eat something? We have croissants and cake.",
        hint: { es: "Un croissant, por favor", fr: "Un croissant, s'il vous plaît", de: "Ein Croissant, bitte", en: "A croissant, please" },
        expect: { es: ["croissant", "tarta", "nada", "si", "pastel", "quiero"], fr: ["croissant", "tarte", "rien", "oui", "gateau"], de: ["croissant", "kuchen", "nichts", "ja", "bitte"], en: ["croissant", "cake", "nothing", "yes", "please"] },
      },
      {
        line: { es: "¡Perfecto! Son cinco euros. ¡Gracias y que tengas un buen día!", fr: "Parfait ! Ça fait cinq euros. Merci et bonne journée !", de: "Perfekt! Das macht fünf Euro. Danke und einen schönen Tag!", en: "Perfect! That's five euros. Thanks, and have a lovely day!" },
        tr: "Perfect! That's five euros. Thanks and have a nice day!",
        hint: { es: "Gracias, ¡adiós!", fr: "Merci, au revoir !", de: "Danke, tschüss!", en: "Thank you, goodbye!" },
        expect: { es: ["gracias", "adios", "hasta"], fr: ["merci", "au revoir", "salut"], de: ["danke", "tschuss", "tschüss", "wiedersehen"], en: ["thank", "thanks", "bye", "goodbye"] },
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
        line: { es: "¡Fruta fresca! ¡La mejor de la isla! ¿Qué quieres comprar?", fr: "Des fruits frais ! Les meilleurs de l'île ! Qu'est-ce que tu veux acheter ?", de: "Frisches Obst! Das beste der Insel! Was möchtest du kaufen?", en: "Fresh fruit! The best on the island! What do you want to buy?" },
        tr: "Fresh fruit! The best on the island! What do you want to buy?",
        hint: { es: "Quiero dos manzanas", fr: "Je voudrais deux pommes", de: "Ich möchte zwei Äpfel", en: "I want two apples" },
        expect: { es: ["manzana", "platano", "naranja", "sandia", "uvas", "fresa", "quiero"], fr: ["pomme", "banane", "orange", "pasteque", "raisin", "fraise", "voudrais"], de: ["apfel", "äpfel", "banane", "orange", "melone", "trauben", "erdbeere"], en: ["apple", "banana", "orange", "watermelon", "grape", "strawberry", "want"] },
      },
      {
        line: { es: "¡Excelente! ¿Algo más? ¡Los plátanos están dulces como el sol!", fr: "Excellent ! Autre chose ? Les bananes sont douces comme le soleil !", de: "Ausgezeichnet! Noch etwas? Die Bananen sind süß wie die Sonne!", en: "Excellent! Anything else? The bananas are as sweet as the sun!" },
        tr: "Excellent! Anything else? The bananas are sweet like the sun!",
        hint: { es: "¿Cuánto cuesta?", fr: "Ça coûte combien ?", de: "Wie viel kostet das?", en: "How much is it?" },
        expect: { es: ["cuanto", "cuesta", "platano", "tambien", "mas", "quiero"], fr: ["combien", "coute", "banane", "aussi", "voudrais"], de: ["viel", "kostet", "banane", "auch", "noch"], en: ["much", "cost", "banana", "also", "more"] },
      },
      {
        line: { es: "Para ti, ¡solo tres euros! ¿Trato hecho?", fr: "Pour toi, seulement trois euros ! Marché conclu ?", de: "Für dich nur drei Euro! Abgemacht?", en: "For you, only three euros! Deal?" },
        tr: "For you, only three euros! Deal?",
        hint: { es: "Sí, gracias", fr: "Oui, merci", de: "Ja, danke", en: "Yes, thank you" },
        expect: { es: ["si", "vale", "gracias", "trato"], fr: ["oui", "d'accord", "daccord", "merci"], de: ["ja", "gut", "danke", "abgemacht"], en: ["yes", "deal", "thanks", "thank", "ok", "okay"] },
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
        line: { es: "¡Sube, sube! ¿Adónde vamos hoy, amigo?", fr: "Monte, monte ! On va où aujourd'hui, l'ami ?", de: "Steig ein! Wohin fahren wir heute, mein Freund?", en: "Hop in! Where are we going today, my friend?" },
        tr: "Hop in! Where are we going today, friend?",
        hint: { es: "A la playa, por favor", fr: "À la plage, s'il vous plaît", de: "Zum Strand, bitte", en: "To the beach, please" },
        expect: { es: ["playa", "hotel", "mercado", "centro", "puerto"], fr: ["plage", "hotel", "marche", "centre", "port"], de: ["strand", "hotel", "markt", "zentrum", "hafen"], en: ["beach", "hotel", "market", "center", "centre", "port"] },
      },
      {
        line: { es: "¡Buena idea! Hace mucho sol hoy, ¿verdad? ¿Te gusta la isla?", fr: "Bonne idée ! Il fait très beau aujourd'hui, non ? Tu aimes l'île ?", de: "Gute Idee! Heute ist viel Sonne, oder? Gefällt dir die Insel?", en: "Good idea! It's really sunny today, right? Do you like the island?" },
        tr: "Good idea! It's very sunny today, right? Do you like the island?",
        hint: { es: "Sí, me gusta mucho", fr: "Oui, j'aime beaucoup", de: "Ja, sie gefällt mir sehr", en: "Yes, I like it a lot" },
        expect: { es: ["si", "gusta", "mucho", "bonita", "no"], fr: ["oui", "aime", "beaucoup", "belle", "non"], de: ["ja", "gefallt", "gefällt", "schon", "schön", "sehr", "nein"], en: ["yes", "like", "lot", "beautiful", "no"] },
      },
      {
        line: { es: "¡Hemos llegado! Son cuatro euros… ¡o una sonrisa!", fr: "On est arrivés ! Ça fait quatre euros… ou un sourire !", de: "Wir sind da! Das macht vier Euro… oder ein Lächeln!", en: "We're here! That's four euros… or one smile!" },
        tr: "We've arrived! That's four euros… or a smile!",
        hint: { es: "Gracias, ¡adiós!", fr: "Merci, au revoir !", de: "Danke, tschüss!", en: "Thanks, goodbye!" },
        expect: { es: ["gracias", "adios", "toma"], fr: ["merci", "au revoir", "tiens"], de: ["danke", "tschuss", "tschüss", "hier"], en: ["thank", "thanks", "bye", "here"] },
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
        line: { es: "¡Hola! ¡Qué fiesta tan buena! ¿Cómo te llamas?", fr: "Salut ! Quelle super fête ! Comment tu t'appelles ?", de: "Hallo! Was für eine tolle Party! Wie heißt du?", en: "Hi! What a great party! What's your name?" },
        tr: "Hi! What a great party! What's your name?",
        hint: { es: "Me llamo… ", fr: "Je m'appelle… ", de: "Ich heiße… ", en: "My name is… " },
        expect: { es: ["me llamo", "soy"], fr: ["m'appelle", "mappelle", "je suis"], de: ["heisse", "heiße", "ich bin"], en: ["my name", "i am", "i'm", "im "] },
      },
      {
        line: { es: "¡Encantada! ¿De dónde eres?", fr: "Enchantée ! Tu viens d'où ?", de: "Freut mich! Woher kommst du?", en: "Nice to meet you! Where are you from?" },
        tr: "Nice to meet you! Where are you from?",
        hint: { es: "Soy de Holanda", fr: "Je viens des Pays-Bas", de: "Ich komme aus den Niederlanden", en: "I'm from the Netherlands" },
        expect: { es: ["soy de", "vengo de"], fr: ["viens de", "viens des", "je suis de"], de: ["komme aus", "bin aus"], en: ["from"] },
      },
      {
        line: { es: "¡Qué guay! ¿Quieres bailar conmigo?", fr: "Trop cool ! Tu veux danser avec moi ?", de: "Wie cool! Willst du mit mir tanzen?", en: "So cool! Do you want to dance with me?" },
        tr: "So cool! Do you want to dance with me?",
        hint: { es: "¡Sí, vamos a bailar!", fr: "Oui, allons danser !", de: "Ja, lass uns tanzen!", en: "Yes, let's dance!" },
        expect: { es: ["si", "bailar", "vamos", "no"], fr: ["oui", "danser", "allons", "non"], de: ["ja", "tanzen", "lass", "nein"], en: ["yes", "dance", "let", "no"] },
      },
    ],
  },
];

/* Mini-game content: short phrases per language (echo = repeat aloud; salad = reorder words). */
LINGO.PHRASES = {
  es: [
    { text: "Me gusta mucho la playa", tr: "I really like the beach" },
    { text: "¿Dónde está el mercado?", tr: "Where is the market?" },
    { text: "Quiero un zumo de naranja", tr: "I want an orange juice" },
    { text: "El gato duerme al sol", tr: "The cat sleeps in the sun" },
    { text: "Mañana vamos a bailar", tr: "Tomorrow we're going to dance" },
    { text: "La sandía es muy dulce", tr: "The watermelon is very sweet" },
  ],
  fr: [
    { text: "J'aime beaucoup la plage", tr: "I really like the beach" },
    { text: "Où est le marché ?", tr: "Where is the market?" },
    { text: "Je voudrais un jus d'orange", tr: "I would like an orange juice" },
    { text: "Le chat dort au soleil", tr: "The cat sleeps in the sun" },
    { text: "Demain nous allons danser", tr: "Tomorrow we're going to dance" },
    { text: "La pastèque est très sucrée", tr: "The watermelon is very sweet" },
  ],
  de: [
    { text: "Ich mag den Strand sehr", tr: "I really like the beach" },
    { text: "Wo ist der Markt?", tr: "Where is the market?" },
    { text: "Ich möchte einen Orangensaft", tr: "I would like an orange juice" },
    { text: "Die Katze schläft in der Sonne", tr: "The cat sleeps in the sun" },
    { text: "Morgen gehen wir tanzen", tr: "Tomorrow we're going dancing" },
    { text: "Die Melone ist sehr süß", tr: "The melon is very sweet" },
  ],
  en: [
    { text: "I really like the beach", tr: "(that's the sentence!)" },
    { text: "Where is the market?", tr: "(that's the sentence!)" },
    { text: "I would like an orange juice", tr: "(that's the sentence!)" },
    { text: "The cat sleeps in the sun", tr: "(that's the sentence!)" },
    { text: "Tomorrow we are going to dance", tr: "(that's the sentence!)" },
    { text: "The watermelon is very sweet", tr: "(that's the sentence!)" },
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
