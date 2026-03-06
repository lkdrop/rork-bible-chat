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
  Languages,
  FileText,
  Bookmark,
  Trophy,
  Play,
  Volume2,
  VolumeX,
  ChevronRight,
  Flame,
  Swords,
  Users,
  Gamepad2,
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

  const flameAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const verseScale = useRef(new Animated.Value(0.95)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    recordActivity();
  }, [recordActivity]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.spring(verseScale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();

    if (state.streak > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(flameAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
          Animated.timing(flameAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    }

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, [fadeAnim, slideAnim, verseScale, flameAnim, state.streak, pulseAnim]);

  const handleShare = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `"${verse.text}"\n\n— ${verse.reference} (${verse.translation})\n\nEnviado pelo Bíblia IA`,
      });
    } catch (e) {
      console.log('Share error:', e);
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
    return () => {
      void Speech.stop();
    };
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
    } catch (error) {
      console.log('Devotional error:', error);
      setDevotional('Que a Palavra de Deus guie seu dia com sabedoria e paz. Medite neste versículo e deixe que ele transforme seu coração.');
      setDevotionalLoaded(true);
    } finally {
      setIsLoadingDevotional(false);
    }
  }, [verse, devotionalLoaded, isLoadingDevotional]);

  const isFavorite = state.favoriteVerses.includes(verse.reference);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getTimeImage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return AppImages.sunrise;
    if (hour < 18) return AppImages.nature;
    return AppImages.mountainSunset;
  };

  const journeyActive = state.journey.isActive;
  const journeyProgress = journeyActive ? Math.round((state.journey.completedDays.length / 90) * 100) : 0;

  const quickActions = [
    { title: 'Chat IA', subtitle: 'Pergunte à Bíblia', icon: MessageCircle, route: '/chat', color: '#3B82F6', image: AppImages.openBible },
    { title: 'Estudos', subtitle: 'Planos e quiz', icon: BookOpen, route: '/study', color: '#10B981', image: AppImages.studyDesk },
    { title: 'Games', subtitle: 'Aprenda jogando', icon: Gamepad2, route: '/games', color: '#F59E0B', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80' },
  ];

  const featureCards = [
    { title: 'Grego & Hebraico', subtitle: 'Palavras originais', icon: Languages, route: '/chat', color: '#3B82F6', image: AppImages.stainedGlass },
    { title: 'Prep. Sermão', subtitle: 'IA ajuda seu esboço', icon: FileText, route: '/tools/sermon-prep', color: '#10B981', image: AppImages.toolCards.sermon },
    { title: 'Meus Versículos', subtitle: 'Favoritos salvos', icon: Bookmark, route: '/study/favorites', color: '#EC4899', image: AppImages.studyCards.favorites },
    { title: 'Maratona Bíblica', subtitle: 'Leitura com progresso', icon: Trophy, route: '/study', color: '#F59E0B', image: AppImages.heroBible },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.greeting, { color: colors.textMuted }]}>{getGreeting()}</Text>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Bíblia IA</Text>
            </View>
            {state.streak > 0 && (
              <View style={[styles.streakBadge, { backgroundColor: colors.streak + '18' }]}>
                <Animated.View style={{ transform: [{ scale: flameAnim }] }}>
                  <Flame size={20} color={colors.streak} fill={colors.streak} />
                </Animated.View>
                <Text style={[styles.streakText, { color: colors.streak }]}>{state.streak}</Text>
              </View>
            )}
          </View>

          <Animated.View style={[styles.verseCard, { transform: [{ scale: verseScale }] }]}>
            <Image
              source={{ uri: getTimeImage() }}
              style={styles.verseCardImage}
              contentFit="cover"
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.75)']}
              style={styles.verseCardOverlay}
            >
              <View style={styles.verseHeader}>
                <View style={styles.verseBadge}>
                  <Sparkles size={13} color={colors.primary} />
                  <Text style={[styles.verseBadgeText, { color: colors.primary }]}>Versículo do Dia</Text>
                </View>
                <Text style={styles.verseTranslation}>{verse.translation}</Text>
              </View>
              <Text style={styles.verseText}>"{verse.text}"</Text>
              <Text style={styles.verseRef}>— {verse.reference}</Text>
              <View style={styles.verseActions}>
                <TouchableOpacity style={styles.verseAction} onPress={handleSpeakVerse} testID="speak-verse-btn">
                  {isSpeaking ? (
                    <VolumeX size={17} color="#FFFFFF" />
                  ) : (
                    <Volume2 size={17} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.verseAction} onPress={handleFavorite} testID="favorite-verse-btn">
                  <Heart size={17} color="#FFFFFF" fill={isFavorite ? '#FFFFFF' : 'transparent'} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.verseAction} onPress={handleShare} testID="share-verse-btn">
                  <Share2 size={17} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>

          <TouchableOpacity
            style={[styles.devotionalCard, { backgroundColor: colors.cardElevated, borderColor: colors.borderLight }]}
            onPress={() => void loadDevotional()}
            activeOpacity={0.8}
            testID="devotional-card"
          >
            <View style={styles.devotionalHeader}>
              <Text style={[styles.devotionalTitle, { color: colors.text }]}>Devocional do Dia</Text>
              {!devotionalLoaded && !isLoadingDevotional && (
                <View style={[styles.devotionalBadge, { backgroundColor: colors.primaryLight }]}>
                  <Sparkles size={12} color={colors.primary} />
                  <Text style={[styles.devotionalBadgeText, { color: colors.primary }]}>IA</Text>
                </View>
              )}
            </View>
            {isLoadingDevotional ? (
              <View style={styles.devotionalLoading}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.devotionalLoadingText, { color: colors.textMuted }]}>Preparando reflexão...</Text>
              </View>
            ) : devotionalLoaded ? (
              <Text style={[styles.devotionalText, { color: colors.textSecondary }]}>{devotional}</Text>
            ) : (
              <View style={styles.devotionalPrompt}>
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <Play size={16} color={colors.primary} />
                </Animated.View>
                <Text style={[styles.devotionalPromptText, { color: colors.primary }]}>Toque para gerar reflexão personalizada</Text>
              </View>
            )}
          </TouchableOpacity>

          {!state.hasCompletedOnboarding && (
            <TouchableOpacity
              style={[styles.onboardingCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push('/onboarding' as never)}
              activeOpacity={0.8}
            >
              <View style={styles.onboardingContent}>
                <Text style={[styles.onboardingTitle, { color: colors.text }]}>Personalize sua experiência</Text>
                <Text style={[styles.onboardingSubtitle, { color: colors.textSecondary }]}>Configure sua denominação e tradução preferida</Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Acesso Rápido</Text>

          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.title}
                style={styles.quickAction}
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(action.route as never);
                }}
                activeOpacity={0.8}
                testID={`quick-action-${action.title}`}
              >
                <Image source={{ uri: action.image }} style={styles.quickActionImage} contentFit="cover" />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.quickActionOverlay}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: action.color + '30' }]}>
                    <action.icon size={18} color="#FFF" />
                  </View>
                  <Text style={styles.quickActionTitle}>{action.title}</Text>
                  <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.journeyHomeCard, { backgroundColor: journeyActive ? '#FF6B35' + '12' : colors.card, borderColor: journeyActive ? '#FF6B35' + '30' : colors.borderLight }]}
            onPress={() => router.push(journeyActive ? '/study/journey' as never : '/study/journey-quiz' as never)}
            activeOpacity={0.8}
            testID="journey-home-card"
          >
            <View style={styles.journeyHomeLeft}>
              <View style={[styles.journeyHomeIcon, { backgroundColor: '#FF6B35' + '18' }]}>
                <Flame size={24} color="#FF6B35" fill={journeyActive ? '#FF6B35' : 'transparent'} />
              </View>
              <View style={styles.journeyHomeInfo}>
                <Text style={[styles.journeyHomeTitle, { color: colors.text }]}>Jornada 90 Dias</Text>
                {journeyActive ? (
                  <Text style={[styles.journeyHomeSubtitle, { color: '#FF6B35' }]}>
                    Dia {state.journey.currentDay}/90 • {journeyProgress}% concluído
                  </Text>
                ) : (
                  <Text style={[styles.journeyHomeSubtitle, { color: colors.textMuted }]}>
                    Faça o quiz e comece sua transformação
                  </Text>
                )}
              </View>
            </View>
            {journeyActive && (
              <View style={styles.journeyProgressMini}>
                <View style={[styles.journeyProgressBg, { backgroundColor: colors.border }]}>
                  <View style={[styles.journeyProgressFill, { width: `${journeyProgress}%` as `${number}%` }]} />
                </View>
              </View>
            )}
            <ChevronRight size={18} color={journeyActive ? '#FF6B35' : colors.textMuted} />
          </TouchableOpacity>

          <View style={[styles.gamesSection, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <View style={styles.gamesSectionHeader}>
              <View style={[styles.gamesSectionIcon, { backgroundColor: '#F59E0B' + '15' }]}>
                <Gamepad2 size={18} color="#F59E0B" />
              </View>
              <Text style={[styles.gamesSectionTitle, { color: colors.text }]}>Games Bíblicos</Text>
              <TouchableOpacity onPress={() => router.push('/games' as never)} style={styles.gamesSectionSeeAll}>
                <Text style={[styles.gamesSectionSeeAllText, { color: colors.primary }]}>Ver todos</Text>
                <ChevronRight size={14} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.gamesGrid}>
              <TouchableOpacity
                style={[styles.gameItem, { backgroundColor: '#F59E0B' + '08' }]}
                onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/games/bible-battle' as never); }}
                activeOpacity={0.7}
              >
                <Text style={styles.gameItemEmoji}>⚔️</Text>
                <Text style={[styles.gameItemTitle, { color: colors.text }]}>Batalha</Text>
                <Text style={[styles.gameItemSub, { color: colors.textMuted }]}>{state.gamePoints} pts</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.gameItem, { backgroundColor: '#10B981' + '08' }]}
                onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/games/snake' as never); }}
                activeOpacity={0.7}
              >
                <Text style={styles.gameItemEmoji}>🐍</Text>
                <Text style={[styles.gameItemTitle, { color: colors.text }]}>Serpente</Text>
                <Text style={[styles.gameItemSub, { color: colors.textMuted }]}>Novo!</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.gameItem, { backgroundColor: '#8B5CF6' + '08' }]}
                onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/games/memory' as never); }}
                activeOpacity={0.7}
              >
                <Text style={styles.gameItemEmoji}>🧠</Text>
                <Text style={[styles.gameItemTitle, { color: colors.text }]}>Memória</Text>
                <Text style={[styles.gameItemSub, { color: colors.textMuted }]}>Novo!</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Explore</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featureScrollContent}
          >
            {featureCards.map((card) => (
              <TouchableOpacity
                key={card.title}
                style={styles.featureCard}
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(card.route as never);
                }}
                activeOpacity={0.8}
              >
                <Image source={{ uri: card.image }} style={styles.featureCardImage} contentFit="cover" />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.85)']}
                  style={styles.featureCardOverlay}
                >
                  <card.icon size={18} color="#FFF" />
                  <Text style={styles.featureTitle}>{card.title}</Text>
                  <Text style={styles.featureSubtitle}>{card.subtitle}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Suas Estatísticas</Text>

          <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>{state.streak}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Dias seguidos</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>{state.totalDaysActive}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Dias ativos</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>{state.totalChaptersRead}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Capítulos</Text>
              </View>
            </View>
          </View>

          <View style={styles.prayerCard}>
            <Image source={{ uri: AppImages.prayer }} style={styles.prayerCardBg} contentFit="cover" />
            <LinearGradient
              colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
              style={styles.prayerCardContent}
            >
              <Text style={styles.prayerCardTitle}>Oração do Dia</Text>
              <Text style={styles.prayerCardText}>
                Senhor, obrigado por mais um dia. Guia meus passos, ilumina meu caminho e me dá sabedoria para fazer a Tua vontade. Amém.
              </Text>
              <View style={styles.prayerActions}>
                <TouchableOpacity
                  style={styles.prayerActionBtn}
                  onPress={() => {
                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    if (Platform.OS !== 'web') {
                      Speech.speak('Senhor, obrigado por mais um dia. Guia meus passos, ilumina meu caminho e me dá sabedoria para fazer a Tua vontade. Amém.', {
                        language: 'pt-BR',
                        rate: 0.8,
                      });
                    }
                  }}
                >
                  <Volume2 size={14} color="#FFF" />
                  <Text style={styles.prayerActionText}>Ouvir</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.prayerActionBtn}
                  onPress={() => {
                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    void Share.share({ message: 'Oração do Dia:\n\nSenhor, obrigado por mais um dia. Guia meus passos, ilumina meu caminho e me dá sabedoria para fazer a Tua vontade. Amém.\n\nEnviado pelo Bíblia IA' });
                  }}
                >
                  <Share2 size={14} color="#FFF" />
                  <Text style={styles.prayerActionText}>Compartilhar</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.footerQuote}>
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
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 15,
    fontWeight: '500' as const,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  streakText: {
    fontSize: 18,
    fontWeight: '800' as const,
  },
  verseCard: {
    borderRadius: 20,
    marginBottom: 16,
    height: 260,
    overflow: 'hidden' as const,
  },
  verseCardImage: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
  },
  verseCardOverlay: {
    flex: 1,
    borderRadius: 20,
    padding: 22,
    justifyContent: 'flex-end',
  },
  verseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  verseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  verseBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  verseTranslation: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.8)',
  },
  verseText: {
    fontSize: 17,
    fontWeight: '500' as const,
    color: '#FFFFFF',
    lineHeight: 26,
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  verseRef: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 14,
  },
  verseActions: {
    flexDirection: 'row',
    gap: 10,
  },
  verseAction: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  devotionalCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    marginBottom: 20,
  },
  devotionalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  devotionalTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
  },
  devotionalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  devotionalBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  devotionalLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  devotionalLoadingText: {
    fontSize: 14,
  },
  devotionalText: {
    fontSize: 15,
    lineHeight: 24,
  },
  devotionalPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  devotionalPromptText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  onboardingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  onboardingContent: {
    flex: 1,
  },
  onboardingTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  onboardingSubtitle: {
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 14,
    marginTop: 4,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  quickAction: {
    flex: 1,
    height: 150,
    borderRadius: 16,
    overflow: 'hidden' as const,
  },
  quickActionImage: {
    ...StyleSheet.absoluteFillObject,
  },
  quickActionOverlay: {
    flex: 1,
    padding: 14,
    justifyContent: 'flex-end',
  },
  quickActionIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  quickActionSubtitle: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 1,
  },
  featureScrollContent: {
    gap: 12,
    paddingBottom: 4,
    marginBottom: 24,
  },
  featureCard: {
    width: 150,
    height: 180,
    borderRadius: 16,
    overflow: 'hidden' as const,
  },
  featureCardImage: {
    ...StyleSheet.absoluteFillObject,
  },
  featureCardOverlay: {
    flex: 1,
    padding: 14,
    justifyContent: 'flex-end',
    gap: 4,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginTop: 4,
  },
  featureSubtitle: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.75)',
  },
  statsCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    overflow: 'hidden' as const,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800' as const,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 36,
  },
  prayerCard: {
    borderRadius: 20,
    height: 200,
    overflow: 'hidden' as const,
    marginBottom: 24,
  },
  prayerCardBg: {
    ...StyleSheet.absoluteFillObject,
  },
  prayerCardContent: {
    flex: 1,
    padding: 22,
    justifyContent: 'flex-end',
  },
  prayerCardTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  prayerCardText: {
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 14,
  },
  prayerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  prayerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  prayerActionText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  footerQuote: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 14,
    fontStyle: 'italic' as const,
    textAlign: 'center' as const,
  },
  footerRef: {
    fontSize: 12,
    marginTop: 4,
  },
  journeyHomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
  },
  journeyHomeLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  journeyHomeIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  journeyHomeInfo: {
    flex: 1,
  },
  journeyHomeTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  journeyHomeSubtitle: {
    fontSize: 12,
    marginTop: 3,
  },
  journeyProgressMini: {
    width: 50,
    marginRight: 4,
  },
  journeyProgressBg: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden' as const,
  },
  journeyProgressFill: {
    height: '100%' as const,
    borderRadius: 2,
    backgroundColor: '#FF6B35',
  },
  gamesSection: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  gamesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  gamesSectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gamesSectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    flex: 1,
  },
  gamesSectionSeeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  gamesSectionSeeAllText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  gamesGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  gameItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 4,
  },
  gameItemEmoji: {
    fontSize: 28,
  },
  gameItemTitle: {
    fontSize: 12,
    fontWeight: '700' as const,
    marginTop: 2,
  },
  gameItemSub: {
    fontSize: 10,
  },
});
