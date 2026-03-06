import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Sparkles,
  ImageIcon,
  FileText,
  Video,
  MessageSquareQuote,
  Crown,
  ChevronRight,
  Palette,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';

const createTools = [
  {
    id: 'captions',
    title: 'Legendas para Posts',
    subtitle: 'Frases cristãs para feed e stories',
    emoji: '✍️',
    icon: MessageSquareQuote,
    color: '#8B5CF6',
    route: '/create/captions',
    description: 'Gere legendas poderosas para Instagram, Facebook e TikTok com versículos e reflexões.',
  },
  {
    id: 'verse-card',
    title: 'Card de Versículo',
    subtitle: 'Imagens bonitas com versículos',
    emoji: '📸',
    icon: ImageIcon,
    color: '#EC4899',
    route: '/create/verse-card',
    description: 'Crie cards visuais com versículos para compartilhar nas redes sociais.',
  },
  {
    id: 'scripts',
    title: 'Roteiros',
    subtitle: 'YouTube, Reels e TikTok',
    emoji: '🎬',
    icon: Video,
    color: '#EF4444',
    route: '/create/scripts',
    description: 'Gere roteiros para vídeos cristãos no YouTube, Reels e TikTok.',
  },
  {
    id: 'devotional-post',
    title: 'Devocional para Redes',
    subtitle: 'Reflexões prontas para postar',
    emoji: '📖',
    icon: FileText,
    color: '#10B981',
    route: '/create/devotional-post',
    description: 'Crie mini devocionais formatados para compartilhar nas redes sociais.',
  },
  {
    id: 'story-templates',
    title: 'Templates de Stories',
    subtitle: 'Perguntas, enquetes e reflexões',
    emoji: '📱',
    icon: Palette,
    color: '#F59E0B',
    route: '/create/story-templates',
    description: 'Templates interativos para stories com perguntas bíblicas e reflexões.',
  },
];

export default function CreateScreen() {
  const router = useRouter();
  const { colors, state } = useApp();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Criar Conteúdo</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>IA para suas redes sociais</Text>
          </View>
          <View style={[styles.aiBadge, { backgroundColor: colors.primaryLight }]}>
            <Sparkles size={14} color={colors.primary} />
            <Text style={[styles.aiBadgeText, { color: colors.primary }]}>IA</Text>
          </View>
        </View>

        {!state.isPremium && (
          <TouchableOpacity
            style={[styles.premiumBanner, { backgroundColor: '#C9922A' + '12', borderColor: '#C9922A' + '30' }]}
            onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/paywall' as never); }}
            activeOpacity={0.8}
          >
            <Crown size={18} color="#C9922A" />
            <Text style={[styles.premiumBannerText, { color: '#C9922A' }]}>
              Premium: crie conteúdo ilimitado
            </Text>
            <ChevronRight size={16} color="#C9922A" />
          </TouchableOpacity>
        )}

        <View style={styles.toolsGrid}>
          {createTools.map((tool) => (
            <TouchableOpacity
              key={tool.id}
              style={[styles.toolCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(tool.route as never);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.toolIconWrap, { backgroundColor: tool.color + '15' }]}>
                <tool.icon size={22} color={tool.color} />
              </View>
              <Text style={[styles.toolTitle, { color: colors.text }]}>{tool.title}</Text>
              <Text style={[styles.toolSubtitle, { color: colors.textMuted }]}>{tool.subtitle}</Text>
              <Text style={[styles.toolDesc, { color: colors.textSecondary }]} numberOfLines={2}>{tool.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.tipCard, { backgroundColor: colors.cardElevated, borderColor: colors.borderLight }]}>
          <Text style={styles.tipEmoji}>💡</Text>
          <View style={styles.tipContent}>
            <Text style={[styles.tipTitle, { color: colors.text }]}>Dica de Criador</Text>
            <Text style={[styles.tipText, { color: colors.textMuted }]}>
              Poste versículos com reflexões pessoais nos horários de pico: 7h, 12h e 20h para maior engajamento.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, marginTop: 2 },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  aiBadgeText: { fontSize: 12, fontWeight: '700' as const },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  premiumBannerText: { flex: 1, fontSize: 14, fontWeight: '600' as const },
  toolsGrid: { gap: 12, marginBottom: 20 },
  toolCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
  },
  toolIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  toolTitle: { fontSize: 17, fontWeight: '700' as const, marginBottom: 2 },
  toolSubtitle: { fontSize: 13, fontWeight: '500' as const, marginBottom: 6 },
  toolDesc: { fontSize: 13, lineHeight: 19 },
  tipCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  tipEmoji: { fontSize: 24 },
  tipContent: { flex: 1 },
  tipTitle: { fontSize: 14, fontWeight: '700' as const, marginBottom: 4 },
  tipText: { fontSize: 13, lineHeight: 20 },
});
