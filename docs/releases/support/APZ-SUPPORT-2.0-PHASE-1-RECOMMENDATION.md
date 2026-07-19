# APZ Support 2.0 — Phase 1 Recommendation

> **Programme:** APZ Support Release **2.0** Planning  
> **Classification:** DOCUMENTATION ONLY — recommendation  
> **Related:** [Readiness Assessment](./APZ-SUPPORT-2.0-READINESS-ASSESSMENT.md) · [Gaps](./APZ-SUPPORT-IMPLEMENTATION-GAPS.md)  
> **Date:** 2026-07-19  
> **Status:** Recommendation — **does not authorise implementation**

---

## Primary recommendation

### Do **not** promote APZ Support to Implementation Ready

Support is already **Production**. IR is the wrong gate.

### Do **not** begin Release 2.0 implementation from this planning suite

Implementation requires a separate Owner Approval of a **named** Major programme + Sprint Guide (Definition of Ready).

### Do **not** rebuild ticket Workbench as “Phase 1 greenfield”

The Owner’s illustrative Phase 1 list (ticket dashboard/list/detail/assignment/status/search/Workbench) is **already delivered** on disk under OSS-110-13/14. Recommending those as new build scope would invent work and contradict repository evidence.

---

## If Owner later Approves a Support Release 2.0 programme

Recommended **Phase 1** scope for that future programme (repository-supported only):

| Track                                                              | Scope                                                                                                               | Notes                                                                                                                                    |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Product release packaging**                                  | Establish Support SemVer baseline + `docs/releases/support/{version}/` evidence pattern (mirror Projects/Time)      | Closes S2-01 honesty gap; may be **1.0.0** packaging of current Production slice **or** direct **2.0.0** if Owner so names the programme |
| **B — Ops Workbench parity (optional)**                            | Support health + diagnostics views consuming existing platform/adapter health/diagnostics HTTP — no Zammad redesign | Soft gaps S2-07/S2-08; Projects/Time parity                                                                                              |
| **C — One limitation track (Owner picks at most one for Phase 1)** | Event Bus publish **or** webhook ingress **or** attachments **or** Support notifications wiring                     | Each may need ADR + Owner if freeze-touching; do not stack all into Phase 1                                                              |

### Explicitly out of Phase 1

| Excluded                                           | Reason                             |
| -------------------------------------------------- | ---------------------------------- |
| Rebuild ticket list/detail/assign/status Workbench | Already Production                 |
| Metabase / Analytics product                       | Portfolio Concept; not Support SoR |
| Inventing new OSS-102 adapter redesign             | Wave 2 closed; needs ADR + Owner   |
| Cross-product deep integrations                    | Beyond evidence                    |
| Claiming IR promotion                              | Already past IR                    |

---

## Alignment to Owner illustrative Phase 1 list

| Owner example                      | Repository status                                                  |
| ---------------------------------- | ------------------------------------------------------------------ |
| Ticket dashboard / list / detail   | **Present**                                                        |
| Ticket assignment / status updates | **Present**                                                        |
| Basic search                       | **Present**                                                        |
| Workbench integration              | **Present**                                                        |
| Health / Diagnostics               | **Partial** — platform/adapter yes; Support Workbench views absent |
| Audit                              | **Partial** — platform pipeline; product surface thin              |

---

## STOP

No implementation. No Workbench changes. No Release 2.0 start. Await Owner Acceptance of planning, then separate Approval for any named programme.
