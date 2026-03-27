// Supabase Storage — projeto de videos
const STORAGE_URL = 'https://rkwaxdnmqgmytaxoqwbt.supabase.co';
const BUCKET = 'Videos historias da biblia';

function publicUrl(fileName: string): string {
  return `${STORAGE_URL}/storage/v1/object/public/${encodeURIComponent(BUCKET)}/${encodeURIComponent(fileName)}`;
}

export interface BibleVideo {
  id: string;
  title: string;
  description: string;
  fileName: string;
  url: string;
  duration: string;
  emoji: string;
  category: 'historia' | 'reflexao' | 'louvor' | 'ensinamento';
}

// ================================================
// LISTA DE VIDEOS — Adicione novos videos aqui!
// Bucket: "Videos historias da biblia"
// Projeto: rkwaxdnmqgmytaxoqwbt
// ================================================
export const BIBLE_VIDEOS: BibleVideo[] = [
  {
    id: 'vid_1',
    title: 'A Historia de Gideao',
    description: 'A incrivel historia de Gideao e como Deus usou um pequeno exercito para vencer.',
    fileName: 'gideao (1).mp4',
    url: publicUrl('gideao (1).mp4'),
    duration: '2:00',
    emoji: '⚔️',
    category: 'historia',
  },
  {
    id: 'vid_2',
    title: 'Historia de Oseias',
    description: 'O amor incondicional de Deus revelado na historia do profeta Oseias.',
    fileName: 'historia de oseias (1).mp4',
    url: publicUrl('historia de oseias (1).mp4'),
    duration: '2:00',
    emoji: '❤️',
    category: 'historia',
  },
  {
    id: 'vid_3',
    title: 'Juizes Capitulo 19',
    description: 'Uma das historias mais impactantes do livro de Juizes.',
    fileName: 'Juizes capitulo 19.mp4',
    url: publicUrl('Juizes capitulo 19.mp4'),
    duration: '2:00',
    emoji: '📖',
    category: 'historia',
  },
  {
    id: 'vid_4',
    title: 'Primeiro Homem Cheio do Espirito Santo',
    description: 'Descubra quem foi o primeiro homem a ser cheio do Espirito Santo na Biblia.',
    fileName: 'Primeiro homem a ser cheio do espirito santo.mp4',
    url: publicUrl('Primeiro homem a ser cheio do espirito santo.mp4'),
    duration: '2:00',
    emoji: '🔥',
    category: 'ensinamento',
  },
];

export const videoCategoryLabels: Record<string, string> = {
  historia: 'Histórias',
  reflexao: 'Reflexões',
  louvor: 'Louvor',
  ensinamento: 'Ensinamentos',
};

export const videoCategoryEmojis: Record<string, string> = {
  historia: '📖',
  reflexao: '💭',
  louvor: '🎵',
  ensinamento: '📚',
};
