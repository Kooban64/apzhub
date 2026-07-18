# APZHUB Active Backlog

> **Purpose:** Summary index of all active implementation backlogs  
> **Audience:** Engineers, owners, AI agents  
> **Authoritative references:** Individual backlog documents — **full content lives there**  
> **Related documents:** [CURRENT-MILESTONE](./CURRENT-MILESTONE.md) · [docs/backlog/](../backlog/)  
> **Reading order:** When identifying approved work  
> **Last updated:** 2026-07-18  
> **Current status:** Active — **Phase 3 Product Engineering**; Platform Foundation **CLOSED**; OSS-100-12+ / PRH / Event Bus / Outbox **ACCEPTED / CLOSED**; Integration SDK **1.0.0** frozen; **no product programme authorised**

---

## How to use

Each backlog contains phased engineering stories with scope, deliverables, and stop conditions. Read the full backlog before starting any story.

---

## Knowledge Foundation

| Backlog                                                                             | Stories       | Status                                           | Next                                    |
| ----------------------------------------------------------------------------------- | ------------- | ------------------------------------------------ | --------------------------------------- |
| [APZHUB-KF-002 Completion](./completion-reports/APZHUB-KF-002-completion-report.md) | APZHUB-KF-002 | **Complete** — AI-MANIFEST + AI-BOOTSTRAP        | Await owner approval for next programme |
| [APZHUB-KF-001 Completion](./completion-reports/APZHUB-KF-001-completion-report.md) | APZHUB-KF-001 | **Complete** — documentation reconciliation only | —                                       |

---

## Platform Core

| Backlog                                                                                                                                                      | Stories           | Status                                                            | Next                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- | ----------------------------------------------------------------- | -------------------------------- |
| [OSS-100-12+ Completion](../sprint/OSS-100-12-PLUS-completion-report.md) · [Acceptance](./completion-reports/OSS-100-12-PLUS-programme-acceptance-report.md) | OSS-100-12+       | **ACCEPTED / CLOSED** — `@apzhub/platform-provisioning` **0.1.0** | Closed                           |
| [PRH-012–018 Completion](../sprint/PRH-012-018-completion-report.md) · [Acceptance](./completion-reports/PRH-012-018-programme-acceptance-report.md)         | PRH-012–018       | **ACCEPTED / CLOSED**                                             | Closed                           |
| [PCv2-01 Backlog](../backlog/PCv2-01-Backlog.md)                                                                                                             | PRH-001–PRH-018   | PRH-001–018 **ACCEPTED / CLOSED**                                 | PCv2-01 operational slice closed |
| [OSS-100-12 Completion](../sprint/OSS-100-12-completion-report.md) · [Acceptance](./completion-reports/OSS-100-12-programme-acceptance-report.md)            | OSS-100-12        | **ACCEPTED / CLOSED** — `@apzhub/platform-event-bus` **0.1.0**    | Closed                           |
| [PCv2-02 Completion](../sprint/PCv2-02-completion-report.md) · [Acceptance](./completion-reports/PCv2-02-programme-acceptance-report.md)                     | PCv2-02           | **ACCEPTED / CLOSED** — `@apzhub/platform-outbox` **0.1.0**       | Closed                           |
| [SPR-008 Backlog](../backlog/SPR-008-platform-identity-administration-ux-backlog.md)                                                                         | IAUX-001–IAUX-018 | M8-01–06 complete; remaining stories planned                      | Owner approval                   |

---

## Integration SDK

| Backlog                                                                   | Stories            | Status                                                                                               | Next                                    |
| ------------------------------------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------- | --------------------------------------- |
| [OSS-100 Backlog](../backlog/OSS-100-Platform-Integration-SDK-Backlog.md) | OSS-100-01–100-12+ | **100-01–12+ complete** — SDK **1.0.0** frozen; Event Bus **0.1.0**; provisioning **0.1.0** accepted | Closed — await Owner for next programme |

Phases:

- 100-01: Scaffold ✅
- 100-02: Auth & connection ✅
- 100-03: Health, diagnostics, lifecycle ✅
- 100-04: Error translation & observability ✅
- 100-05: AdapterBase ✅ — **Plane adapter gate unlocked**
- 100-06: Shared HTTP Transport ✅ — owner-approved scope (not webhooks)
- 100-07: Mapping Provider Framework ✅ — SDK mapping ≠ platform EntityMappingStore
- 100-08: Webhook & polling contracts ✅ — `@apzhub/integration-sdk` v0.8.0; no ingress/bus/workers
- 100-09: Adapter Development Harness & Certification ✅ — `@apzhub/integration-sdk` v0.9.0 (owner renumber; was “Provisioning” in older drafts)
- 100-10: Integration SDK v1.0 Certification & Release Readiness ✅ — `PRODUCTION_READY_WITH_LIMITATIONS`; remained **0.9.0**
- 100-11: Integration SDK v1.0.0 Wave Certification & Architecture Freeze ✅ — **1.0.0** · **Architecture Frozen** (`pnpm certify:integration-sdk`)
- 100-12: Platform Event Bus & Webhook Ingress ✅ — `@apzhub/platform-event-bus` **0.1.0** · **ACCEPTED / CLOSED**
- 100-12+: Product provisioning flows ✅ — `@apzhub/platform-provisioning` **0.1.0** · **ACCEPTED / CLOSED**

---

## OSS Integration (Projects / Plane)

| Backlog                                                             | Stories           | Status                                                                 | Next                                        |
| ------------------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------- | ------------------------------------------- |
| [OSS-101 Backlog](../backlog/OSS-101-Plane-Integration-Backlog.md)  | OSS-101-01–101-10 | 101-01–10 **complete** (Wave 1 closed)                                 | —                                           |
| [OSS-102 Backlog](../backlog/OSS-102-Zammad-Integration-Backlog.md) | OSS-102-01–102-08 | 102-01–08 **complete** (Wave 2 closed)                                 | —                                           |
| Platform Service Contracts                                          | OSS-110-01        | **complete** (v0.6.0; Support events)                                  | —                                           |
| Platform Service Implementations                                    | OSS-110-02        | **complete**                                                           | —                                           |
| Mapping / Orchestration / Gateway                                   | OSS-110-03        | **complete**                                                           | —                                           |
| Platform Execution Layer                                            | OSS-110-04        | **complete**                                                           | —                                           |
| Persistent Entity Mapping Store                                     | OSS-110-05        | **complete**                                                           | —                                           |
| Production Authorisation & Policy Enforcement                       | OSS-110-06        | **complete**                                                           | —                                           |
| Platform HTTP API Surface                                           | OSS-110-07        | **complete**                                                           | —                                           |
| Platform Task Service / Mapping / Gateway                           | OSS-110-08        | **complete**                                                           | —                                           |
| Task HTTP API Surface                                               | OSS-110-09        | **complete**                                                           | —                                           |
| Plane Collaboration & Intelligence                                  | OSS-101-07        | **complete**                                                           | —                                           |
| Plane Sync, Events & Production Readiness                           | OSS-101-08        | **complete**                                                           | —                                           |
| Plane Operations, Diagnostics & Certification                       | OSS-101-09        | **complete**                                                           | —                                           |
| Wave 1 Certification & Closeout                                     | OSS-101-10        | **complete**                                                           | Reference Adapter certified                 |
| Zammad Discovery & Architecture                                     | OSS-102-01        | **complete**                                                           | Docs only                                   |
| Zammad Integration Foundation                                       | OSS-102-02        | **complete**                                                           | `@apzhub/integration-zammad` v0.1.0         |
| Zammad Core Support Services                                        | OSS-102-03        | **complete**                                                           | `@apzhub/integration-zammad` v0.2.0         |
| Zammad Articles & Attachment Metadata                               | OSS-102-04        | **complete**                                                           | `@apzhub/integration-zammad` v0.3.0         |
| Zammad Search, History & Support Intelligence                       | OSS-102-05        | **complete**                                                           | `@apzhub/integration-zammad` v0.4.0         |
| Zammad Synchronisation, Events & Webhooks                           | OSS-102-06        | **complete**                                                           | `@apzhub/integration-zammad` v0.5.0         |
| Zammad Operations, Diagnostics & Certification                      | OSS-102-07        | **complete**                                                           | `@apzhub/integration-zammad` v0.6.0         |
| Zammad Wave 2 Certification & Closeout                              | OSS-102-08        | **complete**                                                           | CERTIFIED_WITH_LIMITATIONS                  |
| Support Platform Service Contracts / Providers                      | OSS-110-10        | **complete**                                                           | —                                           |
| Support HTTP API Surface                                            | OSS-110-11        | **complete**                                                           | —                                           |
| Support Vertical-Slice Certification & API Closeout                 | OSS-110-12        | **complete** — CERTIFIED_WITH_LIMITATIONS                              | —                                           |
| Support Module UI (Frontend Slice)                                  | OSS-110-13        | **complete** — UI delivered                                            | —                                           |
| Support Module UI Certification                                     | OSS-110-14        | **complete** — **PRODUCTION_READY_WITH_LIMITATIONS**                   | —                                           |
| Shared HTTP Transport                                               | OSS-100-06        | **complete** — `@apzhub/integration-sdk` v0.6.0                        | —                                           |
| Mapping Provider Framework                                          | OSS-100-07        | **complete** — `@apzhub/integration-sdk` v0.7.0                        | —                                           |
| Webhook & Polling Contracts                                         | OSS-100-08        | **complete** — `@apzhub/integration-sdk` v0.8.0                        | —                                           |
| Adapter Development Harness & Certification                         | OSS-100-09        | **complete** — `@apzhub/integration-sdk` v0.9.0                        | —                                           |
| Integration SDK v1.0 Certification & Release Readiness              | OSS-100-10        | **complete** — `PRODUCTION_READY_WITH_LIMITATIONS`; remained **0.9.0** | Promoted under OSS-100-11                   |
| Integration SDK v1.0.0 Wave Certification & Architecture Freeze     | OSS-100-11        | **complete** — **1.0.0** · **Architecture Frozen**                     | Closed — provisioning/Event Bus await owner |

---

## Law Platform

| Backlog                                                                             | Stories           | Status               | Next               |
| ----------------------------------------------------------------------------------- | ----------------- | -------------------- | ------------------ |
| [LAW Platform Backlog](../backlog/LAW-Platform-Backlog.md)                          | LAW-001–LAW-015   | **Milestone closed** | Product validation |
| [LAW-015 Trust Backlog](../backlog/LAW-015-Trust-Accounting-Backlog.md)             | LAW-015-01–015-15 | **Closed**           | —                  |
| [LAW-014 Integration Backlog](../backlog/LAW-014-integration-foundation-backlog.md) | LAW-014 stories   | Reference            | —                  |

---

## APZ TCMS (Testing & Certification)

| Backlog                                                                 | Stories             | Status                                                                                                               | Next                                                             |
| ----------------------------------------------------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [APZTCMS Backlog](../backlog/APZTCMS-Backlog.md)                        | APZTCMS-001–024     | **001–024 complete** (disk: testing-* **0.11.0**)                                                                    | GitLab CI / AI Assist await owner; no further TCMS ID authorised |
| [APZDOCS programme](../sprint/APZDOCS-006-completion-report.md)         | APZDOCS-001+        | **001–006 complete** — **PRODUCTION_READY_WITH_LIMITATIONS**                                                         | Complete                                                         |
| [APZSEARCH programme](../sprint/APZSEARCH-019-completion-report.md)     | APZSEARCH-001+      | **001–019 complete** — Search Platform + Publication **Architecture Frozen** (**PRODUCTION_READY_WITH_LIMITATIONS**) | Closed — further Search needs ADR + owner                        |
| [APZREPORT programme](../sprint/APZREPORT-003-completion-report.md)     | APZREPORT-001–003   | **001–003 complete**                                                                                                 | Reporting **PRODUCTION_READY_WITH_LIMITATIONS**                  |
| [APZWORKFLOW programme](../sprint/APZWORKFLOW-011-completion-report.md) | APZWORKFLOW-001–011 | **001–011 complete** — SoR + Engine **frozen**                                                                       | Owner for **APZWORKFLOW-012** (roadmap)                          |
| [APZMETRICS programme](../sprint/APZMETRICS-006-completion-report.md)   | APZMETRICS-001+     | **006 complete** — Wave freeze (`audit:metrics-wave`); programme **closed/frozen**                                   | Further Metrics requires ADR + owner                             |
| [APZOBSERVE programme](../sprint/APZOBSERVE-006-completion-report.md)   | APZOBSERVE-001–006  | **006 complete** — programme **closed/frozen** (`audit:observe-wave`); Reference Standard                            | Closed — Metrics programme follows                               |
| [APZIDENTITY programme](../sprint/APZIDENTITY-006-completion-report.md) | APZIDENTITY-001–006 | **006 complete** — wave **closed/frozen** (`audit:identity-wave`); Reference Standard published                      | Closed — further Identity needs ADR + owner                      |
| [APZADMIN programme](../sprint/APZADMIN-006-completion-report.md)       | APZADMIN-001–006    | **001–006 complete** — SoR wave **closed/frozen** (**PRODUCTION_READY_WITH_LIMITATIONS**)                            | Closed — Identity programme follows                              |
| [APZCONFIG programme](../sprint/APZCONFIG-006-completion-report.md)     | APZCONFIG-001–006   | **001–006 complete** — SoR wave **closed/frozen** (**PRODUCTION_READY_WITH_LIMITATIONS**)                            | Owner for **APZCONFIG-007** (roadmap only — do not implement)    |
| [APZNOTIFY programme](../sprint/APZNOTIFY-006-completion-report.md)     | APZNOTIFY-001–006   | **001–006 complete** — SoR wave **closed/frozen** (**PRODUCTION_READY_WITH_LIMITATIONS**)                            | Owner for **APZNOTIFY-007** (roadmap only — do not implement)    |
| [APZTCMS Milestone Roadmap](../backlog/APZTCMS-Milestone-Roadmap.md)    | Milestone map       | Active                                                                                                               | Stop before 021                                                  |

---

## Quality Engineering (superseded)

| Backlog                                                        | Stories       | Status                    | Next                                 |
| -------------------------------------------------------------- | ------------- | ------------------------- | ------------------------------------ |
| [QE Backlog](../backlog/APZHUB-Quality-Engineering-Backlog.md) | QE-001–QE-015 | **Superseded** by APZTCMS | Do not implement QE-_; use APZTCMS-_ |

---

## Completed backlogs (reference)

| Backlog                                                                                      | Stories       | Status   |
| -------------------------------------------------------------------------------------------- | ------------- | -------- |
| [SPR-004 Action Framework](../backlog/SPR-004-action-framework-backlog.md)                   | AF-001–AF-022 | Complete |
| [SPR-005 Knowledge & Discovery](../backlog/SPR-005-knowledge-discovery-framework-backlog.md) | DF-001–DF-018 | Complete |
| [SPR-006 Event & Notification](../backlog/SPR-006-event-notification-framework-backlog.md)   | EN-001–EN-018 | Complete |
| [SPR-007 Activity & Timeline](../backlog/SPR-007-activity-timeline-framework-backlog.md)     | AT-001–AT-016 | Complete |

---

## Backlog priority (owner-ratified sequencing)

```text
1. APZHUB-000 (Knowledge Foundation)     — complete
2. OSS-100-05                             — complete
3. OSS-101-04 (Plane adapter)             — complete (Wave 1 closed)
4. OSS-100-06 (Shared HTTP Transport)     — complete
5. OSS-100-07 (Mapping Provider Framework)— complete
6. OSS-100-08 (Webhook & polling)         — complete
7. OSS-100-09 (Harness & Certification)   — complete (v0.9.0)
8. OSS-100-10 (SDK v1.0 Certification)    — complete (PRODUCTION_READY_WITH_LIMITATIONS; remained 0.9.0)
9. APZTCMS-001 (APZ TCMS Vision & Architecture) — **complete**
10. APZTCMS-002 (APZ TCMS Core Platform Foundation) — **complete** (testing-contracts / testing-foundation 0.1.0)
11. APZTCMS-003 (Domain Persistence & Permissions) — **complete** (testing-persistence 0.1.0; schema + RLS)
12. APZTCMS-004 (Manual Test Management / domain services) — **complete** (testing-services 0.1.0; contracts/persistence 0.2.0)
13. APZTCMS-005–020 — **complete** (through GitHub Actions Wave Closeout / CI/CD Reference Adapter)
14. OSS-100-11 (SDK 1.0.0 Wave Freeze) — **complete** · Search Publication wave **closed** (APZSEARCH-019)
15. APZHUB-KF-001 (Knowledge Foundation Reconciliation) — **complete** (documentation only)
16. APZHUB-KF-002 (AI Bootstrap Manifest) — **complete** (AI-MANIFEST + AI-BOOTSTRAP)
17. PCv2-02 (Outbox Workers & Event Replay) — **ACCEPTED / CLOSED** (`@apzhub/platform-outbox` 0.1.0)
18. OSS-100-12 (Platform Event Bus & Webhook Ingress) — **ACCEPTED / CLOSED** (`@apzhub/platform-event-bus` 0.1.0)
19. PRH-012–018 (Production Hardening & Operational Readiness) — **ACCEPTED / CLOSED**
20. OSS-100-12+ (Platform Product Provisioning Flows) — **ACCEPTED / CLOSED** (`@apzhub/platform-provisioning` 0.1.0)
21. GitLab CI (future) / M17 / AI Assist (deferred) / OSS waves 3–9 — await owner after a named programme is approved
22. APZCONFIG-007 / APZNOTIFY-007 / APZWORKFLOW-012 — roadmap only (do not invent IDs)
```

See [PCS-001 Owner Approval](../strategy/PCS-001-owner-approval.md).

---

## Starting work from a backlog

1. Confirm milestone is approved in [CURRENT-MILESTONE](./CURRENT-MILESTONE.md)
2. Read the full backlog document
3. Read depends-on docs listed in the story
4. Follow [AI-WORKFLOW](./AI-WORKFLOW.md)
5. Stop at story/milestone boundary
