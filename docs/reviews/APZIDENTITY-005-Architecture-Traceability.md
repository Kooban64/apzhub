# APZIDENTITY-005 — Architecture Traceability Matrix

**Date:** 2026-07-17

| Layer | Artefact | Responsibility | Downstream |
| --- | --- | --- | --- |
| Workbench | `apps/web/components/identity/*` | Presentation only | Typed client facades |
| Typed client | `apps/web/lib/identity/*` | HTTP to `/api/v1/identity/*` | App Router |
| HTTP | `apps/web/app/api/v1/identity/**` + handlers | Envelope + gateway call | `gateway.identity.*` |
| Gateway | `PlatformServiceGateway.identity` | Facet surface | RequestPipeline |
| Authz | `identityPlatformOps` + `PLATFORM_IDENTITY_PERMISSIONS` | Deny-by-default | Platform Services |
| Platform Services | `packages/platform-services/.../identity` | Orchestration | Identity Core |
| Core | `@apzhub/identity-core` 0.2.0 | Business rules | Repository ports |
| Persistence | `@apzhub/identity-persistence` 0.1.0 | Repository impl | PostgreSQL |
| Schema | migrations `0052` / `0053` | `platform_iam_*` | PostgreSQL |

## Boundary guarantees

- Workbench/client never import core, persistence, platform-services, or gateway
- Handlers never import core/persistence/DB clients
- Production bootstrap requires PostgreSQL — no silent in-memory fallback
- `APZHUB_IDENTITY_ENABLED` deny-by-default
- Administration Workbench remains frozen and separate
