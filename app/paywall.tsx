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
import { X, Check, Sparkles, Crown, Zap } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';

const PREMIUM_FEATURES = [
  { emoji: '💬', text: 'Chat com Gabriel ilimitado' },
  { emoji: '📖', text: 'Todos os planos de estudo' },
  { emoji: '🔥', text: 'Vigília IA — 21 dias completos' },
  { emoji: '✨', text: 'Palavra Profética ilimitada' },
  { emoji: '🔊', text: 'Modo áudio nas orações' },
  { emoji: '🙏', text: 'Mural de Oração ilimitado' },
  { emoji: '📸', text: 'Geração de cards para compartilhar' },
  { emoji: '🎯', text: 'Metas espirituais avançadas' },
];

export default function PaywallScreen() {
  const router = useRouter();
  const { colors, activatePremium } = useApp();
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
    // In production, integrate with RevenueCat or Stripe
    // For now, activate premium directly for demo
    activatePremium();
    Alert.alert(
      'Premium Ativado!',
      plan === 'yearly'
        ? 'Seu plano anual foi ativado com sucesso. Aproveite todos os recursos!'
        : 'Seu plano mensal foi ativado com sucesso. Aproveite todos os recursos!',
      [{ text: 'Amém!', onPress: () => router.back() }]
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

            <Text style={styles.headline}>Aprofunde sua{'\n'}intimidade com Deus</Text>
            <Text style={styles.subheadline}>
              Desbloqueie todo o poder do Bíblia IA e transforme sua vida espiritual
            </Text>

            <View style={styles.featuresContainer}>
              {PREMIUM_FEATURES.map((feat) => (
                <View key={feat.text} style={styles.featureRow}>
                  <Text style={styles.featureEmoji}>{feat.emoji}</Text>
                  <Text style={styles.featureText}>{feat.text}</Text>
                  <Check size={16} color="#34C759" />
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
                  <Text style={styles.planBadgeText}>Mais escolhido</Text>
                </View>
                <Text style={styles.planTitle}>Plano Anual</Text>
                <View style={styles.planPriceRow}>
                  <Text style={styles.planPrice}>R$97</Text>
                  <Text style={styles.planPeriod}>/ano</Text>
                </View>
                <Text style={styles.planSaving}>Economia de R$142 (60% off)</Text>
                <View style={styles.planCta}>
                  <Text style={styles.planCtaText}>Começar agora — 7 dias grátis</Text>
                </View>
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
              Cancele quando quiser. Sem compromisso.
            </Text>
            <Text style={styles.disclaimerSmall}>
              A cobrança será feita na sua conta após o período de teste gratuito.
            </Text>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  safeArea: {
    flex: 1,
  },
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
  scrollContent: {
    padding: 24,
    paddingTop: 40,
    paddingBottom: 60,
  },
  content: {
    alignItems: 'center',
  },
  iconRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
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
    fontSize: 16,
    color: '#AAAAAA',
    textAlign: 'center' as const,
    lineHeight: 24,
    marginBottom: 28,
    paddingHorizontal: 10,
  },
  featuresContainer: {
    width: '100%',
    gap: 10,
    marginBottom: 28,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  featureEmoji: {
    fontSize: 20,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  plansContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
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
  planBadgeText: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: '#0A0A0A',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  planPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 36,
    fontWeight: '900' as const,
    color: '#C9922A',
  },
  planPeriod: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#C9922A',
    marginLeft: 4,
  },
  planSaving: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#34C759',
    marginBottom: 14,
  },
  planCta: {
    backgroundColor: '#C9922A',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  planCtaText: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: '#0A0A0A',
  },
  planCardMonthly: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    alignItems: 'center',
  },
  planTitleMonthly: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  planPriceRowMonthly: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  planPriceMonthly: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  planPeriodMonthly: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#888',
    marginLeft: 4,
  },
  planCtaMonthly: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#C9922A',
  },
  disclaimer: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center' as const,
    marginBottom: 4,
  },
  disclaimerSmall: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center' as const,
    lineHeight: 18,
  },
});
