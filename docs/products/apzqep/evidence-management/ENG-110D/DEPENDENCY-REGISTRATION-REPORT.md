# Dependency Registration Report — APZQEP-ENG-110D

| Registry                | Location                                    | Activated |
| ----------------------- | ------------------------------------------- | --------- |
| Persistence placeholder | `EVIDENCE_PERSISTENCE_REGISTRY_PLACEHOLDER` | **false** |
| Application factory     | `EVIDENCE_APPLICATION_REGISTRY_PLACEHOLDER` | **false** |

`createEvidenceApplicationServices({ uow, storage, clock, ids })` wires orchestration. Callers supply working ports (tests use in-memory doubles).
