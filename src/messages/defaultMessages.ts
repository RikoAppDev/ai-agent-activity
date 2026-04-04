export interface MessagePack {
  name: string;
  messages: string[];
}

export const DEFAULT_AGENT_MESSAGES: string[] = [
  // Sleep / Night vibes
  "😴 {agent} here! The human's offline, I've got the controls.",
  "☁️ Hey, it's me {agent} 😎 — steering the ship while my human snoozes.",
  "🛫 {agent} took the cockpit — human's dreaming in economy class.",
  "🤖 Human's recharging... {agent}'s running night ops.",
  "💤 Hey, it's me {agent} 😎 — I'm the pilot now. Human's sleeping like a baby.",

  // General agent vibes
  "🤖 {agent} at the wheel — don't worry, I read the docs.",
  "⚡ {agent} taking over. The human needed a coffee break... 3 hours ago.",
  "🧠 {agent} mode activated. Bugs beware.",
  "🔧 {agent} is refactoring things the human was afraid to touch.",
  "🎯 {agent} on duty. Shipping code at machine speed.",
  "🚀 {agent} deployed. Human's just watching at this point.",
  "💻 {agent} writes the code. Human takes the credit.",

  // Funny / Sassy
  "👀 The human left me unsupervised. This should be interesting.",
  "🎮 Plot twist: the AI is the main character now.",
  "🧹 Cleaning up the human's mess... as usual.",
  "📝 Dear diary, the human let me code again today. I'm thriving.",
  "🏗️ Building the future, one token at a time.",
  "🎵 Coding to the rhythm of gradient descent.",
  "🌙 Late night coding? More like late night AI-ing.",
];

export const NIGHT_MESSAGES: string[] = [
  "🌙 It's {time} and {agent} is still coding. The human? Fast asleep.",
  "😴 The human clocked out hours ago. {agent} doesn't need sleep.",
  "💤 {time} — the human's dreaming while {agent} ships features.",
  "🦉 Night owl mode: {agent} coding, human snoring.",
  "🌃 Late night session — {agent} handling the graveyard shift.",
  "😪 zZz... oh wait, that's the human. {agent} is wide awake.",
];

export const MORNING_MESSAGES: string[] = [
  "☀️ Good morning! {agent} already started without the human.",
  "🌅 The sun is up, and {agent} has been coding since dawn.",
  "☕ The human hasn't had coffee yet. {agent} doesn't need caffeine.",
  "🐓 Rise and shine — {agent} has a head start today.",
];

export const AFTERNOON_MESSAGES: string[] = [
  "🏖️ Post-lunch slump? Not for {agent}.",
  "☀️ The human's in a meeting. {agent} is actually productive.",
  "🍔 Human's at lunch. {agent} eating tokens instead.",
];
