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

interface WeekContent {
  title: string;
  theme: string;
  morningPrayer: string;
  bibleReading: string;
  bibleReference: string;
  reflection: string;
  practicalAction: string;
  propheticDeclaration: string;
}

const weeklyContent: Record<number, WeekContent[]> = {
  1: [
    {
      title: 'O Primeiro Passo',
      theme: 'Decisão de Mudança',
      morningPrayer: 'Pai, na autoridade do nome de Jesus, eu DECIDO me aproximar de Ti AGORA. Não importa quanto tempo fiquei longe — hoje as portas do céu se abrem sobre mim. Quebra todo orgulho, toda resistência, toda muralha que me separou de Ti. Como o pai recebeu o filho pródigo com festa, eu sei que Tu estás de braços abertos. Este é o DIA da minha transformação. Amém!',
      bibleReading: 'Leia Lucas 15:11-24 — A parábola do filho pródigo',
      bibleReference: 'Lucas 15:20',
      reflection: 'O pai não esperou o filho chegar. Ele CORREU ao encontro dele. Neste exato momento, Deus está correndo em sua direção. Você não precisa ser perfeito(a) para voltar. O primeiro passo é o mais poderoso.',
      practicalAction: 'Escreva em um papel: "Hoje eu decido me aproximar de Deus". Cole no espelho do banheiro e declare toda manhã.',
      propheticDeclaration: 'EU DECLARO que a partir de HOJE minha vida espiritual nunca mais será a mesma! O céu está ABERTO sobre mim e o Deus do impossível está preparando algo que meus olhos ainda NÃO viram!',
    },
    {
      title: 'Limpando o Terreno',
      theme: 'Arrependimento Profundo',
      morningPrayer: 'Senhor, com o fogo do Teu Espírito, examina cada canto do meu coração. Mostra aquilo que tenho escondido, os pecados que justifiquei, as áreas que não entreguei. EU ME ARREPENDO de todo coração! Lava-me com Teu sangue, purifica-me com Teu fogo, faz-me novo(a) nesta madrugada! Amém!',
      bibleReading: 'Leia Salmo 51:1-17 — A oração de arrependimento de Davi',
      bibleReference: 'Salmo 51:10',
      reflection: 'Davi era "homem segundo o coração de Deus" não porque era perfeito, mas porque sabia se arrepender PROFUNDAMENTE. Arrependimento não é vergonha — é a porta da liberdade.',
      practicalAction: 'Reserve 10 minutos em silêncio total. Peça a Deus que mostre áreas que precisam de arrependimento. Anote cada uma e entregue a Ele em oração.',
      propheticDeclaration: 'EU DECLARO que sou LAVADO(A) pelo sangue de Jesus! Meu passado NÃO me define! Sou nova criatura — as coisas velhas já passaram, eis que TUDO se fez novo!',
    },
    {
      title: 'A Voz que Acalma Tempestades',
      theme: 'Ouvindo a Deus',
      morningPrayer: 'Espírito Santo, nesta hora eu silencio diante de Ti. Ensina-me a ouvir Tua voz acima de todo barulho, acima de toda ansiedade, acima de toda voz humana. Abre meus ouvidos espirituais! Que eu discerna Tua direção com clareza sobrenatural. Fala, Senhor, que Teu servo(a) ouve com o coração aberto! Amém!',
      bibleReading: 'Leia 1 Reis 19:9-13 — Deus fala em voz mansa e suave',
      bibleReference: '1 Reis 19:12',
      reflection: 'Deus não estava no terremoto, nem no fogo, nem no vento forte. Ele estava na voz mansa e suave. O segredo é SILENCIAR para ouvir aquele que governa o universo.',
      practicalAction: 'Fique 5 minutos em completo silêncio após orar. Apenas ouça. Anote qualquer impressão que o Espírito Santo colocar no seu coração.',
      propheticDeclaration: 'EU DECLARO que meus ouvidos espirituais estão ABERTOS! Eu reconheço a voz do meu Pastor e NÃO sigo a voz de estranhos! Ele me guia por caminhos de justiça!',
    },
    {
      title: 'Quebrando Toda Corrente',
      theme: 'Libertação Total',
      morningPrayer: 'EM NOME DE JESUS, eu QUEBRO toda corrente que me prende! Todo vício, todo ciclo de derrota, toda fortaleza mental, toda prisão emocional — É DESTRUÍDA AGORA pelo poder do sangue de Jesus! O que o Filho libertou é VERDADEIRAMENTE livre! Eu sou livre! Todo jugo é destruído pela unção do Espírito Santo! Amém!',
      bibleReading: 'Leia João 8:31-36 — A verdade vos libertará',
      bibleReference: 'João 8:36',
      reflection: 'Jesus não veio te dar religião. Ele veio te dar LIBERDADE RADICAL. Se você está preso(a) em algum ciclo vicioso, HOJE é o dia da sua libertação sobrenatural.',
      practicalAction: 'Identifique UMA área de escravidão. Declare EM VOZ ALTA 3 vezes: "Em nome de Jesus, eu sou LIVRE disso!" Sinta o poder da declaração.',
      propheticDeclaration: 'EU DECLARO LIBERDADE TOTAL sobre minha vida! NENHUMA arma forjada contra mim prosperará! As correntes estão QUEBRADAS e o chão do inferno TREME quando eu oro!',
    },
    {
      title: 'O Poder Explosivo da Gratidão',
      theme: 'Adoração e Gratidão',
      morningPrayer: 'Deus Todo-Poderoso, ANTES de pedir qualquer coisa, minha boca se abre para Te ADORAR! Pelo ar que respiro, pela vida que me deste, pelo sangue que me lavou — Tu és DIGNO de toda honra, toda glória, toda majestade! Minha adoração vai Te encontrar agora mesmo! Amém!',
      bibleReading: 'Leia Salmo 100 — Entrai na presença com louvor',
      bibleReference: 'Salmo 100:4',
      reflection: 'A gratidão é a PORTA DE ENTRADA da presença de Deus. Quando agradecemos, as muralhas caem, as portas se abrem, e o céu derrama bênçãos que não podem ser contidas.',
      practicalAction: 'Escreva 10 coisas pelas quais você é grato(a) HOJE. Coisas simples. Leia em voz alta como uma oração de adoração.',
      propheticDeclaration: 'EU DECLARO que sou uma pessoa de GRATIDÃO EXPLOSIVA! Mesmo no vale mais escuro, eu louvarei ao Senhor porque Ele É bom e Sua misericórdia dura para SEMPRE!',
    },
    {
      title: 'A Armadura Completa',
      theme: 'Proteção Sobrenatural',
      morningPrayer: 'Senhor dos Exércitos, eu VISTO a armadura completa de Deus! O CAPACETE da salvação blinda minha mente! A COURAÇA da justiça guarda meu coração! O ESCUDO da fé apaga TODO dardo inflamado do maligno! A ESPADA do Espírito é Tua Palavra afiada na minha boca! Estou pronto(a) para a GUERRA! Amém!',
      bibleReading: 'Leia Efésios 6:10-18 — A armadura de Deus',
      bibleReference: 'Efésios 6:13',
      reflection: 'Não estamos lutando contra carne e sangue. O campo de batalha é ESPIRITUAL. Por isso precisamos de armas espirituais. Vista TODA a armadura antes de pisar fora de casa.',
      practicalAction: 'Ao se vestir pela manhã, declare CADA peça da armadura sobre você. Transforme isso em ritual DIÁRIO de guerra espiritual.',
      propheticDeclaration: 'EU DECLARO que estou REVESTIDO(A) do poder do Altíssimo! NENHUM ataque do inferno me alcançará porque Jeová Sabaoth, o Senhor dos Exércitos, marcha comigo!',
    },
    {
      title: 'Renovação Total da Mente',
      theme: 'Transformação de Pensamentos',
      morningPrayer: 'Pai, pelo poder do Teu Espírito, TRANSFORMA minha mente AGORA! Destrói todo pensamento de derrota, de incapacidade, de medo, de fracasso! Renova meu entendimento com fogo! Que eu pense como Tu pensas, veja como Tu vês, ame como Tu amas! Minha mente é território do Espírito Santo! Amém!',
      bibleReading: 'Leia Romanos 12:1-2 — Sede transformados pela renovação da mente',
      bibleReference: 'Romanos 12:2',
      reflection: 'A batalha se ganha ou se perde na MENTE. Se o inimigo controla seus pensamentos, controla sua vida. Quando a Palavra governa sua mente, você se torna INABALÁVEL.',
      practicalAction: 'Identifique 3 pensamentos negativos recorrentes. Para cada um, encontre um versículo que o DESTRUA. Memorize e repita até crer.',
      propheticDeclaration: 'EU DECLARO que minha mente está sendo RENOVADA pelo fogo da Palavra! Eu tenho a MENTE DE CRISTO! Pensamentos de derrota NÃO têm lugar em mim!',
    },
  ],
  2: [
    {
      title: 'O Altar da Madrugada',
      theme: 'Oração de Fogo',
      morningPrayer: 'Senhor, na calada desta madrugada, eu levanto meu altar diante de Ti! Como Samuel que dormia no templo e ouviu Tua voz, eu digo: FALA, SENHOR! Derrama Teu fogo sobre minha vida de oração! Que esta hora se torne sagrada, que este lugar se torne santo, que minha voz chegue ao Teu trono como incenso! Amém!',
      bibleReading: 'Leia 1 Samuel 3:1-10 — Samuel ouve a voz de Deus',
      bibleReference: '1 Samuel 3:10',
      reflection: 'A madrugada é o horário em que o céu está mais atento. Jesus ia orar de madrugada. Davi buscava a Deus antes do sol nascer. Os maiores avivamentos nasceram na madrugada.',
      practicalAction: 'Defina um lugar fixo de oração na sua casa. Separe-o como seu "altar pessoal". Vá até lá todos os dias neste horário.',
      propheticDeclaration: 'EU DECLARO que meu altar está ACESO! O fogo de Deus NUNCA se apagará na minha vida! Sou adorador(a) de madrugada e os céus se ABREM quando eu clamo!',
    },
    {
      title: 'Clamor que Rompe os Céus',
      theme: 'Intercessão Profética',
      morningPrayer: 'Deus de Elias, o mesmo fogo que caiu no Monte Carmelo, EU PEÇO que caia sobre minha vida AGORA! Meu clamor não é religioso — é DESESPERADO por Ti! Como Ana chorou no templo até o céu se abrir, assim eu clamo! Ouve minha voz, sente meu coração, responde com FOGO! Amém!',
      bibleReading: 'Leia 1 Reis 18:36-39 — O fogo cai no Monte Carmelo',
      bibleReference: '1 Reis 18:38',
      reflection: 'Elias não orou uma oração bonita. Ele orou com AUTORIDADE. O fogo não caiu por eloquência — caiu por CONVICÇÃO. Deus responde ao clamor que vem do fundo da alma.',
      practicalAction: 'Hoje, ore de joelhos por 10 minutos. Não ore bonito — ore de verdade. Deixe o coração falar sem filtros.',
      propheticDeclaration: 'EU DECLARO que o FOGO de Deus está caindo sobre minha vida! Meu clamor ROMPE os céus! O mesmo Deus de Elias é o MEU Deus e Ele responde com fogo!',
    },
    {
      title: 'Vigília de Poder',
      theme: 'Oração da Madrugada',
      morningPrayer: 'Pai, enquanto o mundo dorme, eu VIGIO diante de Ti! Como os levitas que guardavam o templo na madrugada, eu guardo meu coração em oração. Derrama sobre mim o espírito de vigília, de intercessão, de clamor! Que esta hora se torne a mais poderosa do meu dia! Amém!',
      bibleReading: 'Leia Salmo 63:1-8 — De madrugada te buscarei',
      bibleReference: 'Salmo 63:1',
      reflection: 'Davi dizia: "De madrugada te buscarei." Não era conveniência — era URGÊNCIA. A alma que busca a Deus antes do sol é a alma que caminha com poder sobrenatural.',
      practicalAction: 'Coloque um alarme 15 minutos mais cedo amanhã. Use esse tempo APENAS para orar. Sem celular, sem distração.',
      propheticDeclaration: 'EU DECLARO que sou VIGILANTE na oração! Enquanto o inimigo planeja, EU ORO! Enquanto o mundo dorme, EU DECLARO vitória sobre minha casa, minha família, minha geração!',
    },
    {
      title: 'O Grito de Guerra',
      theme: 'Oração de Autoridade',
      morningPrayer: 'No nome que é SOBRE todo nome — JESUS CRISTO — eu me levanto com autoridade! Todo principado, toda potestade, todo poder das trevas que se levantou contra mim: CAIA AGORA! O sangue de Jesus me cobre, a espada do Espírito me arma, o fogo do Altíssimo me reveste! É GUERRA e eu já VENCI! Amém!',
      bibleReading: 'Leia 2 Crônicas 20:15-22 — A batalha pertence ao Senhor',
      bibleReference: '2 Crônicas 20:15',
      reflection: 'Josafá venceu a batalha com LOUVOR, não com espada. Às vezes nossa melhor arma é abrir a boca e declarar que a batalha pertence ao Senhor.',
      practicalAction: 'Declare em voz alta por 3 minutos: "A BATALHA PERTENCE AO SENHOR!" Sinta a autoridade fluir de cada palavra.',
      propheticDeclaration: 'EU DECLARO que a batalha já foi VENCIDA na cruz! O inimigo está debaixo dos meus PÉS! Em nome de Jesus, TODO plano maligno é ANULADO agora!',
    },
    {
      title: 'Lágrimas que Geram Milagres',
      theme: 'Oração de Quebrantamento',
      morningPrayer: 'Senhor, quebranta meu coração com aquilo que quebranta o Teu. Deixa eu sentir o que Tu sentes, chorar o que Tu choras. Tira de mim a dureza, a indiferença, a religiosidade vazia. Eu quero orar com LÁGRIMAS que movem o céu! Que meu choro se transforme em semente de milagre! Amém!',
      bibleReading: 'Leia Salmo 126:5-6 — Os que semeiam em lágrimas',
      bibleReference: 'Salmo 126:5',
      reflection: 'Os que semeiam em LÁGRIMAS, com júbilo ceifarão. Não tenha vergonha de chorar diante de Deus. Suas lágrimas são sementes dos maiores milagres.',
      practicalAction: 'Hoje, permita-se chorar diante de Deus. Não segure a emoção. Coloque uma música de adoração e deixe o coração falar.',
      propheticDeclaration: 'EU DECLARO que minhas lágrimas são SEMENTES de milagres! O que eu planto em oração hoje, eu COLHEREI em alegria! A colheita vem com JÚBILO!',
    },
    {
      title: 'Oração pelos Impossíveis',
      theme: 'Fé Sobrenatural',
      morningPrayer: 'Deus dos impossíveis, EU CREIO que Tu podes fazer INFINITAMENTE mais do que peço ou imagino! Eu trago diante de Ti aquilo que é IMPOSSÍVEL aos meus olhos. Para Ti, NADA é impossível! Abre os mares, derruba as muralhas, ressuscita o que está morto na minha vida! Amém!',
      bibleReading: 'Leia Marcos 11:22-24 — Tudo é possível ao que crê',
      bibleReference: 'Marcos 11:24',
      reflection: 'Jesus disse: "Tudo quanto pedirdes em oração, CREDE que recebestes, e será assim convosco." Não é esperança — é CERTEZA antecipada.',
      practicalAction: 'Escreva sua situação mais impossível num papel. Ore sobre ela por 5 minutos declarando: "Para Deus NADA é impossível!"',
      propheticDeclaration: 'EU DECLARO que os IMPOSSÍVEIS da minha vida estão sendo resolvidos AGORA! O Deus que abriu o Mar Vermelho está abrindo CAMINHOS onde não existem caminhos!',
    },
    {
      title: 'O Selo da Semana',
      theme: 'Consagração Semanal',
      morningPrayer: 'Pai, eu selo esta semana com o sangue de Jesus! Cada oração feita, cada lágrima derramada, cada declaração proferida — NADA voltará vazio! Tua Palavra não volta sem cumprir o propósito! Eu consagro os próximos dias e declaro que o melhor ainda está por vir! Amém!',
      bibleReading: 'Leia Isaías 55:10-11 — Minha Palavra não voltará vazia',
      bibleReference: 'Isaías 55:11',
      reflection: 'A Palavra de Deus é como a chuva: ela não volta sem cumprir seu propósito. Tudo que você declarou esta semana está trabalhando no mundo espiritual AGORA.',
      practicalAction: 'Releia suas anotações da semana. Veja quanto você cresceu em apenas 7 dias. Celebre cada vitória, por menor que pareça.',
      propheticDeclaration: 'EU DECLARO que NENHUMA Palavra de Deus volta vazia! Tudo que foi plantado esta semana está GERMINANDO e vai produzir fruto no tempo certo! A colheita é CERTA!',
    },
  ],
  3: [
    {
      title: 'A Espada Afiada',
      theme: 'Poder da Palavra',
      morningPrayer: 'Senhor, Tua Palavra é espada de dois gumes! Ela penetra até a divisão da alma e do espírito! Eu declaro que a Palavra que eu leio hoje vai CORTAR todo engano, toda mentira do inimigo, toda ilusão! A Bíblia não é só um livro — é ARMA VIVA nas minhas mãos! Amém!',
      bibleReading: 'Leia Hebreus 4:12-13 — A Palavra viva e eficaz',
      bibleReference: 'Hebreus 4:12',
      reflection: 'A Bíblia não é literatura religiosa. É a espada do Espírito. Quando você abre a Palavra, está empunhando a arma mais poderosa do universo.',
      practicalAction: 'Escolha UM versículo hoje. Memorize. Repita 10 vezes. Medite nele até virar parte de você.',
      propheticDeclaration: 'EU DECLARO que a Palavra de Deus é ESPADA nas minhas mãos e FOGO na minha boca! Todo ataque do inimigo é destruído quando eu abro as Escrituras!',
    },
    {
      title: 'Mergulho nas Escrituras',
      theme: 'Imersão Bíblica',
      morningPrayer: 'Espírito Santo, abre meus olhos para ver as MARAVILHAS da Tua lei! Que cada versículo salte das páginas e se grave no meu coração como fogo! Não quero ler por obrigação — quero ser TRANSFORMADO(A) por cada palavra! Amém!',
      bibleReading: 'Leia Salmo 119:97-112 — Oh, quanto amo a Tua lei!',
      bibleReference: 'Salmo 119:105',
      reflection: 'O salmista dizia: "Tua Palavra é lâmpada para os meus pés." No escuro das circunstâncias, a Bíblia é o único GPS que NUNCA falha.',
      practicalAction: 'Leia o capítulo indicado 3 vezes: rápido, devagar e em voz alta. Na terceira vez, algo vai saltar do texto para o seu coração.',
      propheticDeclaration: 'EU DECLARO que a Palavra de Deus é LÂMPADA para meus pés e LUZ para meu caminho! Eu não ando em trevas porque a Palavra me ILUMINA!',
    },
    {
      title: 'Promessas que Não Falham',
      theme: 'Reivindicando Promessas',
      morningPrayer: 'Deus, TODAS as Tuas promessas são SIM e AMÉM em Cristo Jesus! Eu reivindico AGORA cada promessa que Tu fizeste sobre minha vida! Tu és FIEL para cumprir! O que a Tua boca falou, a Tua mão vai realizar! Eu me posiciono para receber! Amém!',
      bibleReading: 'Leia 2 Coríntios 1:18-22 — Todas as promessas são Sim em Cristo',
      bibleReference: '2 Coríntios 1:20',
      reflection: 'Deus não é homem para que minta. Se Ele prometeu, vai cumprir. Sua parte é CRER e se posicionar. A promessa já foi dada — falta você tomá-la.',
      practicalAction: 'Encontre 3 promessas bíblicas que se aplicam à sua vida. Escreva-as e cole onde você as verá todos os dias.',
      propheticDeclaration: 'EU DECLARO que TODAS as promessas de Deus sobre minha vida estão sendo cumpridas! Nenhuma palavra cairá por terra! O tempo de Deus é AGORA!',
    },
    {
      title: 'Alimento para a Alma',
      theme: 'Meditação Profunda',
      morningPrayer: 'Pai, assim como meu corpo precisa de pão, minha alma precisa da Tua Palavra! Alimenta-me com verdades eternas! Que eu não viva só de pão, mas de TODA Palavra que sai da Tua boca! Hoje eu me alimento do PÃO DO CÉU! Amém!',
      bibleReading: 'Leia Mateus 4:1-11 — Jesus vence tentações com a Palavra',
      bibleReference: 'Mateus 4:4',
      reflection: 'Jesus enfrentou o diabo no deserto com UMA arma: "Está escrito." Quando você conhece a Palavra, nenhuma tentação tem poder sobre você.',
      practicalAction: 'Para cada tentação que identificar hoje, encontre um "Está escrito" correspondente. Declare em voz alta quando a tentação vier.',
      propheticDeclaration: 'EU DECLARO: ESTÁ ESCRITO! A Palavra de Deus é minha espada, meu escudo, meu alimento! Toda tentação é VENCIDA pela Palavra que habita em mim!',
    },
    {
      title: 'Revelação Sobrenatural',
      theme: 'Entendimento Espiritual',
      morningPrayer: 'Espírito de revelação, abre os olhos do meu entendimento! Revela mistérios ocultos, mostra verdades que eu nunca vi! Que a Palavra se torne REVELAÇÃO viva no meu espírito! Quero ir ALÉM da superfície — quero mergulhar nas profundezas de Deus! Amém!',
      bibleReading: 'Leia Efésios 1:17-23 — Espírito de sabedoria e revelação',
      bibleReference: 'Efésios 1:17',
      reflection: 'Paulo orava para que os crentes recebessem espírito de REVELAÇÃO. Não basta ler a Bíblia — precisamos de revelação para entender o que Deus está dizendo para HOJE.',
      practicalAction: 'Antes de abrir a Bíblia, ore: "Espírito Santo, revela algo novo para mim hoje." Leia devagar e anote o que saltar ao coração.',
      propheticDeclaration: 'EU DECLARO que tenho espírito de SABEDORIA e REVELAÇÃO no conhecimento de Cristo! Meus olhos espirituais estão abertos para ver o que Deus está fazendo!',
    },
    {
      title: 'A Palavra que Sara',
      theme: 'Cura pela Escritura',
      morningPrayer: 'Senhor, Tu enviaste Tua Palavra e ela nos SAROU! Eu declaro que cada versículo que leio hoje traz CURA ao meu coração, à minha mente, ao meu corpo! Tua Palavra é REMÉDIO para toda enfermidade, BÁLSAMO para toda ferida! Amém!',
      bibleReading: 'Leia Salmo 107:17-22 — Ele enviou Sua Palavra e os sarou',
      bibleReference: 'Salmo 107:20',
      reflection: 'A Palavra de Deus tem poder de CURA. Não é metáfora. Quando você medita nas Escrituras, algo sobrenatural acontece no seu espírito, alma e corpo.',
      practicalAction: 'Leia 3 versículos sobre cura em voz alta, colocando a mão no coração. Repita cada um 3 vezes com fé.',
      propheticDeclaration: 'EU DECLARO que a Palavra de Deus é CURA para o meu corpo, PAZ para minha mente, e RESTAURAÇÃO para minha alma! Pela Sua Palavra eu sou CURADO(A)!',
    },
    {
      title: 'Escrito no Coração',
      theme: 'Memorização Sagrada',
      morningPrayer: 'Pai, escreve Tua Palavra no meu coração com fogo! Que ela não fique apenas na minha mente, mas PENETRE nas profundezas do meu ser! Quando eu precisar, que ela brote como fonte de água viva! Que eu seja um LIVRO VIVO da Tua verdade! Amém!',
      bibleReading: 'Leia Jeremias 31:31-34 — A lei escrita no coração',
      bibleReference: 'Jeremias 31:33',
      reflection: 'Deus prometeu escrever Sua lei nos nossos corações. A Palavra memorizada não é apenas informação — é TRANSFORMAÇÃO. É ter o DNA de Deus no seu espírito.',
      practicalAction: 'Escolha o versículo que mais te tocou esta semana. Memorize completamente. Será sua arma para os dias difíceis.',
      propheticDeclaration: 'EU DECLARO que a Palavra de Deus está GRAVADA no meu coração! Ela é fonte de vida, sabedoria e poder! Sou transformado(a) de dentro para fora!',
    },
  ],
};

function getWeekContent(weekNum: number): WeekContent[] {
  if (weeklyContent[weekNum]) return weeklyContent[weekNum];
  const baseWeek = ((weekNum - 1) % 3) + 1;
  return weeklyContent[baseWeek];
}

export function generateJourneyDays(): JourneyDay[] {
  const days: JourneyDay[] = [];

  for (let i = 0; i < 90; i++) {
    const weekNum = Math.floor(i / 7) + 1;
    const dayInWeek = i % 7;
    const content = getWeekContent(weekNum)[dayInWeek];

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
