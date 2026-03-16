# MASTER ROADMAP -- Devocio.IA

**Data:** 07/03/2026
**Versao:** 1.0
**Compilado por:** Agente Orquestrador
**Fontes:** Relatorio Leticia (UX), Relatorio Rafael (Retention), Skills do Time, Codebase Atual

---

## SECAO 1: Estado Atual do App

### Stack Tecnologica

| Camada | Tecnologia |
|--------|-----------|
| Framework | React Native Web (Expo SDK 53) |
| Router | expo-router (file-based) |
| Backend | Supabase (auth + database) |
| IA Chat | Groq API (LLaMA 3.3 70B) |
| IA Imagens | Together AI (FLUX.1-schnell) |
| IA Audio | ElevenLabs TTS |
| Styling | StyleSheet nativo (sem Tailwind) |
| State | Context API (AppContext + AuthContext) |
| Deploy | Vercel (web export) |
| Plataforma | PWA (Progressive Web App) |

### Features Ja Implementadas (Funcionando)

#### Home / Dashboard
- Versiculo do dia (`constants/dailyVerses.ts`)
- Devocional gerado por IA
- Louvores curados com reflexao
- Audio guiado (secao na home)
- Bible videos (`constants/bibleVideos.ts`)

#### Chat Gabriel (IA)
- 6 modos de chat: Geral, Como me Sinto, Teologia, Grego/Hebraico, Prep. Sermao, Devocional (`app/(tabs)/chat/index.tsx`)
- Gabriel Memory: armazena nome, fatos, topicos, pedidos de oracao, estudo atual (`contexts/AppContext.tsx`, linhas 61-68)
- Extracao automatica de fatos da conversa do usuario (nome, estudo, pedidos de oracao, temas)
- System prompts por modo (`services/gemini.ts`, linhas 53-97)
- System prompt principal com regras de conversa, formatacao de versiculos e oracoes
- Campanhas sazonais injetadas no contexto do Gabriel
- Quick suggestions por modo
- Compartilhamento de mensagens
- Salvamento de versiculos e oracoes direto do chat
- TTS (text-to-speech) para oracoes via ElevenLabs

#### Estudo Biblico
- Biblia completa (API `services/bibliaDigital.ts`)
- Planos de estudo (`constants/studyPlans.ts`)
- Quiz biblico (`constants/quizData.ts`)
- Bible Battle (jogo competitivo)
- Personagens biblicos (`constants/bibleCharacters.ts`)
- Maratona de leitura (`constants/readingMarathon.ts`)
- Vigilia 21 dias (`constants/vigiliaData.ts`)
- Jornada 28 dias (`constants/journeyData.ts`)
- Favoritos / Highlights de versiculos

#### Comunidade
- Posts (testemunhos, oracoes, perguntas, devocionais, versiculos)
- Likes, comentarios, follow/followers
- DMs (mensagens diretas)
- Stories (24h)
- Post anonimo
- Muro de oracao
- Perfil comunitario (nome, avatar, bio, foto)

#### Ferramentas
- Oracao ACTS guiada
- Palavra profetica diaria
- Diario espiritual
- Metas espirituais
- Preparacao de sermao
- Notas de sermao

#### Criacao de Conteudo
- Verse cards
- Bible reels
- Prayer cards
- Captions, hashtags, bio (gerador IA)
- Image generator IA (Together AI)
- Bible stories

#### Jogos
- Memory game
- Snake game
- Bible Battle

#### Sistema de Gamificacao
- Streak com milestones (3, 7, 14, 30, 60, 90, 180, 365 dias)
- Streak repair (1 gratis, premium ganha 1/semana ate max 3)
- XP com 12 niveis (Semente ate Embaixador de Cristo) (`constants/levels.ts`)
- XP Rewards para diversas acoes (login, chat, plano, comunidade, quiz)
- Badges/Achievements system
- StreakBadge component

#### Monetizacao
- 3 planos: Free, Semente (R$9,90/mes), Oferta (R$29,90/mes) (`constants/plans.ts`)
- Limites por plano: mensagens, imagens, TTS, acesso a jornada/vigilia
- Paywall (`app/paywall.tsx`)
- Admin emails com acesso total automatico

#### Campanhas Sazonais (8 definidas)
- Quaresma, Pascoa, Pentecostes, Missoes, Reforma, Advento, Natal, Ano Novo (`constants/campaigns.ts`)
- Cada campanha com: prompt especial para Gabriel, desafio diario, versiculo, gradiente visual

#### Onboarding
- 3 telas: denominacao, traducao, horario de notificacao (`app/onboarding.tsx`)
- Quiz de personalizacao: nivel espiritual, objetivo, desafio (`app/personalization-quiz.tsx`)
- Desafio de 7 dias (`app/challenge-7days.tsx`)

#### Infraestrutura
- Tema Light (padrao) e Dark com toggle (`constants/colors.ts`)
- 91+ arquivos com `colors.*` dinamico
- Landing page escura (marketing) (`app/landing.tsx`)
- Auth com Supabase (`app/auth.tsx`)

### O Que Ja Foi Corrigido/Melhorado (Sessao Atual)

Baseado no plano `recursive-cuddling-crab.md`:

1. **Tema claro ativado como padrao** -- `defaultState.theme` mudado para `'light'`
2. **Paleta LightColors refinada** -- textos ajustados para tons marrom/quente (parchment feeling)
3. **StatusBar dinamica** -- adapta ao tema ativo
4. **Splash screen** -- backgroundColor atualizado para `#FBF8F1`
5. **AudioPlayerBar** -- cores hardcoded substituidas por `colors.*`
6. **Paywall** -- ~11 cores hardcoded corrigidas para tema dinamico
7. **Toggle de tema no Perfil** -- Switch funcional com icones Sun/Moon
8. **Migracao v2** -- usuarios antigos no dark sao migrados para light automaticamente

---

## SECAO 2: Problemas Identificados

### CRITICO (Bloqueiam retencao e conversao)

| # | Problema | Fonte | Impacto |
|---|----------|-------|---------|
| C1 | **Push notifications sao apenas UI** -- nao implementadas de verdade. Escolha de horario no onboarding nao faz nada | Rafael | 95% dos users opt-in que NAO recebem push churn em 90 dias |
| C2 | **Onboarding pede config ANTES de mostrar valor** -- usuario escolhe denominacao/traducao antes de experimentar o Gabriel | Leticia + Rafael | Duolingo: valor antes de signup = +20% D1 retention |
| C3 | **Gabriel nao e proativo** -- so responde, nunca inicia conversa. Nao faz follow-up de pedidos de oracao | Leticia + Rafael | Personalizacao proativa triplica retencao (Localytics) |
| C4 | **Sem free trial real implementado** -- `activatePremium()` ativa direto sem logica de trial (data inicio, countdown, expiracao) | Leticia | 38% de trial users convertem para pago |
| C5 | **Falta plano semanal** -- 60% das assinaturas em LATAM sao semanais. Falta R$4,90/sem | Leticia | Captura segmento dominante de mercado BR |
| C6 | **Falta plano anual** -- sem R$79,90/ano (12x R$6,66). Gap enorme de monetizacao | Leticia | Desconto 33-50% vs mensal e padrao da industria |

### IMPORTANTE (Melhoram metricas significativamente)

| # | Problema | Fonte | Impacto |
|---|----------|-------|---------|
| I1 | **Sem Arvore da Fe visual** -- gamificacao e so numeros (XP, nivel, streak). Falta representacao visual emocional | Leticia + Rafael | Apps com streak + visual: 40-60% mais DAU |
| I2 | **Sem daily rewards alem de XP** -- falta "presente espiritual" diario (promessa biblica, card colecionavel) | Leticia + Rafael | Daily bonus: mecanica comprovada de retorno |
| I3 | **Sem compartilhamento WhatsApp nativo** -- share generico ao inves de botao especifico WhatsApp | Leticia | WhatsApp esta em 99% dos celulares BR |
| I4 | **Paywall sem trigger contextual** -- aparece sem momento claro, nao apos "aha moment" | Rafael | Users que entendem valor = +30% conversao |
| I5 | **Gabriel Memory subutilizada** -- quiz coleta dados ricos mas so usa na jornada 28 dias, nao em TUDO | Leticia | Dados ja existem, so falta conectar |
| I6 | **Sem audio devocional guiado** -- TTS existe mas nao ha meditacoes guiadas pre-estruturadas | Leticia + Rafael | Hallow: 100% audio, #1 App Store, $100M+ funding |
| I7 | **Campanhas sazonais definidas mas sem amplificacao** -- 8 campanhas no codigo, sem marketing externo | Leticia | Hallow Quaresma: 500K downloads/dia |
| I8 | **Sem weekly summary** -- usuario nao sabe seu progresso semanal | Rafael | Visibilidade de progresso quase dobra retencao (Adjust) |

### NICE TO HAVE (Diferenciam a longo prazo)

| # | Problema | Fonte | Impacto |
|---|----------|-------|---------|
| N1 | Sem plano Igreja/Pastor com dashboard | Leticia | Igrejas como canal de distribuicao (Hallow: +30% users) |
| N2 | Sem parceiro de oracao/accountability | Rafael | Follow-through: 65% -> 95% (Berkeley) |
| N3 | Sem grupos de estudo ("Plano com Amigos") | Leticia + Rafael | YouVersion: feature mais social |
| N4 | Sem desafios comunitarios com leaderboard | Rafael | Engajamento coletivo |
| N5 | Sem bot WhatsApp do Gabriel | Leticia | Funil de aquisicao quase gratis |
| N6 | Sem personalizacao por denominacao no conteudo | Leticia | Conteudo generico para todas as denominacoes |
| N7 | Sem modo offline robusto | Leticia | Essencial para igrejas rurais no Brasil |
| N8 | Sem sleep mode / audio para dormir | Rafael | Hallow/Dwell: captura 2o momento do dia |

---

## SECAO 3: Mapa de Fases

```
FASE 0: Ja Feito                          -- COMPLETO
FASE 1: Quick Wins (1-2 dias)             -- ZERO RISCO
FASE 2: Gabriel Overhaul (3-5 dias)       -- CORE DO APP
FASE 3: Onboarding Value-First (2-3 dias) -- DEPENDE DA FASE 2
FASE 4: Retencao & Gamificacao (1-2 sem)  -- PARALELO PARCIAL
FASE 5: Social & Viral (2-3 semanas)      -- DEPENDE DA FASE 4
FASE 6: Monetizacao & Growth (ongoing)    -- DEPENDE DA FASE 3+
```

---

### FASE 0: Ja Feito

- [x] Tema claro como padrao (`constants/colors.ts`, `contexts/AppContext.tsx`)
- [x] Paleta LightColors refinada (tons marrom/pergaminho)
- [x] StatusBar dinamica por tema (`app/_layout.tsx`)
- [x] Splash screen com background cream (`app.json`)
- [x] AudioPlayerBar sem cores hardcoded (`components/AudioPlayerBar.tsx`)
- [x] Paywall com cores dinamicas (`app/paywall.tsx`)
- [x] Toggle de tema no Perfil (`app/(tabs)/profile/index.tsx`)
- [x] Migracao automatica de usuarios dark para light

---

### FASE 1: Quick Wins (1-2 dias) -- ZERO RISCO

Tarefas que podem ser feitas HOJE sem quebrar nada existente.

#### 1.1 -- Plano Semanal R$4,90

**Prioridade:** P0
**Responsavel:** Leticia (UX) + Carol (copy)
**Esforco:** 2h
**Impacto:** Alto -- captura 60% das assinaturas LATAM
**Arquivos afetados:**
- `constants/plans.ts` -- adicionar PlanId `'semanal'`, definir limites e PlanDefinition
- `app/paywall.tsx` -- renderizar novo plano na UI
- `contexts/AppContext.tsx` -- garantir compatibilidade com novo planId
**Dependencias:** Nenhuma
**Criterio de sucesso:** Plano semanal visivel na paywall com preco R$4,90/sem
**Risco:** Baixo. Mudanca aditiva, nao altera planos existentes

#### 1.2 -- Plano Anual R$79,90/ano

**Prioridade:** P0
**Responsavel:** Leticia (UX) + Carol (copy)
**Esforco:** 2h
**Impacto:** Alto -- ancora de preco + parcelamento 12x R$6,66
**Arquivos afetados:**
- `constants/plans.ts` -- adicionar PlanId `'anual'`, definir limites e PlanDefinition
- `app/paywall.tsx` -- renderizar com destaque "Economia de 33%"
**Dependencias:** Nenhuma
**Criterio de sucesso:** Plano anual visivel na paywall com economia destacada
**Risco:** Baixo. Mudanca aditiva

#### 1.3 -- Botao WhatsApp em Todo Conteudo Compartilhavel

**Prioridade:** P0
**Responsavel:** Leticia (UX)
**Esforco:** 3h
**Impacto:** Alto -- 99% dos celulares BR tem WhatsApp
**Arquivos afetados:**
- `utils/index.ts` -- criar funcao `shareViaWhatsApp(text: string)`
- `components/VerseCard.tsx` -- adicionar botao WhatsApp
- `components/PrayerCard.tsx` -- adicionar botao WhatsApp
- `app/(tabs)/chat/index.tsx` -- adicionar opcao WhatsApp no share de mensagens
- `app/(tabs)/home/index.tsx` -- botao WhatsApp no versiculo do dia
**Dependencias:** Nenhuma
**Criterio de sucesso:** Botao verde WhatsApp visivel em versiculos, oracoes, mensagens do chat
**Risco:** Baixo. WhatsApp deep link `whatsapp://send?text=` funciona cross-platform

#### 1.4 -- Streak Forgiveness Tematico

**Prioridade:** P1
**Responsavel:** Carol (copy) + Leticia (UX)
**Esforco:** 1h
**Impacto:** Medio -- transforma mecanica de gamificacao em experiencia espiritual
**Arquivos afetados:**
- `components/StreakBadge.tsx` -- renomear "Streak Repair" para "Perdao do Streak", adicionar mensagem espiritual
- `contexts/AppContext.tsx` -- sem mudanca de logica (campo `streakRepairs` ja existe, linha 93)
**Dependencias:** Nenhuma
**Criterio de sucesso:** Quando streak e reparado, usuario ve: "Assim como Deus te perdoa, perdoamos seu streak"
**Risco:** Nenhum. Mudanca de copy apenas

#### 1.5 -- Paywall Contextual (Triggers Inteligentes)

**Prioridade:** P1
**Responsavel:** Leticia (UX)
**Esforco:** 3h
**Impacto:** Alto -- +30% conversao vs paywall aleatorio
**Arquivos afetados:**
- `app/(tabs)/chat/index.tsx` -- redirecionar para paywall apos 5a mensagem com mensagem contextual
- `app/paywall.tsx` -- aceitar parametro de `trigger` para personalizar copy ("Voce usou suas 5 mensagens de hoje")
**Dependencias:** Nenhuma
**Criterio de sucesso:** Paywall aparece com copy contextual apos trigger real (limite de msgs, tentativa de gerar imagem)
**Risco:** Baixo. Logica de limite ja existe em `canSendMessage()`

#### 1.6 -- Copy de Milestone de Streak

**Prioridade:** P1
**Responsavel:** Carol (copy)
**Esforco:** 1h
**Impacto:** Medio -- celebracao retem mais que numero frio
**Arquivos afetados:**
- `components/StreakBadge.tsx` -- adicionar mensagens de milestone personalizadas
- `constants/levels.ts` -- possivel adicao de copy por milestone
**Dependencias:** Nenhuma
**Criterio de sucesso:** Mensagens espirituais para cada milestone (3, 7, 14, 30, 60, 90, 180, 365 dias)
**Risco:** Nenhum. Mudanca de copy

#### 1.7 -- Weekly Summary

**Prioridade:** P1
**Responsavel:** Leticia (UX)
**Esforco:** 4h
**Impacto:** Medio -- visibilidade de progresso quase dobra retencao
**Arquivos afetados:**
- `app/(tabs)/home/index.tsx` -- adicionar card de resumo semanal
- `contexts/AppContext.tsx` -- calcular metricas da semana (dias ativos, msgs enviadas, XP ganho)
**Dependencias:** Nenhuma
**Criterio de sucesso:** Card "Sua Semana" na home mostrando: dias ativos, streak, XP ganho, capitulos lidos
**Risco:** Baixo. Dados ja existem no state

---

### FASE 2: Gabriel Overhaul (3-5 dias) -- CORE DO APP

O Gabriel e o diferencial #1 do Devocio. Precisa evoluir de "chatbot reativo" para "guia espiritual proativo e pessoal".

#### 2.1 -- Pesquisa de Persona do Gabriel

**Prioridade:** P0
**Responsavel:** Bryan (Research)
**Esforco:** 8h
**Impacto:** Alto -- fundamenta TUDO que o Gabriel vai dizer
**Arquivos afetados:** Nenhum (entregavel e documento de pesquisa)
- Saida: `docs/gabriel-persona-research.md`
**Dependencias:** Nenhuma
**Criterio de sucesso:** Documento com: tom ideal por denominacao, expressoes reais do publico BR, limites teologicos, exemplos de conversa ideal vs ruim
**Risco:** Pesquisa pode demorar se fontes forem escassas. Bryan deve priorizar Reddit/comunidades BR

#### 2.2 -- Reescrita dos System Prompts

**Prioridade:** P0
**Responsavel:** Carol (Copy) + Bryan (dados de persona)
**Esforco:** 6h
**Impacto:** Alto -- muda TODA a experiencia de conversa
**Arquivos afetados:**
- `services/gemini.ts` -- reescrever `SYSTEM_PROMPTS` (linhas 53-97) com base na pesquisa do Bryan
- `app/(tabs)/chat/index.tsx` -- reescrever `GABRIEL_SYSTEM_PROMPT` (linhas 51-92) e `getSystemPrompt()` (linhas 94-169)
**Dependencias:** 2.1 (pesquisa de persona)
**Criterio de sucesso:** Gabriel conversa de forma mais natural, acolhedora e personalizada. Testes A/B com 10 cenarios comuns
**Risco:** ALTO. Mudanca de prompts pode quebrar o tom do Gabriel. Mitigacao: testar cada prompt com 10 inputs antes de deploy

#### 2.3 -- Gabriel Proativo

**Prioridade:** P0
**Responsavel:** Leticia (UX) + Carol (copy das mensagens)
**Esforco:** 8h
**Impacto:** Alto -- nenhum concorrente tem IA que INICIA conversa personalizada
**Arquivos afetados:**
- `contexts/AppContext.tsx` -- criar sistema de triggers (inatividade 24h, pedido pendente, milestone alcancado)
- `app/(tabs)/chat/index.tsx` -- renderizar mensagem proativa do Gabriel ao abrir chat
- `services/gemini.ts` -- adicionar funcao `generateProactiveMessage(trigger, memory)`
**Dependencias:** 2.2 (prompts precisam estar prontos)
**Criterio de sucesso:** Ao abrir o chat, Gabriel tem mensagem contextual baseada em: hora do dia, ultimo pedido de oracao, estudo em andamento, streak milestone
**Risco:** Medio. Gabriel proativo ruim (generico/repetitivo) e pior que nenhum. Mitigacao: iniciar com 3 triggers simples e expandir

#### 2.4 -- Memoria Inteligente Expandida

**Prioridade:** P1
**Responsavel:** Leticia (UX)
**Esforco:** 4h
**Impacto:** Alto -- sensacao de relacionamento real com Gabriel
**Arquivos afetados:**
- `contexts/AppContext.tsx` -- expandir `gabrielMemory` (linha 61) com: denominacao, versiculos favoritos, momentos de vida, historico de devocionais
- `contexts/AppContext.tsx` -- expandir `getGabrielMemoryPrompt()` (linha 244) para incluir mais contexto
- `app/(tabs)/chat/index.tsx` -- expandir `extractMemoryFacts()` (linha 289) para capturar mais fatos
**Dependencias:** Nenhuma (pode rodar em paralelo com 2.2)
**Criterio de sucesso:** Gabriel usa nome do usuario, refere-se a estudos anteriores, pergunta sobre pedidos de oracao passados -- tudo de forma natural
**Risco:** Baixo. Estrutura ja existe, so expande

---

### FASE 3: Onboarding Value-First (2-3 dias)

O onboarding precisa mostrar o VALOR do app nos primeiros 60 segundos, antes de pedir qualquer configuracao.

#### 3.1 -- Reestruturar Fluxo de Onboarding

**Prioridade:** P0
**Responsavel:** Leticia (UX) + Carol (copy)
**Esforco:** 8h
**Impacto:** Alto -- +20% D1 retention (dado Duolingo)
**Arquivos afetados:**
- `app/onboarding.tsx` -- reestruturar completamente o fluxo (5 telas novas)
- `app/personalization-quiz.tsx` -- integrar quiz como parte do novo fluxo (nao tela separada)
**Dependencias:** Fase 2 completa (Gabriel precisa estar bom para o mini-chat funcionar)
**Criterio de sucesso:** Novo fluxo:
  1. Welcome (sem pedir nada)
  2. Mini-chat com Gabriel (usuario escolhe 1 pergunta pre-definida e ve resposta real)
  3. Personalizacao rapida (denominacao + nivel + objetivo em 1 tela com chips)
  4. Horario de notificacao + aceitar push
  5. "Tudo pronto! Seu devocional espera"
**Risco:** Medio. Reescrever onboarding e mudanca grande. Mitigacao: manter onboarding antigo como fallback (feature flag)

#### 3.2 -- Free Trial de 7 Dias Real

**Prioridade:** P0
**Responsavel:** Leticia (UX)
**Esforco:** 4h
**Impacto:** Alto -- 38% de trial users convertem para pago
**Arquivos afetados:**
- `contexts/AppContext.tsx` -- adicionar campos: `trialStartDate`, `trialEndDate`, `isInTrial`
- `app/paywall.tsx` -- CTA "Experimentar 7 dias gratis" com logica de trial
- `hooks/usePremium.ts` -- verificar se esta em trial e retornar limites premium durante trial
**Dependencias:** Fase 1 (planos semanal/anual ja existirem)
**Criterio de sucesso:** Usuario clica "7 dias gratis", recebe acesso premium por 7 dias, vê countdown, e na expiracao volta para free
**Risco:** Medio. Logica de expiracao precisa ser robusta. Mitigacao: verificar trial no app open, nao so em tempo real

#### 3.3 -- Devocional IA no Final do Onboarding

**Prioridade:** P1
**Responsavel:** Leticia (UX) + Carol (copy)
**Esforco:** 4h
**Impacto:** Alto -- "aha moment" nos primeiros 60 segundos
**Arquivos afetados:**
- `app/onboarding.tsx` -- na tela 5, chamar `generateDailyDevotional()` com dados do quiz
- `services/gemini.ts` -- `generateDailyDevotional()` ja existe (linha 156), adaptar para usar dados do quiz
**Dependencias:** 3.1 (novo fluxo de onboarding)
**Criterio de sucesso:** Ultimo passo do onboarding mostra devocional personalizado baseado no que o usuario acabou de compartilhar
**Risco:** Baixo. Funcao ja existe, so precisa conectar

---

### FASE 4: Retencao & Gamificacao (1-2 semanas)

#### 4.1 -- Push Notifications Reais

**Prioridade:** P0
**Responsavel:** Leticia (UX) + Marcos (QA)
**Esforco:** 12h
**Impacto:** Alto -- +820% retencao vs zero push (Pushwoosh 2025)
**Arquivos afetados:**
- `services/pushNotifications.ts` -- NOVO arquivo. Implementar Web Push API via Service Worker (PWA)
- `app/onboarding.tsx` -- integrar com push permission request real
- `app/_layout.tsx` -- registrar service worker
- `constants/pushTemplates.ts` -- NOVO arquivo. Templates de push (versiculo diario, streak em risco, win-back)
**Dependencias:** Nenhuma (pode comecar em paralelo com Fase 2)
**Criterio de sucesso:** Push notification real no horario escolhido pelo usuario com versiculo do dia
**Risco:** Alto. Push em PWA tem limitacoes (precisa Service Worker, permissao do navegador). Mitigacao: testar em Chrome e Safari iOS separadamente

#### 4.2 -- Arvore da Fe Visual

**Prioridade:** P0
**Responsavel:** Duda (Design) + Leticia (UX)
**Esforco:** 16h
**Impacto:** Alto -- gamificacao emocional. Glorify usa com sucesso
**Arquivos afetados:**
- `components/FaithTree.tsx` -- NOVO componente. Arvore visual que cresce com uso diario
- `app/(tabs)/home/index.tsx` -- renderizar Arvore da Fe como elemento central
- `contexts/AppContext.tsx` -- adicionar estado da arvore (estagio, folhas, frutas baseadas em atividades)
- `constants/faithTree.ts` -- NOVO arquivo. Definir estagios da arvore e criterios de crescimento
**Dependencias:** Nenhuma
**Criterio de sucesso:** Arvore visual na home que muda de aparencia conforme usuario progride. Usuarios identificam visualmente seu crescimento espiritual
**Risco:** Medio. Precisa de arte/SVG de qualidade. Mitigacao: comecar com versao simples (emoji-based) e evoluir

#### 4.3 -- Daily Rewards

**Prioridade:** P1
**Responsavel:** Leticia (UX) + Carol (copy)
**Esforco:** 6h
**Impacto:** Medio -- mecanica comprovada de retorno diario
**Arquivos afetados:**
- `app/(tabs)/home/index.tsx` -- adicionar modal de "Presente Diario" ao abrir app
- `contexts/AppContext.tsx` -- adicionar `dailyReward: { claimed: boolean, lastClaimDate: string, currentReward: object }`
- `constants/dailyRewards.ts` -- NOVO arquivo. Pool de recompensas: promessa biblica, card colecionavel, oracao exclusiva
**Dependencias:** Nenhuma
**Criterio de sucesso:** Ao abrir o app diariamente, usuario recebe um "presente espiritual" (nao so XP)
**Risco:** Baixo. Mecanica simples e aditiva

#### 4.4 -- Streak Visual Melhorado

**Prioridade:** P1
**Responsavel:** Duda (Design) + Leticia (UX)
**Esforco:** 4h
**Impacto:** Alto -- 55% dos usuarios Duolingo voltam pelo streak
**Arquivos afetados:**
- `components/StreakBadge.tsx` -- redesign: maior, com animacao de chama, barra de progresso ate proximo milestone
- `app/(tabs)/home/index.tsx` -- dar mais destaque ao streak na home
**Dependencias:** 1.4 (Streak Forgiveness copy)
**Criterio de sucesso:** Streak visualmente dominante na home. Animacao de chama que cresce. Barra de progresso para proximo milestone
**Risco:** Baixo. Componente ja existe, so melhora visual

#### 4.5 -- Daily Challenge

**Prioridade:** P1
**Responsavel:** Carol (copy) + Leticia (UX)
**Esforco:** 6h
**Impacto:** Medio -- gamificacao: participacao 45% -> 85% (estudo)
**Arquivos afetados:**
- `app/(tabs)/home/index.tsx` -- adicionar card de desafio diario
- `constants/dailyChallenges.ts` -- NOVO arquivo. Pool de 365 desafios diarios
- `contexts/AppContext.tsx` -- adicionar estado de desafio diario (completado, data)
**Dependencias:** Nenhuma
**Criterio de sucesso:** 1 desafio novo por dia na home. Exemplo: "Leia Salmos 23 e conte ao Gabriel o que sentiu"
**Risco:** Baixo. Pool de desafios e trabalho de copy, nao de codigo

---

### FASE 5: Social & Viral (2-3 semanas)

#### 5.1 -- Plano com Amigos (Grupos de Estudo)

**Prioridade:** P1
**Responsavel:** Leticia (UX)
**Esforco:** 20h
**Impacto:** Alto -- YouVersion: feature social mais popular
**Arquivos afetados:**
- `app/(tabs)/study/groups.tsx` -- NOVA tela. Criar grupo, convidar via WhatsApp, ver progresso do grupo
- `contexts/GroupContext.tsx` -- NOVO contexto. Estado de grupos, membros, progresso
- `services/supabase.ts` -- tabelas de grupo no Supabase
**Dependencias:** 1.3 (WhatsApp sharing)
**Criterio de sucesso:** Usuario cria grupo, compartilha link WhatsApp, amigos entram, todos veem progresso mutuo
**Risco:** Alto. Feature social complexa com multiplos edge cases. Mitigacao: MVP com 1 plano compartilhado e progresso basico

#### 5.2 -- Desafios Comunitarios

**Prioridade:** P2
**Responsavel:** Leticia (UX) + Carol (copy)
**Esforco:** 12h
**Impacto:** Medio-Alto -- engajamento coletivo
**Arquivos afetados:**
- `app/(tabs)/community/challenges.tsx` -- NOVA tela. Desafio ativo, progresso global, ranking por grupo/igreja
- `constants/communityChallenges.ts` -- NOVO arquivo. Definicao de desafios (21 dias de oracao, etc.)
**Dependencias:** 4.1 (push notifications para lembrar)
**Criterio de sucesso:** Desafio comunitario ativo com barra de progresso global: "23.456 pessoas estao orando junto com voce"
**Risco:** Medio. Requer dados reais de participantes. Mitigacao: usar numeros simulados inicialmente

#### 5.3 -- Parceiro de Oracao

**Prioridade:** P2
**Responsavel:** Leticia (UX)
**Esforco:** 12h
**Impacto:** Alto -- accountability: 65% -> 95% follow-through
**Arquivos afetados:**
- `app/(tabs)/community/prayer-partner.tsx` -- NOVA tela. Match anonimo para orar junto
- `services/supabase.ts` -- logica de matching
**Dependencias:** Comunidade ja existente (verificado: implementada)
**Criterio de sucesso:** Usuario opta por ter parceiro de oracao, recebe match anonimo, ambos recebem lembretes para orar
**Risco:** Alto. Matching precisa de base de usuarios. Mitigacao: comecar com opt-in e esperar massa critica

---

### FASE 6: Monetizacao & Growth (ongoing)

#### 6.1 -- Plano Igreja (R$29,90/mes para 10 contas)

**Prioridade:** P2
**Responsavel:** Leticia (UX) + Bryan (pesquisa)
**Esforco:** 40h
**Impacto:** Alto -- canal de distribuicao massivo (Hallow: +30% users via igrejas)
**Arquivos afetados:**
- `app/church-dashboard.tsx` -- NOVA tela. Dashboard pastoral
- `constants/plans.ts` -- adicionar plano `'igreja'`
- `services/supabase.ts` -- tabelas de igreja, membros, convites
**Dependencias:** Free trial funcionando (Fase 3)
**Criterio de sucesso:** Pastor compra plano, convida 10 membros via WhatsApp, acompanha engajamento
**Risco:** Alto. Feature complexa com roles/permissoes. Mitigacao: MVP simples -- pastor compartilha codigo de acesso

#### 6.2 -- Campanhas Sazonais Amplificadas

**Prioridade:** P1
**Responsavel:** Carol (copy) + Rafael (growth)
**Esforco:** 8h por campanha
**Impacto:** Alto -- Hallow: 500K downloads/dia na Quaresma
**Arquivos afetados:**
- `constants/campaigns.ts` -- ja definidas (8 campanhas). Adicionar: Carnaval, Dia das Maes, Black Friday Gospel
- `app/(tabs)/home/index.tsx` -- banner de campanha ativa com CTA forte
- `services/gemini.ts` -- prompts sazonais ja integrados no chat
**Dependencias:** 4.1 (push notifications para divulgar campanhas)
**Criterio de sucesso:** Campanha ativa visivel na home com: contador de participantes, desafio diario tematico, conteudo exclusivo
**Risco:** Baixo. Infraestrutura ja existe, falta amplificacao

#### 6.3 -- Bencao Personalizada ao Assinar

**Prioridade:** P2
**Responsavel:** Carol (copy) + Leticia (UX)
**Esforco:** 4h
**Impacto:** Medio -- transforma pagamento em experiencia espiritual. NENHUM concorrente faz isso
**Arquivos afetados:**
- `app/paywall.tsx` -- apos ativar premium, chamar `generateBlessingForSubscriber()`
- `services/gemini.ts` -- NOVA funcao. Gera bencao/profecia personalizada baseada no quiz do usuario
**Dependencias:** Fase 3 (trial + quiz integrados)
**Criterio de sucesso:** Ao assinar, usuario recebe palavra profetica personalizada em tela dedicada
**Risco:** Baixo. Custo de API minimo (1 chamada por subscriber)

#### 6.4 -- Bot WhatsApp do Gabriel

**Prioridade:** P3
**Responsavel:** Bryan (pesquisa) + Leticia (UX)
**Esforco:** 40h+
**Impacto:** Alto -- funil de aquisicao quase gratis, 99% penetracao WhatsApp BR
**Arquivos afetados:** Backend externo (nao no codebase atual)
**Dependencias:** Fase 2 completa (prompts do Gabriel estabilizados)
**Criterio de sucesso:** Numero de WhatsApp que responde perguntas biblicas basicas e direciona para o app para experiencia completa
**Risco:** Alto. WhatsApp Business API tem custo e complexidade. Mitigacao: comecar com ChatBot simples via Twilio

---

## SECAO 4: Detalhamento por Tarefa

(Incluido inline em cada tarefa na Secao 3 acima. Cada tarefa ja contém: Prioridade, Responsavel, Esforco, Impacto, Arquivos afetados, Dependencias, Criterio de sucesso e Risco.)

---

## SECAO 5: Fluxo de Trabalho do Time

### Definicao de Responsaveis

| Agente | Foco Principal | Skills |
|--------|---------------|--------|
| **Bryan** | Pesquisa de mercado, dados, personas | `bryan-research.md` -- Head of Research & Market Intelligence |
| **Leticia** | UX/UI, fluxos, componentes | `leticia-ux.md` -- Head of UX/UI & Product Strategy |
| **Carol** | Copy, tom de voz, push, paywall | `carol-copy.md` -- Head of Copy & Conversion |
| **Duda** | Design system, branding, visual | `duda-rebrand.md` -- Head of Brand & Design System |
| **Rafael** | Growth, retencao, metricas | `rafael-growth.md` -- Head of Growth & Retention |
| **Marcos** | QA, bugs, build, padroes | `marcos-qa.md` -- Head of QA & Code Quality |

### Semana 1: Quick Wins + Pesquisa Gabriel

```
PARALELO (sem conflito de arquivos):

Bryan:  2.1 -- Pesquisa de Persona do Gabriel
        Entregavel: docs/gabriel-persona-research.md
        Arquivos: NENHUM do codebase (pesquisa pura)

Leticia: 1.1 -- Plano Semanal + 1.2 -- Plano Anual
         Arquivos: constants/plans.ts, app/paywall.tsx
         |
         Depois: 1.3 -- Botao WhatsApp
         Arquivos: utils/, components/VerseCard, PrayerCard, chat/

Carol:   1.4 -- Streak Forgiveness copy
         1.6 -- Copy de Milestone de Streak
         Arquivos: components/StreakBadge.tsx (sem conflito com Leticia)

Duda:    4.4 -- Streak Visual Melhorado (pode comecar)
         Arquivos: components/StreakBadge.tsx (coordenar com Carol)

Rafael:  Definir baselines de metricas (Secao 6)
         Entregavel: planilha de metricas

Marcos:  QA apos cada entrega do dia
         Build verification: npx expo export -p web
```

### Semana 2: Gabriel Overhaul + Push Notifications

```
SEQUENCIAL (Gabriel depende da pesquisa):

Carol + Bryan: 2.2 -- Reescrita System Prompts
               Arquivos: services/gemini.ts, app/(tabs)/chat/index.tsx
               DEPENDE DE: 2.1 (pesquisa Bryan da semana 1)

PARALELO (sem conflito):

Leticia: 2.3 -- Gabriel Proativo
         Arquivos: contexts/AppContext.tsx, services/gemini.ts
         COORDENAR COM: Carol (para copy das mensagens proativas)
         |
         2.4 -- Memoria Inteligente Expandida
         Arquivos: contexts/AppContext.tsx (funcoes de memoria)

Leticia: 4.1 -- Push Notifications (pode iniciar pesquisa/implementacao)
         Arquivos: services/pushNotifications.ts (NOVO), app/_layout.tsx

Duda:    4.2 -- Arvore da Fe (design + componente)
         Arquivos: components/FaithTree.tsx (NOVO), constants/faithTree.ts (NOVO)

Carol:   4.5 -- Daily Challenges (pool de 365 desafios)
         Arquivos: constants/dailyChallenges.ts (NOVO)

Marcos:  QA de Gabriel -- testar 20 cenarios de conversa
         QA de push -- testar em Chrome/Safari/Firefox
```

### Semana 3: Onboarding + Gamificacao

```
SEQUENCIAL:

Leticia + Carol: 3.1 -- Reestruturar Onboarding (DEPENDE Fase 2 completa)
                 Arquivos: app/onboarding.tsx, app/personalization-quiz.tsx

Leticia: 3.2 -- Free Trial 7 Dias
         Arquivos: contexts/AppContext.tsx, app/paywall.tsx, hooks/usePremium.ts

PARALELO:

Duda:    Finalizar 4.2 -- Arvore da Fe (integracao na home)
         Arquivos: app/(tabs)/home/index.tsx

Carol:   3.3 -- Devocional IA no Onboarding (copy + integracao)
         Arquivos: app/onboarding.tsx

Leticia: 4.3 -- Daily Rewards
         Arquivos: app/(tabs)/home/index.tsx, contexts/AppContext.tsx

Marcos:  QA completo -- todos os fluxos
         Build final Fase 1-4
```

### Semana 4+: Social & Growth

```
Leticia: 5.1 -- Plano com Amigos (MVP)
Carol:   6.2 -- Campanhas Sazonais Amplificadas
Bryan:   Pesquisa para 6.1 -- Plano Igreja
Duda:    Polish visual de todas as novas features
Marcos:  QA continuo
Rafael:  Analise de metricas pos-lancamento
```

### Regras de Coordenacao

1. **Antes de editar qualquer arquivo**, verificar se outro agente esta trabalhando nele
2. **Arquivos criticos com conflito potencial:**
   - `contexts/AppContext.tsx` -- Leticia E Carol podem precisar simultaneamente. Coordenar por funcao (Leticia: logica, Carol: copy/prompts)
   - `app/(tabs)/home/index.tsx` -- Leticia, Duda e Carol. Priorizar por ordem de fase
   - `services/gemini.ts` -- Carol (prompts) e Leticia (funcoes). Dividir por secao do arquivo
3. **Marcos faz QA apos CADA entrega**, nao no final do sprint
4. **Build check** (`npx expo export -p web`) obrigatorio antes de qualquer merge

---

## SECAO 6: Metricas de Sucesso por Fase

| Fase | Metrica | Baseline (Estimado) | Target | Evidencia |
|------|---------|---------------------|--------|-----------|
| 0 | Build funcional com tema light | N/A | OK | Ja completo |
| 1 | Paywall views que convertem para click | ~2% | +30% (para ~2.6%) | Paywall contextual + trial + planos novos |
| 1 | Compartilhamentos via WhatsApp | 0 | 5%+ dos usuarios | WhatsApp button em todo conteudo |
| 2 | Mensagens por sessao de chat | ~3 msgs | +50% (~4.5 msgs) | Gabriel proativo + memoria + prompts melhores |
| 2 | Users que voltam ao chat D7 | ~10% | 25%+ | Gabriel proativo cria razao para voltar |
| 3 | Onboarding completion rate | ~60% | 80%+ | Value-first = menos abandono |
| 3 | D1 retention | ~20% | 35%+ | Onboarding + trial + devocional no primeiro uso |
| 3 | Trial-to-paid conversion | ~0% (sem trial) | 10%+ | Trial de 7 dias implementado |
| 4 | D7 retention | ~8% | 25%+ | Push + streak + daily rewards + Arvore da Fe |
| 4 | D30 retention | ~3% | 10%+ | Push + gamificacao completa + habito formado |
| 4 | Users com streak > 7 dias | ~5% | 20%+ | Streak visual + forgiveness + push reminder |
| 5 | Viral coefficient (K-factor) | ~0 | > 0.5 | WhatsApp sharing + Plano com Amigos + desafios |
| 5 | Convites enviados por usuario | 0 | 2+ | WhatsApp-first sharing em todo conteudo |
| 6 | MRR (Monthly Recurring Revenue) | R$0 | R$5K+ | Planos semanal/anual + trial + igreja |
| 6 | Igrejas parceiras | 0 | 5+ | Plano Igreja + QR code em cultos |
| 6 | DAU (Daily Active Users) | Desconhecido | 1K+ | Push + Gabriel proativo + conteudo diario |

### North Star Metric

**"Dias de devocional por usuario por mes"**

Esta metrica captura:
- Retencao (usuario voltou)
- Engajamento (fez o devocional, nao so abriu)
- Valor percebido (continua usando porque agrega)

---

## SECAO 7: Riscos & Mitigacao

| # | Risco | Probabilidade | Impacto | Mitigacao |
|---|-------|---------------|---------|-----------|
| R1 | **Mudar prompts do Gabriel quebra tom** | Alta | Alto | Testar cada prompt com 10 inputs diversos antes de deploy. Manter backup dos prompts atuais |
| R2 | **Push notifications nao funcionam em PWA iOS** | Media | Alto | Web Push API tem suporte limitado no iOS Safari. Mitigacao: testar extensivamente, considerar PWA install prompt |
| R3 | **Onboarding novo aumenta dropout** | Media | Alto | A/B test: 50% dos usuarios veem onboarding novo, 50% o antigo. Medir D1 retention de cada grupo |
| R4 | **Arvore da Fe mal implementada parece infantil** | Media | Medio | Pesquisar referencia visual do Glorify. Testar com 5 usuarios antes de lancar. Comecar simples (evolucao progressiva) |
| R5 | **Trial de 7 dias canibiliza receita** | Baixa | Medio | 38% de trial users convertem (dado da industria). Net positivo. Monitorar conversao pós-trial |
| R6 | **Conflito de arquivos entre agentes** | Media | Medio | Regras de coordenacao claras (Secao 5). Cada agente trabalha em branch separado. Marcos faz merge |
| R7 | **Custo de API Groq/Together/ElevenLabs sobe** | Baixa | Alto | Monitorar custos mensais. Cachear respostas quando possivel. Gabriel proativo pode usar respostas pre-geradas para triggers comuns |
| R8 | **Feature bloat -- app fica pesado** | Media | Medio | Leticia audita cada nova feature por criterio de "justifica existencia". Nao adicionar feature que < 5% dos usuarios usariam |
| R9 | **WhatsApp API muda regras de deep link** | Baixa | Baixo | Deep link `whatsapp://send` e padrao estavel. Fallback para share generico |
| R10 | **Usuarios nao permitem push notifications** | Media | Alto | Pedir permissao no momento certo (apos valor demonstrado, nao no onboarding). Copy da Carol: "Vou te lembrar com carinho, sem exagero" |

---

## APENDICE A: Arquivos Criticos do Projeto

| Arquivo | O Que Faz | Quem Mexe |
|---------|-----------|-----------|
| `contexts/AppContext.tsx` | State global: 1112 linhas, tudo passa por aqui | Leticia (logica), Carol (copy em prompts) |
| `services/gemini.ts` | API de IA: prompts, funcoes de geracao | Carol (prompts), Leticia (funcoes) |
| `app/(tabs)/chat/index.tsx` | Tela do Gabriel: 857 linhas | Leticia (UX), Carol (prompts/suggestions) |
| `constants/plans.ts` | Planos freemium: precos, limites | Leticia (novos planos) |
| `constants/campaigns.ts` | Campanhas sazonais: 8 definidas | Carol (novas campanhas) |
| `constants/colors.ts` | Paleta light/dark | Duda (visual) |
| `app/paywall.tsx` | Tela de monetizacao | Leticia (trial), Carol (copy) |
| `app/onboarding.tsx` | Fluxo de primeiro uso | Leticia (reestruturar), Carol (copy) |
| `components/StreakBadge.tsx` | Visual do streak | Duda (design), Carol (copy) |
| `app/(tabs)/home/index.tsx` | Dashboard principal | Leticia (cards), Duda (Arvore da Fe) |

## APENDICE B: Novas Constantes/Arquivos Necessarios

| Arquivo (NOVO) | Fase | Responsavel | Descricao |
|----------------|------|-------------|-----------|
| `services/pushNotifications.ts` | 4.1 | Leticia | Web Push API + Service Worker |
| `constants/pushTemplates.ts` | 4.1 | Carol | Templates de push notification |
| `components/FaithTree.tsx` | 4.2 | Duda | Componente visual Arvore da Fe |
| `constants/faithTree.ts` | 4.2 | Duda | Estagios e criterios da arvore |
| `constants/dailyRewards.ts` | 4.3 | Carol | Pool de recompensas espirituais diarias |
| `constants/dailyChallenges.ts` | 4.5 | Carol | Pool de 365 desafios diarios |
| `contexts/GroupContext.tsx` | 5.1 | Leticia | Estado de grupos de estudo |
| `constants/communityChallenges.ts` | 5.2 | Carol | Definicao de desafios comunitarios |
| `docs/gabriel-persona-research.md` | 2.1 | Bryan | Pesquisa de persona do Gabriel |

---

*Este documento deve ser atualizado a cada sprint completado. Marcar tarefas como feitas conforme avancar. Qualquer novo dev que entre no projeto deve ler este documento PRIMEIRO.*
