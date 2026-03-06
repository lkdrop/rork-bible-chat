// =============================================================
// CONFIGURAÇÃO DAS API KEYS
// =============================================================
// Substitua os valores abaixo pelas suas chaves reais.
// Você pode obter as chaves nos seguintes sites:
//
// 1. SUPABASE (grátis):
//    - Acesse: https://supabase.com
//    - Crie um projeto → vá em Settings → API
//    - Copie a "Project URL" e a "anon/public key"
//
// 2. GOOGLE GEMINI (grátis):
//    - Acesse: https://aistudio.google.com/apikey
//    - Clique em "Create API Key"
//    - Copie a chave gerada
//
// 3. BIBLE API (grátis):
//    - Acesse: https://scripture.api.bible
//    - Crie uma conta → crie um App
//    - Copie a API Key
// =============================================================

export const CONFIG = {
  // Supabase
  SUPABASE_URL: 'YOUR_SUPABASE_URL_HERE',
  SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY_HERE',

  // Google Gemini AI
  GEMINI_API_KEY: 'YOUR_GEMINI_API_KEY_HERE',

  // Bible API (scripture.api.bible)
  BIBLE_API_KEY: 'YOUR_BIBLE_API_KEY_HERE',
} as const;

// Verifica se as chaves foram configuradas
export const isConfigured = {
  supabase: CONFIG.SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE' && CONFIG.SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY_HERE',
  gemini: CONFIG.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE',
  bibleApi: CONFIG.BIBLE_API_KEY !== 'YOUR_BIBLE_API_KEY_HERE',
} as const;
