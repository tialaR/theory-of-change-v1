# Architecture restructure backlog

> Status: documented before the dedicated /canvas pass. Do not execute this restructure while the canvas is still being refined.

## Current decision

Keep the current `features/theory-of-change` feature in place for now, because the whole app is still one product domain: Teoria da Mudanca.

Before touching the core canvas, only do safe cleanup:

- remove backup files and patch scripts;
- remove ghost/typo routes;
- keep public routes stable;
- avoid large folder moves;
- avoid changing business logic.

## Future target architecture

After the canvas stabilizes, split the app into smaller feature worlds:

```txt
src/
  app/
    page.tsx
    canvas/
    guia-de-aprendizado/
    exemplos/
    referencias/
  features/
    theory-of-change-core/
      domain/
      models/
      types/
      utils/
    canvas/
      components/
      data/
      hooks/
      styles/
      types/
    home/
      components/
      styles/
    guide/
      components/
      styles/
      data/
    examples/
      components/
      styles/
      data/
    result-experience/
      components/
      styles/
      data/
    flow-vision/
      components/
      styles/
      data/
    public-shell/
      header/
      footer/
      styles/
  shared/
    ui/
    styles/
    motion/
    assets/
```

## Rules for the later restructure

- One feature, one world: components, types, models, data, hooks and styles stay close to the feature.
- Shared UI only contains stable primitives reused by more than one feature.
- Domain logic stays out of visual components.
- Prefer `.module.sass` for component styles.
- No broad global CSS except tokens/reset in `src/app/globals.sass`.
- Keep route files thin. A `page.tsx` should compose feature components, not hold product UI logic.
- Do not move /canvas during public-page cleanup. Canvas gets its own pass.

## Known cleanup debt

- `features/theory-of-change` is too broad and should be split after /canvas is stable.
- Some visual components are large and should be decomposed later by SRP.
- DS names still overlap: lusion/resend/public/resend-public. Consolidate after the canvas pass.
- Legacy example routes should stay removed unless explicitly reintroduced as redirects.
- Keep patch scripts out of the repo once applied.

## Reminder for future sessions

Before a major new phase, check this file and remind the team that a feature-based restructure is still pending.
