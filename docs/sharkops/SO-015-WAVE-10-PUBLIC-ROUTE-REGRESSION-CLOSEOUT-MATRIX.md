# SO-015 Wave 10 — Public Route Regression & Closeout Matrix

## Decision

SO-015 is not closed in this wave. The architecture work from Waves 01–09 is green and now has a canonical closeout matrix, but the public-route behavior layer still lacks an environment-safe dedicated E2E runner.

## Why this is a blocker

The repository-wide `test:e2e` command calls Playwright directly. On the current macOS ARM environment, Playwright's bundled Chromium is unavailable, while the Canvas E2E runner already demonstrates the correct repository pattern: preflight the bundled browser and fall back to system Chrome when available.

A tooling failure must not be called a product regression. The opposite is equally important: a tooling problem cannot be used as an excuse to close public routes without behavior coverage.

## Matrix contract

- Waves 01–10 and the rolling `public-routes:active` gate remain mandatory.
- SharkOps and the SO-014 Golden State remain mandatory.
- Sass policy, type generation, typecheck, unit tests and production build are registered as repository quality gates.
- Canvas E2E remains sealed by the Golden State.
- Public-route E2E is explicitly `HARNESS_GAP` and closeout-blocking until an environment-safe runner exists.
- `/canvas-legado` remains retired.

## Runtime impact

None. This wave changes governance, documentation and executable architecture checks only.

## Next

SO-015 Wave 11 — Public E2E Harness & Regression Armor.
