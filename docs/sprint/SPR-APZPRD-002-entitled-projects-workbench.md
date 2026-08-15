# SPR-APZPRD-002 — Entitled Projects workbench (BetterAuth)

> **Status:** **COMPLETE · DELIVERED** — 2026-08-15  
> **Pillar:** [APZPRD](../strategy/APZPRD-ENTERPRISE-PRODUCTIVITY-PLATFORM.md)  
> **Depends on:** [SPR-APZPRD-001](./SPR-APZPRD-001-betterauth-productivity-workspace.md) **COMPLETE**; SPR-COMM-001/002  
> **Does not:** Flip entire productivity suite · retire Authentik containers · Support/Time GA

## Outcome

An entitled user reaches **APZ Projects** in the workbench via BetterAuth only: catalogue → org/user grants → Activity Bar → list API → Plane adapter (or honest provider unavailable). Deep links and APIs deny when not entitled.

## Ships

| ID    | Ship                       | Approach                                                                                               |
| ----- | -------------------------- | ------------------------------------------------------------------------------------------------------ |
| 002-A | Projects commercially live | `projects` product + `pkg.apzprd.projects` `available`; dogfood org/user grants                        |
| 002-B | Product entitlement gate   | Soft gate (APZPEN pattern) on `projects.*` platform API ops; workspace deny when not entitled          |
| 002-C | List path honesty          | Entitled session → `GET /api/v1/projects` via adapter; health proves `authentikUsed: false`            |
| 002-D | Readiness surface          | Projects Readiness UI consumes `/api/v1/projects/health` (engine posture), not only platform `/health` |

## Acceptance

1. Catalogue marks Projects sellable (`available`).
2. Unentitled tenant with other subscriptions cannot call Projects APIs (403 `PRODUCT_ACCESS_DENIED`).
3. Entitled demo/dogfood user can open `/workspace/projects/*` and hit list/health under BetterAuth.
4. Authentik still **not** stopped — retirement checklist remains non-GO.

## Delivery record

- **002-A:** `projects` product + `pkg.apzprd.projects` **available**; demo/dogfood org + user grants include Projects.
- **002-B:** Soft product gate on `projects.*` API ops (`requireProjectsProductAccess`); workspace denies deep links when entitlements exclude Projects.
- **002-C / 002-D:** Readiness UI → `GET /api/v1/projects/health` (BetterAuth + adapter posture, `authentikUsed: false`).

Authentik containers remain up until Owner GO on the retirement checklist.
