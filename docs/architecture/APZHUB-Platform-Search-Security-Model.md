# APZHUB Platform Search — Security Model

> **Milestone:** APZSEARCH-001  
> **Package:** `@apzhub/search-contracts`

---

## Mandatory controls

Every search result path must respect:

| Control           | Enforcement                                                                             |
| ----------------- | --------------------------------------------------------------------------------------- |
| Tenant            | Hit `tenantId` must match request context                                               |
| Organisation      | When both set, org ids must match                                                       |
| Permissions       | Actor requires `search.query` (or legacy `search.execute`/`search.read`, or `search.*`) |
| Classification    | Declared on `SearchMetadata`; product/service layers filter                             |
| Product ownership | `productId` / `sourceId` identify owning product                                        |

## Helpers

- `evaluateSearchHitVisibility` — tenant/org/permission gate for hits
- `assertSearchCapabilityAccess` — query / provider / diagnostics / configuration / audit
- `isSafeSearchDiagnosticsPayload` — rejects credential-like keys

## Configuration invariants

`SearchConfiguration` requires:

- `enforceTenantIsolation: true`
- `enforceOrganisationIsolation: true`
- `enforcePermissionFilter: true`

`validateSearchConfiguration` rejects any weakening.

## Provider rule

No search provider bypasses platform authorization. Diagnostics never include secrets, tokens, or connection strings.

## Out of scope (001)

Runtime authz middleware, HTTP gates, and engine ACLs — deferred to later milestones that execute queries.
