# Executive Summary — Platform 1.2.0 Operational Readiness

> **Programme:** APZHUB-OPS-001  
> **Date:** 2026-07-22

## Verdict

# PRODUCTION READY WITH ACTIONS

Platform **1.2.0** is repository-certified and has a mature Operations Framework (Theme A drills/audits, runbooks, health endpoints, security packages). It is **not** unqualified production-cutover ready: production compose remains a scaffold (no app Dockerfile/`web` service), edge TLS/hostnames are incomplete in-repo, Observe live alerting is not automated (PL12-KL-02), and shared-host coexistence remains a material SPOF.

## Domain scores

| Domain              | Status                                     |
| ------------------- | ------------------------------------------ |
| Deployment          | **PARTIAL**                                |
| Infrastructure      | **PARTIAL**                                |
| Security            | **PARTIAL**                                |
| Backup & Recovery   | **PARTIAL** (drill READY · automation GAP) |
| Monitoring          | **PARTIAL**                                |
| Performance         | **PARTIAL** (thin)                         |
| Operations runbooks | **READY**                                  |
| Documentation       | **READY**                                  |
| Risk posture        | **PARTIAL** (managed under PRWL)           |

## Binding honesty

- Do **not** market Email SoR, FIN-001, Workflow Execute, live Search indexing GA, or automated Observe alerting as complete.
- Workflow Execute remains **gated**.
- Grafana/Prometheus are **not** wired in APZHUB compose (legacy Grafana may exist on host only).

## Recommendation

Accept this assessment, complete the **before-production action list** under Change Management, then authorise cutover. See [PRODUCTION-READINESS.md](./PRODUCTION-READINESS.md).
