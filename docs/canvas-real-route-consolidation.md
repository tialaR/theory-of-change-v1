# Canvas real route consolidation

## Canonical experience

The production canvas experience is served only at:

- `/canvas`

Route chain:

- `src/app/canvas/page.tsx`
- `src/features/theory-of-change/components/canvas/tdm-canvas.tsx`
- `src/features/theory-of-change/components/canvas/tdm-canvas-inner.tsx`

The visual work validated during the previous rounds is already applied to the components consumed by this route.

## Removed test route

The temporary visual laboratory was removed:

- `/canvas/resend-command-preview`
- `src/app/canvas/resend-command-preview/page.tsx`
- `src/app/canvas/resend-command-preview/resend-command-preview.module.sass`

## Preserved routes

These are functional/product routes and were intentionally preserved:

- `/canvas/resultado`
- `/exemplos`
- `/exemplos/canvas`
- `/exemplos/fluxo`
- `/exemplos/resultado`
- `/exemplos/resultado/interativo`
- `/exemplos/visao-do-fluxo`
- `/exemplos/visao-do-fluxo/interativo`
- `/guia-de-aprendizado`
- `/referencias`

## Guardrail for the next Cursor rounds

- Treat `/canvas` as the single canonical canvas route.
- Do not recreate visual-lab or preview routes under `/canvas`.
- Preserve React Flow behavior, stores, handlers, domain rules, drag and drop, keyboard shortcuts, node/edge logic, and animations unless a future task explicitly authorizes a functional change.
- Visual changes should target feature-scoped components and Sass Modules already consumed by `/canvas`.
