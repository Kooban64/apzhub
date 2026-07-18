# APZHUB Platform Search — Vertical Certification Overview

**Milestone:** APZSEARCH-008 — Search Vertical Certification & Production Readiness  
**Date:** 2026-07-14  
**Classification:** **PRODUCTION_READY_WITH_LIMITATIONS**  
**Master report:** [APZSEARCH-008 Completion Report](../sprint/APZSEARCH-008-completion-report.md)

---

## Certified path

```text
Workbench → Typed Client → /api/v1/search → Gateway → RequestPipeline → Authz
  → Search Platform Services → Provider Resolver → Meilisearch Provider
    → Meilisearch Adapter → Search Integration SDK → Meilisearch
```

## Review pack

| Document                             | Path                                                                                                                 |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| Architecture / Dependency / Boundary | [APZSEARCH-008-architecture-dependency-boundary-audit.md](./APZSEARCH-008-architecture-dependency-boundary-audit.md) |
| Security                             | [APZSEARCH-008-security-review.md](./APZSEARCH-008-security-review.md)                                               |
| HTTP                                 | [APZSEARCH-008-http-certification.md](./APZSEARCH-008-http-certification.md)                                         |
| Typed client                         | [APZSEARCH-008-typed-client-certification.md](./APZSEARCH-008-typed-client-certification.md)                         |
| Workbench                            | [APZSEARCH-008-workbench-certification.md](./APZSEARCH-008-workbench-certification.md)                               |
| Provider                             | [APZSEARCH-008-provider-certification.md](./APZSEARCH-008-provider-certification.md)                                 |
| Gateway / Platform                   | [APZSEARCH-008-gateway-platform-certification.md](./APZSEARCH-008-gateway-platform-certification.md)                 |
| Production readiness                 | [APZSEARCH-008-production-readiness.md](./APZSEARCH-008-production-readiness.md)                                     |
| Performance                          | [APZSEARCH-008-performance-notes.md](./APZSEARCH-008-performance-notes.md)                                           |
| Coverage                             | [APZSEARCH-008-coverage-baseline.md](./APZSEARCH-008-coverage-baseline.md)                                           |

## Quality gate

```bash
pnpm audit:search-vertical
pnpm openapi:validate:platform
pnpm exec vitest run testing/search-vertical
```

Scoped vertical coverage (008 re-measure): **97.04%** lines/statements · **97.57%** functions · **89.33%** branches.

## Next (not authorised)

**APZSEARCH-009 — Cross-Product Search Integration Framework** — product indexing adapters only; Search Platform frozen.
