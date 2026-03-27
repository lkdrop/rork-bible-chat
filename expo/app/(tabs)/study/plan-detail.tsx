import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Check, Circle, ChevronRight, Volume2, CheckCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { studyPlans, type StudyDay } from '@/constants/studyPlans';
import {
  getStudyDayContent,
  translationToVersion,
  type StudyDaySection,
} from '@/services/bibliaDigital';
import { AudioPlayerBar } from '@/components/AudioPlayerBar';

type PlanView = 'dayList' | 'reading';

export default function PlanDetailScreen() {
  const router = useRouter();
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const { colors, state, completePlanDay, isPlanDayCompleted } = useApp();
  const version = translationToVersion(state.preferredTranslation);

  const plan = studyPlans.find(p => p.id === planId);

  // View state
  const [view, setView] = useState<PlanView>('dayList');
  const [selectedDay, setSelectedDay] = useState<StudyDay | null>(null);
  const [sections, setSections] = useState<StudyDaySection[]>([]);
  const [readingLoading, setReadingLoading] = useState(false);
  const [readingError, setReadingError] = useState<string | null>(null);
  const [showAudio, setShowAudio] = useState(false);
  const [fullText, setFullText] = useState('');

  const handleSelectDay = useCallback(async (day: StudyDay) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDay(day);
    setView('reading');
    setReadingLoading(true);
    setReadingError(null);
    setShowAudio(false);
    setSections([]);
    setFullText('');

    const result = await getStudyDayContent(version, day.reading);
    setSections(result.sections);
    setFullText(result.fullText);
    setReadingError(result.error);
    setReadingLoading(false);
  }, [version]);

  const handleCompleteDay = useCallback(() => {
    if (!plan || !selectedDay) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completePlanDay(plan.id, selectedDay.day);
    setView('dayList');
    setSelectedDay(null);
    setSections([]);
    setShowAudio(false);
  }, [plan, selectedDay, completePlanDay]);

  const handleBackFromReading = useCallback(() => {
    setView('dayList');
    setSelectedDay(null);
    setSections([]);
    setShowAudio(false);
  }, []);

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

  // ─── Reading View ──────────────────────────
  if (view === 'reading' && selectedDay) {
    const isDone = isPlanDayCompleted(plan.id, selectedDay.day);

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={handleBackFromReading} style={styles.backBtn}>
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            Dia {selectedDay.day} — {selectedDay.title}
          </Text>
          {!readingLoading && sections.length > 0 ? (
            <TouchableOpacity onPress={() => setShowAudio(!showAudio)} style={styles.audioBtn}>
              <Volume2 size={20} color="#C5943A" />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerSpacer} />
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.readingContent}>
          {/* Audio player */}
          {showAudio && fullText && (
            <AudioPlayerBar
              text={fullText}
              title={selectedDay.reading}
              onClose={() => setShowAudio(false)}
            />
          )}

          {/* Reading reference badge */}
          <View style={[styles.readingRefBadge, { backgroundColor: 'rgba(197, 148, 58, 0.12)' }]}>
            <Text style={styles.readingRefText}>{selectedDay.reading}</Text>
          </View>

          {/* Reflection card */}
          <View style={[styles.reflectionCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <Text style={[styles.reflectionText, { color: colors.textSecondary }]}>
              {selectedDay.reflection}
            </Text>
          </View>

          {readingLoading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#C5943A" />
              <Text style={[styles.loadingText, { color: colors.textMuted }]}>Carregando versículos...</Text>
            </View>
          ) : readingError ? (
            <View style={styles.center}>
              <Text style={[styles.errorText, { color: colors.error || '#DC2626' }]}>{readingError}</Text>
            </View>
          ) : (
            <>
              {sections.map((section, idx) => (
                <View key={`section-${idx}`}>
                  {/* Section separator (if multiple sections) */}
                  {sections.length > 1 && (
                    <View style={styles.sectionSeparator}>
                      <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
                      <Text style={styles.sectionLabel}>{section.label}</Text>
                      <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
                    </View>
                  )}
                  {/* Verses */}
                  {section.verses.map(v => (
                    <Text key={`${idx}-${v.verse}`} style={[styles.verseText, { color: colors.textSecondary }]}>
                      <Text style={styles.verseNumber}>{v.verse} </Text>
                      {v.text}
                    </Text>
                  ))}
                </View>
              ))}
            </>
          )}

          {/* Key verse box */}
          {!readingLoading && (
            <View style={[styles.verseBox, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.verseBoxText, { color: colors.text }]}>"{selectedDay.verse}"</Text>
              <Text style={[styles.verseBoxRef, { color: colors.primary }]}>{selectedDay.verseRef}</Text>
            </View>
          )}

          {/* Complete button */}
          {!readingLoading && (
            <TouchableOpacity
              style={[
                styles.completeBtn,
                isDone && styles.completeBtnDone,
              ]}
              onPress={handleCompleteDay}
              activeOpacity={0.8}
            >
              {isDone ? <CheckCircle size={20} color="#22C55E" /> : null}
              <Text style={[
                styles.completeBtnText,
                isDone && styles.completeBtnTextDone,
              ]}>
                {isDone ? 'Concluído!' : 'Marcar como Concluído'}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── Day List View ─────────────────────────
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

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Leituras Diárias</Text>

        {plan.days.map((day) => {
          const isComplete = isPlanDayCompleted(plan.id, day.day);
          return (
            <TouchableOpacity
              key={day.day}
              style={[
                styles.dayCard,
                {
                  backgroundColor: isComplete ? colors.primary + '08' : colors.card,
                  borderColor: isComplete ? colors.primary + '30' : colors.borderLight,
                },
              ]}
              onPress={() => handleSelectDay(day)}
              activeOpacity={0.7}
            >
              <View style={styles.dayLeft}>
                {isComplete ? (
                  <CheckCircle size={24} color={colors.primary} />
                ) : (
                  <Circle size={24} color={colors.textMuted} />
                )}
              </View>
              <View style={styles.dayInfo}>
                <View style={styles.dayTitleRow}>
                  <View style={[styles.dayBadge, { backgroundColor: isComplete ? colors.primary : colors.border }]}>
                    <Text style={[styles.dayBadgeNum, { color: isComplete ? '#FFF' : colors.textMuted }]}>
                      {day.day}
                    </Text>
                  </View>
                  <Text style={[styles.dayTitle, { color: colors.text }]} numberOfLines={1}>{day.title}</Text>
                </View>
                <Text style={[styles.dayReading, { color: colors.primary }]}>{day.reading}</Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>
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
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: 'transparent' },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700' as const, flex: 1, textAlign: 'center' as const },
  headerSpacer: { width: 30 },
  audioBtn: { padding: 6, borderRadius: 8, backgroundColor: 'rgba(197, 148, 58, 0.12)' },
  content: { padding: 20, paddingTop: 0, paddingBottom: 40 },

  // Hero card
  heroCard: { borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 24 },
  heroEmoji: { fontSize: 48, marginBottom: 10 },
  heroTitle: { fontSize: 22, fontWeight: '800' as const, color: '#FFF', textAlign: 'center' as const, marginBottom: 6 },
  heroDesc: { fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center' as const, lineHeight: 20, marginBottom: 16 },
  heroProgress: { width: '100%', gap: 6 },
  progressBarOuter: { height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, overflow: 'hidden' as const },
  progressBarFill: { height: '100%' as const, backgroundColor: '#FFF', borderRadius: 3 },
  progressLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)', textAlign: 'center' as const, fontWeight: '600' as const },

  // Section title
  sectionTitle: { fontSize: 20, fontWeight: '700' as const, marginBottom: 14, paddingHorizontal: 20, paddingTop: 4 },

  // Day card (list view)
  dayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    marginHorizontal: 20,
    gap: 14,
  },
  dayLeft: { paddingTop: 2 },
  dayInfo: { flex: 1 },
  dayTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  dayBadge: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  dayBadgeNum: { fontSize: 13, fontWeight: '800' as const },
  dayTitle: { fontSize: 15, fontWeight: '700' as const, flex: 1 },
  dayReading: { fontSize: 13, fontWeight: '600' as const, marginLeft: 38 },

  // Reading view
  readingContent: { padding: 20, paddingBottom: 60 },
  readingRefBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 14,
  },
  readingRefText: { color: '#C5943A', fontSize: 14, fontWeight: '700' as const },
  reflectionCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  reflectionText: { fontSize: 15, lineHeight: 22, fontStyle: 'italic' },

  // Sections
  sectionSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 20,
  },
  separatorLine: { flex: 1, height: 1 },
  sectionLabel: { fontSize: 15, fontWeight: '700' as const, color: '#C5943A' },

  // Verses
  verseText: {
    fontSize: 17,
    lineHeight: 30,
    marginBottom: 4,
  },
  verseNumber: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#C5943A',
  },

  // Key verse box
  verseBox: { borderRadius: 12, padding: 14, marginTop: 24, marginBottom: 14 },
  verseBoxText: { fontSize: 14, fontStyle: 'italic' as const, lineHeight: 22, marginBottom: 6 },
  verseBoxRef: { fontSize: 13, fontWeight: '700' as const },

  // Complete button
  completeBtn: {
    backgroundColor: '#C5943A',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  completeBtnDone: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
  },
  completeBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  completeBtnTextDone: {
    color: '#22C55E',
  },

  // States
  center: { alignItems: 'center', paddingTop: 60 },
  loadingText: { marginTop: 12, fontSize: 14 },
  errorText: { fontSize: 14, textAlign: 'center' as const },
});
