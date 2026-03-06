import React, { useCallback, useRef, useEffect, useMemo } from 'react';
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
import { CheckCircle2, Circle, Flame, Star, Target } from 'lucide-react-native';
import type { DailyChallenge } from '@/constants/dailyChallenges';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { getDailyChallenges } from '@/constants/dailyChallenges';
import { usePrayerGuide } from '@/contexts/PrayerGuideContext';

const CATEGORY_COLORS: Record<string, string> = {
  oracao: '#1a365d',
  leitura: '#6b21a8',
  acao: '#2d6a4f',
  reflexao: '#b45309',
  comunhao: '#991b1b',
};

const CATEGORY_LABELS: Record<string, string> = {
  oracao: 'Oração',
  leitura: 'Leitura',
  acao: 'Ação',
  reflexao: 'Reflexão',
  comunhao: 'Comunhão',
};

export default function ChallengesScreen() {
  const { data, completeChallenge, isChallengeCompleted } = usePrayerGuide();
  const today = useMemo(() => new Date(), []);
  const todayChallenges = useMemo(() => getDailyChallenges(today), [today]);
  const dateKey = useMemo(() => today.toDateString(), [today]);

  const completedToday = useMemo(() => {
    return todayChallenges.filter(c => isChallengeCompleted(`${dateKey}_${c.id}`)).length;
  }, [todayChallenges, isChallengeCompleted, dateKey]);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const celebrateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: completedToday / todayChallenges.length,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [completedToday, todayChallenges.length, progressAnim]);

  const handleComplete = useCallback((challenge: DailyChallenge) => {
    const key = `${dateKey}_${challenge.id}`;
    if (isChallengeCompleted(key)) return;

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    void completeChallenge(key, challenge.points);

    celebrateAnim.setValue(0);
    Animated.sequence([
      Animated.spring(celebrateAnim, { toValue: 1.2, tension: 50, friction: 3, useNativeDriver: true }),
      Animated.spring(celebrateAnim, { toValue: 1, tension: 50, friction: 5, useNativeDriver: true }),
    ]).start();
  }, [dateKey, isChallengeCompleted, completeChallenge, celebrateAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Desafios Diários' }} />
      <SafeAreaView style={styles.container} edges={[]}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.headerIcon}>
                <Target size={28} color={Colors.text.light} />
              </View>
              <View style={styles.headerInfo}>
                <Text style={styles.headerTitle}>Desafios de Hoje</Text>
                <Text style={styles.headerDate}>{formatDate(today)}</Text>
              </View>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>
                  {completedToday}/{todayChallenges.length} concluídos
                </Text>
                {completedToday === todayChallenges.length && (
                  <View style={styles.allDoneBadge}>
                    <Star size={12} color="#f1c40f" fill="#f1c40f" />
                    <Text style={styles.allDoneText}>Completo!</Text>
                  </View>
                )}
              </View>
              <View style={styles.progressBarBg}>
                <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
              </View>
            </View>

            <View style={styles.pointsRow}>
              <Flame size={16} color="#ff6b35" />
              <Text style={styles.pointsText}>{data.challengePoints} pontos acumulados</Text>
            </View>
          </View>

          <View style={styles.challengesList}>
            {todayChallenges.map((challenge) => {
              const key = `${dateKey}_${challenge.id}`;
              const isCompleted = isChallengeCompleted(key);
              const catColor = CATEGORY_COLORS[challenge.category] || Colors.primary.navy;

              return (
                <Animated.View
                  key={challenge.id}
                  style={[
                    styles.challengeCard,
                    isCompleted && styles.challengeCardCompleted,
                  ]}
                >
                  <View style={[styles.challengeAccent, { backgroundColor: catColor }]} />
                  <View style={styles.challengeContent}>
                    <View style={styles.challengeTop}>
                      <Text style={styles.challengeEmoji}>{challenge.emoji}</Text>
                      <View style={styles.challengeInfo}>
                        <View style={styles.challengeTitleRow}>
                          <Text style={[
                            styles.challengeTitle,
                            isCompleted && styles.challengeTitleCompleted,
                          ]}>
                            {challenge.title}
                          </Text>
                          <View style={[styles.pointsBadge, { backgroundColor: `${catColor}15` }]}>
                            <Text style={[styles.pointsBadgeText, { color: catColor }]}>
                              +{challenge.points}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.challengeDesc}>{challenge.description}</Text>
                        <View style={styles.challengeMeta}>
                          <View style={[styles.categoryTag, { backgroundColor: `${catColor}12` }]}>
                            <Text style={[styles.categoryTagText, { color: catColor }]}>
                              {CATEGORY_LABELS[challenge.category]}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.completeBtn,
                        isCompleted && styles.completeBtnDone,
                      ]}
                      onPress={() => handleComplete(challenge)}
                      activeOpacity={isCompleted ? 1 : 0.8}
                      disabled={isCompleted}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 size={18} color="#27ae60" />
                          <Text style={styles.completeBtnTextDone}>Concluído!</Text>
                        </>
                      ) : (
                        <>
                          <Circle size={18} color={Colors.primary.navy} />
                          <Text style={styles.completeBtnText}>Marcar como feito</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              );
            })}
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipEmoji}>💡</Text>
            <Text style={styles.tipText}>
              Novos desafios aparecem todos os dias. Complete todos para ganhar mais pontos e crescer espiritualmente!
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.cream,
  },
  content: {
    paddingBottom: 32,
  },
  header: {
    backgroundColor: Colors.primary.navy,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 18,
  },
  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text.light,
    marginBottom: 2,
  },
  headerDate: {
    fontSize: 13,
    color: Colors.accent.goldLight,
    textTransform: 'capitalize' as const,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500' as const,
  },
  allDoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(241,196,15,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  allDoneText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#f1c40f',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.accent.gold,
    borderRadius: 3,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pointsText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500' as const,
  },
  challengesList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  challengeCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  challengeCardCompleted: {
    opacity: 0.85,
  },
  challengeAccent: {
    height: 3,
  },
  challengeContent: {
    padding: 16,
  },
  challengeTop: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  challengeEmoji: {
    fontSize: 32,
    marginRight: 14,
    marginTop: 2,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.primary.navy,
    flex: 1,
  },
  challengeTitleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.text.muted,
  },
  pointsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 8,
  },
  pointsBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  challengeDesc: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  challengeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryTagText: {
    fontSize: 11,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.3,
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: `${Colors.primary.navy}08`,
    borderWidth: 1,
    borderColor: `${Colors.primary.navy}15`,
  },
  completeBtnDone: {
    backgroundColor: '#27ae6010',
    borderColor: '#27ae6025',
  },
  completeBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary.navy,
  },
  completeBtnTextDone: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#27ae60',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    backgroundColor: `${Colors.accent.gold}12`,
    borderRadius: 14,
  },
  tipEmoji: {
    fontSize: 20,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
});
