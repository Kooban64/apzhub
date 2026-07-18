# APZREPORT-003 — Security Audit

**Date:** 2026-07-13  
**Verdict:** **PASS**  
**Certification:** APZREPORT-003

---

## Authentication

| Check                                                                   | Result   |
| ----------------------------------------------------------------------- | -------- |
| All `/api/v1/reporting/*` routes wrapped with `withPlatformApiAuth`     | **PASS** |
| Session credentials required (`credentials: "include"` on typed client) | **PASS** |
| Unauthenticated requests fail closed (401 mapped in client)             | **PASS** |

## Authorization

| Check                                                       | Result   |
| ----------------------------------------------------------- | -------- |
| Gateway ops use RequestPipeline authorization               | **PASS** |
| Permissions from `PLATFORM_REPORT_PERMISSIONS` (`report.*`) | **PASS** |
| Workbench manifests gate on `report.view`                   | **PASS** |
| Generate / preview / templates / audit split by permission  | **PASS** |
| Superadmin is not a silent bypass (standard authz path)     | **PASS** |

### Permission map (platform reporting)

| Operation class             | Permission         |
| --------------------------- | ------------------ |
| List types / formats (view) | `report.view`      |
| Templates list/get/register | `report.templates` |
| Validate / preview          | `report.preview`   |
| Generate / render           | `report.generate`  |
| Metadata list/get/archive   | `report.audit`     |

## Tenant / organisation isolation

| Check                                                               | Result                                                                 |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Service context carries tenant / org from platform session          | **PASS**                                                               |
| Metadata records include `tenantId` (+ optional `organisationId`)   | **PASS**                                                               |
| Persistence SoR currently product-scoped (TCMS) with RLS migrations | **PASS** with **LIMITATION** — shared platform metadata store deferred |

## Secret redaction

| Check                                                               | Result   |
| ------------------------------------------------------------------- | -------- |
| No credentials in reporting contracts/core                          | **PASS** |
| No secrets in HTTP response envelopes (metadata checksum/body only) | **PASS** |
| Client errors omit stack / engine internals                         | **PASS** |

## Audit

| Check                                                                    | Result   |
| ------------------------------------------------------------------------ | -------- |
| Generation metadata persists actor (`generatedBy`), timestamps, checksum | **PASS** |
| Correlation IDs on HTTP client requests (`x-correlation-id`)             | **PASS** |
| `report.audit` required for metadata inspection APIs                     | **PASS** |

## Explicit security non-goals (this vertical)

Email delivery · notification fan-out · binary blob storage ACLs · scheduling principals · AI prompt injection surfaces.
