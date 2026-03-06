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
import { ArrowLeft, Plus, Check, Trash2, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';

export default function PrayerWallScreen() {
  const router = useRouter();
  const { state, colors, addPrayerRequest, togglePrayerAnswered, deletePrayerRequest } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [newPrayer, setNewPrayer] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'answered'>('all');

  const handleAdd = useCallback(() => {
    if (!newPrayer.trim()) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addPrayerRequest(newPrayer.trim());
    setNewPrayer('');
    setShowForm(false);
  }, [newPrayer, addPrayerRequest]);

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
    if (filter === 'pending') return !r.answered;
    if (filter === 'answered') return r.answered;
    return true;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
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
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              onPress={handleAdd}
            >
              <Text style={styles.saveBtnText}>Adicionar Pedido</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.filterRow}>
          {(['all', 'pending', 'answered'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterBtn,
                { backgroundColor: filter === f ? colors.primary : colors.card, borderColor: filter === f ? colors.primary : colors.border },
              ]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, { color: filter === f ? '#FFF' : colors.text }]}>
                {f === 'all' ? 'Todos' : f === 'pending' ? 'Pendentes' : 'Respondidos'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {filteredRequests.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🙏</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {filter === 'all' ? 'Nenhum pedido ainda' : filter === 'pending' ? 'Nenhum pedido pendente' : 'Nenhuma oração respondida'}
            </Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Adicione seus pedidos de oração e acompanhe as respostas de Deus.
            </Text>
          </View>
        )}

        {filteredRequests.map((req) => (
          <View
            key={req.id}
            style={[
              styles.prayerCard,
              { backgroundColor: colors.card, borderColor: req.answered ? colors.primary + '40' : colors.borderLight },
            ]}
          >
            <View style={styles.prayerHeader}>
              <Text style={[styles.prayerDate, { color: colors.textMuted }]}>{formatDate(req.date)}</Text>
              <View style={styles.prayerActions}>
                <TouchableOpacity
                  style={[styles.answerBtn, { backgroundColor: req.answered ? colors.primary + '15' : colors.inputBg }]}
                  onPress={() => {
                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    togglePrayerAnswered(req.id);
                  }}
                >
                  <Check size={14} color={req.answered ? colors.primary : colors.textMuted} />
                  <Text style={[styles.answerText, { color: req.answered ? colors.primary : colors.textMuted }]}>
                    {req.answered ? 'Respondida' : 'Marcar'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(req.id)} style={styles.deleteBtn}>
                  <Trash2 size={14} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={[styles.prayerText, { color: colors.text }]}>{req.text}</Text>
            {req.answered && req.answeredDate && (
              <Text style={[styles.answeredDate, { color: colors.primary }]}>
                ✅ Respondida em {formatDate(req.answeredDate)}
              </Text>
            )}
          </View>
        ))}
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
  formInput: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15, minHeight: 80, marginBottom: 14 },
  saveBtn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { fontSize: 16, fontWeight: '700' as const, color: '#FFF' },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  filterText: { fontSize: 13, fontWeight: '600' as const },
  emptyState: { alignItems: 'center', paddingTop: 48 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700' as const, marginBottom: 6 },
  emptyText: { fontSize: 14, textAlign: 'center' as const, lineHeight: 22 },
  prayerCard: { borderRadius: 14, padding: 16, borderWidth: 1, marginBottom: 12 },
  prayerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  prayerDate: { fontSize: 12 },
  prayerActions: { flexDirection: 'row', gap: 8 },
  answerBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  answerText: { fontSize: 12, fontWeight: '600' as const },
  deleteBtn: { padding: 5 },
  prayerText: { fontSize: 15, lineHeight: 22 },
  answeredDate: { fontSize: 12, fontWeight: '600' as const, marginTop: 8 },
});
