# Analysis Model — APZQEP-ARCH-008

> Companion extract. Authoritative detail: [TRACEABILITY-WORKBENCH-ARCHITECTURE.md](./TRACEABILITY-WORKBENCH-ARCHITECTURE.md) §16.

## Purpose

Define interaction slots for future analysis capabilities. **No calculations** under ARCH-008.

## Views (presentation only)

| View                   | Intent                                | Truth owner                     |
| ---------------------- | ------------------------------------- | ------------------------------- |
| Coverage               | Indicators on Matrix / Explorer       | Future Coverage Engine          |
| Impact                 | Neighbourhood / scoring presentation  | Future Impact Engine            |
| Certification lineage  | Chain navigation                      | Trace Links + Certification SoR |
| Evidence lineage       | Chain navigation                      | Trace Links + Evidence SoR      |
| Missing traces         | Expected-absent cells (future policy) | Policy + Trace queries          |
| Orphan / broken traces | Unresolved endpoints                  | Endpoint resolver               |
| Potential cycles       | Warning inbox                         | Traceability domain             |
| Duplicate traces       | Candidate list                        | Traceability domain             |
| Warnings               | Aggregate attention                   | Traceability + Attention Engine |

## Boundary

Workbench must not store derived Coverage or Impact truth on Trace Link aggregates (ARCH-007).
