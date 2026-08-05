# APZ Projects — Quality Lifecycle

| Field     | Value                       |
| --------- | --------------------------- |
| Product   | **APZ Projects**            |
| Slice     | APZ-PROJECTS-NATIVE-001-N04 |
| Status    | **IN FORCE**                |
| Timestamp | 20260805T074000Z            |
| Baseline  | APZQEP Version 1.1 (frozen) |

## Rule

Every engineering change to APZ Projects shall complete the APZQEP quality lifecycle.  
**No exceptions. No parallel process. No engine-native release path.**

## Lifecycle

```text
Backlog
   ↓
Engineering
   ↓
Quality Flow
   ↓
Impact
   ↓
Policy
   ↓
Governance
   ↓
Decision
   ↓
Evidence
   ↓
Operational Review
   ↓
Release
   ↓
Operational Learning
   ↓
Closed
```

## Stage duties

| Stage                | Must happen                                                                         |
| -------------------- | ----------------------------------------------------------------------------------- |
| Backlog              | Change is classified (defect / improvement / authorised enhancement / docs / ops)   |
| Engineering          | Implementation against frozen architecture; no feature expansion without Owner Auth |
| Quality Flow         | Flow opened; affected components identified                                         |
| Impact               | Impact evaluated across Projects UI, services, adapter (internal), platform         |
| Policy               | Applicable APZQEP policies evaluated and recorded                                   |
| Governance           | Required reviews / approvals obtained                                               |
| Decision             | Decision Package produced                                                           |
| Evidence             | Evidence pack captured under `evidence/`                                            |
| Operational Review   | Release readiness confirmed via checklists                                          |
| Release              | Labelled APZQEP release when shipping                                               |
| Operational Learning | Friction and lessons recorded (mandatory for completed releases)                    |
| Closed               | Flow closed; no open quality debt without recorded waiver                           |

## Binding

Canonical programme face: [../apz-projects-native-001/PROJECTS-NATIVE-001-N04/](../apz-projects-native-001/PROJECTS-NATIVE-001-N04/)  
ADOPT-001 registers: [../apzqep/apzqep-adopt-001/](../apzqep/apzqep-adopt-001/)
