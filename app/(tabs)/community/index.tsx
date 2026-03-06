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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
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
  Trophy,
  ChevronRight,
  Star,
  Shield,
  Zap,
  EyeOff,
  Radio,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import {
  mockCommunityPosts,
  postTypeLabels,
  postTypeColors,
  CommunityPost,
} from '@/constants/communityData';
import { getLevelForXP, getNextLevel, getLevelProgress, XP_REWARDS, LEVELS } from '@/constants/levels';

type PostFilter = 'all' | 'testimony' | 'prayer' | 'question' | 'devotional' | 'verse';
type ScreenTab = 'feed' | 'ranking' | 'my-level';

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
  { id: 'prayer', label: 'Oração', emoji: '🙏' },
  { id: 'question', label: 'Pergunta', emoji: '❓' },
  { id: 'devotional', label: 'Devocional', emoji: '✨' },
  { id: 'verse', label: 'Versículo', emoji: '📖' },
];

// Simulated leaderboard from mock posts + user
function buildLeaderboard(userXP: number, userName: string, userAvatar: string) {
  const entries = mockCommunityPosts
    .reduce((acc, p) => {
      if (!acc.find(e => e.name === p.userName)) {
        acc.push({ name: p.userName, avatar: p.avatar, xp: p.userXP, level: p.userLevel, title: p.userTitle });
      }
      return acc;
    }, [] as { name: string; avatar: string; xp: number; level: number; title: string }[]);

  const userLevel = getLevelForXP(userXP);
  entries.push({ name: userName || 'Você', avatar: userAvatar, xp: userXP, level: userLevel.level, title: userLevel.title });

  return entries.sort((a, b) => b.xp - a.xp);
}

export default function CommunityScreen() {
  const router = useRouter();
  const { state, colors, addCommunityPost, toggleLikePost, gainXP, setCommunityProfile } = useApp();
  const [tab, setTab] = useState<ScreenTab>('feed');
  const [filter, setFilter] = useState<PostFilter>('all');
  const [showNewPost, setShowNewPost] = useState(false);
  const [showSetupProfile, setShowSetupProfile] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState<CommunityPost['type']>('testimony');
  const [localLikes, setLocalLikes] = useState<Record<string, boolean>>({});
  const [profileName, setProfileName] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('🙏');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const modalSlide = useRef(new Animated.Value(300)).current;
  const xpAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const userLevel = getLevelForXP(state.xp);
  const nextLevel = getNextLevel(state.xp);
  const levelProgress = getLevelProgress(state.xp);

  const myAvatar = state.communityAvatar || '🙏';
  const myName = state.communityName || 'Você';

  const allPosts: CommunityPost[] = [
    ...state.communityPosts.map(p => ({
      id: p.id,
      userName: myName,
      avatar: myAvatar,
      type: p.type,
      content: p.content,
      likes: p.likes + (state.likedPostIds.includes(p.id) ? 1 : 0),
      comments: 0,
      timeAgo: 'agora',
      isLiked: state.likedPostIds.includes(p.id),
      userLevel: userLevel.level,
      userTitle: userLevel.title,
      userXP: state.xp,
    })),
    ...mockCommunityPosts.map(p => ({
      ...p,
      likes: p.likes + (localLikes[p.id] ? 1 : 0),
      isLiked: localLikes[p.id] || false,
    })),
  ];

  const filteredPosts = filter === 'all' ? allPosts : allPosts.filter(p => p.type === filter);
  const leaderboard = buildLeaderboard(state.xp, myName, myAvatar);

  const animateXP = useCallback(() => {
    Animated.sequence([
      Animated.timing(xpAnim, { toValue: 1.3, duration: 200, useNativeDriver: true }),
      Animated.timing(xpAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [xpAnim]);

  const handleLike = useCallback((postId: string, isMockPost: boolean) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isMockPost) {
      if (!localLikes[postId]) {
        gainXP(XP_REWARDS.COMMUNITY_LIKE);
        animateXP();
      }
      setLocalLikes(prev => ({ ...prev, [postId]: !prev[postId] }));
    } else {
      toggleLikePost(postId);
    }
  }, [toggleLikePost, localLikes, gainXP, animateXP]);

  const openNewPost = useCallback(() => {
    if (!state.communityName) {
      setShowSetupProfile(true);
      return;
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowNewPost(true);
    Animated.spring(modalSlide, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }).start();
  }, [modalSlide, state.communityName]);

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
    gainXP(XP_REWARDS.COMMUNITY_POST);
    animateXP();
    closeNewPost();
  }, [newPostContent, newPostType, addCommunityPost, closeNewPost, gainXP, animateXP]);

  const handleSaveProfile = useCallback(() => {
    if (!profileName.trim()) {
      Alert.alert('Nome necessário', 'Digite seu nome para a comunidade.');
      return;
    }
    setCommunityProfile(profileName.trim(), profileAvatar);
    setShowSetupProfile(false);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [profileName, profileAvatar, setCommunityProfile]);

  const getLevelColor = (level: number) => {
    const l = LEVELS.find(lv => lv.level === level);
    return l?.color || '#9CA3AF';
  };

  const renderPost = useCallback((post: CommunityPost) => {
    const isMock = mockCommunityPosts.some(m => m.id === post.id);
    const typeColor = postTypeColors[post.type];
    const lvlColor = getLevelColor(post.userLevel);

    return (
      <View key={post.id} style={[styles.postCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
        <View style={styles.postHeader}>
          <View style={[styles.avatarCircle, { backgroundColor: lvlColor + '18' }]}>
            <Text style={styles.avatarEmoji}>{post.avatar}</Text>
          </View>
          <View style={styles.postHeaderInfo}>
            <View style={styles.nameRow}>
              <Text style={[styles.postUserName, { color: colors.text }]}>{post.userName}</Text>
              <View style={[styles.levelBadge, { backgroundColor: lvlColor + '18' }]}>
                <Text style={[styles.levelBadgeText, { color: lvlColor }]}>Lv.{post.userLevel}</Text>
              </View>
            </View>
            <View style={styles.postMeta}>
              <Text style={[styles.levelTitle, { color: lvlColor }]}>{post.userTitle}</Text>
              <Text style={[styles.dotSep, { color: colors.textMuted }]}>·</Text>
              <View style={[styles.typeBadge, { backgroundColor: typeColor + '15' }]}>
                <Text style={[styles.typeText, { color: typeColor }]}>{postTypeLabels[post.type]}</Text>
              </View>
              <Text style={[styles.dotSep, { color: colors.textMuted }]}>·</Text>
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
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleLike(post.id, isMock)}>
            <Heart size={18} color={post.isLiked ? '#EF4444' : colors.textMuted} fill={post.isLiked ? '#EF4444' : 'transparent'} />
            <Text style={[styles.actionText, { color: post.isLiked ? '#EF4444' : colors.textMuted }]}>{post.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <MessageCircle size={18} color={colors.textMuted} />
            <Text style={[styles.actionText, { color: colors.textMuted }]}>{post.comments}</Text>
          </TouchableOpacity>
          <View style={styles.xpReward}>
            <Zap size={12} color="#C9922A" />
            <Text style={styles.xpRewardText}>+{XP_REWARDS.COMMUNITY_LIKE} XP</Text>
          </View>
        </View>
      </View>
    );
  }, [colors, handleLike]);

  const renderFeed = () => (
    <>
      {/* Feature Cards */}
      <View style={styles.featureStrip}>
        <TouchableOpacity
          style={[styles.featureCard, { backgroundColor: '#6366F1' + '12', borderColor: '#6366F1' + '30' }]}
          onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/community/anonymous' as never); }}
        >
          <EyeOff size={20} color="#6366F1" />
          <Text style={[styles.featureCardTitle, { color: '#6366F1' }]}>Anônimo</Text>
          <Text style={[styles.featureCardSub, { color: colors.textMuted }]}>Desabafe sem julgamento</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.featureCard, { backgroundColor: '#10B981' + '12', borderColor: '#10B981' + '30' }]}
          onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/community/online-chat' as never); }}
        >
          <Radio size={20} color="#10B981" />
          <Text style={[styles.featureCardTitle, { color: '#10B981' }]}>Chat ao Vivo</Text>
          <Text style={[styles.featureCardSub, { color: colors.textMuted }]}>Converse com irmãos</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
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
              onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFilter(opt.id); }}
            >
              <opt.icon size={14} color={isActive ? '#FFF' : colors.textMuted} />
              <Text style={[styles.filterText, { color: isActive ? '#FFF' : colors.textSecondary }]}>{opt.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.feedContent}>
        {filteredPosts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🕊️</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhum post encontrado</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>Seja o primeiro a compartilhar!</Text>
          </View>
        ) : (
          filteredPosts.map(post => renderPost(post))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </>
  );

  const renderRanking = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.rankingContent}>
      <View style={[styles.rankingHeader, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
        <Trophy size={24} color="#C9922A" />
        <Text style={[styles.rankingTitle, { color: colors.text }]}>Ranking da Comunidade</Text>
        <Text style={[styles.rankingSub, { color: colors.textMuted }]}>
          Os níveis sobem com planos (20/90 dias), vigília, estudos e interações
        </Text>
      </View>

      {leaderboard.map((entry, index) => {
        const isUser = entry.name === myName;
        const lvlColor = getLevelColor(entry.level);
        const rankEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;

        return (
          <View
            key={entry.name}
            style={[
              styles.rankRow,
              { backgroundColor: isUser ? colors.primaryLight : colors.card, borderColor: isUser ? colors.primary + '30' : colors.borderLight },
            ]}
          >
            <View style={styles.rankPosition}>
              {rankEmoji ? (
                <Text style={styles.rankEmoji}>{rankEmoji}</Text>
              ) : (
                <Text style={[styles.rankNumber, { color: colors.textMuted }]}>#{index + 1}</Text>
              )}
            </View>
            <View style={[styles.rankAvatar, { backgroundColor: lvlColor + '18' }]}>
              <Text style={styles.rankAvatarEmoji}>{entry.avatar}</Text>
            </View>
            <View style={styles.rankInfo}>
              <View style={styles.rankNameRow}>
                <Text style={[styles.rankName, { color: colors.text }]}>{entry.name}</Text>
                {isUser && (
                  <View style={[styles.youBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.youBadgeText}>VOCÊ</Text>
                  </View>
                )}
              </View>
              <View style={styles.rankMeta}>
                <View style={[styles.levelBadge, { backgroundColor: lvlColor + '18' }]}>
                  <Text style={[styles.levelBadgeText, { color: lvlColor }]}>Lv.{entry.level}</Text>
                </View>
                <Text style={[styles.rankTitle, { color: lvlColor }]}>{entry.title}</Text>
              </View>
            </View>
            <View style={styles.rankXP}>
              <Text style={[styles.rankXPNumber, { color: colors.primary }]}>{entry.xp.toLocaleString()}</Text>
              <Text style={[styles.rankXPLabel, { color: colors.textMuted }]}>XP</Text>
            </View>
          </View>
        );
      })}
      <View style={{ height: 100 }} />
    </ScrollView>
  );

  const renderMyLevel = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.myLevelContent}>
      {/* User Profile Card */}
      <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
        <View style={[styles.profileAvatarLarge, { backgroundColor: userLevel.color + '20', borderColor: userLevel.color + '40' }]}>
          <Text style={styles.profileAvatarEmoji}>{myAvatar}</Text>
        </View>
        <Text style={[styles.profileName, { color: colors.text }]}>{myName}</Text>
        <View style={[styles.profileLevelBadge, { backgroundColor: userLevel.color + '18' }]}>
          <Shield size={14} color={userLevel.color} />
          <Text style={[styles.profileLevelText, { color: userLevel.color }]}>
            Nível {userLevel.level} — {userLevel.title} {userLevel.emoji}
          </Text>
        </View>

        {/* XP Progress Bar */}
        <View style={styles.xpSection}>
          <View style={styles.xpHeader}>
            <Animated.View style={{ transform: [{ scale: xpAnim }] }}>
              <Text style={[styles.xpTotal, { color: colors.primary }]}>{state.xp.toLocaleString()} XP</Text>
            </Animated.View>
            {nextLevel && (
              <Text style={[styles.xpNext, { color: colors.textMuted }]}>
                Próx: {nextLevel.title} ({nextLevel.minXP} XP)
              </Text>
            )}
          </View>
          <View style={[styles.xpBarBg, { backgroundColor: colors.border }]}>
            <View style={[styles.xpBarFill, { width: `${levelProgress}%` as `${number}%`, backgroundColor: userLevel.color }]} />
          </View>
          <Text style={[styles.xpPercent, { color: colors.textMuted }]}>{levelProgress}% para o próximo nível</Text>
        </View>

        {!state.communityName && (
          <TouchableOpacity
            style={[styles.setupProfileBtn, { backgroundColor: colors.primary }]}
            onPress={() => setShowSetupProfile(true)}
          >
            <Text style={styles.setupProfileBtnText}>Configurar Perfil</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* How to gain XP */}
      <View style={[styles.xpGuide, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
        <View style={styles.xpGuideHeader}>
          <Star size={18} color="#C9922A" />
          <Text style={[styles.xpGuideTitle, { color: colors.text }]}>Como Ganhar XP</Text>
        </View>
        {[
          { label: 'Completar dia do Plano (20/90 dias)', xp: XP_REWARDS.PLAN_DAY_COMPLETE, emoji: '📖', highlight: true },
          { label: 'Completar dia da Vigília (21 dias)', xp: XP_REWARDS.VIGILIA_DAY_COMPLETE, emoji: '🔥', highlight: true },
          { label: 'Completar dia da Jornada (90 dias)', xp: XP_REWARDS.JOURNEY_DAY_COMPLETE, emoji: '🎯', highlight: true },
          { label: 'Ler um capítulo', xp: XP_REWARDS.CHAPTER_READ, emoji: '📚', highlight: false },
          { label: 'Publicar na comunidade', xp: XP_REWARDS.COMMUNITY_POST, emoji: '✍️', highlight: false },
          { label: 'Criar conteúdo', xp: XP_REWARDS.CREATE_CONTENT, emoji: '🎨', highlight: false },
          { label: 'Login diário', xp: XP_REWARDS.DAILY_LOGIN, emoji: '📅', highlight: false },
          { label: 'Completar quiz', xp: XP_REWARDS.QUIZ_COMPLETE, emoji: '🧠', highlight: false },
          { label: 'Chat com Gabriel', xp: XP_REWARDS.CHAT_MESSAGE, emoji: '💬', highlight: false },
          { label: 'Curtir um post', xp: XP_REWARDS.COMMUNITY_LIKE, emoji: '❤️', highlight: false },
        ].map((item) => (
          <View
            key={item.label}
            style={[
              styles.xpGuideRow,
              item.highlight && { backgroundColor: '#C9922A' + '08' },
              { borderBottomColor: colors.borderLight },
            ]}
          >
            <Text style={styles.xpGuideEmoji}>{item.emoji}</Text>
            <Text style={[styles.xpGuideLabel, { color: colors.text }, item.highlight && { fontWeight: '700' as const }]}>
              {item.label}
            </Text>
            <View style={[styles.xpGuideBadge, item.highlight ? { backgroundColor: '#C9922A' + '18' } : { backgroundColor: colors.primaryLight }]}>
              <Zap size={10} color={item.highlight ? '#C9922A' : colors.primary} />
              <Text style={[styles.xpGuideXP, { color: item.highlight ? '#C9922A' : colors.primary }]}>+{item.xp}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* All Levels */}
      <View style={[styles.allLevels, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
        <Text style={[styles.allLevelsTitle, { color: colors.text }]}>Todos os Níveis</Text>
        {LEVELS.map((lv) => {
          const isCurrentLevel = userLevel.level === lv.level;
          const isUnlocked = state.xp >= lv.minXP;
          return (
            <View
              key={lv.level}
              style={[
                styles.levelRow,
                isCurrentLevel && { backgroundColor: lv.color + '10', borderColor: lv.color + '30', borderWidth: 1 },
                { borderBottomColor: colors.borderLight },
              ]}
            >
              <Text style={styles.levelRowEmoji}>{lv.emoji}</Text>
              <View style={styles.levelRowInfo}>
                <View style={styles.levelRowNameRow}>
                  <Text style={[styles.levelRowName, { color: isUnlocked ? colors.text : colors.textMuted }]}>
                    Nv.{lv.level} — {lv.title}
                  </Text>
                  {isCurrentLevel && (
                    <View style={[styles.currentBadge, { backgroundColor: lv.color }]}>
                      <Text style={styles.currentBadgeText}>ATUAL</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.levelRowXP, { color: isUnlocked ? lv.color : colors.textMuted }]}>
                  {lv.minXP.toLocaleString()} XP
                </Text>
              </View>
              {isUnlocked ? (
                <View style={[styles.levelCheck, { backgroundColor: lv.color + '20' }]}>
                  <Text style={styles.levelCheckEmoji}>✓</Text>
                </View>
              ) : (
                <View style={[styles.levelLock, { backgroundColor: colors.border }]}>
                  <Text style={styles.levelLockEmoji}>🔒</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
      <View style={{ height: 100 }} />
    </ScrollView>
  );

  const avatarOptions = ['🙏', '✝️', '⛪', '🕊️', '📖', '🔥', '💛', '🌿', '⭐', '🌸', '🦋', '🌙', '☀️', '💎', '🌈', '🎵'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header with user level */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Comunidade</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>Conecte-se na fé</Text>
        </View>
        <TouchableOpacity
          style={[styles.headerProfile, { backgroundColor: userLevel.color + '15' }]}
          onPress={() => setTab('my-level')}
        >
          <Text style={styles.headerAvatar}>{myAvatar}</Text>
          <View style={[styles.headerLevelBadge, { backgroundColor: userLevel.color }]}>
            <Text style={styles.headerLevelText}>{userLevel.level}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* XP Bar Mini */}
      <View style={styles.xpMiniRow}>
        <Animated.View style={[styles.xpMiniContent, { transform: [{ scale: xpAnim }] }]}>
          <Zap size={14} color={userLevel.color} />
          <Text style={[styles.xpMiniText, { color: userLevel.color }]}>{state.xp} XP</Text>
        </Animated.View>
        <View style={[styles.xpMiniBadge, { backgroundColor: userLevel.color + '15' }]}>
          <Text style={[styles.xpMiniLevel, { color: userLevel.color }]}>{userLevel.emoji} {userLevel.title}</Text>
        </View>
        <View style={[styles.xpMiniBar, { backgroundColor: colors.border }]}>
          <View style={[styles.xpMiniBarFill, { width: `${levelProgress}%` as `${number}%`, backgroundColor: userLevel.color }]} />
        </View>
      </View>

      {/* Tab Switcher */}
      <View style={[styles.tabRow, { borderBottomColor: colors.borderLight }]}>
        {[
          { id: 'feed' as ScreenTab, label: 'Feed', icon: Users },
          { id: 'ranking' as ScreenTab, label: 'Ranking', icon: Trophy },
          { id: 'my-level' as ScreenTab, label: 'Meu Nível', icon: Star },
        ].map(t => (
          <TouchableOpacity
            key={t.id}
            style={[styles.tabItem, tab === t.id && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            onPress={() => setTab(t.id)}
          >
            <t.icon size={16} color={tab === t.id ? colors.primary : colors.textMuted} />
            <Text style={[styles.tabLabel, { color: tab === t.id ? colors.primary : colors.textMuted }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Animated.View style={[styles.feedContainer, { opacity: fadeAnim }]}>
        {tab === 'feed' && renderFeed()}
        {tab === 'ranking' && renderRanking()}
        {tab === 'my-level' && renderMyLevel()}
      </Animated.View>

      {/* FAB */}
      {tab === 'feed' && (
        <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={openNewPost} activeOpacity={0.85}>
          <Plus size={24} color="#FFF" />
        </TouchableOpacity>
      )}

      {/* New Post Modal */}
      <Modal visible={showNewPost} transparent animationType="none">
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={closeNewPost} activeOpacity={1} />
          <Animated.View style={[styles.modalContent, { backgroundColor: colors.card, transform: [{ translateY: modalSlide }] }]}>
            <View style={styles.modalHandle}>
              <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
            </View>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Novo Post</Text>
                <View style={styles.xpRewardModal}>
                  <Zap size={12} color="#C9922A" />
                  <Text style={styles.xpRewardModalText}>+{XP_REWARDS.COMMUNITY_POST} XP</Text>
                </View>
              </View>
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
                  <Text style={[styles.typeLabel, { color: newPostType === opt.id ? postTypeColors[opt.id] : colors.textSecondary }]}>{opt.label}</Text>
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
              <Text style={[styles.charCount, { color: colors.textMuted }]}>{newPostContent.length}/500</Text>
              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: newPostContent.trim() ? colors.primary : colors.border }]}
                onPress={handleSubmitPost}
                disabled={!newPostContent.trim()}
              >
                <Send size={18} color={newPostContent.trim() ? '#FFF' : colors.textMuted} />
                <Text style={[styles.submitText, { color: newPostContent.trim() ? '#FFF' : colors.textMuted }]}>Publicar</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Setup Profile Modal */}
      <Modal visible={showSetupProfile} transparent animationType="fade">
        <View style={styles.setupOverlay}>
          <View style={[styles.setupCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.setupTitle, { color: colors.text }]}>Configure seu Perfil</Text>
            <Text style={[styles.setupSub, { color: colors.textMuted }]}>Escolha seu avatar e nome para a comunidade</Text>

            <View style={styles.setupAvatarGrid}>
              {avatarOptions.map(av => (
                <TouchableOpacity
                  key={av}
                  style={[
                    styles.setupAvatarOpt,
                    profileAvatar === av && { backgroundColor: colors.primary + '20', borderColor: colors.primary, borderWidth: 2 },
                    profileAvatar !== av && { backgroundColor: colors.inputBg, borderColor: colors.borderLight, borderWidth: 1 },
                  ]}
                  onPress={() => setProfileAvatar(av)}
                >
                  <Text style={styles.setupAvatarEmoji}>{av}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[styles.setupInput, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.borderLight }]}
              placeholder="Seu nome na comunidade"
              placeholderTextColor={colors.textMuted}
              value={profileName}
              onChangeText={setProfileName}
              maxLength={30}
            />

            <TouchableOpacity
              style={[styles.setupSaveBtn, { backgroundColor: colors.primary }]}
              onPress={handleSaveProfile}
            >
              <Text style={styles.setupSaveBtnText}>Salvar e Entrar</Text>
              <ChevronRight size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 6 },
  headerTitle: { fontSize: 26, fontWeight: '800' as const, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, marginTop: 2 },
  headerProfile: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  headerAvatar: { fontSize: 22 },
  headerLevelBadge: { position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  headerLevelText: { fontSize: 10, fontWeight: '800' as const, color: '#FFF' },

  // XP Mini
  xpMiniRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 8, marginBottom: 8 },
  xpMiniContent: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  xpMiniText: { fontSize: 13, fontWeight: '700' as const },
  xpMiniBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  xpMiniLevel: { fontSize: 11, fontWeight: '600' as const },
  xpMiniBar: { flex: 1, height: 4, borderRadius: 2, overflow: 'hidden' as const },
  xpMiniBarFill: { height: '100%' as const, borderRadius: 2 },

  // Tabs
  tabRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 20, borderBottomWidth: 1 },
  tabItem: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 4 },
  tabLabel: { fontSize: 13, fontWeight: '600' as const },

  // Feed
  feedContainer: { flex: 1 },
  featureStrip: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingTop: 12 },
  featureCard: { flex: 1, borderRadius: 14, padding: 14, borderWidth: 1, gap: 4 },
  featureCardTitle: { fontSize: 14, fontWeight: '700' as const },
  featureCardSub: { fontSize: 11 },
  filterRow: { paddingHorizontal: 20, gap: 8, paddingVertical: 12 },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  filterText: { fontSize: 12, fontWeight: '600' as const },
  feedContent: { paddingHorizontal: 20, paddingTop: 4 },

  // Post Card
  postCard: { borderRadius: 16, borderWidth: 1, marginBottom: 12, overflow: 'hidden' as const },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, paddingBottom: 8 },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  avatarEmoji: { fontSize: 18 },
  postHeaderInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  postUserName: { fontSize: 14, fontWeight: '700' as const },
  levelBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  levelBadgeText: { fontSize: 10, fontWeight: '800' as const },
  postMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2, flexWrap: 'wrap' },
  levelTitle: { fontSize: 11, fontWeight: '600' as const },
  dotSep: { fontSize: 10 },
  typeBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 5 },
  typeText: { fontSize: 10, fontWeight: '700' as const },
  timeText: { fontSize: 11 },
  postContent: { fontSize: 14, lineHeight: 21, paddingHorizontal: 14, paddingBottom: 10 },
  verseTag: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', marginLeft: 14, marginBottom: 10, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  verseTagText: { fontSize: 11, fontWeight: '600' as const },
  postActions: { flexDirection: 'row', borderTopWidth: 1, paddingVertical: 8, paddingHorizontal: 14, gap: 20, alignItems: 'center' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionText: { fontSize: 13, fontWeight: '600' as const },
  xpReward: { flexDirection: 'row', alignItems: 'center', gap: 3, marginLeft: 'auto' },
  xpRewardText: { fontSize: 10, color: '#C9922A', fontWeight: '600' as const },

  // Ranking
  rankingContent: { padding: 20 },
  rankingHeader: { borderRadius: 16, padding: 20, borderWidth: 1, marginBottom: 16, alignItems: 'center', gap: 6 },
  rankingTitle: { fontSize: 18, fontWeight: '700' as const },
  rankingSub: { fontSize: 13, textAlign: 'center' as const, lineHeight: 20 },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 8 },
  rankPosition: { width: 30, alignItems: 'center' },
  rankEmoji: { fontSize: 20 },
  rankNumber: { fontSize: 14, fontWeight: '700' as const },
  rankAvatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  rankAvatarEmoji: { fontSize: 18 },
  rankInfo: { flex: 1 },
  rankNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rankName: { fontSize: 14, fontWeight: '700' as const },
  youBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  youBadgeText: { fontSize: 9, fontWeight: '800' as const, color: '#FFF' },
  rankMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  rankTitle: { fontSize: 11, fontWeight: '600' as const },
  rankXP: { alignItems: 'flex-end' },
  rankXPNumber: { fontSize: 16, fontWeight: '800' as const },
  rankXPLabel: { fontSize: 10 },

  // My Level
  myLevelContent: { padding: 20 },
  profileCard: { borderRadius: 18, padding: 24, borderWidth: 1, marginBottom: 16, alignItems: 'center' },
  profileAvatarLarge: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', borderWidth: 2, marginBottom: 12 },
  profileAvatarEmoji: { fontSize: 32 },
  profileName: { fontSize: 22, fontWeight: '800' as const, marginBottom: 8 },
  profileLevelBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, marginBottom: 20 },
  profileLevelText: { fontSize: 14, fontWeight: '700' as const },
  xpSection: { width: '100%' },
  xpHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  xpTotal: { fontSize: 20, fontWeight: '800' as const },
  xpNext: { fontSize: 12 },
  xpBarBg: { height: 10, borderRadius: 5, overflow: 'hidden' as const, marginBottom: 6 },
  xpBarFill: { height: '100%' as const, borderRadius: 5 },
  xpPercent: { fontSize: 12, textAlign: 'center' as const },
  setupProfileBtn: { marginTop: 16, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
  setupProfileBtnText: { color: '#FFF', fontWeight: '700' as const, fontSize: 14 },

  // XP Guide
  xpGuide: { borderRadius: 16, borderWidth: 1, marginBottom: 16, overflow: 'hidden' as const },
  xpGuideHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, paddingBottom: 8 },
  xpGuideTitle: { fontSize: 16, fontWeight: '700' as const },
  xpGuideRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 11, borderBottomWidth: 0.5 },
  xpGuideEmoji: { fontSize: 18 },
  xpGuideLabel: { flex: 1, fontSize: 13 },
  xpGuideBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  xpGuideXP: { fontSize: 12, fontWeight: '700' as const },

  // All Levels
  allLevels: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' as const },
  allLevelsTitle: { fontSize: 16, fontWeight: '700' as const, padding: 16, paddingBottom: 8 },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5 },
  levelRowEmoji: { fontSize: 24 },
  levelRowInfo: { flex: 1 },
  levelRowNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  levelRowName: { fontSize: 14, fontWeight: '600' as const },
  currentBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  currentBadgeText: { fontSize: 9, fontWeight: '800' as const, color: '#FFF' },
  levelRowXP: { fontSize: 12, marginTop: 2 },
  levelCheck: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  levelCheckEmoji: { fontSize: 14, color: '#10B981' },
  levelLock: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  levelLockEmoji: { fontSize: 14 },

  // Empty
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700' as const, marginBottom: 4 },
  emptySubtitle: { fontSize: 14 },

  // FAB
  fab: { position: 'absolute', bottom: 20, right: 20, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40 },
  modalHandle: { alignItems: 'center', paddingTop: 10, paddingBottom: 6 },
  handleBar: { width: 40, height: 4, borderRadius: 2 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 14 },
  modalTitle: { fontSize: 20, fontWeight: '700' as const },
  xpRewardModal: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  xpRewardModalText: { fontSize: 12, color: '#C9922A', fontWeight: '600' as const },
  typeSelector: { paddingHorizontal: 16, marginBottom: 14 },
  typeOption: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, marginRight: 8 },
  typeEmoji: { fontSize: 14 },
  typeLabel: { fontSize: 12, fontWeight: '600' as const },
  postInput: { marginHorizontal: 20, borderRadius: 14, borderWidth: 1, padding: 16, fontSize: 15, lineHeight: 22, minHeight: 120, maxHeight: 200 },
  modalFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 14 },
  charCount: { fontSize: 12 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  submitText: { fontSize: 14, fontWeight: '700' as const },

  // Setup Profile
  setupOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
  setupCard: { borderRadius: 20, padding: 24, gap: 12 },
  setupTitle: { fontSize: 22, fontWeight: '800' as const, textAlign: 'center' as const },
  setupSub: { fontSize: 14, textAlign: 'center' as const, marginBottom: 8 },
  setupAvatarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 12 },
  setupAvatarOpt: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  setupAvatarEmoji: { fontSize: 22 },
  setupInput: { borderWidth: 1, borderRadius: 14, padding: 14, fontSize: 16, textAlign: 'center' as const },
  setupSaveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, marginTop: 8 },
  setupSaveBtnText: { fontSize: 16, fontWeight: '700' as const, color: '#FFF' },
});
