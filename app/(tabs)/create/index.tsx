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
  Hash,
  Calendar,
  Type,
  Lock,
  Heart,
  Film,
  BookOpen,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/contexts/AppContext';
import { BIBLE_VIDEOS } from '@/constants/bibleVideos';

const createTools = [
  {
    id: 'sermon-content',
    title: 'Sermão → Conteúdo',
    subtitle: 'Cole o sermão, a IA gera tudo',
    emoji: '🎯',
    icon: FileText,
    color: '#B8862D',
    route: '/create/sermon-content',
    description: 'Cole seu sermão e receba: 5 posts, 3 cards, 1 blog e perguntas de discussão. Pipeline completo!',
    badge: 'NOVO',
  },
  {
    id: 'captions',
    title: 'Legendas que Viralizam',
    subtitle: 'IA Copywriter especialista em engajamento',
    emoji: '🔥',
    icon: MessageSquareQuote,
    color: '#C5943A',
    route: '/create/captions',
    description: 'Agente de IA treinado em copy viral gera legendas que explodem em curtidas, saves e compartilhamentos.',
    badge: 'TOP',
  },
  {
    id: 'scripts',
    title: 'Roteiros Virais',
    subtitle: 'YouTube, Reels e TikTok que engajam',
    emoji: '🎬',
    icon: Video,
    color: '#EF4444',
    route: '/create/scripts',
    description: 'Roteiros com hooks magnéticos e storytelling que prendem do início ao fim. Otimizados para algoritmo.',
    badge: 'VIRAL',
  },
  {
    id: 'image-generator',
    title: 'Gerador de Imagens IA',
    subtitle: 'Ilustracoes e cartoons cristaos',
    emoji: '🖼️',
    icon: ImageIcon,
    color: '#EC4899',
    route: '/create/image-generator',
    description: 'Crie imagens incriveis com IA: cartoons biblicos, aquarelas espirituais, arte digital e mais.',
    badge: 'NOVO',
  },
  {
    id: 'prayer-card',
    title: 'Cards de Oração',
    subtitle: 'Orações com imagens IA e áudio',
    emoji: '🙏',
    icon: Heart,
    color: '#E879F9',
    route: '/create/prayer-card',
    description: 'Crie cards de oração com fundos gerados por IA. Estilos cartoon, aquarela ou realista. Ouça com voz angelical.',
    badge: 'NOVO',
  },
  {
    id: 'bible-reels',
    title: 'Reels Biblicos',
    subtitle: 'Slides prontos com narracao IA',
    emoji: '🎬',
    icon: Film,
    color: '#F43F5E',
    route: '/create/bible-reels',
    description: 'Crie reels com slides visuais, fundos IA e narracao ElevenLabs. Pronto para Instagram e TikTok.',
    badge: 'NOVO',
  },
  {
    id: 'bible-stories',
    title: 'Historias Biblicas',
    subtitle: 'Carrossel cartoon com narracao',
    emoji: '📖',
    icon: BookOpen,
    color: '#F97316',
    route: '/create/bible-stories',
    description: 'Selecione uma historia biblica e a IA gera ilustracoes cartoon em sequencia. Perfeito para carrossel do Instagram.',
    badge: 'NOVO',
  },
  {
    id: 'verse-card',
    title: 'Cards de Versículo',
    subtitle: 'Imagens prontas para compartilhar',
    emoji: '📸',
    icon: ImageIcon,
    color: '#D946EF',
    route: '/create/verse-card',
    description: 'Crie cards visuais lindos com versículos. Escolha cores, fontes e fundos personalizados.',
  },
  {
    id: 'devotional-post',
    title: 'Devocional Diário',
    subtitle: 'Reflexões que tocam corações',
    emoji: '📖',
    icon: FileText,
    color: '#10B981',
    route: '/create/devotional-post',
    description: 'Mini devocionais que geram conexão profunda. Prontos para copiar e postar.',
  },
  {
    id: 'story-templates',
    title: 'Stories Interativos',
    subtitle: 'Enquetes, quizzes e reflexões',
    emoji: '📱',
    icon: Palette,
    color: '#F59E0B',
    route: '/create/story-templates',
    description: 'Templates de stories que fazem seus seguidores interagirem. Aumente seu engajamento em até 300%.',
  },
  {
    id: 'hashtags',
    title: 'Gerador de Hashtags',
    subtitle: 'Hashtags que alcançam milhares',
    emoji: '#️⃣',
    icon: Hash,
    color: '#06B6D4',
    route: '/create/hashtags',
    description: 'Combinações estratégicas de hashtags para maximizar alcance e aparecer no Explore.',
    premium: true,
  },
  {
    id: 'content-calendar',
    title: 'Calendário de Conteúdo',
    subtitle: 'Planeje 30 dias de posts',
    emoji: '📅',
    icon: Calendar,
    color: '#F97316',
    route: '/create/content-calendar',
    description: 'Planejamento completo de 30 dias com temas, datas especiais e estratégia de postagem.',
    premium: true,
  },
  {
    id: 'bio-generator',
    title: 'Bio Otimizada',
    subtitle: 'Bio que converte seguidores',
    emoji: '✍️',
    icon: Type,
    color: '#14B8A6',
    route: '/create/bio-generator',
    description: 'Gere bios profissionais que atraem seguidores e comunicam autoridade no nicho cristão.',
    premium: true,
  },
];

const tips = [
  'Poste versículos entre 7h-8h e 19h-21h — picos de engajamento no nicho cristão.',
  'Stories com enquetes bíblicas geram 3x mais interações. Use diariamente!',
  'Reels de 15-30s com hook nos 2 primeiros segundos têm 5x mais alcance.',
  'Salvar > Curtir: posts que são salvos ganham mais relevância no algoritmo.',
  'Use 20-25 hashtags misturando populares e nichadas para máximo alcance.',
];

export default function CreateScreen() {
  const router = useRouter();
  const { colors, state, canCreate } = useApp();
  const remainingFree = state.isPremium ? '∞' : Math.max(0, 2 - (state.lastCreateDate === new Date().toDateString() ? state.dailyCreateCount : 0));
  const tipIndex = new Date().getDate() % tips.length;

  const handleToolPress = (tool: typeof createTools[0]) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (tool.premium && !state.isPremium) {
      router.push('/paywall' as never);
      return;
    }
    if (!canCreate() && !tool.premium) {
      router.push('/paywall' as never);
      return;
    }
    router.push(tool.route as never);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Explorar</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
              Crie e compartilhe sua fe
            </Text>
          </View>
          <View style={[styles.aiBadge, { backgroundColor: '#C5943A' + '15' }]}>
            <Sparkles size={14} color="#C5943A" />
            <Text style={[styles.aiBadgeText, { color: '#C5943A' }]}>IA</Text>
          </View>
        </View>

        {!state.isPremium && (
          <TouchableOpacity
            style={[styles.premiumBanner, { backgroundColor: '#C5943A' + '12', borderColor: '#C5943A' + '30' }]}
            onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/paywall' as never); }}
            activeOpacity={0.8}
          >
            <Crown size={18} color="#C5943A" />
            <View style={styles.premiumBannerContent}>
              <Text style={[styles.premiumBannerText, { color: '#C5943A' }]}>
                Desbloqueie criação ilimitada
              </Text>
              <Text style={[styles.premiumBannerSub, { color: colors.textMuted }]}>
                {remainingFree} criações restantes hoje • Premium = sem limites
              </Text>
            </View>
            <ChevronRight size={16} color="#C5943A" />
          </TouchableOpacity>
        )}

        <View style={styles.socialProofRow}>
          <Text style={[styles.socialProofText, { color: colors.textMuted }]}>
            +12.847 conteúdos criados por criadores cristãos
          </Text>
        </View>

        {/* Banner de Vídeos Bíblicos */}
        {BIBLE_VIDEOS.length > 0 && (
          <TouchableOpacity
            style={styles.videoBanner}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/(tabs)/(home)/bible-videos' as never);
            }}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#6B4E0F', '#B8862D', '#8B6914']}
              style={styles.videoBannerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.videoBannerLeft}>
                <Text style={styles.videoBannerEmoji}>🎬</Text>
                <View>
                  <Text style={styles.videoBannerTitle}>Vídeos Bíblicos</Text>
                  <Text style={styles.videoBannerSub}>{BIBLE_VIDEOS.length} vídeos disponíveis</Text>
                </View>
              </View>
              <View style={styles.videoBannerPlay}>
                <Video size={18} color="#FFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <View style={styles.toolsGrid}>
          {createTools.map((tool) => (
            <TouchableOpacity
              key={tool.id}
              style={[styles.toolCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
              onPress={() => handleToolPress(tool)}
              activeOpacity={0.7}
            >
              <View style={[styles.toolIconWrap, { backgroundColor: tool.color + '20' }]}>
                <tool.icon size={20} color={tool.color} />
              </View>
              <View style={styles.toolTextCol}>
                <View style={styles.toolTitleRow}>
                  <Text style={[styles.toolTitle, { color: colors.text }]}>{tool.title}</Text>
                  {tool.premium && !state.isPremium && (
                    <Lock size={12} color="#C5943A" style={{ marginLeft: 6 }} />
                  )}
                </View>
                <Text style={[styles.toolSubtitle, { color: colors.textMuted }]}>{tool.subtitle}</Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.tipCard, { backgroundColor: colors.cardElevated, borderColor: colors.borderLight }]}>
          <Text style={styles.tipEmoji}>🚀</Text>
          <View style={styles.tipContent}>
            <Text style={[styles.tipTitle, { color: colors.text }]}>Dica para Viralizar</Text>
            <Text style={[styles.tipText, { color: colors.textMuted }]}>
              {tips[tipIndex]}
            </Text>
          </View>
        </View>

        <View style={[styles.watermarkNote, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <Sparkles size={14} color={colors.textMuted} />
          <Text style={[styles.watermarkText, { color: colors.textMuted }]}>
            Todo conteúdo inclui "Criado com Devocio.IA" — sua marca de qualidade
          </Text>
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
    marginBottom: 12,
  },
  premiumBannerContent: { flex: 1 },
  premiumBannerText: { fontSize: 14, fontWeight: '700' as const },
  premiumBannerSub: { fontSize: 12, marginTop: 2 },
  socialProofRow: { marginBottom: 16, alignItems: 'center' },
  socialProofText: { fontSize: 12, fontWeight: '600' as const },
  toolsGrid: { gap: 8, marginBottom: 20 },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 14,
  },
  toolIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolTextCol: {
    flex: 1,
  },
  toolTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolTitle: { fontSize: 15, fontWeight: '700' as const },
  toolSubtitle: { fontSize: 12, marginTop: 2 },
  tipCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  tipEmoji: { fontSize: 24 },
  tipContent: { flex: 1 },
  tipTitle: { fontSize: 14, fontWeight: '700' as const, marginBottom: 4 },
  tipText: { fontSize: 13, lineHeight: 20 },
  watermarkNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  watermarkText: { fontSize: 12, flex: 1 },
  // Video Banner
  videoBanner: { borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  videoBannerGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  videoBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  videoBannerEmoji: { fontSize: 28 },
  videoBannerTitle: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  videoBannerSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 1 },
  videoBannerPlay: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
});
