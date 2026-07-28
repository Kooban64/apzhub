# Version Promotion — `@apzhub/qep-verification` 1.0.0

| Field                            | Value                                                      |
| -------------------------------- | ---------------------------------------------------------- |
| Package                          | `@apzhub/qep-verification`                                 |
| From                             | **0.3.0**                                                  |
| To                               | **1.0.0**                                                  |
| Date                             | 2026-07-26                                                 |
| Authority                        | Owner Certification Programme Instruction APZQEP-CERT-040D |
| Breaking public contract changes | **None**                                                   |

## Gates before promotion

| Gate                                                 | Result         |
| ---------------------------------------------------- | -------------- |
| Typecheck                                            | **PASS**       |
| Certification test set                               | **PASS** (161) |
| Architecture boundaries                              | **PASS**       |
| ENG-040C Owner Acceptance recorded                   | **PASS**       |
| ARCH-009 / ARCH-010 / ENG-040A / ENG-040B Acceptance | **PASS**       |
| All mandatory quality gates                          | **PASS**       |

## Artefacts updated (promotion)

| Artefact                                                        | Change                                         |
| --------------------------------------------------------------- | ---------------------------------------------- |
| `packages/qep-verification/package.json`                        | version **1.0.0**                              |
| `packages/qep-verification/src/index.ts`                        | `QEP_VERIFICATION_VERSION` / programme marker  |
| `packages/qep-verification/src/architecture-boundaries.test.ts` | asserts **1.0.0**                              |
| `modules/qep-verification/module.yaml`                          | version **1.0.0** · programme APZQEP-CERT-040D |

## SemVer rationale

Capability completion through ENG-040C plus Owner-directed capability certification (CERT-040D) justifies first stable major **1.0.0** as the Verification module baseline. No breaking API redesign accompanied the promotion. Prior **0.3.0** was Workbench presentation on the accepted ENG-040B backend.

## Status note

Package markers record **CERTIFIED BASELINE 1.0.0 AWAITING OWNER ACCEPTANCE**. Freeze becomes binding when Owner Accepts CERT-040D.
