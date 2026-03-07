import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Camera, ImageIcon, Send } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { postTypeLabels, postTypeColors } from '@/constants/communityData';
import type { CommunityPostType } from '@/types';

const postTypes: { id: CommunityPostType; label: string; emoji: string }[] = [
  { id: 'testimony', label: 'Testemunho', emoji: '🙌' },
  { id: 'prayer', label: 'Oração', emoji: '🙏' },
  { id: 'question', label: 'Pergunta', emoji: '❓' },
  { id: 'devotional', label: 'Devocional', emoji: '📖' },
  { id: 'verse', label: 'Versículo', emoji: '✨' },
];

export default function NewPostScreen() {
  const router = useRouter();
  const { colors, state, addCommunityPost, gainXP } = useApp();
  const [content, setContent] = useState('');
  const [selectedType, setSelectedType] = useState<CommunityPostType>('devotional');
  const [images, setImages] = useState<string[]>([]);

  const pickImage = useCallback(async (fromCamera: boolean) => {
    if (images.length >= 5) {
      Alert.alert('Limite', 'Máximo de 5 fotos por post.');
      return;
    }

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.7,
      base64: false,
      allowsMultipleSelection: !fromCamera,
      selectionLimit: 5 - images.length,
    };

    let result;
    if (fromCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera.');
        return;
      }
      result = await ImagePicker.launchCameraAsync(options);
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria.');
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync(options);
    }

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(a => a.uri).slice(0, 5 - images.length);
      setImages(prev => [...prev, ...newImages]);
    }
  }, [images.length]);

  const removeImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const hasPostedToday = useCallback((): boolean => {
    const today = new Date().toDateString();
    return state.communityPosts.some(
      (p) => new Date(p.date).toDateString() === today
    );
  }, [state.communityPosts]);

  const handlePublish = useCallback(() => {
    if (!content.trim() && images.length === 0) {
      Alert.alert('Post vazio', 'Escreva algo ou adicione uma foto.');
      return;
    }

    if (hasPostedToday()) {
      Alert.alert(
        'Limite diário',
        'Você já publicou hoje. Volte amanhã para compartilhar mais!'
      );
      return;
    }

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addCommunityPost(content.trim(), selectedType, images);
    gainXP(20);
    router.back();
  }, [content, images, selectedType, addCommunityPost, gainXP, router, hasPostedToday]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Novo Post</Text>
        <TouchableOpacity
          style={[styles.publishBtn, { backgroundColor: colors.primary }, (!content.trim() && images.length === 0) && { opacity: 0.4 }]}
          onPress={handlePublish}
          disabled={!content.trim() && images.length === 0}
        >
          <Send size={16} color="#FFF" />
          <Text style={styles.publishText}>Publicar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.userRow}>
          <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
            <Text style={styles.avatarEmoji}>{state.communityAvatar}</Text>
          </View>
          <View>
            <Text style={[styles.userName, { color: colors.text }]}>{state.communityName || 'Seu nome'}</Text>
            <Text style={[styles.postTypeLabel, { color: postTypeColors[selectedType] }]}>
              {postTypeLabels[selectedType]}
            </Text>
          </View>
        </View>

        <TextInput
          style={[styles.textInput, { color: colors.text }]}
          placeholder="O que Deus colocou no seu coração?"
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={500}
          value={content}
          onChangeText={setContent}
          autoFocus
        />

        <Text style={[styles.charCount, { color: colors.textMuted }]}>{content.length}/500</Text>

        {images.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesRow}>
            {images.map((uri, i) => (
              <View key={i} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.imageThumb} />
                <TouchableOpacity style={styles.removeImage} onPress={() => removeImage(i)}>
                  <X size={14} color="#FFF" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        <View style={[styles.mediaBar, { borderTopColor: colors.border }]}>
          <TouchableOpacity style={[styles.mediaBtn, { backgroundColor: colors.card }]} onPress={() => void pickImage(true)}>
            <Camera size={20} color={colors.primary} />
            <Text style={[styles.mediaBtnText, { color: colors.text }]}>Câmera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.mediaBtn, { backgroundColor: colors.card }]} onPress={() => void pickImage(false)}>
            <ImageIcon size={20} color={colors.primary} />
            <Text style={[styles.mediaBtnText, { color: colors.text }]}>Galeria</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.typeLabel, { color: colors.textSecondary }]}>Tipo do post</Text>
        <View style={styles.typeRow}>
          {postTypes.map(t => (
            <TouchableOpacity
              key={t.id}
              style={[
                styles.typeChip,
                {
                  backgroundColor: selectedType === t.id ? postTypeColors[t.id] + '20' : colors.card,
                  borderColor: selectedType === t.id ? postTypeColors[t.id] : colors.borderLight,
                },
              ]}
              onPress={() => setSelectedType(t.id)}
            >
              <Text style={styles.typeEmoji}>{t.emoji}</Text>
              <Text style={[styles.typeText, { color: selectedType === t.id ? postTypeColors[t.id] : colors.text }]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
  closeBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  publishBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  publishText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  body: { flex: 1, padding: 16 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  avatarEmoji: { fontSize: 22 },
  userName: { fontSize: 16, fontWeight: '700' },
  postTypeLabel: { fontSize: 12, fontWeight: '600' },
  textInput: { fontSize: 17, lineHeight: 26, minHeight: 120, textAlignVertical: 'top' },
  charCount: { fontSize: 12, textAlign: 'right', marginBottom: 12 },
  imagesRow: { marginBottom: 16 },
  imageWrapper: { marginRight: 10, position: 'relative' },
  imageThumb: { width: 100, height: 100, borderRadius: 12 },
  removeImage: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.6)', width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  mediaBar: { flexDirection: 'row', gap: 10, paddingTop: 16, borderTopWidth: 1, marginBottom: 20 },
  mediaBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12 },
  mediaBtnText: { fontSize: 14, fontWeight: '600' },
  typeLabel: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 40 },
  typeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  typeEmoji: { fontSize: 16 },
  typeText: { fontSize: 13, fontWeight: '600' },
});
