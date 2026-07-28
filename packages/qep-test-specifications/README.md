# `@apzhub/qep-test-specifications`

APZ QEP Test Specifications bounded context — **ENG-050A** Domain + **ENG-050B** Infrastructure (ARCH-011).

| Field     | Value                                                             |
| --------- | ----------------------------------------------------------------- |
| Version   | **0.2.0**                                                         |
| Programme | **APZQEP-ENG-050B** — **IMPLEMENTED / AWAITING OWNER ACCEPTANCE** |
| Layers    | Domain · Application · Infrastructure                             |

## Exports

- `@apzhub/qep-test-specifications` — root + factories
- `./domain` — aggregate and repository port
- `./application` — commands / queries / DTO adapter
- `./infrastructure` — Postgres + in-memory persistence
- `./shared` — errors / pagination

## Docs

- Domain: [engine-domain](../../docs/products/apzqep/test-specifications/engine-domain/README.md)
- Infrastructure: [engine](../../docs/products/apzqep/test-specifications/engine/README.md)

## Scripts

```bash
pnpm --filter @apzhub/qep-test-specifications typecheck
pnpm --filter @apzhub/qep-test-specifications test
```

## STOP

Infrastructure complete. Workbench Architecture / Engineering / Certification **NOT AUTHORISED**.
