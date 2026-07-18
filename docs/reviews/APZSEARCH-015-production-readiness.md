# APZSEARCH-015 — Production Readiness

**Date:** 2026-07-15  
**Classification:** **PRODUCTION_READY_WITH_LIMITATIONS**  
**Certification:** APZSEARCH-015 (publication ecosystem) · APZSEARCH-008 (platform vertical)

---

## Checklist

| Area                                                                                                                   | Status                                           |
| ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Search Integration Framework **0.1.0**                                                                                 | ✅                                               |
| Projects / Support / Documents / Reporting adapters **0.1.0**                                                          | ✅                                               |
| Testing adapter **0.1.1**                                                                                              | ✅                                               |
| Eight publication operations per product                                                                               | ✅                                               |
| Canonical entity catalogues + product isolation                                                                        | ✅                                               |
| Safe-fields / leak scanners                                                                                            | ✅                                               |
| Dependency / boundary audits 009–014 + 015                                                                             | ✅ 0 violations                                  |
| Frozen platform stack (contracts 0.4.0 · persistence 0.2.0 · SDK 0.1.0 · Meilisearch 0.1.0 · platform-services 0.18.0) | ✅                                               |
| Durable Search Platform indexing bridge                                                                                | ❌ Deferred to **APZSEARCH-016**                 |
| Platform Service lifecycle hook wiring                                                                                 | ❌ Not wired (hooks exist as explicit callables) |
| Public index/document HTTP                                                                                             | ❌ Excluded (ADR-0064)                           |
| OCR / AI / semantic / vector / Event Bus / workers                                                                     | ❌ Excluded                                      |
| Playwright / Next live webServer                                                                                       | ⚠️ LIMITED (008 external Testing slug conflict)  |
| In-memory publication journals                                                                                         | ⚠️ Default test / local sinks until 016          |

## Why PRODUCTION_READY_WITH_LIMITATIONS

Publication adapters and the Integration Framework are complete, audited, and coverage-certified for metadata publication. Production suitability holds for **controlled publication into the framework** with known exclusions: journals are not yet the durable Platform index pipeline; hooks are not auto-wired; platform query path remains separately LIMITED per 008.

## Why not unqualified PRODUCTION_READY

Indexing orchestration, durable sink ↔ Meilisearch bridge, and Platform Service call-site wiring remain future work (**016**). Same class as APZSEARCH-008 vertical + Documents/Reporting product certifications.

## Why not CERTIFIED_WITH_LIMITATIONS only

Contract conformance, security scanners, and dependency isolation pass with zero certification audit violations. Suitable to mark publication layer production-ready **with** the documented limitations above.

## Frozen architecture

No new product adapter behaviour, Meilisearch changes, or Search Platform APIs without a new approved milestone. **Recommended next:** APZSEARCH-016 — Product Indexing Orchestration Framework only.
