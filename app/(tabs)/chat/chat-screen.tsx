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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, Send, Trash2 } from 'lucide-react-native';

import { Colors } from '@/constants/colors';
import { quickQuestions } from '@/constants/quickQuestions';
import { useChat } from '@/contexts/ChatContext';
import { usePrayerGuide } from '@/contexts/PrayerGuideContext';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

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
    a1.start();
    a2.start();
    a3.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.typingContainer}>
      <View style={styles.typingBubble}>
        <View style={styles.typingDots}>
          <Animated.View style={[styles.dot, { opacity: dot1, transform: [{ scale: dot1 }] }]} />
          <Animated.View style={[styles.dot, { opacity: dot2, transform: [{ scale: dot2 }] }]} />
          <Animated.View style={[styles.dot, { opacity: dot3, transform: [{ scale: dot3 }] }]} />
        </View>
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const { messages, isLoading, hasSeenWelcome, markWelcomeSeen, sendMessage, clearHistory, addWelcomeMessage } = useChat();
  const { incrementChatCount } = usePrayerGuide();
  const [input, setInput] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!hasSeenWelcome) {
      addWelcomeMessage();
      void markWelcomeSeen();
    }
  }, [hasSeenWelcome, addWelcomeMessage, markWelcomeSeen]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    const text = input;
    setInput('');
    void incrementChatCount();
    await sendMessage(text);
  }, [input, isLoading, sendMessage, incrementChatCount]);

  const handleQuickQuestion = useCallback((question: string) => {
    void incrementChatCount();
    void sendMessage(question);
  }, [sendMessage, incrementChatCount]);

  const handleClear = useCallback(() => {
    void clearHistory();
    addWelcomeMessage();
  }, [clearHistory, addWelcomeMessage]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <BookOpen size={24} color={Colors.text.light} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Chat Bíblico IA</Text>
            <Text style={styles.headerSubtitle}>Seu companheiro espiritual</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <Trash2 size={20} color={Colors.accent.gold} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 && (
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeEmoji}>📖</Text>
              <Text style={styles.welcomeTitle}>Bem-vindo ao Chat Bíblico</Text>
              <Text style={styles.welcomeText}>
                Pergunte-me qualquer coisa sobre a Bíblia, Escrituras ou fé cristã. Estou aqui para ajudá-lo a explorar a Palavra de Deus.
              </Text>
            </View>
          )}

          {messages.map((msg) => (
            <Animated.View
              key={msg.id}
              style={[
                styles.messageWrapper,
                msg.role === 'user' ? styles.userWrapper : styles.assistantWrapper,
                { opacity: fadeAnim },
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  msg.role === 'user' ? styles.userBubble : styles.assistantBubble,
                ]}
              >
                <Text style={[
                  styles.messageText,
                  msg.role === 'user' ? styles.userText : styles.assistantText,
                ]}>
                  {msg.content}
                </Text>
              </View>
              <Text style={styles.timestamp}>{formatTime(msg.timestamp)}</Text>
            </Animated.View>
          ))}

          {isLoading && <TypingDots />}
        </ScrollView>

        {messages.length <= 1 && !isLoading && (
          <View style={styles.quickQuestionsContainer}>
            <Text style={styles.quickQuestionsTitle}>Perguntas Rápidas</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickQuestionsContent}
            >
              {quickQuestions.map((question) => (
                <AnimatedTouchable
                  key={question}
                  style={styles.quickQuestionButton}
                  onPress={() => handleQuickQuestion(question)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.quickQuestionText}>{question}</Text>
                </AnimatedTouchable>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Pergunte sobre as Escrituras..."
              placeholderTextColor={Colors.text.muted}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!input.trim() || isLoading) && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={Colors.text.light} />
              ) : (
                <Send size={20} color={Colors.text.light} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.primary.navy,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.accent.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.light,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.accent.goldLight,
    marginTop: 2,
  },
  clearButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  welcomeEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.primary.navy,
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  messageWrapper: {
    marginBottom: 16,
    maxWidth: '85%',
  },
  userWrapper: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  assistantWrapper: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: Colors.shadow.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: Colors.message.user[0],
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: Colors.message.assistant,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.message.assistantBorder,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: Colors.text.light,
  },
  assistantText: {
    color: Colors.text.primary,
  },
  timestamp: {
    fontSize: 11,
    color: Colors.text.muted,
    marginTop: 4,
    marginHorizontal: 4,
  },
  typingContainer: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  typingBubble: {
    backgroundColor: Colors.message.assistant,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.message.assistantBorder,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.accent.gold,
  },
  quickQuestionsContainer: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    backgroundColor: Colors.background.cream,
  },
  quickQuestionsTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  quickQuestionsContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  quickQuestionButton: {
    backgroundColor: Colors.background.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.accent.goldLight,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 1,
  },
  quickQuestionText: {
    fontSize: 14,
    color: Colors.primary.navy,
    fontWeight: '500' as const,
  },
  inputContainer: {
    padding: 12,
    backgroundColor: Colors.background.white,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.background.cream,
    borderRadius: 24,
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.accent.goldLight,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary.navy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.text.muted,
  },
});
