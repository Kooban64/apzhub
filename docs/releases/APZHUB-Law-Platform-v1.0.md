# APZHUB Law Platform — Version 1.0 (Planning)

> **Product:** Law Firm Platform  
> **Version:** 1.0 (planning baseline)  
> **Status:** Planning document — **no implementation**  
> **Platform baseline:** [Platform Version 5.0](./APZHUB-Platform-v5.0.md) — **frozen**  
> **Phase:** Platform Validation Phase 1 — planning only  
> **Authority:** [Product Validation Strategy](../strategy/APZHUB-Product-Validation-Strategy.md) · [Law Platform Validation Strategy](../strategy/APZHUB-Law-Platform-Validation-Strategy.md)

---

## Executive Summary

The **Law Firm Platform** is the first enterprise application designed to run entirely on APZHUB Platform Version 5.0. It is not a standalone legal product fork — it is a **platform validation vehicle** that proves Runtime, Workbench, Action, Knowledge, Event/Notification, and Activity/Timeline frameworks under realistic legal-firm workloads.

This document defines the Law Platform 1.0 planning baseline. **No application code, UI, APIs, or database schemas are implemented in Phase 1.** Engineering begins only after owner approval of the first Law Platform story.

Platform Version 5.0 remains **frozen** during validation. Framework changes are limited to bug fixes or critical defects discovered during validation — not feature expansion.

**Milestone 8 (Identity, Administration & UX) is not started** as part of this phase.

---

## Vision

Deliver a unified legal practice workspace — matters, clients, documents, time, billing, and workflow — inside the APZHUB desktop shell, powered exclusively by platform capabilities. Lawyers and staff interact with one application; backend legal services are platform capabilities declared by manifest.

The Law Platform demonstrates that APZHUB can host a regulated, document-heavy, permission-sensitive enterprise domain **without redesigning the platform**.

---

## Objectives

1. **Validate Platform 5.0** under real legal-firm domain scenarios — not synthetic demos
2. **Consume platform frameworks exclusively** — no duplicate navigation, commands, search, notifications, or timelines
3. **Establish the Law Platform architecture** — Platform → Law Platform → Legal Modules → Business Capabilities
4. **Define measurable validation goals** per framework (Runtime, Workbench, Actions, Knowledge, Events, Notifications, Timeline)
5. **Produce engineering backlog** (LAW-001–LAW-012) with explicit platform-validation statements on every story
6. **Prepare for implementation** — await owner gate before first engineering story

---

## Why This Product Validates the Platform

| Platform framework                 | Law Platform stress scenario                                                      |
| ---------------------------------- | --------------------------------------------------------------------------------- |
| **Platform Runtime**               | Multiple legal capability manifests; health aggregation; lifecycle                |
| **Workbench Framework**            | Matter-centric workspaces; multi-view navigation; session restore                 |
| **Action Framework**               | High-density commands — create matter, file document, log time, approve billing   |
| **Knowledge & Discovery**          | Cross-entity search — clients, matters, documents, tasks, statutes                |
| **Event & Notification Framework** | Deadline alerts, assignment notifications, status-change fan-out                  |
| **Activity & Timeline Framework**  | Matter activity history; personal timeline; Context Panel tab                     |
| **Foundation / auth**              | Authenticated shell; permission keys on legal capabilities (dev adapter until M8) |

Legal practice combines **permissions**, **documents**, **workflow**, **time sensitivity**, and **audit expectations** — exercising every platform layer simultaneously.

---

## Scope (Phase 1 — planning)

| In scope                      | Deliverable                                                                                                    |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Law Platform release baseline | This document                                                                                                  |
| Reference architecture        | [APZHUB-Law-Platform-Reference-Architecture.md](../architecture/APZHUB-Law-Platform-Reference-Architecture.md) |
| Capability map                | [APZHUB-Law-Capability-Map.md](../architecture/APZHUB-Law-Capability-Map.md)                                   |
| Validation strategy           | [APZHUB-Law-Platform-Validation-Strategy.md](../strategy/APZHUB-Law-Platform-Validation-Strategy.md)           |
| Sprint 1 planning             | [LAW-001-foundation-planning.md](../sprint/LAW-001-foundation-planning.md)                                     |
| Engineering backlog           | [LAW-Platform-Backlog.md](../backlog/LAW-Platform-Backlog.md)                                                  |
| Readiness review              | [APZHUB-Law-Platform-Readiness.md](../reviews/APZHUB-Law-Platform-Readiness.md)                                |

---

## Out of Scope

| Item                                         | Notes                                                  |
| -------------------------------------------- | ------------------------------------------------------ |
| Application code                             | No React, APIs, database, or business logic            |
| Platform framework changes                   | Platform 5.0 frozen — bug fixes only                   |
| Milestone 8 (IAUX)                           | Not started                                            |
| External integrations                        | Court filing, DMS, accounting systems — Phase 2+       |
| Trust accounting / compliance certifications | Future product milestones                              |
| Commercial GA                                | Requires validation evidence + M8/M9 programme         |
| Mobile clients                               | Desktop shell only                                     |
| Production deployment                        | Validation environment only when implementation begins |

---

## Architecture Rule

The Law Platform **must consume** existing platform services:

| Concern        | Platform owner                           |
| -------------- | ---------------------------------------- |
| Authentication | Foundation + `@apzhub/auth`              |
| Navigation     | Workbench Framework                      |
| Commands       | Action Framework                         |
| Search         | Knowledge & Discovery Framework          |
| Notifications  | Event & Notification Framework           |
| Timeline       | Activity & Timeline Framework            |
| Health         | Platform Runtime                         |
| Diagnostics    | Platform Runtime + framework diagnostics |

Legal modules **never** reimplement these concerns.

---

## Related Documents

| Document                   | Path                                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------- |
| Platform v5.0              | [APZHUB-Platform-v5.0.md](./APZHUB-Platform-v5.0.md)                                         |
| Platform Capability Matrix | [APZHUB-Platform-Capability-Matrix.md](../architecture/APZHUB-Platform-Capability-Matrix.md) |
| Law Platform backlog       | [LAW-Platform-Backlog.md](../backlog/LAW-Platform-Backlog.md)                                |

---

_APZHUB Law Platform v1.0 — Platform Validation Phase 1 planning baseline._
