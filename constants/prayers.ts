export interface Prayer {
  id: string;
  title: string;
  category: LifeArea;
  verse: string;
  verseRef: string;
  prayer: string;
  explanation: string;
  bestTime: string;
}

export type LifeArea = 
  | 'protecao' 
  | 'prosperidade' 
  | 'saude' 
  | 'relacionamentos' 
  | 'proposito' 
  | 'libertacao' 
  | 'sabedoria' 
  | 'paz';

export interface LifeAreaOption {
  id: LifeArea;
  title: string;
  emoji: string;
  description: string;
}

export const lifeAreas: LifeAreaOption[] = [
  {
    id: 'protecao',
    title: 'Proteção Divina',
    emoji: '🛡️',
    description: 'Proteção para você e sua família contra todo mal',
  },
  {
    id: 'prosperidade',
    title: 'Prosperidade Financeira',
    emoji: '💰',
    description: 'Abertura de portas e bênçãos financeiras',
  },
  {
    id: 'saude',
    title: 'Saúde e Cura',
    emoji: '💚',
    description: 'Cura física, emocional e espiritual',
  },
  {
    id: 'relacionamentos',
    title: 'Relacionamentos',
    emoji: '💕',
    description: 'Restauração de casamento, família e amizades',
  },
  {
    id: 'proposito',
    title: 'Propósito e Chamado',
    emoji: '⭐',
    description: 'Descoberta e cumprimento do seu propósito',
  },
  {
    id: 'libertacao',
    title: 'Libertação',
    emoji: '🔓',
    description: 'Liberdade de vícios, medos e amarras',
  },
  {
    id: 'sabedoria',
    title: 'Sabedoria e Direção',
    emoji: '💡',
    description: 'Sabedoria para decisões importantes',
  },
  {
    id: 'paz',
    title: 'Paz Interior',
    emoji: '🕊️',
    description: 'Tranquilidade, descanso e renovação',
  },
];

export const prayers: Prayer[] = [
  // Proteção Divina
  {
    id: '1',
    title: 'Oração do Escudo da Fé',
    category: 'protecao',
    verse: 'O Senhor é o meu pastor; nada me faltará.',
    verseRef: 'Salmos 23:1',
    prayer: `Senhor Deus, nesta madrugada eu me coloco diante da Tua presença gloriosa. Cubro a mim mesmo, minha casa, minha família e todos que me pertencem com o sangue precioso de Jesus. Que o Senhor se levante como um muro de fogo ao nosso redor, que nenhuma arma forjada contra nós prospere. Que os anjos do Senhor acampem-se ao nosso redor, nos livrando de todo mal. Eu declaro que somos protegidos pelo Senhor dos Exércitos, e que dormimos em paz porque o Senhor nos guarda. Em nome de Jesus, amém.`,
    explanation: 'Esta oração é especialmente poderosa para proteção noturna e segurança da família.',
    bestTime: '23h às 1h',
  },
  {
    id: '2',
    title: 'Oração das Portas Fechadas',
    category: 'protecao',
    verse: 'Pedi, e dar-se-vos-á; buscai, e encontrareis; batei, e abrir-se-vos-á.',
    verseRef: 'Mateus 7:7',
    prayer: `Pai Celestial, nesta hora sagrada da madrugada, eu peço que o Senhor feche todas as portas de acesso do inimigo à minha vida. Cancele todo plano maligno tramado nas trevas contra mim e minha casa. Que toda seta enviada retorne ao remetente sem efeito. Eu ativo os anjos guerreiros para guerrear por mim. Que a paz de Deus, que excede todo entendimento, guarde meu coração e minha mente em Cristo Jesus. Amém.`,
    explanation: 'Protege contra ataques espirituais e cancela planos do inimigo.',
    bestTime: '0h às 2h',
  },
  {
    id: '3',
    title: 'Oração da Vigília Angelical',
    category: 'protecao',
    verse: 'Porque aos seus anjos dará ordem a teu respeito, para que te guarden em todos os teus caminhos.',
    verseRef: 'Salmos 91:11',
    prayer: `Senhor Jesus, na calma desta madrugada, envio ordens aos anjos do Senhor para que estabeleçam guarda sobre minha casa. Que haja vigilância constante em cada cômodo, em cada janela, em cada porta. Que o sangue de Jesus seja a nossa proteção invisível. Que o Senhor nos livre de acidentes, de roubos, de doenças e de toda obra do mal. Confio que o Senhor é o nosso refúgio e fortaleza. Amém.`,
    explanation: 'Estabelece proteção angelical sobre a casa e família.',
    bestTime: '1h às 3h',
  },
  
  // Prosperidade Financeira
  {
    id: '4',
    title: 'Oração das Janelas Abertas',
    category: 'prosperidade',
    verse: 'Trazei todos os dízimos à casa do tesouro, para que haja mantimento na minha casa, e provai-me, diz o Senhor dos Exércitos.',
    verseRef: 'Malaquias 3:10',
    prayer: `Deus de Abraão, Isaque e Jacó, na quietude desta madrugada eu me aproximo de Ti para pedir que o Senhor abra as janelas dos céus sobre minha vida financeira. Que as bênçãos derramem-se sobre mim de tal forma que não haja espaço suficiente para recebê-las. Quebra todo jugo de escassez, pobreza e dívida. Que eu seja cabeça e não cauda, que empreste e não tome emprestado. Que a prosperidade do Senhor me alcance em todas as áreas. Em nome de Jesus. Amém.`,
    explanation: 'Abre caminhos para bênçãos financeiras e prosperidade.',
    bestTime: '3h às 4h',
  },
  {
    id: '5',
    title: 'Oração da Multiplicação',
    category: 'prosperidade',
    verse: 'O Senhor abençoará a tua fazenda e o teu pão.',
    verseRef: 'Deuteronômio 28:4',
    prayer: `Pai, na madrugada deste dia, eu apresento diante de Ti meu trabalho, meus negócios e minhas finanças. Multiplica, Senhor, o pouco que tenho, assim como multiplicaste os pães e os peixes. Que a fartura do Senhor invada minha vida. Que eu encontre oportunidades de bênção onde outros veem escassez. Que minhas mãos sejam abençoadas para criar, trabalhar e prosperar. Que a riqueza venha com sabedoria para honrar a Ti. Amém.`,
    explanation: 'Multiplica recursos e abre portas de oportunidades.',
    bestTime: '4h às 5h',
  },
  {
    id: '6',
    title: 'Oração da Restituição',
    category: 'prosperidade',
    verse: 'E vos restituirei os anos que comeu o gafanhoto, a locusta e o pulgão.',
    verseRef: 'Joel 2:25',
    prayer: `Senhor Todo-Poderoso, nesta hora de intercessão, eu clamo por restituição. Tudo o que foi perdido, roubado ou destruído em minha vida financeira, seja devolvido em dobro. Que os anos de escassez sejam compensados com anos de abundância. Que o Senhor restaure o que o inimigo levou. Eu recebo agora a restituição de saúde, tempo, dinheiro e oportunidades perdidas. Que o Senhor seja glorificado em minha provisão. Em nome de Jesus. Amém.`,
    explanation: 'Restitui perdas financeiras e recupera o tempo perdido.',
    bestTime: '0h às 1h',
  },

  // Saúde e Cura
  {
    id: '7',
    title: 'Oração da Cura Completa',
    category: 'saude',
    verse: 'Por isso me ungiste com óleo, e a minha taça transborda.',
    verseRef: 'Salmos 23:5',
    prayer: `Jeová Rofé, Deus que cura, nesta madrugada eu me apresento diante de Ti pedindo cura completa. Que o Teu óleo de cura desça sobre meu corpo, minha mente e meu espírito. Por Tuas pisaduras fomos sarados. Eu rejeito toda doença, enfermidade e opressão no meu corpo. Que cada célula, cada órgão, cada sistema funcione na perfeição que o Senhor criou. Que a vida de Deus flua em mim, trazendo saúde, energia e vitalidade. Eu sou curado em nome de Jesus!`,
    explanation: 'Cura física, emocional e libertação de enfermidades.',
    bestTime: '2h às 3h',
  },
  {
    id: '8',
    title: 'Oração da Renovação das Forças',
    category: 'saude',
    verse: 'Mas os que esperam no Senhor renovarão as suas forças.',
    verseRef: 'Isaías 40:31',
    prayer: `Pai Celestial, na quietude desta madrugada, eu busco renovo. Renovai as minhas forças, Senhor, como a águia que renova suas asas. Tire de mim todo cansaço, fadiga e esgotamento. Enche-me de vitalidade divina. Que meu sono seja reparador e que eu acorde revigorado. Que o Teu Espírito Santo me dê ânimo novo para cada dia. Que minha mente seja livre de ansiedade e meu corpo livre de tensões. Em Ti encontro descanso perfeito. Amém.`,
    explanation: 'Renova energia, combate cansaço e traz descanso.',
    bestTime: '23h às 0h',
  },
  {
    id: '9',
    title: 'Oração da Saúde emocional',
    category: 'saude',
    verse: 'O Senhor é a minha força e o meu escudo; nele o meu coração confia.',
    verseRef: 'Salmos 28:7',
    prayer: `Senhor, Tu conheces minha mente e meu coração. Nesta madrugada, eu peço cura emocional. Cura toda ferida do passado, toda memória dolorosa, toda rejeição. Liberta-me de medos, fobias e traumas. Que a paz de Cristo reine em meu coração. Renova minha mente conforme a Tua Palavra. Que eu pense pensamentos de vida, paz e esperança. Que minhas emoções sejam estabilizadas em Ti. Que a alegria do Senhor seja minha força. Em nome de Jesus. Amém.`,
    explanation: 'Cura emocional, traumas, ansiedade e depressão.',
    bestTime: '1h às 2h',
  },

  // Relacionamentos
  {
    id: '10',
    title: 'Oração da Restauração Conjugal',
    category: 'relacionamentos',
    verse: 'Assim também vós, maridos, deveis amar as vossas mulheres como a vós mesmos.',
    verseRef: 'Efésios 5:28',
    prayer: `Pai de amor, na madrugada deste dia, eu apresento meu casamento e meu cônjuge diante de Ti. Restaura, Senhor, todo amor que esfriou, toda comunicação que foi perdida, toda intimidade que se foi. Que o fogo do primeiro amor seja reacendido. Remove todo espírito de divisão, traição e desentendimento. Que haja perdão genuíno e reconciliação completa. Que meu casamento seja uma representação do amor de Cristo pela Igreja. Abençoa meu cônjuge abundantemente. Amém.`,
    explanation: 'Restaura casamentos, reacende o amor e traz unidade.',
    bestTime: '0h às 1h',
  },
  {
    id: '11',
    title: 'Oração dos Laços Familiares',
    category: 'relacionamentos',
    verse: 'Crê no Senhor Jesus Cristo e serás salvo, tu e a tua casa.',
    verseRef: 'Atos 16:31',
    prayer: `Senhor da família, nesta hora sagrada, eu intercedo por cada membro da minha família. Que os laços de amor sejam restaurados e fortalecidos. Salva, Senhor, cada familiar que ainda não Te conhece. Que haja respeito, honra e comunhão entre nós. Que a Tua presença habite em nossa casa. Que nossos filhos sejam abençoados e protegidos. Que a unção do Senhor recaia sobre cada geração. Que a bênção dos pais alcance os filhos e netos. Em nome de Jesus. Amém.`,
    explanation: 'Restaura relacionamentos familiares e abençoa parentes.',
    bestTime: '2h às 3h',
  },
  {
    id: '12',
    title: 'Oração das Boas Amizades',
    category: 'relacionamentos',
    verse: 'O homem que tem muitos amigos pode vir a se arruinar, mas existe um amigo mais chegado que um irmão.',
    verseRef: 'Provérbios 18:24',
    prayer: `Deus de relacionamentos, na madrugada de hoje eu peço por amizades verdadeiras. Remove de minha vida relacionamentos tóxicos e pessoas que não me edificam. Traiga minha vida amigos fiéis, que me amem pelo que sou e que me apontem para Ti. Que eu seja um amigo excelente para os outros. Que haja confiança, lealdade e apoio mútuo. Que minhas amizades glorifiquem o Teu nome. Que eu encontre comunhão com aqueles que amam a Tua presença. Amém.`,
    explanation: 'Atrai amizades saudáveis e remove relacionamentos tóxicos.',
    bestTime: '3h às 4h',
  },

  // Propósito e Chamado
  {
    id: '13',
    title: 'Oração do Despertar do Chamado',
    category: 'proposito',
    verse: 'Antes de te formares no ventre materno, eu te conheci.',
    verseRef: 'Jeremias 1:5',
    prayer: `Criador eterno, nesta madrugada de intercessão, eu busco o despertar do meu propósito. Revela-me, Senhor, o porquê de minha existência. Mostra-me o plano que tens para minha vida desde antes da fundação do mundo. Que minha vocação seja clara como a luz do dia. Desperta em mim os dons e talentos que colocaste. Que eu não me contente com uma vida comum, mas que busque cumprir o chamado celestial. Usa-me para impactar vidas e expandir Teu Reino. Em nome de Jesus. Amém.`,
    explanation: 'Revela o propósito de vida e desperta o chamado espiritual.',
    bestTime: '4h às 5h',
  },
  {
    id: '14',
    title: 'Oração da Confirmação Divina',
    category: 'proposito',
    verse: 'Se algum de vós tem falta de sabedoria, peça-a a Deus, que a todos dá liberalmente.',
    verseRef: 'Tiago 1:5',
    prayer: `Senhor da sabedoria, na quietude desta madrugada, eu peço confirmação. Confirma em meu coração as decisões que preciso tomar. Fala-me claramente através da Tua Palavra, de sonhos e de confirmações. Que eu não ande em dúvida ou incerteza. Ilumina meu caminho e dirige meus passos. Que a Tua voz seja distinta entre tantas outras vozes. Que eu tenha paz que supera o entendimento quando fizer a escolha certa. Guia-me em todos os meus caminhos. Amém.`,
    explanation: 'Traz confirmação para decisões importantes da vida.',
    bestTime: '1h às 2h',
  },
  {
    id: '15',
    title: 'Oração do Cumprimento do Propósito',
    category: 'proposito',
    verse: 'Porque sou eu que conheço os planos que tenho para vocês.',
    verseRef: 'Jeremias 29:11',
    prayer: `Deus de propósitos, nesta hora de intercessão, eu declaro que cumprirei o Teu chamado em minha vida. Que nada me impeça de fazer a Tua vontade. Dá-me forças para perseverar quando surgirem obstáculos. Que eu seja fiel até o fim. Que minha vida seja um testemunho do Teu poder e amor. Que eu termine bem a corrida que me destes. Que ao final de minha vida, eu ouça: "Muito bem, servo bom e fiel!" Em nome de Jesus, amém.`,
    explanation: 'Fortalece para cumprir o propósito e perseverar até o fim.',
    bestTime: '3h às 4h',
  },

  // Libertação
  {
    id: '16',
    title: 'Oração da Quebra de Amarras',
    category: 'libertacao',
    verse: 'E conhecereis a verdade, e a verdade vos libertará.',
    verseRef: 'João 8:32',
    prayer: `Senhor Jesus, na madrugada de hoje, eu clamo por libertação completa. Quebra, Senhor, toda amarra que me prende. Libertação de vícios, pecados, padrões destrutivos e ciclos negativos. Eu me arrependo de todo pecado consciente e inconsciente. Que o sangue de Jesus me purifique completamente. Que todo espírito de escravidão seja agora removido da minha vida. Eu declaro que sou livre em Cristo Jesus. Nenhuma cadeia pode me prender mais. Sou mais que vencedor em Cristo!`,
    explanation: 'Liberta de vícios, pecados e padrões destrutivos.',
    bestTime: '0h às 2h',
  },
  {
    id: '17',
    title: 'Oração da Liberdade dos Medos',
    category: 'libertacao',
    verse: 'Porque Deus não nos deu o espírito de temor, mas de poder, de amor e de moderação.',
    verseRef: '2 Timóteo 1:7',
    prayer: `Pai amoroso, nesta madrugada eu renuncio a todo medo, ansiedade e pavor. Medo do futuro, medo da morte, medo do fracasso, medo da rejeição - eu te expulso em nome de Jesus. Enche-me, Senhor, com o Teu espírito de poder, amor e autocontrole. Que eu seja corajoso como um leão, pois o Senhor está comigo. Que minha mente seja livre de pensamentos de derrota. Que eu durma em paz e acorde confiante. O Senhor é minha luz e minha salvação, a quem temerei?`,
    explanation: 'Liberta de medos, fobias, ansiedade e pânico.',
    bestTime: '23h às 1h',
  },

  // Sabedoria e Direção
  {
    id: '18',
    title: 'Oração da Sabedoria Celestial',
    category: 'sabedoria',
    verse: 'O temor do Senhor é o princípio da sabedoria.',
    verseRef: 'Provérbios 9:10',
    prayer: `Deus de toda sabedoria, na madrugada deste dia, eu peço que o Senhor me dê sabedoria divina. A sabedoria de Salomão para discernir entre o certo e o errado. Sabedoria para lidar com pessoas difíceis, para tomar decisões financeiras, para criar meus filhos. Que o Teu Espírito Santo me ensine todas as coisas. Que eu não confie em meu próprio entendimento, mas em Ti. Que a sabedoria do alto guie cada passo meu. Que eu seja conhecido como uma pessoa sábia e cheia de entendimento. Amém.`,
    explanation: 'Traz sabedoria divina para todas as áreas da vida.',
    bestTime: '2h às 4h',
  },

  // Paz Interior
  {
    id: '19',
    title: 'Oração do Descanso Perfeito',
    category: 'paz',
    verse: 'Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.',
    verseRef: 'Mateus 11:28',
    prayer: `Jesus, príncipe da paz, nesta madrugada eu busco descanso em Ti. Descanso para minha alma cansada, para minha mente agitada, para meu coração aflito. Tira de mim todo fardo pesado e coloca sobre mim Teu jugo suave. Que eu aprenda de Ti, que és manso e humilde de coração. Que minha alma encontre descanso verdadeiro em Tua presença. Que eu pare de lutar com minhas próprias forças e descanse no Teu poder. Tu és meu refúgio e minha fortaleza. Em Ti confio.`,
    explanation: 'Traz descanso profundo para alma e alívio de cargas.',
    bestTime: '22h às 23h',
  },
  {
    id: '20',
    title: 'Oração da Paz que Excede',
    category: 'paz',
    verse: 'E a paz de Deus, que excede todo entendimento, guardará os vossos corações.',
    verseRef: 'Filipenses 4:7',
    prayer: `Senhor, nesta madrugada eu recebo a Tua paz. Uma paz que não depende das circunstâncias, que não é abalada pelas tempestades da vida. Uma paz que excede todo entendimento humano. Guarda meu coração e minha mente com essa paz divina. Que eu não me preocupe com nada, mas em tudo apresente meus pedidos a Ti. Que agradeça sempre e alegre-me no Senhor. Que a paz de Cristo habite ricamente em meu coração. Que eu seja um portador de paz onde quer que vá. Em nome de Jesus. Amém.`,
    explanation: 'Traz paz interior que supera qualquer circunstância.',
    bestTime: '4h às 5h',
  },
];

export function getPrayersByCategory(category: LifeArea): Prayer[] {
  return prayers.filter(prayer => prayer.category === category);
}

export function getPrayersByCategories(categories: LifeArea[]): Prayer[] {
  if (categories.length === 0) return prayers;
  return prayers.filter(prayer => categories.includes(prayer.category));
}

export const quizQuestions = [
  {
    id: 1,
    question: 'Qual dessas áreas você sente mais necessidade de mudança agora?',
    options: [
      { id: 'protecao', label: 'Proteção contra ataques e inveja' },
      { id: 'prosperidade', label: 'Finanças e prosperidade' },
      { id: 'saude', label: 'Saúde e bem-estar' },
      { id: 'relacionamentos', label: 'Relacionamentos amorosos e familiares' },
    ],
  },
  {
    id: 2,
    question: 'O que mais tem te incomodado recentemente?',
    options: [
      { id: 'proposito', label: 'Não saber qual é meu propósito' },
      { id: 'libertacao', label: 'Vícios ou padrões que não consigo quebrar' },
      { id: 'sabedoria', label: 'Dificuldade em tomar decisões' },
      { id: 'paz', label: 'Ansiedade e falta de paz interior' },
    ],
  },
];
