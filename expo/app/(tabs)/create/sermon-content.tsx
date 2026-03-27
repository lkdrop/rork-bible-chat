import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Sparkles,
  Copy,
  Share2,
  ChevronDown,
  ChevronUp,
  FileText,
  ImageIcon,
  MessageSquareQuote,
  HelpCircle,
  BookOpen,
  Volume2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { generateText } from '@/services/gemini';
import { speak, stopSpeaking } from '@/services/textToSpeech';
import { shareContent } from '@/utils';

interface ContentResult {
  posts: string[];
  cards: string[];
  blog: string;
  questions: string[];
}

export default function SermonContentScreen() {
  const router = useRouter();
  const { colors, canCreate, recordCreate } = useApp();
  const [sermonText, setSermonText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<ContentResult | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    posts: true,
    cards: true,
    blog: false,
    questions: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSpeak = useCallback((text: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isSpeaking) {
      void stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      void speak(text, {
        voice: 'adriano',
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  }, [isSpeaking]);

  const handleGenerate = useCallback(async () => {
    if (!sermonText.trim()) return;
    if (!canCreate()) {
      router.push('/paywall' as never);
      return;
    }

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsGenerating(true);
    recordCreate();

    try {
      const response = await generateText({
        prompt: `Você é um especialista em marketing de conteúdo cristão. Receba o sermão/pregação abaixo e gere conteúdo de redes sociais otimizado.

SERMÃO/PREGAÇÃO:
${sermonText}

GERE EXATAMENTE este JSON (sem markdown, sem \`\`\`, apenas JSON puro):
{
  "posts": [
    "Post 1 para Instagram/Facebook (máx 300 caracteres, com emojis e hashtags)",
    "Post 2 diferente abordagem",
    "Post 3 formato carrossel (pontos numerados)",
    "Post 4 formato testemunho pessoal",
    "Post 5 formato pergunta engajadora"
  ],
  "cards": [
    "Texto para card visual 1 (versículo + frase impactante, máx 100 chars)",
    "Texto para card visual 2",
    "Texto para card visual 3"
  ],
  "blog": "Artigo de blog de 3-4 parágrafos baseado no sermão, com introdução cativante, desenvolvimento e conclusão com call-to-action",
  "questions": [
    "Pergunta de discussão 1 para pequeno grupo",
    "Pergunta de discussão 2",
    "Pergunta de discussão 3",
    "Pergunta de discussão 4",
    "Pergunta de discussão 5"
  ]
}

REGRAS:
- Tudo em português do Brasil
- Posts devem ser virais e engajadores
- Cards devem ser curtos e impactantes
- Blog deve ser profundo mas acessível
- Perguntas devem provocar reflexão genuína
- Mantenha a essência bíblica do sermão`,
        system: 'Você responde SEMPRE em JSON válido. Sem markdown, sem blocos de código, apenas JSON puro.',
      });

      let jsonStr = response.trim();
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      const parsed = JSON.parse(jsonStr) as ContentResult;
      setResult(parsed);
    } catch {
      Alert.alert('Erro', 'Não foi possível gerar o conteúdo. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  }, [sermonText, canCreate, recordCreate, router]);

  const handleCopy = useCallback(async (text: string) => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await shareContent(text);
  }, []);

  const handleShareAll = useCallback(async () => {
    if (!result) return;
    const allContent = [
      '--- POSTS PARA REDES SOCIAIS ---',
      ...result.posts.map((p, i) => `\nPost ${i + 1}:\n${p}`),
      '\n--- TEXTOS PARA CARDS ---',
      ...result.cards.map((c, i) => `\nCard ${i + 1}: ${c}`),
      '\n--- ARTIGO PARA BLOG ---',
      result.blog,
      '\n--- PERGUNTAS PARA DISCUSSÃO ---',
      ...result.questions.map((q, i) => `${i + 1}. ${q}`),
      '\nGerado com Devocio.IA',
    ].join('\n');
    await shareContent(allContent);
  }, [result]);

  if (result) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setResult(null)} style={styles.backBtn}>
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Conteúdo Gerado</Text>
          <TouchableOpacity onPress={() => void handleShareAll()} style={styles.shareAllBtn}>
            <Share2 size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.resultScrollContent}>
          <TouchableOpacity
            style={[styles.listenAllBtn, { backgroundColor: isSpeaking ? '#6366F1' : '#6366F1' + '15' }]}
            onPress={() => {
              if (!result) return;
              const allContent = [
                ...result.posts.map((p, i) => `Post ${i + 1}: ${p}`),
                ...result.cards.map((c, i) => `Card ${i + 1}: ${c}`),
                result.blog,
                ...result.questions.map((q, i) => `Pergunta ${i + 1}: ${q}`),
              ].join('. ');
              handleSpeak(allContent);
            }}
          >
            <Volume2 size={16} color={isSpeaking ? '#FFF' : '#6366F1'} />
            <Text style={[styles.listenAllText, { color: isSpeaking ? '#FFF' : '#6366F1' }]}>{isSpeaking ? 'Parar Áudio' : 'Ouvir Tudo'}</Text>
          </TouchableOpacity>

          {/* Posts */}
          <TouchableOpacity
            style={[styles.sectionHeader, { borderColor: colors.borderLight }]}
            onPress={() => toggleSection('posts')}
          >
            <View style={[styles.sectionIcon, { backgroundColor: '#C5943A' + '15' }]}>
              <MessageSquareQuote size={18} color="#C5943A" />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>5 Posts para Redes</Text>
            {expandedSections.posts ? <ChevronUp size={18} color={colors.textMuted} /> : <ChevronDown size={18} color={colors.textMuted} />}
          </TouchableOpacity>
          {expandedSections.posts && result.posts.map((post, i) => (
            <View key={`post-${i}`} style={[styles.contentItem, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              <Text style={[styles.contentItemLabel, { color: '#C5943A' }]}>Post {i + 1}</Text>
              <Text style={[styles.contentItemText, { color: colors.text }]}>{post}</Text>
              <TouchableOpacity style={styles.copyBtn} onPress={() => void handleCopy(post)}>
                <Copy size={14} color={colors.primary} />
                <Text style={[styles.copyBtnText, { color: colors.primary }]}>Copiar</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Cards */}
          <TouchableOpacity
            style={[styles.sectionHeader, { borderColor: colors.borderLight }]}
            onPress={() => toggleSection('cards')}
          >
            <View style={[styles.sectionIcon, { backgroundColor: '#EC4899' + '15' }]}>
              <ImageIcon size={18} color="#EC4899" />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>3 Cards Visuais</Text>
            {expandedSections.cards ? <ChevronUp size={18} color={colors.textMuted} /> : <ChevronDown size={18} color={colors.textMuted} />}
          </TouchableOpacity>
          {expandedSections.cards && result.cards.map((card, i) => (
            <View key={`card-${i}`} style={[styles.contentItem, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              <LinearGradient
                colors={['#EC4899' + '10', '#C5943A' + '10']}
                style={styles.cardPreview}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={[styles.cardPreviewText, { color: colors.text }]}>{card}</Text>
              </LinearGradient>
              <TouchableOpacity style={styles.copyBtn} onPress={() => void handleCopy(card)}>
                <Copy size={14} color={colors.primary} />
                <Text style={[styles.copyBtnText, { color: colors.primary }]}>Copiar</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Blog */}
          <TouchableOpacity
            style={[styles.sectionHeader, { borderColor: colors.borderLight }]}
            onPress={() => toggleSection('blog')}
          >
            <View style={[styles.sectionIcon, { backgroundColor: '#10B981' + '15' }]}>
              <BookOpen size={18} color="#10B981" />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Artigo para Blog</Text>
            {expandedSections.blog ? <ChevronUp size={18} color={colors.textMuted} /> : <ChevronDown size={18} color={colors.textMuted} />}
          </TouchableOpacity>
          {expandedSections.blog && (
            <View style={[styles.contentItem, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              <Text style={[styles.blogText, { color: colors.text }]}>{result.blog}</Text>
              <TouchableOpacity style={styles.copyBtn} onPress={() => void handleCopy(result.blog)}>
                <Copy size={14} color={colors.primary} />
                <Text style={[styles.copyBtnText, { color: colors.primary }]}>Copiar Artigo</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Questions */}
          <TouchableOpacity
            style={[styles.sectionHeader, { borderColor: colors.borderLight }]}
            onPress={() => toggleSection('questions')}
          >
            <View style={[styles.sectionIcon, { backgroundColor: '#F59E0B' + '15' }]}>
              <HelpCircle size={18} color="#F59E0B" />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Perguntas de Discussão</Text>
            {expandedSections.questions ? <ChevronUp size={18} color={colors.textMuted} /> : <ChevronDown size={18} color={colors.textMuted} />}
          </TouchableOpacity>
          {expandedSections.questions && result.questions.map((q, i) => (
            <View key={`q-${i}`} style={[styles.questionItem, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              <Text style={[styles.questionNumber, { color: '#F59E0B' }]}>{i + 1}</Text>
              <Text style={[styles.questionText, { color: colors.text }]}>{q}</Text>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Sermão → Conteúdo</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.inputScroll} contentContainerStyle={styles.inputContent}>
        <View style={[styles.infoCard, { backgroundColor: '#C5943A' + '10', borderColor: '#C5943A' + '25' }]}>
          <Sparkles size={20} color="#C5943A" />
          <View style={styles.infoCardContent}>
            <Text style={[styles.infoCardTitle, { color: colors.text }]}>Pipeline de Conteúdo</Text>
            <Text style={[styles.infoCardText, { color: colors.textMuted }]}>
              Cole seu sermão e a IA gera automaticamente: 5 posts, 3 cards, 1 artigo e perguntas de discussão.
            </Text>
          </View>
        </View>

        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Cole seu sermão ou pregação</Text>
        <TextInput
          style={[styles.sermonInput, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
          placeholder="Cole aqui o texto do sermão, esboço ou anotações da pregação..."
          placeholderTextColor={colors.textMuted}
          multiline
          value={sermonText}
          onChangeText={setSermonText}
          textAlignVertical="top"
        />
        <Text style={[styles.charCount, { color: colors.textMuted }]}>
          {sermonText.length} caracteres
        </Text>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.generateBtn, { backgroundColor: '#C5943A' }, (!sermonText.trim() || isGenerating) && styles.generateBtnDisabled]}
          onPress={() => void handleGenerate()}
          disabled={!sermonText.trim() || isGenerating}
          activeOpacity={0.8}
        >
          {isGenerating ? (
            <>
              <ActivityIndicator size="small" color="#FFF" />
              <Text style={styles.generateBtnText}>Gerando conteúdo...</Text>
            </>
          ) : (
            <>
              <Sparkles size={18} color="#FFF" />
              <Text style={styles.generateBtnText}>Gerar Conteúdo</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' as const },
  shareAllBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  inputScroll: { flex: 1 },
  inputContent: { padding: 20 },
  infoCard: {
    flexDirection: 'row',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  infoCardContent: { flex: 1 },
  infoCardTitle: { fontSize: 16, fontWeight: '700' as const, marginBottom: 4 },
  infoCardText: { fontSize: 13, lineHeight: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600' as const, marginBottom: 8 },
  sermonInput: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    fontSize: 15,
    lineHeight: 24,
    minHeight: 280,
  },
  charCount: { fontSize: 12, textAlign: 'right' as const, marginTop: 6 },
  footer: { padding: 20, borderTopWidth: 1 },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  generateBtnDisabled: { opacity: 0.5 },
  generateBtnText: { fontSize: 16, fontWeight: '700' as const, color: '#FFF' },
  resultScrollContent: { padding: 20, paddingBottom: 40 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  sectionIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { flex: 1, fontSize: 16, fontWeight: '700' as const },
  contentItem: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  contentItemLabel: { fontSize: 12, fontWeight: '700' as const, marginBottom: 6, textTransform: 'uppercase' as const },
  contentItemText: { fontSize: 14, lineHeight: 22 },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-end',
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  copyBtnText: { fontSize: 12, fontWeight: '600' as const },
  cardPreview: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  cardPreviewText: { fontSize: 16, fontWeight: '600' as const, textAlign: 'center' as const, fontStyle: 'italic' as const },
  blogText: { fontSize: 15, lineHeight: 26 },
  questionItem: {
    flexDirection: 'row',
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  questionNumber: { fontSize: 18, fontWeight: '800' as const, width: 24 },
  questionText: { flex: 1, fontSize: 14, lineHeight: 22 },
  listenAllBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, marginBottom: 16 },
  listenAllText: { fontSize: 15, fontWeight: '700' as const },
});
