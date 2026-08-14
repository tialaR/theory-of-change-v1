# SO-018 Wave 02 — Legacy Token Compatibility Boundary

## Decision

`src/shared/styles/tokens.sass` is a compatibility-only Sass layer, not a second Design System authority.

The canonical global token vocabulary remains `src/shared/styles/tdm/tdm-tokens.sass` and its `--tdm-*` modules.

## Executable invariants

- legacy consumer count may decrease but never exceed the audited baseline of 39;
- canonical `shared/styles/tdm/` modules may never depend on `tokens.sass`;
- `tokens.sass` may not emit `:root` or top-level CSS selectors;
- `$ds-*`, `$noir-*`, and `$stage-*` definition counts may shrink but never expand;
- no mass migration or rename is authorized by this wave.

## Next

DS-002 — inventory/classify legacy token families before migration.
