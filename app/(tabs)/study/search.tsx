import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { generateText } from '@rork-ai/toolkit-sdk';

const topicSuggestions = [
  { emoji: '😰', label: 'Ansiedade', query: 'versículos sobre ansiedade e preocupação' },
  { emoji: '💔', label: 'Dor', query: 'versículos para momentos de dor e sofrimento' },
  { emoji: '🙏', label: 'Fé', query: 'versículos sobre fé e confiança em Deus' },
  { emoji: '❤️', label: 'Amor', query: 'versículos sobre o amor de Deus' },
  { emoji: '💪', label: 'Força', query: 'versículos sobre força e coragem' },
  { emoji: '😊', label: 'Gratidão', query: 'versículos sobre gratidão e louvor' },
  { emoji: '🕊️', label: 'Paz', query: 'versículos sobre paz interior' },
  { emoji: '🤝', label: 'Perdão', query: 'versículos sobre perdão' },
  { emoji: '📖', label: 'Sabedoria', query: 'versículos sobre sabedoria' },
  { emoji: '🌟', label: 'Esperança', query: 'versículos sobre esperança' },
  { emoji: '💰', label: 'Finanças', query: 'versículos sobre finanças e provisão' },
  { emoji: '👨‍👩‍👧', label: 'Família', query: 'versículos sobre família e casamento' },
];

export default function SearchScreen() {
  const router = useRouter();
  const { colors, state } = useApp();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSearching(true);
    setResult('');

    try {
      const response = await generateText({
        messages: [
          {
            role: 'user',
            content: `Você é um especialista bíblico. Responda em português do Brasil usando a tradução ${state.preferredTranslation}.

Busca: "${searchQuery}"

Liste de 3 a 5 versículos bíblicos relevantes sobre este tema. Para cada versículo:
1. Cite o texto completo do versículo
2. Inclua a referência (livro, capítulo e versículo)
3. Adicione uma breve explicação de como se aplica ao tema

Seja conciso mas completo.`,
          },
        ],
      });
      setResult(response);
    } catch (error) {
      console.log('Search error:', error);
      setResult('Desculpe, ocorreu um erro na busca. Tente novamente.');
    } finally {
      setIsSearching(false);
    }
  }, [state.preferredTranslation]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Busca Bíblica</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Search size={18} color={colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Buscar por tema, emoção ou situação..."
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => void handleSearch(query)}
          returnKeyType="search"
        />
        {query.trim().length > 0 && (
          <TouchableOpacity
            style={[styles.searchBtn, { backgroundColor: colors.primary }]}
            onPress={() => void handleSearch(query)}
          >
            <Sparkles size={16} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {!result && !isSearching && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Temas Populares</Text>
            <View style={styles.topicsGrid}>
              {topicSuggestions.map((topic) => (
                <TouchableOpacity
                  key={topic.label}
                  style={[styles.topicChip, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
                  onPress={() => {
                    setQuery(topic.label);
                    void handleSearch(topic.query);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.topicEmoji}>{topic.emoji}</Text>
                  <Text style={[styles.topicLabel, { color: colors.text }]}>{topic.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {isSearching && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>Buscando nas Escrituras...</Text>
          </View>
        )}

        {result && !isSearching && (
          <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <View style={styles.resultHeader}>
              <Sparkles size={16} color={colors.primary} />
              <Text style={[styles.resultTitle, { color: colors.primary }]}>Resultados</Text>
            </View>
            <Text style={[styles.resultText, { color: colors.text }]}>{result}</Text>
          </View>
        )}
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 12 },
  searchBtn: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 13, fontWeight: '700' as const, marginBottom: 14, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  topicsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  topicChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  topicEmoji: { fontSize: 18 },
  topicLabel: { fontSize: 14, fontWeight: '600' as const },
  loadingContainer: { alignItems: 'center', paddingTop: 60, gap: 16 },
  loadingText: { fontSize: 15 },
  resultCard: { borderRadius: 16, padding: 20, borderWidth: 1 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  resultTitle: { fontSize: 15, fontWeight: '700' as const },
  resultText: { fontSize: 15, lineHeight: 24 },
});
