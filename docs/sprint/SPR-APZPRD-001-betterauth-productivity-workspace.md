# SPR-APZPRD-001 — Productivity workspace on BetterAuth (Authentik retirement path)

> **Status:** **AUTHORISED · IN PROGRESS** — 2026-08-15  
> **Pillar:** [APZPRD](../strategy/APZPRD-ENTERPRISE-PRODUCTIVITY-PLATFORM.md)  
> **Depends on:** BetterAuth sole AuthN ([OWNER-BETTERAUTH-SOLE-AUTHN](../decisions/OWNER-BETTERAUTH-SOLE-AUTHN.md)); SPR-COMM-001/002 entitlements  
> **Does not:** Reintroduce Authentik · build launcher tiles · unbounded product rewrite

## Outcome

APZPRD users enter via **BetterAuth only**. The productivity workbench assembles from entitlements (Projects / Support / Time / …). Engine access uses APZHUB adapters (silent handoff) — not Authentik forward-auth. This is the first authorised step toward retiring Authentik.

## Ships

| ID    | Ship                                   | Approach                                                                                                                          |
| ----- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 001-A | Auth lock-in                           | Docs + Admin/Ops honesty: BetterAuth sole; Authentik legacy-only                                                                  |
| 001-B | Retirement checklist                   | Ops runbook: cutover gates before stopping Authentik containers                                                                   |
| 001-C | Workbench assembly proof               | Org/individual with `productivity` suite lands `/workspace` with entitled modules only — no Authentik cookie                      |
| 001-D | First engine handoff without Authentik | Document + wire one adapter path (Projects/Plane or Support/Zammad) using server credentials / platform session — no forward-auth |

## Acceptance

1. Owner decision published and indexed.
2. Login → workbench path never requires Authentik.
3. Retirement runbook lists concrete cutover checks.
4. At least one productivity engine call succeeds with BetterAuth session + adapter (not Authentik).
5. Authentik remains running for legacy vhosts until checklist GO — then Owner authorises stop.

## Delivery record (in progress)

- **001-A:** [OWNER-BETTERAUTH-SOLE-AUTHN](../decisions/OWNER-BETTERAUTH-SOLE-AUTHN.md) IN FORCE; 007 / IAM quick-ref / ENVIRONMENT / strategy / QEP Admin aligned.
- **001-B:** [retire-authentik.md](../operations/runbooks/retire-authentik.md) published (checklist — not GO).
- **001-C:** `apps/web` has **zero** Authentik/forward-auth imports; login is BetterAuth `signIn.email` only (`login-form.tsx`).
- **001-D:** Plane productivity path uses server `PLANE_API_TOKEN` (adapter), not Authentik — confirm live health under SPR-APZPRD-001 follow-up; Support/Kimai same pattern when entitled.

Authentik containers remain up for legacy vhosts until Owner GO on the retirement checklist.
