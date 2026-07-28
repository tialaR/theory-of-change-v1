# ADR-001: Logical Node Ordering

- **Status:** Accepted
- **Version:** 1.0.0
- **Date:** 2026-07-28
- **Authors:** Tiala Rocha, Architecture Copilot
- **Supersedes:** None
- **Superseded by:** None

## Context

The Canvas represents a Theory of Change through nodes distributed across stages. Current spatial organization derives node order from `position.y`.

Architectural audit confirmed that `CanvasProject` is the authoritative persisted state. React Flow is a visual projection and must not define business rules.

## Problem

The domain has no explicit logical ordering concept. Visual position currently substitutes for business order.

This creates coupling between business behavior and the renderer, makes drag and drop capable of changing logical meaning, and forces layout algorithms to infer intent from coordinates.

## Decision

Logical node ordering belongs to `CanvasProjectNode`.

Visual position must be derived from logical ordering through a spatial organization policy.

The target direction is:

```text
logical ordering
       ->
layout policy
       ->
visual position
       ->
renderer
```

Visual position must not remain the authoritative source used to reconstruct logical order.

## Architectural boundaries

### Domain

Owns logical ordering and cannot depend on React, React Flow, hooks, HTTP or MSW.

### Application

Applies creation, duplication, movement, deletion, compaction and history rules.

### Layout policy

Transforms logical state into coordinates and does not invent business rules.

### React Flow adapter

Projects `CanvasProject` to the renderer and translates authorized visual interactions.

### Persistence

Stores explicit logical ordering and never reconstructs it from coordinates.

## Business rules required before implementation

1. Where does a newly created node enter its stage?
2. Does duplication insert after the original or at the stage end?
3. When moving between stages, is order preserved or appended?
4. Are gaps compacted after deletion?
5. Do undo and redo restore ordering?
6. Is ordering global or per stage?
7. Are ties allowed?
8. How are projects migrated when they only contain `position.y`?

## Implementation strategy

1. Define the business rules.
2. Add domain tests.
3. Introduce ordering into the domain.
4. Update factories and fixtures.
5. Update the React Flow adapter.
6. Update persistence and contracts.
7. Add migration.
8. Update layout algorithms.
9. Remove inference based on `position.y`.
10. Add architectural gates.

## Validation

- Domain unit tests
- Adapter tests
- Persistence queue tests
- Migration tests
- Undo and redo tests
- Renderer-independent layout tests
- Visual regression tests
- Dependency boundary gate

## Non-goals

This ADR does not define viewport, zoom, selection, animation, spacing, renderer technology or the final ordering field shape.

## References

- `src/features/theory-of-change/canvas/domain/canvas-project.ts`
- `src/features/theory-of-change/canvas/application/canvas-layout.ts`
- `src/features/theory-of-change/canvas/react-flow/canvas-react-flow.adapter.ts`
- `src/features/theory-of-change/canvas/application/canvas-save-queue.ts`
