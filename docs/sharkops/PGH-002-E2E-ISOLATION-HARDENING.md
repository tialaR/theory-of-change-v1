# PGH-002 — E2E Determinism & Isolation Hardening

## What was observed

The E2E files were individually healthy, but aggregate execution could change result according to order and worker topology. Controlled evidence showed that `public-routes.e2e.ts` could precede a Canvas failure when both shared one long-lived development server.

This is classified as **shared-server/order-sensitive test contamination**, not as a proven product runtime defect and not as a timeout-budget defect.

## Fast-track decision

For V1 release proof, each `*.e2e.ts` file now runs in its own Playwright invocation with:

- one fresh development server per file;
- `workers=1` per file;
- the same browser fallback strategy for full-suite and Canvas runners;
- server reuse disabled by default and available only through an explicit opt-in environment variable.

This makes the release proof deterministic at the E2E-file boundary without changing application behavior, increasing timeouts, or rewriting the tests.

## Why this is enough for V1

The release question is simple: can every critical E2E surface pass from a clean server state? The isolated harness answers that directly and removes the proven cross-file contamination dimension.

A deeper investigation into the internal state owner is optional post-V1 engineering work unless new production evidence appears.

## Regression protection

`check:tdm:release-e2e-harness` is already mandatory in SharkOps. It now fails if the full runner stops isolating files, drops `workers=1`, silently reuses a local server, or reintroduces divergent browser fallback behavior.
