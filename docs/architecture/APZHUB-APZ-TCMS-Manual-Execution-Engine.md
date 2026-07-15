# APZ TCMS — Manual Execution Engine

**Milestone:** APZTCMS-006  
**Packages:** `@apzhub/testing-services` **0.2.0**, `@apzhub/testing-contracts` **0.3.0**

---

## Purpose

The Manual Execution Engine is the **authoritative domain engine** for manual test runs. All lifecycle behaviour, step results, evidence binding, approvals, and validation live in domain services — not HTTP or UI.

Factory: `createManualTestingServices({ persistence, storage?, configuration?, events?, now?, id? })`.

---

## Operations

| Operation                         | Effect                                |
| --------------------------------- | ------------------------------------- |
| `create`                          | Execution in `draft`                  |
| `assignTester` / `assignReviewer` | Assignment; may advance to `assigned` |
| `start`                           | → `in_progress`                       |
| `pause` / `resume`                | Pause cycle                           |
| `block` / `unblock`               | Blocked path                          |
| `complete`                        | → `completed`                         |
| `submitForReview`                 | → `under_review`                      |
| `approve` / `reject`              | Terminal review outcomes              |
| `reopen`                          | Return to workable state              |
| `restart`                         | New execution row + `restartOfId`     |
| `cancel`                          | → `cancelled`                         |
| `archive` / `restore`             | Soft-archive (+ status)               |

Illegal transitions throw `DomainRuleError` — no direct status mutation.

---

## Step engine

- Ordered step actuals with expected/actual results, status, comments, timestamps
- Parameter substitution (`${key}`) from case parameters + execution overrides
- Nested steps (`parentStepId`, nest level) and repeatable indices
- Step outcomes roll up to `overallResult` (fail/blocked dominate)
- Evidence IDs attach to steps without binary upload

---

## History & events

Every significant mutation appends an immutable `executionHistory` entry (session-scoped) and publishes an internal domain event via `DomainEventCollector`. **No Event Bus.**

---

## Related

[Execution State Machine](./APZHUB-APZ-TCMS-Execution-State-Machine.md) · [Evidence Architecture](./APZHUB-APZ-TCMS-Evidence-Architecture.md) · [Approval Engine](./APZHUB-APZ-TCMS-Approval-Engine.md) · [Execution History](./APZHUB-APZ-TCMS-Execution-History.md)
