# APZOBSERVE-005 — Vertical Certification

**Date:** 2026-07-17  
**Classification:** **PRODUCTION_READY_WITH_LIMITATIONS**

## Certified path

```text
Observability Administration Workbench
  → Observability Typed Client (apps/web/lib/observe)
  → /api/v1/observe/*
  → gateway.observe.*
  → RequestPipeline → Production Authorization
  → Observability Platform Services → Core → Persistence → PostgreSQL
```

## Gate summary

| #   | Gate                        | Result                                                               |
| --- | --------------------------- | -------------------------------------------------------------------- |
| 1   | Foundation audit            | PASS                                                                 |
| 2   | Platform Services audit     | PASS                                                                 |
| 3   | HTTP/client audit           | PASS                                                                 |
| 4   | Workbench audit             | PASS                                                                 |
| 5   | Vertical audit              | PASS                                                                 |
| 6   | OpenAPI 1.8.0               | PASS                                                                 |
| 7   | Certification harness       | PASS                                                                 |
| 8   | Scoped coverage             | PASS — lines **98.22%** · functions **96.97%** · branches **76.52%** |
| 9   | Authorization review        | PASS                                                                 |
| 10  | Tenant isolation            | PASS (in-memory + RLS migrations); live PG may be LIMITED            |
| 11  | Organisation isolation      | PASS (context on ServiceRequestContext; RLS ready)                   |
| 12  | Persistence review          | PASS / LIMITED for live PG                                           |
| 13  | Provider boundary           | PASS                                                                 |
| 14  | Secret exposure             | PASS                                                                 |
| 15  | Status/severity consistency | PASS                                                                 |
| 16  | Operational readiness       | PASS                                                                 |
| 17  | Accessibility               | PASS                                                                 |
| 18  | Playwright                  | LIMITED                                                              |
| 19  | Regression                  | PASS                                                                 |

## Intentional non-defects

Provider integrations, collection/ingest, alert delivery, Event Bus, AI are excluded by programme design.
