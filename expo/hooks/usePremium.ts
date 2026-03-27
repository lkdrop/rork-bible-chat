import { useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { getPlanLimits } from '@/constants/plans';

export function usePremium() {
  const {
    state,
    canSendMessage,
    recordMessage,
    canCreate,
    recordCreate,
    canUseProphetic,
    recordPropheticUse,
    canGenerateImage,
    recordImageGen,
    canUseTTS,
    recordTTSUse,
    activatePremium,
  } = useApp();

  const plan = state.plan || 'free';
  const limits = getPlanLimits(plan);

  const getRemainingMessages = useCallback((): number => {
    const today = new Date().toDateString();
    const dailyCount = state.lastMessageDate === today ? state.dailyMessageCount : 0;
    const dailyRemaining = Math.max(0, limits.dailyMessages - dailyCount);
    const monthlyRemaining = Math.max(0, limits.monthlyMessages - state.monthlyMessageCount);
    return Math.min(dailyRemaining, monthlyRemaining);
  }, [state.lastMessageDate, state.dailyMessageCount, state.monthlyMessageCount, limits]);

  const getRemainingCreates = useCallback((): number => {
    const today = new Date().toDateString();
    const dailyCount = state.lastCreateDate === today ? state.dailyCreateCount : 0;
    return Math.max(0, limits.dailyCreates - dailyCount);
  }, [state.lastCreateDate, state.dailyCreateCount, limits]);

  const getRemainingImages = useCallback((): number => {
    if (limits.dailyImages === 0) return 0;
    const today = new Date().toDateString();
    const dailyCount = state.lastImageDate === today ? state.dailyImageCount : 0;
    const dailyRemaining = Math.max(0, limits.dailyImages - dailyCount);
    const monthlyRemaining = Math.max(0, limits.monthlyImages - state.monthlyImageCount);
    return Math.min(dailyRemaining, monthlyRemaining);
  }, [state.lastImageDate, state.dailyImageCount, state.monthlyImageCount, limits]);

  const getRemainingTTS = useCallback((): number => {
    if (limits.dailyTTS === 0) return 0;
    const today = new Date().toDateString();
    const dailyCount = state.lastTTSDate === today ? state.dailyTTSCount : 0;
    return Math.max(0, limits.dailyTTS - dailyCount);
  }, [state.lastTTSDate, state.dailyTTSCount, limits]);

  return {
    isPremium: state.isPremium,
    plan,
    limits,
    premiumSince: state.premiumSince,
    canSendMessage,
    recordMessage,
    canCreate,
    recordCreate,
    canUseProphetic,
    recordPropheticUse,
    canGenerateImage,
    recordImageGen,
    canUseTTS,
    recordTTSUse,
    activatePremium,
    getRemainingMessages,
    getRemainingCreates,
    getRemainingImages,
    getRemainingTTS,
  };
}
