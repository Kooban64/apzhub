# Analytics Platform — Implementation Roadmap

> **Programme:** APZHUB-PLATFORM-ANALYTICS-001  
> **Classification:** DOCUMENTATION ONLY — not a delivery authorisation  
> **Date:** 2026-07-19

---

## Phases (prerequisite order)

| Phase  | Name                                 | Outcome                                          | Blocks               |
| ------ | ------------------------------------ | ------------------------------------------------ | -------------------- |
| **P0** | Foundation docs (this programme)     | Architecture + ADRs                              | —                    |
| **P1** | Analytics Integration                | Metabase adapter on disk + certified             | Product Analytics IR |
| **P2** | Analytics Contracts                  | `service.yaml` / contracts package · permissions | P3                   |
| **P3** | Analytics Platform Services          | Gateway facets · registry · embed orchestration  | P4                   |
| **P4** | Analytics HTTP APIs                  | `/api/v1/analytics/**` · OpenAPI · typed client  | P5                   |
| **P5** | Workbench Module                     | APZ Analytics module UI                          | P6                   |
| **P6** | Product Implementation / Release 1.0 | Curated dashboards · cert · SemVer packaging     | —                    |

Each phase requires a **named Owner Approval**. This document does not approve P1–P6.

---

## Mapping to APZ-ANALYTICS-001 conditions

| Product condition          | Satisfied by                                          |
| -------------------------- | ----------------------------------------------------- |
| C1 Metabase adapter        | **P1**                                                |
| C2 Architecture ADR        | **P0** (ADR-0066/0067) — Acceptance of this programme |
| C3 Contracts + permissions | **P2**                                                |
| C4 Services + HTTP         | **P3–P4**                                             |
| C5 Module design           | **P5** (docs may precede code)                        |
| C6 Implementation Approval | Separate Owner Approval                               |

---

## Parallelism

- P1 may start after Owner Approval without waiting for P5.
- P2 should start with or immediately after P1.
- Do not start P5 product UI before P4 client exists (reference pattern: Time).

---

## Explicitly not in early phases

AI/ML analytics · SQL builder · Grafana/Prometheus adapters · Notification alert bridge · Hosted SaaS.

---

## Related

- [ANALYTICS-READINESS-ASSESSMENT.md](./ANALYTICS-READINESS-ASSESSMENT.md)
- [apz-analytics IMPLEMENTATION-PLAN](../../products/apz-analytics/IMPLEMENTATION-PLAN.md)
