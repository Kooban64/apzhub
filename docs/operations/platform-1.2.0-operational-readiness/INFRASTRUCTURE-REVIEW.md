# Infrastructure Review — Platform 1.2.0

> **Programme:** APZHUB-OPS-001  
> **Status:** **PARTIAL**

## Components reviewed

| Component        | Dev                                                                                | Prod (in-repo)                                                           |
| ---------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Docker Compose   | `docker-compose.dev.yml` — postgres **54334**, redis **6380**, caddy **3080/3443** | `docker-compose.prod.yml` scaffold — ports **80/443**                    |
| Containers       | Dev stack healthy pattern with healthchecks                                        | No app container defined                                                 |
| Networks         | Dev compose networks                                                               | Prod: default only; isolation not declared                               |
| Volumes          | Named volumes (dev + prod scaffold)                                                | `apzhub_postgres_prod` · `apzhub_redis_prod` · `apzhub_caddy_prod`       |
| PostgreSQL       | Platform DB (dev port 54334)                                                       | Scaffold service only                                                    |
| Redis            | AOF via `infrastructure/redis/redis.conf` (dev)                                    | Alpine default volume — AOF not mounted in prod scaffold                 |
| Reverse proxy    | Caddy (dev `tls internal`)                                                         | Caddy prod file incomplete TLS                                           |
| Certificates     | Dev internal TLS                                                                   | Prod: expect host/edge TLS — **not configured in APZHUB Caddyfile.prod** |
| Object storage   | Not in APZHUB compose                                                              | S3-compatible not provisioned in-repo                                    |
| Host coexistence | ENVIRONMENT.md · HOST-COEXISTENCE-CONTROLS · R12-OPS-03 audit PASS                 | Shared EC2 with dense legacy `apz-stack`                                 |

## Applications / packages in scope

- Apps: `@apzhub/web`, `@apzhub/law-platform`
- Runtime/Workbench/Identity/Admin/Services/Integration SDK: frozen at Platform 1.2.0 package inventory
- Integrations: Plane, Kimai, Zammad, Metabase, n8n, Meilisearch, GitLab CI, GitHub Actions

## Before production

- Owner-approved prod topology (app + DB + Redis + edge TLS).
- Live host coexistence audit (`pnpm ops:host-coexistence-audit -- --live`) and disk headroom check.
- Confirm reserved ports and no forbidden binds vs legacy stack.
