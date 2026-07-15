# Document Reconciliation Boundary

**Milestone:** APZDOCS-002

## In scope

Contract + inspect/repair **API surface** on `DocumentContentService`:

- `inspectReconciliation(ctx)` — lists candidates from storage-object statuses (`failed`, `reconciliation_required`, etc.)
- `repairReconciliationIssue(ctx, issueId)` — **stub**: returns `repaired: false` with message that manual repair / workers are out of scope

Permissions: `document.reconciliation.read`, `document.reconciliation.repair`.

Issue kinds (contracts): `orphaned_storage_object` · `metadata_without_object` · `checksum_mismatch` · `failed_deletion` · `incomplete_version_commit`.

## Out of scope

- Background workers / schedulers / cron
- Automatic repair
- Cross-provider orphan sweeps
- Event Bus notifications

## Operator expectation

Treat `reconciliation_required` / `failed` as operator-visible debt until a future milestone adds workers. Inspect is safe to call; repair is intentionally non-operational.

See [ADR-document-reconciliation-model](../decisions/ADR-document-reconciliation-model.md).
