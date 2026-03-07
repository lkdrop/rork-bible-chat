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
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Play,
  Pause,
  Share2,
  Sparkles,
  Wand2,
  Check,
  Eye,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  SkipForward,
  RotateCcw,
  Film,
  Edit3,
  Palette,
  Type,
  ImageIcon,
  X,
  Zap,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { generateImage, IMAGE_STYLES, type ImageStyle } from '@/services/imageGeneration';
import { speak, stopSpeaking, isElevenLabsConfigured } from '@/services/textToSpeech';
import { shareContent } from '@/utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Types ───────────────────────────────────────────
type SlideType = 'hook' | 'verse' | 'reflection' | 'cta';
type FontStyle = 'serif' | 'modern' | 'handwritten' | 'bold' | 'elegant';
type VoiceOption = 'ana' | 'carla' | 'keren' | 'borges' | 'adriano' | 'will';

interface ReelSlide {
  id: number;
  text: string;
  type: SlideType;
  aiImage: string | null;
  isGenerating: boolean;
  prompt: string;
}

interface GradientTemplate {
  id: string;
  name: string;
  colors: [string, string, string];
  textColor: string;
  emoji: string;
}

interface ReelPreset {
  id: string;
  title: string;
  emoji: string;
  category: string;
  slides: { text: string; type: SlideType; prompt: string }[];
}

interface AiTheme {
  id: string;
  name: string;
  prompt: string;
  emoji: string;
  color: string;
}

// ─── Preset Reels ────────────────────────────────────
const REEL_PRESETS: ReelPreset[] = [
  {
    id: 'deus-te-ama',
    title: 'Deus Te Ama',
    emoji: '❤️',
    category: 'Amor',
    slides: [
      { text: 'Pare tudo e leia isso...', type: 'hook', prompt: 'dramatic divine light rays breaking through dark storm clouds, golden beams, heavenly atmosphere, cinematic vertical composition, 8k' },
      { text: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigenito, para que todo o que nele cre nao pereca, mas tenha a vida eterna.', type: 'verse', prompt: 'beautiful cross silhouette on hilltop at golden sunset, warm orange and pink sky, volumetric god rays, spiritual atmosphere, vertical, 8k' },
      { text: '— Joao 3:16', type: 'reflection', prompt: 'open ancient bible with golden pages glowing with divine light, peaceful atmosphere, bokeh background, warm tones, vertical composition, 8k' },
      { text: 'Salve para lembrar sempre ❤️', type: 'cta', prompt: 'beautiful red heart shape made of golden divine light floating in starry night sky, romantic spiritual atmosphere, vertical, 8k' },
    ],
  },
  {
    id: 'fe-que-vence',
    title: 'Fe que Vence',
    emoji: '🔥',
    category: 'Fe',
    slides: [
      { text: 'Sua fe vai mudar tudo.', type: 'hook', prompt: 'epic mountain peak breaking through clouds at sunrise, golden light, triumphant atmosphere, person silhouette on top, vertical, cinematic, 8k' },
      { text: 'Tudo posso naquele que me fortalece.', type: 'verse', prompt: 'powerful divine fire burning bright against dark background, holy flames, spiritual energy, dramatic lighting, vertical composition, 8k' },
      { text: '— Filipenses 4:13', type: 'reflection', prompt: 'majestic lion face in golden divine light, powerful and noble, spiritual strength, warm amber tones, portrait, vertical, 8k' },
      { text: 'Envie para quem precisa ouvir isso 🔥', type: 'cta', prompt: 'burning torch flame against dramatic sunset sky, symbol of faith and hope, warm orange and gold, vertical composition, 8k' },
    ],
  },
  {
    id: 'paz-interior',
    title: 'Paz Interior',
    emoji: '🕊️',
    category: 'Paz',
    slides: [
      { text: 'Cansado? Deus tem uma promessa pra voce.', type: 'hook', prompt: 'serene peaceful lake at sunrise with perfect reflection, misty mountains, calm atmosphere, soft pastel colors, vertical, 8k' },
      { text: 'Vinde a mim, todos os que estais cansados e sobrecarregados, e eu vos aliviarei.', type: 'verse', prompt: 'gentle hands reaching down from heavenly clouds with warm golden light, compassionate divine presence, peaceful, vertical, 8k' },
      { text: '— Mateus 11:28', type: 'reflection', prompt: 'white dove flying peacefully over calm turquoise ocean, soft golden sunset, serene atmosphere, freedom, vertical composition, 8k' },
      { text: 'Marque alguem que precisa de paz 🕊️', type: 'cta', prompt: 'beautiful zen garden with flowing water, cherry blossom petals floating, soft morning light, peaceful meditation space, vertical, 8k' },
    ],
  },
  {
    id: 'protecao-divina',
    title: 'Protecao Divina',
    emoji: '🛡️',
    category: 'Protecao',
    slides: [
      { text: 'Voce nunca esta sozinho.', type: 'hook', prompt: 'protective angel wings surrounding a glowing light, divine protection, warm golden atmosphere, spiritual guardian, vertical, 8k' },
      { text: 'Aquele que habita no esconderijo do Altissimo, a sombra do Onipotente descansara.', type: 'verse', prompt: 'majestic ancient fortress on mountaintop at sunset, impregnable walls, divine light from above, safe haven, vertical composition, 8k' },
      { text: '— Salmos 91:1', type: 'reflection', prompt: 'golden shield of light with divine symbols floating in ethereal space, spiritual armor, protective divine energy, vertical, 8k' },
      { text: 'Amem? Comente abaixo 🙏', type: 'cta', prompt: 'hands clasped in prayer with divine golden light surrounding them, devotion, warm spiritual atmosphere, vertical, 8k' },
    ],
  },
  {
    id: 'gratidao',
    title: 'Gratidao',
    emoji: '🙌',
    category: 'Gratidao',
    slides: [
      { text: 'Quantas bencaos voce tem?', type: 'hook', prompt: 'spectacular rainbow over lush green valley after rain, golden sunlight breaking through clouds, blessings from heaven, vertical, 8k' },
      { text: 'Em tudo dai gracas, porque esta e a vontade de Deus em Cristo Jesus para convosco.', type: 'verse', prompt: 'beautiful harvest field of golden wheat at sunset, abundance and gratitude, warm amber light, peaceful, vertical composition, 8k' },
      { text: '— 1 Tessalonicenses 5:18', type: 'reflection', prompt: 'hands raised to sky in worship and gratitude, beautiful sunset colors, joyful silhouette, spiritual celebration, vertical, 8k' },
      { text: 'Compartilhe e espalhe gratidao 🙌', type: 'cta', prompt: 'field of sunflowers reaching toward brilliant sunshine, joy and gratitude, vibrant yellow and blue, happy atmosphere, vertical, 8k' },
    ],
  },
  {
    id: 'proposito',
    title: 'Proposito Divino',
    emoji: '🎯',
    category: 'Proposito',
    slides: [
      { text: 'Deus tem um plano pra voce.', type: 'hook', prompt: 'compass pointing north on ancient map with divine light illuminating the path, destiny and purpose, warm golden tones, vertical, 8k' },
      { text: 'Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz, e nao de mal, para vos dar o fim que esperais.', type: 'verse', prompt: 'pathway of light through dark forest leading to brilliant sunrise, hope and purpose, magical atmosphere, vertical composition, 8k' },
      { text: '— Jeremias 29:11', type: 'reflection', prompt: 'ancient scroll being unrolled revealing golden divine text, prophecy and promise, warm candlelight, mysterious sacred, vertical, 8k' },
      { text: 'Salve para os dias dificeis 🎯', type: 'cta', prompt: 'beautiful sunrise over ocean horizon, new beginning, hope and destiny, golden and pink colors, inspirational, vertical, 8k' },
    ],
  },
  {
    id: 'forca-fraqueza',
    title: 'Forca na Fraqueza',
    emoji: '💪',
    category: 'Forca',
    slides: [
      { text: 'Quando voce se sentir fraco...', type: 'hook', prompt: 'single small plant growing through crack in concrete, strength in weakness, divine light shining on it, resilience, vertical, 8k' },
      { text: 'A minha graca te basta, porque o meu poder se aperfeiçoa na fraqueza.', type: 'verse', prompt: 'broken pottery being filled with golden light kintsugi style, beautiful in brokenness, divine restoration, vertical composition, 8k' },
      { text: '— 2 Corintios 12:9', type: 'reflection', prompt: 'mighty waterfall cascading from mountain with rainbow, unstoppable divine power, strength and beauty, vertical, 8k' },
      { text: 'Envie para quem esta lutando 💪', type: 'cta', prompt: 'person standing strong on cliff edge facing vast ocean at sunrise, courage and strength, silhouette, vertical, 8k' },
    ],
  },
  {
    id: 'esperanca',
    title: 'Esperanca',
    emoji: '🌅',
    category: 'Esperanca',
    slides: [
      { text: 'Nao desista. Leia isso.', type: 'hook', prompt: 'lighthouse beam cutting through dark storm, beacon of hope, dramatic waves, powerful light, vertical composition, 8k' },
      { text: 'Sabemos que todas as coisas cooperam para o bem daqueles que amam a Deus.', type: 'verse', prompt: 'beautiful butterfly emerging from cocoon in golden morning light, transformation and hope, macro photography, vertical, 8k' },
      { text: '— Romanos 8:28', type: 'reflection', prompt: 'seeds sprouting in dark soil reaching toward sunlight, new life and growth, hope, vertical composition, macro, 8k' },
      { text: 'Salve e relembre quando precisar 🌅', type: 'cta', prompt: 'spectacular golden sunrise painting clouds in orange pink and purple, new day dawning, hope and beauty, vertical, 8k' },
    ],
  },
];

// ─── Gradient Templates (dark for reels) ─────────────
const REEL_GRADIENTS: GradientTemplate[] = [
  { id: 'noite-estrelada', name: 'Noite Estrelada', colors: ['#020617', '#0f172a', '#1e3a5f'], textColor: '#e2e8f0', emoji: '🌌' },
  { id: 'fogo-sagrado', name: 'Fogo Sagrado', colors: ['#7c2d12', '#9a3412', '#c2410c'], textColor: '#fff7ed', emoji: '🔥' },
  { id: 'ouro-celestial', name: 'Ouro Celestial', colors: ['#451a03', '#78350f', '#b45309'], textColor: '#fef3c7', emoji: '✨' },
  { id: 'eden', name: 'Jardim do Eden', colors: ['#022c22', '#064e3b', '#047857'], textColor: '#ecfdf5', emoji: '🌿' },
  { id: 'por-do-sol', name: 'Por do Sol', colors: ['#431407', '#7c2d12', '#d97706'], textColor: '#fef9c3', emoji: '🌅' },
  { id: 'aurora', name: 'Aurora', colors: ['#0a0520', '#1b0a3c', '#3b0764'], textColor: '#f0e7ff', emoji: '💜' },
  { id: 'oceano', name: 'Oceano Profundo', colors: ['#042f2e', '#0f766e', '#0d9488'], textColor: '#f0fdfa', emoji: '🌊' },
  { id: 'calvario', name: 'Calvario', colors: ['#1c0808', '#3b0f0f', '#7f1d1d'], textColor: '#fef2f2', emoji: '✝️' },
  { id: 'ressurreicao', name: 'Ressurreicao', colors: ['#1a0533', '#6B4E0F', '#B8862D'], textColor: '#f5f3ff', emoji: '🌟' },
  { id: 'royal-noir', name: 'Royal Noir', colors: ['#0a0a0a', '#1a1025', '#2d1654'], textColor: '#f5f0ff', emoji: '👑' },
  { id: 'pergaminho', name: 'Pergaminho', colors: ['#faf5eb', '#f0e8d5', '#e4d5b7'], textColor: '#292524', emoji: '📜' },
  { id: 'rosa-mistica', name: 'Rosa Mistica', colors: ['#3b0724', '#6b1541', '#9d174d'], textColor: '#fdf2f8', emoji: '🌹' },
];

// ─── AI Background Themes ────────────────────────────
const REEL_AI_THEMES: AiTheme[] = [
  {
    id: 'dramatic-sky',
    name: 'Ceu Dramatico',
    prompt: 'dramatic sky with golden sunlight breaking through storm clouds, volumetric god rays, heavenly atmosphere, cinematic, vertical composition',
    emoji: '☁️',
    color: '#f59e0b',
  },
  {
    id: 'divine-light',
    name: 'Luz Divina',
    prompt: 'spectacular divine light rays breaking through clouds, golden beams, spiritual atmosphere, vertical portrait composition, 8k',
    emoji: '✨',
    color: '#eab308',
  },
  {
    id: 'peaceful-nature',
    name: 'Natureza Serena',
    prompt: 'peaceful serene nature landscape, gentle river through lush green valley, soft golden light, meditative calm atmosphere, vertical',
    emoji: '🌿',
    color: '#059669',
  },
  {
    id: 'cross-sunset',
    name: 'Cruz no Por do Sol',
    prompt: 'silhouette of a cross on hilltop at dramatic sunset, orange and purple sky, volumetric rays, reverent atmosphere, vertical composition',
    emoji: '✝️',
    color: '#dc2626',
  },
  {
    id: 'cosmic-heavens',
    name: 'Ceu Celestial',
    prompt: 'majestic night sky with stars and milky way, deep purple and blue nebula, ethereal cosmic clouds, awe-inspiring, vertical',
    emoji: '🌌',
    color: '#B8862D',
  },
  {
    id: 'sacred-garden',
    name: 'Jardim Sagrado',
    prompt: 'enchanted garden with ancient olive trees, golden dappled sunlight through leaves, wildflowers, sacred peaceful atmosphere, vertical',
    emoji: '🫒',
    color: '#65a30d',
  },
  {
    id: 'ocean-calm',
    name: 'Mar Tranquilo',
    prompt: 'crystal clear turquoise ocean at golden hour, gentle waves, peaceful horizon, soft pink and gold clouds, calm meditative, vertical',
    emoji: '🌊',
    color: '#0891b2',
  },
  {
    id: 'mountain-glory',
    name: 'Montanhas Gloriosas',
    prompt: 'majestic mountain range at sunrise, dramatic mist in valleys, golden and pink light on snow peaks, epic landscape, vertical composition',
    emoji: '🏔️',
    color: '#6366f1',
  },
];

// ─── Font Styles ─────────────────────────────────────
const FONT_STYLES: { id: FontStyle; name: string; preview: string }[] = [
  { id: 'serif', name: 'Classico', preview: 'Aa' },
  { id: 'modern', name: 'Moderno', preview: 'Aa' },
  { id: 'elegant', name: 'Refinado', preview: 'Aa' },
  { id: 'handwritten', name: 'Manuscrito', preview: 'Aa' },
  { id: 'bold', name: 'Impacto', preview: 'AA' },
];

const VOICE_OPTIONS: { id: VoiceOption; name: string; desc: string }[] = [
  { id: 'ana', name: 'Ana', desc: 'Feminina calma' },
  { id: 'carla', name: 'Carla', desc: 'Narradora' },
  { id: 'keren', name: 'Keren', desc: 'Doce e vibrante' },
  { id: 'borges', name: 'Borges', desc: 'Masculina calma' },
  { id: 'adriano', name: 'Adriano', desc: 'Narrador profundo' },
  { id: 'will', name: 'Will', desc: 'Masculina suave' },
];

const getFontFamily = (style: FontStyle) => {
  if (Platform.OS === 'web') {
    const map: Record<FontStyle, string> = {
      serif: 'Georgia, serif',
      modern: 'system-ui, -apple-system, sans-serif',
      handwritten: 'cursive',
      bold: 'Impact, sans-serif',
      elegant: 'Palatino, serif',
    };
    return map[style];
  }
  return undefined;
};

// ─── Component ───────────────────────────────────────
export default function BibleReelsScreen() {
  const router = useRouter();
  const { colors, state, recordCreate, canCreate } = useApp();

  // Content
  const defaultPreset = REEL_PRESETS[1]; // Fe que Vence
  const [slides, setSlides] = useState<ReelSlide[]>(
    defaultPreset.slides.map((s, i) => ({ id: i + 1, text: s.text, type: s.type, aiImage: null, isGenerating: false, prompt: s.prompt }))
  );
  const [selectedPreset, setSelectedPreset] = useState<string | null>(defaultPreset.id);
  const [editingSlide, setEditingSlide] = useState<number | null>(null);

  // Style
  const [selectedGradient, setSelectedGradient] = useState(REEL_GRADIENTS[0]);
  const [fontStyle, setFontStyle] = useState<FontStyle>('bold');
  const [selectedImageStyle, setSelectedImageStyle] = useState(IMAGE_STYLES[3]); // Arte Digital
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Preview & playback
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'preview'>('content');
  const [showPreview, setShowPreview] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceOption, setVoiceOption] = useState<VoiceOption>('ana');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideOpacity = useRef(new Animated.Value(1)).current;
  const generatePulse = useRef(new Animated.Value(1)).current;
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
      void stopSpeaking();
    };
  }, []);

  // ─── Handlers ────────────────────────────────────────

  const selectPreset = useCallback((preset: ReelPreset) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPreset(preset.id);
    setSlides(preset.slides.map((s, i) => ({ id: i + 1, text: s.text, type: s.type, aiImage: null, isGenerating: false, prompt: s.prompt })));
  }, []);

  const updateSlideText = useCallback((id: number, text: string) => {
    setSlides(prev => prev.map(s => s.id === id ? { ...s, text } : s));
  }, []);

  const addSlide = useCallback(() => {
    if (slides.length >= 6) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newId = Math.max(...slides.map(s => s.id)) + 1;
    setSlides(prev => [...prev, { id: newId, text: 'Novo slide...', type: 'verse', aiImage: null, isGenerating: false, prompt: 'beautiful divine light rays breaking through clouds, spiritual atmosphere, vertical, 8k' }]);
  }, [slides]);

  const removeSlide = useCallback((id: number) => {
    if (slides.length <= 2) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSlides(prev => prev.filter(s => s.id !== id));
  }, [slides]);

  const generateSlideImage = useCallback(async (slideIndex: number) => {
    const slide = slides[slideIndex];
    if (!slide || slide.aiImage) return true;

    setSlides(prev => prev.map((s, i) => i === slideIndex ? { ...s, isGenerating: true } : s));

    try {
      const result = await generateImage(slide.prompt, selectedImageStyle);
      if (result.success && result.imageBase64) {
        setSlides(prev => prev.map((s, i) =>
          i === slideIndex ? { ...s, aiImage: result.imageBase64!, isGenerating: false } : s
        ));
        return true;
      } else {
        setSlides(prev => prev.map((s, i) =>
          i === slideIndex ? { ...s, isGenerating: false } : s
        ));
        return false;
      }
    } catch {
      setSlides(prev => prev.map((s, i) =>
        i === slideIndex ? { ...s, isGenerating: false } : s
      ));
      return false;
    }
  }, [slides, selectedImageStyle]);

  const handleGenerateAll = useCallback(async () => {
    if (!canCreate()) {
      router.push('/paywall' as never);
      return;
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsGeneratingAll(true);
    setGenerationProgress(0);

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(generatePulse, { toValue: 1.03, duration: 1000, useNativeDriver: true }),
        Animated.timing(generatePulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    pulse.start();

    let successCount = 0;
    for (let i = 0; i < slides.length; i++) {
      if (slides[i].aiImage) {
        successCount++;
        setGenerationProgress((i + 1) / slides.length);
        continue;
      }
      setCurrentSlide(i);
      const success = await generateSlideImage(i);
      if (success) successCount++;
      setGenerationProgress((i + 1) / slides.length);
      if (i < slides.length - 1) await new Promise(r => setTimeout(r, 500));
    }

    pulse.stop();
    generatePulse.setValue(1);
    setIsGeneratingAll(false);
    setCurrentSlide(0);

    if (successCount > 0) {
      recordCreate();
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erro', 'Falha ao gerar imagens. Tente novamente.');
    }
  }, [slides, canCreate, generateSlideImage, recordCreate, router]);

  const advanceSlide = useCallback(() => {
    Animated.timing(slideOpacity, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
      setCurrentSlide(prev => {
        const next = prev + 1;
        if (next >= slides.length) {
          // End of reel
          setIsPlaying(false);
          if (playIntervalRef.current) {
            clearInterval(playIntervalRef.current);
            playIntervalRef.current = null;
          }
          return 0;
        }
        return next;
      });
      Animated.timing(slideOpacity, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    });
  }, [slides.length]);

  const togglePlay = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (isPlaying) {
      // Stop
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
      setIsPlaying(false);
      void stopSpeaking();
      setIsSpeaking(false);
    } else {
      // Play
      setIsPlaying(true);
      setCurrentSlide(0);
      slideOpacity.setValue(1);

      // Start audio
      const fullText = slides.map(s => s.text).join('. ');
      setIsSpeaking(true);
      void speak(fullText, {
        voice: voiceOption,
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });

      // Auto-advance slides
      playIntervalRef.current = setInterval(() => {
        advanceSlide();
      }, 3500);
    }
  }, [isPlaying, slides, voiceOption, advanceSlide]);

  const goToSlide = useCallback((index: number) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(slideOpacity, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setCurrentSlide(index);
      Animated.timing(slideOpacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    });
  }, []);

  const handleShare = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const script = slides.map((s, i) => `[Slide ${i + 1}] ${s.text}`).join('\n');
    await shareContent(`🎬 Reels Biblicos\n\n${script}\n\nCriado com Devocio`);
  }, [slides]);

  const handleAudioToggle = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isSpeaking) {
      await stopSpeaking();
      setIsSpeaking(false);
    } else {
      const fullText = slides.map(s => s.text).join('. ');
      setIsSpeaking(true);
      await speak(fullText, {
        voice: voiceOption,
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  }, [isSpeaking, slides, voiceOption]);

  // ─── Render Slide ────────────────────────────────────

  const getSlideTextStyle = (slide: ReelSlide) => {
    const base: any = {
      color: selectedGradient.textColor,
      textAlign: 'center' as const,
      fontFamily: getFontFamily(fontStyle),
    };

    switch (slide.type) {
      case 'hook':
        return { ...base, fontSize: 28, fontWeight: '900' as const, letterSpacing: -0.5 };
      case 'verse':
        return { ...base, fontSize: 22, fontWeight: '600' as const, fontStyle: 'italic' as const, lineHeight: 34 };
      case 'reflection':
        return { ...base, fontSize: 18, fontWeight: '500' as const, opacity: 0.8 };
      case 'cta':
        return { ...base, fontSize: 20, fontWeight: '800' as const, letterSpacing: 0.3 };
      default:
        return { ...base, fontSize: 22, fontWeight: '600' as const };
    }
  };

  const renderSlide = (slideIndex: number, size: 'full' | 'thumb' = 'full') => {
    const slide = slides[slideIndex];
    if (!slide) return null;
    const isFull = size === 'full';
    const containerStyle = isFull
      ? { width: SCREEN_WIDTH - 48, height: (SCREEN_WIDTH - 48) * 16 / 9, maxHeight: 500 }
      : { width: 120, height: 213 };

    return (
      <View style={[styles.slideContainer, containerStyle, { borderRadius: isFull ? 20 : 12 }]}>
        {slide.aiImage ? (
          <Image
            source={{ uri: `data:image/png;base64,${slide.aiImage}` }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
        ) : null}
        <LinearGradient
          colors={slide.aiImage
            ? ['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.6)']
            : selectedGradient.colors as [string, string, string]
          }
          style={StyleSheet.absoluteFillObject}
        />

        {/* Generating spinner */}
        {slide.isGenerating && (
          <View style={styles.slideGenerating}>
            <ActivityIndicator color="#A78BFA" size={isFull ? 'large' : 'small'} />
            {isFull && <Text style={styles.slideGeneratingText}>Gerando...</Text>}
          </View>
        )}

        {/* Slide counter */}
        <View style={styles.slideCounter}>
          <Text style={[styles.slideCounterText, { color: selectedGradient.textColor, fontSize: isFull ? 13 : 8 }]}>
            {slideIndex + 1}/{slides.length}
          </Text>
        </View>

        {/* Slide type label */}
        {isFull && (
          <View style={styles.slideTypeLabel}>
            <Text style={[styles.slideTypeLabelText, { color: selectedGradient.textColor }]}>
              {slide.type === 'hook' ? '🎣 HOOK' : slide.type === 'verse' ? '📖 VERSICULO' : slide.type === 'reflection' ? '💭 REFLEXAO' : '📢 CTA'}
            </Text>
          </View>
        )}

        {/* Text content */}
        <View style={styles.slideTextWrap}>
          <Text style={getSlideTextStyle(slide)}>
            {slide.text}
          </Text>
        </View>

        {/* Watermark */}
        <View style={styles.slideWatermark}>
          <Text style={[styles.slideWatermarkText, { color: selectedGradient.textColor, fontSize: isFull ? 10 : 6 }]}>
            Criado com Devocio
          </Text>
        </View>

        {/* Progress dots */}
        {isFull && (
          <View style={styles.progressDots}>
            {slides.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: selectedGradient.textColor,
                    opacity: i === slideIndex ? 1 : 0.3,
                    width: i === slideIndex ? 20 : 6,
                  },
                ]}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  // ─── Tab Content Renders ─────────────────────────────

  const renderContentTab = () => (
    <View style={styles.tabContent}>
      {/* Preset selector */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Reels Prontos</Text>
      <Text style={[styles.sectionDesc, { color: colors.textMuted }]}>
        Selecione um modelo ou crie o seu
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
        {REEL_PRESETS.map(preset => (
          <TouchableOpacity
            key={preset.id}
            style={[
              styles.presetChip,
              {
                backgroundColor: selectedPreset === preset.id ? '#C5943A' : colors.card,
                borderColor: selectedPreset === preset.id ? '#C5943A' : colors.borderLight,
              },
            ]}
            onPress={() => selectPreset(preset)}
          >
            <Text style={styles.presetEmoji}>{preset.emoji}</Text>
            <View>
              <Text style={[styles.presetTitle, { color: selectedPreset === preset.id ? '#fff' : colors.text }]}>
                {preset.title}
              </Text>
              <Text style={[styles.presetCategory, { color: selectedPreset === preset.id ? '#e2d5ff' : colors.textMuted }]}>
                {preset.category} • {preset.slides.length} slides
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Slide editor */}
      <View style={styles.slideEditorHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Slides ({slides.length})</Text>
        {slides.length < 6 && (
          <TouchableOpacity style={[styles.addSlideBtn, { backgroundColor: '#C5943A' + '20' }]} onPress={addSlide}>
            <Plus size={16} color="#C5943A" />
            <Text style={[styles.addSlideBtnText, { color: '#C5943A' }]}>Adicionar</Text>
          </TouchableOpacity>
        )}
      </View>

      {slides.map((slide, index) => (
        <View
          key={slide.id}
          style={[styles.slideEditorCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
        >
          <View style={styles.slideEditorTop}>
            <View style={[styles.slideNumberBadge, { backgroundColor: '#C5943A' + '20' }]}>
              <Text style={[styles.slideNumberText, { color: '#C5943A' }]}>{index + 1}</Text>
            </View>
            <Text style={[styles.slideTypeText, { color: colors.textMuted }]}>
              {slide.type === 'hook' ? '🎣 Hook' : slide.type === 'verse' ? '📖 Versiculo' : slide.type === 'reflection' ? '💭 Reflexao' : '📢 CTA'}
            </Text>
            <View style={{ flex: 1 }} />
            {/* Type selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {(['hook', 'verse', 'reflection', 'cta'] as SlideType[]).map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeChip,
                    {
                      backgroundColor: slide.type === type ? '#C5943A' + '30' : 'transparent',
                      borderColor: slide.type === type ? '#C5943A' : colors.borderLight,
                    },
                  ]}
                  onPress={() => {
                    setSlides(prev => prev.map(s => s.id === slide.id ? { ...s, type } : s));
                  }}
                >
                  <Text style={[styles.typeChipText, { color: slide.type === type ? '#C5943A' : colors.textMuted }]}>
                    {type === 'hook' ? 'Hook' : type === 'verse' ? 'Verso' : type === 'reflection' ? 'Ref.' : 'CTA'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {slides.length > 2 && (
              <TouchableOpacity
                style={[styles.removeSlideBtn, { backgroundColor: '#ef4444' + '15' }]}
                onPress={() => removeSlide(slide.id)}
              >
                <Trash2 size={14} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>
          <TextInput
            style={[styles.slideTextInput, { color: colors.text, borderColor: colors.borderLight }]}
            value={slide.text}
            onChangeText={(text) => updateSlideText(slide.id, text)}
            placeholder="Texto do slide..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
          />
        </View>
      ))}
    </View>
  );

  const generatedCount = slides.filter(s => s.aiImage).length;

  const renderStyleTab = () => (
    <View style={styles.tabContent}>
      {/* Gradient fallback */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Gradiente Base</Text>
      <Text style={[styles.sectionDesc, { color: colors.textMuted }]}>Usado quando slides nao tem imagem IA</Text>
      <View style={styles.gradientGrid}>
        {REEL_GRADIENTS.map(g => (
          <TouchableOpacity
            key={g.id}
            style={[
              styles.gradientItem,
              {
                borderColor: selectedGradient.id === g.id ? '#C5943A' : colors.borderLight,
                borderWidth: selectedGradient.id === g.id ? 2 : 1,
              },
            ]}
            onPress={() => {
              setSelectedGradient(g);
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <LinearGradient colors={g.colors as [string, string, string]} style={styles.gradientPreview} />
            <Text style={[styles.gradientName, { color: colors.text }]}>{g.emoji} {g.name}</Text>
            {selectedGradient.id === g.id && (
              <View style={styles.gradientCheck}>
                <Check size={12} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Image style selector */}
      <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>Estilo IA</Text>
      <Text style={[styles.sectionDesc, { color: colors.textMuted }]}>Estilo das imagens geradas por IA</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.styleScroll}>
        {IMAGE_STYLES.map(style => (
          <TouchableOpacity
            key={style.id}
            style={[
              styles.styleChip,
              {
                backgroundColor: selectedImageStyle.id === style.id ? '#C5943A' : colors.card,
                borderColor: selectedImageStyle.id === style.id ? '#C5943A' : colors.borderLight,
              },
            ]}
            onPress={() => {
              setSelectedImageStyle(style);
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Text style={styles.styleChipEmoji}>{style.emoji}</Text>
            <Text style={[styles.styleChipText, { color: selectedImageStyle.id === style.id ? '#fff' : colors.text }]}>
              {style.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Generate ALL slides button */}
      <Animated.View style={{ transform: [{ scale: generatePulse }], marginTop: 16 }}>
        <TouchableOpacity
          style={[styles.generateBtn, { opacity: isGeneratingAll ? 0.7 : 1 }]}
          onPress={handleGenerateAll}
          disabled={isGeneratingAll}
        >
          <LinearGradient colors={['#B8862D', '#C5943A', '#A78BFA']} style={styles.generateBtnGradient}>
            {isGeneratingAll ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.generateBtnText}>
                  Gerando slide {Math.ceil(generationProgress * slides.length)}/{slides.length}...
                </Text>
              </>
            ) : (
              <>
                <Wand2 size={20} color="#fff" />
                <Text style={styles.generateBtnText}>
                  {generatedCount > 0 ? `Gerar ${slides.length - generatedCount} Restantes` : `Gerar ${slides.length} Imagens IA`}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Progress bar */}
      {isGeneratingAll && (
        <View style={[styles.progressBarBg, { backgroundColor: colors.card }]}>
          <View style={[styles.progressBarFill, { width: `${generationProgress * 100}%` }]} />
        </View>
      )}

      {generatedCount > 0 && (
        <View style={[styles.generatedInfo, { backgroundColor: '#22c55e' + '15' }]}>
          <Check size={14} color="#22c55e" />
          <Text style={[styles.generatedInfoText, { color: '#22c55e' }]}>
            {generatedCount}/{slides.length} slides com imagem IA
          </Text>
        </View>
      )}

      {/* Font style */}
      <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>Fonte</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fontScroll}>
        {FONT_STYLES.map(f => (
          <TouchableOpacity
            key={f.id}
            style={[
              styles.fontChip,
              {
                backgroundColor: fontStyle === f.id ? '#C5943A' : colors.card,
                borderColor: fontStyle === f.id ? '#C5943A' : colors.borderLight,
              },
            ]}
            onPress={() => {
              setFontStyle(f.id);
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Text style={[
              styles.fontPreview,
              {
                color: fontStyle === f.id ? '#fff' : colors.text,
                fontFamily: getFontFamily(f.id),
              },
            ]}>
              {f.preview}
            </Text>
            <Text style={[styles.fontName, { color: fontStyle === f.id ? '#e2d5ff' : colors.textMuted }]}>
              {f.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderPreviewTab = () => (
    <View style={styles.tabContent}>
      {/* Mini slide preview */}
      <View style={styles.previewSection}>
        <Animated.View style={{ opacity: slideOpacity }}>
          {renderSlide(currentSlide, 'full')}
        </Animated.View>
      </View>

      {/* Navigation */}
      <View style={styles.navRow}>
        <TouchableOpacity
          style={[styles.navBtn, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
          onPress={() => goToSlide(Math.max(0, currentSlide - 1))}
          disabled={currentSlide === 0}
        >
          <ChevronLeft size={20} color={currentSlide === 0 ? colors.textMuted : colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.playBtn, { backgroundColor: isPlaying ? '#ef4444' : '#C5943A' }]}
          onPress={togglePlay}
        >
          {isPlaying ? <Pause size={24} color="#fff" /> : <Play size={24} color="#fff" />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navBtn, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
          onPress={() => goToSlide(Math.min(slides.length - 1, currentSlide + 1))}
          disabled={currentSlide === slides.length - 1}
        >
          <ChevronRight size={20} color={currentSlide === slides.length - 1 ? colors.textMuted : colors.text} />
        </TouchableOpacity>
      </View>

      {/* Audio controls */}
      <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 16 }]}>Narracao</Text>

      <View style={styles.audioSection}>
        <TouchableOpacity
          style={[
            styles.audioBtn,
            {
              backgroundColor: isSpeaking ? '#ef4444' + '15' : '#C5943A' + '15',
              borderColor: isSpeaking ? '#ef4444' : '#C5943A',
            },
          ]}
          onPress={handleAudioToggle}
        >
          {isSpeaking ? <VolumeX size={18} color="#ef4444" /> : <Volume2 size={18} color="#C5943A" />}
          <Text style={[styles.audioBtnText, { color: isSpeaking ? '#ef4444' : '#C5943A' }]}>
            {isSpeaking ? 'Parar Audio' : 'Ouvir Narração'}
          </Text>
          {isElevenLabsConfigured() && (
            <View style={[styles.elevenBadge, { backgroundColor: '#C5943A' + '20' }]}>
              <Text style={[styles.elevenBadgeText, { color: '#C5943A' }]}>ElevenLabs</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Voice selector */}
        <View style={styles.voiceRow}>
          {VOICE_OPTIONS.map(v => (
            <TouchableOpacity
              key={v.id}
              style={[
                styles.voiceChip,
                {
                  backgroundColor: voiceOption === v.id ? '#C5943A' : colors.card,
                  borderColor: voiceOption === v.id ? '#C5943A' : colors.borderLight,
                },
              ]}
              onPress={() => {
                setVoiceOption(v.id);
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={[styles.voiceName, { color: voiceOption === v.id ? '#fff' : colors.text }]}>
                {v.name}
              </Text>
              <Text style={[styles.voiceDesc, { color: voiceOption === v.id ? '#e2d5ff' : colors.textMuted }]}>
                {v.desc}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Share */}
      <TouchableOpacity
        style={[styles.shareBtn, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
        onPress={handleShare}
      >
        <Share2 size={18} color="#C5943A" />
        <Text style={[styles.shareBtnText, { color: colors.text }]}>Compartilhar Roteiro</Text>
      </TouchableOpacity>

      {/* Slide thumbnails */}
      <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 16 }]}>Todos os Slides</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbScroll}>
        {slides.map((_, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.thumbWrap,
              { borderColor: currentSlide === i ? '#C5943A' : 'transparent', borderWidth: 2 },
            ]}
            onPress={() => goToSlide(i)}
          >
            {renderSlide(i, 'thumb')}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // ─── Main Render ─────────────────────────────────────

  const tabs = [
    { id: 'content' as const, label: 'Conteudo', icon: Edit3 },
    { id: 'style' as const, label: 'Estilo', icon: Palette },
    { id: 'preview' as const, label: 'Preview', icon: Eye },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.ScrollView
        style={{ opacity: fadeAnim }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.card }]}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Reels Biblicos</Text>
            <View style={[styles.proBadge, { backgroundColor: '#C5943A' }]}>
              <Film size={10} color="#fff" />
              <Text style={styles.proBadgeText}>IA</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.shareHeaderBtn, { backgroundColor: colors.card }]}
            onPress={handleShare}
          >
            <Share2 size={18} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={[styles.tabBar, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id && styles.tabActive,
                activeTab === tab.id && { backgroundColor: '#C5943A' + '15' },
              ]}
              onPress={() => {
                setActiveTab(tab.id);
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <tab.icon size={16} color={activeTab === tab.id ? '#C5943A' : colors.textMuted} />
              <Text style={[styles.tabText, { color: activeTab === tab.id ? '#C5943A' : colors.textMuted }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Mini preview on non-preview tabs */}
        {activeTab !== 'preview' && (
          <TouchableOpacity
            style={[styles.miniPreview, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
            onPress={() => setActiveTab('preview')}
          >
            <View style={styles.miniPreviewSlide}>
              {renderSlide(0, 'thumb')}
            </View>
            <View style={styles.miniPreviewInfo}>
              <Text style={[styles.miniPreviewTitle, { color: colors.text }]}>
                {slides.length} slides
              </Text>
              <Text style={[styles.miniPreviewSub, { color: colors.textMuted }]}>
                Toque para ver preview
              </Text>
            </View>
            <Eye size={18} color="#C5943A" />
          </TouchableOpacity>
        )}

        {/* Active tab content */}
        {activeTab === 'content' && renderContentTab()}
        {activeTab === 'style' && renderStyleTab()}
        {activeTab === 'preview' && renderPreviewTab()}
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 60 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerTitle: { fontSize: 20, fontWeight: '800' as const },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  proBadgeText: { fontSize: 10, fontWeight: '800' as const, color: '#fff' },
  shareHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 11,
  },
  tabActive: {},
  tabText: { fontSize: 13, fontWeight: '600' as const },

  // Mini preview
  miniPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    gap: 12,
  },
  miniPreviewSlide: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  miniPreviewInfo: { flex: 1 },
  miniPreviewTitle: { fontSize: 15, fontWeight: '700' as const },
  miniPreviewSub: { fontSize: 12, marginTop: 2 },

  // Tab content
  tabContent: {},
  sectionTitle: { fontSize: 17, fontWeight: '700' as const, marginBottom: 4 },
  sectionDesc: { fontSize: 13, marginBottom: 12 },

  // Presets
  presetScroll: { marginBottom: 20 },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginRight: 10,
    minWidth: 160,
  },
  presetEmoji: { fontSize: 24 },
  presetTitle: { fontSize: 14, fontWeight: '700' as const },
  presetCategory: { fontSize: 11, marginTop: 1 },

  // Slide editor
  slideEditorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addSlideBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addSlideBtnText: { fontSize: 13, fontWeight: '600' as const },
  slideEditorCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  slideEditorTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  slideNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideNumberText: { fontSize: 14, fontWeight: '800' as const },
  slideTypeText: { fontSize: 12 },
  typeChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 4,
  },
  typeChipText: { fontSize: 10, fontWeight: '600' as const },
  removeSlideBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  slideTextInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
  },

  // Background mode
  bgModeToggle: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  bgModeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  bgModeBtnText: { fontSize: 14, fontWeight: '600' as const },

  // Gradients
  gradientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  gradientItem: {
    width: (SCREEN_WIDTH - 56) / 3 - 6,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  gradientPreview: { height: 50 },
  gradientName: { fontSize: 10, fontWeight: '600' as const, textAlign: 'center', paddingVertical: 5 },
  gradientCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#C5943A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // AI themes
  aiThemeScroll: { marginBottom: 12 },
  aiThemeCard: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginRight: 10,
    minWidth: 100,
  },
  aiThemeEmoji: { fontSize: 28, marginBottom: 4 },
  aiThemeName: { fontSize: 12, fontWeight: '600' as const },

  // Image style
  styleScroll: { marginBottom: 16 },
  styleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 8,
  },
  styleChipEmoji: { fontSize: 16 },
  styleChipText: { fontSize: 12, fontWeight: '600' as const },

  // Progress bar
  progressBarBg: { height: 6, borderRadius: 3, marginBottom: 12, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#C5943A', borderRadius: 3 },
  generatedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  generatedInfoText: { fontSize: 13, fontWeight: '600' as const },

  // Slide generating overlay
  slideGenerating: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 5,
  },
  slideGeneratingText: { color: '#A78BFA', fontSize: 12, fontWeight: '600' as const, marginTop: 6 },

  // Generate button
  generateBtn: { marginBottom: 16, borderRadius: 14, overflow: 'hidden' },
  generateBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  generateBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' as const },

  // AI image preview
  aiImagePreview: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  aiImageThumb: { width: '100%', height: 120 },
  aiImageLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  aiImageLabelText: { fontSize: 12, fontWeight: '600' as const },

  // Font
  fontScroll: { marginBottom: 16 },
  fontChip: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
    minWidth: 70,
  },
  fontPreview: { fontSize: 20, fontWeight: '700' as const },
  fontName: { fontSize: 10, marginTop: 2 },

  // Preview section
  previewSection: { alignItems: 'center', marginBottom: 16 },

  // Navigation
  navRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginBottom: 16,
  },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  playBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Audio
  audioSection: { marginBottom: 16 },
  audioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  audioBtnText: { fontSize: 14, fontWeight: '600' as const },
  elevenBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  elevenBadgeText: { fontSize: 9, fontWeight: '700' as const },
  voiceRow: { flexDirection: 'row', gap: 8 },
  voiceChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  voiceName: { fontSize: 13, fontWeight: '700' as const },
  voiceDesc: { fontSize: 10, marginTop: 2 },

  // Share
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  shareBtnText: { fontSize: 14, fontWeight: '600' as const },

  // Thumbnails
  thumbScroll: { marginBottom: 16 },
  thumbWrap: { marginRight: 8, borderRadius: 14, overflow: 'hidden' },

  // Slide rendering
  slideContainer: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideCounter: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  slideCounterText: { fontWeight: '700' as const, opacity: 0.7 },
  slideTypeLabel: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  slideTypeLabelText: {
    fontSize: 10,
    fontWeight: '700' as const,
    opacity: 0.6,
    letterSpacing: 0.5,
  },
  slideTextWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  slideWatermark: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
  },
  slideWatermarkText: { fontWeight: '600' as const, opacity: 0.4 },
  progressDots: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'center',
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
});
