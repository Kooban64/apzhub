# Runtime Configuration Manager — Architecture

> **Status:** Active (SPR-002 Phase 7)  
> **Package:** `@apzhub/platform-runtime/configuration-manager`  
> **Authority:** [ADR-0018](../adr/ADR-0018-platform-runtime-package.md) · [platform-runtime.md](./platform-runtime.md)

---

## 1. Purpose

The **Runtime Configuration Manager** is the single authoritative source of configuration for the APZHUB Runtime.

**Architecture rule:** No Runtime subsystem may read `process.env` directly or load configuration files directly. All configuration access goes through the Configuration Manager.

---

## 2. Structure

```text
configuration-manager/
├── api/                 Configuration singleton API
├── interfaces/          Schema types and extension points
├── defaults/            Runtime defaults
├── implementation/      env-source (only process.env access), loader, overrides
├── validation/          Structured validation and errors
├── diagnostics/         Snapshots, metadata, diagnostics builders
└── index.ts             Public exports
```

The deprecated `configuration-engine/` module re-exports the Configuration Manager for backward compatibility.

---

## 3. Configuration precedence

```text
1. Runtime defaults
2. Environment variables (APZHUB_*)
3. Runtime overrides (bootstrap options / programmatic)
```

Not implemented: Vault, cloud secret managers, remote config, database config, tenant config (extension points documented only).

### Supported environment variables

| Variable                   | Maps to                             |
| -------------------------- | ----------------------------------- |
| `APZHUB_WORKSPACE_ROOT`    | `workspaceRoot`                     |
| `APZHUB_PLATFORM_VERSION`  | `platformVersion`                   |
| `APZHUB_RUNTIME_FAIL_FAST` | `failFast`                          |
| `APZHUB_RUNTIME_MODE`      | `runtimeMode`                       |
| `APZHUB_DISCOVERY_ROOTS`   | `discovery.roots` (comma-separated) |

---

## 4. Public API

```typescript
import { Configuration } from "@apzhub/platform-runtime/configuration-manager";

Configuration.load({ overrides: { workspaceRoot: "/path" } });
Configuration.validate();
Configuration.get("platformVersion");
Configuration.has("failFast");
Configuration.snapshot();
Configuration.metadata();
Configuration.reload(); // placeholder
Configuration.getDiagnostics();
```

---

## 5. Validation

Structured `ConfigurationError` codes:

| Code                      | Meaning                      |
| ------------------------- | ---------------------------- |
| `CONFIG_MISSING_REQUIRED` | Required value absent        |
| `CONFIG_INVALID_TYPE`     | Wrong data type              |
| `CONFIG_INVALID_RANGE`    | Value out of supported range |
| `CONFIG_INVALID_ENUM`     | Invalid enumeration          |
| `CONFIG_INVALID_VERSION`  | Invalid semver               |
| `CONFIG_UNKNOWN_KEY`      | Unknown override key         |
| `CONFIG_NOT_LOADED`       | API used before load         |

---

## 6. Runtime Orchestrator integration

The Runtime Orchestrator configuration step calls:

```typescript
Configuration.load({ overrides: bootstrapOptions });
Configuration.validate();
```

Subsystem failures surface as `ORCHESTRATOR_CONFIGURATION_FAILED` with `subsystem: "configuration-manager"`.

---

## 7. Extension points (documented only)

- `secretProvider`
- `remoteConfiguration`
- `featureFlags`
- `tenantConfiguration`
- `dynamicReload`

---

## 8. Technical debt

| Item                                            | Notes                                               |
| ----------------------------------------------- | --------------------------------------------------- |
| `configuration-engine/`                         | Deprecated wrapper — use Configuration Manager      |
| External config files                           | Not loaded in Phase 7                               |
| `Configuration.reload()`                        | Placeholder                                         |
| `RuntimeConfigurationManager` default workspace | Uses `process.cwd()` when unset (not `process.env`) |

---

_Delivered in SPR-002 Phase 7._
