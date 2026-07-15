# APZHUB — Testing Platform Service Contracts

**Milestone:** APZTCMS-011  
**Package:** `@apzhub/platform-service-contracts` **0.8.0**  
**Path:** `packages/platform-service-contracts/src/services/testing/`  
**Status:** Contract catalogue — implementations in `@apzhub/platform-services`

---

## Purpose

Vendor-neutral platform service interfaces for APZ TCMS. All methods accept `ServiceRequestContext` as the first argument. Domain types come from `@apzhub/testing-contracts`; this package adds the platform boundary only.

---

## Gateway aggregate

`TestingPlatformGateway` (`testing-gateway.ts`) exposes:

| Accessor | Interface | Domain theme |
| -------- | --------- | ------------ |
| `plans` | `TestingPlanService` | Test plan CRUD, clone, archive |
| `suites` | `TestingSuiteService` | Suite CRUD, plan linkage |
| `cases` | `TestingCaseService` | Case CRUD, status transition |
| `requirements` | `TestingRequirementService` | Requirement CRUD |
| `executions` | `TestingExecutionService` | Manual execution lifecycle |
| `evidence` | `TestingEvidenceService` | Evidence metadata register/submit/verify |
| `automation` | `TestingAutomationService` | Import validation, runs, coverage snapshots |
| `coverage` | `TestingCoverageService` | Coverage metrics recompute/list |
| `defects` | `TestingDefectService` | Defect link CRUD |
| `quality` | `TestingQualityService` | Quality snapshots, compare, summarize |
| `certification` | `TestingCertificationService` | Certification workflow, gates, audit |
| `releaseReadiness` | `TestingReleaseReadinessService` | Plan/cert readiness calculation |
| `traceability` | `TestingTraceabilityService` | Links, relationships, matrices |
| `approvals` | `TestingApprovalService` | Approval requests and decisions |
| `dashboard` | `TestingDashboardService` | Aggregated dashboard summary |
| `reporting` | `TestingReportingService` | Report placeholder listing (no engine) |

Implementation bundle also exposes `reporting` on `TestingPlatformGatewayWithReporting` — same contract, included in nested gateway when testing is enabled.

---

## Context contract

Every service method:

```typescript
import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

list(ctx: ServiceRequestContext): Promise<...>;
```

Required context fields enforced at platform layer: `tenantId`, `userId`, `correlationId` (via `assertTestingContext`).

---

## Error contract

Implementations throw `PlatformServiceError` only at the platform boundary. Callers (future HTTP layer) map categories to the standard response envelope — see [Testing Error Model](./APZHUB-Testing-Error-Model.md).

---

## Relationship to domain contracts

| Domain (`@apzhub/testing-contracts`) | Platform (`@apzhub/platform-service-contracts`) |
| ------------------------------------ | ------------------------------------------------- |
| `ManualTestingService` / per-domain interfaces | Split into focused platform services with pipeline authz keys |
| Domain-specific context types where present | Unified `ServiceRequestContext` |
| Raw `DomainRuleError` | Never crosses platform boundary |

Domain package versions **unchanged** at APZTCMS-011.

---

## Usage

```typescript
import type {
  TestingPlatformGateway,
  TestingPlanService,
} from "@apzhub/platform-service-contracts";
```

Implementations: `@apzhub/platform-services` → `createTestingServiceImpls`.

---

## Related

- [APZ TCMS Service Contracts](./APZHUB-APZ-TCMS-Service-Contracts.md) — domain-level catalogue
- [Testing Gateway Reference](./APZHUB-Testing-Gateway-Reference.md)
- [Platform Service Contracts Specification](../specs/APZHUB-Platform-Service-Contracts-Specification.md)
