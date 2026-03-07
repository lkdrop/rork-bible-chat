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
  premium?: boolean;
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
  {
    id: 'daniel-fast-21',
    title: 'Jejum de Daniel — 21 Dias',
    description: 'Uma jornada profunda de 21 dias seguindo o modelo de jejum e oração de Daniel.',
    emoji: '🦁',
    duration: 21,
    category: 'Jejum',
    premium: true,
    days: [
      { day: 1, title: 'O Início da Consagração', reading: 'Daniel 1:1-21', reflection: 'Daniel escolheu não se contaminar. Hoje inicia sua jornada de consagração. Separe seu coração para Deus.', verse: 'Daniel, porém, propôs no seu coração não se contaminar.', verseRef: 'Daniel 1:8' },
      { day: 2, title: 'Oração Persistente', reading: 'Daniel 6:1-10', reflection: 'Daniel orava três vezes ao dia, mesmo sob ameaça de morte. A persistência na oração é a chave.', verse: 'Quando Daniel soube que o documento estava assinado, entrou em sua casa e orava três vezes por dia.', verseRef: 'Daniel 6:10' },
      { day: 3, title: 'Humildade e Jejum', reading: 'Daniel 9:1-19', reflection: 'Daniel jejuou buscando o cumprimento das promessas de Deus. O jejum nos posiciona para receber.', verse: 'Ó Senhor, ouve; ó Senhor, perdoa; ó Senhor, atende e age sem demora.', verseRef: 'Daniel 9:19' },
      { day: 4, title: 'Revelações de Deus', reading: 'Daniel 2:1-23', reflection: 'Deus revela mistérios aos que O buscam. Peça revelação e entendimento hoje.', verse: 'Ele revela o profundo e o escondido; conhece o que está em trevas.', verseRef: 'Daniel 2:22' },
      { day: 5, title: 'Fé na Fornalha', reading: 'Daniel 3:1-30', reflection: 'Mesmo na fornalha ardente, Deus está conosco. Suas provações não são maiores que seu Deus.', verse: 'O nosso Deus, a quem nós servimos, é que nos pode livrar.', verseRef: 'Daniel 3:17' },
      { day: 6, title: 'Integridade Inabalável', reading: 'Daniel 6:1-28', reflection: 'A integridade de Daniel o protegeu. Viva com excelência em todas as áreas.', verse: 'Nenhum erro ou culpa se achou nele.', verseRef: 'Daniel 6:4' },
      { day: 7, title: 'Sabedoria do Alto', reading: 'Daniel 1:17-20', reflection: 'Deus dá sabedoria superior aos que O buscam. Peça sabedoria hoje.', verse: 'A estes quatro jovens Deus deu conhecimento e inteligência.', verseRef: 'Daniel 1:17' },
      { day: 8, title: 'Visão e Propósito', reading: 'Daniel 7:1-14', reflection: 'Deus tem visões maiores do que podemos imaginar. Busque Sua visão para sua vida.', verse: 'Foi-lhe dado domínio, glória e reino, para que todos os povos o servissem.', verseRef: 'Daniel 7:14' },
      { day: 9, title: 'Intercessão', reading: 'Daniel 9:1-11', reflection: 'Daniel intercedeu pelo seu povo. Ore por sua família, cidade e nação.', verse: 'Inclinai os vossos ouvidos, ó Deus meu, e ouvi.', verseRef: 'Daniel 9:18' },
      { day: 10, title: 'Resposta Celestial', reading: 'Daniel 10:1-14', reflection: 'Sua oração foi ouvida desde o primeiro dia. Não desista de orar.', verse: 'Desde o primeiro dia as tuas palavras foram ouvidas.', verseRef: 'Daniel 10:12' },
      { day: 11, title: 'Força em Fraqueza', reading: 'Daniel 10:15-19', reflection: 'Quando estamos fracos, Deus nos fortalece. Receba força hoje.', verse: 'Não temas, homem muito amado; paz seja contigo! Sê forte, sim, sê forte!', verseRef: 'Daniel 10:19' },
      { day: 12, title: 'Confiança Total', reading: 'Daniel 3:16-18', reflection: 'Confie em Deus mesmo sem entender o resultado. Ele é soberano.', verse: 'Mas, se não o fizer, fica sabendo, ó rei, que não serviremos a teus deuses.', verseRef: 'Daniel 3:18' },
      { day: 13, title: 'Resistência Espiritual', reading: 'Efésios 6:10-18', reflection: 'A luta é espiritual. Vista a armadura completa de Deus.', verse: 'Revesti-vos de toda a armadura de Deus.', verseRef: 'Efésios 6:11' },
      { day: 14, title: 'Renovação da Mente', reading: 'Romanos 12:1-2', reflection: 'O jejum renova nossa mente e transforma nosso modo de pensar.', verse: 'Transformai-vos pela renovação do vosso entendimento.', verseRef: 'Romanos 12:2' },
      { day: 15, title: 'Poder da Adoração', reading: '2 Crônicas 20:1-22', reflection: 'A adoração precede a vitória. Adore antes de ver o resultado.', verse: 'Quando começaram a cantar e a dar louvores, o Senhor pôs emboscadas.', verseRef: '2 Crônicas 20:22' },
      { day: 16, title: 'Obediência Radical', reading: '1 Samuel 15:1-23', reflection: 'Obedecer é melhor que sacrificar. Obedeça à voz de Deus sem reservas.', verse: 'Eis que o obedecer é melhor do que o sacrificar.', verseRef: '1 Samuel 15:22' },
      { day: 17, title: 'Promessas de Deus', reading: '2 Coríntios 1:20', reflection: 'Todas as promessas de Deus são sim e amém em Cristo. Declare as promessas.', verse: 'Pois quantas forem as promessas de Deus, nele está o sim.', verseRef: '2 Coríntios 1:20' },
      { day: 18, title: 'Quebrantamento', reading: 'Salmos 51:1-19', reflection: 'Um coração quebrantado Deus não rejeita. Venha como você está.', verse: 'Um coração quebrantado e contrito, ó Deus, não o desprezarás.', verseRef: 'Salmos 51:17' },
      { day: 19, title: 'Esperança Viva', reading: '1 Pedro 1:3-9', reflection: 'Temos uma esperança viva pela ressurreição de Cristo. Nada pode tirar isso de nós.', verse: 'Bendito seja o Deus que nos gerou de novo para uma viva esperança.', verseRef: '1 Pedro 1:3' },
      { day: 20, title: 'Vitória Próxima', reading: '1 Coríntios 15:57-58', reflection: 'A vitória já é sua em Cristo. Continue firme, pois seu trabalho no Senhor não é em vão.', verse: 'Graças a Deus, que nos dá a vitória por nosso Senhor Jesus Cristo.', verseRef: '1 Coríntios 15:57' },
      { day: 21, title: 'Nova Estação', reading: 'Isaías 43:18-19', reflection: 'Estes 21 dias marcam o início de algo novo. Deus está fazendo coisa nova em sua vida.', verse: 'Eis que faço coisa nova; ela já está aparecendo. Vocês não a reconhecem?', verseRef: 'Isaías 43:19' },
    ],
  },
  {
    id: 'gods-promises-10',
    title: 'Promessas de Deus para Momentos Difíceis',
    description: '10 dias descobrindo as promessas de Deus para cada área da sua vida.',
    emoji: '🌈',
    duration: 10,
    category: 'Promessas',
    days: [
      { day: 1, title: 'Promessa de Presença', reading: 'Isaías 41:10', reflection: 'Deus promete estar sempre conosco. Você nunca está sozinho, mesmo nos momentos mais difíceis.', verse: 'Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus.', verseRef: 'Isaías 41:10' },
      { day: 2, title: 'Promessa de Provisão', reading: 'Filipenses 4:19', reflection: 'Deus conhece suas necessidades e promete suprir cada uma delas.', verse: 'O meu Deus suprirá todas as necessidades de vocês.', verseRef: 'Filipenses 4:19' },
      { day: 3, title: 'Promessa de Paz', reading: 'João 14:27', reflection: 'A paz que Jesus dá não é como a do mundo. É uma paz sobrenatural que guarda seu coração.', verse: 'Deixo-vos a paz, a minha paz vos dou; não vo-la dou como o mundo a dá.', verseRef: 'João 14:27' },
      { day: 4, title: 'Promessa de Cura', reading: 'Isaías 53:5', reflection: 'Pelas feridas de Jesus, fomos curados. Essa promessa é para você hoje.', verse: 'Pelas suas pisaduras fomos sarados.', verseRef: 'Isaías 53:5' },
      { day: 5, title: 'Promessa de Força', reading: 'Filipenses 4:13', reflection: 'Tudo posso naquele que me fortalece. Não importa o desafio, Cristo te dá força.', verse: 'Tudo posso naquele que me fortalece.', verseRef: 'Filipenses 4:13' },
      { day: 6, title: 'Promessa de Propósito', reading: 'Jeremias 29:11', reflection: 'Deus tem planos de paz e esperança para você. Confie no Seu plano.', verse: 'Eu sei os planos que tenho para vocês, planos de fazê-los prosperar.', verseRef: 'Jeremias 29:11' },
      { day: 7, title: 'Promessa de Perdão', reading: '1 João 1:9', reflection: 'Se confessarmos nossos pecados, Ele é fiel para nos perdoar. Não carregue culpa.', verse: 'Se confessarmos os nossos pecados, ele é fiel e justo para nos perdoar.', verseRef: '1 João 1:9' },
      { day: 8, title: 'Promessa de Vitória', reading: 'Romanos 8:37', reflection: 'Em tudo somos mais que vencedores por aquele que nos amou.', verse: 'Em todas estas coisas somos mais do que vencedores.', verseRef: 'Romanos 8:37' },
      { day: 9, title: 'Promessa de Direção', reading: 'Provérbios 3:5-6', reflection: 'Confie no Senhor de todo o coração e Ele endireitará suas veredas.', verse: 'Confia no Senhor de todo o teu coração e em todo o teu caminho o reconhece.', verseRef: 'Provérbios 3:5-6' },
      { day: 10, title: 'Promessa de Eternidade', reading: 'João 3:16', reflection: 'A maior promessa: vida eterna para todo aquele que crê. Isso muda tudo.', verse: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito.', verseRef: 'João 3:16' },
    ],
  },
  {
    id: 'fruits-spirit-9',
    title: 'Frutos do Espírito na Prática',
    description: '9 dias explorando cada fruto do Espírito Santo e como vivê-los.',
    emoji: '🍇',
    duration: 9,
    category: 'Vida Cristã',
    days: [
      { day: 1, title: 'Amor', reading: '1 Coríntios 13:1-13', reflection: 'O amor é o maior de todos os frutos. Sem amor, nada mais tem valor. Pratique amor radical hoje.', verse: 'O amor é paciente, o amor é bondoso. Não inveja, não se vangloria.', verseRef: '1 Coríntios 13:4' },
      { day: 2, title: 'Alegria', reading: 'Filipenses 4:4-7', reflection: 'A alegria do Senhor é diferente da felicidade mundana. Ela permanece mesmo nas dificuldades.', verse: 'Alegrai-vos sempre no Senhor; outra vez digo: alegrai-vos!', verseRef: 'Filipenses 4:4' },
      { day: 3, title: 'Paz', reading: 'Colossenses 3:15-17', reflection: 'A paz de Cristo deve governar seu coração. Deixe a paz ser sua bússola nas decisões.', verse: 'A paz de Cristo governe o vosso coração.', verseRef: 'Colossenses 3:15' },
      { day: 4, title: 'Paciência', reading: 'Tiago 1:2-4', reflection: 'A paciência se desenvolve nas provações. Cada desafio é uma oportunidade de crescer.', verse: 'Sabendo que a provação da vossa fé produz perseverança.', verseRef: 'Tiago 1:3' },
      { day: 5, title: 'Bondade', reading: 'Efésios 4:32', reflection: 'Seja bondoso hoje com alguém que não merece. Assim Deus fez conosco.', verse: 'Sede bondosos uns para com os outros, compassivos, perdoando-vos.', verseRef: 'Efésios 4:32' },
      { day: 6, title: 'Benignidade', reading: 'Romanos 2:4', reflection: 'A benignidade de Deus nos conduz ao arrependimento. Seja benigno com os outros.', verse: 'Não sabes que a benignidade de Deus é que te conduz ao arrependimento?', verseRef: 'Romanos 2:4' },
      { day: 7, title: 'Fidelidade', reading: 'Mateus 25:21', reflection: 'Seja fiel no pouco para receber o muito. A fidelidade é a marca dos servos de Deus.', verse: 'Muito bem, servo bom e fiel; sobre o pouco foste fiel, sobre o muito te colocarei.', verseRef: 'Mateus 25:21' },
      { day: 8, title: 'Mansidão', reading: 'Mateus 11:28-30', reflection: 'Jesus é manso e humilde de coração. Aprenda dEle a ser manso mesmo em situações difíceis.', verse: 'Aprendei de mim, que sou manso e humilde de coração.', verseRef: 'Mateus 11:29' },
      { day: 9, title: 'Domínio Próprio', reading: '2 Timóteo 1:7', reflection: 'Deus nos deu espírito de poder, amor e domínio próprio. Você tem autoridade sobre seus impulsos.', verse: 'Deus não nos deu espírito de covardia, mas de poder, de amor e de domínio próprio.', verseRef: '2 Timóteo 1:7' },
    ],
  },
];
