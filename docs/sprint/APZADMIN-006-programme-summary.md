# APZADMIN Programme Summary

**Wave closed:** APZADMIN-006 (2026-07-16)  
**Classification:** PRODUCTION_READY_WITH_LIMITATIONS

## What was delivered

A complete Platform Administration **metadata governance plane**:

1. Domain contracts, Core, and Persistence (PostgreSQL + in-memory test factory)
2. Platform Services + Gateway facets + RequestPipeline + Production Authorization
3. Versioned HTTP API + OpenAPI 1.6.0 + production typed client
4. Manifest-driven Administration Workbench (`/workspace/administration`)
5. Vertical certification evidence pack
6. Wave freeze + Reference Standard

## Architecture (frozen)

```text
Workbench → Typed Client → HTTP → Gateway → RequestPipeline → Authz
→ Services → Core → Persistence → PostgreSQL
```

## What was deliberately not delivered

Runtime administration · user/role/tenant/organisation management · provisioning · live probes · Event Bus · AI administration

## Separation

Administration SoR (`@apzhub/admin-*`) ≠ Platform Operations (`/workspace/operations`) ≠ registered product SoRs.

## Package versions at freeze

| Package | Version |
| --- | --- |
| admin-contracts | 0.2.0 |
| admin-core | 0.2.0 |
| admin-persistence | 0.1.0 |
| platform-services | 0.22.0 |

## Future

See [Future Administration Platform Guide](../developer/APZHUB-Future-Administration-Platform-Guide.md). Next label: **APZIDENTITY-001** (roadmap only).
