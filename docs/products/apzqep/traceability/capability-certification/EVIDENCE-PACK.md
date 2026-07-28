# Evidence Pack — APZQEP-TRACE-001

## Certification evidence

| Artefact                     | Path                                                          |
| ---------------------------- | ------------------------------------------------------------- |
| Certification pack           | `docs/products/apzqep/traceability/capability-certification/` |
| Authoritative report         | `TRACEABILITY-CERTIFICATION.md`                               |
| Release evidence folder      | `docs/releases/apzqep/traceability/1.0.0/`                    |
| Engineering evidence summary | [ENGINEERING-EVIDENCE.md](./ENGINEERING-EVIDENCE.md)          |

> Portfolio JSON for TRACE-001 Acceptance is filed **after** Owner Acceptance (not pre-created as ACCEPTED).

## Upstream acceptance evidence (cited)

| Programme       | Evidence (under `docs/operations/evidence/portfolio-recert/`)                                            |
| --------------- | -------------------------------------------------------------------------------------------------------- |
| ARCH-007        | `20260726T123000Z-APZQEP-ARCH-007.json` · `20260726T130000Z-APZQEP-ARCH-007-ACCEPTANCE.json`             |
| ENG-030A Part 1 | `20260726T133000Z-APZQEP-ENG-030A-PART1.json` · `20260726T140000Z-APZQEP-ENG-030A-PART1-ACCEPTANCE.json` |
| ENG-030A Part 2 | `20260726T141500Z-APZQEP-ENG-030A-PART2.json` · `20260726T153000Z-APZQEP-ENG-030A-PART2-ACCEPTANCE.json` |
| ARCH-008        | `20260726T153500Z-APZQEP-ARCH-008.json` · `20260726T154500Z-APZQEP-ARCH-008-ACCEPTANCE.json`             |
| ENG-030C        | `20260726T155000Z-APZQEP-ENG-030C.json` · `20260726T164000Z-APZQEP-ENG-030C-ACCEPTANCE.json`             |

## Validation executed for certification

| Command / suite                                    | Result        |
| -------------------------------------------------- | ------------- |
| `pnpm --filter @apzhub/qep-traceability typecheck` | **PASS**      |
| `pnpm --filter @apzhub/qep-traceability test`      | **PASS** (52) |
| UI + package combined Vitest                       | **PASS** (65) |
| Architecture boundary tests                        | **PASS**      |

## Programme documentation evidence

| Pack                    | Path                                                           |
| ----------------------- | -------------------------------------------------------------- |
| Engine domain (Part 1)  | `docs/products/apzqep/traceability/engine-domain/`             |
| Engine backend (Part 2) | `docs/products/apzqep/traceability/engine/`                    |
| Workbench (ENG-030C)    | `docs/products/apzqep/traceability/workbench/`                 |
| ARCH-007                | `docs/products/apzqep/architecture/requirements-traceability/` |
| ARCH-008                | `docs/products/apzqep/architecture/traceability-workbench/`    |
