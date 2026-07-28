# APZHUB Analytics Platform

> **Date:** 2026-07-19  
> **Bootstrap:** [AI-MANIFEST](../../foundation/AI-MANIFEST.md)

| Programme                                                                                                                                                 | Status                  | Recommendation                                                                              |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------- |
| [APZHUB-PLATFORM-ANALYTICS-001](../../foundation/completion-reports/APZHUB-PLATFORM-ANALYTICS-001-programme-acceptance-report.md) Architecture Foundation | **ACCEPTED / CLOSED**   | FOUNDATION READY                                                                            |
| [APZHUB-PLATFORM-ANALYTICS-002](../../foundation/completion-reports/APZHUB-PLATFORM-ANALYTICS-002-programme-acceptance-report.md) Information Model       | **ACCEPTED / CLOSED**   | **FOUNDATION COMPLETE**                                                                     |
| [APZHUB-INTEGRATION-METABASE-001](../../integrations/metabase/README.md) Metabase Foundation                                                              | **ACCEPTED / CLOSED**   | **CERTIFIED_FOUNDATION**                                                                    |
| [APZHUB-PLATFORM-ANALYTICS-003](../../foundation/completion-reports/APZHUB-PLATFORM-ANALYTICS-003-programme-acceptance-report.md) Contracts               | **ACCEPTED / CLOSED**   | `@apzhub/analytics-contracts` **0.1.1**                                                     |
| [APZHUB-PLATFORM-ANALYTICS-004](../../foundation/completion-reports/APZHUB-PLATFORM-ANALYTICS-004-programme-acceptance-report.md) Services                | **ACCEPTED / CLOSED**   | platform-services Analytics services                                                        |
| [APZHUB-PLATFORM-ANALYTICS-005](../../foundation/completion-reports/APZHUB-PLATFORM-ANALYTICS-005-programme-acceptance-report.md) HTTP API                | **ACCEPTED / CLOSED**   | OpenAPI **1.11.0** · [docs/http/analytics](../../http/analytics/README.md)                  |
| [APZHUB-PLATFORM-ANALYTICS-006](../../foundation/completion-reports/APZHUB-PLATFORM-ANALYTICS-006-programme-acceptance-report.md) Workbench               | **ACCEPTED / CLOSED**   | `/workspace/analytics/*` · [docs/workbench/analytics](../../workbench/analytics/README.md)  |
| [APZ-ANALYTICS-002](../../foundation/completion-reports/APZ-ANALYTICS-002-programme-acceptance-report.md) Product Release 1.0                             | **Awaiting Acceptance** | [releases/analytics/1.0.0](../../releases/analytics/1.0.0/README.md) · **PRODUCTION READY** |

**No post-1.0 Analytics extensions (AI / predictive / external BI / custom SQL) authorised.**

---

## Purpose

Shared Analytics Platform architecture and information model enabling APZ Analytics and future analytics capabilities — without redesigning frozen Metrics, Observability, or Reporting SoRs.

---

## Architecture foundation (001)

| Document                                                                     | Purpose                             |
| ---------------------------------------------------------------------------- | ----------------------------------- |
| [ANALYTICS-PLATFORM.md](./ANALYTICS-PLATFORM.md)                             | Canonical platform overview         |
| [ANALYTICS-SERVICE-ARCHITECTURE.md](./ANALYTICS-SERVICE-ARCHITECTURE.md)     | Services · request path             |
| [ANALYTICS-CAPABILITY-MODEL.md](./ANALYTICS-CAPABILITY-MODEL.md)             | Capabilities catalogue              |
| [ANALYTICS-INTEGRATION-MODEL.md](./ANALYTICS-INTEGRATION-MODEL.md)           | Metabase · IAM · Workbench · Search |
| [ANALYTICS-IMPLEMENTATION-ROADMAP.md](./ANALYTICS-IMPLEMENTATION-ROADMAP.md) | Prerequisite phases                 |
| [ANALYTICS-READINESS-ASSESSMENT.md](./ANALYTICS-READINESS-ASSESSMENT.md)     | Architecture readiness              |

## Information model (002)

| Document                                                                 | Purpose                                         |
| ------------------------------------------------------------------------ | ----------------------------------------------- |
| [ANALYTICS-INFORMATION-MODEL.md](./ANALYTICS-INFORMATION-MODEL.md)       | Canonical information model                     |
| [ANALYTICS-DOMAIN-MODEL.md](./ANALYTICS-DOMAIN-MODEL.md)                 | Lifecycle · ownership · aggregates              |
| [ANALYTICS-GLOSSARY.md](./ANALYTICS-GLOSSARY.md)                         | Term definitions                                |
| [ANALYTICS-ENTITY-RELATIONSHIPS.md](./ANALYTICS-ENTITY-RELATIONSHIPS.md) | Relationships · diagrams                        |
| [ANALYTICS-CONTRACT-PLANNING.md](./ANALYTICS-CONTRACT-PLANNING.md)       | Contracts planning (superseded by 003 delivery) |

## Contracts (003)

| Document                                                                       | Purpose                     |
| ------------------------------------------------------------------------------ | --------------------------- |
| [ANALYTICS-CONTRACTS.md](./ANALYTICS-CONTRACTS.md)                             | Canonical contracts package |
| [ANALYTICS-CONTRACTS-COMPATIBILITY.md](./ANALYTICS-CONTRACTS-COMPATIBILITY.md) | Compatibility notes         |
| [ANALYTICS-CONTRACTS-RELEASE-NOTES.md](./ANALYTICS-CONTRACTS-RELEASE-NOTES.md) | Release notes               |

## Services (004)

| Document                                                                             | Purpose                    |
| ------------------------------------------------------------------------------------ | -------------------------- |
| [ANALYTICS-PLATFORM-SERVICES.md](./ANALYTICS-PLATFORM-SERVICES.md)                   | Platform Services overview |
| [ANALYTICS-SERVICES-COMPATIBILITY.md](./ANALYTICS-SERVICES-COMPATIBILITY.md)         | Compatibility matrix       |
| [ANALYTICS-SERVICES-KNOWN-LIMITATIONS.md](./ANALYTICS-SERVICES-KNOWN-LIMITATIONS.md) | Known limitations          |
| [ANALYTICS-SERVICES-RELEASE-NOTES.md](./ANALYTICS-SERVICES-RELEASE-NOTES.md)         | Release notes              |

## HTTP API (005)

| Document                                        | Purpose                                 |
| ----------------------------------------------- | --------------------------------------- |
| [HTTP API pack](../../http/analytics/README.md) | Canonical `/api/v1/analytics/*` surface |

## Workbench (006)

| Document                                              | Purpose                                   |
| ----------------------------------------------------- | ----------------------------------------- |
| [Workbench pack](../../workbench/analytics/README.md) | Canonical `/workspace/analytics/*` module |

## ADRs

| ADR                                                             | Topic                                       | Status       |
| --------------------------------------------------------------- | ------------------------------------------- | ------------ |
| [ADR-0066](../../adr/ADR-0066-analytics-platform-boundaries.md) | Boundaries vs Observe / Metrics / Reporting | **Accepted** |
| [ADR-0067](../../adr/ADR-0067-metabase-analytics-provider.md)   | Metabase provider · abstraction             | **Accepted** |

---

## Recommendation (002)

# FOUNDATION COMPLETE

Documentation foundation (architecture + information model) is complete. Implementation of Metabase/contracts/services still requires separate Owner Approvals.

---

## Related

- [APZ Analytics Release 1.0 pack](../../products/apz-analytics/README.md)
- Completion 002: [APZHUB-PLATFORM-ANALYTICS-002-completion-report](../../sprint/APZHUB-PLATFORM-ANALYTICS-002-completion-report.md)

---

## STOP

Do not extend Analytics beyond approved Release 1.0 scope. Await Owner Acceptance of APZ-ANALYTICS-002; then named Approvals for any post-1.0 work.
