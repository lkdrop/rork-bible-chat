export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  requirement: number;
  type: 'prayers_completed' | 'streak' | 'chat_messages' | 'category_complete' | 'early_prayer' | 'favorites';
}

export const achievements: Achievement[] = [
  {
    id: 'first_prayer',
    title: 'Primeira Oração',
    description: 'Complete sua primeira oração',
    emoji: '🙏',
    requirement: 1,
    type: 'prayers_completed',
  },
  {
    id: 'fire_alive',
    title: 'Fogo Vivo',
    description: '7 dias consecutivos de oração',
    emoji: '🔥',
    requirement: 7,
    type: 'streak',
  },
  {
    id: 'prayer_warrior',
    title: 'Guerreiro de Oração',
    description: 'Complete 10 orações',
    emoji: '⚔️',
    requirement: 10,
    type: 'prayers_completed',
  },
  {
    id: 'intercessor',
    title: 'Intercessor',
    description: '30 dias consecutivos de oração',
    emoji: '👑',
    requirement: 30,
    type: 'streak',
  },
  {
    id: 'scholar',
    title: 'Estudioso',
    description: 'Use o chat bíblico 5 vezes',
    emoji: '📚',
    requirement: 5,
    type: 'chat_messages',
  },
  {
    id: 'devoted',
    title: 'Devoto',
    description: 'Complete todas as orações de uma categoria',
    emoji: '✨',
    requirement: 1,
    type: 'category_complete',
  },
  {
    id: 'early_riser',
    title: 'Madrugador',
    description: 'Ore entre 3h e 5h da manhã',
    emoji: '🌙',
    requirement: 1,
    type: 'early_prayer',
  },
  {
    id: 'open_heart',
    title: 'Coração Aberto',
    description: 'Favorite 5 orações',
    emoji: '❤️',
    requirement: 5,
    type: 'favorites',
  },
];
