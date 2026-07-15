# Documents Search Publication Lifecycle Guide

**Milestone:** APZSEARCH-012

## Explicit hooks (callable only)

document created / metadata updated / classified / tagged / folder assigned / collection assigned / version committed / archived / restored / deleted / retention changed / generated report linked / relationship changed — plus folder/collection/category/tag upsert/remove.

No HTTP, Event Bus, workers, storage callbacks, or Workbench wiring.

## Domain status → Search lifecycle (suggest)

| Document status | Suggested Search lifecycle |
| --------------- | -------------------------- |
| draft | draft |
| active / restored | validated |
| archived / retained | archived |
| deleted / expired | removed |

Actual transitions go through `SearchIntegrationPublisher`. Archived documents update metadata via upsert; forced `lifecycle(archived)` is available when the journal state permits.
