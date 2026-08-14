# PGH-001 — Release Gate Hardening

## What was proven

Wave 01 proved a real false-green path: `validate:release` could fail while SharkOps still printed `ATTACK RESULT: CLEARED BY SHARKOPS` because the release proof was advisory.

Wave 02 proved why this was no longer legitimate: the advisory exception was explicitly introduced for **bootstrap recovery**, while the repository has already reached `APPLICATION-GOLDEN-STATE-v1` and entered Post-Golden Hardening.

## Smallest corrective bite

Wave 03 changes governance only:

- preserves the historical `bootstrap-recovery` profile as evidence;
- introduces the active `post-golden-hardening` profile;
- keeps existing Canvas, public-route and release-harness armor mandatory;
- makes `validate:release` mandatory at pre-push;
- removes `validate:release` from the active advisory pre-push list;
- adds `check:tdm:post-golden-release-policy` as an executable regression contract.

## Plain-language meaning

Before this bite, SharkOps could say “release cleared” even when the complete release proof had failed. That made sense only during the temporary bootstrap-recovery period.

After this bite, Post-Golden governance is fail-closed: if the complete release proof fails, pre-push cannot finish as cleared.

## Explicit non-scope

This bite does **not**:

- change Playwright timeouts, workers or browser lifecycle;
- fix E2E determinism (PGH-002);
- change `.gitignore` or generated test artifacts (PGH-003);
- change fonts or offline build behavior (PGH-004);
- alter product UI, Sass, application runtime or Golden State snapshots;
- weaken any existing mandatory gate.

## Regression rule

The repository must fail `check:tdm:post-golden-release-policy` if any future change:

1. reactivates `bootstrap-recovery`;
2. removes `validate:release` from mandatory pre-push;
3. makes `validate:release` advisory again;
4. changes its classification away from `MANDATORY_RELEASE_PROOF`;
5. removes this regression contract from active pre-commit or pre-push governance.
