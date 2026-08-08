# APZTIM-001 — APZ Time Product Assessment

| Field     | Value                                                                                            |
| --------- | ------------------------------------------------------------------------------------------------ |
| Document  | **APZTIM-001**                                                                                   |
| Kind      | Product assessment — Delivery Standard v1.0                                                      |
| Status    | **COMPLETE** · inventory proposed (APZTIM-002)                                                   |
| Timestamp | 20260808T195500Z                                                                                 |
| Method    | Same cadence as Projects · APZQEP · Workflow · Support · Analytics · Knowledge                   |
| Authority | Repository is source of truth · [APZHUB-DELIVERY-STANDARD.md](../../APZHUB-DELIVERY-STANDARD.md) |

---

## Owner questions (answered from repository)

| #   | Question                                 | Answer                                                                                                                              |
| --- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **What is the current state?**           | **Operational** — RI #001, native Phase A COMPLETE/FROZEN, SemVer 1.0.0 Workbench ACCEPTED/CLOSED (PRWL); not Delivery-Standard PR. |
| 2   | **Where is the source of truth?**        | **This Git repository** (`/home/ubuntu/apz-portal` · remote `Kooban64/apzhub`) — code, manifests, docs, evidence.                   |
| 3   | **Is the inventory already known?**      | **NO** — derive the complete finite inventory first (no Delivery Standard closeout exists).                                         |
| 4   | **What is the Production Ready target?** | **Production Ready v1.0** — elevate existing Operational / 1.0.0 baseline under the Delivery Standard (not Time 2.0).               |

---

## Assessment (single page)

```text
APZ Time

Classification:
A – Mostly Complete

Current State:
- Module → Time Platform Services → Kimai adapter → engine spine present.
- SemVer 1.0.0 Workbench ACCEPTED/CLOSED (PRWL); HTTP CERTIFIED_WITH_LIMITATIONS.
- Native N-01…N-04 / Phase A COMPLETE; REFERENCE IMPLEMENTATION #001 DECLARED.
- Portfolio scoreboard: Operational (not Production Ready CLOSED under DS).
- No Delivery Standard finite inventory, Owner PR decision, or apz-time-1.0 DS tag.

Production Ready Definition:
Permissioned users can capture/manage timesheets and related records in
/workspace/time on a durable fail-closed Kimai-backed path, with honest
limitation disclosure, H1–H5 hardening, Owner release decision, and tag
apz-time-1.0 — without Time 2.0 / approvals / reporting UI programmes.

Remaining Inventory → APZTIM-002

Recommendation:
Accept APZTIM-002 → Begin Engineering → Production Ready v1.0
→ then formal Portfolio Completion (before Platform Evolution).
```

---

## 1. What already exists

| Layer                 | Evidence                                                      | State                                    |
| --------------------- | ------------------------------------------------------------- | ---------------------------------------- |
| Identity / ops        | `docs/products/apztime/` · RI #001                            | **IN FORCE**                             |
| Native + RI           | `APZHUB-TIME-NATIVE-001/` · `REFERENCE-IMPLEMENTATION-001.md` | **COMPLETE / FROZEN** · RI **#001**      |
| Module                | `services/time/manifests/time/module.yaml`                    | **1.0.0**                                |
| Services              | `packages/platform-services/src/services/time/`               | Present                                  |
| Connector             | `integrations/kimai/`                                         | Present (engine brand masked in product) |
| HTTP + UI             | `/api/v1/time/*` · `/workspace/time` · `components/time/*`    | Substantial                              |
| Tests                 | Vitest + Playwright `apzhub-time-1.0-*`                       | Substantial (pre-DS)                     |
| Pre-DS release        | `docs/releases/time/1.0.0/`                                   | Owner ACCEPTED PRWL                      |
| Delivery-Standard tag | —                                                             | **None**                                 |

---

## 2. What is missing (Delivery-Standard Production Ready)

| Gap                                                        | Why it blocks                            |
| ---------------------------------------------------------- | ---------------------------------------- |
| No finite closeout inventory (G0)                          | Engineering Execution unauthorised       |
| Status dissonance (Operational / Production ACCEPTED / RI) | No single Production Ready face under DS |
| Help/UI honesty residuals                                  | Must dispose under inventory             |
| Hardening not run to H1–H5 under this standard             | Prior packs ≠ this closeout              |
| Ops runbook / authz residual evidence                      | Required for PR phase                    |
| No Owner Release Decision + `apz-time-1.0` tag             | Cannot declare Production Ready CLOSED   |

---

## 3. Explicitly out of scope

- Time 2.0 / approvals / reporting UI / analytics / dashboards / leave / scheduling / AI
- Native programme reopen
- Architecture redesign without ADR
- Platform Evolution (blocked until Portfolio Completion freeze)

---

## Recommendation

**Accept APZTIM-002** → Begin Engineering → Production Ready v1.0 → **Portfolio Completion** close-out → freeze portfolio → only then Platform Evolution.
