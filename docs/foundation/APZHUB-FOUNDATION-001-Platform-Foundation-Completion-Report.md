# APZHUB Platform Foundation Completion Report

> **Programme:** APZHUB-FOUNDATION-001  
> **Type:** Documentation only — Platform Foundation phase closeout  
> **Authority:** Repository Knowledge Foundation · package manifests · completion / acceptance reports  
> **Date:** 2026-07-18  
> **Status:** **ACCEPTED** — Platform Foundation phase officially **CLOSED** (Owner Decision, 2026-07-18)  
> **Successor phase:** [Phase 3 — Product Engineering](./APZHUB-PHASE-3-Product-Engineering-Commencement.md)  
> **AI entry:** [AI-MANIFEST](./AI-MANIFEST.md) · Status: [CURRENT-MILESTONE](./CURRENT-MILESTONE.md) · Inventory: [INTEGRATION-PRODUCT-CAPABILITY-INVENTORY](./INTEGRATION-PRODUCT-CAPABILITY-INVENTORY.md)

---

## Executive Summary

APZHUB set out to build an **enterprise-grade, repository-driven application platform** capable of hosting multiple OSS-backed and native business products behind a single shell, identity model, and service boundary — without exposing backend engines to end users.

That journey delivered:

- A **Knowledge Foundation** and AI bootstrap so humans and agents share one source of truth
- A **strict layered architecture** (Presentation → Services → Connectors → Engines) with ADR discipline
- A **frozen Integration SDK** and certified reference adapters
- **Platform Systems of Record** (Search, Documents, Workflow, Notifications, Configuration, Administration, Identity Administration, Observability, Metrics)
- An **event-driven substrate** (ENF, Outbox, Event Bus) and **product provisioning flows**
- **Production hardening** and operational readiness artefacts

**The Platform Foundation is now COMPLETE.**

Future investment should primarily target **Phase 3 — Product Engineering**, extending products on this stable baseline rather than redesigning core platform architecture.

---

## Vision Achieved

| Original objective                | How it was achieved                                                                                                             |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Knowledge Foundation**          | APZHUB-000 catalogues, constitution, handbooks; reconciled under **APZHUB-KF-001**                                              |
| **Repository-driven engineering** | Disk packages, completion reports, and CURRENT-* docs override conversation history ([AI-MANIFEST](./AI-MANIFEST.md) hierarchy) |
| **AI bootstrap process**          | **APZHUB-KF-002** — AI-MANIFEST + AI-BOOTSTRAP as permanent AI entry                                                            |
| **Architecture governance**       | Docs 000–029, Architecture Baseline v1.0, freeze notices, Owner Acceptance gates                                                |
| **ADR discipline**                | ADR catalogue (through ADR-0065+) — frozen subsystems require ADR + owner before redesign                                       |
| **Platform governance**           | `@apzhub/platform-governance` (M8-05 / ADR-0044) — enablement, flags, capabilities                                              |
| **Event-driven platform**         | ENF (SPR-006) · Outbox **PCv2-02** · Event Bus **OSS-100-12**                                                                   |
| **Product provisioning**          | **OSS-100-12+** — `@apzhub/platform-provisioning` **0.1.0** ACCEPTED / CLOSED                                                   |
| **Operational readiness**         | **PRH-001–018** — deployment, upgrade/rollback, ops checklist, smoke, audit                                                     |

---

## Major Programmes Delivered

Chronological summary of major foundation programmes (IDs from repository backlog / completion reports only).

| Order | Programme / theme                               | IDs (repository)                                           | Outcome                                                            |
| ----- | ----------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------ |
| 1     | Knowledge Foundation                            | **APZHUB-000**                                             | Constitution, catalogues, handbooks, navigation                    |
| 2     | Monorepo / shell foundation                     | BUILD / SPR foundation (see CURRENT-STATE / PROJECT-BIBLE) | pnpm workspace, Next.js apps, DEF shell patterns                   |
| 3     | Platform Runtime                                | M2 · `@apzhub/platform-runtime`                            | Capability runtime / discovery                                     |
| 4     | Workbench Framework                             | M3 · `@apzhub/workbench-framework`                         | Shell workspaces, manifests                                        |
| 5     | Action / Command Framework                      | **SPR-004** (AF-001–022)                                   | Command palette / action engine foundation                         |
| 6     | Knowledge & Discovery                           | **SPR-005** (DF-001–018)                                   | Unified search framework foundations                               |
| 7     | Event & Notification Framework                  | **SPR-006** (EN-001–018)                                   | ENF Event Bus / notification framework                             |
| 8     | Activity & Timeline                             | **SPR-007** (AT-001–016)                                   | Activity stream foundations                                        |
| 9     | Platform Core capabilities                      | **M8-01–06**                                               | Identity, Authz, Operations, Personalisation, Governance, Security |
| 10    | Integration SDK                                 | **OSS-100-01…11**                                          | `@apzhub/integration-sdk` **1.0.0** · Architecture Frozen          |
| 11    | Platform Services / gateway spine               | **OSS-110-*** (through Support vertical)                   | `@apzhub/platform-services` **0.25.0**                             |
| 12    | Projects (Plane)                                | **OSS-101-01…10**                                          | `@apzhub/integration-plane` **0.6.0** · Wave 1 certified           |
| 13    | Support (Zammad)                                | **OSS-102-01…08** · **OSS-110-10…14**                      | `@apzhub/integration-zammad` **0.6.0** · UI PRWL                   |
| 14    | Documents                                       | **APZDOCS-001…006**                                        | Native Documents · architecture frozen                             |
| 15    | Search + Publication                            | **APZSEARCH-001…019**                                      | Architecture Frozen · Meilisearch reference adapter                |
| 16    | Workflow + Engine                               | **APZWORKFLOW-001…011**                                    | SoR + n8n reference · frozen                                       |
| 17    | Notifications / Config / Admin / Identity Admin | **APZNOTIFY / APZCONFIG / APZADMIN / APZIDENTITY …006**    | SoR waves closed/frozen                                            |
| 18    | Observability / Metrics                         | **APZOBSERVE-001…006** · **APZMETRICS-001…006**            | Closed / Architecture Frozen                                       |
| 19    | Testing & Certification (APZ TCMS)              | **APZTCMS-001…024**                                        | Vertical + GHA CI/CD reference frozen                              |
| 20    | Reporting                                       | **APZREPORT-001…003**                                      | Platform Reporting PRWL                                            |
| 21    | Law Platform / Trust                            | **LAW-001…015**                                            | Vertical milestone closed                                          |
| 22    | Knowledge Foundation reconciliation             | **APZHUB-KF-001**                                          | Docs reconciled to disk                                            |
| 23    | AI Bootstrap                                    | **APZHUB-KF-002**                                          | AI-MANIFEST + AI-BOOTSTRAP                                         |
| 24    | Outbox Workers                                  | **PCv2-02**                                                | `@apzhub/platform-outbox` **0.1.0** · ACCEPTED / CLOSED            |
| 25    | Platform Event Bus                              | **OSS-100-12**                                             | `@apzhub/platform-event-bus` **0.1.0** · ACCEPTED / CLOSED         |
| 26    | Production Hardening                            | **PRH-001…018** (PCv2-01)                                  | Ops guides, smoke, audit · ACCEPTED / CLOSED                       |
| 27    | Product Provisioning Flows                      | **OSS-100-12+**                                            | `@apzhub/platform-provisioning` **0.1.0** · ACCEPTED / CLOSED      |

Live detail: [CURRENT-STATE](./CURRENT-STATE.md) · [ACTIVE-BACKLOG](./ACTIVE-BACKLOG.md) · [INTEGRATION-PRODUCT-CAPABILITY-INVENTORY](./INTEGRATION-PRODUCT-CAPABILITY-INVENTORY.md).

---

## Platform Capability Summary

Maturity labels follow repository classifications (`Architecture Frozen`, `closed/frozen`, `PRODUCTION_READY_WITH_LIMITATIONS` / PRWL, `CERTIFIED_WITH_LIMITATIONS`, delivered MVP, planned).

| Capability                           | Primary packages (disk)                                                      | Programme / wave              | Maturity                                  |
| ------------------------------------ | ---------------------------------------------------------------------------- | ----------------------------- | ----------------------------------------- |
| **Identity / Tenants**               | `@apzhub/platform-identity`, `@apzhub/auth`, `@apzhub/identity-*`            | M8-01 · APZIDENTITY-006       | Operational / SoR **closed/frozen**       |
| **Authorization**                    | `@apzhub/platform-authorization`, gateway in `platform-services`             | M8-02 · OSS-110-06            | Operational                               |
| **Governance**                       | `@apzhub/platform-governance` **0.1.0**                                      | M8-05 · ADR-0044              | Operational                               |
| **Provisioning**                     | `@apzhub/platform-provisioning` **0.1.0**                                    | OSS-100-12+                   | **ACCEPTED / CLOSED** (operational MVP)   |
| **Platform Services / Gateway**      | `@apzhub/platform-services` **0.25.0**, `@apzhub/platform-service-contracts` | OSS-110-*                     | Operational (PRWL where certified)        |
| **Integration SDK**                  | `@apzhub/integration-sdk` **1.0.0**                                          | OSS-100-11                    | **Architecture Frozen** · PRWL            |
| **Event Bus**                        | `@apzhub/platform-event-bus` **0.1.0**, ENF                                  | OSS-100-12 · SPR-006          | Delivered MVP · ACCEPTED / CLOSED         |
| **Outbox**                           | `@apzhub/platform-outbox` **0.1.0**                                          | PCv2-02                       | Delivered MVP · ACCEPTED / CLOSED         |
| **Search**                           | `@apzhub/search-*`, `@apzhub/integration-meilisearch` **0.1.0**              | APZSEARCH-008 / 019           | **Architecture Frozen** · PRWL            |
| **Documents**                        | `@apzhub/document-*`                                                         | APZDOCS-006                   | Architecture frozen · PRWL                |
| **Workflow**                         | `@apzhub/workflow-*`, `@apzhub/integration-n8n` **0.1.0**                    | APZWORKFLOW-011               | **Frozen** · PRWL                         |
| **Notifications (SoR)**              | `@apzhub/notification-*`                                                     | APZNOTIFY-006                 | **Closed/frozen** · PRWL                  |
| **Configuration**                    | `@apzhub/configuration-*`                                                    | APZCONFIG-006                 | **Closed/frozen** · PRWL                  |
| **Administration**                   | `@apzhub/admin-*`                                                            | APZADMIN-006                  | **Closed/frozen** · PRWL                  |
| **Observability (SoR)**              | `@apzhub/observe-*`                                                          | APZOBSERVE-006                | **Closed/frozen**                         |
| **Metrics (SoR)**                    | `@apzhub/metrics-*`                                                          | APZMETRICS-006                | **Architecture Frozen** / closed          |
| **Testing (APZ TCMS)**               | `@apzhub/testing-*` **0.11.0**, GHA adapter **0.1.0**                        | APZTCMS-001…024               | PRWL (certified slices) · GHA frozen      |
| **Reporting / Analytics (platform)** | `@apzhub/reporting-*` **0.1.0**                                              | APZREPORT-003                 | PRWL — **not** Metabase OSS wave          |
| **Projects**                         | `@apzhub/integration-plane` **0.6.0**                                        | OSS-101-10                    | Adapter **certified**; Module UI deferred |
| **Support**                          | `@apzhub/integration-zammad` **0.6.0**                                       | OSS-102 / OSS-110-14          | CERTIFIED_WITH_LIMITATIONS · UI PRWL      |
| **Operations**                       | `@apzhub/platform-operations` **0.1.0**                                      | M8-03 · PRH-008 / PRH-012–018 | Operational                               |
| **Workbench / Runtime**              | `@apzhub/workbench-framework`, `@apzhub/platform-runtime`                    | M2–M3                         | Delivered                                 |
| **Law Platform**                     | `@apzhub/law-platform`, legal-business-core                                  | LAW-001…015                   | Milestone closed                          |
| **Time Tracking (APZ Time)**         | —                                                                            | Planned Kimai wave            | **Not started** (product phase)           |
| **Analytics (Metabase)**             | —                                                                            | Planned Wave 5                | **Not started** (product phase)           |

---

## Frozen Architecture

The following architectures are **frozen or closed** on disk. Future work **extends** them; it does **not** redesign them without **ADR + Owner approval**.

| Subsystem                                | Freeze / closeout reference                   |
| ---------------------------------------- | --------------------------------------------- |
| Integration SDK                          | OSS-100-11 · **1.0.0** · Architecture Frozen  |
| Search Platform                          | APZSEARCH-008 · Architecture Frozen           |
| Search Publication                       | APZSEARCH-019 · Architecture Frozen           |
| Documents                                | APZDOCS-006 · architecture frozen             |
| Workflow SoR + Engine (n8n)              | APZWORKFLOW-011 · frozen                      |
| Notifications SoR                        | APZNOTIFY-006 · closed/frozen                 |
| Configuration SoR                        | APZCONFIG-006 · closed/frozen                 |
| Administration SoR                       | APZADMIN-006 · closed/frozen                  |
| Identity Administration SoR              | APZIDENTITY-006 · closed/frozen               |
| Observability SoR                        | APZOBSERVE-006 · closed/frozen                |
| Metrics SoR                              | APZMETRICS-006 · Architecture Frozen / closed |
| CI/CD Reference Adapter (GitHub Actions) | APZTCMS-020 · frozen                          |
| Architecture Baseline v1.0               | Frozen reference                              |

**Delivered platform substrate (accepted; extend, do not redesign without ADR):**

| Substrate    | Package                                   | Programme                     |
| ------------ | ----------------------------------------- | ----------------------------- |
| Outbox       | `@apzhub/platform-outbox` **0.1.0**       | PCv2-02 ACCEPTED / CLOSED     |
| Event Bus    | `@apzhub/platform-event-bus` **0.1.0**    | OSS-100-12 ACCEPTED / CLOSED  |
| Provisioning | `@apzhub/platform-provisioning` **0.1.0** | OSS-100-12+ ACCEPTED / CLOSED |
| Governance   | `@apzhub/platform-governance` **0.1.0**   | M8-05 / ADR-0044              |

**Platform Service contracts** are consumed through `@apzhub/platform-service-contracts` / domain `*-contracts` packages and the gateway facade — treat contract evolution as a governed change, not an ad-hoc rewrite.

---

## Engineering Process

APZHUB engineering follows a repository-gated lifecycle ([AI-WORKFLOW](./AI-WORKFLOW.md)):

1. **Bootstrap** — read AI-MANIFEST → CURRENT-MILESTONE → verify disk
2. **Recommendation** — single programme from ACTIVE-BACKLOG (not invented)
3. **Owner Approval** — explicit authorisation
4. **Implementation** — bounded sprint guide
5. **Testing** — unit / integration / audit as required
6. **Certification** — programme audit / certify commands where defined
7. **Completion Report** — delivery record
8. **Programme Acceptance Report** — formal readiness for owner
9. **Owner Acceptance** — ACCEPTED / CLOSED
10. **Repository Verification** — CURRENT-* / inventory consistency

**Why the repository is authoritative:** conversation history is advisory only. Package versions, completion reports, and Knowledge Foundation status documents define what exists. Agents and humans must not invent programme IDs, milestones, or versions.

---

## Current Platform Maturity

| Dimension                  | Assessment                                                                                                                                          |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Architecture maturity**  | High — layered architecture, freeze notices, ADR catalogue, certified adapters                                                                      |
| **Operational maturity**   | High for foundation — PRH guides, smoke suite, outbox worker, health/diagnostics; production Vault / BullMQ / full SaaS billing remain enhancements |
| **Engineering maturity**   | High — monorepo, strict TypeScript culture, Vitest/Playwright/audit scripts, Owner Acceptance gates                                                 |
| **Documentation maturity** | High — Knowledge Foundation, inventories, sprint/acceptance reports                                                                                 |
| **AI maturity**            | High for governance — AI-MANIFEST / AI-BOOTSTRAP / AI-WORKFLOW; product AI Assist deferred                                                          |
| **Repository maturity**    | High — single monorepo source of truth; KF reconciliation (KF-001) completed                                                                        |

**Overall:** Platform Foundation is **complete and production-capable as a substrate**, with known product gaps (e.g. Projects UI deferred, Time Tracking / Metabase not started).

---

## Remaining Platform Enhancements

These are **future enhancements**, not missing foundation work:

| Enhancement                             | Repository note                                                            |
| --------------------------------------- | -------------------------------------------------------------------------- |
| **Vault / production secrets**          | Deferred (PCv2-04 class) — PlaceholderVault / refs pattern today           |
| **GitLab CI adapter**                   | Future — GHA reference adapter already frozen                              |
| **BullMQ / full job registry**          | PCv2-08 class — explicitly deferred historically                           |
| **Notification delivery providers**     | APZNOTIFY-007 — roadmap only                                               |
| **Workflow UX / write-path deepening**  | APZWORKFLOW-012 — roadmap only                                             |
| **M17 CI/CD / release engineering**     | Listed in PCS-001 / backlog priority — not authorised as CURRENT-MILESTONE |
| **Billing / licensing / subscriptions** | Explicitly out of OSS-100-12+ scope                                        |
| **AI Assist**                           | Deferred                                                                   |
| **Security Ops OSS adapters**           | Waves 8–9 — not started                                                    |

---

## Transition to Product Engineering

**Platform Foundation is COMPLETE.**

Future investment should primarily target **products** that consume this platform — Module → Platform Service → Connector → Engine — without bypassing frozen layers.

### Proposed product roadmap (Phase 3)

Names are **product themes** from the repository product / OSS catalogues (not new invented programme IDs):

| Product theme     | Repository basis                                                             |
| ----------------- | ---------------------------------------------------------------------------- |
| **APZ Projects**  | Plane Wave 1 certified; **Module UI deferred** — primary product surface gap |
| **APZ Time**      | Time Tracking — planned Kimai OSS Wave 3 (**not started**)                   |
| **APZ Documents** | Native Documents APZDOCS-006 frozen — deepen product UX / adoption           |
| **APZ Analytics** | Platform Reporting exists; Metabase OSS Wave 5 **not started**               |
| **APZ Support**   | Zammad adapter + Support UI PRWL — deepen / harden product                   |
| **Law Platform**  | LAW-001…015 milestone closed — product validation / GTM                      |

No product programme above is authorised until Owner Approval of a named backlog / sprint ID.

---

## Lessons Learned

1. **Repository-first engineering** — disk and KF beat chat; prevents invented status
2. **Architecture before implementation** — manifests, ADRs, freeze notices before code sprawl
3. **Documentation as code** — sprint guides, audits, CURRENT-* keep programmes auditable
4. **AI governance** — AI-MANIFEST + lifecycle states keep agents inside Owner gates
5. **Incremental delivery** — wave freezes (SDK, Search, SoRs) compound safely
6. **Certification** — `pnpm audit:*` / `certify:*` make Definition of Done enforceable
7. **Owner approval** — Recommendation ≠ Approval ≠ Acceptance; each gate is explicit

---

## Conclusion

**Platform Foundation is COMPLETE.**

APZHUB has delivered a repository-driven, governed, event-capable platform with frozen core architectures, certified integrations, operational readiness, and product provisioning.

Future engineering enters:

# Phase 3 — Product Engineering

Extend products. Respect freezes. Require ADR + Owner approval for architectural redesign. Await Owner direction before the next authorised programme.

---

## See also

- [AI-MANIFEST](./AI-MANIFEST.md)
- [CURRENT-MILESTONE](./CURRENT-MILESTONE.md)
- [CURRENT-STATE](./CURRENT-STATE.md)
- [INTEGRATION-PRODUCT-CAPABILITY-INVENTORY](./INTEGRATION-PRODUCT-CAPABILITY-INVENTORY.md)
- [PROJECT-INDEX](./PROJECT-INDEX.md)
- [APZHUB-CONSTITUTION](./APZHUB-CONSTITUTION.md)
- [PCS-001 Owner Approval](../strategy/PCS-001-owner-approval.md)
