# SO-018 Wave 01 — Design System & Token Governance Audit

## Mode
Audit-only. Zero runtime/style changes.

## Proven architecture

The repository currently has two token layers with different roles:

1. `src/shared/styles/tdm/tdm-tokens.sass` is the canonical runtime aggregator that publishes the `--tdm-*` language.
2. `src/shared/styles/tokens.sass` is a large Sass compatibility layer still consumed by 39 source files, primarily Canvas/sidebar/result styles.
3. `src/app/globals.sass` imports both layers.

This is not proof that the legacy layer may be deleted. It is proof that its authority is insufficiently bounded.

## Findings

- DS-001 HIGH — split-brain authority between canonical TDM tokens and the legacy compatibility layer.
- DS-002 MEDIUM — historical `$ds-*`, `$noir-*` and `$stage-*` nomenclature remains active inside the compatibility layer.
- DS-003 MEDIUM — raw values inside canonical token-definition modules are legitimate and must not be confused with component hardcodes.
- DS-004 PRESERVE — explicit Sass mixins are legitimate shared contracts and must not be flattened into global CSS.

## Smallest next bite

Wave 02 — Legacy Token Compatibility Boundary.

It must define executable rules for what `tokens.sass` may contain and how it may be consumed before any migration of the 39 consumers is attempted.
