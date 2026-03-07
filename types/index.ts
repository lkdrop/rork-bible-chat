// ═══════════════════════════════════════════
// TIPAGENS GLOBAIS — Bíblia IA
// ═══════════════════════════════════════════

// ─── Usuário & Onboarding ───────────────────
export type Denomination = 'evangelica' | 'catolica' | 'batista' | 'presbiteriana' | 'pentecostal' | 'outra';
export type BibleTranslation = 'NVI' | 'ARA' | 'NTLH' | 'NVT';
export type ThemeMode = 'light' | 'dark';

// ─── Memória do Gabriel ─────────────────────
export interface GabrielMemory {
  facts: string[];
  userName: string | null;
  lastTopics: string[];
  prayerRequests: string[];
  currentStudy: string | null;
  updatedAt: string | null;
}

// ─── Desafio de Onboarding ──────────────────
export interface OnboardingChallenge {
  hasStarted: boolean;
  completedDays: number[];
  startDate: string | null;
  dayRewards: { day: number; xp: number; title: string }[];
}

// ─── Diário Espiritual ──────────────────────
export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  mood?: string;
}

// ─── Oração ─────────────────────────────────
export type PrayerStatus = 'orando' | 'concluida' | 'gratidao';

export interface PrayerRequest {
  id: string;
  text: string;
  date: string;
  status: PrayerStatus;
  statusDate?: string;
  category?: string;
}

// ─── Metas Espirituais ──────────────────────
export interface SpiritualGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  createdAt: string;
}

// ─── Versículos ─────────────────────────────
export interface VerseHighlight {
  id: string;
  text: string;
  reference: string;
  note?: string;
  color: string;
  date: string;
}

export interface DailyVerse {
  text: string;
  reference: string;
  translation: string;
  author?: string;
  explanation?: string;
}

// ─── Sermão ─────────────────────────────────
export interface SermonNote {
  id: string;
  title: string;
  passage: string;
  content: string;
  illustrations: string[];
  crossReferences: string[];
  outline: string;
  date: string;
}

// ─── Jornada Espiritual ─────────────────────
export interface JourneyProfile {
  primaryPain: string;
  desiredOutcome: string;
  spiritualLevel: string;
  commitmentLevel: string;
  tags: string[];
  startDate: string;
}

export interface JourneyState {
  isActive: boolean;
  profile: JourneyProfile | null;
  completedDays: number[];
  currentDay: number;
}

// ─── Vigília ────────────────────────────────
export interface VigiliaState {
  isActive: boolean;
  currentDay: number;
  completedDays: number[];
  startDate: string | null;
  testimony: string | null;
}

// ─── Comunidade ─────────────────────────────
export type CommunityPostType = 'testimony' | 'prayer' | 'question' | 'devotional' | 'verse';

export interface CommunityComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  date: string;
  likes: number;
}

export interface CommunityUserPost {
  id: string;
  content: string;
  type: CommunityPostType;
  date: string;
  likes: number;
  images?: string[];
  comments?: CommunityComment[];
  userId?: string;
}

export interface CommunityProfile {
  id: string;
  name: string;
  avatar: string;
  photo: string | null;
  bio: string;
  level: number;
  title: string;
  xp: number;
  postCount: number;
  followerCount: number;
  followingCount: number;
}

export interface FollowRelation {
  userId: string;
  followedAt: string;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  content: string;
  date: string;
  read: boolean;
}

export interface DMConversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  participantPhoto: string | null;
  messages: DirectMessage[];
  lastMessage: string;
  lastMessageDate: string;
  unreadCount: number;
}

export interface CommunityStory {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userPhoto: string | null;
  imageUri: string;
  caption: string;
  date: string;
  expiresAt: string;
  viewedBy: string[];
}

// ─── Conquistas & Gamificação ───────────────
export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlockedAt?: string;
}

// ─── Chat ───────────────────────────────────
export type ChatMode = 'geral' | 'estudo_palavras' | 'sermao' | 'devocional' | 'teologia' | 'emocao';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  mode?: string;
}

export interface ModeOption {
  id: ChatMode;
  label: string;
  emoji: string;
  description: string;
  color: string;
}

export interface QuickSuggestion {
  emoji: string;
  label: string;
  query: string;
}

export interface ParsedPart {
  type: 'text' | 'verse' | 'prayer';
  content: string;
  reference?: string;
}

// ─── Expressões do Gabriel ──────────────────
export enum GabrielExpression {
  Default = 'default',
  Happy = 'happy',
  Thinking = 'thinking',
  Praying = 'praying',
  Speaking = 'speaking',
}

// ─── Tabs ───────────────────────────────────
export enum AppTab {
  Home = 'home',
  Chat = 'chat',
  Community = 'community',
  Create = 'create',
  Profile = 'profile',
  Study = 'study',
  Games = 'games',
  Tools = 'tools',
}

// ─── Estado Global ──────────────────────────
export interface AppState {
  // Onboarding & Configurações
  hasCompletedOnboarding: boolean;
  denomination: Denomination;
  preferredTranslation: BibleTranslation;
  notificationTime: string;
  theme: ThemeMode;
  onboardingChallenge: OnboardingChallenge;
  gabrielMemory: GabrielMemory;
  personalizationQuiz: {
    spiritualLevel: string | null;
    mainGoal: string | null;
    biggestChallenge: string | null;
    completedAt: string | null;
  };

  // Engajamento
  streak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  totalDaysActive: number;
  streakMilestones: number[];
  streakRepairs: number;
  lastStreakRepairDate: string | null;
  streakRepaired: boolean;

  // Premium
  isPremium: boolean;
  premiumSince: string | null;

  // Limites diários
  dailyMessageCount: number;
  lastMessageDate: string | null;
  dailyCreateCount: number;
  lastCreateDate: string | null;
  dailyPropheticUsed: boolean;
  lastPropheticDate: string | null;

  // Progresso
  completedPlanDays: Record<string, number[]>;
  completedMarathonDays: Record<string, number[]>;
  totalChaptersRead: number;
  quizHighScore: number;
  totalQuizPlayed: number;

  // Coleções
  journalEntries: JournalEntry[];
  prayerRequests: PrayerRequest[];
  spiritualGoals: SpiritualGoal[];
  favoriteVerses: string[];
  favoriteVerse: string | null;
  verseHighlights: VerseHighlight[];
  sermonNotes: SermonNote[];

  // Jogos & Gamificação
  gamePoints: number;
  gameBattlesWon: number;
  gameTotalBattles: number;
  xp: number;
  achievements: Achievement[];

  // Comunidade
  communityPosts: CommunityUserPost[];
  likedPostIds: string[];
  communityName: string;
  communityAvatar: string;
  communityPhoto: string | null;
  communityBio: string;
  following: FollowRelation[];
  followers: FollowRelation[];
  savedPostIds: string[];
  stories: CommunityStory[];
  dmConversations: DMConversation[];
  totalUnreadDMs: number;

  // Programas
  journey: JourneyState;
  vigilia: VigiliaState;
}
