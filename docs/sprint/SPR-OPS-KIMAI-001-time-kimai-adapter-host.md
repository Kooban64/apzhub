# SPR-OPS-KIMAI-001 — Time Kimai adapter host enablement

> **Status:** **COMPLETE · DELIVERED** — 2026-08-15  
> **Depends on:** [SPR-OPS-ZAMMAD-001](./SPR-OPS-ZAMMAD-001-support-zammad-adapter-host.md) pattern · Time HTTP foundation  
> **AuthN:** BetterAuth only — Kimai token server-side only  
> **Does not:** Authentik retire · Cap reopen · commit secrets · change Kimai CE containers

## Outcome

Make Time list/health **ops-enableable** on the coexistence host: `.secrets/kimai` loader + runbook + `APZHUB_TIME_ENABLED` / `KIMAI_INTEGRATION_ENABLED`.

## Ships

| ID  | Ship                                  | Landed                                                                |
| --- | ------------------------------------- | --------------------------------------------------------------------- |
| K1  | `.secrets/kimai` fill-only loader     | `load-local-secrets.ts`                                               |
| K2  | Host env + `{host}/api` base URL docs | Matches Kimai relative paths                                          |
| K3  | Demo grants include Time              | `pkg.apzprd.time` + `time` product key                                |
| K4  | Host enablement runbook               | [time-kimai-adapter.md](../operations/runbooks/time-kimai-adapter.md) |

## Acceptance

1. Without `.secrets/kimai`, behaviour unchanged (disabled honesty).
2. With secrets file + flags true, token is applied when unset in process env.
3. Docs never include a live token.
4. Authentik untouched.
5. Host verified: Time health/timesheets succeed for an entitled BetterAuth user.

## Operator follow-up (this host)

Use the live Kimai Access Token (e.g. label `portal-hub`). Stale portal-v2 copies return 401 — rotate via Kimai UI if needed.
