# TDM Actions Hotfix V1.1

## Cause

The Actions Migration V1 correctly redirected `PublicButton` to the canonical `TdmButton`, but the canonical primitive still rendered the operational dark bordered recipe. That recipe is not the approved public CTA contract.

## Correction

- `TdmButton` now owns two explicit recipes:
  - `system`: existing operational recipe, unchanged;
  - `public`: approved non-canvas action contract.
- `PublicButton` remains only as a temporary compatibility adapter and always selects `recipe="public"`.
- The visual implementation remains in one primitive.
- Canvas behavior and styling are unchanged.

## Public contract restored

- primary CTA uses the approved light surface and dark text;
- textual CTA remains transparent;
- compact export action keeps its hairline treatment;
- hero sizing continues to use the approved public tokens;
- hover does not introduce the operational recessed/glass treatment.
