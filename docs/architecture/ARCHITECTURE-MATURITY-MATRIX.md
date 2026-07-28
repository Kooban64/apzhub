# APZHUB Architecture Maturity Matrix

> **Programme:** APZHUB-ARCHITECTURE-001  
> **Classification:** DOCUMENTATION ONLY  
> **Status vocabulary:** Production · Implementation Ready · In Development · Planning · Concept · Retired  
> **Date:** 2026-07-19  
> **Evidence:** AI-MANIFEST · Portfolio · Release Register · package.json · OSS-CATALOGUE

---

## Purpose

Classify every major architectural component for portfolio roadmap visibility.

---

## Matrix

| Component                                                   | Classification     | Evidence note                                               |
| ----------------------------------------------------------- | ------------------ | ----------------------------------------------------------- |
| **Platform Runtime**                                        | Production         | Foundation closed; package on disk                          |
| **Workbench Framework**                                     | Production         | Shell in use                                                |
| **Integration SDK 1.0.0**                                   | Production         | Architecture Frozen                                         |
| **Platform Services 0.26.1**                                | Production         | Gateway + domains                                           |
| **HTTP APIs OpenAPI 1.10.0**                                | Production         | `/api/v1`                                                   |
| **Identity / AuthZ / AuthN**                                | Production         | BetterAuth + platform AuthZ; Identity SoR frozen            |
| **Request Pipeline**                                        | Production         | Mandatory path                                              |
| **Configuration / Admin / Notify / Observe / Metrics SoRs** | Production         | Frozen PRWL / metadata planes                               |
| **Search + Publication**                                    | Production         | Architecture Frozen PRWL                                    |
| **Provisioning 0.1.0**                                      | Production         | MVP accepted                                                |
| **Event Bus / Outbox 0.1.0**                                | Production         | MVP (limitations)                                           |
| **Documents SoR**                                           | Production         | APZDOCS-006 frozen PRWL                                     |
| **Workflow SoR + n8n read-only**                            | Production         | Frozen PRWL                                                 |
| **Release Management (docs/ops)**                           | Production         | Operational standards ACTIVE                                |
| **Governance Dashboard**                                    | Planning           | Spec only (GOVERNANCE-001)                                  |
| **APZ Projects 1.1.0**                                      | Production         | ACCEPTED / CLOSED                                           |
| **APZ Time 1.0.0**                                          | Production         | ACCEPTED / CLOSED                                           |
| **APZ Support 1.0.0**                                       | Production         | PRWL; packaging via RELEASES-001                            |
| **APZ Documents (product SemVer)**                          | Planning           | Platform Production; product PR not established             |
| **APZ Analytics**                                           | Planning           | APZ-ANALYTICS-001 · READY WITH CONDITIONS · Metabase ABSENT |
| **APZ Workflow (product SemVer)**                           | Planning           | Platform Production; not Workbench product release          |
| **APZ TCMS**                                                | Production         | PRWL where certified                                        |
| **APZ Law Platform**                                        | In Development     | Validation / commercial path                                |
| **Plane / Kimai / Zammad adapters**                         | Production         | Certified as above                                          |
| **Meilisearch / n8n / GHA adapters**                        | Production         | Reference / frozen                                          |
| **Metabase / Paperless adapters**                           | Concept / Planning | ABSENT                                                      |
| **Grafana / Prometheus / Loki adapters**                    | Concept            | ABSENT                                                      |
| **Faraday / MobSF / Greenbone**                             | Concept            | ABSENT                                                      |
| **Kiwi TCMS integration**                                   | Retired            | Superseded by APZ TCMS                                      |
| **Docker / Postgres / Redis / Caddy (dev)**                 | Production         | Dev operational                                             |
| **AWS mandatory cloud**                                     | Concept            | Not required by foundation                                  |
| **CI (GitHub Actions workflows)**                           | Production         | `.github/workflows/ci.yml`                                  |
| **Playwright / Vitest / QA-002**                            | Production         | PRODUCTION READY                                            |
| **Support 2.0 implementation**                              | Planning           | Planning Awaiting Acceptance — not authorised               |
| **Cross-product automation delivery**                       | Planning           | PORTFOLIO-001 strategy only                                 |

---

## Counts (illustrative)

| Classification       | Role                                            |
| -------------------- | ----------------------------------------------- |
| Production           | Operate and maintain under Owner-gated releases |
| Implementation Ready | May start only with named Owner Approval        |
| In Development       | Active delivery / validation                    |
| Planning             | Specs exist; implementation not authorised      |
| Concept              | Intent / OSS wave planned; no package           |
| Retired              | Do not resurrect without ADR + Owner            |

---

## Related

- [ENTERPRISE-ARCHITECTURE-CATALOGUE.md](./ENTERPRISE-ARCHITECTURE-CATALOGUE.md)
- [PORTFOLIO-STATUS-MODEL](../governance/PORTFOLIO-STATUS-MODEL.md) (governance enums)
