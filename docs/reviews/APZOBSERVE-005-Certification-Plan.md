# APZOBSERVE-005 — Observability Vertical Certification Plan

**Milestone:** APZOBSERVE-005  
**Date:** 2026-07-17  
**Scope:** Certify the complete Platform Observability metadata-governance vertical. No new product capabilities.

## Classification options

- `PRODUCTION_READY`
- `PRODUCTION_READY_WITH_LIMITATIONS`
- `NOT_PRODUCTION_READY`

## Gates (19)

1. Foundation audit
2. Platform Services audit
3. HTTP/client audit
4. Workbench audit
5. Vertical audit
6. OpenAPI validation
7. Certification harness
8. Scoped vertical coverage
9. Authorization review
10. Tenant-isolation review
11. Organisation-isolation review
12. Persistence review
13. Provider-boundary review
14. Secret-exposure review
15. Status and severity consistency review
16. Operational-readiness review
17. Accessibility review
18. Playwright certification
19. Regression suite

Each gate: **PASS** | **LIMITED** | **FAIL**. Blocking FAIL prevents production-ready classification.

## Intentional exclusions (not defects)

Grafana/Prometheus/Loki/OTel/AlertManager, collection/ingest, streaming, alert evaluation/delivery, incident execution, Event Bus, AI, live Playwright webServer (external Testing slug conflict).

## Command

`pnpm certify:observe-vertical`
