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
import { X, Check, Sparkles, Crown, Heart, Star, Users, Zap, ImageIcon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';

const PLANS = [
  {
    id: 'semente' as const,
    name: 'Semente',
    emoji: '🌱',
    price: 'R$4,90',
    period: '/mes',
    tagline: 'Plante a primeira semente',
    highlight: false,
    features: [
      'Chat ilimitado com Gabriel',
      'Geracao de conteudo (texto)',
      'Planos de estudo basicos',
      'Devocional diario',
      'Versiculo personalizado',
    ],
  },
  {
    id: 'dizimo' as const,
    name: 'Dizimo',
    emoji: '💜',
    price: 'R$9,90',
    period: '/mes',
    tagline: 'Mais popular — Tudo liberado',
    highlight: true,
    features: [
      'Tudo do plano Semente',
      'Vigilia IA 21 dias',
      'Palavra Profetica ilimitada',
      'Gerador de hashtags',
      'Calendario de conteudo 30 dias',
      'Bio otimizada para conversao',
      'Todos os planos de estudo',
      'Metas espirituais avancadas',
    ],
  },
  {
    id: 'oferta' as const,
    name: 'Oferta',
    emoji: '👑',
    price: 'R$19,90',
    period: '/mes',
    tagline: 'Para quem quer semear em abundancia',
    highlight: false,
    features: [
      'Tudo do plano Dizimo',
      'Gerador de imagens IA ilimitado',
      'Estilos exclusivos de cards',
      'Suporte prioritario',
      'Novidades em primeira mao',
    ],
  },
];

const TESTIMONIALS = [
  { name: 'Maria S.', text: 'O Gabriel mudou minha vida devocional. Parece que tenho um pastor 24h!', stars: 5 },
  { name: 'Joao P.', text: 'Minhas legendas cristaas passaram de 50 para 500+ curtidas!', stars: 5 },
  { name: 'Ana R.', text: 'A Vigilia de 21 dias foi a experiencia mais profunda da minha fe.', stars: 5 },
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

  const handleSubscribe = (planId: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: '/checkout', params: { planId } });
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
              <Sparkles size={16} color="#8b5cf6" />
              <Sparkles size={12} color="#8b5cf6" style={{ marginTop: -20 }} />
              <Sparkles size={16} color="#8b5cf6" />
            </Animated.View>

            <View style={styles.crownIcon}>
              <Heart size={36} color="#8b5cf6" fill="#8b5cf6" />
            </View>

            <Text style={styles.headline}>Semeie na obra{'\n'}e colha bencaros</Text>
            <Text style={styles.subheadline}>
              Sua contribuicao sustenta este ministerio e desbloqueia{'\n'}todo o poder do seu guia espiritual
            </Text>

            <View style={styles.socialProofBar}>
              <Users size={14} color="#8b5cf6" />
              <Text style={styles.socialProofText}>15.847 semeadores ativos</Text>
              <View style={styles.socialProofDot} />
              <Star size={14} color="#8b5cf6" fill="#8b5cf6" />
              <Text style={styles.socialProofText}>4.9 estrelas</Text>
            </View>

            <Text style={styles.sectionTitle}>Escolha sua semeadura</Text>

            {PLANS.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  plan.highlight && styles.planCardHighlight,
                ]}
                onPress={() => handleSubscribe(plan.id)}
                activeOpacity={0.8}
              >
                {plan.highlight && (
                  <View style={styles.planBadge}>
                    <Zap size={10} color="#0A0A0A" />
                    <Text style={styles.planBadgeText}>{plan.tagline}</Text>
                  </View>
                )}

                <View style={styles.planHeader}>
                  <Text style={styles.planEmoji}>{plan.emoji}</Text>
                  <View style={styles.planNameCol}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    {!plan.highlight && (
                      <Text style={styles.planTagline}>{plan.tagline}</Text>
                    )}
                  </View>
                  <View style={styles.planPriceCol}>
                    <Text style={[styles.planPrice, plan.highlight && styles.planPriceHighlight]}>
                      {plan.price}
                    </Text>
                    <Text style={styles.planPeriod}>{plan.period}</Text>
                  </View>
                </View>

                <View style={styles.planFeatures}>
                  {plan.features.map((feat) => (
                    <View key={feat} style={styles.planFeatureRow}>
                      <Check size={14} color={plan.highlight ? '#8b5cf6' : '#34C759'} />
                      <Text style={styles.planFeatureText}>{feat}</Text>
                    </View>
                  ))}
                </View>

                <View style={[styles.planCta, plan.highlight && styles.planCtaHighlight]}>
                  <Text style={[styles.planCtaText, plan.highlight && styles.planCtaTextHighlight]}>
                    {plan.highlight ? 'Semear agora — 7 dias gratis' : `Escolher ${plan.name}`}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}

            <View style={styles.testimonialsContainer}>
              <Text style={styles.testimonialsTitle}>O que dizem nossos semeadores</Text>
              {TESTIMONIALS.map((t) => (
                <View key={t.name} style={styles.testimonialCard}>
                  <View style={styles.testimonialStars}>
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} size={12} color="#8b5cf6" fill="#8b5cf6" />
                    ))}
                  </View>
                  <Text style={styles.testimonialText}>"{t.text}"</Text>
                  <Text style={styles.testimonialName}>— {t.name}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.verseText}>
              "Quem semeia com generosidade, com generosidade colhera"
            </Text>
            <Text style={styles.verseRef}>2 Corintios 9:6</Text>

            <Text style={styles.disclaimer}>
              Cancele quando quiser. Sem compromisso. Sem pegadinhas.
            </Text>
            <Text style={styles.disclaimerSmall}>
              A cobranca sera feita apos o periodo de teste gratuito de 7 dias.{'\n'}
              Renovacao automatica. Cancele a qualquer momento nas configuracoes.
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
    backgroundColor: '#8b5cf6' + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#8b5cf6' + '40',
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
    fontSize: 14,
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
    backgroundColor: '#8b5cf6' + '10',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  socialProofText: { fontSize: 12, fontWeight: '600' as const, color: '#8b5cf6' },
  socialProofDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#8b5cf6' + '50' },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textAlign: 'center' as const,
    marginBottom: 16,
  },
  planCard: {
    width: '100%',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  planCardHighlight: {
    backgroundColor: '#8b5cf6' + '15',
    borderWidth: 2,
    borderColor: '#8b5cf6',
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 4,
    backgroundColor: '#8b5cf6',
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
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  planEmoji: { fontSize: 28 },
  planNameCol: { flex: 1 },
  planName: { fontSize: 18, fontWeight: '800' as const, color: '#FFFFFF' },
  planTagline: { fontSize: 12, color: '#888', marginTop: 2 },
  planPriceCol: { alignItems: 'flex-end' },
  planPrice: { fontSize: 24, fontWeight: '900' as const, color: '#FFFFFF' },
  planPriceHighlight: { color: '#8b5cf6' },
  planPeriod: { fontSize: 12, color: '#888' },
  planFeatures: { gap: 8, marginBottom: 14 },
  planFeatureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  planFeatureText: { fontSize: 13, color: '#CCCCCC', flex: 1 },
  planCta: {
    backgroundColor: '#2A2A2A',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  planCtaHighlight: { backgroundColor: '#8b5cf6' },
  planCtaText: { fontSize: 14, fontWeight: '700' as const, color: '#FFFFFF' },
  planCtaTextHighlight: { color: '#0A0A0A' },
  testimonialsContainer: { width: '100%', marginTop: 12, marginBottom: 20 },
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
  verseText: {
    fontSize: 15,
    color: '#8b5cf6',
    textAlign: 'center' as const,
    fontStyle: 'italic' as const,
    marginBottom: 4,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  verseRef: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center' as const,
    marginBottom: 20,
    fontWeight: '600' as const,
  },
  disclaimer: { fontSize: 14, color: '#888', textAlign: 'center' as const, marginBottom: 4 },
  disclaimerSmall: { fontSize: 12, color: '#555', textAlign: 'center' as const, lineHeight: 18 },
});
