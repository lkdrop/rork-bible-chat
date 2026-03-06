import React, { useCallback, useMemo, useEffect, useRef } from 'react';
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
import { Moon, Clock, ChevronRight, Sparkles, CheckCircle2, RotateCcw, Flame } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { prayers, lifeAreas, LifeArea } from '@/constants/prayers';
import { usePrayerGuide } from '@/contexts/PrayerGuideContext';
import { achievements } from '@/constants/achievements';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

function AchievementToast({ achievementId, onDismiss }: { achievementId: string; onDismiss: () => void }) {
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const achievement = achievements.find(a => a.id === achievementId);

  useEffect(() => {
    Animated.sequence([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.delay(3000),
      Animated.timing(slideAnim, {
        toValue: -120,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss());
  }, [slideAnim, onDismiss]);

  if (!achievement) return null;

  return (
    <Animated.View style={[styles.achievementToast, { transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.achievementToastEmoji}>{achievement.emoji}</Text>
      <View style={styles.achievementToastContent}>
        <Text style={styles.achievementToastTitle}>Conquista Desbloqueada!</Text>
        <Text style={styles.achievementToastName}>{achievement.title}</Text>
      </View>
    </Animated.View>
  );
}

export default function GuideScreen() {
  const router = useRouter();
  const {
    hasCompletedQuiz,
    data,
    recommendedPrayers,
    progress,
    isPrayerCompleted,
    resetProgress,
    newAchievement,
    dismissAchievement,
  } = usePrayerGuide();

  const flameAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (data.streak > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(flameAnim, {
            toValue: 1.2,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(flameAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [data.streak, flameAnim]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress.percentage,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [progress.percentage, progressAnim]);

  const handleStartQuiz = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/(guide)/quiz' as never);
  }, [router]);

  const handlePrayerPress = useCallback((prayerId: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(tabs)/(guide)/prayer/${prayerId}` as never);
  }, [router]);

  const handleReset = useCallback(() => {
    void resetProgress();
  }, [resetProgress]);

  const prayersByCategory = useMemo(() => {
    const grouped: Record<LifeArea, typeof prayers> = {} as Record<LifeArea, typeof prayers>;
    recommendedPrayers.forEach(prayer => {
      if (!grouped[prayer.category]) {
        grouped[prayer.category] = [];
      }
      grouped[prayer.category].push(prayer);
    });
    return grouped;
  }, [recommendedPrayers]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  if (!hasCompletedQuiz) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.welcomeContainer}>
          <View style={styles.welcomeIcon}>
            <Moon size={60} color={Colors.accent.gold} />
          </View>
          <Text style={styles.welcomeTitle}>Orações Secretas da Madrugada</Text>
          <Text style={styles.welcomeSubtitle}>
            Descubra 20 orações poderosas para transformar sua vida nas horas mais sagradas da noite
          </Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartQuiz}
            activeOpacity={0.8}
          >
            <Sparkles size={20} color={Colors.text.light} />
            <Text style={styles.startButtonText}>Descobrir Minhas Orações</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {newAchievement && (
        <AchievementToast achievementId={newAchievement} onDismiss={dismissAchievement} />
      )}

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Orações da Madrugada</Text>
            <Text style={styles.headerSubtitle}>
              {progress.completed} de {progress.total} orações completadas
            </Text>
          </View>
          <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
            <RotateCcw size={20} color={Colors.accent.gold} />
          </TouchableOpacity>
        </View>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {data.streak > 0 && (
          <View style={styles.streakCard}>
            <Animated.View style={{ transform: [{ scale: flameAnim }] }}>
              <Flame size={32} color="#ff6b35" fill="#ff6b35" />
            </Animated.View>
            <View style={styles.streakInfo}>
              <Text style={styles.streakNumber}>{data.streak}</Text>
              <Text style={styles.streakLabel}>
                {data.streak === 1 ? 'dia de oração' : 'dias seguidos orando'}
              </Text>
            </View>
          </View>
        )}

        {data.selectedAreas.map((areaId) => {
          const area = lifeAreas.find(a => a.id === areaId);
          const areaPrayers = prayersByCategory[areaId] || [];

          if (!area || areaPrayers.length === 0) return null;

          return (
            <View key={areaId} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryEmoji}>{area.emoji}</Text>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryTitle}>{area.title}</Text>
                  <Text style={styles.categoryDescription}>{area.description}</Text>
                </View>
              </View>

              <View style={styles.prayersList}>
                {areaPrayers.map((prayer, index) => {
                  const isCompleted = isPrayerCompleted(prayer.id);
                  return (
                    <AnimatedTouchable
                      key={prayer.id}
                      style={[
                        styles.prayerCard,
                        index === areaPrayers.length - 1 && styles.prayerCardLast,
                      ]}
                      onPress={() => handlePrayerPress(prayer.id)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.prayerContent}>
                        <View style={styles.prayerHeader}>
                          <Text style={styles.prayerNumber}>
                            {String(prayer.id).padStart(2, '0')}
                          </Text>
                          {isCompleted && (
                            <CheckCircle2 size={18} color={Colors.accent.gold} />
                          )}
                        </View>
                        <Text style={styles.prayerTitle}>{prayer.title}</Text>
                        <View style={styles.prayerMeta}>
                          <Clock size={14} color={Colors.text.muted} />
                          <Text style={styles.prayerTime}>{prayer.bestTime}</Text>
                        </View>
                      </View>
                      <ChevronRight size={20} color={Colors.text.muted} />
                    </AnimatedTouchable>
                  );
                })}
              </View>
            </View>
          );
        })}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            "A oração feita por um justo pode muito em seus efeitos."
          </Text>
          <Text style={styles.footerVerse}>Tiago 5:16</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.cream,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: Colors.primary.navy,
  },
  welcomeIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${Colors.accent.gold}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text.light,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 36,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: Colors.accent.goldLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.accent.gold,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: Colors.accent.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.light,
  },
  header: {
    backgroundColor: Colors.primary.navy,
    padding: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text.light,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.accent.goldLight,
  },
  resetButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent.gold,
    borderRadius: 3,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b35',
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  streakInfo: {
    flex: 1,
  },
  streakNumber: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#ff6b35',
  },
  streakLabel: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontWeight: '500' as const,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: Colors.background.white,
    padding: 16,
    borderRadius: 16,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.primary.navy,
    marginBottom: 2,
  },
  categoryDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  prayersList: {
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  prayerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  prayerCardLast: {
    borderBottomWidth: 0,
  },
  prayerContent: {
    flex: 1,
  },
  prayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  prayerNumber: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.accent.gold,
  },
  prayerTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  prayerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  prayerTime: {
    fontSize: 12,
    color: Colors.text.muted,
  },
  footer: {
    marginTop: 16,
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: Colors.primary.navy,
    textAlign: 'center',
    marginBottom: 4,
  },
  footerVerse: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  achievementToast: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#27ae60',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  achievementToastEmoji: {
    fontSize: 32,
  },
  achievementToastContent: {
    flex: 1,
  },
  achievementToastTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.85)',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  achievementToastName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
});
