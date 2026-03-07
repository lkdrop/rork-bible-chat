import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Trophy,
  RotateCcw,
  Check,
  X,
  Zap,
  Users,
  WifiOff,
  Timer,
  Crown,
  Swords,
  Star,
  ChevronRight,
  Share2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Share } from 'react-native';
import { useApp } from '@/contexts/AppContext';
import { quizQuestions, QuizQuestion } from '@/constants/quizData';
import { shareContent } from '@/utils';

type GameMode = 'menu' | 'solo' | 'duo' | 'playing' | 'result';
type DuoTurn = 'player1' | 'player2';

const POINTS_EASY = 10;
const POINTS_MEDIUM = 20;
const POINTS_HARD = 30;
const TIME_LIMIT = 15;
const QUESTIONS_PER_GAME = 10;

function getPointsForDifficulty(difficulty: string): number {
  if (difficulty === 'facil') return POINTS_EASY;
  if (difficulty === 'medio') return POINTS_MEDIUM;
  return POINTS_HARD;
}

export default function BibleBattleScreen() {
  const router = useRouter();
  const { colors, state, addGameResult } = useApp();

  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [timerActive, setTimerActive] = useState(false);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);

  const [duoTurn, setDuoTurn] = useState<DuoTurn>('player1');
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [p1Answers, setP1Answers] = useState(0);
  const [p2Answers, setP2Answers] = useState(0);
  const [showTurnModal, setShowTurnModal] = useState(false);

  const [shuffledQuestions, setShuffledQuestions] = useState<QuizQuestion[]>([]);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const resultScale = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const comboScale = useRef(new Animated.Value(0)).current;
  const turnModalScale = useRef(new Animated.Value(0.8)).current;

  const question = shuffledQuestions[currentIndex];

  const isDuo = gameMode === 'duo';
  const totalQuestionsForDuo = QUESTIONS_PER_GAME * 2;
  const currentQuestionNum = isDuo
    ? p1Answers + p2Answers + 1
    : currentIndex + 1;
  const totalQuestions = isDuo ? totalQuestionsForDuo : QUESTIONS_PER_GAME;

  const handleTimeoutRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!timerActive || !question) return;
    if (timeLeft <= 0) {
      handleTimeoutRef.current();
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, question]);

  const startGame = useCallback((mode: 'solo' | 'duo') => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const shuffled = [...quizQuestions].sort(() => Math.random() - 0.5).slice(0, mode === 'duo' ? QUESTIONS_PER_GAME * 2 : QUESTIONS_PER_GAME);
    setShuffledQuestions(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(TIME_LIMIT);
    setCombo(0);
    setMaxCombo(0);
    setP1Score(0);
    setP2Score(0);
    setP1Answers(0);
    setP2Answers(0);
    setDuoTurn('player1');

    if (mode === 'duo') {
      setGameMode('duo');
      setShowTurnModal(true);
      Animated.spring(turnModalScale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }).start();
    } else {
      setGameMode('solo');
      setTimerActive(true);
    }
  }, [turnModalScale]);

  const startTurn = useCallback(() => {
    Animated.timing(turnModalScale, { toValue: 0.8, duration: 200, useNativeDriver: true }).start(() => {
      setShowTurnModal(false);
      setTimerActive(true);
      setTimeLeft(TIME_LIMIT);
      setSelectedAnswer(null);
      setShowResult(false);
      turnModalScale.setValue(0.8);
    });
  }, [turnModalScale]);

  const handleTimeout = useCallback(() => {
    if (selectedAnswer !== null) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setTimerActive(false);
    setSelectedAnswer(-1);
    setShowResult(true);
    setCombo(0);

    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 5, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();

    Animated.spring(resultScale, { toValue: 1, tension: 50, friction: 5, useNativeDriver: true }).start();
  }, [selectedAnswer, shakeAnim, resultScale]);

  useEffect(() => {
    handleTimeoutRef.current = handleTimeout;
  }, [handleTimeout]);

  const handleAnswer = useCallback((index: number) => {
    if (selectedAnswer !== null || !question) return;
    setSelectedAnswer(index);
    setShowResult(true);
    setTimerActive(false);

    const isCorrect = index === question.correctIndex;
    const points = getPointsForDifficulty(question.difficulty);
    const timeBonus = Math.floor(timeLeft * 2);
    const comboBonus = combo >= 3 ? 15 : combo >= 2 ? 10 : 0;
    const totalPoints = points + timeBonus + comboBonus;

    if (isCorrect) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo(prev => Math.max(prev, newCombo));

      if (isDuo) {
        if (duoTurn === 'player1') setP1Score(prev => prev + totalPoints);
        else setP2Score(prev => prev + totalPoints);
      } else {
        setScore(prev => prev + totalPoints);
      }

      if (newCombo >= 3) {
        Animated.spring(comboScale, { toValue: 1, tension: 60, friction: 5, useNativeDriver: true }).start(() => {
          Animated.timing(comboScale, { toValue: 0, duration: 500, delay: 800, useNativeDriver: true }).start();
        });
      }
    } else {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setCombo(0);

      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 5, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }

    Animated.spring(resultScale, { toValue: 1, tension: 50, friction: 5, useNativeDriver: true }).start();
  }, [selectedAnswer, question, timeLeft, combo, isDuo, duoTurn, shakeAnim, resultScale, comboScale]);

  const handleNext = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (isDuo) {
      if (duoTurn === 'player1') setP1Answers(prev => prev + 1);
      else setP2Answers(prev => prev + 1);
    }

    const nextIndex = currentIndex + 1;

    if (nextIndex >= shuffledQuestions.length) {
      if (isDuo) {
        addGameResult(Math.max(p1Score, p2Score), shuffledQuestions.length, true);
      } else {
        addGameResult(score, shuffledQuestions.length, score > state.quizHighScore);
      }
      setGameMode('result');
      return;
    }

    if (isDuo) {
      const halfDone = nextIndex === QUESTIONS_PER_GAME;
      if (halfDone && duoTurn === 'player1') {
        setDuoTurn('player2');
        setCurrentIndex(nextIndex);
        setShowTurnModal(true);
        setTimerActive(false);
        setSelectedAnswer(null);
        setShowResult(false);
        resultScale.setValue(0);
        Animated.spring(turnModalScale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }).start();
        return;
      }
    }

    Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }).start(() => {
      setCurrentIndex(nextIndex);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(TIME_LIMIT);
      setTimerActive(true);
      resultScale.setValue(0);
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  }, [currentIndex, shuffledQuestions.length, fadeAnim, resultScale, isDuo, duoTurn, score, p1Score, p2Score, addGameResult, state.quizHighScore, turnModalScale]);

  const handleRestart = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setGameMode('menu');
  }, []);

  const handleShareResult = useCallback(async () => {
    const msg = isDuo
      ? `⚔️ Batalha Bíblica!\n\nJogador 1: ${p1Score} pts\nJogador 2: ${p2Score} pts\n\n${p1Score > p2Score ? 'Jogador 1 venceu!' : p2Score > p1Score ? 'Jogador 2 venceu!' : 'Empate!'}\n\nBíblia IA`
      : `⚔️ Batalha Bíblica!\n\nPontuação: ${score} pts\nCombo Máximo: ${maxCombo}x\n\n🏆 Total acumulado: ${state.gamePoints + score} pts\n\nBíblia IA`;
    await shareContent(msg);
  }, [isDuo, p1Score, p2Score, score, maxCombo, state.gamePoints]);

  const timerColor = timeLeft <= 3 ? '#EF4444' : timeLeft <= 7 ? '#F59E0B' : '#10B981';

  if (gameMode === 'menu') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.menuHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.menuTitle, { color: colors.text }]}>Batalha Bíblica</Text>
          <View style={{ width: 30 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.menuContent}>
          <View style={styles.trophySection}>
            <View style={[styles.trophyCircle, { backgroundColor: '#F59E0B' + '18' }]}>
              <Swords size={48} color="#F59E0B" />
            </View>
            <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>
              Teste seus conhecimentos bíblicos!
            </Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={[styles.menuStatCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              <Trophy size={20} color="#F59E0B" />
              <Text style={[styles.menuStatNum, { color: colors.text }]}>{state.gamePoints}</Text>
              <Text style={[styles.menuStatLabel, { color: colors.textMuted }]}>Pontos</Text>
            </View>
            <View style={[styles.menuStatCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              <Crown size={20} color="#10B981" />
              <Text style={[styles.menuStatNum, { color: colors.text }]}>{state.gameBattlesWon}</Text>
              <Text style={[styles.menuStatLabel, { color: colors.textMuted }]}>Vitórias</Text>
            </View>
            <View style={[styles.menuStatCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              <Zap size={20} color="#8B5CF6" />
              <Text style={[styles.menuStatNum, { color: colors.text }]}>{state.gameTotalBattles}</Text>
              <Text style={[styles.menuStatLabel, { color: colors.textMuted }]}>Batalhas</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.modeCard, { backgroundColor: '#10B981' + '12', borderColor: '#10B981' + '30' }]}
            onPress={() => startGame('solo')}
            activeOpacity={0.8}
          >
            <View style={[styles.modeIconWrap, { backgroundColor: '#10B981' }]}>
              <Zap size={24} color="#FFF" />
            </View>
            <View style={styles.modeInfo}>
              <Text style={[styles.modeTitle, { color: colors.text }]}>Jogar Solo</Text>
              <Text style={[styles.modeDesc, { color: colors.textSecondary }]}>
                10 perguntas • Timer de 15s • Pontuação por velocidade
              </Text>
            </View>
            <ChevronRight size={20} color="#10B981" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeCard, { backgroundColor: '#3B82F6' + '12', borderColor: '#3B82F6' + '30' }]}
            onPress={() => startGame('duo')}
            activeOpacity={0.8}
          >
            <View style={[styles.modeIconWrap, { backgroundColor: '#3B82F6' }]}>
              <Users size={24} color="#FFF" />
            </View>
            <View style={styles.modeInfo}>
              <Text style={[styles.modeTitle, { color: colors.text }]}>Jogar com Amigo</Text>
              <Text style={[styles.modeDesc, { color: colors.textSecondary }]}>
                Cada um responde 10 perguntas • Mesmo dispositivo
              </Text>
            </View>
            <ChevronRight size={20} color="#3B82F6" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeCard, { backgroundColor: '#8B5CF6' + '12', borderColor: '#8B5CF6' + '30' }]}
            onPress={() => startGame('solo')}
            activeOpacity={0.8}
          >
            <View style={[styles.modeIconWrap, { backgroundColor: '#8B5CF6' }]}>
              <WifiOff size={24} color="#FFF" />
            </View>
            <View style={styles.modeInfo}>
              <Text style={[styles.modeTitle, { color: colors.text }]}>Modo Offline</Text>
              <Text style={[styles.modeDesc, { color: colors.textSecondary }]}>
                Jogue sem internet • Perguntas pré-carregadas
              </Text>
            </View>
            <ChevronRight size={20} color="#8B5CF6" />
          </TouchableOpacity>

          <View style={[styles.rulesCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <Text style={[styles.rulesTitle, { color: colors.text }]}>Como Funciona</Text>
            <View style={styles.ruleRow}>
              <View style={[styles.ruleDot, { backgroundColor: '#10B981' }]} />
              <Text style={[styles.ruleText, { color: colors.textSecondary }]}>Fácil = {POINTS_EASY} pts • Médio = {POINTS_MEDIUM} pts • Difícil = {POINTS_HARD} pts</Text>
            </View>
            <View style={styles.ruleRow}>
              <View style={[styles.ruleDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={[styles.ruleText, { color: colors.textSecondary }]}>Bônus por velocidade: até +30 pts por resposta</Text>
            </View>
            <View style={styles.ruleRow}>
              <View style={[styles.ruleDot, { backgroundColor: '#8B5CF6' }]} />
              <Text style={[styles.ruleText, { color: colors.textSecondary }]}>Combo 3x = +15 pts extras por acerto seguido</Text>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (gameMode === 'result') {
    const finalScore = isDuo ? Math.max(p1Score, p2Score) : score;
    const winner = isDuo ? (p1Score > p2Score ? 'Jogador 1' : p2Score > p1Score ? 'Jogador 2' : 'Empate') : null;

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <ScrollView contentContainerStyle={styles.resultContainer}>
          <Text style={styles.resultEmoji}>{isDuo ? '⚔️' : finalScore > 150 ? '🏆' : finalScore > 80 ? '🎉' : '📚'}</Text>

          {isDuo ? (
            <>
              <Text style={[styles.resultTitle, { color: colors.text }]}>Batalha Finalizada!</Text>
              <View style={styles.duoResultRow}>
                <View style={[styles.duoResultCard, p1Score >= p2Score && styles.duoWinner]}>
                  <Crown size={20} color={p1Score >= p2Score ? '#F59E0B' : colors.textMuted} />
                  <Text style={[styles.duoPlayerLabel, { color: colors.textMuted }]}>Jogador 1</Text>
                  <Text style={[styles.duoPlayerScore, { color: p1Score >= p2Score ? '#F59E0B' : colors.text }]}>{p1Score}</Text>
                  <Text style={[styles.duoPlayerPts, { color: colors.textMuted }]}>pontos</Text>
                </View>
                <Text style={[styles.vsText, { color: colors.textMuted }]}>VS</Text>
                <View style={[styles.duoResultCard, p2Score >= p1Score && styles.duoWinner]}>
                  <Crown size={20} color={p2Score >= p1Score ? '#F59E0B' : colors.textMuted} />
                  <Text style={[styles.duoPlayerLabel, { color: colors.textMuted }]}>Jogador 2</Text>
                  <Text style={[styles.duoPlayerScore, { color: p2Score >= p1Score ? '#F59E0B' : colors.text }]}>{p2Score}</Text>
                  <Text style={[styles.duoPlayerPts, { color: colors.textMuted }]}>pontos</Text>
                </View>
              </View>
              <Text style={[styles.winnerText, { color: '#F59E0B' }]}>
                {winner === 'Empate' ? '🤝 Empate!' : `🏆 ${winner} venceu!`}
              </Text>
            </>
          ) : (
            <>
              <Text style={[styles.resultTitle, { color: colors.text }]}>Batalha Concluída!</Text>
              <Text style={[styles.resultScore, { color: '#F59E0B' }]}>{score}</Text>
              <Text style={[styles.resultPts, { color: colors.textMuted }]}>pontos</Text>
              <View style={styles.resultStats}>
                <View style={styles.resultStat}>
                  <Zap size={16} color="#8B5CF6" />
                  <Text style={[styles.resultStatText, { color: colors.textSecondary }]}>Combo máx: {maxCombo}x</Text>
                </View>
                <View style={styles.resultStat}>
                  <Star size={16} color="#F59E0B" />
                  <Text style={[styles.resultStatText, { color: colors.textSecondary }]}>Total: {state.gamePoints + score} pts</Text>
                </View>
              </View>
            </>
          )}

          <View style={styles.resultActions}>
            <TouchableOpacity
              style={[styles.playAgainBtn, { backgroundColor: '#F59E0B' }]}
              onPress={handleRestart}
              activeOpacity={0.8}
            >
              <RotateCcw size={18} color="#FFF" />
              <Text style={styles.playAgainText}>Jogar Novamente</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.shareResultBtn, { borderColor: colors.border }]}
              onPress={() => void handleShareResult()}
              activeOpacity={0.7}
            >
              <Share2 size={18} color={colors.textSecondary} />
              <Text style={[styles.shareResultText, { color: colors.textSecondary }]}>Compartilhar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.back()} style={styles.exitBtn}>
              <Text style={[styles.exitText, { color: colors.textMuted }]}>Voltar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!question) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.gameHeader}>
        <TouchableOpacity onPress={() => { setGameMode('menu'); setTimerActive(false); }} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.gameHeaderCenter}>
          {isDuo && (
            <View style={[styles.turnBadge, { backgroundColor: duoTurn === 'player1' ? '#10B981' + '18' : '#3B82F6' + '18' }]}>
              <Text style={[styles.turnBadgeText, { color: duoTurn === 'player1' ? '#10B981' : '#3B82F6' }]}>
                {duoTurn === 'player1' ? 'Jogador 1' : 'Jogador 2'}
              </Text>
            </View>
          )}
          <Text style={[styles.questionCount, { color: colors.textMuted }]}>
            {currentQuestionNum}/{totalQuestions}
          </Text>
        </View>
        <View style={[styles.scoreBadge, { backgroundColor: '#F59E0B' + '18' }]}>
          <Trophy size={14} color="#F59E0B" />
          <Text style={[styles.scoreVal, { color: '#F59E0B' }]}>
            {isDuo ? (duoTurn === 'player1' ? p1Score : p2Score) : score}
          </Text>
        </View>
      </View>

      <View style={[styles.timerBar, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.timerFill,
            {
              backgroundColor: timerColor,
              width: `${(timeLeft / TIME_LIMIT) * 100}%` as `${number}%`,
            },
          ]}
        />
      </View>

      <View style={styles.timerRow}>
        <Timer size={14} color={timerColor} />
        <Text style={[styles.timerText, { color: timerColor }]}>{timeLeft}s</Text>
        {combo >= 2 && (
          <Animated.View style={[styles.comboBadge, { backgroundColor: '#8B5CF6' + '18', transform: [{ scale: combo >= 3 ? comboScale.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) : 1 }] }]}>
            <Zap size={12} color="#8B5CF6" />
            <Text style={styles.comboText}>{combo}x combo!</Text>
          </Animated.View>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.gameContent}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: shakeAnim }] }}>
          <View style={[
            styles.diffBadge,
            { backgroundColor: question.difficulty === 'facil' ? '#10B98118' : question.difficulty === 'medio' ? '#F59E0B18' : '#EF444418' },
          ]}>
            <Text style={[
              styles.diffText,
              { color: question.difficulty === 'facil' ? '#10B981' : question.difficulty === 'medio' ? '#F59E0B' : '#EF4444' },
            ]}>
              {question.difficulty === 'facil' ? 'Fácil' : question.difficulty === 'medio' ? 'Médio' : 'Difícil'} • +{getPointsForDifficulty(question.difficulty)} pts
            </Text>
          </View>

          <Text style={[styles.questionText, { color: colors.text }]}>{question.question}</Text>

          <View style={styles.options}>
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === question.correctIndex;
              let optBg = colors.card;
              let optBorder = colors.borderLight;
              let textCol = colors.text;

              if (showResult) {
                if (isCorrect) {
                  optBg = '#10B98118';
                  optBorder = '#10B981';
                  textCol = '#10B981';
                } else if (isSelected && !isCorrect) {
                  optBg = '#EF444418';
                  optBorder = '#EF4444';
                  textCol = '#EF4444';
                }
              }

              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.optionBtn, { backgroundColor: optBg, borderColor: optBorder }]}
                  onPress={() => handleAnswer(index)}
                  disabled={selectedAnswer !== null}
                  activeOpacity={0.7}
                >
                  <View style={[styles.optionLetterWrap, { backgroundColor: showResult && isCorrect ? '#10B98120' : showResult && isSelected && !isCorrect ? '#EF444420' : colors.backgroundSecondary }]}>
                    <Text style={[styles.optionLetter, { color: textCol }]}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <Text style={[styles.optionText, { color: textCol }]}>{option}</Text>
                  {showResult && isCorrect && <Check size={18} color="#10B981" />}
                  {showResult && isSelected && !isCorrect && <X size={18} color="#EF4444" />}
                </TouchableOpacity>
              );
            })}
          </View>

          {showResult && (
            <Animated.View style={[styles.explanationCard, { backgroundColor: colors.cardElevated, borderColor: colors.borderLight, transform: [{ scale: resultScale }] }]}>
              <Text style={[styles.explanationTitle, { color: colors.text }]}>
                {selectedAnswer === question.correctIndex ? '✅ Correto!' : selectedAnswer === -1 ? '⏰ Tempo esgotado!' : '❌ Incorreto'}
              </Text>
              <Text style={[styles.explanationText, { color: colors.textSecondary }]}>{question.explanation}</Text>
              <TouchableOpacity
                style={[styles.nextBtn, { backgroundColor: '#F59E0B' }]}
                onPress={handleNext}
                activeOpacity={0.8}
              >
                <Text style={styles.nextBtnText}>
                  {currentIndex < shuffledQuestions.length - 1 ? 'Próxima' : 'Ver Resultado'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>

      <Modal visible={showTurnModal} transparent animationType="none">
        <View style={styles.turnModalOverlay}>
          <Animated.View style={[styles.turnModalCard, { transform: [{ scale: turnModalScale }] }]}>
            <Text style={styles.turnModalEmoji}>{duoTurn === 'player1' ? '🟢' : '🔵'}</Text>
            <Text style={styles.turnModalTitle}>
              {duoTurn === 'player1' ? 'Jogador 1' : 'Jogador 2'}
            </Text>
            <Text style={styles.turnModalSubtitle}>
              {duoTurn === 'player1' ? 'Você começa! Responda 10 perguntas.' : 'Sua vez! Responda 10 perguntas.'}
            </Text>
            {duoTurn === 'player2' && (
              <Text style={styles.turnModalScore}>Jogador 1 fez {p1Score} pontos</Text>
            )}
            <TouchableOpacity style={styles.turnStartBtn} onPress={startTurn} activeOpacity={0.8}>
              <Text style={styles.turnStartText}>COMEÇAR</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { padding: 4 },
  menuTitle: { fontSize: 20, fontWeight: '800' as const },
  menuContent: { padding: 20, paddingTop: 8 },
  trophySection: { alignItems: 'center', marginBottom: 24 },
  trophyCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuSubtitle: { fontSize: 15, textAlign: 'center' as const },
  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  menuStatCard: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  menuStatNum: { fontSize: 22, fontWeight: '800' as const },
  menuStatLabel: { fontSize: 10, fontWeight: '500' as const },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    gap: 14,
  },
  modeIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeInfo: { flex: 1 },
  modeTitle: { fontSize: 16, fontWeight: '700' as const },
  modeDesc: { fontSize: 12, marginTop: 3, lineHeight: 18 },
  rulesCard: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 8,
  },
  rulesTitle: { fontSize: 16, fontWeight: '700' as const, marginBottom: 14 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  ruleDot: { width: 6, height: 6, borderRadius: 3 },
  ruleText: { fontSize: 13, flex: 1, lineHeight: 18 },
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  gameHeaderCenter: { flex: 1, alignItems: 'center' },
  turnBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, marginBottom: 2 },
  turnBadgeText: { fontSize: 11, fontWeight: '700' as const },
  questionCount: { fontSize: 12, fontWeight: '600' as const },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  scoreVal: { fontSize: 14, fontWeight: '800' as const },
  timerBar: { height: 4, marginHorizontal: 16, borderRadius: 2, overflow: 'hidden' as const },
  timerFill: { height: '100%' as const, borderRadius: 2 },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  timerText: { fontSize: 13, fontWeight: '700' as const },
  comboBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 8,
  },
  comboText: { fontSize: 11, fontWeight: '700' as const, color: '#8B5CF6' },
  gameContent: { padding: 20, paddingTop: 8, paddingBottom: 40 },
  diffBadge: {
    alignSelf: 'flex-start' as const,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 14,
  },
  diffText: { fontSize: 12, fontWeight: '700' as const },
  questionText: { fontSize: 20, fontWeight: '700' as const, lineHeight: 30, marginBottom: 22 },
  options: { gap: 10 },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 12,
  },
  optionLetterWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLetter: { fontSize: 14, fontWeight: '800' as const },
  optionText: { fontSize: 14, fontWeight: '500' as const, flex: 1, lineHeight: 20 },
  explanationCard: {
    marginTop: 22,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
  },
  explanationTitle: { fontSize: 16, fontWeight: '700' as const, marginBottom: 6 },
  explanationText: { fontSize: 13, lineHeight: 20, marginBottom: 14 },
  nextBtn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  nextBtnText: { fontSize: 15, fontWeight: '700' as const, color: '#FFF' },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  resultEmoji: { fontSize: 64, marginBottom: 16 },
  resultTitle: { fontSize: 26, fontWeight: '800' as const, marginBottom: 8 },
  resultScore: { fontSize: 56, fontWeight: '900' as const },
  resultPts: { fontSize: 16, marginBottom: 16 },
  resultStats: { flexDirection: 'row', gap: 20, marginBottom: 28 },
  resultStat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  resultStatText: { fontSize: 13, fontWeight: '600' as const },
  duoResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 20,
    marginBottom: 16,
  },
  duoResultCard: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#1A1A1A',
    gap: 6,
  },
  duoWinner: { borderWidth: 2, borderColor: '#F59E0B' },
  duoPlayerLabel: { fontSize: 12, fontWeight: '600' as const },
  duoPlayerScore: { fontSize: 32, fontWeight: '900' as const },
  duoPlayerPts: { fontSize: 11 },
  vsText: { fontSize: 18, fontWeight: '800' as const },
  winnerText: { fontSize: 18, fontWeight: '800' as const, marginBottom: 24 },
  resultActions: { width: '100%' as const, gap: 12 },
  playAgainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  playAgainText: { fontSize: 16, fontWeight: '700' as const, color: '#FFF' },
  shareResultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  shareResultText: { fontSize: 15, fontWeight: '600' as const },
  exitBtn: { paddingVertical: 10, alignItems: 'center' },
  exitText: { fontSize: 14, textDecorationLine: 'underline' as const },
  turnModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  turnModalCard: {
    width: '100%' as const,
    backgroundColor: '#111',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
  },
  turnModalEmoji: { fontSize: 48, marginBottom: 12 },
  turnModalTitle: { fontSize: 24, fontWeight: '900' as const, color: '#FFF', marginBottom: 8 },
  turnModalSubtitle: { fontSize: 14, color: '#AAA', textAlign: 'center' as const, marginBottom: 12, lineHeight: 20 },
  turnModalScore: { fontSize: 13, color: '#F59E0B', fontWeight: '700' as const, marginBottom: 16 },
  turnStartBtn: {
    backgroundColor: '#F59E0B',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 14,
    marginTop: 8,
  },
  turnStartText: { fontSize: 16, fontWeight: '800' as const, color: '#FFF', letterSpacing: 1 },
});
