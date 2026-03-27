import { useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { getLevelForXP, getNextLevel, getLevelProgress, XP_REWARDS } from '@/constants/levels';

export function useXP() {
  const { state, gainXP } = useApp();

  const currentLevel = useMemo(() => getLevelForXP(state.xp), [state.xp]);
  const nextLevel = useMemo(() => getNextLevel(state.xp), [state.xp]);
  const progress = useMemo(() => getLevelProgress(state.xp), [state.xp]);

  const xpToNextLevel = useMemo(() => {
    if (!nextLevel) return 0;
    return nextLevel.minXP - state.xp;
  }, [state.xp, nextLevel]);

  return {
    xp: state.xp,
    currentLevel,
    nextLevel,
    progress,
    xpToNextLevel,
    rewards: XP_REWARDS,
    gainXP,
  };
}
