import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
import { CONFIG, isConfigured } from '@/constants/config';

// ─── Types ─────────────────────────────────────────────
export type TTSVoice = 'ana' | 'carla' | 'keren' | 'borges' | 'adriano' | 'will';

interface TTSOptions {
  voice?: TTSVoice;
  onDone?: () => void;
  onError?: (error: string) => void;
}

// Vozes brasileiras (PT-BR) do ElevenLabs
const VOICE_IDS: Record<TTSVoice, string> = {
  ana: 'vibfi5nlk3hs8Mtvf9Oy',       // Feminina relaxada e calma
  carla: 'oJebhZNaPllxk6W0LSBA',     // Feminina narradora de historias
  keren: '33B4UnXyTNbgLmdEDh5P',      // Feminina doce e vibrante
  borges: '9pDzHy2OpOgeXM8SeL0t',     // Masculina calma e confiante
  adriano: 'hwnuNyWkl9DjdTFykrN6',   // Masculina profunda, narrador
  will: 'CstacWqMhJQlnfLPxRG4',      // Masculina suave e afetuosa
};

// Audio player reference (web: HTMLAudioElement, native: expo-av Sound)
let currentAudio: any = null;

// ─── ElevenLabs TTS ────────────────────────────────────
async function speakWithElevenLabs(
  text: string,
  options: TTSOptions = {}
): Promise<boolean> {
  const { voice = 'ana', onDone, onError } = options;
  const voiceId = VOICE_IDS[voice] || CONFIG.ELEVENLABS_VOICE_ID;

  try {
    // Stop any current playback
    await stopSpeaking();

    // Call ElevenLabs API
    const response = await fetch(
      `${CONFIG.ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': CONFIG.ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.85,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs error: ${response.status} - ${errorText}`);
    }

    // Get audio blob
    const blob = await response.blob();

    if (Platform.OS === 'web') {
      // Web: use HTMLAudioElement
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      currentAudio = audio;

      audio.onended = () => {
        URL.revokeObjectURL(url);
        currentAudio = null;
        onDone?.();
      };

      audio.onerror = () => {
        URL.revokeObjectURL(url);
        currentAudio = null;
        onError?.('Audio playback error');
      };

      await audio.play();
    } else {
      // Native: use expo-av
      const { Audio: ExpoAudio } = await import('expo-av');
      const FileSystem = await import('expo-file-system');

      await ExpoAudio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      // Convert blob to base64 and save to file
      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const fileUri = `${FileSystem.cacheDirectory}prayer_audio_${Date.now()}.mp3`;
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { sound } = await ExpoAudio.Sound.createAsync(
        { uri: fileUri },
        { shouldPlay: true, volume: 1.0 }
      );

      currentAudio = sound;

      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded && status.didJustFinish) {
          void cleanupNativeSound();
          onDone?.();
        }
      });
    }

    return true;
  } catch (error: any) {
    console.error('ElevenLabs TTS error:', error.message);
    onError?.(error.message);
    return false;
  }
}

// ─── Fallback: expo-speech ─────────────────────────────
function speakWithSystemVoice(
  text: string,
  options: TTSOptions = {}
): void {
  const { onDone, onError } = options;

  Speech.speak(text, {
    language: 'pt-BR',
    rate: 0.75,
    pitch: 1.05,
    onDone: () => onDone?.(),
    onError: () => onError?.('System speech error'),
  });
}

// ─── Public API ────────────────────────────────────────

/**
 * Fala o texto usando ElevenLabs (se configurado) ou expo-speech como fallback.
 * Retorna true se está usando ElevenLabs, false se fallback.
 */
export async function speak(
  text: string,
  options: TTSOptions = {}
): Promise<boolean> {
  if (isConfigured.elevenlabs) {
    const success = await speakWithElevenLabs(text, options);
    if (success) return true;
    console.log('ElevenLabs failed, falling back to system voice');
  }

  speakWithSystemVoice(text, options);
  return false;
}

/**
 * Para qualquer áudio em reprodução.
 */
export async function stopSpeaking(): Promise<void> {
  try {
    if (currentAudio) {
      if (Platform.OS === 'web') {
        // Web: HTMLAudioElement
        currentAudio.pause();
        currentAudio.currentTime = 0;
        if (currentAudio.src) {
          URL.revokeObjectURL(currentAudio.src);
        }
      } else {
        // Native: expo-av Sound
        await cleanupNativeSound();
      }
      currentAudio = null;
    }
    // Also stop system speech
    await Speech.stop();
  } catch (error) {
    console.error('Error stopping speech:', error);
  }
}

async function cleanupNativeSound(): Promise<void> {
  if (currentAudio && typeof currentAudio.stopAsync === 'function') {
    try {
      await currentAudio.stopAsync();
      await currentAudio.unloadAsync();
    } catch (e) {
      // ignore
    }
    currentAudio = null;
  }
}

/**
 * Verifica se ElevenLabs está configurado.
 */
export function isElevenLabsConfigured(): boolean {
  return isConfigured.elevenlabs;
}
