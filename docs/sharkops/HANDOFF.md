# TDM Golden State Snapshot v1

The Shark Attack architecture war is COMPLETE.

Golden State v1:
- preserves SO-001 through SO-014 as `COMPLETE` with zero active bites;
- preserves SO-014 Wave 11 as the final architecture closeout instead of reopening the initiative;
- records the final regression proof: typecheck PASS, Canvas lint PASS, 36 test files / 119 tests PASS, Canvas E2E PASS and SharkOps `NO REGRESSION DETECTED`;
- adds executable Golden State gate `npm run check:tdm:golden-state`;
- adds official portable snapshot command `npm run shark:golden`;
- introduces no runtime, visual, route, persistence, data-contract or styling changes.

Canonical handoff: `docs/sharkops/GOLDEN-STATE-HANDOFF.md`.
Canonical snapshot: `docs/sharkops/GOLDEN-STATE-SNAPSHOT.json`.

Future runtime work must start as a new scoped SharkOps initiative. Do not reopen SO-014.

# SO-014 Final Architecture Closeout — Wave 07

SO-014 is ACTIVE.

Wave 07 implemented:
- audited canonical architecture documentation against the repository-backed architecture sealed by Waves 02-06;
- added ADR-008 as the Final Canvas Architecture Constitution, superseding draft ADR-002 through ADR-005 without deleting their historical bodies;
- indexed accepted ADR-006 and ADR-007 and marked `canvas-v4.md` as historical migration material;
- aligned frontend/visual guidelines with the modular, gate-protected `/canvas` while preserving its homologated visual experience;
- introduced no runtime, route, persistence, data-contract, visual implementation or styling changes;
- gate: `npm run check:tdm:final-architecture:wave07`.

Next: SO-014 Wave 08 — Gate Matrix Consolidation.

# SO-014 Final Architecture Closeout — Wave 06

SO-014 is ACTIVE.

Wave 06 implemented:
- audited active trees for dead paths, zero-byte files, backup/temp residue and legacy-looking names before any removal decision;
- found no runtime deletion justified by evidence;
- keeps `scripts/_legacy/tdm-contract-v1` quarantined from npm scripts, current SharkOps tooling and CI execution paths;
- proves selected `v1-*` sidebar files remain live compatibility seams with direct consumers and therefore must not be removed by name alone;
- treats explicit `@deprecated` compatibility aliases as protected until consumers/contracts prove safe removal;
- prevents new legacy/deprecated/backup/temp wrappers inside the final Canvas architecture and prevents root `.tdm-*` historical artifacts from gaining runtime/tooling dependencies;
- aggregates Wave 05 and SO-013 Infrastructure Cleanup closeout;
- introduced no runtime, visual, route, persistence, data-contract or styling changes;
- gate: `npm run check:tdm:final-architecture:wave06`.

Next: SO-014 Wave 07 — Documentation & ADR Consistency.

# SO-014 Final Architecture Closeout — Wave 05

SO-014 is ACTIVE.

Wave 05 implemented:
- audited runtime/environment separation and found no production refactor required;
- seals Domain/Application/Engine against browser, Next, React Flow, MSW and Node runtime leakage;
- seals Server against browser/React/React Flow/MSW leakage while preserving server-only composition;
- seals Infrastructure against UI/React Flow/Next leakage and preserves the neutral memory store boundary;
- aggregates the Wave 04 gate and SO-013 Infrastructure Cleanup closeout;
- evolved Wave 04 only for registered downstream SO-014 progression;
- introduced no runtime, visual, route, persistence, data-contract or styling changes;
- gate: `npm run check:tdm:final-architecture:wave05`.

Next: SO-014 Wave 06 — Dead Path & Legacy Residue Verification.

# SO-014 Final Architecture Closeout — Wave 04

SO-014 is ACTIVE.

Wave 04 implemented:
- audited public Canvas entrypoints, canonical contract owners and external deep-import seams; no runtime refactor was required;
- sealed explicit `canvas/index.ts` exports and forbids wildcard expansion at that public boundary;
- preserves the SO-012 facade-only Canvas Engine contract and SO-013 canonical contract deduplication;
- freezes the two existing external composition seams (`app/canvas/loading.tsx` and `mocks/handlers.ts`) and rejects silent expansion;
- repaired the missing Wave 03 HANDOFF summary discovered during this audit;
- evolved the Wave 03 gate only for registered downstream SO-014 progression without weakening dependency-direction invariants;
- introduced no runtime, visual, route, persistence, data-contract or styling changes;
- added executable gate `npm run check:tdm:final-architecture:wave04`.

Next: SO-014 Wave 05 — Runtime / Infrastructure Separation Verification.

# SO-014 Final Architecture Closeout — Wave 03

SO-014 is ACTIVE.

Wave 03 implemented:
- audited production imports across Domain, Application, Engine, React Flow, Infrastructure, Server and UI;
- found no runtime dependency inversion requiring refactor;
- sealed dependency direction with an executable production-import gate;
- excludes test/spec fixtures from production direction scanning;
- evolved the Wave 02 gate only for registered downstream SO-014 progression without weakening boundary invariants;
- introduced no runtime, visual, route, persistence, data-contract or styling changes;
- gate: `npm run check:tdm:final-architecture:wave03`.

Next: SO-014 Wave 04 — Public API & Contract Verification.

# SO-014 Final Architecture Closeout — Wave 02

SO-014 is ACTIVE.

Wave 02 implemented:
- audited the final Canvas ownership boundaries and found no runtime deviation requiring refactor;
- sealed Application, React Flow, Canvas Engine and Infrastructure boundaries by aggregating their existing closeout gates;
- verifies the final owner roots `domain`, `application`, `engine`, `react-flow`, `infrastructure`, `server` and `ui`;
- evolved the Wave 01 gate only to accept registered cumulative SO-014 progression while preserving its original invariants;
- introduced no runtime, visual, route, persistence, data-contract or styling changes;
- added executable gate `npm run check:tdm:final-architecture:wave02`.

Next: SO-014 Wave 03 — Dependency Direction Verification.

# SO-014 Final Architecture Closeout — Wave 01

SO-014 is ACTIVE.

Wave 01 implemented:
- proved SO-001 through SO-013 are COMPLETE in the Bite Ledger;
- registered the final architecture audit and mandatory closeout gate matrix;
- introduced no runtime, visual, route, data, persistence or styling changes;
- added executable gate `npm run check:tdm:final-architecture:wave01`;
- next bite is the final SO-014 closeout.

Next: SO-014 Final Architecture Closeout.

# SO-013 Infrastructure Cleanup Closeout

SO-013 is COMPLETE.

Protected closeout:
- all Waves 01-06 plus the Wave 02 v1.1 lint-gate hotfix remain mandatory and cumulative;
- proven orphan helpers, duplicate utility facade, legacy aliases, duplicate contract alias, server/MSW boundary residue and duplicate dead header asset remain removed;
- predecessor gates accept completed SO-013 state and registered downstream progression without weakening their invariants;
- closeout gate: `npm run check:tdm:infrastructure-cleanup:closeout`.

Next: SO-014 Final Architecture Closeout.

# SO-013 Infrastructure Cleanup Wave 06

SO-013 is ACTIVE.

Wave 06 implemented:
- audited `src/`, `public/`, `scripts/` and `tools/` for zero-byte files; none were found;
- audited static brand assets against live source/script/tool/test consumers before removal;
- removed only `public/tdm-construtor-header-canonical.webp`, proven unreferenced and byte-identical to the live canonical `public/brand/tmd-construtor-header-canonical.webp`;
- preserved the canonical asset and its live Canvas header consumer at `/brand/tmd-construtor-header-canonical.webp`;
- did not remove historical/design-system-only assets whose lifecycle intent is not proven disposable;
- the Wave 05 gate was evolved only to accept cumulative downstream SO-013 progression while preserving its server/MSW boundary invariant;
- a new executable gate prevents the duplicate public-root header asset from returning and protects the canonical asset hash/reference.

Gate: `npm run check:tdm:infrastructure-cleanup:wave06`.

Next: SO-013 Infrastructure Cleanup Wave 07 — Infrastructure Closeout.

# SO-013 Infrastructure Cleanup Wave 05

SO-013 is ACTIVE.

Wave 05 implemented:
- moved the shared Canvas project in-memory store from `canvas/infrastructure/msw/` to `canvas/infrastructure/memory/`;
- `canvas/server/canvas-server.repository.ts` no longer imports from the MSW interception boundary;
- MSW handlers/tests and the server repository now depend on the neutral in-memory infrastructure store;
- no repository method, persistence semantics, API contract, route, runtime behavior or Canvas Engine boundary was changed;
- the Wave 04 gate was evolved only to accept cumulative downstream SO-013 progression while preserving contract-deduplication invariants;
- a new executable gate forbids `canvas/server` from importing `canvas/infrastructure/msw` and prevents the mock store from returning to the MSW folder.

Gate: `npm run check:tdm:infrastructure-cleanup:wave05`.

Next audit: SO-013 Infrastructure Cleanup Wave 06 — Empty Files & Dead Assets Cleanup.

# SO-013 Infrastructure Cleanup Wave 04

SO-013 is ACTIVE.

Wave 04 implemented:
- removed the duplicate `ResultExperienceData = ResultExperienceProps` contract alias from `result-view/experience/types.ts`;
- `getStageNodes`, `ResultReportSection` and `ResultInteractivePreview` now consume the canonical `ResultExperienceProps` contract directly;
- no property, runtime algorithm, visual behavior, route or public API shape was changed;
- the Wave 03 gate was evolved only to accept cumulative downstream SO-013 progression while preserving its alias-removal invariants;
- predecessor gates remain mandatory.

Gate: `npm run check:tdm:infrastructure-cleanup:wave04`.

Next audit: SO-013 Infrastructure Cleanup Wave 05 — Infrastructure Boundaries Cleanup.

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

## SO-013 Wave 07 v1.1 closeout — slim SharkOps handoff package

- Supersedes the un-applied Wave 07 v1 package.
- `npm run shark:handoff` generates a compact continuity ZIP plus SHA-256.
- Live code, `.sharkops`, architecture gates, package metadata and SharkOps handoff docs remain inside the archive.
- Historical runtime/patch backups and heavy reference media are excluded from continuity ZIPs, not deleted from the working repository.
- `check:tdm:infrastructure-cleanup:handoff-package` dry-runs the packer, inspects ZIP contents and enforces a 40 MB ceiling for this repository state.
- SO-013 is COMPLETE. Next target: SO-014 Final Architecture Closeout.


# SO-014 Final Architecture Closeout — Wave 03

Wave 03 Dependency Direction Verification is ACTIVE and green.

- no runtime dependency inversion was found;
- no runtime code changed;
- Domain, Application, Engine, React Flow, Infrastructure, Server and UI direction is now executable-gated;
- Wave 02 remains a mandatory predecessor and its progression logic accepts only registered downstream SO-014 state;
- next attack: SO-014 Wave 04 Public API & Contract Verification.

# SO-014 Final Architecture Closeout — Wave 08

Wave 08 Gate Matrix Consolidation is ACTIVE and green.

- canonical machine-readable closeout matrix: `docs/sharkops/SO-014-FINAL-GATE-MATRIX.json`;
- completed architecture closeouts, SO-014 sealing gates and repository regression armor are registered in one place;
- every matrix gate must resolve to a live npm script and duplicate entries are rejected;
- SO-001 through SO-013 remain COMPLETE;
- no runtime code changed;
- next attack: SO-014 Wave 09 SharkOps Final State Consolidation.

# SO-014 Final Architecture Closeout — Wave 09

Wave 09 SharkOps Final State Consolidation is ACTIVE and green when its gate passes.

- canonical governance snapshot: `docs/sharkops/SO-014-SHARKOPS-CONSOLIDATED-STATE.json`;
- exactly one SharkOps initiative may remain ACTIVE and it is SO-014;
- SO-001 through SO-013 remain COMPLETE with completion timestamps;
- SO-014 remains ACTIVE at Wave 09 and is not prematurely closed;
- Wave 01 through Wave 09 manifests remain sequential and runtime-neutral;
- current-state, bite-ledger, HANDOFF and final gate matrix must agree;
- Wave 08 is now registered in the final gate matrix as a proven predecessor;
- no runtime code changed;
- next attack: SO-014 Wave 10 Final Regression Armor.

# SO-014 Final Architecture Closeout — Wave 10

Wave 10 Final Regression Armor is ACTIVE and green when its structural gate and executable armor pass.

- canonical armor policy: `docs/sharkops/SO-014-FINAL-REGRESSION-ARMOR.json`;
- executable runner: `npm run check:tdm:final-regression:armor`;
- architecture closeouts run independently;
- SO-014 sealing uses the latest transitive predecessor gate to avoid duplicate cascades without skipping invariants;
- repository behavior armor runs typecheck, Canvas lint, unit tests, Canvas E2E and SharkOps verification;
- SO-014 remains ACTIVE;
- no runtime code changed;
- next attack: SO-014 Wave 11 Final Architecture Closeout.

### SO-014 Wave 10 v1.1 — cumulative predecessor gate hotfix

Wave 10 v1.1 corrects gate orchestration only. The Wave 09 gate now validates its exact state at revision 9 and preserves the same invariants during authorized downstream SO-014 revisions, allowing Wave 10 to prove Wave 09 after current-state/ledger have advanced. No runtime code or architecture contract is weakened.

# SO-014 Final Architecture Closeout - Wave 11

SO-014 is COMPLETE when Wave 11 and Final Regression Armor pass.

- all SO-001 through SO-014 initiatives are COMPLETE;
- no SharkOps bite remains ACTIVE;
- terminal SharkOps state is valid only when every ledger bite is COMPLETE;
- final regression armor remains the mandatory executable proof;
- no runtime code changed;
- next step: Wave 12 Golden State Snapshot / Project Handoff, a post-closeout packaging step that must not reopen SO-014.
