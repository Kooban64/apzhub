# SPR-OPS-ZAMMAD-001 — Support Zammad adapter host enablement

> **Status:** **COMPLETE · DELIVERED** — 2026-08-15  
> **Depends on:** [SPR-OPS-PLANE-001](./SPR-OPS-PLANE-001-projects-plane-adapter-host.md) pattern · Support v1.0 foundation  
> **AuthN:** BetterAuth only — Zammad token server-side only  
> **Does not:** Authentik retire · Cap reopen · commit secrets · change Zammad CE containers

## Outcome

Make Support list/live probe **ops-enableable** on the coexistence host: `.secrets/zammad` loader + runbook + host-root `ZAMMAD_API_BASE_URL`.

## Ships

| ID  | Ship                               | Landed                                                                        |
| --- | ---------------------------------- | ----------------------------------------------------------------------------- |
| Z1  | `.secrets/zammad` fill-only loader | `load-local-secrets.ts`                                                       |
| Z2  | Bootstrap `apiBaseUrl` = host root | Avoid `/api/v1/api/v1` double prefix                                          |
| Z3  | Demo grants include Support        | `pkg.apzprd.service` + `support` product key                                  |
| Z4  | Host enablement runbook            | [support-zammad-adapter.md](../operations/runbooks/support-zammad-adapter.md) |

## Acceptance

1. Without `.secrets/zammad`, behaviour unchanged (disabled / misconfigured honesty).
2. With secrets file + `ZAMMAD_INTEGRATION_ENABLED=true`, token is applied when unset in process env.
3. Docs never include a live token.
4. Authentik untouched.
5. Host verified: Support list returns Zammad tickets for an entitled BetterAuth user.

## Operator follow-up (this host)

Keep `.secrets/zammad` gitignored. Restart web after rotating the token.
