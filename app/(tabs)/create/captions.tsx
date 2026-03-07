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
import { ArrowLeft, Sparkles, Copy, Share2, RefreshCw, TrendingUp } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { useApp } from '@/contexts/AppContext';
import { generateText } from '@/services/gemini';

const captionStyles = [
  { id: 'viral', label: 'Viral', emoji: '🔥', description: 'Hook forte + CTA irresistível' },
  { id: 'emotional', label: 'Emocional', emoji: '💔', description: 'Toca o coração e gera saves' },
  { id: 'authority', label: 'Autoridade', emoji: '👑', description: 'Posiciona como referência' },
  { id: 'testimony', label: 'Testemunho', emoji: '🙌', description: 'Prova social que converte' },
  { id: 'controversial', label: 'Polêmico', emoji: '⚡', description: 'Gera debate e comentários' },
];

const platforms = [
  { id: 'instagram', label: 'Instagram', emoji: '📸', tip: 'CTA + 20 hashtags' },
  { id: 'stories', label: 'Stories', emoji: '📱', tip: 'Pergunta + enquete' },
  { id: 'tiktok', label: 'TikTok', emoji: '🎵', tip: 'Hook 2s + trend' },
  { id: 'twitter', label: 'Twitter/X', emoji: '🐦', tip: '280 chars max' },
];

export default function CaptionsScreen() {
  const router = useRouter();
  const { colors, state, canCreate, recordCreate } = useApp();
  const [topic, setTopic] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('viral');
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [result, setResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!canCreate()) {
      router.push('/paywall' as never);
      return;
    }

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
          content: `Você é um COPYWRITER CRISTÃO SÊNIOR especialista em conteúdo viral para redes sociais. Você domina técnicas de direct response, storytelling persuasivo e gatilhos mentais éticos.

MISSÃO: Criar legendas que VIRALIZAM para ${platform?.label}.

TEMA: "${topicText}"
ESTILO: ${style?.label} — ${style?.description}

REGRAS DE OURO DO VIRAL:
1. HOOK MAGNÉTICO nos primeiros 7 palavras (pattern interrupt que para o scroll)
2. Storytelling micro — conte uma mini-história em 3 linhas
3. VERSÍCULO BÍBLICO integrado naturalmente (não forçado)
4. Gatilhos: curiosidade, urgência emocional, identificação, prova social
5. CTA IRRESISTÍVEL no final (salve, compartilhe, comente, marque)
6. Emojis estratégicos (não excessivos)

FORMATO ESPECÍFICO POR PLATAFORMA:
${selectedPlatform === 'instagram' ? `- Legenda completa (150-300 palavras)
- Primeira linha = HOOK que para o scroll
- Quebra de linha estratégica para "ver mais"
- CTA duplo: "Salve para reler 🔖" + "Marque quem precisa ouvir isso"
- 20-25 hashtags divididas em: 5 populares (1M+), 10 médias (100K-1M), 10 nichadas (10K-100K)
- Inclua hashtags como #fécristã #versiculododia #deusnocomando` :
selectedPlatform === 'stories' ? `- Texto curto e direto (máx 3 linhas)
- Pergunta que gera taps e respostas
- Formato: afirmação impactante + pergunta + emoji
- Sugira: enquete, quiz ou caixa de perguntas
- "Arrasta pra cima" ou "Responde aqui"` :
selectedPlatform === 'tiktok' ? `- Hook nos primeiros 2 segundos (frase falada)
- Linguagem jovem e autêntica
- Hashtags trending + nichadas
- Formato: "POV:", "Ninguém fala sobre isso mas...", "3 versículos que..."
- CTA: "Salva pra não esquecer" / "Comenta AMÉM"` :
`- Máximo 280 caracteres
- Thread opcional (4-5 tweets)
- Impactante e compartilhável
- Use "🧵" se for thread`}

GERE 3 OPÇÕES DIFERENTES:
- Opção 1: A MAIS VIRAL (hook controverso/surpreendente)
- Opção 2: A MAIS EMOCIONAL (toca o coração)
- Opção 3: A MAIS ENGAJADORA (gera mais comentários)

Numere cada opção. Em português do Brasil. Tom pastoral mas moderno.

Ao final, adicione:
---
✨ Criado com Kairos`,
        }],
      });
      setResult(response);
      recordCreate();
    } catch {
      setResult('Erro ao gerar legendas. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  }, [topic, selectedStyle, selectedPlatform, canCreate, recordCreate, router]);

  const handleCopy = useCallback(async () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await Clipboard.setStringAsync(result);
    Alert.alert('Copiado!', 'Legenda copiada. Agora é só postar e viralizar!');
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Legendas que Viralizam</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {!result && !isGenerating && (
          <>
            <View style={styles.proofRow}>
              <TrendingUp size={14} color="#10B981" />
              <Text style={[styles.proofText, { color: '#10B981' }]}>
                +8.432 legendas geradas esta semana
              </Text>
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>Tema (opcional)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
              placeholder="Ex: gratidão, superação, fé, família..."
              placeholderTextColor={colors.textMuted}
              value={topic}
              onChangeText={setTopic}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Estilo da Copy</Text>
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
                  <View>
                    <Text style={[styles.optionLabel, { color: selectedStyle === s.id ? '#8B5CF6' : colors.text }]}>{s.label}</Text>
                    <Text style={[styles.optionDesc, { color: colors.textMuted }]}>{s.description}</Text>
                  </View>
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
                  <View>
                    <Text style={[styles.optionLabel, { color: selectedPlatform === p.id ? '#EC4899' : colors.text }]}>{p.label}</Text>
                    <Text style={[styles.optionDesc, { color: colors.textMuted }]}>{p.tip}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.generateBtn, { backgroundColor: '#8B5CF6' }]}
              onPress={() => void handleGenerate()}
            >
              <Sparkles size={18} color="#FFF" />
              <Text style={styles.generateBtnText}>Gerar Legendas Virais</Text>
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
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>Nosso copywriter IA está criando suas legendas...</Text>
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
                <Text style={[styles.actionText, { color: '#EC4899' }]}>Enviar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#10B981' + '15' }]} onPress={() => setResult('')}>
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
  proofRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16, justifyContent: 'center' },
  proofText: { fontSize: 12, fontWeight: '600' as const },
  label: { fontSize: 13, fontWeight: '700' as const, textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: 10, marginTop: 4 },
  input: { borderWidth: 1, borderRadius: 14, padding: 14, fontSize: 15, marginBottom: 16 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  optionChip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  optionEmoji: { fontSize: 18 },
  optionLabel: { fontSize: 13, fontWeight: '600' as const },
  optionDesc: { fontSize: 11, marginTop: 1 },
  generateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14, marginTop: 8 },
  generateBtnText: { fontSize: 16, fontWeight: '700' as const, color: '#FFF' },
  limitText: { fontSize: 12, textAlign: 'center' as const, marginTop: 10 },
  loadingContainer: { alignItems: 'center', paddingTop: 60, gap: 16 },
  loadingText: { fontSize: 15, textAlign: 'center' as const },
  resultCard: { borderRadius: 16, padding: 18, borderWidth: 1, marginBottom: 16 },
  resultText: { fontSize: 15, lineHeight: 24 },
  resultActions: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12 },
  actionText: { fontSize: 14, fontWeight: '600' as const },
});
