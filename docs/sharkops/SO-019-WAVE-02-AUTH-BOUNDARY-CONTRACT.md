# SO-019 Wave 02 — Theory of Change → Auth Boundary Contract

## Classification

The Wave 01 baseline contained seven direct imports from `theory-of-change` to `auth`.

- Six already consume the client-safe/domain-safe public facade: `@/features/auth`.
- One server action consumed `auth-session` through a deep implementation path.

## Contract

- Cross-feature client/domain-safe Auth consumption uses `@/features/auth`.
- Cross-feature server-only session consumption uses `@/features/auth/server`.
- Deep imports below either entrypoint are forbidden.
- Auth remains feature-owned. This wave does not promote Auth to `shared`.

Only one runtime import changes. No visual behavior changes.
