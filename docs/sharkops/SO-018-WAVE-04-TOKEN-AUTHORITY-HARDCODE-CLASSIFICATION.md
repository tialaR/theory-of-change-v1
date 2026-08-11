# SO-018 Wave 04 — Token Authority Hardcode Classification Contract

## Decision

Raw literals are legitimate token definitions only when they live inside `@mixin tokens` of a module explicitly aggregated by `src/shared/styles/tdm/tdm-tokens.sass`.

Directory location alone does not grant a waiver. Behavior mixins, CSS Modules, feature/app styles and `shared/styles/tokens.sass` remain outside canonical authority.

## Scope

Classification and executable governance only. No token values or visual styles changed.
