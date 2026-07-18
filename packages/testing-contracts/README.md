# @apzhub/testing-contracts

APZ TCMS domain contracts — enums, canonical models, service interfaces, event type definitions, permission catalogue, and configuration types.

**Version:** **0.6.0** (APZTCMS-009)  
**Status:** Contracts only — no persistence, APIs, UI, runners, or service implementations

## Purpose

Defines the stable product-owned boundary for **APZ TCMS** (Testing & Certification). Modules and future platform-service implementations depend on this package; they never import execution engines (Playwright, Vitest-as-runner, JUnit, Allure) from here.

## Contents

| Area             | Description                                                                                                                 |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `identifiers.ts` | Branded platform IDs + shape helpers                                                                                        |
| `enums/`         | Execution, test, evidence, certification, approval, severity, priority, risk, automation, defect, coverage, readiness enums |
| `domain/`        | Canonical models including quality intelligence (`QualitySnapshot`, `DefectLink`, readiness assessments)                    |
| `services/`      | Interfaces only — manual, automation, quality intelligence, and certification engine service contracts                      |
| `events/`        | Past-tense event envelopes — **no Event Bus**                                                                               |
| `permissions/`   | `testing.*`, `quality.*`, `coverage.*`, `defects.*`, `release.*`, … catalogue constants                                     |
| `config/`        | `ApzTcmsConfiguration` + defaults factory                                                                                   |

## Usage

```typescript
import type {
  TestingService,
  DefectLinkService,
  QualityIntelligenceService,
  CoverageService,
} from "@apzhub/testing-contracts";
import {
  COVERAGE_METRIC_KINDS,
  DEFECT_STATUSES,
  QUALITY_PERMISSIONS,
  APZ_TCMS_PERMISSIONS,
} from "@apzhub/testing-contracts";
```

Dependency: `@apzhub/platform-service-contracts` (workspace) for `ServiceRequestContext` only.

## Explicit non-goals (APZTCMS-002/007/008)

- Database / ORM / migrations
- Service implementations (`@apzhub/testing-services`)
- API routes, UI, dashboards/charts, Jira/GitHub/ADO/GitLab sync
- Event Bus, notifications, AI runtime, CI/CD, binary result uploads

## Related documentation

- [APZ TCMS Foundation Architecture](../../docs/architecture/APZHUB-APZ-TCMS-Foundation-Architecture.md)
- [Service Contracts](../../docs/architecture/APZHUB-APZ-TCMS-Service-Contracts.md)
- [Domain Contracts](../../docs/architecture/APZHUB-APZ-TCMS-Domain-Contracts.md)
- [Permission Catalogue](../../docs/architecture/APZHUB-APZ-TCMS-Permission-Catalogue.md)
