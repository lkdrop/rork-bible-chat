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
- Opus gasta 5x mais que Sonnet, 15x mais que Haiku
- Resultado: 45% do budget SEMANAL queimado em 1 dia
- Sonnet usou so 17%. O resto foi OPUS desperdicado.

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
│ ✅ Editar codigo, criar componentes, refatorar          │
│ ✅ Auto-complete, inline edits (Ctrl+I)                 │
│ ✅ Agent Manager = multiplos agentes Gemini (Ctrl+E)    │
│ ✅ Bug fixes, TypeScript, ESLint                        │
│ ✅ Implementar features inteiras                        │
│ ⚠️ Terminal "claude" dentro = GASTA MAX! Evitar.        │
│ ❌ Pesquisa web, git push, decisoes de arquitetura      │
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

### Workflow Otimizado
```
1. CLAUDE CODE: Planeja o dia, pesquisa, define roadmap
2. LOVABLE: Cria telas/UI novas (gratis)
3. ANTIGRAVITY: Implementa logica, edits, refatora (gratis)
4. CLAUDE CODE: Review do que foi feito (1 agente HAIKU)
5. ANTIGRAVITY: Corrige o que Claude apontou (gratis)
6. CLAUDE CODE: Commit, push, deploy (direto, sem agente)
7. CLAUDE CODE: Pesquisa/estrategia se necessario (SONNET)
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

## REGRA FINAL INVIOLAVEL

```
SEMPRE especificar model no Task tool:
  model: "haiku"  → 80% dos agentes (padrao)
  model: "sonnet" → 20% dos agentes (so quando complexo)
  model: "opus"   → 0% (PROIBIDO em sub-agentes)

NUNCA omitir model. Default pode ser Opus = desastre.

ANTES de sessao pesada, AVISAR o usuario:
"Vou lancar [X] agentes em [modelo]. Gasto estimado: ~[Y]% semanal."

SEMPRE sugerir Antigravity/Lovable para codigo.
SEMPRE usar Haiku primeiro. So escalar pra Sonnet se necessario.
```
