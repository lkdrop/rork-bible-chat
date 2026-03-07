export interface Level {
  level: number;
  title: string;
  emoji: string;
  minXP: number;
  color: string;
}

export const LEVELS: Level[] = [
  { level: 1, title: 'Semente', emoji: '🌱', minXP: 0, color: '#9CA3AF' },
  { level: 2, title: 'Broto', emoji: '🌿', minXP: 50, color: '#6EE7B7' },
  { level: 3, title: 'Raiz', emoji: '🪴', minXP: 150, color: '#34D399' },
  { level: 4, title: 'Discípulo', emoji: '📖', minXP: 300, color: '#3B82F6' },
  { level: 5, title: 'Servo', emoji: '🙏', minXP: 500, color: '#8B5CF6' },
  { level: 6, title: 'Obreiro', emoji: '⚒️', minXP: 800, color: '#A855F7' },
  { level: 7, title: 'Levita', emoji: '🎵', minXP: 1200, color: '#EC4899' },
  { level: 8, title: 'Sacerdote', emoji: '⛪', minXP: 1800, color: '#F43F5E' },
  { level: 9, title: 'Profeta', emoji: '🔥', minXP: 2500, color: '#F97316' },
  { level: 10, title: 'Apóstolo', emoji: '✝️', minXP: 3500, color: '#EAB308' },
  { level: 11, title: 'Guerreiro da Fé', emoji: '⚔️', minXP: 5000, color: '#8b5cf6' },
  { level: 12, title: 'Embaixador de Cristo', emoji: '👑', minXP: 7000, color: '#6d28d9' },
];

export function getLevelForXP(xp: number): Level {
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.minXP) {
      current = level;
    } else {
      break;
    }
  }
  return current;
}

export function getNextLevel(xp: number): Level | null {
  for (const level of LEVELS) {
    if (xp < level.minXP) {
      return level;
    }
  }
  return null;
}

export function getLevelProgress(xp: number): number {
  const current = getLevelForXP(xp);
  const next = getNextLevel(xp);
  if (!next) return 100;
  const range = next.minXP - current.minXP;
  const progress = xp - current.minXP;
  return Math.round((progress / range) * 100);
}

// XP rewards for different activities
export const XP_REWARDS = {
  DAILY_LOGIN: 10,
  CHAT_MESSAGE: 5,
  PLAN_DAY_COMPLETE: 50,     // Biggest XP: plans 20/28 days
  VIGILIA_DAY_COMPLETE: 50,  // Biggest XP: vigilia 21 days
  JOURNEY_DAY_COMPLETE: 50,  // Biggest XP: journey 28 days
  CREATE_CONTENT: 15,
  COMMUNITY_POST: 20,
  COMMUNITY_LIKE: 2,
  COMMUNITY_COMMENT: 5,
  COMMUNITY_FOLLOW: 5,
  COMMUNITY_STORY: 10,
  COMMUNITY_DM: 2,
  QUIZ_COMPLETE: 10,
  CHAPTER_READ: 25,
  PROPHETIC_WORD: 10,
  SHARE_CONTENT: 5,
} as const;
