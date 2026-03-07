import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Send,
  Radio,
  Users,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { getLevelForXP } from '@/constants/levels';

interface ChatMessage {
  id: string;
  userName: string;
  avatar: string;
  level: number;
  levelTitle: string;
  levelColor: string;
  content: string;
  time: string;
  isMe: boolean;
}

const onlineUsers = [
  { name: 'Ana Clara', avatar: '🌸', level: 8 },
  { name: 'Pastor Ricardo', avatar: '📖', level: 12 },
  { name: 'Lucas M.', avatar: '🔥', level: 5 },
  { name: 'Maria E.', avatar: '🕊️', level: 10 },
  { name: 'Gabriela', avatar: '🌅', level: 7 },
  { name: 'Daniel C.', avatar: '🌿', level: 6 },
  { name: 'Priscila', avatar: '🦋', level: 9 },
  { name: 'Marcos A.', avatar: '⭐', level: 11 },
];

const initialMessages: ChatMessage[] = [
  { id: 'm1', userName: 'Pastor Ricardo', avatar: '📖', level: 12, levelTitle: 'Embaixador', levelColor: '#8b5cf6', content: 'Boa noite, família! Que a paz do Senhor esteja com todos vocês 🙏', time: '21:30', isMe: false },
  { id: 'm2', userName: 'Ana Clara', avatar: '🌸', level: 8, levelTitle: 'Sacerdote', levelColor: '#F43F5E', content: 'Amém Pastor! Estou precisando de oração hoje...', time: '21:31', isMe: false },
  { id: 'm3', userName: 'Lucas M.', avatar: '🔥', level: 5, levelTitle: 'Servo', levelColor: '#8B5CF6', content: 'Conta pra gente Ana! Estamos aqui por você 💛', time: '21:31', isMe: false },
  { id: 'm4', userName: 'Ana Clara', avatar: '🌸', level: 8, levelTitle: 'Sacerdote', levelColor: '#F43F5E', content: 'Minha mãe vai fazer uma cirurgia amanhã. Estou com muito medo...', time: '21:32', isMe: false },
  { id: 'm5', userName: 'Gabriela', avatar: '🌅', level: 7, levelTitle: 'Levita', levelColor: '#EC4899', content: 'Ana, Deus está no controle! "Não temas, porque eu sou contigo" Isaías 41:10', time: '21:33', isMe: false },
  { id: 'm6', userName: 'Maria E.', avatar: '🕊️', level: 10, levelTitle: 'Apóstolo', levelColor: '#EAB308', content: 'Estamos orando juntos aqui! Sua mãe está nas mãos de Deus. Ele é o maior médico ❤️', time: '21:33', isMe: false },
  { id: 'm7', userName: 'Pastor Ricardo', avatar: '📖', level: 12, levelTitle: 'Embaixador', levelColor: '#8b5cf6', content: 'Vamos orar juntos agora: Pai, nós te entregamos a mãe da Ana. Tu que és o Deus que cura, opera milagres e sustenta. Em nome de Jesus, amém! 🙏', time: '21:34', isMe: false },
  { id: 'm8', userName: 'Daniel C.', avatar: '🌿', level: 6, levelTitle: 'Obreiro', levelColor: '#A855F7', content: 'Amém! 🙏🙏🙏', time: '21:34', isMe: false },
  { id: 'm9', userName: 'Priscila', avatar: '🦋', level: 9, levelTitle: 'Profeta', levelColor: '#F97316', content: 'Amém! Deus é fiel Ana. Tudo vai dar certo! 💜', time: '21:35', isMe: false },
  { id: 'm10', userName: 'Marcos A.', avatar: '⭐', level: 11, levelTitle: 'Guerreiro', levelColor: '#8b5cf6', content: 'Alguém mais quer compartilhar algo? Este é um espaço seguro para todos nós 🕊️', time: '21:36', isMe: false },
];

const autoResponses = [
  'Amém! 🙏',
  'Que palavra linda! Obrigado por compartilhar',
  'Deus é bom o tempo todo! 💛',
  'Estou orando por isso também',
  'Que o Senhor te abençoe! ❤️',
  'Isso tocou meu coração. Obrigado!',
  'Glória a Deus! Ele é fiel!',
  'Que bonito! Somos uma família em Cristo 🕊️',
];

export default function OnlineChatScreen() {
  const router = useRouter();
  const { colors, state, gainXP } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<FlatList>(null);

  const userLevel = getLevelForXP(state.xp);
  const myName = state.communityName || 'Você';
  const myAvatar = state.communityAvatar || '🙏';

  const handleSend = useCallback(() => {
    if (!inputText.trim()) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const myMsg: ChatMessage = {
      id: Date.now().toString(),
      userName: myName,
      avatar: myAvatar,
      level: userLevel.level,
      levelTitle: userLevel.title,
      levelColor: userLevel.color,
      content: inputText.trim(),
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };

    setMessages(prev => [...prev, myMsg]);
    setInputText('');
    gainXP(2);

    // Simulate auto-response after 2-4 seconds
    const delay = 2000 + Math.random() * 2000;
    const responder = onlineUsers[Math.floor(Math.random() * onlineUsers.length)];
    const response = autoResponses[Math.floor(Math.random() * autoResponses.length)];
    const lvl = getLevelForXP(responder.level * 500);

    setTimeout(() => {
      const autoMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        userName: responder.name,
        avatar: responder.avatar,
        level: responder.level,
        levelTitle: lvl.title,
        levelColor: lvl.color,
        content: response,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        isMe: false,
      };
      setMessages(prev => [...prev, autoMsg]);
    }, delay);
  }, [inputText, myName, myAvatar, userLevel, gainXP]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const renderMessage = useCallback(({ item }: { item: ChatMessage }) => (
    <View style={[styles.msgRow, item.isMe && styles.msgRowMe]}>
      {!item.isMe && (
        <View style={[styles.msgAvatar, { backgroundColor: item.levelColor + '18' }]}>
          <Text style={styles.msgAvatarEmoji}>{item.avatar}</Text>
        </View>
      )}
      <View style={[
        styles.msgBubble,
        item.isMe
          ? { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }
          : { backgroundColor: colors.card, borderColor: colors.borderLight },
      ]}>
        {!item.isMe && (
          <View style={styles.msgNameRow}>
            <Text style={[styles.msgName, { color: item.levelColor }]}>{item.userName}</Text>
            <View style={[styles.msgLevelBadge, { backgroundColor: item.levelColor + '18' }]}>
              <Text style={[styles.msgLevelText, { color: item.levelColor }]}>Lv.{item.level}</Text>
            </View>
          </View>
        )}
        <Text style={[styles.msgContent, { color: colors.text }]}>{item.content}</Text>
        <Text style={[styles.msgTime, { color: colors.textMuted }]}>{item.time}</Text>
      </View>
    </View>
  ), [colors]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Radio size={16} color="#10B981" />
          <Text style={[styles.headerTitle, { color: colors.text }]}>Chat ao Vivo</Text>
        </View>
        <View style={[styles.onlineBadge, { backgroundColor: '#10B981' + '18' }]}>
          <Users size={12} color="#10B981" />
          <Text style={styles.onlineCount}>{onlineUsers.length + 1}</Text>
        </View>
      </View>

      {/* Online Users Strip */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.usersStrip}>
        <View style={[styles.userChip, { backgroundColor: colors.primary + '15' }]}>
          <Text style={styles.userChipEmoji}>{myAvatar}</Text>
          <View style={[styles.userOnlineDot, { borderColor: colors.background }]} />
        </View>
        {onlineUsers.map(u => (
          <View key={u.name} style={[styles.userChip, { backgroundColor: colors.card }]}>
            <Text style={styles.userChipEmoji}>{u.avatar}</Text>
            <View style={[styles.userOnlineDot, { borderColor: colors.background }]} />
          </View>
        ))}
      </ScrollView>

      <FlatList
        ref={scrollRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
      />

      <View style={[styles.inputRow, { backgroundColor: colors.card, borderTopColor: colors.borderLight }]}>
        <TextInput
          style={[styles.chatInput, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.borderLight }]}
          placeholder="Digite sua mensagem..."
          placeholderTextColor={colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: inputText.trim() ? colors.primary : colors.border }]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Send size={18} color={inputText.trim() ? '#FFF' : colors.textMuted} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12, borderBottomWidth: 1 },
  backBtn: { padding: 4 },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '700' as const },
  onlineBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  onlineCount: { fontSize: 12, fontWeight: '700' as const, color: '#10B981' },
  usersStrip: { paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  userChip: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  userChipEmoji: { fontSize: 18 },
  userOnlineDot: { position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: '#10B981', borderWidth: 2 },
  chatContent: { padding: 14, paddingBottom: 4 },
  msgRow: { flexDirection: 'row', marginBottom: 10, gap: 8 },
  msgRowMe: { flexDirection: 'row-reverse' },
  msgAvatar: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  msgAvatarEmoji: { fontSize: 14 },
  msgBubble: { maxWidth: '75%' as const, borderRadius: 16, padding: 10, borderWidth: 1 },
  msgNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  msgName: { fontSize: 12, fontWeight: '700' as const },
  msgLevelBadge: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 },
  msgLevelText: { fontSize: 9, fontWeight: '800' as const },
  msgContent: { fontSize: 14, lineHeight: 20 },
  msgTime: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' as const },
  inputRow: { flexDirection: 'row', padding: 12, gap: 10, borderTopWidth: 1 },
  chatInput: { flex: 1, borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
});
