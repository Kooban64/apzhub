# Owner Acceptance — APZQEP-ENG-020C

> **Status:** **ACCEPTED / CLOSED**  
> **Programme:** APZQEP-ENG-020C  
> **Title:** Requirements Lifecycle Engine & State Machine  
> **Classification:** ENGINEERING IMPLEMENTATION · **COMPLETE**  
> **Date prepared:** 2026-07-24  
> **Date accepted:** 2026-07-25  
> **Prerequisite:** APZQEP-ENG-020B — **ACCEPTED / CLOSED**  
> **Recommendation at submission:** READY FOR OWNER LIFECYCLE ACCEPTANCE

## Decision record (Owner)

| Field             | Value                                                                                                                 |
| ----------------- | --------------------------------------------------------------------------------------------------------------------- |
| Decision          | **ACCEPTED**                                                                                                          |
| Repository status | **CLOSED**                                                                                                            |
| Classification    | **COMPLETE**                                                                                                          |
| Date              | 2026-07-25                                                                                                            |
| Authority         | Owner                                                                                                                 |
| Baseline          | APZQEP-ENG-020C Requirements Lifecycle Engine — authoritative (`@apzhub/lifecycle-engine` 0.1.0 · Requirements 0.3.0) |
| Conditions        | Acceptance authorises **APZQEP-ENG-020D** Requirements Versioning & Baselines                                         |

## Acceptance checklist (Owner)

- [x] Reusable `@apzhub/lifecycle-engine` established (generic, no Requirements coupling)
- [x] Nine lifecycle states operational
- [x] Valid transition matrix enforced; invalid transitions prevented
- [x] Lifecycle history persisted and queryable
- [x] Domain events generated for transitions (no consumers)
- [x] Lifecycle permissions enforced via Platform PermissionService
- [x] Platform audit + history + reason capture on every transition
- [x] UI: badge, available actions, dialog, history timeline (no client lifecycle logic)
- [x] Search exposes lifecycle status
- [x] Build / typecheck / tests green
- [x] No multi-stage approvals, baselines, AI, MCP, import/export, workflow orchestration

## Binding foundations

1. Requirement status changes only through the lifecycle engine.
2. Ordinary CRUD updates may not directly modify lifecycle status.
3. Requirements owns its lifecycle policy.
4. The generic lifecycle engine must not contain Requirements-specific business rules.
5. Available UI actions must be obtained from server-authoritative lifecycle policy.
6. Every transition must produce audit, lifecycle history, and a domain event.
7. Invalid transitions must fail within the domain or lifecycle-policy boundary.
8. Archived requirements are terminal unless a future Owner-approved programme explicitly introduces restoration.
9. Lifecycle history must remain separate from requirement-content version history.
10. Changes to the accepted state model or transition matrix require explicit Owner approval and corresponding documentation and test updates.

## Downstream

**Authorised follow-on (status at repository reconciliation):** **APZQEP-ENG-020D** — Requirements Content Versioning — **IMPLEMENTED / AWAITING OWNER ACCEPTANCE**.

Preserve ENG-020A foundations, ENG-020B persistence contracts, and this lifecycle baseline.
Do **not** begin **APZQEP-ENG-020E** Baselines until Owner acceptance of ENG-020D.
