import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Share,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { speak, stopSpeaking } from '@/services/textToSpeech';
import { AppImages } from '@/constants/images';
import {
  BookOpen,
  Heart,
  Share2,
  Sparkles,
  Play,
  Volume2,
  VolumeX,
  ChevronRight,
  Crown,
  PenTool,
  Compass,
  Star,
  Bell,
  Clock,
  Users,
  Music,
  Award,
  MessageCircle,
  Bookmark,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { getTodayVerse } from '@/constants/dailyVerses';
import { generateText } from '@/services/gemini';
import { StreakBadge } from '@/components/StreakBadge';
import { WhatsAppIcon } from '@/components/WhatsAppIcon';
import { getGreeting, shareContent, shareViaWhatsApp } from '@/utils';

// ─── Milestone Messages ─────────────────────
const MILESTONE_MESSAGES: Record<number, string> = {
  3: '3 dias seguidos! A semente da consistência já germinou 🌱',
  7: '1 semana inteira com Deus! Você está criando um hábito poderoso ✨',
  14: '2 semanas! A ciência diz que 14 dias formam o início de um hábito 🔥',
  30: '1 mês! Você faz parte dos 6% que chegam aqui. Deus honra sua fidelidade 👑',
  60: '60 dias! Seu devocional já é parte de quem você é 💎',
  90: '3 meses! Você é um guerreiro da fé 🛡️',
  180: 'Meio ano! Sua vida espiritual nunca mais será a mesma 🌟',
  365: '1 ANO INTEIRO! Você é uma inspiração. Que Deus continue te fortalecendo 🏆',
};

// ─── Reflection Questions (by day of week) ──
const REFLECTION_QUESTIONS = [
  'O que esse versículo te diz sobre a semana que você está vivendo?',
  'Se Deus falasse diretamente com você hoje, o que Ele diria?',
  'Como você pode aplicar essa palavra na sua rotina hoje?',
  'Qual área da sua vida precisa mais dessa palavra?',
  'O que esse versículo revela sobre o caráter de Deus?',
  'Quem você conhece que precisa ouvir essa mensagem?',
  'O que mudaria se você realmente vivesse esse versículo?',
];


// ─── Louvores curados (sem IA, carrega instantâneo) ────
const LOUVORES = [
  [
    { nome: 'Ninguém Explica Deus', artista: 'Preto no Branco ft. Gabriela Rocha', reflexao: 'Uma declaração de que o amor de Deus é inexplicável e transformador.' },
    { nome: 'Lugar Secreto', artista: 'Gabriela Rocha', reflexao: 'Um convite a buscar a intimidade com Deus, longe do barulho do mundo.' },
    { nome: 'Ousado Amor', artista: 'Isaías Saad', reflexao: 'Baseada em Romanos 8... nada pode nos separar do amor de Deus.' },
  ],
  [
    { nome: 'Ele Vem', artista: 'Gabriel Guedes', reflexao: 'Uma canção que desperta a esperança da volta de Cristo.' },
    { nome: 'Bondade de Deus', artista: 'Isaías Saad', reflexao: 'Celebra a fidelidade de Deus em cada manhã, inspirada em Lamentações 3:23.' },
    { nome: 'Fogo', artista: 'Ministério Zoe', reflexao: 'Uma oração pedindo o fogo do Espírito Santo para renovar nosso coração.' },
  ],
  [
    { nome: 'Oceanos', artista: 'Hillsong (versão Aline Barros)', reflexao: 'Baseada em Mateus 14... caminhar sobre as águas exige fé e olhar para Jesus.' },
    { nome: 'Espontâneo - Você é Real', artista: 'Ministério Zoe', reflexao: 'Uma expressão pura de adoração e entrega ao Deus que é real e presente.' },
    { nome: 'Gratidão', artista: 'Ludmila Ferber', reflexao: 'Um hino clássico de agradecimento por tudo que Deus faz em nossas vidas.' },
  ],
  [
    { nome: 'Grande é o Senhor', artista: 'Soraya Moraes', reflexao: 'Exalta a grandeza de Deus, inspirada no Salmo 145.' },
    { nome: 'Me Atraiu', artista: 'Gabriela Rocha', reflexao: 'Sobre o amor irresistível de Deus que nos atrai para perto Dele.' },
    { nome: 'Yeshua', artista: 'Heloisa Rosa', reflexao: 'Uma adoração profunda ao nome de Jesus, o nome sobre todo nome.' },
  ],
  [
    { nome: 'Quão Grande é o Meu Deus', artista: 'Soraya Moraes', reflexao: 'Celebra a imensidão do poder e do amor de Deus.' },
    { nome: 'Eu Navegarei', artista: 'Trazendo a Arca', reflexao: 'Um clássico sobre confiar em Deus mesmo em meio às tempestades.' },
    { nome: 'Santo Espírito', artista: 'Laura Souguellis', reflexao: 'Um convite para que o Espírito Santo habite e transforme nossas vidas.' },
  ],
  [
    { nome: 'Todavia Me Alegrarei', artista: 'Isaías Saad', reflexao: 'Baseada em Habacuque 3:17-18... alegria mesmo quando tudo parece difícil.' },
    { nome: 'Sou Filho', artista: 'Morada', reflexao: 'Uma declaração de identidade como filhos amados de Deus.' },
    { nome: 'Aquieta Minh\'alma', artista: 'Ministério Zoe', reflexao: 'Uma oração para encontrar paz e descanso na presença de Deus.' },
  ],
  [
    { nome: 'Reckless Love (Ousado Amor)', artista: 'Cory Asbury (versão Isaías Saad)', reflexao: 'O amor de Deus que nos persegue, nos busca e nunca desiste de nós.' },
    { nome: 'Teu Corpo', artista: 'Ana Nóbrega', reflexao: 'Uma reflexão profunda sobre o sacrifício de Cristo na cruz por cada um de nós.' },
    { nome: 'Deus Está no Controle', artista: 'Anderson Freire', reflexao: 'Uma mensagem de confiança para momentos de incerteza e ansiedade.' },
  ],
];

function getLouvorDoDia(): string {
  const dayIndex = new Date().getDay();
  const louvores = LOUVORES[dayIndex];
  const lines = ['Louvores selecionados para adoração de hoje...\n'];
  louvores.forEach((l, i) => {
    lines.push(`${i + 1}. ${l.nome}... ${l.artista}.`);
    lines.push(`${l.reflexao}\n`);
  });
  lines.push('Que esses louvores toquem seu coração e elevem sua alma em adoração a Deus... coloque para tocar, feche os olhos e permita que a presença de Deus te envolva.');
  return lines.join('\n');
}

export default function HomeScreen() {
  const router = useRouter();
  const { state, colors, recordActivity, toggleFavoriteVerse, clearStreakMilestone } = useApp();
  const verse = getTodayVerse();

  const [devotional, setDevotional] = useState('');
  const [isLoadingDevotional, setIsLoadingDevotional] = useState(false);
  const [devotionalLoaded, setDevotionalLoaded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showStreakForgiveness, setShowStreakForgiveness] = useState(false);

  // ─── Quick Win data ──────────────────────
  const reflectionQuestion = useMemo(() => {
    const dayIdx = new Date().getDay();
    return REFLECTION_QUESTIONS[dayIdx] ?? REFLECTION_QUESTIONS[0];
  }, []);


  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const verseScale = useRef(new Animated.Value(0.97)).current;
  const flameAnim = useRef(new Animated.Value(1)).current;
  const gabrielGlow = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    recordActivity();
  }, [recordActivity]);

  useEffect(() => {
    if (state.streakRepaired) {
      setShowStreakForgiveness(true);
    }
  }, [state.streakRepaired]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.spring(verseScale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();

    if (state.streak > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(flameAnim, { toValue: 1.15, duration: 700, useNativeDriver: true }),
          Animated.timing(flameAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      ).start();
    }

    Animated.loop(
      Animated.sequence([
        Animated.timing(gabrielGlow, { toValue: 0.8, duration: 2000, useNativeDriver: true }),
        Animated.timing(gabrielGlow, { toValue: 0.4, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, [fadeAnim, slideAnim, verseScale, flameAnim, state.streak, gabrielGlow]);

  const handleShare = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await shareContent(`"${verse.text}"\n\n— ${verse.reference} (${verse.translation})\n\nEnviado pelo Devocio.IA`);
  }, [verse]);

  const handleWhatsAppShare = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await shareViaWhatsApp(`"${verse.text}"\n\n— ${verse.reference} (${verse.translation})\n\nEnviado pelo Devocio.IA`);
  }, [verse]);

  const handleShareStreak = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const text = `🔥 Estou há ${state.streak} dias consecutivos no Devocio.IA! Bora crescer juntos na fé? #DevocioIA`;
    await shareContent(text);
  }, [state.streak]);

  const handleShareStreakWhatsApp = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const text = `🔥 Estou há ${state.streak} dias consecutivos no Devocio.IA! Bora crescer juntos na fé? #DevocioIA`;
    await shareViaWhatsApp(text);
  }, [state.streak]);

  const handleCloseMilestone = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    clearStreakMilestone();
  }, [clearStreakMilestone]);

  const handleFavorite = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavoriteVerse(verse.reference);
  }, [verse.reference, toggleFavoriteVerse]);

  const handleSpeakVerse = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isSpeaking) {
      void stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      void speak(`${verse.text}. ${verse.reference}`, {
        voice: 'ana',
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  }, [isSpeaking, verse]);

  useEffect(() => {
    return () => {
      void stopSpeaking();
    };
  }, []);

  const loadDevotional = useCallback(async () => {
    if (devotionalLoaded || isLoadingDevotional) return;
    setIsLoadingDevotional(true);
    try {
      const response = await generateText({
        messages: [{
          role: 'user',
          content: `Gere um devocional curto e pessoal (máximo 4 frases) baseado no versículo: "${verse.text}" (${verse.reference}).
Seja pastoral, acolhedor e prático. Termine com uma frase de aplicação para o dia. Em português do Brasil.`,
        }],
      });
      setDevotional(response);
      setDevotionalLoaded(true);
    } catch (error) {
      console.log('Devotional error:', error);
      setDevotional('Que a Palavra de Deus guie seu dia com sabedoria e paz. Medite neste versículo e deixe que ele transforme seu coração.');
      setDevotionalLoaded(true);
    } finally {
      setIsLoadingDevotional(false);
    }
  }, [verse, devotionalLoaded, isLoadingDevotional]);

  const isFavorite = state.favoriteVerses.includes(verse.reference);
  const greeting = getGreeting();
  const journeyActive = state.journey.isActive;
  const journeyProgress = journeyActive ? Math.round((state.journey.completedDays.length / 28) * 100) : 0;

  const weekDays = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
  const today = new Date().getDay();
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={[styles.headerGreeting, { color: colors.textMuted }]}>
                {greeting.emoji} {greeting.text}
              </Text>
              <Text style={[styles.headerName, { color: colors.text }]}>
                Bem-vindo
              </Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Bell size={20} color={colors.textSecondary} />
                <View style={[styles.notificationDot, { borderColor: colors.background }]} />
              </TouchableOpacity>
              <View style={styles.avatarContainer}>
                <View style={styles.avatarInner}>
                  <Text style={styles.avatarText}>L</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Streak Banner */}
          {state.streak > 0 && (
            <View style={styles.streakBanner}>
              <View style={styles.streakTop}>
                <Animated.Text style={[styles.streakFlame, { transform: [{ scale: flameAnim }] }]}>
                  🔥
                </Animated.Text>
                <View style={styles.streakInfo}>
                  <Text style={styles.streakCount}>{state.streak} dias seguidos</Text>
                  <Text style={[styles.streakLabel, { color: colors.textMuted }]}>Continue sua sequência!</Text>
                </View>
              </View>
              <View style={styles.streakBottom}>
              <View style={styles.streakDots}>
                {weekDays.map((day, i) => {
                  const isToday = i === (today === 0 ? 6 : today - 1);
                  const isFilled = i < state.streak % 7 || (state.streak >= 7 && !isToday);
                  return (
                    <View
                      key={i}
                      style={[
                        styles.streakDot,
                        isToday && styles.streakDotActive,
                        isFilled && !isToday && styles.streakDotFilled,
                      ]}
                    >
                      <Text style={[
                        styles.streakDotText,
                        isToday && styles.streakDotTextActive,
                        isFilled && !isToday && styles.streakDotTextFilled,
                      ]}>
                        {day}
                      </Text>
                    </View>
                  );
                })}
              </View>
              </View>
              {/* QW2: Streak Sharing */}
              <View style={styles.streakShareRow}>
                <TouchableOpacity
                  style={[styles.streakShareBtn, { backgroundColor: '#25D366' + '20', borderColor: '#25D366' + '35' }]}
                  onPress={() => void handleShareStreakWhatsApp()}
                  activeOpacity={0.7}
                >
                  <WhatsAppIcon size={14} />
                  <Text style={[styles.streakShareBtnText, { color: '#25D366' }]}>WhatsApp</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.streakShareBtn, { backgroundColor: 'rgba(197, 148, 58, 0.12)', borderColor: 'rgba(197, 148, 58, 0.25)' }]}
                  onPress={() => void handleShareStreak()}
                  activeOpacity={0.7}
                >
                  <Share2 size={13} color="#D4A84B" />
                  <Text style={[styles.streakShareBtnText, { color: '#D4A84B' }]}>Compartilhar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Perdao do Streak */}
          {showStreakForgiveness && (
            <View style={[styles.streakForgivenessBanner, { backgroundColor: colors.success + '15', borderColor: colors.success + '30' }]}>
              <Text style={styles.streakForgivenessEmoji}>🕊️</Text>
              <View style={styles.streakForgivenessContent}>
                <Text style={[styles.streakForgivenessTitle, { color: colors.success }]}>Perdao do Streak</Text>
                <Text style={[styles.streakForgivenessText, { color: colors.textSecondary }]}>
                  Assim como Deus te perdoa, perdoamos seu streak. Continue sua jornada!
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowStreakForgiveness(false)} style={styles.streakForgivenessDismiss}>
                <Text style={[styles.streakForgivenessDismissText, { color: colors.textMuted }]}>OK</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Para Hoje */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionBadge}>
              <Play size={13} color="#D4A84B" />
              <Text style={styles.sectionBadgeText}>PARA HOJE</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.seeAllBtn}>Ver tudo</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.todayScroll}
            style={styles.todayScrollContainer}
          >
            {[
              {
                title: 'Oração Guiada',
                sub: '5 min · Paz interior',
                colors: ['rgba(194,65,12,0.7)', 'rgba(234,88,12,0.85)'] as [string, string],
                image: AppImages.prayer,
                prompt: 'Faça uma oração guiada de 5 minutos com foco em paz interior. Comece acolhendo, depois guie a respiração, a entrega e termine com uma bênção. Seja pastoral e gentil. Máximo 150 palavras.',
              },
              {
                title: 'Meditação Bíblica',
                sub: '10 min · Salmos',
                colors: ['rgba(15,118,110,0.7)', 'rgba(13,148,136,0.85)'] as [string, string],
                image: AppImages.nature,
                prompt: 'Guie uma meditação bíblica de 10 minutos baseada em um Salmo. Leia o salmo, explique o contexto, e ajude a meditar versículo por versículo com aplicações práticas. Máximo 200 palavras.',
              },
              {
                title: 'Devocional',
                sub: '5 min · Reflexão',
                colors: ['rgba(126,34,206,0.7)', 'rgba(147,51,234,0.85)'] as [string, string],
                image: AppImages.candleLight,
                prompt: `Faça um devocional curto e profundo baseado no versículo: "${verse.text}" (${verse.reference}). Inclua contexto, reflexão e aplicação prática para o dia. Máximo 150 palavras.`,
              },
              {
                title: 'Louvor',
                sub: 'Adoração do dia',
                colors: ['rgba(190,18,60,0.7)', 'rgba(225,29,72,0.85)'] as [string, string],
                image: AppImages.worship,
                prompt: '',
                prebuiltContent: getLouvorDoDia(),
              },
            ].map((item, i) => (
              <TouchableOpacity
                key={i}
                style={styles.todayCard}
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push({
                    pathname: '/guided-audio',
                    params: {
                      title: item.title,
                      subtitle: item.sub,
                      prompt: item.prompt,
                      gradientColors: JSON.stringify(item.colors),
                      image: item.image,
                      ...(item.prebuiltContent ? { prebuiltContent: item.prebuiltContent } : {}),
                    },
                  } as never);
                }}
                activeOpacity={0.85}
              >
                <Image source={{ uri: item.image }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
                <LinearGradient
                  colors={item.colors}
                  style={styles.todayCardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.todayCardPlay}>
                    <Play size={14} color="#FFF" fill="#FFF" />
                  </View>
                  <View style={styles.todayCardText}>
                    <Text style={styles.todayCardTitle}>{item.title}</Text>
                    <Text style={styles.todayCardSub}>{item.sub}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Versículo do Dia */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionBadge}>
              <Star size={13} color="#D4A84B" fill="#D4A84B" />
              <Text style={styles.sectionBadgeText}>VERSÍCULO DO DIA</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.seeAllBtn}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          <Animated.View style={[styles.verseCard, { transform: [{ scale: verseScale }], backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <View style={styles.verseGlow} />
            <View style={styles.verseContent}>
              <View style={styles.verseBar} />
              <Text style={[styles.verseText, { color: colors.text }]}>"{verse.text}"</Text>
            </View>
            <View style={styles.verseRefRow}>
              <View style={[styles.verseRefBadge, { backgroundColor: 'rgba(197, 148, 58, 0.12)' }]}>
                <Text style={[styles.verseRefText, { color: colors.primary }]}>{verse.reference}</Text>
              </View>
              <Text style={[styles.verseTranslation, { color: colors.textMuted }]}>{verse.translation}</Text>
            </View>
            <View style={styles.verseActions}>
              <TouchableOpacity
                style={[styles.verseActionBtn, { backgroundColor: colors.background, borderColor: colors.borderLight }, isSpeaking && styles.verseActionBtnActive]}
                onPress={handleSpeakVerse}
              >
                {isSpeaking ? <VolumeX size={16} color="#D4A84B" /> : <Volume2 size={16} color={colors.textSecondary} />}
                <Text style={[styles.verseActionLabel, { color: colors.textMuted }, isSpeaking && { color: '#D4A84B' }]}>Ouvir</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.verseActionBtn, { backgroundColor: colors.background, borderColor: colors.borderLight }, isFavorite && styles.verseActionBtnActive]}
                onPress={handleFavorite}
              >
                <Bookmark size={16} color={isFavorite ? '#D4A84B' : colors.textSecondary} fill={isFavorite ? '#D4A84B' : 'transparent'} />
                <Text style={[styles.verseActionLabel, { color: colors.textMuted }, isFavorite && { color: '#D4A84B' }]}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.verseActionBtn, { backgroundColor: '#25D366' + '15', borderColor: '#25D366' + '30' }]} onPress={handleWhatsAppShare}>
                <WhatsAppIcon size={14} />
                <Text style={[styles.verseActionLabel, { color: '#25D366' }]}>WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.verseActionBtn, { backgroundColor: colors.background, borderColor: colors.borderLight }]} onPress={handleShare}>
                <Share2 size={16} color={colors.textSecondary} />
                <Text style={[styles.verseActionLabel, { color: colors.textMuted }]}>Enviar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.verseActionBtn, styles.verseActionBtnActive]}
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push({
                    pathname: '/chat',
                    params: { autoMessage: `Explique o versículo: "${verse.text}" (${verse.reference})` },
                  } as never);
                }}
              >
                <Sparkles size={16} color="#D4A84B" />
                <Text style={[styles.verseActionLabel, { color: '#D4A84B' }]}>Explicar</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Devocional do Dia */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionBadge}>
              <BookOpen size={13} color="#D4A84B" />
              <Text style={styles.sectionBadgeText}>DEVOCIONAL</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.devotionalCard, { borderColor: colors.borderLight }]}
            onPress={() => void loadDevotional()}
            activeOpacity={0.85}
          >
            <View style={styles.devotionalImage}>
              <Image source={{ uri: AppImages.mountainSunset }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
              <LinearGradient
                colors={['rgba(30,27,75,0.3)', 'rgba(15, 10, 26, 0.85)']}
                style={styles.devotionalOverlay}
              >
                <View style={styles.devotionalTag}>
                  <Text style={styles.devotionalTagText}>5 min de leitura</Text>
                </View>
                <View style={styles.devotionalTextOverlay}>
                  {isLoadingDevotional ? (
                    <View style={styles.devotionalLoading}>
                      <ActivityIndicator size="small" color="#D4A84B" />
                      <Text style={styles.loadingText}>Preparando reflexão...</Text>
                    </View>
                  ) : devotionalLoaded ? (
                    <Text style={styles.devotionalBody} numberOfLines={3}>{devotional}</Text>
                  ) : (
                    <>
                      <Text style={styles.devotionalTitle}>A Força na Fragilidade</Text>
                      <Text style={styles.devotionalSub}>
                        Toque para gerar reflexão personalizada com IA
                      </Text>
                    </>
                  )}
                </View>
              </LinearGradient>
            </View>
            <View style={[styles.devotionalFooter, { backgroundColor: colors.card }]}>
              <View style={styles.devotionalMeta}>
                <View style={styles.devotionalMetaItem}>
                  <Star size={12} color={colors.textMuted} />
                  <Text style={[styles.devotionalMetaText, { color: colors.textMuted }]}>Gerado por IA</Text>
                </View>
              </View>
              <View style={[styles.devotionalCta, { backgroundColor: 'rgba(197, 148, 58, 0.12)', borderColor: 'rgba(197, 148, 58, 0.25)' }]}>
                <Text style={[styles.devotionalCtaText, { color: colors.primary }]}>Ler agora</Text>
                <ChevronRight size={14} color="#D4A84B" />
              </View>
            </View>
          </TouchableOpacity>

          {/* QW4: Reflection Prompt */}
          {devotionalLoaded && (
            <TouchableOpacity
              style={[styles.reflectionCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
              activeOpacity={0.85}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push({
                  pathname: '/chat',
                  params: { autoMessage: reflectionQuestion + `\n\nVersículo: "${verse.text}" (${verse.reference})` },
                } as never);
              }}
            >
              <View style={styles.reflectionHeader}>
                <View style={[styles.reflectionIconWrap, { backgroundColor: 'rgba(197, 148, 58, 0.12)' }]}>
                  <MessageCircle size={16} color="#D4A84B" />
                </View>
                <Text style={[styles.reflectionLabel, { color: '#D4A84B' }]}>PERGUNTA DE REFLEXÃO</Text>
              </View>
              <Text style={[styles.reflectionQuestion, { color: colors.text }]}>{reflectionQuestion}</Text>
              <View style={[styles.reflectionCta, { backgroundColor: 'rgba(197, 148, 58, 0.10)', borderColor: 'rgba(197, 148, 58, 0.22)' }]}>
                <Sparkles size={13} color="#D4A84B" />
                <Text style={[styles.reflectionCtaText, { color: '#D4A84B' }]}>Refletir com Gabriel</Text>
                <ChevronRight size={13} color="#D4A84B" />
              </View>
            </TouchableOpacity>
          )}

          {/* Acesso Rápido */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionBadge}>
              <Sparkles size={13} color="#D4A84B" />
              <Text style={styles.sectionBadgeText}>ACESSO RÁPIDO</Text>
            </View>
          </View>

          <View style={styles.quickGrid}>
            {[
              { icon: BookOpen, label: 'Bíblia', color: '#D4A84B', bg: 'rgba(139, 92, 246, 0.15)', route: '/study/bible' },
              { icon: MessageCircle, label: 'Oração', color: '#60a5fa', bg: 'rgba(59, 130, 246, 0.15)', route: '/tools' },
              { icon: Music, label: 'Louvor', color: '#fb7185', bg: 'rgba(244, 63, 94, 0.15)', route: '/tools' },
              { icon: Clock, label: 'Planos', color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)', route: '/study' },
              { icon: Users, label: 'Grupos', color: '#34d399', bg: 'rgba(16, 185, 129, 0.15)', route: '/community' },
              { icon: Award, label: 'Desafios', color: '#22d3ee', bg: 'rgba(6, 182, 212, 0.15)', route: '/tools' },
            ].map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.quickCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(item.route as never);
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.quickIcon, { backgroundColor: item.bg }]}>
                  <item.icon size={22} color={item.color} />
                </View>
                <Text style={[styles.quickLabel, { color: colors.textSecondary }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Gabriel AI CTA */}
          <View style={[styles.gabrielCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <Animated.View style={[styles.gabrielGlow, { opacity: gabrielGlow }]} />
            <View style={styles.gabrielContent}>
              <View style={styles.gabrielAvatar}>
                <View style={styles.gabrielAvatarRing} />
                <LinearGradient
                  colors={['#B8862D', '#7A5C12']}
                  style={styles.gabrielAvatarInner}
                >
                  <Sparkles size={22} color="#ddd6fe" />
                </LinearGradient>
              </View>
              <View style={styles.gabrielText}>
                <Text style={[styles.gabrielTitle, { color: colors.text }]}>Pergunte ao Gabriel</Text>
                <Text style={[styles.gabrielSub, { color: colors.textSecondary }]}>
                  Seu guia espiritual com IA. Tire dúvidas e aprofunde sua fé.
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.gabrielBtn}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push('/chat');
              }}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#B8862D', '#8B6914']}
                style={styles.gabrielBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.gabrielBtnText}>Iniciar conversa</Text>
                <ChevronRight size={18} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Jornada 90 Dias */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionBadge}>
              <Compass size={13} color="#D4A84B" />
              <Text style={styles.sectionBadgeText}>JORNADA 28 DIAS</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/study/journey' as never)}>
              <Text style={styles.seeAllBtn}>Ver jornada</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.journeyCardWrap}>
            <Image source={{ uri: AppImages.sunrise }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
            <LinearGradient
              colors={['rgba(88,28,135,0.75)', 'rgba(194,65,12,0.6)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.journeyCardOverlay}
            >
              <View style={styles.journeyRing}>
                <View style={styles.journeyRingBg}>
                  <View style={[styles.journeyRingFill, {
                    borderColor: '#FFF',
                    borderTopColor: journeyActive ? '#FFF' : 'rgba(255,255,255,0.3)',
                    borderRightColor: journeyProgress > 25 ? '#FFF' : 'rgba(255,255,255,0.3)',
                    borderBottomColor: journeyProgress > 50 ? '#FFF' : 'rgba(255,255,255,0.3)',
                    borderLeftColor: journeyProgress > 75 ? '#FFF' : 'rgba(255,255,255,0.3)',
                  }]} />
                </View>
                <View style={styles.journeyRingText}>
                  <Text style={[styles.journeyNumber, { color: '#FFF' }]}>{journeyActive ? state.journey.currentDay : 0}</Text>
                  <Text style={[styles.journeyOf, { color: 'rgba(255,255,255,0.7)' }]}>de 28</Text>
                </View>
              </View>
              <View style={styles.journeyInfo}>
                <Text style={[styles.journeyTitle, { color: '#FFF' }]}>
                  {journeyActive ? 'Conhecendo o Caráter de Deus' : 'Inicie sua Jornada'}
                </Text>
                <Text style={[styles.journeyChapter, { color: 'rgba(255,255,255,0.85)' }]}>
                  {journeyActive ? `Dia ${state.journey.currentDay} — A Misericórdia` : 'Transforme sua vida em 28 dias'}
                </Text>
                <View style={styles.journeyStats}>
                  <View style={styles.journeyStat}>
                    <Clock size={12} color="rgba(255,255,255,0.7)" />
                    <Text style={[styles.journeyStatText, { color: 'rgba(255,255,255,0.7)' }]}>15 min</Text>
                  </View>
                  <View style={styles.journeyStat}>
                    <Users size={12} color="rgba(255,255,255,0.7)" />
                    <Text style={[styles.journeyStatText, { color: 'rgba(255,255,255,0.7)' }]}>1.2k fazendo</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.journeyCta, { backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.3)' }]}
                  onPress={() => router.push(journeyActive ? '/study/journey' as never : '/study/journey-quiz' as never)}
                >
                  <Text style={[styles.journeyCtaText, { color: '#FFF' }]}>{journeyActive ? 'Continuar' : 'Começar'}</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {/* Estatísticas */}
          <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{state.streak}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Dias seguidos</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{state.totalDaysActive}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Dias ativos</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{state.totalChaptersRead}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Capítulos</Text>
              </View>
            </View>
          </View>

          {/* Premium Banner */}
          {!state.isPremium && (
            <TouchableOpacity
              style={styles.premiumBanner}
              onPress={() => router.push('/paywall' as never)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#8B6914', '#B8862D']}
                style={styles.premiumGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.premiumLeft}>
                  <Crown size={22} color="#fbbf24" />
                  <View>
                    <Text style={styles.premiumTitle}>Devocio.IA Premium</Text>
                    <Text style={styles.premiumSub}>Chat ilimitado, vigília e muito mais</Text>
                  </View>
                </View>
                <View style={styles.premiumBtn}>
                  <Text style={styles.premiumBtnText}>Ver planos</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textMuted }]}>
              "Lâmpada para os meus pés é a tua palavra"
            </Text>
            <Text style={[styles.footerRef, { color: colors.textMuted }]}>Salmos 119:105</Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* QW1: Streak Milestone Celebration Overlay */}
      {state.streakMilestone != null && (
        <TouchableOpacity
          style={styles.milestoneOverlay}
          activeOpacity={1}
          onPress={handleCloseMilestone}
        >
          <View style={[styles.milestoneCard, { backgroundColor: colors.card }]}>
            <Text style={styles.milestoneEmoji}>🎉</Text>
            <Text style={[styles.milestoneTitle, { color: colors.text }]}>
              {state.streak} dias de streak!
            </Text>
            <Text style={[styles.milestoneMessage, { color: colors.textSecondary }]}>
              {MILESTONE_MESSAGES[state.streakMilestone] ?? `${state.streak} dias com Deus!`}
            </Text>
            <TouchableOpacity
              style={styles.milestoneBtn}
              onPress={handleCloseMilestone}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#B8862D', '#8B6914']}
                style={styles.milestoneBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.milestoneBtnText}>Amém! 🙏</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerLeft: { flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerGreeting: { fontSize: 13, fontWeight: '500' },
  headerName: { fontSize: 24, fontWeight: '800', color: '#f4f4f5', letterSpacing: -0.5 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  notificationDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, backgroundColor: '#ef4444', borderRadius: 4, borderWidth: 2, borderColor: '#0f0a1a' },
  avatarContainer: { width: 42, height: 42, borderRadius: 21, borderWidth: 2, borderColor: '#C5943A', padding: 2 },
  avatarInner: { flex: 1, borderRadius: 18, backgroundColor: '#B8862D', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  // Streak Banner
  streakBanner: { padding: 14, backgroundColor: 'rgba(251, 191, 36, 0.08)', borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.15)', borderRadius: 16, marginBottom: 20 },
  streakTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  streakBottom: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
  streakFlame: { fontSize: 28 },
  streakInfo: { flex: 1 },
  streakCount: { fontSize: 14, fontWeight: '700', color: '#fbbf24' },
  streakLabel: { fontSize: 11 },
  streakDots: { flexDirection: 'row', gap: 3 },
  streakDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(197, 148, 58, 0.06)', borderWidth: 1, borderColor: 'rgba(197, 148, 58, 0.12)', justifyContent: 'center', alignItems: 'center' },
  streakDotFilled: { backgroundColor: 'rgba(251, 191, 36, 0.2)', borderColor: 'rgba(251, 191, 36, 0.3)' },
  streakDotActive: { backgroundColor: '#f59e0b', borderColor: '#fbbf24' },
  streakDotText: { fontSize: 9, fontWeight: '600', color: '#9E8E7E' },
  streakDotTextFilled: { color: '#fbbf24' },
  streakDotTextActive: { color: '#18181b' },

  // Streak Forgiveness Banner
  streakForgivenessBanner: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 16, gap: 12 },
  streakForgivenessEmoji: { fontSize: 28 },
  streakForgivenessContent: { flex: 1 },
  streakForgivenessTitle: { fontSize: 14, fontWeight: '700' },
  streakForgivenessText: { fontSize: 12, lineHeight: 18, marginTop: 2 },
  streakForgivenessDismiss: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  streakForgivenessDismissText: { fontSize: 13, fontWeight: '600' },

  // Campaign Banner
  campaignBanner: { borderRadius: 20, overflow: 'hidden', marginBottom: 20 },
  campaignGradient: { padding: 18 },
  campaignContent: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  campaignEmoji: { fontSize: 32 },
  campaignText: { flex: 1 },
  campaignTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  campaignSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  campaignVerse: { paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: 'rgba(255,255,255,0.3)', marginBottom: 12 },
  campaignVerseText: { fontSize: 13, fontStyle: 'italic', color: 'rgba(255,255,255,0.85)', lineHeight: 20 },
  campaignVerseRef: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  campaignChallenge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  campaignChallengeText: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.85)' },

  // Night Content
  nightCard: { borderRadius: 20, overflow: 'hidden', marginBottom: 20 },
  nightGradient: { padding: 20, alignItems: 'center', position: 'relative' },
  nightStars: { position: 'absolute', top: 12, right: 16, flexDirection: 'row', gap: 8 },
  nightStarsText: { fontSize: 16 },
  nightEmoji: { fontSize: 40, marginBottom: 10 },
  nightTitle: { fontSize: 20, fontWeight: '800', color: '#e2e8f0', marginBottom: 6, textAlign: 'center' },
  nightSub: { fontSize: 13, color: 'rgba(203, 213, 225, 0.7)', textAlign: 'center', marginBottom: 14 },
  nightVerse: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, marginBottom: 16, width: '100%' },
  nightVerseText: { fontSize: 13, fontStyle: 'italic', color: 'rgba(203, 213, 225, 0.85)', lineHeight: 20, textAlign: 'center' },
  nightVerseRef: { fontSize: 11, fontWeight: '600', color: '#D4A84B', textAlign: 'center', marginTop: 6 },
  nightActions: { flexDirection: 'row', gap: 10, width: '100%' },
  nightAction: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 12, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  nightActionEmoji: { fontSize: 20 },
  nightActionText: { fontSize: 10, fontWeight: '600', color: 'rgba(203, 213, 225, 0.7)', textAlign: 'center' },

  // Para Hoje
  todayScrollContainer: { marginBottom: 20, marginHorizontal: -20 },
  todayScroll: { paddingHorizontal: 20, gap: 12 },
  todayCard: { width: 160, height: 180, borderRadius: 16, overflow: 'hidden' },
  todayCardGradient: { flex: 1, padding: 14, justifyContent: 'flex-end' },
  todayCardPlay: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', marginBottom: 'auto' as any },
  todayCardText: {},
  todayCardTitle: { fontSize: 15, fontWeight: '700', color: '#FFF', marginBottom: 3 },
  todayCardSub: { fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },

  // Section Headers
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionBadgeText: { fontSize: 11, fontWeight: '700', color: '#D4A84B', letterSpacing: 0.8 },
  seeAllBtn: { fontSize: 13, fontWeight: '500', color: '#D4A84B' },

  // Verse Card
  verseCard: { borderRadius: 20, padding: 20, marginBottom: 20, backgroundColor: 'rgba(139, 92, 246, 0.08)', borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.15)', overflow: 'hidden' },
  verseGlow: { position: 'absolute', top: -60, right: -40, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(139, 92, 246, 0.1)' },
  verseContent: { flexDirection: 'row', marginBottom: 14 },
  verseBar: { width: 3, backgroundColor: '#C5943A', borderRadius: 2, marginRight: 16 },
  verseText: { flex: 1, fontSize: 17, fontWeight: '600', color: '#f4f4f5', lineHeight: 28, fontStyle: 'italic' },
  verseRefRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, marginLeft: 19 },
  verseRefBadge: { backgroundColor: 'rgba(139, 92, 246, 0.12)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  verseRefText: { fontSize: 13, fontWeight: '600', color: '#E8C876' },
  verseTranslation: { fontSize: 11, fontWeight: '500' },
  verseActions: { flexDirection: 'row', gap: 8 },
  verseActionBtn: { flex: 1, flexDirection: 'column', alignItems: 'center', gap: 4, paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  verseActionBtnActive: { backgroundColor: 'rgba(139, 92, 246, 0.12)', borderColor: 'rgba(139, 92, 246, 0.25)' },
  verseActionLabel: { fontSize: 10, fontWeight: '600', color: '#a1a1aa' },

  // Devotional Card
  devotionalCard: { borderRadius: 20, overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  devotionalImage: { height: 200, position: 'relative' as const },
  devotionalOverlay: { flex: 1, justifyContent: 'flex-end', padding: 20 },
  devotionalTag: { position: 'absolute', top: 14, right: 14, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  devotionalTagText: { fontSize: 10, fontWeight: '600', color: '#fbbf24' },
  devotionalTextOverlay: {},
  devotionalTitle: { fontSize: 20, fontWeight: '700', color: '#FFF', marginBottom: 4 },
  devotionalSub: { fontSize: 13, lineHeight: 20, color: 'rgba(255,255,255,0.75)' },
  devotionalBody: { fontSize: 14, lineHeight: 22, color: 'rgba(255,255,255,0.85)' },
  devotionalLoading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  loadingText: { fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  devotionalFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, backgroundColor: 'rgba(255,255,255,0.03)' },
  devotionalMeta: { gap: 4 },
  devotionalMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  devotionalMetaText: { fontSize: 11 },
  devotionalCta: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(139, 92, 246, 0.12)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.2)' },
  devotionalCtaText: { fontSize: 13, fontWeight: '600', color: '#E8C876' },

  // Quick Actions Grid
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  quickCard: { width: '31.5%' as any, alignItems: 'center', gap: 8, paddingVertical: 16, paddingHorizontal: 8, borderRadius: 16, borderWidth: 1 },
  quickIcon: { width: 46, height: 46, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  quickLabel: { fontSize: 11, fontWeight: '600' },

  // Gabriel Card
  gabrielCard: { borderRadius: 20, padding: 20, marginBottom: 20, backgroundColor: 'rgba(139, 92, 246, 0.1)', borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.2)', overflow: 'hidden' },
  gabrielGlow: { position: 'absolute', top: -40, left: -20, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(139, 92, 246, 0.15)' },
  gabrielContent: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14, zIndex: 1 },
  gabrielAvatar: { width: 52, height: 52, position: 'relative' },
  gabrielAvatarRing: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 26, borderWidth: 2, borderColor: 'rgba(167, 139, 250, 0.4)' },
  gabrielAvatarInner: { position: 'absolute', top: 4, left: 4, right: 4, bottom: 4, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  gabrielText: { flex: 1 },
  gabrielTitle: { fontSize: 16, fontWeight: '700', marginBottom: 3 },
  gabrielSub: { fontSize: 12, lineHeight: 18 },
  gabrielBtn: { borderRadius: 14, overflow: 'hidden', zIndex: 1 },
  gabrielBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13 },
  gabrielBtnText: { fontSize: 15, fontWeight: '600', color: '#FFF' },

  // Journey Card
  journeyCardWrap: { borderRadius: 20, overflow: 'hidden' as const, marginBottom: 20 },
  journeyCardOverlay: { flexDirection: 'row' as const, gap: 16, alignItems: 'center' as const, padding: 20 },
  journeyRing: { width: 80, height: 80, position: 'relative', justifyContent: 'center', alignItems: 'center' },
  journeyRingBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 40, borderWidth: 4, borderColor: 'rgba(255,255,255,0.25)' },
  journeyRingFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 40, borderWidth: 4 },
  journeyRingText: { alignItems: 'center' },
  journeyNumber: { fontSize: 24, fontWeight: '800', color: '#E8C876' },
  journeyOf: { fontSize: 10, fontWeight: '500' },
  journeyInfo: { flex: 1 },
  journeyTitle: { fontSize: 15, fontWeight: '700', marginBottom: 3 },
  journeyChapter: { fontSize: 12, fontWeight: '500', color: '#D4A84B', marginBottom: 8 },
  journeyStats: { flexDirection: 'row', gap: 14, marginBottom: 10 },
  journeyStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  journeyStatText: { fontSize: 11 },
  journeyCta: { alignSelf: 'flex-start', paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(139, 92, 246, 0.15)', borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.25)' },
  journeyCtaText: { fontSize: 13, fontWeight: '600', color: '#E8C876' },

  // Premium Banner
  premiumBanner: { borderRadius: 16, overflow: 'hidden', marginBottom: 20 },
  premiumGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18 },
  premiumLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  premiumTitle: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  premiumSub: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  premiumBtn: { backgroundColor: '#C5943A', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  premiumBtnText: { fontSize: 13, fontWeight: '700', color: '#FFF' },

  // Stats
  statsCard: { borderRadius: 16, borderWidth: 1, marginBottom: 20 },
  statsRow: { flexDirection: 'row', alignItems: 'center', padding: 18 },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 22, fontWeight: '800', color: '#D4A84B' },
  statLabel: { fontSize: 11, fontWeight: '500', marginTop: 3 },
  statDivider: { width: 1, height: 30 },

  // Footer
  footer: { alignItems: 'center', paddingVertical: 12 },
  footerText: { fontSize: 14, fontStyle: 'italic', textAlign: 'center' },
  footerRef: { fontSize: 12, marginTop: 4 },

  // ─── QW2: Streak Sharing ─────────────────
  streakShareRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  streakShareBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  streakShareBtnText: { fontSize: 12, fontWeight: '600' },


  // ─── QW4: Reflection Prompt ──────────────
  reflectionCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 20 },
  reflectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  reflectionIconWrap: { width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  reflectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  reflectionQuestion: { fontSize: 15, fontWeight: '600', lineHeight: 22, marginBottom: 14 },
  reflectionCta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  reflectionCtaText: { fontSize: 13, fontWeight: '600' },

  // ─── QW1: Milestone Celebration Overlay ──
  milestoneOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    padding: 24,
  },
  milestoneCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  milestoneEmoji: { fontSize: 64, marginBottom: 12 },
  milestoneTitle: { fontSize: 22, fontWeight: '800', marginBottom: 10, textAlign: 'center' },
  milestoneMessage: { fontSize: 15, lineHeight: 24, textAlign: 'center', marginBottom: 24 },
  milestoneBtn: { width: '100%', borderRadius: 14, overflow: 'hidden' },
  milestoneBtnGradient: { paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  milestoneBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
});
