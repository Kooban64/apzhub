# APZ TCMS — Automation Ingestion Architecture

**Milestone:** APZTCMS-007  
**Packages:** contracts **0.4.0**, persistence **0.5.0**, services **0.3.0**

---

## Purpose

APZ TCMS is the **System of Record** for automated test results. External engines (Vitest, Playwright, JUnit, …) **produce** artefacts; TCMS **ingests, validates, normalizes, and links** them. TCMS never executes frameworks.

---

## Pipeline

```text
Provider payload
      │
      ▼
AutomationResultAdapter (parse only)
      │
      ▼
AutomationNormalizationService
      │
      ▼
AutomationValidationService  (schema, duplicates, permissions, tenant/org)
      │
      ▼
AutomationImportService
      ├─ persist import + automated execution + runs/results
      ├─ AutomationEvidenceService (metadata; EvidenceStorageProvider)
      ├─ AutomationTraceabilityService
      ├─ AutomationCoverageService (supplied summaries only)
      ├─ AutomationHistoryService (immutable)
      └─ DomainEventCollector (no Event Bus)
```

Factory: `createAutomationIngestionServices(deps)`  
Combined: `createTestingDomainServices(deps)` → manual + `automation`  
`createManualTestingServices` remains backward compatible.

---

## Services

| Service                                     | Role                                    |
| ------------------------------------------- | --------------------------------------- |
| `AutomationAdapterRegistry`                 | Pluggable adapters                      |
| `AutomationNormalizationService`            | Canonical statuses                      |
| `AutomationValidationService`               | Schema / duplicate / authz gates        |
| `AutomationImportService`                   | Orchestrate import / reimport / correct |
| `AutomationResultService`                   | Query imported executions/runs          |
| `AutomationEvidenceService`                 | Evidence metadata from imports          |
| `AutomationTraceabilityService`             | Bidirectional links                     |
| `AutomationHistoryService`                  | Immutable import history                |
| `AutomationCoverageService`                 | Ingest coverage summaries               |
| `AutomationCertificationPreparationService` | Inputs only (`isDecision: false`)       |

---

## Explicit exclusions

HTTP, Workbench UI, workers, schedulers, CI/CD, Event Bus, runners, Allure server, cloud binary SDKs.

---

## Related

[Adapter Guide](./APZHUB-APZ-TCMS-Automation-Adapter-Guide.md) · [Canonical Model](./APZHUB-APZ-TCMS-Canonical-Automation-Model.md) · [Normalization Rules](./APZHUB-APZ-TCMS-Normalization-Rules.md) · [Coverage Ingestion Guide](./APZHUB-APZ-TCMS-Coverage-Ingestion-Guide.md)
