# WF-P1-04 — Projects ↔ Workflow approval bridge

| Field  | Value            |
| ------ | ---------------- |
| ID     | **WF-P1-04**     |
| Status | **Closed**       |
| Date   | 20260808T131000Z |

## Honesty posture

When Workflow executor is unavailable (production without injected executor / execute gated):

- Bridge `health.available === false`
- Bindings can be recorded as `unavailable`
- Projects control surface shows **“Approvals unavailable (Workflow bridge)”**
- Operational workspace respects `approvalsUnavailable`

Cross-product nav: Projects manifest **Jump to APZ Workflow** → `/workspace/workflow`.

## Tests

- `apps/web/components/workflow/workflow-projects-bridge.test.ts` — **PASS**
- Existing `packages/platform-services/.../projects-workflow-bridge.test.ts` covers unavailable recording
