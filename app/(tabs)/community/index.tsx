import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  Animated,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Heart,
  MessageCircle,
  Send,
  Plus,
  Bookmark,
  MoreHorizontal,
  EyeOff,
  Radio,
  Mail,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import {
  MOCK_FEED_POSTS,
  MOCK_STORIES,
  MOCK_USERS,
  postTypeLabels,
  postTypeColors,
  getTimeAgo,
  getMockUser,
} from '@/constants/communityData';
import { getLevelForXP } from '@/constants/levels';
import { usePersonaImages } from '@/hooks/usePersonaImages';
import type { CommunityUserPost } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type PostFilter = 'all' | 'testimony' | 'prayer' | 'question' | 'devotional' | 'verse';

const filterOptions: { id: PostFilter; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'testimony', label: 'Testemunho' },
  { id: 'prayer', label: 'Oração' },
  { id: 'question', label: 'Pergunta' },
  { id: 'devotional', label: 'Devocional' },
  { id: 'verse', label: 'Versículo' },
];

// ─── Story Circle Component ─────────────────
function StoryCircle({ userId, userName, userAvatar, userPhoto, isViewed, onPress, colors, isSelf }: {
  userId: string; userName: string; userAvatar: string; userPhoto: string | null;
  isViewed: boolean; onPress: () => void; colors: any; isSelf?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.storyItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.storyRing, { borderColor: isViewed ? colors.borderLight : '#E040FB' }]}>
        {userPhoto ? (
          <Image source={{ uri: userPhoto }} style={styles.storyAvatar} />
        ) : (
          <View style={[styles.storyAvatarFallback, { backgroundColor: colors.primaryLight }]}>
            <Text style={styles.storyAvatarEmoji}>{userAvatar}</Text>
          </View>
        )}
        {isSelf && (
          <View style={[styles.storyAddBadge, { backgroundColor: colors.primary }]}>
            <Plus size={12} color="#FFF" />
          </View>
        )}
      </View>
      <Text style={[styles.storyName, { color: colors.text }]} numberOfLines={1}>
        {isSelf ? 'Seu story' : userName.split(' ')[0]}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Image Carousel ─────────────────────────
function PostImageCarousel({ images, colors }: { images: string[]; colors: any }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) return null;

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setActiveIndex(index);
        }}
      >
        {images.map((uri, i) => (
          <Image key={i} source={{ uri }} style={styles.postImage} resizeMode="cover" />
        ))}
      </ScrollView>
      {images.length > 1 && (
        <View style={styles.dotsRow}>
          {images.map((_, i) => (
            <View key={i} style={[styles.dot, { backgroundColor: i === activeIndex ? colors.primary : colors.borderLight }]} />
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Post Card Component ─────────────────────
function PostCard({ post, colors, router, state, toggleLikePost, savePost }: {
  post: CommunityUserPost & { userName: string; userAvatar: string; userPhoto: string | null; userLevel: number; userTitle: string };
  colors: any; router: any; state: any;
  toggleLikePost: (id: string) => void;
  savePost: (id: string) => void;
}) {
  const isLiked = state.likedPostIds.includes(post.id);
  const isSaved = state.savedPostIds?.includes(post.id);
  const heartScale = useRef(new Animated.Value(1)).current;
  const doubleTapRef = useRef<NodeJS.Timeout | null>(null);
  const [showHeart, setShowHeart] = useState(false);
  const heartOpacity = useRef(new Animated.Value(0)).current;

  const handleDoubleTap = useCallback(() => {
    if (!isLiked) {
      toggleLikePost(post.id);
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowHeart(true);
    heartOpacity.setValue(1);
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.3, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true }),
      Animated.timing(heartOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => setShowHeart(false));
  }, [isLiked, post.id, toggleLikePost, heartScale, heartOpacity]);

  const handleTap = useCallback(() => {
    if (doubleTapRef.current) {
      clearTimeout(doubleTapRef.current);
      doubleTapRef.current = null;
      handleDoubleTap();
    } else {
      doubleTapRef.current = setTimeout(() => {
        doubleTapRef.current = null;
      }, 300);
    }
  }, [handleDoubleTap]);

  const handleLike = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleLikePost(post.id);
  }, [post.id, toggleLikePost]);

  const handleSave = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    savePost(post.id);
  }, [post.id, savePost]);

  const commentCount = post.comments?.length || 0;
  const totalLikes = post.likes + (isLiked ? 1 : 0);

  return (
    <View style={[styles.postCard, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      {/* Header */}
      <TouchableOpacity
        style={styles.postHeader}
        onPress={() => post.userId && post.userId !== 'self' && router.push(`/community/profile?userId=${post.userId}`)}
      >
        {post.userPhoto ? (
          <Image source={{ uri: post.userPhoto }} style={styles.postAvatar} />
        ) : (
          <View style={[styles.postAvatarFallback, { backgroundColor: colors.primaryLight }]}>
            <Text style={styles.postAvatarEmoji}>{post.userAvatar}</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <View style={styles.postNameRow}>
            <Text style={[styles.postUserName, { color: colors.text }]}>{post.userName}</Text>
            <View style={[styles.levelBadge, { backgroundColor: postTypeColors[post.type] + '20' }]}>
              <Text style={[styles.levelBadgeText, { color: postTypeColors[post.type] }]}>{postTypeLabels[post.type]}</Text>
            </View>
          </View>
          <Text style={[styles.postTime, { color: colors.textMuted }]}>{post.userTitle} • {getTimeAgo(post.date)}</Text>
        </View>
        <TouchableOpacity style={styles.moreBtn}>
          <MoreHorizontal size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <TouchableOpacity activeOpacity={1} onPress={handleTap}>
          <PostImageCarousel images={post.images} colors={colors} />
          {showHeart && (
            <Animated.View style={[styles.doubleTapHeart, { opacity: heartOpacity, transform: [{ scale: heartScale }] }]}>
              <Heart size={80} color="#FF3B5C" fill="#FF3B5C" />
            </Animated.View>
          )}
        </TouchableOpacity>
      )}

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <View style={styles.leftActions}>
          <TouchableOpacity onPress={handleLike} style={styles.actionIcon}>
            <Heart size={24} color={isLiked ? '#FF3B5C' : colors.text} fill={isLiked ? '#FF3B5C' : 'none'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIcon}>
            <MessageCircle size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIcon}>
            <Send size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleSave}>
          <Bookmark size={24} color={isSaved ? colors.primary : colors.text} fill={isSaved ? colors.primary : 'none'} />
        </TouchableOpacity>
      </View>

      {/* Likes */}
      {totalLikes > 0 && (
        <Text style={[styles.likesCount, { color: colors.text }]}>
          {totalLikes} curtida{totalLikes !== 1 ? 's' : ''}
        </Text>
      )}

      {/* Content */}
      {post.content ? (
        <View style={styles.captionRow}>
          <Text style={[styles.captionText, { color: colors.text }]}>
            <Text style={styles.captionUser}>{post.userName} </Text>
            {post.content}
          </Text>
        </View>
      ) : null}

      {/* Comments preview */}
      {commentCount > 0 && (
        <TouchableOpacity style={styles.commentsLink}>
          <Text style={[styles.commentsLinkText, { color: colors.textMuted }]}>
            Ver {commentCount === 1 ? '1 comentário' : `todos os ${commentCount} comentários`}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Main Feed Screen ────────────────────────
export default function CommunityFeedScreen() {
  const router = useRouter();
  const { colors, state, toggleLikePost, savePost } = useApp();
  const [filter, setFilter] = useState<PostFilter>('all');
  const [refreshing, setRefreshing] = useState(false);
  const { resolve, revision } = usePersonaImages();

  const allPosts = useMemo(() => {
    const userPosts = state.communityPosts.map(p => ({
      ...p,
      userName: state.communityName || 'Eu',
      userAvatar: state.communityAvatar,
      userPhoto: state.communityPhoto || null,
      userLevel: getLevelForXP(state.xp).level,
      userTitle: getLevelForXP(state.xp).title,
    }));

    const mockPosts = MOCK_FEED_POSTS.map(p => {
      const user = getMockUser(p.userId || '');
      return {
        ...p,
        userName: user?.name || 'Usuário',
        userAvatar: user?.avatar || '🙏',
        userPhoto: resolve(user?.photo) || null,
        userLevel: user?.level || 1,
        userTitle: user?.title || 'Semente',
        images: (p.images || []).map(img => resolve(img)).filter((img): img is string => img !== null),
      };
    });

    const combined = [...userPosts, ...mockPosts].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    if (filter === 'all') return combined;
    return combined.filter(p => p.type === filter);
  }, [state.communityPosts, state.communityName, state.communityAvatar, state.communityPhoto, state.xp, filter, resolve, revision]);

  const stories = useMemo(() => {
    const selfStories = state.stories.filter(s => s.userId === 'self');
    const mockStories = MOCK_STORIES.map(s => ({
      ...s,
      userPhoto: resolve(s.userPhoto) || s.userPhoto,
      imageUri: resolve(s.imageUri) || s.imageUri,
    }));
    return { selfStories, mockStories };
  }, [state.stories, resolve, revision]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const renderHeader = useCallback(() => (
    <View>
      {/* Stories Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesBar}>
        <StoryCircle
          userId="self"
          userName={state.communityName || 'Eu'}
          userAvatar={state.communityAvatar}
          userPhoto={state.communityPhoto || null}
          isViewed={stories.selfStories.length === 0}
          onPress={() => {
            if (stories.selfStories.length > 0) {
              router.push('/community/story-viewer?userId=self' as never);
            } else {
              router.push('/community/new-post' as never);
            }
          }}
          colors={colors}
          isSelf
        />
        {stories.mockStories.map(story => (
          <StoryCircle
            key={story.id}
            userId={story.userId}
            userName={story.userName}
            userAvatar={story.userAvatar}
            userPhoto={story.userPhoto}
            isViewed={story.viewedBy.includes('self')}
            onPress={() => router.push(`/community/story-viewer?userId=${story.userId}` as never)}
            colors={colors}
          />
        ))}
      </ScrollView>

      {/* Feature Chips */}
      <View style={styles.featureRow}>
        <TouchableOpacity
          style={[styles.featureChip, { backgroundColor: '#8B5CF6' + '15', borderColor: '#8B5CF6' }]}
          onPress={() => router.push('/community/anonymous' as never)}
        >
          <EyeOff size={14} color="#8B5CF6" />
          <Text style={[styles.featureText, { color: '#8B5CF6' }]}>Anônimo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.featureChip, { backgroundColor: '#10B981' + '15', borderColor: '#10B981' }]}
          onPress={() => router.push('/community/online-chat' as never)}
        >
          <Radio size={14} color="#10B981" />
          <Text style={[styles.featureText, { color: '#10B981' }]}>Chat ao Vivo</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterBar}>
        {filterOptions.map(f => (
          <TouchableOpacity
            key={f.id}
            style={[
              styles.filterChip,
              {
                backgroundColor: filter === f.id ? colors.primary : colors.card,
                borderColor: filter === f.id ? colors.primary : colors.borderLight,
              },
            ]}
            onPress={() => setFilter(f.id)}
          >
            <Text style={[styles.filterText, { color: filter === f.id ? '#FFF' : colors.text }]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  ), [colors, filter, state, stories, router]);

  const renderPost = useCallback(({ item }: { item: typeof allPosts[0] }) => (
    <PostCard
      post={item}
      colors={colors}
      router={router}
      state={state}
      toggleLikePost={toggleLikePost}
      savePost={savePost}
    />
  ), [colors, router, state, toggleLikePost, savePost]);

  const totalUnread = state.totalUnreadDMs || 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={[styles.topTitle, { color: colors.text }]}>Social</Text>
        <View style={styles.topActions}>
          <TouchableOpacity
            style={styles.topBtn}
            onPress={() => router.push('/community/messages' as never)}
          >
            <Mail size={24} color={colors.text} />
            {totalUnread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{totalUnread > 9 ? '9+' : totalUnread}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={allPosts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📸</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhum post ainda</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              Seja o primeiro a compartilhar!
            </Text>
          </View>
        }
        contentContainerStyle={styles.feedContent}
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/community/new-post' as never)}
        activeOpacity={0.8}
      >
        <Plus size={28} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  topTitle: { fontSize: 26, fontWeight: '800' },
  topActions: { flexDirection: 'row', gap: 16 },
  topBtn: { position: 'relative', padding: 4 },
  unreadBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: '#FF3B5C', width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  unreadText: { color: '#FFF', fontSize: 10, fontWeight: '800' },

  // Stories
  storiesBar: { paddingHorizontal: 12, paddingVertical: 10, gap: 14 },
  storyItem: { alignItems: 'center', width: 72 },
  storyRing: { width: 68, height: 68, borderRadius: 34, borderWidth: 2.5, justifyContent: 'center', alignItems: 'center', padding: 2 },
  storyAvatar: { width: 58, height: 58, borderRadius: 29 },
  storyAvatarFallback: { width: 58, height: 58, borderRadius: 29, justifyContent: 'center', alignItems: 'center' },
  storyAvatarEmoji: { fontSize: 28 },
  storyAddBadge: { position: 'absolute', bottom: 0, right: 0, width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  storyName: { fontSize: 11, marginTop: 4 },

  // Features
  featureRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 8 },
  featureChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  featureText: { fontSize: 12, fontWeight: '600' },

  // Filters
  filterBar: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 13, fontWeight: '600' },

  // Feed
  feedContent: { paddingBottom: 100 },

  // Post Card
  postCard: { borderBottomWidth: 0.5, paddingBottom: 12 },
  postHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  postAvatar: { width: 36, height: 36, borderRadius: 18 },
  postAvatarFallback: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  postAvatarEmoji: { fontSize: 18 },
  postNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  postUserName: { fontSize: 14, fontWeight: '700' },
  levelBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  levelBadgeText: { fontSize: 10, fontWeight: '700' },
  postTime: { fontSize: 12, marginTop: 1 },
  moreBtn: { padding: 4 },

  // Post Image
  postImage: { width: SCREEN_WIDTH, height: SCREEN_WIDTH * 0.75 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 4, paddingVertical: 8 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  doubleTapHeart: { position: 'absolute', top: '50%', left: '50%', marginLeft: -40, marginTop: -40 },

  // Actions
  actionBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8 },
  leftActions: { flexDirection: 'row', gap: 16 },
  actionIcon: { padding: 2 },

  // Likes & Caption
  likesCount: { paddingHorizontal: 14, fontSize: 14, fontWeight: '700' },
  captionRow: { paddingHorizontal: 14, paddingTop: 4 },
  captionText: { fontSize: 14, lineHeight: 20 },
  captionUser: { fontWeight: '700' },
  commentsLink: { paddingHorizontal: 14, paddingTop: 4, paddingBottom: 4 },
  commentsLinkText: { fontSize: 13 },

  // Empty
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptySubtitle: { fontSize: 14 },

  // FAB
  fab: { position: 'absolute', bottom: 20, right: 20, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
});
