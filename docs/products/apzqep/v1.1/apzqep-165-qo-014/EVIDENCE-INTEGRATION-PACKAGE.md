# Evidence Integration Package

Immutable system of record for **evidence integration only**.

## Contents (references)

- Quality Flow
- Impact Graph
- Governance Decision
- Approval Bundle
- Decision Package
- Automation Coordination Package
- Source Change Package
- Quality Intelligence Enrichment Package
- Evidence references (opaque)
- Report references (opaque)
- Audit references (opaque)
- Traceability metadata

## Guards

| Flag               | Value   |
| ------------------ | ------- |
| `referencesOnly`   | `true`  |
| `copiesEvidence`   | `false` |
| `reportIsEvidence` | `false` |

Packages never embed artefact bodies. Supersession creates a new package; history is preserved.
