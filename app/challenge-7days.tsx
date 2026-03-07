import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Check, ArrowRight, Zap } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';

const CHALLENGE_DAYS = [
  { day: 1, emoji: '📖', title: 'Primeiro Devocional', desc: 'Converse com Gabriel sobre sua fé', xp: 100 },
  { day: 2, emoji: '🙏', title: 'Primeira Oração Guiada', desc: 'Ore junto com Gabriel', xp: 100 },
  { day: 3, emoji: '✍️', title: 'Criar Conteúdo', desc: 'Gere seu primeiro post cristão', xp: 150 },
  { day: 4, emoji: '👥', title: 'Entrar na Comunidade', desc: 'Compartilhe sua fé com outros', xp: 100 },
  { day: 5, emoji: '📚', title: 'Aprofundar Estudo', desc: 'Explore um livro da Bíblia', xp: 150 },
  { day: 6, emoji: '🤝', title: 'Oração Comunitária', desc: 'Ore com a comunidade', xp: 100 },
  { day: 7, emoji: '🎉', title: 'Celebração', desc: 'Desbloqueie acesso premium exclusivo', xp: 200 },
];

export default function Challenge7DaysScreen() {
  const router = useRouter();
  const { colors, state, completeChallengDay, startOnboardingChallenge } = useApp();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!state.onboardingChallenge.hasStarted) {
      startOnboardingChallenge();
    }
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleDayPress = (day: number) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    completeChallengDay(day);

    // Se completou dia 7, ir para home com desafio completo
    if (day === 7) {
      setTimeout(() => {
        router.replace('/(tabs)/(home)');
      }, 800);
    }
  };

  const handleSkip = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace('/(tabs)/(home)');
  };

  const completedDays = state.onboardingChallenge.completedDays.length;
  const totalXP = state.onboardingChallenge.completedDays.reduce((acc, day) => {
    const dayData = CHALLENGE_DAYS.find(d => d.day === day);
    return acc + (dayData?.xp || 0);
  }, 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <Text style={[styles.headerEmoji]}>⚡</Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Desafio de 7 Dias</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            Sua jornada de transformação espiritual começa aqui
          </Text>
        </Animated.View>

        {/* Progress Bar */}
        <View style={[styles.progressSection, { backgroundColor: colors.card }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: colors.text }]}>Seu Progresso</Text>
            <Text style={[styles.progressText, { color: '#8b5cf6' }]}>{completedDays}/7 dias</Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.borderLight }]}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  backgroundColor: '#8b5cf6',
                  width: `${(completedDays / 7) * 100}%`,
                },
              ]}
            />
          </View>
          <View style={styles.xpRow}>
            <Zap size={16} color="#8b5cf6" />
            <Text style={[styles.xpText, { color: colors.text }]}>
              <Text style={{ fontWeight: '700' }}>{totalXP}</Text> XP ganhos
            </Text>
          </View>
        </View>

        {/* Days Grid */}
        <View style={styles.daysContainer}>
          {CHALLENGE_DAYS.map((dayData) => {
            const isCompleted = state.onboardingChallenge.completedDays.includes(dayData.day);
            const isNext = !isCompleted && completedDays === dayData.day - 1;

            return (
              <TouchableOpacity
                key={dayData.day}
                style={[
                  styles.dayCard,
                  {
                    backgroundColor: isCompleted ? '#8b5cf6' + '20' : colors.card,
                    borderColor: isNext ? '#8b5cf6' : colors.borderLight,
                    borderWidth: isNext ? 2 : 1,
                  },
                ]}
                onPress={() => handleDayPress(dayData.day)}
                activeOpacity={0.8}
                disabled={!isCompleted && !isNext}
              >
                <View style={styles.dayHeader}>
                  <Text style={styles.dayEmoji}>{dayData.emoji}</Text>
                  {isCompleted && (
                    <View style={[styles.checkBadge, { backgroundColor: '#8b5cf6' }]}>
                      <Check size={14} color="#fff" strokeWidth={3} />
                    </View>
                  )}
                </View>

                <Text style={[styles.dayTitle, { color: colors.text }]}>{dayData.title}</Text>
                <Text style={[styles.dayDesc, { color: colors.textMuted }]}>{dayData.desc}</Text>

                <View style={styles.dayFooter}>
                  <View style={styles.xpBadge}>
                    <Zap size={12} color="#8b5cf6" />
                    <Text style={[styles.xpBadgeText, { color: '#8b5cf6' }]}>+{dayData.xp}</Text>
                  </View>
                  {isNext && (
                    <View style={[styles.nextBadge, { backgroundColor: '#8b5cf6' }]}>
                      <Text style={styles.nextBadgeText}>Próximo</Text>
                      <ArrowRight size={12} color="#fff" />
                    </View>
                  )}
                  {isCompleted && (
                    <Text style={[styles.completedText, { color: '#8b5cf6' }]}>Completo!</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Rewards Preview */}
        {completedDays === 7 && (
          <View style={[styles.rewardSection, { backgroundColor: '#8b5cf6' + '15', borderColor: '#8b5cf6' }]}>
            <Text style={[styles.rewardEmoji]}>🎁</Text>
            <Text style={[styles.rewardTitle, { color: '#8b5cf6' }]}>Parabéns! 🎉</Text>
            <Text style={[styles.rewardText, { color: colors.text }]}>
              Você completou o desafio! Ganhe acesso especial e continue sua jornada com Gabriel
            </Text>
          </View>
        )}

        {/* Skip Button */}
        <TouchableOpacity
          style={[styles.skipButton, { borderColor: colors.borderLight }]}
          onPress={handleSkip}
        >
          <Text style={[styles.skipButtonText, { color: colors.textMuted }]}>
            Pular para o app (pode fazer depois)
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  progressSection: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  xpText: {
    fontSize: 12,
  },
  daysContainer: {
    gap: 12,
    marginBottom: 24,
  },
  dayCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  dayEmoji: {
    fontSize: 32,
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  dayDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  dayFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#8b5cf6' + '10',
    borderRadius: 6,
  },
  xpBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  nextBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  nextBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#fff',
  },
  completedText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  rewardSection: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
  },
  rewardEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  rewardTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    marginBottom: 8,
  },
  rewardText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  skipButton: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 20,
  },
  skipButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
});
