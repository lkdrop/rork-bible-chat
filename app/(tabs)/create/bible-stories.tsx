import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Share,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Share2,
  Sparkles,
  Wand2,
  Check,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  BookOpen,
  Loader,
  Download,
  RotateCcw,
  ImageIcon,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { generateImage, IMAGE_STYLES, type ImageStyle } from '@/services/imageGeneration';
import { speak, stopSpeaking, isElevenLabsConfigured } from '@/services/textToSpeech';
import { shareContent, shareViaWhatsApp } from '@/utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Types ───────────────────────────────────────────
type VoiceOption = 'ana' | 'carla' | 'keren' | 'borges' | 'adriano' | 'will';

interface StoryScene {
  id: number;
  title: string;
  description: string;
  prompt: string;
  narration: string;
  aiImage: string | null;
  isGenerating: boolean;
}

interface BibleStory {
  id: string;
  title: string;
  emoji: string;
  category: string;
  book: string;
  scenes: Omit<StoryScene, 'id' | 'aiImage' | 'isGenerating'>[];
}

// ─── Bible Stories ───────────────────────────────────
const BIBLE_STORIES: BibleStory[] = [
  {
    id: 'daniel-lions',
    title: 'Daniel na Cova dos Leoes',
    emoji: '🦁',
    category: 'Coragem',
    book: 'Daniel 6',
    scenes: [
      {
        title: 'A Conspiracao',
        description: 'Os governadores tramam contra Daniel',
        prompt: 'cartoon illustration of evil advisors whispering and plotting in a royal palace, ancient Babylon, dramatic lighting, biblical cartoon style, vibrant colors, children book illustration',
        narration: 'Os governadores do rei Dario tinham inveja de Daniel. Eles tramaram um plano para destrui-lo.',
      },
      {
        title: 'Daniel Ora a Deus',
        description: 'Daniel continua orando mesmo sob ameaca',
        prompt: 'cartoon illustration of a faithful man kneeling in prayer by an open window facing Jerusalem, golden sunlight streaming in, peaceful and devoted expression, biblical cartoon, warm colors, children book',
        narration: 'Mesmo sabendo do decreto, Daniel continuou orando a Deus tres vezes ao dia, de joelhos diante da janela aberta.',
      },
      {
        title: 'Lancado aos Leoes',
        description: 'Daniel e jogado na cova dos leoes',
        prompt: 'cartoon illustration of a brave man being lowered into a dark den full of lions, soldiers watching from above, dramatic scene, biblical cartoon style, vibrant colors, children book illustration',
        narration: 'O rei, com pesar, mandou lancar Daniel na cova dos leoes. Uma pedra foi colocada na entrada.',
      },
      {
        title: 'O Anjo Protege',
        description: 'Um anjo fecha a boca dos leoes',
        prompt: 'cartoon illustration of a glowing angel standing next to a calm man surrounded by peaceful lions in a den, divine light, magical atmosphere, biblical cartoon, warm golden light, children book',
        narration: 'Deus enviou seu anjo e fechou a boca dos leoes. Daniel ficou ileso, pois confiou no Senhor.',
      },
      {
        title: 'Libertacao!',
        description: 'Daniel sai ileso da cova',
        prompt: 'cartoon illustration of a joyful man being lifted out of a lions den, a happy king celebrating above, bright sunshine, triumphant scene, biblical cartoon style, vibrant happy colors, children book',
        narration: 'Ao amanhecer, o rei encontrou Daniel vivo! Deus o protegeu. O rei louvou o Deus de Daniel.',
      },
    ],
  },
  {
    id: 'moses-red-sea',
    title: 'Moises Abrindo o Mar',
    emoji: '🌊',
    category: 'Fe',
    book: 'Exodo 14',
    scenes: [
      {
        title: 'Fugindo do Egito',
        description: 'O povo de Israel foge do Farao',
        prompt: 'cartoon illustration of a large crowd of people with belongings fleeing through desert, ancient Egypt pyramids in background, dramatic sky, biblical cartoon style, vibrant colors, children book',
        narration: 'O povo de Israel fugiu do Egito apos anos de escravidao. Deus os guiava com uma coluna de nuvem.',
      },
      {
        title: 'O Exercito se Aproxima',
        description: 'O Farao manda seu exercito atras',
        prompt: 'cartoon illustration of Egyptian army with chariots and horses charging through desert, dust clouds, menacing scene, biblical cartoon style, dramatic colors, children book illustration',
        narration: 'O Farao se arrependeu e mandou todo seu exercito atras dos israelitas. O povo ficou com medo.',
      },
      {
        title: 'Moises Ergue o Cajado',
        description: 'Moises obedece a Deus e estende a mao',
        prompt: 'cartoon illustration of an old bearded man in robes raising a wooden staff over the sea, wind blowing, dramatic clouds parting, divine light from above, biblical cartoon, epic scene, children book',
        narration: 'Moises disse ao povo: Nao temam! Vejam a salvacao do Senhor! E ergueu seu cajado sobre o mar.',
      },
      {
        title: 'O Mar se Abre!',
        description: 'As aguas se dividem formando um caminho',
        prompt: 'cartoon illustration of a massive sea splitting into two giant walls of water with a dry path in the middle, people walking through amazed, spectacular divine miracle, biblical cartoon, epic colors, children book',
        narration: 'O Senhor dividiu o mar em dois! Muralhas de agua se ergueram dos dois lados, e o povo passou a pe enxuto.',
      },
      {
        title: 'Salvos por Deus',
        description: 'O povo cruza e o mar se fecha sobre o exercito',
        prompt: 'cartoon illustration of people celebrating on the other shore of the sea, waves crashing back together behind them, joyful celebration, rainbow in sky, biblical cartoon style, happy colors, children book',
        narration: 'Quando o exercito tentou seguir, as aguas voltaram sobre eles. Israel estava salvo! O povo cantou louvores a Deus.',
      },
    ],
  },
  {
    id: 'david-goliath',
    title: 'Davi e Golias',
    emoji: '⚔️',
    category: 'Coragem',
    book: '1 Samuel 17',
    scenes: [
      {
        title: 'O Gigante Desafia',
        description: 'Golias desafia o exercito de Israel',
        prompt: 'cartoon illustration of a massive armored giant warrior standing on a hill shouting at a scared army below, ancient battlefield, dramatic scene, biblical cartoon style, vibrant colors, children book',
        narration: 'Golias, um gigante filisteu de quase 3 metros, desafiava o exercito de Israel todos os dias. Ninguem tinha coragem de enfrenta-lo.',
      },
      {
        title: 'O Jovem Pastor',
        description: 'Davi se oferece para lutar',
        prompt: 'cartoon illustration of a brave young shepherd boy with a sling standing before a king on a throne, simple clothing versus royal armor, biblical cartoon style, warm lighting, children book',
        narration: 'Davi, um jovem pastor, disse ao rei Saul: Eu vou lutar contra ele! O Senhor que me livrou do leao me livrara deste gigante.',
      },
      {
        title: 'Cinco Pedras Lisas',
        description: 'Davi pega pedras no riacho',
        prompt: 'cartoon illustration of a young boy picking up smooth stones from a stream, peaceful valley, sling in hand, determined expression, golden light, biblical cartoon style, children book illustration',
        narration: 'Davi recusou a armadura do rei. Pegou cinco pedras lisas do riacho e sua funda. Sua arma era a fe em Deus.',
      },
      {
        title: 'A Pedra Voa!',
        description: 'Davi lanca a pedra com a funda',
        prompt: 'cartoon illustration of a young boy spinning a sling and launching a stone at a giant warrior, dynamic action scene, stone flying through air with speed lines, epic moment, biblical cartoon, children book',
        narration: 'Davi correu em direcao ao gigante, girou a funda e lancou a pedra. Ela acertou a testa de Golias!',
      },
      {
        title: 'Vitoria pela Fe!',
        description: 'Golias cai e Israel celebra',
        prompt: 'cartoon illustration of a giant warrior fallen on the ground while a young boy stands victorious, army celebrating in background, triumphant scene, bright colors, biblical cartoon style, children book',
        narration: 'O gigante caiu! Todo o exercito celebrou. Davi venceu nao com espada, mas com fe no Senhor.',
      },
    ],
  },
  {
    id: 'noah-ark',
    title: 'A Arca de Noe',
    emoji: '🚢',
    category: 'Obediencia',
    book: 'Genesis 6-9',
    scenes: [
      {
        title: 'A Ordem de Deus',
        description: 'Deus manda Noe construir uma arca',
        prompt: 'cartoon illustration of God speaking from bright clouds to an old bearded man looking up in awe, divine light beams, peaceful countryside, biblical cartoon style, warm colors, children book',
        narration: 'Deus viu que a maldade era grande na terra. Disse a Noe: Construa uma arca, pois enviarei um diluvio.',
      },
      {
        title: 'Construindo a Arca',
        description: 'Noe e sua familia constroem a grande arca',
        prompt: 'cartoon illustration of an old man and his family building a massive wooden boat on dry land, people laughing at them in background, hammer and wood, biblical cartoon style, children book',
        narration: 'Noe obedeceu a Deus. Ele e seus filhos construiram a arca. As pessoas riam, mas Noe continuou fiel.',
      },
      {
        title: 'Os Animais Entram',
        description: 'Animais de todas as especies entram na arca',
        prompt: 'cartoon illustration of pairs of cute animals walking into a large wooden ark, lions elephants giraffes birds, orderly line, friendly atmosphere, rainbow sky, biblical cartoon style, children book',
        narration: 'De dois em dois, os animais de todas as especies entraram na arca. Deus os guiou ate Noe.',
      },
      {
        title: 'O Grande Diluvio',
        description: 'A chuva cai por quarenta dias',
        prompt: 'cartoon illustration of a large wooden ark floating on massive flood waters during heavy rain, dramatic storm clouds, waves crashing, the ark safe and strong, biblical cartoon, dramatic colors, children book',
        narration: 'Choveu quarenta dias e quarenta noites. As aguas cobriram toda a terra. Mas a arca flutuava segura.',
      },
      {
        title: 'A Pomba e o Arco-Iris',
        description: 'A pomba volta com um ramo e Deus faz alianca',
        prompt: 'cartoon illustration of a white dove bringing an olive branch to people on a wooden ark, beautiful rainbow in the sky, calm waters, sunshine breaking through clouds, biblical cartoon, joyful colors, children book',
        narration: 'A pomba voltou com um ramo de oliveira. As aguas baixaram! Deus pos um arco-iris no ceu como sinal de alianca.',
      },
    ],
  },
  {
    id: 'jonah-whale',
    title: 'Jonas e a Baleia',
    emoji: '🐋',
    category: 'Arrependimento',
    book: 'Jonas 1-3',
    scenes: [
      {
        title: 'Fugindo de Deus',
        description: 'Jonas foge em um navio',
        prompt: 'cartoon illustration of a scared man sneaking onto an ancient wooden sailing ship at a port, looking behind nervously, biblical cartoon style, moody atmosphere, children book illustration',
        narration: 'Deus mandou Jonas ir a Ninive, mas ele fugiu! Embarcou num navio para ir na direcao oposta.',
      },
      {
        title: 'A Tempestade',
        description: 'Uma grande tempestade atinge o navio',
        prompt: 'cartoon illustration of a wooden ship being tossed by enormous waves in a terrible storm, lightning, scared sailors, dramatic scene, biblical cartoon style, dark dramatic colors, children book',
        narration: 'Deus enviou uma grande tempestade. Os marinheiros tinham medo. Jonas sabia que era por sua causa.',
      },
      {
        title: 'Engolido!',
        description: 'Jonas e engolido por um grande peixe',
        prompt: 'cartoon illustration of a man being swallowed by a huge friendly-looking whale in the ocean, dramatic but not scary, underwater scene, biblical cartoon style, blue ocean colors, children book',
        narration: 'Jonas foi lancado ao mar e um grande peixe o engoliu! Jonas ficou tres dias dentro do peixe, orando a Deus.',
      },
      {
        title: 'Oracao no Fundo do Mar',
        description: 'Jonas ora de dentro do peixe',
        prompt: 'cartoon illustration of a man praying inside the belly of a whale, divine light coming from above, peaceful despite the situation, underwater atmosphere, biblical cartoon style, children book',
        narration: 'Do fundo do mar, Jonas clamou ao Senhor: Na minha angustia clamei ao Senhor e Ele me ouviu! Obedecerei.',
      },
      {
        title: 'Segunda Chance',
        description: 'O peixe cospe Jonas na praia',
        prompt: 'cartoon illustration of a whale spitting out a man onto a sunny beach, the man looking relieved and grateful, bright sunshine, seagulls, biblical cartoon style, happy colors, children book',
        narration: 'O peixe vomitou Jonas na praia. Deus deu uma segunda chance! Desta vez Jonas obedeceu e foi a Ninive.',
      },
    ],
  },
  {
    id: 'joseph-dreams',
    title: 'Jose do Egito',
    emoji: '👑',
    category: 'Proposito',
    book: 'Genesis 37-45',
    scenes: [
      {
        title: 'O Sonhador',
        description: 'Jose conta seus sonhos aos irmaos',
        prompt: 'cartoon illustration of a young man in a colorful coat telling his brothers about his dreams, stars and wheat sheaves floating above, jealous brothers, biblical cartoon style, children book',
        narration: 'Jose era o filho preferido de Jaco. Ele teve sonhos de que seus irmaos se curvariam diante dele. Eles ficaram com inveja.',
      },
      {
        title: 'Vendido como Escravo',
        description: 'Os irmaos vendem Jose',
        prompt: 'cartoon illustration of brothers selling a young man to merchants with camels in the desert, dramatic sad scene but hopeful, biblical cartoon style, desert colors, children book illustration',
        narration: 'Os irmaos venderam Jose como escravo para mercadores. Jose foi levado ao Egito, longe de casa.',
      },
      {
        title: 'Na Prisao',
        description: 'Jose e preso injustamente mas Deus esta com ele',
        prompt: 'cartoon illustration of a young man in an ancient prison cell with divine light shining on him through a small window, hopeful despite chains, biblical cartoon style, warm light, children book',
        narration: 'No Egito, Jose foi preso injustamente. Mas Deus estava com ele e lhe deu sabedoria para interpretar sonhos.',
      },
      {
        title: 'Diante do Farao',
        description: 'Jose interpreta o sonho do Farao',
        prompt: 'cartoon illustration of a wise young man standing before the Egyptian Pharaoh on his throne, interpreting dreams with divine wisdom, golden palace, biblical cartoon style, regal colors, children book',
        narration: 'O Farao teve sonhos que ninguem entendia. Jose interpretou: virao 7 anos de fartura e 7 de fome. O Farao ficou impressionado.',
      },
      {
        title: 'Reencontro com os Irmaos',
        description: 'Jose perdoa seus irmaos',
        prompt: 'cartoon illustration of an Egyptian governor embracing his brothers with tears of joy, emotional reunion scene, golden palace, tears of happiness, biblical cartoon style, warm emotional colors, children book',
        narration: 'Jose se tornou governador do Egito! Quando seus irmaos vieram pedir comida, ele se revelou e os perdoou. O que voces planejaram para o mal, Deus transformou em bem!',
      },
    ],
  },
  {
    id: 'creation',
    title: 'A Criacao do Mundo',
    emoji: '🌍',
    category: 'Origens',
    book: 'Genesis 1-2',
    scenes: [
      {
        title: 'Luz!',
        description: 'Deus cria a luz',
        prompt: 'cartoon illustration of brilliant divine light exploding from darkness, creation of light, cosmic scene, beautiful rays spreading everywhere, biblical cartoon style, dramatic lighting, children book',
        narration: 'No principio Deus criou os ceus e a terra. A terra era sem forma e vazia. Deus disse: Haja luz! E houve luz.',
      },
      {
        title: 'Ceu e Mares',
        description: 'Deus separa as aguas e cria o ceu',
        prompt: 'cartoon illustration of beautiful blue sky forming above sparkling oceans, clouds separating from waters, majestic creation scene, biblical cartoon style, beautiful blues and whites, children book',
        narration: 'Deus separou as aguas e criou o ceu. Depois juntou as aguas e apareceu a terra seca. E viu que era bom!',
      },
      {
        title: 'Plantas e Estrelas',
        description: 'Deus cria a vegetacao e os astros',
        prompt: 'cartoon illustration of lush gardens with colorful flowers and trees growing, sun moon and stars appearing in the sky, paradise garden, biblical cartoon style, vibrant nature colors, children book',
        narration: 'Deus encheu a terra de plantas, flores e arvores. No ceu colocou o sol, a lua e as estrelas para iluminar.',
      },
      {
        title: 'Os Animais',
        description: 'Deus cria os animais',
        prompt: 'cartoon illustration of all kinds of cute animals appearing in a beautiful garden paradise, birds fish lions butterflies dolphins, joyful creation, biblical cartoon style, colorful and happy, children book',
        narration: 'Deus encheu o mar de peixes, o ceu de passaros e a terra de animais de todas as especies. E viu que era bom!',
      },
      {
        title: 'Adao e Eva',
        description: 'Deus cria o homem e a mulher',
        prompt: 'cartoon illustration of God creating the first man and woman in a beautiful paradise garden of Eden, divine light, peaceful animals around, biblical cartoon style, warm golden light, children book',
        narration: 'Deus criou o homem e a mulher a sua imagem. Os colocou no Jardim do Eden. E viu que tudo era muito bom!',
      },
    ],
  },
  {
    id: 'good-samaritan',
    title: 'O Bom Samaritano',
    emoji: '❤️',
    category: 'Amor',
    book: 'Lucas 10:25-37',
    scenes: [
      {
        title: 'Atacado na Estrada',
        description: 'Um homem e assaltado no caminho',
        prompt: 'cartoon illustration of a wounded traveler lying on a dusty road after being robbed, torn clothes, desert path between Jerusalem and Jericho, biblical cartoon style, children book illustration',
        narration: 'Um homem viajava de Jerusalem a Jerico quando foi assaltado. Os ladroes o deixaram ferido na estrada.',
      },
      {
        title: 'O Sacerdote Passa',
        description: 'Um sacerdote ve mas nao ajuda',
        prompt: 'cartoon illustration of a religious priest in robes walking past a wounded man on a road, looking away, ignoring the hurt person, biblical cartoon style, children book illustration',
        narration: 'Um sacerdote passou pelo caminho. Viu o homem ferido, mas passou pelo outro lado sem ajudar.',
      },
      {
        title: 'O Levita Tambem',
        description: 'Um levita tambem ignora',
        prompt: 'cartoon illustration of another religious man hurrying past a wounded person on a road, looking uncomfortable but not stopping, biblical cartoon style, children book illustration',
        narration: 'Um levita tambem passou por ali. Viu o homem, mas tambem seguiu em frente sem parar.',
      },
      {
        title: 'O Samaritano Ajuda',
        description: 'O samaritano cuida do ferido',
        prompt: 'cartoon illustration of a kind man on a donkey stopping to bandage wounds of an injured stranger on the road, gentle caring expression, warm golden light, biblical cartoon style, children book',
        narration: 'Mas um samaritano, ao ve-lo, sentiu compaixao. Tratou seus ferimentos, colocou-o em seu animal e o levou a uma hospedaria.',
      },
      {
        title: 'Ame o Proximo',
        description: 'Jesus ensina a amar o proximo',
        prompt: 'cartoon illustration of Jesus teaching a group of people outdoors, pointing to his heart, gentle loving expression, golden sunset background, disciples listening, biblical cartoon style, children book',
        narration: 'Jesus disse: Va e faca o mesmo. Ame seu proximo como a si mesmo, nao importa quem ele seja.',
      },
    ],
  },
];

// ─── Art Styles for Stories ──────────────────────────
const STORY_STYLES: { id: string; style: ImageStyle; name: string }[] = [
  { id: 'cartoon', style: IMAGE_STYLES[0], name: 'Cartoon' },       // cartoon-biblico
  { id: 'watercolor', style: IMAGE_STYLES[2], name: 'Aquarela' },   // aquarela-espiritual
  { id: 'digital', style: IMAGE_STYLES[3], name: 'Arte Digital' },  // arte-digital
];

const VOICE_OPTIONS: { id: VoiceOption; name: string; desc: string }[] = [
  { id: 'ana', name: 'Ana', desc: 'Feminina calma' },
  { id: 'carla', name: 'Carla', desc: 'Narradora' },
  { id: 'keren', name: 'Keren', desc: 'Doce e vibrante' },
  { id: 'borges', name: 'Borges', desc: 'Masculina calma' },
  { id: 'adriano', name: 'Adriano', desc: 'Narrador profundo' },
  { id: 'will', name: 'Will', desc: 'Masculina suave' },
];

// ─── Component ───────────────────────────────────────
export default function BibleStoriesScreen() {
  const router = useRouter();
  const { colors, state, recordCreate, canCreate } = useApp();

  // Story selection
  const [selectedStory, setSelectedStory] = useState<BibleStory | null>(null);
  const [selectedStyleId, setSelectedStyleId] = useState('cartoon');

  // Scenes state
  const [scenes, setScenes] = useState<StoryScene[]>([]);
  const [currentScene, setCurrentScene] = useState(0);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Audio
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceOption, setVoiceOption] = useState<VoiceOption>('carla');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const sceneOpacity = useRef(new Animated.Value(1)).current;
  const generatePulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    return () => { void stopSpeaking(); };
  }, []);

  // ─── Handlers ────────────────────────────────────────

  const selectStory = useCallback((story: BibleStory) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedStory(story);
    setScenes(story.scenes.map((s, i) => ({
      ...s,
      id: i + 1,
      aiImage: null,
      isGenerating: false,
    })));
    setCurrentScene(0);
  }, []);

  const goToScene = useCallback((index: number) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(sceneOpacity, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setCurrentScene(index);
      Animated.timing(sceneOpacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    });
  }, []);

  const generateSingleScene = useCallback(async (sceneIndex: number) => {
    const scene = scenes[sceneIndex];
    if (!scene || scene.aiImage) return;

    setScenes(prev => prev.map((s, i) => i === sceneIndex ? { ...s, isGenerating: true } : s));

    const selectedStyle = STORY_STYLES.find(s => s.id === selectedStyleId)?.style || IMAGE_STYLES[0];

    try {
      const result = await generateImage(scene.prompt, selectedStyle);
      if (result.success && result.imageBase64) {
        setScenes(prev => prev.map((s, i) =>
          i === sceneIndex ? { ...s, aiImage: result.imageBase64!, isGenerating: false } : s
        ));
        return true;
      } else {
        setScenes(prev => prev.map((s, i) =>
          i === sceneIndex ? { ...s, isGenerating: false } : s
        ));
        return false;
      }
    } catch {
      setScenes(prev => prev.map((s, i) =>
        i === sceneIndex ? { ...s, isGenerating: false } : s
      ));
      return false;
    }
  }, [scenes, selectedStyleId]);

  const generateAllScenes = useCallback(async () => {
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
    for (let i = 0; i < scenes.length; i++) {
      if (scenes[i].aiImage) {
        successCount++;
        setGenerationProgress((i + 1) / scenes.length);
        continue;
      }

      setCurrentScene(i);
      const success = await generateSingleScene(i);
      if (success) successCount++;
      setGenerationProgress((i + 1) / scenes.length);

      // Small delay between generations
      if (i < scenes.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    pulse.stop();
    generatePulse.setValue(1);
    setIsGeneratingAll(false);
    setCurrentScene(0);

    if (successCount > 0) {
      recordCreate();
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Pronto!', `${successCount} de ${scenes.length} cenas geradas com sucesso!`);
    } else {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erro', 'Nao foi possivel gerar as imagens. Tente novamente.');
    }
  }, [scenes, canCreate, generateSingleScene, recordCreate, router]);

  const handleNarrate = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isSpeaking) {
      await stopSpeaking();
      setIsSpeaking(false);
    } else {
      const scene = scenes[currentScene];
      if (!scene) return;
      setIsSpeaking(true);
      await speak(scene.narration, {
        voice: voiceOption,
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  }, [isSpeaking, scenes, currentScene, voiceOption]);

  const handleNarrateAll = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isSpeaking) {
      await stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    const fullText = scenes.map(s => s.narration).join('. ');
    setIsSpeaking(true);
    await speak(fullText, {
      voice: voiceOption,
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  }, [isSpeaking, scenes, voiceOption]);

  const handleShare = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!selectedStory) return;
    const storyText = scenes.map((s, i) => `[${i + 1}/${scenes.length}] ${s.title}\n${s.narration}`).join('\n\n');
    await shareContent(`📖 ${selectedStory.title}\n${selectedStory.book}\n\n${storyText}\n\nCriado com Devocio.IA`);
  }, [selectedStory, scenes]);

  const handleWhatsAppShare = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!selectedStory) return;
    const storyText = scenes.map((s, i) => `[${i + 1}/${scenes.length}] ${s.title}\n${s.narration}`).join('\n\n');
    await shareViaWhatsApp(`📖 ${selectedStory.title}\n${selectedStory.book}\n\n${storyText}\n\nCriado com Devocio.IA`);
  }, [selectedStory, scenes]);

  const resetStory = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedStory(null);
    setScenes([]);
    setCurrentScene(0);
    void stopSpeaking();
    setIsSpeaking(false);
  }, []);

  // ─── Render Scene Card ─────────────────────────────

  const renderSceneCard = (sceneIndex: number, size: 'full' | 'thumb' = 'full') => {
    const scene = scenes[sceneIndex];
    if (!scene) return null;
    const isFull = size === 'full';
    const containerStyle = isFull
      ? { width: SCREEN_WIDTH - 48, height: SCREEN_WIDTH - 48 }
      : { width: 90, height: 90 };

    return (
      <View style={[styles.sceneCard, containerStyle, { borderRadius: isFull ? 20 : 12, backgroundColor: '#1a1025' }]}>
        {scene.aiImage ? (
          <Image
            source={{ uri: `data:image/png;base64,${scene.aiImage}` }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={['#1a1025', '#2d1654', '#3b0764']}
            style={StyleSheet.absoluteFillObject}
          />
        )}

        {/* Dark overlay for text readability */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={[StyleSheet.absoluteFillObject, { top: '50%' }]}
        />

        {/* Scene counter */}
        <View style={styles.sceneCounter}>
          <View style={[styles.sceneCounterBadge, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
            <Text style={[styles.sceneCounterText, { fontSize: isFull ? 12 : 8 }]}>
              {sceneIndex + 1}/{scenes.length}
            </Text>
          </View>
        </View>

        {/* Generating indicator */}
        {scene.isGenerating && (
          <View style={styles.generatingOverlay}>
            <ActivityIndicator color="#A78BFA" size={isFull ? 'large' : 'small'} />
            {isFull && <Text style={styles.generatingText}>Gerando...</Text>}
          </View>
        )}

        {/* No image placeholder */}
        {!scene.aiImage && !scene.isGenerating && isFull && (
          <View style={styles.placeholderOverlay}>
            <ImageIcon size={40} color="#A78BFA" />
            <Text style={styles.placeholderText}>Gere a ilustracao</Text>
          </View>
        )}

        {/* Title overlay */}
        {isFull && scene.aiImage && (
          <View style={styles.sceneTitleOverlay}>
            <Text style={styles.sceneTitleText}>{scene.title}</Text>
            <Text style={styles.sceneDescText}>{scene.description}</Text>
          </View>
        )}

        {/* Watermark */}
        {isFull && (
          <View style={styles.sceneWatermark}>
            <Text style={styles.sceneWatermarkText}>Devocio.IA</Text>
          </View>
        )}
      </View>
    );
  };

  // ─── Story Selection View ──────────────────────────

  if (!selectedStory) {
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
              <Text style={[styles.headerTitle, { color: colors.text }]}>Historias Biblicas</Text>
              <View style={[styles.proBadge, { backgroundColor: '#C5943A' }]}>
                <BookOpen size={10} color="#fff" />
                <Text style={styles.proBadgeText}>IA</Text>
              </View>
            </View>
            <View style={{ width: 40 }} />
          </View>

          <Text style={[styles.sectionDesc, { color: colors.textMuted, textAlign: 'center', marginBottom: 20 }]}>
            Selecione uma historia e a IA gera ilustracoes cartoon em sequencia, como um carrossel do Instagram
          </Text>

          {/* Art Style */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Estilo de Arte</Text>
          <View style={styles.styleRow}>
            {STORY_STYLES.map(s => (
              <TouchableOpacity
                key={s.id}
                style={[
                  styles.styleBtn,
                  {
                    backgroundColor: selectedStyleId === s.id ? '#C5943A' : colors.card,
                    borderColor: selectedStyleId === s.id ? '#C5943A' : colors.borderLight,
                  },
                ]}
                onPress={() => {
                  setSelectedStyleId(s.id);
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text style={[styles.styleBtnEmoji]}>{s.style.emoji}</Text>
                <Text style={[styles.styleBtnText, { color: selectedStyleId === s.id ? '#fff' : colors.text }]}>
                  {s.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Story list */}
          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>Escolha uma Historia</Text>

          {BIBLE_STORIES.map(story => (
            <TouchableOpacity
              key={story.id}
              style={[styles.storyCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
              onPress={() => selectStory(story)}
              activeOpacity={0.7}
            >
              <Text style={styles.storyEmoji}>{story.emoji}</Text>
              <View style={styles.storyInfo}>
                <Text style={[styles.storyTitle, { color: colors.text }]}>{story.title}</Text>
                <Text style={[styles.storyMeta, { color: colors.textMuted }]}>
                  {story.book} • {story.scenes.length} cenas • {story.category}
                </Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </Animated.ScrollView>
      </SafeAreaView>
    );
  }

  // ─── Story Editor/Preview View ─────────────────────

  const generatedCount = scenes.filter(s => s.aiImage).length;
  const allGenerated = generatedCount === scenes.length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.card }]}
            onPress={resetStory}
          >
            <ArrowLeft size={20} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
              {selectedStory.emoji} {selectedStory.title}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.shareHeaderBtn, { backgroundColor: colors.card }]}
            onPress={handleShare}
          >
            <Share2 size={18} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Book reference */}
        <View style={[styles.bookRef, { backgroundColor: '#C5943A' + '15' }]}>
          <BookOpen size={14} color="#C5943A" />
          <Text style={[styles.bookRefText, { color: '#C5943A' }]}>{selectedStory.book}</Text>
          <Text style={[styles.bookRefCount, { color: colors.textMuted }]}>
            {generatedCount}/{scenes.length} cenas geradas
          </Text>
        </View>

        {/* Current scene preview */}
        <View style={styles.previewSection}>
          <Animated.View style={{ opacity: sceneOpacity }}>
            {renderSceneCard(currentScene, 'full')}
          </Animated.View>
        </View>

        {/* Scene navigation */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
            onPress={() => goToScene(Math.max(0, currentScene - 1))}
            disabled={currentScene === 0}
          >
            <ChevronLeft size={20} color={currentScene === 0 ? colors.textMuted : colors.text} />
          </TouchableOpacity>

          <View style={styles.sceneInfo}>
            <Text style={[styles.sceneInfoTitle, { color: colors.text }]}>
              {scenes[currentScene]?.title}
            </Text>
            <Text style={[styles.sceneInfoNum, { color: colors.textMuted }]}>
              Cena {currentScene + 1} de {scenes.length}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
            onPress={() => goToScene(Math.min(scenes.length - 1, currentScene + 1))}
            disabled={currentScene === scenes.length - 1}
          >
            <ChevronRight size={20} color={currentScene === scenes.length - 1 ? colors.textMuted : colors.text} />
          </TouchableOpacity>
        </View>

        {/* Narration text */}
        <View style={[styles.narrationBox, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <Text style={[styles.narrationText, { color: colors.text }]}>
            {scenes[currentScene]?.narration}
          </Text>
        </View>

        {/* Thumbnails */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbScroll}>
          {scenes.map((_, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.thumbWrap,
                { borderColor: currentScene === i ? '#C5943A' : 'transparent', borderWidth: 2 },
              ]}
              onPress={() => goToScene(i)}
            >
              {renderSceneCard(i, 'thumb')}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Generate button */}
        {!allGenerated && (
          <Animated.View style={{ transform: [{ scale: generatePulse }] }}>
            <TouchableOpacity
              style={[styles.generateBtn, { opacity: isGeneratingAll ? 0.7 : 1 }]}
              onPress={generateAllScenes}
              disabled={isGeneratingAll}
            >
              <LinearGradient colors={['#B8862D', '#C5943A', '#A78BFA']} style={styles.generateBtnGradient}>
                {isGeneratingAll ? (
                  <>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text style={styles.generateBtnText}>
                      Gerando cena {Math.ceil(generationProgress * scenes.length)}/{scenes.length}...
                    </Text>
                  </>
                ) : (
                  <>
                    <Wand2 size={20} color="#fff" />
                    <Text style={styles.generateBtnText}>
                      Gerar {scenes.length} Ilustracoes IA
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Progress bar */}
        {isGeneratingAll && (
          <View style={[styles.progressBarBg, { backgroundColor: colors.card }]}>
            <View style={[styles.progressBarFill, { width: `${generationProgress * 100}%` }]} />
          </View>
        )}

        {/* Audio controls */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>Narracao</Text>

        <View style={styles.audioRow}>
          <TouchableOpacity
            style={[
              styles.audioBtn,
              {
                backgroundColor: isSpeaking ? '#ef4444' + '15' : '#C5943A' + '15',
                borderColor: isSpeaking ? '#ef4444' : '#C5943A',
                flex: 1,
              },
            ]}
            onPress={handleNarrate}
          >
            {isSpeaking ? <VolumeX size={16} color="#ef4444" /> : <Volume2 size={16} color="#C5943A" />}
            <Text style={[styles.audioBtnText, { color: isSpeaking ? '#ef4444' : '#C5943A' }]}>
              {isSpeaking ? 'Parar' : 'Esta Cena'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.audioBtn,
              {
                backgroundColor: isSpeaking ? '#ef4444' + '15' : '#C5943A' + '15',
                borderColor: isSpeaking ? '#ef4444' : '#C5943A',
                flex: 1,
              },
            ]}
            onPress={handleNarrateAll}
          >
            {isSpeaking ? <VolumeX size={16} color="#ef4444" /> : <Volume2 size={16} color="#C5943A" />}
            <Text style={[styles.audioBtnText, { color: isSpeaking ? '#ef4444' : '#C5943A' }]}>
              {isSpeaking ? 'Parar' : 'Historia Toda'}
            </Text>
          </TouchableOpacity>
        </View>

        {isElevenLabsConfigured() && (
          <View style={[styles.elevenBadgeRow, { backgroundColor: '#C5943A' + '10' }]}>
            <Sparkles size={12} color="#C5943A" />
            <Text style={[styles.elevenBadgeText, { color: '#C5943A' }]}>ElevenLabs ativo</Text>
          </View>
        )}

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

        {/* Share */}
        <TouchableOpacity
          style={[styles.shareFullBtn, { backgroundColor: '#25D366' + '10', borderColor: '#25D366' + '30' }]}
          onPress={() => void handleWhatsAppShare()}
        >
          <Text style={{ fontSize: 16 }}>{'📱'}</Text>
          <Text style={[styles.shareFullBtnText, { color: '#25D366' }]}>WhatsApp</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.shareFullBtn, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
          onPress={handleShare}
        >
          <Share2 size={18} color="#C5943A" />
          <Text style={[styles.shareFullBtnText, { color: colors.text }]}>Enviar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 60 },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  headerTitle: { fontSize: 18, fontWeight: '800' as const },
  proBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  proBadgeText: { fontSize: 10, fontWeight: '800' as const, color: '#fff' },
  shareHeaderBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  // Section
  sectionTitle: { fontSize: 17, fontWeight: '700' as const, marginBottom: 8 },
  sectionDesc: { fontSize: 13, lineHeight: 20 },

  // Style selector
  styleRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  styleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  styleBtnEmoji: { fontSize: 18 },
  styleBtnText: { fontSize: 13, fontWeight: '600' as const },

  // Story cards
  storyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  storyEmoji: { fontSize: 32 },
  storyInfo: { flex: 1 },
  storyTitle: { fontSize: 16, fontWeight: '700' as const },
  storyMeta: { fontSize: 12, marginTop: 2 },

  // Book ref
  bookRef: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 16,
  },
  bookRefText: { fontSize: 13, fontWeight: '700' as const },
  bookRefCount: { fontSize: 12, marginLeft: 'auto' },

  // Preview
  previewSection: { alignItems: 'center', marginBottom: 16 },

  // Scene card
  sceneCard: { overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  sceneCounter: { position: 'absolute', top: 10, right: 10, zIndex: 2 },
  sceneCounterBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  sceneCounterText: { color: '#fff', fontWeight: '700' as const },
  generatingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 3,
  },
  generatingText: { color: '#A78BFA', fontSize: 14, fontWeight: '600' as const, marginTop: 8 },
  placeholderOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  placeholderText: { color: '#A78BFA', fontSize: 14, fontWeight: '500' as const },
  sceneTitleOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    zIndex: 2,
  },
  sceneTitleText: { color: '#fff', fontSize: 20, fontWeight: '800' as const },
  sceneDescText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 },
  sceneWatermark: { position: 'absolute', top: 10, left: 10, zIndex: 2 },
  sceneWatermarkText: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '600' as const },

  // Navigation
  navRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, marginBottom: 12 },
  navBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  sceneInfo: { alignItems: 'center', flex: 1 },
  sceneInfoTitle: { fontSize: 15, fontWeight: '700' as const },
  sceneInfoNum: { fontSize: 12, marginTop: 2 },

  // Narration box
  narrationBox: { padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 12 },
  narrationText: { fontSize: 14, lineHeight: 22, fontStyle: 'italic' },

  // Thumbnails
  thumbScroll: { marginBottom: 16 },
  thumbWrap: { marginRight: 8, borderRadius: 14, overflow: 'hidden' },

  // Generate button
  generateBtn: { marginBottom: 8, borderRadius: 14, overflow: 'hidden' },
  generateBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  generateBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' as const },

  // Progress bar
  progressBarBg: { height: 6, borderRadius: 3, marginBottom: 16, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#C5943A', borderRadius: 3 },

  // Audio
  audioRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  audioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  audioBtnText: { fontSize: 13, fontWeight: '600' as const },
  elevenBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 10,
  },
  elevenBadgeText: { fontSize: 11, fontWeight: '600' as const },

  // Voice
  voiceRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
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
  shareFullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  shareFullBtnText: { fontSize: 14, fontWeight: '600' as const },
});
