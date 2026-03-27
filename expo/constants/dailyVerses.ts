export interface DailyVerse {
  text: string;
  reference: string;
  translation: string;
}

export const dailyVerses: DailyVerse[] = [
  { text: "Porque Deus tanto amou o mundo que deu o seu Filho Unigênito, para que todo o que nele crer não pereça, mas tenha a vida eterna.", reference: "João 3:16", translation: "NVI" },
  { text: "O Senhor é o meu pastor; nada me faltará.", reference: "Salmos 23:1", translation: "ARA" },
  { text: "Tudo posso naquele que me fortalece.", reference: "Filipenses 4:13", translation: "ARA" },
  { text: "Confie no Senhor de todo o seu coração e não se apoie em seu próprio entendimento.", reference: "Provérbios 3:5", translation: "NVI" },
  { text: "Pois eu sei os planos que tenho para vocês, diz o Senhor, planos de fazê-los prosperar e não de causar dano, planos de dar a vocês esperança e um futuro.", reference: "Jeremias 29:11", translation: "NVI" },
  { text: "Não se preocupem com nada, mas em tudo, pela oração e súplicas, e com ação de graças, apresentem seus pedidos a Deus.", reference: "Filipenses 4:6", translation: "NVI" },
  { text: "Deus é o nosso refúgio e fortaleza, socorro bem presente nas tribulações.", reference: "Salmos 46:1", translation: "ARA" },
  { text: "Mas os que esperam no Senhor renovam as suas forças, sobem com asas como águias, correm e não se cansam, caminham e não se fatigam.", reference: "Isaías 40:31", translation: "ARA" },
  { text: "A oração feita por um justo pode muito em seus efeitos.", reference: "Tiago 5:16", translation: "ARA" },
  { text: "Vinde a mim, todos os que estais cansados e sobrecarregados, e eu vos aliviarei.", reference: "Mateus 11:28", translation: "ARA" },
  { text: "Deem graças ao Senhor porque ele é bom; o seu amor dura para sempre.", reference: "Salmos 107:1", translation: "NVI" },
  { text: "O Senhor é a minha luz e a minha salvação; a quem temerei?", reference: "Salmos 27:1", translation: "NVI" },
  { text: "Entrega o teu caminho ao Senhor; confia nele, e ele tudo fará.", reference: "Salmos 37:5", translation: "ARA" },
  { text: "Porque para Deus nada é impossível.", reference: "Lucas 1:37", translation: "NVI" },
  { text: "A paz deixo convosco, a minha paz vos dou; não vo-la dou como o mundo a dá. Não se turbe o vosso coração, nem se atemorize.", reference: "João 14:27", translation: "ARA" },
  { text: "Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus; eu te fortaleço, e te ajudo, e te sustento com a minha destra fiel.", reference: "Isaías 41:10", translation: "ARA" },
  { text: "Sede fortes e corajosos. Não temam nem fiquem apavorados, pois o Senhor, o seu Deus, vai com vocês; nunca os deixará, nunca os abandonará.", reference: "Deuteronômio 31:6", translation: "NVI" },
  { text: "Buscai primeiro o Reino de Deus e a sua justiça, e todas essas coisas vos serão acrescentadas.", reference: "Mateus 6:33", translation: "ARA" },
  { text: "Lâmpada para os meus pés é a tua palavra e, luz para os meus caminhos.", reference: "Salmos 119:105", translation: "ARA" },
  { text: "O amor é paciente, o amor é bondoso. Não inveja, não se vangloria, não se orgulha.", reference: "1 Coríntios 13:4", translation: "NVI" },
  { text: "Alegrem-se sempre no Senhor. Novamente direi: alegrem-se!", reference: "Filipenses 4:4", translation: "NVI" },
  { text: "E sabemos que todas as coisas cooperam para o bem daqueles que amam a Deus.", reference: "Romanos 8:28", translation: "ARA" },
  { text: "Clama a mim, e responder-te-ei e anunciar-te-ei coisas grandes e ocultas, que não sabes.", reference: "Jeremias 33:3", translation: "ARA" },
  { text: "O Senhor é bom, uma fortaleza no dia da angústia, e conhece os que nele se refugiam.", reference: "Naum 1:7", translation: "ARA" },
  { text: "Bem-aventurados os pacificadores, porque serão chamados filhos de Deus.", reference: "Mateus 5:9", translation: "NVI" },
  { text: "O Senhor combaterá por vós, e vós vos calareis.", reference: "Êxodo 14:14", translation: "ARA" },
  { text: "Misericordioso e compassivo é o Senhor, paciente e transbordante de amor.", reference: "Salmos 103:8", translation: "NVI" },
  { text: "Que o Deus da esperança os encha de toda alegria e paz, por sua confiança nele.", reference: "Romanos 15:13", translation: "NVI" },
  { text: "Jesus disse: Eu sou o caminho, a verdade e a vida. Ninguém vem ao Pai, a não ser por mim.", reference: "João 14:6", translation: "NVI" },
  { text: "Porque dele, e por ele, e para ele são todas as coisas. Glória, pois, a ele eternamente.", reference: "Romanos 11:36", translation: "ARA" },
  { text: "Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas.", reference: "Salmos 23:2", translation: "ARA" },
];

export function getTodayVerse(): DailyVerse {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return dailyVerses[dayOfYear % dailyVerses.length];
}
