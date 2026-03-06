export interface QuizQuestion {
  id: string;
  text: string;
  subtext: string;
  options: QuizOption[];
  category: 'pain' | 'desire' | 'commitment' | 'spiritual_level';
}

export interface QuizOption {
  id: string;
  text: string;
  emoji: string;
  weight: number;
  tags: string[];
}

export interface JourneyDay {
  day: number;
  week: number;
  title: string;
  theme: string;
  morningPrayer: string;
  bibleReading: string;
  bibleReference: string;
  reflection: string;
  practicalAction: string;
  propheticDeclaration: string;
}

export interface JourneyProfile {
  primaryPain: string;
  desiredOutcome: string;
  spiritualLevel: string;
  commitmentLevel: string;
  tags: string[];
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'pain_1',
    text: 'Qual a maior batalha que você enfrenta HOJE?',
    subtext: 'Seja honesto(a). Deus conhece seu coração.',
    category: 'pain',
    options: [
      { id: 'anxiety', text: 'Ansiedade e medo do futuro', emoji: '😰', weight: 3, tags: ['ansiedade', 'medo', 'futuro'] },
      { id: 'distance', text: 'Me sinto distante de Deus', emoji: '😔', weight: 3, tags: ['distancia', 'frieza', 'vazio'] },
      { id: 'financial', text: 'Problemas financeiros me sufocam', emoji: '💸', weight: 3, tags: ['financeiro', 'provisao', 'escassez'] },
      { id: 'relationship', text: 'Relacionamentos estão me destruindo', emoji: '💔', weight: 3, tags: ['relacionamento', 'solidao', 'rejeicao'] },
      { id: 'purpose', text: 'Não sei qual meu propósito', emoji: '🤷', weight: 3, tags: ['proposito', 'direcao', 'confusao'] },
    ],
  },
  {
    id: 'pain_2',
    text: 'O que mais te rouba a paz durante a madrugada?',
    subtext: 'Aquilo que te mantém acordado(a) de noite...',
    category: 'pain',
    options: [
      { id: 'worry', text: 'Preocupação com família e filhos', emoji: '👨‍👩‍👧', weight: 2, tags: ['familia', 'filhos', 'preocupacao'] },
      { id: 'health', text: 'Medo de doenças e morte', emoji: '🏥', weight: 2, tags: ['saude', 'doenca', 'medo'] },
      { id: 'guilt', text: 'Culpa por erros do passado', emoji: '⛓️', weight: 2, tags: ['culpa', 'passado', 'perdao'] },
      { id: 'loneliness', text: 'Solidão profunda', emoji: '🌑', weight: 2, tags: ['solidao', 'abandono', 'vazio'] },
      { id: 'spiritual_attack', text: 'Sinto ataques espirituais', emoji: '⚔️', weight: 2, tags: ['ataque', 'guerra', 'libertacao'] },
    ],
  },
  {
    id: 'desire_1',
    text: 'O que você MAIS deseja alcançar nos próximos 90 dias?',
    subtext: 'Imagine sua vida transformada...',
    category: 'desire',
    options: [
      { id: 'intimacy', text: 'Intimidade real com Deus', emoji: '🔥', weight: 3, tags: ['intimidade', 'presenca', 'oracao'] },
      { id: 'breakthrough', text: 'Uma grande virada na minha vida', emoji: '🚀', weight: 3, tags: ['virada', 'milagre', 'breakthrough'] },
      { id: 'healing', text: 'Cura emocional e interior', emoji: '💚', weight: 3, tags: ['cura', 'restauracao', 'emocional'] },
      { id: 'discipline', text: 'Disciplina espiritual diária', emoji: '📖', weight: 3, tags: ['disciplina', 'constancia', 'habito'] },
      { id: 'family_restoration', text: 'Restauração da minha família', emoji: '🏠', weight: 3, tags: ['familia', 'restauracao', 'unidade'] },
    ],
  },
  {
    id: 'desire_2',
    text: 'Se Deus te fizesse UMA promessa agora, qual seria?',
    subtext: 'Declare em fé o que crê...',
    category: 'desire',
    options: [
      { id: 'provision', text: '"Eu suprirei TODAS as tuas necessidades"', emoji: '✨', weight: 2, tags: ['provisao', 'suprimento', 'financeiro'] },
      { id: 'peace', text: '"Minha paz te darei, não como o mundo dá"', emoji: '🕊️', weight: 2, tags: ['paz', 'descanso', 'ansiedade'] },
      { id: 'direction', text: '"Eu te guiarei por caminhos que não conheces"', emoji: '🗺️', weight: 2, tags: ['direcao', 'proposito', 'futuro'] },
      { id: 'strength', text: '"Na tua fraqueza, meu poder se aperfeiçoa"', emoji: '💪', weight: 2, tags: ['forca', 'poder', 'superacao'] },
      { id: 'love', text: '"Eu te amei com amor eterno"', emoji: '❤️', weight: 2, tags: ['amor', 'aceitacao', 'identidade'] },
    ],
  },
  {
    id: 'spiritual_1',
    text: 'Como está sua vida de oração HOJE?',
    subtext: 'Sem julgamento. Só verdade.',
    category: 'spiritual_level',
    options: [
      { id: 'none', text: 'Quase não oro mais', emoji: '😞', weight: 1, tags: ['iniciante', 'frieza'] },
      { id: 'occasional', text: 'Oro de vez em quando', emoji: '🙏', weight: 2, tags: ['ocasional', 'irregular'] },
      { id: 'daily', text: 'Oro todo dia, mas é rápido', emoji: '⏱️', weight: 3, tags: ['diario', 'superficial'] },
      { id: 'deep', text: 'Tenho horário fixo de oração', emoji: '🔥', weight: 4, tags: ['disciplinado', 'constante'] },
    ],
  },
  {
    id: 'commitment_1',
    text: 'Você está disposto(a) a acordar mais cedo por 90 dias?',
    subtext: 'A madrugada é o altar dos que vencem.',
    category: 'commitment',
    options: [
      { id: 'yes_5am', text: 'Sim! Às 5h da manhã', emoji: '🌅', weight: 5, tags: ['comprometido', 'madrugada'] },
      { id: 'yes_6am', text: 'Sim, às 6h consigo', emoji: '☀️', weight: 4, tags: ['comprometido', 'manha'] },
      { id: 'maybe', text: 'Vou tentar, mas não prometo', emoji: '🤔', weight: 2, tags: ['inseguro', 'tentativa'] },
      { id: 'flexible', text: 'Prefiro horário flexível', emoji: '🕐', weight: 3, tags: ['flexivel', 'adaptavel'] },
    ],
  },
];

export const journeyWeeks: { week: number; title: string; theme: string; emoji: string }[] = [
  { week: 1, title: 'Quebrando o Gelo com Deus', theme: 'Reconexão e Arrependimento', emoji: '🔓' },
  { week: 2, title: 'O Altar da Madrugada', theme: 'Oração Profética', emoji: '🔥' },
  { week: 3, title: 'A Palavra que Transforma', theme: 'Imersão nas Escrituras', emoji: '📖' },
  { week: 4, title: 'Guerra Espiritual', theme: 'Autoridade e Libertação', emoji: '⚔️' },
  { week: 5, title: 'Cura Interior', theme: 'Restauração Emocional', emoji: '💚' },
  { week: 6, title: 'Jejum e Consagração', theme: 'Quebra de Fortalezas', emoji: '🏔️' },
  { week: 7, title: 'Fé que Move Montanhas', theme: 'Declarações Proféticas', emoji: '🗻' },
  { week: 8, title: 'Propósito e Chamado', theme: 'Identidade em Cristo', emoji: '👑' },
  { week: 9, title: 'Frutos do Espírito', theme: 'Caráter Cristão', emoji: '🍇' },
  { week: 10, title: 'Avivamento Pessoal', theme: 'Fogo que Não se Apaga', emoji: '🔥' },
  { week: 11, title: 'Relacionamentos Restaurados', theme: 'Amor e Perdão', emoji: '🤝' },
  { week: 12, title: 'O Novo Eu', theme: 'Vida Transformada', emoji: '🦅' },
  { week: 13, title: 'Legado Eterno', theme: 'Impacto e Missão', emoji: '🌍' },
];

export function generateJourneyDays(): JourneyDay[] {
  const days: JourneyDay[] = [];

  const dailyContent: Array<{
    title: string;
    theme: string;
    morningPrayer: string;
    bibleReading: string;
    bibleReference: string;
    reflection: string;
    practicalAction: string;
    propheticDeclaration: string;
  }> = [
    {
      title: 'O Primeiro Passo',
      theme: 'Decisão de Mudança',
      morningPrayer: 'Pai, hoje eu decido me aproximar de Ti. Não importa quanto tempo fiquei longe, hoje eu volto. Quebra todo orgulho, toda resistência. Me recebe como o pai recebeu o filho pródigo. Em nome de Jesus, eu declaro: este é o primeiro dia da minha transformação. Amém.',
      bibleReading: 'Leia Lucas 15:11-24 — A parábola do filho pródigo',
      bibleReference: 'Lucas 15:20',
      reflection: 'O pai não esperou o filho chegar. Ele CORREU ao encontro dele. Deus está correndo em sua direção agora mesmo. Você não precisa ser perfeito(a) para voltar. Basta dar o primeiro passo.',
      practicalAction: 'Escreva em um papel: "Hoje eu decido me aproximar de Deus". Cole no espelho do banheiro.',
      propheticDeclaration: 'EU DECLARO que a partir de HOJE minha vida espiritual nunca mais será a mesma. O céu está aberto sobre mim e Deus está preparando algo que meus olhos ainda não viram.',
    },
    {
      title: 'Limpando o Terreno',
      theme: 'Arrependimento Profundo',
      morningPrayer: 'Senhor, examina meu coração. Mostra aquilo que tenho escondido, os pecados que justifiquei, as áreas que não entreguei. Eu me arrependo de todo coração. Lava-me, purifica-me, faz-me novo(a). Teu sangue me limpa de TODO pecado. Amém.',
      bibleReading: 'Leia Salmo 51:1-17 — A oração de arrependimento de Davi',
      bibleReference: 'Salmo 51:10',
      reflection: 'Davi era "homem segundo o coração de Deus" não porque era perfeito, mas porque sabia se arrepender profundamente. Arrependimento não é vergonha — é liberdade.',
      practicalAction: 'Reserve 10 minutos em silêncio. Peça a Deus que mostre áreas que precisam de arrependimento. Anote e entregue a Ele.',
      propheticDeclaration: 'EU DECLARO que sou lavado(a) pelo sangue de Jesus. Meu passado não me define. Sou uma nova criatura, as coisas velhas já passaram!',
    },
    {
      title: 'A Voz que Acalma',
      theme: 'Ouvindo a Deus',
      morningPrayer: 'Espírito Santo, ensina-me a ouvir Tua voz. Em meio ao barulho do mundo, eu quero discernir Tua direção. Abre meus ouvidos espirituais. Fala, Senhor, que Teu servo(a) ouve. Amém.',
      bibleReading: 'Leia 1 Reis 19:9-13 — Deus fala em voz mansa e suave',
      bibleReference: '1 Reis 19:12',
      reflection: 'Deus não estava no terremoto, nem no fogo, nem no vento forte. Ele estava na voz mansa e suave. Às vezes precisamos silenciar para ouvir o que Ele quer nos dizer.',
      practicalAction: 'Fique 5 minutos em completo silêncio após a oração. Apenas ouça. Anote qualquer impressão que vier ao coração.',
      propheticDeclaration: 'EU DECLARO que meus ouvidos estão abertos para a voz de Deus. Eu não sigo a voz de estranhos. Reconheço meu Pastor e Ele me guia.',
    },
    {
      title: 'Quebrando Correntes',
      theme: 'Libertação',
      morningPrayer: 'Em nome de Jesus, eu quebro toda corrente que me prende. Todo vício, todo ciclo de derrota, toda fortaleza mental. O que o Filho libertou é verdadeiramente livre! Eu sou livre! Todo jugo é destruído pela unção. Amém!',
      bibleReading: 'Leia João 8:31-36 — A verdade vos libertará',
      bibleReference: 'João 8:36',
      reflection: 'Jesus não veio te dar uma vida religiosa. Ele veio te dar LIBERDADE. Liberdade do pecado, do medo, da culpa. Se você está preso(a) em algum ciclo, hoje é o dia da sua libertação.',
      practicalAction: 'Identifique UMA área de escravidão na sua vida (vício, pensamento, hábito). Declare em voz alta: "Em nome de Jesus, eu sou livre disso!"',
      propheticDeclaration: 'EU DECLARO liberdade sobre minha vida! Nenhuma arma forjada contra mim prosperará. As correntes estão QUEBRADAS em nome de Jesus!',
    },
    {
      title: 'O Poder da Gratidão',
      theme: 'Adoração e Gratidão',
      morningPrayer: 'Deus, antes de pedir qualquer coisa, eu Te agradeço. Pelo ar que respiro, pela vida, por Teu amor incondicional. Tu és digno de TODA honra. Minha boca vai Te louvar em qualquer circunstância. Amém.',
      bibleReading: 'Leia Salmo 100 — Entrai na presença com louvor',
      bibleReference: 'Salmo 100:4',
      reflection: 'A gratidão é a porta de entrada da presença de Deus. Quando agradecemos, mudamos nosso foco dos problemas para o Provedor. A adoração nos posiciona para receber.',
      practicalAction: 'Escreva 10 coisas pelas quais você é grato(a) HOJE. Coisas simples. Leia em voz alta como oração.',
      propheticDeclaration: 'EU DECLARO que sou uma pessoa grata. Minha vida é abundante! Mesmo no vale, eu louvarei ao Senhor porque Ele é bom e Sua misericórdia dura para sempre!',
    },
    {
      title: 'A Armadura de Deus',
      theme: 'Proteção Espiritual',
      morningPrayer: 'Senhor, eu visto a armadura completa. O capacete da salvação protege minha mente. A couraça da justiça guarda meu coração. O escudo da fé apaga os dardos inflamados. A espada do Espírito é Tua Palavra na minha boca. Estou pronto(a) para a batalha! Amém.',
      bibleReading: 'Leia Efésios 6:10-18 — A armadura de Deus',
      bibleReference: 'Efésios 6:13',
      reflection: 'Não estamos lutando contra carne e sangue. A batalha é espiritual. Por isso precisamos de armas espirituais. Vista sua armadura TODOS os dias antes de sair de casa.',
      practicalAction: 'Declare cada peça da armadura de Deus sobre você ao se vestir pela manhã. Transforme isso em um ritual diário.',
      propheticDeclaration: 'EU DECLARO que estou revestido(a) do poder do Alto. Nenhum ataque do inimigo me alcançará porque o Senhor é minha fortaleza e meu escudo!',
    },
    {
      title: 'Renovação da Mente',
      theme: 'Transformação de Pensamentos',
      morningPrayer: 'Pai, transforma minha mente. Destrói todo pensamento de derrota, de incapacidade, de medo. Renova meu entendimento. Que eu pense como Tu pensas, veja como Tu vês, ame como Tu amas. Amém.',
      bibleReading: 'Leia Romanos 12:1-2 — Sede transformados pela renovação da mente',
      bibleReference: 'Romanos 12:2',
      reflection: 'A batalha se ganha ou se perde na MENTE. Se o inimigo controla seus pensamentos, controla sua vida. Mas quando a Palavra de Deus governa sua mente, você se torna inabalável.',
      practicalAction: 'Identifique 3 pensamentos negativos recorrentes. Para cada um, encontre um versículo que o contradiz. Memorize.',
      propheticDeclaration: 'EU DECLARO que minha mente está sendo renovada pela Palavra de Deus. Eu tenho a mente de Cristo! Pensamentos de derrota NÃO têm lugar em mim!',
    },
    {
      title: 'Jejum que Rompe',
      theme: 'Consagração',
      morningPrayer: 'Senhor, hoje eu me consagro diante de Ti. Este jejum não é para impressionar ninguém — é um grito da minha alma por mais de Ti. Que minha fome física me lembre da minha fome espiritual. Amém.',
      bibleReading: 'Leia Isaías 58:6-12 — O jejum que Deus escolheu',
      bibleReference: 'Isaías 58:6',
      reflection: 'O jejum não muda Deus — muda VOCÊ. Quando você nega a carne, fortalece o espírito. É na consagração que muralhas caem e portas se abrem.',
      practicalAction: 'Faça um jejum hoje (pode ser de alimento, redes sociais ou entretenimento). Use o tempo para orar e ler a Palavra.',
      propheticDeclaration: 'EU DECLARO que minha consagração está abrindo portas no mundo espiritual. Todo jugo está sendo destruído pela unção que flui da minha vida de oração!',
    },
    {
      title: 'Fé Inabalável',
      theme: 'Confiança em Deus',
      morningPrayer: 'Deus, eu escolho crer mesmo quando não vejo. Minha fé não depende das circunstâncias. Tu és fiel quando tudo parece impossível. Eu confio no Teu tempo, no Teu plano, na Tua bondade. Amém.',
      bibleReading: 'Leia Hebreus 11:1-6 — Os heróis da fé',
      bibleReference: 'Hebreus 11:1',
      reflection: 'Fé não é ausência de dúvida — é a decisão de confiar mesmo na incerteza. Abraão saiu sem saber para onde ia. Sua fé era maior que seu GPS.',
      practicalAction: 'Escreva UMA situação impossível da sua vida. Abaixo, escreva: "Deus é capaz de fazer infinitamente mais". Ore sobre isso.',
      propheticDeclaration: 'EU DECLARO que a minha fé move montanhas! O que parece impossível para o homem é possível para o meu Deus! Eu CREIO e verei a glória do Senhor!',
    },
    {
      title: 'O Deus que Cura',
      theme: 'Cura e Restauração',
      morningPrayer: 'Senhor, Jeová Rapha, Deus que cura. Eu trago diante de Ti toda ferida, toda dor, toda marca do passado. Toca as áreas quebradas. Cura meu coração, minha mente, meu corpo. Pelas Tuas chagas eu sou curado(a). Amém.',
      bibleReading: 'Leia Isaías 53:3-5 — Pelas suas pisaduras fomos sarados',
      bibleReference: 'Isaías 53:5',
      reflection: 'Jesus não carregou apenas nossos pecados na cruz — Ele carregou nossas DOR e enfermidades. A cura não é só física. É emocional, mental, espiritual. Ele quer te curar POR INTEIRO.',
      practicalAction: 'Coloque a mão no peito e declare: "Pelas chagas de Jesus eu sou curado(a)". Repita 7 vezes com fé.',
      propheticDeclaration: 'EU DECLARO cura completa sobre minha vida! Toda enfermidade, toda dor emocional, todo trauma — é CURADO pelo poder do sangue de Jesus!',
    },
  ];

  for (let i = 0; i < 90; i++) {
    const contentIndex = i % dailyContent.length;
    const content = dailyContent[contentIndex];
    const weekNum = Math.floor(i / 7) + 1;

    days.push({
      day: i + 1,
      week: weekNum,
      title: `Dia ${i + 1}: ${content.title}`,
      theme: content.theme,
      morningPrayer: content.morningPrayer,
      bibleReading: content.bibleReading,
      bibleReference: content.bibleReference,
      reflection: content.reflection,
      practicalAction: content.practicalAction,
      propheticDeclaration: content.propheticDeclaration,
    });
  }

  return days;
}

export const journeyDays = generateJourneyDays();

export function getQuizResultCopy(profile: JourneyProfile): {
  headline: string;
  subheadline: string;
  bodyText: string;
  ctaText: string;
  urgencyText: string;
} {
  const painMap: Record<string, string> = {
    anxiety: 'a ansiedade que te paralisa',
    distance: 'o vazio espiritual que te consome',
    financial: 'a pressão financeira que te sufoca',
    relationship: 'a dor dos relacionamentos que te destroem',
    purpose: 'a falta de direção que te desespera',
  };

  const desireMap: Record<string, string> = {
    intimacy: 'ter uma intimidade REAL e profunda com Deus',
    breakthrough: 'experimentar a maior virada da sua vida',
    healing: 'ser completamente curado(a) por dentro',
    discipline: 'ter uma vida espiritual inabalável',
    family_restoration: 'ver sua família completamente restaurada',
  };

  const pain = painMap[profile.primaryPain] || 'as batalhas que você enfrenta';
  const desire = desireMap[profile.desiredOutcome] || 'a transformação que você busca';

  return {
    headline: `Em 90 dias, ${pain} vai se transformar em testemunho.`,
    subheadline: `Você disse que quer ${desire}. Deus já preparou o caminho.`,
    bodyText: `Este não é mais um devocional genérico. É um plano PROFÉTICO de 90 dias, com orações da madrugada, declarações de poder e leituras que vão DESTRUIR as fortalezas que te prendem. Cada dia foi desenhado para levar você a um nível mais profundo de intimidade com Deus.`,
    ctaText: 'COMEÇAR MINHA JORNADA DE 90 DIAS',
    urgencyText: 'Não adie mais. Cada dia que passa sem oração é um dia entregue ao inimigo.',
  };
}
