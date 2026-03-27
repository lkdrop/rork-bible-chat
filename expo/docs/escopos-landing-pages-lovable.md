# Escopos de Landing Pages — Lovable
**Objetivo:** 6 landing pages com waitlist para validar ideias com $50 em ads cada.
**Todas devem ter:** Versão EN + PT-BR (toggle de idioma ou domínio separado)

---

## ARQUITETURA — COMO FUNCIONA

### 🎨 Lovable = Frontend COMPLETO
O Lovable é responsável por **todo o frontend** de cada landing page:
- Layout completo (Hero, seções, footer)
- Design responsivo (mobile-first)
- Animações e microinterações
- Toggle de idioma EN ↔ PT-BR
- Formulário de waitlist (input email + botão)
- Modal de confirmação pós-cadastro
- Cookie consent banner
- SEO tags, Open Graph, favicon
- Scroll suave entre seções
- CTA fixo no topo durante scroll

### ⚙️ Nós = Backend (depois)
Nós entramos **apenas na parte de backend/integrações**:
- Conectar formulário de email ao Supabase (ou Mailchimp/ConvertKit)
- Configurar Meta Pixel + Google Analytics/Tag Manager
- Configurar domínio/DNS
- Eventuais webhooks pra notificação de novo signup

### 📋 Resumo
| Quem | Faz o quê |
|------|-----------|
| **Lovable** | Toda a UI, design, layout, responsividade, interações, textos, formulário visual |
| **Nós** | Integração email/DB, analytics, domínio, deploy final |

> **INSTRUÇÃO PRO LOVABLE:** Construa cada landing page como um frontend completo e funcional. O formulário de email pode usar um placeholder de ação (ex: `console.log` ou state local) — nós conectamos ao backend depois. Foque 100% na experiência visual e na conversão.

---

## LANDING PAGE 1: CriativoAI

### Conceito
Gerador de criativos com IA para anúncios e redes sociais. O usuário descreve seu produto/serviço ou cola um link, e a IA gera variações de banners profissionais com copy de alta conversão — prontos para postar no Instagram, Facebook, Google Ads, TikTok.

### Headline (PT-BR)
"Criativos profissionais pra seus anúncios e redes sociais — em 30 segundos, sem designer"

### Headline (EN)
"AI-powered ad creatives & social media posts — in 30 seconds, no designer needed"

### Subheadline (PT-BR)
"Cole o link do seu produto ou descreva seu negócio. A IA gera 10 variações de criativos com copy otimizada, prontos pra postar."

### Subheadline (EN)
"Paste your product link or describe your business. AI generates 10 creative variations with optimized copy, ready to post."

### Seções da Landing Page

#### 1. Hero Section
- Headline + Subheadline
- CTA: "Entrar na lista de espera" / "Join the waitlist"
- Input de email + botão
- Mockup/screenshot mostrando: input de URL → 4-6 criativos gerados lado a lado
- Badge: "Lançamento em breve" / "Launching soon"

#### 2. Problema
- "Você gasta horas no Canva criando posts e anúncios?"
- "Paga R$500+ por mês pra designer fazer seus criativos?"
- "Seus anúncios parecem amadores comparados com a concorrência?"
- 3 ícones com as dores: ⏰ Tempo perdido | 💸 Dinheiro gasto | 😤 Resultado amador

#### 3. Solução — Como funciona (3 passos)
- **Passo 1:** Cole o link do produto ou descreva seu negócio
- **Passo 2:** Escolha o formato (Feed, Stories, Reels, Google Ads, Carrossel)
- **Passo 3:** Receba 10 variações de criativos com copy — prontos pra usar
- Cada passo com ícone/ilustração simples

#### 4. Funcionalidades principais
- ✅ Criativos para Meta Ads (Facebook + Instagram)
- ✅ Posts para redes sociais (Feed, Stories, Reels)
- ✅ Copy de alta conversão gerada por IA (headlines, CTAs, descrições)
- ✅ 15+ templates profissionais por vertical (e-commerce, coach, restaurante, clínica, etc.)
- ✅ Export em todos os tamanhos (1080x1080, 1080x1920, 300x250, etc.)
- ✅ Salve seu brand kit (logo, cores, fontes)
- ✅ Multi-idioma: crie criativos em Português, English, Español
- ✅ Variações A/B com 1 clique

#### 5. Pra quem é
- 🛒 Lojistas e-commerce (Shopify, Nuvemshop, Mercado Livre)
- 📱 Social media managers
- 🎯 Gestores de tráfego e agências digitais
- 🏪 Negócios locais (academia, clínica, restaurante, salão)
- 🎓 Coaches e infoprodutores
- 🧑‍💻 Freelancers de marketing

#### 6. Comparação (antes vs depois)
- Tabela ou visual lado a lado:
  | Sem CriativoAI | Com CriativoAI |
  |---|---|
  | 2-3 horas no Canva | 30 segundos |
  | R$500/mês com designer | R$49/mês |
  | 2-3 variações por semana | 10 variações por minuto |
  | Copy genérica | Copy otimizada pra conversão |

#### 7. Pricing Preview
- 🆓 **Free:** 3 criativos pra testar (sem cartão)
- ⭐ **Starter:** R$49/mês — 50 criativos/mês + brand kit
- 🚀 **Pro:** R$99/mês — ilimitado + todos os formatos + multi-idioma
- CTA: "Garanta seu lugar na lista" / "Join waitlist for early access pricing"

#### 8. FAQ
- "Funciona pra qualquer tipo de negócio?" → Sim, temos templates pra e-commerce, serviços, coaches, restaurantes, etc.
- "Posso usar os criativos em qualquer plataforma?" → Sim, exporta em todos os tamanhos (Meta, Google, TikTok, LinkedIn, Pinterest).
- "Precisa saber design?" → Não. A IA faz tudo. Você só descreve o que quer.
- "Tem versão em português?" → Sim! A IA gera copy em PT-BR, Inglês, Espanhol e mais idiomas.

#### 9. Footer CTA
- Repetir input de email + botão de waitlist
- "Seja dos primeiros a testar — vagas limitadas no acesso antecipado"
- Links: Termos | Privacidade | Contato

### Design/Estilo
- Estilo: clean, moderno, fundo claro (branco/cinza claro)
- Cores principais: azul vibrante (#3B82F6) + preto + branco
- Fonte: Inter ou similar (moderna, legível)
- Mockups: mostrar criativos de exemplo gerados (pode ser placeholder)
- Inspiração visual: adcreative.ai, canva.com

---

## LANDING PAGE 2: VideoMestre

### Conceito
Gerador de roteiros completos para vídeos de YouTube, TikTok, Reels e Shorts usando IA. O criador de conteúdo digita o tema e o público-alvo, e recebe um roteiro profissional com hook, estrutura, pontos-chave e CTA — pronto pra gravar.

### Headline (PT-BR)
"Roteiros que viralizam — gerados por IA em 2 minutos"

### Headline (EN)
"Viral video scripts — AI-generated in 2 minutes"

### Subheadline (PT-BR)
"Nunca mais trave na folha em branco. Digite o tema, escolha o formato, e receba um roteiro completo com hook, estrutura e CTA."

### Subheadline (EN)
"Never face writer's block again. Enter your topic, choose the format, and get a complete script with hook, structure, and CTA."

### Seções da Landing Page

#### 1. Hero Section
- Headline + Subheadline
- CTA: "Entrar na lista de espera" / "Join the waitlist"
- Input de email + botão
- Mockup: tela mostrando input de tema → roteiro gerado com seções (Hook, Intro, Corpo, CTA)

#### 2. Problema
- "Passa horas pensando no que gravar?"
- "Seus vídeos não retêm audiência porque falta estrutura?"
- "Tenta seguir tendências mas não sabe como adaptar pro seu nicho?"
- Ícones: 🧠 Bloqueio criativo | 📉 Baixa retenção | ⏰ Tempo perdido

#### 3. Solução — Como funciona (3 passos)
- **Passo 1:** Digite o tema do vídeo + seu público-alvo
- **Passo 2:** Escolha o formato (YouTube longo, YouTube Shorts, TikTok, Reels, Podcast)
- **Passo 3:** Receba roteiro completo: Hook magnético → Estrutura → Pontos-chave → CTA final
- Cada passo com ícone/ilustração

#### 4. Funcionalidades principais
- ✅ Roteiros para YouTube (longo e Shorts), TikTok, Reels, Podcast
- ✅ Hook otimizado pra retenção nos primeiros 3 segundos
- ✅ Estrutura comprovada de vídeos virais (PAS, AIDA, Storytelling)
- ✅ Adaptação automática de tom: educativo, humorístico, motivacional, vendas
- ✅ Sugestões de B-roll e cortes visuais
- ✅ Geração de título + descrição + hashtags otimizadas
- ✅ Banco de hooks virais por nicho (fitness, finanças, tech, lifestyle, etc.)
- ✅ Multi-idioma: roteiros em PT-BR, EN, ES
- ✅ Histórico de roteiros salvos + favoritos

#### 5. Pra quem é
- 🎥 YouTubers e criadores de conteúdo
- 📱 TikTokers e criadores de Reels
- 🎙️ Podcasters
- 🎓 Coaches e educadores online
- 📣 Social media managers
- 🏢 Marcas que produzem conteúdo

#### 6. Comparação
  | Sem VideoMestre | Com VideoMestre |
  |---|---|
  | 2-4 horas pra escrever roteiro | 2 minutos |
  | Hook fraco = 80% abandona em 3s | Hook otimizado = retenção alta |
  | Sem estrutura = vídeo confuso | Estrutura profissional |
  | 1-2 vídeos por semana | 1-2 vídeos por DIA |

#### 7. Pricing Preview
- 🆓 **Free:** 3 roteiros pra testar
- ⭐ **Starter:** R$49/mês ($29 EN) — 30 roteiros/mês
- 🚀 **Pro:** R$89/mês ($49 EN) — ilimitado + banco de hooks + títulos SEO
- CTA: "Garanta acesso antecipado"

#### 8. FAQ
- "Funciona pra qualquer nicho?" → Sim. A IA se adapta a fitness, finanças, tech, culinária, lifestyle, educação, etc.
- "O roteiro fica natural ou parece robô?" → Natural. A IA escreve no tom que você escolher (informal, profissional, engraçado).
- "Posso editar o roteiro depois?" → Sim, 100% editável. Use como base e personalize.
- "Tem em português?" → Sim! Roteiros nativos em PT-BR, não traduzidos.

#### 9. Footer CTA
- Repetir email + botão waitlist

### Design/Estilo
- Estilo: bold, energético, cores vibrantes
- Cores: roxo/violeta (#7C3AED) + branco + preto
- Referência visual: opus.pro, descript.com
- Mockups: mostrar roteiro gerado com seções coloridas

---

## LANDING PAGE 3: CapaBook AI

### Conceito
Gerador de ebooks e lead magnets completos com IA. O infoprodutor/creator digita o título e tema, e recebe um ebook de 5-15 páginas já diagramado, com capa profissional, pronto pra usar como isca digital, brinde de curso, ou produto digital.

### Headline (PT-BR)
"Seu ebook profissional pronto em 5 minutos — com capa, conteúdo e diagramação"

### Headline (EN)
"Your professional ebook ready in 5 minutes — cover, content, and layout included"

### Subheadline (PT-BR)
"Digite o título, escolha o estilo, e a IA gera seu ebook completo em PDF. Perfeito como isca digital, material de curso ou produto para vender."

### Subheadline (EN)
"Enter the title, choose the style, and AI generates your complete ebook as PDF. Perfect as lead magnet, course material, or digital product."

### Seções da Landing Page

#### 1. Hero Section
- Headline + Subheadline
- CTA: "Entrar na lista de espera"
- Input de email + botão
- Mockup: 3 ebooks lado a lado com capas profissionais diferentes (negócios, saúde, finanças)

#### 2. Problema
- "Leva semanas pra escrever um ebook?"
- "Seu lead magnet é um PDF feio que ninguém baixa?"
- "Paga R$2.000+ pra designer diagramar?"
- Ícones: 📝 Semanas escrevendo | 🎨 PDF feio | 💸 Designer caro

#### 3. Solução — Como funciona (3 passos)
- **Passo 1:** Digite o título e tema do ebook (ex: "7 Dicas de Produtividade para Empreendedores")
- **Passo 2:** Escolha o estilo visual (corporativo, criativo, minimalista, bold)
- **Passo 3:** Receba o ebook completo: capa + sumário + conteúdo + diagramação profissional em PDF

#### 4. Funcionalidades principais
- ✅ Ebook de 5-15 páginas gerado por IA
- ✅ Capa profissional automática (com título, subtítulo, imagem de fundo)
- ✅ Diagramação pronta (sem precisar de InDesign ou Canva)
- ✅ Templates por nicho: negócios, saúde, finanças, marketing, tecnologia, desenvolvimento pessoal
- ✅ Export em PDF (pronto pra Hotmart, Eduzz, Kiwify, Gumroad)
- ✅ Personalização de cores, fontes e logo
- ✅ Checklist, guias, workbooks e mini-cursos em PDF
- ✅ Multi-idioma: conteúdo em PT-BR, EN, ES

#### 5. Pra quem é
- 🎓 Infoprodutores e criadores de curso
- 📧 Quem precisa de lead magnet / isca digital
- 🏢 Consultores e coaches que entregam materiais
- 📱 Afiliados Hotmart/Eduzz/Kiwify que precisam de bônus
- 📣 Agências que criam material pra clientes
- 🧑‍💻 Freelancers que vendem ebooks como serviço

#### 6. Comparação
  | Sem CapaBook AI | Com CapaBook AI |
  |---|---|
  | 2-4 semanas escrevendo | 5 minutos |
  | R$2.000 com designer | R$47/mês |
  | PDF amador no Word | Diagramação profissional |
  | 1 ebook por trimestre | 1 ebook por dia |

#### 7. Pricing Preview
- 🆓 **Free:** 1 ebook pra testar
- ⭐ **Starter:** R$47/mês ($29 EN) — 10 ebooks/mês
- 🚀 **Pro:** R$97/mês ($49 EN) — ilimitado + templates premium + logo personalizado
- CTA: "Quero criar meu primeiro ebook grátis"

#### 8. FAQ
- "O conteúdo é original?" → Sim, gerado por IA com base no seu tema. 100% único.
- "Posso vender o ebook?" → Sim! Direitos totais do conteúdo gerado.
- "Funciona pra Hotmart/Eduzz?" → Sim, exporta em PDF pronto pra upload em qualquer plataforma.
- "Posso editar depois?" → Sim, o conteúdo é 100% editável antes de exportar.

#### 9. Footer CTA
- Repetir email + botão

### Design/Estilo
- Estilo: clean, editorial, sofisticado
- Cores: verde esmeralda (#059669) + branco + cinza escuro
- Referência visual: designrr.io, canva.com/ebooks
- Mockups: ebooks abertos mostrando páginas internas diagramadas

---

## LANDING PAGE 4: TestemunhoAI

### Conceito
Ferramenta que ajuda negócios locais a coletar e transformar depoimentos de clientes em cards visuais profissionais para Instagram, Google e site. O dono do negócio envia um link pro cliente, o cliente responde 3 perguntas guiadas por IA, e o sistema gera automaticamente um depoimento polido + card visual pronto pra postar.

### Headline (PT-BR)
"Transforme depoimentos dos seus clientes em posts profissionais — automaticamente"

### Headline (EN)
"Turn customer testimonials into professional social posts — automatically"

### Subheadline (PT-BR)
"Envie um link pro seu cliente. Ele responde 3 perguntas. A IA gera o depoimento polido + card visual pro Instagram. Sem pedir print, sem editar no Canva."

### Subheadline (EN)
"Send a link to your customer. They answer 3 questions. AI generates a polished testimonial + visual card for Instagram. No screenshots, no Canva editing."

### Seções da Landing Page

#### 1. Hero Section
- Headline + Subheadline
- CTA: "Entrar na lista de espera"
- Input de email + botão
- Mockup: fluxo visual — link enviado → cliente responde → card de depoimento aparece pronto

#### 2. Problema
- "Seus clientes amam seu trabalho mas você não tem provas disso online?"
- "Pede depoimento por WhatsApp e o cliente escreve 3 palavras?"
- "Tem prints feios de conversa no Instagram como 'prova social'?"
- Ícones: 🙈 Sem depoimentos | 📱 Prints feios | 🤷 Cliente não sabe o que escrever

#### 3. Solução — Como funciona (3 passos)
- **Passo 1:** Crie um link de coleta e envie pro seu cliente (WhatsApp, email, DM)
- **Passo 2:** Cliente clica, responde 3 perguntas guiadas pela IA (ex: "Qual era seu problema antes?", "O que mudou depois?", "Recomendaria?")
- **Passo 3:** Receba o depoimento polido + card visual pronto pra Instagram, Google Meu Negócio e seu site

#### 4. Funcionalidades principais
- ✅ Link de coleta personalizável (com logo e cores do negócio)
- ✅ Formulário guiado por IA (3 perguntas que extraem depoimentos ricos)
- ✅ IA transforma respostas curtas em depoimento profissional e completo
- ✅ Card visual automático (foto do cliente + texto + estrelas + logo)
- ✅ Templates: card para Instagram, banner para site, formato Google Reviews
- ✅ Galeria/mural de depoimentos (página pública com todos os depoimentos)
- ✅ Export em PNG/JPG para postar em qualquer rede
- ✅ Dashboard com todos os depoimentos recebidos
- ✅ Multi-idioma: PT-BR, EN, ES

#### 5. Pra quem é
- 🦷 Dentistas, médicos, clínicas
- 💪 Academias e personal trainers
- 💇 Salões de beleza e estéticas
- 🏠 Corretores de imóveis
- 🍕 Restaurantes e deliveries
- 🎓 Coaches e consultores
- 🧑‍💻 Freelancers e agências
- 🛒 E-commerces que precisam de reviews visuais

#### 6. Comparação
  | Sem TestemunhoAI | Com TestemunhoAI |
  |---|---|
  | Print de WhatsApp cortado | Card profissional com foto e estrelas |
  | "Obrigado, gostei" = depoimento fraco | IA guia o cliente a dar depoimento rico |
  | Esquece de pedir depoimento | Link automático pós-serviço |
  | Depoimentos espalhados | Dashboard centralizado |

#### 7. Pricing Preview
- 🆓 **Free:** 5 depoimentos pra testar
- ⭐ **Starter:** R$47/mês — 30 depoimentos/mês + brand kit
- 🚀 **Pro:** R$97/mês — ilimitado + mural público + integração Google Reviews
- CTA: "Comece a coletar depoimentos profissionais"

#### 8. FAQ
- "O cliente precisa baixar algum app?" → Não. É um link simples que abre no navegador.
- "Posso personalizar as perguntas?" → Sim, ou usar as perguntas otimizadas pela IA.
- "Funciona com Google Meu Negócio?" → Sim, o depoimento pode ser formatado pra Google Reviews.
- "E se o cliente escrever pouco?" → A IA expande respostas curtas em depoimentos completos e naturais.

#### 9. Footer CTA
- Repetir email + botão

### Design/Estilo
- Estilo: acolhedor, confiável, cores quentes
- Cores: laranja (#F59E0B) + branco + cinza escuro
- Referência visual: senja.io, testimonial.to
- Mockups: cards de depoimento com foto, estrelas, texto — estilo Instagram

---

## LANDING PAGE 5: ClipAI BR

### Conceito
Ferramenta que transforma vídeos longos (YouTube, podcasts, lives, aulas) em clips curtos otimizados para TikTok, Reels e Shorts — com legendas perfeitas em PT-BR, reformatação automática pra vertical, e detecção inteligente dos melhores momentos.

### Headline (PT-BR)
"Transforme 1 hora de vídeo em 10 clips virais — com legenda perfeita em português"

### Headline (EN)
"Turn 1 hour of video into 10 viral clips — with perfect captions in any language"

### Subheadline (PT-BR)
"Suba seu vídeo longo. A IA encontra os melhores momentos, corta, adiciona legenda em PT-BR e reformata pra vertical. Clips prontos pra postar."

### Subheadline (EN)
"Upload your long video. AI finds the best moments, cuts, adds captions, and reformats to vertical. Clips ready to post."

### Seções da Landing Page

#### 1. Hero Section
- Headline + Subheadline
- CTA: "Entrar na lista de espera"
- Input de email + botão
- Mockup: vídeo horizontal grande → seta → 5 clips verticais com legendas coloridas

#### 2. Problema
- "Grava 1 hora de conteúdo e posta só 1 vez?"
- "Gasta 3-5 horas editando clips manualmente?"
- "Usa legenda automática e sai tudo errado em português?"
- Ícones: 📹 Conteúdo desperdiçado | ⏰ Horas editando | 🇧🇷 Legenda errada em PT-BR

#### 3. Solução — Como funciona (3 passos)
- **Passo 1:** Suba seu vídeo longo (YouTube, podcast, live, aula) ou cole o link do YouTube
- **Passo 2:** IA analisa e seleciona os 5-10 melhores momentos automaticamente
- **Passo 3:** Receba clips verticais com legenda estilizada em PT-BR, prontos pra TikTok, Reels e Shorts

#### 4. Funcionalidades principais
- ✅ Detecção inteligente dos melhores momentos (não só "momentos energéticos", mas momentos de INSIGHT)
- ✅ Legendas perfeitas em PT-BR (não tradução, transcrição NATIVA)
- ✅ Reformatação automática: horizontal → vertical (9:16)
- ✅ Estilos de legenda: animada, karaokê, minimalista, bold
- ✅ Branding personalizado (cores, fonte, logo)
- ✅ Export direto nos formatos TikTok, Reels, Shorts
- ✅ Score de engajamento por clip (qual tem mais potencial)
- ✅ Upload de arquivo ou link do YouTube
- ✅ Multi-idioma: legendas em PT-BR, EN, ES

#### 5. Pra quem é
- 🎥 YouTubers que querem repostar em TikTok/Reels
- 🎙️ Podcasters
- 🎓 Professores e coaches que gravam aulas
- 📣 Palestrantes e mentores
- 🏢 Empresas que fazem webinars/lives
- 📱 Social media managers

#### 6. Comparação
  | Sem ClipAI | Com ClipAI |
  |---|---|
  | 3-5 horas editando por vídeo | 15 minutos |
  | 2-3 clips por semana | 10-20 clips por vídeo |
  | Legenda com erros em PT-BR | Legenda perfeita nativa |
  | Paga editor R$500-1.500/mês | R$69/mês |

#### 7. Pricing Preview
- 🆓 **Free:** 1 vídeo pra testar (até 30 min)
- ⭐ **Starter:** R$69/mês ($19 EN) — 10 vídeos/mês (até 2h cada)
- 🚀 **Pro:** R$129/mês ($39 EN) — ilimitado + agendamento + integrações
- CTA: "Quero testar grátis"

#### 8. FAQ
- "Funciona com qualquer tipo de vídeo?" → Sim. YouTube, podcasts, lives, aulas, webinars, entrevistas.
- "A legenda em português é boa?" → Perfeita. Transcrição nativa em PT-BR, não tradução.
- "Posso escolher quais clips exportar?" → Sim. A IA sugere os melhores, você escolhe quais quer.
- "Tem limite de duração do vídeo?" → Até 2 horas por vídeo no plano Starter, ilimitado no Pro.

#### 9. Footer CTA
- Repetir email + botão

### Design/Estilo
- Estilo: dinâmico, tech, gradientes
- Cores: rosa/magenta (#EC4899) + preto + branco
- Referência visual: opus.pro, submagic.co
- Mockups: clips verticais lado a lado com legendas coloridas estilizadas

---

## LANDING PAGE 6: EscopoAI

### Conceito
Gerador de propostas comerciais e técnicas profissionais com IA para agências digitais e freelancers. O profissional descreve o projeto em poucas linhas, e recebe uma proposta completa em PDF — com escopo detalhado, cronograma, valores por entregável, cláusulas contratuais e layout profissional.

### Headline (PT-BR)
"Proposta profissional em 2 minutos — feche mais clientes, pareça uma agência de verdade"

### Headline (EN)
"Professional proposals in 2 minutes — close more clients, look like a real agency"

### Subheadline (PT-BR)
"Descreva o projeto em 3 linhas. A IA gera proposta completa com escopo, cronograma, valores e contrato — pronta pra enviar em PDF."

### Subheadline (EN)
"Describe the project in 3 lines. AI generates a complete proposal with scope, timeline, pricing, and contract — ready to send as PDF."

### Seções da Landing Page

#### 1. Hero Section
- Headline + Subheadline
- CTA: "Entrar na lista de espera"
- Input de email + botão
- Mockup: briefing curto à esquerda → PDF de proposta profissional aberto à direita

#### 2. Problema
- "Perde 3-5 horas escrevendo proposta que o cliente nem lê?"
- "Suas propostas parecem amadoras comparadas com as de agências grandes?"
- "Não sabe como precificar seus serviços corretamente?"
- Ícones: ⏰ Horas perdidas | 📄 Proposta amadora | 💸 Precificação errada

#### 3. Solução — Como funciona (3 passos)
- **Passo 1:** Descreva o projeto brevemente (tipo de serviço, cliente, duração)
- **Passo 2:** Escolha o template (Gestão de Tráfego, SEO, Social Media, Desenvolvimento Web, Design, Consultoria)
- **Passo 3:** Receba proposta completa em PDF: escopo + cronograma + valores + cláusulas

#### 4. Funcionalidades principais
- ✅ Templates por tipo de serviço digital (Tráfego Pago, SEO, Social Media, Dev Web, Design, Consultoria)
- ✅ Escopo detalhado gerado por IA (entregáveis, etapas, prazos)
- ✅ Pricing inteligente: valores sugeridos por entregável com base em médias de mercado
- ✅ Estrutura de preço: setup + mensalidade + performance (como agência real)
- ✅ Cláusulas contratuais em PT-BR (termos de pagamento, PIX, cancelamento, SLA)
- ✅ Layout profissional com logo, cores e dados do freelancer/agência
- ✅ Export em PDF (pronto pra enviar por email ou WhatsApp)
- ✅ Assinatura digital integrada (aceite com 1 clique)
- ✅ Histórico de propostas + analytics (aberturas, aceitações)
- ✅ Multi-idioma: PT-BR, EN, ES

#### 5. Pra quem é
- 🎯 Gestores de tráfego pago
- 📱 Social media managers / freelancers
- 🌐 Desenvolvedores web freelancers
- 🎨 Designers freelancers
- 📣 Agências digitais pequenas (1-5 pessoas)
- 🧑‍💻 Consultores de marketing digital
- 📊 Analistas de SEO freelancers

#### 6. Comparação
  | Sem EscopoAI | Com EscopoAI |
  |---|---|
  | 3-5 horas por proposta | 2 minutos |
  | Proposta no Word/Google Docs | PDF profissional com layout |
  | Preço chutado | Pricing inteligente baseado em mercado |
  | Sem contrato = problemas depois | Cláusulas profissionais inclusas |
  | 2-3 propostas por mês | 2-3 propostas por DIA |

#### 7. Pricing Preview
- 🆓 **Free:** 3 propostas pra testar
- ⭐ **Starter:** R$69/mês ($29 EN) — 15 propostas/mês + brand kit
- 🚀 **Pro:** R$129/mês ($49 EN) — ilimitado + assinatura digital + analytics
- CTA: "Crie sua primeira proposta profissional grátis"

#### 8. FAQ
- "Funciona pra qualquer tipo de serviço?" → Sim, temos templates pra tráfego pago, SEO, social media, dev web, design, consultoria e mais.
- "Os valores sugeridos são confiáveis?" → São baseados em médias de mercado. Você pode ajustar qualquer valor.
- "O cliente pode assinar digitalmente?" → Sim (no plano Pro), com registro de IP e timestamp.
- "Posso personalizar com minha marca?" → Sim! Logo, cores, dados da empresa, foto do profissional.

#### 9. Footer CTA
- Repetir email + botão

### Design/Estilo
- Estilo: profissional, corporativo, confiável
- Cores: azul escuro (#1E3A5F) + dourado (#C5943A) + branco
- Referência visual: betterproposals.io, qwilr.com
- Mockups: PDF de proposta aberto mostrando escopo, timeline e valores

---

## LANDING PAGE 7: AtendeAI

### Conceito
Plataforma de automação inteligente com IA para negócios locais e agências. Diferente de chatbots genéricos, o AtendeAI automatiza o PROCESSO COMPLETO: responde leads com IA que entende contexto, agenda automaticamente, faz follow-up pós-serviço, coleta reviews no Google, e reativa clientes inativos — tudo pelo WhatsApp, sem o dono precisar tocar no celular.

### Headline (PT-BR)
"Seu negócio vendendo e atendendo 24h — sem contratar ninguém"

### Headline (EN)
"Your business selling and serving 24/7 — without hiring anyone"

### Subheadline (PT-BR)
"A IA responde seus clientes no WhatsApp, agenda serviços, cobra pagamentos, pede avaliações no Google e reativa quem sumiu. Tudo automático, como se você tivesse uma recepcionista incansável."

### Subheadline (EN)
"AI answers your customers on WhatsApp, books appointments, collects payments, requests Google reviews, and re-engages inactive clients. All automatic, like having a tireless receptionist."

### Seções da Landing Page

#### 1. Hero Section
- Headline + Subheadline
- CTA: "Entrar na lista de espera" / "Join the waitlist"
- Input de email + botão
- Mockup: tela de celular com conversa no WhatsApp mostrando IA respondendo cliente → agendando → confirmando
- Badge: "Lançamento em breve" + "Funciona com WhatsApp"

#### 2. Problema
- "Perde clientes porque demora pra responder no WhatsApp?"
- "Gasta 3-4 horas por dia respondendo as mesmas perguntas?"
- "Seus clientes somem e você não tem tempo de correr atrás?"
- "Tem 3 estrelas no Google porque nunca pede avaliação?"
- Ícones: 📱 Mensagens sem resposta | ⏰ Horas perdidas | ⭐ Poucas avaliações | 💸 Clientes perdidos

#### 3. Solução — Como funciona (4 passos)
- **Passo 1:** Conecte seu WhatsApp Business em 5 minutos
- **Passo 2:** Configure: horários, serviços, preços, perguntas frequentes
- **Passo 3:** A IA começa a atender — responde, agenda, confirma, cobra
- **Passo 4:** Você acompanha tudo no dashboard — clientes, agendamentos, faturamento, reviews
- Cada passo com ícone/ilustração

#### 4. Funcionalidades principais
- ✅ **Atendimento IA 24/7** — Responde no WhatsApp com IA que entende contexto (não é chatbot burro)
- ✅ **Agendamento automático** — Cliente escolhe dia/horário, recebe confirmação
- ✅ **Lembrete de consulta/serviço** — 24h antes: "Seu horário é amanhã às 14h. Confirma?"
- ✅ **Follow-up pós-serviço** — 24h depois: "Como foi sua experiência? Avalie no Google!"
- ✅ **Coleta de reviews Google** — IA guia o cliente a deixar avaliação 5 estrelas
- ✅ **Reativação de inativos** — 30/60/90 dias sem vir: "Faz tempo! Que tal agendar?"
- ✅ **Respostas personalizadas** — A IA aprende seu tom de voz e tipo de negócio
- ✅ **Dashboard completo** — Leads, agendamentos, faturamento, reviews, tudo em um lugar
- ✅ **Relatório mensal** — PDF automático com métricas do mês
- ✅ **Multi-atendente** — Escala pra equipe quando o negócio cresce
- ✅ **100% em PT-BR** — IA treinada pra falar como brasileiro, não tradução

#### 5. Pra quem é
- 🦷 Dentistas e clínicas odontológicas
- 💆 Salões de beleza, barbearias e estéticas
- 💪 Academias e personal trainers
- 🏥 Clínicas médicas e consultórios
- 🍕 Restaurantes e deliveries
- 🏠 Corretores de imóveis
- 🔧 Prestadores de serviço (encanador, eletricista, mecânico)
- 🐾 Pet shops e veterinárias
- 📣 Agências digitais que atendem negócios locais

#### 6. Comparação
  | Sem AtendeAI | Com AtendeAI |
  |---|---|
  | Responde quando pode (perde 60% dos leads) | Responde em 30 segundos, 24/7 |
  | Agenda por telefone (gasta 2h/dia) | Agenda automático pelo WhatsApp |
  | Nunca pede review (3 estrelas no Google) | Pede automaticamente (4.8 estrelas) |
  | Cliente sumiu = perdido | Reativação automática em 30/60/90 dias |
  | Contratar recepcionista: R$2.500/mês | AtendeAI: R$197/mês |

#### 7. Pricing Preview
- 🆓 **Free:** 7 dias grátis pra testar (50 mensagens)
- ⭐ **Starter:** R$97/mês ($29 EN) — 500 mensagens/mês + agendamento + reviews
- 🚀 **Pro:** R$197/mês ($49 EN) — ilimitado + reativação + relatórios + multi-atendente
- 🏢 **Agência:** R$497/mês ($99 EN) — 10 negócios + white-label + dashboard unificado
- CTA: "Teste grátis por 7 dias — sem cartão"

#### 8. FAQ
- "Funciona com meu WhatsApp normal?" → Funciona com WhatsApp Business. Você continua usando seu número.
- "A IA vai responder errado pros meus clientes?" → A IA é treinada com suas informações (serviços, preços, horários). Ela responde com precisão e no seu tom.
- "Preciso saber programar?" → Zero código. Configuração em 5 minutos com perguntas simples.
- "Funciona pra qualquer tipo de negócio?" → Sim! Dentistas, salões, academias, restaurantes, clínicas, prestadores de serviço, etc.
- "E se o cliente quiser falar com uma pessoa?" → A IA identifica quando precisa de atendimento humano e transfere automaticamente pra você ou sua equipe.
- "Posso cancelar quando quiser?" → Sim, sem multa, sem burocracia.

#### 9. Footer CTA
- Repetir email + botão
- "Seu concorrente já responde em 30 segundos. E você?"

### Design/Estilo
- Estilo: moderno, confiável, tech mas acessível
- Cores: verde (#22C55E) + branco + cinza escuro (#1F2937)
- Referência visual: umbler.com/br, manychat.com, respond.io
- Mockups: tela de celular com conversa WhatsApp mostrando IA atendendo + dashboard ao lado

---

## NOTAS TÉCNICAS PARA O LOVABLE

### Todas as landing pages devem ter:
1. **Responsividade:** Mobile-first (maioria do tráfego BR é mobile)
2. **Toggle de idioma:** EN ↔ PT-BR (botão no header)
3. **Waitlist com email capture:** Integrar com serviço simples (Mailchimp, ConvertKit, ou Supabase direto)
4. **Analytics:** Pixel do Meta + Google Analytics/Tag Manager pra rastrear conversões
5. **Velocidade:** Carregar em <3 segundos (LCP)
6. **SEO básico:** Meta tags, Open Graph, favicon
7. **Cookie consent:** Simples, aceitar/recusar
8. **Domínio:** Pode ser subdomínio ou domínio próprio por produto
9. **Design system:** Cada landing com identidade visual PRÓPRIA (cores diferentes)
10. **CTA fixo:** Botão de waitlist fixo no topo em scroll

### Paleta de cores por landing:
| Landing | Cor principal | Cor secundária |
|---------|--------------|----------------|
| CriativoAI | #3B82F6 (azul) | #1E40AF |
| VideoMestre | #7C3AED (roxo) | #5B21B6 |
| CapaBook AI | #059669 (verde) | #047857 |
| TestemunhoAI | #F59E0B (laranja) | #D97706 |
| ClipAI BR | #EC4899 (rosa) | #BE185D |
| EscopoAI | #1E3A5F (azul escuro) | #C5943A (dourado) |
| AtendeAI | #22C55E (verde) | #1F2937 (cinza escuro) |
