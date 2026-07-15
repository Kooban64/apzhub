# APZHUB — Document Platform Services Architecture

**Milestone:** APZDOCS-003 — Document Platform Services, Gateway & Authorization Integration  
**Status:** Implemented  
**Date:** 2026-07-13  
**Packages:** `@apzhub/document-contracts` **0.3.0** · `@apzhub/document-core` **0.3.0** · `@apzhub/platform-services` **0.16.0**

---

## Purpose

Expose the Platform Document domain through **Platform Services** and the **Platform Service Gateway**, with production **RequestPipeline** authorisation. Products and future HTTP surfaces consume gateway facets only — never persistence, storage providers, or binary transfer APIs.

## Layering

```text
Product / HTTP (`/api/v1/documents` — APZDOCS-004)
  → PlatformServiceGateway (documents / document* facets)
      → RequestPipeline (authz via operation map)
          → Thin Document Platform Service impls
              → DocumentPlatformFoundation (@apzhub/document-core)
                  → Persistence (@apzhub/document-persistence)
                  → StorageCoordinator → DocumentStorageProvider
```

| Layer | Responsibility | Must not |
| ----- | -------------- | -------- |
| Gateway facets | Typed accessors, pipeline wrapping | Binary I/O, provider SDKs |
| Platform service impls | Map `ServiceRequestContext` → domain; delegate | Business rules, storage SDK imports |
| Document Core | Domain rules, coordinator, integrity | HTTP, gateway, platform-services |
| Persistence / Storage | SoR metadata + binary providers | Called from products |

## Gateway surface (`DocumentPlatformGateway`)

Contract: `packages/document-contracts/src/services/platform-services.ts`

| Facet | Pipeline service key | Role |
| ----- | -------------------- | ---- |
| `documents` | `documentService` | Create, get, summarize, archive, restore |
| `documentVersions` | `documentVersion` | List/get content version **metadata** |
| `documentStorage` | `documentStorage` | Storage metadata, integrity verify, reconciliation inspect |
| `documentCollections` | `documentCollection` | Assign collection |
| `documentFolders` | `documentFolder` | Assign folder |
| `documentTags` | `documentTag` | Tag / list / get tags |
| `documentRelationships` | `documentRelationship` | Relate documents |
| `documentRetention` | `documentRetention` | Apply retention |
| `documentAudit` | `documentAudit` | List audit entries |
| `documentMetadata` | `documentMetadata` | Update metadata |
| `documentClassification` | `documentClassification` | Classify |
| `documentSearchMetadata` | `documentSearchMetadata` | Metadata filter/find (not FTS engine) |
| `documentDiagnostics` | `documentDiagnostics` | Provider/repo readiness (secrets redacted) |

Also available as `gateway.documentPlatform` (full nested object) and individual `gateway.document*` getters on `PlatformServiceGateway`.

## Factories

| Factory | Use |
| ------- | --- |
| `createDocumentPlatformServices` | Compose from persistence + storage bundles |
| `createDocumentPlatformServicesForProduction` | Requires `postgresDb` + production `storageConfig` — **no silent memory fallback** |
| `createDocumentPlatformServicesForTest` | In-memory persistence/storage allowed for tests |
| `wrapDocumentPlatformGatewayWithPipeline` | Applied via `bundle.wrapWithPipeline(pipeline)` when registered on `createPlatformServices({ documents })` |

## Authorization

- `PLATFORM_DOCUMENT_PERMISSIONS` spread into `PLATFORM_SERVICE_PERMISSION_CATALOGUE`
- Explicit `documentPlatformOps` entries in `operation-authorization-map.ts`
- Production mode: every gateway operation requires a mapped permission (no allow-all in production)

See [document-platform-authorization](../guides/document-platform-authorization.md).

## Hard boundaries (APZDOCS-003)

- **No** binary transfer via gateway (`storeContent` / `readContent` / provider `put`/`get` stay in Document Core)
- **No** storage provider access from platform service impls or gateway
- **No** REST / OpenAPI / typed HTTP client
- **No** Workbench / uploads / downloads UI
- **No** OCR, AI, search engine, Event Bus, or workers
- Document packages **must not** depend on `@apzhub/platform-services`

Enforced by `scripts/apzdocs-003-platform-services-audit.mjs`.

## Domain additions (core 0.3.0)

Thin gateway wrappers over existing domain, plus:

- `assignFolder` / `assignCollection` / `applyRetention` on `PlatformDocumentService`

## Related

- [Platform Document Architecture](./APZHUB-Platform-Document-Architecture.md)
- [Document Persistence Architecture](./APZHUB-Platform-Document-Persistence-Architecture.md)
- [Document Storage Provider Architecture](./APZHUB-Document-Storage-Provider-Architecture.md)
- [Gateway integration guide](../guides/document-gateway-integration.md)
- [APZDOCS-003 Completion Report](../sprint/APZDOCS-003-completion-report.md)
