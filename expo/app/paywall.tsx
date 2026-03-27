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
import { X, Check, Sparkles, Heart, Star, Users, Zap } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { PLANS } from '@/constants/plans';
import type { PlanId } from '@/constants/plans';

const TESTIMONIALS = [
  { name: 'Maria S.', text: 'O Gabriel mudou minha vida devocional. Parece que tenho um pastor 24h!', stars: 5 },
  { name: 'Joao P.', text: 'Minhas legendas cristaas passaram de 50 para 500+ curtidas!', stars: 5 },
  { name: 'Ana R.', text: 'A Vigilia de 21 dias foi a experiencia mais profunda da minha fe.', stars: 5 },
];

export default function PaywallScreen() {
  const router = useRouter();
  const { activatePremium, colors } = useApp();
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

  const handleSubscribe = (planId: PlanId) => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    activatePremium(planId);
    const planName = PLANS.find(p => p.id === planId)?.name || 'Premium';
    Alert.alert(
      'Premium Ativado! \u{1F389}',
      `Seu plano ${planName} foi ativado com sucesso.\nObrigado por semear! Que Deus multiplique sua oferta.`,
      [{ text: 'Amem! \u{1F64F}', onPress: () => router.back() }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <TouchableOpacity style={[styles.closeBtn, { backgroundColor: colors.border }]} onPress={() => router.back()}>
          <X size={22} color={colors.text} />
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Animated.View style={[styles.iconRow, { opacity: starAnim }]}>
              <Sparkles size={16} color="#C5943A" />
              <Sparkles size={12} color="#C5943A" style={{ marginTop: -20 }} />
              <Sparkles size={16} color="#C5943A" />
            </Animated.View>

            <View style={styles.crownIcon}>
              <Heart size={36} color="#C5943A" fill="#C5943A" />
            </View>

            <Text style={[styles.headline, { color: colors.text }]}>Semeie na obra{'\n'}e colha bencaos</Text>
            <Text style={[styles.subheadline, { color: colors.textSecondary }]}>
              Sua contribuicao sustenta este ministerio e desbloqueia{'\n'}todo o poder do seu guia espiritual
            </Text>

            <View style={styles.socialProofBar}>
              <Users size={14} color="#C5943A" />
              <Text style={styles.socialProofText}>15.847 semeadores ativos</Text>
              <View style={styles.socialProofDot} />
              <Star size={14} color="#C5943A" fill="#C5943A" />
              <Text style={styles.socialProofText}>4.9 estrelas</Text>
            </View>

            {/* O que está incluso no Gratuito */}
            <View style={[styles.freeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.freeTitle, { color: colors.text }]}>✅ Incluso no plano Gratuito</Text>
              <View style={[styles.freeFeatureRow, { borderBottomColor: colors.borderLight }]}>
                <Text style={styles.freeEmoji}>📖</Text>
                <View style={styles.freeFeatureInfo}>
                  <Text style={[styles.freeFeatureName, { color: colors.text }]}>Leitura da Bíblia</Text>
                  <Text style={[styles.freeFeatureDesc, { color: colors.textMuted }]}>Acesso completo a todas as traduções</Text>
                </View>
              </View>
              <View style={[styles.freeFeatureRow, { borderBottomColor: colors.borderLight }]}>
                <Text style={styles.freeEmoji}>🏆</Text>
                <View style={styles.freeFeatureInfo}>
                  <Text style={[styles.freeFeatureName, { color: colors.text }]}>Desafio 28 Dias</Text>
                  <Text style={[styles.freeFeatureDesc, { color: colors.textMuted }]}>Jornada completa de transformação espiritual</Text>
                </View>
              </View>
              <View style={[styles.freeFeatureRow, { borderBottomColor: colors.borderLight }]}>
                <Text style={styles.freeEmoji}>🙏</Text>
                <View style={styles.freeFeatureInfo}>
                  <Text style={[styles.freeFeatureName, { color: colors.text }]}>Oração ACTS</Text>
                  <Text style={[styles.freeFeatureDesc, { color: colors.textMuted }]}>Método guiado de oração diária</Text>
                </View>
              </View>
              <View style={[styles.freeFeatureRow, { borderBottomColor: colors.borderLight }]}>
                <Text style={styles.freeEmoji}>💬</Text>
                <View style={styles.freeFeatureInfo}>
                  <Text style={[styles.freeFeatureName, { color: colors.text }]}>Chat com Gabriel</Text>
                  <Text style={[styles.freeFeatureDesc, { color: colors.textMuted }]}>5 mensagens por dia com seu guia espiritual</Text>
                </View>
              </View>
              <View style={[styles.freeFeatureRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.freeEmoji}>🎵</Text>
                <View style={styles.freeFeatureInfo}>
                  <Text style={[styles.freeFeatureName, { color: colors.text }]}>Áudio IA</Text>
                  <Text style={[styles.freeFeatureDesc, { color: colors.textMuted }]}>2 áudios por dia com voz realista</Text>
                </View>
              </View>
            </View>

            {/* Comparativo FREE vs Premium */}
            <View style={[styles.comparisonCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.comparisonTitle, { color: colors.textMuted }]}>Seu plano atual: Gratuito</Text>
              <View style={[styles.comparisonRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.comparisonLabel, { color: colors.textSecondary }]}>Chat com Gabriel</Text>
                <Text style={[styles.comparisonValue, { color: colors.textMuted }]}>5/dia</Text>
              </View>
              <View style={[styles.comparisonRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.comparisonLabel, { color: colors.textSecondary }]}>Criacao de conteudo</Text>
                <Text style={[styles.comparisonValue, { color: colors.textMuted }]}>2/dia</Text>
              </View>
              <View style={[styles.comparisonRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.comparisonLabel, { color: colors.textSecondary }]}>Geracao de imagens IA</Text>
                <Text style={styles.comparisonValueBlocked}>Bloqueado</Text>
              </View>
              <View style={[styles.comparisonRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.comparisonLabel, { color: colors.textSecondary }]}>Audio IA (ElevenLabs)</Text>
                <Text style={[styles.comparisonValue, { color: colors.textMuted }]}>2/dia</Text>
              </View>
              <View style={[styles.comparisonRow, { borderBottomWidth: 0 }]}>
                <Text style={[styles.comparisonLabel, { color: colors.textSecondary }]}>Vigilia / Jornada</Text>
                <Text style={[styles.comparisonValue, { color: colors.textMuted }]}>3 dias</Text>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Desbloqueie tudo</Text>

            {PLANS.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  plan.highlight && styles.planCardHighlight,
                ]}
                onPress={() => handleSubscribe(plan.id)}
                activeOpacity={0.8}
              >
                {plan.highlight && (
                  <View style={styles.planBadge}>
                    <Zap size={10} color="#0A0F1E" />
                    <Text style={styles.planBadgeText}>
                      {plan.id === 'colheita' ? 'Melhor valor — Economize 44%' : 'Mais popular'}
                    </Text>
                  </View>
                )}

                {plan.id === 'colheita' && (
                  <Text style={styles.planInstallments}>12x de R$6,66</Text>
                )}

                <View style={styles.planHeader}>
                  <Text style={styles.planEmoji}>{plan.emoji}</Text>
                  <View style={styles.planNameCol}>
                    <Text style={[styles.planName, { color: colors.text }]}>{plan.name}</Text>
                    <Text style={[styles.planTagline, { color: colors.textMuted }]}>{plan.tagline}</Text>
                  </View>
                  <View style={styles.planPriceCol}>
                    <Text style={[styles.planPrice, { color: colors.text }, plan.highlight && styles.planPriceHighlight]}>
                      {plan.price}
                    </Text>
                    <Text style={[styles.planPeriod, { color: colors.textMuted }]}>{plan.period}</Text>
                  </View>
                </View>

                <View style={styles.planFeatures}>
                  {plan.features.map((feat) => (
                    <View key={feat} style={styles.planFeatureRow}>
                      <Check size={14} color={plan.highlight ? '#C5943A' : '#34C759'} />
                      <Text style={[styles.planFeatureText, { color: colors.textSecondary }]}>{feat}</Text>
                    </View>
                  ))}
                </View>

                <View style={[styles.planCta, { backgroundColor: colors.border }, plan.highlight && styles.planCtaHighlight]}>
                  <Text style={[styles.planCtaText, { color: colors.text }, plan.highlight && styles.planCtaTextHighlight]}>
                    {plan.highlight ? 'Semear agora — 7 dias gratis' : `Escolher ${plan.name}`}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}

            <View style={styles.testimonialsContainer}>
              <Text style={[styles.testimonialsTitle, { color: colors.text }]}>O que dizem nossos semeadores</Text>
              {TESTIMONIALS.map((t) => (
                <View key={t.name} style={[styles.testimonialCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.testimonialStars}>
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} size={12} color="#C5943A" fill="#C5943A" />
                    ))}
                  </View>
                  <Text style={[styles.testimonialText, { color: colors.textSecondary }]}>"{t.text}"</Text>
                  <Text style={[styles.testimonialName, { color: colors.textMuted }]}>- {t.name}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.verseText}>
              "Quem semeia com generosidade, com generosidade colhera"
            </Text>
            <Text style={[styles.verseRef, { color: colors.textMuted }]}>2 Corintios 9:6</Text>

            <Text style={[styles.disclaimer, { color: colors.textMuted }]}>
              Cancele quando quiser. Sem compromisso. Sem pegadinhas.
            </Text>
            <Text style={[styles.disclaimerSmall, { color: colors.textMuted }]}>
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
  container: { flex: 1 },
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
    backgroundColor: '#C5943A20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#C5943A40',
  },
  headline: {
    fontSize: 28,
    fontWeight: '900' as const,
    textAlign: 'center' as const,
    lineHeight: 36,
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subheadline: {
    fontSize: 14,
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  socialProofBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#C5943A10',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  socialProofText: { fontSize: 12, fontWeight: '600' as const, color: '#C5943A' },
  socialProofDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#C5943A50' },
  comparisonCard: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  comparisonTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    marginBottom: 12,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  comparisonLabel: { fontSize: 13 },
  comparisonValue: { fontSize: 13, fontWeight: '600' as const },
  comparisonValueBlocked: { fontSize: 13, color: '#EF4444', fontWeight: '700' as const },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
    marginBottom: 16,
  },
  planCard: {
    width: '100%',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
  },
  planCardHighlight: {
    backgroundColor: '#C5943A15',
    borderWidth: 2,
    borderColor: '#C5943A',
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 4,
    backgroundColor: '#C5943A',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 12,
  },
  planBadgeText: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: '#0A0F1E',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  planInstallments: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#C5943A',
    textAlign: 'center' as const,
    marginBottom: 8,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  planEmoji: { fontSize: 28 },
  planNameCol: { flex: 1 },
  planName: { fontSize: 18, fontWeight: '800' as const },
  planTagline: { fontSize: 12, marginTop: 2 },
  planPriceCol: { alignItems: 'flex-end' },
  planPrice: { fontSize: 24, fontWeight: '900' as const },
  planPriceHighlight: { color: '#C5943A' },
  planPeriod: { fontSize: 12 },
  planFeatures: { gap: 8, marginBottom: 14 },
  planFeatureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  planFeatureText: { fontSize: 13, flex: 1 },
  planCta: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  planCtaHighlight: { backgroundColor: '#C5943A' },
  planCtaText: { fontSize: 14, fontWeight: '700' as const },
  planCtaTextHighlight: { color: '#0A0F1E' },
  testimonialsContainer: { width: '100%', marginTop: 12, marginBottom: 20 },
  testimonialsTitle: { fontSize: 16, fontWeight: '700' as const, textAlign: 'center' as const, marginBottom: 12 },
  testimonialCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  testimonialStars: { flexDirection: 'row', gap: 2, marginBottom: 6 },
  testimonialText: { fontSize: 13, lineHeight: 20, fontStyle: 'italic' as const },
  testimonialName: { fontSize: 12, marginTop: 6, fontWeight: '600' as const },
  verseText: {
    fontSize: 15,
    color: '#C5943A',
    textAlign: 'center' as const,
    fontStyle: 'italic' as const,
    marginBottom: 4,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  verseRef: {
    fontSize: 12,
    textAlign: 'center' as const,
    marginBottom: 20,
    fontWeight: '600' as const,
  },
  disclaimer: { fontSize: 14, textAlign: 'center' as const, marginBottom: 4 },
  disclaimerSmall: { fontSize: 12, textAlign: 'center' as const, lineHeight: 18 },
  freeCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  freeTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  freeFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 12,
  },
  freeEmoji: {
    fontSize: 22,
    width: 32,
    textAlign: 'center',
  },
  freeFeatureInfo: {
    flex: 1,
  },
  freeFeatureName: {
    fontSize: 14,
    fontWeight: '600',
  },
  freeFeatureDesc: {
    fontSize: 12,
    marginTop: 2,
  },
});
