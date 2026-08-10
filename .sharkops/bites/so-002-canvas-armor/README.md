# SO-002 | Canvas Armor

Status: ACTIVE  
Revision: 2

## Purpose

Protect the current Canvas behavior before structural refactoring.

## Revision 2

- fixes the explicit Playwright target for the Canvas E2E;
- aligns the layout test with official Canvas tokens;
- extracts connection notice policy from the workspace controller;
- restores the anti-God budget without weakening the gate.

## Protected behavior

- `/canvas` and `/canvas/resultado` routes;
- Canvas route error boundary;
- hydrated ID collision protection;
- autosave, reload and result navigation E2E evidence;
- layout positioning tied to Design System tokens;
- workspace controller budget.

## Required proof

```bash
npm run test:unit
npm run test:e2e:canvas
```
