import { useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';

export function usePremium() {
  const {
    state,
    canSendMessage,
    recordMessage,
    canCreate,
    recordCreate,
    canUseProphetic,
    recordPropheticUse,
    activatePremium,
  } = useApp();

  const getRemainingMessages = useCallback((): number => {
    if (state.isPremium) return Infinity;
    const today = new Date().toDateString();
    if (state.lastMessageDate !== today) return 5;
    return Math.max(0, 5 - state.dailyMessageCount);
  }, [state.isPremium, state.lastMessageDate, state.dailyMessageCount]);

  const getRemainingCreates = useCallback((): number => {
    if (state.isPremium) return Infinity;
    const today = new Date().toDateString();
    if (state.lastCreateDate !== today) return 2;
    return Math.max(0, 2 - state.dailyCreateCount);
  }, [state.isPremium, state.lastCreateDate, state.dailyCreateCount]);

  return {
    isPremium: state.isPremium,
    premiumSince: state.premiumSince,
    canSendMessage,
    recordMessage,
    canCreate,
    recordCreate,
    canUseProphetic,
    recordPropheticUse,
    activatePremium,
    getRemainingMessages,
    getRemainingCreates,
  };
}
