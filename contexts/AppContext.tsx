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

export interface PrayerRequest {
  id: string;
  text: string;
  date: string;
  answered: boolean;
  answeredDate?: string;
}

export interface SpiritualGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  createdAt: string;
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
      } catch (error) {
        console.log('Failed to load app state:', error);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  const save = useCallback(async (newState: AppState) => {
    try {
      await AsyncStorage.setItem(APP_STATE_KEY, JSON.stringify(newState));
    } catch (error) {
      console.log('Failed to save app state:', error);
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

  const addPrayerRequest = useCallback((text: string) => {
    const req: PrayerRequest = {
      id: Date.now().toString(),
      text,
      date: new Date().toISOString(),
      answered: false,
    };
    updateAndSave(prev => ({
      ...prev,
      prayerRequests: [req, ...prev.prayerRequests],
    }));
  }, [updateAndSave]);

  const togglePrayerAnswered = useCallback((id: string) => {
    updateAndSave(prev => ({
      ...prev,
      prayerRequests: prev.prayerRequests.map(r =>
        r.id === id
          ? { ...r, answered: !r.answered, answeredDate: !r.answered ? new Date().toISOString() : undefined }
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

  const resetApp = useCallback(async () => {
    setState(defaultState);
    try {
      await AsyncStorage.removeItem(APP_STATE_KEY);
    } catch (error) {
      console.log('Failed to reset app:', error);
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
    togglePrayerAnswered,
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
    resetApp,
  }), [
    state, isLoading, colors,
    completeOnboarding, toggleTheme, recordActivity,
    canSendMessage, recordMessage,
    addJournalEntry, deleteJournalEntry,
    addPrayerRequest, togglePrayerAnswered, deletePrayerRequest,
    addSpiritualGoal, updateGoalProgress, deleteGoal,
    toggleFavoriteVerse, completePlanDay, isPlanDayCompleted,
    updateQuizScore, setTranslation, setDenomination, resetApp,
  ]);
});
