# SO-016 Wave 04 — Redirect Policy Contract

Status: ACTIVE.

## Proven problem

Wave 01 proved `sanitizeReturnTo` accepted any single-slash-prefixed value. That correctly rejected external and protocol-relative targets but still allowed `/login` itself. Because `AuthPage` redirects an already authenticated user to the sanitized target, `/login?returnTo=/login` could self-target instead of returning to the application.

## Decision

Keep the policy deliberately narrow:

- preserve legitimate local application paths exactly;
- keep rejecting external and protocol-relative destinations;
- reject the `/login` route itself, including query/hash variants, to `AUTH_DEFAULT_RETURN_TO` (`/canvas`);
- keep one canonical sanitizer consumed by `AuthPage`, `loginAction` and `requireAuthenticatedSession`.

No broad allowlist or invented route policy is introduced.

## Executable armor

`npm run check:tdm:auth-protected-surfaces:wave04` verifies the sanitizer invariant, its focused tests, all three redirect consumers and the audit resolution.

## Next attack

SO-016 Wave 05 — Auth Facade Consumption Boundary, targeting AUTH-004.
