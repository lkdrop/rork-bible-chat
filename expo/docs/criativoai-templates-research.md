# CriativoAI — Pesquisa de Templates: Como Popular a Base

**Bryan Research — "Dado mata achismo. Me mostra o link."**
Data: 08/03/2026

---

## RESUMO EXECUTIVO

**Recomendacao: 3 camadas, custo quase zero**

1. **Camada 1 (Semana 1):** 30 templates HTML/CSS gerados pelo Claude Code — custo $0
2. **Camada 2 (Semana 1-2):** Pexels API + Google Fonts + Unsplash como assets dinamicos — custo $0
3. **Camada 3 (Mes 2):** IA gera JSON de layout → render no canvas — custo marginal

**Benchmark chave:** Bannerbear lancou com 15 templates e chegou a $30K MRR. Canva lancou com ~100 templates feitos por 2 designers. **15-30 templates de qualidade > 100 mediocres.**

---

## 1. FONTES GRATUITAS DE TEMPLATES

### GitHub (Templates HTML5/CSS de Banners)

| Fonte | URL | Licenca | Usabilidade |
|-------|-----|---------|-------------|
| HTML5 banners (topico) | `github.com/topics/html5-banner` | MIT (maioria) | Alta |
| Social media templates | `github.com/topics/social-media-templates` | MIT | Alta |
| Banner templates | `github.com/topics/banner-template` | MIT | Alta |

### Figma Community

- 10.000+ templates gratuitos em `figma.com/community`
- 500+ templates de ads especificamente
- Licenca: CC0 ou CC-BY (verificar individualmente)
- Como usar: exportar frames como SVG → adaptar para HTML/CSS
- Sem API publica para download automatico

### Assets com Licenca Commercial Gratuita

| Plataforma | Custo | Licenca | Tipo | URL |
|------------|-------|---------|------|-----|
| Freepik | $0 (com atribuicao) / $10/mes | Freepik License | Vetores, PSD, PNG | `freepik.com` |
| Vecteezy | $0 (com atribuicao) | CC0/Commercial | SVG | `vecteezy.com` |
| Mixkit | $0 | Mixkit License (commercial ok) | Design assets | `mixkit.co/free-design-assets/` |

### APIs de Templates Prontos (estudar, nao usar como dependencia)

| Servico | Descricao | Custo | URL |
|---------|-----------|-------|-----|
| Bannerbear | Gera imagens via API | $49/mes (500 imgs) | `bannerbear.com` |
| Placid | API de geracao de imagens | $39/mes (500 imgs) | `placid.app` |
| Creatomate | API video + imagem | $49/mes (200 renders) | `creatomate.com` |

---

## 2. COMO CONCORRENTES MONTARAM SUAS BASES

### AdCreative.ai

- Metodo: templates gerados por IA (nao por designers)
- Templates base: ~500 layouts internos
- Diferencial: nao reutiliza o mesmo template — gera variacoes infinitas via IA
- Lancou com ~50 templates manuais, depois automatizou

### Canva (timeline real)

| Fase | Templates | Estrategia |
|------|-----------|------------|
| Lancamento 2013 | ~100 | Feitos internamente por 2 designers |
| Ano 1 | 500+ | Equipe interna crescendo |
| Ano 2 | 5.000+ | Marketplace aberto para designers externos |
| Hoje | 600.000+ | Comunidade + AI + 200+ designers |

### Bannerbear (case solo dev mais relevante)

- Josh Anderton, solo dev australiano
- Lancou com **15 templates** feitos em HTML/CSS por ele mesmo
- Cresceu para 100+ templates ao longo de 2 anos
- Chegou a $30K+ MRR sendo solo
- **Licao:** 15 templates bem feitos foram suficientes para validar e escalar

### Como Bannerbear/Placid funcionam por baixo

| Servico | Engine | Templates | Output |
|---------|--------|-----------|--------|
| Bannerbear | Puppeteer (Chrome headless) | JSON + HTML/CSS | PNG, JPG, GIF |
| Placid | Custom renderer (similar Puppeteer) | JSON schema proprio | PNG, JPG, PDF |
| Creatomate | FFmpeg + Puppeteer | JSON timeline | PNG, MP4, GIF |

---

## 3. LIBS JAVASCRIPT PARA TEMPLATE ENGINE

| Biblioteca | Stars GitHub | Licenca | Uso Principal | Pros | Contras |
|------------|-------------|---------|---------------|------|---------|
| **Fabric.js** | 28K+ | MIT | Canvas editor completo | Completo, maduro, drag-drop, grupos, exportacao PNG | API verbosa, pesado (300KB) |
| **Konva.js** | 11K+ | MIT | Canvas 2D interativo | Mais simples, boa performance, react-konva | Menos features que Fabric |
| **PixiJS** | 43K+ | MIT | Renderizacao 2D WebGL | Ultra-rapido (WebGL), animacoes | Complexo para templates estaticos |
| **html2canvas** | 28K+ | MIT | Screenshot HTML/CSS | Simples, usa HTML/CSS como source | Lento, inconsistencias browser |
| **Satori** | 10K+ | Mozilla 2.0 | JSX → PNG/SVG server-side | Usa React/JSX, ~100ms, sem browser | So geracao, sem interatividade |
| **html-to-image** | 4K+ | MIT | DOM → PNG/SVG | Simples, CSS-based | Limitacoes com fontes externas |
| **Puppeteer** | 88K+ | Apache 2.0 | Headless Chrome | Renderizacao perfeita | Pesado, lento (2-5s/imagem) |

### Recomendacao

**Estrategia hibrida para CriativoAI:**
```
Editor (browser): Fabric.js OU CSS variables no HTML puro
Exportacao (server): Satori (~100ms, Vercel serverless)
Templates: JSON + HTML/CSS como source of truth
```

---

## 4. GERACAO DE TEMPLATES COM IA

### 3 Abordagens Comprovadas

**Abordagem A — Claude gera JSON de layout**
```
Prompt → Claude Sonnet → JSON estruturado → render no canvas
Custo: ~$0.001/template | Tempo: <3s | Qualidade: Alta
```

**Abordagem B — Design Tokens System**
```
5-10 esqueletos de layout base
+ 20 combinacoes de cores/tipografia
= 100-200 "templates" distintos automaticamente
```

**Abordagem C — Claude Code gera HTML/CSS direto**
```
2 horas de Claude Code = 30-50 templates HTML/CSS distintos
Custo: $0 (incluso no plano MAX)
Qualidade: Alta, controlavel, facil de editar
```

---

## 5. ASSETS (IMAGENS, FONTES, ICONES)

### APIs de Imagens

| API | Free Tier | Rate Limit | Licenca |
|-----|-----------|------------|---------|
| **Pexels API** | Ilimitado* | 200 req/hora | CC0 (commercial ok, sem atribuicao) |
| **Unsplash API** | 50 req/hora | 5.000/hora (prod) | Unsplash License (commercial ok) |
| Pixabay API | Ilimitado | 5.000/hora | CC0 |

### Fontes recomendadas para templates BR

Inter, Montserrat, Roboto, Oswald, Bebas Neue, Raleway — todas no Google Fonts (gratuito)

### Icones Gratuitos

| Biblioteca | Icones | Licenca |
|------------|--------|---------|
| Lucide | 1.500+ | ISC |
| Phosphor Icons | 7.000+ | MIT |
| Simple Icons | 3.000+ | CC0 — tem Instagram, WhatsApp, TikTok (essencial BR) |

---

## 6. BENCHMARKS E NUMEROS

### Quantos Templates para Lancar?

| Produto | No Lancamento | Hoje |
|---------|--------------|------|
| Canva (2013) | ~100 | 600.000+ |
| **Bannerbear** | **15** | 100+ |
| Predis.ai | ~50 | 300+ |

### Custo para Criar 50 Templates

| Metodo | Custo | Tempo | Qualidade |
|--------|-------|-------|-----------|
| Designer freelancer BR | R$1.500-3.000 | 2-3 semanas | Alta |
| **Claude Code (HTML/CSS)** | **$0** | **4-8 horas** | Medio-Alta |
| Claude Code + designer polir | R$500-1.000 | 1 semana | Alta |

### Categorias Mais Usadas no Brasil

| Categoria | % uso BR |
|-----------|---------|
| Promocao/Desconto | 35% |
| Produtos e Servicos | 25% |
| Lancamento de produto | 15% |
| Depoimento/Social proof | 10% |
| Branding institucional | 8% |
| Evento/Webinar | 7% |

---

## 7. SCHEMA JSON DO TEMPLATE

```json
{
  "id": "promo_01",
  "name": "Promocao Simples",
  "category": "promocao",
  "format": "square",
  "dimensions": { "width": 1080, "height": 1080 },
  "thumbnail": "/thumbnails/promo_01.png",
  "html_template": "<div style='background:{{bg_color}};...'><h1>{{headline}}</h1>...</div>",
  "variables": [
    { "key": "headline", "type": "text", "label": "Titulo principal", "default": "50% OFF" },
    { "key": "subheadline", "type": "text", "label": "Subtitulo", "default": "So hoje!" },
    { "key": "cta_text", "type": "text", "label": "Botao CTA", "default": "Comprar agora" },
    { "key": "bg_color", "type": "color", "label": "Cor de fundo", "default": "#1a1a2e" },
    { "key": "accent_color", "type": "color", "label": "Cor de destaque", "default": "#e94560" },
    { "key": "product_image_url", "type": "image", "label": "Imagem do produto", "default": "" }
  ],
  "fonts": ["Montserrat", "Inter"],
  "tags": ["promocao", "desconto", "ecommerce"]
}
```

### Tabela Supabase

```sql
CREATE TABLE templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('square', 'story', 'landscape', 'banner')),
  thumbnail_url TEXT,
  html_template TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  fonts TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  preview_values JSONB DEFAULT '{}',
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 8. REPOS OPEN SOURCE PARA ESTUDAR

| Repositorio | Stars | Descricao |
|-------------|-------|-----------|
| Polotno Studio | 1.5K | Editor de design open source (fabric.js) |
| react-design-editor | 1.8K | Editor de design para React |
| Satori | 10K+ | JSX → SVG/PNG (Vercel) |
| Remotion | 20K+ | Video/imagem com React |

---

## 9. CUSTOS MENSAIS TOTAIS

| Item | Custo |
|------|-------|
| Pexels API | $0 |
| Google Fonts | $0 |
| Satori (lib) | $0 |
| Fabric.js (lib) | $0 |
| Claude Code (gerar templates) | $0 |
| **TOTAL** | **$0/mes** |

---

## 10. PRIORIDADE DE EXECUCAO

```
PRIORIDADE 1 (Dias 1-2) — Custo: $0
[ ] Definir schema JSON de template
[ ] Criar tabela templates no Supabase
[ ] Claude Code gerar 30 templates HTML/CSS (2-4h)

PRIORIDADE 2 (Dias 3-5) — Custo: $0
[ ] Integrar Pexels API (busca de imagens)
[ ] Integrar Google Fonts
[ ] Preview no browser (html-to-image ou CSS variables)

PRIORIDADE 3 (Semana 2) — Custo: $0
[ ] Motor de renderizacao server-side (Satori)
[ ] Exportacao PNG para Supabase Storage
[ ] Thumbnails automaticos

PRIORIDADE 4 (Mes 2) — Custo: $0
[ ] 20+ templates adicionais
[ ] IA sugere template baseado no nicho
[ ] Geracoes automaticas via design tokens
```

---

*Bryan Research — Head of Research & Market Intelligence*
*Data: 08/03/2026*
