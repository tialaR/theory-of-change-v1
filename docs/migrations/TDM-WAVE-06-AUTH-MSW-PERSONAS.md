# TDM Wave 06: Auth, MSW Server Authority and User-owned Canvas

## Result

- `/login` is a dedicated Server Component route with one client form island.
- `/canvas` and `/canvas/resultado` require an authenticated server session.
- All other application routes remain public.
- Two fixed validation personas authenticate against an MSW Node handler.
- Sessions live in an `httpOnly` cookie and in the mock server module store.
- Canvas projects are partitioned by `ownerId` and `projectId`.
- The HTTP abstraction exposes GET, POST, PUT, PATCH and DELETE.
- Official Canvas writes cross a Server Action before reaching the typed repository.
- `instrumentation.ts` starts MSW in Node; the browser worker remains an isolated client boundary.
- Login, Canvas and route-state copy use `next-intl`.
- The not-found screen exposes 404 explicitly; generic errors reuse the composition without a false 404.

## Persistence boundary

The mock data survives requests and hot reloads while the same Next.js server process is alive. It is deliberately not described as durable production storage and is not shared across independent server processes.

## Validation

The release gate requires TypeScript, scoped ESLint, unit/integration tests, Next production build, Playwright, React Flow contract, ownership contract, Auth/MSW contract, i18n/route-state contract and the full TDM Contract V3.

## Runtime boundary hardening

`LoginActionState` and its initial value live in the Auth application layer. Files marked with `use server` export asynchronous actions only. The Auth gate blocks any regression that exports synchronous state through that boundary.
