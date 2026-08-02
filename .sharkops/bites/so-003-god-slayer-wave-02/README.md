# SO-003 | God Slayer Wave 02

Extrai as interações de fluxo do orquestrador principal do Canvas e elimina warnings de dependências nos callbacks de relações.

## Escopo

- mover pane, seleção, conexão, drag e organização para `use-canvas-workspace-flow-actions.ts`;
- reduzir `use-canvas-workspace-controller.ts` para no máximo 240 linhas;
- usar `relationNoticeValues` memoizado nas dependências dos callbacks;
- preservar comportamento, visual, IDs, autosave e React Flow.

## Prova

- `npm run check:tdm:god-slayer:wave02`
- `npm run typecheck`
- `npm run lint:canvas -- --max-warnings=0`
- `npm run test:unit`
- `npm run test:e2e:canvas`
