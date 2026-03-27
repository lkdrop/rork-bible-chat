import { CONFIG, isConfigured } from '@/constants/config';

export interface ImageStyle {
  id: string;
  name: string;
  emoji: string;
  description: string;
  promptSuffix: string;
}

export const IMAGE_STYLES: ImageStyle[] = [
  {
    id: 'cartoon-biblico',
    name: 'Cartoon Biblico',
    emoji: '🎨',
    description: 'Estilo cartoon colorido para cenas biblicas',
    promptSuffix: 'cartoon style, colorful, vibrant, children book illustration, warm lighting, biblical scene, christian art',
  },
  {
    id: 'ilustracao-pastoral',
    name: 'Ilustracao Pastoral',
    emoji: '⛪',
    description: 'Cenas pastorais com tons suaves',
    promptSuffix: 'pastoral illustration, soft tones, peaceful, serene landscape, golden hour, christian pastoral scene, oil painting style',
  },
  {
    id: 'aquarela-espiritual',
    name: 'Aquarela Espiritual',
    emoji: '🎭',
    description: 'Aquarela delicada e espiritual',
    promptSuffix: 'watercolor painting, spiritual, ethereal, soft colors, delicate brushstrokes, divine light, christian spiritual art',
  },
  {
    id: 'arte-digital',
    name: 'Arte Digital',
    emoji: '💻',
    description: 'Arte digital moderna e impactante',
    promptSuffix: 'digital art, modern, high quality, dramatic lighting, cinematic, epic, christian digital art, detailed',
  },
  {
    id: 'minimalista',
    name: 'Minimalista',
    emoji: '✨',
    description: 'Design clean e minimalista',
    promptSuffix: 'minimalist art, clean design, simple shapes, flat colors, modern, christian minimalist illustration',
  },
  {
    id: 'realista',
    name: 'Realista',
    emoji: '📷',
    description: 'Estilo fotorrealista impressionante',
    promptSuffix: 'photorealistic, highly detailed, dramatic lighting, cinematic, 8k, christian scene, reverent atmosphere',
  },
];

export const INSPIRATION_VERSES = [
  { text: 'Jesus acalmando a tempestade', verse: 'Marcos 4:39' },
  { text: 'O bom pastor com suas ovelhas', verse: 'Joao 10:11' },
  { text: 'A criacao do mundo', verse: 'Genesis 1:1' },
  { text: 'Daniel na cova dos leoes', verse: 'Daniel 6:22' },
  { text: 'A arca de Noe', verse: 'Genesis 6:14' },
  { text: 'Moises abrindo o Mar Vermelho', verse: 'Exodo 14:21' },
  { text: 'O nascimento de Jesus', verse: 'Lucas 2:7' },
  { text: 'A ressurreicao de Cristo', verse: 'Mateus 28:6' },
];

function translateToEnglish(description: string): string {
  // Simple keyword mapping for common biblical terms (Portuguese → English)
  const translations: Record<string, string> = {
    'jesus': 'Jesus Christ',
    'deus': 'God',
    'espirito santo': 'Holy Spirit',
    'cruz': 'cross',
    'biblia': 'Bible',
    'igreja': 'church',
    'anjo': 'angel',
    'anjos': 'angels',
    'ceu': 'heaven',
    'ovelha': 'sheep',
    'ovelhas': 'sheep',
    'pastor': 'shepherd',
    'tempestade': 'storm',
    'mar': 'sea',
    'montanha': 'mountain',
    'deserto': 'desert',
    'rio': 'river',
    'luz': 'light',
    'pomba': 'dove',
    'leao': 'lion',
    'cordeiro': 'lamb',
    'oracao': 'prayer',
    'orando': 'praying',
    'nascimento': 'birth',
    'ressurreicao': 'resurrection',
    'criacao': 'creation',
    'arca': 'ark',
    'diluvio': 'flood',
    'jardim': 'garden',
    'eden': 'Eden',
    'moises': 'Moses',
    'daniel': 'Daniel',
    'davi': 'David',
    'abraao': 'Abraham',
    'noe': 'Noah',
    'maria': 'Mary',
    'jose': 'Joseph',
    'familia': 'family',
    'amor': 'love',
    'paz': 'peace',
    'fe': 'faith',
    'esperanca': 'hope',
    'graca': 'grace',
    'salvacao': 'salvation',
    'batismo': 'baptism',
    'acalmando': 'calming',
    'abrindo': 'parting',
    'mar vermelho': 'Red Sea',
    'cova dos leoes': 'lions den',
    'bom pastor': 'good shepherd',
  };

  let result = description.toLowerCase();
  // Sort by length (longest first) to avoid partial matches
  const sortedKeys = Object.keys(translations).sort((a, b) => b.length - a.length);
  for (const pt of sortedKeys) {
    result = result.replace(new RegExp(pt, 'gi'), translations[pt]);
  }
  return result;
}

export interface GenerateImageResult {
  success: boolean;
  imageBase64?: string;
  error?: string;
}

// Together AI image generation (MUCH cheaper: ~$0.003/image)
async function generateWithTogether(prompt: string): Promise<GenerateImageResult> {
  try {
    const response = await fetch(`${CONFIG.TOGETHER_BASE_URL}/images/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.TOGETHER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'black-forest-labs/FLUX.1-schnell',
        prompt,
        width: 1024,
        height: 1024,
        n: 1,
        response_format: 'b64_json',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Together API error:', response.status, errorText);
      let errorMsg = `Together API error: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorMsg = errorJson.error.message;
        }
      } catch {}
      if (response.status === 401 || response.status === 403) {
        errorMsg = 'Chave API Together AI invalida ou expirada. Verifique a configuracao.';
      }
      return { success: false, error: errorMsg };
    }

    const data = await response.json();
    const b64 = data.data?.[0]?.b64_json;
    if (!b64) {
      return { success: false, error: 'Together API nao retornou imagem' };
    }
    return { success: true, imageBase64: b64 };
  } catch (error) {
    console.error('Together image error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro Together AI' };
  }
}

// Stability AI image generation (fallback)
async function generateWithStability(prompt: string): Promise<GenerateImageResult> {
  try {
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('output_format', 'png');
    formData.append('aspect_ratio', '1:1');

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
      // Fallback to core endpoint
      const fallbackFormData = new FormData();
      fallbackFormData.append('prompt', prompt);
      fallbackFormData.append('output_format', 'png');

      const fallbackResponse = await fetch(
        `${CONFIG.STABILITY_BASE_URL}/v2beta/stable-image/generate/core`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${CONFIG.STABILITY_API_KEY}`,
            'Accept': 'application/json',
          },
          body: fallbackFormData,
        }
      );

      if (!fallbackResponse.ok) {
        return { success: false, error: `Stability API error: ${fallbackResponse.status}` };
      }

      const fallbackData = await fallbackResponse.json();
      return { success: true, imageBase64: fallbackData.image };
    }

    const data = await response.json();
    return { success: true, imageBase64: data.image };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Erro Stability AI' };
  }
}

export async function generateImage(
  description: string,
  style: ImageStyle,
): Promise<GenerateImageResult> {
  const englishDesc = translateToEnglish(description);
  const prompt = `${englishDesc}, ${style.promptSuffix}, high quality, beautiful composition, no text, no watermark`;

  // Together AI only
  if (isConfigured.together) {
    return generateWithTogether(prompt);
  }

  return { success: false, error: 'API Together AI não configurada' };
}
