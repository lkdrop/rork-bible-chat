import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Heart, Trash2, Share2, Plus, X, Bookmark } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';

const highlightColors = ['#C5943A', '#3B82F6', '#10B981', '#EC4899', '#F59E0B', '#8B5CF6'];

export default function FavoritesScreen() {
  const router = useRouter();
  const { state, colors, toggleFavoriteVerse, addVerseHighlight, deleteVerseHighlight } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newText, setNewText] = useState('');
  const [newRef, setNewRef] = useState('');
  const [newNote, setNewNote] = useState('');
  const [selectedColor, setSelectedColor] = useState('#C5943A');
  const [activeTab, setActiveTab] = useState<'favorites' | 'highlights'>('favorites');

  const handleAddHighlight = useCallback(() => {
    if (!newText.trim() || !newRef.trim()) {
      Alert.alert('Campos obrigatórios', 'Preencha o texto do versículo e a referência.');
      return;
    }
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addVerseHighlight(newText.trim(), newRef.trim(), newNote.trim() || undefined, selectedColor);
    setNewText('');
    setNewRef('');
    setNewNote('');
    setShowAddForm(false);
  }, [newText, newRef, newNote, selectedColor, addVerseHighlight]);

  const handleShareVerse = useCallback(async (text: string, reference: string) => {
    try {
      await Share.share({
        message: `"${text}"\n\n— ${reference}\n\nEnviado pelo Bíblia IA`,
      });
    } catch (e) {
      console.log('Share error:', e);
    }
  }, []);

  const handleDeleteHighlight = useCallback((id: string) => {
    Alert.alert('Excluir destaque', 'Deseja excluir este versículo destacado?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteVerseHighlight(id) },
    ]);
  }, [deleteVerseHighlight]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Meus Versículos</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowAddForm(!showAddForm); }}
        >
          {showAddForm ? <X size={18} color="#FFF" /> : <Plus size={18} color="#FFF" />}
        </TouchableOpacity>
      </View>

      <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'favorites' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('favorites')}
        >
          <Heart size={16} color={activeTab === 'favorites' ? colors.primary : colors.textMuted} />
          <Text style={[styles.tabText, { color: activeTab === 'favorites' ? colors.primary : colors.textMuted }]}>
            Favoritos ({state.favoriteVerses.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'highlights' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('highlights')}
        >
          <Bookmark size={16} color={activeTab === 'highlights' ? colors.primary : colors.textMuted} />
          <Text style={[styles.tabText, { color: activeTab === 'highlights' ? colors.primary : colors.textMuted }]}>
            Destaques ({state.verseHighlights.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {showAddForm && (
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.formTitle, { color: colors.text }]}>Novo Destaque</Text>
            <TextInput
              style={[styles.formInput, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
              placeholder="Texto do versículo..."
              placeholderTextColor={colors.textMuted}
              value={newText}
              onChangeText={setNewText}
              multiline
            />
            <TextInput
              style={[styles.formInput, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
              placeholder="Referência (ex: João 3:16)"
              placeholderTextColor={colors.textMuted}
              value={newRef}
              onChangeText={setNewRef}
            />
            <TextInput
              style={[styles.formInput, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
              placeholder="Nota pessoal (opcional)"
              placeholderTextColor={colors.textMuted}
              value={newNote}
              onChangeText={setNewNote}
              multiline
            />
            <Text style={[styles.colorLabel, { color: colors.textSecondary }]}>Cor do destaque:</Text>
            <View style={styles.colorRow}>
              {highlightColors.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.colorDot, { backgroundColor: c }, selectedColor === c && styles.colorDotSelected]}
                  onPress={() => setSelectedColor(c)}
                />
              ))}
            </View>
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleAddHighlight}>
              <Text style={styles.saveBtnText}>Salvar Destaque</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'favorites' && (
          <>
            {state.favoriteVerses.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>❤️</Text>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhum favorito</Text>
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  Favorite versículos na tela inicial para salvá-los aqui.
                </Text>
              </View>
            ) : (
              state.favoriteVerses.map((verse) => (
                <View key={verse} style={[styles.verseCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
                  <View style={styles.verseHeader}>
                    <Heart size={16} color={colors.primary} fill={colors.primary} />
                    <Text style={[styles.verseRef, { color: colors.primary }]}>{verse}</Text>
                  </View>
                  <View style={styles.verseActions}>
                    <TouchableOpacity
                      style={[styles.verseActionBtn, { backgroundColor: colors.primaryLight }]}
                      onPress={() => void handleShareVerse('', verse)}
                    >
                      <Share2 size={14} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.verseActionBtn, { backgroundColor: colors.error + '15' }]}
                      onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleFavoriteVerse(verse); }}
                    >
                      <Trash2 size={14} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {activeTab === 'highlights' && (
          <>
            {state.verseHighlights.length === 0 && !showAddForm ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>✨</Text>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhum destaque</Text>
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  Adicione versículos com notas e cores para estudar depois.
                </Text>
              </View>
            ) : (
              state.verseHighlights.map((h) => (
                <View key={h.id} style={[styles.highlightCard, { backgroundColor: colors.card, borderColor: colors.borderLight, borderLeftColor: h.color, borderLeftWidth: 4 }]}>
                  <Text style={[styles.highlightText, { color: colors.text }]}>"{h.text}"</Text>
                  <Text style={[styles.highlightRef, { color: h.color }]}>— {h.reference}</Text>
                  {h.note ? (
                    <Text style={[styles.highlightNote, { color: colors.textSecondary }]}>📝 {h.note}</Text>
                  ) : null}
                  <View style={styles.highlightFooter}>
                    <Text style={[styles.highlightDate, { color: colors.textMuted }]}>
                      {new Date(h.date).toLocaleDateString('pt-BR')}
                    </Text>
                    <View style={styles.highlightActions}>
                      <TouchableOpacity
                        style={styles.highlightActionBtn}
                        onPress={() => void handleShareVerse(h.text, h.reference)}
                      >
                        <Share2 size={14} color={colors.textMuted} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.highlightActionBtn}
                        onPress={() => handleDeleteHighlight(h.id)}
                      >
                        <Trash2 size={14} color={colors.textMuted} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
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
  headerTitle: { fontSize: 20, fontWeight: '700' as const, flex: 1 },
  addBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14 },
  tabText: { fontSize: 14, fontWeight: '600' as const },
  content: { padding: 20, paddingBottom: 40 },
  formCard: { borderRadius: 16, padding: 18, borderWidth: 1, marginBottom: 20 },
  formTitle: { fontSize: 18, fontWeight: '700' as const, marginBottom: 14 },
  formInput: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15, marginBottom: 12 },
  colorLabel: { fontSize: 13, fontWeight: '600' as const, marginBottom: 8 },
  colorRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  colorDotSelected: { borderWidth: 3, borderColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  saveBtn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { fontSize: 16, fontWeight: '700' as const, color: '#FFF' },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700' as const, marginBottom: 6 },
  emptyText: { fontSize: 14, textAlign: 'center' as const, lineHeight: 22 },
  verseCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 10 },
  verseHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  verseRef: { fontSize: 15, fontWeight: '600' as const },
  verseActions: { flexDirection: 'row', gap: 8 },
  verseActionBtn: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  highlightCard: { borderRadius: 14, padding: 16, borderWidth: 1, marginBottom: 12 },
  highlightText: { fontSize: 15, lineHeight: 24, fontStyle: 'italic' as const, marginBottom: 8 },
  highlightRef: { fontSize: 14, fontWeight: '600' as const, marginBottom: 6 },
  highlightNote: { fontSize: 13, lineHeight: 20, marginBottom: 8 },
  highlightFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  highlightDate: { fontSize: 12 },
  highlightActions: { flexDirection: 'row', gap: 12 },
  highlightActionBtn: { padding: 4 },
});
