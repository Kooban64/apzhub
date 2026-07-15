# Document Versioning & Immutability

**Milestone:** APZDOCS-002

## Rules

1. Each successful content store creates a **new** `DocumentContentVersionRecord` with monotonic `versionNumber` per document/tenant.
2. `immutable` is always `true` (schema CHECK + TypeScript `immutable: true`).
3. Storage keys are deterministic and opaque:  
   `tenants/{tenantId}/documents/{documentId}/versions/{versionId}/content.bin`
4. Providers refuse overwrite of an existing object.
5. Display filenames are metadata only — never used in storage paths.

## Status lifecycle (content version)

`pending` → `writing` → `verified` (success)  
Failures: `failed` or `reconciliation_required`  
Deletion: `deletion_pending` → `deleted`

## Duplicate detection

`findByChecksum` may flag `duplicateChecksumDetected` on store — informational only; versions remain independent records.

## Non-goals (this milestone)

- Full VCS (branch/merge/diff)
- Mutable in-place edits
- Soft versioning without new storage objects

See [ADR-document-immutable-content-versions](../decisions/ADR-document-immutable-content-versions.md).
