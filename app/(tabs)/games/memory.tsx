import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { ArrowLeft, RotateCcw, Trophy, Clock, Star } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';

interface MemoryCard {
  id: number;
  content: string;
  pairId: number;
  isFlipped: boolean;
  isMatched: boolean;
}

const VERSE_PAIRS = [
  { reference: 'João 3:16', text: 'Porque Deus amou o mundo...' },
  { reference: 'Sl 23:1', text: 'O Senhor é meu pastor...' },
  { reference: 'Fp 4:13', text: 'Tudo posso naquele...' },
  { reference: 'Rm 8:28', text: 'Todas as coisas cooperam...' },
  { reference: 'Is 41:10', text: 'Não temas, eu sou contigo...' },
  { reference: 'Jr 29:11', text: 'Planos de paz e não de mal...' },
  { reference: 'Pv 3:5', text: 'Confia no Senhor...' },
  { reference: 'Mt 6:33', text: 'Buscai primeiro o Reino...' },
];

type Difficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTY_CONFIG = {
  easy: { pairs: 4, label: 'Fácil', emoji: '🕊️', color: '#4CAF50' },
  medium: { pairs: 6, label: 'Médio', emoji: '📖', color: '#2196F3' },
  hard: { pairs: 8, label: 'Difícil', emoji: '⚔️', color: '#F44336' },
};

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function MemoryGameScreen() {
  const router = useRouter();
  const { colors } = useApp();

  const [gameState, setGameState] = useState<'menu' | 'playing' | 'won'>('menu');
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [timer, setTimer] = useState(0);
  const [bestTimes, setBestTimes] = useState<Record<Difficulty, number | null>>({ easy: null, medium: null, hard: null });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const flipAnims = useRef<Animated.Value[]>([]);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const initGame = useCallback((diff: Difficulty) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const config = DIFFICULTY_CONFIG[diff];
    const selectedPairs = shuffleArray(VERSE_PAIRS).slice(0, config.pairs);

    const gameCards: MemoryCard[] = [];
    selectedPairs.forEach((pair, idx) => {
      gameCards.push({ id: idx * 2, content: pair.reference, pairId: idx, isFlipped: false, isMatched: false });
      gameCards.push({ id: idx * 2 + 1, content: pair.text, pairId: idx, isFlipped: false, isMatched: false });
    });

    const shuffled = shuffleArray(gameCards);
    flipAnims.current = shuffled.map(() => new Animated.Value(0));
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setTimer(0);
    setDifficulty(diff);
    setGameState('playing');

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const flipCard = useCallback((index: number) => {
    if (flippedCards.length >= 2) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Animated.timing(flipAnims.current[index], { toValue: 1, duration: 200, useNativeDriver: true }).start();

    const newCards = [...cards];
    newCards[index] = { ...newCards[index], isFlipped: true };
    setCards(newCards);

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      const [first, second] = newFlipped;
      if (newCards[first].pairId === newCards[second].pairId) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => {
          setCards(prev => prev.map((c, i) =>
            i === first || i === second ? { ...c, isMatched: true } : c
          ));
          setFlippedCards([]);
          setMatches(prev => {
            const newMatches = prev + 1;
            if (newMatches === DIFFICULTY_CONFIG[difficulty].pairs) {
              if (timerRef.current) clearInterval(timerRef.current);
              setGameState('won');
              setBestTimes(prevBest => {
                const currentBest = prevBest[difficulty];
                if (currentBest === null || timer < currentBest) {
                  return { ...prevBest, [difficulty]: timer };
                }
                return prevBest;
              });
            }
            return newMatches;
          });
        }, 300);
      } else {
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(flipAnims.current[first], { toValue: 0, duration: 200, useNativeDriver: true }),
            Animated.timing(flipAnims.current[second], { toValue: 0, duration: 200, useNativeDriver: true }),
          ]).start();
          setCards(prev => prev.map((c, i) =>
            i === first || i === second ? { ...c, isFlipped: false } : c
          ));
          setFlippedCards([]);
        }, 800);
      }
    }
  }, [cards, flippedCards, difficulty, timer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const totalPairs = DIFFICULTY_CONFIG[difficulty].pairs;
  const columns = difficulty === 'hard' ? 4 : difficulty === 'medium' ? 4 : 4;

  const renderMenu = () => (
    <View style={styles.menuContainer}>
      <Text style={styles.menuEmoji}>🧠</Text>
      <Text style={[styles.menuTitle, { color: colors.text }]}>Memória Bíblica</Text>
      <Text style={[styles.menuSubtitle, { color: colors.textMuted }]}>
        Combine versículos com suas referências!
      </Text>

      <View style={styles.difficultyList}>
        {(Object.entries(DIFFICULTY_CONFIG) as [Difficulty, typeof DIFFICULTY_CONFIG['easy']][]).map(([key, config]) => (
          <TouchableOpacity
            key={key}
            style={[styles.diffBtn, { backgroundColor: config.color + '12', borderColor: config.color + '30' }]}
            onPress={() => initGame(key)}
            activeOpacity={0.7}
            testID={`memory-diff-${key}`}
          >
            <Text style={styles.diffEmoji}>{config.emoji}</Text>
            <View style={styles.diffInfo}>
              <Text style={[styles.diffName, { color: colors.text }]}>{config.label}</Text>
              <Text style={[styles.diffDesc, { color: colors.textMuted }]}>{config.pairs} pares de versículos</Text>
            </View>
            {bestTimes[key] !== null && (
              <View style={[styles.bestTimeBadge, { backgroundColor: config.color + '18' }]}>
                <Clock size={12} color={config.color} />
                <Text style={[styles.bestTimeText, { color: config.color }]}>{formatTime(bestTimes[key] as number)}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.howToPlay, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
        <Text style={[styles.howToPlayTitle, { color: colors.text }]}>Como jogar:</Text>
        <Text style={[styles.howToPlayText, { color: colors.textSecondary }]}>
          Toque nas cartas para virá-las. Encontre o par correto: referência + trecho do versículo. Menos jogadas = melhor!
        </Text>
      </View>
    </View>
  );

  const renderGame = () => (
    <View style={styles.gameContainer}>
      <View style={styles.gameStats}>
        <View style={[styles.statBadge, { backgroundColor: '#C5943A' + '15' }]}>
          <Star size={14} color="#C5943A" />
          <Text style={[styles.statBadgeText, { color: '#C5943A' }]}>{matches}/{totalPairs}</Text>
        </View>
        <View style={[styles.statBadge, { backgroundColor: colors.card }]}>
          <Clock size={14} color={colors.textMuted} />
          <Text style={[styles.statBadgeText, { color: colors.text }]}>{formatTime(timer)}</Text>
        </View>
        <View style={[styles.statBadge, { backgroundColor: colors.card }]}>
          <Text style={[styles.statBadgeText, { color: colors.text }]}>{moves} jogadas</Text>
        </View>
      </View>

      <View style={[styles.cardsGrid, { width: columns * 82 }]}>
        {cards.map((card, index) => {
          const rotateY = flipAnims.current[index]?.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '180deg'],
          }) ?? '0deg';

          return (
            <TouchableOpacity
              key={card.id}
              style={[
                styles.card,
                card.isMatched && styles.cardMatched,
                { borderColor: card.isMatched ? '#4CAF50' + '50' : colors.borderLight },
              ]}
              onPress={() => flipCard(index)}
              activeOpacity={0.7}
              disabled={card.isMatched || flippedCards.length >= 2}
              testID={`memory-card-${index}`}
            >
              {card.isFlipped || card.isMatched ? (
                <View style={[styles.cardFront, { backgroundColor: card.isMatched ? '#4CAF50' + '10' : '#C5943A' + '08' }]}>
                  <Text style={[styles.cardText, { color: card.isMatched ? '#4CAF50' : colors.text }]} numberOfLines={3}>
                    {card.content}
                  </Text>
                </View>
              ) : (
                <Animated.View style={[styles.cardBack, { backgroundColor: '#C5943A' + '15', transform: [{ rotateY }] }]}>
                  <Text style={styles.cardBackEmoji}>✝️</Text>
                </Animated.View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderWon = () => (
    <View style={styles.wonContainer}>
      <View style={[styles.wonCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
        <Text style={styles.wonEmoji}>🎉</Text>
        <Text style={[styles.wonTitle, { color: colors.text }]}>Parabéns!</Text>
        <Text style={[styles.wonScore, { color: '#C5943A' }]}>{formatTime(timer)}</Text>
        <Text style={[styles.wonMoves, { color: colors.textMuted }]}>{moves} jogadas</Text>

        {bestTimes[difficulty] === timer && (
          <View style={[styles.newRecordBadge, { backgroundColor: '#FFD700' + '20' }]}>
            <Trophy size={14} color="#FFD700" />
            <Text style={[styles.newRecordText, { color: '#FFD700' }]}>Novo Recorde!</Text>
          </View>
        )}

        <Text style={[styles.wonVerse, { color: colors.textSecondary }]}>
          "Escondi a tua palavra no meu coração" — Salmos 119:11
        </Text>

        <View style={styles.wonActions}>
          <TouchableOpacity style={[styles.wonBtn, { backgroundColor: '#C5943A' }]} onPress={() => initGame(difficulty)}>
            <RotateCcw size={16} color="#FFF" />
            <Text style={styles.wonBtnText}>Jogar Novamente</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.wonBtnSecondary, { borderColor: colors.border }]} onPress={() => setGameState('menu')}>
            <Text style={[styles.wonBtnSecondaryText, { color: colors.textSecondary }]}>Menu</Text>
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
        <Text style={[styles.topBarTitle, { color: colors.text }]}>Memória Bíblica</Text>
        <View style={styles.backBtn} />
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {gameState === 'menu' && renderMenu()}
          {gameState === 'playing' && renderGame()}
          {gameState === 'won' && renderWon()}
        </ScrollView>
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
  scrollContent: {
    paddingBottom: 40,
  },
  menuContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
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
    marginBottom: 24,
  },
  difficultyList: {
    width: '100%',
    gap: 8,
    marginBottom: 20,
  },
  diffBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  diffEmoji: {
    fontSize: 24,
  },
  diffInfo: {
    flex: 1,
  },
  diffName: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  diffDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  bestTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bestTimeText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  howToPlay: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  howToPlayTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    marginBottom: 6,
  },
  howToPlayText: {
    fontSize: 13,
    lineHeight: 20,
  },
  gameContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  gameStats: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  statBadgeText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  card: {
    width: 76,
    height: 90,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden' as const,
  },
  cardMatched: {
    opacity: 0.7,
  },
  cardFront: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
  },
  cardText: {
    fontSize: 10,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    lineHeight: 14,
  },
  cardBack: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 11,
  },
  cardBackEmoji: {
    fontSize: 24,
  },
  wonContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  wonCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 30,
    alignItems: 'center',
  },
  wonEmoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  wonTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    marginBottom: 8,
  },
  wonScore: {
    fontSize: 36,
    fontWeight: '800' as const,
    marginBottom: 4,
  },
  wonMoves: {
    fontSize: 14,
    marginBottom: 12,
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
  wonVerse: {
    fontSize: 13,
    fontStyle: 'italic' as const,
    textAlign: 'center' as const,
    marginBottom: 24,
    lineHeight: 20,
  },
  wonActions: {
    gap: 10,
    width: '100%',
  },
  wonBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  wonBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  wonBtnSecondary: {
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  wonBtnSecondaryText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
});
