import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react';
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
  Dimensions,
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
  HandHeart,
  PenLine,
  Moon,
  Sunrise,
  Sun,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { getTodayVerse } from '@/constants/dailyVerses';
import { generateText } from '@/services/gemini';
import { AppImages } from '@/constants/images';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function getTimeTheme() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 8) {
    return {
      greeting: 'Bom dia',
      period: 'dawn',
      icon: Sunrise,
      gradientColors: ['#FDE68A', '#F59E0B', '#D97706'] as const,
      accentColor: '#D97706',
      bgTint: 'rgba(253, 230, 138, 0.08)',
    };
  }
  if (hour >= 8 && hour < 12) {
    return {
      greeting: 'Bom dia',
      period: 'morning',
      icon: Sun,
      gradientColors: ['#FCD34D', '#F59E0B', '#EA580C'] as const,
      accentColor: '#EA580C',
      bgTint: 'rgba(252, 211, 77, 0.06)',
    };
  }
  if (hour >= 12 && hour < 18) {
    return {
      greeting: 'Boa tarde',
      period: 'afternoon',
      icon: Sun,
      gradientColors: ['#FB923C', '#EA580C', '#DC2626'] as const,
      accentColor: '#EA580C',
      bgTint: 'rgba(251, 146, 60, 0.06)',
    };
  }
  if (hour >= 18 && hour < 21) {
    return {
      greeting: 'Boa noite',
      period: 'evening',
      icon: Moon,
      gradientColors: ['#818CF8', '#6366F1', '#4338CA'] as const,
      accentColor: '#6366F1',
      bgTint: 'rgba(129, 140, 248, 0.06)',
    };
  }
  return {
    greeting: 'Boa noite',
    period: 'night',
    icon: Moon,
    gradientColors: ['#6366F1', '#4338CA', '#1E1B4B'] as const,
    accentColor: '#4338CA',
    bgTint: 'rgba(99, 102, 241, 0.08)',
  };
}

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
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  const timeTheme = useMemo(() => getTimeTheme(), []);

  useEffect(() => {
    recordActivity();
  }, [recordActivity]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
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

    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.8, duration: 3000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.4, duration: 3000, useNativeDriver: true }),
      ])
    );
    glowLoop.start();

    return () => {
      flameLoop?.stop();
      pulseLoop.stop();
      glowLoop.stop();
    };
  }, [fadeAnim, slideAnim, flameAnim, state.streak, pulseAnim, glowAnim]);

  const handleShare = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `"${verse.text}"\n\n— ${verse.reference} (${verse.translation})\n\nCriado com Bíblia IA`,
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
        prompt: `Gere um devocional curto e pessoal (máximo 4 frases) baseado no versículo: "${verse.text}" (${verse.reference}).
Seja pastoral, acolhedor e prático. Termine com uma frase de aplicação para o dia. Em português do Brasil.`,
      });
      setDevotional(response.text);
      setDevotionalLoaded(true);
    } catch {
      setDevotional('Que a Palavra de Deus guie seu dia com sabedoria e paz. Medite neste versículo e deixe que ele transforme seu coração.');
      setDevotionalLoaded(true);
    } finally {
      setIsLoadingDevotional(false);
    }
  }, [verse, devotionalLoaded, isLoadingDevotional]);

  const isFavorite = state.favoriteVerses.includes(verse.reference);
  const journeyActive = state.journey.isActive;
  const journeyProgress = journeyActive ? Math.round((state.journey.completedDays.length / 90) * 100) : 0;

  const TimeIcon = timeTheme.icon;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Header with time-based gradient accent */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.greetingRow}>
                <TimeIcon size={16} color={timeTheme.accentColor} />
                <Text style={[styles.greeting, { color: timeTheme.accentColor }]}>{timeTheme.greeting}</Text>
              </View>
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

          {/* Verse of the Day — Hero Card with time gradient */}
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
            <Animated.View style={[styles.verseGlowOverlay, { opacity: glowAnim }]}>
              <LinearGradient
                colors={[timeTheme.gradientColors[0] + '30', 'transparent']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            </Animated.View>
            <LinearGradient
              colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.78)']}
              style={styles.verseCardOverlay}
            >
              <View style={styles.verseHeader}>
                <View style={styles.verseBadge}>
                  <Sparkles size={12} color={timeTheme.accentColor} />
                  <Text style={[styles.verseBadgeText, { color: timeTheme.accentColor }]}>Versículo do Dia</Text>
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
                <ActivityIndicator size="small" color={timeTheme.accentColor} />
                <Text style={[styles.devotionalLoadingText, { color: colors.textMuted }]}>Preparando reflexão...</Text>
              </View>
            ) : devotionalLoaded ? (
              <Text style={[styles.devotionalText, { color: colors.textSecondary }]}>{devotional}</Text>
            ) : (
              <View style={styles.devotionalPrompt}>
                <View style={[styles.devotionalIcon, { backgroundColor: timeTheme.accentColor + '15' }]}>
                  <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <Sparkles size={18} color={timeTheme.accentColor} />
                  </Animated.View>
                </View>
                <View style={styles.devotionalPromptContent}>
                  <Text style={[styles.devotionalTitle, { color: colors.text }]}>Devocional do Dia</Text>
                  <Text style={[styles.devotionalPromptText, { color: colors.textMuted }]}>Toque para gerar reflexão com IA</Text>
                </View>
                <Play size={16} color={timeTheme.accentColor} />
              </View>
            )}
          </TouchableOpacity>

          {/* Bento Grid — Mixed size cards */}
          <View style={styles.bentoGrid}>
            {/* Row 1: Gabriel (large) + Streak+Games (stacked small) */}
            <View style={styles.bentoRow}>
              <TouchableOpacity
                style={[styles.bentoLarge, { backgroundColor: '#C9922A' + '0C', borderColor: '#C9922A' + '20' }]}
                onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/chat' as never); }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#C9922A' + '08', '#C9922A' + '18']}
                  style={styles.bentoLargeGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={[styles.bentoIcon, { backgroundColor: '#C9922A' + '20' }]}>
                    <MessageCircle size={22} color="#C9922A" />
                  </View>
                  <Text style={[styles.bentoLargeTitle, { color: colors.text }]}>Gabriel</Text>
                  <Text style={[styles.bentoLargeSub, { color: colors.textMuted }]}>Seu guia espiritual com IA</Text>
                  <View style={[styles.bentoCta, { backgroundColor: '#C9922A' + '20' }]}>
                    <Text style={[styles.bentoCtaText, { color: '#C9922A' }]}>Conversar</Text>
                    <ChevronRight size={14} color="#C9922A" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.bentoStackedCol}>
                {/* Streak mini card */}
                <View style={[styles.bentoSmall, { backgroundColor: colors.streak + '0C', borderColor: colors.streak + '20' }]}>
                  <View style={styles.bentoSmallRow}>
                    <Animated.View style={{ transform: [{ scale: flameAnim }] }}>
                      <Flame size={20} color={colors.streak} fill={state.streak > 0 ? colors.streak : 'transparent'} />
                    </Animated.View>
                    <View>
                      <Text style={[styles.bentoSmallNum, { color: colors.streak }]}>{state.streak}</Text>
                      <Text style={[styles.bentoSmallLabel, { color: colors.textMuted }]}>dias seguidos</Text>
                    </View>
                  </View>
                </View>

                {/* Games mini card */}
                <TouchableOpacity
                  style={[styles.bentoSmall, { backgroundColor: '#F59E0B' + '0C', borderColor: '#F59E0B' + '20' }]}
                  onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/games' as never); }}
                  activeOpacity={0.8}
                >
                  <View style={styles.bentoSmallRow}>
                    <Gamepad2 size={20} color="#F59E0B" />
                    <View>
                      <Text style={[styles.bentoSmallNum, { color: '#F59E0B' }]}>{state.gamePoints}</Text>
                      <Text style={[styles.bentoSmallLabel, { color: colors.textMuted }]}>pontos</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Row 2: Three equal cards */}
            <View style={styles.bentoTripleRow}>
              <TouchableOpacity
                style={[styles.bentoMedium, { backgroundColor: '#8B5CF6' + '0C', borderColor: '#8B5CF6' + '20' }]}
                onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/create' as never); }}
                activeOpacity={0.8}
              >
                <View style={[styles.bentoMediumIcon, { backgroundColor: '#8B5CF6' + '20' }]}>
                  <Pen size={18} color="#8B5CF6" />
                </View>
                <Text style={[styles.bentoMediumTitle, { color: colors.text }]}>Criar</Text>
                <Text style={[styles.bentoMediumSub, { color: colors.textMuted }]}>Conteúdo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.bentoMedium, { backgroundColor: '#10B981' + '0C', borderColor: '#10B981' + '20' }]}
                onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/study' as never); }}
                activeOpacity={0.8}
              >
                <View style={[styles.bentoMediumIcon, { backgroundColor: '#10B981' + '20' }]}>
                  <BookOpen size={18} color="#10B981" />
                </View>
                <Text style={[styles.bentoMediumTitle, { color: colors.text }]}>Estudos</Text>
                <Text style={[styles.bentoMediumSub, { color: colors.textMuted }]}>Planos</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.bentoMedium, { backgroundColor: '#EC4899' + '0C', borderColor: '#EC4899' + '20' }]}
                onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/tools/prayer-wall' as never); }}
                activeOpacity={0.8}
              >
                <View style={[styles.bentoMediumIcon, { backgroundColor: '#EC4899' + '20' }]}>
                  <HandHeart size={18} color="#EC4899" />
                </View>
                <Text style={[styles.bentoMediumTitle, { color: colors.text }]}>Oração</Text>
                <Text style={[styles.bentoMediumSub, { color: colors.textMuted }]}>Mural</Text>
              </TouchableOpacity>
            </View>
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
                    <LinearGradient
                      colors={['#FF6B35', '#F59E0B']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.progressBarFill, { width: `${journeyProgress}%` as `${number}%` }]}
                    />
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
                    <LinearGradient
                      colors={['#EF4444', '#F97316']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.progressBarFill, { width: `${Math.round((state.vigilia.completedDays.length / 21) * 100)}%` as `${number}%` }]}
                    />
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
                colors={['#FF6B35' + '12', '#FF6B35' + '04']}
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

          {/* Games Section */}
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
              colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.85)']}
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
                    void Share.share({ message: 'Oração do Dia:\n\nSenhor, obrigado por mais um dia. Guia meus passos, ilumina meu caminho e me dá sabedoria para fazer a Tua vontade. Amém.\n\nCriado com Bíblia IA' });
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
  greetingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  greeting: { fontSize: 14, fontWeight: '600' as const },
  headerTitle: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.8 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16 },
  streakText: { fontSize: 16, fontWeight: '800' as const },
  premiumBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },

  // Verse Card
  verseCard: { borderRadius: 22, marginBottom: 14, height: 260, overflow: 'hidden' as const },
  verseCardImage: { ...StyleSheet.absoluteFillObject, borderRadius: 22 },
  verseGlowOverlay: { ...StyleSheet.absoluteFillObject, borderRadius: 22 },
  verseCardOverlay: { flex: 1, borderRadius: 22, padding: 22, justifyContent: 'flex-end' },
  verseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  verseBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.95)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  verseBadgeText: { fontSize: 11, fontWeight: '700' as const },
  verseTranslation: { fontSize: 11, fontWeight: '600' as const, color: 'rgba(255,255,255,0.8)' },
  verseText: { fontSize: 20, fontWeight: '600' as const, color: '#FFF', lineHeight: 30, marginBottom: 6, fontStyle: 'italic' as const, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  verseRef: { fontSize: 13, fontWeight: '700' as const, color: 'rgba(255,255,255,0.9)', marginBottom: 14 },
  verseActions: { flexDirection: 'row', gap: 10 },
  verseAction: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(10px)' as unknown as undefined },

  // Devotional
  devotionalCard: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 18 },
  devotionalLoading: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  devotionalLoadingText: { fontSize: 14 },
  devotionalText: { fontSize: 15, lineHeight: 24 },
  devotionalPrompt: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  devotionalIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  devotionalPromptContent: { flex: 1 },
  devotionalTitle: { fontSize: 16, fontWeight: '700' as const },
  devotionalPromptText: { fontSize: 13, marginTop: 2 },

  // Bento Grid
  bentoGrid: { marginBottom: 18, gap: 10 },
  bentoRow: { flexDirection: 'row', gap: 10, height: 170 },
  bentoLarge: { flex: 1.2, borderRadius: 18, borderWidth: 1, overflow: 'hidden' as const },
  bentoLargeGradient: { flex: 1, padding: 18, justifyContent: 'space-between' },
  bentoIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  bentoLargeTitle: { fontSize: 20, fontWeight: '800' as const, letterSpacing: -0.3 },
  bentoLargeSub: { fontSize: 12, marginTop: 2 },
  bentoCta: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  bentoCtaText: { fontSize: 13, fontWeight: '700' as const },
  bentoStackedCol: { flex: 0.8, gap: 10 },
  bentoSmall: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 14, justifyContent: 'center' },
  bentoSmallRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bentoSmallNum: { fontSize: 22, fontWeight: '800' as const },
  bentoSmallLabel: { fontSize: 11, marginTop: 1 },
  bentoTripleRow: { flexDirection: 'row', gap: 10 },
  bentoMedium: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 14, alignItems: 'center', gap: 8 },
  bentoMediumIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  bentoMediumTitle: { fontSize: 14, fontWeight: '700' as const },
  bentoMediumSub: { fontSize: 11 },

  // Progress Cards
  progressSection: { gap: 10, marginBottom: 18 },
  progressCard: { borderRadius: 16, padding: 16, borderWidth: 1 },
  progressHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  progressIcon: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  progressInfo: { flex: 1 },
  progressTitle: { fontSize: 15, fontWeight: '700' as const },
  progressSub: { fontSize: 12, marginTop: 2 },
  progressPercent: { fontSize: 20, fontWeight: '800' as const },
  progressBarBg: { height: 6, borderRadius: 3, overflow: 'hidden' as const },
  progressBarFill: { height: '100%' as const, borderRadius: 3 },

  // Journey CTA
  journeyCta: { borderRadius: 18, overflow: 'hidden' as const, marginBottom: 18, borderWidth: 1 },
  journeyCtaGradient: { padding: 18 },
  journeyCtaContent: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  journeyCtaIcon: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  journeyCtaText: { flex: 1 },
  journeyCtaTitle: { fontSize: 17, fontWeight: '700' as const },
  journeyCtaSub: { fontSize: 13, marginTop: 2 },
  journeyCtaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12 },
  journeyCtaBtnText: { fontSize: 15, fontWeight: '700' as const, color: '#FFF' },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  statCard: { flex: 1, borderRadius: 16, padding: 16, borderWidth: 1, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '800' as const },
  statLabel: { fontSize: 11, fontWeight: '500' as const, marginTop: 4, textAlign: 'center' as const },

  // Games
  gamesRow: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 18 },
  gamesHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  gamesTitle: { fontSize: 15, fontWeight: '700' as const, flex: 1 },
  gamesMore: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  gamesMoreText: { fontSize: 13, fontWeight: '600' as const },
  gamesGrid: { flexDirection: 'row', gap: 8 },
  gameChip: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 14, gap: 6 },
  gameEmoji: { fontSize: 26 },
  gameLabel: { fontSize: 12, fontWeight: '600' as const },

  // Prayer
  prayerCard: { borderRadius: 20, height: 190, overflow: 'hidden' as const, marginBottom: 18 },
  prayerBg: { ...StyleSheet.absoluteFillObject },
  prayerContent: { flex: 1, padding: 22, justifyContent: 'flex-end' },
  prayerTitle: { fontSize: 17, fontWeight: '700' as const, color: '#FFF', marginBottom: 8 },
  prayerText: { fontSize: 14, lineHeight: 22, color: 'rgba(255,255,255,0.92)', marginBottom: 14 },
  prayerActions: { flexDirection: 'row', gap: 10 },
  prayerBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  prayerBtnText: { fontSize: 13, fontWeight: '600' as const, color: '#FFF' },

  // Onboarding
  onboardingCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 18 },
  onboardingContent: { flex: 1 },
  onboardingTitle: { fontSize: 15, fontWeight: '600' as const, marginBottom: 2 },
  onboardingSub: { fontSize: 12 },

  // Footer
  footer: { alignItems: 'center', paddingVertical: 14 },
  footerText: { fontSize: 14, fontStyle: 'italic' as const, textAlign: 'center' as const },
  footerRef: { fontSize: 11, marginTop: 4 },
});
