# SO-015 Wave 02 — Public Routes Boundary & Composition

Status: ACTIVE

## Decision

Public App Router pages must compose the Theory of Change feature through one explicit route-facing facade: `@/features/theory-of-change/public-routes`.

The route layer is allowed to know which public experience it wants, but it must not know the internal file path that implements that experience.

## Runtime bite

Wave 02 is intentionally small and behavior-preserving:

- adds `src/features/theory-of-change/public-routes.ts` as the deliberate route-facing public API;
- adds two feature-owned wrappers for the interactive example routes so `src/app` no longer assembles internal result-view/data dependencies itself;
- migrates `/`, `/exemplos`, `/exemplos/resultado`, `/exemplos/resultado/interativo`, `/exemplos/visao-do-fluxo`, `/exemplos/visao-do-fluxo/interativo`, `/guia-de-aprendizado` and `/referencias` to the facade;
- keeps existing `force-dynamic` and simulated delays unchanged for later rendering/loading policy audit;
- does not change `/canvas`, `/canvas/resultado`, `/login` or `/canvas-legado`.

## Invariants

- SO-001 through SO-014 remain COMPLETE.
- `GOLDEN-STATE-v1` remains COMPLETE.
- Canvas route imports remain owned by the sealed Canvas public boundary.
- Auth remains owned by `@/features/auth`.
- `/canvas-legado` remains explicitly legacy until a later lifecycle decision.
- public route composition must not deep-import Theory of Change implementation files.

## Gate

`npm run check:tdm:public-routes:wave02`

## Next

SO-015 Wave 03 — Public Route Rendering & Loading Policy.
