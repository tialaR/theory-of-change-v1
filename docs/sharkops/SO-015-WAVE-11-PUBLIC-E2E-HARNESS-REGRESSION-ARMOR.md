# SO-015 Wave 11 — Public E2E Harness & Regression Armor

Wave 11 closes the browser-harness gap recorded by Wave 10 without changing product runtime.

- `test:e2e:public-routes` performs browser preflight before launching Playwright.
- Bundled Playwright Chromium is preferred when present.
- When the bundled executable is unavailable, an installed Chrome/Chromium executable is selected explicitly.
- Public-route behavior coverage includes every inventoried PUBLIC, PUBLIC_AUTH and PUBLIC_INTERACTIVE route, auth/public separation, 404 behavior and the retired `/canvas-legado` route.
- `test:e2e:public-routes` is mandatory in SharkOps pre-push.
- Tooling failure remains distinguishable from product behavior failure.
- The SO-014 Canvas Golden State remains sealed.

Next: SO-015 Final Public Routes Closeout.

## Wave 11 v1.1 — Playwright system-browser launch hotfix

- Corrects the environment-safe fallback so `TDM_PLAYWRIGHT_EXECUTABLE_PATH` is passed through Playwright `launchOptions.executablePath`.
- The v1 runner already detected the system browser correctly, but the config placed `executablePath` at the wrong level and Playwright silently fell back to its missing bundled Chromium.
- No route, UI, product runtime or architectural ownership changed.
- Wave 11 remains revision 11; this hotfix only makes the already-approved E2E contract executable on the target macOS ARM environment.
