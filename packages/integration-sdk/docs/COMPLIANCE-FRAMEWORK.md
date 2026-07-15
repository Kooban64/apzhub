# Compliance Framework (OSS-100-09)

**Package:** `@apzhub/integration-sdk` v0.9.0  
**Export:** `@apzhub/integration-sdk/harness`  
**Primary API:** `AdapterCompliance` · `assessAdapterCompliance`

---

## Overview

Compliance assessment checks an in-memory **`AdapterPackageStructure`** (file map + declared metadata) against the **Reference Adapter Standard** layout and dependency rules. It complements certification (subject flags) with structure-oriented evidence.

```text
AdapterPackageStructure { vendorId, packageName, files, dependencies, … }
        ↓
AdapterCompliance.assess
        ├── required template paths present
        ├── forbidden paths absent
        ├── required interfaces/symbols found in file contents
        ├── required capabilities declared
        ├── forbidden dependencies absent
        └── required docs present
                ↓
        AdapterComplianceResult { overall, checks, summary }
```

---

## Inputs

| Field                                                             | Purpose                     |
| ----------------------------------------------------------------- | --------------------------- |
| `structure.files`                                                 | Relative path → content map |
| `structure.vendorId` / `packageName`                              | Identity                    |
| `structure.dependencies`                                          | Declared package.json deps  |
| `structure.declaredCapabilities`                                  | Capability ids              |
| `structure.docsPresent` / `requiredInterfaces`                    | Optional overrides          |
| `requiredCapabilities` / `forbiddenDependencies` / `requiredDocs` | Assessment overrides        |

Default forbidden dependencies: `@apzhub/platform-services`, `@apzhub/event-notification-framework`.

Default required capabilities: `authentication`, `health`, `diagnostics`.

Default interfaces probed in content: `IntegrationAdapterBase`, `health`, `diagnostics`.

---

## Template alignment

Required paths come from `listRequiredTemplatePaths(vendorId)` / `REFERENCE_ADAPTER_TEMPLATE` (see [SCAFFOLD-GENERATOR.md](./SCAFFOLD-GENERATOR.md)). Forbidden paths from the template (e.g. platform-service folders inside the adapter package) fail if present.

Missing required interface symbols produce **warn** (content may be stubbed); missing layout files / declared capabilities / docs produce **fail**.

---

## Quick start

```typescript
import {
  assessAdapterCompliance,
  scaffoldAdapter,
} from "@apzhub/integration-sdk/harness";

const scaffold = scaffoldAdapter({
  vendorId: "example",
  displayName: "Example",
});

const result = assessAdapterCompliance({
  structure: {
    vendorId: scaffold.vendorId,
    packageName: scaffold.packageName,
    files: scaffold.files,
    dependencies: {
      "@apzhub/integration-sdk": "workspace:*",
    },
    declaredCapabilities: ["authentication", "health", "diagnostics"],
  },
});
```

---

## Aggregating validator

`AdapterValidator` / `validateAdapter` composes compliance + capability validation + boundary validation (+ optional certification subject) into one `AdapterValidatorResult`.

---

## Exclusions

- No filesystem walks — callers supply file maps
- No live engine checks
- No provisioning / Event Bus / ingress
- Does not mutate packages

---

## Related

- [REFERENCE-ADAPTER-STANDARD.md](../../../docs/architecture/REFERENCE-ADAPTER-STANDARD.md)
- [ADAPTER-HARNESS.md](./ADAPTER-HARNESS.md)
- [CERTIFICATION-FRAMEWORK.md](./CERTIFICATION-FRAMEWORK.md)
- [SCAFFOLD-GENERATOR.md](./SCAFFOLD-GENERATOR.md)
