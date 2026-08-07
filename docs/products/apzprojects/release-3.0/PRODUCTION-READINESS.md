# APZ Projects Release 3.0 — Production Readiness (Track B)

| Field     | Value                                |
| --------- | ------------------------------------ |
| Authority | Owner dual-track decision 2026-08-07 |
| Objective | Remove every certification blocker   |

## Status board

| ID  | Gate                                   | Status          | Notes                                                                                                                             |
| --- | -------------------------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| P1  | APZ Workflow Bridge                    | **IN PROGRESS** | Service + memory + tests + handler inject; gaps: Postgres store, HTTP APIs, production executor, queue rows, cert waiver lockdown |
| P2  | Enterprise Identity Pickers            | Remaining       | No shared picker; free-text owners in initiate / commitments / milestones / risks / decisions                                     |
| P3  | Organisation Governance Administration | Remaining       | System catalogue + list API only; no org CRUD/publish                                                                             |
| P4  | Migration Verification                 | Remaining       | `0109`–`0114` in repo; env apply/verify pending                                                                                   |
| P5  | Full Certification                     | Remaining       | Checklist + growing unit; no R3.0 initiate→close E2E yet                                                                          |

## P1 — Workflow Bridge (rules)

- Projects owns operational intent
- Workflow owns execution
- Projects consumes outcomes
- **No duplicate approval engine**

### Approval kinds

| Kind                  | Intent owner        | Trigger                           |
| --------------------- | ------------------- | --------------------------------- |
| `hold_approval`       | Lifecycle → On Hold | Profile `requiresHoldDecision`    |
| `closure_approval`    | Lifecycle → Closed  | Profile `requiresClosureApproval` |
| `governance_approval` | Re-baseline         | Control-heavy profiles            |
| `checkpoint_approval` | Checkpoint submit   | Governance checkpoints            |
| `exception_approval`  | Exception conclude  | Major / Critical                  |

### Code

- Contracts: `packages/platform-service-contracts/src/domain/project-workflow-bridge.ts`
- Service: `packages/platform-services/src/services/projects-workflow-bridge/`
- Migration: `packages/config/drizzle/0114_apz_platform_projects_workflow_bridge.sql`

### Remaining for P1 (closeout PR-01)

| Sub-item                                                    | Status             | Complexity |
| ----------------------------------------------------------- | ------------------ | ---------- |
| Postgres store for `apz_platform_projects_approval_binding` | Partial (SQL only) | M          |
| HTTP APIs: request / list / apply / sync                    | Not started        | M          |
| Production gateway-backed executor (not in-process default) | Partial            | L          |
| Pending-approval queue rows + sync-before-gate              | Partial            | M          |
| Cert-env: no emergency waiver bypass for required approvals | Partial            | S          |

## P5 — Certification checklist (prepare early)

- [ ] Unit
- [ ] Integration
- [ ] API
- [ ] UI
- [ ] Accessibility
- [ ] Performance
- [ ] Migration
- [ ] End-to-End
