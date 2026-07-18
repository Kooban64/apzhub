# APZHUB Platform Search — Ecosystem Certification Overview

**Milestone:** APZSEARCH-015 — Cross-Product Search Publication Certification & Production Readiness  
**Date:** 2026-07-15  
**Classification:** **PRODUCTION_READY_WITH_LIMITATIONS**  
**Master report:** [APZSEARCH-015 Completion Report](../sprint/APZSEARCH-015-completion-report.md)

---

## Certified publication ecosystem

```text
Projects / Support / Documents / APZ TCMS / Reporting
  → product Search Publication Adapters (010–014)
    → @apzhub/search-integration (009)
      → (future) Search Platform indexing bridge (016+)
        → Provider / Meilisearch (frozen 001–008)
```

Search Platform query/management vertical remains **PRODUCTION_READY_WITH_LIMITATIONS** (APZSEARCH-008). Publication adapters are certified metadata publishers into the Integration Framework; durable indexing orchestration is **not** in scope for 015.

## Classification

**PRODUCTION_READY_WITH_LIMITATIONS** — publication contract complete across five products; in-memory journals; Platform Service hooks not wired; ADR-0064 public index HTTP omitted; Playwright LIMITED (008); OCR/AI excluded; indexing bridge deferred to APZSEARCH-016.

## Review pack

| Document                   | Path                                                                                                         |
| -------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Publication overview       | [APZSEARCH-015-publication-certification.md](./APZSEARCH-015-publication-certification.md)                   |
| Canonical entity catalogue | [APZSEARCH-015-canonical-entity-catalogue.md](./APZSEARCH-015-canonical-entity-catalogue.md)                 |
| Publication contract       | [APZSEARCH-015-publication-contract-certification.md](./APZSEARCH-015-publication-contract-certification.md) |
| Security                   | [APZSEARCH-015-security-certification.md](./APZSEARCH-015-security-certification.md)                         |
| Dependency / boundaries    | [APZSEARCH-015-dependency-certification.md](./APZSEARCH-015-dependency-certification.md)                     |
| Production readiness       | [APZSEARCH-015-production-readiness.md](./APZSEARCH-015-production-readiness.md)                             |
| Coverage baseline          | [APZSEARCH-015-coverage-baseline.md](./APZSEARCH-015-coverage-baseline.md)                                   |

## Quality gate

```bash
pnpm audit:search-publication
pnpm exec vitest run testing/search-publication
```

## Next (not authorised)

**APZSEARCH-016 — Product Indexing Orchestration Framework** only. Stop.
