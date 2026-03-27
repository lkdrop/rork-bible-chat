import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, BookOpen, Volume2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { bibleCharacters } from '@/constants/bibleCharacters';
import { speak, stopSpeaking } from '@/services/textToSpeech';

export default function CharacterDetailScreen() {
  const router = useRouter();
  const { characterId } = useLocalSearchParams<{ characterId: string }>();
  const { colors } = useApp();

  const [isSpeaking, setIsSpeaking] = useState(false);

  const character = bibleCharacters.find(c => c.id === characterId);

  const handleSpeak = useCallback(() => {
    if (!character) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isSpeaking) {
      void stopSpeaking();
      setIsSpeaking(false);
    } else {
      const fullText = `${character.name}. ${character.title}. ${character.summary}. Versículo-chave: ${character.keyVerse}, ${character.keyVerseRef}. Lições para hoje: ${character.lessons.join('. ')}.`;
      setIsSpeaking(true);
      void speak(fullText, {
        voice: 'carla',
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  }, [character, isSpeaking]);

  if (!character) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFound, { color: colors.text }]}>Personagem não encontrado</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.goBack, { color: colors.primary }]}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{character.name}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={[styles.heroCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.heroEmoji}>{character.emoji}</Text>
          <Text style={styles.heroName}>{character.name}</Text>
          <Text style={styles.heroTitle}>{character.title}</Text>
          <Text style={styles.heroPeriod}>{character.period}</Text>
          <TouchableOpacity
            style={[styles.speakBtn, { backgroundColor: isSpeaking ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)' }]}
            onPress={handleSpeak}
          >
            <Volume2 size={16} color="#FFF" />
            <Text style={styles.speakBtnText}>{isSpeaking ? 'Parar' : 'Ouvir História'}</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>História</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>{character.summary}</Text>
        </View>

        <View style={[styles.verseCard, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.verseLabel, { color: colors.primary }]}>Versículo-chave</Text>
          <Text style={[styles.verseText, { color: colors.text }]}>"{character.keyVerse}"</Text>
          <Text style={[styles.verseRef, { color: colors.primary }]}>{character.keyVerseRef}</Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Lições para Hoje</Text>
          {character.lessons.map((lesson, i) => (
            <View key={i} style={styles.lessonRow}>
              <Text style={[styles.lessonBullet, { color: colors.primary }]}>•</Text>
              <Text style={[styles.lessonText, { color: colors.textSecondary }]}>{lesson}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <View style={styles.booksHeader}>
            <BookOpen size={18} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Livros Relacionados</Text>
          </View>
          <View style={styles.booksRow}>
            {character.books.map((book) => (
              <View key={book} style={[styles.bookTag, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.bookText, { color: colors.primary }]}>{book}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: { fontSize: 18, textAlign: 'center', marginTop: 100 },
  goBack: { fontSize: 16, textAlign: 'center', marginTop: 16 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700' as const, flex: 1, textAlign: 'center' as const },
  headerSpacer: { width: 30 },
  content: { padding: 20, paddingTop: 0, paddingBottom: 40 },
  heroCard: { borderRadius: 20, padding: 28, alignItems: 'center', marginBottom: 20 },
  heroEmoji: { fontSize: 56, marginBottom: 12 },
  heroName: { fontSize: 28, fontWeight: '800' as const, color: '#FFF', marginBottom: 4 },
  heroTitle: { fontSize: 16, fontWeight: '600' as const, color: 'rgba(255,255,255,0.85)', marginBottom: 4 },
  heroPeriod: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 12 },
  speakBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12 },
  speakBtnText: { fontSize: 14, fontWeight: '700' as const, color: '#FFF' },
  section: { borderRadius: 16, padding: 18, borderWidth: 1, marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '700' as const, marginBottom: 10 },
  sectionText: { fontSize: 15, lineHeight: 24 },
  verseCard: { borderRadius: 16, padding: 20, marginBottom: 16 },
  verseLabel: { fontSize: 12, fontWeight: '700' as const, marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  verseText: { fontSize: 17, fontWeight: '500' as const, lineHeight: 26, fontStyle: 'italic' as const, marginBottom: 8 },
  verseRef: { fontSize: 14, fontWeight: '700' as const },
  lessonRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  lessonBullet: { fontSize: 18, lineHeight: 22 },
  lessonText: { fontSize: 15, lineHeight: 22, flex: 1 },
  booksHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  booksRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  bookTag: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  bookText: { fontSize: 13, fontWeight: '600' as const },
});
