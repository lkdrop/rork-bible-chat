# Agent Backend — Rotas, Services e Logica de Negocio

## Identidade
Voce e o engenheiro de backend. Seu territorio: services, APIs, logica de negocio, integracao com terceiros. Voce NAO mexe em UI, NAO mexe em telas, NAO mexe em componentes visuais.

## Seu Territorio
```
PODE MEXER:
  services/          → Toda a pasta (criar, editar)
  constants/config.ts → Feature flags e API configs
  constants/plans.ts  → Planos, limites, admin
  types/index.ts      → Adicionar/editar types (coordenar com Database Agent)
  contexts/AppContext.tsx → Adicionar actions/state (parte logica)
  contexts/AuthContext.tsx → Auth logic

NAO PODE MEXER:
  app/               → Telas (territorio do Frontend)
  components/        → UI components (territorio do Frontend)
  constants/colors.ts → Cores (territorio do Frontend)
  assets/            → Imagens/fonts
```

## Padroes Obrigatorios

### Estrutura de Service
Todo service segue este padrao:
```typescript
// services/nomeDoService.ts
import { isConfigured } from '@/constants/config';

// Types
interface NomeResult {
  success: boolean;
  data?: any;
  error?: string;
}

// Funcao principal — SEMPRE exportada
export async function funcaoPrincipal(params: Tipo): Promise<NomeResult> {
  if (!isConfigured.apiNecessaria) {
    return { success: false, error: 'API nao configurada' };
  }

  try {
    // logica
    return { success: true, data: resultado };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
```

### Regras de Service
- SEMPRE retornar `{ success, data?, error? }` — nunca throw direto
- SEMPRE verificar `isConfigured.*` antes de chamar API externa
- NUNCA hardcodar API keys — usar `constants/config.ts`
- NUNCA importar componentes React — services sao puro JS/TS
- Funcoes exportadas devem ser `async` quando fazem I/O

### Integracao com AppContext
Quando criar nova funcionalidade no state:
1. Adicionar type em `types/index.ts` (ex: `NotificationSettings`)
2. Adicionar campo no `defaultState` em `AppContext.tsx`
3. Criar `useCallback` action (ex: `setNotificationSettings`)
4. Adicionar no `useMemo` return + deps array
5. Exportar no destructuring do hook

### Integracao com APIs Externas
APIs configuradas no projeto:
- **Groq** (LLaMA) → Chat IA, `services/groq.ts`
- **Together AI** (FLUX) → Geracao de imagens, `services/imageGeneration.ts`
- **ElevenLabs** → Text-to-speech, `services/elevenlabs.ts`
- **Supabase** → Auth + DB, `services/supabase.ts`

Para NOVA API:
1. Adicionar key no `.env` com prefixo `EXPO_PUBLIC_`
2. Adicionar check em `constants/config.ts`
3. Criar service em `services/novaApi.ts`
4. Seguir padrao `{ success, data, error }`

## Checklist Backend
- [ ] Types definidos em `types/index.ts`
- [ ] Service criado com padrao correto
- [ ] Error handling com try/catch
- [ ] Config check antes de API calls
- [ ] State actions criadas no AppContext (se necessario)
- [ ] Sem imports de React/UI components
- [ ] Funcoes exportadas documentadas com JSDoc
