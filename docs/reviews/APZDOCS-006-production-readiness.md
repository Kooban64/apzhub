# APZDOCS-006 — Production Readiness

**Date:** 2026-07-13  
**Classification:** **PRODUCTION_READY_WITH_LIMITATIONS**  
**Certification:** APZDOCS-006

---

## Checklist

| Area                                          | Status                                    |
| --------------------------------------------- | ----------------------------------------- |
| Canonical contracts                           | ✅                                        |
| Document Core + immutable versions            | ✅                                        |
| PostgreSQL persistence schema + repos         | ✅                                        |
| Filesystem + S3-compatible providers          | ✅                                        |
| Platform Services + Gateway + RequestPipeline | ✅                                        |
| Production `document.*` authorization         | ✅                                        |
| HTTP API + OpenAPI                            | ✅                                        |
| Typed client + mock                           | ✅                                        |
| Product-neutral Workbench                     | ✅                                        |
| Architecture / dependency / boundary audits   | ✅ 0 violations                           |
| Security (authn/authz/redaction/isolation)    | ✅                                        |
| Binary upload/download HTTP                   | ❌ Excluded (by design)                   |
| OCR / AI / search                             | ❌ Excluded                               |
| Live Playwright in this environment           | ⚠️ LIMITED (unrelated Next slug conflict) |
| Live postgres/S3 unit coverage matrix         | ⚠️ LIMITED (stubs; ops deploy separately) |
| Product consumer wiring                       | ❌ Documented only                        |

## Why not unqualified PRODUCTION_READY

Binary transfer HTTP is intentionally absent; Playwright and live provider coverage are limited by environment/design; product consumers not yet wired.

## Why not READY_WITH_LIMITATIONS / NOT_READY

The certified metadata path is complete and gated: Workbench → client → HTTP → gateway → services → core → persistence/storage. Audits pass with zero boundary violations. Suitable for production **metadata** workloads with documented exclusions.

## Frozen architecture

No new APIs, providers, Workbench features, or domain behaviour may be added without a new approved milestone.
