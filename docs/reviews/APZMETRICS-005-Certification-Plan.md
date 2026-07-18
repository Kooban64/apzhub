# APZMETRICS-005 — Certification Plan

**Date:** 2026-07-18  
**Milestone:** Metrics Vertical Certification & Production Readiness  
**Scope:** Certification only — no new platform capabilities

## Objectives

1. Re-validate architecture boundaries across APZMETRICS-001–004
2. Certify authorization, HTTP, typed client, Workbench, OpenAPI, bootstrap, security
3. Produce composite command `pnpm certify:metrics-vertical`
4. Classify production readiness
5. Stop before APZMETRICS-006

## Gates

| Gate                                 | Blocking                                           |
| ------------------------------------ | -------------------------------------------------- |
| Prior audits 001–004                 | Yes                                                |
| `audit:metrics-vertical`             | Yes                                                |
| `openapi:validate:platform`          | Yes                                                |
| Certification harness + regression   | Yes                                                |
| Scoped coverage lines/functions ≥95% | Yes (functions <95% = LIMITED)                     |
| Playwright Workbench `--list`        | Yes to list; live run LIMITED if external conflict |

## Exclusions (intentional)

Formula/KPI/aggregation/threshold execution; analytics; reporting; dashboards; Prometheus/Grafana/OTel; collection; Event Bus; AI.
