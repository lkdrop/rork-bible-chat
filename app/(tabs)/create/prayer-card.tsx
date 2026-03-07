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
  Check,
  RectangleVertical,
  Square,
  Eye,
  RotateCcw,
  Zap,
  Star,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Heart,
  Pause,
  Play,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { generateImage, IMAGE_STYLES, type ImageStyle } from '@/services/imageGeneration';
import { speak, stopSpeaking, isElevenLabsConfigured } from '@/services/textToSpeech';
import { shareContent } from '@/utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Types ───────────────────────────────────────────
type CardFormat = '1:1' | '9:16';
type BackgroundMode = 'gradient' | 'ai';
type FontStyle = 'serif' | 'modern' | 'elegant' | 'handwritten' | 'bold';
type TextPosition = 'center' | 'bottom' | 'top';
type PrayerCategory = 'familia' | 'saude' | 'trabalho' | 'financas' | 'espiritual' | 'gratidao' | 'protecao';

interface GradientTemplate {
  id: string;
  name: string;
  colors: [string, string, string];
  textColor: string;
  refColor: string;
  category: 'celestial' | 'paz' | 'fe' | 'graca' | 'esperanca';
  emoji: string;
}

// ─── Prayer Categories ──────────────────────────────
const PRAYER_CATEGORIES: { id: PrayerCategory; label: string; emoji: string; color: string }[] = [
  { id: 'familia',    label: 'Familia',    emoji: '👨‍👩‍👧‍👦', color: '#ec4899' },
  { id: 'saude',      label: 'Saude',      emoji: '💚',     color: '#10b981' },
  { id: 'trabalho',   label: 'Trabalho',   emoji: '💼',     color: '#3b82f6' },
  { id: 'financas',   label: 'Financas',   emoji: '💰',     color: '#f59e0b' },
  { id: 'espiritual', label: 'Espiritual', emoji: '✝️',     color: '#C5943A' },
  { id: 'gratidao',   label: 'Gratidao',   emoji: '🙏',     color: '#f97316' },
  { id: 'protecao',   label: 'Protecao',   emoji: '🛡️',     color: '#06b6d4' },
];

// ─── Prayer Gradient Templates ──────────────────────
const GRADIENT_TEMPLATES: GradientTemplate[] = [
  // Celestial
  { id: 'heaven-blue',     name: 'Ceu Celestial',   colors: ['#0c1445', '#1e3a6e', '#2563eb'], textColor: '#e0f2fe', refColor: '#93c5fd', category: 'celestial', emoji: '🌌' },
  { id: 'angel-wings',     name: 'Asas de Anjo',    colors: ['#1e1b4b', '#312e81', '#4f46e5'], textColor: '#e0e7ff', refColor: '#a5b4fc', category: 'celestial', emoji: '👼' },
  { id: 'starlight',       name: 'Luz Estelar',     colors: ['#020617', '#0f172a', '#1e3a5f'], textColor: '#f1f5f9', refColor: '#94a3b8', category: 'celestial', emoji: '⭐' },
  { id: 'divine-purple',   name: 'Divino',          colors: ['#2e1065', '#6B4E0F', '#8B6914'], textColor: '#f5f3ff', refColor: '#E8C876', category: 'celestial', emoji: '💜' },

  // Paz Interior
  { id: 'inner-peace',     name: 'Paz Interior',    colors: ['#022c22', '#064e3b', '#059669'], textColor: '#ecfdf5', refColor: '#6ee7b7', category: 'paz', emoji: '🕊️' },
  { id: 'calm-waters',     name: 'Aguas Tranquilas',colors: ['#042f2e', '#0f766e', '#14b8a6'], textColor: '#f0fdfa', refColor: '#5eead4', category: 'paz', emoji: '🌊' },
  { id: 'garden-prayer',   name: 'Jardim de Oracao',colors: ['#14261a', '#1b3a23', '#2d6a4f'], textColor: '#f0fdf4', refColor: '#86efac', category: 'paz', emoji: '🌿' },
  { id: 'olive-branch',    name: 'Ramo de Oliveira',colors: ['#1a2e05', '#365314', '#4d7c0f'], textColor: '#f7fee7', refColor: '#bef264', category: 'paz', emoji: '🫒' },

  // Fe Inabalavel
  { id: 'deep-faith',      name: 'Fe Profunda',     colors: ['#1a0533', '#3b0764', '#6b21a8'], textColor: '#f5f3ff', refColor: '#d8b4fe', category: 'fe', emoji: '✝️' },
  { id: 'royal-prayer',    name: 'Oracao Real',     colors: ['#0a0a0a', '#1a1025', '#2d1654'], textColor: '#f0e7ff', refColor: '#E8C876', category: 'fe', emoji: '👑' },
  { id: 'midnight-prayer', name: 'Vigilia',         colors: ['#000000', '#0a0a1a', '#1a1a3e'], textColor: '#e2e8f0', refColor: '#94a3b8', category: 'fe', emoji: '🌙' },
  { id: 'calvary',         name: 'Calvario',        colors: ['#1c0808', '#3b0f0f', '#7f1d1d'], textColor: '#fef2f2', refColor: '#fca5a5', category: 'fe', emoji: '⛪' },

  // Graca Divina
  { id: 'golden-grace',    name: 'Graca Dourada',   colors: ['#451a03', '#78350f', '#b45309'], textColor: '#fef3c7', refColor: '#fcd34d', category: 'graca', emoji: '✨' },
  { id: 'holy-fire',       name: 'Fogo Santo',      colors: ['#7c2d12', '#9a3412', '#c2410c'], textColor: '#fff7ed', refColor: '#fdba74', category: 'graca', emoji: '🔥' },
  { id: 'temple-gold',     name: 'Templo',          colors: ['#78350f', '#92400e', '#a16207'], textColor: '#fffbeb', refColor: '#fde047', category: 'graca', emoji: '🕍' },
  { id: 'sacred-amber',    name: 'Ambar Sagrado',   colors: ['#451a03', '#78350f', '#a16207'], textColor: '#fefce8', refColor: '#fde047', category: 'graca', emoji: '🏺' },

  // Esperanca
  { id: 'dawn-hope',       name: 'Aurora',          colors: ['#4a1942', '#831843', '#be185d'], textColor: '#fdf2f8', refColor: '#f9a8d4', category: 'esperanca', emoji: '🌅' },
  { id: 'sunrise-faith',   name: 'Nascer do Sol',   colors: ['#7c2d12', '#c2410c', '#ea580c'], textColor: '#fff7ed', refColor: '#fed7aa', category: 'esperanca', emoji: '☀️' },
  { id: 'rose-prayer',     name: 'Rosa',            colors: ['#fff1f2', '#ffe4e6', '#fecdd3'], textColor: '#4c0519', refColor: '#e11d48', category: 'esperanca', emoji: '🌹' },
  { id: 'soft-cloud',      name: 'Nuvem',           colors: ['#f8fafc', '#f1f5f9', '#e2e8f0'], textColor: '#1e293b', refColor: '#64748b', category: 'esperanca', emoji: '☁️' },
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

// ─── AI Background Themes for Prayer ────────────────
const AI_BG_THEMES = [
  {
    id: 'praying-hands',
    name: 'Maos em Oracao',
    prompt: 'beautiful pair of hands clasped together in prayer, soft warm divine light illuminating from above, peaceful spiritual atmosphere, close-up, soft focus background, cinematic lighting, 8k quality, masterpiece',
    emoji: '🙏',
    color: '#a855f7',
  },
  {
    id: 'divine-light',
    name: 'Luz Divina',
    prompt: 'spectacular divine golden light rays breaking through majestic clouds from heaven, volumetric god rays, ethereal spiritual atmosphere, awe-inspiring heavenly scene, renaissance painting quality, 8k',
    emoji: '✨',
    color: '#eab308',
  },
  {
    id: 'angel-guardian',
    name: 'Anjo Protetor',
    prompt: 'ethereal guardian angel with luminous white wings, soft golden glow, heavenly clouds, peaceful protective presence, spiritual atmosphere, beautiful digital art, dramatic lighting, 8k masterpiece',
    emoji: '👼',
    color: '#f0abfc',
  },
  {
    id: 'church-stained',
    name: 'Vitrais',
    prompt: 'beautiful stained glass window in ancient cathedral, colorful light streaming through intricate biblical patterns, sacred atmosphere, warm golden and blue tones, architectural photography, 8k',
    emoji: '⛪',
    color: '#3b82f6',
  },
  {
    id: 'prayer-garden',
    name: 'Jardim de Oracao',
    prompt: 'serene prayer garden with ancient olive trees, soft morning sunlight filtering through leaves, wildflowers, stone path leading to peaceful clearing, sacred contemplative atmosphere, cinematic, 8k',
    emoji: '🌿',
    color: '#10b981',
  },
  {
    id: 'candle-vigil',
    name: 'Vela Sagrada',
    prompt: 'beautiful single candle flame glowing warmly in darkness, soft warm bokeh lights around, peaceful vigil atmosphere, intimate spiritual moment, macro photography, cinematic, 8k quality',
    emoji: '🕯️',
    color: '#f59e0b',
  },
  {
    id: 'cross-light',
    name: 'Cruz Iluminada',
    prompt: 'silhouette of a cross on hilltop with spectacular golden sunrise behind, dramatic god rays radiating outward, inspiring and reverent atmosphere, epic cinematic composition, professional photography, 8k',
    emoji: '✝️',
    color: '#dc2626',
  },
  {
    id: 'white-dove',
    name: 'Pomba Branca',
    prompt: 'majestic white dove in flight against beautiful blue sky with golden light, wings spread wide, peaceful Holy Spirit symbol, soft ethereal glow, professional photography, 8k masterpiece',
    emoji: '🕊️',
    color: '#e2e8f0',
  },
  {
    id: 'family-prayer',
    name: 'Familia Orando',
    prompt: 'warm silhouette of family holding hands in prayer circle at golden sunset, beautiful backlit scene, love and unity, peaceful spiritual moment, cinematic photography, warm tones, 8k',
    emoji: '👨‍👩‍👧‍👦',
    color: '#ec4899',
  },
  {
    id: 'sunrise-hope',
    name: 'Esperanca',
    prompt: 'breathtaking sunrise over calm lake with mountain reflections, golden and pink sky, new beginning, hope and renewal, peaceful morning scene, landscape photography masterpiece, 8k',
    emoji: '🌅',
    color: '#f97316',
  },
  {
    id: 'water-baptism',
    name: 'Aguas Batismais',
    prompt: 'crystal clear river water with beautiful golden sunlight dancing on surface, peaceful natural baptism scene, sacred water reflections, cinematic nature photography, 8k quality',
    emoji: '💧',
    color: '#06b6d4',
  },
  {
    id: 'cartoon-prayer',
    name: 'Cartoon Oracao',
    prompt: 'cute cartoon illustration of child kneeling in prayer with small angel beside, warm soft colors, children book illustration style, heartwarming, gentle lighting, beautiful digital art',
    emoji: '🎨',
    color: '#d946ef',
  },
];

// ─── Quick Prayers ──────────────────────────────────
const QUICK_PRAYERS = [
  {
    text: 'Senhor, guarda minha familia sob Tuas asas. Protege cada membro, fortalece nossos lacos e que Teu amor nos una sempre.',
    title: 'Pela Familia',
    category: 'familia' as PrayerCategory,
  },
  {
    text: 'Pai, coloca Tuas maos de cura sobre mim. Restaura minha saude, renova minhas forcas e que cada celula do meu corpo glorifique Teu nome.',
    title: 'Pela Saude',
    category: 'saude' as PrayerCategory,
  },
  {
    text: 'Deus, obrigado por tudo que tens feito. Meu coracao transborda de gratidao pela Tua fidelidade e amor incondicional.',
    title: 'Gratidao',
    category: 'gratidao' as PrayerCategory,
  },
  {
    text: 'Senhor, abre portas no meu trabalho. Abencoa a obra das minhas maos e que eu seja instrumento Teu em tudo que eu fizer.',
    title: 'Pelo Trabalho',
    category: 'trabalho' as PrayerCategory,
  },
  {
    text: 'Pai Nosso que estas nos ceus, santificado seja o Teu nome. Venha o Teu reino, seja feita a Tua vontade, assim na terra como no ceu.',
    title: 'Pai Nosso',
    category: 'espiritual' as PrayerCategory,
  },
  {
    text: 'Deus, concede-me serenidade para aceitar as coisas que nao posso mudar, coragem para mudar as que posso e sabedoria para distinguir uma da outra.',
    title: 'Serenidade',
    category: 'espiritual' as PrayerCategory,
  },
  {
    text: 'Aquele que habita no esconderijo do Altissimo, a sombra do Onipotente descansara. Direi do Senhor: Ele e o meu Deus, o meu refugio, a minha fortaleza, e nele confiarei.',
    title: 'Salmo 91',
    category: 'protecao' as PrayerCategory,
  },
  {
    text: 'Senhor, supre todas as minhas necessidades segundo as Tuas riquezas na gloria em Cristo Jesus. Abencoa minhas financas e me faz ser generoso.',
    title: 'Provisao',
    category: 'financas' as PrayerCategory,
  },
];

export default function PrayerCardScreen() {
  const router = useRouter();
  const { colors, state, addPrayerRequest, canCreate, recordCreate } = useApp();

  // Card content
  const [prayerText, setPrayerText] = useState('');
  const [prayerTitle, setPrayerTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PrayerCategory>('espiritual');

  // Card settings
  const [format, setFormat] = useState<CardFormat>('1:1');
  const [bgMode, setBgMode] = useState<BackgroundMode>('gradient');
  const [selectedGradient, setSelectedGradient] = useState('heaven-blue');
  const [fontStyle, setFontStyle] = useState<FontStyle>('elegant');
  const [textPosition, setTextPosition] = useState<TextPosition>('center');
  const [gradientCategory, setGradientCategory] = useState<'celestial' | 'paz' | 'fe' | 'graca' | 'esperanca'>('celestial');

  // AI background
  const [selectedAiTheme, setSelectedAiTheme] = useState(AI_BG_THEMES[0]);
  const [selectedAiStyle, setSelectedAiStyle] = useState<string>('aquarela-espiritual');
  const [customAiPrompt, setCustomAiPrompt] = useState('');
  const [aiImage, setAiImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Audio
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speakPulse = useRef(new Animated.Value(1)).current;

  // Preview
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'background'>('content');

  // Animations
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

  useEffect(() => {
    if (isSpeaking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(speakPulse, { toValue: 1.15, duration: 600, useNativeDriver: true }),
          Animated.timing(speakPulse, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      speakPulse.setValue(1);
    }
  }, [isSpeaking]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => { void stopSpeaking(); };
  }, []);

  const currentGradient = GRADIENT_TEMPLATES.find(t => t.id === selectedGradient) ?? GRADIENT_TEMPLATES[0];
  const filteredGradients = GRADIENT_TEMPLATES.filter(t => t.category === gradientCategory);
  const currentCategoryData = PRAYER_CATEGORIES.find(c => c.id === selectedCategory);
  const usingElevenLabs = isElevenLabsConfigured();

  // ─── Audio (ElevenLabs ou fallback) ────────────────
  const handleSpeak = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isSpeaking) {
      await stopSpeaking();
      setIsSpeaking(false);
    } else {
      if (!prayerText.trim()) return;
      setIsSpeaking(true);
      const intro = prayerTitle ? `${prayerTitle}. ` : '';
      await speak(intro + prayerText, {
        voice: 'ana',
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  }, [prayerText, prayerTitle, isSpeaking]);

  // ─── AI Background Generation ──────────────────────
  const handleGenerateAiBg = useCallback(async () => {
    const prompt = customAiPrompt.trim() || selectedAiTheme.prompt;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsGenerating(true);

    const style = IMAGE_STYLES.find(s => s.id === selectedAiStyle) ?? IMAGE_STYLES[2];
    const result = await generateImage(prompt, {
      ...style,
      promptSuffix: 'background image for prayer text overlay, no text, no watermark, no letters, no words, no writing, ultra high quality, beautiful composition, spiritual, peaceful, ' + style.promptSuffix,
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

  const handleQuickPrayer = useCallback((p: typeof QUICK_PRAYERS[0]) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPrayerText(p.text);
    setPrayerTitle(p.title);
    setSelectedCategory(p.category);
  }, []);

  const handlePreview = useCallback(() => {
    if (!prayerText.trim()) {
      Alert.alert('Oracao necessaria', 'Digite ou selecione uma oracao primeiro.');
      return;
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowPreview(true);
  }, [prayerText]);

  const handleShare = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const catEmoji = currentCategoryData?.emoji || '🙏';
    await shareContent(`${catEmoji} ${prayerTitle || 'Oracao'}\n\n"${prayerText}"\n\nCriado com Devocio`);
  }, [prayerText, prayerTitle, currentCategoryData]);

  const handleSavePrayer = useCallback(() => {
    if (!prayerText.trim()) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addPrayerRequest(prayerText, selectedCategory);
    Alert.alert('Salvo!', 'Oracao adicionada ao seu Mural de Oracoes.');
  }, [prayerText, selectedCategory, addPrayerRequest]);

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

  // ─── Card Renderer ─────────────────────────────────
  const renderCard = (size: 'full' | 'thumb' = 'full') => {
    const isFull = size === 'full';
    const isStory = format === '9:16';
    const displayText = prayerText || 'Sua oracao aqui...';
    const displayTitle = prayerTitle || 'Oracao';
    const catEmoji = currentCategoryData?.emoji || '🙏';

    const containerStyle = isFull
      ? [styles.cardFull, isStory && styles.cardFullStory]
      : [styles.cardThumb, isStory && styles.cardThumbStory];

    const quoteSize = isFull ? (isStory ? 18 : 17) : 9;
    const titleSize = isFull ? 12 : 7;
    const fontProps = getFontProps(fontStyle, quoteSize);

    const positionStyle = textPosition === 'top'
      ? { justifyContent: 'flex-start' as const, paddingTop: isFull ? 50 : 12 }
      : textPosition === 'bottom'
      ? { justifyContent: 'flex-end' as const, paddingBottom: isFull ? 50 : 12 }
      : { justifyContent: 'center' as const };

    const tColor = bgMode === 'ai' ? '#ffffff' : currentGradient.textColor;
    const rColor = bgMode === 'ai' ? 'rgba(255,255,255,0.75)' : currentGradient.refColor;

    const textShadow = bgMode === 'ai' || currentGradient.category === 'fe' || currentGradient.category === 'celestial'
      ? { textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 }
      : {};

    const textContent = (
      <View style={[styles.cardTextWrapper, positionStyle, isFull && styles.cardTextWrapperFull]}>
        {/* Category badge */}
        {isFull && (
          <View style={[styles.categoryBadge, { backgroundColor: tColor + '12' }]}>
            <Text style={styles.categoryBadgeEmoji}>{catEmoji}</Text>
            <Text style={[styles.categoryBadgeText, { color: rColor }, textShadow]}>{displayTitle}</Text>
          </View>
        )}

        {/* Prayer icon */}
        {isFull && fontStyle !== 'bold' && (
          <Text style={[styles.prayerIcon, { color: tColor + '18' }, textShadow]}>{catEmoji}</Text>
        )}

        <Text
          style={[
            styles.prayerText,
            { color: tColor, ...fontProps, ...textShadow },
            !isFull && { fontSize: 9, lineHeight: 13 },
            fontStyle === 'elegant' && { lineHeight: isFull ? 30 : 14 },
          ]}
          numberOfLines={isFull ? undefined : 4}
        >
          {fontStyle === 'bold' ? displayText.toUpperCase() : displayText}
        </Text>

        <View style={styles.refRow}>
          <View style={[styles.refLine, { backgroundColor: rColor }]} />
          <Text style={[styles.refText, { color: rColor, fontSize: titleSize }, textShadow]}>Amem</Text>
          <View style={[styles.refLine, { backgroundColor: rColor }]} />
        </View>

        {isFull && (
          <View style={styles.watermarkRow}>
            <View style={[styles.watermarkDot, { backgroundColor: tColor + '20' }]} />
            <Text style={[styles.watermark, { color: tColor + '30' }]}>Devocio</Text>
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
          {textContent}
        </View>
      );
    }

    return (
      <LinearGradient colors={currentGradient.colors} style={containerStyle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={[styles.decorCircle, styles.decorCircle1, { backgroundColor: currentGradient.textColor + '05' }]} />
        <View style={[styles.decorCircle, styles.decorCircle2, { backgroundColor: currentGradient.textColor + '03' }]} />
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

          {/* Audio Button */}
          <Animated.View style={{ transform: [{ scale: speakPulse }] }}>
            <TouchableOpacity
              style={[styles.audioBtn, isSpeaking && styles.audioBtnActive]}
              onPress={handleSpeak}
              disabled={!prayerText.trim()}
            >
              {isSpeaking ? (
                <>
                  <VolumeX size={18} color="#fff" />
                  <Text style={styles.audioBtnText}>Parar</Text>
                </>
              ) : (
                <>
                  <Volume2 size={18} color="#fff" />
                  <Text style={styles.audioBtnText}>Ouvir Oracao</Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Quick gradient/format switcher */}
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
          <TouchableOpacity style={styles.previewSaveBtn} onPress={handleSavePrayer}>
            <Heart size={18} color="#fff" />
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
          <Text style={[styles.headerTitle, { color: colors.text }]}>Card de Oracao</Text>
          <LinearGradient colors={['#a855f7', '#ec4899']} style={styles.proBadge} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Heart size={9} color="#fff" />
            <Text style={styles.proBadgeText}>NOVO</Text>
          </LinearGradient>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor: colors.card }]}>
        {([
          { id: 'content' as const, label: 'Oracao', icon: Type },
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
            {/* Category */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Categoria</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
              {PRAYER_CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    { backgroundColor: selectedCategory === cat.id ? cat.color : colors.card, borderColor: selectedCategory === cat.id ? cat.color : colors.borderLight },
                  ]}
                  onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedCategory(cat.id); }}
                >
                  <Text style={styles.categoryChipEmoji}>{cat.emoji}</Text>
                  <Text style={[styles.categoryChipText, { color: selectedCategory === cat.id ? '#fff' : colors.text }]}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Quick Prayers */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Oracoes Prontas</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
              {QUICK_PRAYERS.map((p, i) => {
                const cat = PRAYER_CATEGORIES.find(c => c.id === p.category);
                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.quickChip, { backgroundColor: colors.card, borderColor: prayerText === p.text ? (cat?.color || '#C5943A') : colors.borderLight }]}
                    onPress={() => handleQuickPrayer(p)}
                  >
                    <View style={styles.quickChipHeader}>
                      <Text style={styles.quickChipEmoji}>{cat?.emoji}</Text>
                      <Text style={[styles.quickChipTitle, { color: cat?.color || '#C5943A' }]}>{p.title}</Text>
                    </View>
                    <Text style={[styles.quickChipText, { color: colors.textMuted }]} numberOfLines={2}>{p.text}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Prayer Title */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Intencao / Titulo</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Ex: Pela minha familia..."
                placeholderTextColor={colors.textMuted}
                value={prayerTitle}
                onChangeText={setPrayerTitle}
              />
            </View>

            {/* Prayer Text */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Sua Oracao</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput
                style={[styles.inputMulti, { color: colors.text }]}
                placeholder="Digite sua oracao aqui..."
                placeholderTextColor={colors.textMuted}
                value={prayerText}
                onChangeText={setPrayerText}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>

            {/* Audio preview */}
            {prayerText.trim().length > 0 && (
              <TouchableOpacity
                style={[styles.audioPreviewBtn, { backgroundColor: colors.card, borderColor: isSpeaking ? '#a855f7' : colors.borderLight }]}
                onPress={handleSpeak}
              >
                <Animated.View style={{ transform: [{ scale: speakPulse }] }}>
                  {isSpeaking ? <VolumeX size={18} color="#a855f7" /> : <Volume2 size={18} color="#a855f7" />}
                </Animated.View>
                <Text style={[styles.audioPreviewText, { color: colors.text }]}>
                  {isSpeaking ? 'Tocando... Toque para parar' : 'Ouvir Oracao'}
                </Text>
                <Text style={[styles.audioPreviewHint, { color: usingElevenLabs ? '#a855f7' : colors.textMuted }]}>
                  {usingElevenLabs ? 'ElevenLabs' : 'PT-BR'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ─── TAB: Style ─── */}
        {activeTab === 'style' && (
          <View style={styles.tabContent}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Formato</Text>
            <View style={styles.formatRow}>
              {(['1:1', '9:16'] as CardFormat[]).map(f => (
                <TouchableOpacity
                  key={f}
                  style={[styles.formatBtn, { backgroundColor: format === f ? '#a855f7' : colors.card, borderColor: format === f ? '#a855f7' : colors.borderLight }]}
                  onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFormat(f); }}
                >
                  {f === '1:1' ? <Square size={20} color={format === f ? '#fff' : colors.textMuted} /> : <RectangleVertical size={20} color={format === f ? '#fff' : colors.textMuted} />}
                  <Text style={[styles.formatBtnLabel, { color: format === f ? '#fff' : colors.text }]}>{f === '1:1' ? 'Feed (1:1)' : 'Story (9:16)'}</Text>
                  <Text style={[styles.formatBtnDesc, { color: format === f ? 'rgba(255,255,255,0.7)' : colors.textMuted }]}>{f === '1:1' ? 'Instagram, Facebook' : 'Stories, Reels'}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Tipografia</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fontRow}>
              {FONT_STYLES.map(f => (
                <TouchableOpacity
                  key={f.id}
                  style={[styles.fontBtn, { backgroundColor: fontStyle === f.id ? '#a855f7' : colors.card, borderColor: fontStyle === f.id ? '#a855f7' : colors.borderLight }]}
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

            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Posicao do Texto</Text>
            <View style={styles.positionRow}>
              {TEXT_POSITIONS.map(p => {
                const Icon = p.icon;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.positionBtn, { backgroundColor: textPosition === p.id ? '#a855f7' : colors.card, borderColor: textPosition === p.id ? '#a855f7' : colors.borderLight }]}
                    onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTextPosition(p.id); }}
                  >
                    <Icon size={14} color={textPosition === p.id ? '#fff' : colors.textMuted} />
                    <Text style={[styles.positionBtnText, { color: textPosition === p.id ? '#fff' : colors.text }]}>{p.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ─── TAB: Background ─── */}
        {activeTab === 'background' && (
          <View style={styles.tabContent}>
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
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gradCategoryRow}>
                  {([
                    { id: 'celestial' as const, label: 'Celestial', emoji: '🌌' },
                    { id: 'paz' as const, label: 'Paz', emoji: '🕊️' },
                    { id: 'fe' as const, label: 'Fe', emoji: '✝️' },
                    { id: 'graca' as const, label: 'Graca', emoji: '✨' },
                    { id: 'esperanca' as const, label: 'Esperanca', emoji: '🌅' },
                  ]).map(cat => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.gradCategoryChip, gradientCategory === cat.id && styles.gradCategoryChipActive, { borderColor: colors.borderLight }]}
                      onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setGradientCategory(cat.id); }}
                    >
                      <Text style={styles.gradCategoryEmoji}>{cat.emoji}</Text>
                      <Text style={[styles.gradCategoryText, gradientCategory === cat.id && styles.gradCategoryTextActive, { color: colors.textMuted }]}>{cat.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

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
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Temas de Oracao</Text>
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

                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Estilo Artistico</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.aiStyleRow}>
                  {IMAGE_STYLES.map(style => (
                    <TouchableOpacity
                      key={style.id}
                      style={[styles.aiStyleChip, { backgroundColor: selectedAiStyle === style.id ? '#a855f7' : colors.card, borderColor: selectedAiStyle === style.id ? '#a855f7' : colors.borderLight }]}
                      onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedAiStyle(style.id); }}
                    >
                      <Text style={styles.aiStyleEmoji}>{style.emoji}</Text>
                      <Text style={[styles.aiStyleName, { color: selectedAiStyle === style.id ? '#fff' : colors.text }]}>{style.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Ou descreva seu fundo</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Ex: anjo de luz protegendo uma familia..."
                    placeholderTextColor={colors.textMuted}
                    value={customAiPrompt}
                    onChangeText={setCustomAiPrompt}
                  />
                </View>

                <Animated.View style={{ transform: [{ scale: generatePulse }] }}>
                  <TouchableOpacity
                    style={[styles.generateAiBtn, isGenerating && styles.generateAiBtnGenerating]}
                    onPress={() => void handleGenerateAiBg()}
                    disabled={isGenerating}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={isGenerating ? ['#B8862D', '#a855f7'] : ['#a855f7', '#d946ef']}
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

                {aiImage && !isGenerating && (
                  <View style={[styles.aiResultCard, { borderColor: '#10b981' + '40' }]}>
                    <Image source={{ uri: `data:image/png;base64,${aiImage}` }} style={styles.aiResultImage} resizeMode="cover" />
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
                  <View style={[styles.generatingCard, { backgroundColor: colors.card, borderColor: '#a855f7' + '30' }]}>
                    <View style={styles.generatingIconWrap}>
                      <Sparkles size={28} color="#a855f7" />
                    </View>
                    <Text style={[styles.generatingTitle, { color: colors.text }]}>Criando sua imagem de oracao...</Text>
                    <Text style={[styles.generatingSubtitle, { color: colors.textMuted }]}>
                      A Stability AI esta gerando um fundo espiritual para seu card.
                    </Text>
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
          style={[styles.previewCta, !prayerText.trim() && { opacity: 0.4 }]}
          onPress={handlePreview}
          disabled={!prayerText.trim()}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#a855f7', '#d946ef']}
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

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  proBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  proBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },

  tabBar: { flexDirection: 'row', marginHorizontal: 16, marginTop: 12, borderRadius: 12, padding: 4 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 8 },
  tabActive: { backgroundColor: '#a855f7' },
  tabText: { fontSize: 12, fontWeight: '700' },

  scrollContent: { padding: 16, paddingBottom: 110 },

  miniPreviewContainer: { alignItems: 'center', marginBottom: 20, marginTop: 8 },
  miniPreviewTouch: { position: 'relative' },
  miniPreviewOverlay: { position: 'absolute', bottom: 8, right: 8, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  miniPreviewHint: { fontSize: 11, fontWeight: '600' },

  cardFull: { width: 320, height: 320, borderRadius: 20, overflow: 'hidden', position: 'relative' },
  cardFullStory: { width: 260, height: 462, borderRadius: 20 },
  cardThumb: { width: 220, height: 220, borderRadius: 16, overflow: 'hidden', position: 'relative' },
  cardThumbStory: { width: 170, height: 302, borderRadius: 14 },

  cardTextWrapper: { flex: 1, padding: 18, alignItems: 'center', zIndex: 2 },
  cardTextWrapperFull: { padding: 28 },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 10 },
  categoryBadgeEmoji: { fontSize: 12 },
  categoryBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  prayerIcon: { fontSize: 48, marginBottom: -8, opacity: 0.3 },
  prayerText: { textAlign: 'center', lineHeight: 26, marginBottom: 14 },
  refRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  refLine: { width: 24, height: 1, opacity: 0.5 },
  refText: { fontWeight: '700', textAlign: 'center', letterSpacing: 1 },
  watermarkRow: { position: 'absolute', bottom: 12, right: 16, flexDirection: 'row', alignItems: 'center', gap: 4 },
  watermarkDot: { width: 4, height: 4, borderRadius: 2 },
  watermark: { fontSize: 9, fontWeight: '600', letterSpacing: 0.5 },

  decorCircle: { position: 'absolute', borderRadius: 999 },
  decorCircle1: { width: 250, height: 250, top: -80, right: -80 },
  decorCircle2: { width: 180, height: 180, bottom: -60, left: -60 },

  tabContent: { gap: 4 },
  sectionLabel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 14 },

  // Categories
  categoryRow: { gap: 8, marginBottom: 10 },
  categoryChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12, borderWidth: 1.5 },
  categoryChipEmoji: { fontSize: 14 },
  categoryChipText: { fontSize: 12, fontWeight: '700' },

  // Quick Prayers
  quickRow: { gap: 10, paddingRight: 20, marginBottom: 8 },
  quickChip: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, borderWidth: 1.5, width: 200 },
  quickChipHeader: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  quickChipEmoji: { fontSize: 13 },
  quickChipTitle: { fontSize: 13, fontWeight: '700' },
  quickChipText: { fontSize: 11, lineHeight: 16 },

  // Input
  inputWrapper: { borderWidth: 1, borderRadius: 14, overflow: 'hidden', marginBottom: 8 },
  input: { padding: 14, fontSize: 15 },
  inputMulti: { padding: 14, fontSize: 15, minHeight: 100, lineHeight: 22 },

  // Audio
  audioPreviewBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 14, borderWidth: 1.5, marginTop: 4 },
  audioPreviewText: { flex: 1, fontSize: 14, fontWeight: '600' },
  audioPreviewHint: { fontSize: 11, fontWeight: '700', backgroundColor: 'rgba(168,85,247,0.1)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },

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

  // Position
  positionRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  positionBtn: { flex: 1, flexDirection: 'row', paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  positionBtnText: { fontSize: 13, fontWeight: '600' },

  // Background
  bgModeToggle: { flexDirection: 'row', borderRadius: 14, borderWidth: 1, padding: 4, marginBottom: 14 },
  bgModeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  bgModeBtnActive: { backgroundColor: '#a855f7' },
  bgModeBtnText: { fontSize: 13, fontWeight: '700' },

  // Gradient categories
  gradCategoryRow: { gap: 8, marginBottom: 14 },
  gradCategoryChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  gradCategoryChipActive: { backgroundColor: '#a855f7', borderColor: '#a855f7' },
  gradCategoryText: { fontSize: 13, fontWeight: '600' },
  gradCategoryTextActive: { color: '#fff' },
  gradCategoryEmoji: { fontSize: 13 },

  // Gradient grid
  gradientGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  gradientCard: { width: '22%' as any, borderRadius: 12, overflow: 'hidden' },
  gradientCardActive: { borderWidth: 2, borderColor: '#a855f7' },
  gradientPreview: { height: 72, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  gradientCheck: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(168,85,247,0.9)', justifyContent: 'center', alignItems: 'center', position: 'absolute' },
  gradientEmoji: { fontSize: 18, opacity: 0.6 },
  gradientName: { fontSize: 9, fontWeight: '700', textAlign: 'center', paddingVertical: 4, letterSpacing: 0.3 },

  // AI themes
  aiThemeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  aiThemeCard: { width: '31%' as any, padding: 12, borderRadius: 14, borderWidth: 1, alignItems: 'center', gap: 6 },
  aiThemeIconWrap: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  aiThemeEmoji: { fontSize: 20 },
  aiThemeName: { fontSize: 10, fontWeight: '700', textAlign: 'center' },

  // AI style
  aiStyleRow: { gap: 8, marginBottom: 14 },
  aiStyleChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  aiStyleEmoji: { fontSize: 14 },
  aiStyleName: { fontSize: 12, fontWeight: '600' },

  // Generate
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
  generatingIconWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#a855f7' + '15', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  generatingTitle: { fontSize: 16, fontWeight: '800' },
  generatingSubtitle: { fontSize: 13, textAlign: 'center', lineHeight: 19 },

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
  previewCardContainer: { marginBottom: 16 },

  // Audio button
  audioBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(168,85,247,0.3)', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24, marginBottom: 16 },
  audioBtnActive: { backgroundColor: '#a855f7' },
  audioBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  previewFormatRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  previewFormatBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)' },
  previewFormatBtnActive: { backgroundColor: '#a855f7' },
  previewFormatText: { fontSize: 12, fontWeight: '600', color: '#999' },
  previewGradientRow: { gap: 8, paddingHorizontal: 16, marginBottom: 16 },
  gradientDot: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: 'transparent', overflow: 'hidden' },
  gradientDotActive: { borderColor: '#a855f7' },
  gradientDotInner: { width: '100%', height: '100%', borderRadius: 17 },
  previewActions: { flexDirection: 'row', padding: 16, paddingBottom: 28, gap: 10 },
  previewShareBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#a855f7', paddingVertical: 16, borderRadius: 14 },
  previewShareBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  previewSaveBtn: { width: 52, height: 52, borderRadius: 14, backgroundColor: '#ec4899', justifyContent: 'center', alignItems: 'center' },
  previewEditBtn: { width: 52, height: 52, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
});
