# APZ TCMS — Service Contracts

**Milestone:** APZTCMS-002  
**Package:** `@apzhub/testing-contracts`  
**Status:** Interfaces only

---

## Service catalogue

| Service ID | Interface | Responsibility (contract) |
|------------|-----------|---------------------------|
| `testing-service` | `TestingService` | Requirements, risks, plans, suites, cases/steps, evidence metadata, defect links |
| `certification-service` | `CertificationService` | Certification records, state transitions, gates, approvals, release readiness |
| `evidence-service` | `EvidenceService` | Evidence / attachment metadata registration |
| `traceability-service` | `TraceabilityService` | Traceability links and matrices |
| `execution-service` | `ExecutionService` | Sessions, manual/automated executions, runs, results |
| `automation-service` | `AutomationService` | Automation job metadata lifecycle |
| `coverage-service` | `CoverageService` | Coverage metrics listing + recompute request acknowledgement |
| `approval-service` | `ApprovalService` | Approval request / decide / sign / witness |
| `reporting-service` | `ReportingService` | Report descriptors (stub formats) |
| `dashboard-service` | `DashboardService` | Dashboard snapshots |

All methods accept `ServiceRequestContext` from `@apzhub/platform-service-contracts` and return `Promise` of domain types or void-ish acknowledgements.

---

## Manifests

| Service | Manifest |
|---------|----------|
| TestingService | `services/testing/service.yaml` |
| CertificationService | `services/certification/service.yaml` |

Both reference:

- `contractPackage: "@apzhub/testing-contracts"`
- `contractVersion: "0.1.0"`
- `implementationPackage: planned` (no implementation package yet)

---

## Events (definitions only)

Past-tense types such as `test_case.created`, `test_run.completed`, `certification.state_changed` are declared in `src/events/`. Envelope fields: `eventType`, `occurredAt`, `tenantId`, `correlationId`, optional `causationId` / `actorUserId`, and `payload`.

**No Event Bus** in this milestone.

---

## Implementation gate

Concrete implementations belong in a later milestone (platform services layer). Do not implement adapters or runners under these interfaces in APZTCMS-002.
