import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Check, Circle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { studyPlans } from '@/constants/studyPlans';

export default function PlanDetailScreen() {
  const router = useRouter();
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const { colors, completePlanDay, isPlanDayCompleted } = useApp();

  const plan = studyPlans.find(p => p.id === planId);

  const handleCompleteDay = useCallback((day: number) => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completePlanDay(planId ?? '', day);
  }, [planId, completePlanDay]);

  if (!plan) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFound, { color: colors.text }]}>Plano não encontrado</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.goBack, { color: colors.primary }]}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const completedDays = plan.days.filter(d => isPlanDayCompleted(plan.id, d.day)).length;
  const progressPercent = Math.round((completedDays / plan.days.length) * 100);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>{plan.title}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={[styles.heroCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.heroEmoji}>{plan.emoji}</Text>
          <Text style={styles.heroTitle}>{plan.title}</Text>
          <Text style={styles.heroDesc}>{plan.description}</Text>
          <View style={styles.heroProgress}>
            <View style={styles.progressBarOuter}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` as const }]} />
            </View>
            <Text style={styles.progressLabel}>{completedDays}/{plan.days.length} dias</Text>
          </View>
        </View>

        {plan.days.map((day) => {
          const isComplete = isPlanDayCompleted(plan.id, day.day);
          return (
            <View
              key={day.day}
              style={[styles.dayCard, { backgroundColor: colors.card, borderColor: isComplete ? colors.primary + '40' : colors.borderLight }]}
            >
              <View style={styles.dayHeader}>
                <View style={[styles.dayBadge, { backgroundColor: isComplete ? colors.primary : colors.border }]}>
                  <Text style={[styles.dayNumber, { color: isComplete ? '#FFF' : colors.textMuted }]}>
                    {day.day}
                  </Text>
                </View>
                <View style={styles.dayInfo}>
                  <Text style={[styles.dayTitle, { color: colors.text }]}>{day.title}</Text>
                  <Text style={[styles.dayReading, { color: colors.primary }]}>📖 {day.reading}</Text>
                </View>
              </View>

              <Text style={[styles.dayReflection, { color: colors.textSecondary }]}>{day.reflection}</Text>

              <View style={[styles.verseBox, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.verseText, { color: colors.text }]}>"{day.verse}"</Text>
                <Text style={[styles.verseRef, { color: colors.primary }]}>{day.verseRef}</Text>
              </View>

              {!isComplete ? (
                <TouchableOpacity
                  style={[styles.completeBtn, { backgroundColor: colors.primary }]}
                  onPress={() => handleCompleteDay(day.day)}
                  activeOpacity={0.8}
                >
                  <Circle size={16} color="#FFF" />
                  <Text style={styles.completeBtnText}>Marcar como Concluído</Text>
                </TouchableOpacity>
              ) : (
                <View style={[styles.completedBadge, { backgroundColor: colors.primary + '15' }]}>
                  <Check size={16} color={colors.primary} />
                  <Text style={[styles.completedText, { color: colors.primary }]}>Concluído</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: { fontSize: 18, textAlign: 'center', marginTop: 100 },
  goBack: { fontSize: 16, textAlign: 'center', marginTop: 16 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700' as const, flex: 1, textAlign: 'center' as const },
  headerSpacer: { width: 30 },
  content: { padding: 20, paddingTop: 0, paddingBottom: 40 },
  heroCard: { borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 24 },
  heroEmoji: { fontSize: 48, marginBottom: 10 },
  heroTitle: { fontSize: 22, fontWeight: '800' as const, color: '#FFF', textAlign: 'center' as const, marginBottom: 6 },
  heroDesc: { fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center' as const, lineHeight: 20, marginBottom: 16 },
  heroProgress: { width: '100%', gap: 6 },
  progressBarOuter: { height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, overflow: 'hidden' as const },
  progressBarFill: { height: '100%' as const, backgroundColor: '#FFF', borderRadius: 3 },
  progressLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)', textAlign: 'center' as const, fontWeight: '600' as const },
  dayCard: { borderRadius: 16, padding: 18, borderWidth: 1, marginBottom: 16 },
  dayHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  dayBadge: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  dayNumber: { fontSize: 15, fontWeight: '800' as const },
  dayInfo: { flex: 1 },
  dayTitle: { fontSize: 16, fontWeight: '700' as const },
  dayReading: { fontSize: 13, fontWeight: '600' as const, marginTop: 2 },
  dayReflection: { fontSize: 14, lineHeight: 22, marginBottom: 14 },
  verseBox: { borderRadius: 12, padding: 14, marginBottom: 14 },
  verseText: { fontSize: 14, fontStyle: 'italic' as const, lineHeight: 22, marginBottom: 6 },
  verseRef: { fontSize: 13, fontWeight: '700' as const },
  completeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12 },
  completeBtnText: { fontSize: 15, fontWeight: '700' as const, color: '#FFF' },
  completedBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12 },
  completedText: { fontSize: 14, fontWeight: '700' as const },
});
