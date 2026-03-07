import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { sendGeminiMessage, GeminiMessage, SYSTEM_PROMPTS } from '@/services/gemini';
import { isConfigured } from '@/constants/config';

const STORAGE_KEY = 'bible_chat_messages';
const MODE_STORAGE_KEY = 'bible_chat_mode';

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
  const [isLoading, setIsLoading] = useState(false);
  const [agentError, setAgentError] = useState<string | null>(null);

  // Ref to always have the latest messages (avoids stale closure)
  const messagesRef = useRef<ChatMessage[]>([]);
  messagesRef.current = savedMessages;

  // Load messages and mode from storage
  useEffect(() => {
    const load = async () => {
      try {
        const [stored, storedMode] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(MODE_STORAGE_KEY),
        ]);
        if (stored) {
          const parsed = JSON.parse(stored) as ChatMessage[];
          setSavedMessages(parsed);
          messagesRef.current = parsed;
        }
        if (storedMode) {
          setCurrentMode(storedMode);
        }
      } catch {
        // Failed to load messages
      }
    };
    void load();
  }, []);

  // Helper to save messages atomically
  const saveMessages = useCallback((messages: ChatMessage[]) => {
    setSavedMessages(messages);
    messagesRef.current = messages;
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, []);

  // Build conversation history for Gemini from saved messages
  const buildConversationHistory = useCallback((messages: ChatMessage[], mode: string): GeminiMessage[] => {
    // Get last 20 messages of current mode for context
    const modeMessages = messages
      .filter(m => !m.mode || m.mode === mode)
      .slice(-20);

    return modeMessages.map(m => ({
      role: m.role === 'user' ? 'user' as const : 'model' as const,
      parts: [{ text: m.content }],
    }));
  }, []);

  const sendMessage = useCallback(async (content: string, _translation: string, customSystemPrompt?: string, mode?: string) => {
    if (!content.trim()) return;

    const modeToUse = mode || currentMode;

    if (mode) {
      setCurrentMode(mode);
      void AsyncStorage.setItem(MODE_STORAGE_KEY, mode);
    }

    // Add user message - use ref to get latest messages (avoids stale closure)
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
      mode: modeToUse,
    };

    const updatedMessages = [...messagesRef.current, userMsg];
    saveMessages(updatedMessages);

    setIsLoading(true);
    setAgentError(null);

    try {
      // Check if Groq is configured
      if (!isConfigured.groq) {
        // Fallback: respond with a helpful message
        const fallbackMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'A IA ainda não está configurada. Para ativar o Gabriel, adicione sua chave da Groq em constants/config.ts.\n\nEnquanto isso, posso ajudar com versículos e estudos bíblicos offline!',
          timestamp: Date.now(),
          mode: modeToUse,
        };
        saveMessages([...messagesRef.current, fallbackMsg]);
        setIsLoading(false);
        return;
      }

      // Build conversation history from latest messages
      const history = buildConversationHistory(messagesRef.current, modeToUse);

      // Prepare the prompt
      const prompt = customSystemPrompt
        ? `${content.trim()}`
        : content.trim();

      const systemPrompt = customSystemPrompt || SYSTEM_PROMPTS[modeToUse] || SYSTEM_PROMPTS.geral;

      // Send to Gemini
      const { text, error } = await sendGeminiMessage(prompt, history, modeToUse, systemPrompt);

      if (error || !text) {
        const errorMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: error || 'Desculpe, ocorreu um erro. Por favor, tente novamente.',
          timestamp: Date.now(),
          mode: modeToUse,
        };
        // Use ref to get latest messages (user might have navigated away and back)
        saveMessages([...messagesRef.current, errorMsg]);
      } else {
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: text,
          timestamp: Date.now(),
          mode: modeToUse,
        };
        // Use ref to get latest messages (avoids overwriting newer messages)
        saveMessages([...messagesRef.current, assistantMsg]);
      }
    } catch (e) {
      setAgentError('Desculpe, ocorreu um erro ao enviar sua mensagem. Tente novamente.');
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao enviar sua mensagem. Tente novamente.',
        timestamp: Date.now(),
        mode: modeToUse,
      };
      saveMessages([...messagesRef.current, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [currentMode, buildConversationHistory, saveMessages]);

  const clearHistory = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setSavedMessages([]);
      messagesRef.current = [];
    } catch {
      // Failed to clear history
    }
  }, []);

  const switchMode = useCallback((mode: string) => {
    setCurrentMode(mode);
    void AsyncStorage.setItem(MODE_STORAGE_KEY, mode);
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
