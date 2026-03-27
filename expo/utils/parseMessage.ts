import type { ParsedPart } from '@/types';

/**
 * Faz o parse do conteúdo de mensagem do Gabriel,
 * identificando tags [VERSICULO] e [ORACAO]
 */
export function parseMessageContent(content: string): ParsedPart[] {
  const parts: ParsedPart[] = [];

  const regex = /\[(VERSICULO|ORACAO)\]([\s\S]*?)\[\/\1\]/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const textBefore = content.substring(lastIndex, match.index).trim();
      if (textBefore) {
        parts.push({ type: 'text', content: textBefore });
      }
    }

    const tag = match[1];
    const inner = match[2].trim();

    if (tag === 'VERSICULO') {
      const refMatch = inner.match(/^"?([\s\S]*?)"?\s*[—–-]\s*(.+)$/);
      if (refMatch) {
        parts.push({ type: 'verse', content: refMatch[1].trim(), reference: refMatch[2].trim() });
      } else {
        parts.push({ type: 'verse', content: inner });
      }
    } else if (tag === 'ORACAO') {
      parts.push({ type: 'prayer', content: inner });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    const textAfter = content.substring(lastIndex).trim();
    if (textAfter) {
      parts.push({ type: 'text', content: textAfter });
    }
  }

  if (parts.length === 0) {
    parts.push({ type: 'text', content });
  }

  return parts;
}
