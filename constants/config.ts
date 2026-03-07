// =============================================================
// CONFIGURAÇÃO DAS API KEYS
// =============================================================
// As chaves são lidas de variáveis de ambiente (.env).
// Crie um arquivo .env na raiz do projeto com as seguintes variáveis:
//
// EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
// EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
// EXPO_PUBLIC_GROQ_API_KEY=sua_chave_groq
// EXPO_PUBLIC_STABILITY_API_KEY=sua_chave_stability
// EXPO_PUBLIC_ELEVENLABS_API_KEY=sua_chave_elevenlabs
//
// Você pode obter as chaves nos seguintes sites:
//
// 1. SUPABASE (grátis):
//    - Acesse: https://supabase.com
//    - Crie um projeto → vá em Settings → API
//    - Copie a "Project URL" e a "anon/public key"
//
// 2. GROQ (grátis):
//    - Acesse: https://console.groq.com/keys
//    - Crie uma API Key
//    - Copie a chave gerada
//
// 3. BIBLE API (grátis):
//    - Acesse: https://scripture.api.bible
//    - Crie uma conta → crie um App
//    - Copie a API Key
// =============================================================

export const CONFIG = {
  // Supabase
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',

  // Groq AI
  GROQ_API_KEY: process.env.EXPO_PUBLIC_GROQ_API_KEY || '',
  GROQ_BASE_URL: 'https://api.groq.com/openai/v1',
  GROQ_MODEL: 'llama-3.3-70b-versatile',

  // Bible API (scripture.api.bible)
  BIBLE_API_KEY: process.env.EXPO_PUBLIC_BIBLE_API_KEY || '',

  // Stability AI (image generation)
  STABILITY_API_KEY: process.env.EXPO_PUBLIC_STABILITY_API_KEY || '',
  STABILITY_BASE_URL: 'https://api.stability.ai',

  // ElevenLabs (text-to-speech)
  ELEVENLABS_API_KEY: process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || '',
  ELEVENLABS_BASE_URL: 'https://api.elevenlabs.io/v1',
  // Vozes PT-BR recomendadas:
  // Ana (feminina calma): 'vibfi5nlk3hs8Mtvf9Oy'
  // Carla (narradora): 'oJebhZNaPllxk6W0LSBA'
  // Keren (doce): '33B4UnXyTNbgLmdEDh5P'
  // Borges (masculina calma): '9pDzHy2OpOgeXM8SeL0t'
  // Adriano (narrador profundo): 'hwnuNyWkl9DjdTFykrN6'
  // Will (masculina suave): 'CstacWqMhJQlnfLPxRG4'
  ELEVENLABS_VOICE_ID: 'vibfi5nlk3hs8Mtvf9Oy',
} as const;

// Verifica se as chaves foram configuradas
export const isConfigured = {
  supabase: !!CONFIG.SUPABASE_URL && !!CONFIG.SUPABASE_ANON_KEY,
  groq: !!CONFIG.GROQ_API_KEY,
  bibleApi: !!CONFIG.BIBLE_API_KEY,
  stability: !!CONFIG.STABILITY_API_KEY,
  elevenlabs: !!CONFIG.ELEVENLABS_API_KEY,
} as const;
