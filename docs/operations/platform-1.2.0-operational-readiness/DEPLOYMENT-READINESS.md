# Deployment Readiness — Platform 1.2.0

> **Programme:** APZHUB-OPS-001  
> **Status:** **PARTIAL**

## Verified

| Item                  | Evidence                                                         | Finding                                                                             |
| --------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Dev Docker scripts    | `package.json` `docker:up                                        | down                                                                                | logs` | Present for **dev** compose |
| Env catalogue         | `.env.example`                                                   | Comprehensive; **dev-oriented defaults**                                            |
| Config management     | `docs/operations/CONFIGURATION-MANAGEMENT.md` · `@apzhub/config` | Documented                                                                          |
| Prod compose scaffold | `infrastructure/docker/docker-compose.prod.yml`                  | Postgres/Redis/Caddy only — **structure only, no deploy automation**                |
| Prod Caddy            | `infrastructure/caddy/Caddyfile.prod`                            | Proxies `web:3300` on `:80` — **no TLS hostnames**; **no `web` service in compose** |
| Release process       | `DEPLOYMENT-STRATEGY.md` · `RELEASE-MANAGEMENT.md`               | Governance checklist; **no CD**                                                     |
| Rollback process      | Deployment/Release docs                                          | Documented as Change requirement; **not automated**                                 |
| CI                    | `.github/workflows/ci.yml`                                       | Lint/typecheck/test/build/e2e — **no deploy job**                                   |
| Dockerfile            | Repository search                                                | **None found**                                                                      |
| Smoke                 | `pnpm test:production-smoke` (package.json)                      | Script present for post-deploy verify                                               |

## Gaps blocking clean cutover

1. No application container image / Dockerfile.
2. Prod compose does not define `web` despite Caddy upstream.
3. No in-repo automated deploy or rollback pipeline.
4. Production secrets / AuthZ mode must be set outside `.env.example` defaults.

## Before production

- Provide deployable artefact (Dockerfile/image or Owner-approved equivalent) and wire into prod topology.
- Production environment file: strong secrets, `AUTHORIZATION_PROVIDER_MODE=production`, disable dev registration, postgres mapping for Law entities.
- File Change record with rollback to immutable artefact.
- Run production smoke against target after deploy.
