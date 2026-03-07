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
import { ChevronRight, Sparkles, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';

interface QuizOption {
  id: string;
  emoji: string;
  label: string;
  desc: string;
}

const QUESTIONS = [
  {
    title: 'Onde voce esta na sua caminhada?',
    subtitle: 'Isso nos ajuda a adaptar o conteudo pra voce',
    options: [
      { id: 'iniciante', emoji: '🌱', label: 'Comecando agora', desc: 'Quero conhecer mais a Biblia' },
      { id: 'intermediario', emoji: '📖', label: 'Ja leio a Biblia', desc: 'Quero aprofundar meu conhecimento' },
      { id: 'avancado', emoji: '🔥', label: 'Estudo constantemente', desc: 'Quero ir mais fundo na Palavra' },
      { id: 'lider', emoji: '👑', label: 'Lider/Pastor', desc: 'Preciso de ferramentas pra servir' },
    ] as QuizOption[],
  },
  {
    title: 'Qual seu principal objetivo?',
    subtitle: 'Gabriel vai focar nisso nas suas conversas',
    options: [
      { id: 'habito', emoji: '⏰', label: 'Criar habito de leitura', desc: 'Ler a Biblia todos os dias' },
      { id: 'entender', emoji: '🧠', label: 'Entender a Biblia', desc: 'Compreender passagens dificeis' },
      { id: 'paz', emoji: '🕊️', label: 'Encontrar paz e direcao', desc: 'Buscar Deus em momentos dificeis' },
      { id: 'crescer', emoji: '📈', label: 'Crescer espiritualmente', desc: 'Amadurecer na fe e no carater' },
    ] as QuizOption[],
  },
  {
    title: 'Qual seu maior desafio hoje?',
    subtitle: 'Vamos te ajudar a superar isso',
    options: [
      { id: 'tempo', emoji: '⏳', label: 'Falta de tempo', desc: 'Vida corrida, dificil parar' },
      { id: 'motivacao', emoji: '😔', label: 'Falta de motivacao', desc: 'Comeco mas nao consigo manter' },
      { id: 'entendimento', emoji: '❓', label: 'Nao entendo a Biblia', desc: 'Acho dificil interpretar' },
      { id: 'sozinho', emoji: '🧍', label: 'Me sinto sozinho na fe', desc: 'Nao tenho comunidade ou apoio' },
    ] as QuizOption[],
  },
];

export default function PersonalizationQuizScreen() {
  const router = useRouter();
  const { colors, completePersonalizationQuiz } = useApp();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const animateTransition = useCallback((callback: () => void) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      callback();
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    });
  }, [fadeAnim]);

  const handleSelect = useCallback((optionId: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(optionId);
  }, []);

  const handleNext = useCallback(() => {
    if (!selected) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const newAnswers = [...answers, selected];

    if (step < QUESTIONS.length - 1) {
      animateTransition(() => {
        setAnswers(newAnswers);
        setSelected(null);
        setStep(step + 1);
      });
    } else {
      // Quiz completo
      completePersonalizationQuiz(
        newAnswers[0], // spiritualLevel
        newAnswers[1], // mainGoal
        newAnswers[2], // biggestChallenge
      );
      router.replace('/challenge-7days');
    }
  }, [selected, answers, step, completePersonalizationQuiz, router, animateTransition]);

  const question = QUESTIONS[step];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Progress */}
      <View style={styles.progressRow}>
        {QUESTIONS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              { backgroundColor: i <= step ? '#C5943A' : colors.border },
            ]}
          />
        ))}
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={[styles.iconCircle, { backgroundColor: '#C5943A' + '15' }]}>
          <Sparkles size={32} color="#C5943A" />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>{question.title}</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{question.subtitle}</Text>

        <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
          {question.options.map((opt) => {
            const isSelected = selected === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.option,
                  {
                    backgroundColor: isSelected ? '#C5943A' + '12' : colors.card,
                    borderColor: isSelected ? '#C5943A' : colors.borderLight,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
                onPress={() => handleSelect(opt.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                <View style={styles.optionContent}>
                  <Text style={[styles.optionLabel, { color: colors.text }]}>{opt.label}</Text>
                  <Text style={[styles.optionDesc, { color: colors.textMuted }]}>{opt.desc}</Text>
                </View>
                {isSelected && (
                  <View style={[styles.checkBadge, { backgroundColor: '#C5943A' }]}>
                    <Check size={14} color="#fff" strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextBtn,
            { backgroundColor: selected ? '#C5943A' : colors.border },
          ]}
          onPress={handleNext}
          activeOpacity={0.8}
          disabled={!selected}
        >
          <Text style={[styles.nextBtnText, { opacity: selected ? 1 : 0.5 }]}>
            {step === QUESTIONS.length - 1 ? 'Finalizar' : 'Proximo'}
          </Text>
          <ChevronRight size={18} color="#FFF" style={{ opacity: selected ? 1 : 0.5 }} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => router.replace('/challenge-7days')}
        >
          <Text style={[styles.skipBtnText, { color: colors.textMuted }]}>Pular</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 16,
    paddingBottom: 8,
  },
  progressDot: { width: 40, height: 4, borderRadius: 2 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800' as const,
    textAlign: 'center' as const,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center' as const,
    marginBottom: 28,
    lineHeight: 20,
  },
  optionsList: { flex: 1 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    gap: 14,
  },
  optionEmoji: { fontSize: 28 },
  optionContent: { flex: 1 },
  optionLabel: { fontSize: 16, fontWeight: '700' as const, marginBottom: 2 },
  optionDesc: { fontSize: 13, lineHeight: 18 },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: { padding: 24, paddingTop: 12, gap: 12 },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
    borderRadius: 14,
  },
  nextBtnText: { fontSize: 16, fontWeight: '700' as const, color: '#FFF' },
  skipBtn: { alignItems: 'center', paddingVertical: 8 },
  skipBtnText: { fontSize: 13, fontWeight: '600' as const },
});
