# APZ Analytics 1.0.0 — Quality Evidence

> **Release:** APZ Analytics **1.0.0**  
> **Programme:** APZ-ANALYTICS-002  
> **Status:** Certification filed — **Awaiting Acceptance**  
> **Date:** 2026-07-19  
> **Bootstrap:** AI-MANIFEST · repository evidence only

| Gate                        | Result        | Evidence                                                                     |
| --------------------------- | ------------- | ---------------------------------------------------------------------------- |
| Analytics vertical Vitest   | **PASS (46)** | contracts · metabase · platform-services analytics · HTTP · workbench lib/UI |
| Metabase adapter tests      | **PASS (15)** | `integrations/metabase/src/*.test.ts`                                        |
| Architecture boundary       | **PASS**      | `analytics-architecture-boundary.test.ts`                                    |
| Web typecheck               | **PASS**      | `pnpm --filter @apzhub/web typecheck`                                        |
| ESLint (analytics surfaces) | **PASS**      | `apps/web/lib/analytics` · `components/analytics` · handlers                 |
| Web build                   | **PASS**      | `pnpm --filter @apzhub/web build`                                            |
| Playwright Workbench        | **PASS (3)**  | `apzhub-analytics-workbench.spec.ts`                                         |
| OpenAPI validate            | **PASS**      | `pnpm openapi:validate:platform` · OpenAPI **1.11.0**                        |
| No new feature scope        | **PASS**      | Certification/packaging only (+ type fix for `buildQuery` params)            |
| Freeze integrity            | **PASS**      | Integration SDK **1.0.0** unchanged; Architecture Frozen held                |
| Repository QA-002           | **HELD**      | PRODUCTION READY                                                             |

## Certification claim

**PRODUCTION_READY_WITH_LIMITATIONS** for Release 1.0 curated Analytics product — see Known Limitations.

## Owner recommendation (single)

# PRODUCTION READY
