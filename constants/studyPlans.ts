export interface StudyDay {
  day: number;
  title: string;
  reading: string;
  reflection: string;
  verse: string;
  verseRef: string;
}

export interface StudyPlan {
  id: string;
  title: string;
  description: string;
  emoji: string;
  duration: number;
  category: string;
  days: StudyDay[];
}

export const studyPlans: StudyPlan[] = [
  {
    id: 'closer-to-god-7',
    title: '7 Dias Para Se Aproximar de Deus',
    description: 'Uma jornada de 7 dias para fortalecer sua intimidade com o Criador.',
    emoji: '🕊️',
    duration: 7,
    category: 'Intimidade',
    days: [
      { day: 1, title: 'O Convite de Deus', reading: 'Tiago 4:8', reflection: 'Deus nos convida a nos aproximarmos. Ele promete que, ao darmos um passo em Sua direção, Ele se aproxima de nós. Hoje, dedique um momento para simplesmente estar na presença dEle.', verse: 'Chegai-vos a Deus, e ele se chegará a vós.', verseRef: 'Tiago 4:8' },
      { day: 2, title: 'Ouvindo a Voz de Deus', reading: 'Salmos 46:10', reflection: 'No silêncio, Deus fala. Hoje, pratique ficar em silêncio por 10 minutos. Desligue distrações e simplesmente ouça.', verse: 'Aquietai-vos e sabei que eu sou Deus.', verseRef: 'Salmos 46:10' },
      { day: 3, title: 'A Oração Sincera', reading: 'Mateus 6:5-13', reflection: 'Jesus nos ensinou a orar com simplicidade e sinceridade. Hoje, ore como se estivesse conversando com seu melhor amigo.', verse: 'Mas tu, quando orares, entra no teu quarto e, fechando a tua porta, ora a teu Pai.', verseRef: 'Mateus 6:6' },
      { day: 4, title: 'Gratidão Diária', reading: '1 Tessalonicenses 5:16-18', reflection: 'A gratidão abre nossos olhos para as bênçãos que já temos. Liste 10 coisas pelas quais você é grato hoje.', verse: 'Em tudo dai graças, porque esta é a vontade de Deus em Cristo Jesus para convosco.', verseRef: '1 Tessalonicenses 5:18' },
      { day: 5, title: 'Perdão e Liberdade', reading: 'Colossenses 3:12-14', reflection: 'O perdão é uma chave para a liberdade espiritual. Há alguém que você precisa perdoar? Entregue essa dor a Deus hoje.', verse: 'Assim como o Senhor vos perdoou, assim fazei vós também.', verseRef: 'Colossenses 3:13' },
      { day: 6, title: 'Servindo ao Próximo', reading: 'Gálatas 5:13-14', reflection: 'Servir é uma das formas mais práticas de demonstrar amor. Hoje, faça algo especial por alguém sem esperar nada em troca.', verse: 'Servi uns aos outros pelo amor.', verseRef: 'Gálatas 5:13' },
      { day: 7, title: 'Renovação Diária', reading: 'Lamentações 3:22-23', reflection: 'As misericórdias de Deus se renovam a cada manhã. Renove seu compromisso de buscar a Deus todos os dias.', verse: 'As misericórdias do Senhor são a causa de não sermos consumidos; porque as suas misericórdias não têm fim.', verseRef: 'Lamentações 3:22' },
    ],
  },
  {
    id: 'psalms-comfort-14',
    title: 'Salmos de Conforto',
    description: '14 dias meditando nos Salmos que trazem paz e consolo para a alma.',
    emoji: '💚',
    duration: 14,
    category: 'Conforto',
    days: [
      { day: 1, title: 'O Bom Pastor', reading: 'Salmos 23', reflection: 'Deus cuida de nós como um pastor cuida de suas ovelhas. Nada nos faltará quando caminhamos com Ele.', verse: 'O Senhor é o meu pastor; nada me faltará.', verseRef: 'Salmos 23:1' },
      { day: 2, title: 'Refúgio Seguro', reading: 'Salmos 46', reflection: 'Mesmo quando tudo ao redor parece caótico, Deus é nosso refúgio inabalável.', verse: 'Deus é o nosso refúgio e fortaleza, socorro bem presente nas tribulações.', verseRef: 'Salmos 46:1' },
      { day: 3, title: 'Luz na Escuridão', reading: 'Salmos 27', reflection: 'Quando o medo tenta nos dominar, Deus é a luz que dissipa toda trevas.', verse: 'O Senhor é a minha luz e a minha salvação; a quem temerei?', verseRef: 'Salmos 27:1' },
      { day: 4, title: 'Descanso em Deus', reading: 'Salmos 62', reflection: 'Somente em Deus encontramos verdadeiro descanso. Pare, respire e descanse nEle.', verse: 'Somente em Deus, ó minha alma, espera silenciosa.', verseRef: 'Salmos 62:1' },
      { day: 5, title: 'Proteção Divina', reading: 'Salmos 91', reflection: 'Sob a sombra do Altíssimo, estamos protegidos. Confie na proteção de Deus.', verse: 'Aquele que habita no esconderijo do Altíssimo, à sombra do Onipotente descansará.', verseRef: 'Salmos 91:1' },
      { day: 6, title: 'Deus Ouve Nosso Clamor', reading: 'Salmos 34', reflection: 'Deus está perto dos que têm o coração partido. Ele ouve cada lágrima.', verse: 'Perto está o Senhor dos que têm o coração quebrantado.', verseRef: 'Salmos 34:18' },
      { day: 7, title: 'Misericórdia Infinita', reading: 'Salmos 103', reflection: 'Deus é compassivo e misericordioso. Ele não nos trata conforme nossos pecados.', verse: 'Misericordioso e compassivo é o Senhor, paciente e transbordante de amor.', verseRef: 'Salmos 103:8' },
      { day: 8, title: 'Confiança Inabalável', reading: 'Salmos 37:1-11', reflection: 'Entregue seus caminhos ao Senhor. Confie nEle e Ele agirá.', verse: 'Entrega o teu caminho ao Senhor; confia nele, e ele tudo fará.', verseRef: 'Salmos 37:5' },
      { day: 9, title: 'Alegria no Senhor', reading: 'Salmos 16', reflection: 'Na presença de Deus há plenitude de alegria. Busque essa alegria hoje.', verse: 'Tu me farás ver o caminho da vida; na tua presença há fartura de alegrias.', verseRef: 'Salmos 16:11' },
      { day: 10, title: 'Força na Fraqueza', reading: 'Salmos 73:21-28', reflection: 'Quando nossas forças se esgotam, Deus é a força do nosso coração.', verse: 'A minha carne e o meu coração desfalecem; mas Deus é a fortaleza do meu coração.', verseRef: 'Salmos 73:26' },
      { day: 11, title: 'Esperança Renovada', reading: 'Salmos 42', reflection: 'Como a corça anseia por águas, nossa alma anseia por Deus. Nele está a esperança.', verse: 'Por que estás abatida, ó minha alma? Espera em Deus.', verseRef: 'Salmos 42:11' },
      { day: 12, title: 'Cura e Restauração', reading: 'Salmos 147:1-6', reflection: 'Deus sara os quebrantados de coração e liga as suas feridas.', verse: 'Sara os quebrantados de coração e liga-lhes as feridas.', verseRef: 'Salmos 147:3' },
      { day: 13, title: 'Fidelidade de Deus', reading: 'Salmos 89:1-8', reflection: 'A fidelidade de Deus alcança as nuvens. Ele nunca falha.', verse: 'Cantarei para sempre as misericórdias do Senhor.', verseRef: 'Salmos 89:1' },
      { day: 14, title: 'Louvor e Adoração', reading: 'Salmos 150', reflection: 'Que tudo o que tem fôlego louve ao Senhor! Termine esta jornada louvando.', verse: 'Tudo quanto tem fôlego louve ao Senhor. Aleluia!', verseRef: 'Salmos 150:6' },
    ],
  },
  {
    id: 'parables-jesus-10',
    title: 'Parábolas de Jesus',
    description: '10 dias estudando as parábolas mais importantes de Jesus.',
    emoji: '✨',
    duration: 10,
    category: 'Ensinamentos',
    days: [
      { day: 1, title: 'O Semeador', reading: 'Mateus 13:1-23', reflection: 'A semente é a Palavra de Deus. Que tipo de solo é o seu coração?', verse: 'Mas o que foi semeado em boa terra é o que ouve a palavra e a compreende.', verseRef: 'Mateus 13:23' },
      { day: 2, title: 'O Filho Pródigo', reading: 'Lucas 15:11-32', reflection: 'O amor do Pai é incondicional. Não importa o quão longe você esteja, Ele espera por você.', verse: 'Estando ele ainda longe, viu-o seu pai, encheu-se de compaixão e, correndo, lançou-se-lhe ao pescoço e o beijou.', verseRef: 'Lucas 15:20' },
      { day: 3, title: 'O Bom Samaritano', reading: 'Lucas 10:25-37', reflection: 'Amar ao próximo é agir com compaixão, sem preconceitos. Quem é o seu próximo?', verse: 'Vai, e faze da mesma maneira.', verseRef: 'Lucas 10:37' },
      { day: 4, title: 'Os Talentos', reading: 'Mateus 25:14-30', reflection: 'Deus nos deu dons e talentos. Estamos usando-os para a glória dEle?', verse: 'A quem muito foi dado, muito será exigido.', verseRef: 'Lucas 12:48' },
      { day: 5, title: 'A Ovelha Perdida', reading: 'Lucas 15:1-7', reflection: 'Cada pessoa importa para Deus. Ele deixa as 99 para buscar a que se perdeu.', verse: 'Há alegria no céu por um pecador que se arrepende.', verseRef: 'Lucas 15:7' },
      { day: 6, title: 'O Fariseu e o Publicano', reading: 'Lucas 18:9-14', reflection: 'A humildade agrada a Deus mais que a religiosidade vazia.', verse: 'Porque qualquer que a si mesmo se exaltar será humilhado; e qualquer que a si mesmo se humilhar será exaltado.', verseRef: 'Lucas 18:14' },
      { day: 7, title: 'A Casa na Rocha', reading: 'Mateus 7:24-27', reflection: 'Construir sobre a rocha é ouvir e praticar a Palavra de Deus.', verse: 'Todo aquele que ouve estas minhas palavras e as pratica será comparado a um homem prudente.', verseRef: 'Mateus 7:24' },
      { day: 8, title: 'O Joio e o Trigo', reading: 'Mateus 13:24-30,36-43', reflection: 'No mundo, o bem e o mal coexistem. Mas Deus fará a separação no tempo certo.', verse: 'Deixai crescer ambos juntos até à ceifa.', verseRef: 'Mateus 13:30' },
      { day: 9, title: 'As Dez Virgens', reading: 'Mateus 25:1-13', reflection: 'Esteja preparado! Não sabemos quando o Senhor voltará.', verse: 'Vigiai, pois, porque não sabeis o dia nem a hora.', verseRef: 'Mateus 25:13' },
      { day: 10, title: 'A Pérola de Grande Valor', reading: 'Mateus 13:45-46', reflection: 'O Reino de Deus vale mais que tudo. Vale a pena entregar tudo por Ele.', verse: 'O reino dos céus é semelhante a um negociante que buscava boas pérolas.', verseRef: 'Mateus 13:45' },
    ],
  },
  {
    id: 'women-bible-7',
    title: 'Mulheres da Bíblia',
    description: '7 dias conhecendo mulheres que marcaram a história bíblica.',
    emoji: '👑',
    duration: 7,
    category: 'Personagens',
    days: [
      { day: 1, title: 'Maria, Mãe de Jesus', reading: 'Lucas 1:26-56', reflection: 'Maria disse "sim" a Deus mesmo sem entender tudo. Sua fé e obediência mudaram a história.', verse: 'Eis aqui a serva do Senhor; cumpra-se em mim segundo a tua palavra.', verseRef: 'Lucas 1:38' },
      { day: 2, title: 'Ester, a Corajosa', reading: 'Ester 4:1-17', reflection: 'Ester arriscou tudo pelo seu povo. Deus nos posiciona para tempos como este.', verse: 'Quem sabe se não foi para um tempo como este que chegaste a ser rainha?', verseRef: 'Ester 4:14' },
      { day: 3, title: 'Rute, a Leal', reading: 'Rute 1:1-18', reflection: 'A lealdade de Rute a Noemi é um exemplo de amor sacrificial.', verse: 'Aonde quer que fores, irei eu; e onde quer que pousares, ali pousarei eu.', verseRef: 'Rute 1:16' },
      { day: 4, title: 'Sara, a Perseverante', reading: 'Gênesis 18:1-15; 21:1-7', reflection: 'Sara esperou décadas pela promessa. Deus é fiel mesmo quando a espera é longa.', verse: 'Há alguma coisa demasiado difícil para o Senhor?', verseRef: 'Gênesis 18:14' },
      { day: 5, title: 'Ana, a que Orava', reading: '1 Samuel 1:1-28', reflection: 'Ana derramou sua alma em oração. Deus ouviu e respondeu sua súplica.', verse: 'Por este menino orava eu, e o Senhor me concedeu a petição que eu lhe fizera.', verseRef: '1 Samuel 1:27' },
      { day: 6, title: 'Débora, a Líder', reading: 'Juízes 4:1-16', reflection: 'Débora liderou Israel com sabedoria e coragem. Deus usa quem está disponível.', verse: 'Levanta-te, porque este é o dia em que o Senhor entregou a Sísera nas tuas mãos.', verseRef: 'Juízes 4:14' },
      { day: 7, title: 'Maria Madalena, a Transformada', reading: 'João 20:1-18', reflection: 'Maria Madalena foi a primeira a ver Jesus ressurrecto. O encontro com Cristo transforma vidas.', verse: 'Vi o Senhor!', verseRef: 'João 20:18' },
    ],
  },
];
