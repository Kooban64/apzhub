# APZHUB Platform Document Architecture

**Milestone:** APZDOCS-001 · extended by **APZDOCS-002**  
**Status:** Complete (foundation + persistence/storage)  
**Scope:** Canonical Document Platform. No UI, REST, OCR, AI, search, Event Bus, or integrations.

## Purpose

The Document Platform is the authoritative APZHUB document management domain. It is **not** a file-storage product. Products consume the platform; business rules live in the platform.

## Architecture

```text
Document
  → Metadata
    → Storage Provider (interface only)
      → Classification
        → Lifecycle
          → Permissions
            → Consumers (Projects, Support, Testing, Reports, …)
```

## Packages

| Package | Version | Role |
|---------|---------|------|
| `@apzhub/document-contracts` | 0.2.0 | Canonical models, permissions, `PlatformDocumentService`, `DocumentContentService` |
| `@apzhub/document-core` | 0.2.0 | Lifecycle/classification rules, storage ports, coordinator, integrity |
| `@apzhub/document-persistence` | 0.2.0 | PostgreSQL + in-memory repositories |
| `@apzhub/document-storage` | 0.1.0 | Filesystem + S3-compatible + memory providers |

## Persistence

Platform SoR tables (metadata only):

- `platform_document`
- `platform_document_metadata`
- `platform_document_tag`
- `platform_document_category`
- `platform_document_relationship`
- `platform_document_retention`
- `platform_document_audit`
- `platform_document_version` (APZDOCS-002)
- `platform_document_storage_object` (APZDOCS-002)

Migrations: `0037`–`0040` (+ RLS).

**No `bytea` / blob columns.** Storage keys are opaque references.

## Explicit exclusions (foundation through APZDOCS-002)

REST API · Workbench · OCR · AI · Search · Preview · Email · Notifications · Event Bus · Integrations · Reporting/TCMS consumer wiring

## Related

- [Domain Model](./APZHUB-Platform-Document-Domain-Model.md)
- [Storage Abstraction](./APZHUB-Platform-Document-Storage-Abstraction.md)
- [Persistence Architecture](./APZHUB-Platform-Document-Persistence-Architecture.md)
- [Storage Provider Architecture](./APZHUB-Document-Storage-Provider-Architecture.md)
- [Classification Model](./APZHUB-Platform-Document-Classification-Model.md)
- [Lifecycle Model](./APZHUB-Platform-Document-Lifecycle-Model.md)
- [Permissions](./APZHUB-Platform-Document-Permissions.md)
- [Developer Guide](../guides/document-platform-developer.md)
- [APZDOCS-002 Completion Report](../sprint/APZDOCS-002-completion-report.md)