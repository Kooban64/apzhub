# Search Publication Admin Diagnostics Guide

> **Milestone:** APZSEARCH-017

## Surface

`GET /api/v1/search/publication/diagnostics`

Reports:

- orchestrator readiness / bootstrap (`APZHUB_SEARCH_ORCHESTRATION_ENABLED`)
- journal readiness
- retry engine status
- composition registration flag
- publication health (`healthy` | `degraded` | `unavailable`)

Does **not** expose Meilisearch or provider internals.
