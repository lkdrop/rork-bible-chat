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
import { ArrowLeft, Sparkles, Copy, Share2, RefreshCw, Volume2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { useApp } from '@/contexts/AppContext';
import { generateText } from '@/services/gemini';
import { speak, stopSpeaking } from '@/services/textToSpeech';

export default function DevotionalPostScreen() {
  const router = useRouter();
  const { colors, state, canCreate, recordCreate } = useApp();
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!canCreate()) {
      router.push('/paywall' as never);
      return;
    }

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsGenerating(true);
    setResult('');

    const topicText = topic.trim() || 'confiança em Deus';

    try {
      const response = await generateText({
        messages: [{
          role: 'user',
          content: `Você é um PASTOR DIGITAL especialista em criar devocionais que tocam corações e geram alto engajamento nas redes sociais.

Crie um mini devocional PODEROSO sobre: "${topicText}"

ESTRUTURA DO DEVOCIONAL VIRAL:
1. TÍTULO: impactante, curto, que gera curiosidade (máx 8 palavras)
2. VERSÍCULO BASE: completo com referência
3. REFLEXÃO: 3-4 frases profundas que geram identificação
4. APLICAÇÃO PRÁTICA: 1 ação concreta para hoje
5. ORAÇÃO: curta, pessoal, que o leitor sinta como sua
6. CTA: "Salve para reler 🔖 | Marque alguém que precisa"
7. HASHTAGS: 15-20 relevantes (#devocionaldiário #fécristã #versiculododia etc)

TÉCNICAS DE COPY:
- Primeira frase = hook que para o scroll
- Use "você" para criar conexão direta
- Quebre em parágrafos curtos (2-3 linhas)
- Emojis estratégicos (não excessivos)
- Tom: pastoral, íntimo, como se fosse uma carta pessoal

Formato pronto para copiar e colar no Instagram/Facebook.
Português do Brasil.

Ao final, adicione:
---
✨ Criado com Bíblia IA`,
        }],
      });
      setResult(response);
      recordCreate();
    } catch {
      setResult('Erro ao gerar devocional. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  }, [topic, canCreate, recordCreate, router]);

  const handleSpeak = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isSpeaking) {
      void stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      void speak(result, {
        voice: 'ana',
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  }, [result, isSpeaking]);

  const handleCopy = useCallback(async () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await Clipboard.setStringAsync(result);
    Alert.alert('Copiado!', 'Devocional copiado. Compartilhe a Palavra!');
  }, [result]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Devocional Diário</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {!result && !isGenerating && (
          <>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Tema (opcional)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
              placeholder="Ex: paciência, gratidão, perdão..."
              placeholderTextColor={colors.textMuted}
              value={topic}
              onChangeText={setTopic}
            />
            <TouchableOpacity
              style={[styles.generateBtn, { backgroundColor: '#10B981' }]}
              onPress={() => void handleGenerate()}
            >
              <Sparkles size={18} color="#FFF" />
              <Text style={styles.generateBtnText}>Gerar Devocional</Text>
            </TouchableOpacity>
            {!state.isPremium && (
              <Text style={[styles.limitText, { color: colors.textMuted }]}>
                {Math.max(0, 2 - (state.lastCreateDate === new Date().toDateString() ? state.dailyCreateCount : 0))} criações gratuitas restantes hoje
              </Text>
            )}
          </>
        )}

        {isGenerating && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>Preparando devocional que toca corações...</Text>
          </View>
        )}

        {result && !isGenerating && (
          <>
            <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              <Text style={[styles.resultText, { color: colors.text }]}>{result}</Text>
            </View>
            <View style={styles.resultActions}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: isSpeaking ? '#6366F1' : '#6366F1' + '15' }]} onPress={handleSpeak}>
                <Volume2 size={16} color={isSpeaking ? '#FFF' : '#6366F1'} />
                <Text style={[styles.actionText, { color: isSpeaking ? '#FFF' : '#6366F1' }]}>{isSpeaking ? 'Parar' : 'Ouvir'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#10B981' + '15' }]} onPress={() => void handleCopy()}>
                <Copy size={16} color="#10B981" />
                <Text style={[styles.actionText, { color: '#10B981' }]}>Copiar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#C5943A' + '15' }]} onPress={() => void Share.share({ message: result })}>
                <Share2 size={16} color="#C5943A" />
                <Text style={[styles.actionText, { color: '#C5943A' }]}>Enviar</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#F59E0B' + '15', marginTop: 8 }]} onPress={() => { void stopSpeaking(); setIsSpeaking(false); setResult(''); }}>
              <RefreshCw size={16} color="#F59E0B" />
              <Text style={[styles.actionText, { color: '#F59E0B' }]}>Novo</Text>
            </TouchableOpacity>
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
  label: { fontSize: 13, fontWeight: '700' as const, textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: 10 },
  input: { borderWidth: 1, borderRadius: 14, padding: 14, fontSize: 15, marginBottom: 20 },
  generateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14 },
  generateBtnText: { fontSize: 16, fontWeight: '700' as const, color: '#FFF' },
  limitText: { fontSize: 12, textAlign: 'center' as const, marginTop: 10 },
  loadingContainer: { alignItems: 'center', paddingTop: 60, gap: 16 },
  loadingText: { fontSize: 15 },
  resultCard: { borderRadius: 16, padding: 18, borderWidth: 1, marginBottom: 16 },
  resultText: { fontSize: 15, lineHeight: 24 },
  resultActions: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12 },
  actionText: { fontSize: 14, fontWeight: '600' as const },
});
