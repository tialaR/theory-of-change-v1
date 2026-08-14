# PGH-003 + PGH-004 Fast-Track Closeout

## What changed

- Playwright output folders are explicitly ignored by Git.
- The root layout no longer imports `next/font/google`.
- `--tdm-font-sans` now resolves to an offline system sans-serif stack, keeping the existing typography token contract without a build-time network dependency.

## Why

The V1 release gate must not dirty the repository with generated test reports, and a production build must not depend on reaching Google Fonts.

## Scope boundary

No product behavior, Canvas logic, auth behavior, route behavior, timeout, or E2E isolation policy is changed here.

## Next

Run the unified V1 Quality Gate: static checks, tests, build, E2E, bundle/performance evidence, accessibility/semantic review, and deploy readiness.
