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
