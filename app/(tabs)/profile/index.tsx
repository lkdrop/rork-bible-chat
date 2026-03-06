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
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
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
  BookMarked,
  PenLine,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp, BibleTranslation, Denomination } from '@/contexts/AppContext';
import { AppImages } from '@/constants/images';

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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <Image source={{ uri: AppImages.cross }} style={styles.profileBg} contentFit="cover" />
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.75)']}
            style={styles.profileOverlay}
          >
            <View style={styles.profileAvatarWrap}>
              <View style={[styles.profileAvatar, { backgroundColor: colors.primary }]}>
                <Text style={styles.profileAvatarText}>
                  {state.denomination === 'catolica' ? '✝️' : '🙏'}
                </Text>
              </View>
            </View>
            <Text style={styles.profileName}>Bíblia IA</Text>
            <Text style={styles.profileSub}>
              {currentDenomination?.name} • {state.preferredTranslation}
            </Text>
          </LinearGradient>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <Flame size={20} color={colors.streak} />
            <Text style={[styles.statNum, { color: colors.text }]}>{state.streak}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Sequência</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <Calendar size={20} color={colors.primary} />
            <Text style={[styles.statNum, { color: colors.text }]}>{state.totalDaysActive}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Dias ativos</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <Star size={20} color="#F59E0B" />
            <Text style={[styles.statNum, { color: colors.text }]}>{state.favoriteVerses.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Favoritos</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <BookMarked size={20} color="#3B82F6" />
            <Text style={[styles.statNum, { color: colors.text }]}>{state.totalChaptersRead}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Capítulos</Text>
          </View>
        </View>

        <View style={styles.section}>
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
        </View>

        <View style={styles.section}>
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
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Resumo</Text>
          <View style={[styles.settingCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <View style={styles.summaryRow}>
              <PenLine size={16} color={colors.primary} />
              <Text style={[styles.summaryLabel, { color: colors.text }]}>Reflexões no diário</Text>
              <Text style={[styles.summaryValue, { color: colors.primary }]}>{state.journalEntries.length}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryRow}>
              <Heart size={16} color="#EC4899" />
              <Text style={[styles.summaryLabel, { color: colors.text }]}>Pedidos de oração</Text>
              <Text style={[styles.summaryValue, { color: '#EC4899' }]}>{state.prayerRequests.length}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryRow}>
              <BookOpen size={16} color="#10B981" />
              <Text style={[styles.summaryLabel, { color: colors.text }]}>Esboços de sermão</Text>
              <Text style={[styles.summaryValue, { color: '#10B981' }]}>{state.sermonNotes.length}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryRow}>
              <Star size={16} color="#F59E0B" />
              <Text style={[styles.summaryLabel, { color: colors.text }]}>Versículos destacados</Text>
              <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>{state.verseHighlights.length}</Text>
            </View>
          </View>
        </View>

        {state.favoriteVerses.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Versículos Favoritos</Text>
            <View style={[styles.settingCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              {state.favoriteVerses.slice(0, 5).map((verse, i) => (
                <View key={verse}>
                  <View style={styles.favoriteRow}>
                    <Heart size={16} color={colors.primary} fill={colors.primary} />
                    <Text style={[styles.favoriteText, { color: colors.text }]}>{verse}</Text>
                  </View>
                  {i < Math.min(state.favoriteVerses.length, 5) - 1 && (
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  )}
                </View>
              ))}
              {state.favoriteVerses.length > 5 && (
                <Text style={[styles.moreText, { color: colors.textMuted }]}>
                  +{state.favoriteVerses.length - 5} mais
                </Text>
              )}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Dados</Text>
          <View style={[styles.settingCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <TouchableOpacity style={styles.settingRow} onPress={handleReset}>
              <Trash2 size={20} color={colors.error} />
              <Text style={[styles.settingLabel, { color: colors.error }]}>Resetar Aplicativo</Text>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.footer, { color: colors.textMuted }]}>Bíblia IA • v1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  profileHeader: {
    height: 200,
    overflow: 'hidden' as const,
  },
  profileBg: {
    ...StyleSheet.absoluteFillObject,
  },
  profileOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 24,
  },
  profileAvatarWrap: {
    marginBottom: 12,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  profileAvatarText: {
    fontSize: 28,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: '#FFF',
  },
  profileSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginTop: -20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  statNum: {
    fontSize: 20,
    fontWeight: '800' as const,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '500' as const,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    marginBottom: 10,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  settingCard: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden' as const,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: 15, fontWeight: '600' as const, flex: 1 },
  settingMeta: { fontSize: 12, marginTop: 2 },
  divider: { height: 1, marginHorizontal: 16 },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  summaryLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500' as const,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  favoriteRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  favoriteText: { fontSize: 14, fontWeight: '500' as const },
  moreText: {
    textAlign: 'center' as const,
    paddingVertical: 10,
    fontSize: 13,
  },
  footer: {
    textAlign: 'center' as const,
    fontSize: 13,
    marginTop: 8,
    paddingBottom: 20,
  },
});
