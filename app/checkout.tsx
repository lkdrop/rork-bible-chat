import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  Shield,
  Lock,
  CreditCard,
  QrCode,
  FileText,
  Clock,
  Zap,
  Star,
  Users,
  Heart,
  Sparkles,
  Copy,
  CheckCircle,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';

// ─── Planos ────────────────────────────────
const PLANS = [
  {
    id: 'semente',
    name: 'Semente',
    emoji: '🌱',
    price: 4.9,
    priceDisplay: 'R$ 4,90',
    period: '/mes',
    tagline: 'Plante a primeira semente',
    highlight: false,
    features: [
      'Chat ilimitado com Gabriel',
      'Geracao de conteudo (texto)',
      'Planos de estudo basicos',
      'Devocional diario',
    ],
  },
  {
    id: 'dizimo',
    name: 'Dizimo',
    emoji: '💜',
    price: 9.9,
    priceDisplay: 'R$ 9,90',
    period: '/mes',
    tagline: 'Mais popular — Tudo liberado',
    highlight: true,
    features: [
      'Tudo do plano Semente',
      'Vigilia IA 21 dias',
      'Palavra Profetica ilimitada',
      'Calendario de conteudo 30 dias',
      'Todos os planos de estudo',
    ],
  },
  {
    id: 'oferta',
    name: 'Oferta',
    emoji: '👑',
    price: 19.9,
    priceDisplay: 'R$ 19,90',
    period: '/mes',
    tagline: 'Semear em abundancia',
    highlight: false,
    features: [
      'Tudo do plano Dizimo',
      'Gerador de imagens IA ilimitado',
      'Estilos exclusivos de cards',
      'Suporte prioritario',
    ],
  },
];

const STEPS = ['Plano', 'Dados', 'Pagamento', 'Confirmacao'];

type PaymentMethod = 'pix' | 'card' | 'boleto';

interface FormData {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  cardNumber: string;
  cardName: string;
  cardExpiry: string;
  cardCvv: string;
}

// ─── Helpers ───────────────────────────────
function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

// ─── Componente Principal ──────────────────
export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ planId?: string }>();
  const { activatePremium } = useApp();

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState(
    PLANS.find(p => p.id === params.planId) || PLANS[1]
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: '',
  });

  // Countdown timer
  const [countdown, setCountdown] = useState(15 * 60); // 15 min
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  // Animations
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateStep = useCallback((toStep: number) => {
    const direction = toStep > currentStep ? 1 : -1;
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: direction * -30, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setCurrentStep(toStep);
      slideAnim.setValue(direction * 30);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(progressAnim, { toValue: toStep / (STEPS.length - 1), duration: 300, useNativeDriver: false }),
      ]).start();
    });
  }, [currentStep, fadeAnim, slideAnim, progressAnim]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: currentStep / (STEPS.length - 1),
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, []);

  const updateField = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const validateStep = useCallback((): boolean => {
    if (currentStep === 1) {
      if (!formData.name.trim()) { Alert.alert('', 'Informe seu nome completo'); return false; }
      if (!formData.email.includes('@')) { Alert.alert('', 'Informe um email valido'); return false; }
      if (formData.cpf.replace(/\D/g, '').length < 11) { Alert.alert('', 'Informe um CPF valido'); return false; }
      if (formData.phone.replace(/\D/g, '').length < 10) { Alert.alert('', 'Informe um telefone valido'); return false; }
    }
    if (currentStep === 2 && paymentMethod === 'card') {
      if (formData.cardNumber.replace(/\D/g, '').length < 16) { Alert.alert('', 'Numero do cartao invalido'); return false; }
      if (!formData.cardName.trim()) { Alert.alert('', 'Nome no cartao obrigatorio'); return false; }
      if (formData.cardExpiry.replace(/\D/g, '').length < 4) { Alert.alert('', 'Validade invalida'); return false; }
      if (formData.cardCvv.length < 3) { Alert.alert('', 'CVV invalido'); return false; }
    }
    return true;
  }, [currentStep, formData, paymentMethod]);

  const handleNext = useCallback(() => {
    if (!validateStep()) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep < STEPS.length - 1) {
      animateStep(currentStep + 1);
    }
  }, [validateStep, currentStep, animateStep]);

  const handleBack = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep > 0) {
      animateStep(currentStep - 1);
    }
  }, [currentStep, animateStep]);

  const handleFinalize = useCallback(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsProcessing(true);
    // Simula processamento
    setTimeout(() => {
      setIsProcessing(false);
      activatePremium();
      Alert.alert(
        'Pagamento Confirmado! 🎉',
        `Seu plano ${selectedPlan.name} foi ativado com sucesso!\n\nQue Deus multiplique sua semeadura.`,
        [{ text: 'Amem! 🙏', onPress: () => router.back() }]
      );
    }, 2500);
  }, [activatePremium, selectedPlan.name, router]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  // ─── Step 0: Escolha do Plano ────────────
  const renderPlanStep = () => (
    <View style={s.stepContent}>
      <Text style={s.stepTitle}>Escolha seu plano</Text>
      <Text style={s.stepSubtitle}>Selecione a semeadura ideal para voce</Text>

      {PLANS.map((plan) => (
        <TouchableOpacity
          key={plan.id}
          style={[
            s.planCard,
            selectedPlan.id === plan.id && s.planCardSelected,
            plan.highlight && selectedPlan.id !== plan.id && s.planCardPopular,
          ]}
          onPress={() => {
            void Haptics.selectionAsync();
            setSelectedPlan(plan);
          }}
          activeOpacity={0.8}
        >
          {plan.highlight && (
            <View style={s.popularBadge}>
              <Zap size={10} color="#FFF" />
              <Text style={s.popularBadgeText}>MAIS POPULAR</Text>
            </View>
          )}

          <View style={s.planRow}>
            <View style={[
              s.radioOuter,
              selectedPlan.id === plan.id && s.radioOuterSelected,
            ]}>
              {selectedPlan.id === plan.id && <View style={s.radioInner} />}
            </View>

            <Text style={s.planEmoji}>{plan.emoji}</Text>

            <View style={s.planInfo}>
              <Text style={[
                s.planName,
                selectedPlan.id === plan.id && s.planNameSelected,
              ]}>{plan.name}</Text>
              <Text style={s.planTagline}>{plan.tagline}</Text>
            </View>

            <View style={s.planPriceCol}>
              <Text style={[
                s.planPrice,
                selectedPlan.id === plan.id && s.planPriceSelected,
              ]}>{plan.priceDisplay}</Text>
              <Text style={s.planPeriod}>{plan.period}</Text>
            </View>
          </View>

          {selectedPlan.id === plan.id && (
            <View style={s.planFeatures}>
              {plan.features.map((feat) => (
                <View key={feat} style={s.featureRow}>
                  <Check size={14} color="#8b5cf6" />
                  <Text style={s.featureText}>{feat}</Text>
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>
      ))}

      <View style={s.guaranteeBox}>
        <Shield size={18} color="#22C55E" />
        <Text style={s.guaranteeText}>7 dias gratis para testar. Cancele quando quiser.</Text>
      </View>
    </View>
  );

  // ─── Step 1: Dados Pessoais ──────────────
  const renderDataStep = () => (
    <View style={s.stepContent}>
      <Text style={s.stepTitle}>Seus dados</Text>
      <Text style={s.stepSubtitle}>Precisamos de algumas informacoes</Text>

      <View style={s.inputGroup}>
        <Text style={s.inputLabel}>Nome completo</Text>
        <TextInput
          style={s.input}
          value={formData.name}
          onChangeText={(v) => updateField('name', v)}
          placeholder="Seu nome completo"
          placeholderTextColor="#666"
          autoCapitalize="words"
        />
      </View>

      <View style={s.inputGroup}>
        <Text style={s.inputLabel}>E-mail</Text>
        <TextInput
          style={s.input}
          value={formData.email}
          onChangeText={(v) => updateField('email', v)}
          placeholder="seu@email.com"
          placeholderTextColor="#666"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={s.inputRow}>
        <View style={[s.inputGroup, { flex: 1 }]}>
          <Text style={s.inputLabel}>CPF</Text>
          <TextInput
            style={s.input}
            value={formData.cpf}
            onChangeText={(v) => updateField('cpf', formatCPF(v))}
            placeholder="000.000.000-00"
            placeholderTextColor="#666"
            keyboardType="numeric"
          />
        </View>

        <View style={[s.inputGroup, { flex: 1 }]}>
          <Text style={s.inputLabel}>Telefone</Text>
          <TextInput
            style={s.input}
            value={formData.phone}
            onChangeText={(v) => updateField('phone', formatPhone(v))}
            placeholder="(00) 00000-0000"
            placeholderTextColor="#666"
            keyboardType="phone-pad"
          />
        </View>
      </View>

      <View style={s.securityNote}>
        <Lock size={14} color="#8b5cf6" />
        <Text style={s.securityNoteText}>Seus dados estao protegidos com criptografia</Text>
      </View>
    </View>
  );

  // ─── Step 2: Pagamento ───────────────────
  const renderPaymentStep = () => (
    <View style={s.stepContent}>
      <Text style={s.stepTitle}>Forma de pagamento</Text>
      <Text style={s.stepSubtitle}>Escolha como deseja pagar</Text>

      {/* Payment Method Selection */}
      <View style={s.paymentMethods}>
        <TouchableOpacity
          style={[s.paymentMethodCard, paymentMethod === 'pix' && s.paymentMethodSelected]}
          onPress={() => { void Haptics.selectionAsync(); setPaymentMethod('pix'); }}
        >
          <QrCode size={24} color={paymentMethod === 'pix' ? '#8b5cf6' : '#888'} />
          <Text style={[s.paymentMethodText, paymentMethod === 'pix' && s.paymentMethodTextSelected]}>PIX</Text>
          {paymentMethod === 'pix' && (
            <View style={s.discountBadge}>
              <Text style={s.discountBadgeText}>-5%</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.paymentMethodCard, paymentMethod === 'card' && s.paymentMethodSelected]}
          onPress={() => { void Haptics.selectionAsync(); setPaymentMethod('card'); }}
        >
          <CreditCard size={24} color={paymentMethod === 'card' ? '#8b5cf6' : '#888'} />
          <Text style={[s.paymentMethodText, paymentMethod === 'card' && s.paymentMethodTextSelected]}>Cartao</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.paymentMethodCard, paymentMethod === 'boleto' && s.paymentMethodSelected]}
          onPress={() => { void Haptics.selectionAsync(); setPaymentMethod('boleto'); }}
        >
          <FileText size={24} color={paymentMethod === 'boleto' ? '#8b5cf6' : '#888'} />
          <Text style={[s.paymentMethodText, paymentMethod === 'boleto' && s.paymentMethodTextSelected]}>Boleto</Text>
        </TouchableOpacity>
      </View>

      {/* PIX */}
      {paymentMethod === 'pix' && (
        <View style={s.pixContainer}>
          <View style={s.pixQrPlaceholder}>
            <QrCode size={80} color="#8b5cf6" />
            <Text style={s.pixQrLabel}>QR Code PIX</Text>
          </View>
          <Text style={s.pixInstruction}>
            Escaneie o QR Code ou copie o codigo para pagar
          </Text>
          <TouchableOpacity style={s.pixCopyBtn} onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert('Copiado!', 'Codigo PIX copiado para a area de transferencia');
          }}>
            <Copy size={16} color="#8b5cf6" />
            <Text style={s.pixCopyText}>Copiar codigo PIX</Text>
          </TouchableOpacity>
          <View style={s.pixDiscountNote}>
            <Sparkles size={14} color="#22C55E" />
            <Text style={s.pixDiscountText}>
              Voce economiza R$ {(selectedPlan.price * 0.05).toFixed(2).replace('.', ',')} pagando com PIX!
            </Text>
          </View>
        </View>
      )}

      {/* Cartao */}
      {paymentMethod === 'card' && (
        <View style={s.cardForm}>
          <View style={s.inputGroup}>
            <Text style={s.inputLabel}>Numero do cartao</Text>
            <TextInput
              style={s.input}
              value={formData.cardNumber}
              onChangeText={(v) => updateField('cardNumber', formatCardNumber(v))}
              placeholder="0000 0000 0000 0000"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
          </View>

          <View style={s.inputGroup}>
            <Text style={s.inputLabel}>Nome no cartao</Text>
            <TextInput
              style={s.input}
              value={formData.cardName}
              onChangeText={(v) => updateField('cardName', v)}
              placeholder="Como esta no cartao"
              placeholderTextColor="#666"
              autoCapitalize="characters"
            />
          </View>

          <View style={s.inputRow}>
            <View style={[s.inputGroup, { flex: 1 }]}>
              <Text style={s.inputLabel}>Validade</Text>
              <TextInput
                style={s.input}
                value={formData.cardExpiry}
                onChangeText={(v) => updateField('cardExpiry', formatExpiry(v))}
                placeholder="MM/AA"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
            </View>
            <View style={[s.inputGroup, { flex: 1 }]}>
              <Text style={s.inputLabel}>CVV</Text>
              <TextInput
                style={s.input}
                value={formData.cardCvv}
                onChangeText={(v) => updateField('cardCvv', v.replace(/\D/g, '').slice(0, 4))}
                placeholder="000"
                placeholderTextColor="#666"
                keyboardType="numeric"
                secureTextEntry
              />
            </View>
          </View>
        </View>
      )}

      {/* Boleto */}
      {paymentMethod === 'boleto' && (
        <View style={s.boletoContainer}>
          <FileText size={48} color="#8b5cf6" />
          <Text style={s.boletoTitle}>Boleto Bancario</Text>
          <Text style={s.boletoText}>
            O boleto sera gerado apos a confirmacao.{'\n'}
            Prazo de compensacao: 1 a 3 dias uteis.
          </Text>
          <View style={s.boletoWarning}>
            <Clock size={14} color="#FF9500" />
            <Text style={s.boletoWarningText}>
              Seu acesso sera liberado apos a confirmacao do pagamento
            </Text>
          </View>
        </View>
      )}

      <View style={s.securityBadges}>
        <View style={s.securityBadge}>
          <Shield size={14} color="#22C55E" />
          <Text style={s.securityBadgeText}>Compra segura</Text>
        </View>
        <View style={s.securityBadge}>
          <Lock size={14} color="#22C55E" />
          <Text style={s.securityBadgeText}>SSL 256-bit</Text>
        </View>
      </View>
    </View>
  );

  // ─── Step 3: Confirmacao ─────────────────
  const renderConfirmationStep = () => {
    const pixDiscount = paymentMethod === 'pix' ? selectedPlan.price * 0.05 : 0;
    const finalPrice = selectedPlan.price - pixDiscount;

    return (
      <View style={s.stepContent}>
        <Text style={s.stepTitle}>Confirme seu pedido</Text>
        <Text style={s.stepSubtitle}>Revise os dados antes de finalizar</Text>

        {/* Resumo do pedido */}
        <View style={s.orderSummary}>
          <Text style={s.orderSummaryTitle}>Resumo do pedido</Text>

          <View style={s.orderRow}>
            <Text style={s.orderLabel}>Plano {selectedPlan.emoji} {selectedPlan.name}</Text>
            <Text style={s.orderValue}>{selectedPlan.priceDisplay}</Text>
          </View>

          {pixDiscount > 0 && (
            <View style={s.orderRow}>
              <Text style={s.orderLabelDiscount}>Desconto PIX (5%)</Text>
              <Text style={s.orderValueDiscount}>- R$ {pixDiscount.toFixed(2).replace('.', ',')}</Text>
            </View>
          )}

          <View style={s.orderDivider} />

          <View style={s.orderRow}>
            <Text style={s.orderTotal}>Total</Text>
            <Text style={s.orderTotalValue}>R$ {finalPrice.toFixed(2).replace('.', ',')}</Text>
          </View>

          <Text style={s.orderPeriodNote}>Cobrado mensalmente</Text>
        </View>

        {/* Dados do comprador */}
        <View style={s.confirmSection}>
          <Text style={s.confirmSectionTitle}>Dados pessoais</Text>
          <Text style={s.confirmDetail}>{formData.name}</Text>
          <Text style={s.confirmDetail}>{formData.email}</Text>
          <Text style={s.confirmDetail}>CPF: {formData.cpf}</Text>
        </View>

        {/* Forma de pagamento */}
        <View style={s.confirmSection}>
          <Text style={s.confirmSectionTitle}>Pagamento</Text>
          <View style={s.confirmPaymentRow}>
            {paymentMethod === 'pix' && <QrCode size={18} color="#8b5cf6" />}
            {paymentMethod === 'card' && <CreditCard size={18} color="#8b5cf6" />}
            {paymentMethod === 'boleto' && <FileText size={18} color="#8b5cf6" />}
            <Text style={s.confirmDetail}>
              {paymentMethod === 'pix' ? 'PIX' : paymentMethod === 'card' ? `Cartao **** ${formData.cardNumber.slice(-4)}` : 'Boleto Bancario'}
            </Text>
          </View>
        </View>

        {/* Trial */}
        <View style={s.trialNote}>
          <Heart size={16} color="#8b5cf6" fill="#8b5cf6" />
          <Text style={s.trialNoteText}>
            Voce tera 7 dias gratis para testar.{'\n'}
            A cobranca so ocorre apos o periodo de teste.
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={s.container}>
      <SafeAreaView style={s.safeArea} edges={['top']}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.headerBackBtn} onPress={() => {
            if (currentStep > 0) handleBack();
            else router.back();
          }}>
            {currentStep > 0 ? (
              <ChevronLeft size={22} color="#FFF" />
            ) : (
              <X size={22} color="#FFF" />
            )}
          </TouchableOpacity>

          <View style={s.headerCenter}>
            <Lock size={14} color="#22C55E" />
            <Text style={s.headerTitle}>Checkout Seguro</Text>
          </View>

          {/* Timer */}
          <View style={s.timerBadge}>
            <Clock size={12} color="#FF6B35" />
            <Text style={s.timerText}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={s.progressContainer}>
          <View style={s.progressBar}>
            <Animated.View style={[s.progressFill, { width: progressWidth }]} />
          </View>
          <View style={s.stepsRow}>
            {STEPS.map((step, i) => (
              <View key={step} style={s.stepIndicator}>
                <View style={[
                  s.stepDot,
                  i <= currentStep && s.stepDotActive,
                  i < currentStep && s.stepDotCompleted,
                ]}>
                  {i < currentStep ? (
                    <Check size={10} color="#FFF" />
                  ) : (
                    <Text style={[
                      s.stepDotText,
                      i <= currentStep && s.stepDotTextActive,
                    ]}>{i + 1}</Text>
                  )}
                </View>
                <Text style={[
                  s.stepLabel,
                  i <= currentStep && s.stepLabelActive,
                ]}>{step}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Content */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}>
              {currentStep === 0 && renderPlanStep()}
              {currentStep === 1 && renderDataStep()}
              {currentStep === 2 && renderPaymentStep()}
              {currentStep === 3 && renderConfirmationStep()}
            </Animated.View>

            {/* Order Summary Mini (steps 1-2) */}
            {(currentStep === 1 || currentStep === 2) && (
              <View style={s.miniSummary}>
                <Text style={s.miniSummaryEmoji}>{selectedPlan.emoji}</Text>
                <View style={s.miniSummaryInfo}>
                  <Text style={s.miniSummaryName}>Plano {selectedPlan.name}</Text>
                  <Text style={s.miniSummaryPrice}>{selectedPlan.priceDisplay}{selectedPlan.period}</Text>
                </View>
                <TouchableOpacity onPress={() => animateStep(0)}>
                  <Text style={s.miniSummaryChange}>Alterar</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Social Proof */}
            {currentStep === 0 && (
              <View style={s.socialProof}>
                <View style={s.socialProofRow}>
                  <Users size={14} color="#8b5cf6" />
                  <Text style={s.socialProofText}>15.847 semeadores ativos</Text>
                </View>
                <View style={s.socialProofRow}>
                  <Star size={14} color="#8b5cf6" fill="#8b5cf6" />
                  <Text style={s.socialProofText}>4.9 estrelas (2.341 avaliacoes)</Text>
                </View>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Bottom CTA */}
        <View style={s.bottomBar}>
          {currentStep < STEPS.length - 1 ? (
            <TouchableOpacity style={s.ctaButton} onPress={handleNext} activeOpacity={0.85}>
              <Text style={s.ctaText}>
                {currentStep === 0 ? 'Continuar' : currentStep === 1 ? 'Ir para pagamento' : 'Revisar pedido'}
              </Text>
              <ChevronRight size={20} color="#FFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[s.ctaButton, s.ctaButtonFinal]}
              onPress={handleFinalize}
              activeOpacity={0.85}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <CheckCircle size={20} color="#FFF" />
                  <Text style={s.ctaText}>Finalizar pedido</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          <View style={s.bottomSecure}>
            <Lock size={12} color="#666" />
            <Text style={s.bottomSecureText}>Ambiente 100% seguro</Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

// ─── Estilos ───────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  safeArea: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  headerBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,107,53,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  timerText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FF6B35',
    fontVariant: ['tabular-nums'],
  },

  // Progress
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  progressBar: {
    height: 3,
    backgroundColor: '#1A1A1A',
    borderRadius: 2,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 2,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepIndicator: {
    alignItems: 'center',
    gap: 4,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: {
    borderColor: '#8b5cf6',
    backgroundColor: '#8b5cf620',
  },
  stepDotCompleted: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  stepDotText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#666',
  },
  stepDotTextActive: {
    color: '#8b5cf6',
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#555',
  },
  stepLabelActive: {
    color: '#8b5cf6',
  },

  // Scroll
  scrollContent: {
    padding: 20,
    paddingBottom: 24,
  },

  // Step Content
  stepContent: {
    gap: 12,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.3,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },

  // Plan Cards
  planCard: {
    backgroundColor: '#111',
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: '#1A1A1A',
  },
  planCardSelected: {
    borderColor: '#8b5cf6',
    backgroundColor: '#8b5cf615',
  },
  planCardPopular: {
    borderColor: '#8b5cf640',
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#8b5cf6',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#8b5cf6',
  },
  planEmoji: { fontSize: 26 },
  planInfo: { flex: 1 },
  planName: { fontSize: 16, fontWeight: '700', color: '#CCC' },
  planNameSelected: { color: '#FFF' },
  planTagline: { fontSize: 11, color: '#666', marginTop: 2 },
  planPriceCol: { alignItems: 'flex-end' },
  planPrice: { fontSize: 20, fontWeight: '900', color: '#AAA' },
  planPriceSelected: { color: '#8b5cf6' },
  planPeriod: { fontSize: 11, color: '#666' },
  planFeatures: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
    gap: 8,
  },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { fontSize: 13, color: '#BBB', flex: 1 },

  guaranteeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#22C55E10',
    borderWidth: 1,
    borderColor: '#22C55E30',
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
  },
  guaranteeText: {
    fontSize: 13,
    color: '#22C55E',
    fontWeight: '600',
    flex: 1,
  },

  // Inputs
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#AAA',
  },
  input: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#FFF',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  securityNoteText: {
    fontSize: 12,
    color: '#8b5cf6',
  },

  // Payment Methods
  paymentMethods: {
    flexDirection: 'row',
    gap: 10,
  },
  paymentMethodCard: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: '#1A1A1A',
  },
  paymentMethodSelected: {
    borderColor: '#8b5cf6',
    backgroundColor: '#8b5cf610',
  },
  paymentMethodText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
  },
  paymentMethodTextSelected: {
    color: '#8b5cf6',
  },
  discountBadge: {
    position: 'absolute',
    top: -8,
    right: -4,
    backgroundColor: '#22C55E',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFF',
  },

  // PIX
  pixContainer: {
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  pixQrPlaceholder: {
    width: 180,
    height: 180,
    backgroundColor: '#FFF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  pixQrLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  pixInstruction: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
  },
  pixCopyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#8b5cf615',
    borderWidth: 1,
    borderColor: '#8b5cf640',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  pixCopyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  pixDiscountNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#22C55E10',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  pixDiscountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22C55E',
  },

  // Card Form
  cardForm: {
    gap: 12,
    marginTop: 4,
  },

  // Boleto
  boletoContainer: {
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 24,
    marginTop: 4,
  },
  boletoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  boletoText: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
  boletoWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FF950015',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 4,
  },
  boletoWarningText: {
    fontSize: 12,
    color: '#FF9500',
    flex: 1,
  },

  // Security Badges
  securityBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 8,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  securityBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#22C55E',
  },

  // Confirmation
  orderSummary: {
    backgroundColor: '#111',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  orderSummaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 14,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderLabel: { fontSize: 14, color: '#BBB' },
  orderValue: { fontSize: 14, color: '#BBB', fontWeight: '600' },
  orderLabelDiscount: { fontSize: 13, color: '#22C55E' },
  orderValueDiscount: { fontSize: 13, color: '#22C55E', fontWeight: '600' },
  orderDivider: {
    height: 1,
    backgroundColor: '#1A1A1A',
    marginVertical: 8,
  },
  orderTotal: { fontSize: 17, fontWeight: '800', color: '#FFF' },
  orderTotalValue: { fontSize: 20, fontWeight: '900', color: '#8b5cf6' },
  orderPeriodNote: {
    fontSize: 11,
    color: '#666',
    textAlign: 'right',
    marginTop: -4,
  },
  confirmSection: {
    backgroundColor: '#111',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1A1A1A',
    gap: 6,
  },
  confirmSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8b5cf6',
    marginBottom: 4,
  },
  confirmDetail: { fontSize: 14, color: '#BBB' },
  confirmPaymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trialNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#8b5cf610',
    borderWidth: 1,
    borderColor: '#8b5cf630',
    borderRadius: 14,
    padding: 16,
  },
  trialNoteText: {
    fontSize: 13,
    color: '#c4b5fd',
    flex: 1,
    lineHeight: 20,
  },

  // Mini Summary
  miniSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  miniSummaryEmoji: { fontSize: 24 },
  miniSummaryInfo: { flex: 1 },
  miniSummaryName: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  miniSummaryPrice: { fontSize: 12, color: '#888' },
  miniSummaryChange: { fontSize: 13, fontWeight: '600', color: '#8b5cf6' },

  // Social Proof
  socialProof: {
    marginTop: 16,
    gap: 8,
  },
  socialProofRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  socialProofText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
  },

  // Bottom Bar
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
    gap: 8,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#8b5cf6',
    paddingVertical: 16,
    borderRadius: 14,
  },
  ctaButtonFinal: {
    backgroundColor: '#22C55E',
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
  },
  bottomSecure: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  bottomSecureText: {
    fontSize: 11,
    color: '#555',
  },
});
