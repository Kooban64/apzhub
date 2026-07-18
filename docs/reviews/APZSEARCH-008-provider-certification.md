# APZSEARCH-008 — Provider Certification

**Date:** 2026-07-14  
**Verdict:** **PASS** (re-certification; no adapter behaviour changes)  
**Package:** `@apzhub/integration-meilisearch` **0.1.0**  
**ADR:** ADR-0060

---

## Re-certified artefacts

| Artefact                                                                                            | Status               |
| --------------------------------------------------------------------------------------------------- | -------------------- |
| Meilisearch Reference Adapter                                                                       | **PASS**             |
| Capability matrix (keyword, filter, sort, facets, highlight; NOT_SUPPORTED: semantic/vector/OCR/AI) | **PASS** (unchanged) |
| Compatibility matrix (CE OSS / self-hosted first)                                                   | **PASS**             |
| Health / diagnostics / configuration validation                                                     | **PASS**             |
| Public API consumption only from execution provider                                                 | **PASS**             |
| Adapter does not import platform-services / apps/web / persistence                                  | **PASS**             |

## Evidence

- `pnpm audit:meilisearch-adapter` — 0 violations
- APZSEARCH-005 coverage baseline: statements/lines **95.01%**
- `pnpm audit:search-execution` — provider resolver + MeilisearchSearchProvider boundaries

## Limitations (by design)

- No live Meilisearch required in unit CI (mock REST)
- No product indexers
- Semantic / vector / OCR / AI remain `NOT_SUPPORTED`

No adapter changes in APZSEARCH-008 except none required (re-certify only).
