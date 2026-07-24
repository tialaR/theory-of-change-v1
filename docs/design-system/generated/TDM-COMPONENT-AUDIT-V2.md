# TDM Component Audit V2

Snapshot auditado: Archive.zip enviado em 22/07/2026. Escopo: rotas fora de `/canvas`.

## Resumo

- **files**: 258
- **components**: 96
- **clientComponents**: 70
- **critical**: 25
- **attention**: 101
- **protectedVisualFiles**: 18
- **hardcodedColors**: 1409
- **important**: 30
- **ternaries**: 1117
- **nestedTernaries**: 81
- **staticInlineStyles**: 117
- **tokens**: 417
- **duplicateTokenNames**: 1
- **duplicateFamilies**: 8
- **routes**: 9
- **routesWithoutLoading**: 9
- **routesWithoutError**: 9

## Rotas

| Rota | Componentes | Client | Libs pesadas | Loading | Error |
|---|---:|---:|---|---|---|
| `/` | 22 | 13 | motion, @xyflow/react | não | não |
| `/guia-de-aprendizado` | 9 | 4 | motion | não | não |
| `/exemplos` | 22 | 13 | motion, @xyflow/react | não | não |
| `/exemplos/fluxo` | 1 | 0 | nenhuma | não | não |
| `/exemplos/visao-do-fluxo` | 22 | 13 | motion, @xyflow/react | não | não |
| `/exemplos/visao-do-fluxo/interativo` | 24 | 20 | @xyflow/react, motion, docx, @react-pdf/renderer, html-to-image | não | não |
| `/exemplos/resultado` | 22 | 13 | motion, @xyflow/react | não | não |
| `/exemplos/resultado/interativo` | 25 | 21 | @xyflow/react, motion, docx, @react-pdf/renderer, html-to-image | não | não |
| `/referencias` | 22 | 13 | motion, @xyflow/react | não | não |

## Hotspots

- **CRITICAL** `src/features/theory-of-change/components/result-view/result-view.tsx`: 1388 linhas, 30 hooks, 4 states, 11 callbacks, 13 cores, 0 !important.
- **CRITICAL** `src/features/theory-of-change/components/result-view/result-experience.tsx`: 975 linhas, 38 hooks, 3 states, 23 callbacks, 0 cores, 0 !important.
- **CRITICAL** `src/features/theory-of-change/components/result-view/experience/flow-vision-interactive-workspace.tsx`: 845 linhas, 37 hooks, 2 states, 22 callbacks, 0 cores, 0 !important.
- **CRITICAL** `src/features/theory-of-change/components/public-pages/guided-story.tsx`: 835 linhas, 17 hooks, 4 states, 5 callbacks, 0 cores, 0 !important.
- **CRITICAL** `src/features/theory-of-change/components/public-pages/public-pages.tsx`: 526 linhas, 3 hooks, 1 states, 0 callbacks, 0 cores, 0 !important.
- **CRITICAL** `src/features/theory-of-change/components/result-view/experience/result-diagram.tsx`: 425 linhas, 7 hooks, 0 states, 3 callbacks, 2 cores, 0 !important.
- **CRITICAL** `src/shared/ui/lusion-resend-ds/lusion-resend-ds.tsx`: 422 linhas, 3 hooks, 1 states, 0 callbacks, 0 cores, 0 !important.
- **CRITICAL** `src/components/ColorBends/ColorBends.tsx`: 373 linhas, 3 hooks, 0 states, 0 callbacks, 3 cores, 0 !important.
- **CRITICAL** `src/features/theory-of-change/components/result-view/result-theory-translator/result-theory-translator-pane.tsx`: 369 linhas, 6 hooks, 2 states, 0 callbacks, 0 cores, 0 !important.
- **CRITICAL** `src/features/theory-of-change/components/resend-public/public-experience.tsx`: 360 linhas, 2 hooks, 1 states, 0 callbacks, 18 cores, 0 !important.
- **CRITICAL** `src/shared/ui/tooltip/tdm-anchored-tooltip.tsx`: 356 linhas, 11 hooks, 2 states, 7 callbacks, 0 cores, 0 !important.
- **CRITICAL** `src/features/theory-of-change/components/stage-crystal-icon/tdm-stage-crystal-icon.tsx`: 354 linhas, 1 hooks, 1 states, 0 callbacks, 4 cores, 0 !important.
- **ATTENTION** `src/features/theory-of-change/components/result-view/tdm-glass-surface.tsx`: 286 linhas, 6 hooks, 1 states, 2 callbacks, 3 cores, 0 !important.
- **ATTENTION** `src/features/theory-of-change/components/result-view/liquid-glass/glass-surface.tsx`: 282 linhas, 6 hooks, 2 states, 0 callbacks, 3 cores, 0 !important.
- **GOOD** `src/shared/ui/tdm-button/tdm-button.tsx`: 258 linhas, 0 hooks, 0 states, 0 callbacks, 0 cores, 0 !important.
- **ATTENTION** `src/features/theory-of-change/components/resend-public/example-previews/resend-draft-preview.tsx`: 241 linhas, 0 hooks, 0 states, 0 callbacks, 5 cores, 0 !important.
- **ATTENTION** `src/features/theory-of-change/components/public-pages/theory-flow-board.tsx`: 220 linhas, 4 hooks, 0 states, 0 callbacks, 1 cores, 0 !important.
- **ATTENTION** `src/shared/ui/public-button/public-button.tsx`: 218 linhas, 0 hooks, 0 states, 0 callbacks, 0 cores, 0 !important.
- **GOOD** `src/features/theory-of-change/components/form-field/tdm-form-field.tsx`: 214 linhas, 0 hooks, 0 states, 0 callbacks, 0 cores, 0 !important.
- **ATTENTION** `src/features/theory-of-change/components/resend-public/example-previews/flow-draft-preview.tsx`: 210 linhas, 0 hooks, 0 states, 0 callbacks, 5 cores, 0 !important.

## Famílias paralelas

### card (11)
Canônico registrado: a decidir
- `src/features/theory-of-change/components/example-overview-card/example-overview-card.tsx`
- `src/features/theory-of-change/components/public-pages/guided-story.tsx`
- `src/features/theory-of-change/components/public-pages/theory-flow-board.tsx`
- `src/features/theory-of-change/components/resend-public/example-previews/example-previews-section.tsx`
- `src/features/theory-of-change/components/resend-public/guide-stage-card/guide-stage-card.tsx`
- `src/features/theory-of-change/components/result-view/experience/flow-vision-diagram.tsx`
- `src/features/theory-of-change/components/result-view/experience/result-diagram.tsx`
- `src/features/theory-of-change/components/result-view/experience/result-report-section.tsx`
- `src/features/theory-of-change/components/result-view/result-connections-layer/result-connections-layer.tsx`
- `src/features/theory-of-change/components/result-view/result-diagram/result-diagram.tsx`
- `src/shared/ui/tdm-public-feature-card/tdm-public-feature-card.tsx`
### iconButton (10)
Canônico registrado: `src/shared/ui/tdm-icon-button/tdm-icon-button.tsx`
- `src/features/theory-of-change/components/floating-header/floating-header.tsx`
- `src/features/theory-of-change/components/form-field/tdm-form-field.tsx`
- `src/features/theory-of-change/components/public-pages/public-pages.tsx`
- `src/features/theory-of-change/components/result-view/result-header/result-header.tsx`
- `src/features/theory-of-change/components/result-view/result-theory-translator/result-theory-translator-export-menu.tsx`
- `src/features/theory-of-change/components/result-view/result-theory-translator/result-theory-translator-header.tsx`
- `src/features/theory-of-change/components/result-view/result-theory-translator/result-theory-translator-pane.tsx`
- `src/features/theory-of-change/components/result-view/result-toolbar/result-toolbar.tsx`
- `src/shared/ui/public-icon-button/public-icon-button.tsx`
- `src/shared/ui/tdm-icon-button/tdm-icon-button.tsx`
### surface (10)
Canônico registrado: `src/shared/ui/tdm-surface/tdm-surface.tsx`
- `src/features/theory-of-change/components/resend-public/example-previews/resend-draft-preview.tsx`
- `src/features/theory-of-change/components/result-view/liquid-glass/glass-surface.tsx`
- `src/features/theory-of-change/components/result-view/liquid-glass/resource-card.tsx`
- `src/features/theory-of-change/components/result-view/liquid-glass/resources-panel.tsx`
- `src/features/theory-of-change/components/result-view/liquid-glass/result-liquid-card.tsx`
- `src/features/theory-of-change/components/result-view/liquid-glass/result-liquid-column.tsx`
- `src/features/theory-of-change/components/result-view/result-view-flow-inspector.tsx`
- `src/features/theory-of-change/components/result-view/result-view.tsx`
- `src/features/theory-of-change/components/result-view/tdm-glass-surface.tsx`
- `src/shared/ui/tdm-surface/tdm-surface.tsx`
### header (9)
Canônico registrado: a decidir
- `src/features/theory-of-change/components/public-pages/home-brand-logo/home-brand-logo.tsx`
- `src/features/theory-of-change/components/result-view/experience/flow-vision-interactive-workspace.tsx`
- `src/features/theory-of-change/components/result-view/experience/flow-vision-node-card.tsx`
- `src/features/theory-of-change/components/result-view/experience/interactive-experience-shell.tsx`
- `src/features/theory-of-change/components/result-view/result-experience.tsx`
- `src/features/theory-of-change/components/result-view/result-node-card/result-node-card.tsx`
- `src/features/theory-of-change/components/result-view/result-stage-column/result-stage-column.tsx`
- `src/features/theory-of-change/components/result-view/result-theory-narrative/theory-narrative-document.tsx`
- `src/shared/ui/lusion-resend-ds/lusion-resend-ds.tsx`
### field (8)
Canônico registrado: `src/shared/ui/tdm-field/tdm-field.tsx`
- `src/app/exemplos/exemplos-client.tsx`
- `src/features/theory-of-change/components/resend-public/example-previews/flow-draft-preview.tsx`
- `src/features/theory-of-change/components/resend-public/public-experience.tsx`
- `src/features/theory-of-change/components/result-view/experience/result-experience-header.tsx`
- `src/features/theory-of-change/components/result-view/result-theory-narrative/figures/theory-flow-overview-figure.tsx`
- `src/features/theory-of-change/components/result-view/result-theory-narrative/figures/theory-resources-map-figure.tsx`
- `src/features/theory-of-change/components/stage-action-drag/stage-action-drag.tsx`
- `src/shared/ui/tdm-field/tdm-field.tsx`
### preview (8)
Canônico registrado: a decidir
- `src/features/theory-of-change/components/public-pages/home-onboarding-preview.tsx`
- `src/features/theory-of-change/components/resend-public/example-previews/dedicated-example-preview.tsx`
- `src/features/theory-of-change/components/resend-public/example-previews/editorial-preview-primitives.tsx`
- `src/features/theory-of-change/components/resend-public/example-previews/example-preview-frame.tsx`
- `src/features/theory-of-change/components/resend-public/example-previews/result-draft-preview.tsx`
- `src/features/theory-of-change/components/result-preview/tdm-result-preview.tsx`
- `src/features/theory-of-change/components/result-view/experience/result-interactive-preview.tsx`
- `src/features/theory-of-change/components/result-view/experience/result-stage-board.tsx`
### button (4)
Canônico registrado: `src/shared/ui/tdm-button/tdm-button.tsx`
- `src/features/theory-of-change/components/canvas-resultado/canvas-resultado-page.tsx`
- `src/features/theory-of-change/components/result-view/result-empty-state/result-empty-state.tsx`
- `src/shared/ui/public-button/public-button.tsx`
- `src/shared/ui/tdm-button/tdm-button.tsx`
### tooltip (2)
Canônico registrado: `src/shared/ui/tdm-tooltip/tdm-tooltip.tsx`
- `src/shared/ui/tdm-tooltip/tdm-tooltip.tsx`
- `src/shared/ui/tooltip/tdm-anchored-tooltip.tsx`

## Regra de leitura

O scanner usa heurísticas. Um agrupamento não autoriza exclusão. Ele exige decisão de canônico, especialização composta ou papel distinto documentado.
