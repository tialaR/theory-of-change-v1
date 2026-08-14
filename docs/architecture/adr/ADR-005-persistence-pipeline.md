# ADR-005: Canvas Persistence Pipeline

- **Status:** Superseded
- **Version:** 0.1.0
- **Date:** 2026-07-28
- **Authors:** Tiala Rocha, Architecture Copilot
- **Supersedes:** None
- **Superseded by:** ADR-008

## Context

Current flow:

```text
Workspace -> Persistence Hook -> Save Queue -> Application Use Case -> Repository Port -> HTTP Repository
```

## Proposed decision

Preserve `CanvasProject` as the authoritative persistence unit.

The save queue coordinates concurrency and deduplication. Repositories abstract transport and storage. Infrastructure must not define or reconstruct business rules.
