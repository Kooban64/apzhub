# APZ TCMS — Manual Testing Domain

**Milestone:** APZTCMS-004  
**Packages:** `@apzhub/testing-contracts` **0.2.0** · `@apzhub/testing-persistence` **0.2.0** · `@apzhub/testing-services` **0.1.0**

## Purpose

Defines the **manual testing business domain** for APZ TCMS: requirements, plans, suites, cases, manual executions, evidence metadata, approvals, traceability, regression sets, risk, and readiness _inputs_.

## Explicit exclusions

- HTTP APIs / gateway handlers
- Workbench UI / editors
- Playwright, Vitest runners, JUnit, Allure
- Automation runners / AI / reports / dashboards
- Event Bus publish (in-memory collector only)
- Binary upload pipelines
- Certification _engine_ and release _decisions_

## Aggregate map

| Aggregate                  | Owner service                    | SoR notes                                    |
| -------------------------- | -------------------------------- | -------------------------------------------- |
| Requirement                | `RequirementService`             | Platform metadata + soft work-item refs      |
| TestPlan                   | `TestPlanService`                | Clone / version / ownership / assignment     |
| TestSuite                  | `TestSuiteService`               | Hierarchy, ordering, grouping                |
| TestCase                   | `TestCaseService`                | Lifecycle, versions, templates, parameters   |
| ManualExecution            | `ManualExecutionService`         | Step actuals; tables in `0018`               |
| Evidence                   | `EvidenceService`                | Metadata only                                |
| Approval                   | `ApprovalService`                | Author / reviewer / approver + history       |
| TraceabilityLink           | `TraceabilityService`            | Bidirectional chain                          |
| RegressionSuite            | `RegressionService`              | Regression set                               |
| Risk                       | `RiskService`                    | Severity / likelihood / impact / criticality |
| Cert prep / release inputs | Preparation & Readiness services | Inputs only                                  |

## Related

- [Service Architecture](./APZHUB-APZ-TCMS-Service-Architecture.md)
- [Lifecycle Guide](./APZHUB-APZ-TCMS-Lifecycle-Guide.md)
- [State Machines](./APZHUB-APZ-TCMS-State-Machines.md)
- [Validation Rules](./APZHUB-APZ-TCMS-Validation-Rules.md)
- [Traceability Guide](./APZHUB-APZ-TCMS-Traceability-Guide.md)
