# Repositories

| Port | Implementations |
| ---- | ----------------- |
| `TraceLinkRepository` | Postgres + in-memory |
| `TraceTaxonomyRepository` | Postgres + in-memory (seed from normative taxonomy) |

## Capabilities

save/create · get by id · optimistic save · list (filtered/paginated) · edge facts · exists · history · inbound/outbound by endpoint · taxonomy list/ensureSeeded

Factories: `createQepTraceabilityPersistenceForProduction` / `ForTest`.
