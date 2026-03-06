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
import { Brain, Users, Search, ChevronRight, Trophy } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { studyPlans } from '@/constants/studyPlans';

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Estudos Bíblicos</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>Aprofunde seu conhecimento na Palavra</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Animated.View style={{ opacity: fadeAnim }}>
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

          <TouchableOpacity
            style={[styles.searchCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => navigateTo('/study/search')}
            activeOpacity={0.7}
          >
            <Search size={20} color={colors.primary} />
            <Text style={[styles.searchText, { color: colors.textMuted }]}>Buscar por tema, emoção ou situação...</Text>
          </TouchableOpacity>

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
  quickAccessRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  quickCard: { flex: 1, padding: 18, borderRadius: 16, borderWidth: 1, alignItems: 'center', gap: 8 },
  quickCardTitle: { fontSize: 15, fontWeight: '700' as const },
  quickCardSub: { fontSize: 11, textAlign: 'center' as const },
  searchCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 24 },
  searchText: { fontSize: 14 },
  sectionTitle: { fontSize: 20, fontWeight: '700' as const, marginBottom: 14 },
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
