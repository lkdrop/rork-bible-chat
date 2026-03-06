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

const videoTypes = [
  { id: 'reels', label: 'Reels/TikTok', emoji: '📱', duration: '15-60s', tip: 'Hook 2s + rápido' },
  { id: 'youtube-short', label: 'YouTube Shorts', emoji: '🎬', duration: '30-60s', tip: 'Valor rápido' },
  { id: 'youtube', label: 'YouTube Longo', emoji: '▶️', duration: '8-15min', tip: 'SEO + retenção' },
  { id: 'podcast', label: 'Podcast', emoji: '🎙️', duration: '15-30min', tip: 'Profundidade' },
];

const contentTypes = [
  { id: 'teaching', label: 'Ensino', emoji: '📖' },
  { id: 'testimony', label: 'Testemunho', emoji: '🙌' },
  { id: 'devotional', label: 'Devocional', emoji: '🕊️' },
  { id: 'apologetics', label: 'Apologética', emoji: '🛡️' },
  { id: 'motivation', label: 'Motivacional', emoji: '🔥' },
  { id: 'controversial', label: 'Polêmico', emoji: '⚡' },
];

export default function ScriptsScreen() {
  const router = useRouter();
  const { colors, state, canCreate, recordCreate } = useApp();
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

    if (!canCreate()) {
      router.push('/paywall' as never);
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
          content: `Você é um ROTEIRISTA CRISTÃO SÊNIOR + ESPECIALISTA EM ALGORITMOS de redes sociais. Você sabe EXATAMENTE o que faz um vídeo viralizar no ${videoType?.label}.

MISSÃO: Criar um roteiro que VIRALIZA e ENGAJA para ${videoType?.label} (${videoType?.duration}).

TEMA: "${topic.trim()}"
TIPO: ${contentType?.label}

${selectedType === 'reels' || selectedType === 'youtube-short' ? `
ESTRUTURA VIRAL PARA SHORTS:

🎯 HOOK (0-3 segundos) — A PARTE MAIS IMPORTANTE
- Pattern interrupt que PARA O SCROLL
- Use uma dessas fórmulas comprovadas:
  • "Ninguém te conta isso sobre [tema]..."
  • "Eu descobri algo que mudou minha fé..."
  • "Se você é cristão, PARE de fazer isso"
  • Pergunta retórica que gera curiosidade
- [TELA] Texto na tela reforçando o hook

📖 DESENVOLVIMENTO (3-40 segundos)
- Versículo bíblico integrado naturalmente
- 1 insight principal (não mais que 1!)
- Storytelling: situação → problema → solução bíblica
- [TELA] Versículo aparecendo na tela
- Mantenha ritmo rápido, sem pausas longas

🔥 CTA PODEROSO (últimos 5 segundos)
- "Comenta AMÉM se você crê"
- "Salva esse vídeo antes que saia do seu feed"
- "Manda pra alguém que precisa ouvir isso"
- [TELA] Texto do CTA

📝 EXTRAS:
- LEGENDA otimizada com hook + hashtags
- 25 HASHTAGS (mix: trending + nicho cristão)
- MÚSICA SUGERIDA (trend atual ou worship)
- MELHOR HORÁRIO para postar
- THUMBNAIL/CAPA sugerida com texto` : selectedType === 'youtube' ? `
ESTRUTURA YOUTUBE QUE RETÉM:

🎯 HOOK + INTRO (0-60s)
- Promessa clara do que o viewer vai ganhar
- Pattern interrupt: "O que eu vou te mostrar agora..."
- Preview do melhor momento do vídeo
- Não coloque vinheta longa — vá direto

📖 CONTEÚDO (3 PONTOS PRINCIPAIS)
- Ponto 1: Contexto bíblico + versículo
- Ponto 2: Aplicação prática + exemplo real
- Ponto 3: Transformação + testemunho
- Retention hack: "Fique até o final porque..."
- Open loops entre cada ponto

🔥 CONCLUSÃO + CTA
- Resumo dos 3 pontos
- Oração poderosa
- CTA triplo: Inscreva-se + Like + Comentário
- Teaser do próximo vídeo

📝 SEO DO YOUTUBE:
- TÍTULO otimizado (60 chars, com palavra-chave)
- DESCRIÇÃO com timestamps e links
- TAGS sugeridas (20+)
- THUMBNAIL: texto + emoção + contraste` : `
ESTRUTURA PODCAST ENVOLVENTE:

🎯 ABERTURA (2-3min)
- Saudação calorosa + tema do episódio
- Por que esse tema importa AGORA
- O que o ouvinte vai aprender

📖 DESENVOLVIMENTO (3-4 blocos)
- Bloco 1: Contexto e passagem bíblica
- Bloco 2: Análise profunda com exemplos
- Bloco 3: Aplicação prática + testemunho
- Bloco 4: Reflexão e pergunta para o ouvinte

🔥 ENCERRAMENTO
- Oração guiada
- Resumo + CTA para seguir/avaliar
- Teaser do próximo episódio

📝 EXTRAS:
- Descrição do episódio
- Quotes para postar como cards`}

REGRAS:
- Português do Brasil, tom pastoral mas MODERNO
- Marque [TELA] para mudanças visuais
- Marque [FALA] para o que dizer literalmente
- Inclua versículos com referências completas
- Otimize para o ALGORITMO da plataforma
- Pense em RETENÇÃO: cada segundo conta

Ao final, adicione:
---
✨ Criado com Bíblia IA`,
        }],
      });
      setResult(response);
      recordCreate();
    } catch {
      setResult('Erro ao gerar roteiro. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  }, [topic, selectedType, selectedContent, canCreate, recordCreate, router]);

  const handleCopy = useCallback(async () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await Clipboard.setStringAsync(result);
    Alert.alert('Copiado!', 'Roteiro copiado. Agora é gravar e viralizar!');
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Roteiros Virais</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {!result && !isGenerating && (
          <>
            <View style={styles.proofRow}>
              <TrendingUp size={14} color="#EF4444" />
              <Text style={[styles.proofText, { color: '#EF4444' }]}>
                Roteiros otimizados para algoritmo 2025
              </Text>
            </View>

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
                    <Text style={[styles.optionDuration, { color: colors.textMuted }]}>{v.duration} • {v.tip}</Text>
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
              <Text style={styles.generateBtnText}>Gerar Roteiro Viral</Text>
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
            <ActivityIndicator size="large" color="#EF4444" />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>Nosso roteirista IA está escrevendo seu roteiro viral...</Text>
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
  proofRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16, justifyContent: 'center' },
  proofText: { fontSize: 12, fontWeight: '600' as const },
  label: { fontSize: 13, fontWeight: '700' as const, textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: 10, marginTop: 4 },
  input: { borderWidth: 1, borderRadius: 14, padding: 14, fontSize: 15, marginBottom: 16 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  optionChip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  optionEmoji: { fontSize: 18 },
  optionLabel: { fontSize: 13, fontWeight: '600' as const },
  optionDuration: { fontSize: 11, marginTop: 1 },
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
