# SPR-008 — Readiness Review

> **Review date:** 2026-07-05  
> **Scope:** Platform Version 5.0 readiness to commence Milestone 8 — Platform Identity, Administration & User Experience  
> **Authority:** [APZHUB Platform v5.0](../releases/APZHUB-Platform-v5.0.md) · [Platform v5.0 Review](./APZHUB-v5.0-Platform-Review.md) · [Document 007](../007-identity-authentication-authorisation-rbac-architecture.md) · [Document 023](../023-user-preferences-personalisation-workspace-experience-framework.md)  
> **Verdict:** **APPROVED FOR MILESTONE 8 PLANNING — await owner approval before IAUX-001 implementation**

---

## Executive summary

Platform Version 5.0 provides a stable, tested, and documented foundation for Milestone 8. All six platform capability frameworks (Action, Knowledge, Event/Notification, Activity/Timeline) expose permission-filtered DTO hydration — currently using a development allow-all adapter. Milestone 8 replaces this with a real **PermissionService** without redesigning filter function signatures.

Milestone 7 closeout is complete. Milestone 8 planning documentation is delivered. **Implementation must not begin** until owner approves IAUX-001 (ADRs and specifications).

**Recommendation:** **APPROVED FOR MILESTONE 8 PLANNING**

---

## Readiness assessment

| Area                           | Status          | Notes                                                  |
| ------------------------------ | --------------- | ------------------------------------------------------ |
| Architecture baseline          | ✅ Ready        | v1.0 frozen; Platform 5.0 extends without redesign     |
| Permission adapter interface   | ✅ Ready        | All filter functions accept adapter parameter          |
| Auth session (`@apzhub/auth`)  | ✅ Ready        | Session available; needs PermissionService bridge      |
| Workbench session persistence  | ✅ Ready        | localStorage schema; M8 adds server sync               |
| Theme switching                | ✅ Ready        | Client-only today; M8 persistence                      |
| Admin workspace pattern        | ✅ Ready        | Workbench manifest precedent from example capabilities |
| Health endpoint                | ✅ Ready        | Incremental field pattern proven M4–M7                 |
| Test infrastructure            | ✅ Ready        | Vitest + Playwright; spr-007 patterns                  |
| Documentation patterns         | ✅ Ready        | Capability Matrix; Reference Patterns                  |
| M8 sprint guide / backlog      | ✅ Complete     | This review gate                                       |
| Database / preferences storage | ⏳ Pending      | Document 011 alignment in IAUX-008 spec                |
| External IdP                   | ⏳ Out of scope | Stubs only in M8                                       |

---

## Risks

| ID        | Risk                                    | Likelihood | Impact | Mitigation                                        |
| --------- | --------------------------------------- | ---------- | ------ | ------------------------------------------------- |
| R-IAUX-01 | PermissionService redesigns filter APIs | Medium     | High   | IAUX-001 ADR — adapter interface unchanged        |
| R-IAUX-02 | RBAC scope creep into business HR       | Medium     | High   | Platform user admin only; charter in sprint guide |
| R-IAUX-03 | Workbench session rewrite               | Medium     | High   | Enhance, don't replace; IAUX-009 scoped           |
| R-IAUX-04 | Breaking M4–M7 hydration                | Medium     | High   | IAUX-004 regression tests per framework           |
| R-IAUX-05 | Preference schema churn                 | Medium     | Medium | Document 023 locked fields in IAUX-001            |
| R-IAUX-06 | Admin workspace exposes business routes | Low        | High   | Scaffold only; permission-gated                   |
| R-IAUX-07 | Security review deferred                | Medium     | High   | IAUX-013 mandatory before closeout                |
| R-IAUX-08 | Law Firm product starts early           | Medium     | High   | Product Validation Strategy gate                  |

---

## Open decisions

| ID        | Decision                                                                              | Owner        | Target        |
| --------- | ------------------------------------------------------------------------------------- | ------------ | ------------- |
| Q-IAUX-01 | PermissionService package: extend `@apzhub/auth` vs new `@apzhub/identity-framework`? | Architecture | IAUX-001 ADR  |
| Q-IAUX-02 | Preference storage: PostgreSQL table design vs key-value store?                       | Architecture | IAUX-008 spec |
| Q-IAUX-03 | Server workspace sync: full snapshot vs delta?                                        | Architecture | IAUX-009 spec |
| Q-IAUX-04 | Admin workspace Activity Bar icon and route prefix?                                   | Product/UX   | IAUX-011 spec |
| Q-IAUX-05 | Audit visibility: query existing action audit events vs new store?                    | Architecture | IAUX-013 spec |
| Q-IAUX-06 | Default roles for dev/seed environment?                                               | Engineering  | IAUX-005 spec |

---

## Required ADRs (IAUX-001)

| ADR      | Proposed title                             | Scope                             |
| -------- | ------------------------------------------ | --------------------------------- |
| ADR-0036 | PermissionService Package Boundary         | Package location, public API      |
| ADR-0037 | RBAC Model and Registry Filter Integration | Permission keys, adapter contract |
| ADR-0038 | Preference Persistence Model               | Document 023 alignment, storage   |
| ADR-0039 | Administration Workspace Scaffold          | Admin workspace boundary          |

---

## Dependencies

| Dependency                 | Source       | Status                         |
| -------------------------- | ------------ | ------------------------------ |
| Platform 5.0 baseline      | M7 closeout  | ✅ Complete                    |
| `@apzhub/auth` session     | M1           | ✅ Available                   |
| All DTO filter functions   | M3–M7        | ✅ Accept adapter              |
| Workbench Framework        | M3           | ✅ Admin workspace mount point |
| Platform data architecture | Document 011 | ⏳ IAUX-008 alignment          |
| Document 007 IAM model     | Foundation   | ✅ Authoritative               |
| Document 023 preferences   | Foundation   | ✅ Authoritative               |

---

## Recommended first story

**IAUX-001 — Architecture & ADRs**

Rationale:

1. Locks PermissionService boundary before any implementation
2. Resolves Q-IAUX-01 through Q-IAUX-06 in specifications
3. Defines ADR-0036–0039 acceptance criteria
4. Creates `SPR-008-spec-index.md` for IAUX-002–IAUX-018
5. No production code — documentation gate matching AT-001 / EN-001 pattern

**Do not begin IAUX-002** until IAUX-001 ADRs are owner-approved.

---

## Quality gate baseline

Platform 5.0 at M8 planning gate (2026-07-05):

| Gate                 | Result               |
| -------------------- | -------------------- |
| `pnpm lint`          | ✅ Pass              |
| `pnpm typecheck`     | ✅ Pass              |
| `pnpm build`         | ✅ Pass              |
| `pnpm test`          | ✅ 1308 tests        |
| `pnpm test:coverage` | ✅ 90.58% statements |
| `pnpm test:e2e`      | ✅ 36 tests          |

---

## Verdict

**APPROVED FOR MILESTONE 8 PLANNING**

Platform Version 5.0 is ready for Milestone 8 planning and IAUX-001 architecture gate. Implementation of PermissionService, administration scaffold, and preference persistence must follow sequential story approval.

**Stop:** Await owner approval before IAUX-001.

---

_SPR-008 Readiness Review — Milestone 8 planning gate._
