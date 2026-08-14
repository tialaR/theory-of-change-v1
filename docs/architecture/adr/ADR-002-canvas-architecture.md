# ADR-002: Canvas Architecture Boundaries

- **Status:** Superseded
- **Version:** 0.1.0
- **Date:** 2026-07-28
- **Authors:** Tiala Rocha, Architecture Copilot
- **Supersedes:** None
- **Superseded by:** ADR-008

## Proposed decision

Adopt explicit dependency boundaries:

```text
Domain <- Application <- Adapters <- Infrastructure and UI
```

Business rules must not be distributed across hooks, components or infrastructure.

## Forbidden dependencies

- Domain to React
- Domain to React Flow
- Domain to HTTP or MSW
- Application to UI components
- Business use cases inside visual hooks
