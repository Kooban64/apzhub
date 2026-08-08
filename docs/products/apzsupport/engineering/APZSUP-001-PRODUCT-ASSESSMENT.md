# APZSUP-001 — APZ Support Product Assessment

| Field     | Value                                                                                            |
| --------- | ------------------------------------------------------------------------------------------------ |
| Document  | **APZSUP-001**                                                                                   |
| Kind      | Product assessment — Delivery Standard v1.0                                                      |
| Status    | **PROPOSED** · awaiting Owner Accept of inventory (APZSUP-002)                                   |
| Timestamp | 20260808T172000Z                                                                                 |
| Method    | Same cadence as APZ Projects · APZQEP · APZ Workflow                                             |
| Authority | Repository is source of truth · [APZHUB-DELIVERY-STANDARD.md](../../APZHUB-DELIVERY-STANDARD.md) |

---

## Owner questions (answered from repository)

| #   | Question                                 | Answer                                                                                                                    |
| --- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 1   | **What is the current state?**           | **Operational production packaging** — SemVer 1.0.0 PRWL, RI #002, native freeze; not Delivery-Standard Production Ready. |
| 2   | **Where is the source of truth?**        | **This Git repository** (`/home/ubuntu/apz-portal` · remote `Kooban64/apzhub`) — code, manifests, docs, evidence.         |
| 3   | **Is the inventory already known?**      | **NO** — derive the complete finite inventory first (no Delivery Standard closeout exists).                               |
| 4   | **What is the Production Ready target?** | **Production Ready v1.0** — elevate existing 1.0.0 baseline under the Delivery Standard (not Support 2.0).                |

---

## Assessment (single page)

```text
APZ Support

Classification:
A – Mostly Complete

Current State:
- Full Module → SupportService → Zammad adapter → engine spine in repository.
- SemVer 1.0.0 packaging ACCEPTED; OSS-110 API/UI CERTIFIED / PRWL.
- Native N-01…N-04 COMPLETE / FROZEN; REFERENCE IMPLEMENTATION #002 DECLARED.
- Portfolio scoreboard: Operational (not Production Ready CLOSED).
- No Delivery Standard closeout inventory, Owner PR decision, or Support production tag.

Production Ready Definition:
APZ Support is Production Ready when a permissioned user can raise, follow, communicate
on, and close support requests through the APZHUB Workbench against a durable, fail-closed
platform path, with honest limitation disclosure, H1–H5 hardening evidence, Owner release
decision, and git tag apz-support-1.0 — without Support 2.0 features or architecture reopen.

Remaining Inventory → APZSUP-002

Recommendation:
Accept APZSUP-002 → Begin Engineering → Production Ready v1.0.
```

---

## 1. What already exists

| Layer                     | Evidence                                                      | State                                                                         |
| ------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Identity / scope          | `apzsupport/PRODUCT-SCOPE.md` · mission CLOSED                | Tickets, comms, assignment, knowledge access, visibility, escalation, closure |
| Native + RI               | `apz-support-native-001/` · `REFERENCE-IMPLEMENTATION-002.md` | **COMPLETE / FROZEN** · RI **#002**                                           |
| Service + modules         | `services/support/` · Activity Bar `/workspace/support`       | Present                                                                       |
| Integration               | `integrations/zammad/` · platform providers                   | Certified adapter path                                                        |
| HTTP + UI                 | `apps/web/app/api/v1/support-*` · `components/support/*`      | Substantial                                                                   |
| Events / search           | `events/support/*` · `packages/search-support/`               | Present                                                                       |
| Packaging                 | `docs/releases/support/1.0.0/` · acceptance ACCEPTED          | SemVer **1.0.0** PRWL                                                         |
| Vertical tests            | `testing/support-vertical/*` · component tests                | Substantial                                                                   |
| Git Delivery-Standard tag | —                                                             | **None** (contrast Projects / QEP / Workflow)                                 |

---

## 2. What is missing (Delivery-Standard Production Ready)

| Gap                                                                | Why it blocks                          |
| ------------------------------------------------------------------ | -------------------------------------- |
| No finite closeout inventory (G0)                                  | Engineering Execution unauthorised     |
| Status dissonance (Operational vs “Production PRWL” vs RI)         | No single Production Ready face        |
| Documented durability / realtime / attachment honesty residuals    | Must dispose or close under inventory  |
| Hardening not re-run to H1–H5 under this standard                  | Prior OSS-110 ≠ this closeout          |
| No Owner Release Decision + production tag under Delivery Standard | Cannot declare Production Ready CLOSED |

**Not missing for this closeout:** Support 2.0 · new engines · redesign · native N-05 · architecture reopen.

---

## 3. Classification rationale

| Class                   | Verdict                                                     |
| ----------------------- | ----------------------------------------------------------- |
| **A – Mostly Complete** | **Yes** — shipped vertical + RI; elevate closeout remaining |
| B – Partially Complete  | No — far beyond foundation gaps                             |
| C – Foundation Only     | No                                                          |

---

## 4. Shortest path

```text
Accept APZSUP-002 inventory
  → Phase 1 honesty / status face / residual product gaps only
  → Phase 2 durability disposition + migration + authz certify
  → Phase 3 H1–H5
  → Phase 4 RC → Owner decision → tag apz-support-1.0 → scoreboard
```

Do not rebuild Support. Close what is open under Delivery Standard v1.0.

---

## Next

**APZSUP-002** — Finite Product Inventory (proposed · awaiting Owner Accept).
