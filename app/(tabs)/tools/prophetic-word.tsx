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
import { ArrowLeft, Sparkles, Share2, Bookmark, Lock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { Volume2 } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { generateText } from '@/services/gemini';

export default function PropheticWordScreen() {
  const router = useRouter();
  const { colors, state, canUseProphetic, recordPropheticUse, addVerseHighlight } = useApp();
  const [situation, setSituation] = useState('');
  const [result, setResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!situation.trim()) {
      Alert.alert('Conte sua situação', 'Descreva brevemente o que está vivendo para receber uma palavra.');
      return;
    }

    if (!canUseProphetic()) {
      router.push('/paywall' as never);
      return;
    }

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsGenerating(true);
    setResult('');

    try {
      const response = await generateText({
        messages: [{
          role: 'user',
          content: `Você é Gabriel, um guia espiritual profético dentro do app Bíblia IA. O usuário está vivendo a seguinte situação:

"${situation.trim()}"

Gere uma PALAVRA PROFÉTICA DE ENCORAJAMENTO em português do Brasil. A palavra deve:
1. Começar com uma declaração profética poderosa (ex: "Assim diz o Senhor...")
2. Incluir 1-2 versículos bíblicos diretamente relacionados com referência completa
3. Trazer uma palavra de esperança e direção para a situação específica
4. Ser tocante, pastoral e cheia de fé
5. Ter no máximo 6 parágrafos
6. Terminar com uma declaração de fé

Seja específico para a situação do usuário. Não seja genérico.`,
        }],
      });
      setResult(response);
      recordPropheticUse();
    } catch {
      setResult('O Senhor diz: "Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus. Eu te fortaleço, eu te ajudo, eu te sustento com a minha destra fiel." — Isaías 41:10\n\nDeus está ao seu lado neste momento. Confie Nele.');
    } finally {
      setIsGenerating(false);
    }
  }, [situation, canUseProphetic, recordPropheticUse, router]);

  const handleShare = useCallback(async () => {
    if (!result) return;
    try {
      await Share.share({ message: result + '\n\nPalavra Profética — Bíblia IA' });
    } catch {
      // cancelled
    }
  }, [result]);

  const handleSave = useCallback(() => {
    if (!result) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addVerseHighlight(result.substring(0, 200), 'Palavra Profética', situation, '#8B5CF6');
    Alert.alert('Salvo!', 'Palavra profética salva nos seus favoritos.');
  }, [result, situation, addVerseHighlight]);

  const handleSpeak = useCallback(() => {
    if (isSpeaking) {
      void Speech.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      Speech.speak(result, {
        language: 'pt-BR',
        rate: 0.8,
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  }, [result, isSpeaking]);

  const canUse = canUseProphetic();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Palavra Profética</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {!result && !isGenerating && (
          <>
            <View style={styles.iconRow}>
              <Sparkles size={32} color="#8B5CF6" />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Receba uma Palavra de Deus</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Descreva brevemente sua situação atual e Gabriel vai trazer uma palavra profética de encorajamento baseada nas Escrituras.
            </Text>

            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
              placeholder="Ex: Estou passando por dificuldades financeiras e preciso de direção..."
              placeholderTextColor={colors.textMuted}
              value={situation}
              onChangeText={setSituation}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={300}
            />

            <Text style={[styles.charCount, { color: colors.textMuted }]}>{situation.length}/300</Text>

            <TouchableOpacity
              style={[styles.generateBtn, { backgroundColor: '#8B5CF6' }, !situation.trim() && { opacity: 0.5 }]}
              onPress={() => void handleGenerate()}
              disabled={!situation.trim()}
            >
              <Sparkles size={18} color="#FFF" />
              <Text style={styles.generateBtnText}>Receber Palavra</Text>
            </TouchableOpacity>

            {!canUse && !state.isPremium && (
              <View style={[styles.limitNote, { backgroundColor: colors.primaryLight }]}>
                <Lock size={14} color={colors.primary} />
                <Text style={[styles.limitText, { color: colors.primary }]}>
                  Limite diário atingido. Assine Premium para ilimitado.
                </Text>
              </View>
            )}
          </>
        )}

        {isGenerating && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>Gabriel está buscando uma palavra para você...</Text>
          </View>
        )}

        {result && !isGenerating && (
          <View style={[styles.resultCard, { backgroundColor: '#8B5CF6' + '08', borderColor: '#8B5CF6' + '25' }]}>
            <View style={styles.resultHeader}>
              <Sparkles size={18} color="#8B5CF6" />
              <Text style={styles.resultLabel}>Palavra Profética</Text>
            </View>
            <Text style={[styles.resultText, { color: colors.text }]}>{result}</Text>
            <View style={styles.resultActions}>
              <TouchableOpacity style={[styles.actionBtn, isSpeaking && { backgroundColor: '#8B5CF6' }]} onPress={handleSpeak}>
                <Volume2 size={14} color={isSpeaking ? '#FFF' : '#8B5CF6'} />
                <Text style={[styles.actionText, isSpeaking && { color: '#FFF' }]}>{isSpeaking ? 'Parar' : 'Ouvir'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={handleSave}>
                <Bookmark size={14} color="#8B5CF6" />
                <Text style={styles.actionText}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => void handleShare()}>
                <Share2 size={14} color="#8B5CF6" />
                <Text style={styles.actionText}>Compartilhar</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.newWordBtn, { borderColor: '#8B5CF6' + '30' }]}
              onPress={() => { setResult(''); setSituation(''); }}
            >
              <Text style={[styles.newWordText, { color: '#8B5CF6' }]}>Receber nova palavra</Text>
            </TouchableOpacity>
          </View>
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
  iconRow: { alignItems: 'center', marginBottom: 16, marginTop: 20 },
  title: { fontSize: 22, fontWeight: '800' as const, textAlign: 'center' as const, marginBottom: 8 },
  subtitle: { fontSize: 15, textAlign: 'center' as const, lineHeight: 22, marginBottom: 24 },
  input: { borderWidth: 1, borderRadius: 14, padding: 16, fontSize: 15, minHeight: 100, lineHeight: 22, marginBottom: 4 },
  charCount: { fontSize: 12, textAlign: 'right' as const, marginBottom: 16 },
  generateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14 },
  generateBtnText: { fontSize: 16, fontWeight: '700' as const, color: '#FFF' },
  limitNote: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, borderRadius: 12, marginTop: 14 },
  limitText: { fontSize: 13, fontWeight: '600' as const, flex: 1 },
  loadingContainer: { alignItems: 'center', paddingTop: 60, gap: 16 },
  loadingText: { fontSize: 15, textAlign: 'center' as const },
  resultCard: { borderRadius: 16, padding: 20, borderWidth: 1 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  resultLabel: { fontSize: 14, fontWeight: '700' as const, color: '#8B5CF6', textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  resultText: { fontSize: 16, lineHeight: 26 },
  resultActions: { flexDirection: 'row', gap: 10, marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#8B5CF6' + '15' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, backgroundColor: '#8B5CF6' + '15' },
  actionText: { fontSize: 13, fontWeight: '600' as const, color: '#8B5CF6' },
  newWordBtn: { marginTop: 14, paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  newWordText: { fontSize: 14, fontWeight: '600' as const },
});
