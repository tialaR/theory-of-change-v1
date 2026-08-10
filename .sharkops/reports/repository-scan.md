# SharkOps Repository Scan

Generated: 2026-07-31T02:38:47.471Z
Branch: feat/sharkops
Commit: 8314491

## Executive result

5 client-gate attention point(s) detected and classified as non-blocking during bootstrap recovery.

## Gate classification

### TDM Contract V3

- Script: `check:tdm:v3:quick`
- Result: **ATTENTION**

```text
> tdm-flow-builder@1.0.0 check:tdm:v3:quick
> node scripts/tdm-contract-v3/check.mjs --mode=quick
```

### React Flow

- Script: `check:tdm:react-flow`
- Result: **ATTENTION**

```text
> tdm-flow-builder@1.0.0 check:tdm:react-flow
> node scripts/tdm-contract-v3/check-react-flow.mjs
```

### Ownership

- Script: `check:tdm:ownership`
- Result: **ATTENTION**

```text
> tdm-flow-builder@1.0.0 check:tdm:ownership
> node scripts/tdm-contract-v3/check-ownership.mjs
```

### i18n and routes

- Script: `check:tdm:i18n-routes`
- Result: **ATTENTION**

```text
> tdm-flow-builder@1.0.0 check:tdm:i18n-routes
> node scripts/tdm-contract-v3/check-i18n-routes.mjs
```

### Canvas continuity

- Script: `check:tdm:canvas-continuity`
- Result: **ATTENTION**

```text
> tdm-flow-builder@1.0.0 check:tdm:canvas-continuity
> node scripts/tdm-contract-v3/check-canvas-continuity.mjs
```

## Working tree

```text
M .sharkops/bites/so-001-black-box/README.md
 M .sharkops/policy/gates.json
 M .sharkops/state/known-debts.json
 M next-env.d.ts
 M package.json
?? .patch-backups/
?? .shark/
?? .sharkops/policy/principles.json
?? .sharkops/reports/
?? docs/sharkops/ATTENTION-POINTS.md
?? docs/sharkops/MANIFESTO.md
?? docs/sharkops/adr/ADR-0002-opinionated-governance.md
?? playwright-report/
?? scripts/tdm-contract-v3/check-canvas-stability-wave03.mjs
?? test-results/
?? tools/sharkops/principles.mjs
?? tools/sharkops/scan.mjs
?? tools/sharkops/so-001-cycle.mjs
```

## Product decision

These findings do not automatically block SharkOps.

They remain visible until a future bite repairs, reclassifies or retires them.

## Recommended next attacks

1. Repository intelligence and automatic ownership mapping.
2. Attack planner with priority and risk scoring.
3. Automated repair recipes for recognized architecture violations.
