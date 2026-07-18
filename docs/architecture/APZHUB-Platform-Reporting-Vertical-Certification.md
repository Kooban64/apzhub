# APZHUB Platform Reporting — Vertical Certification

**Milestone:** APZREPORT-003 — Reporting Vertical Certification & Production Readiness  
**Date:** 2026-07-13  
**Classification:** **PRODUCTION_READY_WITH_LIMITATIONS**  
**Authority:** Knowledge Foundation · APZREPORT-001 · APZREPORT-002

---

## Certified path

```text
Workbench (/workspace/reporting)
  → Typed Client (createHttpReportingClient)
    → HTTP API (/api/v1/reporting)
      → Gateway (gateway.reporting)
        → RequestPipeline + Authorization (report.*)
          → Platform Reporting Services
            → Reporting Core (@apzhub/reporting-core)
              → Reporting Contracts (@apzhub/reporting-contracts)
                → Output Providers (html/md/pdf/docx/json/csv)
                  → Canonical Models
```

## Verdict

The Reporting Platform is certified as a **production-ready shared APZHUB capability** with documented limitations. No new functionality was added in this milestone. Architecture is frozen at the APZREPORT-002 surface.

## Supporting audits

| Document                                                                                                         | Verdict                               |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| [Architecture / Dependency / Boundary Audit](../reviews/APZREPORT-003-architecture-dependency-boundary-audit.md) | **PASS** — 0 violations               |
| [API Audit](../reviews/APZREPORT-003-api-audit.md)                                                               | **PASS**                              |
| [Workbench Audit](../reviews/APZREPORT-003-workbench-audit.md)                                                   | **PASS** (unit/component)             |
| [Security Audit](../reviews/APZREPORT-003-security-audit.md)                                                     | **PASS**                              |
| [Performance Baseline](../reviews/APZREPORT-003-performance-baseline.md)                                         | **COLLECTED**                         |
| [Coverage Baseline](../reviews/APZREPORT-003-coverage-baseline.md)                                               | **PASS** ≥95% lines (scoped)          |
| [Production Readiness](../reviews/APZREPORT-003-production-readiness.md)                                         | **PRODUCTION_READY_WITH_LIMITATIONS** |
| [Consumer Guide](../developer/APZHUB-Platform-Reporting-HTTP-Consumer-Integration-Guide.md)                      | Updated                               |

## Explicit non-goals (certified as excluded)

Scheduling · notifications · email · AI · template designer · binary document storage · document management · product-specific report packs · Event Bus side effects · new APIs · new UI · new templates · new output providers.

## Automated gate

```bash
node scripts/apzreport-003-reporting-vertical-audit.mjs
pnpm exec vitest run testing/reporting-vertical
pnpm openapi:validate:platform
```
