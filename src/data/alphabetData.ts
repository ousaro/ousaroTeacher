import { NumberItem,CharacterGroup } from "../types";



export const hiraganaGroups: CharacterGroup[] = [
  {
    groupName: "vowels",
    language: "hiragana",
    characters: [
      { id: "h-a", character: "あ", name: "a", pronunciation: "/a/", example: "あひる (duck)", language: "hiragana" },
      { id: "h-i", character: "い", name: "i", pronunciation: "/i/", example: "いぬ (dog)", language: "hiragana" },
      { id: "h-u", character: "う", name: "u", pronunciation: "/u/", example: "うみ (sea)", language: "hiragana" },
      { id: "h-e", character: "え", name: "e", pronunciation: "/e/", example: "えき (station)", language: "hiragana" },
      { id: "h-o", character: "お", name: "o", pronunciation: "/o/", example: "おはな (flower)", language: "hiragana" },
    ]
  },
  {
    groupName: "k-sounds",
    language: "hiragana",
    characters: [
      { id: "h-ka", character: "か", name: "ka", pronunciation: "/ka/", example: "かみ (paper)", language: "hiragana" },
      { id: "h-ki", character: "き", name: "ki", pronunciation: "/ki/", example: "きつね (fox)", language: "hiragana" },
      { id: "h-ku", character: "く", name: "ku", pronunciation: "/ku/", example: "くるま (car)", language: "hiragana" },
      { id: "h-ke", character: "け", name: "ke", pronunciation: "/ke/", example: "けーき (cake)", language: "hiragana" },
      { id: "h-ko", character: "こ", name: "ko", pronunciation: "/ko/", example: "こども (child)", language: "hiragana" },
    ]
  },
  {
    groupName: "g-sounds",
    language: "hiragana",
    characters: [
      { id: "h-ga", character: "が", name: "ga", pronunciation: "/ga/", example: "がっこう (school)", language: "hiragana" },
      { id: "h-gi", character: "ぎ", name: "gi", pronunciation: "/gi/", example: "ぎんこう (bank)", language: "hiragana" },
      { id: "h-gu", character: "ぐ", name: "gu", pronunciation: "/gu/", example: "ぐみ (gum)", language: "hiragana" },
      { id: "h-ge", character: "げ", name: "ge", pronunciation: "/ge/", example: "げーむ (game)", language: "hiragana" },
      { id: "h-go", character: "ご", name: "go", pronunciation: "/go/", example: "ごはん (rice/meal)", language: "hiragana" },
    ]
  },
  {
    groupName: "s-sounds",
    language: "hiragana",
    characters: [
      { id: "h-sa", character: "さ", name: "sa", pronunciation: "/sa/", example: "さくら (cherry)", language: "hiragana" },
      { id: "h-shi", character: "し", name: "shi", pronunciation: "/ʃi/", example: "しお (salt)", language: "hiragana" },
      { id: "h-su", character: "す", name: "su", pronunciation: "/su/", example: "すし (sushi)", language: "hiragana" },
      { id: "h-se", character: "せ", name: "se", pronunciation: "/se/", example: "せんせい (teacher)", language: "hiragana" },
      { id: "h-so", character: "そ", name: "so", pronunciation: "/so/", example: "そら (sky)", language: "hiragana" },
    ]
  },
  {
    groupName: "z-sounds",
    language: "hiragana",
    characters: [
      { id: "h-za", character: "ざ", name: "za", pronunciation: "/za/", example: "ざしき (room)", language: "hiragana" },
      { id: "h-ji", character: "じ", name: "ji", pronunciation: "/dʒi/", example: "じかん (time)", language: "hiragana" },
      { id: "h-zu", character: "ず", name: "zu", pronunciation: "/zu/", example: "みず (water)", language: "hiragana" },
      { id: "h-ze", character: "ぜ", name: "ze", pronunciation: "/ze/", example: "ぜんぶ (all)", language: "hiragana" },
      { id: "h-zo", character: "ぞ", name: "zo", pronunciation: "/zo/", example: "ぞう (elephant)", language: "hiragana" },
    ]
  },
  {
    groupName: "t-sounds",
    language: "hiragana",
    characters: [
      { id: "h-ta", character: "た", name: "ta", pronunciation: "/ta/", example: "たまご (egg)", language: "hiragana" },
      { id: "h-chi", character: "ち", name: "chi", pronunciation: "/tʃi/", example: "ちず (map)", language: "hiragana" },
      { id: "h-tsu", character: "つ", name: "tsu", pronunciation: "/tsu/", example: "つき (moon)", language: "hiragana" },
      { id: "h-te", character: "て", name: "te", pronunciation: "/te/", example: "てがみ (letter)", language: "hiragana" },
      { id: "h-to", character: "と", name: "to", pronunciation: "/to/", example: "とり (bird)", language: "hiragana" },
    ]
  },
  {
    groupName: "d-sounds",
    language: "hiragana",
    characters: [
      { id: "h-da", character: "だ", name: "da", pronunciation: "/da/", example: "だれ (who)", language: "hiragana" },
      { id: "h-ji2", character: "ぢ", name: "ji", pronunciation: "/dʒi/", example: "ちぢむ (shrink)", language: "hiragana" },
      { id: "h-zu2", character: "づ", name: "zu", pronunciation: "/zu/", example: "つづく (continue)", language: "hiragana" },
      { id: "h-de", character: "で", name: "de", pronunciation: "/de/", example: "でんわ (phone)", language: "hiragana" },
      { id: "h-do", character: "ど", name: "do", pronunciation: "/do/", example: "どこ (where)", language: "hiragana" },
    ]
  },
  {
    groupName: "n-sounds",
    language: "hiragana",
    characters: [
      { id: "h-na", character: "な", name: "na", pronunciation: "/na/", example: "なまえ (name)", language: "hiragana" },
      { id: "h-ni", character: "に", name: "ni", pronunciation: "/ni/", example: "にく (meat)", language: "hiragana" },
      { id: "h-nu", character: "ぬ", name: "nu", pronunciation: "/nu/", example: "ぬの (cloth)", language: "hiragana" },
      { id: "h-ne", character: "ね", name: "ne", pronunciation: "/ne/", example: "ねこ (cat)", language: "hiragana" },
      { id: "h-no", character: "の", name: "no", pronunciation: "/no/", example: "のみもの (drink)", language: "hiragana" },
    ]
  },
  {
    groupName: "h-sounds",
    language: "hiragana",
    characters: [
      { id: "h-ha", character: "は", name: "ha", pronunciation: "/ha/", example: "はな (nose)", language: "hiragana" },
      { id: "h-hi", character: "ひ", name: "hi", pronunciation: "/hi/", example: "ひ (fire)", language: "hiragana" },
      { id: "h-fu", character: "ふ", name: "fu", pronunciation: "/fu/", example: "ふね (ship)", language: "hiragana" },
      { id: "h-he", character: "へ", name: "he", pronunciation: "/he/", example: "へび (snake)", language: "hiragana" },
      { id: "h-ho", character: "ほ", name: "ho", pronunciation: "/ho/", example: "ほん (book)", language: "hiragana" },
    ]
  },
  {
    groupName: "b-sounds",
    language: "hiragana",
    characters: [
      { id: "h-ba", character: "ば", name: "ba", pronunciation: "/ba/", example: "ばら (rose)", language: "hiragana" },
      { id: "h-bi", character: "び", name: "bi", pronunciation: "/bi/", example: "びょういん (hospital)", language: "hiragana" },
      { id: "h-bu", character: "ぶ", name: "bu", pronunciation: "/bu/", example: "ぶた (pig)", language: "hiragana" },
      { id: "h-be", character: "べ", name: "be", pronunciation: "/be/", example: "べんきょう (study)", language: "hiragana" },
      { id: "h-bo", character: "ぼ", name: "bo", pronunciation: "/bo/", example: "ぼうし (hat)", language: "hiragana" },
    ]
  },
  {
    groupName: "p-sounds",
    language: "hiragana",
    characters: [
      { id: "h-pa", character: "ぱ", name: "pa", pronunciation: "/pa/", example: "ぱん (bread)", language: "hiragana" },
      { id: "h-pi", character: "ぴ", name: "pi", pronunciation: "/pi/", example: "ぴあの (piano)", language: "hiragana" },
      { id: "h-pu", character: "ぷ", name: "pu", pronunciation: "/pu/", example: "ぷーる (pool)", language: "hiragana" },
      { id: "h-pe", character: "ぺ", name: "pe", pronunciation: "/pe/", example: "ぺん (pen)", language: "hiragana" },
      { id: "h-po", character: "ぽ", name: "po", pronunciation: "/po/", example: "ぽすと (post)", language: "hiragana" },
    ]
  },
  {
    groupName: "m-sounds",
    language: "hiragana",
    characters: [
      { id: "h-ma", character: "ま", name: "ma", pronunciation: "/ma/", example: "まど (window)", language: "hiragana" },
      { id: "h-mi", character: "み", name: "mi", pronunciation: "/mi/", example: "みず (water)", language: "hiragana" },
      { id: "h-mu", character: "む", name: "mu", pronunciation: "/mu/", example: "むし (insect)", language: "hiragana" },
      { id: "h-me", character: "め", name: "me", pronunciation: "/me/", example: "め (eye)", language: "hiragana" },
      { id: "h-mo", character: "も", name: "mo", pronunciation: "/mo/", example: "もり (forest)", language: "hiragana" },
    ]
  },
  {
    groupName: "r-sounds",
    language: "hiragana",
    characters: [
      { id: "h-ra", character: "ら", name: "ra", pronunciation: "/ra/", example: "らいおん (lion)", language: "hiragana" },
      { id: "h-ri", character: "り", name: "ri", pronunciation: "/ri/", example: "りんご (apple)", language: "hiragana" },
      { id: "h-ru", character: "る", name: "ru", pronunciation: "/ru/", example: "るーる (rule)", language: "hiragana" },
      { id: "h-re", character: "れ", name: "re", pronunciation: "/re/", example: "れもん (lemon)", language: "hiragana" },
      { id: "h-ro", character: "ろ", name: "ro", pronunciation: "/ro/", example: "ろうそく (candle)", language: "hiragana" },
    ]
  },
  {
    groupName: "y-sounds",
    language: "hiragana",
    characters: [
      { id: "h-ya", character: "や", name: "ya", pronunciation: "/ja/", example: "やま (mountain)", language: "hiragana" },
      null, // empty slot for i-sound
      { id: "h-yu", character: "ゆ", name: "yu", pronunciation: "/ju/", example: "ゆき (snow)", language: "hiragana" },
      null, // empty slot for e-sound
      { id: "h-yo", character: "よ", name: "yo", pronunciation: "/jo/", example: "よる (night)", language: "hiragana" },
    ]
  },
  {
    groupName: "w-sounds",
    language: "hiragana",
    characters: [
      { id: "h-wa", character: "わ", name: "wa", pronunciation: "/wa/", example: "わに (crocodile)", language: "hiragana" },
      null, // empty slot
      null, // empty slot
      null, // empty slot
      { id: "h-wo", character: "を", name: "wo", pronunciation: "/wo/", example: "を (particle)", language: "hiragana" },
    ]
  },
  {
    groupName: "n-final",
    language: "hiragana",
    characters: [
      null, // empty slot
      null, // empty slot
      null, // empty slot
      null, // empty slot
      { id: "h-n", character: "ん", name: "n", pronunciation: "/n/", example: "ん (n sound)", language: "hiragana" },
    ]
  }
];

export const katakanaGroups: CharacterGroup[] = [
  {
    groupName: "vowels",
    language: "katakana",
    characters: [
      { id: "k-a", character: "ア", name: "a", pronunciation: "/a/", example: "アヒル (duck)", language: "katakana" },
      { id: "k-i", character: "イ", name: "i", pronunciation: "/i/", example: "イヌ (dog)", language: "katakana" },
      { id: "k-u", character: "ウ", name: "u", pronunciation: "/u/", example: "ウミ (sea)", language: "katakana" },
      { id: "k-e", character: "エ", name: "e", pronunciation: "/e/", example: "エキ (station)", language: "katakana" },
      { id: "k-o", character: "オ", name: "o", pronunciation: "/o/", example: "オハナ (flower)", language: "katakana" },
    ]
  },
  {
    groupName: "k-sounds",
    language: "katakana",
    characters: [
      { id: "k-ka", character: "カ", name: "ka", pronunciation: "/ka/", example: "カミ (paper)", language: "katakana" },
      { id: "k-ki", character: "キ", name: "ki", pronunciation: "/ki/", example: "キツネ (fox)", language: "katakana" },
      { id: "k-ku", character: "ク", name: "ku", pronunciation: "/ku/", example: "クルマ (car)", language: "katakana" },
      { id: "k-ke", character: "ケ", name: "ke", pronunciation: "/ke/", example: "ケーキ (cake)", language: "katakana" },
      { id: "k-ko", character: "コ", name: "ko", pronunciation: "/ko/", example: "コドモ (child)", language: "katakana" },
    ]
  },
  {
    groupName: "g-sounds",
    language: "katakana",
    characters: [
      { id: "k-ga", character: "ガ", name: "ga", pronunciation: "/ga/", example: "ガッコウ (school)", language: "katakana" },
      { id: "k-gi", character: "ギ", name: "gi", pronunciation: "/gi/", example: "ギンコウ (bank)", language: "katakana" },
      { id: "k-gu", character: "グ", name: "gu", pronunciation: "/gu/", example: "グミ (gum)", language: "katakana" },
      { id: "k-ge", character: "ゲ", name: "ge", pronunciation: "/ge/", example: "ゲーム (game)", language: "katakana" },
      { id: "k-go", character: "ゴ", name: "go", pronunciation: "/go/", example: "ゴハン (rice/meal)", language: "katakana" },
    ]
  },
  {
    groupName: "s-sounds",
    language: "katakana",
    characters: [
      { id: "k-sa", character: "サ", name: "sa", pronunciation: "/sa/", example: "サクラ (cherry)", language: "katakana" },
      { id: "k-shi", character: "シ", name: "shi", pronunciation: "/ʃi/", example: "シオ (salt)", language: "katakana" },
      { id: "k-su", character: "ス", name: "su", pronunciation: "/su/", example: "スシ (sushi)", language: "katakana" },
      { id: "k-se", character: "セ", name: "se", pronunciation: "/se/", example: "センセイ (teacher)", language: "katakana" },
      { id: "k-so", character: "ソ", name: "so", pronunciation: "/so/", example: "ソラ (sky)", language: "katakana" },
    ]
  },
  {
    groupName: "z-sounds",
    language: "katakana",
    characters: [
      { id: "k-za", character: "ザ", name: "za", pronunciation: "/za/", example: "ザシキ (room)", language: "katakana" },
      { id: "k-ji", character: "ジ", name: "ji", pronunciation: "/dʒi/", example: "ジカン (time)", language: "katakana" },
      { id: "k-zu", character: "ズ", name: "zu", pronunciation: "/zu/", example: "ミズ (water)", language: "katakana" },
      { id: "k-ze", character: "ゼ", name: "ze", pronunciation: "/ze/", example: "ゼンブ (all)", language: "katakana" },
      { id: "k-zo", character: "ゾ", name: "zo", pronunciation: "/zo/", example: "ゾウ (elephant)", language: "katakana" },
    ]
  },
  {
    groupName: "t-sounds",
    language: "katakana",
    characters: [
      { id: "k-ta", character: "タ", name: "ta", pronunciation: "/ta/", example: "タマゴ (egg)", language: "katakana" },
      { id: "k-chi", character: "チ", name: "chi", pronunciation: "/tʃi/", example: "チズ (map)", language: "katakana" },
      { id: "k-tsu", character: "ツ", name: "tsu", pronunciation: "/tsu/", example: "ツキ (moon)", language: "katakana" },
      { id: "k-te", character: "テ", name: "te", pronunciation: "/te/", example: "テガミ (letter)", language: "katakana" },
      { id: "k-to", character: "ト", name: "to", pronunciation: "/to/", example: "トリ (bird)", language: "katakana" },
    ]
  },
  {
    groupName: "d-sounds",
    language: "katakana",
    characters: [
      { id: "k-da", character: "ダ", name: "da", pronunciation: "/da/", example: "ダレ (who)", language: "katakana" },
      { id: "k-ji2", character: "ヂ", name: "ji", pronunciation: "/dʒi/", example: "チヂム (shrink)", language: "katakana" },
      { id: "k-zu2", character: "ヅ", name: "zu", pronunciation: "/zu/", example: "ツヅク (continue)", language: "katakana" },
      { id: "k-de", character: "デ", name: "de", pronunciation: "/de/", example: "デンワ (phone)", language: "katakana" },
      { id: "k-do", character: "ド", name: "do", pronunciation: "/do/", example: "ドコ (where)", language: "katakana" },
    ]
  },
  {
    groupName: "n-sounds",
    language: "katakana",
    characters: [
      { id: "k-na", character: "ナ", name: "na", pronunciation: "/na/", example: "ナマエ (name)", language: "katakana" },
      { id: "k-ni", character: "ニ", name: "ni", pronunciation: "/ni/", example: "ニク (meat)", language: "katakana" },
      { id: "k-nu", character: "ヌ", name: "nu", pronunciation: "/nu/", example: "ヌノ (cloth)", language: "katakana" },
      { id: "k-ne", character: "ネ", name: "ne", pronunciation: "/ne/", example: "ネコ (cat)", language: "katakana" },
      { id: "k-no", character: "ノ", name: "no", pronunciation: "/no/", example: "ノミモノ (drink)", language: "katakana" },
    ]
  },
  {
    groupName: "h-sounds",
    language: "katakana",
    characters: [
      { id: "k-ha", character: "ハ", name: "ha", pronunciation: "/ha/", example: "ハナ (nose)", language: "katakana" },
      { id: "k-hi", character: "ヒ", name: "hi", pronunciation: "/hi/", example: "ヒ (fire)", language: "katakana" },
      { id: "k-fu", character: "フ", name: "fu", pronunciation: "/fu/", example: "フネ (ship)", language: "katakana" },
      { id: "k-he", character: "ヘ", name: "he", pronunciation: "/he/", example: "ヘビ (snake)", language: "katakana" },
      { id: "k-ho", character: "ホ", name: "ho", pronunciation: "/ho/", example: "ホン (book)", language: "katakana" },
    ]
  },
  {
    groupName: "b-sounds",
    language: "katakana",
    characters: [
      { id: "k-ba", character: "バ", name: "ba", pronunciation: "/ba/", example: "バラ (rose)", language: "katakana" },
      { id: "k-bi", character: "ビ", name: "bi", pronunciation: "/bi/", example: "ビョウイン (hospital)", language: "katakana" },
      { id: "k-bu", character: "ブ", name: "bu", pronunciation: "/bu/", example: "ブタ (pig)", language: "katakana" },
      { id: "k-be", character: "ベ", name: "be", pronunciation: "/be/", example: "ベンキョウ (study)", language: "katakana" },
      { id: "k-bo", character: "ボ", name: "bo", pronunciation: "/bo/", example: "ボウシ (hat)", language: "katakana" },
    ]
  },
  {
    groupName: "p-sounds",
    language: "katakana",
    characters: [
      { id: "k-pa", character: "パ", name: "pa", pronunciation: "/pa/", example: "パン (bread)", language: "katakana" },
      { id: "k-pi", character: "ピ", name: "pi", pronunciation: "/pi/", example: "ピアノ (piano)", language: "katakana" },
      { id: "k-pu", character: "プ", name: "pu", pronunciation: "/pu/", example: "プール (pool)", language: "katakana" },
      { id: "k-pe", character: "ペ", name: "pe", pronunciation: "/pe/", example: "ペン (pen)", language: "katakana" },
      { id: "k-po", character: "ポ", name: "po", pronunciation: "/po/", example: "ポスト (post)", language: "katakana" },
    ]
  },
  {
    groupName: "m-sounds",
    language: "katakana",
    characters: [
      { id: "k-ma", character: "マ", name: "ma", pronunciation: "/ma/", example: "マド (window)", language: "katakana" },
      { id: "k-mi", character: "ミ", name: "mi", pronunciation: "/mi/", example: "ミズ (water)", language: "katakana" },
      { id: "k-mu", character: "ム", name: "mu", pronunciation: "/mu/", example: "ムシ (insect)", language: "katakana" },
      { id: "k-me", character: "メ", name: "me", pronunciation: "/me/", example: "メ (eye)", language: "katakana" },
      { id: "k-mo", character: "モ", name: "mo", pronunciation: "/mo/", example: "モリ (forest)", language: "katakana" },
    ]
  },
  {
    groupName: "r-sounds",
    language: "katakana",
    characters: [
      { id: "k-ra", character: "ラ", name: "ra", pronunciation: "/ra/", example: "ライオン (lion)", language: "katakana" },
      { id: "k-ri", character: "リ", name: "ri", pronunciation: "/ri/", example: "リンゴ (apple)", language: "katakana" },
      { id: "k-ru", character: "ル", name: "ru", pronunciation: "/ru/", example: "ルール (rule)", language: "katakana" },
      { id: "k-re", character: "レ", name: "re", pronunciation: "/re/", example: "レモン (lemon)", language: "katakana" },
      { id: "k-ro", character: "ロ", name: "ro", pronunciation: "/ro/", example: "ロウソク (candle)", language: "katakana" },
    ]
  },
  {
    groupName: "y-sounds",
    language: "katakana",
    characters: [
      { id: "k-ya", character: "ヤ", name: "ya", pronunciation: "/ja/", example: "ヤマ (mountain)", language: "katakana" },
      null, // empty slot for i-sound
      { id: "k-yu", character: "ユ", name: "yu", pronunciation: "/ju/", example: "ユキ (snow)", language: "katakana" },
      null, // empty slot for e-sound
      { id: "k-yo", character: "ヨ", name: "yo", pronunciation: "/jo/", example: "ヨル (night)", language: "katakana" },
    ]
  },
  {
    groupName: "w-sounds",
    language: "katakana",
    characters: [
      { id: "k-wa", character: "ワ", name: "wa", pronunciation: "/wa/", example: "ワニ (crocodile)", language: "katakana" },
      null, // empty slot
      null, // empty slot
      null, // empty slot
      { id: "k-wo", character: "ヲ", name: "wo", pronunciation: "/wo/", example: "ヲ (particle)", language: "katakana" },
    ]
  },
  {
    groupName: "n-final",
    language: "katakana",
    characters: [
      null, // empty slot
      null, // empty slot
      null, // empty slot
      null, // empty slot
      { id: "k-n", character: "ン", name: "n", pronunciation: "/n/", example: "ン (n sound)", language: "katakana" },
    ]
  }
];

export const japaneseNumbers: NumberItem[] = [
  { id: "n-0", number: 0, text: "零", pronunciation: "/rei/zero/", language: "japanese" },
  { id: "n-1", number: 1, text: "一", pronunciation: "/itʃi/", language: "japanese" },
  { id: "n-2", number: 2, text: "二", pronunciation: "/ni/", language: "japanese" },
  { id: "n-3", number: 3, text: "三", pronunciation: "/san/", language: "japanese" },
  { id: "n-4", number: 4, text: "四", pronunciation: "/jon/ʃi/", language: "japanese" },
  { id: "n-5", number: 5, text: "五", pronunciation: "/go/", language: "japanese" },
  { id: "n-6", number: 6, text: "六", pronunciation: "/roku/", language: "japanese" },
  { id: "n-7", number: 7, text: "七", pronunciation: "/nana/ʃitʃi/", language: "japanese" },
  { id: "n-8", number: 8, text: "八", pronunciation: "/hatʃi/", language: "japanese" },
  { id: "n-9", number: 9, text: "九", pronunciation: "/kjuː/ku/", language: "japanese" },
  { id: "n-10", number: 10, text: "十", pronunciation: "/dʒuː/", language: "japanese" },
  { id: "n-11", number: 11, text: "十一", pronunciation: "/dʒuːitʃi/", language: "japanese" },
  { id: "n-20", number: 20, text: "二十", pronunciation: "/nidʒuː/", language: "japanese" },
  { id: "n-100", number: 100, text: "百", pronunciation: "/hjakɯ/", language: "japanese" },
  { id: "n-300", number: 300, text: "三百", pronunciation: "/sanbjakɯ/", language: "japanese" },
  { id: "n-600", number: 600, text: "六百", pronunciation: "/roppjakɯ/", language: "japanese" },
  { id: "n-800", number: 800, text: "八百", pronunciation: "/hapjakɯ/", language: "japanese" },
  { id: "n-1000", number: 1000, text: "千", pronunciation: "/seɴ/", language: "japanese" },
  { id: "n-3000", number: 3000, text: "三千", pronunciation: "/sanzeɴ/", language: "japanese" },
  { id: "n-8000", number: 8000, text: "八千", pronunciation: "/hassen/", language: "japanese" },
  { id: "n-10000", number: 10000, text: "万", pronunciation: "/maɴ/", language: "japanese" },
];
