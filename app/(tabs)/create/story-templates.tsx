import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Sparkles, Copy, Share2, RefreshCw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { useApp } from '@/contexts/AppContext';
import { generateText } from '@rork-ai/toolkit-sdk';

const templateTypes = [
  { id: 'quiz', label: 'Quiz Bíblico', emoji: '❓', desc: 'Perguntas para engajamento' },
  { id: 'poll', label: 'Enquete', emoji: '📊', desc: 'Enquete sobre temas bíblicos' },
  { id: 'reflection', label: 'Reflexão', emoji: '💭', desc: 'Frases para pensar' },
  { id: 'challenge', label: 'Desafio', emoji: '🎯', desc: 'Desafio de fé para seguidores' },
  { id: 'verse-of-day', label: 'Versículo', emoji: '📖', desc: 'Versículo com design' },
  { id: 'countdown', label: 'Contagem', emoji: '⏰', desc: 'Contagem regressiva bíblica' },
];

export default function StoryTemplatesScreen() {
  const router = useRouter();
  const { colors } = useApp();
  const [selectedType, setSelectedType] = useState('quiz');
  const [result, setResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsGenerating(true);
    setResult('');

    const template = templateTypes.find(t => t.id === selectedType);

    try {
      const response = await generateText({
        messages: [{
          role: 'user',
          content: `Crie um template de Story para Instagram no formato "${template?.label}" (${template?.desc}).

${selectedType === 'quiz' ? `Crie 5 perguntas bíblicas interessantes para stories. Para cada pergunta:
- Pergunta + 2 opções de resposta
- Resposta correta
- Curiosidade sobre a resposta` :
selectedType === 'poll' ? `Crie 5 enquetes bíblicas para stories. Para cada enquete:
- Pergunta interessante
- 2-3 opções
- Versículo relacionado` :
selectedType === 'reflection' ? `Crie 5 frases de reflexão poderosas para stories:
- Cada frase deve ter no máximo 2 linhas
- Inclua versículo base
- Tom profundo e impactante` :
selectedType === 'challenge' ? `Crie um desafio de fé de 7 dias para stories:
- 1 desafio por dia com ação prática
- Versículo base para cada dia
- Hashtag do desafio` :
selectedType === 'verse-of-day' ? `Crie 7 versículos formatados para stories:
- Versículo completo + referência
- Mini reflexão de 1 frase
- Pergunta para engajamento nos stories` :
`Crie uma contagem regressiva bíblica de 5 dias:
- Tema da contagem
- Versículo do dia
- Frase de antecipação`}

Regras:
- Português do Brasil
- Formato pronto para copiar
- Use emojis
- Numerado e organizado`,
        }],
      });
      setResult(response);
    } catch {
      setResult('Erro ao gerar template. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedType]);

  const handleCopy = useCallback(async () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await Clipboard.setStringAsync(result);
    Alert.alert('Copiado!', 'Template copiado.');
  }, [result]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Templates de Stories</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {!result && !isGenerating && (
          <>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Tipo de Template</Text>
            <View style={styles.typesGrid}>
              {templateTypes.map(t => (
                <TouchableOpacity
                  key={t.id}
                  style={[
                    styles.typeCard,
                    {
                      backgroundColor: selectedType === t.id ? '#F59E0B' + '15' : colors.card,
                      borderColor: selectedType === t.id ? '#F59E0B' : colors.borderLight,
                    },
                  ]}
                  onPress={() => setSelectedType(t.id)}
                >
                  <Text style={styles.typeEmoji}>{t.emoji}</Text>
                  <Text style={[styles.typeLabel, { color: selectedType === t.id ? '#F59E0B' : colors.text }]}>{t.label}</Text>
                  <Text style={[styles.typeDesc, { color: colors.textMuted }]}>{t.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.generateBtn, { backgroundColor: '#F59E0B' }]}
              onPress={() => void handleGenerate()}
            >
              <Sparkles size={18} color="#FFF" />
              <Text style={styles.generateBtnText}>Gerar Template</Text>
            </TouchableOpacity>
          </>
        )}

        {isGenerating && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F59E0B" />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>Criando templates...</Text>
          </View>
        )}

        {result && !isGenerating && (
          <>
            <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              <Text style={[styles.resultText, { color: colors.text }]}>{result}</Text>
            </View>
            <View style={styles.resultActions}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#F59E0B' + '15' }]} onPress={() => void handleCopy()}>
                <Copy size={16} color="#F59E0B" />
                <Text style={[styles.actionText, { color: '#F59E0B' }]}>Copiar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#8B5CF6' + '15' }]} onPress={() => void Share.share({ message: result })}>
                <Share2 size={16} color="#8B5CF6" />
                <Text style={[styles.actionText, { color: '#8B5CF6' }]}>Enviar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#10B981' + '15' }]} onPress={() => setResult('')}>
                <RefreshCw size={16} color="#10B981" />
                <Text style={[styles.actionText, { color: '#10B981' }]}>Novo</Text>
              </TouchableOpacity>
            </View>
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
  headerTitle: { fontSize: 20, fontWeight: '700' as const, flex: 1, textAlign: 'center' as const },
  headerSpacer: { width: 30 },
  content: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '700' as const, textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: 12 },
  typesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  typeCard: { width: '47%' as const, borderRadius: 14, padding: 14, borderWidth: 1, alignItems: 'center', gap: 4 },
  typeEmoji: { fontSize: 28 },
  typeLabel: { fontSize: 14, fontWeight: '700' as const },
  typeDesc: { fontSize: 11, textAlign: 'center' as const },
  generateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14 },
  generateBtnText: { fontSize: 16, fontWeight: '700' as const, color: '#FFF' },
  loadingContainer: { alignItems: 'center', paddingTop: 60, gap: 16 },
  loadingText: { fontSize: 15 },
  resultCard: { borderRadius: 16, padding: 18, borderWidth: 1, marginBottom: 16 },
  resultText: { fontSize: 15, lineHeight: 24 },
  resultActions: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12 },
  actionText: { fontSize: 14, fontWeight: '600' as const },
});
