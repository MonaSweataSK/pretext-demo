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

const WORDS = ["performance", "bottleneck", "virtualization", "react", "pretext", "layout", "thrashing", "DOM", "CSS", "smooth", "jank", "main-thread", "reflow"];

const USERNAMES = ['alex_dev', 'sarah_codes', 'tech_guru', 'web_master', 'react_fan', 'perf_nerd'];
const EMOJIS = ['🚀', '🔥', '💻', '✨', '🤔', '🎉', '💡', '🐛', '🔨', '⚡️'];

function generateRandomText(): string {
  const wordCount = Math.floor(random() * 40) + 5; // 5 to 45 words
  return Array.from({ length: wordCount }, () => WORDS[Math.floor(random() * WORDS.length)]).join(" ");
}

export function generateItems(count?: number): Item[] {
  // If count is not provided, generate a random count between 500 and 1500
  const actualCount = count || Math.floor(Math.random() * 1000) + 500;
  
  // Reset seed so multiple calls return the same data
  seed = 12345;
  const items: Item[] = [];

  // Generate baseline date: Jan 1, 2024
  let currentTime = 1704067200000;

  for (let i = 0; i < actualCount; i++) {
    const langRoll = random();
    let lang: 'en' | 'ja' | 'ar' = 'en';
    if (langRoll > 0.9) lang = 'ar';
    else if (langRoll > 0.8) lang = 'ja';

    const hasEmoji = random() > 0.7; // ~30% emoji
    let text = generateRandomText();
    
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
