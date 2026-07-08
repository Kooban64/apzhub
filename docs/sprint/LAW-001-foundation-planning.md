# LAW-001 — Foundation Planning

> **Sprint:** LAW-001 — Law Platform Foundation  
> **Product:** Law Firm Platform v1.0  
> **Platform baseline:** [Platform Version 5.0](../releases/APZHUB-Platform-v5.0.md) — **frozen**  
> **Status:** **Planning complete** — await owner approval before LAW-001-01 implementation  
> **Authority:** [Law Platform v1.0](../releases/APZHUB-Law-Platform-v1.0.md) · [LAW Platform Backlog](../backlog/LAW-Platform-Backlog.md)

---

## Sprint purpose

LAW-001 is Sprint 1 of the Law Firm Platform — the **foundation milestone**. It establishes legal capability manifest structure, Runtime discovery, empty Workbench workspace registration, and smoke validation hooks for Action, Event, and Activity frameworks.

This sprint guide covers **planning only**. No application code in Phase 1.

---

## Objectives

1. Define legal manifest envelope and discovery roots
2. Plan legal platform service layout under `services/legal-*`
3. Plan Workbench workspace scaffold for "Legal" Activity Bar entry
4. Plan smoke legal action, event, notification route, and activity type declarations
5. Plan health extension for legal services on `/api/health`
6. Define LAW-001 engineering stories with explicit platform validation statements
7. Gate implementation on owner approval

---

## Platform frameworks validated (LAW-001 target)

| Framework                 | LAW-001 validation intent                                            |
| ------------------------- | -------------------------------------------------------------------- |
| **Platform Runtime**      | Discover and register legal-capability manifests; lifecycle + health |
| **Workbench Framework**   | Register empty legal workspace; sidebar scaffold                     |
| **Action Framework**      | One smoke legal action via shared executor                           |
| **Event & Notification**  | Register legal event namespace + one notification route              |
| **Activity & Timeline**   | Register one legal activity type + timeline scope binding            |
| **Knowledge & Discovery** | Optional stub provider declaration (secondary)                       |

---

## Planned deliverables (implementation phase — not started)

| Deliverable                    | Description                                                                  |
| ------------------------------ | ---------------------------------------------------------------------------- |
| `services/legal-platform/`     | Root legal platform service manifest                                         |
| Legal manifest schema appendix | YAML blocks: `workbench`, `actions`, `events`, `notifications`, `activities` |
| Workbench workspace            | `legal.home` workspace — placeholder views                                   |
| Smoke action                   | `legal.platform.smoke` — validates executor wiring                           |
| Smoke event                    | `legal.platform.validated` — validates EventRegistry bootstrap               |
| Health extension               | `legal` field on `/api/health`                                               |
| Unit + integration tests       | Bootstrap and manifest validation                                            |
| E2E smoke                      | Legal workspace visible after login (future LAW-001-06)                      |

---

## Story outline (LAW-001)

| Story      | Title                                            | Platform validation                          |
| ---------- | ------------------------------------------------ | -------------------------------------------- |
| LAW-001-01 | Legal architecture & manifest specification      | Runtime manifest contract                    |
| LAW-001-02 | Legal platform service scaffold                  | **Runtime** — discovery, lifecycle           |
| LAW-001-03 | Legal Workbench workspace registration           | **Workbench** — navigation, views            |
| LAW-001-04 | Smoke legal action                               | **Action Framework** — executor, audit       |
| LAW-001-05 | Smoke event, notification, activity registration | **Event/Notification/Timeline** — registries |
| LAW-001-06 | Legal health + E2E smoke                         | **Runtime** + cross-framework E2E            |

Full story definitions: [LAW-Platform-Backlog.md](../backlog/LAW-Platform-Backlog.md).

---

## Architecture constraints

| Rule                    | Detail                                                                                       |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| Platform 5.0 frozen     | No changes to `@apzhub/platform-runtime`, workbench, command, kdf, enf, atf except bug fixes |
| No M8                   | Do not start IAUX stories                                                                    |
| Consume platform        | Legal code in `services/` manifests + handlers only                                          |
| No forked shell         | Extend `apps/web` hydration pattern — do not duplicate providers                             |
| Validation traceability | Every story lists frameworks validated                                                       |

---

## Dependencies

| Dependency                            | Status      |
| ------------------------------------- | ----------- |
| Platform Version 5.0 approved         | ✅          |
| Law Platform planning docs complete   | ✅          |
| Platform Validation Phase 1 readiness | ✅          |
| Owner approval for LAW-001-01         | ⏳ Required |

---

## Quality gates (implementation phase)

When LAW-001 implementation begins, every story must pass:

```bash
pnpm lint && pnpm typecheck && pnpm build
pnpm test && pnpm test:coverage
pnpm test:e2e   # when UI/integration affected
```

Baseline at planning gate: **1308 tests**, **36 E2E**, **90.58%** coverage.

---

## Stop condition

**Planning complete.** Do not begin LAW-001-01 until owner approves:

1. [APZHUB-Law-Platform-Readiness.md](../reviews/APZHUB-Law-Platform-Readiness.md)
2. This sprint plan
3. [LAW-Platform-Backlog.md](../backlog/LAW-Platform-Backlog.md)

No production implementation permitted during Phase 1.

---

_LAW-001 Foundation Planning — Platform Validation Phase 1._
