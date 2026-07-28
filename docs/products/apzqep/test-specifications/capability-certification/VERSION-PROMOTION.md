# Version Promotion — `@apzhub/qep-test-specifications` 1.0.0

| Field                            | Value                                                                         |
| -------------------------------- | ----------------------------------------------------------------------------- |
| Package                          | `@apzhub/qep-test-specifications`                                             |
| From                             | **0.3.0** (Workbench delivery packaging; domain markers previously **0.2.0**) |
| To                               | **1.0.0**                                                                     |
| Date                             | 2026-07-27                                                                    |
| Authority                        | Owner Certification Programme Instruction APZQEP-CERT-050D                    |
| Breaking public contract changes | **None**                                                                      |
| Nature                           | CERT packaging alignment — not engineering                                    |

## Gates before promotion

| Gate                                                         | Result         |
| ------------------------------------------------------------ | -------------- |
| Typecheck                                                    | **PASS**       |
| Certification test set                                       | **PASS** (139) |
| Architecture boundaries                                      | **PASS**       |
| ENG-050C Owner Acceptance                                    | **PASS**       |
| ARCH-011 / ENG-050A / ENG-050B / OES-ARCH-012 / OES-ENG-050C | **PASS**       |
| All mandatory quality gates                                  | **PASS**       |

## Artefacts updated (promotion packaging)

| Artefact                                                               | Change                                               |
| ---------------------------------------------------------------------- | ---------------------------------------------------- |
| `packages/qep-test-specifications/package.json`                        | version **1.0.0**                                    |
| `packages/qep-test-specifications/src/index.ts`                        | `QEP_TEST_SPECIFICATIONS_VERSION` / programme marker |
| `packages/qep-test-specifications/src/architecture-boundaries.test.ts` | asserts **1.0.0**                                    |
| `modules/qep-test-specifications/module.yaml`                          | version **1.0.0** · programme APZQEP-CERT-050D       |

## SemVer rationale

Capability completion through ENG-050C plus Owner-directed capability certification (CERT-050D) justifies first stable major **1.0.0**. No breaking API redesign accompanied the promotion.

## Status note

Owner Certification Decision (2026-07-27) **approved** promotion to **1.0.0**. Owner Freeze Decision (2026-07-27) established **1.0.0 CERTIFIED / FROZEN** — see [../freeze/OWNER-FREEZE-DECISION.md](../freeze/OWNER-FREEZE-DECISION.md).
