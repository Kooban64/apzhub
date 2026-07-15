# Document Retention & Binary Deletion

**Milestone:** APZDOCS-002

## Defaults

- `allowBinaryDeletion: false` in production config patterns
- Coordinator throws `deletion_disabled` unless `allowBinaryDeletion` or `force: true`

## Retention lock

If document lifecycle is `retained` **or** `retentionId` is set, and deletion is not forced / allowed:

→ `retention_lock` error

## Deletion flow (when allowed)

1. Permission `document.storage.delete`
2. Status → `deletion_pending`
3. Provider `deleteObject`
4. Status → `deleted`  
   On provider failure → `reconciliation_required` + `storage_delete_failed`

## Notes

- Metadata retention workflows remain partial (APZDOCS-001 `document.retention` reserved)
- Soft-delete of document metadata ≠ binary purge
- Prefer disabling binary deletion until policy engines land in a later milestone
