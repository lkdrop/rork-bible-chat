import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, Trash2, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';

const moods = [
  { emoji: '🙏', label: 'Grato' },
  { emoji: '😌', label: 'Em paz' },
  { emoji: '💪', label: 'Fortalecido' },
  { emoji: '😢', label: 'Triste' },
  { emoji: '🤔', label: 'Reflexivo' },
  { emoji: '😊', label: 'Alegre' },
];

export default function JournalScreen() {
  const router = useRouter();
  const { state, colors, addJournalEntry, deleteJournalEntry } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | undefined>();

  const MAX_TITLE_LENGTH = 100;
  const MAX_CONTENT_LENGTH = 2000;

  const handleSave = useCallback(() => {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    if (!trimmedTitle || !trimmedContent) {
      Alert.alert('Campos obrigatórios', 'Preencha o título e a reflexão.');
      return;
    }
    if (trimmedTitle.length > MAX_TITLE_LENGTH) {
      Alert.alert('Título muito longo', `O título deve ter no máximo ${MAX_TITLE_LENGTH} caracteres.`);
      return;
    }
    if (trimmedContent.length > MAX_CONTENT_LENGTH) {
      Alert.alert('Texto muito longo', `A reflexão deve ter no máximo ${MAX_CONTENT_LENGTH} caracteres.`);
      return;
    }
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addJournalEntry(trimmedTitle, trimmedContent, selectedMood);
    setTitle('');
    setContent('');
    setSelectedMood(undefined);
    setShowForm(false);
  }, [title, content, selectedMood, addJournalEntry]);

  const handleDelete = useCallback((id: string) => {
    Alert.alert(
      'Excluir reflexão',
      'Deseja excluir esta reflexão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => deleteJournalEntry(id) },
      ]
    );
  }, [deleteJournalEntry]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Diário Espiritual</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowForm(!showForm); }}
        >
          {showForm ? <X size={18} color="#FFF" /> : <Plus size={18} color="#FFF" />}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {showForm && (
            <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.formTitle, { color: colors.text }]}>Nova Reflexão</Text>

              <TextInput
                style={[styles.formInput, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                placeholder="Título da reflexão"
                placeholderTextColor={colors.textMuted}
                value={title}
                onChangeText={setTitle}
                maxLength={MAX_TITLE_LENGTH}
              />

              <TextInput
                style={[styles.formTextarea, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                placeholder="Escreva sua reflexão, oração ou pensamento..."
                placeholderTextColor={colors.textMuted}
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
                maxLength={MAX_CONTENT_LENGTH}
              />

              <Text style={[styles.moodLabel, { color: colors.textSecondary }]}>Como você está se sentindo?</Text>
              <View style={styles.moodRow}>
                {moods.map((mood) => (
                  <TouchableOpacity
                    key={mood.label}
                    style={[
                      styles.moodBtn,
                      { borderColor: selectedMood === mood.emoji ? colors.primary : colors.borderLight },
                      selectedMood === mood.emoji && { backgroundColor: colors.primaryLight },
                    ]}
                    onPress={() => setSelectedMood(selectedMood === mood.emoji ? undefined : mood.emoji)}
                  >
                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                onPress={handleSave}
              >
                <Text style={styles.saveBtnText}>Salvar Reflexão</Text>
              </TouchableOpacity>
            </View>
          )}

          {state.journalEntries.length === 0 && !showForm && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📝</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Seu diário está vazio</Text>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                Registre suas reflexões, orações e momentos com Deus.
              </Text>
            </View>
          )}

          {state.journalEntries.map((entry) => (
            <View key={entry.id} style={[styles.entryCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              <View style={styles.entryHeader}>
                {entry.mood && <Text style={styles.entryMood}>{entry.mood}</Text>}
                <View style={styles.entryInfo}>
                  <Text style={[styles.entryTitle, { color: colors.text }]}>{entry.title}</Text>
                  <Text style={[styles.entryDate, { color: colors.textMuted }]}>{formatDate(entry.date)}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(entry.id)} style={styles.deleteBtn}>
                  <Trash2 size={16} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.entryContent, { color: colors.textSecondary }]}>{entry.content}</Text>
            </View>
          ))}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, borderBottomWidth: 1 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700' as const, flex: 1 },
  addBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20, paddingBottom: 40 },
  formCard: { borderRadius: 16, padding: 18, borderWidth: 1, marginBottom: 20 },
  formTitle: { fontSize: 18, fontWeight: '700' as const, marginBottom: 14 },
  formInput: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15, marginBottom: 12 },
  formTextarea: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15, minHeight: 120, marginBottom: 14 },
  moodLabel: { fontSize: 14, fontWeight: '600' as const, marginBottom: 8 },
  moodRow: { flexDirection: 'row', gap: 10, marginBottom: 16, flexWrap: 'wrap' },
  moodBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5 },
  moodEmoji: { fontSize: 22 },
  saveBtn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { fontSize: 16, fontWeight: '700' as const, color: '#FFF' },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700' as const, marginBottom: 8 },
  emptyText: { fontSize: 15, textAlign: 'center' as const, lineHeight: 22 },
  entryCard: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 12 },
  entryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  entryMood: { fontSize: 28, marginRight: 12 },
  entryInfo: { flex: 1 },
  entryTitle: { fontSize: 16, fontWeight: '700' as const },
  entryDate: { fontSize: 12, marginTop: 2 },
  deleteBtn: { padding: 6 },
  entryContent: { fontSize: 14, lineHeight: 22 },
});
