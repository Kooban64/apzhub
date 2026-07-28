# Version Promotion Report — `@apzhub/qep-requirements` 1.0.0

| Field | Value |
| ----- | ----- |
| Package | `@apzhub/qep-requirements` |
| From | **0.10.0** |
| To | **1.0.0** |
| Date | 2026-07-26 |
| Authority | Owner Programme Instruction APZQEP-REQ-001 |
| Breaking public contract changes | **None** |

## Gates before promotion

| Gate | Result |
| ---- | ------ |
| Typecheck | PASS |
| Package tests (105) | PASS |
| Workbench component tests (Relationships + Baselines) | PASS |
| Architecture boundaries | PASS |
| ENG-020F acceptance recorded | PASS |
| Certification review complete | PASS |

## Artefacts updated

| Artefact | Change |
| -------- | ------ |
| `packages/qep-requirements/package.json` | version **1.0.0** |
| `packages/qep-requirements/src/index.ts` | `QEP_REQUIREMENTS_VERSION` / programme marker |
| `packages/qep-requirements/src/architecture-boundaries.test.ts` | asserts **1.0.0** |
| `modules/qep-requirements/module.yaml` | version **1.0.0** |

## SemVer rationale

Minor capability completion through ENG-020F Part 3 plus Owner-directed capability certification justifies first stable major **1.0.0** as the frozen Requirements module baseline. No breaking API redesign accompanied the promotion.
