# SPR-008 — Platform Identity, Administration & UX Engineering Backlog

> **Sprint:** SPR-008 — Platform Identity, Administration & User Experience  
> **Milestone:** 8  
> **Mode:** Planning complete — **await owner approval before IAUX-001**  
> **Authority:** [SPR-008 sprint guide](../sprint/SPR-008-platform-identity-administration-ux.md) · [Document 007](../007-identity-authentication-authorisation-rbac-architecture.md) · [Document 023](../023-user-preferences-personalisation-workspace-experience-framework.md) · [Platform v5.0](../releases/APZHUB-Platform-v5.0.md)

---

## Development workflow

Architecture redesign is not permitted. All stories extend Platform 5.0.

```text
Product Requirement (Documents 007, 023)
        ↓
Technical Specification
        ↓
Implementation
        ↓
Code Review
        ↓
Merge
        ↓
Release
```

**Rule:** Complete one story before beginning the next.

### Effort scale

| Label | Estimate  |
| ----- | --------- |
| S     | 0.5–1 day |
| M     | 1–2 days  |
| L     | 2–3 days  |

---

## Story map

```text
IAUX-001 Architecture & ADRs
    ↓
IAUX-002 PermissionService core ── IAUX-003 Session adapter
    ↓
IAUX-004 Registry filter integration
    ↓
IAUX-005 User admin ── IAUX-006 Role admin ── IAUX-007 RBAC admin UI
    ↓
IAUX-008 Preferences ── IAUX-009 Workspace ── IAUX-010 Theme persistence
    ↓
IAUX-011 Admin workspace ── IAUX-012 Platform configuration
    ↓
IAUX-013 Audit visibility & security review prep
    ↓
IAUX-014 Application integration (apps/web)
    ↓
IAUX-015 E2E tests
    ↓
IAUX-016 Documentation & governance
    ↓
IAUX-017 Production readiness ── IAUX-018 Sprint closeout
```

---

## IAUX-001 — Architecture & ADRs

| Field                | Value                                                                                                                             |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Story ID**         | IAUX-001                                                                                                                          |
| **Objective**        | Authorise Sprint 008 through accepted ADRs and specifications                                                                     |
| **Scope**            | PermissionService boundary ADR; RBAC model ADR; preference persistence ADR; admin workspace ADR; spec index; architecture outline |
| **Out of scope**     | Production code; framework redesign                                                                                               |
| **Deliverables**     | ADR-0036–0039 (proposed); `SPR-008-spec-index.md`; architecture updates                                                           |
| **Tests**            | N/A — documentation gate                                                                                                          |
| **Dependencies**     | Platform 5.0 approved; M7 closeout                                                                                                |
| **Estimated effort** | M                                                                                                                                 |

---

## IAUX-002 — PermissionService core

| Field                | Value                                                                       |
| -------------------- | --------------------------------------------------------------------------- |
| **Story ID**         | IAUX-002                                                                    |
| **Objective**        | Implement PermissionService with permission resolution API                  |
| **Scope**            | `hasPermission()`, `listPermissions()`, role binding interface; diagnostics |
| **Out of scope**     | UI; registry filter wiring                                                  |
| **Deliverables**     | `@apzhub/auth` or new platform package extension; unit tests                |
| **Tests**            | Unit — resolve, deny, diagnostics                                           |
| **Dependencies**     | IAUX-001                                                                    |
| **Estimated effort** | L                                                                           |

---

## IAUX-003 — Session permission adapter

| Field                | Value                                                                         |
| -------------------- | ----------------------------------------------------------------------------- |
| **Story ID**         | IAUX-003                                                                      |
| **Objective**        | Bridge auth session to PermissionService for server and client adapters       |
| **Scope**            | `createSessionPermissionAdapter()`; replace dev allow-all adapter in apps/web |
| **Out of scope**     | External IdP; admin UI                                                        |
| **Deliverables**     | Session adapter module; integration tests                                     |
| **Tests**            | Integration — session → permissions                                           |
| **Dependencies**     | IAUX-002                                                                      |
| **Estimated effort** | M                                                                             |

---

## IAUX-004 — Registry filter integration

| Field                | Value                                                                        |
| -------------------- | ---------------------------------------------------------------------------- |
| **Story ID**         | IAUX-004                                                                     |
| **Objective**        | Wire PermissionService into all platform DTO filter functions                |
| **Scope**            | Workbench, Action, Knowledge, Event, Notification, Activity/Timeline filters |
| **Out of scope**     | New registry types; admin UI                                                 |
| **Deliverables**     | Updated filter calls; regression tests per framework                         |
| **Tests**            | Unit + integration — disallowed entries stripped                             |
| **Dependencies**     | IAUX-003                                                                     |
| **Estimated effort** | L                                                                            |

---

## IAUX-005 — User administration scaffold

| Field                | Value                                                            |
| -------------------- | ---------------------------------------------------------------- |
| **Story ID**         | IAUX-005                                                         |
| **Objective**        | Platform user directory and CRUD scaffold (not business HR)      |
| **Scope**            | User list, create, deactivate; permission keys for admin actions |
| **Out of scope**     | External directory sync; business employee records               |
| **Deliverables**     | Platform service manifest; admin routes scaffold                 |
| **Tests**            | Unit — user service; integration — permission gates              |
| **Dependencies**     | IAUX-004                                                         |
| **Estimated effort** | M                                                                |

---

## IAUX-006 — Role administration scaffold

| Field                | Value                                                       |
| -------------------- | ----------------------------------------------------------- |
| **Story ID**         | IAUX-006                                                    |
| **Objective**        | Role CRUD and permission binding scaffold                   |
| **Scope**            | Role list, create, assign permissions; conflict diagnostics |
| **Out of scope**     | Business role templates; external IAM                       |
| **Deliverables**     | Role service; manifest permissions                          |
| **Tests**            | Unit — role binding                                         |
| **Dependencies**     | IAUX-002                                                    |
| **Estimated effort** | M                                                           |

---

## IAUX-007 — RBAC administration UI

| Field                | Value                                                        |
| -------------------- | ------------------------------------------------------------ |
| **Story ID**         | IAUX-007                                                     |
| **Objective**        | Admin workspace views for user and role management           |
| **Scope**            | Users view, Roles view, permission matrix read-only scaffold |
| **Out of scope**     | Business admin modules                                       |
| **Deliverables**     | Workbench views in admin workspace; component tests          |
| **Tests**            | Component + integration                                      |
| **Dependencies**     | IAUX-005, IAUX-006, IAUX-011                                 |
| **Estimated effort** | L                                                            |

---

## IAUX-008 — Preference persistence

| Field                | Value                                                      |
| -------------------- | ---------------------------------------------------------- |
| **Story ID**         | IAUX-008                                                   |
| **Objective**        | Persist user preferences per Document 023                  |
| **Scope**            | PreferenceService; storage backend (PostgreSQL); hydration |
| **Out of scope**     | Business preference domains                                |
| **Deliverables**     | Preference API; migration; unit tests                      |
| **Tests**            | Unit + integration — save/load                             |
| **Dependencies**     | IAUX-003                                                   |
| **Estimated effort** | L                                                          |

---

## IAUX-009 — Workspace persistence enhancement

| Field                | Value                                                                        |
| -------------------- | ---------------------------------------------------------------------------- |
| **Story ID**         | IAUX-009                                                                     |
| **Objective**        | Enhance Workbench session persistence with server-backed sync where required |
| **Scope**            | Session snapshot sync; conflict resolution stub                              |
| **Out of scope**     | Multi-device real-time sync                                                  |
| **Deliverables**     | Workbench session extension; tests                                           |
| **Tests**            | Unit + E2E session restore                                                   |
| **Dependencies**     | IAUX-008                                                                     |
| **Estimated effort** | M                                                                            |

---

## IAUX-010 — Theme persistence

| Field                | Value                                                              |
| -------------------- | ------------------------------------------------------------------ |
| **Story ID**         | IAUX-010                                                           |
| **Objective**        | Persist theme selection across reload and devices                  |
| **Scope**            | Theme preference key; Presentation Engine hook; hydration on login |
| **Out of scope**     | Custom theme authoring UI                                          |
| **Deliverables**     | Theme persistence integration; E2E theme test extension            |
| **Tests**            | Unit + E2E — theme survives reload                                 |
| **Dependencies**     | IAUX-008                                                           |
| **Estimated effort** | S                                                                  |

---

## IAUX-011 — Admin workspace scaffold

| Field                | Value                                                           |
| -------------------- | --------------------------------------------------------------- |
| **Story ID**         | IAUX-011                                                        |
| **Objective**        | Administration Activity Bar workspace with platform admin views |
| **Scope**            | Admin workspace manifest; navigation; permission gate           |
| **Out of scope**     | Business administration                                         |
| **Deliverables**     | Platform capability manifest; Workbench registration            |
| **Tests**            | Integration — admin workspace visible to admin role only        |
| **Dependencies**     | IAUX-004                                                        |
| **Estimated effort** | M                                                               |

---

## IAUX-012 — Platform configuration

| Field                | Value                                                           |
| -------------------- | --------------------------------------------------------------- |
| **Story ID**         | IAUX-012                                                        |
| **Objective**        | Operator-facing platform configuration visibility               |
| **Scope**            | Read-only config summary in admin workspace; health cross-links |
| **Out of scope**     | Runtime config mutation UI                                      |
| **Deliverables**     | Configuration admin view; diagnostics                           |
| **Tests**            | Integration — config view renders                               |
| **Dependencies**     | IAUX-011                                                        |
| **Estimated effort** | S                                                               |

---

## IAUX-013 — Audit visibility & security review prep

| Field                | Value                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------ |
| **Story ID**         | IAUX-013                                                                                   |
| **Objective**        | Surface framework audit events for operators; prepare security review checklist            |
| **Scope**            | Audit log read scaffold; `capability.action.executed` visibility; security review template |
| **Out of scope**     | Immutable audit store (M10); SIEM integration                                              |
| **Deliverables**     | Audit visibility view; security review doc draft                                           |
| **Tests**            | Integration — audit entries listed                                                         |
| **Dependencies**     | IAUX-011                                                                                   |
| **Estimated effort** | M                                                                                          |

---

## IAUX-014 — Application integration (`apps/web`)

| Field                | Value                                                                |
| -------------------- | -------------------------------------------------------------------- |
| **Story ID**         | IAUX-014                                                             |
| **Objective**        | Wire PermissionService, preferences, and admin workspace in apps/web |
| **Scope**            | Layout hydration; shell provider updates; health fields              |
| **Out of scope**     | E2E spec (IAUX-015); docs (IAUX-016)                                 |
| **Deliverables**     | App lib modules; provider stack; health extension                    |
| **Tests**            | Integration — permission-filtered hydration                          |
| **Dependencies**     | IAUX-004, IAUX-008, IAUX-011                                         |
| **Estimated effort** | L                                                                    |

---

## IAUX-015 — E2E verification

| Field                | Value                                                                  |
| -------------------- | ---------------------------------------------------------------------- |
| **Story ID**         | IAUX-015                                                               |
| **Objective**        | Playwright E2E for M8 integration                                      |
| **Scope**            | `spr-008-platform-identity-administration-ux.spec.ts`; env-gated hooks |
| **Out of scope**     | Law Firm product E2E                                                   |
| **Deliverables**     | E2E spec; test hooks                                                   |
| **Tests**            | E2E — RBAC, preferences, admin workspace, theme                        |
| **Dependencies**     | IAUX-014                                                               |
| **Estimated effort** | M                                                                      |

---

## IAUX-016 — Documentation & governance

| Field                | Value                                                               |
| -------------------- | ------------------------------------------------------------------- |
| **Story ID**         | IAUX-016                                                            |
| **Objective**        | Complete architecture, onboarding, governance updates               |
| **Scope**            | Identity/admin architecture doc; onboarding guide; handbook updates |
| **Out of scope**     | Closeout (IAUX-018)                                                 |
| **Deliverables**     | Docs set; spec index final                                          |
| **Tests**            | N/A — link review                                                   |
| **Dependencies**     | IAUX-014                                                            |
| **Estimated effort** | M                                                                   |

---

## IAUX-017 — Production readiness review

| Field                | Value                                                          |
| -------------------- | -------------------------------------------------------------- |
| **Story ID**         | IAUX-017                                                       |
| **Objective**        | Milestone 8 production readiness review                        |
| **Scope**            | `MILESTONE-008-production-readiness.md`; quality gate evidence |
| **Out of scope**     | Closeout (IAUX-018)                                            |
| **Deliverables**     | Production readiness document                                  |
| **Tests**            | Full quality gates                                             |
| **Dependencies**     | IAUX-015, IAUX-016                                             |
| **Estimated effort** | S                                                              |

---

## IAUX-018 — Sprint closeout

| Field                | Value                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------- |
| **Story ID**         | IAUX-018                                                                               |
| **Objective**        | Close Sprint 008; milestone review; release notes                                      |
| **Scope**            | `SPR-008-closeout.md`; `v0.8.0-platform-identity-administration-ux.md`; roadmap update |
| **Out of scope**     | M9 planning; Law Firm product                                                          |
| **Deliverables**     | Closeout; milestone review; release notes; CHANGELOG                                   |
| **Tests**            | Full quality gates                                                                     |
| **Dependencies**     | IAUX-017                                                                               |
| **Estimated effort** | S                                                                                      |

---

## Sprint 008 gate

**Do not begin IAUX-001** until:

1. Platform Version 5.0 owner approval recorded
2. SPR-008 sprint guide and backlog acknowledged
3. [SPR-008 readiness review](../reviews/SPR-008-readiness-review.md) approved

---

_SPR-008 Engineering Backlog — planning complete._
