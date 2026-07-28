# APZ Support — Implementation Gaps (Release 2.0 Planning)

> **Programme:** APZ Support Release **2.0** Planning  
> **Classification:** DOCUMENTATION ONLY  
> **Related:** [Readiness Assessment](./APZ-SUPPORT-2.0-READINESS-ASSESSMENT.md)  
> **Date:** 2026-07-19  
> **Rule:** Gaps from repository evidence only

---

## Context

APZ Support is already **Production** (OSS-110-12 CERTIFIED_WITH_LIMITATIONS · OSS-110-14 PRODUCTION_READY_WITH_LIMITATIONS · Zammad **0.6.0**). Gaps below are relative to a future **Major Release 2.0** honesty bar — **not** relative to Implementation Ready (already past).

---

## Gap register

| ID    | Gap                                                                                                   | Class                                                                           | Blocks IR?                                                     | Blocks Release 2.0 honesty?                             | Evidence                                                                 |
| ----- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------ |
| S2-01 | No product SemVer / `docs/releases/support/` Production baseline (unlike Projects 1.1.0 / Time 1.0.0) | **Critical**                                                                    | **No** (past IR)                                               | **Yes** — packaging before claiming product Release 2.0 | Pack RELEASE-PLAN; no `docs/releases/support/`                           |
| S2-02 | Event Bus publish for Support operations                                                              | **Closed** (APZHUB-1.1-003 — Awaiting Acceptance)                               | **Partial** — catalogue publish wired; linked/SLA still Target | Residual if 2.0 claims webhook-driven ops               | KNOWN-LIMITATIONS · APZHUB-1.1-003                                       |
| S2-03 | No Zammad webhook HTTP ingress                                                                        | **High**                                                                        | **No**                                                         | **Yes** if 2.0 claims inbound sync/webhooks             | KNOWN-LIMITATIONS                                                        |
| S2-04 | No binary attachments                                                                                 | **High**                                                                        | **No**                                                         | **Yes** if 2.0 claims attachment UX                     | KNOWN-LIMITATIONS                                                        |
| S2-05 | Support vertical notifications / realtime                                                             | **Partial** — in-app ENF Attention (APZHUB-1.1-003); realtime WS/SSE still open | **No** realtime                                                | **Yes** if 2.0 claims realtime delivery                 | KNOWN-LIMITATIONS · APZHUB-1.1-003                                       |
| S2-06 | Durable idempotency / production mapping posture                                                      | **Medium**                                                                      | **No**                                                         | Soft → hard for ops hardening                           | KNOWN-LIMITATIONS (in-memory mapping in tests)                           |
| S2-07 | No dedicated Support Workbench health view                                                            | **Medium**                                                                      | **No**                                                         | Soft (parity with Projects/Time)                        | `lib/support/routes.ts` — no health section                              |
| S2-08 | No dedicated Support Workbench diagnostics view                                                       | **Medium**                                                                      | **No**                                                         | Soft (parity)                                           | Same                                                                     |
| S2-09 | Support-specific audit product surface thin                                                           | **Medium**                                                                      | **No**                                                         | Soft                                                    | Platform pipeline only                                                   |
| S2-10 | Analytics deep integration (Metabase / Analytics product)                                             | **Low**                                                                         | **No**                                                         | **No** if deferred                                      | Portfolio Analytics **Concept**; Support analytics spine already present |
| S2-11 | Commercial GA declaration / marketing packaging                                                       | **Low**                                                                         | **No**                                                         | Soft                                                    | RELEASE-PLAN: GA not declared                                            |
| S2-12 | Owner Approval + Sprint Guide for named 2.0 programme                                                 | **Critical**                                                                    | N/A                                                            | **Yes** before any 2.0 code                             | DoR · Reference Implementation                                           |

---

## Already delivered (do **not** re-list as 2.0 greenfield gaps)

| Capability                            | Evidence                               |
| ------------------------------------- | -------------------------------------- |
| Ticket / request list, detail, create | Workbench + `/api/v1/support-requests` |
| Assignment / status transition        | Certified Support spine                |
| Organisations / groups / users        | Workbench + HTTP                       |
| Basic Support search                  | `/api/v1/support-search` + UI          |
| Search publication                    | `@apzhub/search-support` **0.1.0**     |
| Workbench module + navigation         | `services/support/manifests/*`         |
| Zammad adapter                        | **0.6.0** CERTIFIED_WITH_LIMITATIONS   |
| AuthN / AuthZ / pipeline              | Platform + Support HTTP                |

---

## Critical path to a Release 2.0 programme (planning only)

```text
Owner Acceptance of this planning suite
  → Owner Approval of a named Support Major / 2.0 programme (+ Sprint Guide)
  → Establish product SemVer packaging baseline (S2-01) OR Owner-explicit versioning decision
  → Select limitation tracks (S2-02…S2-05) with ADR where freezes apply
  → Implement only approved tracks
  → Certify + Acceptance → 2.0.0 Production baseline
```

Workbench ticket CRUD is **not** on the critical path — it already exists.
