# SPR-008 — Platform Identity, Administration & User Experience

> **Sprint:** SPR-008  
> **Milestone:** 8 — Platform Identity, Administration & User Experience  
> **Status:** **Planning complete** — await owner approval before IAUX-001  
> **Authority:** [Document 007](../007-identity-authentication-authorisation-rbac-architecture.md) · [Document 023](../023-user-preferences-personalisation-workspace-experience-framework.md) · [Platform v5.0](../releases/APZHUB-Platform-v5.0.md) · [SPR-008 backlog](../backlog/SPR-008-platform-identity-administration-ux-backlog.md)

---

## Initiative rename

At Milestone 8 planning, the initiative is formally named **Platform Identity, Administration & User Experience**. This supersedes the earlier roadmap label **Identity & Administration** and reflects the dual deliverable:

1. **Identity layer** — PermissionService, RBAC enforcement, user and role administration (Document 007)
2. **User experience layer** — preference, workspace, and theme persistence; admin workspace scaffold (Document 023)

Platform 5.0 capabilities **consume** PermissionService for registry filtering. Products never bypass permission adapters.

Story IDs use prefix **IAUX-** (Identity, Administration & UX).

---

## Vision

APZHUB requires enterprise-grade identity integration, real permission enforcement across all platform registries, and persistent user experience state — without redesigning Runtime, Workbench, or M4–M7 platform frameworks.

Milestone 8 establishes:

- **PermissionService** — session-backed permission resolution consumed by all DTO filters
- **RBAC administration** — role and permission assignment scaffold
- **User administration** — platform user management scaffold (not business HR)
- **Role administration** — role CRUD and permission binding
- **Preference persistence** — Document 023 preferences model with storage
- **Workspace persistence** — enhanced session + server-backed preferences where required
- **Theme persistence** — user theme selection survives reload
- **Admin workspace scaffold** — administration Activity Bar workspace (no business admin)
- **Platform configuration** — operator-facing configuration visibility
- **Audit visibility** — framework action audit surfacing for operators
- **Security review** — formal M8 security assessment

SPR-008 delivers platform identity and UX foundations — not business modules, not Law Firm product, not external IAM replacement.

---

## Objectives

1. Authorise implementation through ADRs and technical specifications (IAUX-001)
2. Implement PermissionService and session permission adapter (IAUX-002–IAUX-004)
3. Deliver user and role administration scaffolds (IAUX-005–IAUX-007)
4. Deliver preference, workspace, and theme persistence (IAUX-008–IAUX-010)
5. Integrate admin workspace and platform configuration (IAUX-011–IAUX-012)
6. Deliver audit visibility and security review (IAUX-013)
7. Application integration in `apps/web` (IAUX-014)
8. E2E verification (IAUX-015)
9. Documentation and governance (IAUX-016)
10. Production readiness review and closeout (IAUX-017–IAUX-018)

---

## What this sprint is not

| Concern                                    | Relationship                              |
| ------------------------------------------ | ----------------------------------------- |
| Business HR / payroll                      | Out of scope — platform user admin only   |
| Law Firm product                           | Out of scope — product validation post-M8 |
| External IdP federation                    | Interface stubs; full SSO M9+             |
| Activity/notification persistence redesign | Out of scope — M8 may add hooks only      |
| Runtime orchestrator rewrite               | Forbidden — extend via ADR only           |
| Workbench engine redesign                  | Forbidden — admin workspace is additive   |

---

## Platform 5.0 constraints (non-negotiable)

- **No Runtime redesign** — PermissionService integrates via adapters and health providers
- **No Workbench redesign** — admin workspace follows Surface Pattern
- **No Action Framework executor changes** — permission checks extend adapter, not dispatch path
- **No Knowledge / ENF / ATF package redesign** — filter functions consume PermissionService only
- **No business modules** — administration scaffold only
- **Baseline v1.0 frozen** — ADR required for baseline edits

---

## Canonical integration model

```text
Auth session (@apzhub/auth)
        ↓
PermissionService
        ↓
Permission Adapter (session-backed)
        ↓
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Workbench    │ Action       │ Knowledge    │ Event/Notif  │
│ filter DTO   │ filter DTO   │ filter DTO   │ filter DTO   │
│              │              │              │ Activity DTO │
└──────────────┴──────────────┴──────────────┴──────────────┘
        ↓
Client hydration (permission-filtered registries)
        ↓
Preference / Theme / Workspace persistence
        ↓
Admin workspace (scaffold)
```

---

## Story outline

| Story    | Title                                   | Status     |
| -------- | --------------------------------------- | ---------- |
| IAUX-001 | Architecture & ADRs                     | ⏳ Planned |
| IAUX-002 | PermissionService core                  | ⏳ Planned |
| IAUX-003 | Session permission adapter              | ⏳ Planned |
| IAUX-004 | Registry filter integration             | ⏳ Planned |
| IAUX-005 | User administration scaffold            | ⏳ Planned |
| IAUX-006 | Role administration scaffold            | ⏳ Planned |
| IAUX-007 | RBAC administration UI                  | ⏳ Planned |
| IAUX-008 | Preference persistence                  | ⏳ Planned |
| IAUX-009 | Workspace persistence enhancement       | ⏳ Planned |
| IAUX-010 | Theme persistence                       | ⏳ Planned |
| IAUX-011 | Admin workspace scaffold                | ⏳ Planned |
| IAUX-012 | Platform configuration                  | ⏳ Planned |
| IAUX-013 | Audit visibility & security review prep | ⏳ Planned |
| IAUX-014 | Application integration (`apps/web`)    | ⏳ Planned |
| IAUX-015 | E2E verification                        | ⏳ Planned |
| IAUX-016 | Documentation & governance              | ⏳ Planned |
| IAUX-017 | Production readiness review             | ⏳ Planned |
| IAUX-018 | Sprint closeout                         | ⏳ Planned |

Backlog: [SPR-008-platform-identity-administration-ux-backlog.md](../backlog/SPR-008-platform-identity-administration-ux-backlog.md)

---

## Quality gates

Every story must pass:

```bash
pnpm lint && pnpm typecheck && pnpm build
pnpm test && pnpm test:coverage
pnpm test:e2e   # when UI/integration affected
```

Platform 5.0 baseline at IAUX-001 gate: **1308 tests**, **36 E2E tests**, **90.58%** coverage.

---

## Stop condition

**Do not begin IAUX-001 implementation** until owner approves:

1. Platform Version 5.0 baseline
2. This sprint guide and backlog
3. [SPR-008 readiness review](../reviews/SPR-008-readiness-review.md)

---

_SPR-008 Platform Identity, Administration & User Experience — Milestone 8 planning guide._
