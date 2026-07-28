# Evidence Pack — APZQEP-CERT-060B

| Field          | Value                                                                              |
| -------------- | ---------------------------------------------------------------------------------- |
| Programme      | APZQEP-CERT-060B                                                                   |
| Assurance JSON | `docs/operations/evidence/portfolio-recert/20260727T201000Z-APZQEP-CERT-060B.json` |

## Upstream evidence (cited)

| Artefact                | ID / Path                                                                        |
| ----------------------- | -------------------------------------------------------------------------------- |
| ENG-060B Acceptance     | `20260727T194000Z-APZQEP-ENG-060B-ACCEPTANCE.json`                               |
| ENG-060B ECR            | `20260727T193200Z-APZQEP-ENG-060B-ECR-PASS-WITH-CONDITIONS.json`                 |
| ENG-060B implementation | `20260727T182000Z-APZQEP-ENG-060B.json`                                          |
| CERT-060A Domain        | `20260727T174500Z-APZQEP-CERT-060A-ACCEPTANCE.json`                              |
| Infra Known Limitations | [../infrastructure/KNOWN-LIMITATIONS.md](../infrastructure/KNOWN-LIMITATIONS.md) |

## Quality re-verification (CERT)

| Gate                                             | Result      |
| ------------------------------------------------ | ----------- |
| `pnpm --filter @apzhub/qep-test-plans test`      | **99 PASS** |
| `pnpm --filter @apzhub/qep-test-plans typecheck` | **PASS**    |

## Status

```text
APZQEP-CERT-060B IMPLEMENTED / AWAITING OWNER CERTIFICATION DECISION
```
