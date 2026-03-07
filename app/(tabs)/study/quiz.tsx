import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Trophy, RotateCcw, Check, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { quizQuestions } from '@/constants/quizData';

export default function QuizScreen() {
  const router = useRouter();
  const { colors, updateQuizScore } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [shuffledQuestions] = useState(() =>
    [...quizQuestions].sort(() => Math.random() - 0.5).slice(0, 10)
  );
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const resultScale = useRef(new Animated.Value(0)).current;

  const question = shuffledQuestions[currentIndex];

  const handleAnswer = useCallback((index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setShowResult(true);

    const isCorrect = index === question.correctIndex;
    if (isCorrect) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setScore(prev => prev + 1);
    } else {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    Animated.spring(resultScale, { toValue: 1, tension: 50, friction: 5, useNativeDriver: true }).start();
  }, [selectedAnswer, question, resultScale]);

  const handleNext = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentIndex < shuffledQuestions.length - 1) {
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
        setCurrentIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
        resultScale.setValue(0);
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
      });
    } else {
      updateQuizScore(score);
      setGameOver(true);
    }
  }, [currentIndex, shuffledQuestions.length, fadeAnim, resultScale, score, updateQuizScore]);

  const handleRestart = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameOver(false);
    resultScale.setValue(0);
  }, [resultScale]);

  if (gameOver) {
    const percentage = Math.round((score / shuffledQuestions.length) * 100);
    const emoji = percentage >= 80 ? '🏆' : percentage >= 50 ? '👏' : '📚';

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.gameOverContainer}>
          <Text style={styles.gameOverEmoji}>{emoji}</Text>
          <Text style={[styles.gameOverTitle, { color: colors.text }]}>Quiz Finalizado!</Text>
          <Text style={[styles.gameOverScore, { color: colors.primary }]}>
            {score}/{shuffledQuestions.length}
          </Text>
          <Text style={[styles.gameOverPercentage, { color: colors.textSecondary }]}>{percentage}% de acerto</Text>
          <Text style={[styles.gameOverMessage, { color: colors.textMuted }]}>
            {percentage >= 80 ? 'Excelente! Você conhece bem a Palavra!' : percentage >= 50 ? 'Muito bom! Continue estudando!' : 'Continue estudando a Bíblia! Cada dia é uma oportunidade.'}
          </Text>
          <View style={styles.gameOverActions}>
            <TouchableOpacity
              style={[styles.restartBtn, { backgroundColor: colors.primary }]}
              onPress={handleRestart}
            >
              <RotateCcw size={18} color="#FFF" />
              <Text style={styles.restartBtnText}>Jogar Novamente</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.backBtnBottom, { borderColor: colors.border }]}
              onPress={() => router.back()}
            >
              <Text style={[styles.backBtnBottomText, { color: colors.textSecondary }]}>Voltar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerProgress, { color: colors.textMuted }]}>
            {currentIndex + 1} de {shuffledQuestions.length}
          </Text>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.primary,
                  width: `${((currentIndex + 1) / shuffledQuestions.length) * 100}%` as const,
                },
              ]}
            />
          </View>
        </View>
        <View style={[styles.scoreBadge, { backgroundColor: colors.primaryLight }]}>
          <Trophy size={14} color={colors.primary} />
          <Text style={[styles.scoreText, { color: colors.primary }]}>{score}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={[styles.difficultyBadge, { backgroundColor: question.difficulty === 'facil' ? '#10B98120' : question.difficulty === 'medio' ? '#F59E0B20' : '#EF444420' }]}>
            <Text style={[styles.difficultyText, { color: question.difficulty === 'facil' ? '#10B981' : question.difficulty === 'medio' ? '#F59E0B' : '#EF4444' }]}>
              {question.difficulty === 'facil' ? 'Fácil' : question.difficulty === 'medio' ? 'Médio' : 'Difícil'}
            </Text>
          </View>

          <Text style={[styles.question, { color: colors.text }]}>{question.question}</Text>

          <View style={styles.options}>
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === question.correctIndex;
              let optionBg = colors.card;
              let optionBorder = colors.borderLight;
              let textColor = colors.text;

              if (showResult) {
                if (isCorrect) {
                  optionBg = '#10B98118';
                  optionBorder = '#10B981';
                  textColor = '#10B981';
                } else if (isSelected && !isCorrect) {
                  optionBg = '#EF444418';
                  optionBorder = '#EF4444';
                  textColor = '#EF4444';
                }
              }

              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.optionBtn, { backgroundColor: optionBg, borderColor: optionBorder }]}
                  onPress={() => handleAnswer(index)}
                  disabled={selectedAnswer !== null}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.optionLetter, { color: textColor }]}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                  <Text style={[styles.optionText, { color: textColor }]}>{option}</Text>
                  {showResult && isCorrect && <Check size={18} color="#10B981" />}
                  {showResult && isSelected && !isCorrect && <X size={18} color="#EF4444" />}
                </TouchableOpacity>
              );
            })}
          </View>

          {showResult && (
            <Animated.View style={[styles.explanationCard, { backgroundColor: colors.cardElevated, borderColor: colors.borderLight, transform: [{ scale: resultScale }] }]}>
              <Text style={[styles.explanationTitle, { color: colors.text }]}>
                {selectedAnswer === question.correctIndex ? '✅ Correto!' : '❌ Incorreto'}
              </Text>
              <Text style={[styles.explanationText, { color: colors.textSecondary }]}>{question.explanation}</Text>
              <TouchableOpacity
                style={[styles.nextBtn, { backgroundColor: colors.primary }]}
                onPress={handleNext}
              >
                <Text style={styles.nextBtnText}>
                  {currentIndex < shuffledQuestions.length - 1 ? 'Próxima Pergunta' : 'Ver Resultado'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1 },
  headerProgress: { fontSize: 12, fontWeight: '600' as const, marginBottom: 6, textAlign: 'center' as const },
  progressBar: { height: 4, borderRadius: 2, overflow: 'hidden' as const },
  progressFill: { height: '100%' as const, borderRadius: 2 },
  scoreBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  scoreText: { fontSize: 14, fontWeight: '800' as const },
  content: { padding: 20, paddingBottom: 40 },
  difficultyBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, marginBottom: 16 },
  difficultyText: { fontSize: 12, fontWeight: '700' as const },
  question: { fontSize: 22, fontWeight: '700' as const, lineHeight: 32, marginBottom: 24 },
  options: { gap: 12 },
  optionBtn: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14, borderWidth: 1.5, gap: 12 },
  optionLetter: { fontSize: 15, fontWeight: '800' as const, width: 24 },
  optionText: { fontSize: 15, fontWeight: '500' as const, flex: 1 },
  explanationCard: { marginTop: 24, padding: 20, borderRadius: 16, borderWidth: 1 },
  explanationTitle: { fontSize: 17, fontWeight: '700' as const, marginBottom: 8 },
  explanationText: { fontSize: 14, lineHeight: 22, marginBottom: 16 },
  nextBtn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  nextBtnText: { fontSize: 16, fontWeight: '700' as const, color: '#FFF' },
  gameOverContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  gameOverEmoji: { fontSize: 64, marginBottom: 16 },
  gameOverTitle: { fontSize: 28, fontWeight: '800' as const, marginBottom: 8 },
  gameOverScore: { fontSize: 48, fontWeight: '900' as const, marginBottom: 4 },
  gameOverPercentage: { fontSize: 16, fontWeight: '600' as const, marginBottom: 16 },
  gameOverMessage: { fontSize: 15, textAlign: 'center' as const, lineHeight: 22, marginBottom: 32 },
  gameOverActions: { width: '100%', gap: 12 },
  restartBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14 },
  restartBtnText: { fontSize: 16, fontWeight: '700' as const, color: '#FFF' },
  backBtnBottom: { paddingVertical: 14, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
  backBtnBottomText: { fontSize: 15, fontWeight: '600' as const },
});
