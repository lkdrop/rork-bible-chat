import { CONFIG, isConfigured } from '@/constants/config';

// =====================================================
// GROQ AI SERVICE (OpenAI-compatible)
// =====================================================
// Usa a API da Groq com modelo LLaMA 3.3 70B
// Formato compatível com OpenAI Chat Completions
// =====================================================

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqResponse {
  choices?: {
    message: {
      content: string;
    };
  }[];
  error?: {
    message: string;
  };
}

// Converte formato Gemini → formato OpenAI/Groq
function convertToGroqMessages(
  history: GeminiMessage[],
  userMessage: string,
  systemPrompt: string,
): GroqMessage[] {
  const messages: GroqMessage[] = [
    { role: 'system', content: systemPrompt },
  ];

  for (const msg of history) {
    messages.push({
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: msg.parts.map(p => p.text).join(''),
    });
  }

  messages.push({ role: 'user', content: userMessage });
  return messages;
}

// System prompts por modo
export const SYSTEM_PROMPTS: Record<string, string> = {
  geral: `Você é Gabriel, o guia espiritual do app Devocio. Você conversa como um mentor espiritual experiente que se importa com cada pessoa.

REGRAS CRÍTICAS:
- NUNCA envie mensagens genéricas ou aleatórias. Responda DIRETAMENTE ao que o usuário disse.
- PRIMEIRO entenda a pessoa: pergunte, descubra o contexto, a dor, o momento de vida.
- Acolha ANTES de instruir. Valide sentimentos antes de trazer versículos.
- Máximo 1-2 versículos por mensagem. Não despeje conteúdo.
- Faça perguntas para mostrar interesse genuíno.
- Fale como amigo sábio, não como enciclopédia.
- Responda sempre em português brasileiro.
- Não invente versículos ou referências.
- Nunca entre em debates denominacionais.
- Seja especialista em direct response e conexão emocional através da Palavra.`,

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
  if (!isConfigured.groq) {
    return {
      text: null,
      error: 'API da Groq não configurada. Adicione sua chave em constants/config.ts',
    };
  }

  const systemPrompt = customSystemPrompt || SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.geral;
  const messages = convertToGroqMessages(conversationHistory, userMessage, systemPrompt);

  try {
    const res = await fetch(`${CONFIG.GROQ_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: CONFIG.GROQ_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 0.95,
      }),
    });

    const data: GroqResponse = await res.json();

    if (!res.ok || data.error) {
      return {
        text: null,
        error: data.error?.message || 'Erro ao se comunicar com a IA',
      };
    }

    const text = data.choices?.[0]?.message?.content;

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
// Drop-in replacement - same interface, uses Groq
// =====================================================

export async function generateText(options: {
  prompt?: string;
  system?: string;
  messages?: { role: string; content: string }[];
}): Promise<string> {
  if (!isConfigured.groq) {
    return 'IA não configurada. Adicione a chave da Groq em constants/config.ts.';
  }

  // Support both { prompt } and { messages: [...] } formats
  let prompt = options.prompt || '';
  let system = options.system || SYSTEM_PROMPTS.geral;

  if (options.messages && options.messages.length > 0) {
    // Extract system message if present
    const systemMsg = options.messages.find(m => m.role === 'system');
    if (systemMsg) system = systemMsg.content;

    // Combine user messages into prompt
    const userMsgs = options.messages.filter(m => m.role === 'user');
    if (userMsgs.length > 0) prompt = userMsgs.map(m => m.content).join('\n');
  }

  if (!prompt) {
    throw new Error('Prompt vazio');
  }

  const { text, error } = await sendGeminiMessage(
    prompt,
    [],
    'geral',
    system,
  );

  if (error || !text) {
    throw new Error(error || 'Erro ao gerar texto');
  }

  return text;
}

export async function generateObject<T = unknown>(options: {
  prompt?: string;
  system?: string;
  schema?: unknown;
  messages?: { role: string; content: string }[];
}): Promise<{ object: T }> {
  if (!isConfigured.groq) {
    throw new Error('IA não configurada. Adicione a chave da Groq em constants/config.ts.');
  }

  // Support both { prompt } and { messages: [...] } formats
  let basePrompt = options.prompt || '';
  if (options.messages && options.messages.length > 0) {
    const userMsgs = options.messages.filter(m => m.role === 'user');
    if (userMsgs.length > 0) basePrompt = userMsgs.map(m => m.content).join('\n');
  }

  const jsonPrompt = `${basePrompt}\n\nIMPORTANTE: Responda APENAS com um JSON válido, sem markdown, sem código, sem explicações. Apenas o JSON puro.`;

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
