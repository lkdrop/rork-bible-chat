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
import { PenLine, HandHeart, Target, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';

export default function ToolsScreen() {
  const router = useRouter();
  const { state, colors } = useApp();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const tools = [
    {
      id: 'journal',
      title: 'Diário Espiritual',
      subtitle: `${state.journalEntries.length} reflexões escritas`,
      description: 'Registre seus pensamentos, orações e momentos com Deus.',
      icon: PenLine,
      iconColor: '#8B5CF6',
      route: '/tools/journal',
    },
    {
      id: 'prayer-wall',
      title: 'Mural de Oração',
      subtitle: `${state.prayerRequests.length} pedidos de oração`,
      description: 'Adicione seus pedidos e acompanhe as respostas de Deus.',
      icon: HandHeart,
      iconColor: '#EC4899',
      route: '/tools/prayer-wall',
    },
    {
      id: 'goals',
      title: 'Metas Espirituais',
      subtitle: `${state.spiritualGoals.length} metas ativas`,
      description: 'Defina e acompanhe metas para seu crescimento espiritual.',
      icon: Target,
      iconColor: '#F59E0B',
      route: '/tools/goals',
    },
  ];

  const answeredPrayers = state.prayerRequests.filter(p => p.answered).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Ferramentas</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>Recursos para sua vida espiritual</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {answeredPrayers > 0 && (
            <View style={[styles.highlightCard, { backgroundColor: '#10B98115', borderColor: '#10B98130' }]}>
              <Text style={styles.highlightEmoji}>🙏</Text>
              <View style={styles.highlightInfo}>
                <Text style={[styles.highlightTitle, { color: '#10B981' }]}>Orações Respondidas</Text>
                <Text style={[styles.highlightText, { color: colors.textSecondary }]}>
                  {answeredPrayers} {answeredPrayers === 1 ? 'oração respondida' : 'orações respondidas'} por Deus!
                </Text>
              </View>
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
              <View style={styles.toolHeader}>
                <View style={[styles.toolIcon, { backgroundColor: tool.iconColor + '15' }]}>
                  <tool.icon size={24} color={tool.iconColor} />
                </View>
                <View style={styles.toolInfo}>
                  <Text style={[styles.toolTitle, { color: colors.text }]}>{tool.title}</Text>
                  <Text style={[styles.toolSubtitle, { color: colors.textMuted }]}>{tool.subtitle}</Text>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </View>
              <Text style={[styles.toolDescription, { color: colors.textSecondary }]}>{tool.description}</Text>
            </TouchableOpacity>
          ))}

          <View style={[styles.tipCard, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.tipTitle, { color: colors.primary }]}>💡 Dica do Dia</Text>
            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
              Dedique pelo menos 10 minutos do seu dia para ler a Palavra e orar. Pequenos hábitos transformam a vida espiritual!
            </Text>
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
  highlightCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 20 },
  highlightEmoji: { fontSize: 32 },
  highlightInfo: { flex: 1 },
  highlightTitle: { fontSize: 15, fontWeight: '700' as const },
  highlightText: { fontSize: 13, marginTop: 2 },
  toolCard: { borderRadius: 16, padding: 18, borderWidth: 1, marginBottom: 14 },
  toolHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  toolIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  toolInfo: { flex: 1 },
  toolTitle: { fontSize: 17, fontWeight: '700' as const },
  toolSubtitle: { fontSize: 12, marginTop: 2 },
  toolDescription: { fontSize: 13, lineHeight: 20 },
  tipCard: { borderRadius: 16, padding: 20, marginTop: 10 },
  tipTitle: { fontSize: 15, fontWeight: '700' as const, marginBottom: 8 },
  tipText: { fontSize: 14, lineHeight: 22 },
});
