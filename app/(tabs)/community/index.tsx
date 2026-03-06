import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Heart,
  MessageCircle,
  Send,
  Plus,
  X,
  Flame,
  BookOpen,
  HelpCircle,
  Sparkles,
  Quote,
  Users,
  TrendingUp,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import {
  mockCommunityPosts,
  postTypeLabels,
  postTypeColors,
  communityAvatars,
  CommunityPost,
} from '@/constants/communityData';

type PostFilter = 'all' | 'testimony' | 'prayer' | 'question' | 'devotional' | 'verse';

const filterOptions: { id: PostFilter; label: string; icon: typeof Heart }[] = [
  { id: 'all', label: 'Todos', icon: Users },
  { id: 'testimony', label: 'Testemunhos', icon: Flame },
  { id: 'prayer', label: 'Orações', icon: Heart },
  { id: 'question', label: 'Perguntas', icon: HelpCircle },
  { id: 'devotional', label: 'Devocionais', icon: Sparkles },
  { id: 'verse', label: 'Versículos', icon: Quote },
];

const postTypeOptions: { id: CommunityPost['type']; label: string; emoji: string }[] = [
  { id: 'testimony', label: 'Testemunho', emoji: '🔥' },
  { id: 'prayer', label: 'Pedido de Oração', emoji: '🙏' },
  { id: 'question', label: 'Pergunta', emoji: '❓' },
  { id: 'devotional', label: 'Devocional', emoji: '✨' },
  { id: 'verse', label: 'Versículo', emoji: '📖' },
];

export default function CommunityScreen() {
  const { state, colors, addCommunityPost, toggleLikePost } = useApp();
  const [filter, setFilter] = useState<PostFilter>('all');
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState<CommunityPost['type']>('testimony');
  const [localLikes, setLocalLikes] = useState<Record<string, boolean>>({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const modalSlide = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const myAvatar = communityAvatars[Math.floor(state.streak % communityAvatars.length)];

  const allPosts: CommunityPost[] = [
    ...state.communityPosts.map(p => ({
      id: p.id,
      userName: 'Você',
      avatar: myAvatar,
      type: p.type,
      content: p.content,
      likes: p.likes + (state.likedPostIds.includes(p.id) ? 1 : 0),
      comments: 0,
      timeAgo: 'agora',
      isLiked: state.likedPostIds.includes(p.id),
    })),
    ...mockCommunityPosts.map(p => ({
      ...p,
      likes: p.likes + (localLikes[p.id] ? 1 : 0),
      isLiked: localLikes[p.id] || false,
    })),
  ];

  const filteredPosts = filter === 'all' ? allPosts : allPosts.filter(p => p.type === filter);

  const handleLike = useCallback((postId: string, isMockPost: boolean) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isMockPost) {
      setLocalLikes(prev => ({ ...prev, [postId]: !prev[postId] }));
    } else {
      toggleLikePost(postId);
    }
  }, [toggleLikePost]);

  const openNewPost = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowNewPost(true);
    Animated.spring(modalSlide, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }).start();
  }, [modalSlide]);

  const closeNewPost = useCallback(() => {
    Animated.timing(modalSlide, { toValue: 300, duration: 200, useNativeDriver: true }).start(() => {
      setShowNewPost(false);
      setNewPostContent('');
    });
  }, [modalSlide]);

  const handleSubmitPost = useCallback(() => {
    if (!newPostContent.trim()) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addCommunityPost(newPostContent.trim(), newPostType);
    closeNewPost();
  }, [newPostContent, newPostType, addCommunityPost, closeNewPost]);

  const renderPost = useCallback((post: CommunityPost, _index: number) => {
    const isMock = mockCommunityPosts.some(m => m.id === post.id);
    const typeColor = postTypeColors[post.type];

    return (
      <View
        key={post.id}
        style={[styles.postCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
      >
        <View style={styles.postHeader}>
          <View style={[styles.avatarCircle, { backgroundColor: typeColor + '18' }]}>
            <Text style={styles.avatarEmoji}>{post.avatar}</Text>
          </View>
          <View style={styles.postHeaderInfo}>
            <Text style={[styles.postUserName, { color: colors.text }]}>{post.userName}</Text>
            <View style={styles.postMeta}>
              <View style={[styles.typeBadge, { backgroundColor: typeColor + '15' }]}>
                <Text style={[styles.typeText, { color: typeColor }]}>{postTypeLabels[post.type]}</Text>
              </View>
              <Text style={[styles.timeText, { color: colors.textMuted }]}>{post.timeAgo}</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.postContent, { color: colors.text }]}>{post.content}</Text>

        {post.verse && (
          <View style={[styles.verseTag, { backgroundColor: colors.primaryLight }]}>
            <BookOpen size={12} color={colors.primary} />
            <Text style={[styles.verseTagText, { color: colors.primary }]}>{post.verse}</Text>
          </View>
        )}

        <View style={[styles.postActions, { borderTopColor: colors.borderLight }]}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleLike(post.id, isMock)}
            activeOpacity={0.7}
          >
            <Heart
              size={18}
              color={post.isLiked ? '#EF4444' : colors.textMuted}
              fill={post.isLiked ? '#EF4444' : 'transparent'}
            />
            <Text style={[styles.actionText, { color: post.isLiked ? '#EF4444' : colors.textMuted }]}>
              {post.likes}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
            <MessageCircle size={18} color={colors.textMuted} />
            <Text style={[styles.actionText, { color: colors.textMuted }]}>{post.comments}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [colors, handleLike]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Comunidade</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            Compartilhe sua fé
          </Text>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.onlineBadge, { backgroundColor: '#10B981' + '18' }]}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>2.4k online</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statChip, { backgroundColor: '#FF6B35' + '12' }]}>
          <TrendingUp size={14} color="#FF6B35" />
          <Text style={[styles.statChipText, { color: '#FF6B35' }]}>{state.communityPosts.length} posts seus</Text>
        </View>
        <View style={[styles.statChip, { backgroundColor: '#EC4899' + '12' }]}>
          <Heart size={14} color="#EC4899" />
          <Text style={[styles.statChipText, { color: '#EC4899' }]}>{state.likedPostIds.length} curtidas</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {filterOptions.map((opt) => {
          const isActive = filter === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              style={[
                styles.filterChip,
                isActive && { backgroundColor: colors.primary },
                !isActive && { backgroundColor: colors.card, borderColor: colors.borderLight, borderWidth: 1 },
              ]}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setFilter(opt.id);
              }}
            >
              <opt.icon size={14} color={isActive ? '#FFF' : colors.textMuted} />
              <Text style={[styles.filterText, { color: isActive ? '#FFF' : colors.textSecondary }]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Animated.View style={[styles.feedContainer, { opacity: fadeAnim }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.feedContent}
        >
          {filteredPosts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🕊️</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhum post encontrado</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                Seja o primeiro a compartilhar!
              </Text>
            </View>
          ) : (
            filteredPosts.map((post, index) => renderPost(post, index))
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={openNewPost}
        activeOpacity={0.85}
        testID="new-post-fab"
      >
        <Plus size={24} color="#FFF" />
      </TouchableOpacity>

      <Modal visible={showNewPost} transparent animationType="none">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity style={styles.modalBackdrop} onPress={closeNewPost} activeOpacity={1} />
          <Animated.View
            style={[
              styles.modalContent,
              { backgroundColor: colors.card, transform: [{ translateY: modalSlide }] },
            ]}
          >
            <View style={styles.modalHandle}>
              <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
            </View>

            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Novo Post</Text>
              <TouchableOpacity onPress={closeNewPost}>
                <X size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
              {postTypeOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.typeOption,
                    newPostType === opt.id && { backgroundColor: postTypeColors[opt.id] + '18', borderColor: postTypeColors[opt.id] },
                    newPostType !== opt.id && { backgroundColor: colors.inputBg, borderColor: colors.borderLight },
                  ]}
                  onPress={() => setNewPostType(opt.id)}
                >
                  <Text style={styles.typeEmoji}>{opt.emoji}</Text>
                  <Text style={[
                    styles.typeLabel,
                    { color: newPostType === opt.id ? postTypeColors[opt.id] : colors.textSecondary },
                  ]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput
              style={[styles.postInput, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.borderLight }]}
              placeholder="Compartilhe com a comunidade..."
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={500}
              value={newPostContent}
              onChangeText={setNewPostContent}
              textAlignVertical="top"
            />

            <View style={styles.modalFooter}>
              <Text style={[styles.charCount, { color: colors.textMuted }]}>
                {newPostContent.length}/500
              </Text>
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  { backgroundColor: newPostContent.trim() ? colors.primary : colors.border },
                ]}
                onPress={handleSubmitPost}
                disabled={!newPostContent.trim()}
                activeOpacity={0.8}
              >
                <Send size={18} color={newPostContent.trim() ? '#FFF' : colors.textMuted} />
                <Text style={[
                  styles.submitText,
                  { color: newPostContent.trim() ? '#FFF' : colors.textMuted },
                ]}>
                  Publicar
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, marginTop: 2 },
  headerRight: { paddingTop: 4 },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  onlineText: { fontSize: 11, fontWeight: '600' as const, color: '#10B981' },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statChipText: { fontSize: 11, fontWeight: '600' as const },
  filterRow: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterText: { fontSize: 12, fontWeight: '600' as const },
  feedContainer: { flex: 1 },
  feedContent: { paddingHorizontal: 20, paddingTop: 4 },
  postCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    overflow: 'hidden' as const,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    paddingBottom: 10,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: { fontSize: 20 },
  postHeaderInfo: { flex: 1 },
  postUserName: { fontSize: 15, fontWeight: '700' as const },
  postMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeText: { fontSize: 10, fontWeight: '700' as const },
  timeText: { fontSize: 11 },
  postContent: {
    fontSize: 14,
    lineHeight: 22,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  verseTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    marginLeft: 16,
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  verseTagText: { fontSize: 11, fontWeight: '600' as const },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 24,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: { fontSize: 13, fontWeight: '600' as const },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700' as const, marginBottom: 4 },
  emptySubtitle: { fontSize: 14 },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  modalHandle: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 6,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  modalTitle: { fontSize: 20, fontWeight: '700' as const },
  typeSelector: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
  },
  typeEmoji: { fontSize: 14 },
  typeLabel: { fontSize: 12, fontWeight: '600' as const },
  postInput: {
    marginHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 120,
    maxHeight: 200,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  charCount: { fontSize: 12 },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  submitText: { fontSize: 14, fontWeight: '700' as const },
});
