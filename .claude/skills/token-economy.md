# SKILL: Token Economy & Resource Optimization

## PLANO ATUAL
```
CLAUDE MAX ($100/mes)
Limite: SEMANAL (reset quinta-feira 14:00 Sao Paulo)
Sessao: Rolling window ~5 horas
"Uso extra": Toggle pra continuar apos limite (cobra extra, DESATIVADO)
```

## ERRO CRITICO DO DIA 07/03/2026
- 11 sub-agentes rodaram SEM especificar modelo = rodaram em OPUS
- Opus gasta ~5x mais que Haiku (Opus 4.6), antes era 15x (Opus 4.0/4.1)
- Resultado: 45% do budget SEMANAL queimado em 1 dia
- Sonnet usou so 17%. O resto foi OPUS desperdicado.

## PRICING API ATUALIZADO (Março 2026)
Fonte: https://platform.claude.com/docs/en/about-claude/pricing

| Modelo | Input/MTok | Output/MTok | Ratio vs Haiku |
|--------|-----------|-------------|----------------|
| Haiku 4.5 | $1 | $5 | 1x (base) |
| Sonnet 4.6 | $3 | $15 | 3x |
| Opus 4.6 | $5 | $25 | 5x |
| Opus 4.0/4.1 | $15 | $75 | 15x (EVITAR!) |

### Estratégias de economia (API — aplicável se usar Claude API no CriativoAI):
1. **Prompt Caching** — cache hit = 10% do preço input. System prompts repetidos = 90% economia
   - 5min cache write: 1.25x input → paga com 1 cache hit
   - 1h cache write: 2x input → paga com 2 cache hits
2. **Batch API** — 50% desconto, processamento assíncrono (não real-time)
3. **Modelo certo** — Haiku para tarefas simples, Sonnet para complexas
4. **max_tokens limitado** — não pedir 4096 tokens se precisa de 200

### Para Claude MAX (nosso plano):
- Ratios relativos entre modelos afetam velocidade de consumo do limite semanal
- Opus 4.6 = 5x Haiku (melhor que antes, mas ainda caro pra sub-agentes)
- Regra continua: NUNCA Opus em sub-agentes, HAIKU 80%, SONNET 20%

---

## MODELO OBRIGATORIO POR TIPO DE AGENTE

**REGRA ABSOLUTA: SEMPRE colocar `model:` no Task tool. NUNCA omitir.**

### HAIKU (model: "haiku") — USAR POR PADRAO
Custo: ~1x (referencia). Mais barato, mais rapido.

```
USAR HAIKU PARA:
✅ Code review / listar bugs (so leitura)
✅ Resumir documentos ou arquivos
✅ Formatar / reorganizar texto
✅ Gerar docs a partir de template
✅ Listar arquivos que precisam mudar
✅ Comparar dois arquivos
✅ Pesquisa web SIMPLES (ate 10 buscas)
✅ Traduzir conteudo
✅ Criar listas, tabelas, checklists
✅ Verificar se codigo segue padrao (lint manual)
✅ Ler git diff e listar mudancas
✅ Tarefas de 1 passo (ler → responder)
```

### SONNET (model: "sonnet") — SO QUANDO HAIKU NAO DA CONTA
Custo: ~3-5x Haiku. Mais inteligente, necessario pra tarefas complexas.

```
USAR SONNET PARA:
✅ Pesquisa web PROFUNDA (15-30+ buscas, analise cruzada)
✅ Analise de arquitetura / decisoes tecnicas
✅ Codigo complexo que exige raciocinio (algoritmos, logica)
✅ Escrever prompts de IA (system prompts, personas)
✅ Analise competitiva com multiplas fontes
✅ Criar documentos estrategicos (roadmaps, playbooks)
✅ Code review PROFUNDO (logica, seguranca, performance)
✅ Orquestracao de multiplas tarefas
✅ Qualquer coisa que Haiku errou ou fez mal feito
```

### OPUS — PROIBIDO EM SUB-AGENTES
Custo: ~15x Haiku. NUNCA usar em sub-agentes.

```
OPUS SO PODE SER USADO:
- Na conversa PRINCIPAL (automatico, nao controlamos)
- NUNCA em Task tool
- Se precisar de Opus, o usuario usa na conversa direta
```

### TABELA RAPIDA DE DECISAO

```
| Tipo de Agente               | Modelo  | Max Turns | Custo Relativo |
|------------------------------|---------|-----------|----------------|
| Review de codigo (listar)    | HAIKU   | 15        | 1x             |
| Review profundo (logica)     | SONNET  | 25        | 4x             |
| Pesquisa web (ate 10 buscas) | HAIKU   | 15        | 1x             |
| Pesquisa web (15-30 buscas)  | SONNET  | 30        | 5x             |
| Gerar/formatar documento     | HAIKU   | 10        | 1x             |
| Criar doc estrategico        | SONNET  | 25        | 4x             |
| Listar bugs no git diff      | HAIKU   | 10        | 1x             |
| Corrigir bugs em codigo      | SONNET  | 25        | 4x             |
| Resumir um doc grande        | HAIKU   | 10        | 1x             |
| Analise competitiva          | SONNET  | 30        | 5x             |
| Traduzir/formatar texto      | HAIKU   | 10        | 1x             |
| Escrever prompts de IA       | SONNET  | 20        | 3x             |
```

**REGRA: Na duvida, comeca com HAIKU. Se o resultado nao for bom, relanca em SONNET.**

---

## LIMITES SEGUROS (SEMANAL)

```
| Metrica                  | SEGURO    | MAXIMO    | PROIBIDO   |
|--------------------------|-----------|-----------|------------|
| Agentes por DIA          | 4-6       | 8         | 11+        |
| MAX turns por agente     | 20 (haiku)| 30 (son.) | 100+       |
| Web searches por agente  | 10 (haiku)| 30 (son.) | 50+        |
| Agentes simultaneos      | 2-3       | 4         | 5+         |
| % semanal por DIA        | 8-12%     | 15%       | 45%        |
```

Se um agente precisa de 40+ turns → DIVIDIR em 2 agentes menores.
Contexto acumulado cresce EXPONENCIAL: turn 100 custa 30x mais que turn 1.

---

## FERRAMENTAS DISPONIVEIS (GRATUITAS)

```
┌─────────────────────────────────────────────────────────┐
│ ANTIGRAVITY (Gemini 3 Pro — GRATIS, limite semanal)     │
│ ⚠️ LIMITE GRATIS PROVAVELMENTE APERTADO                │
│ ⚠️ Testar antes de contar com ele pro SaaS inteiro     │
│ ✅ Auto-complete, inline edits (Ctrl+I) — bom pra fixes│
│ ✅ Bug fixes simples, TypeScript, ESLint                │
│ ❓ Agent Manager (Ctrl+E) — pode esgotar limite rapido │
│ ⚠️ Terminal "claude" dentro = GASTA MAX! NUNCA usar.   │
│ ❌ Pesquisa web, git push, decisoes de arquitetura      │
│ VEREDICTO: Util pra complementar, NAO contar como       │
│ ferramenta principal. Se limite for muito baixo,        │
│ Claude MAX faz tudo (codigo incluso).                   │
├─────────────────────────────────────────────────────────┤
│ LOVABLE (pago — frontend especialista)                   │
│ ✅ Criar paginas e telas completas                      │
│ ✅ UI/UX de alta qualidade                              │
│ ✅ Prototipagem rapida                                  │
│ ✅ Exportar codigo React/Next                           │
│ ❌ Backend, APIs, logica complexa                       │
├─────────────────────────────────────────────────────────┤
│ CLAUDE CODE MAX ($100/mes — limite semanal)             │
│ ✅ Pesquisa de mercado (web search — BARATO)            │
│ ✅ Orquestracao de sub-agentes                          │
│ ✅ Decisoes de arquitetura e estrategia                 │
│ ✅ Code review (Haiku = barato!)                        │
│ ✅ Git commit, push, deploy                             │
│ ✅ Browser automation (Chrome MCP)                      │
│ ✅ Docs estrategicos                                    │
│ ❌ Edits simples de codigo (usar Antigravity)           │
│ ❌ Frontend/UI (usar Lovable)                           │
│ ❌ Sub-agentes de CODIGO pesado (usar Antigravity)      │
└─────────────────────────────────────────────────────────┘
```

### Workflow Otimizado (ATUALIZADO 08/03/2026)
```
OPUS (conversa principal) = CEREBRO + BRACO PESADO
  • Orquestra tudo, toma decisoes de arquitetura
  • Escreve codigo complexo DIRETO (nao delega pra sub-agente)
  • Conversa com o usuario
  • Commit, push, deploy

SONNET sub-agente (20%) = PESQUISA PROFUNDA
  • Bryan (20-30+ buscas)
  • Analise competitiva, docs estrategicos

HAIKU sub-agente (80%) = TAREFAS LEVES
  • Code review, gerar docs/templates/boilerplate
  • Formatacao, listas, comparacoes

CONTA 2 (quando esgotar conta 1)
  • Mesmo projeto, outro Gmail
  • Continua de onde parou (MEMORY.md + CLAUDE.md)
  • 2x MAX ($200/mes = R$1.060) > qualquer API

DESCONTINUADO:
  ❌ Antigravity — limite muito apertado, nao confiavel
  ❌ Lovable — caro demais pro que entrega
  ❌ Claude API — R$1.060 na API = 20-30 sessoes. No MAX = uso quase ilimitado
  ❌ Sub-agente pra codigo pesado — OPUS faz direto, gasta menos
```

---

## O QUE GASTA MAIS vs MENOS

```
MUITO BARATO (usar a vontade):
- Web search: ~3-8K tokens por busca
- File read: ~5-20K tokens
- Mensagem simples: ~2-5K tokens
- Sub-agente HAIKU (10 turns): ~15-30K tokens

BARATO (usar com consciencia):
- Sub-agente SONNET pesquisa (30 buscas): ~200-400K tokens
- Sub-agente HAIKU review (15 turns): ~50-90K tokens
- Conversa principal (1 hora): ~200-500K tokens

CARO (evitar no Claude — usar Antigravity/Lovable):
- Sub-agente SONNET codigo (50 turns): ~300-600K tokens
- Sub-agente OPUS qualquer coisa: ~1-5M tokens ← PROIBIDO

MUITO CARO (NUNCA MAIS FAZER):
- Sub-agente OPUS codigo (100+ turns): ~15-25M tokens
- 11 agentes OPUS no mesmo dia: 45% do budget semanal
```

---

## CHECKLIST ANTES DE LANCAR AGENTE

```
1. [ ] Posso fazer isso EU MESMO em 5 minutos? → Se sim, nao lance
2. [ ] Antigravity/Lovable resolve isso GRATIS? → Se sim, nao lance
3. [ ] HAIKU da conta? → Se sim, use HAIKU (nao Sonnet)
4. [ ] Especifiquei model: "haiku" ou "sonnet"? → OBRIGATORIO
5. [ ] Limitei max_turns? (haiku: 15, sonnet: 30) → OBRIGATORIO
6. [ ] Quantos agentes ja rodaram HOJE? → Max 6-8
7. [ ] Quanto % semanal ja gastou? → Se >70%, so Haiku
```

---

## REGRA: LEMBRETE DE TROCA DE MODELO

```
QUANDO codigo pesado/boilerplate/repetitivo aparecer:
→ LEMBRAR o usuario: "Esse trecho e boilerplate. Quer ativar Haiku/Sonnet
  em mim pra economizar, ou prefere manter Opus?"

Exemplos de codigo pesado (sugerir trocar pra Haiku/Sonnet):
  • Gerar 30+ templates HTML/CSS repetitivos
  • Boilerplate de CRUD/API routes
  • Migrations SQL, seeders
  • Codigo repetitivo com padrao claro

Manter Opus para:
  • Decisoes de arquitetura
  • Codigo com logica complexa
  • Debugging dificil
  • Orquestracao de sub-agentes
  • Conversa e planejamento
```

---

## REGRA FINAL INVIOLAVEL

```
SEMPRE especificar model no Task tool:
  model: "haiku"  → 80% dos agentes (padrao)
  model: "sonnet" → 20% dos agentes (so quando complexo)
  model: "opus"   → 0% (PROIBIDO em sub-agentes)

NUNCA omitir model. Default pode ser Opus = desastre.

ANTES de sessao pesada, AVISAR o usuario:
"Vou lancar [X] agentes em [modelo]. Gasto estimado: ~[Y]% semanal."

SEMPRE usar Haiku primeiro. So escalar pra Sonnet se necessario.
Codigo pesado = OPUS faz direto (ou lembrar usuario de trocar pra Haiku).
```
