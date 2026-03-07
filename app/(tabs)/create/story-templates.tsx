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
import { generateText } from '@/services/gemini';

const templateTypes = [
  { id: 'quiz', label: 'Quiz Bíblico', emoji: '❓', desc: 'Perguntas que geram taps' },
  { id: 'poll', label: 'Enquete', emoji: '📊', desc: 'Enquetes que todo mundo vota' },
  { id: 'reflection', label: 'Reflexão', emoji: '💭', desc: 'Frases que geram prints' },
  { id: 'challenge', label: 'Desafio 7 Dias', emoji: '🎯', desc: 'Desafio viral para seguidores' },
  { id: 'verse-of-day', label: 'Versículo', emoji: '📖', desc: 'Versículo + engajamento' },
  { id: 'countdown', label: 'Contagem', emoji: '⏰', desc: 'Contagem que gera expectativa' },
];

export default function StoryTemplatesScreen() {
  const router = useRouter();
  const { colors, state, canCreate, recordCreate } = useApp();
  const [selectedType, setSelectedType] = useState('quiz');
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

    const template = templateTypes.find(t => t.id === selectedType);

    try {
      const response = await generateText({
        messages: [{
          role: 'user',
          content: `Você é um ESPECIALISTA EM STORIES VIRAIS para o nicho cristão. Crie templates de Story no formato "${template?.label}" (${template?.desc}).

${selectedType === 'quiz' ? `Crie 5 perguntas bíblicas IRRESISTÍVEIS para stories. Para cada:
- Pergunta que gera curiosidade + 2 opções (enquete)
- Resposta correta + curiosidade surpreendente
- Formato pronto para stories (curto, visual)
- Use "Você sabia?" ou "Teste sua fé"` :
selectedType === 'poll' ? `Crie 5 enquetes bíblicas que TODO MUNDO vai querer votar:
- Perguntas tipo "Isso ou aquilo" (ex: "Davi ou Moisés?")
- Use formatos polêmicos (sem ser desrespeitoso)
- Versículo relacionado
- Formato: pergunta + 2-3 opções + resultado surpreendente` :
selectedType === 'reflection' ? `Crie 5 frases de reflexão que as pessoas VÃO PRINTAR:
- Máximo 2 linhas cada (formato stories)
- Tão profundas que a pessoa precisa salvar
- Versículo base integrado
- Tom: impactante, pessoal, íntimo` :
selectedType === 'challenge' ? `Crie um DESAFIO DE FÉ DE 7 DIAS viral para stories:
- Nome do desafio com hashtag (#DesafioFé7Dias)
- 1 desafio prático por dia + versículo
- Formato: dia + desafio + versículo + "Fez? Posta no stories!"
- CTA: "Marque um amigo para fazer junto"` :
selectedType === 'verse-of-day' ? `Crie 7 versículos formatados para STORIES VIRAIS:
- Versículo completo + referência
- Reflexão de 1 frase que gera identificação
- Pergunta que gera resposta no stories
- Formato: texto + pergunta + CTA ("Responde aqui 👇")` :
`Crie uma contagem regressiva bíblica de 5 dias:
- Tema épico da contagem
- Versículo do dia + frase de antecipação
- Gere FOMO (fear of missing out)
- CTA: "Ative o lembrete para não perder"`}

REGRAS:
- Português do Brasil
- Formato pronto para copiar e usar
- Use emojis estrategicamente
- Numerado e organizado
- Otimizado para ENGAJAMENTO máximo
- Pense: "O que faria EU interagir com esse story?"

Ao final, adicione:
---
✨ Criado com Kairos`,
        }],
      });
      setResult(response);
      recordCreate();
    } catch {
      setResult('Erro ao gerar template. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedType, canCreate, recordCreate, router]);

  const handleCopy = useCallback(async () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await Clipboard.setStringAsync(result);
    Alert.alert('Copiado!', 'Template copiado. Stories que engajam!');
  }, [result]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Stories Interativos</Text>
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
              <Text style={styles.generateBtnText}>Gerar Stories Virais</Text>
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
            <ActivityIndicator size="large" color="#F59E0B" />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>Criando stories que viralizam...</Text>
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
  limitText: { fontSize: 12, textAlign: 'center' as const, marginTop: 10 },
  loadingContainer: { alignItems: 'center', paddingTop: 60, gap: 16 },
  loadingText: { fontSize: 15 },
  resultCard: { borderRadius: 16, padding: 18, borderWidth: 1, marginBottom: 16 },
  resultText: { fontSize: 15, lineHeight: 24 },
  resultActions: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12 },
  actionText: { fontSize: 14, fontWeight: '600' as const },
});
