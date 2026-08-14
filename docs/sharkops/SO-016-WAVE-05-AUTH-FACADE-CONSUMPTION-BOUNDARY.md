# SO-016 Wave 05 — Auth Facade Consumption Boundary

## Proven problem

AUTH-004 showed inconsistent cross-feature consumption: some Canvas UI files used the Auth facade while `CanvasHeader` and `CanvasResultView` reached directly into Auth domain/UI internals.

## Decision

Use the existing `src/features/auth/index.ts` as the client-safe cross-feature facade for reusable Auth UI/types. Export `UserMenu` there alongside `AuthUser`. Do not re-export server session functions through this facade.

## Runtime scope

- export `UserMenu` from the Auth facade;
- migrate the two proven Canvas UI offenders to `@/features/auth`;
- no behavior or styling changes.

## Executable invariant

`check-auth-protected-surfaces-wave05.mjs` scans all Canvas UI TypeScript files and fails on direct imports from Auth domain/UI/application/infrastructure/server internals. It separately requires Canvas server code to keep the explicit server-only session entrypoint.

## Next

All findings from the Wave 01 audit are resolved. The next bite is a closeout re-audit, not another assumed refactor.
