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
import { ArrowLeft, Sparkles, Copy, RefreshCw, Type } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { useApp } from '@/contexts/AppContext';
import { generateText } from '@/services/gemini';

const bioTypes = [
  { id: 'pastor', label: 'Pastor/Líder', emoji: '⛪' },
  { id: 'worship', label: 'Adorador/Músico', emoji: '🎵' },
  { id: 'creator', label: 'Criador de Conteúdo', emoji: '📱' },
  { id: 'ministry', label: 'Ministério', emoji: '🕊️' },
  { id: 'personal', label: 'Perfil Pessoal', emoji: '✝️' },
];

const platforms = [
  { id: 'instagram', label: 'Instagram', emoji: '📸' },
  { id: 'tiktok', label: 'TikTok', emoji: '🎵' },
  { id: 'youtube', label: 'YouTube', emoji: '▶️' },
  { id: 'twitter', label: 'Twitter/X', emoji: '🐦' },
];

export default function BioGeneratorScreen() {
  const router = useRouter();
  const { colors, state, recordCreate } = useApp();
  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState('creator');
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
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

    const bioType = bioTypes.find(b => b.id === selectedType);
    const platform = platforms.find(p => p.id === selectedPlatform);

    try {
      const response = await generateText({
        messages: [{
          role: 'user',
          content: `Você é um ESPECIALISTA EM BRANDING PESSOAL para criadores cristãos.

Gere 5 opções de BIO otimizada para ${platform?.label}.
Tipo de perfil: ${bioType?.label}
${name.trim() ? `Nome: ${name.trim()}` : ''}

CADA BIO DEVE TER:
1. Posicionamento claro (quem você é)
2. Proposta de valor (o que o seguidor ganha)
3. Prova social ou credencial
4. CTA (link, WhatsApp, etc)
5. Emoji estratégico
6. Versículo ou frase de fé

REGRAS POR PLATAFORMA:
${selectedPlatform === 'instagram' ? `- Máximo 150 caracteres
- Use quebras de linha estratégicas
- Inclua CTA para link na bio` :
selectedPlatform === 'tiktok' ? `- Máximo 80 caracteres
- Direto e impactante
- Use emojis que representem o nicho` :
selectedPlatform === 'youtube' ? `- Bio descritiva (até 1000 chars)
- Inclua palavras-chave para SEO
- Diga o que o canal oferece e frequência de posts` :
`- Máximo 160 caracteres
- Tom profissional mas autêntico
- Inclua hashtag principal`}

FORMATOS:
- Bio 1: Profissional e clean
- Bio 2: Criativa com emojis
- Bio 3: Direta com CTA forte
- Bio 4: Com versículo/frase de fé
- Bio 5: Minimalista e impactante

Português do Brasil. Pronto para copiar e colar.

✨ Criado com Devocio`,
        }],
      });
      setResult(response);
      recordCreate();
    } catch {
      setResult('Erro ao gerar bio. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  }, [name, selectedType, selectedPlatform, state.isPremium, recordCreate, router]);

  const handleCopy = useCallback(async () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await Clipboard.setStringAsync(result);
    Alert.alert('Copiado!', 'Bio copiada. Atualize seu perfil!');
  }, [result]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Bio Otimizada</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {!result && !isGenerating && (
          <>
            <View style={[styles.premiumBadge, { backgroundColor: '#14B8A6' + '15' }]}>
              <Type size={16} color="#14B8A6" />
              <Text style={[styles.premiumBadgeText, { color: '#14B8A6' }]}>Ferramenta Premium</Text>
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>Seu Nome (opcional)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
              placeholder="Ex: Pastor João, Maria Silva..."
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Tipo de Perfil</Text>
            <View style={styles.optionsRow}>
              {bioTypes.map(b => (
                <TouchableOpacity
                  key={b.id}
                  style={[styles.optionChip, { backgroundColor: selectedType === b.id ? '#14B8A6' + '15' : colors.card, borderColor: selectedType === b.id ? '#14B8A6' : colors.borderLight }]}
                  onPress={() => setSelectedType(b.id)}
                >
                  <Text style={styles.optionEmoji}>{b.emoji}</Text>
                  <Text style={[styles.optionLabel, { color: selectedType === b.id ? '#14B8A6' : colors.text }]}>{b.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>Plataforma</Text>
            <View style={styles.optionsRow}>
              {platforms.map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.optionChip, { backgroundColor: selectedPlatform === p.id ? '#14B8A6' + '15' : colors.card, borderColor: selectedPlatform === p.id ? '#14B8A6' : colors.borderLight }]}
                  onPress={() => setSelectedPlatform(p.id)}
                >
                  <Text style={styles.optionEmoji}>{p.emoji}</Text>
                  <Text style={[styles.optionLabel, { color: selectedPlatform === p.id ? '#14B8A6' : colors.text }]}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.generateBtn, { backgroundColor: '#14B8A6' }]}
              onPress={() => void handleGenerate()}
            >
              <Sparkles size={18} color="#FFF" />
              <Text style={styles.generateBtnText}>Gerar Bio Profissional</Text>
            </TouchableOpacity>
          </>
        )}

        {isGenerating && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#14B8A6" />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>Criando bios otimizadas...</Text>
          </View>
        )}

        {result && !isGenerating && (
          <>
            <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              <Text style={[styles.resultText, { color: colors.text }]}>{result}</Text>
            </View>
            <View style={styles.resultActions}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#14B8A6' + '15' }]} onPress={() => void handleCopy()}>
                <Copy size={16} color="#14B8A6" />
                <Text style={[styles.actionText, { color: '#14B8A6' }]}>Copiar</Text>
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
  input: { borderWidth: 1, borderRadius: 14, padding: 14, fontSize: 15, marginBottom: 16 },
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
