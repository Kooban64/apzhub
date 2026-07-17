# APZSEARCH-015 — Security Certification

**Date:** 2026-07-15  
**Status:** **PASS** (publication layer)

---

## Controls certified

| Control | Mechanism |
| ------- | --------- |
| Metadata-only publication | Mappers emit allowlisted / controlled fields only |
| Engine ID rejection | `looksLikePlaneIdentifier` · `looksLikeZammadIdentifier` |
| Storage / credential leakage | `looksLikeStorageLeak` · safe-fields forbidden keys/values |
| Reporting content leakage | `looksLikeReportingLeak` · `parametersJson` / checksum / body patterns |
| Classification | Required on drafts; fail-closed confidential defaults where specified |
| Permissions | Required on publication context; copied onto drafts |
| Tenant / org isolation | Trusted context; cross-tenant reject (product validators) |
| Provider leakage | Forbidden meili/opensearch/primaryKey metadata keys |
| No OCR / AI | Audit forbids OCR/tesseract; excluded from publication scope |

## Product security modules

| Product | Primary module |
| ------- | -------------- |
| Projects | Leak scanner + mandatory metadata (`looksLikePlaneIdentifier`) |
| Support | Leak scanner (`looksLikeZammadIdentifier`) |
| Documents | `security/safe-fields.ts` + `looksLikeStorageLeak` |
| Testing | `security/safe-fields.ts` + `looksLikeStorageLeak` |
| Reporting | `security/safe-fields.ts` + `looksLikeReportingLeak` |

## Platform vertical

APZSEARCH-008 authn/authz/tenant isolation for query/management remains authoritative for HTTP. Publication adapters never talk to HTTP, Meilisearch, or `platform-services`.

## Observations

- Production factories for Documents / Testing / Reporting require explicit sinks (no silent memory).
- Public index HTTP remains omitted (ADR-0064).
