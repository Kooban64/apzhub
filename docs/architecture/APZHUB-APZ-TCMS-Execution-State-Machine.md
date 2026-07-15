# APZ TCMS — Execution State Machine

**Milestone:** APZTCMS-006  
**Source:** `packages/testing-services/src/lifecycle/state-machines.ts`

---

## Canonical states

| State          | Role                     |
| -------------- | ------------------------ |
| `draft`        | Created, not assigned    |
| `assigned`     | Tester/reviewer assigned |
| `ready`        | Ready to start           |
| `in_progress`  | Active execution         |
| `paused`       | Temporarily suspended    |
| `blocked`      | Cannot proceed           |
| `completed`    | Steps finished           |
| `under_review` | Awaiting approval        |
| `approved`     | Review accepted          |
| `rejected`     | Review rejected          |
| `cancelled`    | Abandoned                |
| `archived`     | Soft-closed terminal     |

**Legacy aliases** (canonicalize on compare): `planned`→`draft`, `queued`→`assigned`, `aborted`→`cancelled`, `failed`→`blocked`.

---

## Transition rules (summary)

```text
draft        → assigned | cancelled | archived
assigned     → ready | draft | cancelled | in_progress
ready        → in_progress | assigned | cancelled
in_progress  → paused | blocked | completed | cancelled
paused       → in_progress | blocked | cancelled
blocked      → in_progress | cancelled
completed    → under_review | archived | in_progress (reopen)
under_review → approved | rejected | in_progress (rework)
approved     → archived
rejected     → in_progress | cancelled | archived
cancelled    → archived | draft (reopen)
archived     → (restore via soft-restore / reopen path)
```

All transitions go through `assertExecutionStatusTransition`. Terminal-ish states: `approved`, `cancelled`, `archived` (with explicit reopen/restore escapes where allowed).

---

## Evidence lifecycle machine

`pending → captured → submitted → verified → approved | rejected → archived`

See [Evidence Lifecycle](./APZHUB-APZ-TCMS-Evidence-Lifecycle.md).
