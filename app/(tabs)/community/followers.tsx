import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { MOCK_USERS, getMockUser } from '@/constants/communityData';
import { usePersonaImages } from '@/hooks/usePersonaImages';
import type { CommunityProfile } from '@/types';

export default function FollowersScreen() {
  const router = useRouter();
  const { userId, tab: initialTab } = useLocalSearchParams<{ userId: string; tab: string }>();
  const { colors, state, followUser, unfollowUser, isFollowing } = useApp();
  const { resolve } = usePersonaImages();
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(
    (initialTab as 'followers' | 'following') || 'followers'
  );

  const isSelf = !userId || userId === 'self';

  const followersList = useMemo((): CommunityProfile[] => {
    if (isSelf) {
      return state.followers
        .map(f => getMockUser(f.userId))
        .filter((u): u is CommunityProfile => u !== undefined);
    }
    // Mock: show random subset of MOCK_USERS as followers
    return MOCK_USERS.filter(u => u.id !== userId).slice(0, 6);
  }, [isSelf, userId, state.followers]);

  const followingList = useMemo((): CommunityProfile[] => {
    if (isSelf) {
      return state.following
        .map(f => getMockUser(f.userId))
        .filter((u): u is CommunityProfile => u !== undefined);
    }
    return MOCK_USERS.filter(u => u.id !== userId).slice(0, 4);
  }, [isSelf, userId, state.following]);

  const currentList = activeTab === 'followers' ? followersList : followingList;

  const handleFollowToggle = useCallback((uid: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isFollowing(uid)) {
      unfollowUser(uid);
    } else {
      followUser(uid);
    }
  }, [isFollowing, followUser, unfollowUser]);

  const renderUser = useCallback(({ item }: { item: CommunityProfile }) => {
    const following = isFollowing(item.id);
    const resolvedPhoto = resolve(item.photo);
    return (
      <TouchableOpacity
        style={styles.userRow}
        onPress={() => router.push(`/community/profile?userId=${item.id}` as never)}
        activeOpacity={0.7}
      >
        {resolvedPhoto ? (
          <Image source={{ uri: resolvedPhoto }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarFallback, { backgroundColor: colors.primaryLight }]}>
            <Text style={styles.avatarEmoji}>{item.avatar}</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={[styles.userName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.userTitle, { color: colors.textMuted }]}>
            Nv.{item.level} • {item.title}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.followBtn,
            {
              backgroundColor: following ? colors.card : colors.primary,
              borderColor: following ? colors.borderLight : colors.primary,
            },
          ]}
          onPress={() => handleFollowToggle(item.id)}
        >
          <Text style={[styles.followBtnText, { color: following ? colors.text : '#FFF' }]}>
            {following ? 'Seguindo' : 'Seguir'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }, [colors, isFollowing, handleFollowToggle, router, resolve]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {isSelf ? 'Meu Perfil' : getMockUser(userId!)?.name || 'Perfil'}
        </Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'followers' && styles.tabActive, activeTab === 'followers' && { borderBottomColor: colors.text }]}
          onPress={() => setActiveTab('followers')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'followers' ? colors.text : colors.textMuted }]}>
            Seguidores
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'following' && styles.tabActive, activeTab === 'following' && { borderBottomColor: colors.text }]}
          onPress={() => setActiveTab('following')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'following' ? colors.text : colors.textMuted }]}>
            Seguindo
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={currentList}
        renderItem={renderUser}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {activeTab === 'followers' ? 'Nenhum seguidor ainda' : 'Não segue ninguém ainda'}
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

  tabs: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: {},
  tabText: { fontSize: 15, fontWeight: '600' },

  listContent: { padding: 16 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  avatarFallback: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  avatarEmoji: { fontSize: 24 },
  userName: { fontSize: 15, fontWeight: '700' },
  userTitle: { fontSize: 12, marginTop: 2 },
  followBtn: { paddingHorizontal: 20, paddingVertical: 7, borderRadius: 8, borderWidth: 1 },
  followBtnText: { fontSize: 13, fontWeight: '700' },

  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 14 },
});
