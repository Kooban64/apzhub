# APZCONFIG Programme Summary

**Wave closed:** APZCONFIG-006 (2026-07-16)  
**Classification:** PRODUCTION_READY_WITH_LIMITATIONS

## What was delivered

A complete Platform Configuration **metadata management plane**:

1. Domain contracts, Core, and Persistence (PostgreSQL + in-memory test factory)
2. Platform Services + Gateway facets + RequestPipeline + Production Authorization
3. Versioned HTTP API + OpenAPI 1.5.0 + production typed client
4. Manifest-driven Configuration Workbench
5. Vertical certification evidence pack
6. Wave freeze + Reference Standard

## Architecture (frozen)

```text
Workbench → Typed Client → HTTP → Gateway → RequestPipeline → Authz
→ Services → Core → Persistence → PostgreSQL
```

## What was deliberately not delivered

Runtime resolution/apply · feature flags · secrets · Vault · env/K8s injection · hot reload · rollout · Event Bus

## Separation

Configuration SoR (`@apzhub/configuration-*`) ≠ runtime `@apzhub/config` configuration-manager.

## Package versions at freeze

| Package                   | Version |
| ------------------------- | ------- |
| configuration-contracts   | 0.2.0   |
| configuration-core        | 0.2.0   |
| configuration-persistence | 0.1.0   |
| platform-services         | 0.21.0  |

## Future

See [Future Configuration Platform Guide](../developer/APZHUB-Future-Configuration-Platform-Guide.md). Next label: **APZCONFIG-007** (roadmap only).
