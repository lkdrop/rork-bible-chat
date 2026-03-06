import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Check, Sparkles, Crown, Zap, Star, Users } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';

const PREMIUM_FEATURES = [
  { emoji: '💬', text: 'Chat ilimitado com Gabriel, seu guia espiritual' },
  { emoji: '🔥', text: 'Vigília IA 21 dias — transformação completa' },
  { emoji: '✨', text: 'Palavra Profética diária ilimitada' },
  { emoji: '📸', text: 'Criação de conteúdo ilimitada para redes' },
  { emoji: '#️⃣', text: 'Gerador de hashtags estratégicas' },
  { emoji: '📅', text: 'Calendário de conteúdo de 30 dias' },
  { emoji: '✍️', text: 'Bio profissional otimizada para conversão' },
  { emoji: '📖', text: 'Todos os planos de estudo premium' },
  { emoji: '🔊', text: 'Modo áudio em orações e devocionais' },
  { emoji: '🎯', text: 'Metas espirituais avançadas' },
];

const TESTIMONIALS = [
  { name: 'Maria S.', text: 'O Gabriel mudou minha vida devocional. Parece que tenho um pastor 24h!', stars: 5 },
  { name: 'João P.', text: 'Minhas legendas cristãs passaram de 50 para 500+ curtidas. Inacreditável!', stars: 5 },
  { name: 'Ana R.', text: 'A Vigília de 21 dias foi a experiência mais profunda da minha fé.', stars: 5 },
];

export default function PaywallScreen() {
  const router = useRouter();
  const { activatePremium } = useApp();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const starAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();

    const starLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(starAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(starAnim, { toValue: 0.4, duration: 2000, useNativeDriver: true }),
      ])
    );
    starLoop.start();
    return () => starLoop.stop();
  }, [fadeAnim, slideAnim, starAnim]);

  const handleSubscribe = (plan: 'monthly' | 'yearly') => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    activatePremium();
    Alert.alert(
      'Premium Ativado! 🎉',
      plan === 'yearly'
        ? 'Seu plano anual foi ativado. Bem-vindo à família Premium!'
        : 'Seu plano mensal foi ativado. Bem-vindo à família Premium!',
      [{ text: 'Amém! 🙏', onPress: () => router.back() }]
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <X size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Animated.View style={[styles.iconRow, { opacity: starAnim }]}>
              <Sparkles size={16} color="#C9922A" />
              <Sparkles size={12} color="#C9922A" style={{ marginTop: -20 }} />
              <Sparkles size={16} color="#C9922A" />
            </Animated.View>

            <View style={styles.crownIcon}>
              <Crown size={36} color="#C9922A" fill="#C9922A" />
            </View>

            <Text style={styles.headline}>Transforme sua vida{'\n'}espiritual para sempre</Text>
            <Text style={styles.subheadline}>
              Junte-se a +15.000 cristãos que já aprofundaram sua fé com o Bíblia IA Premium
            </Text>

            <View style={styles.socialProofBar}>
              <Users size={14} color="#C9922A" />
              <Text style={styles.socialProofText}>15.847 assinantes ativos</Text>
              <View style={styles.socialProofDot} />
              <Star size={14} color="#C9922A" fill="#C9922A" />
              <Text style={styles.socialProofText}>4.9 estrelas</Text>
            </View>

            <View style={styles.featuresContainer}>
              {PREMIUM_FEATURES.map((feat) => (
                <View key={feat.text} style={styles.featureRow}>
                  <Text style={styles.featureEmoji}>{feat.emoji}</Text>
                  <Text style={styles.featureText}>{feat.text}</Text>
                  <Check size={16} color="#34C759" />
                </View>
              ))}
            </View>

            <View style={styles.testimonialsContainer}>
              <Text style={styles.testimonialsTitle}>O que dizem nossos membros</Text>
              {TESTIMONIALS.map((t) => (
                <View key={t.name} style={styles.testimonialCard}>
                  <View style={styles.testimonialStars}>
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} size={12} color="#C9922A" fill="#C9922A" />
                    ))}
                  </View>
                  <Text style={styles.testimonialText}>"{t.text}"</Text>
                  <Text style={styles.testimonialName}>— {t.name}</Text>
                </View>
              ))}
            </View>

            <View style={styles.plansContainer}>
              <TouchableOpacity
                style={styles.planCardYearly}
                onPress={() => handleSubscribe('yearly')}
                activeOpacity={0.8}
              >
                <View style={styles.planBadge}>
                  <Zap size={10} color="#0A0A0A" />
                  <Text style={styles.planBadgeText}>Mais escolhido — 60% OFF</Text>
                </View>
                <Text style={styles.planTitle}>Plano Anual</Text>
                <View style={styles.planPriceRow}>
                  <Text style={styles.planPriceOld}>R$239</Text>
                  <Text style={styles.planPrice}>R$97</Text>
                  <Text style={styles.planPeriod}>/ano</Text>
                </View>
                <Text style={styles.planWeekly}>Apenas R$1,86 por semana</Text>
                <Text style={styles.planSaving}>Economize R$142 por ano</Text>
                <View style={styles.planCta}>
                  <Text style={styles.planCtaText}>Começar agora — 7 dias grátis</Text>
                </View>
                <Text style={styles.planGuarantee}>Garantia de 7 dias ou seu dinheiro de volta</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.planCardMonthly}
                onPress={() => handleSubscribe('monthly')}
                activeOpacity={0.8}
              >
                <Text style={styles.planTitleMonthly}>Plano Mensal</Text>
                <View style={styles.planPriceRowMonthly}>
                  <Text style={styles.planPriceMonthly}>R$19,90</Text>
                  <Text style={styles.planPeriodMonthly}>/mês</Text>
                </View>
                <Text style={styles.planCtaMonthly}>Assinar mensal</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.disclaimer}>
              Cancele quando quiser. Sem compromisso. Sem pegadinhas.
            </Text>
            <Text style={styles.disclaimerSmall}>
              A cobrança será feita após o período de teste gratuito de 7 dias.{'\n'}
              Renovação automática. Cancele a qualquer momento nas configurações.
            </Text>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  safeArea: { flex: 1 },
  closeBtn: {
    position: 'absolute',
    top: 56,
    right: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: { padding: 24, paddingTop: 40, paddingBottom: 60 },
  content: { alignItems: 'center' },
  iconRow: { flexDirection: 'row', gap: 20, marginBottom: 16 },
  crownIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#C9922A' + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#C9922A' + '40',
  },
  headline: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: '#FFFFFF',
    textAlign: 'center' as const,
    lineHeight: 36,
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subheadline: {
    fontSize: 15,
    color: '#AAAAAA',
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  socialProofBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#C9922A' + '10',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  socialProofText: { fontSize: 12, fontWeight: '600' as const, color: '#C9922A' },
  socialProofDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#C9922A' + '50' },
  featuresContainer: { width: '100%', gap: 8, marginBottom: 24 },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  featureEmoji: { fontSize: 18 },
  featureText: { flex: 1, fontSize: 13, fontWeight: '600' as const, color: '#FFFFFF' },
  testimonialsContainer: { width: '100%', marginBottom: 24 },
  testimonialsTitle: { fontSize: 16, fontWeight: '700' as const, color: '#FFFFFF', textAlign: 'center' as const, marginBottom: 12 },
  testimonialCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  testimonialStars: { flexDirection: 'row', gap: 2, marginBottom: 6 },
  testimonialText: { fontSize: 13, color: '#CCCCCC', lineHeight: 20, fontStyle: 'italic' as const },
  testimonialName: { fontSize: 12, color: '#888', marginTop: 6, fontWeight: '600' as const },
  plansContainer: { width: '100%', gap: 12, marginBottom: 20 },
  planCardYearly: {
    backgroundColor: '#C9922A' + '15',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#C9922A',
    alignItems: 'center',
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#C9922A',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 12,
  },
  planBadgeText: { fontSize: 11, fontWeight: '800' as const, color: '#0A0A0A', textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  planTitle: { fontSize: 18, fontWeight: '700' as const, color: '#FFFFFF', marginBottom: 6 },
  planPriceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 4, gap: 8 },
  planPriceOld: { fontSize: 18, color: '#666', textDecorationLine: 'line-through' as const },
  planPrice: { fontSize: 36, fontWeight: '900' as const, color: '#C9922A' },
  planPeriod: { fontSize: 16, fontWeight: '600' as const, color: '#C9922A', marginLeft: 4 },
  planWeekly: { fontSize: 14, color: '#FFFFFF', fontWeight: '600' as const, marginBottom: 4 },
  planSaving: { fontSize: 13, fontWeight: '600' as const, color: '#34C759', marginBottom: 14 },
  planCta: {
    backgroundColor: '#C9922A',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  planCtaText: { fontSize: 15, fontWeight: '800' as const, color: '#0A0A0A' },
  planGuarantee: { fontSize: 11, color: '#888', marginTop: 8 },
  planCardMonthly: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    alignItems: 'center',
  },
  planTitleMonthly: { fontSize: 16, fontWeight: '700' as const, color: '#FFFFFF', marginBottom: 4 },
  planPriceRowMonthly: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 10 },
  planPriceMonthly: { fontSize: 24, fontWeight: '800' as const, color: '#FFFFFF' },
  planPeriodMonthly: { fontSize: 14, fontWeight: '600' as const, color: '#888', marginLeft: 4 },
  planCtaMonthly: { fontSize: 14, fontWeight: '700' as const, color: '#C9922A' },
  disclaimer: { fontSize: 14, color: '#888', textAlign: 'center' as const, marginBottom: 4 },
  disclaimerSmall: { fontSize: 12, color: '#555', textAlign: 'center' as const, lineHeight: 18 },
});
