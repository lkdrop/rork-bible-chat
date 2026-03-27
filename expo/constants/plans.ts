// ═══════════════════════════════════════════
// PLANOS FREEMIUM — Devocio.IA
// ═══════════════════════════════════════════
// Definicao centralizada de tiers, limites e custos
// ═══════════════════════════════════════════

export type PlanId = 'free' | 'grao_mostarda' | 'semente' | 'oferta' | 'colheita';

export interface PlanLimits {
  dailyMessages: number;
  dailyCreates: number;
  dailyProphetic: number;
  dailyImages: number;
  dailyTTS: number;
  monthlyMessages: number;
  monthlyImages: number;
  monthlyTTSChars: number;
  journeyFullAccess: boolean;
  vigiliaFullAccess: boolean;
  calendarAccess: boolean;
  hashtagsAccess: boolean;
  bioAccess: boolean;
  exclusiveStyles: boolean;
}

export interface PlanDefinition {
  id: PlanId;
  name: string;
  emoji: string;
  price: string;
  priceValue: number; // centavos
  period: string;
  tagline: string;
  highlight: boolean;
  features: string[];
  limits: PlanLimits;
}

// Limites por plano
export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: {
    dailyMessages: 5,
    dailyCreates: 2,
    dailyProphetic: 1,
    dailyImages: 0,
    dailyTTS: 2,
    monthlyMessages: 150,
    monthlyImages: 0,
    monthlyTTSChars: 10000,
    journeyFullAccess: false,
    vigiliaFullAccess: false,
    calendarAccess: false,
    hashtagsAccess: false,
    bioAccess: false,
    exclusiveStyles: false,
  },
  grao_mostarda: {
    dailyMessages: 15,
    dailyCreates: 5,
    dailyProphetic: 2,
    dailyImages: 1,
    dailyTTS: 5,
    monthlyMessages: 450,
    monthlyImages: 20,
    monthlyTTSChars: 50000,
    journeyFullAccess: true,
    vigiliaFullAccess: false,
    calendarAccess: false,
    hashtagsAccess: false,
    bioAccess: false,
    exclusiveStyles: false,
  },
  semente: {
    dailyMessages: 30,
    dailyCreates: 10,
    dailyProphetic: 3,
    dailyImages: 3,
    dailyTTS: 10,
    monthlyMessages: 900,
    monthlyImages: 60,
    monthlyTTSChars: 150000,
    journeyFullAccess: true,
    vigiliaFullAccess: true,
    calendarAccess: true,
    hashtagsAccess: true,
    bioAccess: true,
    exclusiveStyles: false,
  },
  oferta: {
    dailyMessages: Infinity,
    dailyCreates: Infinity,
    dailyProphetic: Infinity,
    dailyImages: 10,
    dailyTTS: Infinity,
    monthlyMessages: 5000,
    monthlyImages: 200,
    monthlyTTSChars: 500000,
    journeyFullAccess: true,
    vigiliaFullAccess: true,
    calendarAccess: true,
    hashtagsAccess: true,
    bioAccess: true,
    exclusiveStyles: true,
  },
  colheita: {
    dailyMessages: Infinity,
    dailyCreates: Infinity,
    dailyProphetic: Infinity,
    dailyImages: Infinity,
    dailyTTS: Infinity,
    monthlyMessages: Infinity,
    monthlyImages: Infinity,
    monthlyTTSChars: Infinity,
    journeyFullAccess: true,
    vigiliaFullAccess: true,
    calendarAccess: true,
    hashtagsAccess: true,
    bioAccess: true,
    exclusiveStyles: true,
  },
};

// Definicoes dos planos para paywall
export const PLANS: PlanDefinition[] = [
  {
    id: 'grao_mostarda',
    name: 'Grao de Mostarda',
    emoji: '🌿',
    price: 'R$4,90',
    priceValue: 490,
    period: '/semana',
    tagline: 'A menor semente que vira grande arvore',
    highlight: false,
    features: [
      'Chat com Gabriel — 15 msgs/dia',
      'Todos os planos de estudo',
      'Audio com voz IA (ElevenLabs)',
      'Jornada 7 dias completa',
    ],
    limits: PLAN_LIMITS.grao_mostarda,
  },
  {
    id: 'semente',
    name: 'Semente',
    emoji: '🌱',
    price: 'R$9,90',
    priceValue: 990,
    period: '/mes',
    tagline: 'Tudo que voce precisa para crescer',
    highlight: false,
    features: [
      'Chat com Gabriel — 30 msgs/dia',
      'Geracao de conteudo ilimitada',
      'Gerador de imagens IA — 3/dia',
      'Audio com voz IA (ElevenLabs)',
      'Vigilia IA 21 dias completa',
      'Jornada 28 dias completa',
      'Palavra Profetica — 3/dia',
      'Calendario de conteudo 30 dias',
      'Gerador de hashtags e bio',
      'Todos os planos de estudo',
    ],
    limits: PLAN_LIMITS.semente,
  },
  {
    id: 'colheita',
    name: 'Colheita',
    emoji: '🌾',
    price: 'R$79,90',
    priceValue: 7990,
    period: '/ano',
    tagline: 'Quem semeia com generosidade, colhe em abundancia',
    highlight: true,
    features: [
      'TUDO ilimitado — sem limites',
      'Chat com Gabriel ilimitado',
      'Todos os estilos exclusivos',
      'Gerador de imagens IA ilimitado',
      'Audio ilimitado',
      'Suporte prioritario',
      'Equivale a R$6,66/mes — Economize 44%',
    ],
    limits: PLAN_LIMITS.colheita,
  },
  {
    id: 'oferta',
    name: 'Oferta',
    emoji: '👑',
    price: 'R$29,90',
    priceValue: 2990,
    period: '/mes',
    tagline: 'Para quem quer semear em abundancia',
    highlight: false,
    features: [
      'Tudo do plano Semente',
      'Chat com Gabriel ilimitado',
      'Gerador de imagens IA — 10/dia',
      'Audio ilimitado',
      'Estilos exclusivos de cards',
      'Suporte prioritario',
      'Novidades em primeira mao',
    ],
    limits: PLAN_LIMITS.oferta,
  },
];

// Helper para pegar limites do plano
export function getPlanLimits(plan: PlanId): PlanLimits {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}

// Helper para pegar nome do plano
export function getPlanName(plan: PlanId): string {
  if (plan === 'free') return 'Gratuito';
  const planDef = PLANS.find(p => p.id === plan);
  return planDef?.name ?? 'Gratuito';
}

// Admin emails — acesso total sem limites
export const ADMIN_EMAILS: string[] = [
  'johnlk158776@gmail.com',
];

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}
