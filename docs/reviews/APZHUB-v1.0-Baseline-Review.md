# APZHUB v1.0 — Baseline Architecture Review

> **Review date:** 2026-06-28  
> **Scope:** Architecture Baseline v1.0 — Milestones 1–3 (Foundation, Runtime, Workbench)  
> **Documents reviewed:** Baseline v1.0, ADRs 0001–0023, Milestone reviews, phase reports  
> **Conclusion:** **READY WITH OBSERVATIONS**

---

## Purpose

Review the complete APZHUB architecture at Baseline v1.0 freeze. Assess strengths, weaknesses, risks, and readiness for Sprint 004 planning — without implementing Sprint 004.

---

## Architecture summary

Baseline v1.0 consolidates three delivered milestones:

| Milestone              | Release                    | Package(s)                 |
| ---------------------- | -------------------------- | -------------------------- |
| M1 Foundation          | v0.1.0-foundation          | ui, workspace, auth, theme |
| M2 Platform Runtime    | v0.2.0-platform-runtime    | platform-runtime           |
| M3 Workbench Framework | v0.3.0-workbench-framework | workbench-framework        |

Five-layer model frozen: Runtime → Workbench → Platform Capabilities → Business Capabilities → Business Data.

Three API layers frozen: Runtime API → Workbench API → Capability API.

---

## Strengths

### Layer separation

Runtime is provably UI-agnostic (no React in `platform-runtime`). Workbench owns all presentation orchestration. Clear dependency direction enforced in Document 000 §6.1 and baseline.

### Manifest-first registration

Unified envelope, Discovery → Manifest → Dependency Graph → Registry pipeline is deterministic and testable. 383 unit tests and 15 E2E tests validate baseline behaviour.

### Request transport model

ADR-0020 Workbench Request Bus prevents capability→engine bypass. Workbench API v1.0 provides stable integration surface for shell and future capabilities.

### Phased delivery discipline

ADR-0017 review gates produced nine SPR-002 phase reports and eight SPR-003 phase reports. Technical debt is documented, not hidden.

### Permission architecture

Adapter DI, server-side registry filter, and session restore sanitisation establish correct security boundary before Milestone 8 RBAC population.

### Diagnostics culture

Runtime and Workbench subsystems expose diagnostics. Integrated `Runtime.getDiagnostics()` supports operational visibility.

### Documentation corpus

Foundation documents 000–029, 14 architecture subsystem docs, 23 ADRs, milestone reviews, release notes, and new governance guides form a coherent reference set.

---

## Weaknesses

### Incomplete presentation surface

Tab bar UI, view content mount pipeline, context panel UI, and selection UI are engine-complete but not fully surfaced in shell. Acceptable for infrastructure release; creates UX gap until addressed.

### RBAC data gap

`AuthWorkbenchPermissionAdapter` structure exists; permission keys not populated from auth session until Milestone 8. Interim allow-all behaviour in auth mode must be understood by operators.

### Registry persistence

In-memory Capability Registry only. ADR-0009 hybrid PostgreSQL cache not implemented. Restart requires full rediscovery — acceptable for current scale.

### Legacy coexistence

`module.navigation` alongside `workbench.navigation`; engine exports on workbench package index; `getManager()` bus escape hatch — minor consistency debt.

### Command Framework absent

Workbench Actions and Command Bridge interface prepared but not implemented. Sprint 004 must deliver without breaking Workbench API v1.0 contracts.

---

## Future risks

| Risk                                          | Likelihood | Impact | Mitigation                                         |
| --------------------------------------------- | ---------- | ------ | -------------------------------------------------- |
| Capability authors bypass Workbench API       | Medium     | High   | Baseline rules, lint, code review, SDK enforcement |
| Sprint 004 scope creep into Workbench rewrite | Medium     | High   | SPR-004 planning doc; ADR gate; no M3 debt in S4   |
| RBAC delay blocks business capabilities       | Medium     | Medium | M8 prioritisation; permission keys declared early  |
| Manifest schema drift across kinds            | Low        | Medium | ADR for new kinds; envelope versioning             |
| Session schema breaking changes               | Low        | Medium | Version bumps; restore migration path              |
| Monorepo growth without package boundaries    | Medium     | Medium | Baseline package standards; ADR for new packages   |

---

## Extension points

| Extension                    | Baseline state           | Next sprint/milestone |
| ---------------------------- | ------------------------ | --------------------- |
| Workbench Actions → Commands | Types + map ready        | Sprint 004            |
| Command Palette              | Document 019 spec        | Sprint 004            |
| Keyboard shortcuts           | Action metadata reserved | Sprint 004            |
| View mount pipeline          | Route activation only    | M9 / capability SDK   |
| Event Bus                    | Manifest kinds exist     | M4+ / Document 012    |
| Search / Notification        | Roadmap M5–M6            | Future sprints        |
| RBAC population              | Adapter ready            | M8                    |
| Server session sync          | localStorage only        | M8                    |

---

## Scalability

### Runtime

Discovery scans filesystem roots — suitable for tens to low hundreds of manifests. PostgreSQL cache (ADR-0009) needed before large deployments. Dependency graph is O(V+E) — adequate.

### Workbench

Client-side session in localStorage — per-user, per-browser. No cross-device sync until M8. Engine decomposition allows independent scaling of subsystems in code.

### Organisation

Monorepo with package boundaries supports team parallelisation. Baseline package standards clarify ownership.

**Assessment:** Scalable for current phase; known optimisations documented and deferred appropriately.

---

## Maintainability

| Factor                          | Assessment                             |
| ------------------------------- | -------------------------------------- |
| Subsystem single responsibility | Strong                                 |
| Test coverage                   | Strong (383 unit, 15 E2E)              |
| ADR traceability                | Strong (23 accepted ADRs)              |
| Governance guides               | Strong (new Baseline v1.0 + handbooks) |
| Technical debt register         | Good (SPR-003 closeout)                |
| API stability                   | Good — Workbench API v1.0 frozen       |

Refactors should prefer adapters and extension points over engine coupling.

---

## Readiness for Sprint 004

| Criterion                         | Status                          |
| --------------------------------- | ------------------------------- |
| Workbench API stable              | ✅ v1.0                         |
| WorkbenchAction types exist       | ✅                              |
| REQUEST_COMMAND_MAP exists        | ✅                              |
| WorkbenchCommandBridge interface  | ✅ Documented                   |
| Permission filter pattern         | ✅ Reusable for action registry |
| Document 019 Command Palette spec | ✅ Foundation doc               |
| Baseline frozen                   | ✅ v1.0                         |
| No blocking M3 defects            | ✅                              |

Sprint 004 may proceed to **planning and ADR phase**. Implementation requires owner approval after readiness review.

---

## Conclusion

**READY WITH OBSERVATIONS**

Architecture Baseline v1.0 is coherent, tested, documented, and suitable as the permanent engineering reference. Observations (presentation gaps, RBAC data, registry persistence, Command Framework delivery) are accepted deferred work with clear milestone ownership — not blockers for baseline freeze or Sprint 004 planning.

---

_APZHUB v1.0 Baseline Architecture Review._
