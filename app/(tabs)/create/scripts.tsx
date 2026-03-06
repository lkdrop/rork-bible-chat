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
import { ArrowLeft, Sparkles, Copy, Share2, RefreshCw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { useApp } from '@/contexts/AppContext';
import { generateText } from '@rork-ai/toolkit-sdk';

const videoTypes = [
  { id: 'reels', label: 'Reels/TikTok', emoji: '📱', duration: '15-60s' },
  { id: 'youtube-short', label: 'YouTube Shorts', emoji: '🎬', duration: '30-60s' },
  { id: 'youtube', label: 'YouTube Longo', emoji: '▶️', duration: '5-15min' },
  { id: 'podcast', label: 'Podcast', emoji: '🎙️', duration: '10-30min' },
];

const contentTypes = [
  { id: 'teaching', label: 'Ensino Bíblico', emoji: '📖' },
  { id: 'testimony', label: 'Testemunho', emoji: '🙌' },
  { id: 'devotional', label: 'Devocional', emoji: '🕊️' },
  { id: 'apologetics', label: 'Apologética', emoji: '🛡️' },
  { id: 'motivation', label: 'Motivacional', emoji: '🔥' },
];

export default function ScriptsScreen() {
  const router = useRouter();
  const { colors } = useApp();
  const [topic, setTopic] = useState('');
  const [selectedType, setSelectedType] = useState('reels');
  const [selectedContent, setSelectedContent] = useState('teaching');
  const [result, setResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) {
      Alert.alert('Tema necessário', 'Digite o tema do seu vídeo.');
      return;
    }

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsGenerating(true);
    setResult('');

    const videoType = videoTypes.find(v => v.id === selectedType);
    const contentType = contentTypes.find(c => c.id === selectedContent);

    try {
      const response = await generateText({
        messages: [{
          role: 'user',
          content: `Você é um roteirista cristão especialista em conteúdo para redes sociais. Crie um roteiro completo para ${videoType?.label} (${videoType?.duration}).

Tema: "${topic.trim()}"
Tipo de conteúdo: ${contentType?.label}

ESTRUTURA DO ROTEIRO:

${selectedType === 'reels' || selectedType === 'youtube-short' ? `
1. HOOK (primeiros 3 segundos) — frase impactante que prende atenção
2. DESENVOLVIMENTO (10-30 segundos) — conteúdo principal com versículo
3. CTA (últimos 5 segundos) — chamada para ação (seguir, compartilhar, comentar)
4. LEGENDA sugerida com hashtags
5. DICAS de gravação (enquadramento, música sugerida)` : selectedType === 'youtube' ? `
1. INTRODUÇÃO (30s-1min) — hook + apresentação do tema
2. PONTO 1 — primeiro argumento/ensinamento com versículo
3. PONTO 2 — desenvolvimento com exemplo prático
4. PONTO 3 — aplicação na vida real
5. CONCLUSÃO — resumo + oração + CTA
6. DESCRIÇÃO sugerida para o vídeo
7. TAGS/palavras-chave sugeridas` : `
1. INTRODUÇÃO — saudação + apresentação do tema
2. CONTEXTO BÍBLICO — passagem base com explicação
3. DESENVOLVIMENTO — 3 pontos principais com aplicação
4. REFLEXÃO — pergunta para o ouvinte
5. ENCERRAMENTO — oração + chamada para ação`}

- Em Português do Brasil
- Tom: pastoral, engajador, autêntico
- Inclua versículos com referências completas
- Marque [TELA] para indicar mudanças visuais
- Marque [FALA] para indicar o que dizer`,
        }],
      });
      setResult(response);
    } catch {
      setResult('Erro ao gerar roteiro. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  }, [topic, selectedType, selectedContent]);

  const handleCopy = useCallback(async () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await Clipboard.setStringAsync(result);
    Alert.alert('Copiado!', 'Roteiro copiado para a área de transferência.');
  }, [result]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({ message: result });
    } catch {
      // cancelled
    }
  }, [result]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Roteiros</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {!result && !isGenerating && (
          <>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Tema do Vídeo</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
              placeholder="Ex: Como vencer a ansiedade com fé"
              placeholderTextColor={colors.textMuted}
              value={topic}
              onChangeText={setTopic}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Formato</Text>
            <View style={styles.optionsRow}>
              {videoTypes.map(v => (
                <TouchableOpacity
                  key={v.id}
                  style={[
                    styles.optionChip,
                    { backgroundColor: selectedType === v.id ? '#EF4444' + '15' : colors.card, borderColor: selectedType === v.id ? '#EF4444' : colors.borderLight },
                  ]}
                  onPress={() => setSelectedType(v.id)}
                >
                  <Text style={styles.optionEmoji}>{v.emoji}</Text>
                  <View>
                    <Text style={[styles.optionLabel, { color: selectedType === v.id ? '#EF4444' : colors.text }]}>{v.label}</Text>
                    <Text style={[styles.optionDuration, { color: colors.textMuted }]}>{v.duration}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>Tipo de Conteúdo</Text>
            <View style={styles.optionsRow}>
              {contentTypes.map(c => (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.optionChip,
                    { backgroundColor: selectedContent === c.id ? '#10B981' + '15' : colors.card, borderColor: selectedContent === c.id ? '#10B981' : colors.borderLight },
                  ]}
                  onPress={() => setSelectedContent(c.id)}
                >
                  <Text style={styles.optionEmoji}>{c.emoji}</Text>
                  <Text style={[styles.optionLabel, { color: selectedContent === c.id ? '#10B981' : colors.text }]}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.generateBtn, { backgroundColor: '#EF4444' }, !topic.trim() && { opacity: 0.5 }]}
              onPress={() => void handleGenerate()}
              disabled={!topic.trim()}
            >
              <Sparkles size={18} color="#FFF" />
              <Text style={styles.generateBtnText}>Gerar Roteiro</Text>
            </TouchableOpacity>
          </>
        )}

        {isGenerating && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#EF4444" />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>Criando seu roteiro...</Text>
          </View>
        )}

        {result && !isGenerating && (
          <>
            <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              <Text style={[styles.resultText, { color: colors.text }]}>{result}</Text>
            </View>
            <View style={styles.resultActions}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#EF4444' + '15' }]} onPress={() => void handleCopy()}>
                <Copy size={16} color="#EF4444" />
                <Text style={[styles.actionText, { color: '#EF4444' }]}>Copiar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#8B5CF6' + '15' }]} onPress={() => void handleShare()}>
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
  label: { fontSize: 13, fontWeight: '700' as const, textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: 10, marginTop: 4 },
  input: { borderWidth: 1, borderRadius: 14, padding: 14, fontSize: 15, marginBottom: 16 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  optionChip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  optionEmoji: { fontSize: 18 },
  optionLabel: { fontSize: 13, fontWeight: '600' as const },
  optionDuration: { fontSize: 11, marginTop: 1 },
  generateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14, marginTop: 8 },
  generateBtnText: { fontSize: 16, fontWeight: '700' as const, color: '#FFF' },
  loadingContainer: { alignItems: 'center', paddingTop: 60, gap: 16 },
  loadingText: { fontSize: 15, textAlign: 'center' as const },
  resultCard: { borderRadius: 16, padding: 18, borderWidth: 1, marginBottom: 16 },
  resultText: { fontSize: 15, lineHeight: 24 },
  resultActions: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12 },
  actionText: { fontSize: 14, fontWeight: '600' as const },
});
