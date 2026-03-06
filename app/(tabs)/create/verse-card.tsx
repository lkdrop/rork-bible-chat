import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Share2, RefreshCw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';

const backgrounds = [
  { id: 'sunset', label: 'Pôr do Sol', colors: ['#FF6B35', '#FF2D55', '#5856D6'] },
  { id: 'sky', label: 'Céu', colors: ['#007AFF', '#5AC8FA', '#E8F0FE'] },
  { id: 'nature', label: 'Natureza', colors: ['#34C759', '#30D158', '#A8E6CF'] },
  { id: 'dark', label: 'Noturno', colors: ['#1C1C1E', '#2C2C2E', '#C9922A'] },
  { id: 'gold', label: 'Dourado', colors: ['#C9922A', '#E8C564', '#FFF8E1'] },
  { id: 'royal', label: 'Real', colors: ['#5856D6', '#AF52DE', '#E8D5F5'] },
];

const fonts = [
  { id: 'serif', label: 'Clássica' },
  { id: 'sans', label: 'Moderna' },
  { id: 'script', label: 'Elegante' },
];

export default function VerseCardScreen() {
  const router = useRouter();
  const { colors } = useApp();
  const [verseText, setVerseText] = useState('');
  const [reference, setReference] = useState('');
  const [selectedBg, setSelectedBg] = useState('gold');
  const [selectedFont, setSelectedFont] = useState('serif');
  const [showPreview, setShowPreview] = useState(false);

  const bg = backgrounds.find(b => b.id === selectedBg) ?? backgrounds[4];

  const handlePreview = useCallback(() => {
    if (!verseText.trim()) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowPreview(true);
  }, [verseText]);

  const handleShare = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const text = `"${verseText}"\n\n— ${reference || 'Versículo'}\n\nCriado com Bíblia IA`;
    try {
      await Share.share({ message: text });
    } catch {
      // cancelled
    }
  }, [verseText, reference]);

  if (showPreview) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => setShowPreview(false)} style={styles.backBtn}>
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Preview</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.previewContainer}>
          <View style={[styles.cardPreview, { backgroundColor: bg.colors[0] }]}>
            <View style={[styles.cardInner, { backgroundColor: bg.colors[1] + '30' }]}>
              <Text style={[styles.cardQuote, selectedFont === 'script' && styles.cardQuoteScript]}>
                "{verseText}"
              </Text>
              {reference && (
                <Text style={styles.cardRef}>— {reference}</Text>
              )}
              <View style={styles.cardWatermark}>
                <Text style={styles.cardWatermarkText}>Bíblia IA</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.previewActions}>
          <TouchableOpacity style={[styles.previewBtn, { backgroundColor: '#EC4899' }]} onPress={() => void handleShare()}>
            <Share2 size={18} color="#FFF" />
            <Text style={styles.previewBtnText}>Compartilhar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.editBtn, { borderColor: colors.border }]} onPress={() => setShowPreview(false)}>
            <Text style={[styles.editBtnText, { color: colors.text }]}>Editar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Card de Versículo</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Versículo</Text>
        <TextInput
          style={[styles.inputMulti, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
          placeholder="Digite ou cole o versículo aqui..."
          placeholderTextColor={colors.textMuted}
          value={verseText}
          onChangeText={setVerseText}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>Referência</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
          placeholder="Ex: João 3:16"
          placeholderTextColor={colors.textMuted}
          value={reference}
          onChangeText={setReference}
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>Fundo</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bgRow}>
          {backgrounds.map(b => (
            <TouchableOpacity
              key={b.id}
              style={[
                styles.bgOption,
                { backgroundColor: b.colors[0], borderColor: selectedBg === b.id ? '#FFF' : 'transparent' },
              ]}
              onPress={() => setSelectedBg(b.id)}
            >
              {selectedBg === b.id && <View style={styles.bgSelected} />}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.label, { color: colors.textSecondary }]}>Fonte</Text>
        <View style={styles.fontRow}>
          {fonts.map(f => (
            <TouchableOpacity
              key={f.id}
              style={[
                styles.fontChip,
                { backgroundColor: selectedFont === f.id ? colors.primary + '15' : colors.card, borderColor: selectedFont === f.id ? colors.primary : colors.borderLight },
              ]}
              onPress={() => setSelectedFont(f.id)}
            >
              <Text style={[styles.fontLabel, { color: selectedFont === f.id ? colors.primary : colors.text }]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.createBtn, { backgroundColor: '#EC4899' }, !verseText.trim() && { opacity: 0.5 }]}
          onPress={handlePreview}
          disabled={!verseText.trim()}
        >
          <Text style={styles.createBtnText}>Criar Card</Text>
        </TouchableOpacity>
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
  inputMulti: { borderWidth: 1, borderRadius: 14, padding: 14, fontSize: 15, minHeight: 100, marginBottom: 16, lineHeight: 22 },
  bgRow: { gap: 10, marginBottom: 16 },
  bgOption: { width: 48, height: 48, borderRadius: 24, borderWidth: 3, justifyContent: 'center', alignItems: 'center' },
  bgSelected: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#FFF' },
  fontRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  fontChip: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  fontLabel: { fontSize: 14, fontWeight: '600' as const },
  createBtn: { paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  createBtnText: { fontSize: 16, fontWeight: '700' as const, color: '#FFF' },
  previewContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  cardPreview: { width: 300, height: 300, borderRadius: 20, overflow: 'hidden' as const },
  cardInner: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  cardQuote: { fontSize: 20, fontWeight: '600' as const, color: '#FFF', textAlign: 'center' as const, lineHeight: 30, marginBottom: 12 },
  cardQuoteScript: { fontStyle: 'italic' as const, fontSize: 22 },
  cardRef: { fontSize: 14, fontWeight: '700' as const, color: 'rgba(255,255,255,0.8)', textAlign: 'center' as const },
  cardWatermark: { position: 'absolute', bottom: 12, right: 16 },
  cardWatermarkText: { fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: '600' as const },
  previewActions: { padding: 20, gap: 10 },
  previewBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14 },
  previewBtnText: { fontSize: 16, fontWeight: '700' as const, color: '#FFF' },
  editBtn: { paddingVertical: 14, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
  editBtnText: { fontSize: 15, fontWeight: '600' as const },
});
