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
  SUPABASE_URL: 'https://tdryewlksrxhpbtcnphy.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkcnlld2xrc3J4aHBidGNucGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3OTk5NTUsImV4cCI6MjA4ODM3NTk1NX0.aRIC1SCbuVpvhZhYUiLH1C2Eui263Jp4fYvlQ-pusSo',

  // Google Gemini AI
  GEMINI_API_KEY: 'AIzaSyAqH9R_5NszzCHh1RpD8ZDRYxylDC_15wQ',

  // Bible API (scripture.api.bible)
  BIBLE_API_KEY: 'YOUR_BIBLE_API_KEY_HERE',
} as const;

// Verifica se as chaves foram configuradas
export const isConfigured = {
  supabase: CONFIG.SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE' && CONFIG.SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY_HERE',
  gemini: CONFIG.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE',
  bibleApi: CONFIG.BIBLE_API_KEY !== 'YOUR_BIBLE_API_KEY_HERE',
} as const;
