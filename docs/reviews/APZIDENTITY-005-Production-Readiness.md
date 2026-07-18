# APZIDENTITY-005 — Production Readiness Classification

**Date:** 2026-07-17  
**Classification:** **PRODUCTION_READY_WITH_LIMITATIONS**  
**Certification:** APZIDENTITY-005 (Identity Administration vertical — metadata management plane)

---

## Checklist

| Area                                                                          | Status                                           |
| ----------------------------------------------------------------------------- | ------------------------------------------------ |
| Canonical contracts **0.2.0** · core **0.2.0** · persistence **0.1.0**        | ✅                                               |
| Platform services **0.23.0** · `gateway.identity.*`                           | ✅                                               |
| RequestPipeline + production authorisation (`identityPlatformOps`)            | ✅                                               |
| HTTP API + OpenAPI Platform Identity Administration (**1.7.0**) · 36 routes   | ✅                                               |
| Typed client + mock + query keys                                              | ✅                                               |
| Workbench `/workspace/identity` + `platform-identity` manifests (16 sections) | ✅                                               |
| Vertical audit `pnpm audit:identity-vertical`                                 | ✅ 0 violations                                  |
| Composite `pnpm certify:identity-vertical`                                    | ✅                                               |
| Prior audits 001–004                                                          | ✅                                               |
| Migrations 0052/0053 · no credential columns                                  | ✅                                               |
| Certification harness (10 journeys)                                           | ✅                                               |
| Scoped coverage lines/functions ≥95%                                          | ✅ **99.00%** / **99.19%** (branches **81.35%**) |
| Authentication / provisioning / directory sync                                | ❌ Excluded by design                            |
| Event Bus / AI                                                                | ❌ Excluded by design                            |
| Live Playwright webServer                                                     | ⚠️ LIMITED (Testing slug conflict — external)    |

## Why PRODUCTION_READY_WITH_LIMITATIONS

The metadata administration vertical is complete end-to-end, boundary-audited, OpenAPI-validated, journey-certified, and coverage-certified for lines/functions. Authentication, provisioning, and directory synchronisation exclusions are intentional product boundaries — the same class of limitation used for Administration / Configuration / Notification certifications.

## Why not unqualified PRODUCTION_READY

No authentication plane, no provisioning, no directory sync, no Event Bus/AI, Playwright live gate LIMITED by external Testing conflict, consolidated branch coverage may remain below 95%.

## Why not NOT_PRODUCTION_READY

Zero architecture violations; production authz active; PostgreSQL required in production; controlled 503 when disabled; credential exclusion certified; Workbench and HTTP surfaces complete for the declared scope.

## Frozen pending wave

Do not add authentication, provisioning, directory sync, Event Bus, AI, or new HTTP/UI capability families without a new approved milestone.

**Recommended next:** **APZIDENTITY-006 — Identity Administration Wave Certification & Architecture Freeze** only.
