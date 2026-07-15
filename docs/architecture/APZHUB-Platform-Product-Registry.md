# APZHUB Platform Product Registry

**Milestone:** APZTCMS-014  

## Canonical products

| Key | Display name (default) |
| --- | ---------------------- |
| projects | Projects |
| support | Support |
| testing | Testing |
| identity | Identity |
| documents | Documents |
| analytics | Analytics |
| workflow | Workflow |
| administration | Administration |

## Fields per product

identifier, display name, owner, version, enabled, quality status, certification status, release readiness, dependency IDs, health summary.

Governance only — **no** infrastructure/runtime monitoring (`isInfrastructureHealth: false` on health summaries).

## API

`ProductRegistryService.ensureDefaultRegistry` seeds all eight products once per tenant.
