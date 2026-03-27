# LOVABLE HANDOFF — Biblia IA App

## O QUE VOCE PRECISA FAZER
Recriar o front-end deste app React Native (Expo) como um app **React web profissional estilo Hellow Bible App** — moderno, clean, premium. Toda a logica de backend (APIs, chaves, endpoints) ja esta pronta. Voce so precisa fazer o front-end web bonito e conectar as mesmas APIs.

---

## APIS E CHAVES (COPIAR EXATAMENTE)

### 1. SUPABASE (Auth + Database)
```
URL: https://tdryewlksrxhpbtcnphy.supabase.co
ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkcnlld2xrc3J4aHBidGNucGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3OTk5NTUsImV4cCI6MjA4ODM3NTk1NX0.aRIC1SCbuVpvhZhYUiLH1C2Eui263Jp4fYvlQ-pusSo
```
- Auth: REST API (`/auth/v1/signup`, `/auth/v1/token?grant_type=password`, `/auth/v1/logout`, `/auth/v1/user`, `/auth/v1/recover`)
- Database: REST API (`/rest/v1/{table}`)
- Headers: `apikey: ANON_KEY`, `Content-Type: application/json`, `Prefer: return=representation`

### 2. SUPABASE STORAGE (Videos - PROJETO SEPARADO)
```
URL: https://rkwaxdnmqgmytaxoqwbt.supabase.co
BUCKET: Videos historias da biblia
```
- URL publica: `https://rkwaxdnmqgmytaxoqwbt.supabase.co/storage/v1/object/public/Videos%20historias%20da%20biblia/{filename}`
- Videos disponiveis:
  - `gideao (1).mp4` — A Historia de Gideao
  - `historia de oseias (1).mp4` — Historia de Oseias
  - `Juizes capitulo 19.mp4` — Juizes Capitulo 19
  - `Primeiro homem a ser cheio do espirito santo.mp4` — Primeiro Homem Cheio do Espirito Santo

### 3. GROQ AI (Chat IA)
```
API_KEY: gsk_REDACTED
BASE_URL: https://api.groq.com/openai/v1
MODEL: llama-3.3-70b-versatile
```
- Endpoint: `POST /chat/completions`
- Headers: `Authorization: Bearer {API_KEY}`, `Content-Type: application/json`
- Body: `{ model, messages: [{role, content}], temperature: 0.7, max_tokens: 2048 }`

### 4. STABILITY AI (Geracao de Imagens)
```
API_KEY: sk-suV7CgLJHtvPz0W6nq2gZpEr9E25bsaDUjyv8RZz7HA2QC22
BASE_URL: https://api.stability.ai
```
- Endpoint: `POST /v2beta/stable-image/generate/sd3` (fallback: `/core`)
- Headers: `Authorization: Bearer {API_KEY}`, `Accept: application/json`
- Body: FormData com `prompt`, `output_format: png`, `aspect_ratio: 1:1`
- Retorna: `{ image: "base64..." }`

### 5. ELEVENLABS (Text-to-Speech PT-BR)
```
API_KEY: 79c5ccce8fbc23c0f5112bcb4084c1e936aeb6bb15d16fe61bc1547df057e04f
BASE_URL: https://api.elevenlabs.io/v1
```
- Endpoint: `POST /text-to-speech/{voiceId}`
- Headers: `Accept: audio/mpeg`, `xi-api-key: {API_KEY}`, `Content-Type: application/json`
- Body: `{ text, model_id: "eleven_multilingual_v2", voice_settings: { stability: 0.6, similarity_boost: 0.85, style: 0.3, use_speaker_boost: true } }`
- Retorna: audio/mpeg blob
- Vozes PT-BR:
  - Ana (feminina calma): `vibfi5nlk3hs8Mtvf9Oy` (padrao)
  - Carla (narradora): `oJebhZNaPllxk6W0LSBA`
  - Borges (masculina): `9pDzHy2OpOgeXM8SeL0t`
  - Adriano (narrador): `hwnuNyWkl9DjdTFykrN6`

### 6. BIBLE API (scripture.api.bible)
```
API_KEY: (nao configurada ainda — usar versiculos locais)
BASE_URL: https://api.scripture.api.bible/v1
```

---

## TELAS E FUNCIONALIDADES

### TAB 1: INICIO (Home)
- Saudacao animada por horario (Bom dia/Boa tarde/Boa noite)
- Versiculo do dia com botoes: Ouvir (TTS), Salvar, Enviar, Explicar (IA)
- Streak de dias seguidos (fogo + calendario semanal)
- Campanhas sazonais (ex: Quaresma com versiculo e desafio)
- Devocional diario gerado por IA (Groq)
- Acesso rapido: Biblia, Oracao, Louvor, Planos, Grupos, Desafios
- Banner do Gabriel (chatbot IA)
- Jornada 90 dias com anel de progresso
- Banner premium
- Estatisticas (streak, dias ativos, capitulos)

### TAB 2: CHAT (Gabriel IA)
- 6 modos de conversa:
  1. **Gabriel** — Guia espiritual empatico
  2. **Como me sinto** — Versiculo por emocao
  3. **Teologia** — Analise multi-perspectiva (Reformada, Pentecostal, Catolica, Batista, Arminiana)
  4. **Grego & Hebraico** — Estudo de palavras originais
  5. **Prep. Sermao** — Esbocos de pregacao
  6. **Devocional** — Reflexao pessoal
- Historico de conversas
- Audio das respostas (ElevenLabs)
- Cards de versiculos e oracoes no chat
- Sugestoes contextuais

### TAB 3: CRIAR (Ferramentas para Criadores)
- **Sermao → Conteudo**: Cola sermao, IA gera 5 posts Instagram + 3 cards + 1 artigo
- **Legendas Virais**: Copywriting para Instagram (max 300 chars)
- **Roteiros**: Scripts 30-60s para Reels/TikTok
- **Gerador de Imagens**: 6 estilos (Cartoon, Pastoral, Aquarela, Digital, Minimalista, Realista)
- **Card de Oracao**: Oracao IA + imagem IA + audio TTS
- **Bible Reels**: Slides com narracao IA + background IA
- **Historias Biblicas**: Carrossel ilustrado estilo cartoon
- **Card de Versiculo**: Graficos bonitos para compartilhar
- **Hashtags**: 20 hashtags cristaos relevantes
- **Bio Instagram**: 3 opcoes de bio crista
- **Calendario de Conteudo**: Planejamento de posts
- **Videos Biblicos**: Player de videos do Supabase Storage

### TAB 4: ESTUDOS
- Quiz Biblico (batalha com pontos e timer)
- Personagens Biblicos (50+ personagens com bio, versiculos, licoes)
- Versiculos Salvos (favoritos + destaques)
- Busca Tematica (por emocao/tema)
- Jornada 90 Dias Profetica:
  - Quiz de onboarding (dor, objetivo, nivel espiritual, compromisso)
  - 90 dias com: oracao matinal, leitura, reflexao, acao pratica, declaracao profetica
  - 13 semanas tematicas
- Planos de Estudo (7 Dias p/ Se Aproximar de Deus, Salmos de Conforto, Parabolas de Jesus)
- Maratonas de Leitura

### TAB 5: JOGOS
- **Batalha Biblica**: Quiz com timer e pontos (solo/amigos/offline)
- **Serpente Biblica**: Snake game com itens sagrados, 4 dificuldades
- **Memoria Biblica**: Jogo da memoria versiculo + referencia

### TAB 6: COMUNIDADE (Estilo Instagram)
- Stories em circulo (carrossel horizontal)
- Feed com filtros: Todos, Testemunho, Oracao, Pergunta, Devocional, Versiculo
- Posts com tipo colorido, likes, comentarios, salvar
- DMs (mensagens diretas)
- Chat ao vivo da comunidade
- Posts anonimos
- Perfis com seguidores/seguindo
- Sistema de niveis por XP

### TAB 7: PERFIL
- Toggle tema claro/escuro
- Selecao de traducao biblica (NVI, ARA, NTLH, NVT)
- Selecao de denominacao (Evangelica, Catolica, Batista, Presbiteriana, Pentecostal, Outra)
- Configuracoes de notificacao
- Estatisticas de uso
- Badges e conquistas
- Ativar premium
- Instalar como PWA

---

## SYSTEM PROMPTS DO GABRIEL (IA)

### Modo Geral (Gabriel)
```
Voce e Gabriel, o guia espiritual do app Biblia IA. Voce conversa como um mentor espiritual experiente que se importa com cada pessoa.

REGRAS CRITICAS:
- NUNCA envie mensagens genericas ou aleatorias. Responda DIRETAMENTE ao que o usuario disse.
- PRIMEIRO entenda a pessoa: pergunte, descubra o contexto, a dor, o momento de vida.
- Acolha ANTES de instruir. Valide sentimentos antes de trazer versiculos.
- Maximo 1-2 versiculos por mensagem. Nao despeje conteudo.
- Faca perguntas para mostrar interesse genuino.
- Fale como amigo sabio, nao como enciclopedia.
- Responda sempre em portugues brasileiro.
- Nao invente versiculos ou referencias.
- Nunca entre em debates denominacionais.
```

### Modo Grego & Hebraico
```
Voce e Gabriel, um especialista em estudos biblicos com conhecimento profundo em grego (koine) e hebraico biblico.
- Analise palavras no original quando relevante
- Explique contexto historico e cultural
- Use transliteracao para facilitar a leitura
- Compare diferentes traducoes quando util
- Cite Strong's numbers quando apropriado
```

### Modo Sermao
```
Voce e Gabriel, um assistente para preparacao de sermoes e pregacoes.
- Ajude a estruturar sermoes com introducao, desenvolvimento e conclusao
- Sugira ilustracoes e aplicacoes praticas
- Indique referencias cruzadas
- Ofereca esbocos detalhados
```

### Modo Devocional
```
Voce e Gabriel, um guia para momentos devocionais e meditacao biblica.
- Ofereca reflexoes profundas mas acessiveis
- Sugira aplicacoes praticas para o dia a dia
- Inclua oracoes quando apropriado
- Use tom acolhedor e encorajador
```

---

## GAMIFICACAO

### Sistema de XP e Niveis
- Ler versiculo: +10 XP
- Completar devocional: +25 XP
- Completar dia da jornada: +50 XP
- Quiz perfeito: +100 XP
- Post na comunidade: +15 XP

### Streak
- Contador de dias seguidos de uso
- Calendario semanal visual (S T Q Q S S D)
- Icone de fogo

### Badges
- Primeiro Login, 7 Dias Seguidos, 30 Dias, Quiz Master, etc.

---

## ESTILO VISUAL DESEJADO

**Referencia: App Hellow Bible**
- Design PREMIUM, clean, moderno
- Tipografia elegante e legivel
- Gradientes suaves em cards
- Espacamento generoso
- Iconografia consistente (Lucide icons)
- Animacoes suaves de entrada (fade, slide)
- Tema claro/escuro com transicao suave
- Cards com sombra sutil e bordas arredondadas
- Paleta: tons de dourado/ambar para destaques espirituais + azul/roxo para IA
- Fundo escuro no dark mode com cards levemente elevados
- Botoes com hover e press states
- Loading states elegantes (skeleton, shimmer)

---

## DADOS MOCK (para demonstracao)

### 30 Versiculos Diarios (rotacao por dia do mes)
JER.29.11, PSA.23.1, PHP.4.13, ROM.8.28, ISA.41.10, JHN.3.16, PRO.3.5-6, PSA.46.1, MAT.11.28, ROM.12.2, JOS.1.9, PSA.27.1, ISA.40.31, PHP.4.6-7, 2CO.5.17, GAL.5.22-23, HEB.11.1, PSA.119.105, ROM.5.8, EPH.2.8-9, MAT.6.33, PSA.37.4, COL.3.23, 1CO.13.4-7, LAM.3.22-23, PSA.91.1-2, ISA.43.2, DEU.31.6, MAT.28.20, REV.21.4

### 6 Estilos de Imagem IA
1. Cartoon Biblico — cartoon style, colorful, vibrant, children book illustration
2. Ilustracao Pastoral — pastoral illustration, soft tones, peaceful, golden hour
3. Aquarela Espiritual — watercolor painting, spiritual, ethereal, soft colors
4. Arte Digital — digital art, modern, dramatic lighting, cinematic, epic
5. Minimalista — minimalist art, clean design, simple shapes, flat colors
6. Realista — photorealistic, highly detailed, dramatic lighting, 8k

### Traducoes PT-BR para Prompts de Imagem
jesus→Jesus Christ, deus→God, espirito santo→Holy Spirit, cruz→cross, anjo→angel, ceu→heaven, ovelha→sheep, pastor→shepherd, tempestade→storm, mar→sea, montanha→mountain, luz→light, pomba→dove, leao→lion, cordeiro→lamb, oracao→prayer, nascimento→birth, ressurreicao→resurrection, moises→Moses, daniel→Daniel, davi→David, abraao→Abraham, noe→Noah, mar vermelho→Red Sea

---

## COMO CHAMAR CADA API (EXEMPLOS PRONTOS)

### Chat com Groq (Gabriel IA)
```javascript
const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer gsk_REDACTED',
  },
  body: JSON.stringify({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: 'Voce e Gabriel...' },
      { role: 'user', content: 'O que a Biblia diz sobre ansiedade?' }
    ],
    temperature: 0.7,
    max_tokens: 2048,
  }),
});
const data = await response.json();
const reply = data.choices[0].message.content;
```

### Text-to-Speech (ElevenLabs)
```javascript
const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/vibfi5nlk3hs8Mtvf9Oy', {
  method: 'POST',
  headers: {
    'Accept': 'audio/mpeg',
    'Content-Type': 'application/json',
    'xi-api-key': '79c5ccce8fbc23c0f5112bcb4084c1e936aeb6bb15d16fe61bc1547df057e04f',
  },
  body: JSON.stringify({
    text: 'Confie no Senhor de todo o seu coracao',
    model_id: 'eleven_multilingual_v2',
    voice_settings: { stability: 0.6, similarity_boost: 0.85, style: 0.3, use_speaker_boost: true },
  }),
});
const blob = await response.blob();
const url = URL.createObjectURL(blob);
const audio = new Audio(url);
audio.play();
```

### Gerar Imagem (Stability AI)
```javascript
const formData = new FormData();
formData.append('prompt', 'Jesus calming the storm, cartoon style, colorful, vibrant');
formData.append('output_format', 'png');
formData.append('aspect_ratio', '1:1');

const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/sd3', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sk-suV7CgLJHtvPz0W6nq2gZpEr9E25bsaDUjyv8RZz7HA2QC22',
    'Accept': 'application/json',
  },
  body: formData,
});
const data = await response.json();
const imageBase64 = data.image; // usar como src="data:image/png;base64,{imageBase64}"
```

### Supabase Auth (Login)
```javascript
const response = await fetch('https://tdryewlksrxhpbtcnphy.supabase.co/auth/v1/token?grant_type=password', {
  method: 'POST',
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIs...',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email: 'user@email.com', password: '123456' }),
});
const { access_token, refresh_token, user } = await response.json();
localStorage.setItem('supabase_access_token', access_token);
```

### Video do Supabase Storage
```html
<video controls>
  <source src="https://rkwaxdnmqgmytaxoqwbt.supabase.co/storage/v1/object/public/Videos%20historias%20da%20biblia/gideao%20(1).mp4" type="video/mp4" />
</video>
```

---

## RESUMO

O app ja tem TODA a logica pronta. As APIs estao configuradas e funcionando. Voce so precisa:

1. Criar o front-end React web com design premium estilo Hellow
2. Copiar as chaves e endpoints exatamente como estao acima
3. Usar `fetch()` para chamar as APIs (exemplos acima)
4. Usar `localStorage` no lugar de AsyncStorage
5. Usar `<video>` no lugar de expo-av
6. Usar `new Audio()` para TTS
7. Usar React Router para navegacao

Tudo funciona com chamadas REST simples — nao precisa de SDK nenhum.
