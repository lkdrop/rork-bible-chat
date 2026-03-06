import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { PenLine, HandHeart, Target, ChevronRight, FileText } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { AppImages } from '@/constants/images';

export default function ToolsScreen() {
  const router = useRouter();
  const { state, colors } = useApp();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const tools = [
    {
      id: 'sermon-prep',
      title: 'Preparação de Sermão',
      subtitle: `${state.sermonNotes.length} esboços salvos`,
      description: 'IA ajuda a criar esboços com ilustrações e referências cruzadas.',
      icon: FileText,
      iconColor: '#10B981',
      route: '/tools/sermon-prep',
      image: AppImages.toolCards.sermon,
    },
    {
      id: 'journal',
      title: 'Diário Espiritual',
      subtitle: `${state.journalEntries.length} reflexões escritas`,
      description: 'Registre seus pensamentos, orações e momentos com Deus.',
      icon: PenLine,
      iconColor: '#8B5CF6',
      route: '/tools/journal',
      image: AppImages.toolCards.journal,
    },
    {
      id: 'prayer-wall',
      title: 'Mural de Oração',
      subtitle: `${state.prayerRequests.length} pedidos de oração`,
      description: 'Adicione seus pedidos e acompanhe as respostas.',
      icon: HandHeart,
      iconColor: '#EC4899',
      route: '/tools/prayer-wall',
      image: AppImages.toolCards.prayerWall,
    },
    {
      id: 'goals',
      title: 'Metas Espirituais',
      subtitle: `${state.spiritualGoals.length} metas ativas`,
      description: 'Defina e acompanhe metas para seu crescimento espiritual.',
      icon: Target,
      iconColor: '#F59E0B',
      route: '/tools/goals',
      image: AppImages.toolCards.goals,
    },
  ];

  const answeredPrayers = state.prayerRequests.filter(p => p.status === 'concluida' || p.status === 'gratidao').length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Ferramentas</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>Recursos para sua vida espiritual</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {answeredPrayers > 0 && (
            <View style={styles.highlightBanner}>
              <Image source={{ uri: AppImages.communityPrayer }} style={styles.highlightBg} contentFit="cover" />
              <LinearGradient
                colors={['rgba(16,185,129,0.3)', 'rgba(16,185,129,0.9)']}
                style={styles.highlightOverlay}
              >
                <Text style={styles.highlightEmoji}>🙏</Text>
                <View style={styles.highlightInfo}>
                  <Text style={styles.highlightTitle}>Orações Respondidas</Text>
                  <Text style={styles.highlightText}>
                    {answeredPrayers} {answeredPrayers === 1 ? 'oração respondida' : 'orações respondidas'}!
                  </Text>
                </View>
              </LinearGradient>
            </View>
          )}

          {tools.map((tool) => (
            <TouchableOpacity
              key={tool.id}
              style={[styles.toolCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(tool.route as never);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.toolCardInner}>
                <View style={styles.toolImageWrap}>
                  <Image source={{ uri: tool.image }} style={styles.toolImage} contentFit="cover" />
                  <View style={[styles.toolIconOverlay, { backgroundColor: tool.iconColor + '90' }]}>
                    <tool.icon size={20} color="#FFF" />
                  </View>
                </View>
                <View style={styles.toolContent}>
                  <Text style={[styles.toolTitle, { color: colors.text }]}>{tool.title}</Text>
                  <Text style={[styles.toolSubtitle, { color: colors.textMuted }]}>{tool.subtitle}</Text>
                  <Text style={[styles.toolDescription, { color: colors.textSecondary }]} numberOfLines={2}>{tool.description}</Text>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
          ))}

          <View style={styles.tipCard}>
            <Image source={{ uri: AppImages.candleLight }} style={styles.tipBg} contentFit="cover" />
            <LinearGradient
              colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.85)']}
              style={styles.tipOverlay}
            >
              <Text style={styles.tipTitle}>Dica do Dia</Text>
              <Text style={styles.tipText}>
                Use o modo "Prep. Sermão" no Chat IA para gerar esboços completos com ilustrações e referências cruzadas!
              </Text>
            </LinearGradient>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, marginTop: 4 },
  content: { padding: 20, paddingTop: 0, paddingBottom: 40 },
  highlightBanner: {
    height: 90,
    borderRadius: 16,
    overflow: 'hidden' as const,
    marginBottom: 20,
  },
  highlightBg: {
    ...StyleSheet.absoluteFillObject,
  },
  highlightOverlay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
  },
  highlightEmoji: { fontSize: 32 },
  highlightInfo: { flex: 1 },
  highlightTitle: { fontSize: 16, fontWeight: '700' as const, color: '#FFF' },
  highlightText: { fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  toolCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    overflow: 'hidden' as const,
  },
  toolCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 14,
  },
  toolImageWrap: {
    width: 60,
    height: 60,
    borderRadius: 14,
    overflow: 'hidden' as const,
  },
  toolImage: {
    width: 60,
    height: 60,
  },
  toolIconOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolContent: {
    flex: 1,
  },
  toolTitle: { fontSize: 16, fontWeight: '700' as const },
  toolSubtitle: { fontSize: 12, marginTop: 2 },
  toolDescription: { fontSize: 12, lineHeight: 18, marginTop: 4 },
  tipCard: {
    borderRadius: 16,
    height: 140,
    overflow: 'hidden' as const,
    marginTop: 10,
  },
  tipBg: {
    ...StyleSheet.absoluteFillObject,
  },
  tipOverlay: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
  },
  tipTitle: { fontSize: 16, fontWeight: '700' as const, color: '#FFF', marginBottom: 6 },
  tipText: { fontSize: 13, lineHeight: 20, color: 'rgba(255,255,255,0.9)' },
});
