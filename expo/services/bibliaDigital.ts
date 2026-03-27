// ═══════════════════════════════════════════
// BIBLE API SERVICE — bolls.life
// Gratuita, sem autenticação, sem limite
// Traduções PT: NVIPT, ARA, NVT
// ═══════════════════════════════════════════

const BASE_URL = 'https://bolls.life';

export type BibleVersion = 'NVIPT' | 'ARA' | 'NVT' | 'KJV';

export interface BibleBook {
  bookid: number;
  name: string;
  chronorder: number;
  chapters: number;
}

export interface BibleVerse {
  pk: number;
  verse: number;
  text: string;
  comment?: string;
}

// ─── Helpers ──────────────────────────────

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

async function apiFetch<T>(path: string): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch(`${BASE_URL}${path}`);

    if (!res.ok) {
      return { data: null, error: `Erro na API (${res.status})` };
    }

    const json = await res.json();
    return { data: json as T, error: null };
  } catch {
    return { data: null, error: 'Erro de conexão. Verifique sua internet.' };
  }
}

// ─── Livros ──────────────────────────────

export async function getBooks(version: BibleVersion = 'NVIPT') {
  return apiFetch<BibleBook[]>(`/get-books/${version}/`);
}

// ─── Capítulo ────────────────────────────

export async function getChapter(version: BibleVersion, bookId: number, chapter: number) {
  const result = await apiFetch<BibleVerse[]>(`/get-chapter/${version}/${bookId}/${chapter}/`);
  if (result.data) {
    result.data = result.data.map(v => ({
      ...v,
      text: stripHtml(v.text),
    }));
  }
  return result;
}

// ─── Mapa de tradução do app → API ──────

export function translationToVersion(translation: string): BibleVersion {
  const map: Record<string, BibleVersion> = {
    NVI: 'NVIPT',
    ARA: 'ARA',
    NVT: 'NVT',
    NTLH: 'NVIPT', // fallback
    ACF: 'ARA',     // fallback
    KJV: 'KJV',
  };
  return map[translation] || 'NVIPT';
}

// ─── Testamento ──────────────────────────

export function getTestament(bookId: number): 'VT' | 'NT' {
  return bookId <= 39 ? 'VT' : 'NT';
}

// ─── Mapeamento nome → bookId ────────────

const BOOK_NAME_TO_ID: Record<string, number> = {
  // AT
  'Gênesis': 1, 'Genesis': 1,
  'Êxodo': 2, 'Exodo': 2,
  'Levítico': 3, 'Levitico': 3,
  'Números': 4, 'Numeros': 4,
  'Deuteronômio': 5, 'Deuteronomio': 5,
  'Josué': 6, 'Josue': 6,
  'Juízes': 7, 'Juizes': 7,
  'Rute': 8,
  '1 Samuel': 9, '1Samuel': 9,
  '2 Samuel': 10, '2Samuel': 10,
  '1 Reis': 11, '1Reis': 11,
  '2 Reis': 12, '2Reis': 12,
  '1 Crônicas': 13, '1 Cronicas': 13, '1Crônicas': 13,
  '2 Crônicas': 14, '2 Cronicas': 14, '2Crônicas': 14,
  'Esdras': 15,
  'Neemias': 16,
  'Ester': 17,
  'Jó': 18, 'Jo': 18,
  'Salmos': 19, 'Salmo': 19,
  'Provérbios': 20, 'Proverbios': 20,
  'Eclesiastes': 21,
  'Cânticos': 22, 'Canticos': 22, 'Cantares': 22,
  'Isaías': 23, 'Isaias': 23,
  'Jeremias': 24,
  'Lamentações': 25, 'Lamentacoes': 25,
  'Ezequiel': 26,
  'Daniel': 27,
  'Oséias': 28, 'Oseias': 28,
  'Joel': 29,
  'Amós': 30, 'Amos': 30,
  'Obadias': 31,
  'Jonas': 32,
  'Miquéias': 33, 'Miqueias': 33,
  'Naum': 34,
  'Habacuque': 35,
  'Sofonias': 36,
  'Ageu': 37,
  'Zacarias': 38,
  'Malaquias': 39,
  // NT
  'Mateus': 40,
  'Marcos': 41,
  'Lucas': 42,
  'João': 43, 'Joao': 43,
  'Atos': 44,
  'Romanos': 45,
  '1 Coríntios': 46, '1 Corintios': 46, '1Coríntios': 46,
  '2 Coríntios': 47, '2 Corintios': 47, '2Coríntios': 47,
  'Gálatas': 48, 'Galatas': 48,
  'Efésios': 49, 'Efesios': 49,
  'Filipenses': 50,
  'Colossenses': 51,
  '1 Tessalonicenses': 52, '1 Tessalonissences': 52, '1Tessalonicenses': 52,
  '2 Tessalonicenses': 53, '2Tessalonicenses': 53,
  '1 Timóteo': 54, '1 Timoteo': 54, '1Timóteo': 54, 'Timóteo': 54, 'Timoteo': 54,
  '2 Timóteo': 55, '2 Timoteo': 55, '2Timóteo': 55,
  'Tito': 56,
  'Filemom': 57, 'Filemon': 57,
  'Hebreus': 58,
  'Tiago': 59,
  '1 Pedro': 60, '1Pedro': 60,
  '2 Pedro': 61, '2Pedro': 61,
  '1 João': 62, '1 Joao': 62, '1João': 62,
  '2 João': 63, '2 Joao': 63, '2João': 63,
  '3 João': 64, '3 Joao': 64, '3João': 64,
  'Judas': 65,
  'Apocalipse': 66,
};

// Total de capítulos por bookId
const BOOK_CHAPTERS: Record<number, number> = {
  1:50,2:40,3:27,4:36,5:34,6:24,7:21,8:4,9:31,10:24,11:22,12:25,
  13:29,14:36,15:10,16:13,17:10,18:42,19:150,20:31,21:12,22:8,
  23:66,24:52,25:5,26:48,27:12,28:14,29:3,30:9,31:1,32:4,33:7,
  34:3,35:3,36:3,37:2,38:14,39:4,40:28,41:16,42:24,43:21,44:28,
  45:16,46:16,47:13,48:6,49:6,50:4,51:4,52:5,53:3,54:6,55:4,
  56:3,57:1,58:13,59:5,60:5,61:3,62:5,63:1,64:1,65:1,66:22,
};

export function findBookId(name: string): number | null {
  // Busca direta
  if (BOOK_NAME_TO_ID[name] !== undefined) return BOOK_NAME_TO_ID[name];
  // Busca case-insensitive
  const lower = name.toLowerCase();
  for (const [key, id] of Object.entries(BOOK_NAME_TO_ID)) {
    if (key.toLowerCase() === lower) return id;
  }
  return null;
}

// ─── Parser de range de capítulos ────────

export function parseChapterRange(str: string, totalChapters?: number): number[] {
  if (!str) return [];
  const trimmed = str.trim();

  // "Todas" ou similar → todos os capítulos
  if (/^todas?$/i.test(trimmed) && totalChapters) {
    return Array.from({ length: totalChapters }, (_, i) => i + 1);
  }

  // "1-5" → range
  const rangeMatch = trimmed.match(/^(\d+)\s*-\s*(\d+)$/);
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1], 10);
    const end = parseInt(rangeMatch[2], 10);
    if (start <= end) return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  // "1" → single
  const singleMatch = trimmed.match(/^(\d+)$/);
  if (singleMatch) return [parseInt(singleMatch[1], 10)];

  // Não-numérico (Evangelhos, Revisão, etc.) → dia de reflexão
  return [];
}

// ─── Busca multi-capítulo para maratonas ─

interface MarathonChapter {
  bookName: string;
  chapter: number;
  verses: BibleVerse[];
}

interface MarathonDayResult {
  chapters: MarathonChapter[];
  isReviewDay: boolean;
  error: string | null;
}

/**
 * Parseia uma parte de um campo book do tipo "Efésios 4-6"
 * Retorna { bookName, bookId, chapterRange } ou null se for dia de reflexão
 */
function parseBookPart(part: string): { bookName: string; bookId: number; chapters: number[] } | null {
  const trimmed = part.trim();

  // Tenta match com "NomeLivro N-M" ou "NomeLivro N"
  const match = trimmed.match(/^(.+?)\s+(\d+(?:\s*-\s*\d+)?)$/);
  if (match) {
    const name = match[1].trim();
    const id = findBookId(name);
    if (id) {
      const chapters = parseChapterRange(match[2], BOOK_CHAPTERS[id]);
      return { bookName: name, bookId: id, chapters };
    }
  }

  // Tenta nome direto (sem range de capítulos)
  const id = findBookId(trimmed);
  if (id) {
    return { bookName: trimmed, bookId: id, chapters: [] }; // chapters preenchido depois
  }

  return null; // dia de reflexão
}

// ─── Parser de referência para Planos de Estudo ─

export interface StudyReadingRef {
  bookName: string;
  bookId: number;
  chapter: number;
  verseRanges?: [number, number][]; // [[start, end], ...]
}

function parseVerseRanges(str: string): [number, number][] {
  const ranges: [number, number][] = [];
  const parts = str.split(',').map(p => p.trim());
  for (const p of parts) {
    const rangeMatch = p.match(/^(\d+)\s*-\s*(\d+)$/);
    if (rangeMatch) {
      ranges.push([parseInt(rangeMatch[1], 10), parseInt(rangeMatch[2], 10)]);
    } else {
      const num = parseInt(p, 10);
      if (!isNaN(num)) ranges.push([num, num]);
    }
  }
  return ranges;
}

/**
 * Parseia referências de plano de estudo:
 * "Mateus 13:1-23" → [{bookName:'Mateus', bookId:40, chapter:13, verseRanges:[[1,23]]}]
 * "Gênesis 18:1-15; 21:1-7" → duas refs no mesmo livro
 * "Mateus 13:24-30,36-43" → ranges múltiplos no mesmo capítulo
 * "Salmos 23" → capítulo inteiro (sem verseRanges)
 */
export function parseStudyReading(reading: string): StudyReadingRef[] {
  const results: StudyReadingRef[] = [];
  const parts = reading.split(';').map(p => p.trim()).filter(Boolean);

  let lastBookName = '';
  let lastBookId = 0;

  for (const part of parts) {
    // "BookName Chapter:VerseRanges" or "BookName Chapter"
    const fullMatch = part.match(/^(.+?)\s+(\d+)(?::(.+))?$/);
    if (fullMatch) {
      const name = fullMatch[1].trim();
      const id = findBookId(name);
      if (id) {
        lastBookName = name;
        lastBookId = id;
        const chapter = parseInt(fullMatch[2], 10);
        const verseRanges = fullMatch[3] ? parseVerseRanges(fullMatch[3]) : undefined;
        results.push({ bookName: name, bookId: id, chapter, verseRanges });
        continue;
      }
    }

    // Continuation: "21:1-7" (same book as previous)
    const contMatch = part.match(/^(\d+)(?::(.+))?$/);
    if (contMatch && lastBookId) {
      const chapter = parseInt(contMatch[1], 10);
      const verseRanges = contMatch[2] ? parseVerseRanges(contMatch[2]) : undefined;
      results.push({ bookName: lastBookName, bookId: lastBookId, chapter, verseRanges });
    }
  }

  return results;
}

export interface StudyDaySection {
  label: string;
  verses: BibleVerse[];
}

export async function getStudyDayContent(
  version: BibleVersion,
  reading: string
): Promise<{
  sections: StudyDaySection[];
  fullText: string;
  error: string | null;
}> {
  const refs = parseStudyReading(reading);
  if (refs.length === 0) {
    return { sections: [], fullText: '', error: 'Referência não encontrada' };
  }

  const results = await Promise.all(
    refs.map(async (ref) => {
      const { data, error } = await getChapter(version, ref.bookId, ref.chapter);
      let verses = data || [];

      // Filter by verse ranges if specified
      if (ref.verseRanges && ref.verseRanges.length > 0) {
        verses = verses.filter(v =>
          ref.verseRanges!.some(([start, end]) => v.verse >= start && v.verse <= end)
        );
      }

      const label = ref.verseRanges
        ? `${ref.bookName} ${ref.chapter}:${ref.verseRanges.map(([s, e]) => s === e ? `${s}` : `${s}-${e}`).join(',')}`
        : `${ref.bookName} ${ref.chapter}`;

      return { label, verses, error };
    })
  );

  const firstError = results.find(r => r.error)?.error || null;
  const sections = results.map(r => ({ label: r.label, verses: r.verses }));
  const fullText = sections.flatMap(s => s.verses.map(v => v.text)).join(' ');

  return { sections, fullText, error: firstError };
}

// ─── Busca multi-capítulo para maratonas ─

export async function getMarathonDayContent(
  version: BibleVersion,
  bookName: string,
  chaptersStr: string
): Promise<MarathonDayResult> {
  // Palavras-chave de dias sem leitura
  const reviewKeywords = ['revisão', 'revisao', 'meditação', 'meditacao', 'aplicação', 'aplicacao', 'celebração', 'celebracao', 'reflexão', 'reflexao'];
  const lowerBook = bookName.toLowerCase();
  if (reviewKeywords.some(k => lowerBook.includes(k))) {
    return { chapters: [], isReviewDay: true, error: null };
  }

  // Verificar se é multi-livro (contém "+")
  const parts = bookName.includes('+') ? bookName.split('+') : [bookName];
  const allFetches: { bookName: string; bookId: number; chapter: number }[] = [];

  for (const part of parts) {
    const parsed = parseBookPart(part);
    if (!parsed) {
      return { chapters: [], isReviewDay: true, error: null };
    }

    let chaps = parsed.chapters;
    if (chaps.length === 0) {
      // Sem range no nome do livro → usar o campo chapters
      const total = BOOK_CHAPTERS[parsed.bookId];
      chaps = parseChapterRange(chaptersStr, total);
      if (chaps.length === 0 && total) {
        // "Todas" ou default → todos os capítulos
        chaps = Array.from({ length: total }, (_, i) => i + 1);
      }
    }

    for (const ch of chaps) {
      allFetches.push({ bookName: parsed.bookName, bookId: parsed.bookId, chapter: ch });
    }
  }

  if (allFetches.length === 0) {
    return { chapters: [], isReviewDay: true, error: null };
  }

  // Buscar todos os capítulos em paralelo
  const results = await Promise.all(
    allFetches.map(async (f) => {
      const { data, error } = await getChapter(version, f.bookId, f.chapter);
      return {
        bookName: f.bookName,
        chapter: f.chapter,
        verses: data || [],
        error,
      };
    })
  );

  const firstError = results.find(r => r.error)?.error || null;
  const chapters: MarathonChapter[] = results.map(r => ({
    bookName: r.bookName,
    chapter: r.chapter,
    verses: r.verses,
  }));

  return { chapters, isReviewDay: false, error: firstError };
}
