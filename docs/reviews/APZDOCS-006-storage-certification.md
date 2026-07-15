# APZDOCS-006 — Storage Certification

**Date:** 2026-07-13  
**Verdict:** **PASS** (self-hosted CE; no Azure/GCS)  
**Packages:** `@apzhub/document-storage` **0.1.0** · `@apzhub/document-core` **0.3.0** · `@apzhub/document-persistence` **0.2.0**

---

## Providers

| Provider | Status |
| -------- | ------ |
| Filesystem | Certified (unit) |
| S3-compatible | Certified (unit; live MinIO optional ops) |
| Memory | Test-only |
| Azure Blob | **Excluded** — not implemented |
| Google Cloud Storage | **Excluded** — not implemented |

## Verified

- Storage coordinator owned by Document Core
- SHA-256 checksum validation / integrity service
- Immutable content versions (persistence + core)
- Reconciliation contracts (inspect; no repair workers in this programme)
- Provider registry + production/test factories
- Platform services thin impls never call providers; composition root wires factories only
- HTTP never exposes object keys / paths / buckets / credentials / signed URLs

## Explicit non-goals

Live multi-cloud provider matrix · Azure · GCS · binary HTTP transfer · background reconciliation workers.
