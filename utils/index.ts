// ═══════════════════════════════════════════
// FUNÇÕES UTILITÁRIAS — Bíblia IA
// ═══════════════════════════════════════════

/**
 * Retorna a saudação baseada na hora atual
 */
export function getGreeting(): { text: string; sub: string; emoji: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return { text: 'Bom dia', sub: '', emoji: '✨' };
  }
  if (hour >= 12 && hour < 18) {
    return { text: 'Boa tarde', sub: '', emoji: '☀️' };
  }
  return { text: 'Boa noite', sub: '', emoji: '🌙' };
}

/**
 * Formata timestamp para horário HH:MM
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Formata data para exibição
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Gera um ID único baseado em timestamp
 */
export function generateId(): string {
  return Date.now().toString();
}

/**
 * Verifica se uma data é hoje
 */
export function isToday(dateStr: string): boolean {
  return new Date(dateStr).toDateString() === new Date().toDateString();
}

/**
 * Calcula diferença em dias entre duas datas
 */
export function daysDifference(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.floor(Math.abs(d1.getTime() - d2.getTime()) / 86400000);
}

/**
 * Trunca texto com reticências
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Calcula porcentagem de progresso
 */
export function calcProgress(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
}

/**
 * Compartilha conteúdo de forma cross-platform (mobile + web)
 */
export async function shareContent(message: string, url?: string): Promise<void> {
  const { Platform, Share, Alert } = require('react-native');

  if (Platform.OS === 'web') {
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ text: message, ...(url ? { url } : {}) });
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(message);
        alert('Texto copiado!');
      } else {
        alert('Compartilhamento não disponível neste navegador.');
      }
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        console.log('Share error:', e);
      }
    }
  } else {
    try {
      await Share.share({ message, ...(url ? { url } : {}) });
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        console.log('Share error:', e);
      }
    }
  }
}
