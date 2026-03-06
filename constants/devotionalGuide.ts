export interface DevotionalDay {
  day: number;
  title: string;
  theme: string;
  emoji: string;
  verse: string;
  verseRef: string;
  reading: string;
  reflection: string;
  prayer: string;
  challenge: string;
}

export interface DevotionalPlan {
  id: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  days: DevotionalDay[];
}

export const devotionalPlans: DevotionalPlan[] = [
  {
    id: 'closer_to_god',
    title: '7 Dias Para Se Aproximar de Deus',
    description: 'Um guia diário para fortalecer sua intimidade com o Criador',
    emoji: '🕊️',
    color: '#1a365d',
    days: [
      {
        day: 1,
        title: 'O Convite de Deus',
        theme: 'Deus quer estar perto de você',
        emoji: '💌',
        verse: 'Chegai-vos a Deus, e ele se chegará a vós.',
        verseRef: 'Tiago 4:8',
        reading: 'Deus não é um ser distante e inacessível. Ele é um Pai amoroso que deseja ter comunhão com você. Desde o Jardim do Éden, quando Deus caminhava com Adão e Eva na viração do dia, Ele sempre quis estar perto de seus filhos. O pecado nos afastou, mas através de Jesus, o caminho foi reaberto. Hoje, o convite está aberto: "Chegai-vos a Deus". Não é preciso ter uma oração perfeita, nem estar em um lugar especial. Basta um coração sincero.',
        reflection: 'Pense em momentos onde você sentiu Deus mais distante. O que estava acontecendo na sua vida? Muitas vezes, somos nós que nos afastamos, não Ele. Deus está esperando você dar o primeiro passo.',
        prayer: 'Pai Celestial, hoje eu escolho me aproximar de Ti. Perdoa-me pelos dias em que Te ignorei ou me afastei. Abre meu coração para sentir Tua presença de maneira real. Eu quero mais de Ti na minha vida. Em nome de Jesus, amém.',
        challenge: 'Reserve 10 minutos hoje em silêncio total, sem celular, apenas conversando com Deus.',
      },
      {
        day: 2,
        title: 'O Poder da Palavra',
        theme: 'A Bíblia como alimento espiritual',
        emoji: '📖',
        verse: 'Lâmpada para os meus pés é a tua palavra, e luz para o meu caminho.',
        verseRef: 'Salmos 119:105',
        reading: 'A Bíblia não é apenas um livro — é a Palavra viva de Deus. Através dela, Deus fala conosco, nos guia, nos corrige e nos encoraja. Muitos cristãos passam dias sem abrir suas Bíblias e depois se perguntam por que se sentem distantes de Deus. A Palavra é o alimento da nossa alma. Assim como nosso corpo precisa de comida diária, nosso espírito precisa da Palavra diária.',
        reflection: 'Com que frequência você lê a Bíblia? Não como obrigação, mas como desejo de ouvir a voz de Deus? Comece com pouco: um capítulo por dia já transforma.',
        prayer: 'Senhor, desperta em mim a fome pela Tua Palavra. Que eu não veja a Bíblia como um livro comum, mas como Tua voz falando diretamente ao meu coração. Dá-me entendimento e revelação ao ler. Amém.',
        challenge: 'Leia o Salmo 23 três vezes hoje: pela manhã, à tarde e antes de dormir. Observe como Deus fala diferente em cada leitura.',
      },
      {
        day: 3,
        title: 'Oração: Conversa com o Pai',
        theme: 'Aprendendo a orar de coração',
        emoji: '🙏',
        verse: 'Orai sem cessar.',
        verseRef: '1 Tessalonicenses 5:17',
        reading: 'Oração não é repetir fórmulas ou palavras bonitas — é conversa com Deus. Imagine que você tem acesso direto ao Criador do universo, 24 horas por dia, sem precisar agendar horário. É exatamente isso que a oração é. Você pode falar com Deus enquanto dirige, cozinha, trabalha ou antes de dormir. Ele ouve cada palavra, cada suspiro, cada pensamento.',
        reflection: 'Como é sua vida de oração? Você fala com Deus como fala com um amigo próximo? Ou suas orações parecem formais e distantes? Deus quer autenticidade.',
        prayer: 'Pai, me ensina a orar. Não com palavras vazias, mas com o coração aberto. Quero que minha oração seja uma conversa real contigo, onde eu falo e também ouço. Transforma minha vida de oração. Em nome de Jesus, amém.',
        challenge: 'Ore por 5 minutos sem pedir nada — apenas agradeça e adore a Deus pelo que Ele é.',
      },
      {
        day: 4,
        title: 'Gratidão Transforma',
        theme: 'O poder de um coração agradecido',
        emoji: '🌟',
        verse: 'Em tudo dai graças, porque esta é a vontade de Deus em Cristo Jesus para convosco.',
        verseRef: '1 Tessalonicenses 5:18',
        reading: 'A gratidão é uma das forças espirituais mais poderosas. Quando agradecemos, mudamos nosso foco dos problemas para as bênçãos. Paulo e Silas estavam presos, com as costas feridas, e o que fizeram? Cantaram louvores a Deus! E a prisão tremeu. A gratidão muda a atmosfera espiritual ao nosso redor. Mesmo em tempos difíceis, sempre há motivos para agradecer.',
        reflection: 'Liste 10 coisas pelas quais você é grato hoje. Pode ser algo simples como respirar, ter saúde, ter um teto. A gratidão muda a perspectiva.',
        prayer: 'Senhor, eu Te agradeço por tudo que tens feito na minha vida. Pelas bênçãos visíveis e invisíveis. Perdoa-me pelas vezes que reclamei em vez de agradecer. Quero ter um coração grato todos os dias. Amém.',
        challenge: 'Escreva uma lista de 10 bênçãos na sua vida e leia em voz alta como uma oração de gratidão.',
      },
      {
        day: 5,
        title: 'Perdão Liberta',
        theme: 'Liberando mágoas e ressentimentos',
        emoji: '💔',
        verse: 'Perdoai-vos mutuamente, assim como Deus vos perdoou em Cristo.',
        verseRef: 'Efésios 4:32',
        reading: 'Um dos maiores obstáculos na caminhada com Deus é a falta de perdão. Guardar mágoa é como beber veneno e esperar que o outro morra. Jesus nos ensinou a perdoar não 7 vezes, mas 70 vezes 7. Perdoar não é sentir que o que fizeram estava certo — é libertar-se da prisão do ressentimento. Quando perdoamos, não estamos fazendo um favor ao outro, estamos nos libertando.',
        reflection: 'Existe alguém que você precisa perdoar? Pode ser um familiar, um amigo, ou até você mesmo. O perdão é uma decisão, não um sentimento. Decida hoje.',
        prayer: 'Pai, eu escolho perdoar. Perdoo a [pessoa] por [situação]. Libero todo ressentimento, mágoa e desejo de vingança. Assim como Tu me perdoaste, eu perdoo. Cura meu coração e me liberta. Em nome de Jesus, amém.',
        challenge: 'Se possível, envie uma mensagem amável para alguém com quem você teve conflito. Se não for possível, escreva uma carta de perdão (mesmo que nunca envie).',
      },
      {
        day: 6,
        title: 'Fé em Ação',
        theme: 'Vivendo a fé no dia a dia',
        emoji: '⚡',
        verse: 'Assim também a fé, se não tiver obras, é morta em si mesma.',
        verseRef: 'Tiago 2:17',
        reading: 'Fé não é apenas crer — é agir baseado no que cremos. Abraão creu em Deus e saiu de sua terra sem saber para onde ia. A mulher com fluxo de sangue creu e tocou nas vestes de Jesus. A fé verdadeira nos move à ação. Não basta dizer "eu confio em Deus" se nossas atitudes mostram o contrário. A fé se prova pelos frutos.',
        reflection: 'Em quais áreas da sua vida você precisa exercer mais fé? Saúde, finanças, relacionamentos? O que Deus está pedindo que você faça que requer coragem e confiança?',
        prayer: 'Senhor, aumenta a minha fé. Que eu não seja apenas ouvinte da Palavra, mas praticante. Dá-me coragem para agir conforme Tua vontade, mesmo quando não vejo o caminho completo. Eu confio em Ti. Amém.',
        challenge: 'Faça algo hoje que demonstre sua fé: ajude alguém, doe algo, ou tome uma decisão que você tem adiado por medo.',
      },
      {
        day: 7,
        title: 'Uma Nova Jornada',
        theme: 'Compromisso contínuo com Deus',
        emoji: '🌅',
        verse: 'Eis que faço novas todas as coisas.',
        verseRef: 'Apocalipse 21:5',
        reading: 'Parabéns por completar esta jornada de 7 dias! Mas lembre-se: isto é apenas o começo. A caminhada com Deus é diária, não um evento de uma semana. Cada dia é uma nova oportunidade de se aproximar mais do Pai. Os hábitos que você começou a desenvolver — oração, leitura da Palavra, gratidão, perdão e fé — devem se tornar parte da sua rotina. Deus tem planos incríveis para sua vida. Continue buscando-O.',
        reflection: 'O que mudou em você nesses 7 dias? Que hábito espiritual você deseja manter? Faça um compromisso consigo mesmo e com Deus de continuar essa jornada.',
        prayer: 'Pai, obrigado por essa semana. Obrigado por cada revelação, cada momento de intimidade. Eu me comprometo a continuar Te buscando todos os dias. Que essa não seja apenas uma experiência passageira, mas o início de uma nova fase na minha vida espiritual. Eu Te amo e quero Te conhecer cada dia mais. Em nome de Jesus, amém.',
        challenge: 'Defina um horário fixo diário para sua devocional. Escreva esse horário e coloque um alarme no celular. Comprometa-se por mais 21 dias.',
      },
    ],
  },
  {
    id: 'faith_foundations',
    title: '7 Dias de Fundamentos da Fé',
    description: 'Descubra as bases sólidas da vida cristã',
    emoji: '⛪',
    color: '#2d6a4f',
    days: [
      {
        day: 1,
        title: 'Quem é Deus?',
        theme: 'Conhecendo o caráter de Deus',
        emoji: '👑',
        verse: 'Deus é amor.',
        verseRef: '1 João 4:8',
        reading: 'O primeiro passo na fé é conhecer quem Deus realmente é. Ele não é um juiz cruel esperando você errar. Deus é amor em sua essência. Ele é o Pai que corre ao encontro do filho pródigo. Ele é o Pastor que deixa 99 ovelhas para buscar a perdida. Conhecer o caráter de Deus muda completamente como nos relacionamos com Ele.',
        reflection: 'Qual imagem você tem de Deus? Um juiz severo ou um Pai amoroso? Muitas vezes, projetamos em Deus a imagem de figuras de autoridade que nos feriram. Permita que a Palavra renove sua visão de Deus.',
        prayer: 'Pai, revela quem Tu realmente és. Remove toda imagem distorcida que tenho de Ti. Quero Te conhecer como Tu és: amoroso, fiel, misericordioso e bom. Amém.',
        challenge: 'Leia 1 João 4:7-19 e destaque cada característica de Deus mencionada.',
      },
      {
        day: 2,
        title: 'A Obra de Jesus',
        theme: 'O que a cruz significa para nós',
        emoji: '✝️',
        verse: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito.',
        verseRef: 'João 3:16',
        reading: 'A cruz não foi um acidente — foi o plano de Deus desde o início. Jesus veio para restaurar o que o pecado destruiu: nossa comunhão com o Pai. Na cruz, Ele tomou sobre si nossas dores, pecados e vergonhas. Tudo foi pago. Agora, temos livre acesso a Deus, não por mérito, mas pela graça.',
        reflection: 'Você realmente compreende o que Jesus fez por você? Não como conceito, mas como realidade pessoal? O sacrifício de Cristo é pessoal — Ele teria feito isso mesmo se fosse só por você.',
        prayer: 'Jesus, obrigado pela cruz. Obrigado por me amar tanto a ponto de dar Sua vida. Que eu nunca me acostume com esse sacrifício. Que a cruz me transforme cada dia. Amém.',
        challenge: 'Leia Isaías 53 inteiro, imaginando que foi escrito especificamente sobre o que Jesus fez por VOCÊ.',
      },
      {
        day: 3,
        title: 'O Espírito Santo',
        theme: 'O consolador que habita em nós',
        emoji: '🔥',
        verse: 'Mas o Consolador, o Espírito Santo, que o Pai enviará em meu nome, esse vos ensinará todas as coisas.',
        verseRef: 'João 14:26',
        reading: 'Quando Jesus subiu ao céu, Ele não nos deixou sozinhos. Enviou o Espírito Santo para habitar em cada crente. O Espírito Santo é nosso guia, consolador, professor e poder. Ele nos convence do pecado, nos guia à verdade e nos capacita para viver uma vida que agrada a Deus.',
        reflection: 'Você tem consciência da presença do Espírito Santo na sua vida? Ele não é uma força impessoal — é uma Pessoa divina que quer se relacionar com você.',
        prayer: 'Espírito Santo, eu Te reconheço como presente e ativo na minha vida. Me ensina, me guia, me consola. Quero ser sensível à Tua voz. Enche-me novamente hoje. Amém.',
        challenge: 'Antes de cada decisão hoje, pare e pergunte ao Espírito Santo: "O que Tu achas?"',
      },
      {
        day: 4,
        title: 'A Graça de Deus',
        theme: 'Favor imerecido que transforma',
        emoji: '🎁',
        verse: 'Porque pela graça sois salvos, por meio da fé; e isto não vem de vós, é dom de Deus.',
        verseRef: 'Efésios 2:8',
        reading: 'Graça é receber o que não merecemos. Nenhum esforço humano é suficiente para alcançar Deus — por isso Ele veio até nós. A graça não é licença para pecar, mas poder para não pecar. Quando entendemos a graça, paramos de tentar "ser bons o suficiente" e simplesmente recebemos o amor de Deus.',
        reflection: 'Você vive pela graça ou pela performance? Muitos cristãos vivem tentando "merecer" o amor de Deus. Você já foi aceito — não precisa provar nada.',
        prayer: 'Pai, obrigado pela Tua graça. Ajuda-me a viver na liberdade que Tu me deste, sem culpa e sem performance. Que Tua graça me transforme de dentro para fora. Amém.',
        challenge: 'Identifique uma área onde você se cobra demais espiritualmente. Entregue essa pressão a Deus e descanse na graça.',
      },
      {
        day: 5,
        title: 'Comunidade de Fé',
        theme: 'A importância de caminhar juntos',
        emoji: '🤝',
        verse: 'Não deixemos de nos congregar, como é costume de alguns.',
        verseRef: 'Hebreus 10:25',
        reading: 'A fé cristã nunca foi projetada para ser vivida sozinha. Deus nos criou para comunidade. A igreja não é um prédio — é o corpo de Cristo, formado por pessoas imperfeitas que se amam e se ajudam. Em comunidade, somos fortalecidos, corrigidos, encorajados e edificados.',
        reflection: 'Você faz parte de uma comunidade de fé? Se não, o que te impede? Se sim, como você pode contribuir mais? Não somos apenas consumidores espirituais — somos membros ativos.',
        prayer: 'Senhor, me coloca em uma comunidade onde eu possa crescer e contribuir. Que eu não tente caminhar sozinho. Me dá amigos de fé que me apontem para Ti. Amém.',
        challenge: 'Entre em contato com um amigo cristão hoje e combine de orar juntos esta semana.',
      },
      {
        day: 6,
        title: 'Propósito Eterno',
        theme: 'Descobrindo por que você existe',
        emoji: '🎯',
        verse: 'Antes que eu te formasse no ventre materno, eu te conheci.',
        verseRef: 'Jeremias 1:5',
        reading: 'Você não é um acidente. Antes mesmo de nascer, Deus já conhecia seu nome, seus sonhos, seus dons e seu propósito. Cada pessoa tem um chamado único — algo que só ela pode fazer no plano de Deus. Descobrir esse propósito é uma das aventuras mais emocionantes da vida cristã.',
        reflection: 'Quais são seus dons e talentos? O que te dá alegria quando faz? Onde você sente que pode fazer diferença? Muitas vezes, nosso propósito está na interseção entre o que amamos fazer e o que o mundo precisa.',
        prayer: 'Pai, revela meu propósito. Mostra-me os dons que colocaste em mim e como usá-los para Tua glória. Não quero viver uma vida sem significado. Guia meus passos. Amém.',
        challenge: 'Escreva 3 coisas que você faz bem e 3 necessidades que vê ao seu redor. Onde elas se cruzam pode estar seu propósito.',
      },
      {
        day: 7,
        title: 'Vida de Adoração',
        theme: 'Adoração como estilo de vida',
        emoji: '🎵',
        verse: 'Apresentem os seus corpos como sacrifício vivo, santo e agradável a Deus; este é o culto racional de vocês.',
        verseRef: 'Romanos 12:1',
        reading: 'Adoração não é apenas cantar músicas no culto — é um estilo de vida. Quando trabalhamos com excelência, adoramos. Quando amamos nosso próximo, adoramos. Quando fazemos o certo mesmo quando ninguém está olhando, adoramos. Toda nossa vida pode ser um ato contínuo de adoração a Deus.',
        reflection: 'Como sua vida diária reflete adoração a Deus? No trabalho, nos relacionamentos, no lazer? Adorar não é sobre o que fazemos no domingo, mas como vivemos os outros 6 dias.',
        prayer: 'Senhor, que toda minha vida seja adoração. Não apenas minhas palavras, mas minhas atitudes, decisões e relacionamentos. Transforma meu dia a dia em um altar de adoração contínua. Amém.',
        challenge: 'Escolha uma atividade rotineira hoje (cozinhar, trabalhar, dirigir) e faça-a conscientemente como um ato de adoração a Deus.',
      },
    ],
  },
];

export function getDevotionalPlan(planId: string): DevotionalPlan | undefined {
  return devotionalPlans.find(p => p.id === planId);
}
