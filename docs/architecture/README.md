# Architecture Constitution

This directory records the architectural decisions of the Theory of Change project.

## Principles

1. Business rules belong to the domain.
2. External libraries are replaceable details.
3. UI projects the domain but does not define it.
4. Persistence preserves the domain and does not reconstruct it by inference.
5. Relevant architectural decisions precede structural changes.
6. Accepted ADRs are not silently rewritten.
7. A changed decision creates a new ADR that supersedes the previous one.
8. Executable architecture gates and repository state are the enforcement source for accepted decisions.

## ADR statuses

- Proposed
- Draft
- Accepted
- Deprecated
- Superseded
- Rejected

## Versioning

Editorial corrections may increment the patch version. Additive clarifications may increment the minor version. A decision change requires a new ADR.

## Current index

| ADR | Decision | Status | Version |
|---|---|---|---|
| ADR-001 | Logical Node Ordering | Accepted | 1.1.0 |
| ADR-002 | Canvas Architecture Boundaries | Superseded by ADR-008 | 0.1.0 |
| ADR-003 | Renderer-Agnostic Canvas | Superseded by ADR-008 | 0.1.0 |
| ADR-004 | Canvas Layout Engine | Superseded by ADR-008 | 0.1.0 |
| ADR-005 | Persistence Pipeline | Superseded by ADR-008 | 0.1.0 |
| ADR-006 | Application Layer Ownership | Accepted | repository-backed |
| ADR-007 | React Flow Isolation | Accepted | repository-backed |
| ADR-008 | Final Canvas Architecture Constitution | Accepted | 1.0.0 |

The current Canvas architecture source is ADR-008 together with the still-active ADR-001, ADR-006 and ADR-007 decisions and their executable gates.

## Historical architecture material

Historical migration documents remain useful evidence but are not current topology specifications unless an active ADR explicitly references them. In particular, `canvas-v4.md` is preserved as a migration-era record.

## Pre-change checklist

1. Which business rule changes?
2. Which layer owns it?
3. Is there an active ADR?
4. Is this domain or projection?
5. Does it couple the core to an external library?
6. Can the rule be tested without UI?
7. Which executable gate must change with the decision?
