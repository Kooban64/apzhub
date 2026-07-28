# Docker Guide — Platform 1.2.0

> **Programme:** APZHUB-OPS-002 · **Action:** A1

## Artefacts

| Artefact        | Path                                                       |
| --------------- | ---------------------------------------------------------- |
| Web Dockerfile  | `apps/web/Dockerfile`                                      |
| Prod compose    | `infrastructure/docker/docker-compose.prod.yml`            |
| Dev compose     | `infrastructure/docker/docker-compose.dev.yml` (unchanged) |
| Redis prod conf | `infrastructure/redis/redis.prod.conf`                     |
| Dockerignore    | `.dockerignore`                                            |

## Build

```bash
export BUILD_NUMBER=manual-001
pnpm docker:build:prod
docker images 'apzhub/web'
```

Build context is the monorepo root. Next.js `output: "standalone"` produces `apps/web/server.js` entry.

## Compose services

| Service           | Role                               |
| ----------------- | ---------------------------------- |
| `postgres`        | Platform SoR                       |
| `redis`           | Sessions / cache (AOF, 384mb)      |
| `web`             | `@apzhub/web` image                |
| `caddy`           | Edge proxy + TLS                   |
| `postgres-backup` | Optional profile `backup` one-shot |

## Port policy (mandatory)

| Host port   | Service                                                       |
| ----------- | ------------------------------------------------------------- |
| 3300        | Reserved for direct web (compose exposes web internally only) |
| 54334       | Postgres                                                      |
| 6380        | Redis                                                         |
| 3080 / 3443 | Caddy HTTP/HTTPS                                              |

Forbidden: 54333, 8080, 18081–18088 (legacy).

## Resource guidance

| Container | Memory limit |
| --------- | ------------ |
| web       | 2G           |
| postgres  | 1G           |
| redis     | 512M         |

## Verified build (OPS-002)

| Item                                  | Result                                                             |
| ------------------------------------- | ------------------------------------------------------------------ |
| `docker build -f apps/web/Dockerfile` | **PASS** (`apzhub/web:1.2.0` · `apzhub/web:1.2.0-ops002-validate`) |
| Image size (human)                    | ~584MB / content ~115MB                                            |
| Compose config                        | **PASS** (with hardened env file)                                  |
