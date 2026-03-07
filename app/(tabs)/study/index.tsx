import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Brain, Users, Search, ChevronRight, Trophy, Bookmark, BookOpen, Play, Flame, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { studyPlans } from '@/constants/studyPlans';
import { readingMarathons } from '@/constants/readingMarathon';
import { AppImages } from '@/constants/images';

export default function StudyScreen() {
  const router = useRouter();
  const { state, colors } = useApp();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const navigateTo = useCallback((route: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as never);
  }, [router]);

  const getPlanProgress = useCallback((planId: string, totalDays: number) => {
    const completed = (state.completedPlanDays[planId] || []).length;
    return { completed, total: totalDays, percentage: totalDays > 0 ? Math.round((completed / totalDays) * 100) : 0 };
  }, [state.completedPlanDays]);

  const getMarathonProgress = useCallback((marathonId: string, totalDays: number) => {
    const completed = (state.completedMarathonDays[marathonId] || []).length;
    return { completed, total: totalDays, percentage: totalDays > 0 ? Math.round((completed / totalDays) * 100) : 0 };
  }, [state.completedMarathonDays]);

  const quickCards = [
    { title: 'Ler a Bíblia', sub: 'Todos os livros', icon: BookOpen, color: '#C5943A', image: AppImages.studyCards.bible, route: '/study/bible' },
    { title: 'Quiz Bíblico', sub: state.quizHighScore > 0 ? `Recorde: ${state.quizHighScore}` : 'Teste conhecimentos', icon: Brain, color: '#3B82F6', image: AppImages.studyCards.quiz, route: '/study/quiz' },
    { title: 'Personagens', sub: 'Heróis da fé', icon: Users, color: '#10B981', image: AppImages.studyCards.characters, route: '/study/characters' },
    { title: 'Meus Versículos', sub: `${state.verseHighlights.length + state.favoriteVerses.length} salvos`, icon: Bookmark, color: '#EC4899', image: AppImages.studyCards.favorites, route: '/study/favorites' },
    { title: 'Busca Temática', sub: 'Por emoção ou tema', icon: Search, color: '#F59E0B', image: AppImages.studyCards.search, route: '/study/search' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Estudos Bíblicos</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>Aprofunde seu conhecimento na Palavra</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <TouchableOpacity
            style={styles.journeyBanner}
            onPress={() => navigateTo(state.journey.isActive ? '/study/journey' : '/study/journey-quiz')}
            activeOpacity={0.8}
          >
            <Image source={{ uri: AppImages.sunrise }} style={styles.journeyBannerBg} contentFit="cover" />
            <LinearGradient
              colors={state.journey.isActive ? ['rgba(255,107,53,0.3)', 'rgba(255,107,53,0.9)'] : ['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.85)']}
              style={styles.journeyBannerOverlay}
            >
              <View style={styles.journeyBannerLeft}>
                <View style={styles.journeyIconWrap}>
                  <Flame size={24} color="#FFF" fill="#FFF" />
                </View>
                <View style={styles.journeyBannerInfo}>
                  <Text style={styles.journeyBannerTitle}>
                    {state.journey.isActive ? 'Jornada 28 Dias' : 'NOVO: Jornada de 28 Dias'}
                  </Text>
                  <Text style={styles.journeyBannerSub}>
                    {state.journey.isActive
                      ? `Dia ${state.journey.currentDay} • ${state.journey.completedDays.length}/28 concluídos`
                      : 'Orações proféticas da madrugada'}
                  </Text>
                </View>
              </View>
              {state.journey.isActive ? (
                <ChevronRight size={20} color="#FFF" />
              ) : (
                <View style={styles.journeyNewBadge}>
                  <Sparkles size={12} color="#FF6B35" />
                  <Text style={styles.journeyNewText}>Quiz</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.quickGrid}>
            {quickCards.map((card) => (
              <TouchableOpacity
                key={card.title}
                style={styles.quickCard}
                onPress={() => navigateTo(card.route)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: card.image }} style={styles.quickCardImage} contentFit="cover" />
                <LinearGradient
                  colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.85)']}
                  style={styles.quickCardOverlay}
                >
                  <View style={[styles.quickCardIconWrap, { backgroundColor: card.color }]}>
                    <card.icon size={18} color="#FFF" />
                  </View>
                  <Text style={styles.quickCardTitle}>{card.title}</Text>
                  <Text style={styles.quickCardSub}>{card.sub}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Maratonas de Leitura</Text>
          <Text style={[styles.sectionDesc, { color: colors.textMuted }]}>Leitura como série de TV — acompanhe seu progresso</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.marathonScroll}
          >
            {readingMarathons.map((marathon) => {
              const progress = getMarathonProgress(marathon.id, marathon.totalDays);
              return (
                <TouchableOpacity
                  key={marathon.id}
                  style={[styles.marathonCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
                  onPress={() => navigateTo(`/study/marathon?marathonId=${marathon.id}`)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.marathonEmoji}>{marathon.emoji}</Text>
                  <Text style={[styles.marathonTitle, { color: colors.text }]} numberOfLines={2}>{marathon.title}</Text>
                  <Text style={[styles.marathonMeta, { color: colors.textMuted }]}>
                    {marathon.totalDays} dias • {marathon.category}
                  </Text>
                  {progress.completed > 0 ? (
                    <View style={styles.marathonProgress}>
                      <View style={[styles.marathonProgressBar, { backgroundColor: colors.border }]}>
                        <View style={[styles.marathonProgressFill, { width: `${progress.percentage}%` as const, backgroundColor: colors.primary }]} />
                      </View>
                      <Text style={[styles.marathonProgressText, { color: colors.primary }]}>{progress.percentage}%</Text>
                    </View>
                  ) : (
                    <View style={[styles.startBadge, { backgroundColor: colors.primaryLight }]}>
                      <Play size={10} color={colors.primary} />
                      <Text style={[styles.startText, { color: colors.primary }]}>Começar</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Planos de Estudo</Text>

          {studyPlans.map((plan) => {
            const progress = getPlanProgress(plan.id, plan.duration);
            return (
              <TouchableOpacity
                key={plan.id}
                style={[styles.planCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
                onPress={() => navigateTo(`/study/plan-detail?planId=${plan.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.planHeader}>
                  <Text style={styles.planEmoji}>{plan.emoji}</Text>
                  <View style={styles.planInfo}>
                    <Text style={[styles.planTitle, { color: colors.text }]}>{plan.title}</Text>
                    <Text style={[styles.planMeta, { color: colors.textMuted }]}>
                      {plan.duration} dias • {plan.category}
                    </Text>
                  </View>
                  <ChevronRight size={18} color={colors.textMuted} />
                </View>
                <Text style={[styles.planDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                  {plan.description}
                </Text>
                {progress.completed > 0 && (
                  <View style={styles.planProgress}>
                    <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                      <View style={[styles.progressFill, { width: `${progress.percentage}%` as const, backgroundColor: colors.primary }]} />
                    </View>
                    <Text style={[styles.progressText, { color: colors.textMuted }]}>
                      {progress.completed}/{progress.total}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          {state.totalQuizPlayed > 0 && (
            <View style={[styles.quizStats, { backgroundColor: colors.cardElevated, borderColor: colors.borderLight }]}>
              <Trophy size={20} color={colors.primary} />
              <View style={styles.quizStatsInfo}>
                <Text style={[styles.quizStatsTitle, { color: colors.text }]}>Estatísticas de Quiz</Text>
                <Text style={[styles.quizStatsText, { color: colors.textMuted }]}>
                  {state.totalQuizPlayed} jogos • Recorde: {state.quizHighScore} pontos
                </Text>
              </View>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, marginTop: 4 },
  content: { padding: 20, paddingTop: 0, paddingBottom: 40 },
  journeyBanner: {
    height: 100,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden' as const,
  },
  journeyBannerBg: {
    ...StyleSheet.absoluteFillObject,
  },
  journeyBannerOverlay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
  },
  journeyBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  journeyIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  journeyBannerInfo: { flex: 1 },
  journeyBannerTitle: { fontSize: 16, fontWeight: '800' as const, color: '#FFF' },
  journeyBannerSub: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  journeyNewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  journeyNewText: { fontSize: 12, fontWeight: '700' as const, color: '#FF6B35' },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap' as const,
    gap: 10,
    marginBottom: 20,
  },
  quickCard: {
    width: '48.5%' as const,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden' as const,
  },
  quickCardImage: {
    ...StyleSheet.absoluteFillObject,
  },
  quickCardOverlay: {
    flex: 1,
    padding: 14,
    justifyContent: 'flex-end',
  },
  quickCardIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: 'auto' as const,
  },
  quickCardTitle: { fontSize: 14, fontWeight: '700' as const, color: '#FFF', marginTop: 6 },
  quickCardSub: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 1 },
  sectionTitle: { fontSize: 20, fontWeight: '700' as const, marginBottom: 4, marginTop: 12 },
  sectionDesc: { fontSize: 13, marginBottom: 14 },
  marathonScroll: { gap: 12, paddingBottom: 4, marginBottom: 24 },
  marathonCard: { width: 170, padding: 16, borderRadius: 16, borderWidth: 1 },
  marathonEmoji: { fontSize: 32, marginBottom: 8 },
  marathonTitle: { fontSize: 14, fontWeight: '700' as const, marginBottom: 4, lineHeight: 20 },
  marathonMeta: { fontSize: 11, marginBottom: 10 },
  marathonProgress: { gap: 4 },
  marathonProgressBar: { height: 5, borderRadius: 3, overflow: 'hidden' as const },
  marathonProgressFill: { height: '100%' as const, borderRadius: 3 },
  marathonProgressText: { fontSize: 11, fontWeight: '700' as const },
  startBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  startText: { fontSize: 11, fontWeight: '700' as const },
  planCard: { borderRadius: 16, padding: 18, borderWidth: 1, marginBottom: 14 },
  planHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  planEmoji: { fontSize: 32, marginRight: 12 },
  planInfo: { flex: 1 },
  planTitle: { fontSize: 16, fontWeight: '700' as const },
  planMeta: { fontSize: 12, marginTop: 2 },
  planDescription: { fontSize: 13, lineHeight: 20, marginBottom: 8 },
  planProgress: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressBar: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' as const },
  progressFill: { height: '100%' as const, borderRadius: 3 },
  progressText: { fontSize: 12, fontWeight: '600' as const },
  quizStats: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 14, borderWidth: 1, marginTop: 10 },
  quizStatsInfo: { flex: 1 },
  quizStatsTitle: { fontSize: 14, fontWeight: '600' as const },
  quizStatsText: { fontSize: 12, marginTop: 2 },
});
