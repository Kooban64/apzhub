# @apzhub/testing-services

APZ TCMS **domain services** (APZTCMS-004/006/007/008/009) — business logic only.

**Version:** 0.5.0

## Scope

Concrete domain services over `@apzhub/testing-persistence`:

- Requirement, TestPlan, TestSuite, TestCase
- ManualExecution engine, Evidence, Approval
- Traceability, Regression, Risk
- CertificationPreparation / ReleaseReadiness (inputs only)
- **Automation result ingestion** (APZTCMS-007): adapters, normalize, validate, import
- **Quality intelligence** (APZTCMS-008): defects, coverage engine, quality snapshots/trends, regression analysis, release/certification readiness dimensions, risk aggregation, quality summaries
- **Certification engine** (APZTCMS-009): lifecycle state machine, configurable gates, advisory recommendations, human multi-stage approvals, immutable audit

## Factories

```ts
import { createInMemoryTestingPersistence } from "@apzhub/testing-persistence";
import {
  createManualTestingServices,
  createAutomationIngestionServices,
  createQualityIntelligenceServices,
  createCertificationEngineServices,
  createTestingDomainServices,
} from "@apzhub/testing-services";

const persistence = createInMemoryTestingPersistence();
const manual = createManualTestingServices({ persistence }); // backward compatible
const quality = createQualityIntelligenceServices({ persistence });
const certification = createCertificationEngineServices({ persistence });
const all = createTestingDomainServices({ persistence }); // manual + automation + quality + certification
```

Events are recorded in an in-memory `DomainEventCollector` (append-only). No bus.

## Explicit exclusions

No HTTP APIs, Workbench UI, dashboards/charts, Jira/GitHub/ADO/GitLab sync, Playwright/Vitest/JUnit/Allure **runners**, schedulers, CI/CD, AI, or Event Bus publish.
