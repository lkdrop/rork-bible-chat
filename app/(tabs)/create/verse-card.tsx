import React, { useState, useCallback, useRef, useEffect } from 'react';
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
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Share2,
  Sparkles,
  ImageIcon,
  Palette,
  Type,
  Wand2,
  Check,
  RectangleVertical,
  Square,
  Eye,
  RotateCcw,
  Zap,
  Star,
  Heart,
  Sun,
  Moon,
  Feather,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { generateImage, IMAGE_STYLES, type ImageStyle } from '@/services/imageGeneration';
import { shareContent } from '@/utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Types ───────────────────────────────────────────
type CardFormat = '1:1' | '9:16';
type BackgroundMode = 'gradient' | 'ai';
type FontStyle = 'serif' | 'modern' | 'handwritten' | 'bold' | 'elegant';
type TextPosition = 'center' | 'bottom' | 'top';
type CardFrame = 'none' | 'thin' | 'ornate' | 'rounded';

interface GradientTemplate {
  id: string;
  name: string;
  colors: [string, string, string];
  textColor: string;
  refColor: string;
  category: 'premium' | 'warm' | 'nature' | 'minimal' | 'dramatic';
  emoji: string;
}

// ─── Premium Gradient Templates ─────────────────────
const GRADIENT_TEMPLATES: GradientTemplate[] = [
  // Premium & Luxurious
  { id: 'royal-noir',      name: 'Royal Noir',      colors: ['#0a0a0a', '#1a1025', '#2d1654'], textColor: '#f5f0ff', refColor: '#E8C876', category: 'premium', emoji: '👑' },
  { id: 'obsidian',        name: 'Obsidian',        colors: ['#0c0c0c', '#171720', '#1e1e30'], textColor: '#ffffff', refColor: '#94a3b8', category: 'premium', emoji: '🖤' },
  { id: 'sapphire-night',  name: 'Safira',          colors: ['#020617', '#0f172a', '#1e3a5f'], textColor: '#e2e8f0', refColor: '#60a5fa', category: 'premium', emoji: '💎' },
  { id: 'aurora',          name: 'Aurora',           colors: ['#0a0520', '#1b0a3c', '#3b0764'], textColor: '#f0e7ff', refColor: '#d8b4fe', category: 'premium', emoji: '🌌' },
  { id: 'velvet',          name: 'Veludo',           colors: ['#1a0005', '#3b0012', '#5c0a2a'], textColor: '#fff1f2', refColor: '#fda4af', category: 'premium', emoji: '🎭' },

  // Warm & Sacred
  { id: 'holy-gold',       name: 'Ouro Sagrado',    colors: ['#451a03', '#78350f', '#b45309'], textColor: '#fef3c7', refColor: '#fcd34d', category: 'warm', emoji: '✨' },
  { id: 'burning-bush',    name: 'Sarca Ardente',   colors: ['#7c2d12', '#9a3412', '#c2410c'], textColor: '#fff7ed', refColor: '#fdba74', category: 'warm', emoji: '🔥' },
  { id: 'wine-communion',  name: 'Vinho',           colors: ['#3b0724', '#6b1541', '#9d174d'], textColor: '#fdf2f8', refColor: '#f9a8d4', category: 'warm', emoji: '🍷' },
  { id: 'terracotta',      name: 'Terracota',       colors: ['#431407', '#7c2d12', '#b45309'], textColor: '#fef9c3', refColor: '#fde68a', category: 'warm', emoji: '🏺' },
  { id: 'amber-temple',    name: 'Templo',          colors: ['#78350f', '#92400e', '#a16207'], textColor: '#fffbeb', refColor: '#fde047', category: 'warm', emoji: '🕍' },

  // Nature & Spiritual
  { id: 'eden-garden',     name: 'Jardim do Eden',  colors: ['#022c22', '#064e3b', '#047857'], textColor: '#ecfdf5', refColor: '#6ee7b7', category: 'nature', emoji: '🌿' },
  { id: 'jordan-river',    name: 'Rio Jordao',      colors: ['#042f2e', '#0f766e', '#0d9488'], textColor: '#f0fdfa', refColor: '#5eead4', category: 'nature', emoji: '🌊' },
  { id: 'olive-mount',     name: 'Monte Oliveiras', colors: ['#1a2e05', '#365314', '#4d7c0f'], textColor: '#f7fee7', refColor: '#bef264', category: 'nature', emoji: '🫒' },
  { id: 'cedar-lebanon',   name: 'Cedro',           colors: ['#14261a', '#1b3a23', '#285e3b'], textColor: '#f0fdf4', refColor: '#86efac', category: 'nature', emoji: '🌲' },

  // Minimal & Clean
  { id: 'parchment',       name: 'Pergaminho',      colors: ['#faf5eb', '#f0e8d5', '#e4d5b7'], textColor: '#292524', refColor: '#78716c', category: 'minimal', emoji: '📜' },
  { id: 'cloud-white',     name: 'Nuvem',           colors: ['#f8fafc', '#f1f5f9', '#e2e8f0'], textColor: '#1e293b', refColor: '#64748b', category: 'minimal', emoji: '☁️' },
  { id: 'pearl',           name: 'Perola',          colors: ['#fefce8', '#fef9c3', '#fef08a'], textColor: '#422006', refColor: '#854d0e', category: 'minimal', emoji: '🤍' },
  { id: 'soft-lavender',   name: 'Lavanda',         colors: ['#faf5ff', '#f3e8ff', '#e9d5ff'], textColor: '#3b0764', refColor: '#B8862D', category: 'minimal', emoji: '💜' },
  { id: 'rose-water',      name: 'Agua de Rosas',   colors: ['#fff1f2', '#ffe4e6', '#fecdd3'], textColor: '#4c0519', refColor: '#e11d48', category: 'minimal', emoji: '🌹' },

  // Dramatic & Cinematic
  { id: 'calvary-sunset',  name: 'Calvario',        colors: ['#1c0808', '#3b0f0f', '#7f1d1d'], textColor: '#fef2f2', refColor: '#fca5a5', category: 'dramatic', emoji: '✝️' },
  { id: 'storm-galilee',   name: 'Tempestade',      colors: ['#0c1021', '#1e293b', '#334155'], textColor: '#e2e8f0', refColor: '#94a3b8', category: 'dramatic', emoji: '⛈️' },
  { id: 'resurrection',    name: 'Ressurreicao',    colors: ['#1a0533', '#6B4E0F', '#B8862D'], textColor: '#f5f3ff', refColor: '#ddd6fe', category: 'dramatic', emoji: '🌅' },
  { id: 'genesis-void',    name: 'Genesis',         colors: ['#000000', '#030712', '#111827'], textColor: '#f9fafb', refColor: '#6b7280', category: 'dramatic', emoji: '🌑' },
];

const FONT_STYLES: { id: FontStyle; name: string; preview: string; desc: string }[] = [
  { id: 'serif',        name: 'Classico',    preview: 'Aa',  desc: 'Elegante' },
  { id: 'modern',       name: 'Moderno',     preview: 'Aa',  desc: 'Limpo' },
  { id: 'elegant',      name: 'Refinado',    preview: 'Aa',  desc: 'Delicado' },
  { id: 'handwritten',  name: 'Manuscrito',  preview: 'Aa',  desc: 'Pessoal' },
  { id: 'bold',         name: 'Impacto',     preview: 'AA',  desc: 'Forte' },
];

const TEXT_POSITIONS: { id: TextPosition; name: string; icon: typeof Sun }[] = [
  { id: 'top',    name: 'Topo',   icon: Sun },
  { id: 'center', name: 'Centro', icon: Star },
  { id: 'bottom', name: 'Base',   icon: Moon },
];

const CARD_FRAMES: { id: CardFrame; name: string }[] = [
  { id: 'none',    name: 'Sem borda' },
  { id: 'thin',    name: 'Fina' },
  { id: 'ornate',  name: 'Ornamental' },
  { id: 'rounded', name: 'Arredondada' },
];

const AI_BG_THEMES = [
  {
    id: 'golden-hour',
    name: 'Hora Dourada',
    prompt: 'breathtaking golden hour landscape, warm amber sunlight streaming through clouds, volumetric god rays, peaceful valley with rolling hills, cinematic color grading, ultra detailed, professional photography, 8k quality',
    emoji: '🌅',
    color: '#f59e0b',
  },
  {
    id: 'cosmic-heavens',
    name: 'Ceu Celestial',
    prompt: 'majestic night sky with millions of stars, milky way galaxy, deep space nebula in purple and blue tones, ethereal cosmic clouds, awe-inspiring heavenly atmosphere, ultra high resolution, cinematic, astro photography',
    emoji: '🌌',
    color: '#B8862D',
  },
  {
    id: 'serene-ocean',
    name: 'Mar Sereno',
    prompt: 'crystal clear turquoise ocean at golden hour, gentle waves reflecting warm sunlight, peaceful horizon, soft clouds painted in pink and gold, calm and meditative atmosphere, cinematic photography, 8k',
    emoji: '🌊',
    color: '#0891b2',
  },
  {
    id: 'sacred-garden',
    name: 'Jardim Sagrado',
    prompt: 'enchanted garden with ancient olive trees, golden sunlight filtering through leaves creating beautiful dappled light, lush green foliage, wildflowers, peaceful sacred atmosphere, painted light, cinematic, masterpiece',
    emoji: '🌿',
    color: '#059669',
  },
  {
    id: 'mystical-mountains',
    name: 'Montanhas',
    prompt: 'majestic mountain range at sunrise, dramatic mist and fog in valleys, golden and pink light painting snow-capped peaks, epic landscape, cinematic wide shot, national geographic quality, 8k ultra detailed',
    emoji: '🏔️',
    color: '#6366f1',
  },
  {
    id: 'divine-light',
    name: 'Luz Divina',
    prompt: 'spectacular divine light rays breaking through dramatic storm clouds, volumetric golden beams, heavenly atmosphere, spiritual and awe-inspiring, renaissance painting lighting, masterpiece composition, 8k',
    emoji: '✨',
    color: '#eab308',
  },
  {
    id: 'desert-sacred',
    name: 'Deserto Sagrado',
    prompt: 'magnificent desert landscape at sunset, warm golden sand dunes with dramatic shadows, beautiful gradient sky from orange to deep purple, solitary and contemplative atmosphere, epic cinematic photography',
    emoji: '🏜️',
    color: '#d97706',
  },
  {
    id: 'spring-blossoms',
    name: 'Flores',
    prompt: 'beautiful field of wildflowers in full bloom, soft morning light with bokeh effect, lavender and pink flowers, dreamy pastel atmosphere, gentle breeze, magical garden, professional macro photography feel, 8k',
    emoji: '🌸',
    color: '#ec4899',
  },
  {
    id: 'ancient-temple',
    name: 'Templo Antigo',
    prompt: 'ancient stone temple interior with dramatic light streaming through windows, golden dust particles in light beams, weathered stone walls, sacred and reverent atmosphere, cinematic chiaroscuro lighting',
    emoji: '🏛️',
    color: '#a16207',
  },
  {
    id: 'cross-glory',
    name: 'Cruz Gloriosa',
    prompt: 'dramatic silhouette of a cross on a hilltop at sunset, spectacular orange and purple sky, volumetric god rays radiating behind, epic and reverent atmosphere, cinematic composition, professional photography, 8k',
    emoji: '✝️',
    color: '#dc2626',
  },
  {
    id: 'dove-peace',
    name: 'Pomba da Paz',
    prompt: 'ethereal white dove in flight against a beautiful sky, soft golden light, feathers illuminated, peaceful and spiritual atmosphere, gentle bokeh background in warm tones, masterful photography, 8k',
    emoji: '🕊️',
    color: '#94a3b8',
  },
  {
    id: 'waterfall-grace',
    name: 'Cachoeira',
    prompt: 'majestic waterfall in lush tropical paradise, misty atmosphere with rainbow, crystal clear water pool, exotic green vegetation, golden sunlight through mist, epic landscape photography, 8k ultra detailed',
    emoji: '💧',
    color: '#22d3ee',
  },
];

const QUICK_VERSES = [
  { text: 'Tudo posso naquele que me fortalece.', ref: 'Filipenses 4:13' },
  { text: 'O Senhor e meu pastor e nada me faltara.', ref: 'Salmos 23:1' },
  { text: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigenito.', ref: 'Joao 3:16' },
  { text: 'Entrega o teu caminho ao Senhor, confia nele, e o mais ele fara.', ref: 'Salmos 37:5' },
  { text: 'Sejam fortes e corajosos. Nao tenham medo. O Senhor vai com voces.', ref: 'Deuteronomio 31:6' },
  { text: 'Mas os que esperam no Senhor renovam as suas forcas.', ref: 'Isaias 40:31' },
  { text: 'Eu sou o caminho, a verdade e a vida.', ref: 'Joao 14:6' },
  { text: 'O amor e paciente, o amor e bondoso.', ref: '1 Corintios 13:4' },
  { text: 'Porque dele, e por meio dele, e para ele sao todas as coisas.', ref: 'Romanos 11:36' },
  { text: 'Nao temas, porque eu sou contigo.', ref: 'Isaias 41:10' },
  { text: 'A tua palavra e lampada para os meus pes e luz para o meu caminho.', ref: 'Salmos 119:105' },
  { text: 'Deus e o nosso refugio e fortaleza, socorro bem presente nas tribulacoes.', ref: 'Salmos 46:1' },
];

export default function VerseCardScreen() {
  const router = useRouter();
  const { colors, state } = useApp();

  // Card content
  const [verseText, setVerseText] = useState('');
  const [reference, setReference] = useState('');

  // Card settings
  const [format, setFormat] = useState<CardFormat>('1:1');
  const [bgMode, setBgMode] = useState<BackgroundMode>('gradient');
  const [selectedGradient, setSelectedGradient] = useState('royal-noir');
  const [fontStyle, setFontStyle] = useState<FontStyle>('modern');
  const [textPosition, setTextPosition] = useState<TextPosition>('center');
  const [cardFrame, setCardFrame] = useState<CardFrame>('none');
  const [gradientCategory, setGradientCategory] = useState<'premium' | 'warm' | 'nature' | 'minimal' | 'dramatic'>('premium');

  // AI background
  const [selectedAiTheme, setSelectedAiTheme] = useState(AI_BG_THEMES[0]);
  const [selectedAiStyle, setSelectedAiStyle] = useState<string>('arte-digital');
  const [customAiPrompt, setCustomAiPrompt] = useState('');
  const [aiImage, setAiImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Preview
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'background'>('content');

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const generatePulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (isGenerating) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(generatePulse, { toValue: 1.05, duration: 800, useNativeDriver: true }),
          Animated.timing(generatePulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      generatePulse.setValue(1);
    }
  }, [isGenerating]);

  const currentGradient = GRADIENT_TEMPLATES.find(t => t.id === selectedGradient) ?? GRADIENT_TEMPLATES[0];
  const filteredGradients = GRADIENT_TEMPLATES.filter(t => t.category === gradientCategory);

  // ─── AI Background Generation ──────────────────────
  const handleGenerateAiBg = useCallback(async () => {
    const prompt = customAiPrompt.trim() || selectedAiTheme.prompt;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsGenerating(true);

    const style = IMAGE_STYLES.find(s => s.id === selectedAiStyle) ?? IMAGE_STYLES[3];
    const result = await generateImage(prompt, {
      ...style,
      promptSuffix: 'background image for text overlay, no text, no watermark, no letters, no words, no writing, ultra high quality, beautiful composition, professional, masterpiece, ' + style.promptSuffix,
    });

    if (result.success && result.imageBase64) {
      setAiImage(result.imageBase64);
      setBgMode('ai');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Alert.alert('Erro', result.error || 'Nao foi possivel gerar a imagem. Tente novamente.');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setIsGenerating(false);
  }, [customAiPrompt, selectedAiTheme, selectedAiStyle]);

  const handleQuickVerse = useCallback((v: typeof QUICK_VERSES[0]) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVerseText(v.text);
    setReference(v.ref);
  }, []);

  const handlePreview = useCallback(() => {
    if (!verseText.trim()) {
      Alert.alert('Versiculo necessario', 'Digite ou selecione um versiculo primeiro.');
      return;
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowPreview(true);
  }, [verseText]);

  const handleShare = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await shareContent(`"${verseText}"\n\n— ${reference || 'Versiculo'}\n\nCriado com Devocio.IA`);
  }, [verseText, reference]);

  // ─── Font style mapping ────────────────────────────
  const getFontProps = (style: FontStyle, size: number) => {
    switch (style) {
      case 'serif':
        return { fontSize: size, fontWeight: '400' as const, fontStyle: 'italic' as const, letterSpacing: 0.5 };
      case 'modern':
        return { fontSize: size, fontWeight: '600' as const, letterSpacing: 0.3 };
      case 'elegant':
        return { fontSize: size * 0.95, fontWeight: '300' as const, letterSpacing: 1.5 };
      case 'handwritten':
        return { fontSize: size * 1.1, fontWeight: '400' as const, fontStyle: 'italic' as const, letterSpacing: 0 };
      case 'bold':
        return { fontSize: size * 1.05, fontWeight: '900' as const, letterSpacing: 1, textTransform: 'uppercase' as const };
    }
  };

  // ─── Frame styles ─────────────────────────────────
  const getFrameStyle = (frame: CardFrame, tColor: string, isFull: boolean) => {
    if (frame === 'none') return null;
    const inset = isFull ? 12 : 6;
    const base = {
      position: 'absolute' as const,
      top: inset,
      left: inset,
      right: inset,
      bottom: inset,
      zIndex: 1,
    };
    switch (frame) {
      case 'thin':
        return { ...base, borderWidth: 1, borderColor: tColor + '30' };
      case 'ornate':
        return { ...base, borderWidth: 2, borderColor: tColor + '25', borderRadius: isFull ? 8 : 4 };
      case 'rounded':
        return { ...base, borderWidth: 1.5, borderColor: tColor + '20', borderRadius: isFull ? 20 : 10 };
    }
  };

  // ─── Card Renderer ─────────────────────────────────
  const renderCard = (size: 'full' | 'thumb' = 'full') => {
    const isFull = size === 'full';
    const isStory = format === '9:16';
    const displayText = verseText || 'Seu versiculo aqui...';
    const displayRef = reference || 'Referencia';

    const containerStyle = isFull
      ? [styles.cardFull, isStory && styles.cardFullStory]
      : [styles.cardThumb, isStory && styles.cardThumbStory];

    const quoteSize = isFull ? (isStory ? 22 : 20) : 10;
    const refSize = isFull ? 13 : 7;
    const fontProps = getFontProps(fontStyle, quoteSize);

    const positionStyle = textPosition === 'top'
      ? { justifyContent: 'flex-start' as const, paddingTop: isFull ? 55 : 14 }
      : textPosition === 'bottom'
      ? { justifyContent: 'flex-end' as const, paddingBottom: isFull ? 55 : 14 }
      : { justifyContent: 'center' as const };

    const tColor = bgMode === 'ai' ? '#ffffff' : currentGradient.textColor;
    const rColor = bgMode === 'ai' ? 'rgba(255,255,255,0.75)' : currentGradient.refColor;

    const frameStyle = getFrameStyle(cardFrame, tColor, isFull);

    const textShadow = bgMode === 'ai' || currentGradient.category === 'dramatic' || currentGradient.category === 'premium'
      ? { textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 }
      : {};

    const textContent = (
      <View style={[styles.cardTextWrapper, positionStyle, isFull && styles.cardTextWrapperFull]}>
        {isFull && fontStyle !== 'bold' && (
          <Text style={[styles.openQuote, { color: tColor + '20', fontSize: isFull ? 80 : 28 }, textShadow]}>{'\u201C'}</Text>
        )}
        <Text
          style={[
            styles.verseText,
            { color: tColor, ...fontProps, ...textShadow },
            !isFull && { fontSize: 10, lineHeight: 14 },
            fontStyle === 'elegant' && { lineHeight: isFull ? 34 : 16 },
          ]}
          numberOfLines={isFull ? undefined : 3}
        >
          {fontStyle === 'bold' ? displayText.toUpperCase() : displayText}
        </Text>
        <View style={styles.refRow}>
          <View style={[styles.refLine, { backgroundColor: rColor }]} />
          <Text style={[styles.refText, { color: rColor, fontSize: refSize }, textShadow]}>
            {displayRef}
          </Text>
          <View style={[styles.refLine, { backgroundColor: rColor }]} />
        </View>
        {isFull && (
          <View style={styles.watermarkRow}>
            <View style={[styles.watermarkDot, { backgroundColor: tColor + '20' }]} />
            <Text style={[styles.watermark, { color: tColor + '30' }]}>Devocio.IA</Text>
          </View>
        )}
      </View>
    );

    if (bgMode === 'ai' && aiImage) {
      return (
        <View style={containerStyle}>
          <Image
            source={{ uri: `data:image/png;base64,${aiImage}` }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.65)']}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFillObject}
          />
          {frameStyle && <View style={frameStyle} />}
          {textContent}
        </View>
      );
    }

    return (
      <LinearGradient colors={currentGradient.colors} style={containerStyle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        {/* Decorative elements */}
        <View style={[styles.decorCircle, styles.decorCircle1, { backgroundColor: currentGradient.textColor + '05' }]} />
        <View style={[styles.decorCircle, styles.decorCircle2, { backgroundColor: currentGradient.textColor + '03' }]} />
        <View style={[styles.decorCircle, styles.decorCircle3, { backgroundColor: currentGradient.textColor + '04' }]} />
        {/* Subtle cross pattern for premium feel */}
        {isFull && (
          <>
            <View style={[styles.decorLine, styles.decorLineH, { backgroundColor: currentGradient.textColor + '03' }]} />
            <View style={[styles.decorLine, styles.decorLineV, { backgroundColor: currentGradient.textColor + '03' }]} />
          </>
        )}
        {frameStyle && <View style={frameStyle} />}
        {textContent}
      </LinearGradient>
    );
  };

  // ─── PREVIEW SCREEN ────────────────────────────────
  if (showPreview) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#000' }]} edges={['top']}>
        <View style={styles.previewHeader}>
          <TouchableOpacity onPress={() => setShowPreview(false)} style={styles.previewBackBtn}>
            <ArrowLeft size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.previewHeaderTitle}>Preview</Text>
          <TouchableOpacity onPress={() => setShowPreview(false)} style={styles.previewBackBtn}>
            <Palette size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.previewBody}>
          <View style={styles.previewCardContainer}>
            {renderCard('full')}
          </View>

          {/* Quick format toggle */}
          <View style={styles.previewFormatRow}>
            {(['1:1', '9:16'] as CardFormat[]).map(f => (
              <TouchableOpacity
                key={f}
                style={[styles.previewFormatBtn, format === f && styles.previewFormatBtnActive]}
                onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFormat(f); }}
              >
                {f === '1:1' ? <Square size={14} color={format === f ? '#fff' : '#999'} /> : <RectangleVertical size={14} color={format === f ? '#fff' : '#999'} />}
                <Text style={[styles.previewFormatText, format === f && { color: '#fff' }]}>{f === '1:1' ? 'Feed' : 'Story'}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick gradient switcher */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.previewGradientRow}>
            {GRADIENT_TEMPLATES.slice(0, 10).map(g => (
              <TouchableOpacity
                key={g.id}
                style={[styles.gradientDot, selectedGradient === g.id && styles.gradientDotActive]}
                onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedGradient(g.id); setBgMode('gradient'); }}
              >
                <LinearGradient colors={g.colors} style={styles.gradientDotInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
              </TouchableOpacity>
            ))}
            {aiImage && (
              <TouchableOpacity
                style={[styles.gradientDot, bgMode === 'ai' && styles.gradientDotActive]}
                onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setBgMode('ai'); }}
              >
                <Image source={{ uri: `data:image/png;base64,${aiImage}` }} style={styles.gradientDotInner} />
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        <View style={styles.previewActions}>
          <TouchableOpacity style={styles.previewShareBtn} onPress={() => void handleShare()}>
            <Share2 size={18} color="#FFF" />
            <Text style={styles.previewShareBtnText}>Compartilhar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.previewEditBtn} onPress={() => setShowPreview(false)}>
            <Palette size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── MAIN EDITOR SCREEN ───────────────────────────
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => { if (router.canGoBack()) { router.back(); } else { router.replace('/create' as never); } }} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Card de Versiculo</Text>
          <LinearGradient colors={['#C5943A', '#a855f7']} style={styles.proBadge} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Sparkles size={9} color="#fff" />
            <Text style={styles.proBadgeText}>PRO</Text>
          </LinearGradient>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor: colors.card }]}>
        {([
          { id: 'content' as const, label: 'Conteudo', icon: Type },
          { id: 'style' as const, label: 'Estilo', icon: Palette },
          { id: 'background' as const, label: 'Fundo', icon: ImageIcon },
        ]).map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveTab(tab.id); }}
            >
              <Icon size={15} color={isActive ? '#fff' : colors.textMuted} />
              <Text style={[styles.tabText, { color: isActive ? '#fff' : colors.textMuted }]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={{ opacity: fadeAnim }}
      >
        {/* ─── Live Preview ─── */}
        <View style={styles.miniPreviewContainer}>
          <TouchableOpacity onPress={handlePreview} activeOpacity={0.9} style={styles.miniPreviewTouch}>
            {renderCard('thumb')}
            <View style={[styles.miniPreviewOverlay, { backgroundColor: colors.background + '80' }]}>
              <Eye size={16} color={colors.text} />
              <Text style={[styles.miniPreviewHint, { color: colors.text }]}>Ampliar</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ─── TAB: Content ─── */}
        {activeTab === 'content' && (
          <View style={styles.tabContent}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Versiculos Populares</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
              {QUICK_VERSES.map((v, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.quickChip, { backgroundColor: colors.card, borderColor: verseText === v.text ? '#C5943A' : colors.borderLight }]}
                  onPress={() => handleQuickVerse(v)}
                >
                  <Text style={[styles.quickChipRef, { color: '#C5943A' }]}>{v.ref}</Text>
                  <Text style={[styles.quickChipText, { color: colors.textMuted }]} numberOfLines={1}>{v.text}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Versiculo</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput
                style={[styles.inputMulti, { color: colors.text }]}
                placeholder="Digite ou cole o versiculo aqui..."
                placeholderTextColor={colors.textMuted}
                value={verseText}
                onChangeText={setVerseText}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Referencia</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Ex: Joao 3:16"
                placeholderTextColor={colors.textMuted}
                value={reference}
                onChangeText={setReference}
              />
            </View>
          </View>
        )}

        {/* ─── TAB: Style ─── */}
        {activeTab === 'style' && (
          <View style={styles.tabContent}>
            {/* Format */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Formato</Text>
            <View style={styles.formatRow}>
              {(['1:1', '9:16'] as CardFormat[]).map(f => (
                <TouchableOpacity
                  key={f}
                  style={[styles.formatBtn, { backgroundColor: format === f ? '#C5943A' : colors.card, borderColor: format === f ? '#C5943A' : colors.borderLight }]}
                  onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFormat(f); }}
                >
                  {f === '1:1' ? <Square size={20} color={format === f ? '#fff' : colors.textMuted} /> : <RectangleVertical size={20} color={format === f ? '#fff' : colors.textMuted} />}
                  <Text style={[styles.formatBtnLabel, { color: format === f ? '#fff' : colors.text }]}>{f === '1:1' ? 'Feed (1:1)' : 'Story (9:16)'}</Text>
                  <Text style={[styles.formatBtnDesc, { color: format === f ? 'rgba(255,255,255,0.7)' : colors.textMuted }]}>{f === '1:1' ? 'Instagram, Facebook' : 'Stories, Reels'}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Font Style */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Tipografia</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fontRow}>
              {FONT_STYLES.map(f => (
                <TouchableOpacity
                  key={f.id}
                  style={[styles.fontBtn, { backgroundColor: fontStyle === f.id ? '#C5943A' : colors.card, borderColor: fontStyle === f.id ? '#C5943A' : colors.borderLight }]}
                  onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFontStyle(f.id); }}
                >
                  <Text style={[styles.fontPreview, {
                    color: fontStyle === f.id ? '#fff' : colors.text,
                    fontStyle: f.id === 'serif' || f.id === 'handwritten' ? 'italic' : 'normal',
                    fontWeight: f.id === 'bold' ? '900' : f.id === 'modern' ? '600' : f.id === 'elegant' ? '300' : '400',
                    letterSpacing: f.id === 'elegant' ? 2 : 0,
                  }]}>{f.preview}</Text>
                  <Text style={[styles.fontName, { color: fontStyle === f.id ? 'rgba(255,255,255,0.9)' : colors.text }]}>{f.name}</Text>
                  <Text style={[styles.fontDesc, { color: fontStyle === f.id ? 'rgba(255,255,255,0.6)' : colors.textMuted }]}>{f.desc}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Text Position */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Posicao do Texto</Text>
            <View style={styles.positionRow}>
              {TEXT_POSITIONS.map(p => {
                const Icon = p.icon;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.positionBtn, { backgroundColor: textPosition === p.id ? '#C5943A' : colors.card, borderColor: textPosition === p.id ? '#C5943A' : colors.borderLight }]}
                    onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTextPosition(p.id); }}
                  >
                    <Icon size={14} color={textPosition === p.id ? '#fff' : colors.textMuted} />
                    <Text style={[styles.positionBtnText, { color: textPosition === p.id ? '#fff' : colors.text }]}>{p.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Card Frame */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Moldura</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.frameRow}>
              {CARD_FRAMES.map(f => (
                <TouchableOpacity
                  key={f.id}
                  style={[styles.frameBtn, { backgroundColor: cardFrame === f.id ? '#C5943A' : colors.card, borderColor: cardFrame === f.id ? '#C5943A' : colors.borderLight }]}
                  onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setCardFrame(f.id); }}
                >
                  <Text style={[styles.frameBtnText, { color: cardFrame === f.id ? '#fff' : colors.text }]}>{f.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ─── TAB: Background ─── */}
        {activeTab === 'background' && (
          <View style={styles.tabContent}>
            {/* Mode Toggle */}
            <View style={[styles.bgModeToggle, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              <TouchableOpacity
                style={[styles.bgModeBtn, bgMode === 'gradient' && styles.bgModeBtnActive]}
                onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setBgMode('gradient'); }}
              >
                <Palette size={16} color={bgMode === 'gradient' ? '#fff' : colors.textMuted} />
                <Text style={[styles.bgModeBtnText, { color: bgMode === 'gradient' ? '#fff' : colors.textMuted }]}>Gradientes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.bgModeBtn, bgMode === 'ai' && styles.bgModeBtnActive]}
                onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setBgMode('ai'); }}
              >
                <Sparkles size={16} color={bgMode === 'ai' ? '#fff' : colors.textMuted} />
                <Text style={[styles.bgModeBtnText, { color: bgMode === 'ai' ? '#fff' : colors.textMuted }]}>IA Stability</Text>
              </TouchableOpacity>
            </View>

            {bgMode === 'gradient' && (
              <>
                {/* Category filter */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
                  {([
                    { id: 'premium' as const, label: 'Premium', emoji: '👑' },
                    { id: 'warm' as const, label: 'Quentes', emoji: '🔥' },
                    { id: 'nature' as const, label: 'Natureza', emoji: '🌿' },
                    { id: 'minimal' as const, label: 'Minimal', emoji: '☁️' },
                    { id: 'dramatic' as const, label: 'Dramatico', emoji: '⚡' },
                  ]).map(cat => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.categoryChip, gradientCategory === cat.id && styles.categoryChipActive, { borderColor: colors.borderLight }]}
                      onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setGradientCategory(cat.id); }}
                    >
                      <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                      <Text style={[styles.categoryChipText, gradientCategory === cat.id && styles.categoryChipTextActive, { color: colors.textMuted }]}>{cat.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Gradient Grid */}
                <View style={styles.gradientGrid}>
                  {filteredGradients.map(g => (
                    <TouchableOpacity
                      key={g.id}
                      style={[styles.gradientCard, selectedGradient === g.id && styles.gradientCardActive]}
                      onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedGradient(g.id); }}
                    >
                      <LinearGradient colors={g.colors} style={styles.gradientPreview} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                        {selectedGradient === g.id && (
                          <View style={styles.gradientCheck}>
                            <Check size={14} color="#fff" />
                          </View>
                        )}
                        <Text style={styles.gradientEmoji}>{g.emoji}</Text>
                      </LinearGradient>
                      <Text style={[styles.gradientName, { color: colors.text }]}>{g.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {bgMode === 'ai' && (
              <>
                {/* AI Theme Grid */}
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Temas Profissionais</Text>
                <View style={styles.aiThemeGrid}>
                  {AI_BG_THEMES.map(theme => (
                    <TouchableOpacity
                      key={theme.id}
                      style={[
                        styles.aiThemeCard,
                        { backgroundColor: colors.card, borderColor: selectedAiTheme.id === theme.id ? theme.color : colors.borderLight },
                        selectedAiTheme.id === theme.id && { borderWidth: 2 },
                      ]}
                      onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedAiTheme(theme); setCustomAiPrompt(''); }}
                    >
                      <View style={[styles.aiThemeIconWrap, { backgroundColor: theme.color + '18' }]}>
                        <Text style={styles.aiThemeEmoji}>{theme.emoji}</Text>
                      </View>
                      <Text style={[styles.aiThemeName, { color: selectedAiTheme.id === theme.id ? theme.color : colors.text }]}>{theme.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* AI Style Selector */}
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Estilo Artistico</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.aiStyleRow}>
                  {IMAGE_STYLES.map(style => (
                    <TouchableOpacity
                      key={style.id}
                      style={[styles.aiStyleChip, { backgroundColor: selectedAiStyle === style.id ? '#C5943A' : colors.card, borderColor: selectedAiStyle === style.id ? '#C5943A' : colors.borderLight }]}
                      onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedAiStyle(style.id); }}
                    >
                      <Text style={styles.aiStyleEmoji}>{style.emoji}</Text>
                      <Text style={[styles.aiStyleName, { color: selectedAiStyle === style.id ? '#fff' : colors.text }]}>{style.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Custom prompt */}
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Ou descreva seu fundo</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Ex: campo de trigo ao por do sol..."
                    placeholderTextColor={colors.textMuted}
                    value={customAiPrompt}
                    onChangeText={setCustomAiPrompt}
                  />
                </View>

                {/* Generate Button */}
                <Animated.View style={{ transform: [{ scale: generatePulse }] }}>
                  <TouchableOpacity
                    style={[styles.generateAiBtn, isGenerating && styles.generateAiBtnGenerating]}
                    onPress={() => void handleGenerateAiBg()}
                    disabled={isGenerating}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={isGenerating ? ['#8B6914', '#B8862D'] : ['#B8862D', '#C5943A', '#a855f7']}
                      style={styles.generateAiBtnGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      {isGenerating ? (
                        <>
                          <ActivityIndicator size="small" color="#FFF" />
                          <Text style={styles.generateAiBtnText}>Gerando com Stability AI...</Text>
                        </>
                      ) : (
                        <>
                          <Zap size={18} color="#FFF" />
                          <Text style={styles.generateAiBtnText}>{aiImage ? 'Gerar Novo Fundo' : 'Gerar Fundo com IA'}</Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>

                {/* AI Result preview */}
                {aiImage && !isGenerating && (
                  <View style={[styles.aiResultCard, { borderColor: '#10b981' + '40' }]}>
                    <Image
                      source={{ uri: `data:image/png;base64,${aiImage}` }}
                      style={styles.aiResultImage}
                      resizeMode="cover"
                    />
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={styles.aiResultGradient}>
                      <View style={styles.aiResultBadge}>
                        <Check size={12} color="#fff" />
                        <Text style={styles.aiResultBadgeText}>Stability AI</Text>
                      </View>
                    </LinearGradient>
                    <TouchableOpacity style={styles.aiResultRegenBtn} onPress={() => void handleGenerateAiBg()}>
                      <RotateCcw size={14} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}

                {isGenerating && (
                  <View style={[styles.generatingCard, { backgroundColor: colors.card, borderColor: '#C5943A' + '30' }]}>
                    <View style={styles.generatingIconWrap}>
                      <Sparkles size={28} color="#C5943A" />
                    </View>
                    <Text style={[styles.generatingTitle, { color: colors.text }]}>Criando sua obra de arte...</Text>
                    <Text style={[styles.generatingSubtitle, { color: colors.textMuted }]}>
                      A Stability AI esta gerando uma imagem profissional e unica para seu card.
                    </Text>
                    <View style={[styles.generatingProgressBg, { backgroundColor: colors.border }]}>
                      <Animated.View style={[styles.generatingProgressBar, { backgroundColor: '#C5943A' }]} />
                    </View>
                  </View>
                )}
              </>
            )}
          </View>
        )}
      </Animated.ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomBar, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.previewCta, !verseText.trim() && { opacity: 0.4 }]}
          onPress={handlePreview}
          disabled={!verseText.trim()}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#B8862D', '#C5943A']}
            style={styles.previewCtaGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Eye size={18} color="#FFF" />
            <Text style={styles.previewCtaText}>Visualizar Card</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  proBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  proBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },

  // Tab Bar
  tabBar: { flexDirection: 'row', marginHorizontal: 16, marginTop: 12, borderRadius: 12, padding: 4 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 8 },
  tabActive: { backgroundColor: '#C5943A' },
  tabText: { fontSize: 12, fontWeight: '700' },

  scrollContent: { padding: 16, paddingBottom: 110 },

  // Mini Preview
  miniPreviewContainer: { alignItems: 'center', marginBottom: 20, marginTop: 8 },
  miniPreviewTouch: { position: 'relative' },
  miniPreviewOverlay: { position: 'absolute', bottom: 8, right: 8, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  miniPreviewHint: { fontSize: 11, fontWeight: '600' },

  // Card Full
  cardFull: { width: 320, height: 320, borderRadius: 20, overflow: 'hidden', position: 'relative' },
  cardFullStory: { width: 260, height: 462, borderRadius: 20 },
  cardThumb: { width: 220, height: 220, borderRadius: 16, overflow: 'hidden', position: 'relative' },
  cardThumbStory: { width: 170, height: 302, borderRadius: 14 },

  cardTextWrapper: { flex: 1, padding: 18, alignItems: 'center', zIndex: 2 },
  cardTextWrapperFull: { padding: 32 },
  openQuote: { fontWeight: '200', lineHeight: 80, marginBottom: -28, alignSelf: 'flex-start', opacity: 0.6 },
  verseText: { textAlign: 'center', lineHeight: 30, marginBottom: 16 },
  refRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  refLine: { width: 24, height: 1, opacity: 0.5 },
  refText: { fontWeight: '700', textAlign: 'center', letterSpacing: 0.5 },
  watermarkRow: { position: 'absolute', bottom: 12, right: 16, flexDirection: 'row', alignItems: 'center', gap: 4 },
  watermarkDot: { width: 4, height: 4, borderRadius: 2 },
  watermark: { fontSize: 9, fontWeight: '600', letterSpacing: 0.5 },

  // Decorative elements
  decorCircle: { position: 'absolute', borderRadius: 999 },
  decorCircle1: { width: 250, height: 250, top: -80, right: -80 },
  decorCircle2: { width: 180, height: 180, bottom: -60, left: -60 },
  decorCircle3: { width: 120, height: 120, top: '40%' as any, left: '50%' as any },
  decorLine: { position: 'absolute' },
  decorLineH: { width: '100%', height: 1, top: '50%' as any },
  decorLineV: { height: '100%', width: 1, left: '50%' as any },

  // Tab Content
  tabContent: { gap: 4 },
  sectionLabel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 14 },

  // Quick Verses
  quickRow: { gap: 8, paddingRight: 20, marginBottom: 8 },
  quickChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, maxWidth: 200 },
  quickChipRef: { fontSize: 12, fontWeight: '700', marginBottom: 2 },
  quickChipText: { fontSize: 11 },

  // Input
  inputWrapper: { borderWidth: 1, borderRadius: 14, overflow: 'hidden', marginBottom: 8 },
  input: { padding: 14, fontSize: 15 },
  inputMulti: { padding: 14, fontSize: 15, minHeight: 90, lineHeight: 22 },

  // Format
  formatRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  formatBtn: { flex: 1, padding: 16, borderRadius: 14, borderWidth: 1, alignItems: 'center', gap: 8 },
  formatBtnLabel: { fontSize: 14, fontWeight: '700' },
  formatBtnDesc: { fontSize: 11 },

  // Font
  fontRow: { gap: 8, marginBottom: 8 },
  fontBtn: { width: 90, padding: 14, borderRadius: 14, borderWidth: 1, alignItems: 'center', gap: 3 },
  fontPreview: { fontSize: 22 },
  fontName: { fontSize: 11, fontWeight: '700' },
  fontDesc: { fontSize: 9 },

  // Text Position
  positionRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  positionBtn: { flex: 1, flexDirection: 'row', paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  positionBtnText: { fontSize: 13, fontWeight: '600' },

  // Frame
  frameRow: { gap: 8, marginBottom: 8 },
  frameBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  frameBtnText: { fontSize: 12, fontWeight: '600' },

  // Background mode toggle
  bgModeToggle: { flexDirection: 'row', borderRadius: 14, borderWidth: 1, padding: 4, marginBottom: 14 },
  bgModeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  bgModeBtnActive: { backgroundColor: '#C5943A' },
  bgModeBtnText: { fontSize: 13, fontWeight: '700' },

  // Gradient category
  categoryRow: { gap: 8, marginBottom: 14 },
  categoryChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  categoryChipActive: { backgroundColor: '#C5943A', borderColor: '#C5943A' },
  categoryChipText: { fontSize: 13, fontWeight: '600' },
  categoryChipTextActive: { color: '#fff' },
  categoryEmoji: { fontSize: 13 },

  // Gradient grid
  gradientGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  gradientCard: { width: '22%' as any, borderRadius: 12, overflow: 'hidden' },
  gradientCardActive: { borderWidth: 2, borderColor: '#C5943A' },
  gradientPreview: { height: 72, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  gradientCheck: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(139,92,246,0.9)', justifyContent: 'center', alignItems: 'center', position: 'absolute' },
  gradientEmoji: { fontSize: 18, opacity: 0.6 },
  gradientName: { fontSize: 9, fontWeight: '700', textAlign: 'center', paddingVertical: 4, letterSpacing: 0.3 },

  // AI themes
  aiThemeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  aiThemeCard: { width: '31%' as any, padding: 12, borderRadius: 14, borderWidth: 1, alignItems: 'center', gap: 6 },
  aiThemeIconWrap: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  aiThemeEmoji: { fontSize: 20 },
  aiThemeName: { fontSize: 10, fontWeight: '700', textAlign: 'center' },

  // AI Style selector
  aiStyleRow: { gap: 8, marginBottom: 14 },
  aiStyleChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  aiStyleEmoji: { fontSize: 14 },
  aiStyleName: { fontSize: 12, fontWeight: '600' },

  // Generate AI button
  generateAiBtn: { borderRadius: 16, overflow: 'hidden', marginBottom: 14 },
  generateAiBtnGenerating: { opacity: 0.85 },
  generateAiBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18 },
  generateAiBtnText: { fontSize: 16, fontWeight: '800', color: '#FFF', letterSpacing: 0.3 },

  // AI result
  aiResultCard: { borderRadius: 16, borderWidth: 1.5, overflow: 'hidden', marginBottom: 14, position: 'relative' },
  aiResultImage: { width: '100%', height: 140 },
  aiResultGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 50, justifyContent: 'flex-end', alignItems: 'flex-start', paddingHorizontal: 12, paddingBottom: 10 },
  aiResultBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(16,185,129,0.8)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  aiResultBadgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  aiResultRegenBtn: { position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },

  // Generating
  generatingCard: { padding: 28, borderRadius: 16, borderWidth: 1, alignItems: 'center', gap: 10, marginBottom: 14 },
  generatingIconWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#C5943A' + '15', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  generatingTitle: { fontSize: 16, fontWeight: '800' },
  generatingSubtitle: { fontSize: 13, textAlign: 'center', lineHeight: 19 },
  generatingProgressBg: { width: '80%', height: 4, borderRadius: 2, marginTop: 8, overflow: 'hidden' },
  generatingProgressBar: { width: '60%', height: '100%', borderRadius: 2 },

  // Bottom Bar
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 24 },
  previewCta: { borderRadius: 16, overflow: 'hidden' },
  previewCtaGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 18 },
  previewCtaText: { fontSize: 16, fontWeight: '800', color: '#FFF', letterSpacing: 0.3 },

  // Preview Screen
  previewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  previewBackBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  previewHeaderTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  previewBody: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  previewCardContainer: { marginBottom: 24 },
  previewFormatRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  previewFormatBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)' },
  previewFormatBtnActive: { backgroundColor: '#C5943A' },
  previewFormatText: { fontSize: 12, fontWeight: '600', color: '#999' },
  previewGradientRow: { gap: 8, paddingHorizontal: 16, marginBottom: 16 },
  gradientDot: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: 'transparent', overflow: 'hidden' },
  gradientDotActive: { borderColor: '#C5943A' },
  gradientDotInner: { width: '100%', height: '100%', borderRadius: 17 },
  previewActions: { flexDirection: 'row', padding: 16, paddingBottom: 28, gap: 10 },
  previewShareBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#C5943A', paddingVertical: 16, borderRadius: 14 },
  previewShareBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  previewEditBtn: { width: 52, height: 52, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
});
