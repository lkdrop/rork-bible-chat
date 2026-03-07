import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Sparkles,
  Heart,
  HandHeart,
  Gift,
  MessageCircle,
  ChevronRight,
  Share2,
  RotateCcw,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { stopSpeaking } from '@/services/textToSpeech';
import { useApp } from '@/contexts/AppContext';
import { generateText } from '@/services/gemini';
import { shareContent } from '@/utils';

type ACTSStep = 'adoracao' | 'confissao' | 'acao_gracas' | 'suplica';

interface StepConfig {
  id: ACTSStep;
  title: string;
  subtitle: string;
  icon: typeof Heart;
  color: string;
  placeholder: string;
  prompt: string;
}

const STEPS: StepConfig[] = [
  {
    id: 'adoracao',
    title: 'Adoração',
    subtitle: 'Exalte quem Deus é',
    icon: Sparkles,
    color: '#F59E0B',
    placeholder: 'O que você admira em Deus hoje? (Ex: Sua fidelidade, Seu amor...)',
    prompt: 'adoração a Deus, exaltando quem Ele é',
  },
  {
    id: 'confissao',
    title: 'Confissão',
    subtitle: 'Abra seu coração',
    icon: Heart,
    color: '#EF4444',
    placeholder: 'O que está pesando no seu coração? (Opcional - pode pular)',
    prompt: 'confissão e arrependimento genuíno',
  },
  {
    id: 'acao_gracas',
    title: 'Ação de Graças',
    subtitle: 'Agradeça pelas bênçãos',
    icon: Gift,
    color: '#10B981',
    placeholder: 'Pelo que você é grato(a) hoje?',
    prompt: 'gratidão e ação de graças pelas bênçãos',
  },
  {
    id: 'suplica',
    title: 'Súplica',
    subtitle: 'Apresente seus pedidos',
    icon: HandHeart,
    color: '#C5943A',
    placeholder: 'Quais são seus pedidos a Deus?',
    prompt: 'súplicas e pedidos a Deus',
  },
];

export default function ACTSPrayerScreen() {
  const router = useRouter();
  const { colors, addPrayerRequest } = useApp();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [inputs, setInputs] = useState<Record<ACTSStep, string>>({
    adoracao: '',
    confissao: '',
    acao_gracas: '',
    suplica: '',
  });
  const [generatedPrayer, setGeneratedPrayer] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const currentStep = STEPS[currentStepIndex];
  const progress = (currentStepIndex + 1) / STEPS.length;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [currentStepIndex, progress, progressAnim]);

  const animateTransition = useCallback((callback: () => void) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      callback();
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    });
  }, [fadeAnim]);

  const handleNext = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStepIndex < STEPS.length - 1) {
      animateTransition(() => setCurrentStepIndex(i => i + 1));
    } else {
      void generatePrayer();
    }
  }, [currentStepIndex, animateTransition]);

  const handleBack = useCallback(() => {
    if (currentStepIndex > 0) {
      animateTransition(() => setCurrentStepIndex(i => i - 1));
    }
  }, [currentStepIndex, animateTransition]);

  const generatePrayer = async () => {
    setIsGenerating(true);
    setIsComplete(true);
    try {
      const parts = STEPS.map(step => {
        const input = inputs[step.id];
        return input ? `${step.title}: ${input}` : '';
      }).filter(Boolean).join('\n');

      const response = await generateText({
        prompt: `Com base nas intenções de oração do usuário usando o método ACTS, gere uma oração completa, bonita e pessoal em português do Brasil.

Intenções do usuário:
${parts}

REGRAS:
- Siga a estrutura ACTS: Adoração → Confissão → Ação de Graças → Súplica
- Se alguma seção estiver vazia, ainda inclua essa parte da oração com algo genérico mas genuíno
- Tom: íntimo, pastoral, como se estivesse orando junto com a pessoa
- Use linguagem bíblica mas acessível
- Inclua 1-2 referências bíblicas naturalmente no texto
- A oração deve ter 4-6 parágrafos
- Termine com "Em nome de Jesus, Amém."`,
      });
      setGeneratedPrayer(response);
    } catch {
      setGeneratedPrayer('Senhor, obrigado por nos permitir chegar à Tua presença. Recebe nossa adoração, perdoa nossos pecados, agradecemos por Tuas bênçãos e apresentamos nossos pedidos. Em nome de Jesus, Amém.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePrayer = useCallback(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addPrayerRequest(generatedPrayer, 'acts_prayer');
  }, [generatedPrayer, addPrayerRequest]);

  const handleSharePrayer = useCallback(async () => {
    await shareContent(generatedPrayer + '\n\nOração gerada pelo Devocio');
  }, [generatedPrayer]);

  const handleRestart = useCallback(() => {
    setCurrentStepIndex(0);
    setInputs({ adoracao: '', confissao: '', acao_gracas: '', suplica: '' });
    setGeneratedPrayer('');
    setIsComplete(false);
  }, []);

  useEffect(() => {
    return () => { void stopSpeaking(); };
  }, []);

  if (isComplete) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Oração ACTS</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.resultContent}>
          {isGenerating ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#C5943A" />
              <Text style={[styles.loadingText, { color: colors.textMuted }]}>Gabriel está preparando sua oração...</Text>
            </View>
          ) : (
            <>
              <LinearGradient
                colors={['#C5943A' + '15', '#F59E0B' + '10']}
                style={styles.prayerResultCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.prayerResultHeader}>
                  <HandHeart size={20} color="#C5943A" />
                  <Text style={[styles.prayerResultTitle, { color: colors.text }]}>Sua Oração</Text>
                </View>
                <Text style={[styles.prayerResultText, { color: colors.text }]}>{generatedPrayer}</Text>
              </LinearGradient>

              <View style={styles.resultActions}>
                <TouchableOpacity
                  style={[styles.resultAction, { backgroundColor: '#C5943A' + '15' }]}
                  onPress={handleSavePrayer}
                >
                  <Heart size={18} color="#C5943A" />
                  <Text style={[styles.resultActionText, { color: '#C5943A' }]}>Salvar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.resultAction, { backgroundColor: '#10B981' + '15' }]}
                  onPress={() => void handleSharePrayer()}
                >
                  <Share2 size={18} color="#10B981" />
                  <Text style={[styles.resultActionText, { color: '#10B981' }]}>Compartilhar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.resultAction, { backgroundColor: '#F59E0B' + '15' }]}
                  onPress={handleRestart}
                >
                  <RotateCcw size={18} color="#F59E0B" />
                  <Text style={[styles.resultActionText, { color: '#F59E0B' }]}>Nova Oração</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  const StepIcon = currentStep.icon;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => currentStepIndex > 0 ? handleBack() : router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Oração ACTS</Text>
        <Text style={[styles.stepCounter, { color: colors.textMuted }]}>{currentStepIndex + 1}/{STEPS.length}</Text>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
        <Animated.View
          style={[
            styles.progressBarFill,
            {
              backgroundColor: currentStep.color,
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      {/* Step indicators */}
      <View style={styles.stepIndicators}>
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = idx === currentStepIndex;
          const isDone = idx < currentStepIndex;
          return (
            <View key={step.id} style={styles.stepIndicator}>
              <View style={[
                styles.stepDot,
                { backgroundColor: isDone ? step.color : isActive ? step.color + '30' : colors.border },
                isActive && { borderWidth: 2, borderColor: step.color },
              ]}>
                <Icon size={14} color={isDone || isActive ? (isDone ? '#FFF' : step.color) : colors.textMuted} />
              </View>
              <Text style={[
                styles.stepName,
                { color: isActive ? step.color : isDone ? colors.text : colors.textMuted },
              ]}>{step.title.split(' ')[0]}</Text>
            </View>
          );
        })}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={[styles.stepCard, { borderColor: currentStep.color + '30' }]}>
            <View style={[styles.stepIconWrap, { backgroundColor: currentStep.color + '15' }]}>
              <StepIcon size={28} color={currentStep.color} />
            </View>
            <Text style={[styles.stepTitle, { color: colors.text }]}>{currentStep.title}</Text>
            <Text style={[styles.stepSubtitle, { color: colors.textMuted }]}>{currentStep.subtitle}</Text>
          </View>

          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: currentStep.color + '30' }]}
            placeholder={currentStep.placeholder}
            placeholderTextColor={colors.textMuted}
            multiline
            value={inputs[currentStep.id]}
            onChangeText={(text) => setInputs(prev => ({ ...prev, [currentStep.id]: text }))}
            textAlignVertical="top"
          />

          {currentStep.id === 'confissao' && (
            <Text style={[styles.skipNote, { color: colors.textMuted }]}>
              Este passo é opcional. Pode deixar em branco e avançar.
            </Text>
          )}
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: currentStep.color }]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextBtnText}>
            {currentStepIndex === STEPS.length - 1 ? 'Gerar Oração' : 'Próximo'}
          </Text>
          {currentStepIndex === STEPS.length - 1 ? (
            <Sparkles size={18} color="#FFF" />
          ) : (
            <ChevronRight size={18} color="#FFF" />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' as const },
  stepCounter: { fontSize: 14, fontWeight: '600' as const, width: 40, textAlign: 'right' as const },
  progressBarBg: { height: 4, marginHorizontal: 20, borderRadius: 2, overflow: 'hidden' as const },
  progressBarFill: { height: '100%' as const, borderRadius: 2 },
  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  stepIndicator: { alignItems: 'center', gap: 6 },
  stepDot: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  stepName: { fontSize: 11, fontWeight: '600' as const },
  content: { flex: 1 },
  contentInner: { padding: 20 },
  stepCard: {
    alignItems: 'center',
    paddingVertical: 28,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 20,
  },
  stepIconWrap: { width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  stepTitle: { fontSize: 24, fontWeight: '800' as const },
  stepSubtitle: { fontSize: 14, marginTop: 4 },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 140,
  },
  skipNote: { fontSize: 13, textAlign: 'center' as const, marginTop: 10, fontStyle: 'italic' as const },
  footer: { padding: 20, borderTopWidth: 1 },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  nextBtnText: { fontSize: 16, fontWeight: '700' as const, color: '#FFF' },
  resultContent: { padding: 20, paddingBottom: 40 },
  loadingContainer: { alignItems: 'center', paddingVertical: 60, gap: 16 },
  loadingText: { fontSize: 15 },
  prayerResultCard: {
    borderRadius: 18,
    padding: 22,
    marginBottom: 20,
  },
  prayerResultHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  prayerResultTitle: { fontSize: 18, fontWeight: '700' as const },
  prayerResultText: { fontSize: 16, lineHeight: 28, fontStyle: 'italic' as const },
  resultActions: { flexDirection: 'row', gap: 10 },
  resultAction: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
  },
  resultActionText: { fontSize: 13, fontWeight: '600' as const },
});
