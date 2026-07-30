# Package Structure Report — APZQEP-ENG-110A

## Package identity

| Field   | Value                              |
| ------- | ---------------------------------- |
| Name    | `@apzhub/qep-evidence`             |
| Version | `0.0.0`                            |
| Path    | `packages/qep-evidence/`           |
| Module  | `modules/qep-evidence/module.yaml` |

## Layout

```text
packages/qep-evidence/
  package.json
  tsconfig.json
  README.md
  src/
    index.ts
    architecture-boundaries.test.ts
    domain/          aggregates entities value-objects services events specifications factories repositories
    application/     ports services commands queries policy
    infrastructure/  storage audit policy persistence events
    shared/contracts/
    api/models/
    presentation/
  tests/             unit domain application integration api security lifecycle integrity performance playwright
```

## Exports

`.` · `./domain` · `./application` · `./infrastructure` · `./shared` · `./api` · `./presentation`

Aligns with OES-ENG-091A PART-01 layer ownership.
