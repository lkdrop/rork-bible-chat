import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRorkAgent } from '@rork-ai/toolkit-sdk';

const STORAGE_KEY = 'bible_chat_messages';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  mode?: string;
}

export const [ChatProvider, useChat] = createContextHook(() => {
  const [savedMessages, setSavedMessages] = useState<ChatMessage[]>([]);
  const [currentMode, setCurrentMode] = useState<string>('geral');
  const [_systemPrompt, setSystemPrompt] = useState<string>('');

  const { messages: agentMessages, sendMessage: agentSend, setMessages: setAgentMessages, error: agentError } = useRorkAgent({
    tools: {},
  });

  const isLoading = useMemo(() => {
    if (agentMessages.length === 0) return false;
    const last = agentMessages[agentMessages.length - 1];
    if (last.role === 'user') return true;
    if (last.role === 'assistant') {
      const hasText = last.parts.some(p => p.type === 'text' && p.text.length > 0);
      return !hasText;
    }
    return false;
  }, [agentMessages]);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setSavedMessages(JSON.parse(stored));
        }
      } catch (error) {
        console.log('[ChatContext] Failed to load messages:', error);
      }
    };
    void load();
  }, []);

  useEffect(() => {
    if (agentError) {
      console.log('[ChatContext] Agent error:', agentError);
    }
  }, [agentError]);

  useEffect(() => {
    if (agentMessages.length === 0) return;

    const last = agentMessages[agentMessages.length - 1];
    if (last.role !== 'assistant') return;

    const textParts = last.parts.filter(p => p.type === 'text');
    if (textParts.length === 0) return;

    const fullText = textParts.map(p => (p as { type: 'text'; text: string }).text).join('');
    if (!fullText.trim()) return;

    const existingIdx = savedMessages.findIndex(m => m.id === last.id);
    if (existingIdx >= 0) {
      if (savedMessages[existingIdx].content === fullText) return;
      setSavedMessages(prev => {
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], content: fullText };
        void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } else {
      const newMsg: ChatMessage = {
        id: last.id,
        role: 'assistant',
        content: fullText,
        timestamp: Date.now(),
        mode: currentMode,
      };
      setSavedMessages(prev => {
        const updated = [...prev, newMsg];
        void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  }, [agentMessages, currentMode, savedMessages]);

  const sendMessage = useCallback(async (content: string, _translation: string, customSystemPrompt?: string, mode?: string) => {
    if (!content.trim()) return;

    console.log('[ChatContext] Sending message:', content.substring(0, 50), 'mode:', mode);

    const modeToUse = mode || currentMode;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
      mode: modeToUse,
    };
    setSavedMessages(prev => {
      const updated = [...prev, userMsg];
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    if (customSystemPrompt) {
      setSystemPrompt(customSystemPrompt);
    }

    const prompt = customSystemPrompt
      ? `[INSTRUÇÃO DO SISTEMA - SIGA RIGOROSAMENTE]\n${customSystemPrompt}\n\n[PERGUNTA DO USUÁRIO]\n${content.trim()}`
      : content.trim();

    try {
      agentSend(prompt);
      console.log('[ChatContext] Message sent successfully');
    } catch (error) {
      console.log('[ChatContext] Send error:', error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        timestamp: Date.now(),
        mode: modeToUse,
      };
      setSavedMessages(prev => {
        const updated = [...prev, errorMsg];
        void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  }, [agentSend, currentMode]);

  const clearHistory = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setSavedMessages([]);
      setAgentMessages([]);
    } catch (error) {
      console.log('[ChatContext] Failed to clear:', error);
    }
  }, [setAgentMessages]);

  const switchMode = useCallback((mode: string) => {
    setCurrentMode(mode);
  }, []);

  return useMemo(() => ({
    messages: savedMessages,
    isLoading,
    sendMessage,
    clearHistory,
    currentMode,
    switchMode,
    agentError,
  }), [savedMessages, isLoading, sendMessage, clearHistory, currentMode, switchMode, agentError]);
});
