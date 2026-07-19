# APZ Time — Phase 1 Recommendation (Readiness Reassessment)

> **Programme:** APZHUB-TIME-READINESS-001  
> **Classification:** DOCUMENTATION ONLY  
> **Related:** [Reassessment](./APZ-TIME-IMPLEMENTATION-READINESS-REASSESSMENT.md) · [Gaps](./APZ-TIME-IMPLEMENTATION-GAPS.md)  
> **Date:** 2026-07-19

---

## Recommendation

**Do not promote APZ Time to Implementation Ready.**  
**Do not recommend APZ Time product implementation (Workbench, React, product features) at this time.**

| Decision              | Value                                                                               |
| --------------------- | ----------------------------------------------------------------------------------- |
| Maturity              | Remain **Planning**                                                                 |
| Implementation Ready  | **Not achieved**                                                                    |
| Phase 1 product scope | **Not issued** — IR gate failed                                                     |
| Next work class       | Dependency closure only — requires **separate Owner Approval** (not this programme) |

This document does **not** authorise Kimai domain expansion, Platform Service changes, HTTP changes, Workbench, or APZ Time product code.

---

## Why Phase 1 product scope is not recommended

1. **SoR path incomplete.** Kimai **0.1.0** is foundation-only. Production Time HTTP domain operations against Kimai return **501**. A product Phase 1 that logs/edits timesheets would have no certified engine-backed write path.
2. **Projects IR precedent not met.** Projects entered IR with a domain-capable Plane adapter and working HTTP. Time has ops-capable Kimai + limited services/HTTP — not equivalent.
3. **In-memory is not a product SoR.** Non-production `APZHUB_TIME_DOMAIN_MODE=in_memory` must not be treated as Implementation Ready for APZ Time.
4. **Owner instruction for this programme:** if IR cannot be declared, explain why and **do not recommend implementation**.
5. **Workbench without domain path** would recreate the architecture defect the 1.0 planning suite explicitly blocked (R-01).

---

## What would need to be true before a Phase 1 product scope is written

Only after a future Owner-approved dependency programme closes **IR-01 / IR-02 / IR-03** (and IR pack mark) should a Phase 1 product scope be drafted. Illustrative shape (not authorised now):

| Candidate Phase 1 theme                                      | Depends on                                                     |
| ------------------------------------------------------------ | -------------------------------------------------------------- |
| Timer / timesheet list-create-edit-stop via `/api/v1/time/*` | Kimai domain + non-501 HTTP                                    |
| Activities / customers / tags minimal UX                     | Same                                                           |
| Typed Workbench client + Playwright                          | Module + IR + Owner Approval of product release                |
| Explicitly out until later phases                            | Approvals · Reporting UI · Analytics · Exports · Notifications |

**No Sprint Guide for APZ Time product implementation is authorised by this document.**

---

## Owner options (after Acceptance of this reassessment)

| Option                                                 | Meaning                                                                                                                       |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| **A — Accept reassessment**                            | Keep **Planning**; do not implement APZ Time; await separate Approval for Kimai **domain** expansion (or equivalent SoR path) |
| **B — Authorise Kimai domain expansion programme**     | Separate Owner Approval — not this doc                                                                                        |
| **C — Authorise limited IR with explicit limitations** | Owner may override honesty gates; **not recommended** by this reassessment                                                    |

This programme recommends **Option A** only.

---

## STOP

No APZ Time implementation. No Workbench. No React. Await Owner Acceptance of APZHUB-TIME-READINESS-001.
