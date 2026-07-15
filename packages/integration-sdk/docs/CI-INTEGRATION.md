# CI Integration (OSS-100-09)

**Package:** `@apzhub/integration-sdk` v0.9.0  
**Export:** `@apzhub/integration-sdk/harness`  
**Primary API:** `runCertificationChecks` · `runContractChecks` · `runBoundaryChecks` · `runDocumentationChecks` · `buildQualityReport`

---

## Overview

CI helpers return **`CiCheckBundle<T>`** — serialisable wrappers around harness engines for pipelines and Vitest assertions. They do **not** rewrite GitHub Actions workflows or spawn shell tools.

```text
Subject / inputs
        ↓
run*Checks / buildQualityReport
        ↓
CiCheckBundle {
  ok: boolean,          // overall pass | warn
  outcome: HarnessCheckOutcome,
  result: T,
  serialisable: Record<string, unknown>
}
```

`ok` is `true` when `overall` is `pass` **or** `warn` (warn does not fail the bundle). Treat `fail` as hard CI failure in callers.

---

## Helpers

| Helper                            | Engine                          | Extra serialisable fields                |
| --------------------------------- | ------------------------------- | ---------------------------------------- |
| `runCertificationChecks(subject)` | `certifyAdapter`                | `vendorId`, `summary`, category outcomes |
| `runContractChecks(subject)`      | `runAdapterContractSuite`       | `summary`, `checkCount`                  |
| `runBoundaryChecks({ files })`    | `validateAdapterBoundary`       | `summary`, `violationCount`              |
| `runDocumentationChecks(input)`   | `AdapterDocumentationGenerator` | `documentKeys`, `missing`                |
| `buildQualityReport(input)`       | `buildAdapterQualityReport`     | `summary`, `gates`, `coverage`           |

Documentation checks require generated keys: `capability-matrix.md`, `architecture.md`, `operations.md`, `certification-summary.md`, `completion-report-template.md`.

---

## Suggested Vitest usage

```typescript
import {
  runCertificationChecks,
  runBoundaryChecks,
  buildQualityReport,
} from "@apzhub/integration-sdk/harness";

it("certifies subject", () => {
  const bundle = runCertificationChecks({
    vendorId: "example",
    adapterVersion: "0.1.0",
    packageName: "@apzhub/integration-example",
    extendsAdapterBase: true,
    declaredCapabilities: ["authentication", "health", "diagnostics"],
  });
  expect(bundle.ok).toBe(true);
  expect(bundle.serialisable.outcome).toBe("pass");
});
```

Plane/Zammad packages may assert wrappers:

```typescript
import { certifyPlaneWithSdkHarness } from "@apzhub/integration-plane";

const { sdkCertification } = certifyPlaneWithSdkHarness();
expect(sdkCertification.overall).not.toBe("fail");
```

---

## What CI should still run externally

| Gate                   | Tooling                                                    |
| ---------------------- | ---------------------------------------------------------- |
| Unit/integration tests | Vitest                                                     |
| Coverage               | Vitest coverage → feed `coverageLinesPct` / quality report |
| Lint / typecheck       | ESLint / `tsc` → feed gate statuses                        |
| Wave E2E               | Playwright / existing certification suites                 |

Harness helpers **aggregate and serialise** results; they do not replace the test runner.

---

## Exclusions

- No GitHub Actions YAML generation or mutation
- No network calls to engines
- No provisioning / Event Bus / ingress
- No automatic merge gates beyond what callers assert

---

## Related

- [QUALITY-REPORTS.md](./QUALITY-REPORTS.md)
- [CERTIFICATION-FRAMEWORK.md](./CERTIFICATION-FRAMEWORK.md)
- [CONTRACT-TESTS.md](./CONTRACT-TESTS.md)
- [ADAPTER-HARNESS.md](./ADAPTER-HARNESS.md)
- [OSS-100-09 Completion Report](../../../docs/sprint/OSS-100-09-completion-report.md)
