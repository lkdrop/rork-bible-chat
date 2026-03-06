import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Play,
  RotateCcw,
  Trophy,
  Pause,
  Zap,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BOARD_SIZE = Math.min(SCREEN_WIDTH - 40, 360);
const GRID_SIZE = 15;
const CELL_SIZE = Math.floor(BOARD_SIZE / GRID_SIZE);
const ACTUAL_BOARD = CELL_SIZE * GRID_SIZE;

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };
type GameState = 'menu' | 'playing' | 'paused' | 'gameover';

const BIBLE_ITEMS = [
  { emoji: '🍎', name: 'Fruto', points: 10 },
  { emoji: '🐟', name: 'Peixe', points: 15 },
  { emoji: '🍞', name: 'Pão', points: 20 },
  { emoji: '⭐', name: 'Estrela', points: 30 },
  { emoji: '✝️', name: 'Cruz', points: 50 },
];

const SPEED_LEVELS = [
  { name: 'Cordeiro', speed: 200, color: '#4CAF50' },
  { name: 'Discípulo', speed: 150, color: '#2196F3' },
  { name: 'Apóstolo', speed: 100, color: '#FF9800' },
  { name: 'Profeta', speed: 70, color: '#F44336' },
];

export default function SnakeGameScreen() {
  const router = useRouter();
  const { colors } = useApp();

  const [gameState, setGameState] = useState<GameState>('menu');
  const [snake, setSnake] = useState<Position[]>([{ x: 7, y: 7 }]);
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [foodType, setFoodType] = useState(0);
  const [, setDirection] = useState<Direction>('RIGHT');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speedLevel, setSpeedLevel] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const directionRef = useRef<Direction>('RIGHT');
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scoreAnim = useRef(new Animated.Value(1)).current;
  const boardFade = useRef(new Animated.Value(0)).current;
  const menuScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(boardFade, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(menuScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
    ]).start();
  }, [boardFade, menuScale]);

  const generateFood = useCallback((currentSnake: Position[]): { pos: Position; type: number } => {
    let newPos: Position;
    do {
      newPos = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (currentSnake.some(s => s.x === newPos.x && s.y === newPos.y));

    const rand = Math.random();
    let type = 0;
    if (rand > 0.95) type = 4;
    else if (rand > 0.85) type = 3;
    else if (rand > 0.7) type = 2;
    else if (rand > 0.5) type = 1;

    return { pos: newPos, type };
  }, []);

  const moveSnake = useCallback(() => {
    setSnake(prevSnake => {
      const head = prevSnake[0];
      const dir = directionRef.current;

      let newHead: Position;
      switch (dir) {
        case 'UP': newHead = { x: head.x, y: head.y - 1 }; break;
        case 'DOWN': newHead = { x: head.x, y: head.y + 1 }; break;
        case 'LEFT': newHead = { x: head.x - 1, y: head.y }; break;
        case 'RIGHT': newHead = { x: head.x + 1, y: head.y }; break;
      }

      if (
        newHead.x < 0 || newHead.x >= GRID_SIZE ||
        newHead.y < 0 || newHead.y >= GRID_SIZE ||
        prevSnake.some(s => s.x === newHead.x && s.y === newHead.y)
      ) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        setGameState('gameover');
        setHighScore(prev => Math.max(prev, score));
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      if (newHead.x === food.x && newHead.y === food.y) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const points = BIBLE_ITEMS[foodType].points;
        setScore(prev => prev + points);

        Animated.sequence([
          Animated.timing(scoreAnim, { toValue: 1.3, duration: 100, useNativeDriver: true }),
          Animated.timing(scoreAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();

        const newFood = generateFood(newSnake);
        setFood(newFood.pos);
        setFoodType(newFood.type);

        return newSnake;
      }

      newSnake.pop();
      return newSnake;
    });
  }, [food, foodType, generateFood, score, scoreAnim]);

  const startGame = useCallback((level: number) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setSpeedLevel(level);
    const initialSnake = [{ x: 7, y: 7 }, { x: 6, y: 7 }, { x: 5, y: 7 }];
    setSnake(initialSnake);
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setScore(0);
    setIsPaused(false);

    const newFood = generateFood(initialSnake);
    setFood(newFood.pos);
    setFoodType(newFood.type);
    setGameState('playing');
  }, [generateFood]);

  useEffect(() => {
    if (gameState === 'playing' && !isPaused) {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      gameLoopRef.current = setInterval(moveSnake, SPEED_LEVELS[speedLevel].speed);
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameState, isPaused, moveSnake, speedLevel]);

  const changeDirection = useCallback((newDir: Direction) => {
    const current = directionRef.current;
    if (
      (newDir === 'UP' && current === 'DOWN') ||
      (newDir === 'DOWN' && current === 'UP') ||
      (newDir === 'LEFT' && current === 'RIGHT') ||
      (newDir === 'RIGHT' && current === 'LEFT')
    ) return;

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    directionRef.current = newDir;
    setDirection(newDir);
  }, []);

  const togglePause = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsPaused(prev => !prev);
  }, []);

  const getSnakeCellStyle = (index: number, pos: Position) => {
    const isHead = index === 0;
    const intensity = Math.max(0.4, 1 - (index / snake.length) * 0.6);

    return {
      position: 'absolute' as const,
      left: pos.x * CELL_SIZE,
      top: pos.y * CELL_SIZE,
      width: CELL_SIZE - 1,
      height: CELL_SIZE - 1,
      borderRadius: isHead ? CELL_SIZE / 3 : CELL_SIZE / 4,
      backgroundColor: isHead ? '#C5943A' : `rgba(197, 148, 58, ${intensity})`,
      ...(isHead ? {
        borderWidth: 1,
        borderColor: '#8B6914',
      } : {}),
    };
  };

  const renderMenu = () => (
    <Animated.View style={[styles.menuContainer, { transform: [{ scale: menuScale }] }]}>
      <View style={styles.menuHeader}>
        <Text style={styles.menuEmoji}>🐍</Text>
        <Text style={[styles.menuTitle, { color: colors.text }]}>Serpente Bíblica</Text>
        <Text style={[styles.menuSubtitle, { color: colors.textMuted }]}>
          Colete itens sagrados e cresça em sabedoria!
        </Text>
      </View>

      {highScore > 0 && (
        <View style={[styles.highScoreCard, { backgroundColor: '#C5943A' + '15', borderColor: '#C5943A' + '30' }]}>
          <Trophy size={18} color="#C5943A" />
          <Text style={[styles.highScoreText, { color: '#C5943A' }]}>Recorde: {highScore} pts</Text>
        </View>
      )}

      <Text style={[styles.difficultyLabel, { color: colors.textSecondary }]}>Escolha a dificuldade:</Text>

      {SPEED_LEVELS.map((level, i) => (
        <TouchableOpacity
          key={level.name}
          style={[styles.levelButton, { backgroundColor: level.color + '12', borderColor: level.color + '30' }]}
          onPress={() => startGame(i)}
          activeOpacity={0.7}
          testID={`level-${i}`}
        >
          <View style={[styles.levelIcon, { backgroundColor: level.color + '20' }]}>
            <Zap size={18} color={level.color} />
          </View>
          <View style={styles.levelInfo}>
            <Text style={[styles.levelName, { color: colors.text }]}>{level.name}</Text>
            <Text style={[styles.levelDesc, { color: colors.textMuted }]}>
              {i === 0 ? 'Velocidade lenta' : i === 1 ? 'Velocidade média' : i === 2 ? 'Velocidade rápida' : 'Velocidade extrema'}
            </Text>
          </View>
          <Play size={16} color={level.color} />
        </TouchableOpacity>
      ))}

      <View style={[styles.itemsLegend, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
        <Text style={[styles.legendTitle, { color: colors.text }]}>Itens para coletar:</Text>
        <View style={styles.legendItems}>
          {BIBLE_ITEMS.map(item => (
            <View key={item.name} style={styles.legendItem}>
              <Text style={styles.legendEmoji}>{item.emoji}</Text>
              <Text style={[styles.legendPoints, { color: colors.textMuted }]}>+{item.points}</Text>
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );

  const renderGame = () => (
    <View style={styles.gameContainer}>
      <View style={styles.gameHeader}>
        <View style={styles.scoreSection}>
          <Animated.Text style={[styles.scoreValue, { color: '#C5943A', transform: [{ scale: scoreAnim }] }]}>
            {String(score)}
          </Animated.Text>
          <Text style={[styles.scoreLabel, { color: colors.textMuted }]}>pontos</Text>
        </View>
        <View style={[styles.levelBadge, { backgroundColor: SPEED_LEVELS[speedLevel].color + '18' }]}>
          <Text style={[styles.levelBadgeText, { color: SPEED_LEVELS[speedLevel].color }]}>
            {SPEED_LEVELS[speedLevel].name}
          </Text>
        </View>
        <TouchableOpacity onPress={togglePause} style={styles.pauseBtn} testID="pause-btn">
          <Pause size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={[styles.board, { width: ACTUAL_BOARD, height: ACTUAL_BOARD, backgroundColor: colors.card, borderColor: colors.borderLight }]}>
        {Array.from({ length: GRID_SIZE }).map((_, row) =>
          Array.from({ length: GRID_SIZE }).map((__, col) => (
            <View
              key={`${row}-${col}`}
              style={[
                styles.gridCell,
                {
                  left: col * CELL_SIZE,
                  top: row * CELL_SIZE,
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  backgroundColor: (row + col) % 2 === 0
                    ? 'rgba(197,148,58,0.04)'
                    : 'transparent',
                },
              ]}
            />
          ))
        )}

        {snake.map((pos, i) => (
          <View key={`snake-${i}`} style={getSnakeCellStyle(i, pos)} />
        ))}

        <View style={[styles.foodCell, { left: food.x * CELL_SIZE, top: food.y * CELL_SIZE, width: CELL_SIZE, height: CELL_SIZE }]}>
          <Text style={[styles.foodEmoji, { fontSize: CELL_SIZE * 0.7 }]}>{BIBLE_ITEMS[foodType].emoji}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <View style={styles.controlRow}>
          <View style={styles.controlSpacer} />
          <TouchableOpacity
            style={[styles.controlBtn, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
            onPress={() => changeDirection('UP')}
            testID="control-up"
          >
            <ArrowUp size={28} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.controlSpacer} />
        </View>
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={[styles.controlBtn, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
            onPress={() => changeDirection('LEFT')}
            testID="control-left"
          >
            <ArrowLeft size={28} color={colors.text} />
          </TouchableOpacity>
          <View style={[styles.controlCenter, { backgroundColor: '#C5943A' + '15' }]}>
            <Text style={styles.controlCenterEmoji}>🐍</Text>
          </View>
          <TouchableOpacity
            style={[styles.controlBtn, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
            onPress={() => changeDirection('RIGHT')}
            testID="control-right"
          >
            <ArrowRight size={28} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.controlRow}>
          <View style={styles.controlSpacer} />
          <TouchableOpacity
            style={[styles.controlBtn, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
            onPress={() => changeDirection('DOWN')}
            testID="control-down"
          >
            <ArrowDown size={28} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.controlSpacer} />
        </View>
      </View>

      {isPaused && (
        <View style={styles.pauseOverlay}>
          <View style={[styles.pauseModal, { backgroundColor: colors.card }]}>
            <Text style={[styles.pauseTitle, { color: colors.text }]}>Pausado</Text>
            <TouchableOpacity
              style={[styles.pauseResumeBtn, { backgroundColor: '#C5943A' }]}
              onPress={togglePause}
            >
              <Play size={18} color="#FFF" />
              <Text style={styles.pauseResumeBtnText}>Continuar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.pauseQuitBtn, { borderColor: colors.border }]}
              onPress={() => { setGameState('menu'); setIsPaused(false); }}
            >
              <Text style={[styles.pauseQuitText, { color: colors.textMuted }]}>Sair do Jogo</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  const renderGameOver = () => (
    <View style={styles.gameOverContainer}>
      <View style={[styles.gameOverCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
        <Text style={styles.gameOverEmoji}>{score >= 100 ? '🏆' : score >= 50 ? '⭐' : '🐍'}</Text>
        <Text style={[styles.gameOverTitle, { color: colors.text }]}>
          {score >= 100 ? 'Incrível!' : score >= 50 ? 'Muito Bem!' : 'Boa Tentativa!'}
        </Text>
        <Text style={[styles.gameOverScore, { color: '#C5943A' }]}>{score} pontos</Text>

        {score >= highScore && score > 0 && (
          <View style={[styles.newRecordBadge, { backgroundColor: '#FFD700' + '20' }]}>
            <Trophy size={14} color="#FFD700" />
            <Text style={[styles.newRecordText, { color: '#FFD700' }]}>Novo Recorde!</Text>
          </View>
        )}

        <Text style={[styles.gameOverVerse, { color: colors.textSecondary }]}>
          "Tudo posso naquele que me fortalece" — Filipenses 4:13
        </Text>

        <View style={styles.gameOverActions}>
          <TouchableOpacity
            style={[styles.gameOverBtn, { backgroundColor: '#C5943A' }]}
            onPress={() => startGame(speedLevel)}
          >
            <RotateCcw size={16} color="#FFF" />
            <Text style={styles.gameOverBtnText}>Jogar Novamente</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.gameOverBtnSecondary, { borderColor: colors.border }]}
            onPress={() => setGameState('menu')}
          >
            <Text style={[styles.gameOverBtnSecondaryText, { color: colors.textSecondary }]}>Menu</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="back-btn">
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: colors.text }]}>Serpente Bíblica</Text>
        <View style={styles.backBtn} />
      </View>

      <Animated.View style={[styles.content, { opacity: boardFade }]}>
        {gameState === 'menu' && renderMenu()}
        {(gameState === 'playing' || gameState === 'paused') && renderGame()}
        {gameState === 'gameover' && renderGameOver()}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  content: {
    flex: 1,
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  menuHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  menuEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  menuTitle: {
    fontSize: 26,
    fontWeight: '800' as const,
    marginBottom: 6,
  },
  menuSubtitle: {
    fontSize: 14,
    textAlign: 'center' as const,
  },
  highScoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    alignSelf: 'center' as const,
  },
  highScoreText: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  difficultyLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 10,
  },
  levelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  levelIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelInfo: {
    flex: 1,
  },
  levelName: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  levelDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  itemsLegend: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginTop: 12,
  },
  legendTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    marginBottom: 10,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    alignItems: 'center',
    gap: 4,
  },
  legendEmoji: {
    fontSize: 22,
  },
  legendPoints: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  gameContainer: {
    flex: 1,
    alignItems: 'center',
  },
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: ACTUAL_BOARD,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  scoreSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: '800' as const,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  pauseBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  board: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden' as const,
    position: 'relative' as const,
  },
  gridCell: {
    position: 'absolute' as const,
  },
  foodCell: {
    position: 'absolute' as const,
    justifyContent: 'center',
    alignItems: 'center',
  },
  foodEmoji: {
    textAlign: 'center' as const,
  },
  controls: {
    marginTop: 20,
    gap: 4,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  controlBtn: {
    width: 64,
    height: 64,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlCenter: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlCenterEmoji: {
    fontSize: 24,
  },
  controlSpacer: {
    width: 64,
    height: 64,
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseModal: {
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: 260,
  },
  pauseTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    marginBottom: 20,
  },
  pauseResumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 12,
  },
  pauseResumeBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  pauseQuitBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
  },
  pauseQuitText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  gameOverContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  gameOverCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 30,
    alignItems: 'center',
  },
  gameOverEmoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  gameOverTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    marginBottom: 8,
  },
  gameOverScore: {
    fontSize: 36,
    fontWeight: '800' as const,
    marginBottom: 8,
  },
  newRecordBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 16,
  },
  newRecordText: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  gameOverVerse: {
    fontSize: 13,
    fontStyle: 'italic' as const,
    textAlign: 'center' as const,
    marginBottom: 24,
    lineHeight: 20,
  },
  gameOverActions: {
    gap: 10,
    width: '100%' as const,
  },
  gameOverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  gameOverBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  gameOverBtnSecondary: {
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  gameOverBtnSecondaryText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
});
