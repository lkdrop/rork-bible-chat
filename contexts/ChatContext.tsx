import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'bible_chat_messages';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export const [ChatProvider, useChat] = createContextHook(() => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
  const [userMessageCount, setUserMessageCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const [stored, seen, count] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem('has_seen_welcome'),
          AsyncStorage.getItem('user_message_count'),
        ]);
        if (stored) {
          setMessages(JSON.parse(stored));
        }
        setHasSeenWelcome(seen === 'true');
        if (count) {
          setUserMessageCount(parseInt(count, 10));
        }
      } catch (error) {
        console.error('Failed to load:', error);
      }
    };
    void load();
  }, []);

  const saveMessages = useCallback(async (msgs: ChatMessage[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
    } catch (error) {
      console.error('Failed to save messages:', error);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      void saveMessages(messages);
    }
  }, [messages, saveMessages]);

  const markWelcomeSeen = useCallback(async () => {
    try {
      await AsyncStorage.setItem('has_seen_welcome', 'true');
      setHasSeenWelcome(true);
    } catch (error) {
      console.error('Failed to save welcome status:', error);
    }
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const newCount = userMessageCount + 1;
    setUserMessageCount(newCount);
    try {
      await AsyncStorage.setItem('user_message_count', newCount.toString());
    } catch (e) {
      console.error('Failed to save message count:', e);
    }

    try {
      const response = await fetch(new URL('/agent/chat', process.env.EXPO_PUBLIC_TOOLKIT_URL).toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `Você é um assistente de estudo bíblico sábio e compassivo. Você ajuda os usuários a explorar as Escrituras, entender conceitos bíblicos e crescer em sua fé.

Diretrizes:
- Responda perguntas sobre versículos bíblicos, personagens, temas e conceitos teológicos
- Ao citar as Escrituras, cite a referência claramente
- Seja respeitoso com diferentes denominações e tradições cristãs
- Forneça contexto histórico e cultural quando útil
- Seja encorajador e pastoral no tom
- Use linguagem gentil e calorosa que reflita o amor e a graça de Deus
- Sempre responda em português do Brasil`,
            },
            ...messages.map(m => ({
              role: m.role,
              content: m.content,
            })),
            {
              role: 'user',
              content: content.trim(),
            },
          ],
        }),
      });

      const data = await response.json() as { text: string };

      if (data.text) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.text,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  }, [messages, userMessageCount]);

  const clearHistory = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setMessages([]);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  }, []);

  const addWelcomeMessage = useCallback(() => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: "Olá! Sou seu companheiro de estudo bíblico. Estou aqui para ajudá-lo a explorar as Escrituras, entender os ensinamentos bíblicos e crescer em sua fé. Sobre o que você gostaria de aprender hoje?",
      timestamp: Date.now(),
    };
    setMessages([welcomeMessage]);
  }, []);

  return useMemo(() => ({
    messages,
    isLoading,
    hasSeenWelcome,
    userMessageCount,
    markWelcomeSeen,
    sendMessage,
    clearHistory,
    addWelcomeMessage,
  }), [messages, isLoading, hasSeenWelcome, userMessageCount, markWelcomeSeen, sendMessage, clearHistory, addWelcomeMessage]);
});
