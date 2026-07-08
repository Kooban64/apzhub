# APZHUB Platform Version 5.0

> **Platform Version:** 5.0  
> **Status:** Official Platform Release Document — **permanent architectural baseline**  
> **Date:** 2026-07-05  
> **Authority:** [Document 000 — Engineering Constitution](../000-apzhub-engineering-constitution.md) · [Architecture Baseline v1.0](../architecture/APZHUB-Architecture-Baseline-v1.0.md) · [Platform Reference Architecture](../architecture/APZHUB-Platform-Reference-Architecture.md)  
> **Change control:** Platform 5.0 extends Baseline v1.0 and supersedes Platform 4.0 as the **definitive reference baseline**. Baseline v1.0 remains frozen; modifications still require ADR.

---

## Executive Summary

APZHUB Platform Version 5.0 is the culmination of **Milestones 1 through 7** — seven coordinated engineering programmes that deliver a runnable, manifest-driven, permission-aware enterprise workbench with unified action execution, unified knowledge discovery, unified event-driven in-app notifications, and unified activity timelines.

Platform 5.0 adds the **Activity & Timeline Framework** on top of Platform 4.0 without redesigning lower layers. Successful actions publish domain events through an in-process Event Bus; notification routes map to badge and panel Experiences while activity types map to Context Panel timelines — parallel fan-out, independent services.

**1308 unit tests**, **36 E2E tests**, and **90.58%** statement coverage at Milestone 7 closeout. Platform 5.0 is the **permanent engineering baseline** for Milestone 8 (Platform Identity, Administration & User Experience) and product validation — not a commercial general availability release.

From this point forward, future milestones should **primarily consume the platform** rather than redesign it.

---

## Platform Vision

APZHUB is an **Enterprise Operating Platform**: a single desktop-style application through which users interact with enterprise capabilities without exposure to underlying backend systems.

Platform 5.0 realises:

- **One workbench** — registry-driven navigation, session persistence, shell presentation
- **One runtime** — manifest discovery, capability registration, lifecycle, health
- **One action model** — palette, shortcuts, context menu, toolbar, Workbench API share one executor
- **One knowledge layer** — unified discovery across Action, Workbench, and manifest sources
- **One event model** — platform-owned Event Bus with standard envelopes and registry bootstrap
- **One notification model** — event-to-notification mapping; modules never notify directly
- **One activity model** — event-to-activity mapping; modules never write activity directly
- **One extension model** — YAML manifests; server bootstrap, permission filter, client hydration

Milestones 1–7 **extended** the layer below without breaking consumers above.

---

## Milestones 1–7 Delivered

| Milestone                      | Sprint  | Layer                                                      | Release                                |
| ------------------------------ | ------- | ---------------------------------------------------------- | -------------------------------------- |
| **M1 — Foundation**            | SPR-001 | Monorepo, auth, design system, shell, CI                   | `v0.1.0-foundation`                    |
| **M2 — Platform Runtime**      | SPR-002 | Manifest engine, registry, lifecycle, health               | `v0.2.0-platform-runtime`              |
| **M3 — Workbench Framework**   | SPR-003 | Manager, engines, API, session, navigation                 | `v0.3.0-workbench-framework`           |
| **M4 — Action Framework**      | SPR-004 | Action registry, executor, surfaces, app wiring            | `v0.4.0-action-framework`              |
| **M5 — Knowledge & Discovery** | SPR-005 | Knowledge registry, orchestrator, service, experiences     | `v0.5.0-knowledge-discovery-framework` |
| **M6 — Event & Notification**  | SPR-006 | Event Bus, notification service, badge/panel experiences   | `v0.6.0-event-notification-framework`  |
| **M7 — Activity & Timeline**   | SPR-007 | Activity registry, mapper, service, Context Panel timeline | `v0.7.0-activity-timeline-framework`   |

```text
M1 Foundation
        ↓
M2 Platform Runtime
        ↓
M3 Workbench Framework
        ↓
M4 Action Framework
        ↓
M5 Knowledge & Discovery Framework
        ↓
M6 Event & Notification Framework
        ↓
M7 Activity & Timeline Framework
        ↓
Platform Version 5.0  →  Permanent reference baseline
```

---

## Platform Architecture Summary

### Layer stack (Platform 5.0)

```text
Future Business Capabilities (M9+)
        ↓
Platform Identity, Administration & UX (M8 — planned)
        ↓
Platform Capabilities (M4–M7) ✅
  Action Framework
  Knowledge & Discovery
  Event & Notification
  Activity & Timeline
        ↓
Workbench Framework (M3) ✅
        ↓
Platform Runtime (M2) ✅
        ↓
Foundation (M1) ✅
```

### Canonical platform capability pipelines

**Notifications:**

```text
Platform Capability → Domain Event → Event Bus → Notification Mapping
→ Notification Service → Notification Presentation Layer → Notification Experiences
```

**Activity:**

```text
Platform Capability → Domain Event → Event Bus → Activity Mapping
→ Activity Service → Activity Presentation Layer → Timeline Experiences → Context Panel
```

**Knowledge:**

```text
Knowledge Sources → Knowledge Registry → Knowledge Service
→ Knowledge Presentation Layer → Knowledge Experiences
```

**Actions:**

```text
Action Registry → DefaultActionExecutor → WorkbenchCommandBridge → Workbench Request Bus
```

See [Platform Reference Architecture](../architecture/APZHUB-Platform-Reference-Architecture.md) · [Platform Capability Matrix](../architecture/APZHUB-Platform-Capability-Matrix.md).

---

## Framework Summary

| Framework             | Package                                 | Public API(s)                                               | Milestone |
| --------------------- | --------------------------------------- | ----------------------------------------------------------- | --------- |
| Platform Runtime      | `@apzhub/platform-runtime`              | `Runtime.bootstrap()`                                       | M2        |
| Workbench Framework   | `@apzhub/workbench-framework`           | `WorkbenchAPI`, `useWorkbenchAPI()`                         | M3        |
| Action Framework      | `@apzhub/command-framework`             | `useCommandRegistry()`                                      | M4        |
| Knowledge & Discovery | `@apzhub/knowledge-discovery-framework` | `useKnowledgeService()`                                     | M5        |
| Event & Notification  | `@apzhub/event-notification-framework`  | `useNotificationService()`, `useNotificationPresentation()` | M6        |
| Activity & Timeline   | `@apzhub/activity-timeline-framework`   | `useActivityTimelineExperienceDiagnostics()`                | M7        |

Shell composition: `@apzhub/workspace` + `apps/web` (`ActionWorkbenchShellProvider`).

---

## Engineering Statistics

| Metric                        | Value (M7 closeout)                |
| ----------------------------- | ---------------------------------- |
| Milestones completed          | **7**                              |
| Platform version              | **5.0**                            |
| Sprints completed             | SPR-001 through SPR-007            |
| Engineering stories (SPR-007) | 16 (AT-001 – AT-016)               |
| Engineering stories (SPR-006) | 18 (EN-001 – EN-018)               |
| Total phased deliverables     | 124+ stories across M1–M7          |
| Architecture Decision Records | **35** accepted (0033–0035 for M7) |
| Foundation documents          | 000 + 001–029                      |
| Sprint completion reports     | 70+ across M1–M7                   |

---

## Test Statistics

| Metric                 | Value                   |
| ---------------------- | ----------------------- |
| Unit / component tests | **1308**                |
| E2E tests              | **36**                  |
| Test files             | 238                     |
| Playwright suites      | spr-001 through spr-007 |

### E2E coverage highlights

- Authentication and shell hydration
- Workbench navigation and session restore
- Action Framework surfaces and execution
- Knowledge Service health, diagnostics, palette knowledge mode
- Event & Notification health, badge, panel, action-audit flow
- Activity & Timeline health, Context Panel, parallel fan-out, actionRef delegation
- Accessibility (axe) on login and shell

---

## Coverage

| Scope                | Statements | Branches | Functions | Lines  |
| -------------------- | ---------- | -------- | --------- | ------ |
| Monorepo (All files) | **90.58%** | 86.92%   | 91.58%    | 90.58% |

Quality gate threshold: ≥ 80% statements (enforced in `vitest.config.ts`).

---

## Known Limitations

| Limitation                                  | Impact                                                   |
| ------------------------------------------- | -------------------------------------------------------- |
| In-process Event Bus only                   | Events do not cross process boundaries                   |
| Session-scoped notification/activity stores | No persistence across reload                             |
| RBAC population                             | Permission keys declared; allow-all dev adapter until M8 |
| Live activity subscriptions                 | Timeline UI static until remount                         |
| External delivery (email/SMS/push)          | Channel stubs only                                       |
| Service action handlers                     | Some palette actions `NOT_IMPLEMENTED`                   |
| Context Panel ↔ Context Engine              | Activity tab structural only                             |
| Semantic / vector search                    | Ranking scaffolds only                                   |

---

## Commercial Readiness

**Verdict:** **Platform layer ready for product validation; commercial GA deferred.**

| Area                    | Assessment                                                                 |
| ----------------------- | -------------------------------------------------------------------------- |
| Platform layer (M1–M7)  | Ready for product validation streams                                       |
| Health endpoints        | Runtime, commands, knowledge, events, notifications, activities, timelines |
| Application integration | Authenticated shell fully wired                                            |
| Event Bus               | In-process — acceptable for validation phase                               |
| Identity / RBAC depth   | Milestone 8 required before enterprise GA                                  |
| Business capabilities   | Milestone 9+                                                               |
| Enterprise operations   | Milestone 10+                                                              |

See [APZHUB v5.0 Platform Review](../reviews/APZHUB-v5.0-Platform-Review.md) · [Product Validation Strategy](../strategy/APZHUB-Product-Validation-Strategy.md).

---

## Deferred Work

| Capability                                        | Target                                      |
| ------------------------------------------------- | ------------------------------------------- |
| PermissionService + RBAC enforcement              | M8 — Platform Identity, Administration & UX |
| User / role administration                        | M8                                          |
| Preference, workspace, theme persistence          | M8                                          |
| Persistent event / notification / activity stores | M8+                                         |
| Email / SMS / push / webhook delivery             | M8+ Delivery Service                        |
| External Event Bus transport                      | M10                                         |
| Business capability modules                       | M9                                          |
| Enterprise operations                             | M10                                         |
| Law Firm product validation                       | Post-M8 planning gate                       |

---

## Recommended Next Milestones

| Milestone | Theme                                                   | Status                                                |
| --------- | ------------------------------------------------------- | ----------------------------------------------------- |
| **M8**    | **Platform Identity, Administration & User Experience** | **Next — planning complete; await IAUX-001 approval** |
| M9        | Business Capabilities                                   | Planned — consume Platform 5.0                        |
| M10       | Enterprise Operations                                   | Planned                                               |

See [SPR-008 sprint guide](../sprint/SPR-008-platform-identity-administration-ux.md) · [Platform Roadmap](../architecture/platform-roadmap.md).

---

## Related Documents

| Document                        | Path                                                                                                   |
| ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Platform Reference Architecture | [APZHUB-Platform-Reference-Architecture.md](../architecture/APZHUB-Platform-Reference-Architecture.md) |
| Platform Capability Matrix      | [APZHUB-Platform-Capability-Matrix.md](../architecture/APZHUB-Platform-Capability-Matrix.md)           |
| Platform Reference Patterns     | [APZHUB-Platform-Reference-Patterns.md](../architecture/APZHUB-Platform-Reference-Patterns.md)         |
| Platform v5.0 Review            | [APZHUB-v5.0-Platform-Review.md](../reviews/APZHUB-v5.0-Platform-Review.md)                            |
| SPR-008 Readiness Review        | [SPR-008-readiness-review.md](../reviews/SPR-008-readiness-review.md)                                  |
| Product Validation Strategy     | [APZHUB-Product-Validation-Strategy.md](../strategy/APZHUB-Product-Validation-Strategy.md)             |

---

_APZHUB Platform Version 5.0 — permanent architectural baseline. Supersedes Platform 4.0._
