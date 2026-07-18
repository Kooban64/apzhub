# APZOBSERVE-005 — Architecture Traceability Matrix

| Layer               | Artefact                                                 | Responsibility                            |
| ------------------- | -------------------------------------------------------- | ----------------------------------------- |
| Presentation        | `apps/web/components/observe`                            | Workbench UI; typed-client only           |
| Typed client        | `apps/web/lib/observe`                                   | HTTP to `/api/v1/observe/*` only          |
| HTTP                | `apps/web/app/api/v1/observe/**` + `handlers/observe.ts` | Thin handlers → `gateway.observe.*`       |
| Gateway             | `PlatformServiceGateway.observe`                         | Facet surface                             |
| Pipeline            | RequestPipeline                                          | Auth → Authz → validation → execution     |
| Authz               | `observePlatformOps`                                     | Production permission map                 |
| Services            | `packages/platform-services/src/services/observe`        | Orchestration                             |
| Core                | `@apzhub/observe-core` **0.2.0**                         | Business rules / validation / lifecycle   |
| Persistence         | `@apzhub/observe-persistence` **0.1.0**                  | Repository ports; PostgreSQL SoR          |
| Contracts           | `@apzhub/observe-contracts` **0.2.0**                    | Domain + permissions                      |
| Migrations          | `0054`, `0055`                                           | `platform_observe_*` + RLS                |
| Workbench manifests | `platform-observability*`                                | Activity Bar + sidebar                    |
| OpenAPI             | Platform **1.8.0**                                       | Tag Platform Observability Administration |

No layer bypass permitted. Zero violations required from `pnpm audit:observe-vertical`.
