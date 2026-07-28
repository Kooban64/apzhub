# Queue Model — APZQEP-ARCH-010

> Companion extract. Authoritative detail: [VERIFICATION-WORKBENCH-ARCHITECTURE.md](./VERIFICATION-WORKBENCH-ARCHITECTURE.md) §7.

## Purpose

Operational presentation of Verification work. Queues do **not** own business rules.

## Example queues

My Work · Assigned · Requested · Awaiting Review · Rejected · Expired · Overdue · Completed · Recently Updated.

## Classes

| Class                   | Scope                          |
| ----------------------- | ------------------------------ |
| My Verification Queue   | Current actor                  |
| Team Verification Queue | Team / role (permission-gated) |

## Rules

- Membership from server queries only
- Counts via bounded aggregations
- Empty / permission states governed
- Opening an item selects Verification + Inspector
