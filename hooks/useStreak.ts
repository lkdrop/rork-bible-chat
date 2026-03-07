import { useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 90, 180, 365];

export function useStreak() {
  const { state, recordActivity, recordStreakMilestone } = useApp();

  const currentMilestone = useMemo(() => {
    let milestone = 0;
    for (const m of STREAK_MILESTONES) {
      if (state.streak >= m) milestone = m;
      else break;
    }
    return milestone;
  }, [state.streak]);

  const nextMilestone = useMemo(() => {
    for (const m of STREAK_MILESTONES) {
      if (state.streak < m) return m;
    }
    return null;
  }, [state.streak]);

  const progressToNext = useMemo(() => {
    if (!nextMilestone) return 100;
    const prev = currentMilestone;
    const range = nextMilestone - prev;
    const progress = state.streak - prev;
    return Math.round((progress / range) * 100);
  }, [state.streak, currentMilestone, nextMilestone]);

  return {
    streak: state.streak,
    totalDaysActive: state.totalDaysActive,
    currentMilestone,
    nextMilestone,
    progressToNext,
    milestones: STREAK_MILESTONES,
    recordActivity,
    recordStreakMilestone,
  };
}
