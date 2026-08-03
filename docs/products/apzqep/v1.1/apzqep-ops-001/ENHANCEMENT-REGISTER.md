# ENHANCEMENT-REGISTER

| Field          | Value              |
| -------------- | ------------------ |
| Programme      | APZQEP-OPS-001     |
| Timestamp      | 20260803T072224Z   |
| Implementation | **NOT AUTHORISED** |

## Classification

Feedback and enhancement items use classes from [OPERATIONS-HANDBOOK.md](./OPERATIONS-HANDBOOK.md): Bug, Operational Issue, Documentation Issue, Training Issue, Enhancement, Future Capability, Architecture Observation.

## Required fields (enhancement)

| Field          | Required                     |
| -------------- | ---------------------------- |
| Identifier     | Yes (`ENH-001`…)             |
| Description    | Yes                          |
| Business value | Yes                          |
| Priority       | Yes (P1–P4 / Board)          |
| Impact         | Yes                          |
| Evidence       | Yes (link / metric / ticket) |

## Register

| ID      | Class                    | Description                                                          | Business value                | Priority | Impact          | Evidence               | Status                                    |
| ------- | ------------------------ | -------------------------------------------------------------------- | ----------------------------- | -------- | --------------- | ---------------------- | ----------------------------------------- |
| ENH-001 | Enhancement              | Permission-aware Cap shell navigation (hide unauthorised Cap routes) | Reduce 403 friction           | P3       | UX              | KI-001 / 152 residual  | Intake — not authorised                   |
| ENH-002 | Architecture Observation | Project membership attribute ACL                                     | Stronger project isolation UX | P3       | Security UX     | KI-002                 | Intake — not authorised                   |
| ENH-003 | Packaging                | Execute Cap A–F package promotion to 1.0.0 under release governance  | Align versions with GA        | P2       | Release hygiene | KI-003 / PBR authority | Intake — release process, not eng feature |

No row authorises implementation. Version 1.1 candidates also appear in [VERSION-1.1-INTAKE.md](./VERSION-1.1-INTAKE.md).
