# APZDOCS-006 — Workbench & Typed Client Audit

**Date:** 2026-07-13  
**Verdict:** **PASS** (unit/component) · Playwright **LIMITED**  
**Certification:** APZDOCS-006

---

## Typed client

Factory: `createHttpDocumentClient()` · Accessor: `document-api.ts` · Mock: `createMockDocumentClient()`

Certified methods: `listDocuments` · `getDocument` · `createDocumentMetadata` · `updateDocumentMetadata` · `archiveDocument` · `restoreDocument` · `listVersions` · `getVersion` · `getStorageMetadata` · `assignFolder` · `assignCollection` · `classify` · `tag` · `relate` · `applyRetention` · `listAudit` · `listMetadata` · `getDiagnostics`

Constraints verified: `/api/v1/documents` only · no core/gateway imports · mock parity for tests · AbortSignal support.

## Workbench

Route: `/workspace/documents` · Manifests: `platform-documents*` · View: `PlatformDocumentsView`

| Concern | Result |
| ------- | ------ |
| Navigation (11 sections) | **PASS** |
| Commands (Refresh, View*, Open*, Inspect, Copy IDs) | **PASS** |
| Filtering / sorting / pagination | **PASS** |
| Accessibility (ARIA toolbar/status/alert, labelled filters, keyboard rows) | **PASS** |
| Metadata / diagnostics inspection | **PASS** (safe fields only) |
| No editing / binary ops | **PASS** |

## Playwright

Spec: `testing/playwright/e2e/apzdocs-005-platform-documents-workbench.spec.ts`  
**LIMITED** — app `webServer` fails to start due to an **unrelated** Next.js dynamic route slug conflict (`relationshipId` ≠ `resourceType`). Recorded as an external repository limitation, not a Document Platform defect. Vitest workbench coverage remains authoritative for this certification.
