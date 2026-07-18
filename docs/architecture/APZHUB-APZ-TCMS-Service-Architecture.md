# APZ TCMS — Manual Service Architecture

**Milestone:** APZTCMS-004  
**Package:** `@apzhub/testing-services` **0.1.0**

## Layering

```
ServiceRequestContext
  → Manual Testing Domain Services (@apzhub/testing-services)
    → RepositoryContext + TestingPersistence
      → PostgreSQL / in-memory stores
```

Modules and HTTP never call persistence or engines directly. Services own business rules, lifecycle transitions, relationship integrity, and domain events (collector only).

## Factory

`createManualTestingServices({ persistence, events?, now?, id? })` wires all twelve services and a shared `DomainEventCollector`.

## Service catalogue

1. `requirements` — RequirementService
2. `testPlans` — TestPlanService
3. `testSuites` — TestSuiteService
4. `testCases` — TestCaseService
5. `manualExecutions` — ManualExecutionService
6. `evidence` — EvidenceService (metadata)
7. `approvals` — ApprovalService
8. `traceability` — TraceabilityService
9. `regression` — RegressionService
10. `risks` — RiskService
11. `certificationPreparation` — CertificationPreparationService
12. `releaseReadiness` — ReleaseReadinessService

Legacy monolithic `TestingService` / `ExecutionService` contracts remain in `@apzhub/testing-contracts` for compatibility; APZTCMS-004 implements the named domain services above.

## Events

Mutations call `DomainEventCollector.record(...)` with past-tense types. **No Event Bus.**

## Related

- [Manual Testing Domain](./APZHUB-APZ-TCMS-Manual-Testing-Domain.md)
- [Lifecycle Guide](./APZHUB-APZ-TCMS-Lifecycle-Guide.md)
