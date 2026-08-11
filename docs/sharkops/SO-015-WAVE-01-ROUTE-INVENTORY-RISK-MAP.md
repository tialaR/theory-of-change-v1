# SO-015 Wave 01 — Route Inventory & Risk Map

Status: ACTIVE and audit-only.

## Verdict

The application route layer is already thin. No broad refactor is justified in Wave 01. The route map contains 12 page entrypoints: 7 public/public-interactive content routes, 1 public auth route, 2 protected Canvas Golden-State routes, 1 home route and 1 legacy Canvas surface.

## Proven findings

- Five content routes are forced dynamic only to await `simulatePublicRouteDelay()`.
- Interactive example routes deep-import result-view implementations.
- `/guia-de-aprendizado` directly imports the public-experience implementation file instead of a deliberate route-facing facade.
- `/canvas-legado` remains executable and must not be removed until links, tests, consumers and product intent are audited.
- Public loading/error boundaries already converge on `TdmRouteLoading` and `TdmRouteError`; preserve before changing.
- The general Playwright harness is environment-sensitive on macOS ARM, while the official Canvas E2E runner already proves a system-Chrome fallback.
- `/canvas` and `/canvas/resultado` remain locked by GOLDEN-STATE-v1 and are not runtime refactor targets in SO-015.

## Wave 01 gate

`npm run check:tdm:public-routes:wave01` fails when:

- a page route appears/disappears without updating the canonical inventory;
- SO-015 is not ACTIVE at revision 1;
- SO-001 through SO-014 cease to be COMPLETE;
- Golden State is no longer preserved;
- the known high-risk legacy route silently disappears before a decision wave.

## Next attack

SO-015 Wave 02 — Public Routes Boundary & Composition.
