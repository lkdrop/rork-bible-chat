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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
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
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { getTodayVerse } from '@/constants/dailyVerses';
import { generateText } from '@rork-ai/toolkit-sdk';

export default function HomeScreen() {
  const router = useRouter();
  const { state, colors, recordActivity, toggleFavoriteVerse } = useApp();
  const verse = getTodayVerse();

  const [devotional, setDevotional] = useState('');
  const [isLoadingDevotional, setIsLoadingDevotional] = useState(false);
  const [devotionalLoaded, setDevotionalLoaded] = useState(false);

  const flameAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const verseScale = useRef(new Animated.Value(0.95)).current;

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
  }, [fadeAnim, slideAnim, verseScale, flameAnim, state.streak]);

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

  const quickActions = [
    { title: 'Chat IA', subtitle: 'Pergunte à Bíblia', icon: MessageCircle, route: '/chat', color: '#3B82F6' },
    { title: 'Estudos', subtitle: 'Planos e quiz', icon: BookOpen, route: '/study', color: '#10B981' },
    { title: 'Ferramentas', subtitle: 'Diário e orações', icon: Heart, route: '/tools', color: '#F59E0B' },
  ];

  const featureCards = [
    { title: 'Grego & Hebraico', subtitle: 'Estudo de palavras originais', icon: Languages, route: '/chat', color: '#3B82F6', emoji: '🔤' },
    { title: 'Prep. Sermão', subtitle: 'IA ajuda seu esboço', icon: FileText, route: '/tools/sermon-prep', color: '#10B981', emoji: '🎤' },
    { title: 'Meus Versículos', subtitle: 'Favoritos e destaques', icon: Bookmark, route: '/study/favorites', color: '#EC4899', emoji: '✨' },
    { title: 'Maratona Bíblica', subtitle: 'Leitura com progresso', icon: Trophy, route: '/study', color: '#F59E0B', emoji: '📖' },
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
              <Text style={[styles.greeting, { color: colors.textMuted }]}>{getGreeting()} ✨</Text>
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

          <Animated.View style={[styles.verseCard, { backgroundColor: colors.primary, transform: [{ scale: verseScale }] }]}>
            <View style={styles.verseHeader}>
              <View style={styles.verseBadge}>
                <Sparkles size={14} color={colors.primary} />
                <Text style={[styles.verseBadgeText, { color: colors.primary }]}>Versículo do Dia</Text>
              </View>
              <Text style={styles.verseTranslation}>{verse.translation}</Text>
            </View>
            <Text style={styles.verseText}>"{verse.text}"</Text>
            <Text style={styles.verseRef}>— {verse.reference}</Text>
            <View style={styles.verseActions}>
              <TouchableOpacity style={styles.verseAction} onPress={handleFavorite}>
                <Heart size={18} color="#FFFFFF" fill={isFavorite ? '#FFFFFF' : 'transparent'} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.verseAction} onPress={handleShare}>
                <Share2 size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </Animated.View>

          <TouchableOpacity
            style={[styles.devotionalCard, { backgroundColor: colors.cardElevated, borderColor: colors.borderLight }]}
            onPress={() => void loadDevotional()}
            activeOpacity={0.8}
          >
            <View style={styles.devotionalHeader}>
              <Text style={[styles.devotionalTitle, { color: colors.text }]}>🕊️ Devocional do Dia</Text>
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
                <Play size={16} color={colors.primary} />
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
            </TouchableOpacity>
          )}

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Acesso Rápido</Text>

          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.title}
                style={[styles.quickAction, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(action.route as never);
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color + '15' }]}>
                  <action.icon size={22} color={action.color} />
                </View>
                <Text style={[styles.quickActionTitle, { color: colors.text }]}>{action.title}</Text>
                <Text style={[styles.quickActionSubtitle, { color: colors.textMuted }]}>{action.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Novidades</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featureScrollContent}
          >
            {featureCards.map((card) => (
              <TouchableOpacity
                key={card.title}
                style={[styles.featureCard, { backgroundColor: card.color + '10', borderColor: card.color + '25' }]}
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(card.route as never);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.featureEmoji}>{card.emoji}</Text>
                <Text style={[styles.featureTitle, { color: card.color }]}>{card.title}</Text>
                <Text style={[styles.featureSubtitle, { color: colors.textMuted }]}>{card.subtitle}</Text>
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
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Capítulos lidos</Text>
              </View>
            </View>
            <View style={[styles.statsRowSecond, { borderTopColor: colors.border }]}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>{state.journalEntries.length}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Reflexões</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>{state.verseHighlights.length}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Destaques</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>{state.sermonNotes.length}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Sermões</Text>
              </View>
            </View>
          </View>

          <View style={[styles.prayerCardInner, { backgroundColor: colors.cardElevated, borderColor: colors.borderLight }]}>
            <Text style={[styles.prayerCardTitle, { color: colors.text }]}>🙏 Oração do Dia</Text>
            <Text style={[styles.prayerCardText, { color: colors.textSecondary }]}>
              Senhor, obrigado por mais um dia. Guia meus passos, ilumina meu caminho e me dá sabedoria para fazer a Tua vontade. Amém.
            </Text>
            <TouchableOpacity
              style={[styles.prayerShareBtn, { backgroundColor: colors.primaryLight }]}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                void Share.share({ message: '🙏 Oração do Dia:\n\nSenhor, obrigado por mais um dia. Guia meus passos, ilumina meu caminho e me dá sabedoria para fazer a Tua vontade. Amém.\n\nEnviado pelo Bíblia IA' });
              }}
            >
              <Share2 size={14} color={colors.primary} />
              <Text style={[styles.prayerShareText, { color: colors.primary }]}>Compartilhar</Text>
            </TouchableOpacity>
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
    marginBottom: 24,
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
    padding: 24,
    marginBottom: 16,
  },
  verseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  verseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  verseBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  verseTranslation: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.7)',
  },
  verseText: {
    fontSize: 18,
    fontWeight: '500' as const,
    color: '#FFFFFF',
    lineHeight: 28,
    marginBottom: 12,
  },
  verseRef: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
  },
  verseActions: {
    flexDirection: 'row',
    gap: 12,
  },
  verseAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    gap: 12,
    marginBottom: 24,
  },
  quickAction: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  quickActionSubtitle: {
    fontSize: 11,
    textAlign: 'center' as const,
  },
  featureScrollContent: {
    gap: 12,
    paddingBottom: 4,
    marginBottom: 24,
  },
  featureCard: {
    width: 140,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
  },
  featureEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
  },
  featureSubtitle: {
    fontSize: 11,
    textAlign: 'center' as const,
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
  statsRowSecond: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
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
  prayerCardInner: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  prayerCardTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    marginBottom: 10,
  },
  prayerCardText: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 14,
  },
  prayerShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  prayerShareText: {
    fontSize: 13,
    fontWeight: '600' as const,
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
});
