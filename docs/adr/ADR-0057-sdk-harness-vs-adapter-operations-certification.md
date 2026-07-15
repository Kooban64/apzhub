# ADR-0057: SDK Harness vs Adapter Operations Certification

## Status

Accepted — OSS-100-09

## Context

Plane and Zammad already expose adapter-owned **operations** certification APIs (`certifyPlaneCapabilities`, readiness, compatibility matrices, operational reports). OSS-100-09 introduces a shared SDK **Adapter Development Harness & Certification Framework** (`@apzhub/integration-sdk/harness`) for vendor-neutral category gates, compliance, contracts, mocks, scaffold, and CI helpers.

If the SDK harness replaced operations APIs, adapters would lose engine-specific capability semantics and Reference Adapter Wave patterns would regress. If adapters ignored the SDK harness, future vendors would reimplement certification inconsistently.

## Decision

1. **SDK harness is the standard certification engine** for shared Architecture → QualityGates categories, Reference Adapter Standard compliance, contract suites, boundary validation, quality reports, and CI serialisation.
2. **Adapter operations APIs remain authoritative** for engine-specific capability self-assessment, readiness, and compatibility matrices.
3. Adapters adopt the SDK via **thin wrappers** (`create*AdapterHarness`, `certify*WithSdkHarness`, `get*HarnessMetadata`) that call `certifyAdapter` / `evaluateAdapterCompatibility` **without** changing public operations signatures or behaviour.
4. SDK harness **does not** provision engines, publish events, host ingress, or generate Platform Services.
5. Declared subject metadata may summarise ops results for SDK categories; it must not silently invent capability outcomes.

## Consequences

- Plane/Zammad stay at **0.6.0** with additive harness modules.
- Future adapters scaffold + certify against one SDK engine while still owning vendor ops when needed.
- Clear split: shared gates in SDK; domain semantics in adapters; platform owns future provisioning/bus/ingress.

## Related

- [ADAPTER-HARNESS.md](../../packages/integration-sdk/docs/ADAPTER-HARNESS.md)
- [CERTIFICATION-FRAMEWORK.md](../../packages/integration-sdk/docs/CERTIFICATION-FRAMEWORK.md)
- [REFERENCE-ADAPTER-STANDARD.md](../architecture/REFERENCE-ADAPTER-STANDARD.md)
- [OSS-100-09 Completion Report](../sprint/OSS-100-09-completion-report.md)
