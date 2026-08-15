# SPR-ADOPT-003 — Wired commercial engines dogfood

> **Status:** **COMPLETE · DELIVERED** — 2026-08-15  
> **Depends on:** SPR-OPS-PLANE/ZAMMAD/KIMAI/METABASE/N8N-001 (+ N8N-002 honesty)  
> **AuthN:** BetterAuth only — [OWNER-BETTERAUTH-SOLE-AUTHN](../decisions/OWNER-BETTERAUTH-SOLE-AUTHN.md)  
> **Does not:** Restart/reconfigure legacy engines · Authentik · unlock n8n execute · Paperless/Kiwi adapters

## Outcome

Confirm the five OPS-wired commercial surfaces work end-to-end for an entitled BetterAuth operator on the coexistence host, without touching the running legacy platform.

## Scope

| Pillar    | Engine (coexistence) | Dogfood bar                                             |
| --------- | -------------------- | ------------------------------------------------------- |
| Projects  | Plane                | Health + list without Plane/Authentik login             |
| Support   | Zammad               | Support requests list + workspace shell                 |
| Time      | Kimai                | Health/readiness + customers/timesheets                 |
| Analytics | Metabase             | Health + dashboards catalogue                           |
| Workflow  | n8n                  | Engine configured honesty + engine health (execute off) |

## Acceptance

1. BetterAuth sign-in only; `authentikUsed=false` on Projects health.
2. Each pillar returns a successful API happy path (list or health).
3. Workspace shells for the five pillars return HTTP 200.
4. Authentik and legacy engine containers remain running and unreconfigured.
5. Friction logged; no Cap reopen.

## Delivery artefacts

| Artefact          | Path                                                               |
| ----------------- | ------------------------------------------------------------------ |
| Pack README       | [adopt-003/README.md](../products/adopt-003/README.md)             |
| Checklist results | [CHECKLIST-RESULTS.md](../products/adopt-003/CHECKLIST-RESULTS.md) |
| Evidence          | [EVIDENCE.md](../products/adopt-003/EVIDENCE.md)                   |
| Friction log      | [FRICTION-LOG.md](../products/adopt-003/FRICTION-LOG.md)           |
