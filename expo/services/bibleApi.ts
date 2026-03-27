import { CONFIG, isConfigured } from '@/constants/config';

// =====================================================
// BIBLE API SERVICE (scripture.api.bible)
// =====================================================
// API gratuita com diversas traduções da Bíblia
// Docs: https://scripture.api.bible/livedocs
// =====================================================

const BASE_URL = 'https://api.scripture.api.bible/v1';

const apiHeaders = () => ({
  'api-key': CONFIG.BIBLE_API_KEY,
  'Content-Type': 'application/json',
});

// IDs das Bíblias em português disponíveis na API
// Estes são os IDs reais da scripture.api.bible
export const BIBLE_IDS: Record<string, { id: string; name: string }> = {
  NVI: { id: '78a2a6460c5dc29-01', name: 'Nova Versão Internacional' },
  ARA: { id: 'b32b9d1b64b4ef29-01', name: 'Almeida Revista e Atualizada' },
  NTLH: { id: '6af40dc24b20bfec-01', name: 'Nova Tradução na Linguagem de Hoje' },
  NVT: { id: '6af40dc24b20bfec-01', name: 'Nova Versão Transformadora' }, // fallback
};

export interface BibleBook {
  id: string;
  name: string;
  abbreviation: string;
}

export interface BibleChapter {
  id: string;
  number: string;
  reference: string;
}

export interface BibleVerse {
  id: string;
  reference: string;
  text: string;
}

export interface BiblePassage {
  id: string;
  reference: string;
  content: string;
}

// Buscar livros da Bíblia
export async function getBooks(translation: string = 'NVI'): Promise<{ data: BibleBook[] | null; error: string | null }> {
  if (!isConfigured.bibleApi) {
    return { data: null, error: 'Bible API não configurada. Adicione sua chave em constants/config.ts' };
  }

  const bibleId = BIBLE_IDS[translation]?.id || BIBLE_IDS.NVI.id;

  try {
    const res = await fetch(`${BASE_URL}/bibles/${bibleId}/books`, {
      headers: apiHeaders(),
    });

    if (!res.ok) {
      return { data: null, error: 'Erro ao buscar livros' };
    }

    const json = await res.json();
    return { data: json.data, error: null };
  } catch {
    return { data: null, error: 'Erro de conexão' };
  }
}

// Buscar capítulos de um livro
export async function getChapters(bookId: string, translation: string = 'NVI'): Promise<{ data: BibleChapter[] | null; error: string | null }> {
  if (!isConfigured.bibleApi) {
    return { data: null, error: 'Bible API não configurada' };
  }

  const bibleId = BIBLE_IDS[translation]?.id || BIBLE_IDS.NVI.id;

  try {
    const res = await fetch(`${BASE_URL}/bibles/${bibleId}/books/${bookId}/chapters`, {
      headers: apiHeaders(),
    });

    if (!res.ok) {
      return { data: null, error: 'Erro ao buscar capítulos' };
    }

    const json = await res.json();
    return { data: json.data, error: null };
  } catch {
    return { data: null, error: 'Erro de conexão' };
  }
}

// Buscar uma passagem específica
export async function getPassage(
  passageId: string,
  translation: string = 'NVI',
): Promise<{ data: BiblePassage | null; error: string | null }> {
  if (!isConfigured.bibleApi) {
    return { data: null, error: 'Bible API não configurada' };
  }

  const bibleId = BIBLE_IDS[translation]?.id || BIBLE_IDS.NVI.id;

  try {
    const res = await fetch(
      `${BASE_URL}/bibles/${bibleId}/passages/${passageId}?content-type=text&include-notes=false&include-titles=true&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=false`,
      { headers: apiHeaders() },
    );

    if (!res.ok) {
      return { data: null, error: 'Erro ao buscar passagem' };
    }

    const json = await res.json();
    return { data: json.data, error: null };
  } catch {
    return { data: null, error: 'Erro de conexão' };
  }
}

// Buscar versículos de um capítulo
export async function getVerses(
  chapterId: string,
  translation: string = 'NVI',
): Promise<{ data: BibleVerse[] | null; error: string | null }> {
  if (!isConfigured.bibleApi) {
    return { data: null, error: 'Bible API não configurada' };
  }

  const bibleId = BIBLE_IDS[translation]?.id || BIBLE_IDS.NVI.id;

  try {
    const res = await fetch(`${BASE_URL}/bibles/${bibleId}/chapters/${chapterId}/verses`, {
      headers: apiHeaders(),
    });

    if (!res.ok) {
      return { data: null, error: 'Erro ao buscar versículos' };
    }

    const json = await res.json();
    return { data: json.data, error: null };
  } catch {
    return { data: null, error: 'Erro de conexão' };
  }
}

// Buscar um versículo específico
export async function getVerse(
  verseId: string,
  translation: string = 'NVI',
): Promise<{ data: BibleVerse | null; error: string | null }> {
  if (!isConfigured.bibleApi) {
    return { data: null, error: 'Bible API não configurada' };
  }

  const bibleId = BIBLE_IDS[translation]?.id || BIBLE_IDS.NVI.id;

  try {
    const res = await fetch(
      `${BASE_URL}/bibles/${bibleId}/verses/${verseId}?content-type=text&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=false&include-verse-spans=false`,
      { headers: apiHeaders() },
    );

    if (!res.ok) {
      return { data: null, error: 'Erro ao buscar versículo' };
    }

    const json = await res.json();
    return { data: json.data, error: null };
  } catch {
    return { data: null, error: 'Erro de conexão' };
  }
}

// Pesquisar na Bíblia
export async function searchBible(
  query: string,
  translation: string = 'NVI',
  limit: number = 10,
): Promise<{ data: { verses: BibleVerse[] } | null; error: string | null }> {
  if (!isConfigured.bibleApi) {
    return { data: null, error: 'Bible API não configurada' };
  }

  const bibleId = BIBLE_IDS[translation]?.id || BIBLE_IDS.NVI.id;

  try {
    const res = await fetch(
      `${BASE_URL}/bibles/${bibleId}/search?query=${encodeURIComponent(query)}&limit=${limit}`,
      { headers: apiHeaders() },
    );

    if (!res.ok) {
      return { data: null, error: 'Erro ao pesquisar' };
    }

    const json = await res.json();
    return { data: json.data, error: null };
  } catch {
    return { data: null, error: 'Erro de conexão' };
  }
}

// Versículo do dia (aleatório de uma lista curada)
export async function getDailyVerse(translation: string = 'NVI'): Promise<{ data: BibleVerse | null; error: string | null }> {
  // Lista de versículos populares para rotação diária
  const popularVerses = [
    'JER.29.11', 'PSA.23.1', 'PHP.4.13', 'ROM.8.28', 'ISA.41.10',
    'JHN.3.16', 'PRO.3.5-PRO.3.6', 'PSA.46.1', 'MAT.11.28', 'ROM.12.2',
    'JOS.1.9', 'PSA.27.1', 'ISA.40.31', 'PHP.4.6-PHP.4.7', '2CO.5.17',
    'GAL.5.22-GAL.5.23', 'HEB.11.1', 'PSA.119.105', 'ROM.5.8', 'EPH.2.8-EPH.2.9',
    'MAT.6.33', 'PSA.37.4', 'COL.3.23', '1CO.13.4-1CO.13.7', 'LAM.3.22-LAM.3.23',
    'PSA.91.1-PSA.91.2', 'ISA.43.2', 'DEU.31.6', 'MAT.28.20', 'REV.21.4',
    'PSA.139.14',
  ];

  // Seleciona baseado no dia do mês
  const dayOfMonth = new Date().getDate();
  const verseId = popularVerses[(dayOfMonth - 1) % popularVerses.length];

  return getVerse(verseId, translation);
}
