# APZHUB Platform Document Persistence Architecture

**Milestone:** APZDOCS-002  
**Status:** Complete  
**Scope:** Production metadata persistence + content version / storage-object SoR. No REST, UI, OCR, AI, search, Event Bus, or workers.

## Purpose

Platform PostgreSQL is the System of Record for document **metadata** and **content-version descriptors**. Binary payloads never live in platform tables. Providers store bytes; the platform stores keys, checksums, and lifecycle status.

## Layering

```text
DocumentContentService / PlatformDocumentService
  → Document Persistence (ports + Postgres | in-memory test)
    → platform_document*
    → platform_document_version
    → platform_document_storage_object
  → DocumentStorageProvider (filesystem | S3 | memory_test)
```

## Packages

| Package                        | Version | Role                                               |
| ------------------------------ | ------- | -------------------------------------------------- |
| `@apzhub/document-contracts`   | 0.2.0   | Content/version/integrity/reconciliation contracts |
| `@apzhub/document-core`        | 0.2.0   | Coordinator, integrity, config, foundation factory |
| `@apzhub/document-persistence` | 0.2.0   | PostgreSQL + in-memory repositories + factories    |
| `@apzhub/document-storage`     | 0.1.0   | Provider implementations (separate package)        |

## Schema (APZDOCS-002)

| Table                              | Purpose                                                          |
| ---------------------------------- | ---------------------------------------------------------------- |
| `platform_document_version`        | Immutable content version metadata (`immutable = true` enforced) |
| `platform_document_storage_object` | Storage object tracking row (status, checksum, key)              |

Migrations: `0039_apz_platform_document_storage`, `0040_apz_platform_document_storage_rls`.  
Also: `platform_document.revision` added for optimistic concurrency.

**No `bytea` / blob columns.** Storage keys are opaque.

## Factories

- `createDocumentPersistenceForProduction({ postgresDb })` — PostgreSQL mandatory; no silent in-memory fallback
- `createDocumentPersistenceForTest({ postgresDb? \| allowInMemoryPersistence: true })` — explicit opt-in for memory

## Transaction boundary

There is **no** distributed transaction across Postgres and object storage. The storage coordinator:

1. Writes pending version + storage-object rows
2. Puts binary to the provider
3. Verifies SHA-256
4. Commits `verified` status (or marks `failed` / `reconciliation_required`)

See [ADR-document-metadata-storage-transaction-boundary](../decisions/ADR-document-metadata-storage-transaction-boundary.md).

## Explicit exclusions

REST · Workbench · OCR · AI · Search · Event Bus · background workers · Azure/GCS implementations

## Related

- [Storage Provider Architecture](./APZHUB-Document-Storage-Provider-Architecture.md)
- [Platform Document Architecture](./APZHUB-Platform-Document-Architecture.md) (APZDOCS-001)
- [Completion Report](../sprint/APZDOCS-002-completion-report.md)
