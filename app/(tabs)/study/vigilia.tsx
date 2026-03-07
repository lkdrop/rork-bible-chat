import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Flame, Lock, Check, Share2, Volume2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { speak, stopSpeaking } from '@/services/textToSpeech';
import { useApp } from '@/contexts/AppContext';
import { vigiliaDays } from '@/constants/vigiliaData';
import { generateText } from '@/services/gemini';

export default function VigiliaScreen() {
  const router = useRouter();
  const { state, colors, completeVigiliaDay, saveVigiliaTestimony, startVigilia } = useApp();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [generatedPrayer, setGeneratedPrayer] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [testimony, setTestimony] = useState(state.vigilia.testimony || '');
  const flameAnim = useRef(new Animated.Value(1)).current;

  const isActive = state.vigilia.isActive;
  const isPremium = state.isPremium;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(flameAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(flameAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [flameAnim]);

  useEffect(() => {
    return () => { void stopSpeaking(); };
  }, []);

  const handleStart = useCallback(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    startVigilia();
  }, [startVigilia]);

  const handleSelectDay = useCallback((day: number) => {
    if (!isPremium && day > 3) {
      router.push('/paywall' as never);
      return;
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDay(day);
    setGeneratedPrayer('');
  }, [isPremium, router]);

  const handleCompleteDay = useCallback((day: number) => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completeVigiliaDay(day);
    Alert.alert('Dia completo!', `Dia ${day} da vigília concluído. Glória a Deus!`);
  }, [completeVigiliaDay]);

  const handleGeneratePrayer = useCallback(async (dayData: typeof vigiliaDays[0]) => {
    setIsGenerating(true);
    try {
      const response = await generateText({
        messages: [{
          role: 'user',
          content: `Você é Gabriel, um guia espiritual cristão. Gere uma oração guiada poderosa e personalizada para o Dia ${dayData.day} da Vigília de 21 dias.

Tema: ${dayData.theme}
Versículo base: "${dayData.verse}" (${dayData.verseRef})
Foco da oração: ${dayData.prayerFocus}

A oração deve ser:
- Em português do Brasil
- Profunda e tocante (4-6 parágrafos)
- Baseada no tema e versículo do dia
- Com declarações de fé
- Terminando com "Em nome de Jesus, Amém."`,
        }],
      });
      setGeneratedPrayer(response);
    } catch {
      setGeneratedPrayer('Senhor, neste dia de vigília, eu me consagro diante de Ti. Transforma meu coração, renova minhas forças e me enche do Teu Espírito Santo. Em nome de Jesus, Amém.');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleSpeak = useCallback((text: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isSpeaking) {
      void stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      void speak(text, {
        voice: 'borges',
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  }, [isSpeaking]);

  const handleSaveTestimony = useCallback(() => {
    if (!testimony.trim()) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    saveVigiliaTestimony(testimony.trim());
    Alert.alert('Testemunho salvo!', 'Seu testemunho foi registrado. Glória a Deus!');
  }, [testimony, saveVigiliaTestimony]);

  const completedCount = state.vigilia.completedDays.length;
  const progress = Math.round((completedCount / 21) * 100);
  const dayData = selectedDay ? vigiliaDays.find(d => d.day === selectedDay) : null;
  const isDayCompleted = selectedDay ? state.vigilia.completedDays.includes(selectedDay) : false;

  if (!isActive) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#0A0A0A' }]} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.startContainer}>
          <Animated.View style={[styles.startFlame, { transform: [{ scale: flameAnim }] }]}>
            <Flame size={48} color="#FF6B35" fill="#FF6B35" />
          </Animated.View>
          <Text style={styles.startTitle}>Vigília IA</Text>
          <Text style={styles.startSubtitle}>21 Dias de Jejum e Oração</Text>
          <Text style={styles.startDescription}>
            Uma jornada guiada pela IA com temas diários, versículos, orações personalizadas e desafios práticos para transformar sua vida espiritual.
          </Text>
          <View style={styles.startFeatures}>
            {['Temas diários de oração', 'Orações geradas pela IA', 'Desafios práticos de fé', 'Testemunho ao final'].map(f => (
              <View key={f} style={styles.startFeatureRow}>
                <Flame size={14} color="#FF6B35" />
                <Text style={styles.startFeatureText}>{f}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.startBtn} onPress={handleStart} activeOpacity={0.8}>
            <Flame size={18} color="#0A0A0A" />
            <Text style={styles.startBtnText}>Iniciar Vigília</Text>
          </TouchableOpacity>
          {!isPremium && (
            <Text style={styles.startNote}>3 dias grátis. Premium para completar os 21 dias.</Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (dayData && selectedDay) {
    const isLocked = !isPremium && selectedDay > 3;

    if (isLocked) {
      router.push('/paywall' as never);
      return null;
    }

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => setSelectedDay(null)} style={styles.backBtn}>
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Dia {dayData.day}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.dayContent}>
          <View style={[styles.themeBadge, { backgroundColor: '#FF6B35' + '15' }]}>
            <Flame size={14} color="#FF6B35" />
            <Text style={[styles.themeBadgeText, { color: '#FF6B35' }]}>{dayData.theme}</Text>
          </View>

          <View style={[styles.verseCard, { backgroundColor: '#8b5cf6' + '10', borderColor: '#8b5cf6' + '30' }]}>
            <View style={styles.verseAccent} />
            <View style={styles.verseInner}>
              <Text style={[styles.verseText, { color: colors.text }]}>"{dayData.verse}"</Text>
              <Text style={styles.verseRef}>— {dayData.verseRef}</Text>
            </View>
          </View>

          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Desafio do Dia</Text>
          <View style={[styles.challengeCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <Text style={[styles.challengeText, { color: colors.text }]}>{dayData.challenge}</Text>
          </View>

          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Oração Guiada</Text>
          {!generatedPrayer && !isGenerating && (
            <TouchableOpacity
              style={[styles.generateBtn, { backgroundColor: '#8B5CF6' }]}
              onPress={() => void handleGeneratePrayer(dayData)}
            >
              <Text style={styles.generateBtnText}>Gerar Oração Personalizada</Text>
            </TouchableOpacity>
          )}

          {isGenerating && (
            <View style={[styles.loadingCard, { backgroundColor: colors.card }]}>
              <ActivityIndicator size="small" color="#8B5CF6" />
              <Text style={[styles.loadingText, { color: colors.textMuted }]}>Gabriel está preparando sua oração...</Text>
            </View>
          )}

          {generatedPrayer && (
            <View style={[styles.prayerCard, { backgroundColor: '#8B5CF6' + '08', borderColor: '#8B5CF6' + '20' }]}>
              <Text style={[styles.prayerText, { color: colors.text }]}>{generatedPrayer}</Text>
              <View style={styles.prayerActions}>
                <TouchableOpacity
                  style={[styles.prayerActionBtn, isSpeaking && { backgroundColor: '#8B5CF6' }]}
                  onPress={() => handleSpeak(generatedPrayer)}
                >
                  <Volume2 size={14} color={isSpeaking ? '#FFF' : '#8B5CF6'} />
                  <Text style={[styles.prayerActionText, isSpeaking && { color: '#FFF' }]}>
                    {isSpeaking ? 'Parar' : 'Ouvir'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {!isDayCompleted && (
            <TouchableOpacity
              style={[styles.completeBtn, { backgroundColor: '#34C759' }]}
              onPress={() => handleCompleteDay(selectedDay)}
            >
              <Check size={18} color="#FFF" />
              <Text style={styles.completeBtnText}>Marcar Dia como Concluído</Text>
            </TouchableOpacity>
          )}

          {isDayCompleted && (
            <View style={[styles.completedBadge, { backgroundColor: '#34C759' + '15' }]}>
              <Check size={18} color="#34C759" />
              <Text style={[styles.completedText, { color: '#34C759' }]}>Dia concluído!</Text>
            </View>
          )}

          {selectedDay === 21 && isDayCompleted && (
            <View style={[styles.testimonySection, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              <Text style={[styles.sectionLabel, { color: colors.text }]}>Seu Testemunho</Text>
              <TextInput
                style={[styles.testimonyInput, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                placeholder="O que Deus fez em você durante esses 21 dias?"
                placeholderTextColor={colors.textMuted}
                value={testimony}
                onChangeText={setTestimony}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
              <TouchableOpacity style={[styles.saveTestimonyBtn, { backgroundColor: '#FF6B35' }]} onPress={handleSaveTestimony}>
                <Text style={styles.saveTestimonyText}>Salvar Testemunho</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Vigília IA</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        <View style={[styles.progressCard, { backgroundColor: '#FF6B35' + '10', borderColor: '#FF6B35' + '30' }]}>
          <View style={styles.progressHeader}>
            <Animated.View style={{ transform: [{ scale: flameAnim }] }}>
              <Flame size={24} color="#FF6B35" fill="#FF6B35" />
            </Animated.View>
            <View style={styles.progressInfo}>
              <Text style={[styles.progressTitle, { color: colors.text }]}>21 Dias de Jejum e Oração</Text>
              <Text style={[styles.progressSub, { color: '#FF6B35' }]}>{completedCount}/21 dias • {progress}%</Text>
            </View>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View style={[styles.progressFill, { width: `${progress}%` as `${number}%` }]} />
          </View>
        </View>

        {vigiliaDays.map((vd) => {
          const completed = state.vigilia.completedDays.includes(vd.day);
          const locked = !isPremium && vd.day > 3;
          const isCurrent = vd.day === state.vigilia.currentDay;

          return (
            <TouchableOpacity
              key={vd.day}
              style={[
                styles.dayCard,
                {
                  backgroundColor: completed ? '#34C759' + '08' : isCurrent ? '#FF6B35' + '08' : colors.card,
                  borderColor: completed ? '#34C759' + '30' : isCurrent ? '#FF6B35' + '30' : colors.borderLight,
                },
              ]}
              onPress={() => handleSelectDay(vd.day)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.dayNumber,
                {
                  backgroundColor: completed ? '#34C759' : isCurrent ? '#FF6B35' : locked ? colors.border : colors.primaryLight,
                },
              ]}>
                {completed ? (
                  <Check size={14} color="#FFF" />
                ) : locked ? (
                  <Lock size={14} color={colors.textMuted} />
                ) : (
                  <Text style={[styles.dayNumberText, { color: isCurrent ? '#FFF' : colors.primary }]}>{vd.day}</Text>
                )}
              </View>
              <View style={styles.dayInfo}>
                <Text style={[styles.dayTheme, { color: colors.text }]}>{vd.theme}</Text>
                <Text style={[styles.dayVerse, { color: colors.textMuted }]} numberOfLines={1}>{vd.verseRef}</Text>
              </View>
              {locked && (
                <View style={[styles.premiumBadge, { backgroundColor: '#8b5cf6' + '15' }]}>
                  <Text style={styles.premiumBadgeText}>Premium</Text>
                </View>
              )}
            </TouchableOpacity>
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
  headerTitle: { fontSize: 20, fontWeight: '700' as const, flex: 1, textAlign: 'center' as const },
  headerSpacer: { width: 30 },
  startContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  startFlame: { marginBottom: 20 },
  startTitle: { fontSize: 32, fontWeight: '900' as const, color: '#FFFFFF', marginBottom: 6, letterSpacing: -0.5 },
  startSubtitle: { fontSize: 16, fontWeight: '600' as const, color: '#FF6B35', marginBottom: 16 },
  startDescription: { fontSize: 15, color: '#AAA', textAlign: 'center' as const, lineHeight: 24, marginBottom: 28 },
  startFeatures: { gap: 10, marginBottom: 32, width: '100%' },
  startFeatureRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#1A1A1A', padding: 14, borderRadius: 12 },
  startFeatureText: { fontSize: 14, color: '#FFF', fontWeight: '600' as const },
  startBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FF6B35', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 16 },
  startBtnText: { fontSize: 16, fontWeight: '800' as const, color: '#0A0A0A' },
  startNote: { fontSize: 12, color: '#666', marginTop: 12, textAlign: 'center' as const },
  listContent: { padding: 20, paddingBottom: 40 },
  progressCard: { borderRadius: 16, padding: 18, borderWidth: 1, marginBottom: 20 },
  progressHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  progressInfo: { flex: 1 },
  progressTitle: { fontSize: 16, fontWeight: '700' as const },
  progressSub: { fontSize: 13, fontWeight: '600' as const, marginTop: 2 },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' as const },
  progressFill: { height: '100%' as const, borderRadius: 4, backgroundColor: '#FF6B35' },
  dayCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8, gap: 12 },
  dayNumber: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  dayNumberText: { fontSize: 14, fontWeight: '700' as const },
  dayInfo: { flex: 1 },
  dayTheme: { fontSize: 15, fontWeight: '600' as const },
  dayVerse: { fontSize: 12, marginTop: 2 },
  premiumBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  premiumBadgeText: { fontSize: 10, fontWeight: '700' as const, color: '#8b5cf6' },
  dayContent: { padding: 20, paddingBottom: 40 },
  themeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' as const, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, marginBottom: 16 },
  themeBadgeText: { fontSize: 14, fontWeight: '700' as const },
  verseCard: { flexDirection: 'row', borderRadius: 14, borderWidth: 1, overflow: 'hidden' as const, marginBottom: 20 },
  verseAccent: { width: 4, backgroundColor: '#8b5cf6' },
  verseInner: { flex: 1, padding: 16 },
  verseText: { fontSize: 16, lineHeight: 26, fontStyle: 'italic' as const },
  verseRef: { fontSize: 14, fontWeight: '700' as const, color: '#8b5cf6', marginTop: 8 },
  sectionLabel: { fontSize: 13, fontWeight: '700' as const, textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: 10 },
  challengeCard: { borderRadius: 14, padding: 16, borderWidth: 1, marginBottom: 20 },
  challengeText: { fontSize: 15, lineHeight: 24 },
  generateBtn: { paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginBottom: 16 },
  generateBtnText: { fontSize: 15, fontWeight: '700' as const, color: '#FFF' },
  loadingCard: { borderRadius: 14, padding: 24, alignItems: 'center', gap: 10, marginBottom: 16 },
  loadingText: { fontSize: 14 },
  prayerCard: { borderRadius: 14, padding: 16, borderWidth: 1, marginBottom: 20 },
  prayerText: { fontSize: 15, lineHeight: 24, fontStyle: 'italic' as const },
  prayerActions: { flexDirection: 'row', gap: 10, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#8B5CF6' + '15' },
  prayerActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#8B5CF6' + '15' },
  prayerActionText: { fontSize: 13, fontWeight: '600' as const, color: '#8B5CF6' },
  completeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, marginBottom: 16 },
  completeBtnText: { fontSize: 15, fontWeight: '700' as const, color: '#FFF' },
  completedBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, marginBottom: 16 },
  completedText: { fontSize: 15, fontWeight: '700' as const },
  testimonySection: { borderRadius: 16, padding: 18, borderWidth: 1, marginTop: 8 },
  testimonyInput: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15, minHeight: 120, marginBottom: 12, lineHeight: 22 },
  saveTestimonyBtn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveTestimonyText: { fontSize: 15, fontWeight: '700' as const, color: '#FFF' },
});
