# APZOR Governance Committees

> **Programme:** APZHUB-GOVERNANCE-001  
> **Date:** 2026-07-20

---

## Committee catalogue

| Committee                           | Purpose                                              | Typical chair              |
| ----------------------------------- | ---------------------------------------------------- | -------------------------- |
| **Architecture Review Board (ARB)** | Freeze integrity, ADR review, boundary violations    | Platform Owner / Architect |
| **Change Advisory Board (CAB)**     | Normal/Major Production changes; schedule risk       | Release Manager            |
| **Operational Review Board (ORB)**  | Incidents, capacity, ops KPIs, runbook gaps          | Platform Ops Lead          |
| **Security Committee**              | SecOps posture, access reviews, security incidents   | Security Lead              |
| **Risk Committee**                  | Enterprise + operational risk appetite and treatment | Risk Lead                  |
| **Product Council** (optional)      | Cross-product roadmap conflicts, portfolio honesty   | Product Management lead    |
| **Executive / Owner Gate**          | Baseline Acceptance, STOP exceptions, SemVer         | Owner                      |

## Architecture Review Board

- Reviews ADRs affecting freezes (SDK, Search, Notify, Workflow execute, Documents, etc.)
- Blocks Module→Connector / Service→Engine bypasses
- Does **not** replace Owner Approval for programmes

## Change Advisory Board

- Aligns with [CHANGE-GOVERNANCE.md](./CHANGE-GOVERNANCE.md) and ops Change Management
- Emergency changes: expedited + mandatory post-review

## Operational Review Board

- Reviews P1/P2 trends, backup drills, coexistence capacity
- Escalates Problems needing Owner programmes

## Security Committee

- Access / superadmin reviews
- Secret hygiene
- Security incident retrospectives

## Risk Committee

- Maintains enterprise risk view over Platform 1.1.0 PRWL
- Ensures marketing claims match Known Limitations

## Cadence

See [MEETING-CADENCE.md](./MEETING-CADENCE.md).
