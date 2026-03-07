import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  Clock,
  Check,
  CreditCard,
  QrCode,
  FileText,
  ChevronDown,
  ChevronUp,
  Tag,
  Gift,
  Star,
  Zap,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';

const PLANS: Record<string, { name: string; emoji: string; price: number; priceDisplay: string; period: string; features: string[] }> = {
  semente: {
    name: 'Semente',
    emoji: '🌱',
    price: 4.90,
    priceDisplay: 'R$ 4,90',
    period: '/mês',
    features: ['Chat ilimitado com Gabriel', 'Geração de conteúdo (texto)', 'Planos de estudo básicos'],
  },
  dizimo: {
    name: 'Dízimo',
    emoji: '💜',
    price: 9.90,
    priceDisplay: 'R$ 9,90',
    period: '/mês',
    features: ['Tudo do Semente', 'Vigília IA 21 dias', 'Palavra Profética ilimitada', 'Calendário 30 dias'],
  },
  oferta: {
    name: 'Oferta',
    emoji: '👑',
    price: 19.90,
    priceDisplay: 'R$ 19,90',
    period: '/mês',
    features: ['Tudo do Dízimo', 'Imagens IA ilimitadas', 'Estilos exclusivos', 'Suporte prioritário'],
  },
};

type PaymentMethod = 'pix' | 'credit_card' | 'boleto';

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ plan?: string }>();
  const { activatePremium } = useApp();
  const selectedPlanId = (params.plan as string) || 'dizimo';
  const plan = PLANS[selectedPlanId] || PLANS.dizimo;

  // Timer
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [showCvv, setShowCvv] = useState(false);
  const [installments, setInstallments] = useState('1');

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [showCoupon, setShowCoupon] = useState(false);

  // UI
  const [loading, setLoading] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(true);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: false,
    }).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.03, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [progressAnim, pulseAnim]);

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Masks
  const maskCPF = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const maskPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 10) {
      return digits.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
    }
    return digits.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
  };

  const maskCard = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const maskExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    return digits.replace(/(\d{2})(\d)/, '$1/$2');
  };

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === 'BIBLIA10' || couponCode.toUpperCase() === 'GABRIEL') {
      setCouponApplied(true);
      setCouponDiscount(10);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Alert.alert('Cupom inválido', 'Verifique o código e tente novamente.');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const getFinalPrice = () => {
    const discount = couponApplied ? (plan.price * couponDiscount) / 100 : 0;
    return plan.price - discount;
  };

  const formatPrice = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  const getPixDiscount = () => {
    return getFinalPrice() * 0.95; // 5% discount for PIX
  };

  const handleCheckout = () => {
    // Validation
    if (!name.trim()) { Alert.alert('Atenção', 'Preencha seu nome completo.'); return; }
    if (!email.trim() || !email.includes('@')) { Alert.alert('Atenção', 'Preencha um e-mail válido.'); return; }
    if (cpf.replace(/\D/g, '').length < 11) { Alert.alert('Atenção', 'Preencha um CPF válido.'); return; }

    if (paymentMethod === 'credit_card') {
      if (cardNumber.replace(/\D/g, '').length < 16) { Alert.alert('Atenção', 'Número do cartão inválido.'); return; }
      if (!cardName.trim()) { Alert.alert('Atenção', 'Preencha o nome no cartão.'); return; }
      if (cardExpiry.replace(/\D/g, '').length < 4) { Alert.alert('Atenção', 'Data de validade inválida.'); return; }
      if (cardCvv.length < 3) { Alert.alert('Atenção', 'CVV inválido.'); return; }
    }

    setLoading(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Simulate processing
    setTimeout(() => {
      setLoading(false);
      activatePremium();
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (paymentMethod === 'pix') {
        Alert.alert(
          'PIX Gerado! ✨',
          `Escaneie o QR Code ou copie o código PIX para pagar ${formatPrice(getPixDiscount())}.\n\nSeu plano ${plan.name} será ativado automaticamente após a confirmação.`,
          [{ text: 'Entendi! 🙏', onPress: () => router.back() }]
        );
      } else if (paymentMethod === 'boleto') {
        Alert.alert(
          'Boleto Gerado! 📄',
          `Seu boleto no valor de ${formatPrice(getFinalPrice())} foi gerado.\n\nO plano ${plan.name} será ativado em até 2 dias úteis após o pagamento.`,
          [{ text: 'Entendi! 🙏', onPress: () => router.back() }]
        );
      } else {
        Alert.alert(
          'Pagamento Aprovado! 🎉',
          `Seu plano ${plan.name} foi ativado com sucesso!\nQue Deus multiplique sua semeadura.`,
          [{ text: 'Amém! 🙏', onPress: () => router.back() }]
        );
      }
    }, 2000);
  };

  const finalPrice = getFinalPrice();
  const pixPrice = getPixDiscount();

  return (
    <View style={styles.container}>
      {/* Top urgency bar */}
      <View style={styles.urgencyBar}>
        <Clock size={14} color="#FFFFFF" />
        <Text style={styles.urgencyText}>
          Oferta expira em <Text style={styles.urgencyTimer}>{formatTime(timeLeft)}</Text>
        </Text>
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={20} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Lock size={14} color="#22C55E" />
            <Text style={styles.headerTitle}>Checkout Seguro</Text>
          </View>
          <View style={styles.headerRight}>
            <ShieldCheck size={20} color="#22C55E" />
          </View>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Order Summary Card */}
            <TouchableOpacity
              style={styles.orderCard}
              activeOpacity={0.9}
              onPress={() => setShowOrderDetails(!showOrderDetails)}
            >
              <View style={styles.orderHeader}>
                <View style={styles.orderTitleRow}>
                  <Text style={styles.orderEmoji}>{plan.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.orderPlanName}>Plano {plan.name}</Text>
                    <Text style={styles.orderPlanPeriod}>Assinatura mensal</Text>
                  </View>
                  <View style={styles.orderPriceCol}>
                    <Text style={styles.orderPrice}>{plan.priceDisplay}</Text>
                    <Text style={styles.orderPricePeriod}>{plan.period}</Text>
                  </View>
                  {showOrderDetails ? (
                    <ChevronUp size={18} color="#999" />
                  ) : (
                    <ChevronDown size={18} color="#999" />
                  )}
                </View>
              </View>

              {showOrderDetails && (
                <View style={styles.orderDetails}>
                  {plan.features.map((feat) => (
                    <View key={feat} style={styles.orderFeatureRow}>
                      <Check size={14} color="#22C55E" />
                      <Text style={styles.orderFeatureText}>{feat}</Text>
                    </View>
                  ))}

                  <View style={styles.orderTrialBadge}>
                    <Gift size={14} color="#8b5cf6" />
                    <Text style={styles.orderTrialText}>7 dias grátis para testar</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>

            {/* Coupon Section */}
            <TouchableOpacity
              style={styles.couponToggle}
              onPress={() => setShowCoupon(!showCoupon)}
            >
              <Tag size={16} color="#8b5cf6" />
              <Text style={styles.couponToggleText}>
                {couponApplied ? `Cupom "${couponCode}" aplicado (-${couponDiscount}%)` : 'Tem cupom de desconto?'}
              </Text>
              {couponApplied && <Check size={16} color="#22C55E" />}
            </TouchableOpacity>

            {showCoupon && !couponApplied && (
              <View style={styles.couponRow}>
                <TextInput
                  style={styles.couponInput}
                  placeholder="Digite o cupom"
                  placeholderTextColor="#999"
                  value={couponCode}
                  onChangeText={setCouponCode}
                  autoCapitalize="characters"
                />
                <TouchableOpacity style={styles.couponBtn} onPress={applyCoupon}>
                  <Text style={styles.couponBtnText}>Aplicar</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Section: Personal Info */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepNumber}>1</Text>
                </View>
                <Text style={styles.sectionTitle}>Dados pessoais</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nome completo</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Maria da Silva"
                  placeholderTextColor="#BBB"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>E-mail</Text>
                <TextInput
                  style={styles.input}
                  placeholder="seu@email.com"
                  placeholderTextColor="#BBB"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>CPF</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="000.000.000-00"
                    placeholderTextColor="#BBB"
                    value={cpf}
                    onChangeText={(v) => setCpf(maskCPF(v))}
                    keyboardType="numeric"
                    maxLength={14}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Celular</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="(00) 00000-0000"
                    placeholderTextColor="#BBB"
                    value={phone}
                    onChangeText={(v) => setPhone(maskPhone(v))}
                    keyboardType="phone-pad"
                    maxLength={15}
                  />
                </View>
              </View>
            </View>

            {/* Section: Payment Method */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepNumber}>2</Text>
                </View>
                <Text style={styles.sectionTitle}>Forma de pagamento</Text>
              </View>

              <View style={styles.paymentMethods}>
                <TouchableOpacity
                  style={[styles.paymentMethodBtn, paymentMethod === 'pix' && styles.paymentMethodActive]}
                  onPress={() => setPaymentMethod('pix')}
                >
                  <QrCode size={20} color={paymentMethod === 'pix' ? '#8b5cf6' : '#666'} />
                  <Text style={[styles.paymentMethodText, paymentMethod === 'pix' && styles.paymentMethodTextActive]}>
                    PIX
                  </Text>
                  {paymentMethod === 'pix' && (
                    <View style={styles.pixDiscountBadge}>
                      <Text style={styles.pixDiscountText}>-5%</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.paymentMethodBtn, paymentMethod === 'credit_card' && styles.paymentMethodActive]}
                  onPress={() => setPaymentMethod('credit_card')}
                >
                  <CreditCard size={20} color={paymentMethod === 'credit_card' ? '#8b5cf6' : '#666'} />
                  <Text style={[styles.paymentMethodText, paymentMethod === 'credit_card' && styles.paymentMethodTextActive]}>
                    Cartão
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.paymentMethodBtn, paymentMethod === 'boleto' && styles.paymentMethodActive]}
                  onPress={() => setPaymentMethod('boleto')}
                >
                  <FileText size={20} color={paymentMethod === 'boleto' ? '#8b5cf6' : '#666'} />
                  <Text style={[styles.paymentMethodText, paymentMethod === 'boleto' && styles.paymentMethodTextActive]}>
                    Boleto
                  </Text>
                </TouchableOpacity>
              </View>

              {/* PIX Info */}
              {paymentMethod === 'pix' && (
                <View style={styles.pixInfo}>
                  <View style={styles.pixSavingRow}>
                    <Zap size={16} color="#22C55E" />
                    <Text style={styles.pixSavingText}>
                      Você economiza {formatPrice(finalPrice - pixPrice)} pagando com PIX!
                    </Text>
                  </View>
                  <Text style={styles.pixDescription}>
                    Após clicar em "Finalizar", um QR Code será gerado para pagamento instantâneo.
                    Seu plano é ativado na hora!
                  </Text>
                </View>
              )}

              {/* Credit Card Form */}
              {paymentMethod === 'credit_card' && (
                <View style={styles.cardForm}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Número do cartão</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0000 0000 0000 0000"
                      placeholderTextColor="#BBB"
                      value={cardNumber}
                      onChangeText={(v) => setCardNumber(maskCard(v))}
                      keyboardType="numeric"
                      maxLength={19}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Nome no cartão</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Como está impresso no cartão"
                      placeholderTextColor="#BBB"
                      value={cardName}
                      onChangeText={setCardName}
                      autoCapitalize="characters"
                    />
                  </View>

                  <View style={styles.inputRow}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>Validade</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="MM/AA"
                        placeholderTextColor="#BBB"
                        value={cardExpiry}
                        onChangeText={(v) => setCardExpiry(maskExpiry(v))}
                        keyboardType="numeric"
                        maxLength={5}
                      />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>CVV</Text>
                      <View style={styles.cvvContainer}>
                        <TextInput
                          style={[styles.input, { flex: 1, marginBottom: 0 }]}
                          placeholder="000"
                          placeholderTextColor="#BBB"
                          value={cardCvv}
                          onChangeText={(v) => setCardCvv(v.replace(/\D/g, '').slice(0, 4))}
                          keyboardType="numeric"
                          secureTextEntry={!showCvv}
                          maxLength={4}
                        />
                        <TouchableOpacity
                          style={styles.cvvToggle}
                          onPress={() => setShowCvv(!showCvv)}
                        >
                          {showCvv ? (
                            <EyeOff size={18} color="#999" />
                          ) : (
                            <Eye size={18} color="#999" />
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Parcelas</Text>
                    <View style={styles.installmentsContainer}>
                      {['1', '2', '3'].map((inst) => (
                        <TouchableOpacity
                          key={inst}
                          style={[
                            styles.installmentBtn,
                            installments === inst && styles.installmentBtnActive,
                          ]}
                          onPress={() => setInstallments(inst)}
                        >
                          <Text
                            style={[
                              styles.installmentText,
                              installments === inst && styles.installmentTextActive,
                            ]}
                          >
                            {inst}x {formatPrice(finalPrice / Number(inst))}
                          </Text>
                          {inst === '1' && (
                            <Text style={[styles.installmentSub, installments === inst && styles.installmentSubActive]}>
                              sem juros
                            </Text>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              )}

              {/* Boleto Info */}
              {paymentMethod === 'boleto' && (
                <View style={styles.boletoInfo}>
                  <Text style={styles.boletoDescription}>
                    O boleto será gerado após finalizar o pedido. O plano será ativado em até 2 dias úteis após a compensação.
                  </Text>
                </View>
              )}
            </View>

            {/* Price Summary */}
            <View style={styles.priceSummary}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Plano {plan.name}</Text>
                <Text style={styles.priceValue}>{plan.priceDisplay}</Text>
              </View>

              {couponApplied && (
                <View style={styles.priceRow}>
                  <Text style={[styles.priceLabel, { color: '#22C55E' }]}>Desconto cupom (-{couponDiscount}%)</Text>
                  <Text style={[styles.priceValue, { color: '#22C55E' }]}>
                    -{formatPrice(plan.price * couponDiscount / 100)}
                  </Text>
                </View>
              )}

              {paymentMethod === 'pix' && (
                <View style={styles.priceRow}>
                  <Text style={[styles.priceLabel, { color: '#22C55E' }]}>Desconto PIX (-5%)</Text>
                  <Text style={[styles.priceValue, { color: '#22C55E' }]}>
                    -{formatPrice(finalPrice * 0.05)}
                  </Text>
                </View>
              )}

              <View style={styles.priceDivider} />

              <View style={styles.priceRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <View style={styles.totalCol}>
                  {paymentMethod === 'pix' ? (
                    <>
                      <Text style={styles.totalOriginal}>{formatPrice(finalPrice)}</Text>
                      <Text style={styles.totalPrice}>{formatPrice(pixPrice)}</Text>
                    </>
                  ) : (
                    <Text style={styles.totalPrice}>{formatPrice(finalPrice)}</Text>
                  )}
                  <Text style={styles.totalPeriod}>{plan.period}</Text>
                </View>
              </View>
            </View>

            {/* CTA Button */}
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={[styles.ctaButton, loading && styles.ctaButtonLoading]}
                onPress={handleCheckout}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <Text style={styles.ctaText}>Processando...</Text>
                ) : (
                  <>
                    <Lock size={18} color="#FFFFFF" />
                    <Text style={styles.ctaText}>
                      {paymentMethod === 'pix'
                        ? `Pagar ${formatPrice(pixPrice)} com PIX`
                        : paymentMethod === 'boleto'
                        ? `Gerar boleto de ${formatPrice(finalPrice)}`
                        : `Pagar ${formatPrice(finalPrice)}`}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Trust badges */}
            <View style={styles.trustSection}>
              <View style={styles.trustRow}>
                <ShieldCheck size={16} color="#22C55E" />
                <Text style={styles.trustText}>Compra 100% segura</Text>
              </View>
              <View style={styles.trustRow}>
                <Lock size={16} color="#22C55E" />
                <Text style={styles.trustText}>Dados criptografados</Text>
              </View>
              <View style={styles.trustRow}>
                <Star size={16} color="#22C55E" />
                <Text style={styles.trustText}>Satisfação garantida</Text>
              </View>
            </View>

            <Text style={styles.guarantee}>
              Garantia de 7 dias. Se não gostar, devolvemos 100% do valor.
            </Text>

            <Text style={styles.disclaimer}>
              Ao finalizar, você concorda com os Termos de Uso e Política de Privacidade.
              Renovação automática. Cancele a qualquer momento.
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F8',
  },
  urgencyBar: {
    backgroundColor: '#8b5cf6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingTop: Platform.OS === 'ios' ? 50 : 8,
    gap: 8,
  },
  urgencyText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  urgencyTimer: {
    fontWeight: '800',
    fontSize: 14,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
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
    color: '#333',
  },
  headerRight: {
    width: 36,
    alignItems: 'flex-end',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // Order Summary
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  orderHeader: {},
  orderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  orderEmoji: {
    fontSize: 32,
  },
  orderPlanName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  orderPlanPeriod: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  orderPriceCol: {
    alignItems: 'flex-end',
    marginRight: 4,
  },
  orderPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#8b5cf6',
  },
  orderPricePeriod: {
    fontSize: 11,
    color: '#999',
  },
  orderDetails: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 8,
  },
  orderFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderFeatureText: {
    fontSize: 13,
    color: '#555',
    flex: 1,
  },
  orderTrialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#8b5cf6' + '10',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 6,
  },
  orderTrialText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8b5cf6',
  },

  // Coupon
  couponToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  couponToggleText: {
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: '600',
    flex: 1,
  },
  couponRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    marginTop: -4,
  },
  couponInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ECECEC',
    textTransform: 'uppercase',
  },
  couponBtn: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  couponBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // Sections
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  // Inputs
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F7F7F8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },

  // Payment Methods
  paymentMethods: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  paymentMethodBtn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ECECEC',
    backgroundColor: '#FAFAFA',
    position: 'relative',
  },
  paymentMethodActive: {
    borderColor: '#8b5cf6',
    backgroundColor: '#8b5cf6' + '08',
  },
  paymentMethodText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
  },
  paymentMethodTextActive: {
    color: '#8b5cf6',
  },
  pixDiscountBadge: {
    position: 'absolute',
    top: -8,
    right: -4,
    backgroundColor: '#22C55E',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pixDiscountText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // PIX
  pixInfo: {
    backgroundColor: '#F0FFF4',
    borderRadius: 10,
    padding: 14,
    gap: 8,
  },
  pixSavingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pixSavingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#22C55E',
  },
  pixDescription: {
    fontSize: 12,
    color: '#555',
    lineHeight: 18,
  },

  // Card Form
  cardForm: {
    gap: 0,
  },
  cvvContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cvvToggle: {
    padding: 8,
  },

  // Installments
  installmentsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  installmentBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ECECEC',
    backgroundColor: '#FAFAFA',
  },
  installmentBtnActive: {
    borderColor: '#8b5cf6',
    backgroundColor: '#8b5cf6' + '08',
  },
  installmentText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
  },
  installmentTextActive: {
    color: '#8b5cf6',
  },
  installmentSub: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  installmentSubActive: {
    color: '#8b5cf6',
  },

  // Boleto
  boletoInfo: {
    backgroundColor: '#FFF8E1',
    borderRadius: 10,
    padding: 14,
  },
  boletoDescription: {
    fontSize: 12,
    color: '#555',
    lineHeight: 18,
  },

  // Price Summary
  priceSummary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  priceDivider: {
    height: 1,
    backgroundColor: '#ECECEC',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  totalCol: {
    alignItems: 'flex-end',
  },
  totalOriginal: {
    fontSize: 13,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#8b5cf6',
  },
  totalPeriod: {
    fontSize: 11,
    color: '#999',
  },

  // CTA
  ctaButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 14,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaButtonLoading: {
    opacity: 0.7,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },

  // Trust
  trustSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trustText: {
    fontSize: 11,
    color: '#888',
    fontWeight: '600',
  },
  guarantee: {
    fontSize: 13,
    color: '#22C55E',
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 12,
  },
  disclaimer: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 20,
  },
});
