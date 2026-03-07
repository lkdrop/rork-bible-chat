import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '@/constants/config';
import { PERSONA_DETAILS, PERSONA_NEG_PROMPT } from '@/constants/communityData';

const CACHE_PREFIX = 'persona_img_';
const memoryCache: Record<string, string> = {};
let isGenerating = false;
const generationQueue: string[] = [];

export function isPersonaUri(uri: string | null | undefined): boolean {
  return typeof uri === 'string' && uri.startsWith('persona:');
}

export function parsePersonaUri(uri: string): { userId: string; type: string; index?: number } | null {
  const parts = uri.split(':');
  if (parts.length < 3) return null;
  return {
    userId: parts[1],
    type: parts[2],
    index: parts[3] !== undefined ? parseInt(parts[3], 10) : undefined,
  };
}

function getPromptForUri(uri: string): string | null {
  const parsed = parsePersonaUri(uri);
  if (!parsed) return null;

  const persona = PERSONA_DETAILS[parsed.userId];
  if (!persona) return null;

  switch (parsed.type) {
    case 'profile':
      return persona.profilePrompt;
    case 'post':
      return parsed.index !== undefined ? persona.postPrompts[parsed.index] || null : null;
    case 'story':
      return persona.storyPrompt;
    default:
      return null;
  }
}

function getCacheKey(uri: string): string {
  return CACHE_PREFIX + uri.replace(/:/g, '_');
}

function getFallbackUrl(uri: string): string {
  const parsed = parsePersonaUri(uri);
  if (!parsed) return 'https://picsum.photos/seed/default/200';
  const seed = `${parsed.userId}_${parsed.type}_${parsed.index ?? 0}`;
  switch (parsed.type) {
    case 'profile':
      return `https://picsum.photos/seed/${seed}/200/200`;
    case 'post':
      return `https://picsum.photos/seed/${seed}/600/450`;
    case 'story':
      return `https://picsum.photos/seed/${seed}/400/700`;
    default:
      return `https://picsum.photos/seed/${seed}/400/400`;
  }
}

export function resolveUri(uri: string | null | undefined): string | null {
  if (!uri) return null;
  if (!isPersonaUri(uri)) return uri;
  return memoryCache[uri] || null;
}

export async function loadCachedImages(): Promise<number> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const personaKeys = keys.filter(k => k.startsWith(CACHE_PREFIX));
    if (personaKeys.length === 0) return 0;

    const pairs = await AsyncStorage.multiGet(personaKeys);
    let count = 0;
    for (const [key, value] of pairs) {
      if (value) {
        const uri = key.replace(CACHE_PREFIX, '').replace(/_/g, ':');
        memoryCache[uri] = value;
        count++;
      }
    }
    console.log(`[Persona] Loaded ${count} cached images`);
    return count;
  } catch (e) {
    console.error('[Persona] Failed to load cache:', e);
    return 0;
  }
}

async function generateSingleImage(prompt: string, aspectRatio: string = '1:1'): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('negative_prompt', PERSONA_NEG_PROMPT);
    formData.append('output_format', 'jpeg');
    formData.append('aspect_ratio', aspectRatio);

    const response = await fetch(
      `${CONFIG.STABILITY_BASE_URL}/v2beta/stable-image/generate/sd3`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CONFIG.STABILITY_API_KEY}`,
          'Accept': 'application/json',
        },
        body: formData,
      }
    );

    if (!response.ok) {
      // Try core fallback
      const fallbackData = new FormData();
      fallbackData.append('prompt', prompt);
      fallbackData.append('negative_prompt', PERSONA_NEG_PROMPT);
      fallbackData.append('output_format', 'jpeg');

      const fallbackResponse = await fetch(
        `${CONFIG.STABILITY_BASE_URL}/v2beta/stable-image/generate/core`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${CONFIG.STABILITY_API_KEY}`,
            'Accept': 'application/json',
          },
          body: fallbackData,
        }
      );

      if (!fallbackResponse.ok) {
        const errText = await fallbackResponse.text();
        console.error('[Persona] Fallback API error:', fallbackResponse.status, errText);
        return null;
      }

      const fallbackResult = await fallbackResponse.json();
      return `data:image/jpeg;base64,${fallbackResult.image}`;
    }

    const data = await response.json();
    return `data:image/jpeg;base64,${data.image}`;
  } catch (error) {
    console.error('[Persona] Generation error:', error);
    return null;
  }
}

async function processQueue(onUpdate?: () => void): Promise<void> {
  if (isGenerating) return;
  isGenerating = true;

  while (generationQueue.length > 0) {
    const uri = generationQueue.shift()!;
    if (memoryCache[uri]) continue;

    const prompt = getPromptForUri(uri);
    if (!prompt) continue;

    const parsed = parsePersonaUri(uri);
    const aspectRatio = parsed?.type === 'story' ? '9:16' : parsed?.type === 'post' ? '4:3' : '1:1';

    console.log(`[Persona] Generating: ${uri} (${generationQueue.length} remaining)`);
    const imageDataUri = await generateSingleImage(prompt, aspectRatio);

    const finalUri = imageDataUri || getFallbackUrl(uri);
    memoryCache[uri] = finalUri;
    try {
      await AsyncStorage.setItem(getCacheKey(uri), finalUri);
    } catch (e) {
      console.error('[Persona] Failed to cache:', e);
    }
    onUpdate?.();
    if (imageDataUri) {
      console.log(`[Persona] Generated: ${uri}`);
    } else {
      console.log(`[Persona] Using fallback: ${uri}`);
    }

    // Delay between generations to avoid rate limiting
    await new Promise(r => setTimeout(r, 1500));
  }

  isGenerating = false;
}

export function queuePersonaGeneration(uris: string[], onUpdate?: () => void): void {
  for (const uri of uris) {
    if (isPersonaUri(uri) && !memoryCache[uri] && !generationQueue.includes(uri)) {
      generationQueue.push(uri);
    }
  }
  void processQueue(onUpdate);
}

export function getAllPersonaUris(): string[] {
  const uris: string[] = [];
  for (const [userId, persona] of Object.entries(PERSONA_DETAILS)) {
    uris.push(`persona:${userId}:profile`);
    persona.postPrompts.forEach((_, i) => uris.push(`persona:${userId}:post:${i}`));
    uris.push(`persona:${userId}:story`);
  }
  return uris;
}

export function getGenerationStatus(): { total: number; cached: number; pending: number; generating: boolean } {
  const all = getAllPersonaUris();
  const cached = all.filter(u => !!memoryCache[u]).length;
  return {
    total: all.length,
    cached,
    pending: generationQueue.length,
    generating: isGenerating,
  };
}
