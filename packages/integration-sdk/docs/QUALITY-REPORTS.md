# Quality Reports (OSS-100-09)

**Package:** `@apzhub/integration-sdk` v0.9.0  
**Export:** `@apzhub/integration-sdk/harness`  
**Primary API:** `buildAdapterQualityReport` · `AdapterQualityReportBuilder` · `createAdapterQualityReportBuilder`

---

## Overview

Quality reports aggregate **caller-supplied** CI/coverage gate statuses into a structured `AdapterQualityReport`. The builder does **not** shell out to Vitest, ESLint, or `tsc` — CI (or tests) collect evidence and pass it in.

```text
AdapterQualityInputs { coverage?, lint?, typecheck?, tests?, docs?, … }
        ↓
coverageStatus(linesPct, gatePct=80) + gate statuses
        ↓
AdapterQualityReport { overall, coverage, gates, summary, generatedAt }
```

---

## Inputs

| Field                                                                     | Values                                            | Notes             |
| ------------------------------------------------------------------------- | ------------------------------------------------- | ----------------- |
| `vendorId` / `packageName` / `adapterVersion`                             | identity                                          | Required          |
| `coverage.linesPct` (etc.)                                                | numbers                                           | Optional          |
| `coverageGatePct`                                                         | default **80**                                    | Lines gate        |
| `lint` / `typecheck` / `tests` / `docs` / `architecture` / `dependencies` | `pass` \| `fail` \| `warn` \| `skip` \| `unknown` | Default `unknown` |

Coverage status:

| Condition                  | Status    |
| -------------------------- | --------- |
| `linesPct` undefined       | `unknown` |
| `linesPct >= gate`         | `pass`    |
| within 5 points below gate | `warn`    |
| below that                 | `fail`    |

Overall outcome maps statuses via `summariseOutcome` (`unknown`/`skip` → skip).

---

## Compatibility & performance companions

| API                            | Role                                                                   |
| ------------------------------ | ---------------------------------------------------------------------- |
| `evaluateAdapterCompatibility` | min/max/detected version + optional features → classification          |
| `AdapterPerformanceHarness`    | Measure-only timings around harness boot/work (not a latency SLA gate) |

These feed certification subjects and documentation generators but are separate from the quality report builder.

---

## Documentation artefacts

`AdapterDocumentationGenerator` produces markdown maps:

- `capability-matrix.md`
- `architecture.md`
- `operations.md`
- `certification-summary.md`
- `completion-report-template.md`

Used by `runDocumentationChecks` in CI helpers.

---

## Quick start

```typescript
import { buildAdapterQualityReport } from "@apzhub/integration-sdk/harness";

const report = buildAdapterQualityReport({
  vendorId: "plane",
  packageName: "@apzhub/integration-plane",
  adapterVersion: "0.6.0",
  coverage: { linesPct: 95, branchesPct: 88, functionsPct: 99, statementsPct: 95 },
  lint: "pass",
  typecheck: "pass",
  tests: "pass",
  docs: "pass",
  architecture: "pass",
  dependencies: "pass",
});
```

---

## Verified harness coverage (OSS-100-09)

| Metric                       | Approx.     |
| ---------------------------- | ----------- |
| Statements / lines           | ~**98.73%** |
| Branches                     | ~**88.46%** |
| Functions                    | ~**99.22%** |
| Certification paths          | ~**99%**    |
| Compliance / boundary / mock | **100%**    |

(Full suite stats: see [OSS-100-09 Completion Report](../../../docs/sprint/OSS-100-09-completion-report.md).)

---

## Exclusions

- No process spawning / tool execution
- No automatic GitHub Actions workflow rewrite
- No production readiness declaration for the SDK itself

---

## Related

- [CI-INTEGRATION.md](./CI-INTEGRATION.md)
- [CERTIFICATION-FRAMEWORK.md](./CERTIFICATION-FRAMEWORK.md)
- [ADAPTER-HARNESS.md](./ADAPTER-HARNESS.md)
