# SO-016 Wave 03 — Protected Route Ownership Contract

Status: ACTIVE. Runtime behavior is preserved while protection ownership moves to the application route entries.

## Proven problem

Wave 01 proved that `/canvas` and `/canvas/resultado` were protected only because each Canvas feature page opted into `getCurrentCanvasProject(returnTo)`, which itself called `requireAuthenticatedSession`. A future child route could therefore enter the protected surface without inheriting a clear route-entry contract.

## Decision

Authentication is now owned by each protected App Router entry with its exact return target:

- `/canvas` calls `requireAuthenticatedSession('/canvas')` before rendering the Canvas feature.
- `/canvas/resultado` calls `requireAuthenticatedSession('/canvas/resultado')` before rendering the result feature.
- The authenticated `AuthUser` is passed explicitly into the feature page.
- `getCurrentCanvasProject` now loads a project for an explicit `ownerId`; it no longer owns redirect/session policy.

This keeps route policy in `app/`, keeps project loading in the Canvas feature, preserves exact redirects, and avoids duplicate session lookups.

## Executable armor

`npm run check:tdm:auth-protected-surfaces:wave03` fails if either route loses its exact `requireAuthenticatedSession` contract, if Canvas feature pages regain route-auth ownership, or if the project loader imports the Auth session boundary again.

## Next attack

SO-016 Wave 04 — Redirect Policy Contract, targeting AUTH-003 with tests before sanitizer behavior changes.
