# APZQEP Quality Integration — APZ Time

| Field     | Value                  |
| --------- | ---------------------- |
| Programme | APZHUB-TIME-NATIVE-001 |
| Status    | **STARTED**            |
| Timestamp | 20260804T191500Z       |
| Baseline  | APZQEP Version 1.1     |

## Rule

Every APZ Time change is managed through APZQEP:

```text
Source → Quality Flow → Decision → Evidence → Release
```

No dual quality process. No engine-native release path for APZHUB Time work.

## Practice under ADOPT-001

- Label Time changes as APZQEP releases when they ship
- Capture Engineering Friction and Operational Learning in ADOPT-001 registers
- Do not open APZQEP-170 from Time friction alone — promote patterns first
