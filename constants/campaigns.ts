// ═══════════════════════════════════════════
// CAMPANHAS SAZONAIS — Devocio
// ═══════════════════════════════════════════

export interface SeasonalCampaign {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  description: string;
  startMonth: number; // 1-12
  startDay: number;
  endMonth: number;
  endDay: number;
  gradientColors: [string, string, string];
  chatPrompt: string; // Prompt especial para o Gabriel
  dailyChallenge: string;
  verse: { text: string; reference: string };
}

export const SEASONAL_CAMPAIGNS: SeasonalCampaign[] = [
  {
    id: 'quaresma',
    title: 'Quaresma',
    subtitle: '40 dias de reflexao e renovacao',
    emoji: '✝️',
    description: 'Prepare seu coracao para a Pascoa com 40 dias de reflexao, oracao e jejum espiritual.',
    startMonth: 2,
    startDay: 14,
    endMonth: 3,
    endDay: 31,
    gradientColors: ['#6B4E0F', '#B8862D', '#8B6914'],
    chatPrompt: 'Estamos no periodo da Quaresma. Ajude o usuario a refletir sobre arrependimento, renovacao e preparacao para a Pascoa. Sugira praticas de jejum espiritual e oracao.',
    dailyChallenge: 'Escolha algo para abrir mao hoje como oferta a Deus',
    verse: {
      text: 'Rasguem o coracao, e nao as vestes. Voltem-se para o Senhor',
      reference: 'Joel 2:13',
    },
  },
  {
    id: 'pascoa',
    title: 'Semana da Pascoa',
    subtitle: 'Celebre a ressurreicao de Cristo',
    emoji: '🕊️',
    description: 'Reviva a paixao, morte e ressurreicao de Jesus nesta semana especial.',
    startMonth: 4,
    startDay: 1,
    endMonth: 4,
    endDay: 21,
    gradientColors: ['#1e3a5f', '#2563eb', '#3b82f6'],
    chatPrompt: 'Estamos celebrando a Pascoa. Ajude o usuario a meditar sobre o sacrificio de Cristo, a cruz e a esperanca da ressurreicao. Seja profundo e emocional.',
    dailyChallenge: 'Leia um capitulo dos evangelhos sobre a paixao de Cristo',
    verse: {
      text: 'Ele nao esta aqui; ressuscitou!',
      reference: 'Lucas 24:6',
    },
  },
  {
    id: 'pentecostes',
    title: 'Pentecostes',
    subtitle: 'O derramar do Espirito Santo',
    emoji: '🔥',
    description: 'Busque uma experiencia renovada com o Espirito Santo.',
    startMonth: 5,
    startDay: 15,
    endMonth: 6,
    endDay: 15,
    gradientColors: ['#7f1d1d', '#dc2626', '#ef4444'],
    chatPrompt: 'Estamos no periodo de Pentecostes. Ajude o usuario a entender e buscar os dons do Espirito Santo, vida no Espirito e poder para testemunhar.',
    dailyChallenge: 'Ore pedindo que o Espirito Santo renove sua vida',
    verse: {
      text: 'Receberao poder quando o Espirito Santo descer sobre voces',
      reference: 'Atos 1:8',
    },
  },
  {
    id: 'missoes',
    title: 'Mes de Missoes',
    subtitle: 'Alcancando as nacoes para Cristo',
    emoji: '🌍',
    description: 'Ore por missionarios e nações que ainda nao conhecem o evangelho.',
    startMonth: 7,
    startDay: 1,
    endMonth: 7,
    endDay: 31,
    gradientColors: ['#065f46', '#059669', '#10b981'],
    chatPrompt: 'Estamos no Mes de Missoes. Incentive o usuario a orar por missoes mundiais, aprender sobre povos nao alcancados e considerar seu papel no ide de Cristo.',
    dailyChallenge: 'Ore por um pais que voce nunca orou antes',
    verse: {
      text: 'Ide por todo o mundo e pregai o evangelho a toda criatura',
      reference: 'Marcos 16:15',
    },
  },
  {
    id: 'reforma',
    title: 'Mes da Reforma',
    subtitle: 'Sola Scriptura, Sola Fide',
    emoji: '📜',
    description: 'Celebre os principios da Reforma Protestante e aprofunde-se nas doutrinas da graca.',
    startMonth: 10,
    startDay: 1,
    endMonth: 10,
    endDay: 31,
    gradientColors: ['#78350f', '#b45309', '#d97706'],
    chatPrompt: 'Estamos no Mes da Reforma. Ajude o usuario a entender os 5 Solas, a historia da Reforma e como esses principios se aplicam hoje.',
    dailyChallenge: 'Estude um dos 5 Solas da Reforma',
    verse: {
      text: 'O justo vivera pela fe',
      reference: 'Romanos 1:17',
    },
  },
  {
    id: 'advento',
    title: 'Advento',
    subtitle: '4 semanas de expectativa e esperanca',
    emoji: '🕯️',
    description: 'Prepare-se para o Natal meditando sobre a vinda do Messias.',
    startMonth: 12,
    startDay: 1,
    endMonth: 12,
    endDay: 24,
    gradientColors: ['#1e1b4b', '#312e81', '#4338ca'],
    chatPrompt: 'Estamos no periodo do Advento. Guie o usuario atraves de reflexoes sobre esperanca, paz, alegria e amor enquanto nos preparamos para celebrar o nascimento de Cristo.',
    dailyChallenge: 'Medite sobre uma profecia messiânica do Antigo Testamento',
    verse: {
      text: 'Pois um menino nos nasceu, um filho nos foi dado',
      reference: 'Isaias 9:6',
    },
  },
  {
    id: 'natal',
    title: 'Natal',
    subtitle: 'O maior presente da humanidade',
    emoji: '⭐',
    description: 'Celebre o nascimento de Jesus Cristo, a luz do mundo.',
    startMonth: 12,
    startDay: 25,
    endMonth: 12,
    endDay: 31,
    gradientColors: ['#14532d', '#166534', '#15803d'],
    chatPrompt: 'Estamos celebrando o Natal! Ajude o usuario a meditar sobre a encarnacao, o significado do nascimento de Jesus e como viver o espirito natalino com proposito.',
    dailyChallenge: 'Leia Lucas 2 e reflita sobre a noite do nascimento de Jesus',
    verse: {
      text: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigenito',
      reference: 'Joao 3:16',
    },
  },
  {
    id: 'ano-novo',
    title: 'Ano Novo em Cristo',
    subtitle: 'Novo ano, nova graca',
    emoji: '🌅',
    description: 'Comece o ano renovando sua fe e estabelecendo metas espirituais.',
    startMonth: 1,
    startDay: 1,
    endMonth: 1,
    endDay: 15,
    gradientColors: ['#1e3a5f', '#1d4ed8', '#3b82f6'],
    chatPrompt: 'Estamos no inicio de um novo ano. Ajude o usuario a estabelecer metas espirituais, refletir sobre o ano que passou e firmar compromissos com Deus para o novo ano.',
    dailyChallenge: 'Escreva 3 metas espirituais para este ano',
    verse: {
      text: 'Eis que faco novas todas as coisas',
      reference: 'Apocalipse 21:5',
    },
  },
];

export function getActiveCampaign(): SeasonalCampaign | null {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  for (const campaign of SEASONAL_CAMPAIGNS) {
    const { startMonth, startDay, endMonth, endDay } = campaign;

    // Campanha que nao cruza virada de ano
    if (startMonth <= endMonth) {
      if (
        (month > startMonth || (month === startMonth && day >= startDay)) &&
        (month < endMonth || (month === endMonth && day <= endDay))
      ) {
        return campaign;
      }
    } else {
      // Campanha que cruza virada de ano (ex: dez → jan)
      if (
        (month > startMonth || (month === startMonth && day >= startDay)) ||
        (month < endMonth || (month === endMonth && day <= endDay))
      ) {
        return campaign;
      }
    }
  }

  return null;
}
