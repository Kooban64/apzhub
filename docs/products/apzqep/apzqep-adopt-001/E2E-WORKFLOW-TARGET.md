# End-to-End Workflow Target — APZQEP-ADOPT-001

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-ADOPT-001 |
| Status    | **TARGET**       |
| Timestamp | 20260804T185200Z |

## Pipeline (dogfood every change — full path, no shortcuts)

```text
Source Change
      ↓
Trigger
      ↓
Quality Flow
      ↓
Impact
      ↓
Policy
      ↓
Governance
      ↓
Approval
      ↓
Decision
      ↓
Evidence
      ↓
Executive Projection
      ↓
Operational Package
      ↓
Workspace
      ↓
Release
```

Start with a **tiny** change — see [WEEK-1-EXERCISE.md](./WEEK-1-EXERCISE.md).

## Automated target (once, for real)

Developer pushes code. APZQEP should:

```text
Receive source change
        ↓
Open Quality Flow
        ↓
Determine impact
        ↓
Select quality activities
        ↓
Coordinate Playwright
        ↓
Collect evidence
        ↓
Evaluate governance
        ↓
Generate Decision Package
        ↓
Executive projection
        ↓
Release recommendation
```

Do that **once** end-to-end on real APZHUB code. Record evidence under
`evidence/apzqep-adopt-001/`. Gaps become friction log entries — not silent
architecture reopenings.

## Learning questions (expected)

| Question                                              | Where answer comes from |
| ----------------------------------------------------- | ----------------------- |
| CSS-only change — run everything?                     | Operational use         |
| Docs-only change — skip automation?                   | Operational use         |
| Two PRs touch same service — how does impact combine? | Operational use         |

Answers feed [FRICTION-LOG.md](./FRICTION-LOG.md),
[OPERATIONAL-LEARNING-REGISTER.md](./OPERATIONAL-LEARNING-REGISTER.md), and
(only after patterns emerge) [IMPROVEMENT-BACKLOG.md](./IMPROVEMENT-BACKLOG.md).

Every run ends with: **Would I release this again the same way?**
