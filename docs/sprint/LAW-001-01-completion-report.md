# LAW-001-01 — Law Platform Foundation Completion Report

> **Story:** LAW-001-01 — Law Platform application shell  
> **Status:** **Complete** — await owner approval before LAW-001-02  
> **Platform baseline:** [Platform Version 5.0](../releases/APZHUB-Platform-v5.0.md) — **frozen**  
> **Application:** `@apzhub/law-platform` v1.0.0 on port **3301**

---

## Summary

LAW-001-01 delivers the APZHUB Law Platform application shell as the first enterprise application built entirely on Platform 5.0. The shell provides temporary branding, a manifest-driven Workbench workspace (`law`), placeholder module views, navigation commands, platform help knowledge sources, placeholder notification routes and activity types, context panel surfaces, and extended health reporting.

No matter management, clients, documents, billing, calendar business logic, or legal domain features were implemented.

---

## Deliverables

| Deliverable                                          | Location                                                                                     |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Law Platform application                             | `apps/law-platform/`                                                                         |
| Legal service manifest                               | `services/legal-platform/service.yaml`                                                       |
| Workbench module manifests                           | `services/legal-platform/manifests/law-*/module.yaml`                                        |
| Legal event manifests                                | `events/legal/*/event.yaml`                                                                  |
| App registration (notifications, activities, events) | `apps/law-platform/lib/register-law-*.ts`                                                    |
| Manifest-aware command bridge                        | `apps/law-platform/lib/create-manifest-aware-workbench-bridge.ts`                            |
| Law health extension                                 | `apps/law-platform/lib/law-platform-health*.ts`, `packages/types` `LawPlatformHealthSummary` |
| Tests                                                | `apps/law-platform/lib/*.test.ts` (25 tests)                                                 |
| Root scripts                                         | `pnpm dev:law`, `pnpm build:law`                                                             |

---

## Architecture notes

### Application vs planning docs

Planning documents originally assumed extending `apps/web` only. LAW-001-01 explicitly requires `apps/law-platform/` as a dedicated application package following `apps/web` conventions. The Law Platform consumes the same Platform 5.0 hydration stack without forking framework packages.

### Manifest discovery

Runtime discovery requires canonical filenames (`module.yaml`, `service.yaml`, `event.yaml`). Legal modules live under `services/legal-platform/manifests/<module>/module.yaml`.

### App-level registration pattern

Standalone `event.yaml` files and inline notification/activity blocks are not fully wired through manifest extraction (Platform 5.0 limitation). Law Platform registers placeholder events, notification routes, and activity types at the application composition root — mirroring `register-app-notification-routes.ts` in `apps/web`.

### Manifest action bridge (TD-AF20-01)

Manifest actions such as `legal.open.clients` use handlers like `workbench-bridge:workbench.view.open` but carry distinct action ids. Law Platform wraps the default bridge to resolve handler suffixes and inject default payloads (`viewId` from `capabilityId`, `workspace: law`).

### Branding

Temporary Deep Navy primary and Gold accent are applied via CSS variables in `apps/law-platform/app/globals.css`, supporting light and dark themes through the existing `@apzhub/theme` provider.

### Context panel

Platform 5.0 Context Panel exposes the Activity tab natively. Notifications render in the header panel. Knowledge is surfaced via `WorkbenchKnowledgeOverlay` in the workspace layout (platform help only).

---

## Module registration summary

| Module         | View / route                    | Command                     | Knowledge source            |
| -------------- | ------------------------------- | --------------------------- | --------------------------- |
| Dashboard      | `/workspace/law/dashboard`      | `legal.open.dashboard`      | `legal.help.dashboard`      |
| Clients        | `/workspace/law/clients`        | `legal.open.clients`        | `legal.help.clients`        |
| Matters        | `/workspace/law/matters`        | `legal.open.matters`        | `legal.help.matters`        |
| Documents      | `/workspace/law/documents`      | `legal.open.documents`      | `legal.help.documents`      |
| Calendar       | `/workspace/law/calendar`       | `legal.open.calendar`       | `legal.help.calendar`       |
| Tasks          | `/workspace/law/tasks`          | `legal.open.tasks`          | `legal.help.tasks`          |
| Time           | `/workspace/law/time`           | `legal.open.time`           | `legal.help.time`           |
| Billing        | `/workspace/law/billing`        | `legal.open.billing`        | `legal.help.billing`        |
| Reports        | `/workspace/law/reports`        | `legal.open.reports`        | `legal.help.reports`        |
| Administration | `/workspace/law/administration` | `legal.open.administration` | `legal.help.administration` |

Activity bar workspace: `legal-platform-root` → Law Platform (`/workspace/law/dashboard`).

---

## Platform 5.0 frameworks exercised

| Framework                 | Validation evidence                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------ |
| **Platform Runtime**      | Discovery of `services/legal-platform/`, `events/legal/`; bootstrap integration test |
| **Workbench Framework**   | `law` workspace, 10 sidebar modules, activity bar entry, route activation            |
| **Action Framework**      | 10 palette commands; manifest-aware bridge; executor integration                     |
| **Knowledge & Discovery** | 10 `legal.help.*` sources on `legal-platform` service manifest                       |
| **Event & Notification**  | App-registered events + 2 notification routes; EN hydration                          |
| **Activity & Timeline**   | 3 placeholder activity types; context panel Activity tab                             |

---

## Validation summary

| Gate                                       | Result                                 |
| ------------------------------------------ | -------------------------------------- |
| `pnpm lint`                                | Pass                                   |
| `pnpm typecheck`                           | Pass                                   |
| `pnpm --filter @apzhub/law-platform build` | Pass                                   |
| `pnpm test`                                | **1338** tests pass (+30 law-platform) |
| `pnpm test:coverage`                       | Pass (thresholds maintained)           |

### Test coverage (LAW-001-01)

- Navigation / workbench boot: `law-platform-bootstrap.test.ts`
- Commands: `create-manifest-aware-workbench-bridge.test.ts`
- Knowledge: bootstrap assertion on `legal.help.*` sources
- Notifications: `register-law-notification-routes.test.ts`
- Activities: `register-law-activity-types.test.ts`
- Events: `register-law-events.test.ts`
- Health: `law-platform-health.test.ts`

---

## Technical debt

| ID         | Item                                                           | Recommendation                                                                     |
| ---------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| TD-LAW-01  | Dedicated `apps/law-platform` vs planning doc `apps/web` shell | Document as intentional validation app; reconcile architecture doc in LAW-001-02   |
| TD-LAW-02  | Standalone `event.yaml` not extracted to EventRegistry         | App-level `registerLawEvents`; migrate to manifest extraction when Platform allows |
| TD-AF20-01 | Manifest action id vs bridge id mismatch                       | Law Platform manifest-aware bridge; upstream fix in Action Framework future sprint |
| TD-LAW-03  | Knowledge overlay in workspace layout, not Context Panel tab   | Extend workspace Context Panel when Platform adds Knowledge tab                    |
| TD-LAW-04  | No E2E for Law Platform shell                                  | Add Playwright spec in LAW-001-02 or dedicated E2E story                           |

---

## Recommendation for LAW-001-02

Proceed with **Legal platform service hardening and smoke validation**:

1. Confirm `legal-platform` service lifecycle hooks and diagnostics in health output.
2. Add Playwright E2E: login → Law workspace visible → sidebar navigation → command palette open commands.
3. Emit smoke `legal-platform-module-opened` event on module route activation (still no business logic).
4. Reconcile architecture documentation with dedicated `apps/law-platform` application model.

**Stop condition:** Do not begin Clients or Matter Management until owner approves LAW-001-01 and LAW-001-02 scope.

---

_LAW-001-01 — Platform Validation Phase 1 implementation complete._
