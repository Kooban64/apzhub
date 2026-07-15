# Adapter Development Harness (OSS-100-09)

**Package:** `@apzhub/integration-sdk` v0.9.0  
**Export:** `@apzhub/integration-sdk/harness` (also re-exported from the root barrel)  
**Authority:** [Platform Integration SDK Architecture](../../../docs/architecture/APZHUB-Platform-Integration-SDK-Architecture.md) · [Adapter Harness Architecture Index](../../../docs/architecture/APZHUB-Integration-SDK-Adapter-Harness.md)

---

## Overview

OSS-100-09 delivers a reusable, vendor-neutral **Adapter Development Harness & Certification Framework**. Adapters supply declared metadata, package structure maps, and capability results; the SDK supplies bootstrap harness, certification engine, compliance checks, contract suites, mock provider simulation, scaffold generator, quality reports, boundary validation, and CI helpers.

```text
Adapter author / CI
        ↓
@apzhub/integration-sdk/harness
        ├── AdapterHarness          — boot MockAdapter + fixtures + cleanup
        ├── AdapterCertification    — Architecture → QualityGates report
        ├── AdapterCompliance       — Reference Adapter Standard layout
        ├── AdapterContractSuite    — lifecycle / health / mapping / events …
        ├── AdapterMockHarness      — scripted HTTP + event mocks
        ├── AdapterScaffold         — in-memory package tree generator
        ├── AdapterQualityReport    — coverage + gate aggregation
        └── CI helpers              — serialisable check bundles
                ↓
        Structured reports (pass | warn | fail | skip)
```

**Not in this package:** provisioning / upgrade orchestration, Platform Event Bus, HTTP webhook ingress, workers/schedulers, durable production stores, new business-domain adapters, or replacement of Plane/Zammad **operations** APIs (see [ADR-0057](../../../docs/adr/ADR-0057-sdk-harness-vs-adapter-operations-certification.md)).

---

## Boundary: SDK harness vs adapter operations

| Concern                                                                         | Owner                                 | Role                               |
| ------------------------------------------------------------------------------- | ------------------------------------- | ---------------------------------- |
| Shared certification engine, compliance, contracts, mocks, scaffold, CI helpers | **Integration SDK** (`/harness`)      | Vendor-neutral infrastructure      |
| Capability self-assessment, readiness, compatibility matrix (engine-specific)   | **Adapter operations** (Plane/Zammad) | Domain-specific ops APIs unchanged |
| Thin wrappers (`create*AdapterHarness`, `certify*WithSdkHarness`)               | **Adapter package** `src/harness/`    | Wire SDK subject metadata ↔ ops    |

SDK certification **does not replace** `certifyPlaneCapabilities` / `certifyZammadCapabilities`. Wrappers call both and return combined results.

---

## Public surface (core)

| Symbol                                                       | Purpose                                                                                                            |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `AdapterHarness` / `createAdapterHarness`                    | Boot/configure/run/cleanup `MockAdapter` with fixtures                                                             |
| `mergeFileMaps`                                              | Merge in-memory package file maps                                                                                  |
| `AdapterCertification` / `certifyAdapter`                    | Category-based certification report                                                                                |
| `AdapterCompliance` / `assessAdapterCompliance`              | Reference Adapter Standard assessment                                                                              |
| `AdapterContractSuite` / `runAdapterContractSuite`           | Declarative contract area checks                                                                                   |
| `AdapterMockHarness` / `createAdapterMockHarness`            | Provider HTTP/event simulation                                                                                     |
| `AdapterScaffold` / `scaffoldAdapter`                        | In-memory scaffold file tree                                                                                       |
| `REFERENCE_ADAPTER_TEMPLATE`                                 | Expected package layout metadata                                                                                   |
| `AdapterValidator` / `validateAdapter`                       | Aggregating compliance + boundary + caps                                                                           |
| `AdapterQualityReportBuilder` / `buildAdapterQualityReport`  | Quality gate report                                                                                                |
| `AdapterBoundaryValidator` / `validateAdapterBoundary`       | Forbidden-import scan                                                                                              |
| `AdapterCompatibilitySuite` / `evaluateAdapterCompatibility` | Version/feature compatibility                                                                                      |
| `AdapterPerformanceHarness`                                  | Measure-only timing harness                                                                                        |
| `AdapterDocumentationGenerator`                              | Markdown artefact generation                                                                                       |
| `AdapterTestKit` / fixtures                                  | Request-context + fixture helpers                                                                                  |
| CI helpers                                                   | `runCertificationChecks`, `runContractChecks`, `runBoundaryChecks`, `runDocumentationChecks`, `buildQualityReport` |

See companion docs: [CERTIFICATION-FRAMEWORK.md](./CERTIFICATION-FRAMEWORK.md) · [COMPLIANCE-FRAMEWORK.md](./COMPLIANCE-FRAMEWORK.md) · [MOCK-HARNESS.md](./MOCK-HARNESS.md) · [CONTRACT-TESTS.md](./CONTRACT-TESTS.md) · [SCAFFOLD-GENERATOR.md](./SCAFFOLD-GENERATOR.md) · [QUALITY-REPORTS.md](./QUALITY-REPORTS.md) · [CI-INTEGRATION.md](./CI-INTEGRATION.md).

---

## Quick start

```typescript
import { createAdapterHarness, certifyAdapter } from "@apzhub/integration-sdk/harness";

const harness = createAdapterHarness();
const state = await harness.boot();

const report = certifyAdapter({
  vendorId: "example",
  adapterVersion: "0.1.0",
  packageName: "@apzhub/integration-example",
  extendsAdapterBase: true,
  declaredCapabilities: ["authentication", "health", "diagnostics"],
  hasHealth: true,
  hasDiagnostics: true,
  documentationComplete: true,
  qualityGatesPassing: true,
});

await harness.cleanup();
```

### Plane / Zammad pattern

```typescript
import {
  createPlaneAdapterHarness,
  certifyPlaneWithSdkHarness,
} from "@apzhub/integration-plane";

const harness = createPlaneAdapterHarness();
const { sdkCertification, capabilityCertifications, compatibility } =
  certifyPlaneWithSdkHarness();
```

Zammad mirrors via `createZammadAdapterHarness` / `certifyZammadWithSdkHarness`. Adapter versions remain **0.6.0**.

---

## AdapterHarness lifecycle

1. `createAdapterHarness(options?)` — optional default configuration/fixtures.
2. `boot()` — creates `MockAdapter` via `AdapterFactory`, merges fixtures, optional `contextOverrides`.
3. `configure` / `loadFixtures` / `getFixture` — fixture management while booted.
4. `runWith(work, { autoCleanup })` — boot if needed, run work, optional cleanup.
5. `cleanup()` — dispose adapter and mark harness disposed.
6. `reset()` — clear disposed flag for a new lifecycle.

Throws if already booted without cleanup, or if used after dispose without `reset()`.

---

## Outcomes

All harness checks use:

| Outcome | Meaning                                  |
| ------- | ---------------------------------------- |
| `pass`  | Check satisfied                          |
| `warn`  | Soft failure / missing optional evidence |
| `fail`  | Hard failure                             |
| `skip`  | Optional category with no checks         |

Overall category/report outcomes are summarised with fail > warn > skip > pass precedence (`summariseOutcome`).

---

## Explicit absences (OSS-100-09)

| Concern                                | Status                                             |
| -------------------------------------- | -------------------------------------------------- |
| Provisioning / upgrade orchestration   | **Deferred** — relocated (see backlog OSS-100-10+) |
| Platform Event Bus / HTTP ingress      | **Absent** — platform future                       |
| Workers / schedulers                   | **Absent**                                         |
| Durable production stores              | **Absent** — harness is in-process / in-memory     |
| New domain adapters                    | **Out of scope**                                   |
| Replacing Plane/Zammad operations APIs | **Forbidden** (ADR-0057)                           |

---

## Related

- [CERTIFICATION-FRAMEWORK.md](./CERTIFICATION-FRAMEWORK.md)
- [COMPLIANCE-FRAMEWORK.md](./COMPLIANCE-FRAMEWORK.md)
- [REFERENCE-ADAPTER-STANDARD.md](../../../docs/architecture/REFERENCE-ADAPTER-STANDARD.md)
- [ADR-0057](../../../docs/adr/ADR-0057-sdk-harness-vs-adapter-operations-certification.md)
- [OSS-100-09 Completion Report](../../../docs/sprint/OSS-100-09-completion-report.md)
