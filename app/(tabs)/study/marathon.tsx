import React, { useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, CheckCircle, Circle, BookOpen, Trophy } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { readingMarathons } from '@/constants/readingMarathon';

export default function MarathonScreen() {
  const router = useRouter();
  const { marathonId } = useLocalSearchParams<{ marathonId: string }>();
  const { state, colors, completeMarathonDay, isMarathonDayCompleted } = useApp();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const marathon = readingMarathons.find(m => m.id === marathonId);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const handleToggleDay = useCallback((day: number) => {
    if (!marathon) return;
    if (isMarathonDayCompleted(marathon.id, day)) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completeMarathonDay(marathon.id, day);
  }, [marathon, completeMarathonDay, isMarathonDayCompleted]);

  if (!marathon) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Maratona não encontrada</Text>
        </View>
      </SafeAreaView>
    );
  }

  const completedDays = (state.completedMarathonDays[marathon.id] || []).length;
  const percentage = marathon.totalDays > 0 ? Math.round((completedDays / marathon.totalDays) * 100) : 0;
  const isComplete = completedDays >= marathon.totalDays;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>{marathon.title}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={[styles.progressCard, { backgroundColor: colors.primary }]}>
            <Text style={styles.progressEmoji}>{marathon.emoji}</Text>
            <Text style={styles.progressTitle}>{marathon.title}</Text>
            <Text style={styles.progressDesc}>{marathon.description}</Text>

            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${percentage}%` as const }]} />
              </View>
              <Text style={styles.progressPercent}>{percentage}%</Text>
            </View>

            <View style={styles.progressStats}>
              <View style={styles.progressStat}>
                <BookOpen size={16} color="rgba(255,255,255,0.8)" />
                <Text style={styles.progressStatText}>{completedDays}/{marathon.totalDays} dias</Text>
              </View>
              {isComplete && (
                <View style={styles.progressStat}>
                  <Trophy size={16} color="#FFD700" />
                  <Text style={styles.progressStatText}>Completo!</Text>
                </View>
              )}
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Leituras Diárias</Text>

          {marathon.days.map((day) => {
            const isDone = isMarathonDayCompleted(marathon.id, day.day);
            return (
              <TouchableOpacity
                key={day.day}
                style={[
                  styles.dayCard,
                  {
                    backgroundColor: isDone ? colors.primary + '08' : colors.card,
                    borderColor: isDone ? colors.primary + '30' : colors.borderLight,
                  },
                ]}
                onPress={() => handleToggleDay(day.day)}
                activeOpacity={0.7}
              >
                <View style={styles.dayLeft}>
                  {isDone ? (
                    <CheckCircle size={24} color={colors.primary} />
                  ) : (
                    <Circle size={24} color={colors.textMuted} />
                  )}
                </View>
                <View style={styles.dayInfo}>
                  <View style={styles.dayTitleRow}>
                    <Text style={[styles.dayNumber, { color: isDone ? colors.primary : colors.textMuted }]}>
                      Dia {day.day}
                    </Text>
                    <Text style={[styles.dayBook, { color: colors.textSecondary }]}>
                      {day.book} {day.chapters}
                    </Text>
                  </View>
                  <Text style={[styles.daySummary, { color: colors.textMuted }]} numberOfLines={2}>
                    {day.summary}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, borderBottomWidth: 1 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700' as const, flex: 1, textAlign: 'center' as const },
  headerSpacer: { width: 30 },
  content: { padding: 20, paddingBottom: 40 },
  progressCard: { borderRadius: 20, padding: 24, marginBottom: 24 },
  progressEmoji: { fontSize: 40, marginBottom: 12 },
  progressTitle: { fontSize: 22, fontWeight: '800' as const, color: '#FFF', marginBottom: 6 },
  progressDesc: { fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 20, marginBottom: 20 },
  progressBarContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  progressBarBg: { flex: 1, height: 8, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 4, overflow: 'hidden' as const },
  progressBarFill: { height: '100%' as const, backgroundColor: '#FFF', borderRadius: 4 },
  progressPercent: { fontSize: 16, fontWeight: '800' as const, color: '#FFF' },
  progressStats: { flexDirection: 'row', gap: 20, marginTop: 14 },
  progressStat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  progressStatText: { fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: '600' as const },
  sectionTitle: { fontSize: 20, fontWeight: '700' as const, marginBottom: 14 },
  dayCard: { flexDirection: 'row', alignItems: 'flex-start', padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 10, gap: 14 },
  dayLeft: { paddingTop: 2 },
  dayInfo: { flex: 1 },
  dayTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  dayNumber: { fontSize: 13, fontWeight: '700' as const },
  dayBook: { fontSize: 14, fontWeight: '600' as const },
  daySummary: { fontSize: 13, lineHeight: 19 },
});
