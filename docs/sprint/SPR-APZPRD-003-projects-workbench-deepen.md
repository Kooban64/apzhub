# SPR-APZPRD-003 — Projects workbench deepen (BetterAuth only)

> **Status:** **COMPLETE · DELIVERED** — 2026-08-15  
> **Pillar:** [APZPRD](../strategy/APZPRD-ENTERPRISE-PRODUCTIVITY-PLATFORM.md)  
> **Depends on:** [SPR-APZPRD-002](./SPR-APZPRD-002-entitled-projects-workbench.md) **COMPLETE**  
> **AuthN:** **BetterAuth only** — [OWNER-BETTERAUTH-SOLE-AUTHN](../decisions/OWNER-BETTERAUTH-SOLE-AUTHN.md)  
> **Does not:** Authentik features · Authentik login · forward-auth for Projects · stop Authentik containers · Cap reopen

## Outcome

Deepen the entitled **Projects** operator experience while locking AuthN honesty: every Projects journey uses BetterAuth + APZHUB AuthZ + Plane **adapter API key**. Authentik is never consulted.

## Ships

| ID    | Ship                         | Approach                                                                                 |
| ----- | ---------------------------- | ---------------------------------------------------------------------------------------- |
| 003-A | Auth posture in Readiness UI | Surface BetterAuth / `authentikUsed: no` / adapter API-key clearly on Projects Readiness |
| 003-B | Engine health contract test  | Unit proof health payload always `authN: betterauth`, `authentikUsed: false`             |
| 003-C | Operator guide deepen        | Expand APZPRD operator guide with workbench map + auth non-negotiables                   |
| 003-D | Retirement checklist link    | Point retire-Authentik runbook at 003 deepen; **still not Owner GO** to stop containers  |

## Acceptance

1. No Authentik imports or forward-auth in Projects paths.
2. Readiness UI shows BetterAuth-only posture without operator confusion.
3. Health API never reports `authentikUsed: true`.
4. Operator guide documents silent adapter handoff (PLANE_API_TOKEN server-side).
5. Authentik containers remain untouched (legacy coexistence until separate Owner GO).

## Delivery record

| ID        | Landed                                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------------ |
| **003-A** | `projects-health-view.tsx` identity posture panel (`data-testid=projects-health-auth-posture`)         |
| **003-B** | `buildProjectsEngineHealthPayload` + unit test — `authentikUsed` locked false                          |
| **003-C** | [APZPRD OPERATOR-USER-GUIDE](../products/apzprd/guides/OPERATOR-USER-GUIDE.md) deepened                |
| **003-D** | [retire-authentik.md](../operations/runbooks/retire-authentik.md) updated — checklist still **not GO** |
