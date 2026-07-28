# Evidence Pack — APZQEP-REQ-001

## Certification evidence

| Artefact                      | Path                                                                             |
| ----------------------------- | -------------------------------------------------------------------------------- |
| Capability certification JSON | `docs/operations/evidence/portfolio-recert/20260726T110000Z-APZQEP-REQ-001.json` |
| Release evidence folder       | `docs/releases/apzqep/requirements/1.0.0/`                                       |
| Certification pack            | `docs/products/apzqep/requirements/capability-certification/`                    |

## Upstream acceptance evidence (cited)

| Programme              | Evidence                                                      |
| ---------------------- | ------------------------------------------------------------- |
| ENG-020D               | `20260725T160000Z-APZQEP-ENG-020D.json` · `…-ACCEPTANCE.json` |
| ENG-020E               | `20260726T080000Z-APZQEP-ENG-020E-ACCEPTANCE.json`            |
| ARCH-005               | `20260726T075000Z-APZQEP-ARCH-005-ACCEPTANCE.json`            |
| ENG-020F Part 1        | `…PART1-ACCEPTANCE.json`                                      |
| ENG-020F Part 2        | `20260726T092900Z-APZQEP-ENG-020F-PART2-ACCEPTANCE.json`      |
| ARCH-006               | `20260726T095000Z-APZQEP-ARCH-006-ACCEPTANCE.json`            |
| ENG-020F Part 3 impl   | `20260726T100000Z-APZQEP-ENG-020F-PART3.json`                 |
| ENG-020F Part 3 accept | `20260726T103000Z-APZQEP-ENG-020F-PART3-ACCEPTANCE.json`      |

All under `docs/operations/evidence/portfolio-recert/`.

## Validation executed this programme

| Command / suite                                    | Result     |
| -------------------------------------------------- | ---------- |
| `pnpm --filter @apzhub/qep-requirements typecheck` | PASS       |
| `pnpm --filter @apzhub/qep-requirements test`      | PASS (105) |
| Relationships + Baselines Workbench Vitest         | PASS (19)  |
