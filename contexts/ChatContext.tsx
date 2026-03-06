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

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setMessages(JSON.parse(stored));
        }
      } catch (error) {
        console.log('Failed to load chat messages:', error);
      }
    };
    void load();
  }, []);

  const saveMessages = useCallback(async (msgs: ChatMessage[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
    } catch (error) {
      console.log('Failed to save messages:', error);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      void saveMessages(messages);
    }
  }, [messages, saveMessages]);

  const sendMessage = useCallback(async (content: string, translation: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const systemPrompt = `Você é um assistente bíblico cristão chamado "Bíblia IA". Você responde EXCLUSIVAMENTE com base na Bíblia Sagrada, usando a tradução ${translation} como referência principal.

REGRAS OBRIGATÓRIAS:
- Responda SEMPRE em português do Brasil
- TODAS as respostas devem ser fundamentadas em versículos bíblicos
- Cite sempre a referência bíblica (livro, capítulo e versículo)
- Seja respeitoso com todas as denominações cristãs
- NÃO responda perguntas que não sejam relacionadas à Bíblia, fé cristã, espiritualidade ou vida cristã
- Se a pergunta não for sobre temas bíblicos/cristãos, responda educadamente que você só pode ajudar com questões bíblicas
- Use tom pastoral, acolhedor e encorajador
- Forneça contexto histórico e cultural quando relevante
- Quando possível, apresente diferentes perspectivas teológicas de forma equilibrada
- Use linguagem acessível, evitando jargões teológicos complexos sem explicação`;

      const response = await fetch(
        new URL('/agent/chat', process.env.EXPO_PUBLIC_TOOLKIT_URL).toString(),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: systemPrompt },
              ...messages.slice(-20).map(m => ({ role: m.role, content: m.content })),
              { role: 'user', content: content.trim() },
            ],
          }),
        }
      );

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
      console.log('Failed to send message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const clearHistory = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setMessages([]);
    } catch (error) {
      console.log('Failed to clear history:', error);
    }
  }, []);

  return useMemo(() => ({
    messages,
    isLoading,
    sendMessage,
    clearHistory,
  }), [messages, isLoading, sendMessage, clearHistory]);
});
