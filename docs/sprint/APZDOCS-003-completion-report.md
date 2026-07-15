# APZDOCS-003 Completion Report

**Milestone:** APZDOCS-003 — Document Platform Services, Gateway & Authorization Integration  
**Status:** COMPLETE  
**Date:** 2026-07-13  
**Next:** APZDOCS-004 — Document HTTP API & Typed Client (**await owner approval — do not start**)

---

## Executive Summary

Delivered Document Platform through platform services and the Platform Service Gateway: `DocumentPlatformGateway` facets, thin service wrappers over Document Core, RequestPipeline production authorization, and `PLATFORM_DOCUMENT_PERMISSIONS` in the platform catalogue. No REST, Workbench, binary transfer via gateway, OCR, AI, search engine, Event Bus, or workers.

## Architecture

```text
PlatformServiceGateway.documents / document*
  → RequestPipeline (documentPlatformOps)
      → Thin Document Platform Service impls
          → DocumentPlatformFoundation (document-core)
              → Persistence + StorageCoordinator + Providers
```

Packages:

| Package | Version |
|---------|---------|
| `@apzhub/document-contracts` | **0.3.0** |
| `@apzhub/document-core` | **0.3.0** |
| `@apzhub/platform-services` | **0.16.0** |
| `@apzhub/document-persistence` | 0.2.0 (unchanged) |
| `@apzhub/document-storage` | 0.1.0 (unchanged) |

## Gateway facets

`documents`, `documentVersions`, `documentStorage`, `documentCollections`, `documentFolders`, `documentTags`, `documentRelationships`, `documentRetention`, `documentAudit`, plus `documentMetadata`, `documentClassification`, `documentSearchMetadata`, `documentDiagnostics`.

Factories: `createDocumentPlatformServices` / `ForProduction` / `ForTest`; `wrapWithPipeline` on registration with `createPlatformServices({ documents })`.

## Domain (core)

- `assignFolder`, `assignCollection`, `applyRetention` on `PlatformDocumentService`
- Gateway remains **metadata-only** — binary store/read stays on Document Core content APIs

## Authorization

- Production operation map (`documentPlatformOps`) for all gateway methods
- `PLATFORM_DOCUMENT_PERMISSIONS` (incl. `document.tag.*`, `folder.*`, `collection.*`, storage/version/reconciliation keys) merged into platform catalogue
- Explicit permission per operation — no production allow-all

## Boundaries honored

- Thin wrappers only — no business logic in platform-services document impls
- No binary transfer via gateway
- No storage provider access from platform services / gateway
- Document packages do not depend on `@apzhub/platform-services`
- No REST / Workbench / uploads / downloads / OCR / AI / search engine / Event Bus / workers

## Testing

| Suite | Result |
|-------|--------|
| `apzdocs-003-platform-services.test.ts` + `apzdocs-003-foundation.test.ts` | **9** Vitest tests passed |
| Architecture audit `scripts/apzdocs-003-platform-services-audit.mjs` | **PASS** (0 violations) |

## Documentation delivered

Architecture (platform services), gateway integration, authorization, developer, consumer guides, this completion report.

## Technical Debt

- No HTTP / OpenAPI / typed client (APZDOCS-004)
- No Workbench Documents UI
- Binary upload/download not exposed on gateway (by design)
- Product consumers (APZREPORT, APZ TCMS evidence) not wired
- Folder/collection SoR expansion remains placeholder-oriented (assign IDs only)

## Recommendation

**APZDOCS-004 — Document HTTP API & Typed Client** — expose Document Platform over `/api/v1/documents` (or equivalent) with OpenAPI and a typed client, reusing gateway facets and the same authz map. **Do not implement until explicit owner approval.**

---

**Stop condition met.** Await explicit owner approval before APZDOCS-004.
