# ADR-003: Renderer-Agnostic Canvas

- **Status:** Superseded
- **Version:** 0.1.0
- **Date:** 2026-07-28
- **Authors:** Tiala Rocha, Architecture Copilot
- **Supersedes:** None
- **Superseded by:** ADR-008

## Proposed decision

`CanvasProject` is authoritative. Renderers are replaceable projections.

```text
CanvasProject -> Projection Adapter -> Renderer
```

Renderer events may alter the domain only through authorized application operations.
