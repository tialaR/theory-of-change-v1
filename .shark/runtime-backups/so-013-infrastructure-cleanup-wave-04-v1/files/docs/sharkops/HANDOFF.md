# SO-013 Infrastructure Cleanup Wave 03

SO-013 is ACTIVE.

Wave 03 implemented:
- removed the legacy `public-pages/home-onboarding-preview.tsx` alias wrapper;
- `HomePage` now imports `HomeOnboardingPreview` directly from the canonical `guided-story.tsx` module;
- removed the unused `result-view/experience/result-experience-page.tsx` alias (`ResultPage as ResultExperiencePage`);
- direct, indirect, script/tool and source references were audited before removal;
- no runtime algorithm, visual behavior, route, public page implementation, Canvas Engine boundary or domain/application contract was changed;
- the Wave 02 v1.1 lint hotfix gate was evolved only to accept cumulative downstream SO-013 progression while preserving its lint-scope invariant.

Gate: `npm run check:tdm:infrastructure-cleanup:wave03`.

Next audit: SO-013 Infrastructure Cleanup Wave 04 — Contracts Deduplication.

# SO-013 Infrastructure Cleanup Wave 02 v1.1 — Lint Gate Hotfix

SO-013 is ACTIVE.

Hotfix implemented:
- Wave 02 cleanup itself remains unchanged;
- the Wave 02 verifier had unintentionally expanded the established lint gate from `lint:canvas` to `lint` (`eslint .`);
- the full lint surfaced historical backup files plus unrelated pre-existing live-code lint debt, so it was not a valid regression signal for Wave 02;
- Shark Attack verification is restored to the previously approved `npm run lint:canvas` scope;
- no live source file is added to ESLint ignore rules and no lint error is hidden;
- global `npm run lint` remains available as an explicit debt/audit command, but is not promoted to a mandatory regression gate without a dedicated cleanup wave;
- Wave 02 gate now accepts cumulative downstream SO-013 progression while preserving all original Wave 02 invariants.

Gate: `npm run check:tdm:infrastructure-cleanup:wave02-hotfix`.

Next audit: SO-013 Infrastructure Cleanup Wave 03.

# SO-013 Infrastructure Cleanup Wave 02

SO-013 is ACTIVE.

Wave 02 implemented:
- removed the duplicate `src/features/theory-of-change/components/result-view/result-view.utils.ts` facade;
- moved its geometry/camera helpers into the canonical `result-view-utils.geometry.ts` surface;
- migrated live consumers to `result-view-utils` for canonical geometry helpers and to `experience/result-experience-data` for connected-flow/badge helpers;
- no utility algorithm or runtime behavior was intentionally changed;
- no public feature barrel, adapter, repository, domain contract or Canvas Engine boundary was changed;
- SO-013 Wave 01 and SO-012 Canvas Engine Closeout remain mandatory predecessor gates.

Gate: `npm run check:tdm:infrastructure-cleanup:wave02`.

Next audit: SO-013 Infrastructure Cleanup Wave 03. Audit legacy aliases and naming only after proving direct/indirect consumers, tests, scripts, gates and dynamic imports.

# SO-013 Infrastructure Cleanup Wave 01

SO-013 is ACTIVE.

Wave 01 audit finding implemented:
- removed `src/features/theory-of-change/utils/get-next-stage-message.ts`;
- removed `src/features/theory-of-change/utils/get-node-metadata.ts`;
- both helpers had no live references in source, tests, scripts or tools;
- historical generated Design System audit artifacts may still mention the removed symbols and are not runtime consumers;
- no adapter, barrel, contract or infrastructure repository was removed in this wave;
- SO-012 Canvas Engine Closeout remains a mandatory predecessor gate.

Gate: `npm run check:tdm:infrastructure-cleanup:wave01`.

Next audit: SO-013 Infrastructure Cleanup Wave 02. Re-audit inconsistent barrels, legacy aliases/naming, duplicated utility surfaces and cross-layer infrastructure dependencies before selecting the next safe bite.

# SO-012 Canvas Engine Closeout

SO-012 is COMPLETE.

Protected Canvas Engine boundary:
- `canvas/engine/canvas-engine.ts` is the only public Engine entrypoint for UI and Application;
- state, commands, history, layout, persistence, selection and interaction remain separate framework-neutral kernels;
- external consumers must not deep-import internal kernel files;
- React, React Flow, browser events, repositories, HTTP, MSW, autosave timing, translations and visual effects remain outside the Engine;
- Domain retains causal policy and schema migration ownership;
- Application retains product policies and orchestration contracts;
- all SO-012 wave gates plus the Wave 09 facade hotfix are aggregated by `check:tdm:canvas-engine:closeout`.

Next attack: SO-013 Infrastructure Cleanup Audit.

# SO-012 Canvas Engine Wave 09 Engine Facade

- Engine capabilities are exported through `canvas/engine/canvas-engine.ts`.
- UI and Application must consume only that public facade, never internal kernel files.
- Internal kernels remain independently tested and framework-neutral.
- Next bite: SO-012 Wave 10 Canvas Engine Closeout.

# SharkOps Handoff

Start every new chat or agent session by reading this file and `.sharkops/state/current-state.json`.

Current state: SO-012 Canvas Engine Wave 05 is ACTIVE.
Next audit: SO-012 Canvas Engine Wave 06 Persistence Boundary.

Protected React Flow boundary:
- exactly eight approved direct `@xyflow/react` importers in the official canvas;
- Domain, Application, Infrastructure and Server remain XYFlow-neutral;
- workspace controllers and command hooks consume neutral contracts;
- flow state, viewport conversion, drop conversion and provider composition remain in explicit React Flow adapters;
- node, edge, connection-line and surface components remain the approved rendering boundary.

Do not move concrete React Flow APIs back into workspace hooks to simplify a future refactor. Any required boundary change must be announced first, accepted, documented in an ADR and converted into an executable gate.

Continue through small versioned ZIP patches with apply, rollback, verify, payload, reports, manifest, SharkOps updates and executable gates. Never break a previous wave.


SO-012 Wave 02 state-kernel boundary:
- `canvas/engine/canvas-engine-state.ts` owns framework-neutral nodes/edges snapshots and bounded history policy;
- UI history may coordinate React lifecycle, but must not re-own cloning or history-window policy;
- React Flow types remain outside the engine and are supplied through generic type parameters;
- command extraction, persistence and renderer state ownership are intentionally deferred to later waves.


SO-012 Wave 03 command-kernel boundary:
- `canvas/engine/canvas-engine-commands.ts` owns immutable append, update and remove transitions for nodes and edges;
- node deletion removes incident edges as one pure engine transition;
- UI hooks still own React lifecycle, snapshot timing, ID creation, copy, notices and domain-policy decisions;
- layout orchestration, persistence and renderer state ownership remain deferred.

SO-012 Wave 04 history-orchestration boundary:
- `canvas/engine/canvas-engine-history.ts` owns pure capture, undo and redo timeline transitions;
- the UI history hook only coordinates React state, setters and drag lifecycle timing;
- history snapshots are cloned by the Engine and redo invalidation remains part of the pure capture transition;
- the node-deletion callback tracks `edges`, preventing stale incident-edge cleanup after Wave 03;
- layout orchestration, persistence and renderer state ownership remain deferred.
- the Wave 02 gate accepts the explicit downstream `UI -> History Kernel -> State Kernel` progression while preserving its original state-kernel invariants.


SO-012 Wave 05 layout-command boundary:
- `canvas/engine/canvas-engine-layout.ts` owns generic, framework-neutral column centralization and connection-aware flow ordering algorithms;
- Application retains the concrete product policy for stage order, column coordinates, start position, node height and gap;
- UI hooks continue invoking the stable Application layout API and do not own positioning algorithms;
- React, React Flow and product layout constants remain outside the Engine;
- persistence and renderer state ownership remain deferred.

## SO-012 Wave 06 — Persistence Boundary

- Engine now owns isolated persistable snapshots and deterministic content signatures.
- Application keeps the product persistence shape and delegates pure snapshot/signature work.
- Save queue, autosave, repositories, HTTP, MSW and schema migration remain outside the Engine.
- Gate: `npm run check:tdm:canvas-engine:wave06`.
- Next audit: Wave 07 Selection Boundary.

## SO-012 Wave 07 — Selection Boundary

- `canvas/engine/canvas-engine-selection.ts` owns pure resolution of selected node, selected edge, edge endpoints and caller-supplied edge metadata.
- UI keeps React memoization, selection setters, inspector/editor drafts, popover state and translated copy.
- The kernel is framework-neutral and receives concrete Canvas/React Flow shapes through structural generic contracts.
- Gate: `npm run check:tdm:canvas-engine:wave07`.
- Next audit: Wave 08 Interaction Boundary.

## SO-012 Wave 08 — Interaction Boundary

- `canvas/engine/canvas-engine-interaction.ts` owns pure connection-candidate resolution and bounded stage-drop positioning.
- Connection resolution covers invalid/self targets, missing endpoints, caller-supplied causal-policy rejection and duplicate detection.
- UI retains browser drag/drop events, React callbacks, notices, snapshot timing, ID creation, state setters and viewport effects.
- Domain retains the causal transition policy; the Engine receives it through an injected evaluator.
- Gate: `npm run check:tdm:canvas-engine:wave08`.
- Next audit: Wave 09 Engine Facade.
