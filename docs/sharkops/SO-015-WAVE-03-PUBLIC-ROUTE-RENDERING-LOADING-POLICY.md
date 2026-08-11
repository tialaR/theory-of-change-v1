# SO-015 Wave 03 — Public Route Rendering & Loading Policy

## Decision
Public content routes that do not consume request-time data must not opt into dynamic rendering merely to display an artificial loading state.

The five audited content routes now render normally without `force-dynamic`, async page wrappers, or the 900ms simulated server delay. Existing `loading.tsx` boundaries remain in place because they are legitimate route infrastructure and can activate naturally when future route work actually suspends.

## Boundaries
This wave does not alter Canvas, Canvas Result, Login, Canvas Legacy, visual design, animation timing inside page experiences, or the public Design System language.

## Design-system follow-up
Public routes are an independent source of visual truth. Their containers, typography, spacing, motion, SVG behavior, header behavior and reusable surfaces will be inventoried in the next wave before any token/component extraction is proposed.
