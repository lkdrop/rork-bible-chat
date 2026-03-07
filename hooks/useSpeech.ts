import { useCallback } from 'react';
import { speak as rawSpeak, stopSpeaking } from '@/services/textToSpeech';
import { usePremium } from '@/hooks/usePremium';

/**
 * Hook que wrapa speak() com awareness do plano.
 * FREE: usa voz do sistema (expo-speech)
 * Premium: usa ElevenLabs (se configurado)
 */
export function useSpeech() {
  const { canUseTTS, recordTTSUse } = usePremium();

  const speak = useCallback(async (
    text: string,
    options: { voice?: 'ana' | 'carla' | 'keren' | 'borges' | 'adriano' | 'will'; onDone?: () => void; onError?: (error: string) => void } = {}
  ): Promise<boolean> => {
    const usePremiumVoice = canUseTTS();
    if (usePremiumVoice) recordTTSUse();
    return rawSpeak(text, { ...options, usePremiumVoice });
  }, [canUseTTS, recordTTSUse]);

  return { speak, stopSpeaking };
}
