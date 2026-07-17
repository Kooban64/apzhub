# APZHUB Administration Capability Guide

**Milestone:** APZADMIN-001

## Capability metadata

Capabilities record readiness flags for administration features:

| Flag | Meaning |
| --- | --- |
| enabled | Feature flagged on |
| available | Available in this deployment |
| healthy | Last recorded health status (metadata) |
| certified | Passed certification metadata |
| productionReady | Declared production-ready |

`productionReady` requires `enabled && available && healthy && certified` (validated in `@apzhub/admin-core`).

## Helpers

- `isCapabilityProductionReady(capability)`
- `summarizeCapabilityStatus(capability)` — metadata summary only; no live probes
