# SO-015 Wave 07 — Public Route Responsive & Motion Contracts

## Decision

Public routes keep their existing visual personality. Responsive and motion rules are formalized from repository evidence rather than normalized by force.

## Responsive contract

- Current public-layout, public-page and Guided Story breakpoints are preserved as evidence-backed behavior.
- A breakpoint becomes a shared token only when multiple surfaces prove the same semantic responsibility.
- A one-off breakpoint is not debt merely because it is unique.
- Responsive behavior must remain owned by the smallest coherent surface that needs it.

## Motion contract

- Shared public interaction motion uses canonical TDM motion transitions when semantics match.
- Storytelling/diagram motion may remain feature-owned when it is part of that experience's identity.
- Every animated public experience must honor `prefers-reduced-motion` / `useReducedMotion`.
- Reduced-motion support is a product behavior contract, not optional polish.

## Component responsibility parity

Shared and feature-owned components follow the same engineering rules. Feature scope is not an exemption for God Components or God Logic. Line count alone never triggers decomposition; independent reasons to change do.

## SharkOps enforcement

This wave introduces `check:tdm:public-routes:active` and makes it mandatory in SharkOps pre-commit and pre-push profiles. Future SO-015 waves must advance that active gate instead of bypassing prior decisions.

No application runtime or visual behavior is changed by this wave.
