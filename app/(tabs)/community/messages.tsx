import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, PenSquare } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { getTimeAgo } from '@/constants/communityData';
import { usePersonaImages } from '@/hooks/usePersonaImages';
import type { DMConversation } from '@/types';

export default function MessagesScreen() {
  const router = useRouter();
  const { colors, state } = useApp();
  const { resolve } = usePersonaImages();

  const conversations = useMemo(() => {
    return [...state.dmConversations].sort(
      (a, b) => new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime()
    );
  }, [state.dmConversations]);

  const renderConversation = useCallback(({ item }: { item: DMConversation }) => {
    const resolvedPhoto = resolve(item.participantPhoto);
    return (
    <TouchableOpacity
      style={styles.convRow}
      onPress={() => router.push(`/community/dm-chat?conversationId=${item.id}` as never)}
      activeOpacity={0.7}
    >
      {resolvedPhoto ? (
        <Image source={{ uri: resolvedPhoto }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatarFallback, { backgroundColor: colors.primaryLight }]}>
          <Text style={styles.avatarEmoji}>{item.participantAvatar}</Text>
        </View>
      )}
      <View style={{ flex: 1 }}>
        <View style={styles.convTopRow}>
          <Text style={[styles.convName, { color: colors.text }]}>{item.participantName}</Text>
          <Text style={[styles.convTime, { color: colors.textMuted }]}>
            {item.lastMessageDate ? getTimeAgo(item.lastMessageDate) : ''}
          </Text>
        </View>
        <Text style={[styles.convLastMsg, { color: item.unreadCount > 0 ? colors.text : colors.textMuted, fontWeight: item.unreadCount > 0 ? '600' : '400' }]} numberOfLines={1}>
          {item.lastMessage || 'Inicie a conversa...'}
        </Text>
      </View>
      {item.unreadCount > 0 && (
        <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.unreadText}>{item.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
    );
  }, [colors, router, resolve]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Mensagens</Text>
        <TouchableOpacity onPress={() => router.push('/community/new-message' as never)} style={styles.newBtn}>
          <PenSquare size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhuma conversa</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              Inicie uma conversa com alguém da comunidade
            </Text>
            <TouchableOpacity
              style={[styles.startBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/community/new-message' as never)}
            >
              <Text style={styles.startBtnText}>Nova Mensagem</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', flex: 1, textAlign: 'center' },
  newBtn: { padding: 4 },

  listContent: { paddingHorizontal: 16 },
  convRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  avatarFallback: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  avatarEmoji: { fontSize: 26 },
  convTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  convName: { fontSize: 15, fontWeight: '700' },
  convTime: { fontSize: 12 },
  convLastMsg: { fontSize: 14, marginTop: 2 },
  unreadBadge: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  unreadText: { color: '#FFF', fontSize: 11, fontWeight: '800' },

  emptyState: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptySubtitle: { fontSize: 14, textAlign: 'center', paddingHorizontal: 40 },
  startBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 16 },
  startBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});
