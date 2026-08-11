# SO-021 Wave 02 — Application-Wide Regression Contract

## Contract

The application-wide gate composes the latest cumulative architecture closeout plus cross-cutting verification. It does not replay every historical closeout.

Order:
1. SO-020 cumulative infrastructure/runtime closeout
2. Golden State
3. typecheck
4. scoped auth/canvas lint
5. unit tests
6. SharkOps structural verification

Historical closeouts remain evidence in their own gates and ledgers; they are not redundantly replayed by the aggregate contract.

No targeted suite is merged, weakened or replaced.
