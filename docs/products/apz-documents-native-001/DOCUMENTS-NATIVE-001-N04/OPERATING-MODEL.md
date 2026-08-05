# Operating Model — APZ-DOCUMENTS-NATIVE-001-N04

| Field     | Value            |
| --------- | ---------------- |
| Status    | **IN FORCE**     |
| Timestamp | 20260805T151500Z |

## Rule

Every APZ Documents engineering change is managed through APZQEP. There is no parallel quality path and no engine-native release path for APZHUB Documents work.

```text
Source Change → Quality Flow → Impact → Policy → Decision Package →
Evidence → Operational Learning (when warranted) → Release (when shipping)
```

## Product posture

| Layer              | Owner                        | Notes                          |
| ------------------ | ---------------------------- | ------------------------------ |
| Product experience | APZ Documents / APZHUB       | Work companion after N-01…N-03 |
| Business services  | Document platform services   | Unchanged by N-04              |
| Integration        | Document storage (invisible) | Implementation detail only     |
| Quality            | APZQEP V1.1                  | Mandatory for every change     |

## Binding to ADOPT-001

| Concern                | Artefact                                                                                           |
| ---------------------- | -------------------------------------------------------------------------------------------------- |
| Friction in the moment | [FRICTION-LOG.md](../../apzqep/apzqep-adopt-001/FRICTION-LOG.md)                                   |
| Reality-taught insight | [OPERATIONAL-LEARNING-REGISTER.md](../../apzqep/apzqep-adopt-001/OPERATIONAL-LEARNING-REGISTER.md) |
| Cross-product patterns | [APZHUB-EMERGING-PORTFOLIO-PATTERNS.md](../../framework/APZHUB-EMERGING-PORTFOLIO-PATTERNS.md)     |
| Candidate improvements | [IMPROVEMENT-BACKLOG.md](../../apzqep/apzqep-adopt-001/IMPROVEMENT-BACKLOG.md)                     |

## Anti-patterns

- Building consumer attach wiring “while we’re here” without Owner Auth
- Inventing artificial releases only to exercise the pipeline
- Exposing storage/provider identity in product or release notes
- Treating deferred consumer integration as Documents product incompleteness
