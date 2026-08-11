# SO-015 Wave 06 — Public Header, Navigation & Route Shell

## Decision

The public header is a shared Design System surface, but shared ownership does not exempt it from the same responsibility rules applied to feature-owned components.

The previous implementation mixed route visibility policy, active navigation policy, scroll observation, brand rendering, navigation rendering and CTA rendering in one component. The behavior was valid, but the ownership seams were implicit.

Wave 06 decomposes those responsibilities without changing visual output, route behavior or CSS contracts.

## Seams

- `public-header.tsx`: composition only.
- `public-header-policy.ts`: public route visibility and active navigation policy.
- `use-public-header-scrolled.ts`: scroll observation behavior.
- `public-header-brand.tsx`: brand rendering.
- `public-header-navigation.tsx`: navigation rendering.
- `public-header-cta.tsx`: CTA rendering.

## Universal component rule

Shared and feature-owned components obey the same engineering principles. A component being unique to one feature does not authorize God Component or God Logic behavior. Decomposition is based on responsibilities, coupling and reasons to change, never on an arbitrary line threshold.

## Runtime impact

Structural refactor only. No intended visual or behavioral change.
