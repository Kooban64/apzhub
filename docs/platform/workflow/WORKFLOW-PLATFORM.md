# APZHUB Workflow Platform

> **Programme:** APZHUB-PLATFORM-WORKFLOW-001  
> **Classification:** DOCUMENTATION ONLY  
> **ADRs:** [ADR-0068](../../adr/ADR-0068-workflow-platform-first-class-capability.md) · [ADR-0069](../../adr/ADR-0069-n8n-workflow-engine-provider.md)  
> **Date:** 2026-07-19

---

## 1. Purpose

Provide a **shared Workflow Platform capability** that:

1. Orchestrates automation across APZHUB products under APZHUB branding
2. Abstracts workflow engines (initially n8n CE) via Integration SDK adapters
3. Enforces AuthN/AuthZ, tenancy, audit, health, and correlation on every request
4. Serves **APZ Workflow** and product-triggered automations (Projects, Support, Time, …)

It does **not** embed product-specific business rules and does **not** replace Event Bus, Notifications, Search, or Command Framework.

---

## 2. Responsibilities

| Responsibility                          | Workflow Platform owns                                      |
| --------------------------------------- | ----------------------------------------------------------- |
| Workflow orchestration                  | Yes — platform contracts & services                         |
| Workflow lifecycle                      | Yes — draft → publish → archive (SoR)                       |
| Workflow execution                      | Yes (target) — via adapter; **frozen read-only today**      |
| Workflow scheduling                     | Yes (target) — platform schedules; **absent today**         |
| Workflow history                        | Yes (target) — run history metadata; **absent today**       |
| Workflow templates                      | Yes — SoR templates (present)                               |
| Workflow triggers                       | Yes (target) — event/API/schedule/manual                    |
| Manual tasks / HITL / Approvals         | Yes (target) — platform inbox semantics                     |
| Notifications                           | Publishes events only — delivery via Notification Framework |
| Credentials                             | **References** only — never plain secrets                   |
| Variables                               | Yes (target) — governed variable sets                       |
| Retries / error handling / compensation | Yes (target) — platform policies + adapter                  |
| Health / diagnostics / observability    | Yes — self-report + engine diagnostics                      |
| Provider abstraction                    | Yes — multi-provider ready                                  |

---

## 3. Consumers

| Consumer                                              | How                                                             |
| ----------------------------------------------------- | --------------------------------------------------------------- |
| **APZ Workflow** product                              | Primary Workbench module (commercial)                           |
| **Projects / Support / Time / Documents / Analytics** | Trigger/actions via their Platform Services → Workflow Platform |
| **Identity**                                          | Actors · assignees · AuthZ subjects                             |
| **Notifications**                                     | Delivery of workflow events                                     |
| **Search**                                            | Index workflow/template titles & descriptions                   |
| **Command Framework**                                 | Permission-filtered commands → Platform Services only           |
| **Workbench**                                         | Presentation only — no business logic                           |
| **Integration SDK**                                   | Adapter hosting for engines                                     |
| **Platform Services**                                 | Orchestration home for Workflow* services                       |

---

## 4. Platform boundaries

```text
Presentation (APZ Workflow module / product Workbenches)
  → HTTP /api/v1/workflows/**
  → Auth → Authz → Validation (RequestPipeline)
  → Workflow Platform Services
  → Integration SDK Adapter (n8n …)
  → Engine (n8n CE …)
```

**Forbidden:** Module → n8n; Service → engine without adapter; product logic inside Workflow Platform; Workflow redesign of frozen Event Bus / Notification / Search / Integration SDK packages without their own ADR + Owner.

---

## 5. Relationship to existing APZWORKFLOW wave

| Layer                           | Status on disk | Role under this foundation                               |
| ------------------------------- | -------------- | -------------------------------------------------------- |
| Workflow SoR (management)       | PRWL · frozen  | Baseline lifecycle/catalogue                             |
| Workflow Engine (n8n read-only) | PRWL · frozen  | Baseline discovery/health                                |
| Execute / schedule / HITL       | Absent         | Target platform responsibilities — Owner unlock required |
| Commercial SemVer 1.0.0         | Absent         | APZ-WORKFLOW-001 planning                                |

---

## 6. Non-goals (this programme)

- Implementing contracts, services, APIs, Workbench, or n8n changes
- Lifting APZWORKFLOW freeze without separate Owner Approval
- Selecting Temporal/Camunda/etc. as primary for Release 1.0
- Visual designer as platform MVP
- AI workflow generation

---

## Related

- [WORKFLOW-ARCHITECTURE.md](./WORKFLOW-ARCHITECTURE.md)
- [CAPABILITY-CATALOGUE.md](./CAPABILITY-CATALOGUE.md)
- [APZ-WORKFLOW-001](../../products/apz-workflow/README.md)
