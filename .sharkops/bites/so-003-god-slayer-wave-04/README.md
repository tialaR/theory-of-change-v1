# SO-003 | God Slayer Wave 04

Conclui a desmontagem do workspace controller, preservando-o como uma facade fina sobre duas compositions especializadas.

## Escopo

- composition de estado, seleção, viewport, efeitos e persistência em `use-canvas-workspace-foundation.ts`;
- composition de DnD, nós, relações, histórico, navegação e fluxo em `use-canvas-workspace-actions.ts`;
- controller final com budget máximo de 80 linhas;
- atualização cumulativa dos gates das Waves 01 a 03;
- zero mudança visual ou de regra de negócio.

## Prova

- `npm run check:tdm:god-slayer:wave04`
- `npm run typecheck`
- `npm run lint:canvas -- --max-warnings=0`
- `npm run test:unit`
- `npm run test:e2e:canvas`
