# APZHUB Platform Provisioning Architecture (M8-05)

## Overview

Provisioning records lifecycle of tenant, product, module, service, and user availability. All provisioning flows through `ProvisioningService`.

## Status lifecycle

`pending` → `in_progress` → `completed` | `failed`

## Operations

| Operation              | Service method                                |
| ---------------------- | --------------------------------------------- |
| Tenant provisioning    | `provisionTenant({ tenantId, productKeys })`  |
| Product provisioning   | `productProvisioning.provisionProduct(input)` |
| Module provisioning    | `moduleProvisioning.provisionModule(input)`   |
| Generic start/complete | `startProvisioning` / `completeProvisioning`  |

## Storage

`platform_provisioning_record` — scope, target, status, message, timestamps.

## API

- `GET /api/platform/v1/provisioning` — history + status + diagnostics
- `POST /api/platform/v1/provisioning` — trigger tenant/product/module provisioning

## Integration

Identity tenant membership on first login remains in `@apzhub/auth` + `platform-identity`. M8-05 governance provisioning **records and orchestrates** product/module enablement — it does not replace identity provisioning.

## Diagnostics

Provisioning diagnostics are exposed via governance diagnostics and the Operations Console Provisioning section (history table + JSON panel).
