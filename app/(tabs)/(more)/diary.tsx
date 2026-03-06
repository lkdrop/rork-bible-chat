import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { BookOpen, CheckCircle2, Circle } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { usePrayerGuide } from '@/contexts/PrayerGuideContext';

export default function DiaryScreen() {
  const { data, toggleAnswered } = usePrayerGuide();
  const entries = data.diaryEntries;

  const handleToggle = useCallback((entryId: string) => {
    Alert.alert(
      'Oração Respondida',
      'Deseja marcar/desmarcar esta oração como respondida por Deus?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: () => void toggleAnswered(entryId) },
      ]
    );
  }, [toggleAnswered]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Diário de Oração', headerShown: true }} />
      <SafeAreaView style={styles.container} edges={[]}>
        {entries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <BookOpen size={48} color={Colors.accent.gold} />
            </View>
            <Text style={styles.emptyTitle}>Seu diário está vazio</Text>
            <Text style={styles.emptyText}>
              Após completar uma oração, escreva suas anotações e reflexões. Elas aparecerão aqui.
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headerInfo}>
              <Text style={styles.headerInfoText}>
                {entries.length} {entries.length === 1 ? 'anotação' : 'anotações'} · {entries.filter(e => e.answered).length} respondidas
              </Text>
            </View>

            {entries.map((entry) => (
              <View key={entry.id} style={styles.entryCard}>
                <View style={styles.entryHeader}>
                  <View style={styles.entryTitleRow}>
                    <Text style={styles.entryPrayerTitle} numberOfLines={1}>
                      {entry.prayerTitle}
                    </Text>
                    <Text style={styles.entryDate}>{formatDate(entry.createdAt)}</Text>
                  </View>
                </View>
                <Text style={styles.entryNote}>{entry.note}</Text>
                <TouchableOpacity
                  style={[styles.answeredButton, entry.answered && styles.answeredButtonActive]}
                  onPress={() => handleToggle(entry.id)}
                  activeOpacity={0.7}
                >
                  {entry.answered ? (
                    <CheckCircle2 size={18} color="#27ae60" />
                  ) : (
                    <Circle size={18} color={Colors.text.muted} />
                  )}
                  <Text style={[styles.answeredText, entry.answered && styles.answeredTextActive]}>
                    {entry.answered ? 'Respondida por Deus' : 'Marcar como respondida'}
                  </Text>
                  {entry.answered && entry.answeredDate && (
                    <Text style={styles.answeredDate}>
                      {formatDate(entry.answeredDate)}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.cream,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  headerInfo: {
    paddingBottom: 12,
    marginBottom: 4,
  },
  headerInfoText: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontWeight: '500' as const,
  },
  entryCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  entryHeader: {
    marginBottom: 10,
  },
  entryTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryPrayerTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.primary.navy,
    flex: 1,
    marginRight: 8,
  },
  entryDate: {
    fontSize: 11,
    color: Colors.text.muted,
  },
  entryNote: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 22,
    marginBottom: 12,
  },
  answeredButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  answeredButtonActive: {},
  answeredText: {
    fontSize: 13,
    color: Colors.text.muted,
    fontWeight: '500' as const,
  },
  answeredTextActive: {
    color: '#27ae60',
    fontWeight: '600' as const,
  },
  answeredDate: {
    fontSize: 11,
    color: '#27ae60',
    marginLeft: 'auto',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${Colors.accent.gold}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.primary.navy,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
