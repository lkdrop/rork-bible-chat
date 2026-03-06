import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Sparkles, Copy, RefreshCw, Hash } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { useApp } from '@/contexts/AppContext';
import { generateText } from '@rork-ai/toolkit-sdk';

export default function HashtagsScreen() {
  const router = useRouter();
  const { colors, state, recordCreate } = useApp();
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!state.isPremium) {
      router.push('/paywall' as never);
      return;
    }

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsGenerating(true);
    setResult('');

    const topicText = topic.trim() || 'versículo do dia';

    try {
      const response = await generateText({
        messages: [{
          role: 'user',
          content: `Você é um ESPECIALISTA EM HASHTAGS e algoritmos do Instagram/TikTok para o nicho cristão.

TEMA DO POST: "${topicText}"

Gere 3 CONJUNTOS DE HASHTAGS estratégicos:

📊 CONJUNTO 1 — MÁXIMO ALCANCE (30 hashtags)
- 5 hashtags MEGA populares (1M+ posts) — para aparecer no Explore
- 10 hashtags MÉDIAS (100K-1M) — competição média, bom alcance
- 10 hashtags NICHADAS (10K-100K) — fácil de ranquear
- 5 hashtags MICRO (1K-10K) — domínio total

📊 CONJUNTO 2 — REELS/TIKTOK (20 hashtags)
- Hashtags trending do momento
- FYP hashtags (#fyp #viral #parati)
- Nicho cristão para vídeo

📊 CONJUNTO 3 — STORIES (10 hashtags)
- Hashtags de localização virtual
- Hashtags de comunidade cristã
- Hashtags de engajamento

BÔNUS:
- 5 HASHTAGS PRÓPRIAS sugeridas para criar comunidade
- Dica de como usar hashtags nos comentários vs legenda
- Melhor quantidade de hashtags por plataforma

Formato: pronto para copiar e colar.
Português do Brasil.
Inclua mix de português e inglês.

✨ Criado com Bíblia IA`,
        }],
      });
      setResult(response);
      recordCreate();
    } catch {
      setResult('Erro ao gerar hashtags. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  }, [topic, state.isPremium, recordCreate, router]);

  const handleCopy = useCallback(async () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await Clipboard.setStringAsync(result);
    Alert.alert('Copiado!', 'Hashtags copiadas. Cole nos seus posts!');
  }, [result]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Gerador de Hashtags</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {!result && !isGenerating && (
          <>
            <View style={[styles.premiumBadge, { backgroundColor: '#06B6D4' + '15' }]}>
              <Hash size={16} color="#06B6D4" />
              <Text style={[styles.premiumBadgeText, { color: '#06B6D4' }]}>Ferramenta Premium</Text>
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>Tema do Post</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
              placeholder="Ex: versículo sobre ansiedade, devocional de gratidão..."
              placeholderTextColor={colors.textMuted}
              value={topic}
              onChangeText={setTopic}
            />
            <TouchableOpacity
              style={[styles.generateBtn, { backgroundColor: '#06B6D4' }]}
              onPress={() => void handleGenerate()}
            >
              <Sparkles size={18} color="#FFF" />
              <Text style={styles.generateBtnText}>Gerar Hashtags Estratégicas</Text>
            </TouchableOpacity>
          </>
        )}

        {isGenerating && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#06B6D4" />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>Analisando melhores hashtags...</Text>
          </View>
        )}

        {result && !isGenerating && (
          <>
            <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              <Text style={[styles.resultText, { color: colors.text }]}>{result}</Text>
            </View>
            <View style={styles.resultActions}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#06B6D4' + '15' }]} onPress={() => void handleCopy()}>
                <Copy size={16} color="#06B6D4" />
                <Text style={[styles.actionText, { color: '#06B6D4' }]}>Copiar Tudo</Text>
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
  premiumBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, marginBottom: 20 },
  premiumBadgeText: { fontSize: 13, fontWeight: '700' as const },
  label: { fontSize: 13, fontWeight: '700' as const, textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: 10 },
  input: { borderWidth: 1, borderRadius: 14, padding: 14, fontSize: 15, marginBottom: 20 },
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
