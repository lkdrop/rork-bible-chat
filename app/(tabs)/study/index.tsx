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
import { Brain, Users, Search, ChevronRight, Trophy, Bookmark, Play, Flame, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { studyPlans } from '@/constants/studyPlans';
import { readingMarathons } from '@/constants/readingMarathon';

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Estudos Bíblicos</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>Aprofunde seu conhecimento na Palavra</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <TouchableOpacity
            style={[styles.journeyBanner, { backgroundColor: state.journey.isActive ? '#FF6B35' : '#1A1A1A' }]}
            onPress={() => navigateTo(state.journey.isActive ? '/study/journey' : '/study/journey-quiz')}
            activeOpacity={0.8}
          >
            <View style={styles.journeyBannerLeft}>
              <View style={styles.journeyIconWrap}>
                <Flame size={24} color="#FFF" fill="#FFF" />
              </View>
              <View style={styles.journeyBannerInfo}>
                <Text style={styles.journeyBannerTitle}>
                  {state.journey.isActive ? 'Jornada 90 Dias' : 'NOVO: Jornada de 90 Dias'}
                </Text>
                <Text style={styles.journeyBannerSub}>
                  {state.journey.isActive
                    ? `Dia ${state.journey.currentDay} • ${state.journey.completedDays.length}/90 concluídos`
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
          </TouchableOpacity>

          <View style={styles.quickAccessRow}>
            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: '#3B82F615', borderColor: '#3B82F630' }]}
              onPress={() => navigateTo('/study/quiz')}
              activeOpacity={0.7}
            >
              <Brain size={28} color="#3B82F6" />
              <Text style={[styles.quickCardTitle, { color: '#3B82F6' }]}>Quiz Bíblico</Text>
              <Text style={[styles.quickCardSub, { color: colors.textMuted }]}>
                {state.quizHighScore > 0 ? `Recorde: ${state.quizHighScore}` : 'Teste conhecimentos'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: '#10B98115', borderColor: '#10B98130' }]}
              onPress={() => navigateTo('/study/characters')}
              activeOpacity={0.7}
            >
              <Users size={28} color="#10B981" />
              <Text style={[styles.quickCardTitle, { color: '#10B981' }]}>Personagens</Text>
              <Text style={[styles.quickCardSub, { color: colors.textMuted }]}>Heróis da fé</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.quickAccessRow}>
            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: '#EC489915', borderColor: '#EC489930' }]}
              onPress={() => navigateTo('/study/favorites')}
              activeOpacity={0.7}
            >
              <Bookmark size={28} color="#EC4899" />
              <Text style={[styles.quickCardTitle, { color: '#EC4899' }]}>Meus Versículos</Text>
              <Text style={[styles.quickCardSub, { color: colors.textMuted }]}>
                {state.verseHighlights.length + state.favoriteVerses.length} salvos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: '#F59E0B15', borderColor: '#F59E0B30' }]}
              onPress={() => navigateTo('/study/search')}
              activeOpacity={0.7}
            >
              <Search size={28} color="#F59E0B" />
              <Text style={[styles.quickCardTitle, { color: '#F59E0B' }]}>Busca Temática</Text>
              <Text style={[styles.quickCardSub, { color: colors.textMuted }]}>Por emoção ou tema</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>📖 Maratonas de Leitura</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
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
  journeyBannerSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
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
  quickAccessRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  quickCard: { flex: 1, padding: 18, borderRadius: 16, borderWidth: 1, alignItems: 'center', gap: 8 },
  quickCardTitle: { fontSize: 14, fontWeight: '700' as const, textAlign: 'center' as const },
  quickCardSub: { fontSize: 11, textAlign: 'center' as const },
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
