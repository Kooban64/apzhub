# Quality Certification — Platform-1.4-CERT-001

> **Date:** 2026-07-23 · Read-only verification · no code changes  
> **Host shell:** `NODE_ENV=development` (observed)

## Final gate results

| Gate                                        | Result   | Notes                                                   |
| ------------------------------------------- | -------- | ------------------------------------------------------- |
| `pnpm typecheck`                            | **PASS** | Exit 0                                                  |
| `pnpm lint`                                 | **PASS** | Exit 0                                                  |
| `pnpm format:check`                         | **PASS** | Exit 0                                                  |
| `pnpm build` (`NODE_ENV=development`)       | **FAIL** | **Operational Qualification** — see OQ-BLD-001          |
| `env -u NODE_ENV pnpm build`                | **PASS** | 334/334 static pages; packaging path                    |
| Vitest (durable delivery + RLS integration) | **PASS** | 6 files / 60 tests                                      |
| Repository certification (sample verticals) | **PASS** | APZNOTIFY-002/003/005 · APZIDENTITY-002 · APZSEARCH-003 |

## Migrations (live)

| Check                                        | Result                                   |
| -------------------------------------------- | ---------------------------------------- |
| `drizzle.__drizzle_migrations` count         | **68**                                   |
| Migration files 0065 / 0066 / 0067 in repo   | **Present** (`packages/config/drizzle/`) |
| `platform_notification_delivery_record`      | **Present**                              |
| `platform_notification_delivery_try`         | **Present**                              |
| `platform_notification_delivery_admin_audit` | **Present**                              |

## Durable runtime posture

| Item                                   | Status                         |
| -------------------------------------- | ------------------------------ |
| Durable runtime implemented (ENG-001B) | **Yes**                        |
| `APZHUB_NOTIFICATION_DURABLE_RUNTIME`  | **Defaults OFF** (unit-proven) |
| Process-local runtime                  | **Retained**                   |

## Evidence logs

- `/tmp/cert-001-gates.log`
- `/tmp/cert-001-vitest.log`

## Classification of failures

| Observation                                    | Class                         |
| ---------------------------------------------- | ----------------------------- |
| `pnpm build` FAIL under `NODE_ENV=development` | **Operational Qualification** |
| Clean packaging build PASS                     | Certified packaging path      |
