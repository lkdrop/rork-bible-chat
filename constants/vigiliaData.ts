export interface VigiliaDay {
  day: number;
  theme: string;
  verse: string;
  verseRef: string;
  challenge: string;
  prayerFocus: string;
}

export const vigiliaDays: VigiliaDay[] = [
  { day: 1, theme: 'Consagração', verse: 'Santificai-vos, porque amanhã o Senhor fará maravilhas no meio de vós.', verseRef: 'Josué 3:5', challenge: 'Separe 15 minutos em silêncio diante de Deus hoje.', prayerFocus: 'Consagrar sua vida e este período de jejum ao Senhor.' },
  { day: 2, theme: 'Arrependimento', verse: 'Se o meu povo, que se chama pelo meu nome, se humilhar, orar e buscar a minha face e se afastar dos seus maus caminhos, eu os ouvirei dos céus, perdoarei os seus pecados e sararei a sua terra.', verseRef: '2 Crônicas 7:14', challenge: 'Escreva uma carta de arrependimento a Deus no seu diário.', prayerFocus: 'Pedir perdão e se arrepender de tudo que te afasta de Deus.' },
  { day: 3, theme: 'Intimidade com Deus', verse: 'Achegai-vos a Deus, e ele se achegará a vós.', verseRef: 'Tiago 4:8', challenge: 'Ore de joelhos por pelo menos 10 minutos.', prayerFocus: 'Buscar intimidade profunda com o Pai celestial.' },
  { day: 4, theme: 'Quebrantamento', verse: 'Perto está o Senhor dos que têm o coração quebrantado e salva os de espírito oprimido.', verseRef: 'Salmos 34:18', challenge: 'Identifique uma área da sua vida que precisa ser entregue a Deus.', prayerFocus: 'Entregar suas fortalezas e orgulho ao Senhor.' },
  { day: 5, theme: 'Fé', verse: 'Ora, a fé é a certeza daquilo que esperamos e a prova das coisas que não vemos.', verseRef: 'Hebreus 11:1', challenge: 'Escreva 3 coisas que você crê que Deus fará na sua vida.', prayerFocus: 'Fortalecer sua fé e crer nas promessas de Deus.' },
  { day: 6, theme: 'Perdão', verse: 'Perdoem como o Senhor lhes perdoou.', verseRef: 'Colossenses 3:13', challenge: 'Ore por alguém que te magoou. Libere o perdão.', prayerFocus: 'Liberar perdão e ser livre de toda amargura.' },
  { day: 7, theme: 'Gratidão', verse: 'Em tudo dai graças, porque esta é a vontade de Deus em Cristo Jesus para convosco.', verseRef: '1 Tessalonicenses 5:18', challenge: 'Liste 10 bênçãos pelas quais você é grato.', prayerFocus: 'Agradecer a Deus por tudo que Ele já fez.' },
  { day: 8, theme: 'Palavra de Deus', verse: 'Lâmpada para os meus pés é a tua palavra, e luz para o meu caminho.', verseRef: 'Salmos 119:105', challenge: 'Leia um capítulo inteiro dos Salmos em voz alta.', prayerFocus: 'Pedir que a Palavra viva e eficaz transforme sua mente.' },
  { day: 9, theme: 'Espírito Santo', verse: 'Mas receberão poder quando o Espírito Santo descer sobre vocês.', verseRef: 'Atos 1:8', challenge: 'Ore em voz alta pedindo o batismo do Espírito Santo.', prayerFocus: 'Ser cheio do Espírito Santo e dos seus dons.' },
  { day: 10, theme: 'Guerra Espiritual', verse: 'Porque a nossa luta não é contra carne e sangue, mas contra os poderes e autoridades.', verseRef: 'Efésios 6:12', challenge: 'Vista a armadura de Deus declarando cada peça em voz alta (Ef 6:13-18).', prayerFocus: 'Vencer toda batalha espiritual com a autoridade de Cristo.' },
  { day: 11, theme: 'Família', verse: 'Eu e a minha casa serviremos ao Senhor.', verseRef: 'Josué 24:15', challenge: 'Ore por cada membro da sua família pelo nome.', prayerFocus: 'Cobertura espiritual sobre sua família e futuras gerações.' },
  { day: 12, theme: 'Cura', verse: 'Ele mesmo levou em seu corpo os nossos pecados sobre o madeiro, para que morrêssemos para os pecados e vivêssemos para a justiça; por suas feridas vocês foram curados.', verseRef: '1 Pedro 2:24', challenge: 'Ore por alguém que está doente. Envie uma mensagem de encorajamento.', prayerFocus: 'Cura física, emocional e espiritual.' },
  { day: 13, theme: 'Provisão', verse: 'O meu Deus suprirá todas as necessidades de vocês, de acordo com as suas gloriosas riquezas em Cristo Jesus.', verseRef: 'Filipenses 4:19', challenge: 'Entregue suas finanças e necessidades ao Senhor.', prayerFocus: 'Confiar na provisão sobrenatural de Deus.' },
  { day: 14, theme: 'Propósito', verse: 'Porque eu sei os planos que tenho para vocês, diz o Senhor, planos de fazê-los prosperar e não de causar dano, planos de dar esperança e um futuro.', verseRef: 'Jeremias 29:11', challenge: 'Escreva o que você acredita ser o propósito de Deus para sua vida.', prayerFocus: 'Clareza do chamado e propósito divino.' },
  { day: 15, theme: 'Adoração', verse: 'Deus é espírito, e é necessário que os seus adoradores o adorem em espírito e em verdade.', verseRef: 'João 4:24', challenge: 'Separe 20 minutos apenas para adorar com louvor.', prayerFocus: 'Entrar em adoração profunda e extravagante.' },
  { day: 16, theme: 'Obediência', verse: 'Se vocês me amam, obedecerão aos meus mandamentos.', verseRef: 'João 14:15', challenge: 'Identifique algo que Deus pediu e você não obedeceu. Obedeça hoje.', prayerFocus: 'Um coração obediente e submisso à vontade de Deus.' },
  { day: 17, theme: 'Missões', verse: 'Portanto, vão e façam discípulos de todas as nações.', verseRef: 'Mateus 28:19', challenge: 'Compartilhe um versículo com alguém que não conhece a Deus.', prayerFocus: 'Pelos missionários e pela evangelização do Brasil.' },
  { day: 18, theme: 'Humildade', verse: 'Humilhem-se diante do Senhor, e ele os exaltará.', verseRef: 'Tiago 4:10', challenge: 'Faça um ato de serviço anônimo por alguém hoje.', prayerFocus: 'Ter o mesmo sentimento que houve em Cristo Jesus.' },
  { day: 19, theme: 'Esperança', verse: 'Aqueles que esperam no Senhor renovam as suas forças.', verseRef: 'Isaías 40:31', challenge: 'Ore por todas as suas promessas não cumpridas com fé.', prayerFocus: 'Renovar a esperança em cada área da vida.' },
  { day: 20, theme: 'Avivamento', verse: 'Ó Senhor, aviva a tua obra no meio dos anos.', verseRef: 'Habacuque 3:2', challenge: 'Ore pelo avivamento da sua igreja e da sua cidade.', prayerFocus: 'Um mover poderoso do Espírito Santo nesta geração.' },
  { day: 21, theme: 'Nova Estação', verse: 'Eis que faço coisa nova; ela já está aparecendo. Vocês não a reconhecem?', verseRef: 'Isaías 43:19', challenge: 'Escreva seu testemunho desta vigília. O que Deus fez em você?', prayerFocus: 'Declarar que uma nova estação começa a partir de hoje.' },
];
