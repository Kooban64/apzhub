# APZ Workflow 1.0.0 — Quality Evidence

> **Release:** APZ Workflow **1.0.0**  
> **Programme:** APZ-WORKFLOW-002  
> **Status:** Certification filed — **Awaiting Acceptance**  
> **Date:** 2026-07-19  
> **Bootstrap:** AI-MANIFEST · repository evidence only

| Gate                       | Result         | Evidence                                                         |
| -------------------------- | -------------- | ---------------------------------------------------------------- |
| Workflow vertical Vitest   | **PASS (145)** | contracts · platform-services workflow · HTTP · workbench lib/UI |
| Architecture boundary      | **PASS**       | `workflow-architecture-boundary.test.ts`                         |
| Web typecheck              | **PASS**       | `pnpm --filter @apzhub/web typecheck`                            |
| ESLint (workflow surfaces) | **PASS**       | `apps/web/lib/workflow` · `components/workflow` · handlers       |
| Web build                  | **PASS**       | `pnpm --filter @apzhub/web build`                                |
| Playwright Workbench       | **PASS (3)**   | `apzhub-workflow-workbench.spec.ts`                              |
| OpenAPI validate           | **PASS**       | `pnpm openapi:validate:platform` · OpenAPI **1.12.0**            |
| No new feature scope       | **PASS**       | Certification/packaging only                                     |
| Freeze integrity           | **PASS**       | Integration SDK **1.0.0** unchanged; Architecture Frozen held    |
| Repository QA-002          | **HELD**       | PRODUCTION READY                                                 |

## Certification claim

**PRODUCTION_READY_WITH_LIMITATIONS** for Release 1.0 Workflow product — see Known Limitations.

## Owner recommendation (single)

# PRODUCTION READY
