# Remediation Summary — Platform-1.3-RR-001

> **Date:** 2026-07-23  
> **Scope:** CERT-001 recorded release blockers only

## P13-CERT-QF-01 — Production build failure

| Field                | Value                                                           |
| -------------------- | --------------------------------------------------------------- |
| File                 | `apps/web/components/notifications/notification-inbox-view.tsx` |
| Defect               | Invalid `Button` `variant="secondary"`                          |
| Fix                  | Use repository-approved `variant="outline"` (two call sites)    |
| Constraints observed | No Workbench redesign · no functional change beyond compile     |

## P13-CERT-QF-02 — Repository typecheck failure

| Field                | Value                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------- |
| File                 | `packages/observe-core/src/evaluation/create-alert-evaluation-domain.ts`              |
| Defect               | TS2540 — assignment to readonly `suppressed*` fields                                  |
| Fix                  | Immutable reassignment of `nextLife` lifecycle metadata objects                       |
| Constraints observed | Alert lifecycle behaviour preserved · no Observe redesign · no public contract change |

### Compile unblocks required for green `pnpm typecheck` / `pnpm build`

After QF-02 unblocked full typecheck, latent compile errors in the ENG-004 / CERT surface were corrected **only as required to compile** (no redesign):

| File                                                                     | Minimal correction                                                                                |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `packages/platform-services/.../create-notification-delivery-service.ts` | Hook input uses `alertState.state` (not `status`); mutable queue/hint locals; safer assignee cast |
| `apps/web/lib/api/v1/handlers/notification-delivery.ts`                  | `sourceProduct ?? "platform"`                                                                     |
| `apps/web/lib/api/v1/handlers/realtime.test.ts`                          | NextRequest init typing · remove invalid `satisfies` on partial error body                        |
| `apps/web/lib/api/v1/testing/fixtures.ts`                                | Add `alertEvaluationEnabled` to observe readiness fixture                                         |
| `apps/web/components/notifications/platform-notifications-view.tsx`      | Add missing `SECTION_META.inbox` entry (required for typecheck after inbox route)                 |

## P13-CERT-QF-03 — OpenAPI assertion

| Field                | Value                                                                                                                                          |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Defect               | Tests expected OpenAPI `1.13.0`; repository reports `1.14.0`                                                                                   |
| Fix                  | Assert `1.14.0` in `realtime.test.ts`, `platform-api.workflow.v1.test.ts`, `platform-api.analytics.v1.test.ts`, `platform-api.time.v1.test.ts` |
| Constraints observed | No API behaviour change · no unrelated contract regeneration                                                                                   |

## P13-CERT-QF-04 — Repository formatting drift

| Field                | Value                                                |
| -------------------- | ---------------------------------------------------- |
| Fix                  | `pnpm format` then `pnpm format:check`               |
| Constraints observed | Formatting only · no functional refactoring mixed in |

## Explicitly not done

No Platform 1.4 · ENG-005 · CERT-002 · Email SoR · SMTP · SMS · Push · Notification/Observe/Realtime/Workbench redesign · Integration SDK thaw · Platform Services redesign · architecture refactor · DB redesign · unrelated cleanup.
