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
import { Trophy, Zap, CheckCircle, XCircle, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import {
  QuizQuestion,
  QuizCategory,
  quizCategories,
  getRandomQuestions,
} from '@/constants/bibleQuiz';

type QuizPhase = 'category' | 'playing' | 'result' | 'answer_reveal';

export default function BibleQuizScreen() {
  const [phase, setPhase] = useState<QuizPhase>('category');
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const optionAnims = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current;

  const animateOptionsIn = useCallback(() => {
    optionAnims.forEach(a => a.setValue(0));
    Animated.stagger(80, optionAnims.map(a =>
      Animated.spring(a, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true })
    )).start();
  }, [optionAnims]);

  const startQuiz = useCallback((category: QuizCategory | null) => {
    setSelectedCategory(category);
    const q = getRandomQuestions(10, category ?? undefined);
    setQuestions(q);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setCorrectCount(0);
    setStreak(0);
    setBestStreak(0);
    setPhase('playing');
    progressAnim.setValue(0);
    animateOptionsIn();
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [progressAnim, animateOptionsIn]);

  const handleAnswer = useCallback((index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);

    const question = questions[currentIndex];
    const isCorrect = index === question.correctIndex;

    if (isCorrect) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const streakBonus = streak >= 3 ? 5 : 0;
      const points = question.difficulty === 'facil' ? 10 : question.difficulty === 'medio' ? 20 : 30;
      setScore(prev => prev + points + streakBonus);
      setCorrectCount(prev => prev + 1);
      setStreak(prev => {
        const newStreak = prev + 1;
        setBestStreak(current => Math.max(current, newStreak));
        return newStreak;
      });
    } else {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setStreak(0);
    }

    scaleAnim.setValue(0);
    Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 5, useNativeDriver: true }).start();

    setPhase('answer_reveal');
  }, [selectedAnswer, questions, currentIndex, streak, scaleAnim]);

  const handleNext = useCallback(() => {
    if (currentIndex >= questions.length - 1) {
      setPhase('result');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }

    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setPhase('playing');

      Animated.timing(progressAnim, {
        toValue: (currentIndex + 1) / questions.length,
        duration: 300,
        useNativeDriver: false,
      }).start();

      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      animateOptionsIn();
    });
  }, [currentIndex, questions.length, fadeAnim, progressAnim, animateOptionsIn]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  if (phase === 'category') {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: 'Quiz Bíblico' }} />
        <SafeAreaView style={styles.container} edges={[]}>
          <ScrollView contentContainerStyle={styles.categoryContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryHeaderEmoji}>❓</Text>
              <Text style={styles.categoryTitle}>Quiz Bíblico</Text>
              <Text style={styles.categorySubtitle}>
                Teste seus conhecimentos sobre a Bíblia Sagrada!
              </Text>
            </View>

            <TouchableOpacity
              style={styles.allCategoriesButton}
              onPress={() => startQuiz(null)}
              activeOpacity={0.8}
            >
              <View style={styles.allCatLeft}>
                <Text style={styles.allCatEmoji}>🎯</Text>
                <View>
                  <Text style={styles.allCatTitle}>Todas as Categorias</Text>
                  <Text style={styles.allCatSub}>10 perguntas aleatórias</Text>
                </View>
              </View>
              <ChevronRight size={20} color={Colors.text.light} />
            </TouchableOpacity>

            <Text style={styles.sectionLabel}>Escolha uma categoria</Text>

            <View style={styles.categoryGrid}>
              {quizCategories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryCard, { borderLeftColor: cat.color }]}
                  onPress={() => startQuiz(cat.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.catCardEmoji}>{cat.emoji}</Text>
                  <Text style={styles.catCardTitle}>{cat.title}</Text>
                  <ChevronRight size={16} color={Colors.text.muted} />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </>
    );
  }

  if (phase === 'result') {
    const percentage = Math.round((correctCount / questions.length) * 100);
    const grade = percentage >= 80 ? 'Excelente!' : percentage >= 60 ? 'Muito Bem!' : percentage >= 40 ? 'Bom Esforço!' : 'Continue Praticando!';
    const gradeEmoji = percentage >= 80 ? '🏆' : percentage >= 60 ? '⭐' : percentage >= 40 ? '💪' : '📖';

    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: 'Resultado' }} />
        <SafeAreaView style={styles.container} edges={[]}>
          <ScrollView contentContainerStyle={styles.resultContainer}>
            <View style={styles.resultBadge}>
              <Text style={styles.resultBadgeEmoji}>{gradeEmoji}</Text>
            </View>
            <Text style={styles.resultGrade}>{grade}</Text>
            <Text style={styles.resultScore}>{score} pontos</Text>

            <View style={styles.resultStatsRow}>
              <View style={styles.resultStat}>
                <Text style={styles.resultStatValue}>{correctCount}/{questions.length}</Text>
                <Text style={styles.resultStatLabel}>Acertos</Text>
              </View>
              <View style={styles.resultStatDivider} />
              <View style={styles.resultStat}>
                <Text style={styles.resultStatValue}>{percentage}%</Text>
                <Text style={styles.resultStatLabel}>Precisão</Text>
              </View>
              <View style={styles.resultStatDivider} />
              <View style={styles.resultStat}>
                <Text style={styles.resultStatValue}>{bestStreak}</Text>
                <Text style={styles.resultStatLabel}>Melhor Sequência</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => startQuiz(selectedCategory)}
              activeOpacity={0.85}
            >
              <Text style={styles.retryButtonText}>Jogar Novamente</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setPhase('category')}
              activeOpacity={0.7}
            >
              <Text style={styles.backButtonText}>Escolher Outra Categoria</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </>
    );
  }

  const question = questions[currentIndex];
  const isReveal = phase === 'answer_reveal';

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: `Pergunta ${currentIndex + 1}/${questions.length}` }} />
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.quizHeader}>
          <View style={styles.progressBarBg}>
            <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
          </View>
          <View style={styles.quizStats}>
            <View style={styles.quizStatItem}>
              <Trophy size={14} color={Colors.accent.gold} />
              <Text style={styles.quizStatText}>{score}</Text>
            </View>
            {streak >= 2 && (
              <View style={styles.streakBadge}>
                <Zap size={12} color="#ff6b35" />
                <Text style={styles.streakBadgeText}>x{streak}</Text>
              </View>
            )}
          </View>
        </View>

        <ScrollView
          style={styles.quizContent}
          contentContainerStyle={styles.quizContentInner}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.difficultyBadge}>
              <Text style={[
                styles.difficultyText,
                question.difficulty === 'facil' && { color: '#27ae60' },
                question.difficulty === 'medio' && { color: '#e67e22' },
                question.difficulty === 'dificil' && { color: '#e74c3c' },
              ]}>
                {question.difficulty === 'facil' ? 'Fácil' : question.difficulty === 'medio' ? 'Médio' : 'Difícil'}
              </Text>
            </View>

            <Text style={styles.questionText}>{question.question}</Text>

            <View style={styles.optionsContainer}>
              {question.options.map((option, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrectOption = idx === question.correctIndex;
                let optionStyle = styles.optionDefault;
                let textStyle = styles.optionTextDefault;

                if (isReveal) {
                  if (isCorrectOption) {
                    optionStyle = styles.optionCorrect;
                    textStyle = styles.optionTextCorrect;
                  } else if (isSelected && !isCorrectOption) {
                    optionStyle = styles.optionWrong;
                    textStyle = styles.optionTextWrong;
                  }
                } else if (isSelected) {
                  optionStyle = styles.optionSelected;
                }

                return (
                  <Animated.View
                    key={idx}
                    style={{
                      opacity: optionAnims[idx],
                      transform: [{ translateY: optionAnims[idx].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
                    }}
                  >
                    <TouchableOpacity
                      style={[styles.optionButton, optionStyle]}
                      onPress={() => handleAnswer(idx)}
                      activeOpacity={0.8}
                      disabled={isReveal}
                    >
                      <View style={styles.optionLetter}>
                        <Text style={styles.optionLetterText}>
                          {String.fromCharCode(65 + idx)}
                        </Text>
                      </View>
                      <Text style={[styles.optionText, textStyle]} numberOfLines={3}>
                        {option}
                      </Text>
                      {isReveal && isCorrectOption && (
                        <CheckCircle size={20} color="#27ae60" />
                      )}
                      {isReveal && isSelected && !isCorrectOption && (
                        <XCircle size={20} color="#e74c3c" />
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>

            {isReveal && (
              <Animated.View style={[styles.explanationCard, { transform: [{ scale: scaleAnim }] }]}>
                <Text style={styles.explanationTitle}>
                  {selectedAnswer === question.correctIndex ? '✅ Correto!' : '❌ Incorreto'}
                </Text>
                <Text style={styles.explanationText}>{question.explanation}</Text>
                <Text style={styles.explanationRef}>📖 {question.reference}</Text>

                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={handleNext}
                  activeOpacity={0.85}
                >
                  <Text style={styles.nextButtonText}>
                    {currentIndex >= questions.length - 1 ? 'Ver Resultado' : 'Próxima Pergunta'}
                  </Text>
                  <ChevronRight size={18} color={Colors.text.light} />
                </TouchableOpacity>
              </Animated.View>
            )}
          </Animated.View>
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
  categoryContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  categoryHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  categoryHeaderEmoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.primary.navy,
    marginBottom: 6,
  },
  categorySubtitle: {
    fontSize: 15,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  allCategoriesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary.navy,
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
    shadowColor: Colors.primary.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  allCatLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  allCatEmoji: {
    fontSize: 32,
  },
  allCatTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text.light,
  },
  allCatSub: {
    fontSize: 13,
    color: Colors.accent.goldLight,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    marginBottom: 12,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  categoryGrid: {
    gap: 10,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.white,
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  catCardEmoji: {
    fontSize: 24,
    marginRight: 14,
  },
  catCardTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    flex: 1,
  },
  quizHeader: {
    backgroundColor: Colors.primary.navy,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },
  progressBarBg: {
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.accent.gold,
    borderRadius: 3,
  },
  quizStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quizStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quizStatText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.accent.gold,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,107,53,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakBadgeText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#ff6b35',
  },
  quizContent: {
    flex: 1,
  },
  quizContentInner: {
    padding: 20,
    paddingBottom: 40,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Colors.background.white,
    marginBottom: 16,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.primary.navy,
    lineHeight: 30,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  optionDefault: {
    borderColor: 'rgba(0,0,0,0.06)',
  },
  optionSelected: {
    borderColor: Colors.primary.navy,
    backgroundColor: `${Colors.primary.navy}08`,
  },
  optionCorrect: {
    borderColor: '#27ae60',
    backgroundColor: '#27ae6010',
  },
  optionWrong: {
    borderColor: '#e74c3c',
    backgroundColor: '#e74c3c10',
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background.cream,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionLetterText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.primary.navy,
  },
  optionText: {
    fontSize: 15,
    color: Colors.text.primary,
    flex: 1,
    lineHeight: 22,
  },
  optionTextDefault: {},
  optionTextCorrect: {
    color: '#27ae60',
    fontWeight: '600' as const,
  },
  optionTextWrong: {
    color: '#e74c3c',
  },
  explanationCard: {
    marginTop: 20,
    backgroundColor: Colors.background.white,
    borderRadius: 18,
    padding: 20,
    shadowColor: Colors.shadow.medium,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.primary.navy,
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 22,
    marginBottom: 8,
  },
  explanationRef: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.accent.gold,
    marginBottom: 16,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary.navy,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.light,
  },
  resultContainer: {
    padding: 24,
    alignItems: 'center',
    paddingTop: 40,
  },
  resultBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${Colors.accent.gold}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultBadgeEmoji: {
    fontSize: 48,
  },
  resultGrade: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.primary.navy,
    marginBottom: 4,
  },
  resultScore: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.accent.gold,
    marginBottom: 28,
  },
  resultStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.white,
    borderRadius: 18,
    padding: 20,
    width: '100%',
    marginBottom: 28,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resultStat: {
    flex: 1,
    alignItems: 'center',
  },
  resultStatValue: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.primary.navy,
    marginBottom: 2,
  },
  resultStatLabel: {
    fontSize: 11,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  resultStatDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  retryButton: {
    backgroundColor: Colors.primary.navy,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.light,
  },
  backButton: {
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 15,
    color: Colors.text.secondary,
    fontWeight: '500' as const,
  },
});
