# ADR-008: Final Canvas Architecture Constitution

- **Status:** Accepted
- **Version:** 1.0.0
- **Date:** 2026-08-07
- **Authors:** Tiala Rocha, Architecture Copilot
- **Supersedes:** ADR-002, ADR-003, ADR-004, ADR-005
- **Superseded by:** None
- **SharkOps evidence:** SO-010 through SO-014

## Context

ADR-002 through ADR-005 were created as draft target directions before the Shark Attack architecture program completed. Their intent was progressively implemented and refined by SO-010 Application Slayer, SO-011 React Flow Isolation, SO-012 Canvas Engine, SO-013 Infrastructure Cleanup and SO-014 Final Architecture Closeout.

The repository now has executable gates that prove the implemented architecture. This ADR records that repository-backed state as the current constitution rather than rewriting the historical draft decisions in place.

## Decision

The final Canvas architecture is organized around explicit owners:

```text
Domain
  ^
  |
Application <-> Engine facade
  ^
  |
UI / Server composition

React Flow = renderer adapter / visual boundary
Infrastructure = persistence and runtime adapters
```

The diagram is directional, not a claim that every layer imports every layer shown. Executable gates remain the authoritative dependency specification.

### Domain

Domain owns business concepts, causal rules and framework-neutral contracts. It must not depend on React, Next.js, React Flow, browser globals, HTTP/MSW or infrastructure.

### Application

Application owns framework-neutral use-case decisions and orchestration policies. It may consume Domain and the public Engine boundary, but must not depend on UI, React Flow, Server or Infrastructure implementations.

### Canvas Engine

Engine owns state kernel, commands, history, layout orchestration, persistence/selection/interaction boundaries and the public engine facade. Internal engine modules are not external public API.

### React Flow

React Flow is a renderer adapter and visual runtime. Concrete `@xyflow/react` APIs remain confined to the approved adapter/rendering surface defined by ADR-007 and its executable closeout gates.

### Infrastructure

Infrastructure owns transport/storage adapters and the neutral in-memory mock store. It may implement Domain/Application ports but must not become the owner of business rules or UI/runtime composition.

### Server

Server composes server-side application and infrastructure concerns. It must not import browser runtime, React Flow or MSW interception boundaries.

### UI

UI is the outer composition and presentation boundary. It may depend inward through approved contracts and adapters; business rules must not migrate back into components or hooks.

## Public API and contracts

Public Canvas entrypoints are explicit. Wildcard barrel expansion and new external deep-import seams are forbidden unless a future architectural decision updates the contract and its executable gate.

Canonical contracts have one owner. Compatibility aliases may remain only when proven live and explicitly protected; naming alone is not evidence of dead code.

## Persistence and layout

`CanvasProject` remains the authoritative project unit. Persistence preserves canonical project state and does not reconstruct business meaning from renderer state.

Logical ordering belongs to the domain. Layout is a projection policy and does not own persistence, history or business rules.

## Historical drafts

ADR-002, ADR-003, ADR-004 and ADR-005 are superseded by this ADR. They remain in the repository as historical context and must not be treated as the current architecture source.

`docs/architecture/canvas-v4.md` is also retained as a historical migration record, not as a description of the current route or folder topology.

## Executable enforcement

The constitution is protected cumulatively by:

- SO-010 Application Slayer closeout gates;
- SO-011 React Flow Isolation closeout gates;
- SO-012 Canvas Engine closeout gates;
- SO-013 Infrastructure Cleanup closeout gate;
- SO-014 final architecture Waves 01 onward;
- SharkOps state/ledger consistency.

A future decision that changes these boundaries must create a new ADR and update the executable gates in the same controlled bite.
