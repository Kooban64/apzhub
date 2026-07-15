# ADR-0062: Search Canonical Document / Index ID Mapping

| Field | Value |
| --- | --- |
| **Status** | Accepted |
| **Date** | 2026-07-14 |
| **Milestone** | APZSEARCH-006 |
| **Deciders** | Owner / Architecture |

---

## Context

Platform collections and documents have canonical APZHUB identifiers. Meilisearch (and future engines) require their own index UIDs and document primary keys. Public gateway responses must never leak engine-internal identifiers as the platform API surface.

## Decision

1. **Canonical collection id → provider index uid** via deterministic naming:
   - `{indexPrefix}_{optionalTenant}_{sanitizedCollectionId}` (lowercase, safe charset)
   - Implemented in `search-index-naming.ts` (platform-services only)
2. **Canonical document id → provider document primary key** via deterministic sanitisation (`toProviderDocumentId`)
3. Gateway / contracts expose **canonical** collection and document ids only
4. Provider index UIDs remain **connector-internal**; never part of OpenAPI / HTTP (deferred to APZSEARCH-007) contracts as public fields
5. Document upserts always inject `tenantId` (and `organisationId` when present) into indexed fields so filters can apply

## Consequences

### Positive
- Stable remapping across providers if indexes are rebuilt
- Clear boundary: Platform Services own naming; adapters receive ready UIDs
- Public API stays engine-agnostic

### Negative / accepted
- Renaming a public collection requires coordinated index migration (future ops runbook)
- Collision risk under extreme sanitisation — mitigated by prefix + length caps

## Related

- [ADR-0061 — Tenant Isolation](./ADR-0061-search-tenant-isolation-strategy.md)
- [ADR-0060 — Meilisearch Reference Adapter](./ADR-0060-meilisearch-reference-search-adapter.md)
