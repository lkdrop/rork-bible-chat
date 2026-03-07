import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { Volume2, Pause, X, Lock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSpeech } from '@/hooks/useSpeech';
import { usePremium } from '@/hooks/usePremium';
import { useApp } from '@/contexts/AppContext';

interface AudioPlayerBarProps {
  text: string;
  title: string;
  onClose?: () => void;
}

export function AudioPlayerBar({ text, title, onClose }: AudioPlayerBarProps) {
  const { speak, stopSpeaking } = useSpeech();
  const { canUseTTS, getRemainingTTS } = usePremium();
  const { colors } = useApp();
  const router = useRouter();
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handlePlay = useCallback(async () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    if (!canUseTTS()) {
      if (Platform.OS === 'web') {
        if (confirm('Recurso Premium! Assine para ouvir a Bíblia narrada. Ir para planos?')) {
          router.push('/paywall');
        }
      } else {
        Alert.alert(
          'Recurso Premium',
          'Assine para ouvir a Bíblia narrada com vozes naturais.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Ver Planos', onPress: () => router.push('/paywall') },
          ]
        );
      }
      return;
    }

    setIsSpeaking(true);
    await speak(text, {
      voice: 'borges',
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  }, [isSpeaking, canUseTTS, speak, stopSpeaking, text, router]);

  const handleClose = useCallback(() => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    }
    onClose?.();
  }, [isSpeaking, stopSpeaking, onClose]);

  const remaining = getRemainingTTS();
  const isPremium = canUseTTS();

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: 'rgba(197, 148, 58, 0.2)' }]}>
      <TouchableOpacity
        style={[styles.playBtn, isSpeaking && styles.playBtnActive]}
        onPress={handlePlay}
        activeOpacity={0.7}
      >
        {!isPremium ? (
          <Lock size={18} color="#C5943A" />
        ) : isSpeaking ? (
          <Pause size={18} color="#FFF" />
        ) : (
          <Volume2 size={18} color="#C5943A" />
        )}
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{title}</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {!isPremium ? 'Premium' : isSpeaking ? 'Reproduzindo...' : `${remaining} restantes`}
        </Text>
      </View>

      <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
        <X size={18} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor set inline via colors.card
    borderRadius: 14,
    padding: 12,
    gap: 12,
    marginBottom: 16,
    borderWidth: 1,
    // borderColor set inline
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(197, 148, 58, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtnActive: {
    backgroundColor: '#C5943A',
  },
  info: {
    flex: 1,
  },
  title: {
    // color set inline via colors.text
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: {
    // color set inline via colors.textMuted
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
});
