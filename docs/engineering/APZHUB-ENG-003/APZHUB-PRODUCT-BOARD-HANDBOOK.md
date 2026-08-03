# APZHUB Product Board Handbook

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZHUB-ENG-003   |
| Timestamp | 20260803T075550Z |

## Role

The Product Board is the sole authority for:

- Production release GO / NO-GO
- General Availability designation
- Acceptance of independent audit recommendations
- Authorising package promotion / tagging / deployment authority (execution may be ops)
- Opening Version N+1 planning / engineering (via Owner Auth)

## What the Board is not

- Not a substitute for engineering
- Not a remediation team
- Not an auditor (consumes audit outputs)

## Mandatory Board artefacts

| Artefact                 | Purpose                                |
| ------------------------ | -------------------------------------- |
| Product Board Resolution | Formal decision record (e.g. PBR-\*)   |
| Release Decision         | GO / NO-GO with criteria checklist     |
| Release Authority        | What is authorised vs executed         |
| Version Approval         | Version designation                    |
| Lifecycle Status         | Product lifecycle state after decision |
| Evidence pack            | Timestamped Board review evidence      |

## Decision inputs (minimum)

Architecture · Engineering · Governance · Standards · Capabilities · Persistence · Security · Ops readiness · Documentation · Evidence · Regression · Performance · Accessibility · Packages · Known limitations · Issue register · Independent audit recommendation

## Historical integrity

Prior NO-GO audits remain immutable. Later GO decisions cite remediation + re-certification; they never rewrite history.

## Cadence (post-GA)

| Review               | Frequency |
| -------------------- | --------- |
| Product Board Review | Monthly   |
| Strategy Review      | Quarterly |

See [APZHUB-OPERATIONS-GOVERNANCE.md](./APZHUB-OPERATIONS-GOVERNANCE.md).
