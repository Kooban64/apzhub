# APZHUB Problem Management

> **Programme:** APZHUB-OPERATIONS-001  
> **Date:** 2026-07-20

---

## Definition

A **problem** is the unknown or known root cause of one or more incidents. Problem Management reduces recurrence.

## Triggers

- Recurring P2/P3 incidents on the same service
- Post-incident review action items
- Known Limitations that cause operational friction (track; do not “fix” STOP items without Owner Approval)
- Capacity / performance trends

## Lifecycle

```text
Identify → Log Problem → Root cause analysis → Workaround → Structural fix (Change) → Review → Close
```

## Rules

1. Workarounds are documented in runbooks.
2. Structural fixes require Change Management (and engineering programme if code).
3. Problems that require freeze exceptions need **ADR + Owner Approval**.
4. Known Limitations (PRWL) are not automatically Problems — they are accepted constraints unless Owner reopens.

## Outputs

| Artefact        | Purpose                           |
| --------------- | --------------------------------- |
| Problem record  | Cause, services, linked incidents |
| Known Error     | Workaround for L1                 |
| Change request  | Permanent fix                     |
| Ops Risk update | If residual risk remains          |
