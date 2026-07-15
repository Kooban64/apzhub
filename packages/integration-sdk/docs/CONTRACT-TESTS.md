# Contract Tests (OSS-100-09)

**Package:** `@apzhub/integration-sdk` v0.9.0  
**Export:** `@apzhub/integration-sdk/harness`  
**Primary API:** `AdapterContractSuite` · `runAdapterContractSuite`

---

## Overview

The contract suite runs **declarative** checks that an adapter (or metadata) satisfies expected SDK surface areas. It can probe a live `IntegrationAdapterBase` instance or accept explicit `ContractSubjectMetadata`.

```text
IntegrationAdapterBase | ContractSubjectMetadata
        ↓
resolve lifecycle / health / diagnostics / transport / mapping / events / …
        ↓
HarnessCheckResult[]  (core fail; optional surfaces warn)
        ↓
AdapterContractSuiteResult
```

---

## Contract areas

| Area           | Label                             | Missing behaviour |
| -------------- | --------------------------------- | ----------------- |
| `lifecycle`    | AdapterBase lifecycle hooks       | **fail**          |
| `health`       | Health contract                   | **fail**          |
| `diagnostics`  | Diagnostics contract              | **fail**          |
| `transport`    | Transport contract                | **warn**          |
| `mapping`      | Mapping contract                  | **warn**          |
| `events`       | Events contract                   | **warn**          |
| `polling`      | Polling contract                  | **warn**          |
| `webhooks`     | Webhooks contract                 | **warn**          |
| `logging`      | Logging contract                  | **fail**          |
| `metrics`      | Metrics contract                  | **fail**          |
| `errors`       | Error translation contract        | **fail**          |
| `capabilities` | Capabilities contract             | **fail**          |
| `config`       | Configuration validation contract | **fail**          |

Optional event/transport/mapping surfaces warn when absent so older adapters can migrate gradually; core lifecycle/health/diagnostics/ops surfaces fail.

---

## Probing adapters

When given an `IntegrationAdapterBase`, the suite inspects public methods (`initialise`, `dispose`, `validateConfiguration`, `health`, `diagnostics`, …). Metadata flags on the same object override probes via `areas` / `has*` fields.

```typescript
import {
  createAdapterHarness,
  runAdapterContractSuite,
} from "@apzhub/integration-sdk/harness";

const harness = createAdapterHarness();
await harness.boot();
const result = runAdapterContractSuite(harness.adapter);
await harness.cleanup();
```

Metadata-only:

```typescript
runAdapterContractSuite({
  hasLifecycleHooks: true,
  hasHealth: true,
  hasDiagnostics: true,
  areas: { mapping: true, events: true, transport: true },
});
```

---

## Boundary contracts

Complementary: `validateAdapterBoundary` scans a file map for forbidden imports (`@apzhub/platform-services`, `EntityMappingStore`, event-notification-framework, cross-vendor adapter leaks). See [COMPLIANCE-FRAMEWORK.md](./COMPLIANCE-FRAMEWORK.md).

---

## CI

`runContractChecks(subject)` wraps the suite in a serialisable `CiCheckBundle` (`ok` when overall is `pass` or `warn`).

---

## Exclusions

- Does not execute live HTTP against engines
- Does not assert business-domain operation correctness
- Does not replace Wave E2E certification suites
- Does not provision or schedule work

---

## Related

- [ADAPTER-HARNESS.md](./ADAPTER-HARNESS.md)
- [CERTIFICATION-FRAMEWORK.md](./CERTIFICATION-FRAMEWORK.md)
- [CI-INTEGRATION.md](./CI-INTEGRATION.md)
- [ADAPTER-FRAMEWORK.md](./ADAPTER-FRAMEWORK.md)
