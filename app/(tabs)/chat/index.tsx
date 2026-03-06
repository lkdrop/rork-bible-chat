import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { BookOpen, Send, Trash2, Share2, Lock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useChat } from '@/contexts/ChatContext';
import { useApp } from '@/contexts/AppContext';

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

const quickQuestions = [
  'O que a Bíblia diz sobre ansiedade?',
  'Como orar segundo Jesus?',
  'O que é a graça de Deus?',
  'Quem foi o apóstolo Paulo?',
  'O que significa amar ao próximo?',
  'Como lidar com o medo?',
];

export default function ChatScreen() {
  const { messages, isLoading, sendMessage, clearHistory } = useChat();
  const { state, colors, canSendMessage, recordMessage } = useApp();
  const [input, setInput] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const handleSend = useCallback(async () => {
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
    await sendMessage(text, state.preferredTranslation);
  }, [input, isLoading, sendMessage, state.preferredTranslation, canSendMessage, recordMessage]);

  const handleQuickQuestion = useCallback(async (question: string) => {
    if (isLoading) return;
    if (!canSendMessage()) {
      Alert.alert('Limite diário atingido', 'Você usou suas 5 mensagens gratuitas de hoje.');
      return;
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    recordMessage();
    await sendMessage(question, state.preferredTranslation);
  }, [isLoading, sendMessage, state.preferredTranslation, canSendMessage, recordMessage]);

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

  return (
    <SafeAreaView style={[staticStyles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[staticStyles.header, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        <View style={staticStyles.headerLeft}>
          <View style={[staticStyles.iconContainer, { backgroundColor: colors.primary }]}>
            <BookOpen size={22} color="#FFF" />
          </View>
          <View>
            <Text style={[staticStyles.headerTitle, { color: colors.text }]}>Bíblia IA</Text>
            <Text style={[staticStyles.headerSubtitle, { color: colors.textMuted }]}>{state.preferredTranslation} • {remainingMessages}/5 mensagens</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleClear} style={staticStyles.clearButton}>
          <Trash2 size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

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
          {messages.length === 0 && (
            <View style={staticStyles.welcomeContainer}>
              <Text style={staticStyles.welcomeEmoji}>📖</Text>
              <Text style={[staticStyles.welcomeTitle, { color: colors.text }]}>Chat Bíblico com IA</Text>
              <Text style={[staticStyles.welcomeText, { color: colors.textSecondary }]}>
                Pergunte qualquer coisa sobre a Bíblia, versículos, personagens ou ensinamentos. Todas as respostas são fundamentadas nas Escrituras.
              </Text>
            </View>
          )}

          {messages.map((msg) => (
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
                  ? [staticStyles.userBubble, { backgroundColor: colors.primary }]
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

        {messages.length <= 1 && !isLoading && (
          <View style={[staticStyles.quickSection, { borderTopColor: colors.border }]}>
            <Text style={[staticStyles.quickTitle, { color: colors.textSecondary }]}>Sugestões</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={staticStyles.quickContent}>
              {quickQuestions.map((q) => (
                <TouchableOpacity
                  key={q}
                  style={[staticStyles.quickBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => void handleQuickQuestion(q)}
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
              placeholder="Pergunte sobre a Bíblia..."
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={() => void handleSend()}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[staticStyles.sendButton, { backgroundColor: colors.primary }, (!input.trim() || isLoading) && staticStyles.sendButtonDisabled]}
              onPress={() => void handleSend()}
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
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconContainer: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700' as const },
  headerSubtitle: { fontSize: 12, marginTop: 1 },
  clearButton: { padding: 8, borderRadius: 8 },
  keyboardView: { flex: 1 },
  messagesContainer: { flex: 1 },
  messagesContent: { padding: 16, paddingBottom: 8 },
  welcomeContainer: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 },
  welcomeEmoji: { fontSize: 56, marginBottom: 16 },
  welcomeTitle: { fontSize: 22, fontWeight: '700' as const, marginBottom: 10, textAlign: 'center' as const },
  welcomeText: { fontSize: 15, textAlign: 'center' as const, lineHeight: 22 },
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
