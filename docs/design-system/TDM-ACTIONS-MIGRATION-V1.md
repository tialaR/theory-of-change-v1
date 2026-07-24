# TDM Actions Migration V1

## Scope

This patch consolidates the action layer outside `/canvas` without changing the internal interaction model of the example workspaces.

Migrated families:

- `TdmIconButton`
- `TdmTooltip`
- `TdmMenu`
- legacy public button adapters
- result and flow interactive headers
- image export menu
- narrative PDF/DOCX export menu

Protected zones:

- `/canvas`
- guide timeline
- internal preview and diagram behavior
- connection, selection, zoom, camera and narrative logic

## Decisions

- One canonical icon-button family.
- One portal-based tooltip, avoiding clipping and lingering after click.
- One portal-based menu with header-derived surface, four-sided border and transparent item hover.
- Menu items always receive a leading action icon.
- Public button families become compatibility adapters over canonical primitives.
- Interactive route headers use the canonical brand mark and icon controls.
- PNG/SVG image export is presented through one download action.
- PDF/DOCX narrative export uses the same menu primitive.
- Export and interaction callbacks remain owned by their features.

## Route effects

- `/exemplos/resultado/interativo`
  - canonical header and actions
  - one PNG/SVG export menu
  - selection-aware export heading

- `/exemplos/visao-do-fluxo/interativo`
  - canonical header and actions
  - PNG/SVG export menu added through the existing image export utility
  - selected visual state is preserved in the captured diagram

## Compatibility

`PublicButton` and `PublicIconButton` remain temporarily available as deprecated adapters. They no longer own a separate visual implementation. New code must import `TdmButton` and `TdmIconButton` directly.
