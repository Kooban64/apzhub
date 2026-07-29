# Lifecycle Diagram

| Item           | Value                                                      |
| -------------- | ---------------------------------------------------------- |
| Document       | Full Engineering Lifecycle Diagram                         |
| Version        | **1.0.0**                                                  |
| Parent         | [../README.md](../README.md)                               |
| Normative text | [../ENGINEERING-LIFECYCLE.md](../ENGINEERING-LIFECYCLE.md) |

---

## Full lifecycle

```mermaid
flowchart TD
  A[Architecture] -->|Owner Architecture Acceptance| B[Engineering Specification]
  B -->|Owner ES Acceptance| C1[Wave 01 Repository]
  C1 -->|Owner Wave Review| C2[Wave 02 Domain]
  C2 -->|Owner Wave Review| C3[Wave 03 Application]
  C3 -->|Owner Wave Review| C4[Wave 04 Infrastructure and API]
  C4 -->|Owner Wave Review| C5[Wave 05 Workbench]
  C5 -->|Owner Waves Complete| D[ECR]
  D -->|Owner Engineering Acceptance| E[Certification]
  E -->|Owner Certification Decision| F[Freeze]
  F -->|Owner Freeze Acceptance| G[Release]
  G -->|Owner Release Decision| H{Availability}
  H -->|Limited Availability| I[Controlled Rollout]
  H -->|GA Approved| J[General Availability]
  I --> K[Maintenance]
  J --> K
  K -->|Owner EOL Declaration| L[End of Life]

  BC[[Build Contract + Continuous Evidence]] -.-> C1
  BC -.-> C2
  BC -.-> C3
  BC -.-> C4
  BC -.-> C5
  RM[[Risk Management]] -.-> D
  RM -.-> E
  RM -.-> F
  RM -.-> G
```

---

## Gate summary

| Gate                          | Controls               |
| ----------------------------- | ---------------------- |
| Owner Architecture Acceptance | ARCH → ES              |
| Owner ES Acceptance           | ES → Wave 01           |
| Owner Wave Review             | Wave N → Wave N+1      |
| Owner Engineering Acceptance  | ECR → Certification    |
| Owner Certification Decision  | Certification → Freeze |
| Owner Freeze Acceptance       | Freeze → Release       |
| Owner Release / GA Decision   | Release → Limited / GA |
| Owner EOL Declaration         | Maintenance → EOL      |

Agents **SHALL NOT** auto-progress gates. See [../OWNER-GOVERNANCE.md](../OWNER-GOVERNANCE.md).

---

## STOP

```text
LIFECYCLE DIAGRAM
ARCH → ES → WAVES → ECR → CERT → FREEZE → RELEASE → GA/MAINT → EOL
```
