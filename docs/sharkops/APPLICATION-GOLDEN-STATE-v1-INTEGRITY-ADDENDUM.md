# APPLICATION-GOLDEN-STATE-v1 Integrity Addendum — Auth RSC Boundary

## Why this exists

Manual pre-commit smoke testing exposed a false negative in the original application-wide regression composition: TypeScript, lint and unit tests were green while Turbopack rejected a server-only `next/headers` dependency that had leaked into a Client Component graph through the root Auth barrel.

## Root cause

`src/features/auth/index.ts` exported both client-safe symbols (`AuthUser`, `UserMenu`) and the server-rendered `AuthPage`. Client Canvas modules legitimately imported the root facade, which caused Turbopack to traverse `AuthPage -> auth-session -> next/headers` in the client graph.

## Integrity correction

- the Auth root facade is client/domain-safe only;
- `AuthPage` is exported from the explicit Auth server facade;
- `/login` consumes the server facade;
- `check:tdm:auth-rsc-boundary` makes the boundary executable;
- the application-wide regression contract now includes the RSC boundary gate and `next build`.

The sealed `APPLICATION-GOLDEN-STATE-v1.json` is not silently rewritten. This addendum strengthens the executable proof required to keep that seal trustworthy before the first repository commit.
