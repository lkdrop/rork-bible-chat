import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { LightColors, DarkColors, ThemeColors } from '@/constants/colors';

const APP_STATE_KEY = 'bible_app_state';

export type Denomination = 'evangelica' | 'catolica' | 'batista' | 'presbiteriana' | 'pentecostal' | 'outra';
export type BibleTranslation = 'NVI' | 'ARA' | 'NTLH' | 'NVT';
export type ThemeMode = 'light' | 'dark';

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  mood?: string;
}

export type PrayerStatus = 'orando' | 'concluida' | 'gratidao';

export interface PrayerRequest {
  id: string;
  text: string;
  date: string;
  status: PrayerStatus;
  statusDate?: string;
  category?: string;
}

export interface SpiritualGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  createdAt: string;
}

export interface VerseHighlight {
  id: string;
  text: string;
  reference: string;
  note?: string;
  color: string;
  date: string;
}

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

export interface CommunityUserPost {
  id: string;
  content: string;
  type: 'testimony' | 'prayer' | 'question' | 'devotional' | 'verse';
  date: string;
  likes: number;
}

interface AppState {
  hasCompletedOnboarding: boolean;
  denomination: Denomination;
  preferredTranslation: BibleTranslation;
  notificationTime: string;
  theme: ThemeMode;
  streak: number;
  lastActiveDate: string | null;
  totalDaysActive: number;
  journalEntries: JournalEntry[];
  prayerRequests: PrayerRequest[];
  spiritualGoals: SpiritualGoal[];
  favoriteVerses: string[];
  dailyMessageCount: number;
  lastMessageDate: string | null;
  completedPlanDays: Record<string, number[]>;
  quizHighScore: number;
  totalQuizPlayed: number;
  verseHighlights: VerseHighlight[];
  sermonNotes: SermonNote[];
  completedMarathonDays: Record<string, number[]>;
  totalChaptersRead: number;
  journey: JourneyState;
  gamePoints: number;
  gameBattlesWon: number;
  gameTotalBattles: number;
  communityPosts: CommunityUserPost[];
  likedPostIds: string[];
}

const defaultState: AppState = {
  hasCompletedOnboarding: false,
  denomination: 'evangelica',
  preferredTranslation: 'NVI',
  notificationTime: '07:00',
  theme: 'light',
  streak: 0,
  lastActiveDate: null,
  totalDaysActive: 0,
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
      if (prev.lastActiveDate) {
        const lastDate = new Date(prev.lastActiveDate);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / 86400000);
        if (diffDays === 1) {
          newStreak = prev.streak + 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      return {
        ...prev,
        streak: newStreak,
        lastActiveDate: today,
        totalDaysActive: prev.totalDaysActive + 1,
      };
    });
  }, [updateAndSave]);

  const canSendMessage = useCallback((): boolean => {
    const today = new Date().toDateString();
    if (state.lastMessageDate !== today) return true;
    return state.dailyMessageCount < 5;
  }, [state.dailyMessageCount, state.lastMessageDate]);

  const recordMessage = useCallback(() => {
    const today = new Date().toDateString();
    updateAndSave(prev => {
      if (prev.lastMessageDate !== today) {
        return { ...prev, dailyMessageCount: 1, lastMessageDate: today };
      }
      return { ...prev, dailyMessageCount: prev.dailyMessageCount + 1 };
    });
  }, [updateAndSave]);

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

  const addCommunityPost = useCallback((content: string, type: 'testimony' | 'prayer' | 'question' | 'devotional' | 'verse') => {
    const post: CommunityUserPost = {
      id: Date.now().toString(),
      content,
      type,
      date: new Date().toISOString(),
      likes: 0,
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
    resetApp,
  }), [
    state, isLoading, colors,
    completeOnboarding, toggleTheme, recordActivity,
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
    resetApp,
  ]);
});
