# Operating Model — APZ-PROJECTS-NATIVE-001-N04

| Field     | Value            |
| --------- | ---------------- |
| Status    | **IN FORCE**     |
| Timestamp | 20260805T074000Z |

## Rule

Every APZ Projects engineering change is managed through APZQEP. There is no parallel quality path and no engine-native release path for APZHUB Projects work.

```text
Source Change
      ↓
Quality Flow
      ↓
Impact
      ↓
Policy
      ↓
Decision Package
      ↓
Evidence
      ↓
Operational Learning (when warranted)
      ↓
Release (when shipping)
```

## Product posture

| Layer              | Owner                        | Notes                      |
| ------------------ | ---------------------------- | -------------------------- |
| Product experience | APZ Projects / APZHUB        | Native after N-01…N-03     |
| Business services  | Projects platform services   | Unchanged by N-04          |
| Integration        | Projects adapter (invisible) | Implementation detail only |
| Quality            | APZQEP V1.1                  | Mandatory for every change |

## Binding to ADOPT-001

| Concern                | Artefact                                                                                           |
| ---------------------- | -------------------------------------------------------------------------------------------------- |
| Friction in the moment | [FRICTION-LOG.md](../../apzqep/apzqep-adopt-001/FRICTION-LOG.md)                                   |
| Reality-taught insight | [OPERATIONAL-LEARNING-REGISTER.md](../../apzqep/apzqep-adopt-001/OPERATIONAL-LEARNING-REGISTER.md) |
| Cross-product patterns | [APZHUB-EMERGING-PORTFOLIO-PATTERNS.md](../../framework/APZHUB-EMERGING-PORTFOLIO-PATTERNS.md)     |
| Candidate improvements | [IMPROVEMENT-BACKLOG.md](../../apzqep/apzqep-adopt-001/IMPROVEMENT-BACKLOG.md)                     |
| Release labelling      | Next real change → next free APZQEP release number when it ships                                   |

## Anti-patterns

- Building features “while we’re here” without Owner Auth
- Inventing artificial releases only to exercise the pipeline
- Opening APZQEP architecture work from a single Projects friction event
- Exposing engine/adapter identity in product or release notes
- Promoting Emerging Portfolio Patterns into platform work before the threshold
