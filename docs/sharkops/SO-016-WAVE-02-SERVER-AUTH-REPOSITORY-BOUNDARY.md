# SO-016 Wave 02 — Server Auth Repository Boundary

## Target

Resolve `AUTH-001` only: the server Auth repository bypassed the declared HTTP/MSW infrastructure boundary by importing `auth.mock-store` directly.

## Change

- `createServerAuthRepository()` now composes the existing `createHttpAuthRepository()` with the canonical `TDM_MOCK_API_ORIGIN`.
- Server runtime code under `src/features/auth/server` may no longer access `auth.mock-store` directly.
- A focused repository test proves that the server factory composes the canonical HTTP repository with `TDM_MOCK_API_ORIGIN`; the existing Auth handler tests continue proving the HTTP repository lifecycle through MSW Node.
- Wave 01's audit gate is explicitly evolved so the historical finding remains required while its remediation is allowed only once SO-016 reaches revision 2+ and the audit records the resolution.

## Invariants preserved

- No Auth domain contract changed.
- No login, logout, avatar, cookie, redirect or Canvas UI behavior is intentionally changed.
- MSW remains the mock API authority in Node.
- Canvas Golden State remains `GOLDEN-STATE-v1`.
- No `.scss` files are introduced.

## Next

SO-016 Wave 03 — Protected Route Ownership Contract (`AUTH-002`).
