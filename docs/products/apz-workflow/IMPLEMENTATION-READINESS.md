# APZ Workflow — Implementation Readiness (Release 1.0)

> **Programme:** APZ-WORKFLOW-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19  
> **Evidence:** AI-MANIFEST · disk inventory · Definition Pack · APZWORKFLOW freeze docs · Commercial / EA catalogues  
> **Prior pack:** [workflow/IMPLEMENTATION-READINESS.md](../workflow/IMPLEMENTATION-READINESS.md) (PRODUCTS-002)

---

## Overall maturity (after APZ-WORKFLOW-001)

| Plane                               | Maturity                                   |
| ----------------------------------- | ------------------------------------------ |
| Platform SoR + Engine (engineering) | **Production** (PRWL · frozen) — unchanged |
| Commercial product Release 1.0      | **Planning**                               |

**Not** Implementation Ready for commercial Release 1.0 execution scope.

---

## Final recommendation

# READY WITH CONDITIONS

| Option                    | Selected?                                                                     |
| ------------------------- | ----------------------------------------------------------------------------- |
| NOT READY                 | No — planning pack complete; platform foundation exists                       |
| **READY WITH CONDITIONS** | **Yes**                                                                       |
| IMPLEMENTATION READY      | **No** — Release 1.0 execution/schedule/approvals absent; Architecture Frozen |

**Meaning:** Owner may accept this planning programme and authorise **prerequisite** programmes (especially architecture unlock ADRs + named implementation programmes). Owner must **not** treat Workflow execute/schedule product code as authorised by this pack. A future readiness programme must re-assess to **IMPLEMENTATION READY** only after conditions are evidenced on disk.

---

## Dimension assessment

| Dimension                    | Status                    | Evidence                                                           |
| ---------------------------- | ------------------------- | ------------------------------------------------------------------ |
| **Current Product Maturity** | **Planning** (commercial) | Platform PRWL exists; no commercial SemVer **1.0.0**               |
| **Architecture Readiness**   | **PARTIAL**               | SoR + Engine architectures frozen; execute plane needs ADR + Owner |
| **Integration Readiness**    | **PARTIAL**               | n8n **0.1.0** read-only present; execute/credentials not certified |
| **Workbench Readiness**      | **PARTIAL**               | Dual facets exist; commercial unified product UX / runs UX absent  |
| **Platform Readiness**       | **PASS** (foundation)     | Gateway, IAM, SDK **1.0.0**, workflow packages present             |
| **Documentation Readiness**  | **PASS** (planning)       | This Release Pack + portfolio Definition Pack                      |
| **Commercial Readiness**     | **PARTIAL**               | Catalogue exists; commercial 1.0 SemVer / edition GA not claimed   |
| **Release Readiness**        | **FAIL**                  | No `docs/releases/workflow/1.0.0/`; checklist unexecutable         |

---

## Conditions for future IMPLEMENTATION READY

All must be **true on disk** before IR promotion for Release 1.0 scope:

| #   | Condition                                                                             | Current                      |
| --- | ------------------------------------------------------------------------------------- | ---------------------------- |
| C1  | Owner Acceptance of APZ-WORKFLOW-001                                                  | Pending                      |
| C2  | Accepted ADR(s) unlocking execute/schedule/approvals/credentials beyond freeze        | **FAIL**                     |
| C3  | Named Owner Approval for implementation programme(s)                                  | **FAIL**                     |
| C4  | Platform services + HTTP for runs/history/logs/retries (or explicitly scoped interim) | **FAIL** for execute plane   |
| C5  | Workbench product surfaces for Release 1.0 in-scope features                          | **FAIL** for execute/HITL    |
| C6  | n8n adapter certified for the authorised Release 1.0 scope                            | **PARTIAL** — read-only only |
| C7  | Permission catalogue extended for runs/approvals/schedules                            | **FAIL**                     |
| C8  | QA-002 PRODUCTION READY retained                                                      | **PASS** (held)              |

---

## What must not be confused with commercial APZ Workflow 1.0

| On disk                                              | Not a substitute for                           |
| ---------------------------------------------------- | ---------------------------------------------- |
| Frozen SoR Workbench `/workspace/workflows`          | Commercial SemVer **1.0.0** with execute plane |
| Frozen Engine Workbench `/workspace/workflow-engine` | Full automation operations product             |
| n8n Reference Adapter read-only                      | Certified execute provider                     |
| Platform Event Bus                                   | Workflow product scheduling/runs UX            |
| Law/TCMS “workflow” docs                             | APZ Workflow product                           |

---

## Implementation rule

Do **not** implement from this pack. Await Owner Acceptance of APZ-WORKFLOW-001, then separate named Approvals (and ADRs where freeze applies).
