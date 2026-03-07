import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BookOpen, Church, Bell, ChevronRight, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp, Denomination, BibleTranslation } from '@/contexts/AppContext';

const denominationsData: { id: Denomination; name: string; emoji: string }[] = [
  { id: 'evangelica', name: 'Evangélica', emoji: '⛪' },
  { id: 'catolica', name: 'Católica', emoji: '🕊️' },
  { id: 'batista', name: 'Batista', emoji: '💧' },
  { id: 'presbiteriana', name: 'Presbiteriana', emoji: '📖' },
  { id: 'pentecostal', name: 'Pentecostal', emoji: '🔥' },
  { id: 'outra', name: 'Outra', emoji: '✝️' },
];

const translationsData: { id: BibleTranslation; name: string; desc: string }[] = [
  { id: 'NVI', name: 'NVI', desc: 'Nova Versão Internacional — linguagem moderna e acessível' },
  { id: 'ARA', name: 'ARA', desc: 'Almeida Revista e Atualizada — tradução clássica e precisa' },
  { id: 'NTLH', name: 'NTLH', desc: 'Nova Tradução na Linguagem de Hoje — fácil compreensão' },
  { id: 'NVT', name: 'NVT', desc: 'Nova Versão Transformadora — clara e fiel ao original' },
];

const notifTimes = [
  { id: '06:00', label: '6:00', desc: 'Bem cedo' },
  { id: '07:00', label: '7:00', desc: 'Manhã' },
  { id: '08:00', label: '8:00', desc: 'Manhã' },
  { id: '12:00', label: '12:00', desc: 'Almoço' },
  { id: '18:00', label: '18:00', desc: 'Tarde' },
  { id: '21:00', label: '21:00', desc: 'Noite' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors, completeOnboarding } = useApp();
  const [step, setStep] = useState(0);
  const [denomination, setDenomination] = useState<Denomination>('evangelica');
  const [translation, setTranslation] = useState<BibleTranslation>('NVI');
  const [notifTime, setNotifTime] = useState('07:00');
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const animateTransition = useCallback((callback: () => void) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      callback();
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    });
  }, [fadeAnim]);

  const handleNext = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (step < 2) {
      animateTransition(() => setStep(step + 1));
    } else {
      completeOnboarding(denomination, translation, notifTime);
      // Redireciona para quiz de personalização → depois desafio 7 dias
      router.replace('/personalization-quiz');
    }
  }, [step, denomination, translation, notifTime, completeOnboarding, router, animateTransition]);

  const handleBack = useCallback(() => {
    if (step > 0) {
      animateTransition(() => setStep(step - 1));
    }
  }, [step, animateTransition]);

  const steps = [
    { icon: Church, title: 'Sua Denominação', subtitle: 'Nos ajuda a personalizar suas recomendações' },
    { icon: BookOpen, title: 'Tradução da Bíblia', subtitle: 'Escolha a versão que você prefere ler' },
    { icon: Bell, title: 'Versículo Diário', subtitle: 'Quando deseja receber o versículo do dia?' },
  ];

  const currentStep = steps[step];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.progressRow}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              { backgroundColor: i <= step ? colors.primary : colors.border },
            ]}
          />
        ))}
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
          <currentStep.icon size={36} color={colors.primary} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>{currentStep.title}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{currentStep.subtitle}</Text>

        <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
          {step === 0 && denominationsData.map((d) => (
            <TouchableOpacity
              key={d.id}
              style={[
                styles.option,
                { backgroundColor: colors.card, borderColor: denomination === d.id ? colors.primary : colors.borderLight },
                denomination === d.id && { borderWidth: 2 },
              ]}
              onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setDenomination(d.id); }}
              activeOpacity={0.7}
            >
              <Text style={styles.optionEmoji}>{d.emoji}</Text>
              <Text style={[styles.optionText, { color: colors.text }]}>{d.name}</Text>
              {denomination === d.id && <Check size={18} color={colors.primary} />}
            </TouchableOpacity>
          ))}

          {step === 1 && translationsData.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[
                styles.translationOption,
                { backgroundColor: colors.card, borderColor: translation === t.id ? colors.primary : colors.borderLight },
                translation === t.id && { borderWidth: 2 },
              ]}
              onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTranslation(t.id); }}
              activeOpacity={0.7}
            >
              <View style={styles.translationHeader}>
                <View style={[styles.translationBadge, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.translationBadgeText, { color: colors.primary }]}>{t.id}</Text>
                </View>
                {translation === t.id && <Check size={18} color={colors.primary} />}
              </View>
              <Text style={[styles.translationDesc, { color: colors.textSecondary }]}>{t.desc}</Text>
            </TouchableOpacity>
          ))}

          {step === 2 && (
            <View style={styles.timeGrid}>
              {notifTimes.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={[
                    styles.timeOption,
                    { backgroundColor: colors.card, borderColor: notifTime === t.id ? colors.primary : colors.borderLight },
                    notifTime === t.id && { borderWidth: 2 },
                  ]}
                  onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setNotifTime(t.id); }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.timeLabel, { color: notifTime === t.id ? colors.primary : colors.text }]}>{t.label}</Text>
                  <Text style={[styles.timeDesc, { color: colors.textMuted }]}>{t.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </Animated.View>

      <View style={styles.footer}>
        {step > 0 && (
          <TouchableOpacity style={[styles.backBtn, { borderColor: colors.border }]} onPress={handleBack}>
            <Text style={[styles.backBtnText, { color: colors.textSecondary }]}>Voltar</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: colors.primary, flex: step > 0 ? 1 : undefined }]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextBtnText}>{step === 2 ? 'Começar' : 'Próximo'}</Text>
          <ChevronRight size={18} color="#FFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  progressRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingTop: 16, paddingBottom: 8 },
  progressDot: { width: 32, height: 4, borderRadius: 2 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  iconCircle: { width: 72, height: 72, borderRadius: 22, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '800' as const, textAlign: 'center' as const, marginBottom: 8, letterSpacing: -0.3 },
  subtitle: { fontSize: 15, textAlign: 'center' as const, marginBottom: 28, lineHeight: 22 },
  optionsList: { flex: 1 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    gap: 14,
  },
  optionEmoji: { fontSize: 24 },
  optionText: { fontSize: 16, fontWeight: '600' as const, flex: 1 },
  translationOption: { padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 12 },
  translationHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  translationBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  translationBadgeText: { fontSize: 14, fontWeight: '800' as const },
  translationDesc: { fontSize: 13, lineHeight: 20 },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  timeOption: { width: '47%' as const, padding: 18, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
  timeLabel: { fontSize: 22, fontWeight: '800' as const, marginBottom: 4 },
  timeDesc: { fontSize: 12 },
  footer: { flexDirection: 'row', gap: 12, padding: 24, paddingTop: 12 },
  backBtn: { paddingHorizontal: 24, paddingVertical: 16, borderRadius: 14, borderWidth: 1 },
  backBtnText: { fontSize: 16, fontWeight: '600' as const },
  nextBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 14 },
  nextBtnText: { fontSize: 16, fontWeight: '700' as const, color: '#FFF' },
});
