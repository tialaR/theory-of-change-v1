# SO-014 Wave 03 — Dependency Direction Verification

## Audit result
No runtime dependency inversion was found in the final Canvas architecture. No runtime code was changed.

## Sealed direction
- Domain is internal and cannot depend on Application, Engine, React Flow, Infrastructure, Server or UI.
- Engine stays framework-neutral and cannot depend on Application or effect/rendering layers.
- Application may depend on Domain and the public Engine facade, but not React Flow, Infrastructure, Server or UI.
- React Flow is an adapter/render boundary and cannot pull Application, Engine, Infrastructure, Server or UI into itself.
- Infrastructure may implement Domain-facing persistence concerns but cannot point back to Application, Engine, React Flow, Server or UI.
- Server composes Domain, Application and Infrastructure; it cannot depend on Engine, React Flow or UI.
- UI is the outer composition boundary. Existing React Flow direct-import restrictions remain governed by SO-011.

Runtime dependency scanning excludes test/spec files so test fixtures do not redefine production direction.

## Gate
`npm run check:tdm:final-architecture:wave03`

The gate also executes Wave 02, preserving all prior boundary closeouts. Wave 02 progression handling was evolved only to accept registered downstream SO-014 waves; its original boundary invariants remain mandatory.

Next: SO-014 Wave 04 — Public API & Contract Verification.
