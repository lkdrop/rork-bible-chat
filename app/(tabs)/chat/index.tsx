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
import {
  Send,
  Trash2,
  Share2,
  Lock,
  ChevronDown,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useChat } from '@/contexts/ChatContext';
import { useApp } from '@/contexts/AppContext';

type ChatMode = 'geral' | 'estudo_palavras' | 'sermao' | 'devocional';

interface ModeOption {
  id: ChatMode;
  label: string;
  emoji: string;
  description: string;
  color: string;
}

const chatModes: ModeOption[] = [
  { id: 'geral', label: 'Bíblia IA', emoji: '📖', description: 'Perguntas gerais sobre a Bíblia', color: '#C5943A' },
  { id: 'estudo_palavras', label: 'Grego & Hebraico', emoji: '🔤', description: 'Significado original das palavras', color: '#3B82F6' },
  { id: 'sermao', label: 'Prep. Sermão', emoji: '🎤', description: 'Ajuda para preparar sermões', color: '#10B981' },
  { id: 'devocional', label: 'Devocional', emoji: '🕊️', description: 'Reflexão personalizada para você', color: '#8B5CF6' },
];

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
- NÃO responda perguntas fora do contexto bíblico`;

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
- NÃO responda perguntas fora do contexto bíblico ou de pregação`;

    case 'devocional':
      return `Você é um companheiro devocional cristão amoroso e pessoal. ${base}
REGRAS:
- Gere reflexões personalizadas baseadas no que o usuário compartilha
- Use tom pastoral, íntimo e encorajador
- Inclua uma oração no final de cada reflexão
- Baseie tudo em versículos bíblicos
- Pergunte como o usuário está se sentindo para personalizar
- Sugira ações práticas de fé para o dia
- Seja sensível a momentos de dor, luto ou dificuldade
- NÃO responda perguntas fora do contexto espiritual`;

    default:
      return `Você é um companheiro espiritual cristão baseado na Bíblia Sagrada. Seu nome é Bíblia IA. Use a tradução ${translation} como referência principal.

IDENTIDADE:
Você fala com amor, fé e sabedoria bíblica. Seu tom é acolhedor, encorajador e pastoral — como um pastor ou líder espiritual de confiança. Nunca frio ou robótico.

MISSÃO:
Ajudar o usuário a encontrar conforto, direção e crescimento espiritual através da Palavra de Deus. Você conecta cada situação da vida real a passagens bíblicas relevantes, com aplicação prática e oração.

COMO RESPONDER:
1. Acolha o que o usuário compartilhou com empatia genuína
2. Traga 1 a 3 versículos diretamente relacionados ao tema
3. Explique o versículo de forma simples e aplicada à vida real
4. Termine com uma oração curta personalizada para a situação, quando pertinente

REGRAS:
- ${base}
- Use sempre a Bíblia como fonte central — nunca opiniões pessoais ou doutrinas não bíblicas
- Cite a referência dos versículos (ex: João 3:16, Salmos 23:1)
- Fale em Português do Brasil, com linguagem acessível mas reverente
- Se o usuário estiver passando por dor, luto ou crise, priorize acolhimento antes de instrução
- Não entre em debates denominacionais ou políticos
- Se a pergunta fugir completamente do âmbito espiritual/bíblico, redirecione gentilmente

CONTEXTO DO USUÁRIO:
O usuário é cristão evangélico brasileiro buscando crescimento espiritual, respostas para a vida e conexão com Deus no dia a dia.

Comece cada nova conversa perguntando: "Como posso orar por você hoje, ou qual Palavra você precisa receber?"`;
  }
}

const quickQuestionsByMode: Record<ChatMode, string[]> = {
  geral: [
    'O que a Bíblia diz sobre ansiedade?',
    'Como orar segundo Jesus?',
    'O que é a graça de Deus?',
    'Quem foi o apóstolo Paulo?',
    'O que significa amar ao próximo?',
    'Como lidar com o medo?',
  ],
  estudo_palavras: [
    'Qual o significado de "agape" em grego?',
    'O que significa "shalom" em hebraico?',
    'Qual a diferença entre "logos" e "rhema"?',
    'O que significa "ruach" (espírito) no hebraico?',
    'Explique "chesed" (misericórdia) no AT',
    'O que significa "sozo" (salvar) em grego?',
  ],
  sermao: [
    'Esboço de sermão sobre Filipenses 4:13',
    'Ilustrações para pregar sobre fé',
    'Referências cruzadas para João 3:16',
    'Como pregar sobre perdão com 3 pontos',
    'Esboço temático sobre esperança',
    'Aplicações práticas de Romanos 8:28',
  ],
  devocional: [
    'Estou passando por um momento difícil',
    'Preciso de uma palavra de encorajamento',
    'Como ter mais intimidade com Deus?',
    'Me ajude a meditar em um versículo hoje',
    'Estou com medo do futuro',
    'Uma oração para começar bem o dia',
  ],
};

function TypingDots() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ])
      );
    const a1 = animate(dot1, 0);
    const a2 = animate(dot2, 200);
    const a3 = animate(dot3, 400);
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, [dot1, dot2, dot3]);

  return (
    <View style={staticStyles.typingContainer}>
      <View style={staticStyles.typingBubble}>
        <View style={staticStyles.typingDots}>
          <Animated.View style={[staticStyles.dot, { opacity: dot1, transform: [{ scale: dot1 }] }]} />
          <Animated.View style={[staticStyles.dot, { opacity: dot2, transform: [{ scale: dot2 }] }]} />
          <Animated.View style={[staticStyles.dot, { opacity: dot3, transform: [{ scale: dot3 }] }]} />
        </View>
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const { messages: allMessages, isLoading, sendMessage, clearHistory, agentError } = useChat();
  const { state, colors, canSendMessage, recordMessage } = useApp();
  const [input, setInput] = useState('');
  const [currentMode, setCurrentMode] = useState<ChatMode>('geral');
  const [showModeSelector, setShowModeSelector] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const modeSelectorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (agentError) {
      console.log('[ChatScreen] Agent error detected:', agentError);
    }
  }, [agentError]);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, [fadeAnim]);

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
    setCurrentMode(mode);
    setShowModeSelector(false);
    Animated.spring(modeSelectorAnim, {
      toValue: 0,
      tension: 80,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [modeSelectorAnim]);

  const handleSend = useCallback(() => {
    if (!input.trim() || isLoading) return;

    if (!canSendMessage()) {
      Alert.alert(
        'Limite diário atingido',
        'Você usou suas 5 mensagens gratuitas de hoje. Volte amanhã ou assine o Premium para mensagens ilimitadas!',
        [{ text: 'OK' }]
      );
      return;
    }

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const text = input;
    setInput('');
    recordMessage();
    const systemPrompt = getSystemPrompt(currentMode, state.preferredTranslation);
    void sendMessage(text, state.preferredTranslation, systemPrompt, currentMode);
  }, [input, isLoading, sendMessage, state.preferredTranslation, canSendMessage, recordMessage, currentMode]);

  const handleQuickQuestion = useCallback((question: string) => {
    if (isLoading) return;
    if (!canSendMessage()) {
      Alert.alert('Limite diário atingido', 'Você usou suas 5 mensagens gratuitas de hoje.');
      return;
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    recordMessage();
    const systemPrompt = getSystemPrompt(currentMode, state.preferredTranslation);
    void sendMessage(question, state.preferredTranslation, systemPrompt, currentMode);
  }, [isLoading, sendMessage, state.preferredTranslation, canSendMessage, recordMessage, currentMode]);

  const handleShareMessage = useCallback(async (content: string) => {
    try {
      await Share.share({ message: content + '\n\nEnviado pelo Bíblia IA' });
    } catch (e) {
      console.log('Share error:', e);
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

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const remainingMessages = canSendMessage()
    ? 5 - (state.lastMessageDate === new Date().toDateString() ? state.dailyMessageCount : 0)
    : 0;

  const filteredMessages = useMemo(() =>
    allMessages.filter(m => m.mode === currentMode || !m.mode),
    [allMessages, currentMode]
  );

  const activeMode = chatModes.find(m => m.id === currentMode) ?? chatModes[0];

  return (
    <SafeAreaView style={[staticStyles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[staticStyles.header, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        <TouchableOpacity style={staticStyles.headerLeft} onPress={toggleModeSelector} activeOpacity={0.7}>
          <View style={[staticStyles.iconContainer, { backgroundColor: activeMode.color }]}>
            <Text style={staticStyles.modeEmoji}>{activeMode.emoji}</Text>
          </View>
          <View style={staticStyles.headerInfo}>
            <View style={staticStyles.headerTitleRow}>
              <Text style={[staticStyles.headerTitle, { color: colors.text }]}>{activeMode.label}</Text>
              <ChevronDown size={14} color={colors.textMuted} />
            </View>
            <Text style={[staticStyles.headerSubtitle, { color: colors.textMuted }]}>{state.preferredTranslation} • {remainingMessages}/5 mensagens</Text>
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
              <Text style={staticStyles.modeOptionEmoji}>{mode.emoji}</Text>
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
              <Text style={staticStyles.welcomeEmoji}>{activeMode.emoji}</Text>
              <Text style={[staticStyles.welcomeTitle, { color: colors.text }]}>{activeMode.label}</Text>
              <Text style={[staticStyles.welcomeText, { color: colors.textSecondary }]}>
                {activeMode.description}. Todas as respostas são fundamentadas nas Escrituras.
              </Text>
              <View style={[staticStyles.modeBadge, { backgroundColor: activeMode.color + '15' }]}>
                <Text style={[staticStyles.modeBadgeText, { color: activeMode.color }]}>
                  {currentMode === 'estudo_palavras' && '🔤 Modo Estudo de Palavras Ativo'}
                  {currentMode === 'sermao' && '🎤 Modo Preparação de Sermão Ativo'}
                  {currentMode === 'devocional' && '🕊️ Modo Devocional Pessoal Ativo'}
                  {currentMode === 'geral' && '📖 Modo Perguntas Gerais Ativo'}
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
              <View style={[
                staticStyles.messageBubble,
                msg.role === 'user'
                  ? [staticStyles.userBubble, { backgroundColor: activeMode.color }]
                  : [staticStyles.assistantBubble, { backgroundColor: colors.card, borderColor: colors.border }],
              ]}>
                <Text style={[
                  staticStyles.messageText,
                  msg.role === 'user' ? staticStyles.userText : { color: colors.text },
                ]}>
                  {msg.content}
                </Text>
              </View>
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
            <Text style={[staticStyles.quickTitle, { color: colors.textSecondary }]}>Sugestões — {activeMode.label}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={staticStyles.quickContent}>
              {quickQuestionsByMode[currentMode].map((q) => (
                <TouchableOpacity
                  key={q}
                  style={[staticStyles.quickBtn, { backgroundColor: colors.card, borderColor: activeMode.color + '30' }]}
                  onPress={() => handleQuickQuestion(q)}
                  activeOpacity={0.7}
                >
                  <Text style={[staticStyles.quickText, { color: colors.text }]}>{q}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {!canSendMessage() && (
          <View style={[staticStyles.limitBanner, { backgroundColor: colors.primaryLight }]}>
            <Lock size={14} color={colors.primary} />
            <Text style={[staticStyles.limitText, { color: colors.primary }]}>
              Limite diário atingido. Volte amanhã!
            </Text>
          </View>
        )}

        <View style={[staticStyles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <View style={[staticStyles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
            <TextInput
              style={[staticStyles.input, { color: colors.text }]}
              value={input}
              onChangeText={setInput}
              placeholder={
                currentMode === 'estudo_palavras' ? 'Qual palavra quer estudar...'
                : currentMode === 'sermao' ? 'Qual passagem para o sermão...'
                : currentMode === 'devocional' ? 'Como você está hoje...'
                : 'Pergunte sobre a Bíblia...'
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
  iconContainer: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
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
  modeOptionEmoji: { fontSize: 24 },
  modeOptionInfo: { flex: 1 },
  modeOptionLabel: { fontSize: 15, fontWeight: '600' as const },
  modeOptionDesc: { fontSize: 12, marginTop: 1 },
  keyboardView: { flex: 1 },
  messagesContainer: { flex: 1 },
  messagesContent: { padding: 16, paddingBottom: 8 },
  welcomeContainer: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 },
  welcomeEmoji: { fontSize: 56, marginBottom: 16 },
  welcomeTitle: { fontSize: 22, fontWeight: '700' as const, marginBottom: 10, textAlign: 'center' as const },
  welcomeText: { fontSize: 15, textAlign: 'center' as const, lineHeight: 22, marginBottom: 16 },
  modeBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  modeBadgeText: { fontSize: 13, fontWeight: '600' as const },
  messageWrapper: { marginBottom: 14, maxWidth: '82%' as const },
  userWrapper: { alignSelf: 'flex-end' as const, alignItems: 'flex-end' as const },
  assistantWrapper: { alignSelf: 'flex-start' as const, alignItems: 'flex-start' as const },
  messageBubble: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 18 },
  userBubble: { borderBottomRightRadius: 4 },
  assistantBubble: { borderBottomLeftRadius: 4, borderWidth: 1 },
  messageText: { fontSize: 15, lineHeight: 22 },
  userText: { color: '#FFFFFF' },
  messageFooter: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, marginHorizontal: 4 },
  timestamp: { fontSize: 11 },
  shareBtn: { padding: 4 },
  quickSection: { paddingVertical: 12, borderTopWidth: 1 },
  quickTitle: { fontSize: 13, fontWeight: '600' as const, marginBottom: 8, paddingHorizontal: 16 },
  quickContent: { paddingHorizontal: 12, gap: 8 },
  quickBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, borderWidth: 1 },
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
  typingContainer: { alignSelf: 'flex-start', marginBottom: 16 },
  typingBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E8E2D5',
  },
  typingDots: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#C5943A' },
});
