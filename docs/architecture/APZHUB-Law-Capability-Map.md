# APZHUB Law Platform — Capability Map

> **Product:** Law Firm Platform v1.0  
> **Platform baseline:** [Platform Version 5.0](../releases/APZHUB-Platform-v5.0.md) — **frozen**  
> **Status:** Planning map — no implementation  
> **Authority:** [Law Platform Reference Architecture](./APZHUB-Law-Platform-Reference-Architecture.md)

---

## Purpose

Every major Law Platform module maps to the platform frameworks it **consumes** and **validates**. Legal modules must not duplicate platform functionality.

Legend: **Primary** = main validation target · **Secondary** = exercised incidentally · **—** = not applicable

---

## Summary matrix

| Legal module         |   Runtime   |  Workbench  |   Actions   |  Knowledge  |  Events   | Notifications |  Timeline   |
| -------------------- | :---------: | :---------: | :---------: | :---------: | :-------: | :-----------: | :---------: |
| Foundation           | **Primary** |  Secondary  |  Secondary  |      —      | Secondary |       —       |      —      |
| Client Management    |   Primary   | **Primary** | **Primary** | **Primary** |  Primary  |    Primary    |   Primary   |
| Matter Management    |   Primary   | **Primary** | **Primary** | **Primary** |  Primary  |    Primary    | **Primary** |
| Document Management  |   Primary   | **Primary** | **Primary** | **Primary** |  Primary  |    Primary    |   Primary   |
| Time Recording       |   Primary   |   Primary   | **Primary** |   Primary   |  Primary  |    Primary    |   Primary   |
| Billing              |   Primary   |   Primary   | **Primary** |   Primary   |  Primary  |    Primary    |   Primary   |
| Calendar             |   Primary   | **Primary** |   Primary   |   Primary   |  Primary  |  **Primary**  |   Primary   |
| Workflow             |   Primary   |   Primary   | **Primary** |   Primary   |  Primary  |    Primary    | **Primary** |
| Knowledge (legal)    |   Primary   |  Secondary  |  Secondary  | **Primary** | Secondary |   Secondary   |  Secondary  |
| Reporting            |   Primary   |   Primary   |   Primary   | **Primary** |  Primary  |   Secondary   |  Secondary  |
| Trust Accounting     |   Primary   | **Primary** | **Primary** | **Primary** |  Primary  |    Primary    | **Primary** |
| Administration       | **Primary** | **Primary** |   Primary   |   Primary   |  Primary  |    Primary    |  Secondary  |
| Production Readiness | **Primary** |   Primary   |   Primary   |   Primary   |  Primary  |    Primary    |   Primary   |

---

## LAW-001 — Foundation

```text
Law Platform Bootstrap
        ↓
Platform Runtime          ← manifest discovery, lifecycle, health
        ↓
Workbench Framework       ← legal workspace shell registration (empty scaffold)
        ↓
Action Framework          ← platform action catalogue unchanged
        ↓
Knowledge Framework       ← optional legal provider stub declaration
        ↓
Event / Notification      ← legal event namespace registration (stub)
        ↓
Activity / Timeline       ← legal activity types (stub)
```

| Validates     | How                                                           |
| ------------- | ------------------------------------------------------------- |
| **Runtime**   | Legal capability manifests discovered; health fields extended |
| **Workbench** | Empty legal workspace appears on Activity Bar                 |
| **Actions**   | Smoke action in legal manifest executes via shared executor   |
| **Events**    | Legal event registered in EventRegistry bootstrap             |

---

## LAW-002 — Client Management

```text
Client Management
        ↓
Workbench                 ← clients workspace, list/detail views
        ↓
Actions                   ← create client, edit client, archive client
        ↓
Knowledge                 ← ClientKnowledgeProvider
        ↓
Events                    ← client.created, client.updated
        ↓
Notifications             ← assignment / conflict alerts
        ↓
Timeline                  ← client-related activity items
        ↓
Runtime                   ← legal-clients platform service
```

| Event patterns (planned) | `legal.client.created`, `legal.client.updated`, `legal.client.archived` |
| Permission keys (planned) | `legal.client.view`, `legal.client.manage` |

---

## LAW-003 — Matter Management

```text
Matter Management
        ↓
Workbench                 ← primary matter workspace (core validation)
        ↓
Actions                   ← open matter, close matter, change status, assign team
        ↓
Knowledge                 ← MatterKnowledgeProvider (cross-link clients)
        ↓
Events                    ← matter.* domain events
        ↓
Notifications             ← deadline, status, assignment routes
        ↓
Timeline                  ← matter-scoped activity in Context Panel
        ↓
Runtime                   ← legal-matters service
```

**Primary platform validation milestone** — highest Workbench + Timeline + Action density.

---

## LAW-004 — Document Management

```text
Document Management
        ↓
Workbench                 ← document list, preview view, upload panel
        ↓
Actions                   ← upload, version, checkout, link to matter
        ↓
Knowledge                 ← DocumentKnowledgeProvider (full-text metadata)
        ↓
Events                    ← document.uploaded, document.versioned
        ↓
Notifications             ← review required, approval request
        ↓
Timeline                  ← filing and version activity
        ↓
Runtime                   ← legal-documents service + storage adapter
```

Validates document-heavy UX on Workbench views and Knowledge ranking.

---

## LAW-005 — Time Recording

```text
Time Recording
        ↓
Workbench                 ← time entry views, timer panel
        ↓
Actions                   ← log time, submit timesheet, approve entry
        ↓
Knowledge                 ← time entry search by matter/client
        ↓
Events                    ← time.logged, time.submitted
        ↓
Notifications             ← approval workflow alerts
        ↓
Timeline                  ← time logged activity stream
        ↓
Runtime                   ← legal-time service
```

Validates high-frequency Action execution and audit event volume.

---

## LAW-006 — Billing

```text
Billing
        ↓
Workbench                 ← invoice list, billing dashboard
        ↓
Actions                   ← generate invoice, send, record payment
        ↓
Knowledge                 ← invoice/matter billing search
        ↓
Events                    ← billing.invoice.generated, billing.payment.recorded
        ↓
Notifications             ← payment received, overdue invoice
        ↓
Timeline                  ← billing activity history
        ↓
Runtime                   ← legal-billing service
```

Validates financial action permissions and notification priority grouping.

---

## LAW-007 — Calendar

```text
Calendar
        ↓
Workbench                 ← calendar view, deadline sidebar
        ↓
Actions                   ← create hearing, set deadline, reschedule
        ↓
Knowledge                 ← calendar event search
        ↓
Events                    ← calendar.event.created, calendar.deadline.approaching
        ↓
Notifications             ← deadline reminders (in-app; external deferred)
        ↓
Timeline                  ← hearing and deadline activity
        ↓
Runtime                   ← legal-calendar service
```

**Primary notification validation** — time-sensitive routes and badge counts.

---

## LAW-008 — Workflow

```text
Workflow
        ↓
Workbench                 ← task board, approval queue views
        ↓
Actions                   ← assign task, complete, escalate, approve
        ↓
Knowledge                 ← task search across matters
        ↓
Events                    ← task.assigned, task.completed, workflow.transition
        ↓
Notifications             ← task assignment inbox routes
        ↓
Timeline                  ← workflow activity chain
        ↓
Runtime                   ← legal-workflow service
```

Validates action delegation from notification and activity `actionRef` fields.

---

## LAW-009 — Knowledge (Legal Research)

```text
Legal Knowledge
        ↓
Knowledge Framework       ← primary — legal corpus providers
        ↓
Workbench                 ← research overlay integration
        ↓
Actions                   ← cite precedent, attach to matter
        ↓
Events                    ← research.saved (optional)
        ↓
Notifications             ← optional research alerts
        ↓
Timeline                  ← research activity (secondary)
        ↓
Runtime                   ← legal-knowledge content service
```

**Primary Knowledge validation** — multi-provider orchestration and ranking.

---

## LAW-010 — Reporting

```text
Reporting
        ↓
Knowledge                 ← report catalogue search
        ↓
Workbench                 ← report viewer views
        ↓
Actions                   ← run report, export PDF/CSV
        ↓
Events                    ← report.generated
        ↓
Notifications             ← report ready notification
        ↓
Timeline                  ← report run history (secondary)
        ↓
Runtime                   ← legal-reporting service
```

Validates long-running action patterns and export action handlers.

---

## LAW-011 — Administration

```text
Law Administration
        ↓
Workbench                 ← firm settings workspace (not platform M8 admin)
        ↓
Actions                   ← firm config actions
        ↓
Runtime                   ← legal-admin service, config manifests
        ↓
Events / Notifications    ← config change alerts
        ↓
Knowledge                 ← admin entity search
```

**Note:** Platform IAM admin remains Milestone 8 (deferred). Law admin covers **firm-level** settings only.

---

## LAW-012 — Production Readiness

```text
Production Readiness
        ↓
Runtime                   ← health, diagnostics, operator checklist
        ↓
All frameworks              ← E2E law-platform.spec.ts coverage
        ↓
Validation report         ← framework confidence scores
```

Cross-cutting validation of entire Platform 5.0 stack under Law Platform workloads.

---

## LAW-015 — Trust Accounting (**milestone closed**)

```text
Trust Accounting
        ↓
Persistence               ← PostgreSQL journal, allocations, RLS (LAW-015-11) ✅
        ↓
Workbench                 ← trust workspace, 8 sub-views (LAW-015-09) ✅
        ↓
Actions                   ← deposit, withdraw, transfer, reconcile, interest post ✅
        ↓
Events / Notifications    ← legal.trust.* catalogue (in-memory; outbox partial) ⏸
        ↓
Activity / Timeline       ← deferred platform integration ⏸
        ↓
Knowledge                 ← TrustKnowledgeProvider (LAW-015-09) ✅
        ↓
API Framework             ← /api/law/v1/trust/* (LAW-015-11) ✅
```

| Validates         | How                                                 | Status                        |
| ----------------- | --------------------------------------------------- | ----------------------------- |
| **Persistence**   | Append-only journal, RLS, outbox rows on trust post | ✅ Delivered                  |
| **Workbench**     | Trust workspace and eight sub-views                 | ✅ Delivered                  |
| **Actions**       | Segregated trust actions with approval gates        | ✅ Delivered                  |
| **Events**        | Full `legal.trust.*` catalogue                      | ⏸ In-memory; workers deferred |
| **Notifications** | Reconciliation due, large withdrawal alerts         | ⏸ Deferred                    |
| **Timeline**      | Deposit/withdrawal/transfer on matter scope         | ⏸ Deferred                    |
| **Knowledge**     | Trust account and transaction search                | ✅ Delivered                  |
| **API**           | REST resources via shared LAW-014 framework         | ✅ Delivered                  |

**Authority:** [LAW-Trust-Reference-Architecture](./LAW-Trust-Reference-Architecture.md) · **Gate:** milestone closed — await owner approval before Phase 2

---

## Anti-patterns (forbidden)

| Anti-pattern                      | Correct approach                                       |
| --------------------------------- | ------------------------------------------------------ |
| Custom navigation router          | Workbench Registry + View Engine                       |
| Direct NotificationService writes | Publish domain events                                  |
| Direct ActivityService writes     | Activity types + Event Bus                             |
| Parallel search UI                | Knowledge Providers                                    |
| Legal-specific command executor   | Action Framework manifest actions                      |
| Fork of apps/web shell            | Extend existing `ActionWorkbenchShellProvider` pattern |

---

## Related documents

| Document                | Path                                                                                                 |
| ----------------------- | ---------------------------------------------------------------------------------------------------- |
| Canonical domain model  | [APZHUB-Law-Domain-Model.md](./APZHUB-Law-Domain-Model.md)                                           |
| Law Platform backlog    | [LAW-Platform-Backlog.md](../backlog/LAW-Platform-Backlog.md)                                        |
| Law validation strategy | [APZHUB-Law-Platform-Validation-Strategy.md](../strategy/APZHUB-Law-Platform-Validation-Strategy.md) |

---

_APZHUB Law Capability Map — planning only._
