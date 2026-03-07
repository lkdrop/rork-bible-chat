import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Send } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { DM_AUTO_RESPONSES, getTimeAgo } from '@/constants/communityData';
import { usePersonaImages } from '@/hooks/usePersonaImages';
import type { DirectMessage } from '@/types';

export default function DMChatScreen() {
  const router = useRouter();
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const { colors, state, sendDM, markConversationRead, receiveDM } = useApp();
  const { resolve } = usePersonaImages();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const conversation = useMemo(() => {
    return state.dmConversations.find(c => c.id === conversationId);
  }, [state.dmConversations, conversationId]);

  useEffect(() => {
    if (conversationId) {
      markConversationRead(conversationId);
    }
  }, [conversationId, markConversationRead]);

  const handleSend = useCallback(() => {
    if (!message.trim() || !conversationId || !conversation) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sendDM(conversationId, message.trim());
    setMessage('');

    // Auto-response from mock user
    const participantId = conversation.participantId;
    const responses = DM_AUTO_RESPONSES[participantId];
    if (responses) {
      setIsTyping(true);
      const delay = 1500 + Math.random() * 2000;
      setTimeout(() => {
        setIsTyping(false);
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        receiveDM(conversationId, participantId, randomResponse);
      }, delay);
    }
  }, [message, conversationId, conversation, sendDM, receiveDM]);

  const renderMessage = useCallback(({ item }: { item: DirectMessage }) => {
    const isMine = item.senderId === 'self';
    return (
      <View style={[styles.msgRow, isMine && styles.msgRowRight]}>
        <View style={[
          styles.msgBubble,
          isMine
            ? { backgroundColor: colors.primary }
            : { backgroundColor: colors.card },
        ]}>
          <Text style={[styles.msgText, { color: isMine ? '#FFF' : colors.text }]}>
            {item.content}
          </Text>
          <Text style={[styles.msgTime, { color: isMine ? 'rgba(255,255,255,0.6)' : colors.textMuted }]}>
            {getTimeAgo(item.date)}
          </Text>
        </View>
      </View>
    );
  }, [colors]);

  if (!conversation) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Conversa</Text>
          <View style={{ width: 30 }} />
        </View>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>Conversa não encontrada</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerUser}
          onPress={() => router.push(`/community/profile?userId=${conversation.participantId}` as never)}
        >
          {resolve(conversation.participantPhoto) ? (
            <Image source={{ uri: resolve(conversation.participantPhoto)! }} style={styles.headerAvatar} />
          ) : (
            <View style={[styles.headerAvatarFallback, { backgroundColor: colors.primaryLight }]}>
              <Text style={styles.headerAvatarEmoji}>{conversation.participantAvatar}</Text>
            </View>
          )}
          <View>
            <Text style={[styles.headerName, { color: colors.text }]}>{conversation.participantName}</Text>
            {isTyping && <Text style={[styles.typingText, { color: colors.primary }]}>Digitando...</Text>}
          </View>
        </TouchableOpacity>
        <View style={{ width: 30 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        <FlatList
          ref={flatListRef}
          data={conversation.messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Text style={styles.emptyChatEmoji}>👋</Text>
              <Text style={[styles.emptyChatText, { color: colors.textMuted }]}>
                Comece a conversa com {conversation.participantName}
              </Text>
            </View>
          }
        />

        <View style={[styles.inputBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.borderLight }]}
            placeholder="Mensagem..."
            placeholderTextColor={colors.textMuted}
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: message.trim() ? colors.primary : colors.card }]}
            onPress={handleSend}
            disabled={!message.trim()}
          >
            <Send size={18} color={message.trim() ? '#FFF' : colors.textMuted} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10, borderBottomWidth: 0.5 },
  backBtn: { padding: 4 },
  headerUser: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar: { width: 36, height: 36, borderRadius: 18 },
  headerAvatarFallback: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  headerAvatarEmoji: { fontSize: 18 },
  headerName: { fontSize: 16, fontWeight: '700' },
  headerTitle: { fontSize: 20, fontWeight: '700', flex: 1, textAlign: 'center' },
  typingText: { fontSize: 12, fontWeight: '500' },

  messagesList: { padding: 16, paddingBottom: 8 },
  msgRow: { marginBottom: 8, alignItems: 'flex-start' },
  msgRowRight: { alignItems: 'flex-end' },
  msgBubble: { maxWidth: '75%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  msgText: { fontSize: 15, lineHeight: 21 },
  msgTime: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },

  inputBar: { flexDirection: 'row', alignItems: 'flex-end', padding: 10, gap: 8, borderTopWidth: 0.5 },
  textInput: { flex: 1, borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 100 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },

  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 14 },
  emptyChat: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyChatEmoji: { fontSize: 40 },
  emptyChatText: { fontSize: 14, textAlign: 'center' },
});
