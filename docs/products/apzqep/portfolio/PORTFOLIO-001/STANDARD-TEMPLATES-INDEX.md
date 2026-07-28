# Standard Templates Index — APZQEP-PORTFOLIO-001

Points to the reusable pack structures refined through practice across the First Capability Wave, so a future Wave 2 programme can reuse a proven shape rather than reinvent one. This index does not itself define new templates — it points at the best existing example of each, as delivered.

## Governing standard (normative)

| Document                                                                                     | Purpose                                                                               |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [OES-000](../../../../engineering/oes/OES-000-Owner-Engineering-Specification-Standard.md)   | Engineering methodology — **FROZEN 1.0.0**                                            |
| [OES-001](../../../../engineering/oes/OES-001-Engineering-Writing-Standard.md)               | Engineering writing standard — **FROZEN 1.0.0**                                       |
| [OES-002](../../../../engineering/oes/OES-002-Engineering-Review-and-Acceptance-Standard.md) | Review & Acceptance, including Engineering Completion Review (ECR) — **FROZEN 1.1.0** |

## Owner Engineering Specification (OES) PART structure

Refined most fully in the Test Plans Workbench specification.

| Template pack                                                       | Use for                                              |
| ------------------------------------------------------------------- | ---------------------------------------------------- |
| [test-plans/OES-ENG-070A/](../../test-plans/OES-ENG-070A/README.md) | Full Workbench Engineering Specification, multi-part |
| [test-plans/OES-ARCH-014/](../../test-plans/OES-ARCH-014/README.md) | Workbench Architecture programme structure           |
| [test-plans/OES-ARCH-013/](../../test-plans/OES-ARCH-013/README.md) | Capability-level Architecture programme structure    |

## CERT pack structure (Component and Capability)

| Template pack                                                                                                 | Use for                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [test-plans/CERT-060B/](../../test-plans/CERT-060B/README.md)                                                 | Infrastructure Component Certification                                                                                                                                                                                                                                                                                                                                                                 |
| [test-plans/CERT-070A/](../../test-plans/CERT-070A/README.md)                                                 | Workbench Component Certification                                                                                                                                                                                                                                                                                                                                                                      |
| [test-plans/capability-certification/](../../test-plans/capability-certification/README.md)                   | Full Capability Certification pack — the richest example (ARCHITECTURE-REVIEW, ENGINEERING-REVIEW, SECURITY-REVIEW, PERFORMANCE-REVIEW, ACCESSIBILITY-REVIEW, OPERATIONAL-READINESS, TEST-RESULTS, QUALITY-GATES, KNOWN-LIMITATIONS, EVIDENCE-PACK, COMPLETION-REPORT, RELEASE-RECOMMENDATION, VERSION-PROMOTION, CERTIFICATION-REPORT, OWNER-SUMMARY, OWNER-ACCEPTANCE, RELEASE-NOTES, FREEZE-NOTICE) |
| [test-specifications/capability-certification/](../../test-specifications/capability-certification/README.md) | Capability Certification without a preceding component-certified Workbench                                                                                                                                                                                                                                                                                                                             |

## Engineering Change Request (ECR) — ahead of Owner Acceptance

| Pattern                                 | Reference                                                                                                                                                                                                                                                                   |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ECR evidence preceding Owner Acceptance | `20260728T071000Z-APZQEP-ENG-070A-ECR.json`, `20260727T163600Z-APZQEP-ENG-060A-ECR-PASS.json`, `20260727T193200Z-APZQEP-ENG-060B-ECR-PASS-WITH-CONDITIONS.json` in [docs/operations/evidence/portfolio-recert/](../../../../operations/evidence/portfolio-recert/README.md) |
| Rule                                    | Every ENG programme runs its ECR (per OES-002) before submitting for Owner Acceptance — do not submit for Acceptance without a recorded ECR outcome                                                                                                                         |

## FREEZE pack structure

| Template pack                                                             | Use for                                                                                                      |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| [test-plans/freeze/](../../test-plans/freeze/README.md)                   | Freeze as a separate Owner Decision, following a Capability Certification                                    |
| [test-specifications/freeze/](../../test-specifications/freeze/README.md) | Freeze pack with detailed Owner directives (source of truth, engineering restrictions, permitted activities) |

## Portfolio / handover pack structure (this pack)

| Template pack                                            | Use for                                                                                                              |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| [PORTFOLIO-001/](../PORTFOLIO-001/README.md) (this pack) | Multi-capability portfolio baseline and phase-completion handover — reuse this shape at the close of any future Wave |

## Practice notes (non-normative until formally absorbed)

| Note                                                                                                                     | Status                       |
| ------------------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| [OES-CERTIFICATION-INDEPENDENCE.md](../../../../engineering/oes/OES-CERTIFICATION-INDEPENDENCE.md)                       | Established practice         |
| [OES-CERTIFICATION-LEVELS.md](../../../../engineering/oes/OES-CERTIFICATION-LEVELS.md)                                   | Established practice         |
| [OES-COVERAGE-AND-BEHAVIOURAL-COMPLETENESS.md](../../../../engineering/oes/OES-COVERAGE-AND-BEHAVIOURAL-COMPLETENESS.md) | Candidate for OES-000 v1.1.0 |

## STOP

This index points to existing pack shapes only. It does not create a new template, amend a frozen OES document, or authorise use of any template ahead of a properly authorised programme.
