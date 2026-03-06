export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: 'oracao' | 'leitura' | 'acao' | 'reflexao' | 'comunhao';
  points: number;
}

export const dailyChallenges: DailyChallenge[] = [
  { id: 'c1', title: 'Oração Matinal', description: 'Ore por 5 minutos logo ao acordar, antes de pegar o celular', emoji: '🌅', category: 'oracao', points: 10 },
  { id: 'c2', title: 'Leia um Salmo', description: 'Leia um Salmo inteiro e medite sobre ele', emoji: '📖', category: 'leitura', points: 15 },
  { id: 'c3', title: 'Ato de Bondade', description: 'Faça algo gentil por alguém sem esperar nada em troca', emoji: '💝', category: 'acao', points: 20 },
  { id: 'c4', title: 'Diário de Gratidão', description: 'Escreva 5 coisas pelas quais você é grato hoje', emoji: '📝', category: 'reflexao', points: 10 },
  { id: 'c5', title: 'Compartilhe a Fé', description: 'Envie um versículo encorajador para alguém', emoji: '💬', category: 'comunhao', points: 15 },
  { id: 'c6', title: 'Jejum Digital', description: 'Fique 1 hora sem redes sociais e use o tempo com Deus', emoji: '📵', category: 'reflexao', points: 20 },
  { id: 'c7', title: 'Ore por Alguém', description: 'Escolha uma pessoa e ore especificamente por ela', emoji: '🙏', category: 'oracao', points: 10 },
  { id: 'c8', title: 'Leia Provérbios', description: 'Leia o capítulo de Provérbios do dia do mês', emoji: '💡', category: 'leitura', points: 15 },
  { id: 'c9', title: 'Perdoe Alguém', description: 'Perdoe alguém que te magoou, mesmo em silêncio no coração', emoji: '💔', category: 'reflexao', points: 25 },
  { id: 'c10', title: 'Louvor e Adoração', description: 'Ouça 3 músicas de louvor com atenção plena', emoji: '🎵', category: 'comunhao', points: 10 },
  { id: 'c11', title: 'Silêncio com Deus', description: 'Fique 10 minutos em silêncio ouvindo a voz de Deus', emoji: '🤫', category: 'oracao', points: 20 },
  { id: 'c12', title: 'Memorize um Versículo', description: 'Escolha um versículo e memorize-o completamente', emoji: '🧠', category: 'leitura', points: 25 },
  { id: 'c13', title: 'Sirva Alguém', description: 'Ajude alguém com uma tarefa prática hoje', emoji: '🤲', category: 'acao', points: 20 },
  { id: 'c14', title: 'Examine-se', description: 'Reflita sobre suas atitudes da semana e peça perdão a Deus', emoji: '🪞', category: 'reflexao', points: 15 },
  { id: 'c15', title: 'Ore em Família', description: 'Reúna sua família ou amigos para orar juntos', emoji: '👨‍👩‍👧‍👦', category: 'comunhao', points: 25 },
  { id: 'c16', title: 'Leia o Sermão do Monte', description: 'Leia Mateus 5, 6 e 7 — as palavras de Jesus', emoji: '⛰️', category: 'leitura', points: 20 },
  { id: 'c17', title: 'Oração de Intercessão', description: 'Ore por seu país, sua cidade e seus líderes', emoji: '🌍', category: 'oracao', points: 15 },
  { id: 'c18', title: 'Doe Algo', description: 'Doe algo material ou financeiro para alguém necessitado', emoji: '🎁', category: 'acao', points: 30 },
  { id: 'c19', title: 'Escreva uma Oração', description: 'Escreva uma oração pessoal no seu diário', emoji: '✍️', category: 'reflexao', points: 15 },
  { id: 'c20', title: 'Testemunho', description: 'Conte para alguém algo que Deus fez na sua vida', emoji: '📢', category: 'comunhao', points: 20 },
  { id: 'c21', title: 'Caminhada de Oração', description: 'Caminhe por 15 minutos orando e contemplando a criação', emoji: '🚶', category: 'oracao', points: 20 },
];

export function getDailyChallenges(date: Date = new Date()): DailyChallenge[] {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const startIndex = (dayOfYear * 3) % dailyChallenges.length;
  const result: DailyChallenge[] = [];
  for (let i = 0; i < 3; i++) {
    result.push(dailyChallenges[(startIndex + i) % dailyChallenges.length]);
  }
  return result;
}
