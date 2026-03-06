import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, Trash2, X, ChevronDown } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { PrayerStatus } from '@/contexts/AppContext';

const STATUS_CONFIG: Record<PrayerStatus, { label: string; emoji: string; color: string }> = {
  orando: { label: 'Orando', emoji: '🙏', color: '#C5943A' },
  concluida: { label: 'Concluída', emoji: '✅', color: '#4CAF50' },
  gratidao: { label: 'Gratidão', emoji: '💛', color: '#FF9800' },
};

const CATEGORIES = [
  { id: 'familia', label: 'Família', emoji: '👨‍👩‍👧‍👦' },
  { id: 'saude', label: 'Saúde', emoji: '🏥' },
  { id: 'trabalho', label: 'Trabalho', emoji: '💼' },
  { id: 'financas', label: 'Finanças', emoji: '💰' },
  { id: 'relacionamento', label: 'Relacionamento', emoji: '❤️' },
  { id: 'espiritual', label: 'Espiritual', emoji: '✨' },
  { id: 'outro', label: 'Outro', emoji: '📝' },
];

export default function PrayerWallScreen() {
  const router = useRouter();
  const { state, colors, addPrayerRequest, updatePrayerStatus, deletePrayerRequest } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [newPrayer, setNewPrayer] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [filter, setFilter] = useState<'all' | PrayerStatus>('all');
  const [statusMenuId, setStatusMenuId] = useState<string | null>(null);

  const handleAdd = useCallback(() => {
    if (!newPrayer.trim()) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addPrayerRequest(newPrayer.trim(), selectedCategory);
    setNewPrayer('');
    setSelectedCategory(undefined);
    setShowForm(false);
  }, [newPrayer, selectedCategory, addPrayerRequest]);

  const handleStatusChange = useCallback((id: string, status: PrayerStatus) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updatePrayerStatus(id, status);
    setStatusMenuId(null);
  }, [updatePrayerStatus]);

  const handleDelete = useCallback((id: string) => {
    Alert.alert(
      'Excluir pedido',
      'Deseja excluir este pedido de oração?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => deletePrayerRequest(id) },
      ]
    );
  }, [deletePrayerRequest]);

  const filteredRequests = state.prayerRequests.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter || (!r.status && filter === 'orando');
  });

  const counts = {
    all: state.prayerRequests.length,
    orando: state.prayerRequests.filter(r => !r.status || r.status === 'orando').length,
    concluida: state.prayerRequests.filter(r => r.status === 'concluida').length,
    gratidao: state.prayerRequests.filter(r => r.status === 'gratidao').length,
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const getStatusForRequest = (req: { status?: PrayerStatus }): PrayerStatus => {
    return req.status || 'orando';
  };

  const getCategoryInfo = (catId?: string) => {
    return CATEGORIES.find(c => c.id === catId);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Mural de Oração</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowForm(!showForm); }}
        >
          {showForm ? <X size={18} color="#FFF" /> : <Plus size={18} color="#FFF" />}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {showForm && (
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.formTitle, { color: colors.text }]}>Novo Pedido de Oração</Text>

            <Text style={[styles.formLabel, { color: colors.textMuted }]}>Categoria</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: selectedCategory === cat.id ? colors.primary + '20' : colors.inputBg,
                      borderColor: selectedCategory === cat.id ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedCategory(selectedCategory === cat.id ? undefined : cat.id)}
                >
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                  <Text style={[styles.categoryLabel, { color: selectedCategory === cat.id ? colors.primary : colors.text }]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput
              style={[styles.formInput, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
              placeholder="Escreva seu pedido de oração..."
              placeholderTextColor={colors.textMuted}
              value={newPrayer}
              onChangeText={setNewPrayer}
              multiline
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: newPrayer.trim() ? 1 : 0.5 }]}
              onPress={handleAdd}
              disabled={!newPrayer.trim()}
            >
              <Text style={styles.saveBtnText}>Adicionar Pedido</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.statsRow}>
          {([['all', '📋', 'Todos'], ['orando', '🙏', 'Orando'], ['concluida', '✅', 'Concluídas'], ['gratidao', '💛', 'Gratidão']] as const).map(([key, emoji, label]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.statCard,
                {
                  backgroundColor: filter === key ? colors.primary + '15' : colors.card,
                  borderColor: filter === key ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setFilter(key)}
            >
              <Text style={styles.statEmoji}>{emoji}</Text>
              <Text style={[styles.statCount, { color: filter === key ? colors.primary : colors.text }]}>
                {counts[key]}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {filteredRequests.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🙏</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {filter === 'all' ? 'Nenhum pedido ainda' : `Nenhum pedido ${filter === 'orando' ? 'ativo' : filter === 'concluida' ? 'concluído' : 'de gratidão'}`}
            </Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Adicione seus pedidos de oração e acompanhe sua jornada espiritual.
            </Text>
          </View>
        )}

        {filteredRequests.map((req) => {
          const currentStatus = getStatusForRequest(req);
          const statusInfo = STATUS_CONFIG[currentStatus];
          const catInfo = getCategoryInfo(req.category);

          return (
            <View
              key={req.id}
              style={[
                styles.prayerCard,
                {
                  backgroundColor: colors.card,
                  borderLeftColor: statusInfo.color,
                  borderLeftWidth: 3,
                  borderColor: colors.borderLight,
                },
              ]}
            >
              <View style={styles.prayerHeader}>
                <View style={styles.prayerMeta}>
                  <Text style={[styles.prayerDate, { color: colors.textMuted }]}>{formatDate(req.date)}</Text>
                  {catInfo && (
                    <View style={[styles.catBadge, { backgroundColor: colors.inputBg }]}>
                      <Text style={styles.catBadgeEmoji}>{catInfo.emoji}</Text>
                      <Text style={[styles.catBadgeText, { color: colors.textMuted }]}>{catInfo.label}</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity onPress={() => handleDelete(req.id)} style={styles.deleteBtn}>
                  <Trash2 size={14} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.prayerText, { color: colors.text }]}>{req.text}</Text>

              <View style={styles.statusRow}>
                <View style={[styles.currentStatusBadge, { backgroundColor: statusInfo.color + '18' }]}>
                  <Text style={styles.statusBadgeEmoji}>{statusInfo.emoji}</Text>
                  <Text style={[styles.statusBadgeLabel, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                </View>

                {statusMenuId === req.id ? (
                  <View style={styles.statusOptions}>
                    {(Object.keys(STATUS_CONFIG) as PrayerStatus[]).map((s) => {
                      if (s === currentStatus) return null;
                      const info = STATUS_CONFIG[s];
                      return (
                        <TouchableOpacity
                          key={s}
                          style={[styles.statusOption, { backgroundColor: info.color + '15', borderColor: info.color + '30' }]}
                          onPress={() => handleStatusChange(req.id, s)}
                        >
                          <Text style={styles.statusOptionEmoji}>{info.emoji}</Text>
                          <Text style={[styles.statusOptionText, { color: info.color }]}>{info.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                    <TouchableOpacity
                      style={[styles.statusOption, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
                      onPress={() => setStatusMenuId(null)}
                    >
                      <X size={12} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.changeStatusBtn, { backgroundColor: colors.inputBg }]}
                    onPress={() => {
                      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setStatusMenuId(req.id);
                    }}
                  >
                    <Text style={[styles.changeStatusText, { color: colors.textMuted }]}>Alterar</Text>
                    <ChevronDown size={12} color={colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>

              {req.statusDate && currentStatus !== 'orando' && (
                <Text style={[styles.statusDate, { color: statusInfo.color }]}>
                  {statusInfo.emoji} {statusInfo.label} em {formatDate(req.statusDate)}
                </Text>
              )}
            </View>
          );
        })}
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
  content: { padding: 20, paddingBottom: 40 },
  formCard: { borderRadius: 16, padding: 18, borderWidth: 1, marginBottom: 20 },
  formTitle: { fontSize: 18, fontWeight: '700' as const, marginBottom: 14 },
  formLabel: { fontSize: 13, fontWeight: '600' as const, marginBottom: 8 },
  categoryScroll: { marginBottom: 14 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryEmoji: { fontSize: 14 },
  categoryLabel: { fontSize: 13, fontWeight: '500' as const },
  formInput: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15, minHeight: 80, marginBottom: 14 },
  saveBtn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { fontSize: 16, fontWeight: '700' as const, color: '#FFF' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  statEmoji: { fontSize: 18, marginBottom: 4 },
  statCount: { fontSize: 18, fontWeight: '700' as const },
  statLabel: { fontSize: 10, fontWeight: '500' as const, marginTop: 2 },
  emptyState: { alignItems: 'center', paddingTop: 48 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700' as const, marginBottom: 6 },
  emptyText: { fontSize: 14, textAlign: 'center' as const, lineHeight: 22 },
  prayerCard: { borderRadius: 14, padding: 16, borderWidth: 1, marginBottom: 12 },
  prayerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  prayerMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  prayerDate: { fontSize: 12 },
  catBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  catBadgeEmoji: { fontSize: 11 },
  catBadgeText: { fontSize: 11, fontWeight: '500' as const },
  deleteBtn: { padding: 5 },
  prayerText: { fontSize: 15, lineHeight: 22, marginBottom: 12 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  currentStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusBadgeEmoji: { fontSize: 12 },
  statusBadgeLabel: { fontSize: 12, fontWeight: '600' as const },
  changeStatusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  changeStatusText: { fontSize: 12, fontWeight: '500' as const },
  statusOptions: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusOptionEmoji: { fontSize: 12 },
  statusOptionText: { fontSize: 12, fontWeight: '600' as const },
  statusDate: { fontSize: 12, fontWeight: '600' as const, marginTop: 8 },
});
