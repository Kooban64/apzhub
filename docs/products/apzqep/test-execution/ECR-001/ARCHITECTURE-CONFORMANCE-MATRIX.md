# Architecture Conformance Matrix — APZQEP-ECR-001

Authority: **APZQEP-ARCH-015** + ADR-0075…0086 (Accepted)

| ADR      | Theme                              | Conformance | Evidence                                                                      |
| -------- | ---------------------------------- | ----------- | ----------------------------------------------------------------------------- |
| ADR-0075 | TestExecution aggregate SoR        | ✅ PASS     | `domain/test-execution/test-execution.ts`                                     |
| ADR-0076 | Sealed immutable manifest          | ✅ PASS     | `manifest.ts`, ManifestSealer, prepare seal                                   |
| ADR-0077 | Boundary vs Test Runs              | ✅ PASS     | No Runs SoR coupling                                                          |
| ADR-0078 | Outcome derivation model           | ✅ PASS     | OutcomeDeriver / policies                                                     |
| ADR-0079 | Manual + automated unified         | ✅ PASS     | ExecutionMode + ingest path                                                   |
| ADR-0080 | Evidence references only           | ✅ PASS*    | associateEvidence; no blob SoR · *EvidenceAccessPort default-allow limitation |
| ADR-0081 | Observation ≠ defect               | ✅ PASS     | Observations only; no defect SoR                                              |
| ADR-0082 | Review finalisation                | ✅ PASS     | accept/reject + review entity                                                 |
| ADR-0083 | availableActions sole UI authority | ✅ PASS     | Application computer + Workbench contract tests                               |
| ADR-0084 | Ingestion trust boundary           | ✅ PASS     | ExternalIngestionService + IngestionPolicy                                    |
| ADR-0085 | Supersession corrections           | ✅ PASS     | supersedeExecution + policy                                                   |
| ADR-0086 | AI non-authoritative               | ✅ PASS     | No AI implementation                                                          |

**Architecture redesign:** none under ECR.  
**Architectural deviations requiring Owner stop:** none.
