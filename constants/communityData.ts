export interface CommunityPost {
  id: string;
  userName: string;
  avatar: string;
  type: 'testimony' | 'prayer' | 'question' | 'devotional' | 'verse';
  content: string;
  likes: number;
  comments: number;
  timeAgo: string;
  verse?: string;
  isLiked?: boolean;
  userLevel: number;
  userTitle: string;
  userXP: number;
}

export const communityAvatars = [
  '🙏', '✝️', '⛪', '🕊️', '💒', '📖', '🌅', '🔥', '💛', '🌿',
  '⭐', '🌸', '🕯️', '🎵', '💎', '🌈', '🌻', '🦋', '🌙', '☀️',
];

export const mockCommunityPosts: CommunityPost[] = [
  {
    id: 'c1',
    userName: 'Ana Clara',
    avatar: '🌸',
    type: 'testimony',
    content: 'Glória a Deus! Depois de 3 meses orando pela minha família, meu marido voltou para a igreja. Deus é fiel e nunca nos abandona! Não desistam de orar pelos seus.',
    likes: 47,
    comments: 12,
    timeAgo: '2h',
    userLevel: 8,
    userTitle: 'Sacerdote',
    userXP: 2100,
  },
  {
    id: 'c2',
    userName: 'Pastor Ricardo',
    avatar: '📖',
    type: 'devotional',
    content: 'Meditação da manhã: Quando o medo bater, lembre-se que o Deus que abriu o Mar Vermelho ainda está no controle. Ele não mudou. Confie!',
    likes: 89,
    comments: 23,
    timeAgo: '3h',
    verse: 'Isaías 41:10',
    userLevel: 12,
    userTitle: 'Embaixador de Cristo',
    userXP: 8500,
  },
  {
    id: 'c3',
    userName: 'Lucas Mendes',
    avatar: '🔥',
    type: 'prayer',
    content: 'Peço oração pela minha mãe que está internada. Os médicos não dão esperança, mas eu sei que o nosso Deus é maior que qualquer diagnóstico. Orem comigo, por favor! 🙏',
    likes: 156,
    comments: 45,
    timeAgo: '4h',
    userLevel: 5,
    userTitle: 'Servo',
    userXP: 620,
  },
  {
    id: 'c4',
    userName: 'Maria Eduarda',
    avatar: '🕊️',
    type: 'verse',
    content: '"Porque Deus tanto amou o mundo que deu o seu Filho Unigênito, para que todo o que nele crer não pereça, mas tenha a vida eterna."',
    likes: 234,
    comments: 18,
    timeAgo: '5h',
    verse: 'João 3:16',
    userLevel: 10,
    userTitle: 'Apóstolo',
    userXP: 4200,
  },
  {
    id: 'c5',
    userName: 'Pedro Santos',
    avatar: '⛪',
    type: 'question',
    content: 'Alguém pode me ajudar a entender Romanos 8:28? Como "todas as coisas cooperam para o bem" quando passamos por sofrimento? Quero aprofundar nesse tema.',
    likes: 32,
    comments: 28,
    timeAgo: '6h',
    userLevel: 3,
    userTitle: 'Raiz',
    userXP: 200,
  },
  {
    id: 'c6',
    userName: 'Gabriela Oliveira',
    avatar: '🌅',
    type: 'testimony',
    content: 'Testemunho: Consegui o emprego dos meus sonhos depois de 1 ano de espera! Continuei firme na fé e Deus abriu portas que ninguém poderia fechar. Jeremias 29:11 é real!',
    likes: 112,
    comments: 34,
    timeAgo: '8h',
    userLevel: 7,
    userTitle: 'Levita',
    userXP: 1450,
  },
  {
    id: 'c7',
    userName: 'Daniel Costa',
    avatar: '🌿',
    type: 'prayer',
    content: 'Estou passando por um momento difícil no casamento. Peço sabedoria e paciência para ambos. Que Deus restaure o que foi quebrado. Conto com as orações de vocês.',
    likes: 78,
    comments: 19,
    timeAgo: '10h',
    userLevel: 6,
    userTitle: 'Obreiro',
    userXP: 950,
  },
  {
    id: 'c8',
    userName: 'Priscila Souza',
    avatar: '🦋',
    type: 'devotional',
    content: 'Hoje completei 30 dias da Jornada de 90 Dias neste app! Minha vida de oração mudou completamente. Estou mais perto de Deus do que nunca. Recomendo para todos! 🔥',
    likes: 67,
    comments: 15,
    timeAgo: '12h',
    userLevel: 9,
    userTitle: 'Profeta',
    userXP: 3100,
  },
  {
    id: 'c9',
    userName: 'Marcos Almeida',
    avatar: '⭐',
    type: 'verse',
    content: '"O Senhor é o meu pastor, nada me faltará. Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas."',
    likes: 189,
    comments: 9,
    timeAgo: '14h',
    verse: 'Salmos 23:1-2',
    userLevel: 11,
    userTitle: 'Guerreiro da Fé',
    userXP: 5800,
  },
  {
    id: 'c10',
    userName: 'Juliana Lima',
    avatar: '💛',
    type: 'testimony',
    content: 'Fui curada de ansiedade severa! Depois de muita oração e tratamento, hoje vivo em paz. Deus usa todas as ferramentas para nos curar. Não tenham vergonha de buscar ajuda!',
    likes: 201,
    comments: 52,
    timeAgo: '1d',
    userLevel: 9,
    userTitle: 'Profeta',
    userXP: 2800,
  },
];

export const postTypeLabels: Record<CommunityPost['type'], string> = {
  testimony: 'Testemunho',
  prayer: 'Pedido de Oração',
  question: 'Pergunta',
  devotional: 'Devocional',
  verse: 'Versículo',
};

export const postTypeColors: Record<CommunityPost['type'], string> = {
  testimony: '#10B981',
  prayer: '#EC4899',
  question: '#3B82F6',
  devotional: '#F59E0B',
  verse: '#8B5CF6',
};
