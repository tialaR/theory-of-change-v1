# SO-015 Public Routes & Application Surface Armor — Wave 07

SO-015 is ACTIVE.

Wave 07 implemented:
- formalized evidence-backed responsive contracts without flattening route personality;
- formalized canonical shared motion versus feature-owned storytelling motion;
- made user reduced-motion support a mandatory product behavior contract;
- confirmed shared and feature-owned components obey the same responsibility rules and that line count alone is never a decomposition criterion;
- introduced `check:tdm:public-routes:active` as the rolling SO-015 architecture gate;
- wired the active gate as MANDATORY in SharkOps pre-commit and pre-push policy so accepted decisions block future regressions automatically;
- introduced no application runtime or visual behavior changes;
- gate: `npm run check:tdm:public-routes:wave07`.

Next: SO-015 Wave 08 — Public Error, Loading & Status Surface Contracts.

# SO-015 Public Routes & Application Surface Armor — Wave 02

SO-015 is ACTIVE.

Wave 02 implemented:
- added the deliberate route-facing facade `@/features/theory-of-change/public-routes`;
- moved public App Router composition away from Theory of Change implementation deep imports;
- moved interactive example assembly behind feature-owned wrappers;
- preserved existing loading-delay behavior for a dedicated rendering policy wave;
- preserved `/canvas`, `/canvas/resultado`, `/login` and `/canvas-legado` boundaries;
- preserved `GOLDEN-STATE-v1` and all completed SO-001 through SO-014 initiatives;
- gate: `npm run check:tdm:public-routes:wave02`.

Next: SO-015 Wave 03 — Public Route Rendering & Loading Policy.

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


# SO-015 Public Routes & Application Surface Armor — Wave 01

Wave 01 Route Inventory & Risk Map is ACTIVE and audit-only.

- canonical route inventory: `docs/sharkops/SO-015-ROUTE-INVENTORY.json`;
- 12 App Router page entrypoints are classified by exposure, owner and risk;
- Canvas Golden State remains locked and outside SO-015 runtime refactoring;
- no route or runtime code changed;
- `/canvas-legado`, artificial dynamic delays, route deep imports and the general Playwright browser harness are explicit follow-up findings, not silently modified;
- gate: `npm run check:tdm:public-routes:wave01`;
- next attack: SO-015 Wave 02 Public Routes Boundary & Composition.

## SO-015 Public Routes & Application Surface Armor — Wave 03

Public content routes now use their natural static rendering policy. Artificial 900ms route latency, forced dynamic rendering and async wrappers used only to manufacture loading UI were removed from five content routes. Existing loading boundaries remain available for genuine future suspension. Canvas, auth and legacy route boundaries remain outside this change. Next: Public Visual Language & Design System Foundations.
## SO-015 Wave 04 — Public Visual Language & Design System Foundations

- Public routes are an independent visual source of truth; Canvas is not the universal visual template.
- Existing visual personality must be preserved while repeated semantics are progressively formalized as tokens, primitives and shared components.
- Promotion to the Design System requires evidence of repeated semantic role or cross-route behavior; visual similarity alone is insufficient.
- Shared public foundations must not depend on Canvas or public-page implementation details.
- No runtime or visual behavior changes were introduced in this wave.


## SO-015 Wave 05 — Shared Public Primitives & Composition Contracts
- Unique public visual personality remains feature-owned, but one-off usage never excuses God Components.
- TheoryFlowBoard was split by responsibility without visual or behavioral change.
- Shared primitive promotion still requires repeated semantic evidence.
- Next: Public Header, Navigation & Route Shell.

## SO-015 Wave 06 — Public Header, Navigation & Route Shell

- Decomposes the shared PublicHeader by responsibility without visual or behavioral change.
- Moves route visibility and active-navigation rules into an explicit policy module.
- Moves scroll observation into a dedicated hook.
- Keeps brand, navigation and CTA rendering as explicit shared public-layout pieces.
- Formalizes that shared and feature-owned components obey the same responsibility rules; uniqueness never authorizes God Components or God Logic.
- Preserves the SO-014 Canvas Golden State.


## SO-015 Wave 07 — Public Route Responsive & Motion Contracts

- Responsive and motion behavior remains personality-preserving and evidence-backed.
- Reduced-motion support is mandatory.
- The rolling SO-015 gate is mandatory in SharkOps pre-commit and pre-push.

## SO-015 Wave 08 — Public Error, Loading & Status Surface Contracts

- App Router route-state boundaries own contextual copy.
- `src/shared/ui/tdm-status-screen` owns shared status behavior, accessibility, actions and visual treatment.
- Non-Canvas error boundaries consume the canonical shared error-boundary props contract.
- Loading boundaries cannot manufacture latency.
- Shared status primitives remain feature- and Canvas-agnostic.
- No visual or runtime behavior changed.
- Next: Legacy Route & Public Exposure Decision.

## SO-015 Wave 09 — Legacy Route & Public Exposure Decision

- `/canvas-legado` is RETIRED after repository-wide consumer proof found no runtime links, tests, navigation consumers or product dependency.
- The App Router entrypoint and legacy-only XYFlow layout are removed.
- Historical migration references remain truthful documentation.
- `.tdm/contract-v3.json` and Canvas lockdown now forbid silent route resurrection.
- Reintroduction requires a new explicit SharkOps initiative.
- Next bite: SO-015 | Public Route Regression & Closeout Matrix.

## SO-015 Wave 10 — Public Route Regression & Closeout Matrix

- Canonical closeout matrix: `docs/sharkops/SO-015-PUBLIC-ROUTE-CLOSEOUT-MATRIX.json`.
- Waves 01–10, rolling public-route gate, SharkOps and Golden State are consolidated as architecture governance.
- Sass policy, type generation, typecheck, unit tests and build are registered as repository quality gates.
- Public-route E2E remains an explicit closeout blocker because the generic Playwright command lacks the environment-safe browser preflight already proven by the Canvas runner.
- Tooling failure is not product failure, but the tooling gap cannot be ignored to claim closeout.
- No runtime code changes.
- Next: SO-015 Wave 11 Public E2E Harness & Regression Armor.

## SO-015 Wave 11 — Public E2E Harness & Regression Armor

- Public behavior now has a dedicated environment-safe Playwright runner.
- Bundled Chromium is used when available; installed system Chrome/Chromium is an explicit fallback.
- Every inventoried public route is covered for unauthenticated exposure, alongside auth/public separation, 404 behavior and the retired `/canvas-legado` contract.
- `test:e2e:public-routes` is mandatory in SharkOps pre-push.
- The Wave 10 closeout blocker is resolved; SO-015 is now closeout-ready pending final closeout proof.
- No product runtime behavior changed.
- Next: SO-015 Final Public Routes Closeout.

## Wave 11 v1.1 — Playwright system-browser launch hotfix

- Corrects the environment-safe fallback so `TDM_PLAYWRIGHT_EXECUTABLE_PATH` is passed through Playwright `launchOptions.executablePath`.
- The v1 runner already detected the system browser correctly, but the config placed `executablePath` at the wrong level and Playwright silently fell back to its missing bundled Chromium.
- No route, UI, product runtime or architectural ownership changed.
- Wave 11 remains revision 11; this hotfix only makes the already-approved E2E contract executable on the target macOS ARM environment.

## SO-015 Wave 12 — Final Public Routes Closeout

SO-015 is COMPLETE. Public-route architecture, Design System promotion rules, route-state ownership, responsive/motion contracts, legacy-route retirement and environment-safe public E2E armor are sealed. Zero bites remain active. Future application work must open a new scoped SharkOps initiative; SO-015 must not be silently reopened.

## SO-015 post-closeout hotfix — Release E2E Harness

- SO-015 remains COMPLETE and is not reopened.
- `test:e2e` now uses an environment-safe full-suite runner instead of raw `playwright test`.
- `validate:release` keeps proving the full E2E suite through `npm run test:e2e`, but can now use installed system Chrome/Chromium when bundled Playwright Chromium is unavailable.
- `check:tdm:release-e2e-harness` is mandatory in SharkOps pre-commit and pre-push and blocks silent regression to raw browser-dependent execution.
- No product runtime, route, UI or architecture ownership changed.

## SO-016 Authentication & Protected Surface Armor — Wave 01

- Audit-only wave. No runtime behavior changed.
- Canonical audit: `docs/sharkops/SO-016-AUTH-PROTECTED-SURFACE-AUDIT.json`.
- Both `/canvas` and `/canvas/resultado` are currently protected through `getCurrentCanvasProject(...) -> requireAuthenticatedSession(...)`.
- Proven high-severity finding AUTH-001: the server Auth repository bypasses the declared HTTP/MSW boundary by importing the mock store directly.
- Next bite: **SO-016 | Server Auth Repository Boundary**.
- Golden State remains `GOLDEN-STATE-v1`.

## SO-016 Authentication & Protected Surface Armor — Wave 02

- `AUTH-001` is resolved without broad Auth refactoring.
- The server Auth repository now composes the existing HTTP repository against `TDM_MOCK_API_ORIGIN`; it no longer reaches into `auth.mock-store` directly.
- A focused test proves the server factory composes the canonical HTTP repository and mock origin; existing Auth handler tests retain the HTTP/MSW lifecycle proof.
- The Wave 02 gate forbids server runtime code from silently reintroducing direct mock-store access.
- The Wave 01 audit gate was evolved explicitly rather than weakened: the original finding must remain documented and may only be marked resolved from SO-016 revision 2 onward.
- Canvas Golden State remains `GOLDEN-STATE-v1`.
- Next bite: **SO-016 | Protected Route Ownership Contract**.

## SO-016 Wave 02 v1.1 — Auth/MSW legacy gate alignment hotfix

- Wave 02 remains revision 2 and remains the active SO-016 bite; no progression to Wave 03 occurred.
- `check:tdm:auth-msw` was stale: it still required `canvas-project.mock-store.ts` inside `infrastructure/msw`, although SO-013 Infrastructure Cleanup explicitly moved that shared store to neutral `infrastructure/memory` and later Golden State gates forbid resurrection of the MSW-owned path.
- The gate now requires the neutral memory store, preserves its owner/project partition and CRUD invariants, keeps MSW handler requirements intact, and explicitly fails if the retired MSW store path reappears.
- No product runtime, Auth behavior, Canvas behavior, route ownership or Golden State contract changed.


## SO-016 Wave 03 — Protected Route Ownership Contract

AUTH-002 is resolved. `/canvas` and `/canvas/resultado` now authenticate at their App Router entries with exact returnTo values before handing an authenticated user into the Canvas feature. The Canvas project loader no longer owns route/session redirect policy. Next bite: Redirect Policy Contract (AUTH-003).
# SO-016 Authentication & Protected Surface Armor — Wave 04

SO-016 remains ACTIVE.

Wave 04 implemented:
- resolved AUTH-003 without broad redirect-policy expansion;
- `sanitizeReturnTo` continues accepting local single-slash application paths;
- external/protocol-relative targets and the `/login` self-target fall back to `/canvas`;
- query/hash variants of `/login` are also rejected while legitimate protected destinations remain unchanged;
- added focused unit coverage for redirect-policy inputs and an executable gate requiring all auth redirect consumers to keep using the canonical sanitizer;
- normalized AUTH-005 as resolved by the already-green Wave 03 protected-route ownership gate;
- no visual, styling, persistence, Canvas Engine or public-route behavior was changed.

Gate: `npm run check:tdm:auth-protected-surfaces:wave04`.

Next: SO-016 Wave 05 — Auth Facade Consumption Boundary, targeting AUTH-004.


## SO-016 Wave 05 — Auth Facade Consumption Boundary

- AUTH-004 is resolved with an auth-specific, client-safe cross-feature facade boundary.
- `src/features/auth/index.ts` is the approved Canvas UI entrypoint for `AuthUser` and `UserMenu`.
- Canvas UI may not import Auth domain, UI, application, infrastructure or server internals directly.
- Server-side Canvas actions keep explicit `@/features/auth/server/auth-session` access; the server contract is intentionally not re-exported through the client-safe facade.
- No styling, Canvas behavior, session semantics, redirect behavior or persistence behavior changed.
- Next: **SO-016 Authentication & Protected Surface Closeout Audit**. All original Wave 01 findings are now resolved; re-audit before declaring COMPLETE.


## SO-016 COMPLETE — Authentication & Protected Surface Armor

SO-016 closed at revision 6 after five proven findings were resolved and a terminal closeout audit found no additional auth/protected-surface runtime bite justified. GOLDEN-STATE-v1 remains sealed. Next: SO-017 Application Shell & Shared UI Armor, audit-first.

## SO-017 ACTIVE — Application Shell & Shared UI Armor

Wave 01 is audit-only. Application shell, shared UI ownership, route-state surfaces and public entrypoint consistency were inventoried without runtime refactor. The smallest proven next bite is SHELL-001: shared UI style ownership. SO-015, SO-016 and GOLDEN-STATE-v1 remain sealed.


## SO-017 Wave 02 — Shared UI Style Ownership

SHELL-001 resolved. TdmAnchoredTooltip is confirmed live; its reusable Sass surface now belongs to shared/styles/tdm, while shared UI component styles remain module-owned. Cross-feature imports of internal shared UI CSS Modules are forbidden. Next: SHELL-002 public entrypoints.


## SO-017 Wave 03 — Shared UI Public Entrypoints Contract

SHELL-002 resolved. tdm-field and tooltip expose canonical local entrypoints; deep implementation imports are gated. Next: SHELL-003 route adapter boundary.


## SO-017 Wave 04 — App Route Adapter Boundary Contract

SHELL-003 resolved. App route adapters must consume Canvas through the feature facade; deep Canvas implementation imports from src/app are forbidden. Next bite is SO-017 closeout audit because remaining findings are preserve-only observations.


## SO-017 COMPLETE — Application Shell & Shared UI Armor

SO-017 closed at revision 5. SHELL-001..003 are resolved; SHELL-004..005 are explicit preserve-only findings. No active bite remains. Next: SO-018 Design System & Token Governance, audit-first. GOLDEN-STATE-v1 remains sealed.

## SO-018 ACTIVE — Design System & Token Governance

Wave 01 is audit-only. The canonical `--tdm-*` token aggregator and the legacy Sass compatibility layer are both active. The legacy `src/shared/styles/tokens.sass` is still consumed by 39 source files and must not be deleted or mass-migrated without family-by-family evidence. DS-001 is the smallest proven next bite: define and gate the compatibility boundary first. SO-017 remains COMPLETE and GOLDEN-STATE-v1 remains sealed.


## SO-018 Wave 02 — Legacy Token Compatibility Boundary

DS-001 resolved: legacy tokens.sass is sealed as a non-growing Sass compatibility layer. Canonical shared/styles/tdm cannot depend on it; global CSS emission from the legacy file is forbidden. Next: DS-002 family inventory, no mass rename.


## SO-018 Wave 03 — Legacy Token Family Inventory

DS-002 resolved by classifying top-level legacy token definitions and correcting occurrence-count semantics. No token value, runtime style, rename or mass migration changed. Next: DS-003 token-authority hardcode classification.


## SO-018 Wave 04 — Token Authority Hardcode Classification

DS-003 resolved. Canonical raw-value authority is structural: tdm-tokens aggregator + @mixin tokens. Next bite: SO-018 closeout audit.


## SO-018 COMPLETE — Design System & Token Governance

SO-018 closed at revision 5. DS-001..003 are resolved; DS-004 is explicitly preserve-only. Legacy token compatibility may only shrink, canonical hardcode authority remains structural, and evidence-based Design System promotion remains mandatory. No active bite remains. Next: SO-019 Cross-Feature Boundaries, audit-first. GOLDEN-STATE-v1 remains sealed.


## SO-019 ACTIVE — Cross-Feature Boundaries

Wave 01 audit-only baseline: 7 direct cross-feature imports across 1 feature pairs. Next bite: SO-019-WAVE-02. No runtime refactor is authorized yet. GOLDEN-STATE-v1 remains sealed.


## SO-019 Wave 02 — Auth Boundary Contract

The only proven feature pair, theory-of-change -> auth, is classified: six root facade imports are legitimate; the single server capability now uses `@/features/auth/server`; deeper cross-feature Auth imports are forbidden. Next: SO-019 closeout audit.


## SO-019 COMPLETE — Cross-Feature Boundaries

SO-019 closed at revision 3. The only proven pair, theory-of-change -> auth, is sealed through explicit root/server feature facades. No second pair justified refactor. No active bite remains. Next: SO-020 Application Infrastructure & Runtime Armor, audit-first. GOLDEN-STATE-v1 remains sealed.


## SO-020 ACTIVE — Application Infrastructure & Runtime Armor

Wave 01 audit-only: 3 process.env files, 11 server/action files, 14 infrastructure files. Next: SO-020-WAVE-02. No runtime refactor is authorized yet. GOLDEN-STATE-v1 remains sealed.


## SO-020 Wave 02 — Runtime Environment Boundary

The only environment read inside domain code moved to a feature-owned runtime diagnostics adapter. Authorized process.env reads are now exactly Auth server NODE_ENV, Theory of Change runtime diagnostics NODE_ENV, and Next instrumentation NEXT_RUNTIME. Next: SO-020 closeout audit.


## SO-020 COMPLETE — Application Infrastructure & Runtime Armor

SO-020 closed at revision 3. RUNTIME-001 is resolved; RUNTIME-002..003 are preserve-only. No active bite remains. Next: SO-021 Application-Wide Regression Armor, audit-first. GOLDEN-STATE-v1 remains sealed.


## SO-021 ACTIVE — Application-Wide Regression Armor

Wave 01 audit-only inventories 156 contract gates, 7 test scripts and 53 test/spec files. REGRESSION-001 proves no single application-wide composition contract exists yet. Next: SO-021 Wave 02 Application-Wide Regression Contract. GOLDEN-STATE-v1 remains sealed.


## SO-021 Wave 02 — Application-Wide Regression Contract

REGRESSION-001 is resolved. `npm run check:tdm:application-wide-regression` now composes existing authoritative architecture closeouts, Golden State, typecheck, scoped lint, unit tests and SharkOps verification. It does not duplicate their implementation. Next: SO-021 closeout audit.


## SO-021 COMPLETE — Application-Wide Regression Armor

SO-021 closed at revision 3. REGRESSION-001 is resolved; REGRESSION-002..003 are preserve-only. `check:tdm:application-wide-regression` remains the fail-closed aggregate contract. No active bite remains. Next: SO-022 Final Application Architecture Closeout, audit-first. GOLDEN-STATE-v1 remains sealed.


## SO-022 ACTIVE — Final Application Architecture Closeout

Wave 01 audit-only verifies SO-001..SO-021 COMPLETE, terminal verification entrypoints present, and GOLDEN-STATE-v1 still sealed. FINAL-003 is the remaining terminal finding: the Application Golden State has not yet been sealed. Next: SO-022 Wave 02 Application Golden State Candidate Contract.


## SO-022 Wave 02 — Application Golden State Candidate

`APPLICATION-GOLDEN-STATE-v1-CANDIDATE` is now explicit and non-final. It binds predecessor completion, Canvas GOLDEN-STATE-v1, the application-wide regression contract and deterministic governance evidence. Next: SO-022 terminal closeout, which must run the complete application-wide regression contract before sealing the final Application Golden State.


## SO-022 COMPLETE — APPLICATION GOLDEN STATE

`APPLICATION-GOLDEN-STATE-v1` is sealed. SO-001..SO-022 are COMPLETE. Canvas `GOLDEN-STATE-v1` remains independently sealed. No active bite remains. Next work is explicitly post-Golden: V1 hardening, dead-artifact audit, gate tsunami testing, docs/repository contribution readiness, deploy/GitHub polish, use-case flowcharts and product-facing presentation.


## Pre-commit integrity hotfix — Auth RSC boundary

Manual smoke testing after the SO-022 seal found a real regression blind spot: the Auth root barrel mixed `AuthPage` (server-only transitively through `next/headers`) with client-safe exports consumed by Canvas client modules. The root facade is now client/domain-safe, `AuthPage` moves to the explicit server facade, and `check:tdm:application-wide-regression` now includes both `check:tdm:auth-rsc-boundary` and production `build`. `APPLICATION-GOLDEN-STATE-v1.json` remains immutable; the correction is recorded in `APPLICATION-GOLDEN-STATE-v1-INTEGRITY-ADDENDUM.md`.
