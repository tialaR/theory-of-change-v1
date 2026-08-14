# ADR-007: React Flow Isolation

- Status: Accepted
- Date: 2026-08-06
- SharkOps bite: SO-011 React Flow Isolation

## Context

The official Theory of Change canvas uses React Flow as its rendering and interaction runtime. Before SO-011, concrete XYFlow types, hooks and provider APIs were visible across workspace hooks and command orchestration. That increased framework coupling and made canvas behavior harder to test or evolve independently from the renderer.

## Decision

React Flow is confined to explicit adapters and rendering boundaries.

The approved direct import surface is frozen to eight files:

1. `src/app/canvas/layout.tsx`
2. `canvas/react-flow/canvas-flow.types.ts`
3. `canvas/react-flow/canvas-flow-provider.tsx`
4. `canvas/react-flow/use-canvas-flow-state.ts`
5. `canvas/ui/components/canvas-connection-line.tsx`
6. `canvas/ui/components/canvas-causal-edge.tsx`
7. `canvas/ui/components/canvas-flow-surface.tsx`
8. `canvas/ui/components/canvas-stage-node.tsx`

Domain, Application, Infrastructure and Server must never import `@xyflow/react`. Workspace controllers and command hooks consume framework-neutral contracts for positions, connection candidates, viewport operations, drop conversion and flow state.

`use-canvas-flow-state.ts` owns the concrete runtime adaptation for state, viewport and screen-to-flow coordinate conversion. `canvas-flow-provider.tsx` owns provider composition. Rendering components may use XYFlow component contracts only at the visual boundary.

## Consequences

- React Flow remains the official renderer and is not replaced.
- Canvas business and application policies remain renderer-neutral.
- New direct XYFlow importers are forbidden unless a future ADR explicitly changes the boundary and updates the executable gate.
- Runtime movement between approved adapter files must update older wave gates rather than restoring concrete APIs to neutral consumers.
- SO-012 may evolve the Canvas Engine behind these ports without reopening renderer coupling.

## Executable enforcement

The decision is enforced by:

- `check:tdm:react-flow-isolation:wave01` through `wave08`;
- both Wave 08 compatibility hotfix gates;
- `check:tdm:react-flow-isolation:closeout`;
- SharkOps ledger and current-state consistency checks.
