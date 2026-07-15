# Certification Framework (OSS-100-09)

**Package:** `@apzhub/integration-sdk` v0.9.0  
**Export:** `@apzhub/integration-sdk/harness`  
**Primary API:** `AdapterCertification` · `certifyAdapter` · `buildCertificationReport` · `certificationReportToMarkdown`

---

## Overview

The certification engine evaluates an **`AdapterCertificationSubject`** across ten fixed categories and returns an **`AdapterCertificationReport`** with per-check outcomes and an overall result. It is declarative: callers supply metadata flags (and optional explicit checks); the engine does not shell out to CI or inspect the filesystem.

```text
AdapterCertificationSubject
        ↓
defaultChecksForCategory × CERTIFICATION_CATEGORIES
        ↓  (or subject.categories[].checks overrides)
HarnessCategoryResult[]
        ↓
AdapterCertificationReport { overall, categories, summary, knownLimitations }
```

---

## Categories

| Category      | Default checks (summary)                                                |
| ------------- | ----------------------------------------------------------------------- |
| Architecture  | Extends `IntegrationAdapterBase`; no `@apzhub/platform-services` import |
| Dependencies  | Dependency audit passing; no `EntityMappingStore` import                |
| Capabilities  | Declared capabilities non-empty; capability certification available     |
| Compatibility | Compatibility matrix present                                            |
| Diagnostics   | Diagnostics provider present                                            |
| Health        | Health provider present                                                 |
| Performance   | Performance baseline recorded (measure-only; warn if unset)             |
| Coverage      | Line coverage ≥ 80% when supplied (warn if unset)                       |
| Documentation | Documentation complete                                                  |
| QualityGates  | Quality gates passing                                                   |

`CERTIFICATION_CATEGORIES` is the authoritative ordered list.

Unset optional flags typically **warn** rather than fail (e.g. undefined `hasDiagnostics`). Explicit `false` **fails**. Explicit `categories[].checks` replace defaults for that category; empty + `optional` → **skip**.

---

## Subject fields

| Field                                                                                    | Role                                      |
| ---------------------------------------------------------------------------------------- | ----------------------------------------- |
| `vendorId` / `adapterVersion` / `packageName`                                            | Identity                                  |
| `declaredCapabilities`                                                                   | Capability list for Capabilities category |
| `extendsAdapterBase`                                                                     | Architecture                              |
| `importsPlatformServices` / `importsEntityMappingStore`                                  | Forbidden deps                            |
| `hasHealth` / `hasDiagnostics` / `hasCompatibilityMatrix` / `hasCapabilityCertification` | Surface flags                             |
| `documentationComplete` / `qualityGatesPassing` / `dependencyAuditPassing`               | Gates                                     |
| `coverageLinesPct` / `performanceBaselineRecorded`                                       | Coverage / perf                           |
| `categories`                                                                             | Per-category check overrides              |
| `knownLimitations`                                                                       | Copied into the report                    |

---

## Report APIs

```typescript
import {
  certifyAdapter,
  certificationReportToMarkdown,
} from "@apzhub/integration-sdk/harness";

const report = certifyAdapter({
  vendorId: "plane",
  adapterVersion: "0.6.0",
  packageName: "@apzhub/integration-plane",
  extendsAdapterBase: true,
  declaredCapabilities: ["authentication", "health", "diagnostics"],
  hasHealth: true,
  hasDiagnostics: true,
  hasCompatibilityMatrix: true,
  hasCapabilityCertification: true,
  documentationComplete: true,
  qualityGatesPassing: true,
  coverageLinesPct: 95,
});

const md = certificationReportToMarkdown(report);
```

`summariseOutcome` aggregates check outcomes. `buildCertificationReport` assembles the final report object (`certifiedAt` ISO timestamp, summary string).

---

## Plane / Zammad adoption

| Adapter | Wrapper                       | Notes                                                                               |
| ------- | ----------------------------- | ----------------------------------------------------------------------------------- |
| Plane   | `certifyPlaneWithSdkHarness`  | Builds subject via `getPlaneHarnessMetadata`; still runs `certifyPlaneCapabilities` |
| Zammad  | `certifyZammadWithSdkHarness` | Same pattern with Zammad ops                                                        |

SDK report is **additive**. Existing operations certification APIs remain the source of truth for engine-specific capability matrices.

---

## Exclusions

- Does not replace adapter-owned operations certification (ADR-0057)
- Does not run Vitest/coverage tools — callers supply `coverageLinesPct`
- Does not provision engines or publish events
- Does not invent new adapters

---

## Related

- [ADAPTER-HARNESS.md](./ADAPTER-HARNESS.md)
- [COMPLIANCE-FRAMEWORK.md](./COMPLIANCE-FRAMEWORK.md)
- [QUALITY-REPORTS.md](./QUALITY-REPORTS.md)
- [CI-INTEGRATION.md](./CI-INTEGRATION.md)
