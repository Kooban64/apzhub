# Security Review — APZQEP-CERT-080A

| Field | Value |
| ----- | ----- |
| Result | **PASS** |
| Date | 2026-07-28 |
| Scope | End-to-end permission flow across Domain → Infrastructure → Workbench |

## Permission catalogue (`qep.plan.*`)

| Permission | Declared | Enforced | Workbench-gated |
| ---------- | -------- | -------- | ----------------- |
| `qep.plan.read` | `module.yaml` | Application service / REST | Sidebar, Dashboard, Explorer, Inspector |
| `qep.plan.create` | `module.yaml` | Application service / REST | Create action |
| `qep.plan.update` | `module.yaml` | Application service / REST | Edit Draft, structural dialogs |
| `qep.plan.submit` / `.approve` / `.reject` | `module.yaml` | Application service / REST | Review queue actions |
| `qep.plan.ready` / `.execute` / `.complete` / `.archive` / `.cancel` | `module.yaml` | Application service / REST | Action Bar (availableActions-gated) |
| `qep.plan.clone` / `.supersede` | `module.yaml` | Application service / REST | Action Bar |
| `qep.plan.assign` / `.schedule` | `module.yaml` | Application service / REST | `updateAssignment` / `updateSchedule` dialogs |
| `qep.plan.search` | `module.yaml` | REST | Search view |
| `qep.plan.history.view` | `module.yaml` | Application service / REST | History panel |

## Checklist

| Concern | Result | Notes |
| ------- | ------ | ----- |
| Permissions `qep.plan.*` declared once, consumed consistently | **PASS** | Single catalogue in `modules/qep-test-plans/module.yaml`; no duplicate/divergent declaration found |
| Tenant isolation | **PASS** | Repository scoped by tenant; RLS migration **0086** |
| Optimistic concurrency | **PASS** | Revision-based concurrency on save (confirmed at CERT-060B; re-confirmed unchanged) |
| Server authority | **PASS** | `availableActions` computed server-side (Domain/Application); Workbench never computes or infers permissions client-side |
| Lifecycle protection | **PASS** | Domain lifecycle policy + explicit commands; no status field directly mutable via generic update |
| No client authority | **PASS** | Workbench renders server action list only; no hardcoded transition matrix found in `apps/web/components/qep/qep-test-plan-views.tsx` |
| Secure endpoints | **PASS** | Platform API pipeline (auth, authz, validation, envelope, correlation ID) — REST `/api/v1/qep/plans/*` |
| No security regressions introduced by Workbench | **PASS** — confirmed at CERT-070A, re-confirmed unchanged | No new endpoint, no new client-side authority surface |
| Secrets | **PASS** | None in package, Infrastructure config, or Workbench client |
| No security regressions under CERT-080A | **PASS** | CERT packaging only (documentation); no code path touched |
| Cross-layer permission consistency (Domain intent ↔ Infrastructure enforcement ↔ Workbench gating) | **PASS** | Same `qep.plan.*` identifiers used at every layer; no translation drift found |

## Verdict

Security review **PASS**. Permission flow is server-authoritative end-to-end and consistent across all three certified layers.
