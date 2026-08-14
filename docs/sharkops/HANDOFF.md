# POST-GOLDEN HARDENING — FAST TRACK TO DEPLOY

PGH-001 and PGH-002 are COMPLETE.

## Proven protections

- `validate:release` is fail-closed at pre-push under `post-golden-hardening`.
- Full release E2E no longer shares one long-lived dev server across E2E files.
- Every `*.e2e.ts` file runs in its own Playwright invocation with `workers=1` and a fresh owned server.
- Full and Canvas runners use the same executable-path browser fallback strategy.
- Existing Application and Canvas Golden States remain sealed.

## PGH-002 classification

Controlled audits proved order/shared-server sensitivity. All E2E files passed cold; the reverse shared-server sequence failed Canvas and Login, and pairwise evidence isolated `public-routes -> canvas` as a contamination path. No timeout increase was justified.

For V1, the contamination boundary is closed at the harness level. Deeper internal state-owner attribution is optional unless new product evidence appears.

## Fast-track order from here

1. `PGH-003+PGH-004` — repository/test artifact hygiene + offline build/font determinism.
2. `V1 QUALITY GATE` — lint, typecheck, contracts, unit/E2E, build, bundle evidence, accessibility/semantic review, essential performance/CWV readiness.
3. `REPOSITORY + PRODUCT DOCS` — documentation for any developer, non-technical contributor, recruiter, RH reviewer, and the product owner: product purpose, architecture in plain language, personas, use cases, flows/flowcharts, test map, setup, glossary and contribution path.
4. `RELEASE CANDIDATE` — Git/CI/repository readiness, production smoke and deploy checks.
5. `DEPLOY V1`.

Documentation must demonstrate robustness without requiring prior knowledge of the codebase or Theory of Change. A reader should understand what the product does, why the architecture exists, how the main journeys work, how quality is protected, and where to start contributing.

Canonical PGH-002 record: `docs/sharkops/PGH-002-E2E-ISOLATION-HARDENING.md`.

## PGH-003 + PGH-004 Fast-Track closeout

Repository hygiene and offline build determinism are now closed for V1: generated Playwright report folders are ignored and the root layout no longer depends on `next/font/google` network fetching. The next target is the unified V1 Quality, Accessibility, Performance & Deploy Readiness gate.
