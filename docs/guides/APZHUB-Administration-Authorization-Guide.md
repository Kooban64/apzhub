# APZHUB Administration Authorization Guide

**Milestone:** APZADMIN-002

## Permission catalogue

Platform Administration uses **`admin.*`** keys from `@apzhub/admin-contracts` (`PLATFORM_ADMIN_PERMISSIONS`), spread into `PLATFORM_SERVICE_PERMISSION_CATALOGUE`.

| Permission | Typical ops |
| --- | --- |
| `admin.*` | Wildcard |
| `admin.read` | list/get modules, categories, sections, actions, permissions, history, metadata, references, capabilities, dashboards, widgets |
| `admin.manage` | create/update/archive/restore/transition on manage facets |
| `admin.audit` | audit list/get |
| `admin.policy` | policies list/get/create/update |
| `admin.diagnostics` | diagnostics health/readiness/capabilities/list/get |
| `admin.navigation` | navigations + shortcuts |
| `admin.registration` | registrations |

Do **not** confuse with legacy catalogue keys `administration.manage|read|administer`.

## Operation map

`administrationPlatformOps` in `operation-authorization-map.ts` maps each `wrapServiceWithPipeline` service key (e.g. `administrationModules`) to a required permission. Production mode is deny-by-default.
