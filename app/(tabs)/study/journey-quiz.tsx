import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronRight, Flame, Zap } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { quizQuestions, getQuizResultCopy } from '@/constants/journeyData';
import type { JourneyProfile } from '@/constants/journeyData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function JourneyQuizScreen() {
  const router = useRouter();
  const { colors, startJourney } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const resultFade = useRef(new Animated.Value(0)).current;

  const totalSteps = quizQuestions.length;
  const currentQuestion = quizQuestions[currentStep];
  const progress = (currentStep / totalSteps) * 100;

  const animateTransition = useCallback((direction: 'forward' | 'back', callback: () => void) => {
    const toValue = direction === 'forward' ? -SCREEN_WIDTH : SCREEN_WIDTH;
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      callback();
      slideAnim.setValue(direction === 'forward' ? SCREEN_WIDTH : -SCREEN_WIDTH);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
      ]).start();
    });
  }, [fadeAnim, slideAnim]);

  const showResultScreen = useCallback(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowResult(true);
    Animated.timing(resultFade, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [resultFade]);

  const handleSelectOption = useCallback((optionId: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.05, duration: 100, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    const newAnswers = { ...answers, [currentQuestion.id]: optionId };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentStep < totalSteps - 1) {
        animateTransition('forward', () => setCurrentStep(prev => prev + 1));
      } else {
        showResultScreen();
      }
    }, 400);
  }, [answers, currentQuestion, currentStep, totalSteps, animateTransition, pulseAnim, showResultScreen]);

  const handleStartJourney = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    const profile: JourneyProfile = {
      primaryPain: answers['pain_1'] || '',
      desiredOutcome: answers['desire_1'] || '',
      spiritualLevel: answers['spiritual_1'] || '',
      commitmentLevel: answers['commitment_1'] || '',
      tags: Object.values(answers),
    };

    const journeyProfile = {
      ...profile,
      startDate: new Date().toISOString(),
    };

    startJourney(journeyProfile);
    router.replace('/study/journey' as never);
  }, [answers, startJourney, router]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      animateTransition('back', () => setCurrentStep(prev => prev - 1));
    } else {
      router.back();
    }
  }, [currentStep, router, animateTransition]);

  const resultCopy = showResult ? getQuizResultCopy({
    primaryPain: answers['pain_1'] || '',
    desiredOutcome: answers['desire_1'] || '',
    spiritualLevel: answers['spiritual_1'] || '',
    commitmentLevel: answers['commitment_1'] || '',
    tags: Object.values(answers),
  }) : null;

  if (showResult && resultCopy) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#0A0A0A' }]} edges={['top']}>
        <Animated.View style={[styles.resultContainer, { opacity: resultFade }]}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.resultScroll}>
            <View style={styles.resultIconRow}>
              <View style={styles.fireIcon}>
                <Flame size={40} color="#FF6B35" fill="#FF6B35" />
              </View>
            </View>

            <Text style={styles.resultHeadline}>{resultCopy.headline}</Text>
            <Text style={styles.resultSubheadline}>{resultCopy.subheadline}</Text>

            <View style={styles.resultDivider} />

            <Text style={styles.resultBody}>{resultCopy.bodyText}</Text>

            <View style={styles.resultFeatures}>
              {[
                { emoji: '🌅', text: 'Orações proféticas da madrugada' },
                { emoji: '📖', text: 'Leituras bíblicas diárias' },
                { emoji: '⚔️', text: 'Declarações de guerra espiritual' },
                { emoji: '🔥', text: 'Reflexões que transformam' },
                { emoji: '💪', text: 'Ações práticas de fé' },
              ].map((feat) => (
                <View key={feat.text} style={styles.featureRow}>
                  <Text style={styles.featureEmoji}>{feat.emoji}</Text>
                  <Text style={styles.featureText}>{feat.text}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.ctaButton}
              onPress={handleStartJourney}
              activeOpacity={0.8}
            >
              <Zap size={20} color="#0A0A0A" />
              <Text style={styles.ctaText}>{resultCopy.ctaText}</Text>
            </TouchableOpacity>

            <Text style={styles.urgencyText}>{resultCopy.urgencyText}</Text>

            <TouchableOpacity onPress={() => router.back()} style={styles.skipBtn}>
              <Text style={styles.skipText}>Voltar para estudos</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.quizHeader}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%` as `${number}%`,
                  backgroundColor: '#FF6B35',
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.textMuted }]}>
            {currentStep + 1} de {totalSteps}
          </Text>
        </View>
      </View>

      <Animated.View
        style={[
          styles.questionContainer,
          { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
        ]}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.questionScroll}>
          <View style={styles.questionHeader}>
            <Text style={[styles.categoryBadge, { backgroundColor: getCategoryColor(currentQuestion.category) + '20', color: getCategoryColor(currentQuestion.category) }]}>
              {getCategoryLabel(currentQuestion.category)}
            </Text>
          </View>

          <Text style={[styles.questionText, { color: colors.text }]}>
            {currentQuestion.text}
          </Text>
          <Text style={[styles.questionSubtext, { color: colors.textMuted }]}>
            {currentQuestion.subtext}
          </Text>

          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option) => {
              const isSelected = answers[currentQuestion.id] === option.id;
              return (
                <Animated.View key={option.id} style={{ transform: [{ scale: isSelected ? pulseAnim : 1 }] }}>
                  <TouchableOpacity
                    style={[
                      styles.optionCard,
                      {
                        backgroundColor: isSelected ? '#FF6B35' + '15' : colors.card,
                        borderColor: isSelected ? '#FF6B35' : colors.borderLight,
                      },
                    ]}
                    onPress={() => handleSelectOption(option.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.optionEmoji}>{option.emoji}</Text>
                    <Text style={[
                      styles.optionText,
                      { color: isSelected ? '#FF6B35' : colors.text },
                    ]}>
                      {option.text}
                    </Text>
                    <ChevronRight size={18} color={isSelected ? '#FF6B35' : colors.textMuted} />
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

function getCategoryColor(category: string): string {
  switch (category) {
    case 'pain': return '#EF4444';
    case 'desire': return '#10B981';
    case 'spiritual_level': return '#8B5CF6';
    case 'commitment': return '#FF6B35';
    default: return '#C5943A';
  }
}

function getCategoryLabel(category: string): string {
  switch (category) {
    case 'pain': return 'SUA DOR';
    case 'desire': return 'SEU DESEJO';
    case 'spiritual_level': return 'SUA JORNADA';
    case 'commitment': return 'SEU COMPROMISSO';
    default: return '';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  quizHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: { padding: 4 },
  progressContainer: { flex: 1, gap: 4 },
  progressBar: { height: 6, borderRadius: 3, overflow: 'hidden' as const },
  progressFill: { height: '100%' as const, borderRadius: 3 },
  progressText: { fontSize: 12, textAlign: 'right' as const },
  questionContainer: { flex: 1 },
  questionScroll: { padding: 20, paddingBottom: 40 },
  questionHeader: { marginBottom: 20 },
  categoryBadge: {
    alignSelf: 'flex-start' as const,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 11,
    fontWeight: '800' as const,
    letterSpacing: 1.5,
    overflow: 'hidden' as const,
  },
  questionText: {
    fontSize: 26,
    fontWeight: '800' as const,
    lineHeight: 34,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  questionSubtext: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 28,
    fontStyle: 'italic' as const,
  },
  optionsContainer: { gap: 10 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 14,
  },
  optionEmoji: { fontSize: 28 },
  optionText: { flex: 1, fontSize: 15, fontWeight: '600' as const, lineHeight: 22 },
  resultContainer: { flex: 1 },
  resultScroll: { padding: 24, paddingBottom: 60 },
  resultIconRow: { alignItems: 'center', marginBottom: 24, marginTop: 16 },
  fireIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF6B35' + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultHeadline: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: '#FFFFFF',
    lineHeight: 36,
    marginBottom: 12,
    letterSpacing: -0.5,
    textAlign: 'center' as const,
  },
  resultSubheadline: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600' as const,
    lineHeight: 24,
    textAlign: 'center' as const,
    marginBottom: 20,
  },
  resultDivider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 20,
  },
  resultBody: {
    fontSize: 15,
    color: '#CCCCCC',
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center' as const,
  },
  resultFeatures: { gap: 14, marginBottom: 32 },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  featureEmoji: { fontSize: 24 },
  featureText: { fontSize: 14, color: '#FFFFFF', fontWeight: '600' as const, flex: 1 },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 10,
    marginBottom: 16,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: '#0A0A0A',
    letterSpacing: 0.5,
  },
  urgencyText: {
    fontSize: 13,
    color: '#EF4444',
    textAlign: 'center' as const,
    fontWeight: '600' as const,
    lineHeight: 20,
    marginBottom: 20,
  },
  skipBtn: { alignItems: 'center', padding: 12 },
  skipText: { fontSize: 14, color: '#666', textDecorationLine: 'underline' as const },
});
