import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Trophy,
  BookOpen,
  Timer,
  RotateCcw,
  Info,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { getDailyVerse } from '@/constants/dailyVerses';
import { achievements } from '@/constants/achievements';
import { usePrayerGuide } from '@/contexts/PrayerGuideContext';

export default function MoreScreen() {
  const router = useRouter();
  const { data, resetProgress } = usePrayerGuide();
  const dailyVerse = getDailyVerse();
  const flameAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(flameAnim, {
          toValue: 1.15,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(flameAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [flameAnim]);

  const handleResetQuiz = () => {
    Alert.alert(
      'Refazer Quiz',
      'Isso resetará todo o seu progresso. Tem certeza?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'destructive',
          onPress: () => {
            void resetProgress();
            router.push('/(tabs)/(guide)/quiz' as never);
          },
        },
      ]
    );
  };

  const handleNavigate = (route: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as never);
  };

  const unlockedCount = data.unlockedAchievements.length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minha Jornada</Text>
        <Text style={styles.headerSubtitle}>Estatísticas e ferramentas</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Animated.View style={{ transform: [{ scale: flameAnim }] }}>
              <Text style={styles.statEmoji}>🔥</Text>
            </Animated.View>
            <Text style={styles.statNumber}>{data.streak}</Text>
            <Text style={styles.statLabel}>Dias Seguidos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🙏</Text>
            <Text style={styles.statNumber}>{data.completedPrayers.length}</Text>
            <Text style={styles.statLabel}>Orações Feitas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🏆</Text>
            <Text style={styles.statNumber}>{unlockedCount}/{achievements.length}</Text>
            <Text style={styles.statLabel}>Conquistas</Text>
          </View>
        </View>

        <View style={styles.verseCard}>
          <View style={styles.verseHeader}>
            <BookOpen size={18} color={Colors.accent.gold} />
            <Text style={styles.verseLabel}>Versículo do Dia</Text>
          </View>
          <Text style={styles.verseText}>"{dailyVerse.verse}"</Text>
          <Text style={styles.verseRef}>{dailyVerse.reference}</Text>
        </View>

        <TouchableOpacity
          style={styles.gameCard}
          onPress={() => handleNavigate('/(tabs)/(more)/game')}
          activeOpacity={0.85}
        >
          <View style={styles.gameCardLeft}>
            <Text style={styles.gameCardEmoji}>⚔️</Text>
            <View style={styles.gameCardInfo}>
              <Text style={styles.gameCardTitle}>Corredor da Fé</Text>
              <Text style={styles.gameCardSubtitle}>Colete versículos e desvie das tentações!</Text>
            </View>
          </View>
          <View style={styles.gameCardArrow}>
            <ArrowRight size={20} color={Colors.text.light} />
          </View>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ferramentas</Text>
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate('/(tabs)/(more)/timer')}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#1a365d18' }]}>
                <Timer size={24} color={Colors.primary.navy} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Meditação</Text>
                <Text style={styles.menuSubtitle}>Timer de oração contemplativa</Text>
              </View>
              <ArrowRight size={18} color={Colors.text.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate('/(tabs)/(more)/diary')}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#d4a57418' }]}>
                <BookOpen size={24} color={Colors.accent.gold} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Diário de Oração</Text>
                <Text style={styles.menuSubtitle}>
                  {data.diaryEntries.length} {data.diaryEntries.length === 1 ? 'anotação' : 'anotações'}
                </Text>
              </View>
              <ArrowRight size={18} color={Colors.text.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate('/(tabs)/(more)/achievements')}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#e67e2218' }]}>
                <Trophy size={24} color="#e67e22" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Conquistas</Text>
                <Text style={styles.menuSubtitle}>
                  {unlockedCount} de {achievements.length} desbloqueadas
                </Text>
              </View>
              <ArrowRight size={18} color={Colors.text.muted} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleResetQuiz}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#e74c3c18' }]}>
                <RotateCcw size={24} color="#e74c3c" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Refazer Quiz</Text>
                <Text style={styles.menuSubtitle}>Descubra novas orações para sua vida</Text>
              </View>
              <ArrowRight size={18} color={Colors.text.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemLast]}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#9b59b618' }]}>
                <Info size={24} color="#9b59b6" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Sobre o App</Text>
                <Text style={styles.menuSubtitle}>Versão 1.0.0</Text>
              </View>
              <ArrowRight size={18} color={Colors.text.muted} />
            </TouchableOpacity>
          </View>
        </View>

        {data.totalMeditationMinutes > 0 && (
          <View style={styles.meditationStat}>
            <CheckCircle2 size={16} color={Colors.accent.gold} />
            <Text style={styles.meditationStatText}>
              {data.totalMeditationMinutes} minutos meditando no total
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            "O Senhor te abençoe e te guarde."
          </Text>
          <Text style={styles.footerVerse}>Números 6:24</Text>
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
  header: {
    backgroundColor: Colors.primary.navy,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: Colors.text.light,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.accent.goldLight,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  statsRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.primary.navy,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  verseCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.primary.navy,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  verseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  verseLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.accent.goldLight,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  verseText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: Colors.text.light,
    lineHeight: 26,
    marginBottom: 10,
  },
  verseRef: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.accent.gold,
  },
  section: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.primary.navy,
    marginBottom: 10,
    paddingLeft: 4,
  },
  menuContainer: {
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginHorizontal: 14,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
    marginLeft: 12,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 1,
  },
  menuSubtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  meditationStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    backgroundColor: `${Colors.accent.gold}12`,
    borderRadius: 12,
  },
  meditationStatText: {
    fontSize: 13,
    color: Colors.primary.navy,
    fontWeight: '500' as const,
  },
  gameCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#2d6a4f',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#2d6a4f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  gameCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 14,
  },
  gameCardEmoji: {
    fontSize: 36,
  },
  gameCardInfo: {
    flex: 1,
  },
  gameCardTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.text.light,
    marginBottom: 2,
  },
  gameCardSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
  },
  gameCardArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 15,
    fontStyle: 'italic',
    color: Colors.primary.navy,
    textAlign: 'center',
    marginBottom: 4,
  },
  footerVerse: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
});
