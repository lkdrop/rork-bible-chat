import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  EyeOff,
  Heart,
  Send,
  Plus,
  X,
  Shield,
  MessageCircle,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';

interface AnonPost {
  id: string;
  content: string;
  category: string;
  likes: number;
  comments: number;
  timeAgo: string;
  isLiked: boolean;
  replies: { id: string; content: string; timeAgo: string }[];
}

const categories = [
  { id: 'anxiety', label: 'Ansiedade', emoji: '😰' },
  { id: 'addiction', label: 'Vícios', emoji: '⛓️' },
  { id: 'doubt', label: 'Dúvidas de fé', emoji: '❓' },
  { id: 'loneliness', label: 'Solidão', emoji: '🥀' },
  { id: 'guilt', label: 'Culpa', emoji: '💔' },
  { id: 'relationship', label: 'Relacionamento', emoji: '💑' },
  { id: 'depression', label: 'Tristeza', emoji: '🌧️' },
  { id: 'family', label: 'Família', emoji: '🏠' },
];

const mockAnonPosts: AnonPost[] = [
  {
    id: 'a1',
    content: 'Eu tenho muita dificuldade em orar. Às vezes sinto que Deus não me ouve. Alguém mais passa por isso? Tenho vergonha de falar isso na igreja.',
    category: 'Dúvidas de fé',
    likes: 89,
    comments: 34,
    timeAgo: '1h',
    isLiked: false,
    replies: [
      { id: 'r1', content: 'Você não está sozinho(a). Eu passo por isso também. Mas lembre-se: "O Espírito nos ajuda em nossa fraqueza" (Rm 8:26). Deus ouve até nosso silêncio.', timeAgo: '45min' },
      { id: 'r2', content: 'Eu já estive aí. O que me ajudou foi simplesmente conversar com Deus como um amigo, sem formalidade. Ele te ouve sim! 🙏', timeAgo: '30min' },
    ],
  },
  {
    id: 'a2',
    content: 'Sou líder na igreja mas estou lutando com um vício que ninguém sabe. Me sinto um hipócrita. Preciso de oração mas não tenho coragem de pedir pessoalmente.',
    category: 'Vícios',
    likes: 156,
    comments: 67,
    timeAgo: '3h',
    isLiked: false,
    replies: [
      { id: 'r3', content: 'A graça de Deus é maior que qualquer vício. "Onde abundou o pecado, superabundou a graça" (Rm 5:20). Você é amado(a) assim como está. Orando por você!', timeAgo: '2h' },
    ],
  },
  {
    id: 'a3',
    content: 'Perdi meu filho há 6 meses e não consigo mais sentir a presença de Deus. Todo mundo fala que "Deus tem um plano" mas eu só sinto raiva. Isso é pecado?',
    category: 'Tristeza',
    likes: 234,
    comments: 89,
    timeAgo: '5h',
    isLiked: false,
    replies: [
      { id: 'r4', content: 'Sentir raiva não é pecado. Até Jó questionou Deus. Seu luto é válido. "Perto está o Senhor dos que têm o coração quebrantado" (Sl 34:18). Chorando com você. ❤️', timeAgo: '4h' },
      { id: 'r5', content: 'Não existe fórmula para a dor. Dê-se permissão para sentir. Deus aguenta suas perguntas. Ele chora com você.', timeAgo: '3h' },
    ],
  },
  {
    id: 'a4',
    content: 'Me sinto extremamente sozinho na fé. Não tenho amigos cristãos de verdade. Na igreja todos parecem tão perfeitos e eu me sinto um fracasso.',
    category: 'Solidão',
    likes: 178,
    comments: 56,
    timeAgo: '8h',
    isLiked: false,
    replies: [
      { id: 'r6', content: 'Ninguém é perfeito. "Todos pecaram e destituídos estão da glória de Deus" (Rm 3:23). Essas "máscaras" na igreja machucam muita gente. Você é real e isso é corajoso.', timeAgo: '7h' },
    ],
  },
  {
    id: 'a5',
    content: 'Penso em desistir do casamento todo dia. Já não sinto amor. Mas tenho medo de decepcionar Deus e minha família. O que faço?',
    category: 'Relacionamento',
    likes: 112,
    comments: 45,
    timeAgo: '12h',
    isLiked: false,
    replies: [
      { id: 'r7', content: 'Busque aconselhamento pastoral de confiança. Deus não quer que você sofra em silêncio. O amor pode ser restaurado, mas às vezes precisa de ajuda profissional também.', timeAgo: '11h' },
    ],
  },
];

export default function AnonymousScreen() {
  const router = useRouter();
  const { colors } = useApp();
  const [posts, setPosts] = useState<AnonPost[]>(mockAnonPosts);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('anxiety');
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const modalSlide = useRef(new Animated.Value(300)).current;

  const handleLike = useCallback((postId: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p
    ));
  }, []);

  const openNewPost = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowNewPost(true);
    Animated.spring(modalSlide, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }).start();
  }, [modalSlide]);

  const closeNewPost = useCallback(() => {
    Animated.timing(modalSlide, { toValue: 300, duration: 200, useNativeDriver: true }).start(() => {
      setShowNewPost(false);
      setNewContent('');
    });
  }, [modalSlide]);

  const handleSubmit = useCallback(() => {
    if (!newContent.trim()) return;
    const cat = categories.find(c => c.id === newCategory);
    const newPost: AnonPost = {
      id: Date.now().toString(),
      content: newContent.trim(),
      category: cat?.label || 'Geral',
      likes: 0,
      comments: 0,
      timeAgo: 'agora',
      isLiked: false,
      replies: [],
    };
    setPosts(prev => [newPost, ...prev]);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    closeNewPost();
  }, [newContent, newCategory, closeNewPost]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <EyeOff size={18} color="#6366F1" />
          <Text style={[styles.headerTitle, { color: colors.text }]}>Anônimo</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <View style={[styles.safeBanner, { backgroundColor: '#6366F1' + '10', borderColor: '#6366F1' + '25' }]}>
        <Shield size={16} color="#6366F1" />
        <Text style={[styles.safeBannerText, { color: '#6366F1' }]}>
          Espaço seguro. Sua identidade é 100% protegida. Sem julgamentos.
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.feedContent}>
        {posts.map(post => (
          <View key={post.id} style={[styles.postCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <View style={styles.postHeader}>
              <View style={[styles.anonAvatar, { backgroundColor: '#6366F1' + '15' }]}>
                <EyeOff size={16} color="#6366F1" />
              </View>
              <View style={styles.postHeaderInfo}>
                <Text style={[styles.anonName, { color: '#6366F1' }]}>Anônimo(a)</Text>
                <View style={styles.postMeta}>
                  <View style={[styles.catBadge, { backgroundColor: '#6366F1' + '12' }]}>
                    <Text style={[styles.catText, { color: '#6366F1' }]}>{post.category}</Text>
                  </View>
                  <Text style={[styles.timeText, { color: colors.textMuted }]}>{post.timeAgo}</Text>
                </View>
              </View>
            </View>

            <Text style={[styles.postContent, { color: colors.text }]}>{post.content}</Text>

            <View style={[styles.postActions, { borderTopColor: colors.borderLight }]}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => handleLike(post.id)}>
                <Heart size={18} color={post.isLiked ? '#EF4444' : colors.textMuted} fill={post.isLiked ? '#EF4444' : 'transparent'} />
                <Text style={[styles.actionText, { color: post.isLiked ? '#EF4444' : colors.textMuted }]}>Apoiar {post.likes}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => setExpandedPost(expandedPost === post.id ? null : post.id)}>
                <MessageCircle size={18} color={colors.textMuted} />
                <Text style={[styles.actionText, { color: colors.textMuted }]}>{post.replies.length} respostas</Text>
              </TouchableOpacity>
            </View>

            {expandedPost === post.id && post.replies.length > 0 && (
              <View style={[styles.repliesSection, { backgroundColor: colors.cardElevated }]}>
                {post.replies.map(reply => (
                  <View key={reply.id} style={[styles.replyCard, { borderLeftColor: '#6366F1' + '40' }]}>
                    <View style={styles.replyHeader}>
                      <View style={[styles.replyAvatar, { backgroundColor: '#10B981' + '15' }]}>
                        <Shield size={10} color="#10B981" />
                      </View>
                      <Text style={[styles.replyName, { color: '#10B981' }]}>Anônimo(a)</Text>
                      <Text style={[styles.replyTime, { color: colors.textMuted }]}>{reply.timeAgo}</Text>
                    </View>
                    <Text style={[styles.replyContent, { color: colors.textSecondary }]}>{reply.content}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity style={[styles.fab, { backgroundColor: '#6366F1' }]} onPress={openNewPost}>
        <Plus size={24} color="#FFF" />
      </TouchableOpacity>

      {showNewPost && (
        <View style={styles.fixedOverlay}>
          <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <TouchableOpacity style={styles.modalBackdrop} onPress={closeNewPost} activeOpacity={1} />
            <Animated.View style={[styles.modalContent, { backgroundColor: colors.card, transform: [{ translateY: modalSlide }] }]}>
              <View style={styles.modalHandle}>
                <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
              </View>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleRow}>
                  <EyeOff size={18} color="#6366F1" />
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Desabafo Anônimo</Text>
                </View>
                <TouchableOpacity onPress={closeNewPost}>
                  <X size={22} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.modalSub, { color: colors.textMuted }]}>
                Ninguém saberá quem você é. Compartilhe o que está no seu coração.
              </Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catSelector}>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.catOption,
                      newCategory === cat.id ? { backgroundColor: '#6366F1' + '15', borderColor: '#6366F1' } : { backgroundColor: colors.inputBg, borderColor: colors.borderLight },
                    ]}
                    onPress={() => setNewCategory(cat.id)}
                  >
                    <Text style={styles.catEmoji}>{cat.emoji}</Text>
                    <Text style={[styles.catLabel, { color: newCategory === cat.id ? '#6366F1' : colors.textSecondary }]}>{cat.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TextInput
                style={[styles.postInput, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.borderLight }]}
                placeholder="O que está no seu coração? Você está seguro(a) aqui..."
                placeholderTextColor={colors.textMuted}
                multiline
                maxLength={1000}
                value={newContent}
                onChangeText={setNewContent}
                textAlignVertical="top"
              />

              <View style={styles.modalFooter}>
                <Text style={[styles.charCount, { color: colors.textMuted }]}>{newContent.length}/1000</Text>
                <TouchableOpacity
                  style={[styles.submitBtn, { backgroundColor: newContent.trim() ? '#6366F1' : colors.border }]}
                  onPress={handleSubmit}
                  disabled={!newContent.trim()}
                >
                  <Send size={18} color={newContent.trim() ? '#FFF' : colors.textMuted} />
                  <Text style={[styles.submitText, { color: newContent.trim() ? '#FFF' : colors.textMuted }]}>Publicar</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, borderBottomWidth: 1 },
  backBtn: { padding: 4 },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700' as const },
  headerSpacer: { width: 30 },
  safeBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 20, marginTop: 12, padding: 12, borderRadius: 12, borderWidth: 1 },
  safeBannerText: { flex: 1, fontSize: 12, fontWeight: '600' as const, lineHeight: 18 },
  feedContent: { padding: 20, paddingTop: 12 },
  postCard: { borderRadius: 16, borderWidth: 1, marginBottom: 12, overflow: 'hidden' as const },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, paddingBottom: 8 },
  anonAvatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  postHeaderInfo: { flex: 1 },
  anonName: { fontSize: 14, fontWeight: '700' as const },
  postMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  catBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  catText: { fontSize: 10, fontWeight: '700' as const },
  timeText: { fontSize: 11 },
  postContent: { fontSize: 14, lineHeight: 22, paddingHorizontal: 14, paddingBottom: 12 },
  postActions: { flexDirection: 'row', borderTopWidth: 1, paddingVertical: 10, paddingHorizontal: 14, gap: 20 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionText: { fontSize: 13, fontWeight: '600' as const },
  repliesSection: { padding: 14, paddingTop: 0 },
  replyCard: { borderLeftWidth: 3, paddingLeft: 12, marginBottom: 10, paddingVertical: 4 },
  replyHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  replyAvatar: { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  replyName: { fontSize: 12, fontWeight: '700' as const },
  replyTime: { fontSize: 10 },
  replyContent: { fontSize: 13, lineHeight: 20 },
  fab: { position: 'absolute', bottom: 20, right: 20, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  fixedOverlay: { position: 'fixed' as any, top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40 },
  modalHandle: { alignItems: 'center', paddingTop: 10, paddingBottom: 6 },
  handleBar: { width: 40, height: 4, borderRadius: 2 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 8 },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  modalTitle: { fontSize: 20, fontWeight: '700' as const },
  modalSub: { fontSize: 13, paddingHorizontal: 20, marginBottom: 14, lineHeight: 20 },
  catSelector: { paddingHorizontal: 16, marginBottom: 14 },
  catOption: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, marginRight: 8 },
  catEmoji: { fontSize: 14 },
  catLabel: { fontSize: 12, fontWeight: '600' as const },
  postInput: { marginHorizontal: 20, borderRadius: 14, borderWidth: 1, padding: 16, fontSize: 15, lineHeight: 22, minHeight: 120, maxHeight: 200 },
  modalFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 14 },
  charCount: { fontSize: 12 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  submitText: { fontSize: 14, fontWeight: '700' as const },
});
