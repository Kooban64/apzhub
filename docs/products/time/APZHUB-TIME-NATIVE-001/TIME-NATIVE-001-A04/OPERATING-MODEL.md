# Operating Model — TIME-NATIVE-001-A04

| Field     | Value            |
| --------- | ---------------- |
| Status    | **IN FORCE**     |
| Timestamp | 20260805T033900Z |

## Rule

Every APZ Time engineering change is managed through APZQEP. There is no parallel quality path and no engine-native release path for APZHUB Time work.

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

| Layer              | Owner                     | Notes                      |
| ------------------ | ------------------------- | -------------------------- |
| Product experience | APZ Time / APZHUB         | Native after A01–A03       |
| Business services  | Time platform services    | Unchanged by A04           |
| Integration        | Kimai adapter (invisible) | Implementation detail only |
| Quality            | APZQEP V1.1               | Mandatory for every change |

## Binding to ADOPT-001

| Concern                | Artefact                                                                                              |
| ---------------------- | ----------------------------------------------------------------------------------------------------- |
| Friction in the moment | [FRICTION-LOG.md](../../../apzqep/apzqep-adopt-001/FRICTION-LOG.md)                                   |
| Reality-taught insight | [OPERATIONAL-LEARNING-REGISTER.md](../../../apzqep/apzqep-adopt-001/OPERATIONAL-LEARNING-REGISTER.md) |
| Candidate improvements | [IMPROVEMENT-BACKLOG.md](../../../apzqep/apzqep-adopt-001/IMPROVEMENT-BACKLOG.md)                     |
| Release labelling      | Next real change → **APZQEP Release 0001** (or next free number) when it ships                        |

## Anti-patterns

- Building features “while we’re here” without Owner Auth
- Inventing artificial releases only to exercise the pipeline
- Opening APZQEP-170 from a single Time friction event
- Exposing engine/adapter identity in product or release notes
