# Traceability Engine

Derives the chain:

```
Requirement --explicit--> Suite
                       → Execution Plan
                       → Execution Session
                       → Execution Results
                       → Evidence
                       → Defects
                       → Verification (derived status)
```

Links are bidirectional where appropriate. Cap C/D artefacts are never mutated. Explicit links are only Requirement ↔ Suite.
