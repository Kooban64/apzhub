# APZHUB Platform Event Catalogue (Portfolio)

> **Programme:** APZHUB-PORTFOLIO-001  
> **Classification:** DOCUMENTATION ONLY — catalogue design; no new `event.yaml` / code authorised by this file alone  
> **Date:** 2026-07-19  
> **Status:** Complete — **Awaiting Owner Acceptance**  
> **Authority:** [012](../012-event-driven-architecture-background-processing-workflow-framework.md) · [029](../029-platform-event-sdk-event-bus-event-manifest-specification.md) · ADR-0007 · ADR-0031 · ADR-0052 · ADR-0053  
> **Does not replace:** on-disk `events/**/event.yaml` · [SPR-006 ENF catalogue](../specs/SPR-006-ENF-platform-event-catalogue.md)

---

## 1. Purpose

Canonical **portfolio-level** event catalogue for cross-product collaboration.

- **Existing** events on disk remain source of truth until a delivery programme adds/changes manifests.
- **Target** events document intended Publishers / Consumers for future Owner-approved work.

---

## 2. Envelope standards (all events)

| Field                 | Rule                                                                                          |
| --------------------- | --------------------------------------------------------------------------------------------- |
| **Naming**            | Past-tense domain keys: `{domain}.{entity}.{verb}` (e.g. `projects.task.assigned`)            |
| **Manifest**          | `event.yaml` **before** code (029)                                                            |
| **Publisher**         | Platform Service (or platform runtime for system events) — never Workbench UI                 |
| **Consumers**         | Declared subscribers only (search, activity, notification, audit, jobs, future orchestrators) |
| **Payload ownership** | Publisher’s contracts package / DTO; consumers depend on published schema                     |
| **Versioning**        | Manifest `version` + additive fields preferred; breaking = MAJOR + Owner                      |
| **Idempotency**       | At-least-once delivery; consumers idempotent on `eventId` / business key                      |
| **Correlation**       | `correlationId` required; `causationId` when derived from another event                       |
| **Audit**             | Security-relevant mutations also write immutable audit (separate from event log)              |
| **Tenant**            | Workspace / org context on envelope — never omit for multi-tenant ops                         |

---

## 3. Existing events (disk — illustrative)

| eventKey                        | Publisher                     | Subscribers (declared)          | Path                                                                  |
| ------------------------------- | ----------------------------- | ------------------------------- | --------------------------------------------------------------------- |
| `projects.project.created`      | project-service               | search, activity                | `events/projects/project-created/`                                    |
| `projects.task.assigned`        | project-service               | activity, notification          | `events/projects/task-assigned/`                                      |
| Platform auth / registry events | platform-*                    | per manifest                    | `events/platform/`                                                    |
| SPR-006 builtins                | platform-runtime / frameworks | notifications, audit (metadata) | [SPR-006 catalogue](../specs/SPR-006-ENF-platform-event-catalogue.md) |

> Full inventory: scan `events/**/event.yaml`. This table is not exhaustive.

---

## 4. Target portfolio catalogue (design — not implemented)

### 4.1 Projects

| eventKey                     | Publisher       | Consumers                               | Payload ownership  | Notes                            |
| ---------------------------- | --------------- | --------------------------------------- | ------------------ | -------------------------------- |
| `projects.project.created`   | project-service | search, activity, audit                 | Projects contracts | **Exists**                       |
| `projects.project.updated`   | project-service | search, activity, audit                 | Projects           | Extend as needed                 |
| `projects.project.archived`  | project-service | search, activity, documents*, audit     | Projects           | *Documents consumer = future     |
| `projects.project.completed` | project-service | activity, documents*, analytics*, audit | Projects           | Target for XI-05                 |
| `projects.task.created`      | project-service | search, activity, audit                 | Projects           |                                  |
| `projects.task.updated`      | project-service | search, activity, audit                 | Projects           |                                  |
| `projects.task.assigned`     | project-service | activity, notification, time*, audit    | Projects           | **Exists**; *Time = future XI-02 |
| `projects.task.completed`    | project-service | activity, time*, analytics*, audit      | Projects           |                                  |

### 4.2 Support

| eventKey                   | Publisher       | Consumers                                          | Payload ownership | Notes                                       |
| -------------------------- | --------------- | -------------------------------------------------- | ----------------- | ------------------------------------------- |
| `support.request.created`  | support-service | search, activity, audit, notification*             | Support contracts | **Wired** — APZHUB-1.1-003 (*ENF Attention) |
| `support.request.updated`  | support-service | search, activity, audit, notification*             | Support           | **Wired** — APZHUB-1.1-003                  |
| `support.request.assigned` | support-service | activity, notification*, audit                     | Support           | **Wired** — APZHUB-1.1-003 (*ENF Attention) |
| `support.request.linked`   | support-service | projects*, activity, audit                         | Support           | Target XI-01 (`projectId`/`taskId` refs)    |
| `support.request.closed`   | support-service | search, activity, analytics*, audit, notification* | Support           | **Wired** — APZHUB-1.1-003                  |
| `support.sla.breached`     | support-service | notification*, analytics*, audit                   | Support           | Target XI-04                                |
| `support.article.created`  | support-service | search, activity, audit, notification*             | Support           | **Wired** — APZHUB-1.1-003                  |

### 4.3 Time

| eventKey                 | Publisher             | Consumers                   | Payload ownership | Notes                            |
| ------------------------ | --------------------- | --------------------------- | ----------------- | -------------------------------- |
| `time.timesheet.created` | time-tracking-service | search*, activity, audit    | Time contracts    | Target; Search publisher not yet |
| `time.timesheet.updated` | time-tracking-service | search*, activity, audit    | Time              |                                  |
| `time.timesheet.stopped` | time-tracking-service | activity, analytics*, audit | Time              | Target XI-03                     |
| `time.timesheet.linked`  | time-tracking-service | projects*, activity, audit  | Time              | Target XI-02 (`taskId` ref)      |
| `time.activity.created`  | time-tracking-service | search*, activity, audit    | Time              |                                  |
| `time.customer.created`  | time-tracking-service | search*, audit              | Time              |                                  |

### 4.4 Documents

| eventKey                      | Publisher        | Consumers                            | Payload ownership  | Notes                                           |
| ----------------------------- | ---------------- | ------------------------------------ | ------------------ | ----------------------------------------------- |
| `documents.document.created`  | document-service | search, activity, audit              | Document contracts | Align with Documents SoR when Event Bus allowed |
| `documents.document.linked`   | document-service | projects*, support*, activity, audit | Documents          | Cross-ref IDs only                              |
| `documents.document.archived` | document-service | search, activity, audit              | Documents          |                                                 |

### 4.5 Workflow (orchestration signals)

| eventKey                        | Publisher        | Consumers                | Payload ownership  | Notes                              |
| ------------------------------- | ---------------- | ------------------------ | ------------------ | ---------------------------------- |
| `workflow.definition.published` | workflow-service | activity, audit          | Workflow contracts | Metadata plane today               |
| `workflow.run.requested`        | workflow-service | engine adapter*, audit   | Workflow           | **Future** — execute not certified |
| `workflow.run.completed`        | workflow-service | activity, notify*, audit | Workflow           | Future                             |

n8n remains a **reference adapter**; engine run events require Owner + ADR beyond freeze.

### 4.6 Analytics (consume-mostly)

| eventKey                        | Publisher | Consumers         | Payload ownership           | Notes                                                   |
| ------------------------------- | --------- | ----------------- | --------------------------- | ------------------------------------------------------- |
| _(none published by Analytics)_ | —         | analytics-ingest* | Source domains own payloads | Analytics **subscribes** to Projects/Time/Support facts |

### 4.7 Platform cross-cutting

| eventKey                              | Publisher          | Consumers            | Notes                                             |
| ------------------------------------- | ------------------ | -------------------- | ------------------------------------------------- |
| `system.platform.bootstrap.completed` | platform-runtime   | notifications, audit | SPR-006 builtin                                   |
| `system.platform.health.changed`      | platform-runtime   | notifications        | SPR-006                                           |
| `capability.action.executed`          | command-framework  | notifications, audit | SPR-006                                           |
| `audit.record.written`                | audit-service      | (sink)               | Optional mirror — audit SoR remains authoritative |
| `search.document.published`           | search publication | orchestrator         | Internal search plane                             |
| `activity.item.recorded`              | activity framework | timeline UI          | Derived                                           |

---

## 5. Consumer matrix (target)

| Consumer                                           | Interests                                   | Idempotency expectation                                        |
| -------------------------------------------------- | ------------------------------------------- | -------------------------------------------------------------- |
| **Search Publication**                             | create/update/archive of indexable entities | Upsert by global ID                                            |
| **Activity Timeline**                              | user-visible state changes                  | Dedupe by eventId                                              |
| **Attention / Notifications**                      | assign/mention/SLA/breach                   | Template + preference filtered; freeze applies                 |
| **Audit**                                          | security & compliance mutations             | Append-only; never “update” audit rows                         |
| **Analytics ingest** (future)                      | completed/closed/stopped/SLA                | Aggregate by period; late events allowed                       |
| **Automation Foundation** (APZHUB-1.1-004)         | Registered patterns (`support.*`, …)        | Idempotent journal by envelopeId+registrationId                |
| **Cross-product linker** (future Platform Service) | `*.linked` / `*.completed`                  | Create relationship once per business key                      |
| **Workflow orchestrator** (future execute)         | run requested/completed                     | Exactly-once effect via outbox; trigger intents deferred today |

---

## 6. Versioning & compatibility

| Change type                | Version impact   | Gate                                 |
| -------------------------- | ---------------- | ------------------------------------ |
| Add optional payload field | MINOR / additive | Service programme                    |
| Add new eventKey           | new manifest     | Owner Approval of delivery programme |
| Rename / remove field      | MAJOR            | ADR + Owner                          |
| Change publisher identity  | MAJOR            | ADR + Owner                          |

Downstream products **must not** fork event schemas.

---

## 7. Correlation & audit expectations

| Concern            | Expectation                                                              |
| ------------------ | ------------------------------------------------------------------------ |
| HTTP → Event       | Propagate gateway `correlationId` into event envelope                    |
| Event → Event      | Child sets `causationId` = parent `eventId`                              |
| Cross-product link | Both source mutation audit and target mutation audit share correlationId |
| Failed consumer    | Retry/backoff/DLQ via outbox workers; no silent drop                     |

---

## 8. Implementation readiness (honesty)

| Domain              | Event publish today                                                                  | Catalogue posture                        |
| ------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------- |
| Projects            | Partial (`events/projects/*`)                                                        | Extend carefully                         |
| Support             | **Wired** (APZHUB-1.1-003) — request/article catalogue keys; linked/SLA still Target | ENF Attention + Platform Service publish |
| Time                | **None** (cross-product excluded)                                                    | Design only until programme              |
| Documents           | Excluded from cert non-goals                                                         | Design only                              |
| Workflow execute    | Not certified — trigger intents **deferred** via Automation Foundation               | Design only for execute                  |
| Platform automation | **Wired** (APZHUB-1.1-004) — registration + event/workflow paths                     | In-memory journal MVP                    |
| Analytics           | N/A                                                                                  | Consumer-only design                     |

---

## Related

- [PORTFOLIO-INTEGRATION-STRATEGY.md](./PORTFOLIO-INTEGRATION-STRATEGY.md)
- [AUTOMATION-ROADMAP.md](./AUTOMATION-ROADMAP.md)
- Disk manifests: `events/`
- ENF builtins: [SPR-006-ENF-platform-event-catalogue.md](../specs/SPR-006-ENF-platform-event-catalogue.md)
