# APZHUB Portfolio Integration Strategy

> **Programme:** APZHUB-PORTFOLIO-001  
> **Classification:** DOCUMENTATION ONLY — no implementation authorised  
> **Date:** 2026-07-19  
> **Status:** **ACCEPTED / CLOSED / Operational** (APZHUB-OWNER-001)  
> **Authority:** [012](../012-event-driven-architecture-background-processing-workflow-framework.md) · [029](../029-platform-event-sdk-event-bus-event-manifest-specification.md) · [PRODUCT-ARCHITECTURE-STANDARD](./PRODUCT-ARCHITECTURE-STANDARD.md) · [Reference Implementation](./APZHUB-PRODUCT-ENGINEERING-REFERENCE-IMPLEMENTATION.md)  
> **Companion docs:** [PLATFORM-EVENT-CATALOGUE](./PLATFORM-EVENT-CATALOGUE.md) · [AUTOMATION-ROADMAP](./AUTOMATION-ROADMAP.md) · [PORTFOLIO-INTERACTION-DIAGRAM](./PORTFOLIO-INTERACTION-DIAGRAM.md)

---

## 1. Purpose

Define how APZHUB Production products collaborate as **one platform** while preserving architectural boundaries.

This strategy is the portfolio-level contract for future cross-product features. It does **not** authorise Event Bus expansion, n8n execution, notifications delivery, Analytics product delivery, or any Patch/Minor/Major product release.

---

## 2. Portfolio baseline (repository)

| Product           | Maturity / SemVer                | Cross-product readiness (today)                                                          |
| ----------------- | -------------------------------- | ---------------------------------------------------------------------------------------- |
| **APZ Projects**  | Production **1.1.0**             | `projects.*` events on disk; Search publication; Workbench deep links                    |
| **APZ Time**      | Production **1.0.0**             | HTTP + Workbench; **no** cross-product deep integrations (KNOWN-LIMITATIONS)             |
| **APZ Support**   | Production **1.0.0**             | Search publication; **no** Event Bus publish / Support notifications (KNOWN-LIMITATIONS) |
| **APZ Documents** | Platform PRWL (frozen)           | No product SemVer PR; Event Bus excluded from certified non-goals                        |
| **APZ Workflow**  | Platform PRWL (read-only engine) | n8n **0.1.0** metadata only — no execute                                                 |
| **APZ Analytics** | Concept                          | No Metabase adapter; no product release                                                  |

**Platform spine (exist, frozen or MVP):** Integration SDK **1.0.0** · Event Bus **0.1.0** · Outbox **0.1.0** · Notifications SoR frozen · Search Publication frozen · Workbench Framework · RequestPipeline.

---

## 3. Non-negotiable boundaries

| Rule                    | Implication for cross-product work                                                                                                |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Module ↛ Module         | Products never call each other’s UI or clients                                                                                    |
| Module ↛ Connector      | No Plane/Kimai/Zammad imports from product UI                                                                                     |
| Service ↛ Backend       | Engines only via Integration SDK adapters                                                                                         |
| Services publish events | Consumers are platform subscribers (search, audit, activity, notify, jobs) — not peer products                                    |
| RequestPipeline         | Every mutation: Auth → Authz → Validation → Service → (async) events                                                              |
| Correlation IDs         | End-to-end on HTTP and events ([010](../010-api-gateway-integration-communication-standards.md), 012)                             |
| One System of Record    | Projects/Tasks (Plane via adapter), Timesheets (Kimai), Tickets (Zammad), Documents (native SoR) — **no duplicated business SoR** |
| Freezes                 | SDK, Search, Notifications, Workflow engine, Documents — **ADR + Owner** to change                                                |

**Canonical request path (all products):**

```text
Workbench → /api/v1/* → Auth → Authz → Validation
  → PlatformServiceGateway → Platform Service
  → Integration Adapter → Engine
  → (async) Event Bus / Outbox → Search | Audit | Activity | Attention | Jobs
```

---

## 4. Canonical cross-product interactions

Interactions are **event-mediated** (preferred) or **platform-orchestrated** (explicit Platform Service use-case). Never module-to-module HTTP.

| ID    | Interaction                    | Trigger (publisher)                              | Outcome (consumers)                                      | Status today                                                              | Future posture                                           |
| ----- | ------------------------------ | ------------------------------------------------ | -------------------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------- |
| XI-01 | Support ticket → Project task  | `support.request.linked` / service orchestration | Projects creates/links task; Activity + Audit            | **Not delivered** (Support has no Event Bus publish)                      | Near-term design → Owner-approved programme              |
| XI-02 | Project task → Time entry      | `projects.task.*` + Time service link            | Time entry/timesheet association; Activity               | **Not delivered** (Time KNOWN-LIMITATIONS)                                | Near-term after Time Patch/Minor Approval                |
| XI-03 | Time entry → Analytics         | `time.timesheet.*` / reporting events            | Analytics index / dashboard facts                        | Analytics **Concept**                                                     | Long-term                                                |
| XI-04 | Support SLA → Analytics        | `support.sla.*` / metrics bridge                 | SLA KPIs in Analytics                                    | Not delivered                                                             | Long-term                                                |
| XI-05 | Project completion → Documents | `projects.project.completed` / archived          | Document pack / folder linkage                           | Documents PRWL; Event Bus excluded from docs cert                         | Medium-term                                              |
| XI-06 | Workflow triggers              | Platform Workflow SoR + (future) engine execute  | Orchestrate multi-product steps via **services**, not UI | n8n **read-only**                                                         | Medium → Long (execute needs ADR + Owner)                |
| XI-07 | Notification events            | Domain events → Attention Engine                 | In-app / digest delivery                                 | Projects path exists; Support notify **excluded**                         | Near-term expand only with Notification freeze exception |
| XI-08 | Search federation              | Publication adapters + Search Orchestrator       | Unified `/api/v1/search`                                 | **Operational** (Projects/Support/Documents/Testing/Reporting publishers) | Maintain; add Time publisher when authorised             |
| XI-09 | Activity timeline              | Domain events → Activity Framework               | Workspace activity stream                                | Projects wired; others partial                                            | Near-term extend via event manifests                     |
| XI-10 | Global audit                   | Services emit audit on mutations                 | Immutable audit SoR                                      | Platform-owned                                                            | Continuous                                               |
| XI-11 | Cross-product navigation       | Deep links + Command Palette                     | `/workspace/{product}/...`                               | Shell supports prefixes                                                   | Near-term: typed deep-link contracts                     |

---

## 5. Integration styles (allowed)

| Style                         | When to use                                                                            | Forbidden                                                       |
| ----------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| **A. Event-driven**           | Side effects: search index, activity, notify, audit, async links                       | Product A HTTP-calling Product B                                |
| **B. Platform orchestration** | Synchronous business rule spanning two SoRs inside **one** Platform Service / use-case | Orchestration in Workbench UI or n8n (until execute authorised) |
| **C. Shared identity / IDs**  | Global APZHUB IDs (`proj_`, `task_`, `sreq_`, `tproj_`, …) in payloads                 | Exposing engine IDs in UI                                       |
| **D. Navigation contracts**   | Deep links with query/context                                                          | Hardcoded engine URLs                                           |
| **E. Search federation**      | Discovery across products                                                              | Per-product standalone search UIs                               |

**n8n** is referenced only as the **Workflow Engine Reference Adapter** (metadata). Automation design may _conceptually_ target Workflow Engine later; **no execute/schedule** in this programme.

---

## 6. Payload & ownership rules

1. **Publisher owns** the event schema (`event.yaml` + contracts package DTOs).
2. **Consumers must tolerate additive fields**; breaking changes = MAJOR event version + Owner.
3. Cross-product links store **APZHUB global IDs** + relationship type — never raw engine foreign keys in platform SoR.
4. Relationship tables (if ever implemented) live in **platform PostgreSQL** as platform metadata — not duplicated engine business data ([011](../011-platform-data-architecture-entity-model.md)).
5. Idempotency keys derived from `(eventId | causationId + consumerId)` per 012/029.

---

## 7. Security & Zero Trust

Every cross-product effect re-checks:

- Authenticated principal
- Permission for **target** product operation
- Tenant / workspace context
- Correlation ID continuity
- Audit of both source and target mutations

Superadmin is an explicit tier — not a bypass of product boundaries.

---

## 8. Honesty (known gaps)

| Gap                                | Product        | Blocking for XI-*                               |
| ---------------------------------- | -------------- | ----------------------------------------------- |
| No Event Bus publish               | Support        | XI-01, XI-04, XI-07 (Support)                   |
| No cross-product deep integrations | Time           | XI-02, XI-03                                    |
| No execute / schedule              | Workflow / n8n | XI-06 execution                                 |
| No product Analytics               | Analytics      | XI-03, XI-04                                    |
| Notifications SoR frozen           | Platform       | New notify channels need milestone              |
| Event Bus MVP limitations          | Platform       | Durable product translators / BullMQ not in MVP |

---

## 9. Governance for future delivery

1. Owner Approval of a **named** programme (product Patch/Minor/Major or platform ADR programme).
2. `event.yaml` / contracts **before** code ([029](../029-platform-event-sdk-event-bus-event-manifest-specification.md)).
3. [RELEASE-GOVERNANCE-CHECKLIST](../releases/RELEASE-GOVERNANCE-CHECKLIST.md) before Owner Acceptance of any Product Release.
4. Freeze exceptions require **ADR + Owner**.

---

## 10. Related

| Document             | Path                                                                                                                               |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Event catalogue      | [PLATFORM-EVENT-CATALOGUE.md](./PLATFORM-EVENT-CATALOGUE.md)                                                                       |
| Automation roadmap   | [AUTOMATION-ROADMAP.md](./AUTOMATION-ROADMAP.md)                                                                                   |
| Interaction diagram  | [PORTFOLIO-INTERACTION-DIAGRAM.md](./PORTFOLIO-INTERACTION-DIAGRAM.md)                                                             |
| Portfolio            | [APZHUB-PRODUCT-PORTFOLIO.md](./APZHUB-PRODUCT-PORTFOLIO.md)                                                                       |
| Release register     | [PORTFOLIO-RELEASE-REGISTER.md](../releases/PORTFOLIO-RELEASE-REGISTER.md)                                                         |
| Cross-product search | [APZHUB-Cross-Product-Search-Integration-Architecture.md](../architecture/APZHUB-Cross-Product-Search-Integration-Architecture.md) |

---

## STOP

Do **not** implement Event Bus expansions, n8n workflows, notifications, or Analytics under this document. Await Owner Acceptance of APZHUB-PORTFOLIO-001, then separate named Approval for any delivery programme.
