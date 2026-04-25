export interface Item {
  id: string;
  text: string;
  username: string;
  timestamp: string;
  hasEmoji: boolean;
  lang: 'en' | 'ja' | 'ar';
}

// Simple LCG PRNG for determinism
let seed = 12345;
function random() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}

const LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
const EN_WORDS = LOREM.split(' ');

const JA_SAMPLES = [
  "昨日、東京タワーに行きました。景色がとてもきれいでした。",
  "新しい技術を学ぶのはいつも楽しいですね。",
  "こんにちは、元気ですか？明日の会議の準備はできましたか？",
  "ReactとViteを使ったプロジェクトのセットアップが完了しました。"
];

const AR_SAMPLES = [
  "مرحبا، كيف حالك اليوم؟ أتمنى أن تكون بخير.",
  "تطوير الويب أصبح أكثر تعقيداً ولكن أكثر إثارة للاهتمام.",
  "هذا نص تجريبي باللغة العربية لاختبار عرض الخطوط.",
  "التعلم الآلي والذكاء الاصطناعي هما مستقبل التكنولوجيا."
];

const USERNAMES = ['alex_dev', 'sarah_codes', 'tech_guru', 'web_master', 'react_fan', 'perf_nerd'];
const EMOJIS = ['🚀', '🔥', '💻', '✨', '🤔', '🎉', '💡', '🐛', '🔨', '⚡️'];

function generateRandomText(lang: 'en' | 'ja' | 'ar'): string {
  if (lang === 'ja') {
    return JA_SAMPLES[Math.floor(random() * JA_SAMPLES.length)];
  }
  if (lang === 'ar') {
    return AR_SAMPLES[Math.floor(random() * AR_SAMPLES.length)];
  }
  
  // English: random length between 10 and 80 words (roughly 50 to 600 chars)
  const wordCount = Math.floor(random() * 70) + 10;
  let text = [];
  for (let i = 0; i < wordCount; i++) {
    text.push(EN_WORDS[Math.floor(random() * EN_WORDS.length)]);
  }
  return text.join(' ');
}

export function generateItems(count: number = 1000): Item[] {
  // Reset seed so multiple calls return the same data
  seed = 12345;
  const items: Item[] = [];

  // Generate baseline date: Jan 1, 2024
  let currentTime = 1704067200000;

  for (let i = 0; i < count; i++) {
    const langRoll = random();
    let lang: 'en' | 'ja' | 'ar' = 'en';
    if (langRoll > 0.9) lang = 'ar';
    else if (langRoll > 0.8) lang = 'ja';

    const hasEmoji = random() > 0.7; // ~30% emoji
    let text = generateRandomText(lang);
    
    if (hasEmoji) {
      const emojiCount = Math.floor(random() * 3) + 1;
      for (let e = 0; e < emojiCount; e++) {
        const emoji = EMOJIS[Math.floor(random() * EMOJIS.length)];
        // Insert emoji at random position
        const pos = Math.floor(random() * text.length);
        text = text.slice(0, pos) + ' ' + emoji + ' ' + text.slice(pos);
      }
    }

    // Advance time by 1-60 minutes randomly
    currentTime += Math.floor(random() * 60) * 60000;
    const date = new Date(currentTime);
    const timestamp = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

    items.push({
      id: `item-${i}`,
      text,
      username: USERNAMES[Math.floor(random() * USERNAMES.length)],
      timestamp,
      hasEmoji,
      lang
    });
  }

  return items;
}
