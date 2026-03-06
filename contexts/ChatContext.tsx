import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRorkAgent } from '@rork-ai/toolkit-sdk';

const STORAGE_KEY = 'bible_chat_messages';

let chatIdCounter = 0;
function generateChatId(prefix = ''): string {
  chatIdCounter += 1;
  return `${prefix}${Date.now()}-${chatIdCounter}-${Math.random().toString(36).substring(2, 9)}`;
}

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
  const [pendingError, setPendingError] = useState<string | null>(null);
  const lastProcessedIdRef = useRef<string>('');

  const { messages: agentMessages, sendMessage: agentSend, setMessages: setAgentMessages, error: agentError } = useRorkAgent({
    tools: {},
  });

  const isLoading = useMemo(() => {
    if (agentMessages.length === 0) return false;
    const last = agentMessages[agentMessages.length - 1];
    if (last.role === 'user') return true;
    if (last.role === 'assistant') {
      const hasText = last.parts.some((p: { type: string }) => p.type === 'text' && (p as { type: 'text'; text: string }).text.length > 0);
      return !hasText;
    }
    return false;
  }, [agentMessages]);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as ChatMessage[];
          console.log('[ChatContext] Loaded', parsed.length, 'messages from storage');
          setSavedMessages(parsed);
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
      setPendingError('Desculpe, ocorreu um erro. Por favor, tente novamente.');
    }
  }, [agentError]);

  useEffect(() => {
    if (pendingError) {
      const errorMsg: ChatMessage = {
        id: generateChatId('error-'),
        role: 'assistant',
        content: pendingError,
        timestamp: Date.now(),
        mode: currentMode,
      };
      setSavedMessages(prev => {
        const updated = [...prev, errorMsg];
        void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
      setPendingError(null);
    }
  }, [pendingError, currentMode]);

  useEffect(() => {
    if (agentMessages.length === 0) return;

    const last = agentMessages[agentMessages.length - 1];
    if (last.role !== 'assistant') return;

    const textParts = last.parts.filter((p: { type: string }) => p.type === 'text');
    if (textParts.length === 0) return;

    const fullText = textParts.map((p: { type: string }) => (p as { type: 'text'; text: string }).text).join('');
    if (!fullText.trim()) return;

    const processKey = last.id + fullText.length;
    if (lastProcessedIdRef.current === processKey) return;
    lastProcessedIdRef.current = processKey;

    setSavedMessages(prev => {
      const existingIdx = prev.findIndex(m => m.id === last.id);
      if (existingIdx >= 0) {
        if (prev[existingIdx].content === fullText) return prev;
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], content: fullText };
        void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      } else {
        const newMsg: ChatMessage = {
          id: last.id,
          role: 'assistant',
          content: fullText,
          timestamp: Date.now(),
          mode: currentMode,
        };
        const updated = [...prev, newMsg];
        void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      }
    });
  }, [agentMessages, currentMode]);

  const sendMessage = useCallback(async (content: string, _translation: string, customSystemPrompt?: string, mode?: string) => {
    if (!content.trim()) return;

    const modeToUse = mode || currentMode;
    console.log('[ChatContext] Sending message:', content.substring(0, 50), 'mode:', modeToUse);

    if (mode) {
      setCurrentMode(mode);
    }

    const userMsg: ChatMessage = {
      id: generateChatId('user-'),
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

    const prompt = customSystemPrompt
      ? `[INSTRUÇÃO DO SISTEMA - SIGA RIGOROSAMENTE]\n${customSystemPrompt}\n\n[PERGUNTA DO USUÁRIO]\n${content.trim()}`
      : content.trim();

    try {
      agentSend(prompt);
      console.log('[ChatContext] Message sent to agent successfully');
    } catch (error) {
      console.log('[ChatContext] Send error:', error);
      setPendingError('Desculpe, ocorreu um erro ao enviar sua mensagem. Tente novamente.');
    }
  }, [agentSend, currentMode]);

  const clearHistory = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setSavedMessages([]);
      setAgentMessages([]);
      lastProcessedIdRef.current = '';
      console.log('[ChatContext] History cleared');
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
