import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import {
  ArrowLeft,
  Play,
  Pause,
  Square,
  Volume2,
  RefreshCw,
  Mic,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { generateText } from '@/services/gemini';
import { speak, stopSpeaking, type TTSVoice } from '@/services/textToSpeech';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type AudioStatus = 'idle' | 'generating' | 'ready' | 'playing' | 'finished' | 'error';

const VOICES: { id: TTSVoice; name: string; desc: string }[] = [
  { id: 'ana', name: 'Ana', desc: 'Feminina calma' },
  { id: 'carla', name: 'Carla', desc: 'Narradora' },
  { id: 'keren', name: 'Keren', desc: 'Doce' },
  { id: 'borges', name: 'Borges', desc: 'Masculina calma' },
  { id: 'adriano', name: 'Adriano', desc: 'Narrador' },
  { id: 'will', name: 'Will', desc: 'Suave' },
];

export default function GuidedAudioScreen() {
  const router = useRouter();
  const { colors } = useApp();
  const params = useLocalSearchParams<{
    title: string;
    subtitle: string;
    prompt: string;
    gradientColors: string;
    image: string;
    prebuiltContent: string;
  }>();

  const title = params.title || 'Oração Guiada';
  const subtitle = params.subtitle || '';
  const prompt = params.prompt || '';
  const heroImage = params.image || '';
  const prebuiltContent = params.prebuiltContent || '';
  const gradientColors = params.gradientColors
    ? JSON.parse(params.gradientColors) as [string, string]
    : ['rgba(126,34,206,0.7)', 'rgba(147,51,234,0.85)'] as [string, string];

  const [status, setStatus] = useState<AudioStatus>('idle');
  const [generatedText, setGeneratedText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<TTSVoice>('ana');
  const [errorMsg, setErrorMsg] = useState('');

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [fadeAnim]);

  // Pulse animation while playing
  useEffect(() => {
    if (status === 'playing') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [status, pulseAnim]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      void stopSpeaking();
    };
  }, []);

  const generateContent = useCallback(async () => {
    setStatus('generating');
    setErrorMsg('');
    try {
      const systemPrompt = `Você é um guia espiritual cristão acolhedor e pastoral.
Gere conteúdo para ser NARRADO em áudio. Use linguagem oral, natural e fluida.
NÃO use formatação markdown, asteriscos, bullets ou emojis.
Use pausas naturais com reticências (...) e frases curtas.
Seja gentil, acolhedor e profundo. Em português do Brasil.`;

      const text = await generateText({
        prompt,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      });

      setGeneratedText(text);
      setStatus('ready');
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao gerar conteúdo');
      setStatus('error');
    }
  }, [prompt]);

  const handlePlay = useCallback(async () => {
    if (!generatedText) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (status === 'playing') {
      await stopSpeaking();
      setStatus('ready');
      return;
    }

    setStatus('playing');
    await speak(generatedText, {
      voice: selectedVoice,
      onDone: () => setStatus('finished'),
      onError: (err) => {
        console.error('TTS error:', err);
        setStatus('ready');
      },
    });
  }, [generatedText, selectedVoice, status]);

  const handleStop = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await stopSpeaking();
    setStatus('ready');
  }, []);

  const handleRegenerate = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    void stopSpeaking();
    setGeneratedText('');
    void generateContent();
  }, [generateContent]);

  // Auto-generate on mount (or use prebuilt content)
  useEffect(() => {
    if (status !== 'idle') return;
    if (prebuiltContent) {
      setGeneratedText(prebuiltContent);
      setStatus('ready');
    } else if (prompt) {
      void generateContent();
    }
  }, [prompt, status, generateContent]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => {
            void stopSpeaking();
            router.back();
          }}
          style={styles.backBtn}
        >
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>{title}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Hero */}
          <View style={styles.hero}>
            {heroImage ? (
              <Image source={{ uri: heroImage }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
            ) : null}
            <LinearGradient
              colors={heroImage ? gradientColors : [...gradientColors, gradientColors[1]] as [string, string, string]}
              style={styles.heroOverlay}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            >
              <Text style={styles.heroTitle}>{title}</Text>
              <Text style={styles.heroSub}>{subtitle}</Text>

              {/* Play Button */}
              <Animated.View style={[styles.playContainer, { transform: [{ scale: pulseAnim }] }]}>
                {status === 'generating' ? (
                  <View style={styles.playBtn}>
                    <ActivityIndicator size="large" color="#FFF" />
                  </View>
                ) : status === 'playing' ? (
                  <TouchableOpacity style={styles.playBtn} onPress={handlePlay} activeOpacity={0.8}>
                    <Pause size={36} color="#FFF" fill="#FFF" />
                  </TouchableOpacity>
                ) : (status === 'ready' || status === 'finished') ? (
                  <TouchableOpacity style={styles.playBtn} onPress={handlePlay} activeOpacity={0.8}>
                    <Play size={36} color="#FFF" fill="#FFF" />
                  </TouchableOpacity>
                ) : status === 'error' ? (
                  <TouchableOpacity style={styles.playBtn} onPress={handleRegenerate} activeOpacity={0.8}>
                    <RefreshCw size={36} color="#FFF" />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.playBtn}>
                    <ActivityIndicator size="large" color="#FFF" />
                  </View>
                )}
              </Animated.View>

              <Text style={styles.statusText}>
                {status === 'idle' && 'Preparando...'}
                {status === 'generating' && 'Gerando conteúdo com IA...\nIsso pode levar alguns segundos'}
                {status === 'ready' && 'Toque para ouvir'}
                {status === 'playing' && 'Reproduzindo...'}
                {status === 'finished' && 'Concluído — toque para ouvir novamente'}
                {status === 'error' && 'Erro — toque para tentar novamente'}
              </Text>
            </LinearGradient>
          </View>

          {/* Controls */}
          {(status === 'playing') && (
            <View style={styles.controls}>
              <TouchableOpacity
                style={[styles.controlBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={handleStop}
              >
                <Square size={16} color="#ef4444" fill="#ef4444" />
                <Text style={[styles.controlText, { color: colors.text }]}>Parar</Text>
              </TouchableOpacity>
            </View>
          )}

          {(status === 'ready' || status === 'finished') && (
            <View style={styles.controls}>
              <TouchableOpacity
                style={[styles.controlBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={handleRegenerate}
              >
                <RefreshCw size={16} color="#a78bfa" />
                <Text style={[styles.controlText, { color: colors.text }]}>Gerar novo</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Voice Selector */}
          {(status === 'ready' || status === 'finished') && (
            <View style={styles.voiceSection}>
              <View style={styles.voiceSectionHeader}>
                <Mic size={14} color={colors.textMuted} />
                <Text style={[styles.voiceSectionTitle, { color: colors.textMuted }]}>Voz</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.voiceScroll}>
                {VOICES.map((v) => (
                  <TouchableOpacity
                    key={v.id}
                    style={[
                      styles.voiceChip,
                      { backgroundColor: colors.card, borderColor: colors.border },
                      selectedVoice === v.id && styles.voiceChipActive,
                    ]}
                    onPress={() => {
                      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedVoice(v.id);
                    }}
                  >
                    <Text style={[
                      styles.voiceChipName,
                      { color: colors.text },
                      selectedVoice === v.id && styles.voiceChipNameActive,
                    ]}>{v.name}</Text>
                    <Text style={[
                      styles.voiceChipDesc,
                      { color: colors.textMuted },
                      selectedVoice === v.id && styles.voiceChipDescActive,
                    ]}>{v.desc}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Error */}
          {status === 'error' && (
            <View style={[styles.errorCard, { backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)' }]}>
              <Text style={styles.errorText}>{errorMsg || 'Erro ao gerar conteúdo'}</Text>
            </View>
          )}

          {/* Generated Text Preview */}
          {generatedText.length > 0 && (
            <View style={[styles.textCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.textCardHeader}>
                <Volume2 size={14} color={colors.textMuted} />
                <Text style={[styles.textCardTitle, { color: colors.textMuted }]}>Texto gerado</Text>
              </View>
              <Text style={[styles.textCardBody, { color: colors.textSecondary }]}>
                {generatedText}
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700' },
  headerRight: { width: 30 },

  content: { padding: 20, paddingBottom: 40 },

  // Hero
  hero: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  heroOverlay: {
    padding: 28,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 28,
  },
  playContainer: {
    marginBottom: 16,
  },
  playBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  statusText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
  },

  // Controls
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  controlText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Voice selector
  voiceSection: {
    marginBottom: 20,
  },
  voiceSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  voiceSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  voiceScroll: {
    gap: 8,
  },
  voiceChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 80,
  },
  voiceChipActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: '#a78bfa',
  },
  voiceChipName: {
    fontSize: 13,
    fontWeight: '700',
  },
  voiceChipNameActive: {
    color: '#a78bfa',
  },
  voiceChipDesc: {
    fontSize: 10,
    marginTop: 2,
  },
  voiceChipDescActive: {
    color: '#a78bfa',
  },

  // Error
  errorCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 13,
    color: '#ef4444',
    textAlign: 'center',
  },

  // Text card
  textCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
  },
  textCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  textCardTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textCardBody: {
    fontSize: 15,
    lineHeight: 24,
  },
});
