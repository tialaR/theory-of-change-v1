# TDM Wave 07: Canvas continuity and autosave

## Scope

This release protects the Canvas after hydration and route re-entry without changing the homologated visual skin.

## Runtime decisions

- Persisted nodes and edges use collision-safe random identifiers checked against the hydrated graph.
- Automatic save runs 1200 ms after the last persisted mutation.
- Manual save remains available and uses the same serialized queue.
- Older save responses cannot overwrite newer Canvas content.
- Product navigation initiated inside Canvas waits for pending persistence.
- Pending changes are protected on visibility change, unmount, and browser exit.
- Persistence remains server-authoritative and isolated by owner ID and project ID.

## Naming and readability

- React components use PascalCase.
- Functions, variables, and hooks use camelCase.
- Files and folders use kebab-case.
- Underscore-prefixed Sass partials are retired.
- Names inherited from external visual references are removed from active code, scripts, and documentation.

## Internationalization

- Canvas, Auth, and shared route states accept no hardcoded user-facing copy.
- Existing public-route copy debt is recorded in a decreasing-only baseline.
- New hardcoded user-facing copy is blocked.

## Gates

- Canvas continuity and autosave contract.
- Architecture and naming contract.
- i18n copy contract.
- Existing React Flow, ownership, Auth/MSW, route-state, visual, type, lint, unit, build, and E2E gates.
