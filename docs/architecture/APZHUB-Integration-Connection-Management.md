# APZHUB Integration Connection Management Architecture

**Milestone:** OSS-100-02  
**Status:** Canonical connection management foundation  
**Authority:** [Platform Integration SDK Architecture](./APZHUB-Platform-Integration-SDK-Architecture.md) · [Connection Lifecycle](./APZHUB-Integration-Connection-Lifecycle.md)

---

## Principle

All vendor adapters obtain logical connections through `ConnectionManager`. Connections are **tenant scoped** and validated before use. Opening a connection performs authentication validation only — no network transport in OSS-100-02.

---

## Components

```text
ConnectionManager
  ├── ConnectionRegistry (in-memory)
  ├── ConnectionLifecycleService
  ├── validateConnectionDefinition
  └── AuthenticationProvider (via open)
```

---

## Lifecycle model

| State | Meaning |
|-------|---------|
| `unconfigured` | Placeholder — not used after register |
| `configured` | Valid definition registered |
| `authenticating` | Credential validation in progress |
| `connected` | Credentials validated — logical connection open |
| `disconnected` | Closed — may reopen |
| `authentication_failed` | Credential validation failed |
| `misconfigured` | Validation failed at configure |
| `degraded` | Reserved for future health degradation |
| `disabled` | Administratively disabled |

Transitions are deterministic and enforced by `ConnectionLifecycleService`. Invalid transitions return structured SDK errors.

---

## Tenant scoping

Every connection record includes:

- `tenantId` — authoritative tenant scope
- `integrationId` — engine integration identifier
- `adapterId` — vendor adapter identifier

Listing, diagnostics, and registry snapshots filter by tenant. Cross-tenant access is rejected with `integration.connection.tenant_mismatch`.

---

## Validation

`validateConnectionDefinition` checks:

- Kebab-case IDs (`connectionId`, `integrationId`, `adapterId`)
- HTTP/HTTPS `baseUrl`
- Supported `authenticationMode`
- Required `credentialRef`
- Mode-specific fields (`headerName`, `queryParam`, `usernameRef`, `customScheme`)

Validation failures return `integration.connection.invalid_configuration` with field-level detail — never unstructured throws.

---

## Diagnostics

`buildConnectionDiagnostics` exposes:

- Connection counts by lifecycle state
- Connected / degraded / failed / disabled counts
- Last validation timestamp
- Warnings and recommendations

No secret values in diagnostic payloads.

---

## Package surface

Import: `@apzhub/integration-sdk/connection`

Key types: `ConnectionManager`, `ConnectionRegistry`, `ConnectionRecord`, `ConnectionDefinition`, `ConnectionLifecycleState`.

---

## Distinction from OSS-100-01 transport `Connection`

OSS-100-01 defines a transport handle (`Connection` in `/types`) for future HTTP client use. OSS-100-02 `ConnectionRecord` is the **managed logical connection** with lifecycle and tenant metadata. Both coexist — vendor adapters use `ConnectionRecord` for management and will map to transport handles in OSS-100-03+.

---

## Next phase

**OSS-100-03** — Health provider with live probe scaffold, version compatibility checks, platform lifecycle participation, enhanced diagnostics integration.

---

## Related

- [Integration Authentication Architecture](./APZHUB-Integration-Authentication-Architecture.md)
- [Package CONNECTION-MANAGEMENT.md](../../packages/integration-sdk/docs/CONNECTION-MANAGEMENT.md)
- [OSS-100-02 Completion Report](../sprint/OSS-100-02-completion-report.md)
