# APZHUB Platform Document — Vertical Certification

**Milestone:** APZDOCS-006 — Document Vertical Certification & Production Readiness  
**Date:** 2026-07-13  
**Classification:** **PRODUCTION_READY_WITH_LIMITATIONS**  
**Authority:** Knowledge Foundation · APZDOCS-001 … APZDOCS-005

---

## Certified path

```text
Workbench (/workspace/documents)
  → Typed Client (createHttpDocumentClient)
    → HTTP API (/api/v1/documents)
      → Gateway (gateway.documents / document*)
        → RequestPipeline + Authorization (document.*)
          → Platform Document Services
            → Document Core (@apzhub/document-core)
              → Persistence (@apzhub/document-persistence)
              → Storage Coordinator → Providers (@apzhub/document-storage)
                → Canonical Contracts (@apzhub/document-contracts)
```

## Verdict

The Document Platform is certified as a **production-ready shared APZHUB capability** with documented limitations. No new functionality was added in this milestone. Architecture is frozen at the APZDOCS-005 surface.

## Supporting audits

| Document | Verdict |
| -------- | ------- |
| [Architecture / Dependency / Boundary Audit](../reviews/APZDOCS-006-architecture-dependency-boundary-audit.md) | **PASS** — 0 violations |
| [API Audit](../reviews/APZDOCS-006-api-audit.md) | **PASS** |
| [Typed Client / Workbench Audit](../reviews/APZDOCS-006-workbench-audit.md) | **PASS** (unit/component); Playwright **LIMITED** |
| [Storage Certification](../reviews/APZDOCS-006-storage-certification.md) | **PASS** (CE/self-hosted; no Azure/GCS) |
| [Security Audit](../reviews/APZDOCS-006-security-audit.md) | **PASS** |
| [Performance Baseline](../reviews/APZDOCS-006-performance-baseline.md) | **COLLECTED** |
| [Coverage Baseline](../reviews/APZDOCS-006-coverage-baseline.md) | **PASS WITH LIMITATIONS** |
| [Production Readiness](../reviews/APZDOCS-006-production-readiness.md) | **PRODUCTION_READY_WITH_LIMITATIONS** |
| [Consumer Guide](../developer/APZHUB-Platform-Document-HTTP-Consumer-Integration-Guide.md) | Updated |

## Explicit non-goals (certified as excluded)

Uploads · downloads · binary transfer · OCR · AI · search engine · preview · document editing · version comparison · notifications · email · Event Bus · background workers · realtime · Azure Blob · Google Cloud Storage · product consumer wiring.

## Automated gate

```bash
pnpm audit:document-vertical
pnpm exec vitest run testing/document-vertical testing/document-foundation
pnpm openapi:validate:platform
node scripts/apzdocs-003-platform-services-audit.mjs
node scripts/apzdocs-004-document-http-audit.mjs
node scripts/apzdocs-005-document-workbench-audit.mjs
```
