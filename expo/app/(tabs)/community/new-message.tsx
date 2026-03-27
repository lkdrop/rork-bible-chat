import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { MOCK_USERS } from '@/constants/communityData';
import { usePersonaImages } from '@/hooks/usePersonaImages';
import type { CommunityProfile } from '@/types';

export default function NewMessageScreen() {
  const router = useRouter();
  const { colors, startDMConversation } = useApp();
  const { resolve } = usePersonaImages();
  const [search, setSearch] = useState('');

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return MOCK_USERS;
    const q = search.toLowerCase();
    return MOCK_USERS.filter(u => u.name.toLowerCase().includes(q));
  }, [search]);

  const handleSelect = useCallback((user: CommunityProfile) => {
    const convId = startDMConversation(user.id, user.name, user.avatar, user.photo);
    router.replace(`/community/dm-chat?conversationId=${convId}` as never);
  }, [startDMConversation, router]);

  const renderUser = useCallback(({ item }: { item: CommunityProfile }) => {
    const resolvedPhoto = resolve(item.photo);
    return (
      <TouchableOpacity style={styles.userRow} onPress={() => handleSelect(item)} activeOpacity={0.7}>
        {resolvedPhoto ? (
          <Image source={{ uri: resolvedPhoto }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarFallback, { backgroundColor: colors.primaryLight }]}>
            <Text style={styles.avatarEmoji}>{item.avatar}</Text>
          </View>
        )}
        <View>
          <Text style={[styles.userName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.userTitle, { color: colors.textMuted }]}>
            Nv.{item.level} • {item.title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, [colors, handleSelect, resolve]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Nova Mensagem</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Search size={18} color={colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Buscar pessoa..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={renderUser}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Nenhum usuário encontrado
            </Text>
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

  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, paddingHorizontal: 14, paddingVertical: 4, borderRadius: 12, borderWidth: 1, gap: 10, marginBottom: 8 },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 10 },

  listContent: { paddingHorizontal: 16 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  avatarFallback: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  avatarEmoji: { fontSize: 24 },
  userName: { fontSize: 15, fontWeight: '700' },
  userTitle: { fontSize: 12, marginTop: 2 },

  emptyState: { alignItems: 'center', paddingTop: 40 },
  emptyText: { fontSize: 14 },
});
