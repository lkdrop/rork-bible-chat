# Bíblia IA - App Cristão Brasileiro

App de Chat Bíblico com IA em Português Brasileiro para o mercado cristão brasileiro.

---

## **Arquitetura**

### 5 Tabs
- [x] **Início** — Versículo do dia, streak, ações rápidas, oração diária, devocional IA
- [x] **Chat IA** — Chat com IA fundamentado na Bíblia (4 modos)
- [x] **Estudos** — Planos de estudo, quiz, personagens, busca, maratonas, favoritos
- [x] **Ferramentas** — Diário espiritual, mural de oração, metas, preparação de sermão
- [x] **Perfil** — Configurações, tema, tradução, denominação

---

## **Core - Chat IA**
- [x] IA treinada exclusivamente na Bíblia, respostas em PT-BR
- [x] Guardrails para manter respostas fundamentadas biblicamente
- [x] Suporte a traduções: NVI, ARA, NTLH, NVT
- [x] Histórico de conversa salvo (AsyncStorage)
- [x] Respostas compartilháveis via Share API
- [x] Limite de 5 mensagens/dia (tier gratuito)
- [x] **4 Modos de Chat:**
  - [x] Bíblia IA (perguntas gerais)
  - [x] Grego & Hebraico (estudo de palavras originais)
  - [x] Preparação de Sermão (esboços, ilustrações, referências)
  - [x] Devocional Pessoal (reflexão personalizada)
- [x] Seletor de modo no header do chat
- [x] Sugestões rápidas contextuais por modo

## **Engajamento Diário**
- [x] Versículo do dia na tela inicial (31 versículos rotativos)
- [x] Oração diária sugerida
- [x] Contador de streak (dias consecutivos usando o app)
- [x] Compartilhamento do versículo e oração do dia
- [x] **Devocional do Dia gerado por IA** (toque para gerar)

## **Estudo Bíblico**
- [x] Planos de estudo estruturados (7 dias com Deus, Salmos 14 dias, Parábolas 10 dias, Mulheres da Bíblia 7 dias)
- [x] Busca por tema, emoção, situação (com IA)
- [x] Perfis de personagens bíblicos (Moisés, Davi, Maria, Paulo, Abraão, José, Ester, Daniel, Pedro, Rute)
- [x] Quiz bíblico com 20 perguntas, 3 níveis de dificuldade, explicações
- [x] **Maratonas de Leitura Bíblica:**
  - [x] Novo Testamento em 90 Dias
  - [x] Gênesis em 30 Dias
  - [x] Provérbios em 31 Dias
  - [x] Progresso visual estilo "série de TV"
  - [x] Marcar dias como concluídos
- [x] **Meus Versículos:**
  - [x] Favoritos (referências salvas)
  - [x] Destaques com texto, cor e notas pessoais
  - [x] Compartilhamento de versículos

## **Ferramentas Espirituais**
- [x] Diário espiritual (reflexões com mood/emoção)
- [x] Mural de oração (pedidos + marcar como respondido)
- [x] Metas espirituais (criar, acompanhar progresso, presets)
- [x] **Preparação de Sermão com IA:**
  - [x] Gerar esboço completo a partir de passagem/tema
  - [x] Inclui título, introdução, 3 pontos, ilustrações, referências cruzadas
  - [x] Contexto original (grego/hebraico)
  - [x] Salvar e gerenciar esboços
  - [x] Compartilhar esboços

## **Onboarding**
- [x] Escolher denominação (Evangélica, Católica, Batista, etc.)
- [x] Escolher tradução preferida
- [x] Escolher horário de notificação
- [x] Fluxo de 3 passos, sem login obrigatório

## **Design**
- [x] Modo escuro e claro com toggle
- [x] UI limpa e moderna com tons dourados e brancos quentes
- [x] Todo em Português Brasileiro
- [x] Versículos favoritos salvos offline
- [x] Animações com Animated API nativo
- [x] Haptics em interações
- [x] Paleta warm gold (#C5943A) com cream backgrounds
- [x] Estatísticas expandidas na Home (capítulos lidos, destaques, sermões)
- [x] Carrossel horizontal de novidades/funcionalidades

## **Monetização (UI preparada)**
- [x] Limite de 5 mensagens/dia no chat (tier gratuito)
- [ ] Tela de paywall Premium (semanal e anual)
- [ ] Premium desbloqueia: chat ilimitado, todos os planos, acesso offline, sem anúncios

---

## **Estrutura de Arquivos**

```
app/
  _layout.tsx (root com providers)
  onboarding.tsx (3 passos)
  (tabs)/
    _layout.tsx (5 tabs)
    (home)/index.tsx (tela inicial com devocional IA)
    chat/index.tsx (chat IA com 4 modos)
    study/index.tsx, quiz.tsx, characters.tsx, character-detail.tsx, search.tsx, plan-detail.tsx, marathon.tsx, favorites.tsx
    tools/index.tsx, journal.tsx, prayer-wall.tsx, goals.tsx, sermon-prep.tsx
    profile/index.tsx
constants/
  colors.ts, dailyVerses.ts, studyPlans.ts, bibleCharacters.ts, quizData.ts, readingMarathon.ts
contexts/
  AppContext.tsx (estado global: tema, onboarding, streak, diário, orações, metas, destaques, sermões, maratonas)
  ChatContext.tsx (mensagens do chat IA com system prompt customizável)
```
