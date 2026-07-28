# Architecture Decision Records — APZQEP-ARCH-007

| ADR            | Decision                                                                                             | Status                  |
| -------------- | ---------------------------------------------------------------------------------------------------- | ----------------------- |
| ADR-QEP-TR-001 | Traceability is a separate bounded capability, not a Requirements submodule owning Requirements data | Accepted (architecture) |
| ADR-QEP-TR-002 | Requirements Relationships (ARCH-005) remain Requirements SoR; Traceability consumes via projection  | Accepted (architecture) |
| ADR-QEP-TR-003 | Cross-domain lineage uses Trace Links with governed Trace Types                                      | Accepted (architecture) |
| ADR-QEP-TR-004 | Coverage and impact are derived read models, never SoR                                               | Accepted (architecture) |
| ADR-QEP-TR-005 | Workbench reuses ARCH-006 grammar; list/matrix first; graphs not required by this architecture       | Accepted (architecture) |
| ADR-QEP-TR-006 | AI/MCP are consumers only; cannot own authoritative Trace facts                                      | Accepted (architecture) |
| ADR-QEP-TR-007 | Baseline/CV context must be explicit; historical views immutable                                     | Accepted (architecture) |
| ADR-QEP-TR-008 | Endpoint catalogue is extensible without Trace model redesign                                        | Accepted (architecture) |
| ADR-QEP-TR-009 | Certification must not be inferred from Trace connectivity alone                                     | Accepted (architecture) |
| ADR-QEP-TR-010 | External imports require Trace Type mapping via Integration adapters                                 | Accepted (architecture) |

Detail for each decision is embodied in [TRACEABILITY-ARCHITECTURE.md](./TRACEABILITY-ARCHITECTURE.md).
