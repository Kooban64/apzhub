# Projects Search Publication Lifecycle

**Milestone:** APZSEARCH-010

## Explicit hooks (no background processing)

| Hook | Behaviour |
| ---- | --------- |
| `on*Upserted` | `publish` if absent/removed; else `update` |
| `on*Removed` | `remove` via Search Integration Framework |

Call from Platform Service mutation paths after persistence succeeds. Do not register listeners.

## Search entity lifecycle

Uses `@apzhub/search-integration` lifecycle states (`draft` → `validated` → `published` → `updated` / `removed` / `archived`).

`ProjectsSearchLifecycle.suggestFromDomainStatus` only **suggests** a state from domain status; it does not schedule transitions.

## Exclusions

No scheduling · workers · sync · retry engines · Event Bus · webhooks · polling.
