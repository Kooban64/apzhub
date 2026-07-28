# APZ Workflow 1.0.0 — Production Readiness

> **Programme:** APZ-WORKFLOW-002  
> **Date:** 2026-07-19

---

## Verdict

| Field                | Value                                              |
| -------------------- | -------------------------------------------------- |
| Maturity promotion   | Planning → **Production** (documented limitations) |
| Certification class  | **PRODUCTION_READY_WITH_LIMITATIONS**              |
| Owner recommendation | **PRODUCTION READY**                               |
| Programme status     | **Awaiting Acceptance**                            |

## Preconditions met

1. Full Workflow vertical delivered (APZ-WORKFLOW-001 + PLATFORM-WORKFLOW-001…006 + N8N-001).
2. Quality gates PASS (TypeScript, lint, build, unit, Playwright, OpenAPI).
3. Architecture Frozen / QA-002 PRODUCTION READY retained.
4. No new feature development in this programme.
5. Known Limitations, Compatibility, Release Notes, and evidence pack filed.

## Residual production conditions (documented — non-blocking)

| Condition                                  | Treatment                                               |
| ------------------------------------------ | ------------------------------------------------------- |
| n8n CERTIFIED_FOUNDATION (execute limited) | Documented Release 1.0 limitation                       |
| In-memory runtime MVP modes                | Documented; ops enablement guidance filed               |
| Dual SoR / Engine workbench facets remain  | Documented; commercial surface is `/workspace/workflow` |
| Client-side / HTTP catalogue search        | Documented                                              |
| No visual designer as primary UX           | Documented Release 1.0 scope                            |

These are **not** grounds for NOT READY given Owner-approved Release 1.0 platform delivery and documented PRWL class.

## Recommendation

# PRODUCTION READY
