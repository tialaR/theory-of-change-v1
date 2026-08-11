# SO-015 Wave 09 — Legacy Route & Public Exposure Decision

## Decision

`/canvas-legado` is retired.

## Evidence

A repository-wide search found no runtime link, navigation entry, test, application consumer or product dependency on `/canvas-legado`. The only live implementation was the App Router entrypoint itself, which rendered the legacy `TdmCanvas` facade. Remaining references are architecture contracts, migration history and SharkOps records.

The route existed under an explicit rule: keep it until an explicit deletion patch. Wave 09 is that patch.

## Executable rules

- `src/app/canvas-legado` must remain absent.
- Public navigation must not expose `/canvas-legado`.
- Reintroducing the route requires a new explicit SharkOps initiative and contract migration.
- Historical migration documentation is not rewritten to pretend the route never existed.
- `/canvas` and `/canvas/resultado` remain sealed by the Golden State.

## Runtime scope

This wave intentionally changes runtime exposure only by removing the obsolete `/canvas-legado` route. It does not alter current Canvas implementation, behavior, persistence, rendering or visuals.
