import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Colors } from '@/constants/colors';
import { achievements } from '@/constants/achievements';
import { usePrayerGuide } from '@/contexts/PrayerGuideContext';

function AchievementCard({ emoji, title, description, unlocked, index }: {
  emoji: string;
  title: string;
  description: string;
  unlocked: boolean;
  index: number;
}) {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 80,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim, index]);

  return (
    <Animated.View
      style={[
        styles.achievementCard,
        !unlocked && styles.achievementCardLocked,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <View style={[styles.emojiContainer, !unlocked && styles.emojiContainerLocked]}>
        <Text style={[styles.achievementEmoji, !unlocked && styles.emojiLocked]}>
          {unlocked ? emoji : '🔒'}
        </Text>
      </View>
      <Text style={[styles.achievementTitle, !unlocked && styles.textLocked]} numberOfLines={1}>
        {title}
      </Text>
      <Text style={[styles.achievementDesc, !unlocked && styles.textLocked]} numberOfLines={2}>
        {description}
      </Text>
      {unlocked && <View style={styles.unlockedBadge}><Text style={styles.unlockedText}>✓</Text></View>}
    </Animated.View>
  );
}

export default function AchievementsScreen() {
  const { data } = usePrayerGuide();
  const unlockedCount = data.unlockedAchievements.length;
  const totalCount = achievements.length;

  return (
    <>
      <Stack.Screen options={{ title: 'Conquistas', headerShown: true }} />
      <SafeAreaView style={styles.container} edges={[]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.statsHeader}>
            <View style={styles.trophyCircle}>
              <Text style={styles.trophyEmoji}>🏆</Text>
            </View>
            <Text style={styles.statsTitle}>
              {unlockedCount} de {totalCount}
            </Text>
            <Text style={styles.statsSubtitle}>conquistas desbloqueadas</Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${(unlockedCount / totalCount) * 100}%` }]} />
            </View>
          </View>

          <View style={styles.grid}>
            {achievements.map((achievement, index) => (
              <AchievementCard
                key={achievement.id}
                emoji={achievement.emoji}
                title={achievement.title}
                description={achievement.description}
                unlocked={data.unlockedAchievements.includes(achievement.id)}
                index={index}
              />
            ))}
          </View>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  statsHeader: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 24,
    backgroundColor: Colors.primary.navy,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  trophyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(212,165,116,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  trophyEmoji: {
    fontSize: 40,
  },
  statsTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text.light,
    marginBottom: 2,
  },
  statsSubtitle: {
    fontSize: 14,
    color: Colors.accent.goldLight,
    marginBottom: 16,
  },
  progressBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.accent.gold,
    borderRadius: 3,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
    justifyContent: 'center',
    marginTop: 8,
  },
  achievementCard: {
    width: '45%',
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    shadowColor: Colors.shadow.medium,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
    position: 'relative',
  },
  achievementCardLocked: {
    backgroundColor: '#f0ede8',
    opacity: 0.7,
  },
  emojiContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${Colors.accent.gold}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  emojiContainerLocked: {
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  achievementEmoji: {
    fontSize: 28,
  },
  emojiLocked: {
    fontSize: 22,
    opacity: 0.5,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.primary.navy,
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 11,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  textLocked: {
    color: Colors.text.muted,
  },
  unlockedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#27ae60',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unlockedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700' as const,
  },
});
