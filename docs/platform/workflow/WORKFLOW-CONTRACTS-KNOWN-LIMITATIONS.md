# Workflow Contracts — Known Limitations

> **Package:** `@apzhub/workflow-contracts` **0.4.0**  
> **Programme:** APZHUB-PLATFORM-WORKFLOW-003  
> **Date:** 2026-07-19

---

1. **No Platform Services implementations** — runtime interfaces (`WorkflowRunService`, schedules, tasks, …) are contracts only; no execute/schedule/HITL behaviour is wired.
2. **Dual trigger shapes** — definition-graph `WorkflowTrigger` (SoR) and arming `WorkflowTriggerBinding` (IM run plane) coexist; consumers must pick the correct plane.
3. **Permission keys registered but unused** — new `workflow.runs.*` / `schedules.*` / `tasks.*` / `credentials.*` appear in catalogues; Platform Services operation authorization maps for those planes are **not** implemented in this programme.
4. **SemVer continuity** — package advanced **0.3.0 → 0.4.0** (additive). Owner template named **0.1.0** for greenfield programmes; reset to 0.1.0 was rejected to protect frozen SoR consumers.
5. **Engine gateway unchanged** — `WorkflowEngineGateway` remains read-only discovery; execute methods stay NOT_SUPPORTED at the engineering baseline.
6. **No HTTP / Workbench contracts** — OpenAPI and UI contracts are out of scope.
7. **NotificationService** is intent-only — delivery remains Notification Framework (021).
