# Open Source Components — Platform 1.2.0

> **Programme:** APZHUB-RELEASE-001  
> **Date:** 2026-07-22  
> **Policy:** Self-hosted OSS / Community Edition first — no mandatory Enterprise Edition dependencies

## Runtime & toolchain

| Component                               | Freeze note                                                |
| --------------------------------------- | ---------------------------------------------------------- |
| Node.js                                 | Engines `>=20` · inventory host Node **v22.22.1**          |
| pnpm                                    | **10.22.0**                                                |
| TypeScript                              | Strict monorepo (repository baseline)                      |
| Next.js / React                         | App Router stack in `@apzhub/web` / `@apzhub/law-platform` |
| PostgreSQL                              | Platform metadata SoR                                      |
| Redis                                   | Platform cache / sessions support                          |
| Better Auth                             | Authentication only (APZHUB owns permissions)              |
| Playwright / Vitest / ESLint / Prettier | Quality toolchain                                          |
| Caddy                                   | Edge TLS (coexistence with legacy stack)                   |

## Backend engines (via integrations)

| Engine         | Integration package                            | Certification posture                    |
| -------------- | ---------------------------------------------- | ---------------------------------------- |
| Plane          | `@apzhub/integration-plane` **0.6.0**          | Projects product path                    |
| Kimai          | `@apzhub/integration-kimai` **0.2.0**          | **CERTIFIED_DOMAIN**                     |
| Zammad         | `@apzhub/integration-zammad` **0.8.0**         | **CERTIFIED_WITH_LIMITATIONS**           |
| Metabase       | `@apzhub/integration-metabase` **0.1.0**       | **CERTIFIED_FOUNDATION**                 |
| n8n            | `@apzhub/integration-n8n` **0.1.0**            | **CERTIFIED_FOUNDATION** (Execute gated) |
| Meilisearch    | `@apzhub/integration-meilisearch` **0.1.0**    | Search reference adapter                 |
| GitLab CI      | `@apzhub/integration-gitlab-ci` **0.1.0**      | Metadata Reference Adapter               |
| GitHub Actions | `@apzhub/integration-github-actions` **0.1.0** | Reference adapter family                 |

## Observability OSS (platform-owned connectors)

Prometheus / Grafana / Loki / OpenTelemetry family remain behind platform Observe/Metrics surfaces — self-hosted first (see Observe/Metrics frozen programmes).

## Constraint

Do not introduce mandatory commercial CI/CD or EE-only APIs into the frozen baseline without Owner Approval + ADR.
