# SO-015 Wave 08 — Public Error, Loading & Status Surface Contracts

## Decision

Public App Router boundaries own route-specific context and copy. Shared status primitives own status behavior, accessibility, retry/home actions, icons and visual treatment.

This split follows the same responsibility rules used across shared and feature-owned components: each piece has one reason to change. Route copy may evolve with the route; status behavior may evolve with the shared UI contract.

## Runtime-neutral cleanup

- non-Canvas error boundaries consume the canonical `TdmRouteErrorBoundaryProps` type instead of repeating Next error/reset shapes;
- loading boundaries continue using `TdmRouteLoading`;
- error boundaries continue using `TdmRouteError`;
- the application 404 continues using `TdmRouteNotFound`;
- no visual copy, behavior, style or Canvas surface changed.

## Gate

`check:tdm:public-routes:wave08` rejects:

- custom public route-state markup that bypasses the shared status surface;
- direct deep imports into status implementation files;
- repeated inline error boundary prop contracts;
- artificial latency in loading boundaries;
- feature/Canvas dependencies inside the shared status primitives;
- loss of client error boundaries or root 404 ownership.

The rolling `check:tdm:public-routes:active` gate now points to Wave 08 and remains mandatory in SharkOps pre-commit/pre-push.
