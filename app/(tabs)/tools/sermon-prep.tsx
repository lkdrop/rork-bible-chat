import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Share,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Sparkles,
  Share2,
  Trash2,
  BookOpen,
  Plus,
  Users,
  Clock,
  Mic,
  ChevronDown,
  ChevronUp,
  BookMarked,
  Lightbulb,
  MessageCircle,
  Target,
  Heart,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { generateObject } from '@/services/gemini';
import { z } from 'zod';
import { shareContent } from '@/utils';

type AudienceType = 'jovens' | 'adultos' | 'familia' | 'mulheres' | 'homens' | 'criancas' | 'geral';
type SermonStyle = 'expositivo' | 'tematico' | 'narrativo' | 'evangelistico' | 'devocional';
type SermonDuration = '10' | '20' | '30' | '45';
type Occasion = 'culto_domingo' | 'estudo_biblico' | 'celula' | 'casamento' | 'funeral' | 'conferencia' | 'jovens' | 'nenhuma';

interface SermonPoint {
  subtitle: string;
  verse: string;
  explanation: string;
  application: string;
}

interface GeneratedSermon {
  title: string;
  baseText: string;
  introduction: string;
  points: SermonPoint[];
  illustrations: string[];
  crossReferences: string[];
  conclusion: string;
  reflectionQuestions: string[];
  closingPrayer: string;
}

const AUDIENCES: { key: AudienceType; label: string; icon: string }[] = [
  { key: 'geral', label: 'Geral', icon: '🙏' },
  { key: 'jovens', label: 'Jovens', icon: '🎯' },
  { key: 'adultos', label: 'Adultos', icon: '👨‍👩‍👧' },
  { key: 'familia', label: 'Família', icon: '🏠' },
  { key: 'mulheres', label: 'Mulheres', icon: '💐' },
  { key: 'homens', label: 'Homens', icon: '💪' },
  { key: 'criancas', label: 'Crianças', icon: '🌈' },
];

const STYLES: { key: SermonStyle; label: string; desc: string }[] = [
  { key: 'expositivo', label: 'Expositivo', desc: 'Estudo verso a verso' },
  { key: 'tematico', label: 'Temático', desc: 'Baseado em um tema central' },
  { key: 'narrativo', label: 'Narrativo', desc: 'Contando uma história bíblica' },
  { key: 'evangelistico', label: 'Evangelístico', desc: 'Foco em alcançar novos' },
  { key: 'devocional', label: 'Devocional', desc: 'Reflexão curta e pessoal' },
];

const DURATIONS: { key: SermonDuration; label: string }[] = [
  { key: '10', label: '10 min' },
  { key: '20', label: '20 min' },
  { key: '30', label: '30 min' },
  { key: '45', label: '45 min' },
];

const OCCASIONS: { key: Occasion; label: string }[] = [
  { key: 'nenhuma', label: 'Sem ocasião específica' },
  { key: 'culto_domingo', label: 'Culto de Domingo' },
  { key: 'estudo_biblico', label: 'Estudo Bíblico' },
  { key: 'celula', label: 'Célula / Pequeno Grupo' },
  { key: 'jovens', label: 'Encontro de Jovens' },
  { key: 'casamento', label: 'Casamento' },
  { key: 'funeral', label: 'Funeral / Memorial' },
  { key: 'conferencia', label: 'Conferência / Retiro' },
];

const QUICK_PASSAGES = [
  'Filipenses 4:13',
  'Romanos 8:28',
  'Salmos 23',
  'João 3:16',
  'Isaías 41:10',
  'Provérbios 3:5-6',
  'Mateus 6:33',
  'Jeremias 29:11',
];

const QUICK_THEMES = [
  'Fé em tempos difíceis',
  'O amor de Deus',
  'Perdão e reconciliação',
  'Propósito de vida',
  'Gratidão',
  'Esperança',
  'Família',
  'Renovação espiritual',
];

const sermonSchema = z.object({
  title: z.string(),
  baseText: z.string(),
  introduction: z.string(),
  points: z.array(z.object({
    subtitle: z.string(),
    verse: z.string(),
    explanation: z.string(),
    application: z.string(),
  })),
  illustrations: z.array(z.string()),
  crossReferences: z.array(z.string()),
  conclusion: z.string(),
  reflectionQuestions: z.array(z.string()),
  closingPrayer: z.string(),
});

export default function SermonPrepScreen() {
  const router = useRouter();
  const { state, colors, addSermonNote, deleteSermonNote } = useApp();

  const [passage, setPassage] = useState('');
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState<AudienceType>('geral');
  const [style, setStyle] = useState<SermonStyle>('expositivo');
  const [duration, setDuration] = useState<SermonDuration>('30');
  const [occasion, setOccasion] = useState<Occasion>('nenhuma');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [sermon, setSermon] = useState<GeneratedSermon | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [expandedSaved, setExpandedSaved] = useState<string | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const scrollRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const startPulse = useCallback(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.6, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return animation;
  }, [pulseAnim]);

  const startProgress = useCallback(() => {
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 25000,
      useNativeDriver: false,
    }).start();
  }, [progressAnim]);

  const audienceLabel = AUDIENCES.find(a => a.key === audience)?.label ?? 'Geral';
  const styleLabel = STYLES.find(s => s.key === style)?.label ?? 'Expositivo';
  const occasionLabel = OCCASIONS.find(o => o.key === occasion)?.label ?? '';

  const handleGenerate = useCallback(async () => {

    if (!passage.trim() && !topic.trim()) {
      Alert.alert('Preencha ao menos um campo', 'Digite uma passagem bíblica ou um tema para começar.');
      return;
    }

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsGenerating(true);
    setSermon(null);

    const pulseAnimation = startPulse();
    startProgress();

    try {
      const audienceText = audience !== 'geral' ? `Público-alvo: ${audienceLabel}` : '';
      const styleText = `Estilo: ${styleLabel}`;
      const durationText = `Duração estimada: ${duration} minutos`;
      const occasionText = occasion !== 'nenhuma' ? `Ocasião: ${occasionLabel}` : '';

      const prompt = `Você é um pastor experiente e acolhedor que prepara sermões práticos e tocantes. Responda em português do Brasil usando a tradução ${state.preferredTranslation}.

${passage.trim() ? `Passagem bíblica: "${passage.trim()}"` : ''}
${topic.trim() ? `Tema: "${topic.trim()}"` : ''}
${audienceText}
${styleText}
${durationText}
${occasionText}

Gere um sermão completo e bem organizado.

Regras importantes:
- Use linguagem simples, acessível e acolhedora (como se estivesse conversando com a igreja)
- Evite termos técnicos de teologia (sem jargões acadêmicos)
- Cada ponto deve ter aplicação prática real para o dia a dia
- As ilustrações devem ser histórias do cotidiano que qualquer pessoa entende
- A oração final deve ser tocante e pessoal
- Os versículos de apoio devem incluir o texto completo com a referência
- Se o estilo for devocional, use tom mais íntimo e pessoal
- Se for evangelístico, inclua um convite claro ao final
- Adapte a linguagem e exemplos ao público-alvo escolhido`;

      const result = await generateObject({
        messages: [{ role: 'user', content: prompt }],
        schema: sermonSchema,
      });

      setSermon(result);

      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: 400, animated: true });
      }, 300);
    } catch {
      Alert.alert('Ops!', 'Não foi possível gerar o esboço agora. Tente novamente em instantes.');
    } finally {
      pulseAnimation.stop();
      pulseAnim.setValue(1);
      progressAnim.setValue(0);
      setIsGenerating(false);
    }
  }, [passage, topic, audience, style, duration, occasion, state.preferredTranslation, audienceLabel, styleLabel, occasionLabel, startPulse, startProgress, pulseAnim, progressAnim]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = useCallback(() => {
    if (!sermon) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const fullContent = formatSermonForSave(sermon);
    addSermonNote(
      sermon.title,
      passage.trim(),
      fullContent,
      '',
      sermon.illustrations,
      sermon.crossReferences
    );
    Alert.alert('Salvo!', 'Seu esboço foi salvo e pode ser acessado nos sermões salvos.');
  }, [sermon, passage, addSermonNote]);

  const handleShare = useCallback(async () => {
    if (!sermon) return;
    await shareContent(formatSermonForShare(sermon));
  }, [sermon]);

  const handleCopySection = useCallback((sectionName: string, _text: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCopiedSection(sectionName);
    setTimeout(() => setCopiedSection(null), 2000);
  }, []);

  const handleDeleteNote = useCallback((id: string) => {
    Alert.alert('Excluir sermão', 'Tem certeza que deseja excluir este esboço?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); deleteSermonNote(id); } },
    ]);
  }, [deleteSermonNote]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '95%'],
  });

  const renderOptionChip = (
    label: string,
    isSelected: boolean,
    onPress: () => void,
    icon?: string
  ) => (
    <TouchableOpacity
      key={label}
      style={[
        styles.chip,
        {
          backgroundColor: isSelected ? colors.primary : colors.card,
          borderColor: isSelected ? colors.primary : colors.border,
        },
      ]}
      onPress={() => { void Haptics.selectionAsync(); onPress(); }}
      activeOpacity={0.7}
    >
      {icon ? <Text style={styles.chipIcon}>{icon}</Text> : null}
      <Text
        style={[
          styles.chipLabel,
          { color: isSelected ? '#FFF' : colors.text },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderSectionCard = (
    icon: React.ReactNode,
    title: string,
    content: string,
    sectionKey: string,
    accentColor?: string
  ) => (
    <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]} key={sectionKey}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIconWrap, { backgroundColor: (accentColor ?? colors.primary) + '18' }]}>
          {icon as React.ReactNode}
        </View>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        <TouchableOpacity
          style={[styles.copyBtn, { backgroundColor: copiedSection === sectionKey ? colors.success + '20' : colors.primaryLight }]}
          onPress={() => handleCopySection(sectionKey, content)}
        >
          {copiedSection === sectionKey ? (
            <Check size={14} color={colors.success} />
          ) : (
            <Copy size={14} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>
      <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>{content}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="sermon-back">
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Preparar Sermão</Text>
          <Text style={[styles.headerSub, { color: colors.textMuted }]}>IA vai te ajudar</Text>
        </View>
        <TouchableOpacity
          style={[styles.toggleBtn, { backgroundColor: showSaved ? colors.primary : colors.primaryLight }]}
          onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowSaved(!showSaved); }}
          testID="sermon-toggle-saved"
        >
          {showSaved ? <Plus size={16} color="#FFF" /> : <BookOpen size={16} color={colors.primary} />}
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {!showSaved ? (
          <>
            <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              <View style={styles.fieldGroup}>
                <View style={styles.fieldLabelRow}>
                  <BookMarked size={16} color={colors.primary} />
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Passagem Bíblica</Text>
                </View>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                  placeholder="Ex: Filipenses 4:13, João 3:16-17"
                  placeholderTextColor={colors.textMuted}
                  value={passage}
                  onChangeText={setPassage}
                  testID="sermon-passage-input"
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickScroll}>
                  <View style={styles.quickRow}>
                    {QUICK_PASSAGES.map((p) => (
                      <TouchableOpacity
                        key={p}
                        style={[styles.quickChip, { backgroundColor: colors.primaryLight, borderColor: colors.primary + '30' }]}
                        onPress={() => setPassage(p)}
                      >
                        <Text style={[styles.quickChipText, { color: colors.primary }]}>{p}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={styles.divider} />

              <View style={styles.fieldGroup}>
                <View style={styles.fieldLabelRow}>
                  <Lightbulb size={16} color={colors.primary} />
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Tema do Sermão</Text>
                  <Text style={[styles.optionalTag, { color: colors.textMuted }]}>opcional</Text>
                </View>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                  placeholder="Ex: Fé em tempos difíceis, O amor de Deus"
                  placeholderTextColor={colors.textMuted}
                  value={topic}
                  onChangeText={setTopic}
                  testID="sermon-topic-input"
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickScroll}>
                  <View style={styles.quickRow}>
                    {QUICK_THEMES.map((t) => (
                      <TouchableOpacity
                        key={t}
                        style={[styles.quickChip, { backgroundColor: colors.primaryLight, borderColor: colors.primary + '30' }]}
                        onPress={() => setTopic(t)}
                      >
                        <Text style={[styles.quickChipText, { color: colors.primary }]}>{t}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={styles.divider} />

              <View style={styles.fieldGroup}>
                <View style={styles.fieldLabelRow}>
                  <Users size={16} color={colors.primary} />
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Público</Text>
                </View>
                <View style={styles.chipsWrap}>
                  {AUDIENCES.map((a) =>
                    renderOptionChip(a.label, audience === a.key, () => setAudience(a.key), a.icon)
                  )}
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.fieldGroup}>
                <View style={styles.fieldLabelRow}>
                  <Clock size={16} color={colors.primary} />
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Duração</Text>
                </View>
                <View style={styles.chipsWrap}>
                  {DURATIONS.map((d) =>
                    renderOptionChip(d.label, duration === d.key, () => setDuration(d.key))
                  )}
                </View>
              </View>

              <TouchableOpacity
                style={styles.advancedToggle}
                onPress={() => { void Haptics.selectionAsync(); setShowAdvanced(!showAdvanced); }}
              >
                <Text style={[styles.advancedToggleText, { color: colors.primary }]}>
                  {showAdvanced ? 'Menos opções' : 'Mais opções'}
                </Text>
                {showAdvanced ? <ChevronUp size={16} color={colors.primary} /> : <ChevronDown size={16} color={colors.primary} />}
              </TouchableOpacity>

              {showAdvanced && (
                <>
                  <View style={styles.fieldGroup}>
                    <View style={styles.fieldLabelRow}>
                      <Mic size={16} color={colors.primary} />
                      <Text style={[styles.fieldLabel, { color: colors.text }]}>Estilo de Pregação</Text>
                    </View>
                    {STYLES.map((s) => (
                      <TouchableOpacity
                        key={s.key}
                        style={[
                          styles.styleOption,
                          {
                            backgroundColor: style === s.key ? colors.primary + '12' : colors.inputBg,
                            borderColor: style === s.key ? colors.primary : colors.border,
                          },
                        ]}
                        onPress={() => { void Haptics.selectionAsync(); setStyle(s.key); }}
                        activeOpacity={0.7}
                      >
                        <View style={styles.styleOptionLeft}>
                          <View style={[styles.radioOuter, { borderColor: style === s.key ? colors.primary : colors.textMuted }]}>
                            {style === s.key && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                          </View>
                          <View>
                            <Text style={[styles.styleLabel, { color: colors.text }]}>{s.label}</Text>
                            <Text style={[styles.styleDesc, { color: colors.textMuted }]}>{s.desc}</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={[styles.fieldGroup, { marginTop: 12 }]}>
                    <View style={styles.fieldLabelRow}>
                      <Target size={16} color={colors.primary} />
                      <Text style={[styles.fieldLabel, { color: colors.text }]}>Ocasião</Text>
                    </View>
                    <View style={styles.chipsWrap}>
                      {OCCASIONS.map((o) =>
                        renderOptionChip(o.label, occasion === o.key, () => setOccasion(o.key))
                      )}
                    </View>
                  </View>
                </>
              )}
            </View>

            <TouchableOpacity
              style={[styles.generateBtn, { backgroundColor: colors.primary }, isGenerating && styles.generateBtnDisabled]}
              onPress={() => void handleGenerate()}
              disabled={isGenerating}
              activeOpacity={0.8}
              testID="sermon-generate"
            >
              {isGenerating ? (
                <Animated.View style={{ opacity: pulseAnim }}>
                  <Sparkles size={20} color="#FFF" />
                </Animated.View>
              ) : (
                <Sparkles size={20} color="#FFF" />
              )}
              <Text style={styles.generateBtnText}>
                {isGenerating ? 'Preparando seu sermão...' : 'Gerar Esboço com IA'}
              </Text>
            </TouchableOpacity>

            {isGenerating && (
              <View style={[styles.loadingCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
                <View style={[styles.progressBarBg, { backgroundColor: colors.borderLight }]}>
                  <Animated.View style={[styles.progressBarFill, { backgroundColor: colors.primary, width: progressWidth }]} />
                </View>
                <Text style={[styles.loadingTitle, { color: colors.text }]}>Criando seu esboço personalizado</Text>
                <View style={styles.loadingSteps}>
                  {[
                    'Analisando a passagem bíblica...',
                    'Montando a estrutura do sermão...',
                    'Buscando ilustrações e aplicações...',
                    'Finalizando com oração...',
                  ].map((step, i) => (
                    <View key={i} style={styles.loadingStep}>
                      <View style={[styles.loadingDot, { backgroundColor: colors.primary }]} />
                      <Text style={[styles.loadingStepText, { color: colors.textMuted }]}>{step}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {sermon && !isGenerating && (
              <View style={styles.resultContainer}>
                <View style={[styles.resultTitleCard, { backgroundColor: colors.primary }]}>
                  <Text style={styles.resultTitleLabel}>Seu Sermão</Text>
                  <Text style={styles.resultTitleText}>{sermon.title}</Text>
                  <Text style={styles.resultBaseText}>{sermon.baseText}</Text>
                  <View style={styles.resultMeta}>
                    <View style={styles.resultMetaItem}>
                      <Clock size={12} color="rgba(255,255,255,0.7)" />
                      <Text style={styles.resultMetaText}>{duration} min</Text>
                    </View>
                    <View style={styles.resultMetaItem}>
                      <Users size={12} color="rgba(255,255,255,0.7)" />
                      <Text style={styles.resultMetaText}>{audienceLabel}</Text>
                    </View>
                    <View style={styles.resultMetaItem}>
                      <Mic size={12} color="rgba(255,255,255,0.7)" />
                      <Text style={styles.resultMetaText}>{styleLabel}</Text>
                    </View>
                  </View>
                </View>

                {renderSectionCard(
                  <MessageCircle size={16} color={colors.primary} />,
                  'Introdução',
                  sermon.introduction,
                  'intro',
                  colors.primary
                )}

                {sermon.points.map((point, index) => (
                  <View key={`point-${index}`} style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
                    <View style={styles.sectionHeader}>
                      <View style={[styles.pointNumber, { backgroundColor: colors.primary }]}>
                        <Text style={styles.pointNumberText}>{index + 1}</Text>
                      </View>
                      <Text style={[styles.sectionTitle, { color: colors.text, flex: 1 }]}>{point.subtitle}</Text>
                    </View>
                    <View style={[styles.verseBox, { backgroundColor: colors.primaryLight, borderLeftColor: colors.primary }]}>
                      <BookMarked size={14} color={colors.primary} />
                      <Text style={[styles.verseBoxText, { color: colors.primary }]}>{point.verse}</Text>
                    </View>
                    <Text style={[styles.pointExplanation, { color: colors.textSecondary }]}>{point.explanation}</Text>
                    <View style={[styles.applicationBox, { backgroundColor: colors.success + '10', borderColor: colors.success + '30' }]}>
                      <Target size={14} color={colors.success} />
                      <View style={styles.applicationContent}>
                        <Text style={[styles.applicationLabel, { color: colors.success }]}>Aplicação Prática</Text>
                        <Text style={[styles.applicationText, { color: colors.textSecondary }]}>{point.application}</Text>
                      </View>
                    </View>
                  </View>
                ))}

                <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
                  <View style={styles.sectionHeader}>
                    <View style={[styles.sectionIconWrap, { backgroundColor: colors.warning + '18' }]}>
                      <Lightbulb size={16} color={colors.warning} />
                    </View>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Ilustrações</Text>
                  </View>
                  {sermon.illustrations.map((ill, i) => (
                    <View key={`ill-${i}`} style={[styles.illustrationItem, i > 0 && styles.illustrationItemBorder, i > 0 && { borderTopColor: colors.borderLight }]}>
                      <Text style={[styles.illustrationNumber, { color: colors.warning }]}>{i + 1}</Text>
                      <Text style={[styles.illustrationText, { color: colors.textSecondary }]}>{ill}</Text>
                    </View>
                  ))}
                </View>

                <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
                  <View style={styles.sectionHeader}>
                    <View style={[styles.sectionIconWrap, { backgroundColor: colors.accent + '18' }]}>
                      <BookOpen size={16} color={colors.accent} />
                    </View>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Versículos Relacionados</Text>
                  </View>
                  <View style={styles.refsWrap}>
                    {sermon.crossReferences.map((ref, i) => (
                      <View key={`ref-${i}`} style={[styles.refChip, { backgroundColor: colors.primaryLight }]}>
                        <Text style={[styles.refChipText, { color: colors.primary }]}>{ref}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {renderSectionCard(
                  <Target size={16} color={colors.success} />,
                  'Conclusão',
                  sermon.conclusion,
                  'conclusion',
                  colors.success
                )}

                <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
                  <View style={styles.sectionHeader}>
                    <View style={[styles.sectionIconWrap, { backgroundColor: colors.primary + '18' }]}>
                      <MessageCircle size={16} color={colors.primary} />
                    </View>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Perguntas para Reflexão</Text>
                  </View>
                  {sermon.reflectionQuestions.map((q, i) => (
                    <View key={`q-${i}`} style={styles.questionItem}>
                      <Text style={[styles.questionNumber, { color: colors.primary }]}>{i + 1}.</Text>
                      <Text style={[styles.questionText, { color: colors.textSecondary }]}>{q}</Text>
                    </View>
                  ))}
                </View>

                {renderSectionCard(
                  <Heart size={16} color={colors.error} />,
                  'Oração Final',
                  sermon.closingPrayer,
                  'prayer',
                  colors.error
                )}

                <View style={styles.resultActions}>
                  <TouchableOpacity
                    style={[styles.actionBtnLarge, { backgroundColor: colors.primary }]}
                    onPress={handleSave}
                    testID="sermon-save"
                  >
                    <BookOpen size={18} color="#FFF" />
                    <Text style={styles.actionBtnLargeText}>Salvar Esboço</Text>
                  </TouchableOpacity>
                  <View style={styles.actionBtnRow}>
                    <TouchableOpacity
                      style={[styles.actionBtnSmall, { backgroundColor: colors.primaryLight }]}
                      onPress={() => void handleShare()}
                    >
                      <Share2 size={16} color={colors.primary} />
                      <Text style={[styles.actionBtnSmallText, { color: colors.primary }]}>Compartilhar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtnSmall, { backgroundColor: colors.primaryLight }]}
                      onPress={() => { setSermon(null); void handleGenerate(); }}
                    >
                      <RefreshCw size={16} color={colors.primary} />
                      <Text style={[styles.actionBtnSmallText, { color: colors.primary }]}>Gerar Outro</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </>
        ) : (
          <>
            <View style={styles.savedHeaderRow}>
              <Text style={[styles.savedSectionTitle, { color: colors.text }]}>Sermões Salvos</Text>
              <Text style={[styles.savedCount, { color: colors.textMuted }]}>{state.sermonNotes.length}</Text>
            </View>
            {state.sermonNotes.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={[styles.emptyIcon, { backgroundColor: colors.primaryLight }]}>
                  <Mic size={32} color={colors.primary} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhum sermão salvo</Text>
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  Gere um esboço personalizado e salve aqui para acessar quando precisar.
                </Text>
                <TouchableOpacity
                  style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
                  onPress={() => setShowSaved(false)}
                >
                  <Plus size={16} color="#FFF" />
                  <Text style={styles.emptyBtnText}>Criar Primeiro Sermão</Text>
                </TouchableOpacity>
              </View>
            ) : (
              state.sermonNotes.map((note) => (
                <TouchableOpacity
                  key={note.id}
                  style={[styles.savedCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
                  onPress={() => setExpandedSaved(expandedSaved === note.id ? null : note.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.savedCardHeader}>
                    <View style={styles.savedCardInfo}>
                      <Text style={[styles.savedCardTitle, { color: colors.text }]} numberOfLines={1}>{note.title}</Text>
                      {note.passage ? (
                        <Text style={[styles.savedCardPassage, { color: colors.primary }]}>{note.passage}</Text>
                      ) : null}
                      <Text style={[styles.savedCardDate, { color: colors.textMuted }]}>
                        {new Date(note.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </Text>
                    </View>
                    <View style={styles.savedCardActions}>
                      <TouchableOpacity
                        onPress={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }}
                        style={[styles.savedDeleteBtn, { backgroundColor: colors.error + '10' }]}
                      >
                        <Trash2 size={14} color={colors.error} />
                      </TouchableOpacity>
                      {expandedSaved === note.id ? <ChevronUp size={18} color={colors.textMuted} /> : <ChevronDown size={18} color={colors.textMuted} />}
                    </View>
                  </View>
                  {expandedSaved === note.id && (
                    <View style={[styles.savedCardExpanded, { borderTopColor: colors.borderLight }]}>
                      <Text style={[styles.savedCardContent, { color: colors.textSecondary }]}>{note.content}</Text>
                      <TouchableOpacity
                        style={[styles.savedShareBtn, { backgroundColor: colors.primaryLight }]}
                        onPress={() => void Share.share({ message: `${note.title}\n\n${note.content}` })}
                      >
                        <Share2 size={14} color={colors.primary} />
                        <Text style={[styles.savedShareBtnText, { color: colors.primary }]}>Compartilhar</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function formatSermonForSave(sermon: GeneratedSermon): string {
  let text = `${sermon.title}\n\n`;
  text += `Texto Base: ${sermon.baseText}\n\n`;
  text += `INTRODUÇÃO\n${sermon.introduction}\n\n`;

  sermon.points.forEach((p, i) => {
    text += `PONTO ${i + 1}: ${p.subtitle}\n`;
    text += `Versículo: ${p.verse}\n`;
    text += `${p.explanation}\n`;
    text += `Aplicação: ${p.application}\n\n`;
  });

  text += `ILUSTRAÇÕES\n`;
  sermon.illustrations.forEach((ill, i) => {
    text += `${i + 1}. ${ill}\n`;
  });

  text += `\nVERSÍCULOS RELACIONADOS\n`;
  text += sermon.crossReferences.join(' | ') + '\n\n';

  text += `CONCLUSÃO\n${sermon.conclusion}\n\n`;

  text += `PERGUNTAS PARA REFLEXÃO\n`;
  sermon.reflectionQuestions.forEach((q, i) => {
    text += `${i + 1}. ${q}\n`;
  });

  text += `\nORAÇÃO FINAL\n${sermon.closingPrayer}`;

  return text;
}

function formatSermonForShare(sermon: GeneratedSermon): string {
  return `${sermon.title}\n\n${sermon.baseText}\n\n---\n\n${formatSermonForSave(sermon)}\n\nGerado pelo Bíblia IA`;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '700' as const },
  headerSub: { fontSize: 12, marginTop: 1 },
  toggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { padding: 16, paddingBottom: 50 },
  formCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
  },
  fieldGroup: { marginBottom: 4 },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  fieldLabel: { fontSize: 15, fontWeight: '600' as const },
  optionalTag: { fontSize: 11, fontStyle: 'italic' as const },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
  },
  quickScroll: { marginTop: 10 },
  quickRow: { flexDirection: 'row', gap: 8, paddingRight: 8 },
  quickChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  quickChipText: { fontSize: 12, fontWeight: '500' as const },
  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.06)', marginVertical: 16 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  chipIcon: { fontSize: 14 },
  chipLabel: { fontSize: 13, fontWeight: '600' as const },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    marginTop: 8,
  },
  advancedToggleText: { fontSize: 14, fontWeight: '600' as const },
  styleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  styleOptionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  styleLabel: { fontSize: 14, fontWeight: '600' as const },
  styleDesc: { fontSize: 12, marginTop: 2 },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 16,
  },
  generateBtnDisabled: { opacity: 0.8 },
  generateBtnText: { fontSize: 16, fontWeight: '700' as const, color: '#FFF' },
  loadingCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginTop: 16,
    alignItems: 'center',
  },
  progressBarBg: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 18,
  },
  progressBarFill: { height: 4, borderRadius: 2 },
  loadingTitle: { fontSize: 16, fontWeight: '600' as const, marginBottom: 16 },
  loadingSteps: { gap: 10, alignSelf: 'flex-start' },
  loadingStep: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  loadingDot: { width: 6, height: 6, borderRadius: 3 },
  loadingStepText: { fontSize: 13 },
  resultContainer: { marginTop: 16, gap: 12 },
  resultTitleCard: {
    borderRadius: 16,
    padding: 22,
    marginBottom: 4,
  },
  resultTitleLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 6,
  },
  resultTitleText: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: '#FFF',
    lineHeight: 28,
  },
  resultBaseText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 8,
    lineHeight: 20,
  },
  resultMeta: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  resultMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  resultMetaText: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  sectionCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 16, fontWeight: '700' as const },
  copyBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  sectionContent: { fontSize: 15, lineHeight: 24 },
  pointNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointNumberText: { fontSize: 14, fontWeight: '700' as const, color: '#FFF' },
  verseBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    marginBottom: 12,
  },
  verseBoxText: { fontSize: 14, lineHeight: 20, flex: 1, fontStyle: 'italic' as const },
  pointExplanation: { fontSize: 15, lineHeight: 24, marginBottom: 12 },
  applicationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  applicationContent: { flex: 1 },
  applicationLabel: { fontSize: 12, fontWeight: '700' as const, marginBottom: 4 },
  applicationText: { fontSize: 14, lineHeight: 21 },
  illustrationItem: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
  },
  illustrationItemBorder: { borderTopWidth: 1 },
  illustrationNumber: { fontSize: 16, fontWeight: '700' as const, minWidth: 20 },
  illustrationText: { fontSize: 14, lineHeight: 22, flex: 1 },
  refsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  refChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  refChipText: { fontSize: 13, fontWeight: '500' as const },
  questionItem: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  questionNumber: { fontSize: 15, fontWeight: '700' as const },
  questionText: { fontSize: 14, lineHeight: 22, flex: 1 },
  resultActions: { gap: 10, marginTop: 8, marginBottom: 20 },
  actionBtnLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
  },
  actionBtnLargeText: { fontSize: 16, fontWeight: '700' as const, color: '#FFF' },
  actionBtnRow: { flexDirection: 'row', gap: 10 },
  actionBtnSmall: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
  },
  actionBtnSmallText: { fontSize: 14, fontWeight: '600' as const },
  savedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  savedSectionTitle: { fontSize: 20, fontWeight: '700' as const },
  savedCount: { fontSize: 14 },
  emptyState: { alignItems: 'center', paddingTop: 50, paddingHorizontal: 20 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700' as const, marginBottom: 8 },
  emptyText: { fontSize: 14, textAlign: 'center' as const, lineHeight: 22, marginBottom: 24 },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyBtnText: { fontSize: 14, fontWeight: '600' as const, color: '#FFF' },
  savedCard: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
  },
  savedCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  savedCardInfo: { flex: 1 },
  savedCardTitle: { fontSize: 16, fontWeight: '700' as const },
  savedCardPassage: { fontSize: 13, fontWeight: '500' as const, marginTop: 3 },
  savedCardDate: { fontSize: 12, marginTop: 4 },
  savedCardActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  savedDeleteBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  savedCardExpanded: {
    borderTopWidth: 1,
    padding: 16,
  },
  savedCardContent: { fontSize: 14, lineHeight: 22 },
  savedShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 14,
  },
  savedShareBtnText: { fontSize: 14, fontWeight: '600' as const },
});
