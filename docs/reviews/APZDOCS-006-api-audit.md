# APZDOCS-006 — API Audit

**Date:** 2026-07-13  
**Verdict:** **PASS**  
**OpenAPI:** `pnpm openapi:validate:platform` — **valid**

---

## Surface

Base path: `/api/v1/documents`  
Handlers: `apps/web/lib/api/v1/handlers/documents.ts`  
Auth wrapper: `withPlatformApiAuth` on all document routes  
Gateway facets: `documents`, `documentVersions`, `documentStorage`, collections/folders/tags/relationships/retention/audit/metadata/classification/searchMetadata/diagnostics

## Verified

| Concern | Evidence |
| ------- | -------- |
| Routes | List/create/get/patch, archive/restore, versions, storage metadata, verify, audit, classify/tags/folder/collection/retention/relationships, tags, diagnostics, reconciliation |
| OpenAPI | Tag **Platform Documents**; canonical DTOs (`CreateDocumentRequest`, …) |
| Validation | Zod schemas in `schemas/documents.ts` |
| Pagination / filtering | Query params (`query`, `status`, `classification`, `tagName`, `limit`) + collection envelopes |
| Authorization | `documentPlatformOps` → `document.*` via RequestPipeline |
| Structured errors | Platform API error envelopes + correlation IDs |
| Diagnostics redaction | Storage keys / reconciliation key hints stripped at HTTP boundary |
| No binary | No multipart / upload / download routes |

## Authz keys (sample)

`document.create` · `document.read` · `document.archive` · `document.restore` · `document.metadata.write` · `document.version.read` · `document.storage.read` · `document.storage.verify` · `document.folder.write` · `document.collection.write` · `document.tag.*` · `document.relationship.write` · `document.retention` · `document.audit` · `document.classify` · `document.reconciliation.read`
