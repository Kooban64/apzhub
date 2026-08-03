# ENTERPRISE-COMPLIANCE-MATRIX

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZHUB-ADOPT-001 |
| Timestamp | 20260803T084305Z |

Legend: NS=NOT STARTED · IN=INITIAL · PA=PARTIAL · SU=SUBSTANTIAL · CO=COMPLETE · EI=Evidence Insufficient  
Products: PR=Projects · SU=Support · TI=Time · DO=Documents · AN=Analytics · WF=Workflow · LA=Law Platform  
Detail per product: [assessments/](./assessments/)

## Summary ratings

| Assessment area             | PR  | SU  | TI  | DO  | AN  | WF  | LA  |
| --------------------------- | --- | --- | --- | --- | --- | --- | --- |
| Engineering Governance      | PA  | PA  | PA  | PA  | PA  | PA  | PA  |
| Product Board Governance    | NS  | NS  | NS  | NS  | NS  | NS  | NS  |
| Architecture                | SU  | SU  | PA  | SU  | IN  | SU  | SU  |
| Documentation               | SU  | SU  | SU  | SU  | PA  | SU  | SU  |
| ES Standards Compliance     | EI  | EI  | EI  | EI  | EI  | EI  | EI  |
| Testing Standard Compliance | PA  | PA  | PA  | PA  | PA  | PA  | SU  |
| Certification Readiness     | PA  | PA  | PA  | PA  | PA  | PA  | PA  |
| Engineering Spec Usage      | EI  | EI  | EI  | EI  | EI  | EI  | EI  |
| Evidence Lifecycle          | PA  | PA  | PA  | PA  | PA  | PA  | PA  |
| Release Governance          | SU  | SU  | SU  | SU  | EI  | EI  | SU  |
| Operations Governance       | IN  | IN  | IN  | IN  | IN  | IN  | IN  |
| Security Governance         | EI  | EI  | EI  | SU  | EI  | SU  | SU  |
| Operational Readiness       | PA  | PA  | PA  | PA  | PA  | PA  | PA  |
| Support Readiness           | EI  | PA  | EI  | EI  | EI  | EI  | EI  |
| Version Management          | SU  | PA  | SU  | SU  | EI  | EI  | SU  |
| Release Management          | SU  | SU  | SU  | SU  | EI  | EI  | SU  |
| Risk Management             | PA  | PA  | PA  | PA  | PA  | PA  | PA  |
| Dependency Management       | PA  | PA  | PA  | PA  | PA  | PA  | PA  |
| Programme Governance        | PA  | PA  | PA  | PA  | PA  | PA  | PA  |
| Operational Monitoring      | EI  | EI  | EI  | EI  | EI  | EI  | EI  |
| Enhancement Governance      | EI  | EI  | EI  | EI  | EI  | EI  | EI  |

## Cell pattern (all products — common)

| Status pattern                    | Evidence                                                | Gap                         | Recommendation                                                            |
| --------------------------------- | ------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------- |
| Product Board = NS                | No PBR-* / PRODUCT-STATUS found                         | ENG-003 Board face missing  | Phase 1: establish PRODUCT-STATUS + Board standing                        |
| ES / Spec = EI                    | No Baseline 1.2 / ES-001…003 product citation pack      | Cannot prove ES conformance | Phase 1–2: citation + conformance matrix (docs only until eng authorised) |
| Ops Monitoring / Enhancement = EI | No OPS-001-class product programme                      | Ops-led model not adopted   | Phase 4: product ops governance                                           |
| Release = SU or EI                | Register ACCEPTED vs README Awaiting Acceptance (AN/WF) | Authority inconsistency     | Resolve before Phase 2                                                    |

APZQEP excluded (REFERENCE). No COMPLETE/REFERENCE cells assigned to adoption candidates.
