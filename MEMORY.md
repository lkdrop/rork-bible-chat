# MEMORY.md — Memória Persistente Entre Sessões
**LER ESTE ARQUIVO NO INÍCIO DE CADA SESSÃO**

---

## Quem é o Usuário
- Dev solo brasileiro, 1 pessoa
- Plano Claude MAX ($100/mês), limite SEMANAL (reset qui 14h SP)
- Projetos: Devocio.IA (app cristão) + próximo SaaS (em decisão)
- Ferramentas: Claude Code MAX, Antigravity (Gemini grátis, limite apertado), Lovable (pago, frontend)
- NÃO gosta de esperar — quer respostas rápidas, sub-agentes em background
- ODEIA perda de contexto entre sessões — por isso este arquivo existe
- TAMBÉM existe `~/.claude/CLAUDE.md` GLOBAL (lido em todos os projetos)

---

## Regras INVIOLÁVEIS de Operação
1. **NUNCA bloquear o chat** — tarefas pesadas = sub-agente em background
2. **NUNCA sair do chat** — usuário quer Claude AQUI respondendo
3. **SEMPRE especificar model nos sub-agentes** — haiku (80%) ou sonnet (20%), NUNCA opus
4. **SEMPRE salvar contexto** — skills, docs, CLAUDE.md, MEMORY.md
5. **Pedir permissão** antes de cada etapa grande
6. **Responder RÁPIDO** — se agente demora, continuar conversando

---

## Economia de Tokens (CRÍTICO)
- **Ler `.claude/skills/token-economy.md`** antes de sessão pesada
- Haiku: 80% dos agentes (barato). Sonnet: 20% (complexo). Opus: PROIBIDO em sub-agentes
- Max 30 turns por agente. Se precisa mais → dividir em 2
- Código pesado = CARO no Claude → usar Antigravity se limite permitir
- Pesquisa web = BARATA → usar à vontade

---

## Estado Atual dos Projetos

### Devocio.IA (App Cristão)
- **Status**: Funcionando, deploy no Vercel
- **Stack**: React Native Web (Expo 53), Supabase, Groq, Together AI, ElevenLabs
- **Quick Wins Phase 1**: COMPLETA (20 files, streaks, milestones, WhatsApp share)
- **Tema**: Light é padrão (cream/bege), toggle dark no perfil
- **Plano Light Theme**: PRONTO (plan file exists), NÃO implementado ainda
- **Remotes**: origin → lkdrop/rork-bible-chat, biblia → lkdrop/biblia-chat-nocode-0.1

### Próximo SaaS (em decisão)
- **Status**: Pesquisa COMPLETA. Pronto pra decidir.
- **Pesquisa Bryan #1**: AgendaIA recomendado (25 buscas, docs/bryan-saas-research.md)
- **Pesquisa Bryan #2**: 10 NOVAS ideias (22 buscas, docs/bryan-new-ideas-research.md)
  - TOP: IgrejaApp (8.5), GaleriaFoto BR (8.5), TestemunhoWidget (8.5)
  - Outros: FitGestao (8.0), PropostaRápida (8.0), PortalCliente (7.5), Controlle (7.5), PetGenius (7.5), CardapioQR (7.0), LinkBio Infoprodutor (7.5)
- **Cases Starter Story**: 8 analisados com playbooks completos
- **Decisão pendente**: Qual SaaS construir

---

## Docs Disponíveis (pesquisas prontas)
| Arquivo | Conteúdo |
|---------|----------|
| `docs/bryan-saas-research.md` | Pesquisa profunda: AgendaIA recomendado (25 buscas) |
| `docs/bryan-new-ideas-research.md` | 10 novas ideias com scores (IgrejaApp #1) |
| `docs/product-hunt-research.md` | Tendências PH 2025-2026, 10 ideias rankeadas |
| `docs/starter-story-insights.md` | 8 case studies com playbooks de growth |
| `docs/ux-retention-analysis.md` | Análise UX competitiva (8 apps de Bíblia) |
| `docs/retention-playbook.md` | Playbook de retenção (40 citações) |

---

## Skills (time de IA)
| Skill | Arquivo | Função |
|-------|---------|--------|
| Token Economy | `.claude/skills/token-economy.md` | Economia de tokens (LER PRIMEIRO!) |
| Bryan Research | `.claude/skills/bryan-research.md` | Head of Research & Market Intelligence |
| Rafael Growth | `.claude/skills/rafael-growth.md` | Head of Growth & Retention |
| Letícia UX | `.claude/skills/leticia-ux.md` | Head of UX/UI & Product Strategy |
| Duda Rebrand | `.claude/skills/duda-rebrand.md` | Head of Brand & Design System |
| Carol Copy | `.claude/skills/carol-copy.md` | Head of Copywriting |
| Marcos QA | `.claude/skills/marcos-qa.md` | QA Engineer |

---

## Insights-Chave Aprendidos (8 Cases Starter Story)

### Padrões de $10K+ MRR Solo:
1. UM canal de distribuição dominado
2. Produto SIMPLES que resolve 1 dor
3. Onboarding > features (90% só veem onboarding)
4. MVP em 2-3 dias a 2 semanas
5. Growth = matemática (CAC, LTV, ROAS)
6. Capturam demanda EXISTENTE
7. Suporte = pesquisa de mercado = conteúdo
8. Pensam em portfolio (cross-sell sem CAC extra)
9. Simplicidade como moat (Letterly: remover fricção > adicionar features)
10. "Show don't tell" (Kletchi: demonstrar > vender)
11. Micro-creators baratos (Kletchi: $120 → 2M views, 83x ROI)
12. 100% AI coding é real (Connor: app em 2 semanas com Claude Code)
13. Viralidade = volume, não sorte (100 vídeos/dia = determinístico)

### Canais comprovados 2026:
- **Google SEO + Ads**: SaaS B2B (Case Late: $40K MRR)
- **TikTok/Reels volume**: B2C consumer (Case DuckMath: $15K MRR)
- **YouTube tutorials**: Nicho técnico (Case Bulk Mockup: $12K MRR)
- **SEO blog + cross-sell**: Multi-product (Case Barn2: $150K MRR)
- **Content First (fake demo)**: Consumer viral (Case PushScroll: $30K MRR)
- **Micro-Streamers**: Consumer apps (Case Kletchi: $60K MRR, $120/vídeo!)
- **Influencer → UGC → Paid**: Mobile utilities (Case Connor: $20K MRR)
- **Paid Ads escala**: Unit economics fortes (Case Letterly: $250K MRR)

### Critérios de Ideia (compilado de 8 cases):
1. Tem keyword óbvia no Google?
2. Canal acessível pra solo dev?
3. Alguém já paga por similar?
4. MVP em <2 semanas com AI?
5. Stack do dev cobre? (React/Supabase/Groq/Vercel)
6. Dá pra fazer segundo produto pro MESMO cliente?
7. Toca em "core human desire"? (dinheiro, saúde, confiança, aparência)
8. Dá pra demonstrar em 15 segundos de vídeo?
9. UX pode ser MAIS SIMPLES que concorrentes?

---

## Ferramentas Úteis Descobertas
- **Repurpose.io**: Cross-post automático TikTok → todas plataformas
- **PostHog Startup Program**: $50K em créditos grátis (aplicar!)
- **Cal.com**: Agendamento de calls (grátis)
- **Easy Digital Downloads**: Vender plugins WordPress ($300/ano)
- **Komodo/AppSumo**: Alternativa Loom ($19 LTD)
- **RevenueCat**: Subscription analytics + pricing tests (mobile apps)
- **Mixpanel**: Analytics detalhado (alternativa PostHog)
- **Figma**: UI screenshots de concorrentes → cherry pick → redesign
- **Firecrawl** (firecrawl.dev): Web scraping API pra IA, 500 páginas grátis, open source 89K stars

---

## Memória Global
- `~/.claude/CLAUDE.md` → lido em TODOS os projetos (criado 07/03/2026)
- Contém: perfil do usuário, regras, preferências, referência aos docs

---

*Última atualização: 07/03/2026*
*Atualizar este arquivo ao final de cada sessão importante*
