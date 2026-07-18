# APZSEARCH-015 — Publication Certification

**Date:** 2026-07-15  
**Classification:** **PRODUCTION_READY_WITH_LIMITATIONS**

---

## Scope

Re-certify Cross-Product Search Integration Framework (**009**) and product publication adapters (**010–014**) without new functionality.

| Package                      | Version   | Milestone | Role                                |
| ---------------------------- | --------- | --------- | ----------------------------------- |
| `@apzhub/search-integration` | **0.1.0** | 009       | Cross-product publication framework |
| `@apzhub/search-projects`    | **0.1.0** | 010       | Projects metadata publisher         |
| `@apzhub/search-support`     | **0.1.0** | 011       | Support metadata publisher          |
| `@apzhub/search-documents`   | **0.1.0** | 012       | Documents metadata publisher        |
| `@apzhub/search-testing`     | **0.1.1** | 013       | APZ TCMS metadata publisher         |
| `@apzhub/search-reporting`   | **0.1.0** | 014       | Reporting metadata publisher        |

## Certified behaviour

- Eight publication operations per product publisher: publish · update · remove · validate · preview · diagnostics · lifecycle · statistics
- Product isolation (no sibling adapter imports)
- Framework-only sink coupling (in-memory / explicit production sink)
- Metadata-only drafts (no binaries, report bodies, engine IDs, provider leakage)
- Frozen Search Platform stack (contracts / persistence / SDK / Meilisearch / platform-services)

## Out of scope

- Search Platform / HTTP / Workbench changes
- Meilisearch / SDK / persistence behaviour
- Product indexing orchestration bridge (→ **016**)
- OCR / AI / semantic / vector / Event Bus / workers

## Evidence

- `pnpm audit:search-publication` → **PASS** (0)
- Prior audits `audit:search-integration` … `audit:search-reporting` → **PASS**
- Harness `testing/search-publication` → **PASS**
