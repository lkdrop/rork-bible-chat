import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Sparkles, Share2, Trash2, BookOpen, Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { generateText } from '@rork-ai/toolkit-sdk';

export default function SermonPrepScreen() {
  const router = useRouter();
  const { state, colors, addSermonNote, deleteSermonNote } = useApp();
  const [passage, setPassage] = useState('');
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!passage.trim() && !topic.trim()) {
      Alert.alert('Campo obrigatório', 'Insira uma passagem bíblica ou tema para o sermão.');
      return;
    }

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsGenerating(true);
    setResult('');

    try {
      const prompt = `Você é um especialista em homilética e preparação de sermões cristãos. Responda em português do Brasil usando a tradução ${state.preferredTranslation}.

${passage.trim() ? `Passagem bíblica: "${passage.trim()}"` : ''}
${topic.trim() ? `Tema: "${topic.trim()}"` : ''}

Gere um esboço completo de sermão com:

1. **TÍTULO** — Título criativo e impactante
2. **TEXTO BASE** — Versículo(s) principal(is) com referência
3. **INTRODUÇÃO** — Gancho para captar atenção (história, pergunta ou estatística)
4. **3 PONTOS PRINCIPAIS** — Cada ponto com:
   - Subtítulo
   - Versículo de apoio com referência
   - Explicação do contexto original (grego/hebraico quando relevante)
   - Aplicação prática para o dia a dia
5. **ILUSTRAÇÕES** — 2 ilustrações ou histórias para usar
6. **REFERÊNCIAS CRUZADAS** — 5 versículos relacionados
7. **CONCLUSÃO** — Chamada à ação e oração final
8. **PERGUNTAS PARA REFLEXÃO** — 3 perguntas para a congregação

Seja detalhado e prático. Formate bem com títulos e subtítulos.`;

      const response = await generateText({
        messages: [{ role: 'user', content: prompt }],
      });
      setResult(response);
    } catch (error) {
      console.log('Sermon generation error:', error);
      setResult('Desculpe, ocorreu um erro ao gerar o esboço. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  }, [passage, topic, state.preferredTranslation]);

  const handleSave = useCallback(() => {
    if (!result) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addSermonNote(
      topic.trim() || passage.trim() || 'Sermão sem título',
      passage.trim(),
      result,
      '',
      [],
      []
    );
    Alert.alert('Salvo!', 'Esboço do sermão salvo com sucesso.');
  }, [result, topic, passage, addSermonNote]);

  const handleShare = useCallback(async () => {
    if (!result) return;
    try {
      await Share.share({
        message: `📖 Esboço de Sermão\n\n${result}\n\nGerado pelo Bíblia IA`,
      });
    } catch (e) {
      console.log('Share error:', e);
    }
  }, [result]);

  const handleDeleteNote = useCallback((id: string) => {
    Alert.alert('Excluir sermão', 'Deseja excluir este esboço?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteSermonNote(id) },
    ]);
  }, [deleteSermonNote]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Preparação de Sermão</Text>
        <TouchableOpacity
          style={[styles.toggleBtn, { backgroundColor: showSaved ? colors.primary : colors.primaryLight }]}
          onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowSaved(!showSaved); }}
        >
          {showSaved ? <Plus size={16} color="#FFF" /> : <BookOpen size={16} color={colors.primary} />}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {!showSaved ? (
          <>
            <View style={[styles.inputCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>📖 Passagem Bíblica</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                placeholder="Ex: Filipenses 4:13, João 3:16-17"
                placeholderTextColor={colors.textMuted}
                value={passage}
                onChangeText={setPassage}
              />

              <Text style={[styles.inputLabel, { color: colors.text, marginTop: 14 }]}>🎯 Tema (opcional)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                placeholder="Ex: Perseverança, Graça de Deus, Perdão"
                placeholderTextColor={colors.textMuted}
                value={topic}
                onChangeText={setTopic}
              />

              <TouchableOpacity
                style={[styles.generateBtn, { backgroundColor: colors.primary }, isGenerating && styles.generateBtnDisabled]}
                onPress={() => void handleGenerate()}
                disabled={isGenerating}
                activeOpacity={0.8}
              >
                {isGenerating ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Sparkles size={18} color="#FFF" />
                )}
                <Text style={styles.generateBtnText}>
                  {isGenerating ? 'Gerando esboço...' : 'Gerar Esboço com IA'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tipsRow}>
              {['Filipenses 4:13', 'Romanos 8:28', 'Salmos 23', 'João 3:16'].map((tip) => (
                <TouchableOpacity
                  key={tip}
                  style={[styles.tipChip, { backgroundColor: colors.primaryLight }]}
                  onPress={() => { setPassage(tip); }}
                >
                  <Text style={[styles.tipText, { color: colors.primary }]}>{tip}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {isGenerating && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textMuted }]}>
                  Preparando seu esboço de sermão...
                </Text>
                <Text style={[styles.loadingSubtext, { color: colors.textMuted }]}>
                  Incluindo contexto original, ilustrações e aplicações
                </Text>
              </View>
            )}

            {result && !isGenerating && (
              <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
                <View style={styles.resultHeader}>
                  <Sparkles size={16} color={colors.primary} />
                  <Text style={[styles.resultTitle, { color: colors.primary }]}>Esboço do Sermão</Text>
                </View>
                <Text style={[styles.resultText, { color: colors.text }]}>{result}</Text>
                <View style={styles.resultActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.primaryLight }]}
                    onPress={handleSave}
                  >
                    <BookOpen size={14} color={colors.primary} />
                    <Text style={[styles.actionBtnText, { color: colors.primary }]}>Salvar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.primaryLight }]}
                    onPress={() => void handleShare()}
                  >
                    <Share2 size={14} color={colors.primary} />
                    <Text style={[styles.actionBtnText, { color: colors.primary }]}>Compartilhar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        ) : (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Sermões Salvos</Text>
            {state.sermonNotes.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🎤</Text>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhum sermão salvo</Text>
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  Gere um esboço e salve para acessar depois.
                </Text>
              </View>
            ) : (
              state.sermonNotes.map((note) => (
                <View key={note.id} style={[styles.savedCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
                  <View style={styles.savedHeader}>
                    <View style={styles.savedInfo}>
                      <Text style={[styles.savedTitle, { color: colors.text }]}>{note.title}</Text>
                      {note.passage ? (
                        <Text style={[styles.savedPassage, { color: colors.textMuted }]}>{note.passage}</Text>
                      ) : null}
                      <Text style={[styles.savedDate, { color: colors.textMuted }]}>
                        {new Date(note.date).toLocaleDateString('pt-BR')}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteNote(note.id)} style={styles.deleteBtn}>
                      <Trash2 size={16} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.savedContent, { color: colors.textSecondary }]} numberOfLines={4}>
                    {note.content}
                  </Text>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, borderBottomWidth: 1 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700' as const, flex: 1 },
  toggleBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20, paddingBottom: 40 },
  inputCard: { borderRadius: 16, padding: 18, borderWidth: 1, marginBottom: 14 },
  inputLabel: { fontSize: 15, fontWeight: '600' as const, marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15 },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 18,
  },
  generateBtnDisabled: { opacity: 0.7 },
  generateBtnText: { fontSize: 16, fontWeight: '700' as const, color: '#FFF' },
  tipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  tipChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  tipText: { fontSize: 13, fontWeight: '600' as const },
  loadingContainer: { alignItems: 'center', paddingTop: 40, gap: 12 },
  loadingText: { fontSize: 16, fontWeight: '600' as const },
  loadingSubtext: { fontSize: 13 },
  resultCard: { borderRadius: 16, padding: 20, borderWidth: 1, marginTop: 8 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  resultTitle: { fontSize: 16, fontWeight: '700' as const },
  resultText: { fontSize: 15, lineHeight: 24 },
  resultActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  actionBtnText: { fontSize: 14, fontWeight: '600' as const },
  sectionTitle: { fontSize: 20, fontWeight: '700' as const, marginBottom: 16 },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700' as const, marginBottom: 6 },
  emptyText: { fontSize: 14, textAlign: 'center' as const },
  savedCard: { borderRadius: 14, padding: 16, borderWidth: 1, marginBottom: 12 },
  savedHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  savedInfo: { flex: 1 },
  savedTitle: { fontSize: 16, fontWeight: '700' as const },
  savedPassage: { fontSize: 13, marginTop: 2 },
  savedDate: { fontSize: 12, marginTop: 4 },
  deleteBtn: { padding: 4 },
  savedContent: { fontSize: 14, lineHeight: 22 },
});
