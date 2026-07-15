# ADR-0061: Search Tenant Isolation Strategy

| Field | Value |
| --- | --- |
| **Status** | Accepted |
| **Date** | 2026-07-14 |
| **Milestone** | APZSEARCH-006 |
| **Deciders** | Owner / Architecture |

---

## Context

APZSEARCH-006 wires Meilisearch into the Platform Services **execution** plane. Multi-tenant isolation must be enforced for every query and document write. Two viable strategies were evaluated.

## Options considered

| Strategy | Pros | Cons |
| --- | --- | --- |
| **Tenant-scoped indexes** | Strong isolation; simpler per-tenant delete | Index proliferation; harder cross-tenant platform ops; more Meilisearch ops cost |
| **Shared indexes + mandatory tenant filters** | Fewer indexes; natural cross-collection ops; maps cleanly to Meilisearch filters | Filter omission is catastrophic unless fail-closed; clients must never override |

## Decision

1. Adopt **shared indexes with mandatory tenant filters** as the primary isolation strategy (`shared_index_mandatory_tenant_filters`).
2. **Fail closed** when `tenantId` is missing, cannot be applied, or a client attempts to supply/override `tenantId` / `organisationId` filters.
3. When `organisationId` is present on the request context, apply a mandatory organisation equality filter as well.
4. Index naming may optionally include a tenant segment for defense-in-depth — this is **not** a substitute for mandatory filters.
5. Classification / permission post-filters remain additional layers; they cannot replace tenant filters.

## Consequences

### Positive
- Deterministic security posture independent of which provider is selected
- Compatible with Meilisearch filter grammar already implemented in the adapter
- Client cannot strip security filters through the gateway

### Negative / accepted
- Bugs in filter application are severity-critical — covered by unit tests and execution audit
- Tenant-scoped indexes remain a future option if ops scale requires them (would require a new ADR)

## Compliance

- Aligns with foundation Zero Trust (013) and platform data SoR rules (011)
- Does not expose Meilisearch DTOs or internal index uids on the gateway

## Related

- [ADR-0062 — Canonical Document/Index ID Mapping](./ADR-0062-search-canonical-id-mapping.md)
- [ADR-0063 — Search Execution Provider Resolution](./ADR-0063-search-execution-provider-resolution.md)
- [APZSEARCH-006 Completion Report](../sprint/APZSEARCH-006-completion-report.md)
