# APZHUB Administration HTTP API

**Milestone:** APZADMIN-003  
**Status:** Complete  
**Base path:** `/api/v1/administration`

## Purpose

Expose the Platform Administration **management plane** through a versioned HTTP API, OpenAPI 3.1 documentation, and a production typed client. All business rules remain in Administration Core, Platform Services, and Persistence — the HTTP layer is presentation only.

## Execution path (mandatory)

```text
Consumer / future Workbench
  → apps/web/lib/administration (typed client)
  → /api/v1/administration/*
  → PlatformServiceGateway.administration.*
  → RequestPipeline
  → Production Authorization
  → thin Administration Platform Services
  → Administration Core
  → Administration Persistence
  → PostgreSQL
```

**Prohibited:** HTTP → Core/Persistence; typed client → gateway/platform-services.

## Management plane only

| Capability | Available |
| --- | --- |
| Module metadata + lifecycle | Yes |
| Categories, sections, actions, permissions | Yes |
| Registrations, policies, capability SoR | Yes |
| Navigations, shortcuts, dashboards, widgets (metadata) | Yes |
| Metadata, references, audit, history | Yes |
| Diagnostics (health, readiness, management-capabilities) | Yes |
| Workbench UI | **No** |
| Runtime admin / live probes | **No** |
| User / role / tenant / org management | **No** |
| Provisioning / Event Bus / AI | **No** |

## Bootstrap

Controlled by `APZHUB_ADMINISTRATION_ENABLED`. When disabled, routes return `503 ADMINISTRATION_SERVICE_UNAVAILABLE`.

## Response envelopes

Standard API v1: `{ data, meta }` for resources; `{ data, page, meta }` for collections; `{ error, meta }` for errors.

## Typed client

`apps/web/lib/administration` — `createHttpAdministrationClient()`, mock client, query keys, module accessor (`getAdministrationClient` / `setAdministrationClient`).

## OpenAPI

Platform spec `docs/specs/APZHUB-Platform-OpenAPI-v1.yaml` **v1.6.0** — tag `Platform Administration` and related tags.

## Audit

`pnpm audit:administration-http-client` — zero violations required.

## Next milestone

**APZADMIN-005 — Administration Vertical Certification** (not started). Workbench delivered in APZADMIN-004.

## See also

- [Administration Platform Services Architecture](./APZHUB-Administration-Platform-Services-Architecture.md)
- [APZADMIN-003 Completion Report](../sprint/APZADMIN-003-completion-report.md)
