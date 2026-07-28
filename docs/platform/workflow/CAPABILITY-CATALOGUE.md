# Workflow Platform — Capability Catalogue

> **Programme:** APZHUB-PLATFORM-WORKFLOW-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19

---

## Legend

| Tag   | Meaning                                                                   |
| ----- | ------------------------------------------------------------------------- |
| **B** | Baseline on disk (frozen APZWORKFLOW PRWL)                                |
| **T** | Target platform capability (documented; not authorised to implement here) |

---

## Catalogue

| Capability               | Tag                   | Notes                                                   |
| ------------------------ | --------------------- | ------------------------------------------------------- |
| Workflow orchestration   | **T** / **B** partial | SoR orchestration of metadata; run orchestration target |
| Workflow lifecycle       | **B**                 | Draft/publish/archive/restore/versions                  |
| Workflow execution       | **T**                 | Start/cancel/observe runs                               |
| Workflow scheduling      | **T**                 | Cron/calendar schedules                                 |
| Workflow history         | **T**                 | Run history & correlation                               |
| Workflow templates       | **B**                 | SoR templates                                           |
| Workflow triggers        | **T**                 | Event / API / schedule / manual                         |
| Manual tasks             | **T**                 | Operator task inbox                                     |
| Human-in-the-loop (HITL) | **T**                 | Wait states for humans                                  |
| Approvals                | **T**                 | Approve/reject with audit                               |
| Notifications            | **T**                 | Via Notification Framework (events)                     |
| Credentials              | **T**                 | References only                                         |
| Variables                | **T**                 | Governed variable sets                                  |
| Retries                  | **T**                 | Idempotent retry policies                               |
| Error handling           | **T** / **B** partial | Adapter error translation baseline                      |
| Compensation             | **T**                 | Compensating actions / sagas (policy-level)             |
| Health                   | **B**                 | Platform + engine health                                |
| Diagnostics              | **B**                 | Masked diagnostics                                      |
| Observability            | **T** / **B** partial | Correlation IDs; metrics/traces hooks                   |
| Provider abstraction     | **B** / **T**         | n8n reference; multi-provider target                    |

---

## Explicit non-capabilities (platform)

- Product-specific domain rules (belong in product Platform Services)
- Notification delivery transport (SMTP/WebSocket ownership elsewhere)
- Search index engine ownership
- Visual designer (product/optional later — not foundation MVP)
- AI agent orchestration product
