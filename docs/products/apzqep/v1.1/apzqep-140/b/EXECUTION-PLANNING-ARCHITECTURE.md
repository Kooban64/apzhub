# Execution Planning Architecture — APZQEP-140-B

```text
Execution Planning Workspace
  → ExecutionPlanApplicationService
    → ExecutionPlanRepository (in-memory LA)
    → SuiteReferencePort → Cap A Suite SoR
    → Domain events → Event Platform → QKI / Notifications
    → Command Registry
```

Frozen `@apzhub/qep-test-plans` is **not** Cap B SoR. Cap C owns execution performance.
