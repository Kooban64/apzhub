# APZ TCMS — Domain Contracts

**Milestone:** APZTCMS-002  
**Package:** `@apzhub/testing-contracts`  
**Status:** TypeScript models only — **no DDL**

---

## Alignment

Canonical entities follow [Domain Model](./APZHUB-APZ-TCMS-Domain-Model.md). Soft refs to Projects (Feature/Epic/Story/Task) use `WorkItemRef` — never authoritative copies of foreign business data.

---

## Entity groups

### Planning & risk

- `Requirement`, `Risk`, `WorkItemRef`

### Test structure

- `TestPlan`, `TestSuite`, `TestCase`, `TestStep`, `RegressionSuite`

### Execution

- `ExecutionSession`, `ManualExecution`, `ManualStepActual`, `AutomatedExecution`, `TestRun`, `TestResult`

### Evidence & defects

- `Evidence`, `Attachment`, `DefectLink`

### Certification & governance

- `CertificationRecord`, `QualityGate`, `Approval`, `Signature`, `Witness`, `ReleaseReadiness`, `AuditEvent`

### Analytics & AI stub

- `CoverageMetric`, `TraceabilityLink`, `TraceabilityMatrixRow`, `AutomationJob`, `DashboardSnapshot`, `AISuggestion`

---

## Audit fields

Entities that mutate include:

- `tenantId`
- `createdAt` / `updatedAt` (ISO-8601 strings)
- optional `createdBy` / `updatedBy`

Identifiers are branded string IDs (`RequirementId`, `TestCaseId`, …) with `isPlatformIdShape` / `as*Id` helpers.

---

## Enumerations

Key enums live under `src/enums/` including `CertificationStatus` (eight lifecycle codes with display labels), `TestStatus`, `TestResultStatus`, `ExecutionStatus`, `EvidenceType`, `ApprovalStatus`, `Severity`, `Priority`, `RiskLevel`, `AutomationType`, `ExecutionType`, and related catalogues.

---

## Persistence note

APZTCMS-002 intentionally omits schema/migrations. Persistence begins under **APZTCMS-003** after owner approval.
