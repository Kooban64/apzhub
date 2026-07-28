# APZ Documents 1.0.0 — Release Notes

> **Product:** APZ Documents  
> **Version:** **1.0.0**  
> **Status:** Certification filed — **Awaiting Acceptance** (APZ-DOCUMENTS-002)  
> **Certification class:** PRODUCTION_READY_WITH_LIMITATIONS  
> **Date:** 2026-07-19

---

## Summary

First production commercial **APZ Documents** product release. Packages the existing certified Platform Documents vertical (APZDOCS-001…006) as SemVer **1.0.0** — metadata-first document SoR, organisation, permissions, HTTP, Workbench, and Search publication — under APZHUB branding. No platform rebuild. No Paperless adapter.

## Packaged (existing platform — not newly implemented)

| Layer                  | Delivery                                                                   |
| ---------------------- | -------------------------------------------------------------------------- |
| Contracts              | `@apzhub/document-contracts` **0.3.0**                                     |
| Document Core          | `@apzhub/document-core` **0.3.0**                                          |
| Persistence            | `@apzhub/document-persistence` **0.2.0**                                   |
| Storage                | `@apzhub/document-storage` **0.1.0** (filesystem · S3-compatible · memory) |
| Platform Services      | Gateway `documents` / document\* services                                  |
| HTTP APIs              | `/api/v1/documents/*`                                                      |
| Workbench              | `/workspace/documents`                                                     |
| Search publication     | `@apzhub/search-documents` **0.1.0**                                       |
| Vertical certification | APZDOCS-006 **PRODUCTION_READY_WITH_LIMITATIONS** · architecture frozen    |
| Commercial planning    | APZ-DOCUMENTS-001 **ACCEPTED**                                             |

## Consumed platform capabilities

| Capability       | Release 1.0 posture                                                             |
| ---------------- | ------------------------------------------------------------------------------- |
| Identity / AuthZ | BetterAuth + `document.*` permissions (server authoritative)                    |
| Search           | Search publication into Platform Search — no standalone Documents search engine |
| Workflow         | No execute-plane dependency; boundary preserved                                 |
| Analytics        | No Analytics dependency for this packaging                                      |
| Integration SDK  | **1.0.0** Architecture Frozen · native SoR (no DMS adapter)                     |

## Not included (Release 1.0)

Paperless-ngx · uploads/downloads/binary transfer · OCR · AI · preview · rich editing · version binary comparison · Documents-owned notifications · Azure Blob / GCS certified providers · platform redesign

## Known limitations

See [KNOWN-LIMITATIONS.md](../../products/apz-documents/KNOWN-LIMITATIONS.md).

## CHANGELOG

Root [CHANGELOG.md](../../../CHANGELOG.md) — section **[APZ-DOCUMENTS-002]**.
