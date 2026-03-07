import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Share,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Flame,
  Share2,
  Lock,
  BookOpen,
  Sunrise,
  Sword,
  Target,
  Sparkles,
  Clock,
  Calendar,
  Moon,
  Sun,
  CloudSun,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { journeyDays, journeyWeeks } from '@/constants/journeyData';
import { generateText } from '@/services/gemini';
import { shareContent } from '@/utils';

function getTimeOfDay(): { label: string; emoji: string; greeting: string } {
  const hour = new Date().getHours();
  if (hour >= 3 && hour < 6) return { label: 'madrugada', emoji: '🌙', greeting: 'Vigília da madrugada' };
  if (hour >= 6 && hour < 12) return { label: 'manhã', emoji: '🌅', greeting: 'Bom dia, guerreiro(a)' };
  if (hour >= 12 && hour < 18) return { label: 'tarde', emoji: '☀️', greeting: 'Boa tarde, servo(a)' };
  return { label: 'noite', emoji: '🌙', greeting: 'Boa noite, filho(a) de Deus' };
}

function getDayOfWeekPT(): string {
  const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  return days[new Date().getDay()];
}

function getWeekForDay(day: number): number {
  return Math.floor((day - 1) / 7) + 1;
}

export default function JourneyScreen() {
  const router = useRouter();
  const { state, colors, completeJourneyDay, isJourneyDayCompleted } = useApp();
  const [isLoadingScreen, setIsLoadingScreen] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [personalizedPrayer, setPersonalizedPrayer] = useState<string>('');
  const [isGeneratingPrayer, setIsGeneratingPrayer] = useState(false);
  const [viewingDay, setViewingDay] = useState<number | null>(null);

  const loadingFade = useRef(new Animated.Value(1)).current;
  const loadingScale = useRef(new Animated.Value(0.8)).current;
  const loadingFlame = useRef(new Animated.Value(0)).current;
  const loadingText = useRef(new Animated.Value(0)).current;
  const loadingProgress = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(50)).current;
  const modalFade = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const journey = state.journey;
  const completedCount = journey.completedDays.length;
  const progressPercent = Math.round((completedCount / 28) * 100);
  const currentWeek = getWeekForDay(journey.currentDay);
  const timeInfo = getTimeOfDay();
  const dayOfWeek = getDayOfWeekPT();

  const currentDayData = journeyDays.find(d => d.day === (viewingDay ?? journey.currentDay)) ?? journeyDays[0];
  const currentWeekData = journeyWeeks.find(w => w.week === getWeekForDay(currentDayData.day));
  const isCurrentDayCompleted = isJourneyDayCompleted(currentDayData.day);
  const canViewDay = currentDayData.day <= journey.currentDay + 1;

  useEffect(() => {
    if (!journey.isActive) {
      setIsLoadingScreen(false);
      return;
    }

    Animated.sequence([
      Animated.parallel([
        Animated.spring(loadingScale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
        Animated.timing(loadingFlame, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.timing(loadingText, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(loadingProgress, { toValue: 1, duration: 800, useNativeDriver: false }),
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(loadingFade, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start(() => {
      setIsLoadingScreen(false);
      Animated.parallel([
        Animated.timing(contentFade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(cardSlide, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
      ]).start();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journey.isActive]);

  useEffect(() => {
    if (!journey.isActive) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journey.isActive]);

  const generatePersonalizedPrayer = useCallback(async (dayData: typeof journeyDays[0]) => {
    setIsGeneratingPrayer(true);
    try {
      const now = new Date();
      const hour = now.getHours();
      const weekData = journeyWeeks.find(w => w.week === getWeekForDay(dayData.day));

      const prompt = `Você é um líder espiritual poderoso e profético. Gere uma oração FORTE e PERSONALIZADA em português brasileiro.

Contexto:
- Dia da jornada: ${dayData.day}/28
- Semana: ${weekData?.title ?? ''} (${weekData?.theme ?? ''})
- Tema do dia: ${dayData.theme}
- Dia da semana: ${getDayOfWeekPT()}
- Horário atual: ${hour}h
- Período: ${hour >= 3 && hour < 6 ? 'MADRUGADA - hora da vigília' : hour >= 6 && hour < 12 ? 'MANHÃ - início de batalha' : hour >= 12 && hour < 18 ? 'TARDE - perseverança' : 'NOITE - entrega e descanso em Deus'}

Gere uma oração profética FORTE de 4-6 linhas que:
- Seja ESPECÍFICA para este momento do dia e dia da semana
- Use linguagem de AUTORIDADE espiritual
- Inclua declarações proféticas poderosas
- Mencione o tema da semana naturalmente
- Seja emocionalmente impactante e transformadora
- NÃO use saudações, apenas a oração direta

Apenas a oração, sem títulos ou explicações.`;

      const prayer = await generateText(prompt);
      setPersonalizedPrayer(prayer);
    } catch {
      setPersonalizedPrayer(
        'Senhor, eu Te agradeço por mais este dia concluído na Tua presença. Que cada palavra lida, cada oração feita, seja semente plantada em terra fértil. Fortalece-me para o próximo passo desta jornada. Em nome de Jesus, amém.'
      );
    } finally {
      setIsGeneratingPrayer(false);
    }
  }, []);

  const handleCompleteDay = useCallback(async (day: number) => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completeJourneyDay(day);

    setShowCompletionModal(true);
    Animated.parallel([
      Animated.timing(modalFade, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(modalScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
    ]).start();

    const dayData = journeyDays.find(d => d.day === day);
    if (dayData) {
      await generatePersonalizedPrayer(dayData);
    }
  }, [completeJourneyDay, generatePersonalizedPrayer, modalFade, modalScale]);

  const closeCompletionModal = useCallback(() => {
    Animated.parallel([
      Animated.timing(modalFade, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(modalScale, { toValue: 0.9, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setShowCompletionModal(false);
      setPersonalizedPrayer('');
      modalScale.setValue(0.9);
    });
  }, [modalFade, modalScale]);

  const handleShareDay = useCallback(async (dayData: typeof journeyDays[0]) => {
    await shareContent(`🔥 Jornada 28 Dias — ${dayData.title}\n\n🌅 Oração:\n${dayData.morningPrayer}\n\n📖 ${dayData.bibleReading}\n\n⚡ Declaração Profética:\n${dayData.propheticDeclaration}\n\nBíblia IA`);
  }, []);

  const navigateDay = useCallback((direction: 'prev' | 'next') => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const current = viewingDay ?? journey.currentDay;
    const target = direction === 'next' ? current + 1 : current - 1;
    if (target >= 1 && target <= 28 && target <= journey.currentDay + 1) {
      setViewingDay(target);
    }
  }, [viewingDay, journey.currentDay]);

  const goToCurrentDay = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setViewingDay(null);
  }, []);

  if (!journey.isActive) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🔥</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Jornada de 28 Dias</Text>
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

  if (isLoadingScreen) {
    return (
      <Animated.View style={[styles.loadingContainer, { opacity: loadingFade }]}>
        <SafeAreaView style={styles.loadingSafe} edges={['top']}>
          <View style={styles.loadingContent}>
            <Animated.View style={[styles.loadingFlameWrap, { opacity: loadingFlame, transform: [{ scale: loadingScale }] }]}>
              <View style={styles.loadingFlameCircle}>
                <Flame size={52} color="#FF6B35" fill="#FF6B35" />
              </View>
            </Animated.View>

            <Animated.View style={{ opacity: loadingText }}>
              <Text style={styles.loadingTitle}>Preparando sua oração...</Text>
              <Text style={styles.loadingSubtitle}>{timeInfo.greeting}</Text>
              <Text style={styles.loadingDay}>{dayOfWeek} • Dia {journey.currentDay}/28</Text>
            </Animated.View>

            <Animated.View style={[styles.loadingBarContainer, { opacity: loadingText }]}>
              <Animated.View
                style={[
                  styles.loadingBarFill,
                  {
                    width: loadingProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </Animated.View>

            <Animated.View style={{ opacity: loadingText }}>
              <Text style={styles.loadingVerse}>
                {"\"Buscar-me-eis e me achareis quando me buscardes de todo o vosso coração.\""}
              </Text>
              <Text style={styles.loadingVerseRef}>— Jeremias 29:13</Text>
            </Animated.View>
          </View>
        </SafeAreaView>
      </Animated.View>
    );
  }

  const displayDay = viewingDay ?? journey.currentDay;
  const isViewingPast = viewingDay !== null && viewingDay !== journey.currentDay;
  const canGoPrev = displayDay > 1;
  const canGoNext = displayDay < journey.currentDay + 1 && displayDay < 28;

  const TimeIcon = timeInfo.label === 'madrugada' || timeInfo.label === 'noite' ? Moon : timeInfo.label === 'manhã' ? Sun : CloudSun;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Jornada 28 Dias</Text>
          <View style={styles.headerMeta}>
            <TimeIcon size={12} color={colors.textMuted} />
            <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
              {dayOfWeek} • {timeInfo.greeting}
            </Text>
          </View>
        </View>
        <View style={[styles.streakMini, { backgroundColor: '#FF6B35' + '18' }]}>
          <Flame size={16} color="#FF6B35" fill="#FF6B35" />
          <Text style={styles.streakMiniText}>{completedCount}</Text>
        </View>
      </View>

      <Animated.View style={{ flex: 1, opacity: contentFade, transform: [{ translateY: cardSlide }] }}>
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
                <Text style={[styles.progressStatText, { color: colors.textSecondary }]}>{completedCount} orações</Text>
              </View>
              <View style={styles.progressStat}>
                <Calendar size={14} color="#3B82F6" />
                <Text style={[styles.progressStatText, { color: colors.textSecondary }]}>Semana {currentWeek}/13</Text>
              </View>
              <View style={styles.progressStat}>
                <BookOpen size={14} color="#10B981" />
                <Text style={[styles.progressStatText, { color: colors.textSecondary }]}>{28 - completedCount} restantes</Text>
              </View>
            </View>
          </View>

          {currentWeekData && (
            <View style={[styles.weekBanner, { backgroundColor: '#FF6B35' + '10', borderColor: '#FF6B35' + '25' }]}>
              <Text style={styles.weekBannerEmoji}>{currentWeekData.emoji}</Text>
              <View style={styles.weekBannerInfo}>
                <Text style={[styles.weekBannerTitle, { color: colors.text }]}>
                  Semana {currentWeekData.week}: {currentWeekData.title}
                </Text>
                <Text style={[styles.weekBannerTheme, { color: colors.textMuted }]}>{currentWeekData.theme}</Text>
              </View>
            </View>
          )}

          <View style={styles.dayNavigation}>
            <TouchableOpacity
              onPress={() => navigateDay('prev')}
              style={[styles.navArrow, { opacity: canGoPrev ? 1 : 0.3 }]}
              disabled={!canGoPrev}
            >
              <ChevronLeft size={24} color={colors.text} />
            </TouchableOpacity>

            <View style={styles.dayNavCenter}>
              <Text style={[styles.dayNavTitle, { color: '#FF6B35' }]}>DIA {currentDayData.day}</Text>
              {isViewingPast && (
                <TouchableOpacity onPress={goToCurrentDay}>
                  <Text style={styles.goToCurrentText}>Ir para dia atual →</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              onPress={() => navigateDay('next')}
              style={[styles.navArrow, { opacity: canGoNext ? 1 : 0.3 }]}
              disabled={!canGoNext}
            >
              {canGoNext && displayDay + 1 > journey.currentDay ? (
                <Lock size={18} color={colors.textMuted} />
              ) : (
                <ChevronRight size={24} color={colors.text} />
              )}
            </TouchableOpacity>
          </View>

          {!canViewDay ? (
            <View style={[styles.lockedCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              <Lock size={32} color={colors.textMuted} />
              <Text style={[styles.lockedTitle, { color: colors.textMuted }]}>Dia Bloqueado</Text>
              <Text style={[styles.lockedSubtitle, { color: colors.textMuted }]}>
                Conclua o dia anterior para desbloquear
              </Text>
            </View>
          ) : (
            <Animated.View style={{ transform: [{ scale: !isCurrentDayCompleted ? pulseAnim : 1 }] }}>
              <View style={[styles.prayerCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
                <View style={styles.prayerHeader}>
                  <Text style={[styles.prayerDayTitle, { color: colors.text }]}>{currentDayData.title}</Text>
                  <Text style={[styles.prayerTheme, { color: colors.textMuted }]}>{currentDayData.theme}</Text>
                </View>

                <View style={styles.prayerDivider} />

                <View style={styles.prayerSection}>
                  <View style={[styles.sectionIcon, { backgroundColor: '#FF6B35' + '15' }]}>
                    <Sunrise size={18} color="#FF6B35" />
                  </View>
                  <View style={styles.sectionContent}>
                    <Text style={[styles.sectionLabel, { color: '#FF6B35' }]}>Oração Profética</Text>
                    <Text style={[styles.sectionText, { color: colors.text }]}>{currentDayData.morningPrayer}</Text>
                  </View>
                </View>

                <View style={styles.prayerSection}>
                  <View style={[styles.sectionIcon, { backgroundColor: '#3B82F6' + '15' }]}>
                    <BookOpen size={18} color="#3B82F6" />
                  </View>
                  <View style={styles.sectionContent}>
                    <Text style={[styles.sectionLabel, { color: '#3B82F6' }]}>Leitura Bíblica</Text>
                    <Text style={[styles.sectionText, { color: colors.text }]}>{currentDayData.bibleReading}</Text>
                    <Text style={[styles.sectionRef, { color: colors.textMuted }]}>{currentDayData.bibleReference}</Text>
                  </View>
                </View>

                <View style={styles.prayerSection}>
                  <View style={[styles.sectionIcon, { backgroundColor: '#C5943A' + '15' }]}>
                    <Sparkles size={18} color="#C5943A" />
                  </View>
                  <View style={styles.sectionContent}>
                    <Text style={[styles.sectionLabel, { color: '#C5943A' }]}>Reflexão</Text>
                    <Text style={[styles.sectionText, { color: colors.text }]}>{currentDayData.reflection}</Text>
                  </View>
                </View>

                <View style={styles.prayerSection}>
                  <View style={[styles.sectionIcon, { backgroundColor: '#10B981' + '15' }]}>
                    <Target size={18} color="#10B981" />
                  </View>
                  <View style={styles.sectionContent}>
                    <Text style={[styles.sectionLabel, { color: '#10B981' }]}>Ação Prática</Text>
                    <Text style={[styles.sectionText, { color: colors.text }]}>{currentDayData.practicalAction}</Text>
                  </View>
                </View>

                <View style={[styles.declarationCard, { backgroundColor: '#FF6B35' + '10', borderColor: '#FF6B35' + '25' }]}>
                  <Sword size={20} color="#FF6B35" />
                  <View style={styles.declarationContent}>
                    <Text style={[styles.declarationLabel, { color: '#FF6B35' }]}>Declaração Profética</Text>
                    <Text style={[styles.declarationText, { color: colors.text }]}>{currentDayData.propheticDeclaration}</Text>
                  </View>
                </View>

                <View style={styles.dayActions}>
                  {!isCurrentDayCompleted ? (
                    <TouchableOpacity
                      style={styles.completeBtn}
                      onPress={() => void handleCompleteDay(currentDayData.day)}
                      activeOpacity={0.8}
                    >
                      <Check size={18} color="#FFF" />
                      <Text style={styles.completeBtnText}>CONCLUIR DIA {currentDayData.day}</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.completedBadge}>
                      <Check size={16} color="#10B981" />
                      <Text style={styles.completedBadgeText}>Dia concluído!</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={[styles.shareBtn, { borderColor: colors.border }]}
                    onPress={() => void handleShareDay(currentDayData)}
                    activeOpacity={0.7}
                  >
                    <Share2 size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          )}

          <View style={[styles.weekProgress, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <Text style={[styles.weekProgressTitle, { color: colors.text }]}>Esta Semana</Text>
            <View style={styles.weekDots}>
              {Array.from({ length: 7 }, (_, i) => {
                const dayNum = (getWeekForDay(displayDay) - 1) * 7 + i + 1;
                const completed = journey.completedDays.includes(dayNum);
                const isCurrent = dayNum === journey.currentDay;
                const isViewing = dayNum === displayDay;
                return (
                  <TouchableOpacity
                    key={dayNum}
                    style={[
                      styles.weekDot,
                      completed && styles.weekDotCompleted,
                      isCurrent && !completed && styles.weekDotCurrent,
                      isViewing && styles.weekDotViewing,
                    ]}
                    onPress={() => {
                      if (dayNum <= journey.currentDay + 1) {
                        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setViewingDay(dayNum);
                      }
                    }}
                  >
                    {completed ? (
                      <Check size={12} color="#FFF" />
                    ) : (
                      <Text style={[
                        styles.weekDotText,
                        isCurrent && { color: '#FF6B35' },
                        !isCurrent && { color: colors.textMuted },
                      ]}>{dayNum}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>

      <Modal visible={showCompletionModal} transparent animationType="none">
        <Animated.View style={[styles.modalOverlay, { opacity: modalFade }]}>
          <Animated.View style={[styles.modalCard, { transform: [{ scale: modalScale }] }]}>
            <View style={styles.modalFlame}>
              <Flame size={44} color="#FF6B35" fill="#FF6B35" />
            </View>

            <Text style={styles.modalTitle}>🔥 DIA {currentDayData.day} CONCLUÍDO!</Text>
            <Text style={styles.modalSubtitle}>
              {completedCount} de 28 dias • {progressPercent}% da jornada
            </Text>

            <View style={styles.modalDivider} />

            <Text style={styles.modalPrayerLabel}>Oração personalizada para você agora:</Text>

            {isGeneratingPrayer ? (
              <View style={styles.modalLoadingPrayer}>
                <ActivityIndicator size="small" color="#FF6B35" />
                <Text style={styles.modalLoadingText}>O Espírito Santo está preparando uma palavra para você...</Text>
              </View>
            ) : (
              <View style={styles.modalPrayerBox}>
                <Text style={styles.modalPrayerText}>{personalizedPrayer}</Text>
              </View>
            )}

            <View style={styles.modalTimeBadge}>
              <Clock size={14} color="#FF6B35" />
              <Text style={styles.modalTimeText}>
                {dayOfWeek} • {new Date().getHours()}h{String(new Date().getMinutes()).padStart(2, '0')}
              </Text>
            </View>

            <TouchableOpacity style={styles.modalCloseBtn} onPress={closeCompletionModal} activeOpacity={0.8}>
              <Text style={styles.modalCloseBtnText}>AMÉM! CONTINUAR</Text>
            </TouchableOpacity>

            {personalizedPrayer ? (
              <TouchableOpacity
                style={styles.modalShareBtn}
                onPress={() => {
                  void Share.share({
                    message: `🔥 Dia ${currentDayData.day}/28 — Jornada Concluída!\n\n🙏 Oração:\n${personalizedPrayer}\n\nBíblia IA`,
                  });
                }}
              >
                <Share2 size={16} color="#999" />
                <Text style={styles.modalShareText}>Compartilhar oração</Text>
              </TouchableOpacity>
            ) : null}
          </Animated.View>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  loadingSafe: { flex: 1 },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingFlameWrap: { marginBottom: 32 },
  loadingFlameCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FF6B35' + '15',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6B35' + '30',
  },
  loadingTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    textAlign: 'center' as const,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#FF6B35',
    textAlign: 'center' as const,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  loadingDay: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center' as const,
    marginBottom: 32,
  },
  loadingBarContainer: {
    width: '80%' as const,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#222',
    overflow: 'hidden' as const,
    marginBottom: 40,
  },
  loadingBarFill: {
    height: '100%' as const,
    borderRadius: 2,
    backgroundColor: '#FF6B35',
  },
  loadingVerse: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center' as const,
    fontStyle: 'italic' as const,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  loadingVerseRef: {
    fontSize: 13,
    color: '#555',
    textAlign: 'center' as const,
    marginTop: 4,
  },
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
  headerMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  headerSubtitle: { fontSize: 11 },
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
    marginBottom: 14,
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
  progressStats: { flexDirection: 'row', gap: 16 },
  progressStat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  progressStatText: { fontSize: 11 },
  weekBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
    gap: 12,
  },
  weekBannerEmoji: { fontSize: 28 },
  weekBannerInfo: { flex: 1 },
  weekBannerTitle: { fontSize: 14, fontWeight: '700' as const },
  weekBannerTheme: { fontSize: 12, marginTop: 2 },
  dayNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  navArrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNavCenter: { alignItems: 'center' },
  dayNavTitle: { fontSize: 20, fontWeight: '900' as const, letterSpacing: 1 },
  goToCurrentText: { fontSize: 12, color: '#FF6B35', fontWeight: '600' as const, marginTop: 2 },
  lockedCard: {
    padding: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
  },
  lockedTitle: { fontSize: 16, fontWeight: '700' as const },
  lockedSubtitle: { fontSize: 13, textAlign: 'center' as const },
  prayerCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden' as const,
  },
  prayerHeader: {
    padding: 20,
    paddingBottom: 14,
  },
  prayerDayTitle: { fontSize: 20, fontWeight: '800' as const, letterSpacing: -0.3 },
  prayerTheme: { fontSize: 13, marginTop: 4 },
  prayerDivider: { height: 1, backgroundColor: '#FF6B35' + '15', marginHorizontal: 20 },
  prayerSection: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  sectionIcon: {
    width: 38,
    height: 38,
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
    marginHorizontal: 16,
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
    padding: 16,
    paddingTop: 14,
  },
  completeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  completeBtnText: { fontSize: 14, fontWeight: '800' as const, color: '#FFF', letterSpacing: 0.5 },
  completedBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981' + '15',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  completedBadgeText: { fontSize: 14, fontWeight: '700' as const, color: '#10B981' },
  shareBtn: {
    width: 50,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekProgress: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 14,
  },
  weekProgressTitle: { fontSize: 14, fontWeight: '700' as const, marginBottom: 14 },
  weekDots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#333',
  },
  weekDotCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  weekDotCurrent: {
    borderColor: '#FF6B35',
    borderWidth: 2,
  },
  weekDotViewing: {
    borderColor: '#FF6B35',
    borderWidth: 2.5,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  weekDotText: { fontSize: 11, fontWeight: '700' as const },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%' as const,
    backgroundColor: '#111',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B35' + '30',
  },
  modalFlame: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF6B35' + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900' as const,
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#222',
    width: '100%' as const,
    marginBottom: 16,
  },
  modalPrayerLabel: {
    fontSize: 13,
    color: '#FF6B35',
    fontWeight: '700' as const,
    letterSpacing: 0.3,
    marginBottom: 12,
    textAlign: 'center' as const,
  },
  modalLoadingPrayer: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 20,
  },
  modalLoadingText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center' as const,
    fontStyle: 'italic' as const,
    lineHeight: 20,
  },
  modalPrayerBox: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#FF6B35' + '20',
    width: '100%' as const,
  },
  modalPrayerText: {
    fontSize: 14,
    color: '#E0E0E0',
    lineHeight: 24,
    textAlign: 'center' as const,
  },
  modalTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    marginBottom: 20,
  },
  modalTimeText: {
    fontSize: 12,
    color: '#888',
  },
  modalCloseBtn: {
    width: '100%' as const,
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalCloseBtnText: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: '#FFF',
    letterSpacing: 0.5,
  },
  modalShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    paddingVertical: 8,
  },
  modalShareText: {
    fontSize: 13,
    color: '#666',
    textDecorationLine: 'underline' as const,
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
