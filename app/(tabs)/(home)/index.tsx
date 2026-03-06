import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Share,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import {
  Flame,
  MessageCircle,
  BookOpen,
  Heart,
  Share2,
  Sparkles,
  Play,
  Volume2,
  VolumeX,
  ChevronRight,
  Gamepad2,
  Crown,
  Zap,
  Target,
  Pen,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { getTodayVerse } from '@/constants/dailyVerses';
import { generateText } from '@rork-ai/toolkit-sdk';
import { AppImages } from '@/constants/images';

export default function HomeScreen() {
  const router = useRouter();
  const { state, colors, recordActivity, toggleFavoriteVerse } = useApp();
  const verse = getTodayVerse();

  const [devotional, setDevotional] = useState('');
  const [isLoadingDevotional, setIsLoadingDevotional] = useState(false);
  const [devotionalLoaded, setDevotionalLoaded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const flameAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    recordActivity();
  }, [recordActivity]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();

    let flameLoop: Animated.CompositeAnimation | undefined;
    if (state.streak > 0) {
      flameLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(flameAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
          Animated.timing(flameAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      flameLoop.start();
    }

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.03, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    );
    pulseLoop.start();

    return () => {
      flameLoop?.stop();
      pulseLoop.stop();
    };
  }, [fadeAnim, slideAnim, flameAnim, state.streak, pulseAnim]);

  const handleShare = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `"${verse.text}"\n\n— ${verse.reference} (${verse.translation})\n\n✨ Criado com Bíblia IA`,
      });
    } catch {
      // cancelled
    }
  }, [verse]);

  const handleFavorite = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavoriteVerse(verse.reference);
  }, [verse.reference, toggleFavoriteVerse]);

  const handleSpeakVerse = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isSpeaking) {
      void Speech.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      Speech.speak(`${verse.text}. ${verse.reference}`, {
        language: 'pt-BR',
        rate: 0.85,
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  }, [isSpeaking, verse]);

  useEffect(() => {
    return () => { void Speech.stop(); };
  }, []);

  const loadDevotional = useCallback(async () => {
    if (devotionalLoaded || isLoadingDevotional) return;
    setIsLoadingDevotional(true);
    try {
      const response = await generateText({
        messages: [{
          role: 'user',
          content: `Gere um devocional curto e pessoal (máximo 4 frases) baseado no versículo: "${verse.text}" (${verse.reference}).
Seja pastoral, acolhedor e prático. Termine com uma frase de aplicação para o dia. Em português do Brasil.`,
        }],
      });
      setDevotional(response);
      setDevotionalLoaded(true);
    } catch {
      setDevotional('Que a Palavra de Deus guie seu dia com sabedoria e paz. Medite neste versículo e deixe que ele transforme seu coração.');
      setDevotionalLoaded(true);
    } finally {
      setIsLoadingDevotional(false);
    }
  }, [verse, devotionalLoaded, isLoadingDevotional]);

  const isFavorite = state.favoriteVerses.includes(verse.reference);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: 'Bom dia', emoji: '☀️' };
    if (hour >= 12 && hour < 18) return { text: 'Boa tarde', emoji: '🌤' };
    return { text: 'Boa noite', emoji: '🌙' };
  };

  const journeyActive = state.journey.isActive;
  const journeyProgress = journeyActive ? Math.round((state.journey.completedDays.length / 90) * 100) : 0;
  const greeting = getGreeting();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={[styles.greeting, { color: colors.textMuted }]}>{greeting.text} {greeting.emoji}</Text>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Bíblia IA</Text>
            </View>
            <View style={styles.headerRight}>
              {state.streak > 0 && (
                <View style={[styles.streakBadge, { backgroundColor: colors.streak + '18' }]}>
                  <Animated.View style={{ transform: [{ scale: flameAnim }] }}>
                    <Flame size={18} color={colors.streak} fill={colors.streak} />
                  </Animated.View>
                  <Text style={[styles.streakText, { color: colors.streak }]}>{state.streak}</Text>
                </View>
              )}
              {!state.isPremium && (
                <TouchableOpacity
                  style={[styles.premiumBtn, { backgroundColor: '#C9922A' + '15' }]}
                  onPress={() => router.push('/paywall' as never)}
                >
                  <Crown size={16} color="#C9922A" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Verse of the Day — Hero Card */}
          <View style={styles.verseCard}>
            <Image
              source={{ uri: (() => {
                const hour = new Date().getHours();
                if (hour < 12) return AppImages.sunrise;
                if (hour < 18) return AppImages.nature;
                return AppImages.mountainSunset;
              })() }}
              style={styles.verseCardImage}
              contentFit="cover"
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.75)']}
              style={styles.verseCardOverlay}
            >
              <View style={styles.verseHeader}>
                <View style={styles.verseBadge}>
                  <Sparkles size={12} color={colors.primary} />
                  <Text style={[styles.verseBadgeText, { color: colors.primary }]}>Versículo do Dia</Text>
                </View>
                <Text style={styles.verseTranslation}>{verse.translation}</Text>
              </View>
              <Text style={styles.verseText}>"{verse.text}"</Text>
              <Text style={styles.verseRef}>— {verse.reference}</Text>
              <View style={styles.verseActions}>
                <TouchableOpacity style={styles.verseAction} onPress={handleSpeakVerse}>
                  {isSpeaking ? <VolumeX size={16} color="#FFF" /> : <Volume2 size={16} color="#FFF" />}
                </TouchableOpacity>
                <TouchableOpacity style={styles.verseAction} onPress={handleFavorite}>
                  <Heart size={16} color="#FFF" fill={isFavorite ? '#FFF' : 'transparent'} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.verseAction} onPress={handleShare}>
                  <Share2 size={16} color="#FFF" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {/* AI Devotional */}
          <TouchableOpacity
            style={[styles.devotionalCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
            onPress={() => void loadDevotional()}
            activeOpacity={0.8}
          >
            {isLoadingDevotional ? (
              <View style={styles.devotionalLoading}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.devotionalLoadingText, { color: colors.textMuted }]}>Preparando reflexão...</Text>
              </View>
            ) : devotionalLoaded ? (
              <Text style={[styles.devotionalText, { color: colors.textSecondary }]}>{devotional}</Text>
            ) : (
              <View style={styles.devotionalPrompt}>
                <View style={[styles.devotionalIcon, { backgroundColor: colors.primaryLight }]}>
                  <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <Sparkles size={18} color={colors.primary} />
                  </Animated.View>
                </View>
                <View style={styles.devotionalPromptContent}>
                  <Text style={[styles.devotionalTitle, { color: colors.text }]}>Devocional do Dia</Text>
                  <Text style={[styles.devotionalPromptText, { color: colors.textMuted }]}>Toque para gerar reflexão com IA</Text>
                </View>
                <Play size={16} color={colors.primary} />
              </View>
            )}
          </TouchableOpacity>

          {/* Quick Actions — 2x2 Grid */}
          <View style={styles.quickGrid}>
            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: '#C9922A' + '10', borderColor: '#C9922A' + '25' }]}
              onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/chat' as never); }}
            >
              <View style={[styles.quickIcon, { backgroundColor: '#C9922A' + '20' }]}>
                <MessageCircle size={20} color="#C9922A" />
              </View>
              <Text style={[styles.quickTitle, { color: colors.text }]}>Gabriel</Text>
              <Text style={[styles.quickSub, { color: colors.textMuted }]}>Guia espiritual</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: '#8B5CF6' + '10', borderColor: '#8B5CF6' + '25' }]}
              onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/create' as never); }}
            >
              <View style={[styles.quickIcon, { backgroundColor: '#8B5CF6' + '20' }]}>
                <Pen size={20} color="#8B5CF6" />
              </View>
              <Text style={[styles.quickTitle, { color: colors.text }]}>Criar</Text>
              <Text style={[styles.quickSub, { color: colors.textMuted }]}>Conteúdo viral</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: '#10B981' + '10', borderColor: '#10B981' + '25' }]}
              onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/study' as never); }}
            >
              <View style={[styles.quickIcon, { backgroundColor: '#10B981' + '20' }]}>
                <BookOpen size={20} color="#10B981" />
              </View>
              <Text style={[styles.quickTitle, { color: colors.text }]}>Estudos</Text>
              <Text style={[styles.quickSub, { color: colors.textMuted }]}>Planos e devocionais</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: '#F59E0B' + '10', borderColor: '#F59E0B' + '25' }]}
              onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/games' as never); }}
            >
              <View style={[styles.quickIcon, { backgroundColor: '#F59E0B' + '20' }]}>
                <Gamepad2 size={20} color="#F59E0B" />
              </View>
              <Text style={[styles.quickTitle, { color: colors.text }]}>Games</Text>
              <Text style={[styles.quickSub, { color: colors.textMuted }]}>{state.gamePoints} pontos</Text>
            </TouchableOpacity>
          </View>

          {/* Journey / Vigilia Progress Cards */}
          {(journeyActive || state.vigilia.isActive) && (
            <View style={styles.progressSection}>
              {journeyActive && (
                <TouchableOpacity
                  style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
                  onPress={() => router.push('/study/journey' as never)}
                  activeOpacity={0.8}
                >
                  <View style={styles.progressHeader}>
                    <View style={[styles.progressIcon, { backgroundColor: '#FF6B35' + '15' }]}>
                      <Target size={20} color="#FF6B35" />
                    </View>
                    <View style={styles.progressInfo}>
                      <Text style={[styles.progressTitle, { color: colors.text }]}>Jornada 90 Dias</Text>
                      <Text style={[styles.progressSub, { color: colors.textMuted }]}>
                        Dia {state.journey.currentDay} • {state.journey.completedDays.length} concluídos
                      </Text>
                    </View>
                    <Text style={[styles.progressPercent, { color: '#FF6B35' }]}>{journeyProgress}%</Text>
                  </View>
                  <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
                    <View style={[styles.progressBarFill, { width: `${journeyProgress}%` as `${number}%`, backgroundColor: '#FF6B35' }]} />
                  </View>
                </TouchableOpacity>
              )}

              {state.vigilia.isActive && (
                <TouchableOpacity
                  style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
                  onPress={() => router.push('/study/vigilia' as never)}
                  activeOpacity={0.8}
                >
                  <View style={styles.progressHeader}>
                    <View style={[styles.progressIcon, { backgroundColor: '#EF4444' + '15' }]}>
                      <Flame size={20} color="#EF4444" fill="#EF4444" />
                    </View>
                    <View style={styles.progressInfo}>
                      <Text style={[styles.progressTitle, { color: colors.text }]}>Vigília IA — 21 Dias</Text>
                      <Text style={[styles.progressSub, { color: colors.textMuted }]}>
                        Dia {state.vigilia.currentDay} • {state.vigilia.completedDays.length} concluídos
                      </Text>
                    </View>
                    <Text style={[styles.progressPercent, { color: '#EF4444' }]}>
                      {Math.round((state.vigilia.completedDays.length / 21) * 100)}%
                    </Text>
                  </View>
                  <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
                    <View style={[styles.progressBarFill, { width: `${Math.round((state.vigilia.completedDays.length / 21) * 100)}%` as `${number}%`, backgroundColor: '#EF4444' }]} />
                  </View>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Start Journey CTA */}
          {!journeyActive && (
            <TouchableOpacity
              style={[styles.journeyCta, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
              onPress={() => router.push('/study/journey-quiz' as never)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FF6B35' + '15', '#FF6B35' + '05']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.journeyCtaGradient}
              >
                <View style={styles.journeyCtaContent}>
                  <View style={[styles.journeyCtaIcon, { backgroundColor: '#FF6B35' + '20' }]}>
                    <Zap size={22} color="#FF6B35" />
                  </View>
                  <View style={styles.journeyCtaText}>
                    <Text style={[styles.journeyCtaTitle, { color: colors.text }]}>Jornada de 90 Dias</Text>
                    <Text style={[styles.journeyCtaSub, { color: colors.textMuted }]}>
                      Transformação espiritual personalizada por IA
                    </Text>
                  </View>
                </View>
                <View style={[styles.journeyCtaBtn, { backgroundColor: '#FF6B35' }]}>
                  <Text style={styles.journeyCtaBtnText}>Começar</Text>
                  <ChevronRight size={14} color="#FFF" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>{state.streak}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Dias{'\n'}seguidos</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>{state.totalDaysActive}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Dias{'\n'}ativos</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>{state.totalChaptersRead}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Capítulos{'\n'}lidos</Text>
            </View>
          </View>

          {/* Games Mini Section */}
          <View style={[styles.gamesRow, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <View style={styles.gamesHeader}>
              <Gamepad2 size={16} color="#F59E0B" />
              <Text style={[styles.gamesTitle, { color: colors.text }]}>Games Bíblicos</Text>
              <TouchableOpacity onPress={() => router.push('/games' as never)} style={styles.gamesMore}>
                <Text style={[styles.gamesMoreText, { color: colors.primary }]}>Ver todos</Text>
                <ChevronRight size={14} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.gamesGrid}>
              <TouchableOpacity
                style={[styles.gameChip, { backgroundColor: '#F59E0B' + '10' }]}
                onPress={() => router.push('/games/bible-battle' as never)}
              >
                <Text style={styles.gameEmoji}>⚔️</Text>
                <Text style={[styles.gameLabel, { color: colors.text }]}>Batalha</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.gameChip, { backgroundColor: '#10B981' + '10' }]}
                onPress={() => router.push('/games/snake' as never)}
              >
                <Text style={styles.gameEmoji}>🐍</Text>
                <Text style={[styles.gameLabel, { color: colors.text }]}>Serpente</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.gameChip, { backgroundColor: '#8B5CF6' + '10' }]}
                onPress={() => router.push('/games/memory' as never)}
              >
                <Text style={styles.gameEmoji}>🧠</Text>
                <Text style={[styles.gameLabel, { color: colors.text }]}>Memória</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Prayer Card */}
          <View style={styles.prayerCard}>
            <Image source={{ uri: AppImages.prayer }} style={styles.prayerBg} contentFit="cover" />
            <LinearGradient
              colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.85)']}
              style={styles.prayerContent}
            >
              <Text style={styles.prayerTitle}>Oração do Dia</Text>
              <Text style={styles.prayerText}>
                Senhor, obrigado por mais um dia. Guia meus passos, ilumina meu caminho e me dá sabedoria para fazer a Tua vontade. Amém.
              </Text>
              <View style={styles.prayerActions}>
                <TouchableOpacity
                  style={styles.prayerBtn}
                  onPress={() => {
                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    if (Platform.OS !== 'web') {
                      Speech.speak('Senhor, obrigado por mais um dia. Guia meus passos, ilumina meu caminho e me dá sabedoria para fazer a Tua vontade. Amém.', {
                        language: 'pt-BR', rate: 0.8,
                      });
                    }
                  }}
                >
                  <Volume2 size={14} color="#FFF" />
                  <Text style={styles.prayerBtnText}>Ouvir</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.prayerBtn}
                  onPress={() => {
                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    void Share.share({ message: 'Oração do Dia:\n\nSenhor, obrigado por mais um dia. Guia meus passos, ilumina meu caminho e me dá sabedoria para fazer a Tua vontade. Amém.\n\n✨ Criado com Bíblia IA' });
                  }}
                >
                  <Share2 size={14} color="#FFF" />
                  <Text style={styles.prayerBtnText}>Enviar</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {/* Onboarding */}
          {!state.hasCompletedOnboarding && (
            <TouchableOpacity
              style={[styles.onboardingCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push('/onboarding' as never)}
            >
              <View style={styles.onboardingContent}>
                <Text style={[styles.onboardingTitle, { color: colors.text }]}>Personalize sua experiência</Text>
                <Text style={[styles.onboardingSub, { color: colors.textSecondary }]}>Configure denominação e tradução</Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textMuted }]}>
              "Lâmpada para os meus pés é a tua palavra"
            </Text>
            <Text style={[styles.footerRef, { color: colors.textMuted }]}>Salmos 119:105</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerLeft: {},
  greeting: { fontSize: 14, fontWeight: '500' as const, marginBottom: 2 },
  headerTitle: { fontSize: 26, fontWeight: '800' as const, letterSpacing: -0.5 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16 },
  streakText: { fontSize: 16, fontWeight: '800' as const },
  premiumBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },

  // Verse Card
  verseCard: { borderRadius: 20, marginBottom: 14, height: 240, overflow: 'hidden' as const },
  verseCardImage: { ...StyleSheet.absoluteFillObject, borderRadius: 20 },
  verseCardOverlay: { flex: 1, borderRadius: 20, padding: 20, justifyContent: 'flex-end' },
  verseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  verseBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.92)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  verseBadgeText: { fontSize: 11, fontWeight: '700' as const },
  verseTranslation: { fontSize: 11, fontWeight: '600' as const, color: 'rgba(255,255,255,0.8)' },
  verseText: { fontSize: 19, fontWeight: '600' as const, color: '#FFF', lineHeight: 28, marginBottom: 6, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  verseRef: { fontSize: 13, fontWeight: '600' as const, color: 'rgba(255,255,255,0.85)', marginBottom: 12 },
  verseActions: { flexDirection: 'row', gap: 8 },
  verseAction: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },

  // Devotional
  devotionalCard: { borderRadius: 14, padding: 16, borderWidth: 1, marginBottom: 16 },
  devotionalLoading: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  devotionalLoadingText: { fontSize: 14 },
  devotionalText: { fontSize: 14, lineHeight: 22 },
  devotionalPrompt: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  devotionalIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  devotionalPromptContent: { flex: 1 },
  devotionalTitle: { fontSize: 15, fontWeight: '700' as const },
  devotionalPromptText: { fontSize: 13, marginTop: 2 },

  // Quick Grid
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  quickCard: { width: '48%' as const, borderRadius: 14, padding: 16, borderWidth: 1, gap: 8 },
  quickIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  quickTitle: { fontSize: 15, fontWeight: '700' as const },
  quickSub: { fontSize: 12 },

  // Progress Cards
  progressSection: { gap: 10, marginBottom: 16 },
  progressCard: { borderRadius: 14, padding: 16, borderWidth: 1 },
  progressHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  progressIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  progressInfo: { flex: 1 },
  progressTitle: { fontSize: 15, fontWeight: '700' as const },
  progressSub: { fontSize: 12, marginTop: 2 },
  progressPercent: { fontSize: 18, fontWeight: '800' as const },
  progressBarBg: { height: 6, borderRadius: 3, overflow: 'hidden' as const },
  progressBarFill: { height: '100%' as const, borderRadius: 3 },

  // Journey CTA
  journeyCta: { borderRadius: 16, overflow: 'hidden' as const, marginBottom: 16, borderWidth: 1 },
  journeyCtaGradient: { padding: 16 },
  journeyCtaContent: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  journeyCtaIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  journeyCtaText: { flex: 1 },
  journeyCtaTitle: { fontSize: 16, fontWeight: '700' as const },
  journeyCtaSub: { fontSize: 13, marginTop: 2 },
  journeyCtaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12 },
  journeyCtaBtnText: { fontSize: 14, fontWeight: '700' as const, color: '#FFF' },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, borderRadius: 14, padding: 14, borderWidth: 1, alignItems: 'center' },
  statNumber: { fontSize: 22, fontWeight: '800' as const },
  statLabel: { fontSize: 11, fontWeight: '500' as const, marginTop: 4, textAlign: 'center' as const },

  // Games
  gamesRow: { borderRadius: 14, padding: 14, borderWidth: 1, marginBottom: 16 },
  gamesHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  gamesTitle: { fontSize: 15, fontWeight: '700' as const, flex: 1 },
  gamesMore: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  gamesMoreText: { fontSize: 13, fontWeight: '600' as const },
  gamesGrid: { flexDirection: 'row', gap: 8 },
  gameChip: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 12, gap: 4 },
  gameEmoji: { fontSize: 24 },
  gameLabel: { fontSize: 12, fontWeight: '600' as const },

  // Prayer
  prayerCard: { borderRadius: 18, height: 180, overflow: 'hidden' as const, marginBottom: 16 },
  prayerBg: { ...StyleSheet.absoluteFillObject },
  prayerContent: { flex: 1, padding: 20, justifyContent: 'flex-end' },
  prayerTitle: { fontSize: 16, fontWeight: '700' as const, color: '#FFF', marginBottom: 6 },
  prayerText: { fontSize: 13, lineHeight: 20, color: 'rgba(255,255,255,0.9)', marginBottom: 12 },
  prayerActions: { flexDirection: 'row', gap: 10 },
  prayerBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
  prayerBtnText: { fontSize: 12, fontWeight: '600' as const, color: '#FFF' },

  // Onboarding
  onboardingCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 16 },
  onboardingContent: { flex: 1 },
  onboardingTitle: { fontSize: 14, fontWeight: '600' as const, marginBottom: 2 },
  onboardingSub: { fontSize: 12 },

  // Footer
  footer: { alignItems: 'center', paddingVertical: 12 },
  footerText: { fontSize: 13, fontStyle: 'italic' as const, textAlign: 'center' as const },
  footerRef: { fontSize: 11, marginTop: 3 },
});
