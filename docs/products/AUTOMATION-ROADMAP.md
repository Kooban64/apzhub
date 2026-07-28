# APZHUB Automation Roadmap (Portfolio)

> **Programme:** APZHUB-PORTFOLIO-001  
> **Classification:** DOCUMENTATION ONLY — no automation implementation authorised  
> **Date:** 2026-07-19  
> **Status:** Complete — **Awaiting Owner Acceptance**  
> **Authority:** [012](../012-event-driven-architecture-background-processing-workflow-framework.md) · [PORTFOLIO-INTEGRATION-STRATEGY](./PORTFOLIO-INTEGRATION-STRATEGY.md) · Workflow freeze (APZWORKFLOW-011) · Notification freeze (APZNOTIFY-006)  
> **n8n:** Conceptual reference only (`@apzhub/integration-n8n` **0.1.0** read-only)

---

## 1. Purpose

Recommend **future** automation opportunities that stay inside approved architecture:

```text
Event / Command → Platform Service → (optional) Outbox → Event Bus
  → Idempotent consumers (Search, Audit, Activity, Attention, Jobs)
  → Integration Adapter → Engine   # never UI → Engine
```

**Workflow Engine (n8n)** may appear in **long-term** designs as a metadata/execution backend behind Platform Workflow Services — **not** as a user-facing Zapier embedded in modules.

---

## 2. Automation principles

| Principle           | Rule                                                                                                  |
| ------------------- | ----------------------------------------------------------------------------------------------------- |
| Respond fast        | Mutate + validate in request; automate async                                                          |
| No module workflows | Modules register commands; services orchestrate                                                       |
| Idempotent jobs     | Retries safe; DLQ visible in Administration                                                           |
| Permissioned        | Automations run as dedicated worker identities / least privilege                                      |
| Honest scope        | Do not automate excluded certified surfaces (e.g. Support Event Bus) until programme lifts limitation |
| Freeze respect      | Notification delivery, Search Publication, n8n execute — ADR + Owner                                  |

---

## 3. Opportunity catalogue

| ID    | Opportunity                 | Trigger                             | Automation effect                         | Primary products       | Dependency risk                                               |
| ----- | --------------------------- | ----------------------------------- | ----------------------------------------- | ---------------------- | ------------------------------------------------------------- |
| AU-01 | Ticket → Task assist        | Support request linked / escalated  | Create/link Project task; activity        | Support, Projects      | Support Event Bus publish                                     |
| AU-02 | Task → Time prompt          | Task assigned / started             | Suggest / open Time entry linked to task  | Projects, Time         | Time cross-product programme                                  |
| AU-03 | Timesheet stop → Activity   | Timesheet stopped                   | Activity + optional digest                | Time                   | Time events                                                   |
| AU-04 | SLA breach attention        | SLA breached                        | Attention item / digest                   | Support, Notifications | Notify freeze + Support events                                |
| AU-05 | Project complete → Doc pack | Project completed/archived          | Ensure Documents folder / checklist docs  | Projects, Documents    | Documents Event Bus allowance                                 |
| AU-06 | Unified search freshness    | Entity CRUD events                  | Search publication upsert                 | All indexed products   | Search Publication freeze (extend via approved adapters only) |
| AU-07 | Cross-product deep link     | Command / notification click        | Navigate `/workspace/...` with context    | Shell, all             | Navigation contracts                                          |
| AU-08 | Workflow metadata sync      | Workflow definition published       | Refresh engine catalogue in Workbench     | Workflow               | Already metadata-aligned                                      |
| AU-09 | Workflow run (future)       | `workflow.run.requested`            | Execute via engine adapter behind service | Workflow + targets     | **n8n execute** not certified                                 |
| AU-10 | Analytics rollups           | completed/closed/stopped/SLA events | Aggregate facts for dashboards            | Analytics + sources    | Analytics product not started                                 |
| AU-11 | Global audit mirror         | Security mutations                  | Immutable audit (already centralised)     | Platform               | Maintain                                                      |
| AU-12 | Provisioning completion     | Product provisioned                 | Enable module + seed defaults             | Provisioning, products | platform-provisioning **0.1.0**                               |

---

## 4. Implementation order

### Near-term (design + small Owner-approved programmes)

Focus: **wire what Production products already almost have**, without reopening freezes.

| Priority | Item                                                                                            | Rationale                                                           |
| -------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| N1       | Formalise deep-link / command contracts (XI-11, AU-07)                                          | Shell already supports prefixes; docs-only → tiny product patches   |
| N2       | Extend **Activity** subscribers for Projects gaps; plan Support/Time activity when events exist | Low freeze risk                                                     |
| N3       | Support Event Bus publish + Notification Attention                                              | **Delivered** — APZHUB-1.1-003 (**ACCEPTED**)                       |
| N3b      | Cross-Product Automation Foundation (registration + event/workflow paths)                       | **Delivered** — APZHUB-1.1-004 (**ACCEPTED**); product AU-* remain  |
| N4       | Design Time↔Projects link events (AU-02) under Time Patch/Minor Approval                        | Aligns with Time KNOWN-LIMITATIONS lift                             |
| N5       | Maintain Search federation; plan **Time** search publisher                                      | Search Publication architecture frozen — additive adapter programme |

**Not near-term:** n8n execute, Analytics product, Notification channel expansion.

### Medium-term

| Priority | Item                                                                                          | Rationale                                          |
| -------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| M1       | Support → Projects link automation (AU-01) after Support events                               | Highest agent productivity ROI                     |
| M2       | Projects → Time link automation (AU-02)                                                       | Billable work accuracy                             |
| M3       | Documents linkage on project completion (AU-05) with Documents event allowance                | Completes project closeout                         |
| M4       | Attention/digest for assign + SLA (AU-04) within Notification freeze rules or Owner exception | User attention without new channels if in-app only |
| M5       | Outbox/Event Bus hardening for product translators (beyond MVP **0.1.0**)                     | Reliability for automation                         |

### Long-term

| Priority | Item                                                                           | Rationale                                               |
| -------- | ------------------------------------------------------------------------------ | ------------------------------------------------------- |
| L1       | Analytics ingest from portfolio events (AU-10, XI-03/04)                       | Requires Analytics product programme                    |
| L2       | Workflow **execute** path via Platform Workflow Services + n8n adapter (AU-09) | Requires ADR + Owner beyond APZWORKFLOW-011 freeze      |
| L3       | Multi-step portfolio runbooks (Support escalate → Task → Time → Doc closeout)  | Composes M1–M3 + L2                                     |
| L4       | AI-assisted triage / classification on events                                  | After Event Bus + Attention stable; AI not in scope now |

---

## 5. Explicit non-goals (this programme)

| Non-goal                                     | Why                        |
| -------------------------------------------- | -------------------------- |
| Implement Event Bus product translators      | STOP — docs only           |
| Implement n8n workflows / execute            | Freeze + STOP              |
| Implement notification providers             | Notification freeze + STOP |
| Implement Analytics / Metabase               | Product not IR / STOP      |
| Embed automation builders in product modules | Violates 009 / 029         |

---

## 6. Success metrics (for future programmes)

| Metric                                              | Intent       |
| --------------------------------------------------- | ------------ |
| % of Production mutations emitting catalogue events | Coverage     |
| Consumer failure rate / DLQ depth                   | Reliability  |
| Cross-product link create success (idempotent)      | Correctness  |
| Mean time from event → search/activity visibility   | Freshness    |
| Zero Module→Module calls in audits                  | Architecture |

---

## Related

- [PORTFOLIO-INTEGRATION-STRATEGY.md](./PORTFOLIO-INTEGRATION-STRATEGY.md)
- [PLATFORM-EVENT-CATALOGUE.md](./PLATFORM-EVENT-CATALOGUE.md)
- [PORTFOLIO-INTERACTION-DIAGRAM.md](./PORTFOLIO-INTERACTION-DIAGRAM.md)
- Workflow freeze: `docs/architecture/` APZWORKFLOW-011 artefacts
- n8n adapter: `integrations/n8n/` (read-only)
