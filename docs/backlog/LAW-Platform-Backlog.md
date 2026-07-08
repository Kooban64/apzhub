# APZHUB Law Platform — Engineering Backlog

> **Product:** Law Firm Platform v1.0  
> **Platform baseline:** [Platform Version 5.0](../releases/APZHUB-Platform-v5.0.md) — **frozen**  
> **Phase:** Platform Validation Phase 1 — planning complete  
> **Mode:** Await owner approval before LAW-001-01  
> **Authority:** [Law Platform v1.0](../releases/APZHUB-Law-Platform-v1.0.md) · [Law validation strategy](../strategy/APZHUB-Law-Platform-Validation-Strategy.md)

---

## Validation rule

**Every story must explicitly state which platform framework(s) it validates.**

Every completed story should increase platform confidence per [validation strategy](../strategy/APZHUB-Law-Platform-Validation-Strategy.md).

---

## Development workflow

```text
Law Platform Requirement
        ↓
Technical Specification
        ↓
Implementation (consumes Platform 5.0 only)
        ↓
Code Review (no platform duplication)
        ↓
Merge
        ↓
Validation evidence update
```

**Rule:** Complete one story before beginning the next within a milestone.

### Effort scale

| Label | Estimate  |
| ----- | --------- |
| S     | 0.5–1 day |
| M     | 1–2 days  |
| L     | 2–3 days  |

---

## Milestone map

```text
LAW-001 Foundation
    ↓
LAW-002 Client Management
    ↓
LAW-003 Matter Management
    ↓
LAW-004 Document Management
    ↓
LAW-005 Time Recording
    ↓
LAW-006 Billing
    ↓
LAW-007 Calendar
    ↓
LAW-008 Workflow
    ↓
LAW-009 Knowledge
    ↓
LAW-010 Reporting
    ↓
LAW-011 Administration
    ↓
LAW-012 Production Readiness
```

---

# LAW-001 — Foundation

| Story      | Title                                            | Validates                       |
| ---------- | ------------------------------------------------ | ------------------------------- |
| LAW-001-01 | Legal architecture & manifest specification      | Runtime (manifest contract)     |
| LAW-001-02 | Legal platform service scaffold                  | **Runtime**                     |
| LAW-001-03 | Legal Workbench workspace registration           | **Workbench**                   |
| LAW-001-04 | Smoke legal action                               | **Action Framework**            |
| LAW-001-05 | Smoke event, notification, activity registration | **Event/Notification/Timeline** |
| LAW-001-06 | Legal health + E2E smoke                         | **Runtime** + cross-framework   |

### LAW-001-01 — Legal architecture & manifest specification

| Field                   | Value                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------- |
| **Objective**           | Authorise Law Platform implementation through manifest spec and architecture appendix |
| **Scope**               | Legal YAML schema; discovery roots; permission key namespace `legal.*`                |
| **Out of scope**        | Handler code; UI                                                                      |
| **Deliverables**        | Spec doc; manifest template; LAW-001 completion criteria                              |
| **Tests**               | N/A — documentation gate                                                              |
| **Dependencies**        | Law Platform readiness approved                                                       |
| **Platform validation** | **Runtime** — manifest contract                                                       |
| **Effort**              | M                                                                                     |

### LAW-001-02 — Legal platform service scaffold

| Field                   | Value                                                             |
| ----------------------- | ----------------------------------------------------------------- |
| **Objective**           | Create root legal platform service discovered by Runtime          |
| **Scope**               | `services/legal-platform/` manifest; lifecycle hooks; diagnostics |
| **Out of scope**        | Business logic; UI                                                |
| **Deliverables**        | Service manifest; bootstrap integration test                      |
| **Tests**               | Integration — discovery + registration                            |
| **Dependencies**        | LAW-001-01                                                        |
| **Platform validation** | **Runtime** — discovery, lifecycle, diagnostics                   |
| **Effort**              | M                                                                 |

### LAW-001-03 — Legal Workbench workspace registration

| Field                   | Value                                                                |
| ----------------------- | -------------------------------------------------------------------- |
| **Objective**           | Register Legal workspace on Activity Bar with placeholder views      |
| **Scope**               | `workbench.navigation`, `workbench.views` in legal manifest          |
| **Out of scope**        | Business views; M8 admin workspace                                   |
| **Deliverables**        | Workspace manifest; navigation integration test                      |
| **Tests**               | Integration — registry bootstrap; E2E workspace visible (LAW-001-06) |
| **Dependencies**        | LAW-001-02                                                           |
| **Platform validation** | **Workbench** — navigation, view registration                        |
| **Effort**              | M                                                                    |

### LAW-001-04 — Smoke legal action

| Field                   | Value                                                                 |
| ----------------------- | --------------------------------------------------------------------- |
| **Objective**           | Register and execute one legal action through shared Action Framework |
| **Scope**               | `workbench.actions` smoke action; handler stub                        |
| **Out of scope**        | Business actions                                                      |
| **Deliverables**        | Action manifest; handler; unit test                                   |
| **Tests**               | Unit — executor; integration — audit event published                  |
| **Dependencies**        | LAW-001-03                                                            |
| **Platform validation** | **Action Framework** — registry, executor, audit hook                 |
| **Effort**              | S                                                                     |

### LAW-001-05 — Smoke event, notification, activity registration

| Field                   | Value                                                                   |
| ----------------------- | ----------------------------------------------------------------------- |
| **Objective**           | Register legal event with parallel notification route and activity type |
| **Scope**               | `events`, `notifications.routes`, `activities.types` blocks             |
| **Out of scope**        | External delivery; persistence                                          |
| **Deliverables**        | Manifest blocks; registry bootstrap test                                |
| **Tests**               | Integration — EventRegistry, NotificationRegistry, ActivityRegistry     |
| **Dependencies**        | LAW-001-04                                                              |
| **Platform validation** | **Event & Notification**, **Activity & Timeline** — registry bootstrap  |
| **Effort**              | M                                                                       |

### LAW-001-06 — Legal health + E2E smoke

| Field                   | Value                                                               |
| ----------------------- | ------------------------------------------------------------------- |
| **Objective**           | Extend health endpoint and add Playwright smoke for legal workspace |
| **Scope**               | `/api/health` `legal` field; `law-platform-foundation.spec.ts`      |
| **Out of scope**        | Full product E2E                                                    |
| **Deliverables**        | Health loader; E2E spec                                             |
| **Tests**               | E2E — workspace visible; health field present                       |
| **Dependencies**        | LAW-001-05                                                          |
| **Platform validation** | **Runtime** health + **Workbench** E2E                              |
| **Effort**              | M                                                                   |

---

# LAW-002 — Client Management

| Story      | Title                                  | Validates                       |
| ---------- | -------------------------------------- | ------------------------------- |
| LAW-002-01 | Client domain model & manifest         | Runtime                         |
| LAW-002-02 | Client platform service                | **Runtime**                     |
| LAW-002-03 | Client Workbench views                 | **Workbench**                   |
| LAW-002-04 | Client actions                         | **Action Framework**            |
| LAW-002-05 | Client KnowledgeProvider               | **Knowledge & Discovery**       |
| LAW-002-06 | Client events, notifications, activity | **Event/Notification/Timeline** |
| LAW-002-07 | Client E2E                             | Cross-framework                 |

---

# LAW-003 — Matter Management

| Story      | Title                                  | Validates                       |
| ---------- | -------------------------------------- | ------------------------------- |
| LAW-003-01 | Matter domain model & manifest         | Runtime                         |
| LAW-003-02 | Matter platform service                | **Runtime**                     |
| LAW-003-03 | Matter workspace (primary)             | **Workbench**                   |
| LAW-003-04 | Matter lifecycle actions               | **Action Framework**            |
| LAW-003-05 | Matter KnowledgeProvider               | **Knowledge & Discovery**       |
| LAW-003-06 | Matter events, notifications, activity | **Event/Notification/Timeline** |
| LAW-003-07 | Matter Context Panel timeline          | **Activity & Timeline**         |
| LAW-003-08 | Matter E2E                             | Cross-framework                 |

---

# LAW-004 — Document Management

| Story      | Title                                    | Validates                       |
| ---------- | ---------------------------------------- | ------------------------------- |
| LAW-004-01 | Document model & storage adapter spec    | Runtime                         |
| LAW-004-02 | Document platform service                | **Runtime**                     |
| LAW-004-03 | Document Workbench views                 | **Workbench**                   |
| LAW-004-04 | Upload/version actions                   | **Action Framework**            |
| LAW-004-05 | Document KnowledgeProvider               | **Knowledge & Discovery**       |
| LAW-004-06 | Document events, notifications, activity | **Event/Notification/Timeline** |
| LAW-004-07 | Document E2E                             | Cross-framework                 |

---

# LAW-005 — Time Recording

| Story      | Title                                | Validates                       |
| ---------- | ------------------------------------ | ------------------------------- |
| LAW-005-01 | Time entry model & manifest          | Runtime                         |
| LAW-005-02 | Time platform service                | **Runtime**                     |
| LAW-005-03 | Time entry Workbench views           | **Workbench**                   |
| LAW-005-04 | Log/submit time actions              | **Action Framework**            |
| LAW-005-05 | Time events, notifications, activity | **Event/Notification/Timeline** |
| LAW-005-06 | Time E2E                             | Cross-framework                 |

---

# LAW-006 — Billing

| Story      | Title                            | Validates                |
| ---------- | -------------------------------- | ------------------------ |
| LAW-006-01 | Billing model & manifest         | Runtime                  |
| LAW-006-02 | Billing platform service         | **Runtime**              |
| LAW-006-03 | Billing Workbench views          | **Workbench**            |
| LAW-006-04 | Invoice actions                  | **Action Framework**     |
| LAW-006-05 | Billing notifications (priority) | **Event & Notification** |
| LAW-006-06 | Billing E2E                      | Cross-framework          |

---

# LAW-007 — Calendar

| Story      | Title                        | Validates                |
| ---------- | ---------------------------- | ------------------------ |
| LAW-007-01 | Calendar model & manifest    | Runtime                  |
| LAW-007-02 | Calendar platform service    | **Runtime**              |
| LAW-007-03 | Calendar Workbench view      | **Workbench**            |
| LAW-007-04 | Deadline/hearing actions     | **Action Framework**     |
| LAW-007-05 | Reminder notification routes | **Event & Notification** |
| LAW-007-06 | Calendar E2E                 | Cross-framework          |

---

# LAW-008 — Workflow

| Story      | Title                                | Validates                     |
| ---------- | ------------------------------------ | ----------------------------- |
| LAW-008-01 | Workflow/task model                  | Runtime                       |
| LAW-008-02 | Workflow platform service            | **Runtime**                   |
| LAW-008-03 | Task board Workbench views           | **Workbench**                 |
| LAW-008-04 | Task transition actions              | **Action Framework**          |
| LAW-008-05 | Assignment notifications + actionRef | **Event/Notification/Action** |
| LAW-008-06 | Workflow activity timeline           | **Activity & Timeline**       |
| LAW-008-07 | Workflow E2E                         | Cross-framework               |

---

# LAW-009 — Knowledge (Legal Research)

| Story      | Title                            | Validates                 |
| ---------- | -------------------------------- | ------------------------- |
| LAW-009-01 | Legal corpus provider spec       | **Knowledge & Discovery** |
| LAW-009-02 | Legal research platform service  | Runtime                   |
| LAW-009-03 | Research KnowledgeProviders      | **Knowledge & Discovery** |
| LAW-009-04 | Research overlay integration     | **Knowledge Experiences** |
| LAW-009-05 | Cite-to-matter action delegation | **Action Framework**      |
| LAW-009-06 | Knowledge E2E                    | Cross-framework           |

---

# LAW-010 — Reporting

| Story      | Title                      | Validates                 |
| ---------- | -------------------------- | ------------------------- |
| LAW-010-01 | Report catalogue model     | Runtime                   |
| LAW-010-02 | Reporting platform service | **Runtime**               |
| LAW-010-03 | Report Workbench views     | **Workbench**             |
| LAW-010-04 | Run/export actions         | **Action Framework**      |
| LAW-010-05 | Report KnowledgeProvider   | **Knowledge & Discovery** |
| LAW-010-06 | Reporting E2E              | Cross-framework           |

---

# LAW-011 — Administration

| Story      | Title                               | Validates            |
| ---------- | ----------------------------------- | -------------------- |
| LAW-011-01 | Firm admin model (not platform IAM) | Runtime              |
| LAW-011-02 | Legal admin platform service        | **Runtime**          |
| LAW-011-03 | Firm settings Workbench workspace   | **Workbench**        |
| LAW-011-04 | Firm config actions                 | **Action Framework** |
| LAW-011-05 | Admin E2E                           | Cross-framework      |

**Note:** Platform IAM (M8 IAUX) remains deferred — firm admin ≠ platform admin.

---

# LAW-012 — Production Readiness

| Story      | Title                                      | Validates      |
| ---------- | ------------------------------------------ | -------------- |
| LAW-012-01 | Framework validation scorecard             | All frameworks |
| LAW-012-02 | Operator health checklist                  | **Runtime**    |
| LAW-012-03 | Full law-platform E2E suite                | All frameworks |
| LAW-012-04 | Law Platform production readiness review   | Cross-cutting  |
| LAW-012-05 | Law Platform closeout & v1.0 release notes | Governance     |

---

# LAW-012-P — Persistence Foundation (complete)

> **Note:** Persistence sub-stories use `LAW-012-0N` numbering distinct from Production Readiness `LAW-012-0N` above.

| Story      | Title                                   | Status      |
| ---------- | --------------------------------------- | ----------- |
| LAW-012-01 | Persistence architecture & data model   | ✅ Complete |
| LAW-012-02 | Client + Matter PostgreSQL adapters     | ✅ Complete |
| LAW-012-03 | Hardening — RLS, tenant, outbox wiring  | ✅ Complete |
| LAW-012-04 | Document + Task persistence             | ✅ Complete |
| LAW-012-05 | Calendar + Time persistence             | ✅ Complete |
| LAW-012-06 | Invoice + line item persistence         | ✅ Complete |
| LAW-012-07 | Persistence closeout & readiness review | ✅ Complete |

**Closeout:** [LAW-012-07 completion report](../sprint/LAW-012-07-completion-report.md) · [Foundation review](../reviews/LAW-012-persistence-foundation-review.md) · [Roadmap](../roadmap/LAW-Persistence-Roadmap.md)

**Phase 2 (in progress):** LAW-014 APIs ✅ · Outbox workers ⏸ · Trust Accounting **milestone closed** ✅

---

# LAW-015 — Trust Accounting

> **Status:** **Milestone closed** — LAW-015-14 (2026-07-08)  
> **Authority:** [LAW-Trust-Reference-Architecture](../architecture/LAW-Trust-Reference-Architecture.md) · [LAW-015 Backlog](./LAW-015-Trust-Accounting-Backlog.md)

| Story      | Title                                  | Status                 |
| ---------- | -------------------------------------- | ---------------------- |
| LAW-015-01 | Trust Accounting foundation (planning) | ✅ Complete            |
| LAW-015-02 | Trust Ledger Engine                    | ✅ Complete            |
| LAW-015-03 | Trust Transactions                     | ✅ Complete            |
| LAW-015-04 | Trust Allocations                      | ✅ Complete            |
| LAW-015-05 | Trust Reconciliation                   | ✅ Complete            |
| LAW-015-06 | Trust Interest                         | ✅ Complete            |
| LAW-015-07 | Trust Transfers                        | ✅ Complete            |
| LAW-015-08 | Trust Reporting                        | ✅ Complete            |
| LAW-015-09 | Trust Dashboard / Workbench            | ✅ Complete            |
| LAW-015-10 | Trust Approvals & Operational Controls | ✅ Complete            |
| LAW-015-11 | Trust REST APIs & Persistence          | ✅ Complete            |
| LAW-015-12 | Trust Reports Export Pack              | ✅ Complete            |
| LAW-015-13 | Trust E2E Validation                   | ✅ Complete            |
| LAW-015-14 | Trust Milestone Closeout               | ✅ Complete            |
| LAW-015-15 | Trust Production Readiness             | ⏸ Await owner approval |

**Closeout:** [LAW-015-14 completion report](../sprint/LAW-015-14-completion-report.md) · [LAW-015 Review](../reviews/LAW-015-Trust-Accounting-Review.md) · [LAW-Trust-v1.0](../releases/LAW-Trust-v1.0.md)

**Gate:** Await owner approval before Financial Engine extraction, banking, Phase 2, or LAW-015-15

---

## Constraints

- **Do not modify** Platform 5.0 frameworks except bug fixes
- **Do not start** Milestone 8 (IAUX)
- **Do not duplicate** platform functionality in legal modules
- **Every story** cites platform framework(s) validated

---

## Gate

**Do not begin LAW-001-01** until owner approves [Law Platform Readiness](../reviews/APZHUB-Law-Platform-Readiness.md).

---

_APZHUB Law Platform Engineering Backlog — Platform Validation Phase 1._
