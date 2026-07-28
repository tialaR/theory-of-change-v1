# ADR-001: Logical Node Ordering

- **Status:** Accepted
- **Version:** 1.1.0
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

Visual position is a projection of logical ordering through a spatial organization policy. React Flow coordinates are not authoritative business state.

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

## Canonical business rules

### 1. Ordering scope

Ordering is **independent inside each stage**.

A node's logical position is interpreted only among nodes that belong to the same stage. There is no single global sequence spanning all stages.

### 2. Canonical sequence

Each stage must expose one deterministic, gap-free sequence.

The canonical persisted state must not contain duplicate positions or gaps. The first position is zero and the sequence advances by one.

Example:

```text
0, 1, 2, 3
```

Persisted states such as `0, 2, 7` or `0, 1, 1` are invalid and must be normalized before persistence succeeds.

### 3. Node creation

A newly created node is appended to the end of its target stage.

Creation must not inspect React Flow coordinates to decide logical order.

### 4. Node duplication

A duplicated node is inserted immediately after its source node in the same stage.

All following nodes in that stage shift one position forward.

### 5. Reordering inside the same stage

Logical order changes only through an explicit reorder command accepted by the application layer.

Free visual dragging alone does not change logical order.

When a reorder command moves a node to a target index, the remaining nodes are shifted and the stage is normalized into a gap-free sequence.

### 6. Moving between stages

Moving a node to another stage removes it from the source sequence and inserts it into the target sequence.

Default behavior is to append it to the end of the target stage.

If an explicit target index is provided by an authorized application command, the node is inserted at that index and following nodes shift forward.

Both source and target stages are normalized after the operation.

### 7. Deletion

Deleting a node removes it from its stage and compacts all following positions.

Deletion must not leave gaps.

### 8. Undo and redo

Undo and redo restore the exact logical ordering captured by the corresponding domain snapshot.

History must not reconstruct order from current coordinates.

### 9. Ties and invalid values

Ties are not allowed in canonical persisted state.

Negative positions, non-integer positions, duplicate positions and gaps are invalid.

Normalization may repair transient application state before persistence, but domain operations should produce canonical state directly.

### 10. Migration of existing projects

Projects without explicit logical ordering are migrated once using the current visual order as historical evidence.

For each stage:

1. sort by `position.y` ascending;
2. use `position.x` ascending as the secondary key;
3. use node `id` ascending as the deterministic final tie-breaker;
4. assign canonical positions starting at zero.

After migration, coordinates must never again be used as the authoritative source for logical ordering.

### 11. Persistence

Persistence stores the explicit logical order that already exists in `CanvasProject`.

Repositories, save queues and transport adapters must not infer, repair or reinterpret business order from renderer state.

### 12. Layout

Layout consumes logical order and returns visual positions.

Layout may calculate spacing, alignment and coordinates, but it may not mutate logical order or invent domain semantics.

## Architectural boundaries

### Domain

Owns logical ordering invariants and cannot depend on React, React Flow, hooks, HTTP or MSW.

### Application

Owns creation, duplication, reorder, stage movement, deletion, compaction and history operations.

### Layout policy

Transforms canonical logical state into coordinates and does not invent business rules.

### React Flow adapter

Projects `CanvasProject` to the renderer and translates visual events into explicit application commands.

### Persistence

Stores explicit logical ordering and never reconstructs it from coordinates.

## Consequences

### Positive

- Business order becomes deterministic and renderer-independent.
- Creation, duplication, deletion and movement become testable without UI.
- React Flow can be upgraded or replaced without redefining the domain.
- Layout algorithms can evolve independently.
- Migration has a deterministic rule.

### Negative

- The persisted schema must evolve.
- Existing fixtures and factories must provide ordering.
- A migration path is required.
- Visual drag handlers must distinguish movement from business reordering.

### Risks

- Temporarily maintaining coordinates and logical order as competing authorities.
- Allowing adapters to bypass application commands.
- Normalizing invalid data too late and persisting ambiguous order.

## Implementation strategy

1. Add pure ordering value and invariant tests.
2. Add stage-scoped ordering operations.
3. Introduce ordering into `CanvasProjectNode`.
4. Update factories, fixtures and snapshots.
5. Add migration for projects without ordering.
6. Update repository contracts and save signatures.
7. Update the React Flow adapter.
8. Make layout consume logical order.
9. Remove ordering inference from `position.y`.
10. Add architecture and regression gates.

Each step must preserve green build, tests and visual behavior.

## Required test matrix

- create appends to stage end;
- duplicate inserts after source;
- same-stage reorder shifts neighbors;
- cross-stage move compacts source and target;
- delete compacts sequence;
- undo restores prior sequence;
- redo restores subsequent sequence;
- migration is deterministic;
- ties and gaps are rejected or normalized before persistence;
- layout does not mutate logical order;
- adapter does not infer order from coordinates.

## Non-goals

This ADR does not define viewport, zoom, selection, animation, node dimensions, visual spacing, renderer technology or the final property name used in TypeScript.

## References

- `src/features/theory-of-change/canvas/domain/canvas-project.ts`
- `src/features/theory-of-change/canvas/application/canvas-layout.ts`
- `src/features/theory-of-change/canvas/react-flow/canvas-react-flow.adapter.ts`
- `src/features/theory-of-change/canvas/application/canvas-save-queue.ts`
