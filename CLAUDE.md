# Devocio — Projeto Principal

## O que e este projeto
App cristao de estudo biblico com IA. PWA (Progressive Web App) construido com React Native Web + Expo + Supabase. Publico: cristãos brasileiros, principalmente mulheres evangelicas 25-45 anos.

## Tech Stack
- **Framework**: React Native Web (Expo SDK 53)
- **Router**: expo-router (file-based)
- **Backend**: Supabase (auth + database)
- **IA Chat**: Groq API (LLaMA)
- **IA Imagens**: Together AI (FLUX.1-schnell)
- **IA Audio**: ElevenLabs TTS
- **Styling**: StyleSheet nativo (sem Tailwind)
- **State**: Context API (AppContext + AuthContext)
- **Deploy**: Vercel (web export)

## Arquitetura de Pastas
```
app/              → Telas (file-based routing)
  (tabs)/         → Tab navigator (home, community, chat, study, profile)
  auth/           → Login/registro
  landing.tsx     → Landing page marketing (SEMPRE dark)
  paywall.tsx     → Planos e upgrade
components/       → Componentes reutilizaveis
constants/        → Cores, config, planos, imagens
contexts/         → AppContext (state global) + AuthContext (auth)
services/         → APIs (Groq, Together, ElevenLabs, Supabase)
types/            → TypeScript types
```

## Regras Criticas de Codigo

### Web Compatibility
- `Platform.OS === 'web'` e TRUE em desktop E mobile browser
- Usar `const isDesktop = isWeb && SCREEN_WIDTH >= 768` para layout decisions
- `Alert.alert()` com multiplos botoes NAO funciona na web → usar View com position fixed
- `Modal` do RN Web tem bugs com touch em mobile → usar renderizacao condicional + fixedOverlay
- Nunca usar `Pressable` para overlays na web → usar `TouchableOpacity activeOpacity={1}`

### Temas
- Tema LIGHT e o padrao para novos usuarios
- `LightColors` e `DarkColors` em `constants/colors.ts`
- 91 arquivos usam `colors.*` dinamico (mudam automaticamente)
- Landing page SEMPRE escura (pagina de marketing)
- Toggle de tema no Perfil (Switch component)

### Planos / Freemium
- 3 planos: free, semente (R$9,90), oferta (R$29,90)
- Limites definidos em `constants/plans.ts`
- Admin emails em `ADMIN_EMAILS` → acesso total automatico
- Admin atual: johnlk158776@gmail.com

### Padroes de Codigo
- Sempre usar `useCallback` e `useMemo` para funcoes/valores em contexts
- Exports de contexto via `createContextHook` (@nkzw/create-context-hook)
- Imagens via `expo-image` (nao react-native Image)
- Icones via `lucide-react-native`
- Haptics via `expo-haptics`

## Time de Claudes (Skills Disponiveis)
- `.claude/skills/copywriting.md` → Copy DR + Analise SaaS + Ideacao + Marketing
- `.claude/skills/build.md` → Especialista em codigo/build do Devocio
- `.claude/skills/marketing.md` → Pipeline de conteudo em escala
- `.claude/skills/research.md` → Mineracao de oportunidades e pesquisa de mercado

## Comandos Uteis
```bash
npx expo start --web --port 8082    # Dev server
npx expo export -p web              # Build para producao
```
