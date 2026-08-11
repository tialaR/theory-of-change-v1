# SO-016 Wave 01 — Authentication & Protected Surface Audit

Status: ACTIVE and audit-only. Runtime behavior is intentionally unchanged.

## Verdict

Authentication is functional and both protected Canvas routes currently resolve a server-side session before exposing user-owned project data. No broad auth refactor is justified in Wave 01.

The audit did prove one high-severity architectural contradiction: `auth-server.repository.ts` bypasses the already-implemented HTTP repository and imports the MSW mock store directly, while the repository rules declare the MSW Node API boundary authoritative. That is the smallest evidence-backed next bite.

## Protected surface map

- `/login` delegates to the Auth feature facade and redirects authenticated users to a sanitized internal `returnTo`.
- `/canvas` reaches `requireAuthenticatedSession('/canvas')` through `getCurrentCanvasProject('/canvas')`.
- `/canvas/resultado` reaches `requireAuthenticatedSession('/canvas/resultado')` through `getCurrentCanvasProject('/canvas/resultado')`.
- `src/app/canvas/layout.tsx` does not own authentication. Protection is currently repeated at the feature-page boundary.
- Public routes remain outside the authentication wall and the Canvas Golden State remains untouched.

## Proven findings

### AUTH-001 HIGH — server repository bypass

`src/features/auth/server/auth-server.repository.ts` imports `authMockStore` directly. In parallel, the feature already owns `createHttpAuthRepository()`, typed HTTP contracts, MSW handlers, an MSW Node bootstrap, and tests proving the HTTP repository against those handlers. The server path therefore bypasses the architecture it claims to use.

### AUTH-002 MEDIUM — protection ownership fragility

The two existing Canvas routes are protected, but each feature page opts into protection separately. This is safe today and fragile for future child routes. Wave 01 freezes the current coverage before any ownership move is considered.

### AUTH-003 MEDIUM — returnTo self-target risk

`sanitizeReturnTo()` rejects external and protocol-relative destinations but accepts `/login`. Because an authenticated `AuthPage` redirects to the sanitized target, redirect policy deserves dedicated tests before behavioral changes.

### AUTH-004 MEDIUM — inconsistent auth facade consumption

Canvas has a mix of facade imports and deep imports into Auth domain/UI. This is real boundary debt, but broad cross-feature cleanup is intentionally deferred unless a smaller auth-specific requirement emerges. SO-019 remains the application-wide boundary initiative.

### AUTH-005 MEDIUM — gate coverage gap

The existing auth/MSW gate checks cookie policy and the presence of a server redirect, but it does not prove both protected Canvas routes and their exact `returnTo` contracts. Wave 01 adds that executable evidence.

## Wave 01 gate

`npm run check:tdm:auth-protected-surfaces:wave01` fails when:

- the audit artifacts disappear;
- SO-001 through SO-015 stop being COMPLETE;
- SO-016 is not ACTIVE at revision 1;
- Canvas Golden State is no longer preserved;
- `/canvas` or `/canvas/resultado` silently loses its current session requirement;
- `/login` stops delegating through the Auth facade;
- the proven AUTH-001 contradiction silently changes before its remediation wave;
- the canonical next bite is no longer Server Auth Repository Boundary without an explicit audit evolution.

## Next attack

SO-016 Wave 02 — Server Auth Repository Boundary.

Target only AUTH-001 first. No route-layout migration, no UI redesign, no cross-feature cleanup avalanche.
