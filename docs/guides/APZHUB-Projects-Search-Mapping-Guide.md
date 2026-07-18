# Projects Search Mapping Guide

**Package:** `@apzhub/search-projects`  
**Milestone:** APZSEARCH-010

## Source models

Imported from `@apzhub/platform-service-contracts`:

| Entity type | Canonical type  |
| ----------- | --------------- |
| workspace   | `Workspace`     |
| project     | `Project`       |
| task        | `Task`          |
| sprint      | `Sprint`        |
| milestone   | `Milestone`     |
| module      | `ProjectModule` |
| team        | `Team`          |

## Mapped fields

Every published draft includes:

- `entityId` — platform global id (never `*_plane_*`)
- `entityType`
- `title` / `summary`
- `organisationId` from publication context
- `classification` (default `internal`; archived → `restricted`)
- `permissions` from context
- string `metadata` (status, parent project/workspace ids, dates)
- timestamps, keywords, `navigationTarget`, `sourceId` (`projects:{type}`)

`productId` is always applied by the Search Integration Framework as **`projects`**.

## Forbidden

- Plane provisional ids
- Engine-native composite refs (`project::sprint`)
- Meilisearch / OpenSearch field names in metadata
- Raw HTML retained in summaries (stripped)
