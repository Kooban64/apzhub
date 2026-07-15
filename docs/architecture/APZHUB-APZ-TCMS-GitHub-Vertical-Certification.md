# APZHUB APZ TCMS — GitHub Actions Vertical Certification

**Milestone:** APZTCMS-019 — GitHub Actions Vertical Certification  
**Date:** 2026-07-12  
**Classification:** **PRODUCTION_READY_WITH_LIMITATIONS**  
**Authority:** [ADR-0059](../adr/ADR-0059-apz-tcms-native-product-architecture.md) · [REFERENCE-ADAPTER-STANDARD](./REFERENCE-ADAPTER-STANDARD.md)

---

## Certified path

```text
Workbench
  → Typed Client (createHttpPipelineClient)
    → HTTP API (/api/v1/testing/pipelines)
      → Gateway (gateway.testing.*)
        → RequestPipeline + Authorization
          → Platform Services
            → GitHub Provider (ProviderRegistry)
              → GitHub Reference Adapter (@apzhub/integration-github-actions)
                → Integration SDK (HTTP transport + mapping)
                  → Canonical Models (@apzhub/testing-contracts)
```

## Verdict

The GitHub Actions vertical is certified for production use as a **read-only CI/CD metadata** integration with documented limitations. No new functionality was added in this milestone.

## Supporting audits

| Document | Verdict |
| -------- | ------- |
| [Architecture / Dependency / Boundary Audit](../reviews/APZTCMS-019-architecture-dependency-boundary-audit.md) | PASS — 0 violations |
| [API Audit](../reviews/APZTCMS-019-api-audit.md) | PASS |
| [Workbench Audit](../reviews/APZTCMS-019-workbench-audit.md) | PASS (unit/component) |
| [Security Audit](../reviews/APZTCMS-019-security-audit.md) | PASS |
| [Performance Baseline](../reviews/APZTCMS-019-performance-baseline.md) | COLLECTED |
| [Quality Report](../reviews/APZTCMS-019-quality-report.md) | PASS |
| [Production Readiness](../reviews/APZTCMS-019-production-readiness.md) | **PRODUCTION_READY_WITH_LIMITATIONS** |

## Explicit non-goals (certified as excluded)

Workflow execution/dispatch/rerun/cancel · repository management · Issues/PRs · notifications · realtime · webhooks · Event Bus · AI · deployment · binary artifact download · live GitHub App/OAuth auth.
