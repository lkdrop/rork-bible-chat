import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { LifeArea, prayers } from '@/constants/prayers';
import { achievements } from '@/constants/achievements';

const STORAGE_KEY = 'prayer_guide_data';
const QUIZ_COMPLETED_KEY = 'prayer_quiz_completed';

export interface DiaryEntry {
  id: string;
  prayerId: string;
  prayerTitle: string;
  note: string;
  answered: boolean;
  answeredDate: string | null;
  createdAt: string;
}

interface PrayerGuideData {
  selectedAreas: LifeArea[];
  completedPrayers: string[];
  favoritePrayers: string[];
  streak: number;
  lastPrayerDate: string | null;
  unlockedAchievements: string[];
  chatMessageCount: number;
  earlyPrayerDone: boolean;
  diaryEntries: DiaryEntry[];
  totalMeditationMinutes: number;
  completedDevotionalDays: Record<string, number[]>;
  completedChallenges: string[];
  challengePoints: number;
}

const defaultData: PrayerGuideData = {
  selectedAreas: [],
  completedPrayers: [],
  favoritePrayers: [],
  streak: 0,
  lastPrayerDate: null,
  unlockedAchievements: [],
  chatMessageCount: 0,
  earlyPrayerDone: false,
  diaryEntries: [],
  totalMeditationMinutes: 0,
  completedDevotionalDays: {},
  completedChallenges: [],
  challengePoints: 0,
};

export const [PrayerGuideProvider, usePrayerGuide] = createContextHook(() => {
  const [data, setData] = useState<PrayerGuideData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);
  const [newAchievement, setNewAchievement] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [stored, quizCompleted] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(QUIZ_COMPLETED_KEY),
        ]);
        if (stored) {
          const parsed = JSON.parse(stored) as Partial<PrayerGuideData>;
          setData({ ...defaultData, ...parsed });
        }
        setHasCompletedQuiz(quizCompleted === 'true');
      } catch (error) {
        console.error('Failed to load prayer guide data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    void loadData();
  }, []);

  const saveData = useCallback(async (newData: PrayerGuideData) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch (error) {
      console.error('Failed to save prayer guide data:', error);
    }
  }, []);

  const checkAchievements = useCallback((currentData: PrayerGuideData): string[] => {
    const newlyUnlocked: string[] = [];

    for (const achievement of achievements) {
      if (currentData.unlockedAchievements.includes(achievement.id)) continue;

      let unlocked = false;

      switch (achievement.type) {
        case 'prayers_completed':
          unlocked = currentData.completedPrayers.length >= achievement.requirement;
          break;
        case 'streak':
          unlocked = currentData.streak >= achievement.requirement;
          break;
        case 'chat_messages':
          unlocked = currentData.chatMessageCount >= achievement.requirement;
          break;
        case 'favorites':
          unlocked = currentData.favoritePrayers.length >= achievement.requirement;
          break;
        case 'early_prayer':
          unlocked = currentData.earlyPrayerDone;
          break;
        case 'category_complete': {
          const categories = [...new Set(prayers.map(p => p.category))];
          for (const cat of categories) {
            const catPrayers = prayers.filter(p => p.category === cat);
            const allDone = catPrayers.every(p => currentData.completedPrayers.includes(p.id));
            if (allDone && catPrayers.length > 0) {
              unlocked = true;
              break;
            }
          }
          break;
        }
      }

      if (unlocked) {
        newlyUnlocked.push(achievement.id);
      }
    }

    return newlyUnlocked;
  }, []);

  const applyAchievements = useCallback((currentData: PrayerGuideData): PrayerGuideData => {
    const newlyUnlocked = checkAchievements(currentData);
    if (newlyUnlocked.length > 0) {
      if (newlyUnlocked.length > 0) {
        setNewAchievement(newlyUnlocked[0]);
      }
      return {
        ...currentData,
        unlockedAchievements: [...currentData.unlockedAchievements, ...newlyUnlocked],
      };
    }
    return currentData;
  }, [checkAchievements]);

  const completeQuiz = useCallback(async (areas: LifeArea[]) => {
    const newData = applyAchievements({ ...data, selectedAreas: areas });
    setData(newData);
    setHasCompletedQuiz(true);
    try {
      await Promise.all([
        saveData(newData),
        AsyncStorage.setItem(QUIZ_COMPLETED_KEY, 'true'),
      ]);
    } catch (error) {
      console.error('Failed to save quiz completion:', error);
    }
  }, [data, saveData, applyAchievements]);

  const markPrayerCompleted = useCallback(async (prayerId: string) => {
    const today = new Date().toDateString();
    const hour = new Date().getHours();
    let newStreak = data.streak;
    let earlyPrayer = data.earlyPrayerDone;

    if (hour >= 3 && hour < 5) {
      earlyPrayer = true;
    }

    if (data.lastPrayerDate) {
      const lastDate = new Date(data.lastPrayerDate);
      const diffDays = Math.floor((new Date(today).getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        newStreak = data.streak + 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    const updated = {
      ...data,
      completedPrayers: data.completedPrayers.includes(prayerId)
        ? data.completedPrayers
        : [...data.completedPrayers, prayerId],
      streak: newStreak,
      lastPrayerDate: today,
      earlyPrayerDone: earlyPrayer,
    };
    const newData = applyAchievements(updated);
    setData(newData);
    await saveData(newData);
  }, [data, saveData, applyAchievements]);

  const toggleFavorite = useCallback(async (prayerId: string) => {
    const newFavorites = data.favoritePrayers.includes(prayerId)
      ? data.favoritePrayers.filter(id => id !== prayerId)
      : [...data.favoritePrayers, prayerId];

    const updated = { ...data, favoritePrayers: newFavorites };
    const newData = applyAchievements(updated);
    setData(newData);
    await saveData(newData);
  }, [data, saveData, applyAchievements]);

  const incrementChatCount = useCallback(async () => {
    const updated = { ...data, chatMessageCount: data.chatMessageCount + 1 };
    const newData = applyAchievements(updated);
    setData(newData);
    await saveData(newData);
  }, [data, saveData, applyAchievements]);

  const addDiaryEntry = useCallback(async (prayerId: string, prayerTitle: string, note: string) => {
    const entry: DiaryEntry = {
      id: Date.now().toString(),
      prayerId,
      prayerTitle,
      note,
      answered: false,
      answeredDate: null,
      createdAt: new Date().toISOString(),
    };
    const newData = {
      ...data,
      diaryEntries: [entry, ...data.diaryEntries],
    };
    setData(newData);
    await saveData(newData);
  }, [data, saveData]);

  const toggleAnswered = useCallback(async (entryId: string) => {
    const newEntries = data.diaryEntries.map(e => {
      if (e.id === entryId) {
        return {
          ...e,
          answered: !e.answered,
          answeredDate: !e.answered ? new Date().toISOString() : null,
        };
      }
      return e;
    });
    const newData = { ...data, diaryEntries: newEntries };
    setData(newData);
    await saveData(newData);
  }, [data, saveData]);

  const addMeditationTime = useCallback(async (minutes: number) => {
    const newData = {
      ...data,
      totalMeditationMinutes: data.totalMeditationMinutes + minutes,
    };
    setData(newData);
    await saveData(newData);
  }, [data, saveData]);

  const isPrayerCompleted = useCallback((prayerId: string) => {
    return data.completedPrayers.includes(prayerId);
  }, [data.completedPrayers]);

  const isPrayerFavorite = useCallback((prayerId: string) => {
    return data.favoritePrayers.includes(prayerId);
  }, [data.favoritePrayers]);

  const completeDevotionalDay = useCallback(async (planId: string, day: number) => {
    const currentDays = data.completedDevotionalDays[planId] || [];
    if (currentDays.includes(day)) return;
    const updatedDays = { ...data.completedDevotionalDays, [planId]: [...currentDays, day] };
    const newData = { ...data, completedDevotionalDays: updatedDays };
    setData(newData);
    await saveData(newData);
  }, [data, saveData]);

  const isDevotionalDayCompleted = useCallback((planId: string, day: number) => {
    return (data.completedDevotionalDays[planId] || []).includes(day);
  }, [data.completedDevotionalDays]);

  const completeChallenge = useCallback(async (challengeId: string, points: number) => {
    if (data.completedChallenges.includes(challengeId)) return;
    const newData = {
      ...data,
      completedChallenges: [...data.completedChallenges, challengeId],
      challengePoints: data.challengePoints + points,
    };
    setData(newData);
    await saveData(newData);
  }, [data, saveData]);

  const isChallengeCompleted = useCallback((challengeId: string) => {
    return data.completedChallenges.includes(challengeId);
  }, [data.completedChallenges]);

  const resetProgress = useCallback(async () => {
    const newData: PrayerGuideData = { ...defaultData };
    setData(newData);
    setHasCompletedQuiz(false);
    try {
      await Promise.all([
        saveData(newData),
        AsyncStorage.removeItem(QUIZ_COMPLETED_KEY),
      ]);
    } catch (error) {
      console.error('Failed to reset progress:', error);
    }
  }, [saveData]);

  const dismissAchievement = useCallback(() => {
    setNewAchievement(null);
  }, []);

  const recommendedPrayers = useMemo(() => {
    if (data.selectedAreas.length === 0) return prayers;
    return prayers.filter(prayer => data.selectedAreas.includes(prayer.category));
  }, [data.selectedAreas]);

  const progress = useMemo(() => {
    const totalPrayers = recommendedPrayers.length;
    const completedRecommended = recommendedPrayers.filter(p =>
      data.completedPrayers.includes(p.id)
    ).length;
    return {
      total: totalPrayers,
      completed: completedRecommended,
      percentage: totalPrayers > 0 ? Math.round((completedRecommended / totalPrayers) * 100) : 0,
    };
  }, [recommendedPrayers, data.completedPrayers]);

  return useMemo(() => ({
    data,
    isLoading,
    hasCompletedQuiz,
    recommendedPrayers,
    progress,
    newAchievement,
    completeQuiz,
    markPrayerCompleted,
    toggleFavorite,
    isPrayerCompleted,
    isPrayerFavorite,
    resetProgress,
    incrementChatCount,
    addDiaryEntry,
    toggleAnswered,
    addMeditationTime,
    dismissAchievement,
    completeDevotionalDay,
    isDevotionalDayCompleted,
    completeChallenge,
    isChallengeCompleted,
  }), [
    data, isLoading, hasCompletedQuiz, recommendedPrayers, progress, newAchievement,
    completeQuiz, markPrayerCompleted, toggleFavorite, isPrayerCompleted,
    isPrayerFavorite, resetProgress, incrementChatCount, addDiaryEntry,
    toggleAnswered, addMeditationTime, dismissAchievement,
    completeDevotionalDay, isDevotionalDayCompleted, completeChallenge, isChallengeCompleted,
  ]);
});
