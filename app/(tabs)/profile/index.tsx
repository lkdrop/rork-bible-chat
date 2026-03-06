import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Sun,
  Moon,
  BookOpen,
  Church,
  Bell,
  Heart,
  Trash2,
  ChevronRight,
  Flame,
  Calendar,
  Star,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp, BibleTranslation, Denomination } from '@/contexts/AppContext';

const translationsList: { id: BibleTranslation; name: string }[] = [
  { id: 'NVI', name: 'Nova Versão Internacional' },
  { id: 'ARA', name: 'Almeida Revista e Atualizada' },
  { id: 'NTLH', name: 'Nova Tradução na Linguagem de Hoje' },
  { id: 'NVT', name: 'Nova Versão Transformadora' },
];

const denominationsList: { id: Denomination; name: string }[] = [
  { id: 'evangelica', name: 'Evangélica' },
  { id: 'catolica', name: 'Católica' },
  { id: 'batista', name: 'Batista' },
  { id: 'presbiteriana', name: 'Presbiteriana' },
  { id: 'pentecostal', name: 'Pentecostal' },
  { id: 'outra', name: 'Outra' },
];

export default function ProfileScreen() {
  const { state, colors, toggleTheme, setTranslation, setDenomination, resetApp } = useApp();

  const handleTranslation = useCallback(() => {
    const buttons = translationsList.map(t => ({
      text: `${t.name} (${t.id})`,
      onPress: () => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setTranslation(t.id);
      },
    }));
    buttons.push({ text: 'Cancelar', onPress: () => {} });
    Alert.alert('Tradução da Bíblia', 'Escolha sua tradução preferida:', buttons);
  }, [setTranslation]);

  const handleDenomination = useCallback(() => {
    const buttons = denominationsList.map(d => ({
      text: d.name,
      onPress: () => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setDenomination(d.id);
      },
    }));
    buttons.push({ text: 'Cancelar', onPress: () => {} });
    Alert.alert('Denominação', 'Escolha sua denominação:', buttons);
  }, [setDenomination]);

  const handleReset = useCallback(() => {
    Alert.alert(
      'Resetar Aplicativo',
      'Isso apagará todos os seus dados: diário, orações, progresso e configurações. Tem certeza?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Resetar', style: 'destructive', onPress: () => void resetApp() },
      ]
    );
  }, [resetApp]);

  const currentTranslation = translationsList.find(t => t.id === state.preferredTranslation);
  const currentDenomination = denominationsList.find(d => d.id === state.denomination);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Perfil</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={[styles.statsCard, { backgroundColor: colors.primary }]}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Flame size={22} color="#FFF" />
              <Text style={styles.statNum}>{state.streak}</Text>
              <Text style={styles.statLabel}>Sequência</Text>
            </View>
            <View style={styles.statItem}>
              <Calendar size={22} color="#FFF" />
              <Text style={styles.statNum}>{state.totalDaysActive}</Text>
              <Text style={styles.statLabel}>Dias ativos</Text>
            </View>
            <View style={styles.statItem}>
              <Star size={22} color="#FFF" />
              <Text style={styles.statNum}>{state.favoriteVerses.length}</Text>
              <Text style={styles.statLabel}>Favoritos</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Aparência</Text>
        <View style={[styles.settingCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <TouchableOpacity style={styles.settingRow} onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleTheme(); }}>
            {state.theme === 'dark' ? <Moon size={20} color={colors.primary} /> : <Sun size={20} color={colors.primary} />}
            <Text style={[styles.settingLabel, { color: colors.text }]}>Modo Escuro</Text>
            <Switch
              value={state.theme === 'dark'}
              onValueChange={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleTheme(); }}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFF"
            />
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Preferências</Text>
        <View style={[styles.settingCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <TouchableOpacity style={styles.settingRow} onPress={handleTranslation}>
            <BookOpen size={20} color={colors.primary} />
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Tradução</Text>
              <Text style={[styles.settingMeta, { color: colors.textMuted }]}>
                {currentTranslation?.name} ({state.preferredTranslation})
              </Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity style={styles.settingRow} onPress={handleDenomination}>
            <Church size={20} color={colors.primary} />
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Denominação</Text>
              <Text style={[styles.settingMeta, { color: colors.textMuted }]}>{currentDenomination?.name}</Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity style={styles.settingRow}>
            <Bell size={20} color={colors.primary} />
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Notificações</Text>
              <Text style={[styles.settingMeta, { color: colors.textMuted }]}>{state.notificationTime}</Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {state.favoriteVerses.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Versículos Favoritos</Text>
            <View style={[styles.settingCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              {state.favoriteVerses.map((verse, i) => (
                <View key={verse}>
                  <View style={styles.favoriteRow}>
                    <Heart size={16} color={colors.primary} fill={colors.primary} />
                    <Text style={[styles.favoriteText, { color: colors.text }]}>{verse}</Text>
                  </View>
                  {i < state.favoriteVerses.length - 1 && (
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  )}
                </View>
              ))}
            </View>
          </>
        )}

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Dados</Text>
        <View style={[styles.settingCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <TouchableOpacity style={styles.settingRow} onPress={handleReset}>
            <Trash2 size={20} color={colors.error} />
            <Text style={[styles.settingLabel, { color: colors.error }]}>Resetar Aplicativo</Text>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.footer, { color: colors.textMuted }]}>Bíblia IA • v1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
  content: { padding: 20, paddingTop: 0, paddingBottom: 40 },
  statsCard: { borderRadius: 20, padding: 24, marginBottom: 28 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', gap: 6 },
  statNum: { fontSize: 26, fontWeight: '800' as const, color: '#FFF' },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '500' as const },
  sectionTitle: { fontSize: 13, fontWeight: '700' as const, marginBottom: 10, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  settingCard: { borderRadius: 14, borderWidth: 1, marginBottom: 24, overflow: 'hidden' as const },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: 15, fontWeight: '600' as const, flex: 1 },
  settingMeta: { fontSize: 12, marginTop: 2 },
  divider: { height: 1, marginHorizontal: 16 },
  favoriteRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  favoriteText: { fontSize: 14, fontWeight: '500' as const },
  footer: { textAlign: 'center' as const, fontSize: 13, marginTop: 16, paddingBottom: 20 },
});
