import React, { useRef, useEffect } from 'react';
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
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Trophy,
  Gamepad2,
  Brain,
  ChevronRight,
  Crown,
  Zap,
  Star,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';

interface GameCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  emoji: string;
  color: string;
  route: string;
  image: string;
  badge?: string;
}

const GAMES: GameCard[] = [
  {
    id: 'battle',
    title: 'Batalha Bíblica',
    subtitle: 'Quiz com pontos e timer',
    description: 'Teste seus conhecimentos com perguntas bíblicas. Jogue solo, com amigo ou offline!',
    emoji: '⚔️',
    color: '#F59E0B',
    route: '/games/bible-battle',
    image: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=600&q=80',
    badge: 'Popular',
  },
  {
    id: 'snake',
    title: 'Serpente Bíblica',
    subtitle: 'Snake Game com tema bíblico',
    description: 'Colete itens sagrados e cresça em sabedoria! 4 níveis de dificuldade.',
    emoji: '🐍',
    color: '#10B981',
    route: '/games/snake',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80',
    badge: 'Novo',
  },
  {
    id: 'memory',
    title: 'Memória Bíblica',
    subtitle: 'Combine versículos',
    description: 'Encontre os pares: referência + trecho do versículo. Treine sua memória!',
    emoji: '🧠',
    color: '#8B5CF6',
    route: '/games/memory',
    image: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600&q=80',
    badge: 'Novo',
  },
];

export default function GamesHubScreen() {
  const router = useRouter();
  const { colors, state } = useApp();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const navigateToGame = (route: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(route as never);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Games</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>Aprenda brincando com a Palavra</Text>
            </View>
            <View style={[styles.pointsBadge, { backgroundColor: '#F59E0B' + '15' }]}>
              <Trophy size={16} color="#F59E0B" />
              <Text style={[styles.pointsText, { color: '#F59E0B' }]}>{state.gamePoints}</Text>
            </View>
          </View>

          <View style={[styles.statsRow, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#F59E0B' + '15' }]}>
                <Trophy size={16} color="#F59E0B" />
              </View>
              <View>
                <Text style={[styles.statValue, { color: colors.text }]}>{state.gamePoints}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Pontos</Text>
              </View>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#10B981' + '15' }]}>
                <Crown size={16} color="#10B981" />
              </View>
              <View>
                <Text style={[styles.statValue, { color: colors.text }]}>{state.gameBattlesWon}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Vitórias</Text>
              </View>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#8B5CF6' + '15' }]}>
                <Zap size={16} color="#8B5CF6" />
              </View>
              <View>
                <Text style={[styles.statValue, { color: colors.text }]}>{state.gameTotalBattles}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Partidas</Text>
              </View>
            </View>
          </View>

          <View style={styles.featuredSection}>
            <TouchableOpacity
              style={styles.featuredCard}
              onPress={() => navigateToGame('/games/bible-battle')}
              activeOpacity={0.85}
              testID="featured-game"
            >
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=800&q=80' }}
                style={styles.featuredImage}
                contentFit="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.85)']}
                style={styles.featuredOverlay}
              >
                <View style={[styles.featuredBadge, { backgroundColor: '#F59E0B' }]}>
                  <Star size={10} color="#FFF" />
                  <Text style={styles.featuredBadgeText}>Destaque</Text>
                </View>
                <Text style={styles.featuredTitle}>Batalha Bíblica</Text>
                <Text style={styles.featuredSubtitle}>
                  Desafie seus amigos ou jogue solo. Quiz bíblico com timer, combo e ranking!
                </Text>
                <View style={styles.featuredAction}>
                  <Gamepad2 size={16} color="#FFF" />
                  <Text style={styles.featuredActionText}>Jogar Agora</Text>
                  <ChevronRight size={14} color="#FFF" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Todos os Jogos</Text>

          <View style={styles.gamesList}>
            {GAMES.map((game) => (
              <TouchableOpacity
                key={game.id}
                style={[styles.gameCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
                onPress={() => navigateToGame(game.route)}
                activeOpacity={0.8}
                testID={`game-${game.id}`}
              >
                <View style={styles.gameCardLeft}>
                  <View style={[styles.gameEmoji, { backgroundColor: game.color + '12' }]}>
                    <Text style={styles.gameEmojiText}>{game.emoji}</Text>
                  </View>
                  <View style={styles.gameInfo}>
                    <View style={styles.gameTitleRow}>
                      <Text style={[styles.gameTitle, { color: colors.text }]}>{game.title}</Text>
                      {game.badge && (
                        <View style={[styles.gameBadge, { backgroundColor: game.color + '18' }]}>
                          <Text style={[styles.gameBadgeText, { color: game.color }]}>{game.badge}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.gameSubtitle, { color: colors.textMuted }]}>{game.subtitle}</Text>
                    <Text style={[styles.gameDesc, { color: colors.textSecondary }]} numberOfLines={2}>{game.description}</Text>
                  </View>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.tipCard, { backgroundColor: '#C5943A' + '08', borderColor: '#C5943A' + '20' }]}>
            <Brain size={20} color="#C5943A" />
            <View style={styles.tipContent}>
              <Text style={[styles.tipTitle, { color: colors.text }]}>Dica</Text>
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                Jogar games bíblicos ajuda a memorizar versículos e aprender mais sobre a Palavra de Deus de forma divertida!
              </Text>
            </View>
          </View>

          <View style={{ height: 20 }} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 3,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: '800' as const,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'center',
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800' as const,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '500' as const,
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 32,
    marginHorizontal: 4,
  },
  featuredSection: {
    marginBottom: 24,
  },
  featuredCard: {
    borderRadius: 20,
    height: 200,
    overflow: 'hidden' as const,
  },
  featuredImage: {
    ...StyleSheet.absoluteFillObject,
  },
  featuredOverlay: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start' as const,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  featuredBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  featuredTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: '#FFF',
    marginBottom: 4,
  },
  featuredSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 18,
    marginBottom: 12,
  },
  featuredAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start' as const,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  featuredActionText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 12,
  },
  gamesList: {
    gap: 10,
    marginBottom: 20,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  gameCardLeft: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  gameEmoji: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameEmojiText: {
    fontSize: 24,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gameTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  gameBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  gameBadgeText: {
    fontSize: 9,
    fontWeight: '700' as const,
  },
  gameSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  gameDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  tipCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    alignItems: 'flex-start',
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
