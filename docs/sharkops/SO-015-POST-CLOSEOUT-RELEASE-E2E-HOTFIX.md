# SO-015 Post-Closeout Release E2E Harness Hotfix

SO-015 remains COMPLETE. This maintenance hotfix resolves a tooling inconsistency discovered after closeout: the mandatory Canvas and public-route E2E runners were environment-safe, while the legacy advisory `validate:release` still reached raw `playwright test` through `test:e2e` and therefore failed on the target macOS ARM host without bundled Chromium.

The canonical `test:e2e` script now delegates to an environment-safe full-suite runner. The release pipeline still proves the complete Playwright suite; only browser launch orchestration changed. A mandatory SharkOps gate prevents future regression to raw browser-dependent execution.
