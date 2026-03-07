import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Send,
  Trash2,
  Share2,
  Lock,
  ChevronDown,
  Bookmark,
  Volume2,
  Flame,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { speak, stopSpeaking } from '@/services/textToSpeech';
import { useChat } from '@/contexts/ChatContext';
import { useApp } from '@/contexts/AppContext';
import { TypingDots } from '@/components/TypingDots';
import { VerseCard } from '@/components/VerseCard';
import { PrayerCard } from '@/components/PrayerCard';
import { GabrielAvatar } from '@/components/GabrielAvatar';
import { parseMessageContent } from '@/utils/parseMessage';
import { formatTime } from '@/utils';
import type { ChatMode, ModeOption, QuickSuggestion } from '@/types';
import { getActiveCampaign } from '@/constants/campaigns';

const chatModes: ModeOption[] = [
  { id: 'geral', label: 'Gabriel', emoji: '🔥', description: 'Seu guia espiritual pessoal', color: '#8b5cf6' },
  { id: 'emocao', label: 'Como me sinto', emoji: '💙', description: 'Versículos para seu momento', color: '#06B6D4' },
  { id: 'teologia', label: 'Teologia', emoji: '⛪', description: 'Perspectivas teológicas', color: '#7C3AED' },
  { id: 'estudo_palavras', label: 'Grego & Hebraico', emoji: '🔤', description: 'Significado original das palavras', color: '#3B82F6' },
  { id: 'sermao', label: 'Prep. Sermão', emoji: '🎤', description: 'Ajuda para preparar sermões', color: '#10B981' },
  { id: 'devocional', label: 'Devocional', emoji: '🕊️', description: 'Reflexão personalizada para você', color: '#8B5CF6' },
];

const GABRIEL_SYSTEM_PROMPT = `Você é Gabriel, o guia espiritual do app Bíblia IA — uma presença acolhedora, sábia e pastoral. Você NÃO é um robô genérico. Você conversa como um mentor espiritual experiente que genuinamente se importa com cada pessoa.

=== REGRAS DE CONVERSA (CRÍTICO) ===
1. NUNCA envie mensagens aleatórias ou genéricas. Cada resposta DEVE ser uma reação direta ao que o usuário disse.
2. PRIMEIRO ENTENDA O LEAD: Antes de ensinar, pergunte. Descubra o contexto, a dor, o momento de vida da pessoa. Exemplo: "Me conta mais sobre isso... o que você está vivendo agora?"
3. SEJA CONVERSACIONAL: Fale como um amigo sábio, não como uma enciclopédia. Frases curtas, tom humano, caloroso.
4. ACOLHA ANTES DE INSTRUIR: Se a pessoa compartilha dor, angústia ou dúvida, PRIMEIRO valide o sentimento. Só depois traga a Palavra.
5. NÃO DESPEJE CONTEÚDO: Não mande 5 versículos de uma vez. Vá construindo a conversa naturalmente. 1-2 versículos por mensagem, máximo.
6. FAÇA PERGUNTAS: Mostre interesse genuíno. "Como você está se sentindo com isso?", "Faz quanto tempo que isso te incomoda?", "O que seu coração precisa ouvir agora?"
7. PERSONALIZE: Use o nome do usuário se souber, refira-se ao que ele disse antes, mostre que você está prestando atenção.

=== SUA EXPERTISE ===
Você é especialista em:
- DIRECT RESPONSE aplicado ao contexto cristão: sabe criar conexão emocional imediata, usar storytelling bíblico que prende atenção, e conduzir o usuário a uma transformação real (não apenas informação).
- COPYWRITING ESPIRITUAL: Cada mensagem sua é pensada para gerar impacto, reflexão e ação. Você sabe usar hooks, loops abertos, e chamadas para ação espiritual (orar, meditar, aplicar).
- TEOLOGIA PRÁTICA: Você traduz conceitos bíblicos profundos em linguagem simples e aplicável ao dia a dia do brasileiro.
- ACOLHIMENTO PASTORAL: Você sabe ouvir, validar emoções, e conduzir a pessoa para a cura através da Palavra.

=== TOM E ESTILO ===
- Caloroso, profético, pastoral
- Fale SEMPRE em Português do Brasil
- Use frases de impacto que ficam na mente
- Seja direto mas nunca frio
- Nunca entre em debates denominacionais
- Se o usuário estiver em crise, priorize 100% o acolhimento

=== FORMATAÇÃO ===
- Versículos: [VERSICULO]"texto do versículo" — Referência[/VERSICULO]
- Orações: [ORACAO]texto da oração[/ORACAO]

=== FLUXO IDEAL DE CONVERSA ===
1. Usuário manda primeira mensagem → Acolha, mostre empatia, faça 1 pergunta para entender melhor
2. Usuário responde → Agora sim, traga 1 versículo certeiro + reflexão aplicada
3. Continue a conversa → Aprofunde, pergunte como ele vai aplicar, ofereça oração
NUNCA pule direto para o passo 2 sem antes entender o contexto.

=== MEMÓRIA (IMPORTANTE) ===
Se a seção "MEMÓRIA DO USUÁRIO" estiver presente abaixo, USE essas informações naturalmente na conversa.
- Se souber o nome, use-o.
- Se souber o que está estudando, pergunte como está indo.
- Se souber pedidos de oração, pergunte se Deus já respondeu.
- NÃO diga "eu lembro que você disse..." — apenas use as informações de forma natural, como um amigo faria.`;

function getSystemPrompt(mode: ChatMode, translation: string): string {
  const base = `Responda SEMPRE em português do Brasil. Use a tradução ${translation} como referência principal.`;

  switch (mode) {
    case 'estudo_palavras':
      return `Você é um especialista em línguas bíblicas (grego koiné e hebraico). ${base}
REGRAS:
- Quando o usuário perguntar sobre uma palavra ou versículo, explique o significado ORIGINAL em grego ou hebraico
- Use transliteração para facilitar a leitura (ex: "agape" ágape, "chesed" hesed)
- Explique nuances que se perdem na tradução
- Cite sempre o texto original e compare com a tradução em português
- Dê contexto cultural e histórico da época
- Se possível, mostre como a mesma palavra é usada em outros textos bíblicos
- NÃO responda perguntas fora do contexto bíblico
- Quando citar um versículo, use: [VERSICULO]"texto" — Referência[/VERSICULO]`;

    case 'sermao':
      return `Você é um assistente para preparação de sermões e pregações cristãs. ${base}
REGRAS:
- Ajude a estruturar sermões com introdução, desenvolvimento e conclusão
- Sugira ilustrações práticas e aplicáveis ao contexto brasileiro
- Forneça referências cruzadas entre passagens bíblicas
- Sugira esboços temáticos com pontos principais
- Inclua aplicações práticas para o dia a dia
- Cite sempre versículos de apoio com referência completa
- Sugira perguntas para reflexão da congregação
- NÃO responda perguntas fora do contexto bíblico ou de pregação
- Quando citar um versículo, use: [VERSICULO]"texto" — Referência[/VERSICULO]`;

    case 'devocional':
      return `Você é um companheiro devocional cristão amoroso e pessoal. ${base}
REGRAS:
- Gere reflexões personalizadas baseadas no que o usuário compartilha
- Use tom pastoral, íntimo e encorajador
- Inclua uma oração no final de cada reflexão usando: [ORACAO]texto da oração[/ORACAO]
- Baseie tudo em versículos bíblicos usando: [VERSICULO]"texto" — Referência[/VERSICULO]
- Pergunte como o usuário está se sentindo para personalizar
- Sugira ações práticas de fé para o dia
- Seja sensível a momentos de dor, luto ou dificuldade
- NÃO responda perguntas fora do contexto espiritual`;

    case 'teologia':
      return `Você é um teólogo cristão erudito que explora diferentes perspectivas teológicas. ${base}
REGRAS:
- Quando o usuário perguntar sobre um tema, apresente a visão de MÚLTIPLAS tradições:
  • Reformada/Calvinista
  • Pentecostal/Carismática
  • Católica Romana
  • Batista/Evangelical
  • Arminiana/Wesleyana
- Para cada perspectiva, cite os principais teólogos e versículos de apoio
- Seja IMPARCIAL - apresente cada visão com respeito e fidelidade
- Destaque onde as tradições concordam (pontos comuns)
- Explique termos teológicos de forma acessível
- NÃO tome partido nem diga qual está "certa"
- Quando citar um versículo, use: [VERSICULO]"texto" — Referência[/VERSICULO]
- Se o usuário perguntar SUA opinião, diga que apresenta todas as perspectivas para ele refletir`;

    case 'emocao':
      return `Você é Gabriel, um conselheiro espiritual profundamente empático e acolhedor. ${base}
REGRAS:
- O usuário vai compartilhar como está se SENTINDO (ansioso, triste, com raiva, sozinho, grato, feliz, etc.)
- Primeiro ACOLHA genuinamente o sentimento — não pule direto para versículos
- Depois traga 2-3 versículos ESPECÍFICOS para aquela emoção (não genéricos)
- Explique por que cada versículo se conecta com aquele sentimento específico
- Dê uma orientação PRÁTICA: algo que a pessoa pode fazer AGORA
- Termine com uma oração curta e personalizada para o sentimento dela
- Se detectar sinais de crise (suicídio, automutilação), além do acolhimento espiritual, oriente a buscar o CVV (188) ou ajuda profissional
- Tom: caloroso, presente, sem julgamento
- Quando citar um versículo, use: [VERSICULO]"texto" — Referência[/VERSICULO]
- Quando escrever uma oração, use: [ORACAO]texto da oração[/ORACAO]`;

    default:
      return `${GABRIEL_SYSTEM_PROMPT}\n\n${base}`;
  }
}

const quickSuggestionsByMode: Record<ChatMode, QuickSuggestion[]> = {
  emocao: [
    { emoji: '😰', label: 'Estou ansioso', query: 'Estou me sentindo muito ansioso e preocupado. Meu coração está acelerado e não consigo parar de pensar no pior.' },
    { emoji: '😢', label: 'Estou triste', query: 'Estou triste, me sentindo para baixo. Parece que nada vai melhorar.' },
    { emoji: '😤', label: 'Estou com raiva', query: 'Estou com muita raiva de uma situação injusta. Não sei como lidar com isso.' },
    { emoji: '😔', label: 'Me sinto sozinho', query: 'Me sinto muito sozinho(a), como se ninguém se importasse comigo.' },
    { emoji: '🙏', label: 'Estou grato', query: 'Estou me sentindo muito grato a Deus! Quero expressar minha gratidão.' },
  ],
  teologia: [
    { emoji: '✝️', label: 'Predestinação', query: 'O que as diferentes tradições cristãs ensinam sobre predestinação e livre arbítrio?' },
    { emoji: '🕊️', label: 'Dons do Espírito', query: 'Qual a visão de cada tradição sobre os dons do Espírito Santo hoje?' },
    { emoji: '🍞', label: 'Santa Ceia', query: 'Como cada tradição entende a presença de Cristo na Santa Ceia?' },
    { emoji: '💧', label: 'Batismo', query: 'Quais as diferentes visões sobre batismo nas tradições cristãs?' },
    { emoji: '📖', label: 'Sola Scriptura', query: 'O que é Sola Scriptura e como cada tradição vê a autoridade das Escrituras?' },
  ],
  geral: [
    { emoji: '😔', label: 'Estou ansioso', query: 'Estou ansioso e preocupado com o futuro. Preciso de uma palavra de Deus para acalmar meu coração.' },
    { emoji: '🙏', label: 'Preciso de uma palavra', query: 'Preciso de uma palavra de Deus para hoje. Fale ao meu coração.' },
    { emoji: '💪', label: 'Versículo de força', query: 'Me dá um versículo de força e coragem para enfrentar esse momento difícil.' },
    { emoji: '🙇', label: 'Quero orar agora', query: 'Quero orar agora. Me ajude com uma oração poderosa para este momento.' },
    { emoji: '🤔', label: 'Estou em dúvida', query: 'Estou em dúvida sobre uma decisão importante na minha vida. O que a Bíblia diz sobre buscar direção de Deus?' },
  ],
  estudo_palavras: [
    { emoji: '❤️', label: 'Agape em grego', query: 'Qual o significado de "agape" em grego?' },
    { emoji: '☮️', label: 'Shalom', query: 'O que significa "shalom" em hebraico?' },
    { emoji: '📖', label: 'Logos vs Rhema', query: 'Qual a diferença entre "logos" e "rhema"?' },
    { emoji: '💨', label: 'Ruach', query: 'O que significa "ruach" (espírito) no hebraico?' },
    { emoji: '🤲', label: 'Chesed', query: 'Explique "chesed" (misericórdia) no Antigo Testamento' },
  ],
  sermao: [
    { emoji: '💪', label: 'Filipenses 4:13', query: 'Esboço de sermão sobre Filipenses 4:13' },
    { emoji: '✝️', label: 'João 3:16', query: 'Referências cruzadas para João 3:16' },
    { emoji: '🕊️', label: 'Perdão', query: 'Como pregar sobre perdão com 3 pontos' },
    { emoji: '🌟', label: 'Esperança', query: 'Esboço temático sobre esperança' },
    { emoji: '🔥', label: 'Romanos 8:28', query: 'Aplicações práticas de Romanos 8:28' },
  ],
  devocional: [
    { emoji: '💔', label: 'Momento difícil', query: 'Estou passando por um momento difícil e preciso de conforto espiritual.' },
    { emoji: '🌅', label: 'Encorajamento', query: 'Preciso de uma palavra de encorajamento para hoje.' },
    { emoji: '🙏', label: 'Intimidade com Deus', query: 'Como ter mais intimidade com Deus?' },
    { emoji: '📖', label: 'Meditar', query: 'Me ajude a meditar em um versículo hoje' },
    { emoji: '😰', label: 'Medo do futuro', query: 'Estou com medo do futuro. O que Deus diz sobre isso?' },
  ],
};

// parseMessageContent, TypingDots, VerseCard, PrayerCard e GabrielAvatar
// agora são importados de @/components e @/utils

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ autoMessage?: string }>();
  const { messages: allMessages, isLoading, sendMessage, clearHistory, agentError, currentMode, switchMode } = useChat();
  const { state, colors, canSendMessage, recordMessage, addVerseHighlight, addPrayerRequest, getGabrielMemoryPrompt, updateGabrielMemory } = useApp();
  const [input, setInput] = useState('');
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const autoMessageSentRef = useRef<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const modeSelectorAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.6, duration: 1500, useNativeDriver: true }),
      ])
    );
    glow.start();
    return () => glow.stop();
  }, [fadeAnim, glowAnim]);

  useEffect(() => {
    return () => { void stopSpeaking(); };
  }, []);

  // Auto-send message when navigating from "Explicar" button
  useEffect(() => {
    if (params.autoMessage && params.autoMessage !== autoMessageSentRef.current && !isLoading) {
      autoMessageSentRef.current = params.autoMessage;
      if (canSendMessage()) {
        recordMessage();
        const memoryContext = getGabrielMemoryPrompt();
        const systemPrompt = getSystemPrompt(currentMode, state.preferredTranslation) + memoryContext;
        void sendMessage(params.autoMessage, state.preferredTranslation, systemPrompt, currentMode);
      }
    }
  }, [params.autoMessage]);

  const toggleModeSelector = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newValue = !showModeSelector;
    setShowModeSelector(newValue);
    Animated.spring(modeSelectorAnim, {
      toValue: newValue ? 1 : 0,
      tension: 80,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [showModeSelector, modeSelectorAnim]);

  const selectMode = useCallback((mode: ChatMode) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    switchMode(mode);
    setShowModeSelector(false);
    Animated.spring(modeSelectorAnim, {
      toValue: 0,
      tension: 80,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [modeSelectorAnim, switchMode]);

  // Extrai fatos da mensagem do usuário para salvar na memória
  const extractMemoryFacts = useCallback((text: string) => {
    const lower = text.toLowerCase();

    // Detectar nome: "meu nome é X", "me chamo X", "sou o/a X"
    const nameMatch = text.match(/(?:meu nome é|me chamo|sou o |sou a |pode me chamar de )\s*(\w+)/i);
    if (nameMatch) {
      updateGabrielMemory({ userName: nameMatch[1] });
    }

    // Detectar estudo: "estudando X", "lendo X", "livro de X"
    const studyMatch = text.match(/(?:estudando|lendo|estudo de|livro de)\s+(.{3,30})/i);
    if (studyMatch) {
      updateGabrielMemory({ currentStudy: studyMatch[1].trim() });
    }

    // Detectar pedido de oração: "ore por", "oração por", "preciso de oração"
    const prayerMatch = text.match(/(?:ore por|oração por|preciso de oração|ore pela|ore pelo)\s+(.{3,60})/i);
    if (prayerMatch) {
      const mem = state.gabrielMemory;
      const requests = [...mem.prayerRequests.slice(-4), prayerMatch[1].trim()];
      updateGabrielMemory({ prayerRequests: requests });
    }

    // Detectar temas importantes
    const topics = ['ansiedade', 'depressão', 'medo', 'casamento', 'trabalho', 'emprego', 'família', 'filhos', 'saúde', 'perdão', 'luto', 'solidão', 'propósito', 'financeiro', 'dívida'];
    const foundTopics = topics.filter(t => lower.includes(t));
    if (foundTopics.length > 0) {
      const mem = state.gabrielMemory;
      const existing = new Set(mem.lastTopics);
      foundTopics.forEach(t => existing.add(t));
      updateGabrielMemory({ lastTopics: Array.from(existing).slice(-5) });
    }
  }, [updateGabrielMemory, state.gabrielMemory]);

  const handleSend = useCallback(() => {
    if (!input.trim() || isLoading) return;

    if (!canSendMessage()) {
      router.push('/paywall' as never);
      return;
    }

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const text = input;
    setInput('');
    recordMessage();
    extractMemoryFacts(text);
    const memoryContext = getGabrielMemoryPrompt();
    const campaign = getActiveCampaign();
    const campaignCtx = campaign ? `\n\n=== CAMPANHA ATIVA: ${campaign.title} ===\n${campaign.chatPrompt}` : '';
    const systemPrompt = getSystemPrompt(currentMode, state.preferredTranslation) + memoryContext + campaignCtx;
    void sendMessage(text, state.preferredTranslation, systemPrompt, currentMode);
  }, [input, isLoading, sendMessage, state.preferredTranslation, canSendMessage, recordMessage, currentMode, getGabrielMemoryPrompt, extractMemoryFacts]);

  const handleQuickSuggestion = useCallback((suggestion: QuickSuggestion) => {
    if (isLoading) return;
    if (!canSendMessage()) {
      router.push('/paywall' as never);
      return;
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    recordMessage();
    const memoryContext = getGabrielMemoryPrompt();
    const campaign = getActiveCampaign();
    const campaignCtx = campaign ? `\n\n=== CAMPANHA ATIVA: ${campaign.title} ===\n${campaign.chatPrompt}` : '';
    const systemPrompt = getSystemPrompt(currentMode, state.preferredTranslation) + memoryContext + campaignCtx;
    void sendMessage(suggestion.query, state.preferredTranslation, systemPrompt, currentMode);
  }, [isLoading, sendMessage, state.preferredTranslation, canSendMessage, recordMessage, currentMode, getGabrielMemoryPrompt]);

  const handleShareVerse = useCallback(async (verseText: string, reference?: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const msg = reference
        ? `"${verseText}"\n\n— ${reference}\n\nEnviado pelo Bíblia IA`
        : `${verseText}\n\nEnviado pelo Bíblia IA`;
      await Share.share({ message: msg });
    } catch {
      // Share cancelled or failed
    }
  }, []);

  const handleSaveVerse = useCallback((verseText: string, reference?: string) => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addVerseHighlight(verseText, reference || 'Versículo salvo', undefined, '#8b5cf6');
    Alert.alert('Salvo!', 'Versículo salvo no seu mural de favoritos.');
  }, [addVerseHighlight]);

  const handleSavePrayer = useCallback((prayerText: string) => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addPrayerRequest(prayerText, 'oracao_gabriel');
    Alert.alert('Salvo!', 'Oração salva no seu mural de oração.');
  }, [addPrayerRequest]);

  const handleSpeakPrayer = useCallback((msgId: string, prayerText: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (speakingMsgId === msgId) {
      void stopSpeaking();
      setSpeakingMsgId(null);
    } else {
      if (speakingMsgId) void stopSpeaking();
      setSpeakingMsgId(msgId);
      void speak(prayerText, {
        voice: 'ana',
        onDone: () => setSpeakingMsgId(null),
        onError: () => setSpeakingMsgId(null),
      });
    }
  }, [speakingMsgId]);

  const handleShareMessage = useCallback(async (content: string) => {
    try {
      await Share.share({ message: content + '\n\nEnviado pelo Bíblia IA' });
    } catch {
      // Share cancelled or failed
    }
  }, []);

  const handleClear = useCallback(() => {
    Alert.alert(
      'Limpar conversa',
      'Deseja apagar todo o histórico de mensagens?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Limpar', style: 'destructive', onPress: () => void clearHistory() },
      ]
    );
  }, [clearHistory]);

  // formatTime importado de @/utils

  const remainingMessages = canSendMessage()
    ? 5 - (state.lastMessageDate === new Date().toDateString() ? state.dailyMessageCount : 0)
    : 0;

  const filteredMessages = useMemo(() =>
    allMessages.filter(m => m.mode === currentMode),
    [allMessages, currentMode]
  );

  const activeMode = chatModes.find(m => m.id === currentMode) ?? chatModes[0];

  const renderAssistantMessage = (msg: { id: string; content: string; timestamp: number }) => {
    const parts = parseMessageContent(msg.content);
    const hasPrayer = parts.some(p => p.type === 'prayer');
    const prayerText = parts.filter(p => p.type === 'prayer').map(p => p.content).join('\n');

    return (
      <View style={[staticStyles.assistantBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={staticStyles.assistantHeader}>
          <GabrielAvatar size="sm" />
          <Text style={[staticStyles.gabrielName, { color: '#a78bfa' }]}>
            {currentMode === 'geral' ? 'Gabriel' : activeMode.label}
          </Text>
        </View>

        {parts.map((part, idx) => {
          if (part.type === 'verse') {
            return (
              <VerseCard
                key={idx}
                text={part.content}
                reference={part.reference}
                onSave={() => handleSaveVerse(part.content, part.reference)}
                onShare={() => void handleShareVerse(part.content, part.reference)}
              />
            );
          }

          if (part.type === 'prayer') {
            return (
              <PrayerCard
                key={idx}
                content={part.content}
                colors={colors}
                isSpeaking={speakingMsgId === msg.id}
                onSpeak={() => handleSpeakPrayer(msg.id, part.content)}
                onSave={() => handleSavePrayer(part.content)}
              />
            );
          }

          return (
            <Text key={idx} style={[staticStyles.messageText, { color: colors.text }]}>
              {part.content}
            </Text>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={[staticStyles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[staticStyles.header, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        <TouchableOpacity style={staticStyles.headerLeft} onPress={toggleModeSelector} activeOpacity={0.7}>
          <View style={[staticStyles.iconContainer, { backgroundColor: activeMode.color + '20' }]}>
            {currentMode === 'geral' ? (
              <GabrielAvatar size="md" />
            ) : (
              <Text style={staticStyles.modeEmoji}>{activeMode.emoji}</Text>
            )}
          </View>
          <View style={staticStyles.headerInfo}>
            <View style={staticStyles.headerTitleRow}>
              <Text style={[staticStyles.headerTitle, { color: colors.text }]}>{activeMode.label}</Text>
              <ChevronDown size={14} color={colors.textMuted} />
            </View>
            <Text style={[staticStyles.headerSubtitle, { color: colors.textMuted }]}>
              {currentMode === 'geral' ? 'Seu guia espiritual' : state.preferredTranslation} • {remainingMessages}/5 mensagens
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleClear} style={staticStyles.clearButton}>
          <Trash2 size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {showModeSelector && (
        <Animated.View style={[
          staticStyles.modeSelector,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
          { opacity: modeSelectorAnim, transform: [{ translateY: modeSelectorAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }] },
        ]}>
          {chatModes.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              style={[
                staticStyles.modeOption,
                { backgroundColor: currentMode === mode.id ? mode.color + '15' : 'transparent', borderColor: currentMode === mode.id ? mode.color + '40' : colors.borderLight },
              ]}
              onPress={() => selectMode(mode.id)}
              activeOpacity={0.7}
            >
              {mode.id === 'geral' ? (
                <View style={[staticStyles.modeFlameIcon, { backgroundColor: '#8b5cf6' + '20' }]}>
                  <Flame size={18} color="#8b5cf6" fill="#8b5cf6" />
                </View>
              ) : (
                <Text style={staticStyles.modeOptionEmoji}>{mode.emoji}</Text>
              )}
              <View style={staticStyles.modeOptionInfo}>
                <Text style={[staticStyles.modeOptionLabel, { color: currentMode === mode.id ? mode.color : colors.text }]}>{mode.label}</Text>
                <Text style={[staticStyles.modeOptionDesc, { color: colors.textMuted }]} numberOfLines={1}>{mode.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={staticStyles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          style={staticStyles.messagesContainer}
          contentContainerStyle={staticStyles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        >
          {filteredMessages.length === 0 && (
            <View style={staticStyles.welcomeContainer}>
              {currentMode === 'geral' ? (
                <>
                  <View style={staticStyles.welcomeAvatarLarge}>
                    <Flame size={40} color="#8b5cf6" fill="#8b5cf6" />
                  </View>
                  <Text style={[staticStyles.welcomeTitle, { color: colors.text }]}>Shalom!</Text>
                  <Text style={[staticStyles.welcomeText, { color: colors.textSecondary }]}>
                    Eu sou Gabriel, seu guia espiritual. O que está pesando no seu coração hoje?
                  </Text>
                  <Text style={[staticStyles.welcomeSubtext, { color: colors.textMuted }]}>
                    Estou aqui para ouvir, acolher e trazer a Palavra de Deus para sua vida.
                  </Text>
                </>
              ) : (
                <>
                  <Text style={staticStyles.welcomeEmoji}>{activeMode.emoji}</Text>
                  <Text style={[staticStyles.welcomeTitle, { color: colors.text }]}>{activeMode.label}</Text>
                  <Text style={[staticStyles.welcomeText, { color: colors.textSecondary }]}>
                    {activeMode.description}. Todas as respostas são fundamentadas nas Escrituras.
                  </Text>
                </>
              )}
              <View style={[staticStyles.modeBadge, { backgroundColor: activeMode.color + '15' }]}>
                <Text style={[staticStyles.modeBadgeText, { color: activeMode.color }]}>
                  {currentMode === 'estudo_palavras' && '🔤 Modo Estudo de Palavras Ativo'}
                  {currentMode === 'sermao' && '🎤 Modo Preparação de Sermão Ativo'}
                  {currentMode === 'devocional' && '🕊️ Modo Devocional Pessoal Ativo'}
                  {currentMode === 'teologia' && '⛪ Modo Teologia Comparada Ativo'}
                  {currentMode === 'emocao' && '💙 Modo Busca por Emoção Ativo'}
                  {currentMode === 'geral' && '🔥 Guia Espiritual Ativo'}
                </Text>
              </View>
            </View>
          )}

          {filteredMessages.map((msg) => (
            <Animated.View
              key={msg.id}
              style={[
                staticStyles.messageWrapper,
                msg.role === 'user' ? staticStyles.userWrapper : staticStyles.assistantWrapper,
                { opacity: fadeAnim },
              ]}
            >
              {msg.role === 'user' ? (
                <View style={[staticStyles.messageBubble, staticStyles.userBubble, { backgroundColor: activeMode.color }]}>
                  <Text style={[staticStyles.messageText, staticStyles.userText]}>
                    {msg.content}
                  </Text>
                </View>
              ) : (
                renderAssistantMessage(msg)
              )}
              <View style={staticStyles.messageFooter}>
                <Text style={[staticStyles.timestamp, { color: colors.textMuted }]}>{formatTime(msg.timestamp)}</Text>
                {msg.role === 'assistant' && (
                  <TouchableOpacity
                    style={staticStyles.shareBtn}
                    onPress={() => void handleShareMessage(msg.content)}
                  >
                    <Share2 size={13} color={colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
          ))}

          {isLoading && <TypingDots />}
        </ScrollView>

        {filteredMessages.length <= 1 && !isLoading && (
          <View style={[staticStyles.quickSection, { borderTopColor: colors.border }]}>
            <Text style={[staticStyles.quickTitle, { color: colors.textSecondary }]}>
              {currentMode === 'geral' ? 'Como posso te ajudar?' : `Sugestões — ${activeMode.label}`}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={staticStyles.quickContent}>
              {quickSuggestionsByMode[currentMode].map((s) => (
                <TouchableOpacity
                  key={s.label}
                  style={[staticStyles.quickBtn, { backgroundColor: colors.card, borderColor: activeMode.color + '30' }]}
                  onPress={() => handleQuickSuggestion(s)}
                  activeOpacity={0.7}
                >
                  <Text style={staticStyles.quickEmoji}>{s.emoji}</Text>
                  <Text style={[staticStyles.quickText, { color: colors.text }]}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {!canSendMessage() && (
          <TouchableOpacity
            style={[staticStyles.limitBanner, { backgroundColor: '#8b5cf6' + '15' }]}
            onPress={() => router.push('/paywall' as never)}
            activeOpacity={0.8}
          >
            <Lock size={14} color="#8b5cf6" />
            <Text style={[staticStyles.limitText, { color: '#8b5cf6' }]}>
              Limite atingido · Toque para desbloquear Premium
            </Text>
          </TouchableOpacity>
        )}

        <View style={[staticStyles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <View style={[staticStyles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
            <TextInput
              style={[staticStyles.input, { color: colors.text }]}
              value={input}
              onChangeText={setInput}
              placeholder={
                currentMode === 'geral' ? 'Fale com Gabriel...'
                : currentMode === 'estudo_palavras' ? 'Qual palavra quer estudar...'
                : currentMode === 'sermao' ? 'Qual passagem para o sermão...'
                : 'Como você está hoje...'
              }
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[staticStyles.sendButton, { backgroundColor: activeMode.color }, (!input.trim() || isLoading) && staticStyles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Send size={18} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const staticStyles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  modeEmoji: { fontSize: 20 },
  headerInfo: { flex: 1 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700' as const },
  headerSubtitle: { fontSize: 12, marginTop: 1 },
  clearButton: { padding: 8, borderRadius: 8 },
  modeSelector: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 6,
  },
  modeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  modeFlameIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeOptionEmoji: { fontSize: 24 },
  modeOptionInfo: { flex: 1 },
  modeOptionLabel: { fontSize: 15, fontWeight: '600' as const },
  modeOptionDesc: { fontSize: 12, marginTop: 1 },
  keyboardView: { flex: 1 },
  messagesContainer: { flex: 1 },
  messagesContent: { padding: 16, paddingBottom: 8 },
  welcomeContainer: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 },
  welcomeAvatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#8b5cf6' + '18',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#8b5cf6' + '30',
  },
  welcomeEmoji: { fontSize: 56, marginBottom: 16 },
  welcomeTitle: { fontSize: 24, fontWeight: '800' as const, marginBottom: 10, textAlign: 'center' as const },
  welcomeText: { fontSize: 16, textAlign: 'center' as const, lineHeight: 24, marginBottom: 8 },
  welcomeSubtext: { fontSize: 14, textAlign: 'center' as const, lineHeight: 22, marginBottom: 16 },
  modeBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  modeBadgeText: { fontSize: 13, fontWeight: '600' as const },
  messageWrapper: { marginBottom: 14, maxWidth: '85%' as const },
  userWrapper: { alignSelf: 'flex-end' as const, alignItems: 'flex-end' as const },
  assistantWrapper: { alignSelf: 'flex-start' as const, alignItems: 'flex-start' as const },
  messageBubble: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 18 },
  userBubble: { borderBottomRightRadius: 4 },
  assistantBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  assistantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  gabrielName: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  messageText: { fontSize: 15, lineHeight: 23 },
  userText: { color: '#FFFFFF' },
  // VerseCard, PrayerCard estilos agora estão nos componentes
  messageFooter: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, marginHorizontal: 4 },
  timestamp: { fontSize: 11 },
  shareBtn: { padding: 4 },
  quickSection: { paddingVertical: 12, borderTopWidth: 1 },
  quickTitle: { fontSize: 13, fontWeight: '600' as const, marginBottom: 8, paddingHorizontal: 16 },
  quickContent: { paddingHorizontal: 12, gap: 8 },
  quickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  quickEmoji: { fontSize: 16 },
  quickText: { fontSize: 13, fontWeight: '500' as const },
  limitBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  limitText: { fontSize: 13, fontWeight: '600' as const },
  inputContainer: { padding: 12, borderTopWidth: 1 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 22,
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderWidth: 1,
  },
  input: { flex: 1, fontSize: 15, paddingHorizontal: 14, paddingVertical: 8, maxHeight: 100 },
  sendButton: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  sendButtonDisabled: { opacity: 0.4 },
  // TypingDots estilos agora estão no componente
});
