# SPR-OPS-METABASE-001 — Analytics Metabase adapter host enablement

> **Status:** **COMPLETE · DELIVERED** — 2026-08-15  
> **Depends on:** [SPR-OPS-KIMAI-001](./SPR-OPS-KIMAI-001-time-kimai-adapter-host.md) pattern · Analytics HTTP foundation  
> **AuthN:** BetterAuth only — Metabase API key server-side only  
> **Does not:** Authentik retire · Cap reopen · commit secrets · change Metabase CE containers

## Outcome

Make Analytics health/readiness/dashboards **ops-enableable** on the coexistence host: `.secrets/metabase` loader + runbook + `APZHUB_ANALYTICS_ENABLED` / `METABASE_INTEGRATION_ENABLED`.

## Ships

| ID  | Ship                                  | Landed                                                                                |
| --- | ------------------------------------- | ------------------------------------------------------------------------------------- |
| M1  | `.secrets/metabase` fill-only loader  | `load-local-secrets.ts`                                                               |
| M2  | Host env + `{host}/api` base URL docs | Matches Metabase relative paths                                                       |
| M3  | Demo grants include Analytics         | `pkg.apzprd.delivery` + `analytics` product key                                       |
| M4  | Bootstrap secrets load + connect      | Kimai-style `ensureLocalSecretsLoaded` + `autoInitialise` + `adapter.connect`         |
| M5  | Host enablement runbook               | [analytics-metabase-adapter.md](../operations/runbooks/analytics-metabase-adapter.md) |

## Acceptance

1. Without `.secrets/metabase`, behaviour unchanged (disabled honesty).
2. With secrets file + flags true, key is applied when unset in process env.
3. Docs never include a live API key.
4. Authentik untouched.
5. Host verified: Analytics health/readiness/dashboards succeed for an entitled BetterAuth user.

## Operator follow-up (this host)

Use the live Metabase API key (e.g. label `apzportal-admin`). Do not scrape the bcrypt hash from Metabase Postgres — paste the plaintext `mb_…` key into `.secrets/metabase`.
