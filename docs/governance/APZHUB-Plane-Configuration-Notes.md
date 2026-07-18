# APZHUB Plane Configuration Notes

**Milestone:** OSS-101-02  
**Status:** Authoritative configuration reference  
**Registry:** `packages/config/src/governance/registry.ts`

---

## Overview

Plane configuration is **adapter-internal**. Values are read via `@apzhub/config` — never hardcoded in modules or `ProjectService`.

When `PLANE_INTEGRATION_ENABLED=false` (default), Plane variables are optional and ignored.

---

## Configuration catalogue

| Key                         | Type    | Default | Owner        | Scope     | Secret class | Required when enabled |
| --------------------------- | ------- | ------- | ------------ | --------- | ------------ | --------------------- |
| `PLANE_INTEGRATION_ENABLED` | boolean | `false` | integrations | all       | none         | —                     |
| `PLANE_BASE_URL`            | url     | —       | integrations | all       | none         | Yes                   |
| `PLANE_API_BASE_URL`        | url     | —       | integrations | all       | none         | Yes                   |
| `PLANE_API_TOKEN`           | string  | —       | integrations | all       | credential   | Yes                   |
| `PLANE_WORKSPACE_ID`        | string  | —       | integrations | dev, test | none         | Dev convenience       |
| `PLANE_WEBHOOK_SECRET`      | string  | —       | integrations | all       | secret       | OSS-101-08+           |

---

## Per-variable detail

### PLANE_INTEGRATION_ENABLED

- **Purpose:** Master switch for Plane engine behind Projects capability
- **Validation:** Parsed as boolean; default `false`
- **Behaviour:** When false, adapter is not loaded; diagnostics report `disabled`

### PLANE_BASE_URL

- **Purpose:** Plane CE origin (internal network)
- **Example:** `http://plane:8000` (compose) or `http://localhost:18085` (legacy host debug)
- **Validation:** Must be valid URL when integration enabled
- **Note:** Not user-facing — users never navigate to this URL

### PLANE_API_BASE_URL

- **Purpose:** REST API root for PlaneAdapter
- **Example:** `http://plane:8000/api` or `{PLANE_BASE_URL}/api`
- **Validation:** Must be valid URL when integration enabled

### PLANE_API_TOKEN

- **Purpose:** Service account token for adapter authentication
- **Secret:** `credential` — masked in diagnostics and logs
- **Validation:** Minimum 16 characters when present; required when enabled
- **Future:** Per-tenant tokens in Vault (PCv2-04)

### PLANE_WORKSPACE_ID

- **Purpose:** Default workspace for single-tenant local/staging dev
- **Scope:** development, test only in registry metadata
- **Production:** Per-tenant workspace IDs stored in platform provisioning metadata (OSS-101-04)

### PLANE_WEBHOOK_SECRET

- **Purpose:** Validate inbound Plane webhooks
- **Secret:** `secret`
- **Phase:** Optional until OSS-101-08 webhook integration

---

## Typed access

```typescript
import {
  planeEnvSchema,
  getPlaneConfigurationDiagnostics,
} from "@apzhub/config/governance";

const plane = planeEnvSchema.parse(process.env);
const diagnostics = getPlaneConfigurationDiagnostics();
```

---

## Validation

Conditional validation via `validatePlaneIntegrationConfig()` — fails when enabled but required fields missing.

Does **not** block platform startup when integration disabled.

---

## Related

- [Plane Environment Guide](./APZHUB-Plane-Environment-Guide.md)
- [Plane Diagnostics Design](../architecture/APZHUB-Plane-Diagnostics-Design.md)
- [Configuration Developer Guide](./APZHUB-Configuration-Developer-Guide.md)
