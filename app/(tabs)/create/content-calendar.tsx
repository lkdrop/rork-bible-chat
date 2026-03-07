import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Sparkles, Copy, RefreshCw, Calendar } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { useApp } from '@/contexts/AppContext';
import { generateText } from '@/services/gemini';

const calendarTypes = [
  { id: '7days', label: '7 Dias', emoji: '📅', desc: 'Planejamento semanal' },
  { id: '15days', label: '15 Dias', emoji: '📆', desc: 'Quinzenal estratégico' },
  { id: '30days', label: '30 Dias', emoji: '🗓️', desc: 'Mês completo' },
];

const niches = [
  { id: 'church', label: 'Igreja/Ministério', emoji: '⛪' },
  { id: 'personal', label: 'Perfil Pessoal', emoji: '👤' },
  { id: 'youth', label: 'Jovens', emoji: '🔥' },
  { id: 'women', label: 'Mulheres', emoji: '💜' },
  { id: 'couples', label: 'Casais', emoji: '💑' },
];

export default function ContentCalendarScreen() {
  const router = useRouter();
  const { colors, state, recordCreate } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState('7days');
  const [selectedNiche, setSelectedNiche] = useState('personal');
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

    const period = calendarTypes.find(c => c.id === selectedPeriod);
    const niche = niches.find(n => n.id === selectedNiche);
    const days = selectedPeriod === '7days' ? 7 : selectedPeriod === '15days' ? 15 : 30;

    try {
      const response = await generateText({
        messages: [{
          role: 'user',
          content: `Você é um ESTRATEGISTA DE CONTEÚDO CRISTÃO para redes sociais. Crie um CALENDÁRIO DE CONTEÚDO de ${days} dias para ${niche?.label}.

FORMATO PARA CADA DIA:
📅 Dia X — [Dia da semana]
🎯 Tema: [tema do dia]
📝 Tipo: [Reels/Carrossel/Story/Post/Live]
✍️ Ideia: [resumo do conteúdo em 1-2 linhas]
📖 Versículo: [versículo sugerido]
⏰ Horário: [melhor horário para postar]
#️⃣ Hashtags: [5 hashtags principais]

ESTRATÉGIA:
- Segunda: Motivacional (início de semana forte)
- Terça: Ensino/Versículo (conteúdo de valor)
- Quarta: Testemunho/Prova social (meio de semana)
- Quinta: Dica prática (aplicação bíblica)
- Sexta: Reflexão profunda (preparação pro fim de semana)
- Sábado: Conteúdo leve/interativo (enquete, quiz)
- Domingo: Louvor/Gratidão (dia especial)

REGRAS:
- Alterne entre Reels, Carrosséis, Stories e Posts
- Inclua 2 Lives por mês
- Considere datas especiais/comemorativas
- Mix de conteúdo: 40% valor, 30% engajamento, 20% inspiração, 10% CTA
- Português do Brasil
- Nicho: ${niche?.label}

Ao final, adicione:
💡 DICA BÔNUS: Estratégia de crossposting (como reaproveitar o conteúdo em múltiplas plataformas)

✨ Criado com Kairos`,
        }],
      });
      setResult(response);
      recordCreate();
    } catch {
      setResult('Erro ao gerar calendário. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedPeriod, selectedNiche, state.isPremium, recordCreate, router]);

  const handleCopy = useCallback(async () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await Clipboard.setStringAsync(result);
    Alert.alert('Copiado!', 'Calendário copiado. Agora é só seguir o plano!');
  }, [result]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Calendário de Conteúdo</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {!result && !isGenerating && (
          <>
            <View style={[styles.premiumBadge, { backgroundColor: '#F97316' + '15' }]}>
              <Calendar size={16} color="#F97316" />
              <Text style={[styles.premiumBadgeText, { color: '#F97316' }]}>Ferramenta Premium</Text>
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>Período</Text>
            <View style={styles.optionsRow}>
              {calendarTypes.map(c => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.optionChip, { backgroundColor: selectedPeriod === c.id ? '#F97316' + '15' : colors.card, borderColor: selectedPeriod === c.id ? '#F97316' : colors.borderLight }]}
                  onPress={() => setSelectedPeriod(c.id)}
                >
                  <Text style={styles.optionEmoji}>{c.emoji}</Text>
                  <Text style={[styles.optionLabel, { color: selectedPeriod === c.id ? '#F97316' : colors.text }]}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>Nicho</Text>
            <View style={styles.optionsRow}>
              {niches.map(n => (
                <TouchableOpacity
                  key={n.id}
                  style={[styles.optionChip, { backgroundColor: selectedNiche === n.id ? '#F97316' + '15' : colors.card, borderColor: selectedNiche === n.id ? '#F97316' : colors.borderLight }]}
                  onPress={() => setSelectedNiche(n.id)}
                >
                  <Text style={styles.optionEmoji}>{n.emoji}</Text>
                  <Text style={[styles.optionLabel, { color: selectedNiche === n.id ? '#F97316' : colors.text }]}>{n.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.generateBtn, { backgroundColor: '#F97316' }]}
              onPress={() => void handleGenerate()}
            >
              <Sparkles size={18} color="#FFF" />
              <Text style={styles.generateBtnText}>Gerar Calendário</Text>
            </TouchableOpacity>
          </>
        )}

        {isGenerating && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F97316" />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>Planejando seu conteúdo estratégico...</Text>
          </View>
        )}

        {result && !isGenerating && (
          <>
            <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              <Text style={[styles.resultText, { color: colors.text }]}>{result}</Text>
            </View>
            <View style={styles.resultActions}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#F97316' + '15' }]} onPress={() => void handleCopy()}>
                <Copy size={16} color="#F97316" />
                <Text style={[styles.actionText, { color: '#F97316' }]}>Copiar</Text>
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
  label: { fontSize: 13, fontWeight: '700' as const, textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: 10, marginTop: 4 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  optionChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  optionEmoji: { fontSize: 18 },
  optionLabel: { fontSize: 13, fontWeight: '600' as const },
  generateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14, marginTop: 8 },
  generateBtnText: { fontSize: 16, fontWeight: '700' as const, color: '#FFF' },
  loadingContainer: { alignItems: 'center', paddingTop: 60, gap: 16 },
  loadingText: { fontSize: 15 },
  resultCard: { borderRadius: 16, padding: 18, borderWidth: 1, marginBottom: 16 },
  resultText: { fontSize: 15, lineHeight: 24 },
  resultActions: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12 },
  actionText: { fontSize: 14, fontWeight: '600' as const },
});
