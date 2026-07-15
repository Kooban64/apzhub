# APZHUB Integration SDK — Adapter Development Harness & Certification

> **Milestone:** OSS-100-09  
> **Package:** `@apzhub/integration-sdk` v0.9.0  
> **Status:** Implemented  
> **Primary docs:** [packages/integration-sdk/docs/ADAPTER-HARNESS.md](../../packages/integration-sdk/docs/ADAPTER-HARNESS.md)

---

## Purpose

Architecture index for the owner-approved **Adapter Development Harness & Certification Framework**. Provides vendor-neutral bootstrap harness, certification engine, compliance assessment, contract suites, mock provider simulation, scaffold generator, quality reports, boundary validation, and CI helpers — while preserving Plane/Zammad **operations** APIs via thin wrappers and excluding provisioning, Event Bus, ingress, and new domain adapters.

---

## Package documentation

| Document           | Path                                                                                         |
| ------------------ | -------------------------------------------------------------------------------------------- |
| Harness overview   | [ADAPTER-HARNESS.md](../../packages/integration-sdk/docs/ADAPTER-HARNESS.md)                 |
| Certification      | [CERTIFICATION-FRAMEWORK.md](../../packages/integration-sdk/docs/CERTIFICATION-FRAMEWORK.md) |
| Compliance         | [COMPLIANCE-FRAMEWORK.md](../../packages/integration-sdk/docs/COMPLIANCE-FRAMEWORK.md)       |
| Mock harness       | [MOCK-HARNESS.md](../../packages/integration-sdk/docs/MOCK-HARNESS.md)                       |
| Contract tests     | [CONTRACT-TESTS.md](../../packages/integration-sdk/docs/CONTRACT-TESTS.md)                   |
| Scaffold generator | [SCAFFOLD-GENERATOR.md](../../packages/integration-sdk/docs/SCAFFOLD-GENERATOR.md)           |
| Quality reports    | [QUALITY-REPORTS.md](../../packages/integration-sdk/docs/QUALITY-REPORTS.md)                 |
| CI integration     | [CI-INTEGRATION.md](../../packages/integration-sdk/docs/CI-INTEGRATION.md)                   |

---

## Architecture

```text
CI / adapter author / Wave certification
        │
        ▼
@apzhub/integration-sdk/harness
        ├── AdapterHarness / AdapterMockHarness / AdapterScaffold
        ├── AdapterCertification / AdapterCompliance / AdapterContractSuite
        ├── AdapterValidator / AdapterBoundaryValidator
        ├── AdapterQualityReport / AdapterDocumentationGenerator
        └── CI helpers (serialisable bundles)
                │
                ▼
        Structured reports (pass | warn | fail | skip)
                │
Plane / Zammad thin wrappers (src/harness/)
        ├── create*AdapterHarness
        └── certify*WithSdkHarness  ──► still call adapter operations APIs
```

**Separation of concerns**

| Layer                  | Responsibility                                                                   |
| ---------------------- | -------------------------------------------------------------------------------- |
| SDK `/harness`         | Shared certification engine, compliance, contracts, mocks, scaffold, quality, CI |
| Adapter operations     | Engine-specific capability/readiness/compatibility matrices (unchanged)          |
| Adapter `src/harness/` | Thin wrappers mapping declared metadata → SDK subject                            |
| Platform (future)      | Provisioning orchestration, Event Bus, ingress, durable stores                   |

**SDK harness is the standard certification engine** for Reference Adapter Standard structural/category gates. Adapter-owned operations certification remains complementary (ADR-0057).

---

## Export

```text
@apzhub/integration-sdk/harness
@apzhub/integration-sdk          → root re-exports
```

**Version:** `@apzhub/integration-sdk` **0.9.0**  
**Adapters:** `@apzhub/integration-plane` / `@apzhub/integration-zammad` remain **0.6.0** (thin wrappers only)

---

## ADR

| ADR                                                                        | Topic                                                |
| -------------------------------------------------------------------------- | ---------------------------------------------------- |
| [0057](../adr/ADR-0057-sdk-harness-vs-adapter-operations-certification.md) | SDK harness does not replace adapter operations APIs |

---

## Explicit absences

| Concern                                 | Status                                            |
| --------------------------------------- | ------------------------------------------------- |
| Provisioning / upgrade orchestration    | Deferred (see OSS-100 backlog renumber)           |
| Platform Event Bus / HTTP ingress       | Absent                                            |
| Workers / schedulers                    | Absent                                            |
| SDK v1.0 / Production Ready declaration | Not authorised — maturity = **Release Candidate** |
| Next business-domain adapter            | Not authorised                                    |

---

## Related

- [REFERENCE-ADAPTER-STANDARD.md](./REFERENCE-ADAPTER-STANDARD.md)
- [OSS-100-09 Completion Report](../sprint/OSS-100-09-completion-report.md)
- [OSS-100 Backlog](../backlog/OSS-100-Platform-Integration-SDK-Backlog.md)
- Prior indexes: [Webhook & Polling](./APZHUB-Integration-SDK-Webhook-Polling.md) · [Mapping](./APZHUB-Integration-SDK-Mapping-Framework.md) · [HTTP Transport](./APZHUB-Integration-SDK-HTTP-Transport.md)
