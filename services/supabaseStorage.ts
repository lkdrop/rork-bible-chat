import { CONFIG } from '@/constants/config';

const BUCKET_NAME = 'Videos historias da biblia';
// Projeto de videos separado do projeto principal
const VIDEO_STORAGE_URL = 'https://rkwaxdnmqgmytaxoqwbt.supabase.co';

function getPublicUrl(filePath: string): string {
  const encoded = encodeURIComponent(filePath);
  return `${VIDEO_STORAGE_URL}/storage/v1/object/public/${encodeURIComponent(BUCKET_NAME)}/${encoded}`;
}

export interface StorageFile {
  name: string;
  id: string;
  created_at: string;
  updated_at: string;
  metadata: {
    mimetype?: string;
    size?: number;
  } | null;
}

export async function listBucketFiles(folder?: string): Promise<StorageFile[]> {
  try {
    const url = `${VIDEO_STORAGE_URL}/storage/v1/object/list/${encodeURIComponent(BUCKET_NAME)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': CONFIG.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prefix: folder || '',
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      }),
    });

    if (!res.ok) {
      console.warn('[Storage] List failed:', res.status);
      return [];
    }

    const data: StorageFile[] = await res.json();
    // Filter out folders (they have null id)
    return data.filter(f => f.id);
  } catch (e) {
    console.error('[Storage] List error:', e);
    return [];
  }
}

export function getVideoPublicUrl(fileName: string): string {
  return getPublicUrl(fileName);
}

export { BUCKET_NAME };
