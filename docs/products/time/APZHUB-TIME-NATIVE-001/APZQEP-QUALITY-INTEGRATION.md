# APZQEP Quality Integration — APZ Time

| Field     | Value                                         |
| --------- | --------------------------------------------- |
| Programme | APZHUB-TIME-NATIVE-001                        |
| Status    | **IN FORCE**                                  |
| Timestamp | 20260805T033900Z                              |
| Baseline  | APZQEP Version 1.1                            |
| Slice     | [TIME-NATIVE-001-A04](./TIME-NATIVE-001-A04/) |

## Rule

Every APZ Time change is managed through APZQEP:

```text
Source → Quality Flow → Decision → Evidence → Release
```

No dual quality process. No engine-native release path for APZHUB Time work.

## Practice (A04)

- Use [CHANGE-CHECKLIST.md](./TIME-NATIVE-001-A04/CHANGE-CHECKLIST.md) for every change
- Measure behaviour, not features — [BEHAVIOUR-MEASURES.md](./TIME-NATIVE-001-A04/BEHAVIOUR-MEASURES.md)
- Capture Engineering Friction and Operational Learning in ADOPT-001 registers
- Label real Time shipments as APZQEP releases when they ship
- Do not open APZQEP-170 from Time friction alone — promote patterns first
