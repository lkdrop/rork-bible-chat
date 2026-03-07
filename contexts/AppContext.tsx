import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { LightColors, DarkColors, ThemeColors } from '@/constants/colors';
import { XP_REWARDS } from '@/constants/levels';
import { getPlanLimits, isAdminEmail } from '@/constants/plans';
import type { PlanId } from '@/constants/plans';
import type {
  Denomination,
  BibleTranslation,
  ThemeMode,
  JournalEntry,
  PrayerStatus,
  PrayerRequest,
  SpiritualGoal,
  VerseHighlight,
  SermonNote,
  JourneyProfile,
  JourneyState,
  CommunityUserPost,
  CommunityComment,
  CommunityStory,
  DMConversation,
  DirectMessage,
  Achievement,
  VigiliaState,
  AppState,
} from '@/types';

// Re-export dos types para compatibilidade com imports existentes
export type {
  Denomination,
  BibleTranslation,
  ThemeMode,
  JournalEntry,
  PrayerStatus,
  PrayerRequest,
  SpiritualGoal,
  VerseHighlight,
  SermonNote,
  JourneyProfile,
  JourneyState,
  CommunityUserPost,
  CommunityComment,
  CommunityStory,
  DMConversation,
  DirectMessage,
  Achievement,
  VigiliaState,
};

const APP_STATE_KEY = 'bible_app_state';

const defaultState: AppState = {
  email: null,
  hasCompletedOnboarding: false,
  denomination: 'evangelica',
  preferredTranslation: 'NVI',
  notificationTime: '07:00',
  theme: 'light',
  gabrielMemory: {
    facts: [],
    userName: null,
    lastTopics: [],
    prayerRequests: [],
    currentStudy: null,
    updatedAt: null,
  },
  personalizationQuiz: {
    spiritualLevel: null,
    mainGoal: null,
    biggestChallenge: null,
    completedAt: null,
  },
  onboardingChallenge: {
    hasStarted: false,
    completedDays: [],
    startDate: null,
    dayRewards: [
      { day: 1, xp: 100, title: 'Primeiro Devocional' },
      { day: 2, xp: 100, title: 'Primeira Oração Guiada' },
      { day: 3, xp: 150, title: 'Criar Conteúdo' },
      { day: 4, xp: 100, title: 'Entrar na Comunidade' },
      { day: 5, xp: 150, title: 'Aprofundar Estudo' },
      { day: 6, xp: 100, title: 'Oração Comunitária' },
      { day: 7, xp: 200, title: 'Celebração & Próximos Passos' },
    ],
  },
  streak: 0,
  longestStreak: 0,
  lastActiveDate: null,
  totalDaysActive: 0,
  streakRepairs: 1,
  lastStreakRepairDate: null,
  streakRepaired: false,
  journalEntries: [],
  prayerRequests: [],
  spiritualGoals: [],
  favoriteVerses: [],
  dailyMessageCount: 0,
  lastMessageDate: null,
  completedPlanDays: {},
  quizHighScore: 0,
  totalQuizPlayed: 0,
  verseHighlights: [],
  sermonNotes: [],
  completedMarathonDays: {},
  totalChaptersRead: 0,
  gamePoints: 0,
  gameBattlesWon: 0,
  gameTotalBattles: 0,
  communityPosts: [],
  likedPostIds: [],
  communityPhoto: null,
  communityBio: '',
  following: [],
  followers: [],
  savedPostIds: [],
  stories: [],
  dmConversations: [],
  totalUnreadDMs: 0,
  isPremium: false,
  premiumSince: null,
  plan: 'free' as const,
  dailyPropheticUsed: false,
  dailyPropheticCount: 0,
  lastPropheticDate: null,
  dailyCreateCount: 0,
  lastCreateDate: null,
  dailyImageCount: 0,
  lastImageDate: null,
  dailyTTSCount: 0,
  lastTTSDate: null,
  monthlyMessageCount: 0,
  monthlyImageCount: 0,
  monthlyTTSChars: 0,
  monthlyUsageReset: null,
  vigilia: {
    isActive: false,
    currentDay: 1,
    completedDays: [],
    startDate: null,
    testimony: null,
  },
  achievements: [],
  streakMilestones: [],
  favoriteVerse: null,
  xp: 0,
  communityName: '',
  communityAvatar: '🙏',
  journey: {
    isActive: false,
    profile: null,
    completedDays: [],
    currentDay: 1,
  },
};

export const [AppProvider, useApp] = createContextHook(() => {
  const [state, setState] = useState<AppState>(defaultState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(APP_STATE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as Partial<AppState>;
          setState({ ...defaultState, ...parsed });
        }
      } catch {
        // Failed to load app state
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  const save = useCallback(async (newState: AppState) => {
    try {
      await AsyncStorage.setItem(APP_STATE_KEY, JSON.stringify(newState));
    } catch {
      // Failed to save app state
    }
  }, []);

  const colors: ThemeColors = useMemo(() => {
    return state.theme === 'dark' ? DarkColors : LightColors;
  }, [state.theme]);

  const updateAndSave = useCallback((updater: (prev: AppState) => AppState) => {
    setState(prev => {
      const next = updater(prev);
      void save(next);
      return next;
    });
  }, [save]);

  const completeOnboarding = useCallback((denomination: Denomination, translation: BibleTranslation, notifTime: string) => {
    updateAndSave(prev => ({
      ...prev,
      hasCompletedOnboarding: true,
      denomination,
      preferredTranslation: translation,
      notificationTime: notifTime,
    }));
  }, [updateAndSave]);

  // ─── Memória do Gabriel ────────────────────
  const updateGabrielMemory = useCallback((updates: Partial<import('@/types').GabrielMemory>) => {
    updateAndSave(prev => ({
      ...prev,
      gabrielMemory: {
        ...prev.gabrielMemory,
        ...updates,
        updatedAt: new Date().toISOString(),
      },
    }));
  }, [updateAndSave]);

  const addGabrielFact = useCallback((fact: string) => {
    updateAndSave(prev => {
      const existing = prev.gabrielMemory.facts;
      if (existing.includes(fact) || existing.length >= 20) return prev;
      return {
        ...prev,
        gabrielMemory: {
          ...prev.gabrielMemory,
          facts: [...existing, fact],
          updatedAt: new Date().toISOString(),
        },
      };
    });
  }, [updateAndSave]);

  const getGabrielMemoryPrompt = useCallback((): string => {
    const mem = state.gabrielMemory;
    const parts: string[] = [];

    if (mem.userName) parts.push(`Nome do usuário: ${mem.userName}`);
    if (mem.currentStudy) parts.push(`Estudando atualmente: ${mem.currentStudy}`);
    if (mem.prayerRequests.length > 0) parts.push(`Pedidos de oração: ${mem.prayerRequests.slice(-3).join(', ')}`);
    if (mem.lastTopics.length > 0) parts.push(`Últimos temas conversados: ${mem.lastTopics.slice(-5).join(', ')}`);
    if (mem.facts.length > 0) parts.push(`Fatos sobre o usuário: ${mem.facts.slice(-10).join('; ')}`);

    // Quiz de personalização
    const quiz = state.personalizationQuiz;
    if (quiz.completedAt) {
      if (quiz.spiritualLevel) parts.push(`Nível espiritual: ${quiz.spiritualLevel}`);
      if (quiz.mainGoal) parts.push(`Objetivo principal: ${quiz.mainGoal}`);
      if (quiz.biggestChallenge) parts.push(`Maior desafio: ${quiz.biggestChallenge}`);
    }

    if (parts.length === 0) return '';
    return `\n\n=== MEMÓRIA DO USUÁRIO (use naturalmente, não mencione que "lembra") ===\n${parts.join('\n')}`;
  }, [state.gabrielMemory, state.personalizationQuiz]);

  const completePersonalizationQuiz = useCallback((spiritualLevel: string, mainGoal: string, biggestChallenge: string) => {
    updateAndSave(prev => ({
      ...prev,
      personalizationQuiz: {
        spiritualLevel,
        mainGoal,
        biggestChallenge,
        completedAt: new Date().toISOString(),
      },
      xp: prev.xp + 50,
    }));
  }, [updateAndSave]);

  const startOnboardingChallenge = useCallback(() => {
    updateAndSave(prev => ({
      ...prev,
      onboardingChallenge: {
        ...prev.onboardingChallenge,
        hasStarted: true,
        startDate: new Date().toISOString(),
      },
    }));
  }, [updateAndSave]);

  const completeChallengDay = useCallback((day: number) => {
    updateAndSave(prev => {
      const challenge = prev.onboardingChallenge;
      if (challenge.completedDays.includes(day)) return prev;

      const dayReward = challenge.dayRewards.find(d => d.day === day);
      const xpGain = dayReward?.xp || 0;

      return {
        ...prev,
        onboardingChallenge: {
          ...challenge,
          completedDays: [...challenge.completedDays, day].sort((a, b) => a - b),
        },
        xp: prev.xp + xpGain,
      };
    });
  }, [updateAndSave]);

  const toggleTheme = useCallback(() => {
    updateAndSave(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light',
    }));
  }, [updateAndSave]);

  const recordActivity = useCallback(() => {
    const today = new Date().toDateString();
    updateAndSave(prev => {
      if (prev.lastActiveDate === today) return prev;

      let newStreak = prev.streak;
      let repairsLeft = prev.streakRepairs;
      let wasRepaired = false;

      // Dar 1 reparo por semana para premium
      let newRepairs = repairsLeft;
      if (prev.isPremium) {
        const lastRepair = prev.lastStreakRepairDate;
        if (!lastRepair || (Date.now() - new Date(lastRepair).getTime()) > 7 * 86400000) {
          newRepairs = Math.min(repairsLeft + 1, 3);
        }
      }

      if (prev.lastActiveDate) {
        const lastDate = new Date(prev.lastActiveDate);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / 86400000);
        if (diffDays === 1) {
          newStreak = prev.streak + 1;
        } else if (diffDays === 2 && newRepairs > 0) {
          // Perdeu só 1 dia e tem reparo disponível → usar reparo
          newStreak = prev.streak + 1;
          newRepairs -= 1;
          wasRepaired = true;
        } else if (diffDays > 1) {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      return {
        ...prev,
        streak: newStreak,
        longestStreak: Math.max(prev.longestStreak || 0, newStreak),
        lastActiveDate: today,
        totalDaysActive: prev.totalDaysActive + 1,
        xp: prev.xp + XP_REWARDS.DAILY_LOGIN,
        streakRepairs: newRepairs,
        streakRepaired: wasRepaired,
        lastStreakRepairDate: wasRepaired ? today : (prev.lastStreakRepairDate || null),
      };
    });
  }, [updateAndSave]);

  const resetMonthlyIfNeeded = useCallback((prev: AppState): AppState => {
    const now = new Date();
    const resetDate = prev.monthlyUsageReset ? new Date(prev.monthlyUsageReset) : null;
    if (!resetDate || now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear()) {
      return {
        ...prev,
        monthlyMessageCount: 0,
        monthlyImageCount: 0,
        monthlyTTSChars: 0,
        monthlyUsageReset: now.toISOString(),
      };
    }
    return prev;
  }, []);

  const canSendMessage = useCallback((): boolean => {
    const limits = getPlanLimits(state.plan || 'free');
    const today = new Date().toDateString();
    const dailyCount = state.lastMessageDate === today ? state.dailyMessageCount : 0;
    if (dailyCount >= limits.dailyMessages) return false;
    if (state.monthlyMessageCount >= limits.monthlyMessages) return false;
    return true;
  }, [state.dailyMessageCount, state.lastMessageDate, state.plan, state.monthlyMessageCount]);

  const recordMessage = useCallback(() => {
    const today = new Date().toDateString();
    updateAndSave(prev => {
      let s = resetMonthlyIfNeeded(prev);
      if (s.lastMessageDate !== today) {
        return { ...s, dailyMessageCount: 1, lastMessageDate: today, monthlyMessageCount: s.monthlyMessageCount + 1, xp: s.xp + XP_REWARDS.CHAT_MESSAGE };
      }
      return { ...s, dailyMessageCount: s.dailyMessageCount + 1, monthlyMessageCount: s.monthlyMessageCount + 1, xp: s.xp + XP_REWARDS.CHAT_MESSAGE };
    });
  }, [updateAndSave, resetMonthlyIfNeeded]);

  const addJournalEntry = useCallback((title: string, content: string, mood?: string) => {
    const entry: JournalEntry = {
      id: Date.now().toString(),
      title,
      content,
      date: new Date().toISOString(),
      mood,
    };
    updateAndSave(prev => ({
      ...prev,
      journalEntries: [entry, ...prev.journalEntries],
    }));
  }, [updateAndSave]);

  const deleteJournalEntry = useCallback((id: string) => {
    updateAndSave(prev => ({
      ...prev,
      journalEntries: prev.journalEntries.filter(e => e.id !== id),
    }));
  }, [updateAndSave]);

  const addPrayerRequest = useCallback((text: string, category?: string) => {
    const req: PrayerRequest = {
      id: Date.now().toString(),
      text,
      date: new Date().toISOString(),
      status: 'orando',
      category,
    };
    updateAndSave(prev => ({
      ...prev,
      prayerRequests: [req, ...prev.prayerRequests],
    }));
  }, [updateAndSave]);

  const updatePrayerStatus = useCallback((id: string, status: PrayerStatus) => {
    updateAndSave(prev => ({
      ...prev,
      prayerRequests: prev.prayerRequests.map(r =>
        r.id === id
          ? { ...r, status, statusDate: status !== 'orando' ? new Date().toISOString() : undefined }
          : r
      ),
    }));
  }, [updateAndSave]);

  const deletePrayerRequest = useCallback((id: string) => {
    updateAndSave(prev => ({
      ...prev,
      prayerRequests: prev.prayerRequests.filter(r => r.id !== id),
    }));
  }, [updateAndSave]);

  const addSpiritualGoal = useCallback((title: string, target: number, unit: string) => {
    const goal: SpiritualGoal = {
      id: Date.now().toString(),
      title,
      target,
      current: 0,
      unit,
      createdAt: new Date().toISOString(),
    };
    updateAndSave(prev => ({
      ...prev,
      spiritualGoals: [...prev.spiritualGoals, goal],
    }));
  }, [updateAndSave]);

  const updateGoalProgress = useCallback((id: string, increment: number) => {
    updateAndSave(prev => ({
      ...prev,
      spiritualGoals: prev.spiritualGoals.map(g =>
        g.id === id ? { ...g, current: Math.min(g.current + increment, g.target) } : g
      ),
    }));
  }, [updateAndSave]);

  const deleteGoal = useCallback((id: string) => {
    updateAndSave(prev => ({
      ...prev,
      spiritualGoals: prev.spiritualGoals.filter(g => g.id !== id),
    }));
  }, [updateAndSave]);

  const toggleFavoriteVerse = useCallback((verseRef: string) => {
    updateAndSave(prev => ({
      ...prev,
      favoriteVerses: prev.favoriteVerses.includes(verseRef)
        ? prev.favoriteVerses.filter(v => v !== verseRef)
        : [...prev.favoriteVerses, verseRef],
    }));
  }, [updateAndSave]);

  const completePlanDay = useCallback((planId: string, day: number) => {
    updateAndSave(prev => {
      const current = prev.completedPlanDays[planId] || [];
      if (current.includes(day)) return prev;
      return {
        ...prev,
        completedPlanDays: {
          ...prev.completedPlanDays,
          [planId]: [...current, day],
        },
        xp: prev.xp + XP_REWARDS.PLAN_DAY_COMPLETE,
      };
    });
  }, [updateAndSave]);

  const isPlanDayCompleted = useCallback((planId: string, day: number): boolean => {
    return (state.completedPlanDays[planId] || []).includes(day);
  }, [state.completedPlanDays]);

  const updateQuizScore = useCallback((score: number) => {
    updateAndSave(prev => ({
      ...prev,
      quizHighScore: Math.max(prev.quizHighScore, score),
      totalQuizPlayed: prev.totalQuizPlayed + 1,
      xp: prev.xp + XP_REWARDS.QUIZ_COMPLETE,
    }));
  }, [updateAndSave]);

  const setTranslation = useCallback((translation: BibleTranslation) => {
    updateAndSave(prev => ({ ...prev, preferredTranslation: translation }));
  }, [updateAndSave]);

  const setDenomination = useCallback((denomination: Denomination) => {
    updateAndSave(prev => ({ ...prev, denomination }));
  }, [updateAndSave]);

  const addVerseHighlight = useCallback((text: string, reference: string, note?: string, color?: string) => {
    const highlight: VerseHighlight = {
      id: Date.now().toString(),
      text,
      reference,
      note,
      color: color || '#C5943A',
      date: new Date().toISOString(),
    };
    updateAndSave(prev => ({
      ...prev,
      verseHighlights: [highlight, ...prev.verseHighlights],
    }));
  }, [updateAndSave]);

  const deleteVerseHighlight = useCallback((id: string) => {
    updateAndSave(prev => ({
      ...prev,
      verseHighlights: prev.verseHighlights.filter(h => h.id !== id),
    }));
  }, [updateAndSave]);

  const addSermonNote = useCallback((title: string, passage: string, content: string, outline: string, illustrations: string[], crossReferences: string[]) => {
    const note: SermonNote = {
      id: Date.now().toString(),
      title,
      passage,
      content,
      outline,
      illustrations,
      crossReferences,
      date: new Date().toISOString(),
    };
    updateAndSave(prev => ({
      ...prev,
      sermonNotes: [note, ...prev.sermonNotes],
    }));
  }, [updateAndSave]);

  const deleteSermonNote = useCallback((id: string) => {
    updateAndSave(prev => ({
      ...prev,
      sermonNotes: prev.sermonNotes.filter(n => n.id !== id),
    }));
  }, [updateAndSave]);

  const completeMarathonDay = useCallback((marathonId: string, day: number) => {
    updateAndSave(prev => {
      const current = prev.completedMarathonDays[marathonId] || [];
      if (current.includes(day)) return prev;
      return {
        ...prev,
        completedMarathonDays: {
          ...prev.completedMarathonDays,
          [marathonId]: [...current, day],
        },
        totalChaptersRead: prev.totalChaptersRead + 1,
        xp: prev.xp + XP_REWARDS.CHAPTER_READ,
      };
    });
  }, [updateAndSave]);

  const isMarathonDayCompleted = useCallback((marathonId: string, day: number): boolean => {
    return (state.completedMarathonDays[marathonId] || []).includes(day);
  }, [state.completedMarathonDays]);

  const startJourney = useCallback((profile: JourneyProfile) => {
    updateAndSave(prev => ({
      ...prev,
      journey: {
        isActive: true,
        profile,
        completedDays: [],
        currentDay: 1,
      },
    }));
  }, [updateAndSave]);

  const completeJourneyDay = useCallback((day: number) => {
    updateAndSave(prev => {
      if (prev.journey.completedDays.includes(day)) return prev;
      const newCompleted = [...prev.journey.completedDays, day];
      return {
        ...prev,
        journey: {
          ...prev.journey,
          completedDays: newCompleted,
          currentDay: Math.max(prev.journey.currentDay, day + 1),
        },
        xp: prev.xp + XP_REWARDS.JOURNEY_DAY_COMPLETE,
      };
    });
  }, [updateAndSave]);

  const isJourneyDayCompleted = useCallback((day: number): boolean => {
    return state.journey.completedDays.includes(day);
  }, [state.journey.completedDays]);

  const addGameResult = useCallback((score: number, totalQuestions: number, won: boolean) => {
    updateAndSave(prev => ({
      ...prev,
      gamePoints: prev.gamePoints + score,
      gameBattlesWon: prev.gameBattlesWon + (won ? 1 : 0),
      gameTotalBattles: prev.gameTotalBattles + 1,
    }));
  }, [updateAndSave]);

  const addCommunityPost = useCallback((content: string, type: 'testimony' | 'prayer' | 'question' | 'devotional' | 'verse', images?: string[]) => {
    const post: CommunityUserPost = {
      id: Date.now().toString(),
      content,
      type,
      date: new Date().toISOString(),
      likes: 0,
      images: images || [],
      comments: [],
      userId: 'self',
    };
    updateAndSave(prev => ({
      ...prev,
      communityPosts: [post, ...prev.communityPosts],
    }));
  }, [updateAndSave]);

  const toggleLikePost = useCallback((postId: string) => {
    updateAndSave(prev => ({
      ...prev,
      likedPostIds: prev.likedPostIds.includes(postId)
        ? prev.likedPostIds.filter(id => id !== postId)
        : [...prev.likedPostIds, postId],
    }));
  }, [updateAndSave]);

  const setEmail = useCallback((email: string) => {
    updateAndSave(prev => ({ ...prev, email }));
  }, [updateAndSave]);

  const activatePremium = useCallback((planId?: PlanId) => {
    const plan = planId || 'semente';
    updateAndSave(prev => ({
      ...prev,
      isPremium: true,
      premiumSince: new Date().toISOString(),
      plan,
    }));
  }, [updateAndSave]);

  // Auto-activate premium for admin emails
  useEffect(() => {
    if (state.email && isAdminEmail(state.email) && (!state.isPremium || state.plan !== 'oferta')) {
      activatePremium('oferta');
    }
  }, [state.email]);

  const canUseProphetic = useCallback((): boolean => {
    const limits = getPlanLimits(state.plan || 'free');
    const today = new Date().toDateString();
    const dailyCount = state.lastPropheticDate === today ? (state.dailyPropheticCount || 0) : 0;
    return dailyCount < limits.dailyProphetic;
  }, [state.plan, state.lastPropheticDate, state.dailyPropheticCount]);

  const recordPropheticUse = useCallback(() => {
    const today = new Date().toDateString();
    updateAndSave(prev => {
      const count = prev.lastPropheticDate === today ? (prev.dailyPropheticCount || 0) : 0;
      return {
        ...prev,
        dailyPropheticUsed: true,
        dailyPropheticCount: count + 1,
        lastPropheticDate: today,
      };
    });
  }, [updateAndSave]);

  const canCreate = useCallback((): boolean => {
    const limits = getPlanLimits(state.plan || 'free');
    const today = new Date().toDateString();
    const dailyCount = state.lastCreateDate === today ? state.dailyCreateCount : 0;
    return dailyCount < limits.dailyCreates;
  }, [state.plan, state.lastCreateDate, state.dailyCreateCount]);

  const recordCreate = useCallback(() => {
    const today = new Date().toDateString();
    updateAndSave(prev => {
      if (prev.lastCreateDate !== today) {
        return { ...prev, dailyCreateCount: 1, lastCreateDate: today, xp: prev.xp + XP_REWARDS.CREATE_CONTENT };
      }
      return { ...prev, dailyCreateCount: prev.dailyCreateCount + 1, xp: prev.xp + XP_REWARDS.CREATE_CONTENT };
    });
  }, [updateAndSave]);

  const canGenerateImage = useCallback((): boolean => {
    const limits = getPlanLimits(state.plan || 'free');
    if (limits.dailyImages === 0) return false;
    const today = new Date().toDateString();
    const dailyCount = state.lastImageDate === today ? state.dailyImageCount : 0;
    if (dailyCount >= limits.dailyImages) return false;
    if (state.monthlyImageCount >= limits.monthlyImages) return false;
    return true;
  }, [state.plan, state.lastImageDate, state.dailyImageCount, state.monthlyImageCount]);

  const recordImageGen = useCallback(() => {
    const today = new Date().toDateString();
    updateAndSave(prev => {
      let s = resetMonthlyIfNeeded(prev);
      const dailyCount = s.lastImageDate === today ? s.dailyImageCount : 0;
      return {
        ...s,
        dailyImageCount: dailyCount + 1,
        lastImageDate: today,
        monthlyImageCount: s.monthlyImageCount + 1,
      };
    });
  }, [updateAndSave, resetMonthlyIfNeeded]);

  const canUseTTS = useCallback((): boolean => {
    const limits = getPlanLimits(state.plan || 'free');
    if (limits.dailyTTS === 0) return false;
    const today = new Date().toDateString();
    const dailyCount = state.lastTTSDate === today ? state.dailyTTSCount : 0;
    return dailyCount < limits.dailyTTS;
  }, [state.plan, state.lastTTSDate, state.dailyTTSCount]);

  const recordTTSUse = useCallback(() => {
    const today = new Date().toDateString();
    updateAndSave(prev => {
      const dailyCount = prev.lastTTSDate === today ? prev.dailyTTSCount : 0;
      return {
        ...prev,
        dailyTTSCount: dailyCount + 1,
        lastTTSDate: today,
      };
    });
  }, [updateAndSave]);

  const startVigilia = useCallback(() => {
    updateAndSave(prev => ({
      ...prev,
      vigilia: {
        isActive: true,
        currentDay: 1,
        completedDays: [],
        startDate: new Date().toISOString(),
        testimony: null,
      },
    }));
  }, [updateAndSave]);

  const completeVigiliaDay = useCallback((day: number) => {
    updateAndSave(prev => {
      if (prev.vigilia.completedDays.includes(day)) return prev;
      return {
        ...prev,
        vigilia: {
          ...prev.vigilia,
          completedDays: [...prev.vigilia.completedDays, day],
          currentDay: Math.max(prev.vigilia.currentDay, day + 1),
        },
        xp: prev.xp + XP_REWARDS.VIGILIA_DAY_COMPLETE,
      };
    });
  }, [updateAndSave]);

  const saveVigiliaTestimony = useCallback((testimony: string) => {
    updateAndSave(prev => ({
      ...prev,
      vigilia: {
        ...prev.vigilia,
        testimony,
      },
    }));
  }, [updateAndSave]);

  const unlockAchievement = useCallback((id: string, title: string, description: string, emoji: string) => {
    updateAndSave(prev => {
      if (prev.achievements.some(a => a.id === id)) return prev;
      return {
        ...prev,
        achievements: [...prev.achievements, { id, title, description, emoji, unlockedAt: new Date().toISOString() }],
      };
    });
  }, [updateAndSave]);

  const recordStreakMilestone = useCallback((milestone: number) => {
    updateAndSave(prev => {
      if (prev.streakMilestones.includes(milestone)) return prev;
      return {
        ...prev,
        streakMilestones: [...prev.streakMilestones, milestone],
      };
    });
  }, [updateAndSave]);

  const setFavoriteVerse = useCallback((verse: string | null) => {
    updateAndSave(prev => ({ ...prev, favoriteVerse: verse }));
  }, [updateAndSave]);

  const gainXP = useCallback((amount: number) => {
    updateAndSave(prev => ({ ...prev, xp: prev.xp + amount }));
  }, [updateAndSave]);

  const setCommunityProfile = useCallback((name: string, avatar: string) => {
    updateAndSave(prev => ({ ...prev, communityName: name, communityAvatar: avatar }));
  }, [updateAndSave]);

  const setCommunityPhoto = useCallback((photo: string | null) => {
    updateAndSave(prev => ({ ...prev, communityPhoto: photo }));
  }, [updateAndSave]);

  const setCommunityBio = useCallback((bio: string) => {
    updateAndSave(prev => ({ ...prev, communityBio: bio }));
  }, [updateAndSave]);

  const addComment = useCallback((postId: string, content: string) => {
    const comment: CommunityComment = {
      id: Date.now().toString(),
      postId,
      userId: 'self',
      userName: state.communityName || 'Eu',
      userAvatar: state.communityAvatar,
      content,
      date: new Date().toISOString(),
      likes: 0,
    };
    updateAndSave(prev => ({
      ...prev,
      communityPosts: prev.communityPosts.map(p =>
        p.id === postId ? { ...p, comments: [...(p.comments || []), comment] } : p
      ),
      xp: prev.xp + XP_REWARDS.COMMUNITY_COMMENT,
    }));
  }, [updateAndSave, state.communityName, state.communityAvatar]);

  const followUser = useCallback((userId: string) => {
    updateAndSave(prev => {
      if (prev.following.some(f => f.userId === userId)) return prev;
      return {
        ...prev,
        following: [...prev.following, { userId, followedAt: new Date().toISOString() }],
        xp: prev.xp + XP_REWARDS.COMMUNITY_FOLLOW,
      };
    });
  }, [updateAndSave]);

  const unfollowUser = useCallback((userId: string) => {
    updateAndSave(prev => ({
      ...prev,
      following: prev.following.filter(f => f.userId !== userId),
    }));
  }, [updateAndSave]);

  const isFollowing = useCallback((userId: string): boolean => {
    return state.following.some(f => f.userId === userId);
  }, [state.following]);

  const savePost = useCallback((postId: string) => {
    updateAndSave(prev => ({
      ...prev,
      savedPostIds: prev.savedPostIds.includes(postId)
        ? prev.savedPostIds.filter(id => id !== postId)
        : [...prev.savedPostIds, postId],
    }));
  }, [updateAndSave]);

  const addStory = useCallback((imageUri: string, caption: string) => {
    const story: CommunityStory = {
      id: Date.now().toString(),
      userId: 'self',
      userName: state.communityName || 'Eu',
      userAvatar: state.communityAvatar,
      userPhoto: state.communityPhoto,
      imageUri,
      caption,
      date: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      viewedBy: [],
    };
    updateAndSave(prev => ({
      ...prev,
      stories: [story, ...prev.stories],
      xp: prev.xp + XP_REWARDS.COMMUNITY_STORY,
    }));
  }, [updateAndSave, state.communityName, state.communityAvatar, state.communityPhoto]);

  const markStoryViewed = useCallback((storyId: string) => {
    updateAndSave(prev => ({
      ...prev,
      stories: prev.stories.map(s =>
        s.id === storyId && !s.viewedBy.includes('self')
          ? { ...s, viewedBy: [...s.viewedBy, 'self'] }
          : s
      ),
    }));
  }, [updateAndSave]);

  const sendDM = useCallback((conversationId: string, content: string) => {
    const msg: DirectMessage = {
      id: Date.now().toString(),
      senderId: 'self',
      content,
      date: new Date().toISOString(),
      read: true,
    };
    updateAndSave(prev => ({
      ...prev,
      dmConversations: prev.dmConversations.map(c =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, msg], lastMessage: content, lastMessageDate: msg.date }
          : c
      ),
      xp: prev.xp + XP_REWARDS.COMMUNITY_DM,
    }));
  }, [updateAndSave]);

  const startDMConversation = useCallback((userId: string, userName: string, userAvatar: string, userPhoto: string | null): string => {
    const existing = state.dmConversations.find(c => c.participantId === userId);
    if (existing) return existing.id;
    const id = Date.now().toString();
    const conv: DMConversation = {
      id,
      participantId: userId,
      participantName: userName,
      participantAvatar: userAvatar,
      participantPhoto: userPhoto,
      messages: [],
      lastMessage: '',
      lastMessageDate: new Date().toISOString(),
      unreadCount: 0,
    };
    updateAndSave(prev => ({
      ...prev,
      dmConversations: [conv, ...prev.dmConversations],
    }));
    return id;
  }, [updateAndSave, state.dmConversations]);

  const markConversationRead = useCallback((conversationId: string) => {
    updateAndSave(prev => {
      const conv = prev.dmConversations.find(c => c.id === conversationId);
      const unreadDelta = conv ? conv.unreadCount : 0;
      return {
        ...prev,
        dmConversations: prev.dmConversations.map(c =>
          c.id === conversationId
            ? { ...c, unreadCount: 0, messages: c.messages.map(m => ({ ...m, read: true })) }
            : c
        ),
        totalUnreadDMs: Math.max(0, prev.totalUnreadDMs - unreadDelta),
      };
    });
  }, [updateAndSave]);

  const receiveDM = useCallback((conversationId: string, senderId: string, content: string) => {
    const msg: DirectMessage = {
      id: Date.now().toString(),
      senderId,
      content,
      date: new Date().toISOString(),
      read: false,
    };
    updateAndSave(prev => ({
      ...prev,
      dmConversations: prev.dmConversations.map(c =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, msg], lastMessage: content, lastMessageDate: msg.date, unreadCount: c.unreadCount + 1 }
          : c
      ),
      totalUnreadDMs: prev.totalUnreadDMs + 1,
    }));
  }, [updateAndSave]);

  const resetApp = useCallback(async () => {
    setState(defaultState);
    try {
      await AsyncStorage.removeItem(APP_STATE_KEY);
    } catch {
      // Failed to reset app
    }
  }, []);

  return useMemo(() => ({
    state,
    isLoading,
    colors,
    completeOnboarding,
    completePersonalizationQuiz,
    startOnboardingChallenge,
    completeChallengDay,
    updateGabrielMemory,
    addGabrielFact,
    getGabrielMemoryPrompt,
    toggleTheme,
    recordActivity,
    canSendMessage,
    recordMessage,
    addJournalEntry,
    deleteJournalEntry,
    addPrayerRequest,
    updatePrayerStatus,
    deletePrayerRequest,
    addSpiritualGoal,
    updateGoalProgress,
    deleteGoal,
    toggleFavoriteVerse,
    completePlanDay,
    isPlanDayCompleted,
    updateQuizScore,
    setTranslation,
    setDenomination,
    addVerseHighlight,
    deleteVerseHighlight,
    addSermonNote,
    deleteSermonNote,
    completeMarathonDay,
    isMarathonDayCompleted,
    startJourney,
    completeJourneyDay,
    isJourneyDayCompleted,
    addGameResult,
    addCommunityPost,
    toggleLikePost,
    activatePremium,
    setEmail,
    canUseProphetic,
    recordPropheticUse,
    canCreate,
    recordCreate,
    canGenerateImage,
    recordImageGen,
    canUseTTS,
    recordTTSUse,
    startVigilia,
    completeVigiliaDay,
    saveVigiliaTestimony,
    unlockAchievement,
    recordStreakMilestone,
    setFavoriteVerse,
    gainXP,
    setCommunityProfile,
    setCommunityPhoto,
    setCommunityBio,
    addComment,
    followUser,
    unfollowUser,
    isFollowing,
    savePost,
    addStory,
    markStoryViewed,
    sendDM,
    startDMConversation,
    markConversationRead,
    receiveDM,
    resetApp,
  }), [
    state, isLoading, colors,
    completeOnboarding, completePersonalizationQuiz, startOnboardingChallenge, completeChallengDay,
    updateGabrielMemory, addGabrielFact, getGabrielMemoryPrompt,
    toggleTheme, recordActivity,
    canSendMessage, recordMessage,
    addJournalEntry, deleteJournalEntry,
    addPrayerRequest, updatePrayerStatus, deletePrayerRequest,
    addSpiritualGoal, updateGoalProgress, deleteGoal,
    toggleFavoriteVerse, completePlanDay, isPlanDayCompleted,
    updateQuizScore, setTranslation, setDenomination,
    addVerseHighlight, deleteVerseHighlight,
    addSermonNote, deleteSermonNote,
    completeMarathonDay, isMarathonDayCompleted,
    startJourney, completeJourneyDay, isJourneyDayCompleted,
    addGameResult, addCommunityPost, toggleLikePost,
    activatePremium, setEmail, canUseProphetic, recordPropheticUse,
    canCreate, recordCreate,
    canGenerateImage, recordImageGen,
    canUseTTS, recordTTSUse,
    startVigilia, completeVigiliaDay, saveVigiliaTestimony,
    unlockAchievement, recordStreakMilestone, setFavoriteVerse,
    gainXP, setCommunityProfile,
    setCommunityPhoto, setCommunityBio,
    addComment, followUser, unfollowUser, isFollowing,
    savePost, addStory, markStoryViewed,
    sendDM, startDMConversation, markConversationRead, receiveDM,
    resetApp,
  ]);
});
