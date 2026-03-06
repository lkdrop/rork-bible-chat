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

const captionStyles = [
  { id: 'inspirational', label: 'Inspiracional', emoji: '✨', description: 'Motivacional e edificante' },
  { id: 'reflective', label: 'Reflexivo', emoji: '🤔', description: 'Profundo e meditativo' },
  { id: 'prophetic', label: 'Profético', emoji: '🔥', description: 'Declaração de fé' },
  { id: 'testimony', label: 'Testemunho', emoji: '🙌', description: 'Gratidão e vitória' },
  { id: 'prayer', label: 'Oração', emoji: '🙏', description: 'Oração para stories' },
];

const platforms = [
  { id: 'instagram', label: 'Instagram', emoji: '📸' },
  { id: 'stories', label: 'Stories', emoji: '📱' },
  { id: 'tiktok', label: 'TikTok', emoji: '🎵' },
  { id: 'twitter', label: 'Twitter/X', emoji: '🐦' },
];

export default function CaptionsScreen() {
  const router = useRouter();
  const { colors } = useApp();
  const [topic, setTopic] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('inspirational');
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [result, setResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsGenerating(true);
    setResult('');

    const style = captionStyles.find(s => s.id === selectedStyle);
    const platform = platforms.find(p => p.id === selectedPlatform);

    const topicText = topic.trim() || 'fé e confiança em Deus';

    try {
      const response = await generateText({
        messages: [{
          role: 'user',
          content: `Você é um copywriter cristão especialista em redes sociais. Crie uma legenda/post para ${platform?.label} no estilo ${style?.label} (${style?.description}).

Tema: "${topicText}"

REGRAS:
- Plataforma: ${platform?.label} (${selectedPlatform === 'stories' ? 'curto, direto, com pergunta para engajamento' : selectedPlatform === 'tiktok' ? 'hook forte no início, linguagem jovem, hashtags relevantes' : selectedPlatform === 'twitter' ? 'máximo 280 caracteres, impactante' : 'legenda completa com versículo, reflexão e CTA'})
- Inclua 1 versículo bíblico relevante com referência
- Use emojis de forma estratégica
- Inclua hashtags relevantes ao final
- Tom: ${style?.description}
- Português do Brasil
- Se for Instagram: inclua CTA (salve, compartilhe, marque alguém)
- Se for Stories: inclua uma pergunta para engajamento

Gere 3 opções diferentes numeradas (1, 2, 3).`,
        }],
      });
      setResult(response);
    } catch {
      setResult('Erro ao gerar legendas. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  }, [topic, selectedStyle, selectedPlatform]);

  const handleCopy = useCallback(async () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await Clipboard.setStringAsync(result);
    Alert.alert('Copiado!', 'Legenda copiada para a área de transferência.');
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Legendas para Posts</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {!result && !isGenerating && (
          <>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Tema (opcional)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
              placeholder="Ex: gratidão, superação, fé, família..."
              placeholderTextColor={colors.textMuted}
              value={topic}
              onChangeText={setTopic}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Estilo</Text>
            <View style={styles.optionsRow}>
              {captionStyles.map(s => (
                <TouchableOpacity
                  key={s.id}
                  style={[
                    styles.optionChip,
                    { backgroundColor: selectedStyle === s.id ? '#8B5CF6' + '15' : colors.card, borderColor: selectedStyle === s.id ? '#8B5CF6' : colors.borderLight },
                  ]}
                  onPress={() => setSelectedStyle(s.id)}
                >
                  <Text style={styles.optionEmoji}>{s.emoji}</Text>
                  <Text style={[styles.optionLabel, { color: selectedStyle === s.id ? '#8B5CF6' : colors.text }]}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>Plataforma</Text>
            <View style={styles.optionsRow}>
              {platforms.map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.optionChip,
                    { backgroundColor: selectedPlatform === p.id ? '#EC4899' + '15' : colors.card, borderColor: selectedPlatform === p.id ? '#EC4899' : colors.borderLight },
                  ]}
                  onPress={() => setSelectedPlatform(p.id)}
                >
                  <Text style={styles.optionEmoji}>{p.emoji}</Text>
                  <Text style={[styles.optionLabel, { color: selectedPlatform === p.id ? '#EC4899' : colors.text }]}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.generateBtn, { backgroundColor: '#8B5CF6' }]}
              onPress={() => void handleGenerate()}
            >
              <Sparkles size={18} color="#FFF" />
              <Text style={styles.generateBtnText}>Gerar Legendas</Text>
            </TouchableOpacity>
          </>
        )}

        {isGenerating && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>Criando suas legendas...</Text>
          </View>
        )}

        {result && !isGenerating && (
          <>
            <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              <Text style={[styles.resultText, { color: colors.text }]}>{result}</Text>
            </View>
            <View style={styles.resultActions}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#8B5CF6' + '15' }]} onPress={() => void handleCopy()}>
                <Copy size={16} color="#8B5CF6" />
                <Text style={[styles.actionText, { color: '#8B5CF6' }]}>Copiar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#EC4899' + '15' }]} onPress={() => void handleShare()}>
                <Share2 size={16} color="#EC4899" />
                <Text style={[styles.actionText, { color: '#EC4899' }]}>Compartilhar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#10B981' + '15' }]} onPress={() => { setResult(''); }}>
                <RefreshCw size={16} color="#10B981" />
                <Text style={[styles.actionText, { color: '#10B981' }]}>Nova</Text>
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
  optionChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  optionEmoji: { fontSize: 16 },
  optionLabel: { fontSize: 13, fontWeight: '600' as const },
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
