# SO-017 Wave 02 — Shared UI Style Ownership Contract

## Proven correction

The anchored tooltip is live. It is consumed by the Canvas command dock, process dock, sidebar primitives, and its Sass surface is reused by edge marker previews. Therefore deletion is not authorized.

Wave 02 moves the reusable Sass mixin contract out of the shared UI component directory into `src/shared/styles/tdm`, keeps the tooltip component stylesheet as `.module.sass`, and removes feature imports of the internal `TdmButton` CSS Module.

No intended visual change.
