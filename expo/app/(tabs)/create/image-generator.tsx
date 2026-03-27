import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Sparkles,
  Download,
  Share2,
  RefreshCw,
  Crown,
  ImageIcon,
  Lightbulb,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system';
import { useApp } from '@/contexts/AppContext';
import { usePremium } from '@/hooks/usePremium';
import {
  IMAGE_STYLES,
  INSPIRATION_VERSES,
  generateImage,
  type ImageStyle,
} from '@/services/imageGeneration';

export default function ImageGeneratorScreen() {
  const router = useRouter();
  const { colors, state } = useApp();
  const { canGenerateImage, recordImageGen, getRemainingImages, plan } = usePremium();
  const [description, setDescription] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>(IMAGE_STYLES[0]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!description.trim()) {
      Alert.alert('Descricao necessaria', 'Descreva a imagem que voce quer criar.');
      return;
    }

    if (!canGenerateImage()) {
      if (plan === 'free') {
        if (Platform.OS === 'web') {
          if (confirm('Recurso Premium: A geracao de imagens IA e exclusiva para assinantes. Ir para planos?')) {
            router.push('/paywall' as never);
          }
        } else {
          Alert.alert(
            'Recurso Premium',
            'A geracao de imagens IA e exclusiva para assinantes. Assine para desbloquear!',
            [
              { text: 'Ver planos', onPress: () => router.push('/paywall' as never) },
              { text: 'Cancelar', style: 'cancel' },
            ]
          );
        }
      } else {
        Alert.alert('Limite atingido', 'Voce atingiu o limite de imagens para hoje. Tente novamente amanha!');
      }
      return;
    }

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    const result = await generateImage(description, selectedStyle);

    if (result.success && result.imageBase64) {
      setGeneratedImage(result.imageBase64);
      recordImageGen();
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setError(result.error || 'Erro ao gerar imagem');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setIsGenerating(false);
  }, [description, selectedStyle, canGenerateImage, recordImageGen, plan, router]);

  const handleSave = useCallback(async () => {
    if (!generatedImage) return;

    try {
      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = `data:image/png;base64,${generatedImage}`;
        link.download = `biblia-ia-${Date.now()}.png`;
        link.click();
      } else {
        const filename = `biblia-ia-${Date.now()}.png`;
        const fileUri = `${FileSystem.documentDirectory}${filename}`;
        await FileSystem.writeAsStringAsync(fileUri, generatedImage, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await Share.share({ url: fileUri, message: 'Criado com Devocio.IA' });
      }
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      Alert.alert('Erro', 'Nao foi possivel salvar a imagem.');
    }
  }, [generatedImage]);

  const handleShare = useCallback(async () => {
    if (!generatedImage) return;

    try {
      if (Platform.OS === 'web') {
        const byteChars = atob(generatedImage);
        const byteArr = new Uint8Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
        const blob = new Blob([byteArr], { type: 'image/png' });
        const file = new File([blob], `biblia-ia-${Date.now()}.png`, { type: 'image/png' });
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], text: 'Criado com Devocio.IA' });
        } else {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `biblia-ia-${Date.now()}.png`;
          link.click();
          URL.revokeObjectURL(link.href);
          alert('Imagem baixada!');
        }
      } else {
        const filename = `biblia-ia-${Date.now()}.png`;
        const fileUri = `${FileSystem.documentDirectory}${filename}`;
        await FileSystem.writeAsStringAsync(fileUri, generatedImage, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await Share.share({ url: fileUri, message: 'Criado com Devocio.IA' });
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') console.log('Share error:', err);
    }
  }, [generatedImage]);

  const handleInspirationPress = useCallback((text: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDescription(text);
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Gerador de Imagens</Text>
          <View style={[styles.aiBadge, { backgroundColor: '#EC4899' + '15' }]}>
            <Sparkles size={10} color="#EC4899" />
            <Text style={[styles.aiBadgeText, { color: '#EC4899' }]}>IA</Text>
          </View>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Premium gate banner */}
        {plan === 'free' ? (
          <TouchableOpacity
            style={styles.premiumBanner}
            onPress={() => router.push('/paywall' as never)}
            activeOpacity={0.8}
          >
            <Crown size={18} color="#F59E0B" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.premiumBannerTitle}>Recurso Premium</Text>
              <Text style={styles.premiumBannerText}>Assine para gerar imagens com IA</Text>
            </View>
            <Text style={styles.premiumBannerCta}>Ver planos</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.remainingBanner}>
            <ImageIcon size={14} color="#C5943A" />
            <Text style={styles.remainingText}>
              {getRemainingImages()} imagens restantes hoje
            </Text>
          </View>
        )}

        {/* Description Input */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Descreva sua imagem</Text>
        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <TextInput
            style={[styles.textInput, { color: colors.text }]}
            placeholder="Ex: Jesus acalmando a tempestade com luz divina..."
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={200}
            value={description}
            onChangeText={setDescription}
          />
          <Text style={[styles.charCount, { color: colors.textMuted }]}>
            {description.length}/200
          </Text>
        </View>

        {/* Inspiration Chips */}
        <View style={styles.inspirationRow}>
          <Lightbulb size={14} color={colors.textMuted} />
          <Text style={[styles.inspirationLabel, { color: colors.textMuted }]}>Inspiracao:</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          <View style={styles.chipsRow}>
            {INSPIRATION_VERSES.map((item) => (
              <TouchableOpacity
                key={item.verse}
                style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
                onPress={() => handleInspirationPress(item.text)}
              >
                <Text style={[styles.chipText, { color: colors.text }]}>{item.text}</Text>
                <Text style={[styles.chipVerse, { color: colors.textMuted }]}>{item.verse}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Style Selection */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>Escolha o estilo</Text>
        <View style={styles.stylesGrid}>
          {IMAGE_STYLES.map((style) => {
            const isSelected = selectedStyle.id === style.id;
            return (
              <TouchableOpacity
                key={style.id}
                style={[
                  styles.styleCard,
                  {
                    backgroundColor: isSelected ? '#EC4899' + '15' : colors.card,
                    borderColor: isSelected ? '#EC4899' : colors.borderLight,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedStyle(style);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.styleEmoji}>{style.emoji}</Text>
                <Text style={[styles.styleName, { color: isSelected ? '#EC4899' : colors.text }]}>
                  {style.name}
                </Text>
                <Text style={[styles.styleDesc, { color: colors.textMuted }]} numberOfLines={1}>
                  {style.description}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={[styles.generateBtn, isGenerating && styles.generateBtnDisabled]}
          onPress={handleGenerate}
          disabled={isGenerating}
          activeOpacity={0.8}
        >
          {isGenerating ? (
            <>
              <ActivityIndicator size="small" color="#FFF" />
              <Text style={styles.generateBtnText}>Gerando imagem...</Text>
            </>
          ) : (
            <>
              <Sparkles size={18} color="#FFF" />
              <Text style={styles.generateBtnText}>Gerar Imagem com IA</Text>
            </>
          )}
        </TouchableOpacity>

        {!state.isPremium && (
          <TouchableOpacity
            style={[styles.premiumHint, { backgroundColor: '#C5943A' + '10', borderColor: '#C5943A' + '30' }]}
            onPress={() => router.push('/paywall' as never)}
          >
            <Crown size={14} color="#C5943A" />
            <Text style={[styles.premiumHintText, { color: '#C5943A' }]}>
              Premium = imagens ilimitadas + estilos exclusivos
            </Text>
          </TouchableOpacity>
        )}

        {/* Error */}
        {error && (
          <View style={[styles.errorCard, { backgroundColor: '#EF4444' + '15', borderColor: '#EF4444' + '30' }]}>
            <Text style={[styles.errorText, { color: '#EF4444' }]}>{error}</Text>
            <TouchableOpacity onPress={handleGenerate}>
              <Text style={[styles.errorRetry, { color: '#EF4444' }]}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Generated Image */}
        {generatedImage && (
          <View style={styles.resultContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Sua imagem</Text>
            <View style={[styles.imageWrapper, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              <Image
                source={{ uri: `data:image/png;base64,${generatedImage}` }}
                style={styles.generatedImage}
                resizeMode="contain"
              />
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#10B981' }]}
                onPress={handleSave}
              >
                <Download size={18} color="#FFF" />
                <Text style={styles.actionBtnText}>Salvar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#3B82F6' }]}
                onPress={handleShare}
              >
                <Share2 size={18} color="#FFF" />
                <Text style={styles.actionBtnText}>Compartilhar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#C5943A' }]}
                onPress={handleGenerate}
              >
                <RefreshCw size={18} color="#FFF" />
                <Text style={styles.actionBtnText}>Refazer</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.watermark, { color: colors.textMuted }]}>
              Criado com Devocio.IA ✨
            </Text>
          </View>
        )}

        {/* Generating Placeholder */}
        {isGenerating && (
          <View style={[styles.generatingCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <ActivityIndicator size="large" color="#EC4899" />
            <Text style={[styles.generatingTitle, { color: colors.text }]}>Criando sua obra de arte...</Text>
            <Text style={[styles.generatingSubtitle, { color: colors.textMuted }]}>
              A IA esta desenhando com base na sua descricao.{'\n'}Isso pode levar alguns segundos.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700' as const },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  aiBadgeText: { fontSize: 10, fontWeight: '700' as const },
  scrollContent: { padding: 20, paddingBottom: 40 },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B15',
    borderWidth: 1,
    borderColor: '#F59E0B40',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  premiumBannerTitle: { fontSize: 14, fontWeight: '700' as const, color: '#F59E0B' },
  premiumBannerText: { fontSize: 12, color: '#AAAAAA', marginTop: 2 },
  premiumBannerCta: { fontSize: 13, fontWeight: '700' as const, color: '#F59E0B' },
  remainingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#C5943A10',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  remainingText: { fontSize: 12, fontWeight: '600' as const, color: '#C5943A' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 10,
  },
  inputContainer: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  textInput: {
    fontSize: 15,
    lineHeight: 22,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 11,
    textAlign: 'right',
    marginTop: 4,
  },
  inspirationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  inspirationLabel: { fontSize: 13, fontWeight: '600' as const },
  chipsScroll: { marginBottom: 4 },
  chipsRow: { flexDirection: 'row', gap: 8, paddingRight: 20 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    maxWidth: 180,
  },
  chipText: { fontSize: 13, fontWeight: '600' as const, marginBottom: 2 },
  chipVerse: { fontSize: 11 },
  stylesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  styleCard: {
    width: '31%',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  styleEmoji: { fontSize: 24, marginBottom: 6 },
  styleName: { fontSize: 11, fontWeight: '700' as const, textAlign: 'center', marginBottom: 2 },
  styleDesc: { fontSize: 10, textAlign: 'center' },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EC4899',
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 10,
  },
  generateBtnDisabled: { opacity: 0.6 },
  generateBtnText: { fontSize: 16, fontWeight: '700' as const, color: '#FFF' },
  premiumHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  premiumHintText: { fontSize: 12, fontWeight: '600' as const },
  errorCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    alignItems: 'center',
  },
  errorText: { fontSize: 13, textAlign: 'center', marginBottom: 8 },
  errorRetry: { fontSize: 14, fontWeight: '700' as const },
  resultContainer: { marginTop: 10 },
  imageWrapper: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 14,
  },
  generatedImage: {
    width: '100%',
    aspectRatio: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionBtnText: { fontSize: 13, fontWeight: '700' as const, color: '#FFF' },
  watermark: { fontSize: 12, textAlign: 'center' },
  generatingCard: {
    padding: 30,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  generatingTitle: { fontSize: 16, fontWeight: '700' as const },
  generatingSubtitle: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
});
