import { CONFIG, isConfigured } from '@/constants/config';

// =====================================================
// GOOGLE GEMINI AI SERVICE
// =====================================================
// Usa a API REST do Gemini diretamente
// Modelo: gemini-2.0-flash (rápido e gratuito)
// =====================================================

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface GeminiRequest {
  contents: GeminiMessage[];
  systemInstruction?: { parts: { text: string }[] };
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
  };
}

interface GeminiResponse {
  candidates?: {
    content: {
      parts: { text: string }[];
    };
  }[];
  error?: {
    message: string;
  };
}

// System prompts por modo
export const SYSTEM_PROMPTS: Record<string, string> = {
  geral: `Você é Gabriel, um assistente bíblico cristão sábio e acolhedor.
Você ajuda pessoas a entender a Bíblia, responde dúvidas sobre fé, e oferece orientação espiritual baseada nas Escrituras.

Regras:
- Sempre cite versículos bíblicos relevantes
- Seja respeitoso com todas as denominações cristãs
- Use linguagem acessível e acolhedora
- Responda sempre em português brasileiro
- Quando não souber algo, seja honesto
- Não invente versículos ou referências
- Mantenha respostas concisas mas completas`,

  estudo_palavras: `Você é Gabriel, um especialista em estudos bíblicos com conhecimento profundo em grego (koiné) e hebraico bíblico.

Regras:
- Analise palavras no original (grego/hebraico) quando relevante
- Explique contexto histórico e cultural
- Use transliteração para facilitar a leitura
- Compare diferentes traduções quando útil
- Cite Strong's numbers quando apropriado
- Responda sempre em português brasileiro`,

  sermao: `Você é Gabriel, um assistente para preparação de sermões e pregações.

Regras:
- Ajude a estruturar sermões com introdução, desenvolvimento e conclusão
- Sugira ilustrações e aplicações práticas
- Indique referências cruzadas
- Ofereça esboços detalhados
- Considere o contexto da passagem
- Responda sempre em português brasileiro`,

  devocional: `Você é Gabriel, um guia para momentos devocionais e meditação bíblica.

Regras:
- Ofereça reflexões profundas mas acessíveis
- Sugira aplicações práticas para o dia a dia
- Inclua orações quando apropriado
- Use tom acolhedor e encorajador
- Conecte versículos com situações da vida real
- Responda sempre em português brasileiro`,
};

export async function sendGeminiMessage(
  userMessage: string,
  conversationHistory: GeminiMessage[],
  mode: string = 'geral',
  customSystemPrompt?: string,
): Promise<{ text: string | null; error: string | null }> {
  if (!isConfigured.gemini) {
    return {
      text: null,
      error: 'API do Gemini não configurada. Adicione sua chave em constants/config.ts',
    };
  }

  const systemPrompt = customSystemPrompt || SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.geral;

  const contents: GeminiMessage[] = [
    ...conversationHistory,
    { role: 'user', parts: [{ text: userMessage }] },
  ];

  const requestBody: GeminiRequest = {
    contents,
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
      topP: 0.95,
    },
  };

  try {
    const res = await fetch(`${GEMINI_URL}?key=${CONFIG.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const data: GeminiResponse = await res.json();

    if (!res.ok || data.error) {
      return {
        text: null,
        error: data.error?.message || 'Erro ao se comunicar com a IA',
      };
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return { text: null, error: 'A IA não retornou uma resposta' };
    }

    return { text, error: null };
  } catch (e) {
    return {
      text: null,
      error: 'Erro de conexão. Verifique sua internet e tente novamente.',
    };
  }
}

// Função auxiliar para gerar devocional diário
export async function generateDailyDevotional(verse: string, reference: string): Promise<{ text: string | null; error: string | null }> {
  const prompt = `Com base no versículo "${verse}" (${reference}), crie um devocional breve e inspirador com:
1. Uma reflexão de 2-3 parágrafos
2. Uma aplicação prática para o dia
3. Uma oração curta

Seja acolhedor e profundo.`;

  return sendGeminiMessage(prompt, [], 'devocional');
}

// Função para gerar conteúdo para criadores
export async function generateCreatorContent(
  type: 'caption' | 'script' | 'devotional_post' | 'bio' | 'hashtags',
  topic: string,
): Promise<{ text: string | null; error: string | null }> {
  const prompts: Record<string, string> = {
    caption: `Crie uma legenda viral para Instagram sobre "${topic}" com perspectiva bíblica. Inclua emojis, seja inspirador e termine com um call-to-action. Máximo 300 caracteres.`,
    script: `Crie um roteiro curto (30-60 segundos) para Reels/TikTok sobre "${topic}" com base bíblica. Inclua: gancho inicial forte, conteúdo principal, e call-to-action final.`,
    devotional_post: `Crie um post devocional para redes sociais sobre "${topic}". Inclua versículo, reflexão curta, e aplicação prática. Use emojis com moderação.`,
    bio: `Crie 3 opções de bio cristã para Instagram sobre o tema "${topic}". Cada uma com máximo 150 caracteres, incluindo emojis relevantes.`,
    hashtags: `Gere 20 hashtags relevantes para conteúdo cristão sobre "${topic}". Misture hashtags populares com específicas. Formato: #hashtag`,
  };

  return sendGeminiMessage(prompts[type] || prompts.caption, [], 'geral');
}

// =====================================================
// COMPATIBILITY LAYER
// =====================================================
// Replaces generateText/generateObject from @rork-ai/toolkit-sdk
// Drop-in replacement - same interface, uses Gemini
// =====================================================

export async function generateText(options: {
  prompt: string;
  system?: string;
}): Promise<{ text: string }> {
  if (!isConfigured.gemini) {
    return { text: 'IA não configurada. Adicione a chave do Gemini em constants/config.ts.' };
  }

  const { text, error } = await sendGeminiMessage(
    options.prompt,
    [],
    'geral',
    options.system || SYSTEM_PROMPTS.geral,
  );

  if (error || !text) {
    throw new Error(error || 'Erro ao gerar texto');
  }

  return { text };
}

export async function generateObject<T = unknown>(options: {
  prompt: string;
  system?: string;
  schema?: unknown;
}): Promise<{ object: T }> {
  if (!isConfigured.gemini) {
    throw new Error('IA não configurada. Adicione a chave do Gemini em constants/config.ts.');
  }

  const jsonPrompt = `${options.prompt}\n\nIMPORTANTE: Responda APENAS com um JSON válido, sem markdown, sem código, sem explicações. Apenas o JSON puro.`;

  const { text, error } = await sendGeminiMessage(
    jsonPrompt,
    [],
    'geral',
    options.system || 'Você é um assistente que responde SEMPRE em formato JSON válido. Sem markdown, sem blocos de código, apenas JSON puro.',
  );

  if (error || !text) {
    throw new Error(error || 'Erro ao gerar objeto');
  }

  try {
    // Try to extract JSON from the response (handle cases where model wraps in ```json)
    let jsonStr = text.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }
    const parsed = JSON.parse(jsonStr) as T;
    return { object: parsed };
  } catch {
    throw new Error('Erro ao processar resposta da IA');
  }
}

// Função para palavra profética diária
export async function generatePropheticWord(): Promise<{ text: string | null; error: string | null }> {
  const prompt = `Gere uma palavra profética/encorajadora para hoje baseada na Bíblia.
Inclua:
1. Um versículo base
2. Uma mensagem de encorajamento (2-3 parágrafos)
3. Uma declaração de fé para o leitor repetir

Tom: esperançoso, firme na fé, bíblico.`;

  return sendGeminiMessage(prompt, [], 'devocional');
}
