# TDM Current UI Inventory v1

Inventário gerado na auditoria do contrato de header público (PROMPT-CURSOR-AUDIT-CONTRACT-HEADER-V1). Somente rotas e superfícies públicas; canvas permanece denylist.

## Legenda de status

- **CANÔNICO** — fonte ativa da família
- **CANÔNICO LOCAL** — canônico em escopo de uma rota/feature
- **EM MIGRAÇÃO** — API ainda exportada, runtime já em outro primitive
- **LEGADO ATIVO** — ainda montado (fora do escopo desta rodada quando canvas)
- **LEGADO SEM CONSUMIDOR** — código morto
- **LABORATÓRIO** — preview/lab
- **DUPLICADO** — reexport ou token paralelo
- **INDETERMINADO** — falta evidência

---

## Rotas públicas

| Rota | Componente visível | Layout / wrapper | Primitive de ação | Tokens | Motion | Status | Dívida | Evidência de runtime | Próxima ação |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | `HomePage` | `PublicShell` → `shellScroll` → `shellInner` full-width + `PublicHeader` sticky full-bleed + `sectionRhythm` | `PublicButton` primary/hero + text | `--tdm-public-action-*`, `--tdm-public-section-gap`, `--tdm-public-content-measure`, header scrolled literais V4 | `PublicReveal`, `HomeOnboardingPreview` → Guided Story | CANÔNICO | — | 1× `<header data-scrolled>` shell full-bleed; superfície no `<header>`; `.headerShell` só mede conteúdo; ritmo 2026-07-22; full-bleed 2026-07-22 | Manter |
| `/guia-de-aprendizado` | `GuideExperiencePage` | idem + `tone="silver"` + `headerContentGap` (sem `sectionRhythm`) | header `textCompact` | `--tdm-public-header-content-gap` | `PublicReveal`, rail scroll | CANÔNICO | `GuidePage` órfão ainda exportado | Header único via `PublicHeader`; gap Y canônico 2026-07-22 | Remover `GuidePage` em rodada de higiene |
| `/exemplos` | `ExamplesPage` | `PublicShell` + `headerContentGap` + `sectionRhythm` + `PublicHeader` | `PublicButton` primary | `--tdm-public-header-content-gap`, `--tdm-public-section-gap` | `PublicReveal` | CANÔNICO | — | Intro prévia via `PublicSection` left-aligned; ritmo 2026-07-22 | Manter |
| `/exemplos/visao-do-fluxo` | `FlowPage` | idem + `headerContentGap` + `sectionRhythm` + `ExampleOverviewCard` + `DedicatedExamplePreview` | primary + text | `--tdm-public-preview-*`, gap, section-gap | `FlowDraftPreview` (preservado) | CANÔNICO | possível dupla superfície `TdmSurface`+frame | Frame canônico; painel e intro secundário como capítulos | Avaliar `TdmSurface` externo |
| `/exemplos/resultado` | `ResultPage` | idem + `headerContentGap` + `sectionRhythm` | primary + text + `exportCompact` | idem | `ResultDraftPreview` | CANÔNICO | idem superfície | Frame canônico; `resultChapter` agrupa painel+exports | Avaliar `TdmSurface` externo |
| `/exemplos/visao-do-fluxo/interativo` | `FlowVisionInteractiveWorkspace` | sem `PublicHeader` | canvas/result locals | canvas tokens | experience motion | CANÔNICO LOCAL | — | Header público oculto por rota | Fora desta rodada |
| `/exemplos/resultado/interativo` | `ResultExperience` | sem `PublicHeader` | result locals | canvas/result | experience motion | CANÔNICO LOCAL | — | Header público oculto | Fora desta rodada |
| `/referencias` | `ReferencesPage` | `PublicShell` + `headerContentGap` + `sectionRhythm` + `PublicHeader` | `PublicButton` primary | public action + gaps | `PublicReveal` | CANÔNICO | — | Header único; ritmo hero→biblioteca | Manter |
| `/exemplos/fluxo` | redirect | — | — | — | — | LEGADO ATIVO (alias) | alias de URL | Redirect | Manter até SEO limpo |

## Canvas (congelado)

| Rota | Status | Nota |
| --- | --- | --- |
| `/canvas`, `/exemplos/canvas`, `/canvas/resultado` | DENYLIST | Sem diff nesta rodada |
| `/canvas/resend-command-preview` | LABORATÓRIO | Fora do DS público |

---

## Famílias de UI

| Família | Componente | Path | Status | Consumidores ativos | Dívida |
| --- | --- | --- | --- | --- | --- |
| Header público full-bleed | `PublicHeader` | `src/shared/ui/lusion-resend-ds/lusion-resend-ds.tsx` + `.module.sass` | CANÔNICO | `public-pages.tsx`, `public-experience.tsx` | Sticky + scroller `[data-public-scroll]`; shell externo = superfície V4 full-bleed; container interno = `.headerShell`/`.headerBar` (medida preservada); scroll behavior inalterado; legado de superfície no interno removido (2026-07-22) |
| Footer público | `PublicFooter` | mesmo módulo + copyright V1 | CANÔNICO | todas as rotas com `PublicShell` editorial | Faixa copyright 2026-07-22; ano dinâmico |
| Gap header→conteúdo | `PublicShell headerContentGap` + `--tdm-public-header-content-gap` | `_tdm-public-action.sass` + `.shellInner_headerContentGap` | CANÔNICO | 5 rotas secundárias (não Home) | Homologado 2026-07-22; contrato `TDM-PUBLIC-PAGE-HEADER-GAP-V1` |
| Ritmo entre seções | `PublicShell sectionRhythm` + `--tdm-public-section-gap` + `data-public-chapter` | `_tdm-public-action.sass` + `.shellInner_sectionRhythm` | CANÔNICO | `/`, `/exemplos`, fluxo, resultado, `/referencias` | Homologado 2026-07-22; contrato `TDM-PUBLIC-SECTION-RHYTHM-V1`; guia fora |
| Intro secundário Exemplos | `ExamplePreviewsSection` → `PublicSection` | `example-previews-section.tsx` + `lusion-resend-ds` | CANÔNICO | `/exemplos` | Left-aligned; mesma régua de fluxo; `TDM-EXAMPLES-SECONDARY-INTRO-V1` |
| Guided Story | `HomeOnboardingPreview` → `guided-story.tsx` | `public-pages/guided-story.tsx` + `guided-story-data.ts` + `guided-story-scheduler.ts` + `home-onboarding-preview.module.sass` | CANÔNICO | `HomePage` seção PRÉVIA GUIADA | Homologada 2026-07-22; preview `tdm-guided-story-v7-validated.html` |
| Header legado | `FloatingHeader` | `…/floating-header/floating-header.tsx` | LEGADO SEM CONSUMIDOR | nenhum | Remover em higiene |
| Header interactive órfão | `InteractivePage` topbar | `public-pages.tsx` | LEGADO SEM CONSUMIDOR | sem `page.tsx` | Remover export morto |
| Result chrome | `ResultHeader` | `result-view/result-header` | CANÔNICO LOCAL | experiences interativas | Fora do header público |
| Ação pública | `PublicButton` | `src/shared/ui/public-button/**` | CANÔNICO | páginas públicas, overview card, header CTA | — |
| Icon button público | `PublicIconButton` | `src/shared/ui/public-icon-button/**` | CANÔNICO | só `InteractivePage` (órfão) | Sem consumidor em rota viva |
| Label contextual | `TdmKicker` + icons | `src/shared/ui/tdm-kicker/**`, `tdm-context-label-icons` | CANÔNICO | páginas públicas | — |
| Label wrapper | `TdmContextLabel` | `tdm-context-label.tsx` | EM MIGRAÇÃO | nenhum JSX direto | Deprecar |
| Card público | `TdmPublicFeatureCard` | `tdm-public-feature-card/**` | CANÔNICO | home, exemplos, refs | — |
| Overview | `ExampleOverviewCard` | `example-overview-card/**` | CANÔNICO LOCAL | fluxo/resultado | Gradiente local |
| Preview frame | `ExamplePreviewFrame` | `example-previews/example-preview-frame.*` | CANÔNICO | `DedicatedExamplePreview` | — |
| Preview motion | `FlowDraftPreview` / `ResultDraftPreview` / `ResendDraftPreview` | `example-previews/*` | CANÔNICO | dedicated sections | Não alterar motion |
| Canvas button | `TdmButton` / `TdmIconButton` | `shared/ui/tdm-*` | LEGADO ATIVO | canvas denylist | Não migrar nesta rodada |

---

## Tokens

| Camada | Fonte | Status |
| --- | --- | --- |
| Reference | `_tdm-color/spacing/radius/font/motion.sass` | CANÔNICO |
| System | `_tdm-surface/foreground/border/shadow/focus…` | CANÔNICO |
| Component (public) | `_tdm-public-action.sass` (`--tdm-public-header-shell-*`, `--tdm-public-header-content-gap`, `--tdm-public-section-gap`, action, icon, preview) | CANÔNICO |
| Legacy Sass `$` | `src/shared/styles/_tokens.sass` | LEGADO ATIVO (canvas) |

Header scrolled full-bleed (V4, 2026-07-22) usa literais no shell externo `<header>`: `rgba(7, 8, 9, 0.76)`, `blur(1.25rem) saturate(120%)`, `border-bottom: 0.0625rem solid rgba(255,255,255,0.05)`, sem radius/sombra. Tokens `--tdm-public-header-shell-*` em `_tdm-public-action.sass` alinham padding/medida; a superfície ativa NÃO fica em `.headerShell`. Contrato: `TDM-PUBLIC-HEADER-FULL-BLEED-V4.md`.

---

## Motion por rota (resumo)

| Rota | Motion | Status |
| --- | --- | --- |
| Global | `TdmMotionProvider` | CANÔNICO |
| `/` | reveal + brand hero breath + Guided Story (7 capítulos) | CANÔNICO LOCAL no hero; story CANÔNICO 2026-07-22 |
| Guia | reveal + timeline rail | CANÔNICO |
| Fluxo/Resultado editoriais | draft previews no frame | CANÔNICO — não recriar |
| Header | transição 0.16s / easing contrato em shell | CANÔNICO |

---

## CSS morto / concorrência (header)

| Item | Status | Nota |
| --- | --- | --- |
| `public-pages.module.sass` header rules | ausente | Sem override de header |
| `body:has([data-public-page])` + `body.public-page-scroll` | ajustado | `overflow: hidden` no body; scroll em `[data-public-scroll]` |
| `.shell overflow-x: hidden` (antigo) | removido | Ancestral com overflow anulava `backdrop-filter` no header fixed |
| `FloatingHeader` Sass | LEGADO SEM CONSUMIDOR | — |
| Selectors gallery/resultContext em `public-pages.module.sass` | CSS morto | Higiene futura |

---

## Evidência do bug do header (Fase 2) e correção (Fase 3)

### Causa raiz

1. Header `position: fixed` era descendente de ancestrais com overflow efetivo (`body` com `overflow-y: auto` ⇒ `overflow-x` computado `auto`, e `.shell { overflow-x: hidden }`).
2. Em Chromium, isso faz `backdrop-filter` colapsar (`none` / `blur(0)`).
3. Sem blur, `rgba(7,7,8,0.88)` sobre `#050506` fica quase invisível → carcaça “fraca”, hero legível através do shell, superfície ≠ preview.

### Correção

- `PublicShell` expoe scroller `[data-public-scroll]` com `overflow-y: auto`.
- `PublicHeader` passa a `position: sticky` **dentro** desse scroller (padrão em que o blur amostra o conteúdo).
- Um sentinel + um `IntersectionObserver` com `root` = scroller.
- Estado scrolled com literais do contrato; sem `opacity` no header inteiro; hero `z-index: 0`; header `z-index: 80`.
- `FloatingHeader` permanece sem import (legado sem consumidor) — não escondido por CSS.

### Runtime pós-correção (`/`)

| Medida | Topo | Scrolled |
| --- | --- | --- |
| `<header>` count | 1 | 1 |
| sentinel | 1 | 1 |
| `data-scrolled` | `false` | `true` |
| background | transparente | `rgba(7, 8, 9, 0.76)` |
| border | transparente | bottom only `0.0625rem solid rgba(255,255,255,0.05)` |
| radius | `0` | `0` |
| backdrop-filter | `none` | `blur(1.25rem) saturate(120%)` |
| header opacity | `1` | `1` |
| z-index | `80` | `80` |

Screenshots: `docs/design-system/previews/screenshots/audit-home-header-top.png`, `audit-home-header-scrolled.png`.

### Full-bleed V4 (2026-07-22)

| Camada | Responsabilidade | Status |
| --- | --- | --- |
| `<header class=header data-scrolled>` | sticky, bg, blur, border-bottom, z-index 80, `inset-inline:0` / `width:100%` | CANÔNICO |
| `.headerShell` | medida `--tdm-public-content-measure`, padding shell, sem superfície | CANÔNICO |
| `.headerBar` | logo / nav / CTA (geometria congelada) | CANÔNICO |
| Superfície legada em `.headerShell[data-scrolled]` | removida | — |
| Artefato overscroll | hero (`logo-premium-vortex` / H1 shine) via faixas transparentes do header inset | corrigido pela origem (pintura full-bleed no shell) |

Screenshots V4: `docs/design-system/previews/screenshots/header-fullbleed-v4/`.

---

## Gate config

`scripts/tdm-ds-contract.config.mjs` preenchido com:

- header canônico + Sass module
- legado: `floating-header.tsx`
- `PublicButton`, `PublicIconButton`, `ExamplePreviewFrame`

---

## Próximas ações (fora desta rodada)

1. Remover exports mortos (`GuidePage`, `InteractivePage`, `FloatingHeader`, `PublicCard`).
2. Resolver dupla superfície preview (`TdmSurface` + `ExamplePreviewFrame`).
3. Consumir `PublicIconButton` em rota viva ou documentar como lab-only.
4. Atualizar menções a `TdmContextLabel` nos contratos para `TdmKicker`.
5. Dívida Guided Story: validação visual humana desktop/mobile dos 7 capítulos após deploy local.
6. Em Sass, `saturate()` no `backdrop-filter` precisa de interpolação (`#{"…"}`); sem isso o compilador remove a declaração.
