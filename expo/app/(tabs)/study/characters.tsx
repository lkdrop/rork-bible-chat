import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { bibleCharacters } from '@/constants/bibleCharacters';

export default function CharactersScreen() {
  const router = useRouter();
  const { colors } = useApp();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Personagens Bíblicos</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Conheça as histórias inspiradoras dos grandes heróis e heroínas da fé
        </Text>

        {bibleCharacters.map((character) => (
          <TouchableOpacity
            key={character.id}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(`/study/character-detail?characterId=${character.id}` as never);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.emoji}>{character.emoji}</Text>
              <View style={styles.cardInfo}>
                <Text style={[styles.name, { color: colors.text }]}>{character.name}</Text>
                <Text style={[styles.title, { color: colors.primary }]}>{character.title}</Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </View>
            <Text style={[styles.summary, { color: colors.textSecondary }]} numberOfLines={2}>
              {character.summary}
            </Text>
            <View style={styles.tagsRow}>
              {character.lessons.slice(0, 2).map((lesson) => (
                <View key={lesson} style={[styles.tag, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.tagText, { color: colors.primary }]}>{lesson}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700' as const, flex: 1, textAlign: 'center' as const },
  headerSpacer: { width: 30 },
  content: { padding: 20, paddingTop: 0, paddingBottom: 40 },
  subtitle: { fontSize: 14, lineHeight: 22, marginBottom: 20 },
  card: { borderRadius: 16, padding: 18, borderWidth: 1, marginBottom: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  emoji: { fontSize: 36, marginRight: 12 },
  cardInfo: { flex: 1 },
  name: { fontSize: 18, fontWeight: '700' as const },
  title: { fontSize: 13, fontWeight: '600' as const, marginTop: 2 },
  summary: { fontSize: 13, lineHeight: 20, marginBottom: 10 },
  tagsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 11, fontWeight: '600' as const },
});
