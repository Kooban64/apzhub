# APZHUB Metrics Workbench Developer Guide

**Milestone:** APZMETRICS-004

## Layout

| Path                                                       | Role                             |
| ---------------------------------------------------------- | -------------------------------- |
| `packages/workbench-framework/manifests/platform-metrics*` | Registration                     |
| `apps/web/components/metrics/*`                            | UI (typed client only)           |
| `apps/web/lib/metrics/*`                                   | Typed client + workspace routes  |
| `apps/web/components/workbench-page.tsx`                   | Shell mount via `isMetricsRoute` |

## Rules

- Import only `@/lib/metrics` facades
- Never import gateway / platform-services / metrics-core / persistence
- No dedicated `apps/web/app/workspace/metrics` tree

## Next

**APZMETRICS-005 — Metrics Vertical Certification & Production Readiness** (await owner).
