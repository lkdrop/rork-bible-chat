import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Flame,
  Share2,
  Lock,
  BookOpen,
  Sunrise,
  Sword,
  Target,
  Sparkles,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { journeyDays, journeyWeeks } from '@/constants/journeyData';

export default function JourneyScreen() {
  const router = useRouter();
  const { state, colors, completeJourneyDay, isJourneyDayCompleted } = useApp();
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [expandedWeek, setExpandedWeek] = useState<number>(1);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;

  const journey = state.journey;
  const completedCount = journey.completedDays.length;
  const progressPercent = Math.round((completedCount / 90) * 100);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [fadeAnim]);

  useEffect(() => {
    if (journey.currentDay > 0) {
      const weekForDay = Math.floor((journey.currentDay - 1) / 7) + 1;
      setExpandedWeek(weekForDay);
    }
  }, [journey.currentDay]);

  const handleCompleteDay = useCallback((day: number) => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completeJourneyDay(day);
    Animated.sequence([
      Animated.timing(checkAnim, { toValue: 1.3, duration: 200, useNativeDriver: true }),
      Animated.spring(checkAnim, { toValue: 1, tension: 100, friction: 5, useNativeDriver: true }),
    ]).start();
  }, [completeJourneyDay, checkAnim]);

  const handleShareDay = useCallback(async (dayData: typeof journeyDays[0]) => {
    try {
      await Share.share({
        message: `🔥 Jornada 90 Dias — ${dayData.title}\n\n🌅 Oração:\n${dayData.morningPrayer}\n\n📖 ${dayData.bibleReading}\n\n⚡ Declaração Profética:\n${dayData.propheticDeclaration}\n\nBíblia IA`,
      });
    } catch (e) {
      console.log('Share error:', e);
    }
  }, []);

  const toggleDay = useCallback((day: number) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedDay(prev => prev === day ? null : day);
  }, []);

  const toggleWeek = useCallback((week: number) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedWeek(prev => prev === week ? 0 : week);
  }, []);

  if (!journey.isActive) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🔥</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Jornada de 90 Dias</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            Faça o quiz para descobrir sua jornada personalizada
          </Text>
          <TouchableOpacity
            style={styles.startQuizBtn}
            onPress={() => router.push('/study/journey-quiz' as never)}
            activeOpacity={0.8}
          >
            <Sparkles size={18} color="#0A0A0A" />
            <Text style={styles.startQuizText}>COMEÇAR QUIZ</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
            <Text style={[styles.backLinkText, { color: colors.textMuted }]}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Jornada 90 Dias</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            Dia {journey.currentDay} • {completedCount}/90 concluídos
          </Text>
        </View>
        <View style={[styles.streakMini, { backgroundColor: '#FF6B35' + '18' }]}>
          <Flame size={16} color="#FF6B35" fill="#FF6B35" />
          <Text style={styles.streakMiniText}>{completedCount}</Text>
        </View>
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <View style={styles.progressRow}>
              <Text style={[styles.progressLabel, { color: colors.textMuted }]}>Progresso Geral</Text>
              <Text style={[styles.progressPercent, { color: '#FF6B35' }]}>{progressPercent}%</Text>
            </View>
            <View style={[styles.mainProgressBar, { backgroundColor: colors.border }]}>
              <View style={[styles.mainProgressFill, { width: `${progressPercent}%` as `${number}%` }]} />
            </View>
            <View style={styles.progressStats}>
              <View style={styles.progressStat}>
                <Sunrise size={14} color="#FF6B35" />
                <Text style={[styles.progressStatText, { color: colors.textSecondary }]}>{completedCount} orações feitas</Text>
              </View>
              <View style={styles.progressStat}>
                <BookOpen size={14} color="#3B82F6" />
                <Text style={[styles.progressStatText, { color: colors.textSecondary }]}>{completedCount} leituras</Text>
              </View>
            </View>
          </View>

          {journeyWeeks.map((week) => {
            const weekDays = journeyDays.filter(d => d.week === week.week);
            const weekCompleted = weekDays.filter(d => journey.completedDays.includes(d.day)).length;
            const isWeekExpanded = expandedWeek === week.week;
            const isCurrentWeek = Math.floor((journey.currentDay - 1) / 7) + 1 === week.week;
            const isLocked = week.week > Math.floor((journey.currentDay - 1) / 7) + 2;

            return (
              <View key={week.week}>
                <TouchableOpacity
                  style={[
                    styles.weekHeader,
                    {
                      backgroundColor: isCurrentWeek ? '#FF6B35' + '10' : colors.card,
                      borderColor: isCurrentWeek ? '#FF6B35' + '30' : colors.borderLight,
                    },
                  ]}
                  onPress={() => !isLocked && toggleWeek(week.week)}
                  activeOpacity={isLocked ? 1 : 0.7}
                >
                  <View style={styles.weekHeaderLeft}>
                    <Text style={styles.weekEmoji}>{isLocked ? '🔒' : week.emoji}</Text>
                    <View style={styles.weekHeaderInfo}>
                      <Text style={[styles.weekTitle, { color: isLocked ? colors.textMuted : colors.text }]}>
                        Semana {week.week}: {week.title}
                      </Text>
                      <Text style={[styles.weekTheme, { color: colors.textMuted }]}>
                        {week.theme} • {weekCompleted}/7 dias
                      </Text>
                    </View>
                  </View>
                  {!isLocked && (
                    isWeekExpanded ? (
                      <ChevronUp size={18} color={colors.textMuted} />
                    ) : (
                      <ChevronDown size={18} color={colors.textMuted} />
                    )
                  )}
                  {isLocked && <Lock size={16} color={colors.textMuted} />}
                </TouchableOpacity>

                {isWeekExpanded && !isLocked && weekDays.map((dayData) => {
                  const isCompleted = isJourneyDayCompleted(dayData.day);
                  const isExpanded = expandedDay === dayData.day;
                  const isCurrent = dayData.day === journey.currentDay;
                  const isDayLocked = dayData.day > journey.currentDay + 1;

                  return (
                    <View key={dayData.day}>
                      <TouchableOpacity
                        style={[
                          styles.dayRow,
                          {
                            backgroundColor: isCurrent ? '#FF6B35' + '08' : 'transparent',
                            borderBottomColor: colors.borderLight,
                          },
                        ]}
                        onPress={() => !isDayLocked && toggleDay(dayData.day)}
                        activeOpacity={isDayLocked ? 1 : 0.7}
                      >
                        <View style={[
                          styles.dayCircle,
                          isCompleted ? styles.dayCircleCompleted : { borderColor: isDayLocked ? colors.border : isCurrent ? '#FF6B35' : colors.textMuted },
                        ]}>
                          {isCompleted ? (
                            <Check size={14} color="#FFF" />
                          ) : isDayLocked ? (
                            <Lock size={12} color={colors.textMuted} />
                          ) : (
                            <Text style={[styles.dayNumber, { color: isCurrent ? '#FF6B35' : colors.textMuted }]}>{dayData.day}</Text>
                          )}
                        </View>
                        <View style={styles.dayInfo}>
                          <Text style={[
                            styles.dayTitle,
                            { color: isDayLocked ? colors.textMuted : isCompleted ? colors.success : colors.text },
                          ]}>
                            {dayData.title}
                          </Text>
                          <Text style={[styles.dayTheme, { color: colors.textMuted }]}>{dayData.theme}</Text>
                        </View>
                        {!isDayLocked && (
                          isExpanded ? <ChevronUp size={16} color={colors.textMuted} /> : <ChevronDown size={16} color={colors.textMuted} />
                        )}
                      </TouchableOpacity>

                      {isExpanded && !isDayLocked && (
                        <View style={[styles.dayContent, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
                          <View style={styles.daySection}>
                            <View style={[styles.sectionIcon, { backgroundColor: '#FF6B35' + '15' }]}>
                              <Sunrise size={16} color="#FF6B35" />
                            </View>
                            <View style={styles.sectionContent}>
                              <Text style={[styles.sectionLabel, { color: '#FF6B35' }]}>Oração da Madrugada</Text>
                              <Text style={[styles.sectionText, { color: colors.text }]}>{dayData.morningPrayer}</Text>
                            </View>
                          </View>

                          <View style={styles.daySection}>
                            <View style={[styles.sectionIcon, { backgroundColor: '#3B82F6' + '15' }]}>
                              <BookOpen size={16} color="#3B82F6" />
                            </View>
                            <View style={styles.sectionContent}>
                              <Text style={[styles.sectionLabel, { color: '#3B82F6' }]}>Leitura Bíblica</Text>
                              <Text style={[styles.sectionText, { color: colors.text }]}>{dayData.bibleReading}</Text>
                              <Text style={[styles.sectionRef, { color: colors.textMuted }]}>{dayData.bibleReference}</Text>
                            </View>
                          </View>

                          <View style={styles.daySection}>
                            <View style={[styles.sectionIcon, { backgroundColor: '#8B5CF6' + '15' }]}>
                              <Sparkles size={16} color="#8B5CF6" />
                            </View>
                            <View style={styles.sectionContent}>
                              <Text style={[styles.sectionLabel, { color: '#8B5CF6' }]}>Reflexão</Text>
                              <Text style={[styles.sectionText, { color: colors.text }]}>{dayData.reflection}</Text>
                            </View>
                          </View>

                          <View style={styles.daySection}>
                            <View style={[styles.sectionIcon, { backgroundColor: '#10B981' + '15' }]}>
                              <Target size={16} color="#10B981" />
                            </View>
                            <View style={styles.sectionContent}>
                              <Text style={[styles.sectionLabel, { color: '#10B981' }]}>Ação Prática</Text>
                              <Text style={[styles.sectionText, { color: colors.text }]}>{dayData.practicalAction}</Text>
                            </View>
                          </View>

                          <View style={[styles.declarationCard, { backgroundColor: '#FF6B35' + '10', borderColor: '#FF6B35' + '25' }]}>
                            <Sword size={18} color="#FF6B35" />
                            <View style={styles.declarationContent}>
                              <Text style={[styles.declarationLabel, { color: '#FF6B35' }]}>Declaração Profética</Text>
                              <Text style={[styles.declarationText, { color: colors.text }]}>{dayData.propheticDeclaration}</Text>
                            </View>
                          </View>

                          <View style={styles.dayActions}>
                            {!isCompleted && (
                              <TouchableOpacity
                                style={styles.completeBtn}
                                onPress={() => handleCompleteDay(dayData.day)}
                                activeOpacity={0.8}
                              >
                                <Check size={18} color="#FFF" />
                                <Text style={styles.completeBtnText}>CONCLUIR DIA {dayData.day}</Text>
                              </TouchableOpacity>
                            )}
                            {isCompleted && (
                              <View style={styles.completedBadge}>
                                <Check size={16} color="#10B981" />
                                <Text style={styles.completedBadgeText}>Dia concluído!</Text>
                              </View>
                            )}
                            <TouchableOpacity
                              style={[styles.shareBtn, { borderColor: colors.border }]}
                              onPress={() => void handleShareDay(dayData)}
                              activeOpacity={0.7}
                            >
                              <Share2 size={16} color={colors.textMuted} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            );
          })}

          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  headerBackBtn: { padding: 4 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '700' as const },
  headerSubtitle: { fontSize: 12, marginTop: 2 },
  streakMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  streakMiniText: { fontSize: 14, fontWeight: '800' as const, color: '#FF6B35' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  progressCard: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressLabel: { fontSize: 14, fontWeight: '600' as const },
  progressPercent: { fontSize: 20, fontWeight: '800' as const },
  mainProgressBar: { height: 8, borderRadius: 4, overflow: 'hidden' as const, marginBottom: 14 },
  mainProgressFill: { height: '100%' as const, borderRadius: 4, backgroundColor: '#FF6B35' },
  progressStats: { flexDirection: 'row', gap: 20 },
  progressStat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  progressStatText: { fontSize: 12 },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 2,
  },
  weekHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  weekEmoji: { fontSize: 24 },
  weekHeaderInfo: { flex: 1 },
  weekTitle: { fontSize: 14, fontWeight: '700' as const },
  weekTheme: { fontSize: 11, marginTop: 2 },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    gap: 14,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCircleCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  dayNumber: { fontSize: 12, fontWeight: '700' as const },
  dayInfo: { flex: 1 },
  dayTitle: { fontSize: 14, fontWeight: '600' as const },
  dayTheme: { fontSize: 11, marginTop: 2 },
  dayContent: {
    margin: 8,
    marginTop: 0,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    gap: 18,
  },
  daySection: { flexDirection: 'row', gap: 12 },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  sectionContent: { flex: 1 },
  sectionLabel: { fontSize: 12, fontWeight: '700' as const, letterSpacing: 0.5, marginBottom: 4 },
  sectionText: { fontSize: 14, lineHeight: 22 },
  sectionRef: { fontSize: 12, marginTop: 4, fontStyle: 'italic' as const },
  declarationCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    alignItems: 'flex-start',
  },
  declarationContent: { flex: 1 },
  declarationLabel: { fontSize: 12, fontWeight: '700' as const, letterSpacing: 0.5, marginBottom: 4 },
  declarationText: { fontSize: 14, lineHeight: 22, fontWeight: '600' as const },
  dayActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  completeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  completeBtnText: { fontSize: 14, fontWeight: '800' as const, color: '#FFF', letterSpacing: 0.5 },
  completedBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981' + '15',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  completedBadgeText: { fontSize: 14, fontWeight: '700' as const, color: '#10B981' },
  shareBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 24, fontWeight: '800' as const, marginBottom: 8 },
  emptySubtitle: { fontSize: 15, textAlign: 'center' as const, lineHeight: 22, marginBottom: 28 },
  startQuizBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 14,
    gap: 10,
  },
  startQuizText: { fontSize: 15, fontWeight: '800' as const, color: '#0A0A0A', letterSpacing: 0.5 },
  backLink: { marginTop: 16, padding: 8 },
  backLinkText: { fontSize: 14, textDecorationLine: 'underline' as const },
});
