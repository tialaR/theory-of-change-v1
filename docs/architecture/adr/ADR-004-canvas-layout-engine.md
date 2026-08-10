# ADR-004: Canvas Layout Engine

- **Status:** Superseded
- **Version:** 0.1.0
- **Date:** 2026-07-28
- **Authors:** Tiala Rocha, Architecture Copilot
- **Supersedes:** None
- **Superseded by:** ADR-008

## Proposed decision

Separate spatial organization into pure responsibilities:

```text
Logical ordering -> Stage grouping -> Ranking -> Distribution -> Positioning -> Alignment
```

Layout does not persist state, own history, depend on the renderer or create business rules.
