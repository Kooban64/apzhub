# APZ TCMS — Foundation Architecture

**Product:** APZ TCMS  
**Milestone:** APZTCMS-002 (contracts) · **APZTCMS-003** (persistence)  
**Status:** Core platform foundation (contracts + manifests) **plus persistence** (`@apzhub/testing-persistence` **0.1.0**) — **still no APIs, UI, or runners**  
**Authority:** [000](../000-apzhub-engineering-constitution.md) · [003](../003-system-architecture-layered-design-principles.md) · [008](../008-module-platform-service-connector-architecture.md) · [009](../009-platform-service-layer-business-logic-architecture.md) · [027](../027-platform-service-sdk-business-service-framework-service-manifest-specification.md) · [Reference Architecture](./APZHUB-APZ-TCMS-Reference-Architecture.md) · [ADR-0059](../adr/ADR-0059-apz-tcms-native-product-architecture.md)

---

## Persistence status (APZTCMS-003)

SoR schema, migrations (0016/0017), repositories, and live authz asserts are delivered. See [Persistence Architecture](./APZHUB-APZ-TCMS-Persistence-Architecture.md) · [APZTCMS-003 Completion Report](../sprint/APZTCMS-003-completion-report.md). Exclusions for UI/APIs/runners still hold.

---

## Scope delivered (APZTCMS-002)

| Deliverable | Location |
|-------------|----------|
| Domain / service / event / permission / config contracts | `@apzhub/testing-contracts` `0.1.0` |
| In-memory registries + validation helpers | `@apzhub/testing-foundation` `0.1.0` |
| `TestingService` manifest | `services/testing/service.yaml` |
| `CertificationService` manifest | `services/certification/service.yaml` |
| Testing module shell (disabled/planned) | `services/testing/manifests/testing/module.yaml` |

---

## Explicit exclusions (still hold after APZTCMS-003)

- No API routes, frontend/UI, Playwright product E2E, Vitest-as-execution-engine, JUnit, Allure, CI runners
- No execution-result / step-outcome SoR tables
- No Event Bus, notifications, AI runtime, evidence blob upload pipelines
- No `TestingServiceImpl` / certification engine / full runner UX

*(APZTCMS-002 owner brief forbade DB; APZTCMS-003 delivered persistence — that exclusion is closed.)*

---

## Layer map

```text
Testing module (manifest only, status: disabled)
        │  (future Gateway → Auth → Authz)
        ▼
Service interfaces (@apzhub/testing-contracts)
  TestingService · CertificationService · EvidenceService · …
        │
        ▼
Foundation helpers (@apzhub/testing-foundation)
  Registries (placeholders) · Validation helpers
        │
        ▼
Persistence (@apzhub/testing-persistence) → config testing-schema → Platform PostgreSQL
        │
        ▼
(Future) Platform Services implementations → Adapters → Engines
```

Invariant: modules never call engines; services never skip connectors for engine I/O.

---

## Package ownership

| Package | Owns | Does not own |
|---------|------|--------------|
| `@apzhub/testing-contracts` | Product domain contracts for TCMS | Platform-wide Project/Support DTOs |
| `@apzhub/testing-foundation` | Registries + validators | Business rules / orchestration |
| `@apzhub/testing-persistence` | Repositories, authz asserts, SoR mappers | HTTP / UI / orchestration |
| `@apzhub/platform-service-contracts` | Shared `ServiceRequestContext` etc. | TCMS product models |

TCMS contracts remain product-owned — they are **not** folded into `platform-service-contracts`.

---

## Certification state codes

Runtime codes are snake_case; display labels match the Domain Model:

| Code | Label |
|------|-------|
| `development_ready` | Development Ready |
| `qa_ready` | QA Ready |
| `regression_ready` | Regression Ready |
| `uat_ready` | UAT Ready |
| `production_ready` | Production Ready |
| `certified` | Certified |
| `failed_certification` | Failed Certification |
| `conditional_approval` | Conditional Approval |

---

## Next milestone gate

**APZTCMS-004 COMPLETE** (domain services). Next recommended: **APZTCMS-005** (Manual Execution & Evidence — binary pipeline + delivery layer + Postgres completion). Do not start without owner approval.

## Related

- [Package Guide](./APZHUB-APZ-TCMS-Package-Guide.md)
- [Persistence Architecture](./APZHUB-APZ-TCMS-Persistence-Architecture.md)
- [Service Architecture](./APZHUB-APZ-TCMS-Service-Architecture.md)
- [Service Contracts](./APZHUB-APZ-TCMS-Service-Contracts.md)
- [Domain Contracts](./APZHUB-APZ-TCMS-Domain-Contracts.md)
- [Permission Catalogue](./APZHUB-APZ-TCMS-Permission-Catalogue.md)
- [Module Registration Guide](./APZHUB-APZ-TCMS-Module-Registration-Guide.md)
- [Developer Guide](./APZHUB-APZ-TCMS-Developer-Guide.md)
- [APZTCMS-002 Completion Report](../sprint/APZTCMS-002-completion-report.md)
- [APZTCMS-003 Completion Report](../sprint/APZTCMS-003-completion-report.md)
- [APZTCMS-004 Completion Report](../sprint/APZTCMS-004-completion-report.md)
