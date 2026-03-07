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
import { ArrowLeft, Plus, Trash2, TrendingUp, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';

const goalPresets = [
  { title: 'Ler a Bíblia', target: 30, unit: 'capítulos' },
  { title: 'Orar diariamente', target: 30, unit: 'dias' },
  { title: 'Memorizar versículos', target: 10, unit: 'versículos' },
  { title: 'Devocional diário', target: 21, unit: 'dias' },
];

export default function GoalsScreen() {
  const router = useRouter();
  const { state, colors, addSpiritualGoal, updateGoalProgress, deleteGoal } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalUnit, setGoalUnit] = useState('');

  const handleAdd = useCallback(() => {
    if (!goalTitle.trim() || !goalTarget.trim() || !goalUnit.trim()) {
      Alert.alert('Campos obrigatórios', 'Preencha todos os campos.');
      return;
    }
    const target = parseInt(goalTarget, 10);
    if (isNaN(target) || target <= 0) {
      Alert.alert('Meta inválida', 'Insira um número válido para a meta.');
      return;
    }
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addSpiritualGoal(goalTitle.trim(), target, goalUnit.trim());
    setGoalTitle('');
    setGoalTarget('');
    setGoalUnit('');
    setShowForm(false);
  }, [goalTitle, goalTarget, goalUnit, addSpiritualGoal]);

  const handlePreset = useCallback((preset: typeof goalPresets[0]) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addSpiritualGoal(preset.title, preset.target, preset.unit);
  }, [addSpiritualGoal]);

  const handleIncrement = useCallback((id: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateGoalProgress(id, 1);
  }, [updateGoalProgress]);

  const handleDeleteGoal = useCallback((id: string) => {
    Alert.alert(
      'Excluir meta',
      'Deseja excluir esta meta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => deleteGoal(id) },
      ]
    );
  }, [deleteGoal]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Metas Espirituais</Text>
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
            <Text style={[styles.formTitle, { color: colors.text }]}>Nova Meta</Text>

            <Text style={[styles.presetLabel, { color: colors.textSecondary }]}>Sugestões rápidas:</Text>
            <View style={styles.presetRow}>
              {goalPresets.map((p) => (
                <TouchableOpacity
                  key={p.title}
                  style={[styles.presetBtn, { backgroundColor: colors.primaryLight }]}
                  onPress={() => handlePreset(p)}
                >
                  <Text style={[styles.presetText, { color: colors.primary }]}>{p.title}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.orLabel, { color: colors.textMuted }]}>ou crie uma personalizada:</Text>

            <TextInput
              style={[styles.formInput, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
              placeholder="Nome da meta (ex: Ler Provérbios)"
              placeholderTextColor={colors.textMuted}
              value={goalTitle}
              onChangeText={setGoalTitle}
            />

            <View style={styles.formRow}>
              <TextInput
                style={[styles.formInputSmall, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                placeholder="Meta (ex: 31)"
                placeholderTextColor={colors.textMuted}
                value={goalTarget}
                onChangeText={setGoalTarget}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.formInputSmall, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                placeholder="Unidade (ex: capítulos)"
                placeholderTextColor={colors.textMuted}
                value={goalUnit}
                onChangeText={setGoalUnit}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              onPress={handleAdd}
            >
              <Text style={styles.saveBtnText}>Criar Meta</Text>
            </TouchableOpacity>
          </View>
        )}

        {state.spiritualGoals.length === 0 && !showForm && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhuma meta criada</Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Defina metas espirituais para acompanhar seu crescimento na fé.
            </Text>
          </View>
        )}

        {state.spiritualGoals.map((goal) => {
          const percentage = goal.target > 0 ? Math.round((goal.current / goal.target) * 100) : 0;
          const isComplete = goal.current >= goal.target;
          return (
            <View
              key={goal.id}
              style={[styles.goalCard, { backgroundColor: colors.card, borderColor: isComplete ? colors.primary + '40' : colors.borderLight }]}
            >
              <View style={styles.goalHeader}>
                <View style={styles.goalInfo}>
                  <Text style={[styles.goalTitle, { color: colors.text }]}>{goal.title}</Text>
                  <Text style={[styles.goalProgress, { color: colors.textMuted }]}>
                    {goal.current}/{goal.target} {goal.unit}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleDeleteGoal(goal.id)} style={styles.deleteBtn}>
                  <Trash2 size={16} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View style={[styles.progressFill, { width: `${Math.min(percentage, 100)}%` as const, backgroundColor: isComplete ? colors.success : colors.primary }]} />
              </View>

              <View style={styles.goalFooter}>
                <Text style={[styles.percentText, { color: isComplete ? colors.primary : colors.textMuted }]}>
                  {isComplete ? '✅ Meta alcançada!' : `${percentage}%`}
                </Text>
                {!isComplete && (
                  <TouchableOpacity
                    style={[styles.incrementBtn, { backgroundColor: colors.primary }]}
                    onPress={() => handleIncrement(goal.id)}
                  >
                    <TrendingUp size={14} color="#FFF" />
                    <Text style={styles.incrementText}>+1</Text>
                  </TouchableOpacity>
                )}
              </View>
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
  presetLabel: { fontSize: 13, fontWeight: '600' as const, marginBottom: 8 },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  presetBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  presetText: { fontSize: 13, fontWeight: '600' as const },
  orLabel: { fontSize: 13, textAlign: 'center' as const, marginBottom: 14 },
  formInput: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15, marginBottom: 12 },
  formRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  formInputSmall: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15 },
  saveBtn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { fontSize: 16, fontWeight: '700' as const, color: '#FFF' },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700' as const, marginBottom: 6 },
  emptyText: { fontSize: 14, textAlign: 'center' as const, lineHeight: 22 },
  goalCard: { borderRadius: 14, padding: 16, borderWidth: 1, marginBottom: 12 },
  goalHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  goalInfo: { flex: 1 },
  goalTitle: { fontSize: 16, fontWeight: '700' as const },
  goalProgress: { fontSize: 13, marginTop: 2 },
  deleteBtn: { padding: 4 },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' as const, marginBottom: 10 },
  progressFill: { height: '100%' as const, borderRadius: 4 },
  goalFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  percentText: { fontSize: 13, fontWeight: '600' as const },
  incrementBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  incrementText: { fontSize: 14, fontWeight: '700' as const, color: '#FFF' },
});
