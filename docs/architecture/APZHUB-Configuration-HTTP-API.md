# APZHUB Configuration HTTP API

**Milestone:** APZCONFIG-003  
**Status:** Complete  
**Base path:** `/api/v1/configuration`

## Purpose

Expose the Platform Configuration **management plane** through a versioned HTTP API, OpenAPI 3.1 documentation, and a production typed client. All business rules remain in Configuration Core, Platform Services, and Persistence — the HTTP layer is presentation only.

## Execution path (mandatory)

```text
Consumer / future Workbench
  → apps/web/lib/configuration (typed client)
  → /api/v1/configuration/*
  → PlatformServiceGateway.configuration.*
  → RequestPipeline
  → Production Authorization
  → thin Configuration Platform Services
  → Configuration Core
  → Configuration Persistence
  → PostgreSQL
```

**Prohibited:** HTTP → Core/Persistence; typed client → gateway/platform-services.

## Management plane only

| Capability                                                                   | Available |
| ---------------------------------------------------------------------------- | --------- |
| Metadata CRUD (configurations, namespaces, groups, versions, overrides)      | Yes       |
| Lifecycle (draft → validated → approved → published → deprecated → archived) | Yes       |
| Scopes, validation metadata, references, audit                               | Yes       |
| Diagnostics (capabilities, health, readiness)                                | Yes       |
| Runtime resolution / effective values                                        | **No**    |
| Runtime application / apply                                                  | **No**    |
| Feature flags                                                                | **No**    |
| Secret management                                                            | **No**    |
| Hot reload / Event Bus                                                       | **No**    |

Configuration SoR (`@apzhub/configuration-*`) is distinct from runtime `@apzhub/config` — not integrated in this milestone.

## Bootstrap

Controlled by `APZHUB_CONFIGURATION_ENABLED`. When disabled, routes return `503 CONFIGURATION_SERVICE_UNAVAILABLE`.

## Response envelopes

Standard API v1: `{ data, meta }` for resources; `{ data, page, meta }` for collections; `{ error, meta }` for errors.

## Typed client

`apps/web/lib/configuration` — `createHttpConfigurationClient()`, mock client, query keys, module accessor (`getConfigurationClient` / `setConfigurationClient`).

## OpenAPI

Platform spec `docs/specs/APZHUB-Platform-OpenAPI-v1.yaml` **v1.5.0** — tag `Platform Configuration` and related tags.

## Audit

`pnpm audit:configuration-http-client` — zero violations required.

## Next milestone

**APZCONFIG-004 — Configuration Workbench** (not started; consumes typed client only).

## See also

- [Configuration Platform Services Architecture](./APZHUB-Configuration-Platform-Services-Architecture.md)
- [APZCONFIG-003 Completion Report](../sprint/APZCONFIG-003-completion-report.md)
