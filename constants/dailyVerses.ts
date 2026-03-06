export interface DailyVerse {
  verse: string;
  reference: string;
}

export const dailyVerses: DailyVerse[] = [
  { verse: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.", reference: "João 3:16" },
  { verse: "O Senhor é o meu pastor; nada me faltará.", reference: "Salmos 23:1" },
  { verse: "Tudo posso naquele que me fortalece.", reference: "Filipenses 4:13" },
  { verse: "Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento.", reference: "Provérbios 3:5" },
  { verse: "Porque eu sei os planos que tenho para vocês, diz o Senhor, planos de prosperidade e não de calamidade, para dar-lhes um futuro e uma esperança.", reference: "Jeremias 29:11" },
  { verse: "O Senhor é a minha luz e a minha salvação; a quem temerei?", reference: "Salmos 27:1" },
  { verse: "Mas os que esperam no Senhor renovarão as suas forças; subirão com asas como águias.", reference: "Isaías 40:31" },
  { verse: "Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus.", reference: "Isaías 41:10" },
  { verse: "E conhecereis a verdade, e a verdade vos libertará.", reference: "João 8:32" },
  { verse: "Lança o teu cuidado sobre o Senhor, e ele te susterá.", reference: "Salmos 55:22" },
  { verse: "A oração feita por um justo pode muito em seus efeitos.", reference: "Tiago 5:16" },
  { verse: "Alegrai-vos sempre no Senhor; outra vez digo: alegrai-vos!", reference: "Filipenses 4:4" },
  { verse: "O Senhor te abençoe e te guarde; o Senhor faça resplandecer o seu rosto sobre ti.", reference: "Números 6:24-25" },
  { verse: "Deus é o nosso refúgio e fortaleza, socorro bem presente na angústia.", reference: "Salmos 46:1" },
  { verse: "Clama a mim, e responder-te-ei, e anunciar-te-ei coisas grandes e firmes, que não sabes.", reference: "Jeremias 33:3" },
  { verse: "Porque onde estiver o vosso tesouro, aí estará também o vosso coração.", reference: "Mateus 6:21" },
  { verse: "Eu sou o caminho, a verdade e a vida; ninguém vem ao Pai senão por mim.", reference: "João 14:6" },
  { verse: "Sede fortes e corajosos. Não tenham medo nem fiquem apavorados, pois o Senhor vai com vocês.", reference: "Deuteronômio 31:6" },
  { verse: "E a paz de Deus, que excede todo o entendimento, guardará os vossos corações.", reference: "Filipenses 4:7" },
  { verse: "Busquem primeiro o Reino de Deus e a sua justiça, e todas essas coisas lhes serão acrescentadas.", reference: "Mateus 6:33" },
  { verse: "Porque para Deus nada é impossível.", reference: "Lucas 1:37" },
  { verse: "O Senhor lutará por vocês; tão somente aquietem-se.", reference: "Êxodo 14:14" },
  { verse: "Vinde a mim, todos os que estais cansados e sobrecarregados, e eu vos aliviarei.", reference: "Mateus 11:28" },
  { verse: "Em todo o tempo ama o amigo; e para a hora da angústia nasce o irmão.", reference: "Provérbios 17:17" },
  { verse: "Deleita-te também no Senhor, e ele te concederá os desejos do teu coração.", reference: "Salmos 37:4" },
  { verse: "Pois o Senhor Deus é sol e escudo; o Senhor concede favor e honra.", reference: "Salmos 84:11" },
  { verse: "Bem-aventurados os pacificadores, porque serão chamados filhos de Deus.", reference: "Mateus 5:9" },
  { verse: "Ora, a fé é a certeza daquilo que esperamos e a prova das coisas que não vemos.", reference: "Hebreus 11:1" },
  { verse: "Grande é o Senhor e muito digno de louvor; a sua grandeza é insondável.", reference: "Salmos 145:3" },
  { verse: "Entrega o teu caminho ao Senhor; confia nele, e ele tudo fará.", reference: "Salmos 37:5" },
];

export function getDailyVerse(): DailyVerse {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const index = dayOfYear % dailyVerses.length;
  return dailyVerses[index];
}
