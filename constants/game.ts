export const GAME_CONFIG = {
  LANE_COUNT: 3,
  GAME_SPEED_INITIAL: 3,
  GAME_SPEED_INCREMENT: 0.08,
  SPEED_INCREASE_INTERVAL: 8000,
  SPAWN_INTERVAL_MIN: 800,
  SPAWN_INTERVAL_MAX: 1600,
  PLAYER_WIDTH: 44,
  PLAYER_HEIGHT: 60,
  ITEM_SIZE: 40,
  OBSTACLE_WIDTH: 50,
  OBSTACLE_HEIGHT: 60,
  COIN_SIZE: 28,
  SWIPE_THRESHOLD: 25,
  ROAD_LINE_HEIGHT: 40,
  ROAD_LINE_GAP: 30,
  ROAD_LINE_SPEED: 6,
  HORIZON_Y: 0.28,
  VANISH_X: 0.5,
  ROAD_TOP_WIDTH: 0.18,
  ROAD_BOTTOM_WIDTH: 0.92,
  MIN_SCALE: 0.25,
  MAX_SCALE: 1.0,
};

export const COIN_VALUES = {
  gold: 10,
  silver: 5,
  diamond: 25,
};

export const OBSTACLE_TYPES = [
  { id: 'barrier', color: '#e74c3c', height: 50, label: 'Barreira' },
  { id: 'rock', color: '#7f8c8d', height: 45, label: 'Pedra' },
  { id: 'fire', color: '#e67e22', height: 55, label: 'Fogo' },
];

export const POWERUP_TYPES = [
  { id: 'magnet', emoji: '🧲', duration: 5000, label: 'Ímã de Moedas' },
  { id: 'shield', emoji: '🛡️', duration: 5000, label: 'Escudo' },
  { id: 'x2', emoji: '✨', duration: 6000, label: 'Pontos x2' },
];

export const GAME_VERSES = [
  'Sl 23:1 - O Senhor é meu pastor',
  'Fp 4:13 - Tudo posso naquele que me fortalece',
  'Is 41:10 - Não temas, eu sou contigo',
  'Jr 29:11 - Planos de paz e não de mal',
  'Rm 8:28 - Todas as coisas cooperam para o bem',
  'Sl 91:1 - Habitará no esconderijo do Altíssimo',
  'Jo 3:16 - Deus amou o mundo de tal maneira',
  'Pv 3:5 - Confia no Senhor de todo o coração',
  'Sl 27:1 - O Senhor é minha luz e salvação',
  'Mt 6:33 - Buscai primeiro o Reino de Deus',
];

export const SCENERY_THEMES = [
  {
    id: 'city',
    name: 'Cidade',
    skyTop: '#0a0a1e',
    skyBottom: '#1a1a3e',
    road: '#2a2a35',
    roadEdge: '#f1c40f',
    ground: '#151525',
    buildingColors: ['#12122a', '#1a1a3e', '#0f1f3a', '#1e1e40', '#141430'],
    accent: '#3498db',
  },
  {
    id: 'desert',
    name: 'Deserto',
    skyTop: '#f4a460',
    skyBottom: '#e8c07a',
    road: '#8B7355',
    roadEdge: '#D4A06A',
    ground: '#C4A060',
    buildingColors: ['#B8860B', '#CD853F', '#A0722A', '#D2B48C', '#C19A3E'],
    accent: '#e67e22',
  },
  {
    id: 'night',
    name: 'Noturno',
    skyTop: '#050510',
    skyBottom: '#0d0d2a',
    road: '#1a1a28',
    roadEdge: '#4a4a6a',
    ground: '#0a0a18',
    buildingColors: ['#08081a', '#0e0e22', '#0a0a1e', '#121228', '#0c0c20'],
    accent: '#9b59b6',
  },
];

export interface GameItem {
  id: string;
  type: 'verse' | 'heart' | 'dove' | 'obstacle_dark' | 'obstacle_doubt';
  lane: number;
  y: number;
  collected: boolean;
}

export interface GamePower {
  id: string;
  name: string;
  emoji: string;
  description: string;
  duration: number;
}

export const COLLECTIBLES = [
  { type: 'verse' as const, emoji: '📖', points: 10, label: 'Versículo' },
  { type: 'heart' as const, emoji: '❤️', points: 5, label: 'Coração' },
  { type: 'dove' as const, emoji: '🕊️', points: 20, label: 'Pomba' },
];

export const OBSTACLES = [
  { type: 'obstacle_dark' as const, emoji: '👿', label: 'Tentação' },
  { type: 'obstacle_doubt' as const, emoji: '🌫️', label: 'Dúvida' },
];

export const POWERS: GamePower[] = [
  {
    id: 'shield',
    name: 'Escudo da Fé',
    emoji: '🛡️',
    description: 'Invencibilidade por 5 segundos',
    duration: 5000,
  },
  {
    id: 'wings',
    name: 'Asas do Espírito',
    emoji: '🪽',
    description: 'Coleta automática por 4 segundos',
    duration: 4000,
  },
];
