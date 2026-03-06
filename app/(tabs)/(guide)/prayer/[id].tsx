import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Heart, Share2, CheckCircle2, Clock, BookOpen, Play, Pause, Volume2, PenLine } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { Colors } from '@/constants/colors';
import { prayers } from '@/constants/prayers';
import { usePrayerGuide } from '@/contexts/PrayerGuideContext';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function PrayerDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { markPrayerCompleted, toggleFavorite, isPrayerCompleted, isPrayerFavorite, addDiaryEntry } = usePrayerGuide();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [diaryNote, setDiaryNote] = useState('');
  const [showDiary, setShowDiary] = useState(false);

  const prayer = prayers.find(p => p.id === id);

  if (!prayer) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Oração não encontrada</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.errorButton}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isCompleted = isPrayerCompleted(prayer.id);
  const isFavorite = isPrayerFavorite(prayer.id);

  const handleComplete = useCallback(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    void markPrayerCompleted(prayer.id);
    Alert.alert(
      'Oração Completada! 🙏',
      'Que esta oração traga bênçãos para sua vida. Continue firme na fé!',
      [{ text: 'Amém', style: 'default' }]
    );
  }, [prayer.id, markPrayerCompleted]);

  const handleShare = useCallback(() => {
    Alert.alert(
      'Compartilhar Oração',
      `${prayer.title}\n\n${prayer.prayer.substring(0, 100)}...`,
      [{ text: 'OK', style: 'default' }]
    );
  }, [prayer]);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      void Speech.stop();
      setIsPlaying(false);
    } else {
      setIsLoadingAudio(true);
      const textToSpeak = `${prayer.title}. ${prayer.verseRef}. ${prayer.prayer}`;

      try {
        Speech.speak(textToSpeak, {
          language: 'pt-BR',
          pitch: 1,
          rate: 0.9,
          onDone: () => setIsPlaying(false),
          onError: () => {
            setIsPlaying(false);
            setIsLoadingAudio(false);
          },
        });
        setIsPlaying(true);
        setIsLoadingAudio(false);
      } catch {
        Alert.alert('Erro', 'Não foi possível reproduzir o áudio');
        setIsLoadingAudio(false);
      }
    }
  }, [isPlaying, prayer]);

  const handleSaveDiary = useCallback(() => {
    if (!diaryNote.trim()) {
      Alert.alert('Atenção', 'Escreva algo antes de salvar.');
      return;
    }
    void addDiaryEntry(prayer.id, prayer.title, diaryNote.trim());
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Salvo!', 'Sua anotação foi adicionada ao diário de oração.');
    setDiaryNote('');
    setShowDiary(false);
  }, [diaryNote, prayer.id, prayer.title, addDiaryEntry]);

  React.useEffect(() => {
    return () => {
      void Speech.stop();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={Colors.text.light} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>{prayer.title}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              void toggleFavorite(prayer.id);
            }}
          >
            <Heart
              size={22}
              color={isFavorite ? Colors.accent.gold : Colors.text.light}
              fill={isFavorite ? Colors.accent.gold : 'transparent'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShare}
          >
            <Share2 size={22} color={Colors.text.light} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.verseCard}>
            <BookOpen size={20} color={Colors.accent.gold} style={styles.verseIcon} />
            <Text style={styles.verseText}>"{prayer.verse}"</Text>
            <Text style={styles.verseRef}>{prayer.verseRef}</Text>
          </View>

          <View style={styles.metaCard}>
            <View style={styles.metaItem}>
              <Clock size={18} color={Colors.accent.gold} />
              <View>
                <Text style={styles.metaLabel}>Melhor Horário</Text>
                <Text style={styles.metaValue}>{prayer.bestTime}</Text>
              </View>
            </View>
          </View>

          <View style={styles.prayerCard}>
            <View style={styles.prayerHeader}>
              <Text style={styles.prayerTitle}>Oração</Text>
              <TouchableOpacity
                style={[styles.audioButton, isPlaying && styles.audioButtonActive]}
                onPress={handlePlayPause}
                disabled={isLoadingAudio}
              >
                {isLoadingAudio ? (
                  <Volume2 size={20} color={Colors.text.light} />
                ) : isPlaying ? (
                  <Pause size={20} color={Colors.text.light} />
                ) : (
                  <Play size={20} color={Colors.text.light} />
                )}
                <Text style={styles.audioButtonText}>
                  {isLoadingAudio ? 'Carregando...' : isPlaying ? 'Pausar' : 'Ouvir'}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.prayerText}>{prayer.prayer}</Text>
          </View>

          <View style={styles.explanationCard}>
            <Text style={styles.explanationTitle}>Sobre esta Oração</Text>
            <Text style={styles.explanationText}>{prayer.explanation}</Text>
          </View>

          <TouchableOpacity
            style={styles.diaryToggle}
            onPress={() => setShowDiary(!showDiary)}
            activeOpacity={0.7}
          >
            <PenLine size={18} color={Colors.primary.navy} />
            <Text style={styles.diaryToggleText}>
              {showDiary ? 'Fechar Diário' : 'Escrever no Diário'}
            </Text>
          </TouchableOpacity>

          {showDiary && (
            <View style={styles.diaryCard}>
              <Text style={styles.diaryLabel}>Como você se sentiu? O que Deus falou ao seu coração?</Text>
              <TextInput
                style={styles.diaryInput}
                value={diaryNote}
                onChangeText={setDiaryNote}
                placeholder="Escreva suas reflexões..."
                placeholderTextColor={Colors.text.muted}
                multiline
                textAlignVertical="top"
                maxLength={500}
              />
              <TouchableOpacity
                style={[styles.diarySaveButton, !diaryNote.trim() && styles.diarySaveDisabled]}
                onPress={handleSaveDiary}
                disabled={!diaryNote.trim()}
                activeOpacity={0.8}
              >
                <Text style={styles.diarySaveText}>Salvar no Diário</Text>
              </TouchableOpacity>
            </View>
          )}

          <AnimatedTouchable
            style={[
              styles.completeButton,
              isCompleted && styles.completeButtonDone,
            ]}
            onPress={handleComplete}
            disabled={isCompleted}
            activeOpacity={0.8}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 size={24} color={Colors.text.light} />
                <Text style={styles.completeButtonText}>Oração Completada</Text>
              </>
            ) : (
              <Text style={styles.completeButtonText}>Marcar como Oração Feita</Text>
            )}
          </AnimatedTouchable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Colors.primary.navy,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.light,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  verseCard: {
    backgroundColor: Colors.primary.navy,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
  },
  verseIcon: {
    marginBottom: 12,
  },
  verseText: {
    fontSize: 18,
    fontStyle: 'italic',
    color: Colors.text.light,
    lineHeight: 28,
    marginBottom: 12,
  },
  verseRef: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.accent.gold,
  },
  metaCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaLabel: {
    fontSize: 12,
    color: Colors.text.muted,
  },
  metaValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary.navy,
  },
  prayerCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  prayerTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.accent.gold,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  prayerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.accent.gold,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  audioButtonActive: {
    backgroundColor: '#e74c3c',
  },
  audioButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text.light,
  },
  prayerText: {
    fontSize: 16,
    color: Colors.text.primary,
    lineHeight: 28,
    textAlign: 'left',
  },
  explanationCard: {
    backgroundColor: `${Colors.accent.gold}10`,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent.gold,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.primary.navy,
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  diaryToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginBottom: 8,
    backgroundColor: Colors.background.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    borderStyle: 'dashed',
  },
  diaryToggleText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary.navy,
  },
  diaryCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  diaryLabel: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: 10,
    fontWeight: '500' as const,
  },
  diaryInput: {
    backgroundColor: Colors.background.cream,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.text.primary,
    minHeight: 100,
    marginBottom: 12,
    lineHeight: 22,
  },
  diarySaveButton: {
    backgroundColor: Colors.primary.navy,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  diarySaveDisabled: {
    backgroundColor: Colors.text.muted,
  },
  diarySaveText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.light,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: Colors.accent.gold,
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: Colors.accent.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  completeButtonDone: {
    backgroundColor: '#27ae60',
    shadowColor: '#27ae60',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.light,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  errorButton: {
    fontSize: 16,
    color: Colors.accent.gold,
    fontWeight: '600' as const,
  },
});
