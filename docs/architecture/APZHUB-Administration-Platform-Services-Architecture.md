# APZHUB Administration Platform Services Architecture

**Milestone:** APZADMIN-002  
**Status:** Complete — Platform Services, Gateway & Authorization

## Request path

```text
Products → gateway.administration.* → RequestPipeline → Authz → Thin Services → Core → Persistence → PostgreSQL
```

## Layers

| Layer         | Package / location                                         | Responsibility                             |
| ------------- | ---------------------------------------------------------- | ------------------------------------------ |
| Gateway       | `PlatformServiceGateway.administration`                    | Nested facet access                        |
| Authz         | `administrationPlatformOps` + `PLATFORM_ADMIN_PERMISSIONS` | Deny-by-default production                 |
| Thin services | `@apzhub/platform-services` `services/administration`      | Error mapping only                         |
| Domain        | `@apzhub/admin-core` `createPlatformAdministrationService` | Lifecycle, validation, orchestration       |
| Persistence   | `@apzhub/admin-persistence`                                | In-memory (test) / PostgreSQL (production) |
| Contracts     | `@apzhub/admin-contracts` `AdministrationPlatformGateway`  | Facet types + inputs                       |

## Facets

`modules`, `categories`, `sections`, `actions`, `permissions`, `audit`, `history`, `diagnostics`, `registrations`, `metadata`, `policies`, `references`, `capabilities`, `navigations`, `shortcuts`, `dashboards`, `widgets`.

## Boundaries

- **Metadata SoR only** — no runtime admin action execution, no live diagnostic probes
- **No HTTP / OpenAPI / typed client** (APZADMIN-003)
- **No Workbench / UI / charts / widget rendering**
- **No user/role/tenant/organisation management**
- **No Event Bus / AI / notification delivery**
- Permissions use `admin.*` from admin-contracts — not legacy `administration.manage|read|administer`

## Enablement

Env gate: `APZHUB_ADMINISTRATION_ENABLED` ∈ `{1,true,on}` (deny-by-default). Production requires `DATABASE_URL`.
