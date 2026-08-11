# SO-020 Wave 02 — Runtime Environment Boundary Contract

## Classification

Three environment reads are legitimate, but only at explicit runtime adapters:

- Auth server runtime: `NODE_ENV` controls the secure session-cookie flag.
- Theory of Change runtime diagnostics: `NODE_ENV` suppresses diagnostic logging in production.
- Next instrumentation bootstrap: `NEXT_RUNTIME` prevents Node-only MSW server startup outside the Node runtime.

## Remediation

The Theory of Change domain no longer reads `process.env`. The legacy-marker diagnostic effect is feature-owned under `runtime/` while the validation rule remains pure in `domain/`.

## Gate

- exact authorized env-read files are frozen;
- domain directories cannot read `process.env`;
- no broad config service or shared extraction is authorized.
