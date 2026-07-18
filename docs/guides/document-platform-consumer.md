# Document Platform — Consumer Guide

**Milestone:** APZDOCS-005  
**Audience:** Product teams (APZREPORT, APZ TCMS, Documents UI)  
**Status:** HTTP + typed client + Workbench available; certification deferred to APZDOCS-006

---

## Correct consumption path

```text
Browser / Workbench (`/workspace/documents`)
  → createHttpDocumentClient() → /api/v1/documents
      → PlatformServiceGateway.document*
          → Document Core → Persistence / Storage

Server Platform Services
  → PlatformServiceGateway.document* (APZDOCS-003)
      → Document Core → Persistence / Storage
```

Never:

- Product → `document-storage` provider
- Product → `document-persistence` repositories
- Product → Document Core binary APIs from UI packages
- Ad-hoc `fetch` to engines / providers (use typed client)
- Module → connector / Paperless (when OSS Documents wave exists) without Platform Service

## What you can call today (HTTP / typed client)

| Need                                 | Client method / HTTP                                                             |
| ------------------------------------ | -------------------------------------------------------------------------------- |
| List / search metadata               | `listDocuments` / `GET /api/v1/documents`                                        |
| Create / get / archive / restore     | `createDocumentMetadata` / `getDocument` / `archiveDocument` / `restoreDocument` |
| Update title/description             | `updateDocumentMetadata`                                                         |
| Classify / tag / relate              | `classify` / `tag` / `relate`                                                    |
| Folder / collection / retention      | `assignFolder` / `assignCollection` / `applyRetention`                           |
| Versions / storage metadata / verify | `listVersions` / `getVersion` / `getStorageMetadata`                             |
| Audit / diagnostics                  | `listAudit` / `getDiagnostics`                                                   |

Gateway facets remain available for in-process server callers (APZDOCS-003).

## Related

- [HTTP API](../architecture/APZHUB-Platform-Document-HTTP-API.md)
- [Typed Client Guide](../developer/APZHUB-Platform-Document-Typed-Client-Guide.md)
- [HTTP Consumer Integration Guide](../developer/APZHUB-Platform-Document-HTTP-Consumer-Integration-Guide.md)
- [Security Guide](../security/APZHUB-Platform-Document-HTTP-Security-Guide.md)
