# QX-P1-03 Operational Evidence

| Field     | Value                                                                                                 |
| --------- | ----------------------------------------------------------------------------------------------------- |
| Timestamp | 20260807T191800Z                                                                                      |
| Authority | [OWNER-REVIEW-QX-P1-03-QUALITY-FLOW-WORKSPACE.md](../OWNER-REVIEW-QX-P1-03-QUALITY-FLOW-WORKSPACE.md) |
| Status    | **EVIDENCE RECORDED**                                                                                 |
| Suite     | `packages/platform-orchestration/src/quality-flow-workspace-operational.test.ts`                      |

---

## 1. Operational Smoke — PASS

Journey verified against orchestration surfaces the Quality Flow Workspace exposes:

| Step                                       | Result |
| ------------------------------------------ | ------ |
| Create Quality Flow                        | PASS   |
| Start Flow                                 | PASS   |
| Progress through stages                    | PASS   |
| Waiting state (`awaiting_gates`)           | PASS   |
| Approval state + outstanding → cleared     | PASS   |
| Evidence state (empty → complete)          | PASS   |
| Decision Package (`GO`)                    | PASS   |
| Exception handling (covered in resilience) | PASS   |
| Completion                                 | PASS   |

Durable SoR write-through observed for: `flow_instance`, `approval_bundle`, `decision_package`, `evidence_integration_package`.

---

## 2. Operational Resilience — PASS

| Scenario                                    | Workspace clarity                    |
| ------------------------------------------- | ------------------------------------ |
| Empty state                                 | No instances; command centre empty   |
| Partially complete flow                     | Stage + next action clear            |
| Failed / rejected approval                  | Bundle status + blocked release      |
| Rejected gate (failed / rejected terminals) | Exception state + next action        |
| Missing evidence                            | Outstanding evidence status surfaced |
| Cancelled flow                              | Exception `cancelled`                |
| Resumed flow                                | Pause → resume; next action restores |

---

## 3. Performance — PASS (no optimisation required)

Thresholds exercised with 40 flows + deep timeline:

| Metric                  | Bound      | Result |
| ----------------------- | ---------- | ------ |
| Create + advance batch  | &lt; 15s   | PASS   |
| List + project          | &lt; 500ms | PASS   |
| Timeline / deep advance | &lt; 2s    | PASS   |
| Stage transition        | &lt; 250ms | PASS   |

Optimisation: **not required** by evidence.

---

## Command

```bash
pnpm exec vitest run --config vitest.config.ts \
  packages/platform-orchestration/src/quality-flow-workspace-operational.test.ts
```

Result: **3/3 passed** (20260807T191800Z).
