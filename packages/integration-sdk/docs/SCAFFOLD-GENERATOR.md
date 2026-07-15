# Scaffold Generator (OSS-100-09)

**Package:** `@apzhub/integration-sdk` v0.9.0  
**Export:** `@apzhub/integration-sdk/harness`  
**Primary API:** `scaffoldAdapter` · `AdapterScaffold` · `createAdapterScaffold` · `REFERENCE_ADAPTER_TEMPLATE`

---

## Overview

The scaffold generator builds an **in-memory** adapter package file tree aligned with [REFERENCE-ADAPTER-STANDARD.md](../../../docs/architecture/REFERENCE-ADAPTER-STANDARD.md). It does **not** write to disk, generate Platform Services, or invent business functionality.

```text
ScaffoldAdapterInput { vendorId, displayName, … }
        ↓
scaffoldAdapter()
        ↓
AdapterScaffoldResult { files, checklist, packageName, … }
```

Authors (or tooling) may persist `files` later. Compliance assessment can consume the same map immediately.

---

## Template

`REFERENCE_ADAPTER_TEMPLATE` describes required/optional paths and forbidden paths:

- Manifest: `integration.yaml`
- Package: `package.json`, `tsconfig.json`, `README.md`
- Docs: `docs/{VENDOR}-ADAPTER.md`, optional operations / checklist
- Source layout: adapter, config, capabilities, mappers, models, internal, operations, events, transport, health, diagnostics, testing, …

`listRequiredTemplatePaths(vendorId)` expands `{VENDOR}` placeholders for compliance checks.

---

## Input

| Field                   | Notes                                         |
| ----------------------- | --------------------------------------------- |
| `vendorId`              | Normalised to lowercase kebab-case            |
| `displayName`           | Human name (falls back to PascalCase vendor)  |
| `packageVersion`        | Default `0.1.0`                               |
| `capabilityId`          | Default `integration.{vendorId}`              |
| `declaredCapabilities`  | Default authentication / health / diagnostics |
| `description` / `owner` | Package metadata                              |

Generated package name: `@apzhub/integration-{vendorId}`.

---

## Output

| Field                                      | Purpose                                                   |
| ------------------------------------------ | --------------------------------------------------------- |
| `files`                                    | Path → content map (TypeScript stubs, yaml, README, docs) |
| `checklist`                                | Post-scaffold human checklist strings                     |
| `generatedAt`                              | ISO timestamp                                             |
| `vendorId` / `packageName` / `displayName` | Identity                                                  |

Stubs extend `IntegrationAdapterBase`, declare capabilities, and include placeholder health/diagnostics — **no** vendor REST business logic.

---

## Quick start

```typescript
import {
  scaffoldAdapter,
  assessAdapterCompliance,
} from "@apzhub/integration-sdk/harness";

const result = scaffoldAdapter({
  vendorId: "example",
  displayName: "Example Engine",
});

// Optionally write Object.entries(result.files) to disk under integrations/example/

const compliance = assessAdapterCompliance({
  structure: {
    vendorId: result.vendorId,
    packageName: result.packageName,
    files: result.files,
    dependencies: { "@apzhub/integration-sdk": "workspace:*" },
    declaredCapabilities: ["authentication", "health", "diagnostics"],
  },
});
```

`AdapterScaffold` class / `createAdapterScaffold()` wrap the same `scaffoldAdapter` function for DI-friendly construction.

---

## Exclusions

- No disk I/O
- No Platform Service / gateway / UI generation
- No Event Bus wiring
- No provisioning of vendor engines
- Not a substitute for Reference Adapter Wave certification

---

## Related

- [COMPLIANCE-FRAMEWORK.md](./COMPLIANCE-FRAMEWORK.md)
- [REFERENCE-ADAPTER-STANDARD.md](../../../docs/architecture/REFERENCE-ADAPTER-STANDARD.md)
- [ADAPTER-HARNESS.md](./ADAPTER-HARNESS.md)
