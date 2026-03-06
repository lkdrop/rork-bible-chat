import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { ChevronRight, ChevronLeft, CheckCircle2, BookOpen, Heart, Target, Lock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { devotionalPlans, DevotionalPlan, DevotionalDay } from '@/constants/devotionalGuide';
import { usePrayerGuide } from '@/contexts/PrayerGuideContext';

type Phase = 'plans' | 'overview' | 'reading';

export default function DevotionalScreen() {
  const { completeDevotionalDay, isDevotionalDayCompleted } = usePrayerGuide();
  const [phase, setPhase] = useState<Phase>('plans');
  const [selectedPlan, setSelectedPlan] = useState<DevotionalPlan | null>(null);
  const [selectedDay, setSelectedDay] = useState<DevotionalDay | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateTransition = useCallback((callback: () => void) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      callback();
      slideAnim.setValue(30);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
    });
  }, [fadeAnim, slideAnim]);

  const handleSelectPlan = useCallback((plan: DevotionalPlan) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animateTransition(() => {
      setSelectedPlan(plan);
      setPhase('overview');
    });
  }, [animateTransition]);

  const handleSelectDay = useCallback((day: DevotionalDay) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animateTransition(() => {
      setSelectedDay(day);
      setPhase('reading');
    });
  }, [animateTransition]);

  const handleBack = useCallback(() => {
    animateTransition(() => {
      if (phase === 'reading') {
        setSelectedDay(null);
        setPhase('overview');
      } else {
        setSelectedPlan(null);
        setPhase('plans');
      }
    });
  }, [phase, animateTransition]);

  const handleCompleteDay = useCallback(() => {
    if (!selectedPlan || !selectedDay) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    void completeDevotionalDay(selectedPlan.id, selectedDay.day);
  }, [selectedPlan, selectedDay, completeDevotionalDay]);

  const getCompletedDaysCount = useCallback((planId: string, totalDays: number) => {
    let count = 0;
    for (let i = 1; i <= totalDays; i++) {
      if (isDevotionalDayCompleted(planId, i)) count++;
    }
    return count;
  }, [isDevotionalDayCompleted]);

  if (phase === 'plans') {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: 'Devocionais' }} />
        <SafeAreaView style={styles.container} edges={[]}>
          <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <ScrollView contentContainerStyle={styles.plansContainer} showsVerticalScrollIndicator={false}>
              <View style={styles.plansHeader}>
                <Text style={styles.plansHeaderEmoji}>📚</Text>
                <Text style={styles.plansTitle}>Guias Devocionais</Text>
                <Text style={styles.plansSubtitle}>
                  Planos de 7 dias para fortalecer sua caminhada com Deus
                </Text>
              </View>

              {devotionalPlans.map(plan => {
                const completedDays = getCompletedDaysCount(plan.id, plan.days.length);
                const progressPct = Math.round((completedDays / plan.days.length) * 100);

                return (
                  <TouchableOpacity
                    key={plan.id}
                    style={styles.planCard}
                    onPress={() => handleSelectPlan(plan)}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.planCardAccent, { backgroundColor: plan.color }]} />
                    <View style={styles.planCardContent}>
                      <Text style={styles.planEmoji}>{plan.emoji}</Text>
                      <View style={styles.planInfo}>
                        <Text style={styles.planTitle}>{plan.title}</Text>
                        <Text style={styles.planDesc}>{plan.description}</Text>
                        <View style={styles.planProgress}>
                          <View style={styles.planProgressBarBg}>
                            <View style={[styles.planProgressBarFill, { width: `${progressPct}%`, backgroundColor: plan.color }]} />
                          </View>
                          <Text style={styles.planProgressText}>{completedDays}/{plan.days.length} dias</Text>
                        </View>
                      </View>
                      <ChevronRight size={20} color={Colors.text.muted} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Animated.View>
        </SafeAreaView>
      </>
    );
  }

  if (phase === 'overview' && selectedPlan) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: selectedPlan.title }} />
        <SafeAreaView style={styles.container} edges={[]}>
          <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <ScrollView contentContainerStyle={styles.overviewContainer} showsVerticalScrollIndicator={false}>
              <TouchableOpacity style={styles.backRow} onPress={handleBack} activeOpacity={0.7}>
                <ChevronLeft size={20} color={Colors.primary.navy} />
                <Text style={styles.backText}>Voltar</Text>
              </TouchableOpacity>

              <View style={styles.overviewHeader}>
                <View style={[styles.overviewBadge, { backgroundColor: `${selectedPlan.color}18` }]}>
                  <Text style={styles.overviewEmoji}>{selectedPlan.emoji}</Text>
                </View>
                <Text style={styles.overviewTitle}>{selectedPlan.title}</Text>
                <Text style={styles.overviewDesc}>{selectedPlan.description}</Text>
              </View>

              <View style={styles.daysTimeline}>
                {selectedPlan.days.map((day, index) => {
                  const isCompleted = isDevotionalDayCompleted(selectedPlan.id, day.day);
                  const prevCompleted = index === 0 || isDevotionalDayCompleted(selectedPlan.id, selectedPlan.days[index - 1].day);
                  const isLocked = index > 0 && !prevCompleted && !isCompleted;

                  return (
                    <TouchableOpacity
                      key={day.day}
                      style={[
                        styles.dayCard,
                        isCompleted && styles.dayCardCompleted,
                        isLocked && styles.dayCardLocked,
                      ]}
                      onPress={() => !isLocked && handleSelectDay(day)}
                      activeOpacity={isLocked ? 1 : 0.8}
                      disabled={isLocked}
                    >
                      <View style={styles.dayCardLeft}>
                        <View style={[
                          styles.dayNumber,
                          isCompleted && styles.dayNumberCompleted,
                          isLocked && styles.dayNumberLocked,
                        ]}>
                          {isCompleted ? (
                            <CheckCircle2 size={20} color="#fff" />
                          ) : isLocked ? (
                            <Lock size={16} color={Colors.text.muted} />
                          ) : (
                            <Text style={styles.dayNumberText}>{day.day}</Text>
                          )}
                        </View>
                        {index < selectedPlan.days.length - 1 && (
                          <View style={[
                            styles.dayLine,
                            isCompleted && styles.dayLineCompleted,
                          ]} />
                        )}
                      </View>
                      <View style={styles.dayCardContent}>
                        <Text style={styles.dayCardEmoji}>{day.emoji}</Text>
                        <View style={styles.dayCardInfo}>
                          <Text style={[styles.dayCardTitle, isLocked && styles.dayCardTitleLocked]}>
                            {day.title}
                          </Text>
                          <Text style={styles.dayCardTheme}>{day.theme}</Text>
                        </View>
                        {!isLocked && <ChevronRight size={18} color={Colors.text.muted} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </Animated.View>
        </SafeAreaView>
      </>
    );
  }

  if (phase === 'reading' && selectedDay && selectedPlan) {
    const isDayCompleted = isDevotionalDayCompleted(selectedPlan.id, selectedDay.day);

    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: `Dia ${selectedDay.day}` }} />
        <SafeAreaView style={styles.container} edges={[]}>
          <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <ScrollView contentContainerStyle={styles.readingContainer} showsVerticalScrollIndicator={false}>
              <TouchableOpacity style={styles.backRow} onPress={handleBack} activeOpacity={0.7}>
                <ChevronLeft size={20} color={Colors.primary.navy} />
                <Text style={styles.backText}>Voltar</Text>
              </TouchableOpacity>

              <View style={styles.readingHeader}>
                <Text style={styles.readingEmoji}>{selectedDay.emoji}</Text>
                <Text style={styles.readingDayLabel}>DIA {selectedDay.day}</Text>
                <Text style={styles.readingTitle}>{selectedDay.title}</Text>
                <Text style={styles.readingTheme}>{selectedDay.theme}</Text>
              </View>

              <View style={styles.verseCard}>
                <BookOpen size={18} color={Colors.accent.gold} />
                <Text style={styles.verseCardText}>"{selectedDay.verse}"</Text>
                <Text style={styles.verseCardRef}>{selectedDay.verseRef}</Text>
              </View>

              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <BookOpen size={16} color={Colors.primary.navy} />
                  <Text style={styles.sectionTitle}>Leitura</Text>
                </View>
                <Text style={styles.sectionText}>{selectedDay.reading}</Text>
              </View>

              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Heart size={16} color="#e74c3c" />
                  <Text style={styles.sectionTitle}>Reflexão</Text>
                </View>
                <Text style={styles.sectionText}>{selectedDay.reflection}</Text>
              </View>

              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <View style={styles.prayerIcon}>
                    <Text style={styles.prayerIconText}>🙏</Text>
                  </View>
                  <Text style={styles.sectionTitle}>Oração</Text>
                </View>
                <Text style={styles.sectionText}>{selectedDay.prayer}</Text>
              </View>

              <View style={[styles.sectionCard, styles.challengeCard]}>
                <View style={styles.sectionHeader}>
                  <Target size={16} color="#e67e22" />
                  <Text style={styles.sectionTitle}>Desafio do Dia</Text>
                </View>
                <Text style={styles.sectionText}>{selectedDay.challenge}</Text>
              </View>

              {isDayCompleted ? (
                <View style={styles.completedBanner}>
                  <CheckCircle2 size={20} color="#27ae60" />
                  <Text style={styles.completedBannerText}>Dia concluído!</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={handleCompleteDay}
                  activeOpacity={0.85}
                >
                  <CheckCircle2 size={20} color={Colors.text.light} />
                  <Text style={styles.completeButtonText}>Concluir Dia {selectedDay.day}</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </Animated.View>
        </SafeAreaView>
      </>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.cream,
  },
  plansContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  plansHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  plansHeaderEmoji: {
    fontSize: 52,
    marginBottom: 10,
  },
  plansTitle: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: Colors.primary.navy,
    marginBottom: 6,
  },
  plansSubtitle: {
    fontSize: 15,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  planCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 18,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  planCardAccent: {
    height: 4,
  },
  planCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  planEmoji: {
    fontSize: 36,
    marginRight: 14,
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.primary.navy,
    marginBottom: 3,
  },
  planDesc: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 19,
    marginBottom: 10,
  },
  planProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  planProgressBarBg: {
    flex: 1,
    height: 5,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  planProgressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  planProgressText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text.muted,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  backText: {
    fontSize: 15,
    color: Colors.primary.navy,
    fontWeight: '500' as const,
  },
  overviewContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  overviewHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  overviewBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  overviewEmoji: {
    fontSize: 40,
  },
  overviewTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.primary.navy,
    textAlign: 'center',
    marginBottom: 6,
  },
  overviewDesc: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 21,
  },
  daysTimeline: {
    gap: 0,
  },
  dayCard: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  dayCardCompleted: {},
  dayCardLocked: {
    opacity: 0.5,
  },
  dayCardLeft: {
    alignItems: 'center',
    width: 44,
    marginRight: 12,
  },
  dayNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.accent.gold,
    zIndex: 2,
  },
  dayNumberCompleted: {
    backgroundColor: '#27ae60',
    borderColor: '#27ae60',
  },
  dayNumberLocked: {
    backgroundColor: Colors.background.creamDark,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  dayNumberText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.primary.navy,
  },
  dayLine: {
    width: 2,
    flex: 1,
    minHeight: 40,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginTop: -2,
    zIndex: 1,
  },
  dayLineCompleted: {
    backgroundColor: '#27ae60',
  },
  dayCardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  dayCardEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  dayCardInfo: {
    flex: 1,
  },
  dayCardTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  dayCardTitleLocked: {
    color: Colors.text.muted,
  },
  dayCardTheme: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  readingContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  readingHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  readingEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  readingDayLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.accent.gold,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    marginBottom: 6,
  },
  readingTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.primary.navy,
    textAlign: 'center',
    marginBottom: 4,
  },
  readingTheme: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  verseCard: {
    backgroundColor: Colors.primary.navy,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  verseCardText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: Colors.text.light,
    textAlign: 'center',
    lineHeight: 26,
    marginTop: 10,
    marginBottom: 8,
  },
  verseCardRef: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.accent.gold,
  },
  sectionCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  challengeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#e67e22',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.primary.navy,
  },
  sectionText: {
    fontSize: 15,
    color: Colors.text.primary,
    lineHeight: 24,
  },
  prayerIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prayerIconText: {
    fontSize: 16,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#27ae60',
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
    shadowColor: '#27ae60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  completeButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text.light,
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#27ae6015',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#27ae6030',
  },
  completedBannerText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#27ae60',
  },
});
