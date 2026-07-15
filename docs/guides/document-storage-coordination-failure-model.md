# Document Storage Coordination — Failure Model

**Milestone:** APZDOCS-002  
**Component:** `createDocumentStorageCoordinator` (`@apzhub/document-core`)

## Happy path

1. Permission checks (`document.storage.write`, `document.version.create`)
2. Reject deleted documents
3. Collect bytes (size limit) + SHA-256
4. Create version (`pending`) + storage object (`writing`)
5. Provider `putObject`
6. Integrity verify → mark version/object `verified`

## Failure outcomes

| Failure | Version status | Domain error |
|---------|----------------|--------------|
| Provider put throws | `failed` | `storage_write_failed` |
| Post-write checksum fail | `reconciliation_required` | `checksum_mismatch` |
| Metadata commit after put fails | `reconciliation_required` | `metadata_commit_failed` |
| AbortSignal aborted | — | `cancelled` |
| Missing permission | — | `forbidden` |
| Delete while retention lock | — | `retention_lock` |
| Binary deletion disabled | — | `deletion_disabled` |
| Provider delete fails | `reconciliation_required` | `storage_delete_failed` |

## Design rule

No two-phase commit across DB and object store. Compensation = status flags + reconciliation inspect contracts (workers deferred).

## Related

- [Reconciliation boundary](./document-reconciliation-boundary.md)
- [ADR-document-metadata-storage-transaction-boundary](../decisions/ADR-document-metadata-storage-transaction-boundary.md)
