import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Settings, Grid3x3, MessageCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { getMockUser, MOCK_USERS, MOCK_FEED_POSTS, communityAvatars } from '@/constants/communityData';
import { getLevelForXP } from '@/constants/levels';
import { usePersonaImages } from '@/hooks/usePersonaImages';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_SIZE = (SCREEN_WIDTH - 4) / 3;

export default function ProfileScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { colors, state, setCommunityProfile, setCommunityPhoto, setCommunityBio, followUser, unfollowUser, isFollowing, startDMConversation } = useApp();
  const { resolve, revision } = usePersonaImages();

  const [editModal, setEditModal] = useState(false);
  const [editName, setEditName] = useState(state.communityName || '');
  const [editBio, setEditBio] = useState(state.communityBio || '');
  const [editAvatar, setEditAvatar] = useState(state.communityAvatar);

  const isSelf = !userId || userId === 'self';

  const profile = useMemo(() => {
    if (isSelf) {
      const level = getLevelForXP(state.xp);
      return {
        id: 'self',
        name: state.communityName || 'Seu nome',
        avatar: state.communityAvatar,
        photo: state.communityPhoto || null,
        bio: state.communityBio || '',
        level: level.level,
        title: level.title,
        xp: state.xp,
        postCount: state.communityPosts.length,
        followerCount: state.followers.length,
        followingCount: state.following.length,
      };
    }
    const mock = getMockUser(userId!) || MOCK_USERS[0];
    return { ...mock, photo: resolve(mock.photo) || null };
  }, [isSelf, userId, state, resolve, revision]);

  const userPosts = useMemo(() => {
    if (isSelf) {
      return state.communityPosts;
    }
    return MOCK_FEED_POSTS.filter(p => p.userId === userId).map(p => ({
      ...p,
      images: (p.images || []).map(img => resolve(img)).filter((img): img is string => img !== null),
    }));
  }, [isSelf, userId, state.communityPosts, resolve, revision]);

  const following = !isSelf && isFollowing(userId!);

  const handleFollow = useCallback(() => {
    if (!userId) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (following) {
      unfollowUser(userId);
    } else {
      followUser(userId);
    }
  }, [userId, following, followUser, unfollowUser]);

  const handleMessage = useCallback(() => {
    if (!userId || !profile) return;
    const convId = startDMConversation(userId, profile.name, profile.avatar, profile.photo);
    router.push(`/community/dm-chat?conversationId=${convId}` as never);
  }, [userId, profile, startDMConversation, router]);

  const handlePickPhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setCommunityPhoto(result.assets[0].uri);
    }
  }, [setCommunityPhoto]);

  const handleSaveProfile = useCallback(() => {
    if (!editName.trim()) {
      Alert.alert('Nome obrigatório', 'Digite seu nome.');
      return;
    }
    setCommunityProfile(editName.trim(), editAvatar);
    setCommunityBio(editBio.trim());
    setEditModal(false);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [editName, editAvatar, editBio, setCommunityProfile, setCommunityBio]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {profile.name}
        </Text>
        {isSelf && (
          <TouchableOpacity onPress={() => setEditModal(true)} style={styles.settingsBtn}>
            <Settings size={22} color={colors.text} />
          </TouchableOpacity>
        )}
        {!isSelf && <View style={{ width: 30 }} />}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={isSelf ? handlePickPhoto : undefined} activeOpacity={isSelf ? 0.7 : 1}>
            {profile.photo ? (
              <Image source={{ uri: profile.photo }} style={styles.profilePhoto} />
            ) : (
              <View style={[styles.profilePhotoFallback, { backgroundColor: colors.primaryLight }]}>
                <Text style={styles.profileEmoji}>{profile.avatar}</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.text }]}>{profile.postCount}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Posts</Text>
            </View>
            <TouchableOpacity
              style={styles.statItem}
              onPress={() => router.push(`/community/followers?userId=${profile.id}&tab=followers` as never)}
            >
              <Text style={[styles.statNumber, { color: colors.text }]}>{profile.followerCount}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Seguidores</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.statItem}
              onPress={() => router.push(`/community/followers?userId=${profile.id}&tab=following` as never)}
            >
              <Text style={[styles.statNumber, { color: colors.text }]}>{profile.followingCount}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Seguindo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Name & Bio */}
        <View style={styles.bioSection}>
          <Text style={[styles.displayName, { color: colors.text }]}>{profile.name}</Text>
          <View style={[styles.titleBadge, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.titleText, { color: colors.primary }]}>Nv.{profile.level} • {profile.title}</Text>
          </View>
          {profile.bio ? (
            <Text style={[styles.bioText, { color: colors.textSecondary }]}>{profile.bio}</Text>
          ) : null}
        </View>

        {/* Action Buttons */}
        {isSelf ? (
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.editBtn, { backgroundColor: colors.card, borderColor: colors.borderLight }]} onPress={() => setEditModal(true)}>
              <Text style={[styles.editBtnText, { color: colors.text }]}>Editar Perfil</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.followBtn, { backgroundColor: following ? colors.card : colors.primary, borderColor: following ? colors.borderLight : colors.primary }]}
              onPress={handleFollow}
            >
              <Text style={[styles.followBtnText, { color: following ? colors.text : '#FFF' }]}>
                {following ? 'Seguindo' : 'Seguir'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.messageBtn, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
              onPress={handleMessage}
            >
              <MessageCircle size={16} color={colors.text} />
              <Text style={[styles.messageBtnText, { color: colors.text }]}>Mensagem</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Posts Grid */}
        <View style={[styles.gridHeader, { borderTopColor: colors.border }]}>
          <Grid3x3 size={20} color={colors.text} />
        </View>

        <View style={styles.postsGrid}>
          {userPosts.map(post => (
            <View key={post.id} style={styles.gridItem}>
              {post.images && post.images.length > 0 ? (
                <Image source={{ uri: post.images[0] }} style={styles.gridImage} />
              ) : (
                <View style={[styles.gridTextPost, { backgroundColor: colors.card }]}>
                  <Text style={[styles.gridPostText, { color: colors.text }]} numberOfLines={4}>
                    {post.content}
                  </Text>
                </View>
              )}
            </View>
          ))}
          {userPosts.length === 0 && (
            <View style={styles.noPostsContainer}>
              <Text style={[styles.noPostsText, { color: colors.textMuted }]}>Nenhum post ainda</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setEditModal(false)}>
                <Text style={[styles.modalCancel, { color: colors.textMuted }]}>Cancelar</Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Editar Perfil</Text>
              <TouchableOpacity onPress={handleSaveProfile}>
                <Text style={[styles.modalSave, { color: colors.primary }]}>Salvar</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <TouchableOpacity style={styles.photoEdit} onPress={handlePickPhoto}>
                {state.communityPhoto ? (
                  <Image source={{ uri: state.communityPhoto }} style={styles.editPhoto} />
                ) : (
                  <View style={[styles.editPhotoFallback, { backgroundColor: colors.primaryLight }]}>
                    <Text style={styles.editPhotoEmoji}>{editAvatar}</Text>
                  </View>
                )}
                <Text style={[styles.changePhotoText, { color: colors.primary }]}>Alterar foto</Text>
              </TouchableOpacity>

              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Nome</Text>
              <TextInput
                style={[styles.fieldInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                value={editName}
                onChangeText={setEditName}
                placeholder="Seu nome"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Bio</Text>
              <TextInput
                style={[styles.fieldInput, styles.bioInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                value={editBio}
                onChangeText={setEditBio}
                placeholder="Conte sobre você..."
                placeholderTextColor={colors.textMuted}
                multiline
                maxLength={150}
              />

              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Avatar Emoji</Text>
              <View style={styles.avatarGrid}>
                {communityAvatars.map(emoji => (
                  <TouchableOpacity
                    key={emoji}
                    style={[
                      styles.avatarOption,
                      { backgroundColor: editAvatar === emoji ? colors.primaryLight : colors.card, borderColor: editAvatar === emoji ? colors.primary : colors.borderLight },
                    ]}
                    onPress={() => setEditAvatar(emoji)}
                  >
                    <Text style={styles.avatarOptionEmoji}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', flex: 1, textAlign: 'center' },
  settingsBtn: { padding: 4 },

  profileSection: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, gap: 24 },
  profilePhoto: { width: 80, height: 80, borderRadius: 40 },
  profilePhotoFallback: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  profileEmoji: { fontSize: 40 },
  statsRow: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 12, marginTop: 2 },

  bioSection: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  displayName: { fontSize: 15, fontWeight: '700' },
  titleBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 4 },
  titleText: { fontSize: 11, fontWeight: '700' },
  bioText: { fontSize: 14, lineHeight: 20, marginTop: 6 },

  actionRow: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  editBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  editBtnText: { fontSize: 14, fontWeight: '600' },
  followBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  followBtnText: { fontSize: 14, fontWeight: '700' },
  messageBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  messageBtnText: { fontSize: 14, fontWeight: '600' },

  gridHeader: { alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, marginTop: 4 },
  postsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 2, padding: 1 },
  gridItem: { width: GRID_SIZE, height: GRID_SIZE },
  gridImage: { width: '100%', height: '100%' },
  gridTextPost: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', padding: 8 },
  gridPostText: { fontSize: 11, textAlign: 'center', lineHeight: 16 },
  noPostsContainer: { width: '100%', alignItems: 'center', paddingTop: 40 },
  noPostsText: { fontSize: 14 },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '85%', paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 0.5, borderBottomColor: '#33333333' },
  modalCancel: { fontSize: 15 },
  modalTitle: { fontSize: 17, fontWeight: '700' },
  modalSave: { fontSize: 15, fontWeight: '700' },
  modalBody: { padding: 20 },
  photoEdit: { alignItems: 'center', marginBottom: 24 },
  editPhoto: { width: 90, height: 90, borderRadius: 45 },
  editPhotoFallback: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center' },
  editPhotoEmoji: { fontSize: 44 },
  changePhotoText: { marginTop: 8, fontSize: 14, fontWeight: '600' },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 12, textTransform: 'uppercase', letterSpacing: 0.3 },
  fieldInput: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 15 },
  bioInput: { minHeight: 80, textAlignVertical: 'top' },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  avatarOption: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  avatarOptionEmoji: { fontSize: 22 },
});
