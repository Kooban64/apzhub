# SPR-OPS-PLANE-001 — Projects Plane adapter host enablement

> **Status:** **COMPLETE · DELIVERED** — 2026-08-15  
> **Depends on:** [SPR-ADOPT-002](./SPR-ADOPT-002-commercial-pillar-operator-dogfood.md) · [SPR-APZPRD-003](./SPR-APZPRD-003-projects-workbench-deepen.md)  
> **AuthN:** BetterAuth only — Plane token server-side only  
> **Does not:** Authentik retire · Cap reopen · commit secrets · change Plane CE containers

## Outcome

Make Projects list/live probe **ops-enableable** on the coexistence host: `.secrets/plane` loader + runbook. Operator still pastes the Plane API token locally (never into git).

## Ships

| ID  | Ship                              | Landed                                                                        |
| --- | --------------------------------- | ----------------------------------------------------------------------------- |
| P1  | `.secrets/plane` fill-only loader | `load-local-secrets.ts`                                                       |
| P2  | `.env.example` + runbook          | Prefer secrets file over plain `PLANE_API_TOKEN` in `.env`                    |
| P3  | Host enablement instructions      | [projects-plane-adapter.md](../operations/runbooks/projects-plane-adapter.md) |

## Acceptance

1. Without `.secrets/plane`, behaviour unchanged (disabled / misconfigured honesty).
2. With secrets file + `PLANE_INTEGRATION_ENABLED=true`, token is applied when unset in process env.
3. Docs never include a live token.
4. Authentik untouched.

## Operator follow-up (this host)

Create `.secrets/plane` with the existing Plane API token (e.g. label `apz-api`) and restart web — see runbook.
