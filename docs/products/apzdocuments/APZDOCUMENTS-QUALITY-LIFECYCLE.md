# APZ Documents — Quality Lifecycle

| Field     | Value                        |
| --------- | ---------------------------- |
| Product   | **APZ Documents**            |
| Slice     | APZ-DOCUMENTS-NATIVE-001-N04 |
| Status    | **IN FORCE**                 |
| Timestamp | 20260805T151500Z             |
| Baseline  | APZQEP Version 1.1 (frozen)  |

## Rule

Every engineering change to APZ Documents shall complete the APZQEP quality lifecycle.  
**No exceptions. No parallel process. No engine-native release path.**

## Lifecycle

```text
Backlog → Engineering → Quality Flow → Impact → Policy → Governance →
Decision → Evidence → Operational Review → Release → Operational Learning → Closed
```

## Product-specific gates

- Work companion framing preserved (no repository-first regression)
- Engine / provider identity remains invisible
- SoR: document metadata only; relationships by reference
