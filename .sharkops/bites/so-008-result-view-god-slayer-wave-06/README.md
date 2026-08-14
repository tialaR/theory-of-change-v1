# SO-008 Result View God Slayer Wave 06

Separates the full theory-flow composition from `result-view.tsx` without changing visual output or business behavior.

## Ownership

- root result composition: export lifecycle and high-level assembly;
- `ResultTheoryFlow`: stage columns, cards, bridge grouping, overlay refs and flow rendering;
- existing focus owner: causal selection and inspector state;
- existing visualization owner: SVG paths and bridge markers.

## Gate

`npm run check:tdm:result-view-god-slayer:wave06`
