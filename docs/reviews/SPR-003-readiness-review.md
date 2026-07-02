# SPR-003 — Readiness Review

> **Review date:** 2026-06-28 (updated post architecture refinement)  
> **Scope:** Sprint 003 — Workbench Framework (planning gate)  
> **Prerequisite:** Milestone 2 complete — `v0.2.0-platform-runtime`  
> **Recommendation:** **READY WITH OBSERVATIONS**

---

## Overall assessment

APZHUB is **ready to begin Sprint 003 planning execution** (Phase 0 ADRs) with documented observations that must be resolved before framework code merges.

Milestone 2 delivered a coherent Platform Runtime that satisfies the **engine-layer** requirements for Workbench Framework construction. The existing SPR-001 Desktop Shell (`@apzhub/workspace`, `@apzhub/ui`) provides a stable visual baseline. Specification documents 005, 016, 017, and 018 provide sufficient architectural guidance.

The **architecture refinement** (Desktop Framework → Workbench Framework) is complete. See [SPR-003 Architecture Refinement](./SPR-003-architecture-refinement.md).

Sprint 003 planning documents:

| Deliverable                      | Status                                                       |
| -------------------------------- | ------------------------------------------------------------ |
| Milestone 2 Architecture Review  | ✅ `docs/reviews/MILESTONE-002-platform-runtime-review.md`   |
| Platform Roadmap                 | ✅ `docs/architecture/platform-roadmap.md` (updated)         |
| Workbench Framework architecture | ✅ `docs/architecture/workbench-framework.md`                |
| Workbench Manager architecture   | ✅ `docs/architecture/workbench-manager.md`                  |
| Sprint 003 Guide                 | ✅ `docs/sprint/SPR-003-workbench-framework.md`              |
| Sprint 003 Implementation Plan   | ✅ `docs/sprint/SPR-003-implementation-plan.md` (refactored) |
| Architecture Refinement Report   | ✅ `docs/reviews/SPR-003-architecture-refinement.md`         |
| Readiness Review                 | ✅ This document                                             |

**No Sprint 003 production code should be written until this review, the architecture refinement report, and Phase 0 ADRs are approved.**

---

## Platform Runtime support for Workbench Framework

### What the runtime provides today

| Capability           | Runtime support               | Workbench Framework usage         |
| -------------------- | ----------------------------- | --------------------------------- |
| Capability discovery | ✅ Discovery Engine           | Find nav/view manifests           |
| Manifest validation  | ✅ Manifest Engine            | Validate nav/view extensions      |
| Registry index       | ✅ `PlatformRegistry` facade  | Source Activity Bar items         |
| Lifecycle `active`   | ✅ Orchestrator               | Load only active capabilities     |
| Server bootstrap     | ✅ `apps/web` instrumentation | Hydrate registry on server        |
| Permission metadata  | ⚠️ Not in registry            | Must filter at Workbench Manager  |
| View descriptors     | ⚠️ No view manifest kind      | Phase 4 extension required        |
| Navigation metadata  | ⚠️ Not in manifest envelope   | Phase 2 extension required        |
| Session state        | ❌ Not in runtime             | Workbench Framework owns (client) |
| Event Bus            | ❌ Deferred                   | Not required for Sprint 003       |
| Registry persistence | ❌ In-memory only             | Acceptable for Sprint 003         |

### Runtime boundary

Platform Runtime has **no React, UI, or Desktop Shell dependency** — verified in [architecture refinement report](./SPR-003-architecture-refinement.md#runtime-boundary-verification).

### Verdict

The Platform Runtime **fully supports** Sprint 003 **with planned extensions**:

1. **Navigation manifest block** — additive schema change in Manifest Engine (Phase 2)
2. **View manifest block** — additive schema change (Phase 4)
3. **`PlatformRegistry.getNavItems()`** — facade helper (Phase 2)
4. **Server-side registry hydration** — pattern documented in ADR (Phase 0)
5. **Workbench Request model** — capability integration contract (Phase 0 ADR)

No runtime subsystem rewrites are required. Extensions follow the same patterns established in SPR-002.

---

## Capability integration model

```text
Capability → Workbench Request → Workbench Manager → UI Update
```

Capabilities must never manipulate UI directly. See [workbench-framework.md](../architecture/workbench-framework.md).

---

## Outstanding questions

| #   | Question                                                                 | Owner                  | Blocking              |
| --- | ------------------------------------------------------------------------ | ---------------------- | --------------------- |
| Q1  | New package `@apzhub/workbench-framework` or extend `@apzhub/workspace`? | Architecture           | Phase 0 — **yes**     |
| Q2  | Workbench Request transport: in-process vs event-based?                  | Architecture           | Phase 0 — partial     |
| Q3  | Session persistence: localStorage, server API, or hybrid?                | Architecture + Product | Phase 5 — **partial** |
| Q4  | Nav metadata: envelope extension vs separate nav manifest file?          | Architecture           | Phase 2 — **yes**     |
| Q5  | PermissionService: extend `@apzhub/auth` or framework-local interface?   | Architecture           | Phase 7 — **yes**     |
| Q6  | Minimum Activity Bar items for Sprint 003 demo                           | Product                | Phase 3 — no          |
| Q7  | Tag strategy: `v0.3.0-workbench-framework` at Milestone 3 close?         | Owner                  | Phase 8 — no          |

---

## Risks

| Risk                                                       | Severity   | Mitigation                                         |
| ---------------------------------------------------------- | ---------- | -------------------------------------------------- |
| Capabilities bypass Workbench Request model                | **High**   | ADR + lint enforcement                             |
| Sprint 003 scope expands into Command/Search/Notifications | **High**   | Enforced out-of-scope; phase gates                 |
| Terminology confusion (DEF vs WBF)                         | Medium     | Cross-reference in M3 docs                         |
| Incomplete permission model blocks dynamic UI              | **High**   | Phase 7 dedicated; scaffold permissions in Phase 3 |
| Manifest schema churn breaks SPR-002 manifests             | **Medium** | Optional nav/view blocks only                      |
| Desktop Shell refactor causes E2E regression               | **Medium** | Incremental wiring; SPR-001 suite in CI            |
| Team parallelises runtime and framework changes            | **Medium** | Freeze runtime public API for Sprint 003           |
| Session persistence underestimated                         | **Medium** | In-memory first; persistence deferred              |

---

## Dependencies

### Completed

- ✅ Milestone 1 — Foundation (`v0.1.0-foundation`)
- ✅ Milestone 2 — Platform Runtime (`v0.2.0-platform-runtime`)
- ✅ Architecture refinement — Workbench Framework terminology
- ✅ Specification documents 005, 016, 017, 018, 023
- ✅ SPR-002 phase reports and architecture review

### Required before Phase 1 code

- [ ] Owner approval of architecture refinement report
- [ ] Owner approval of this readiness review
- [ ] Phase 0 ADRs approved
- [ ] Release tag `v0.2.0-platform-runtime` created (recommended baseline lock)

### External / future

- Event Bus (Milestone 4+) — not blocking Sprint 003
- PostgreSQL registry cache — not blocking Sprint 003
- Business modules — explicitly excluded

---

## Estimated effort

| Phase                                      | Estimate                   |
| ------------------------------------------ | -------------------------- |
| Phase 0 — ADRs & architecture              | 1–2 days                   |
| Phase 1 — Workbench Manager + Layout/Panel | 2–3 days                   |
| Phase 2 — Navigation Manager + nav schema  | 2–3 days                   |
| Phase 3 — Activity Bar                     | 2–3 days                   |
| Phase 4 — Workspace + View managers        | 3–4 days                   |
| Phase 5 — Dock + Session managers          | 2–3 days                   |
| Phase 6 — Context + Selection managers     | 2–3 days                   |
| Phase 7 — Workbench Requests + permissions | 2–3 days                   |
| Phase 8 — Closeout                         | 1–2 days                   |
| **Total**                                  | **20–28 engineering days** |

Assumes one primary engineer familiar with the codebase. Add 20% buffer for review cycles per ADR-0017.

---

## Recommendation

### **READY WITH OBSERVATIONS**

Sprint 003 may proceed to **Phase 0 (ADRs & Architecture Gate)** upon owner approval of the architecture refinement report and this review.

### Conditions for implementation start (Phase 1)

1. Architecture refinement report approved
2. Phase 0 ADRs approved — especially package boundary (Q1) and Workbench Request model (Q2)
3. `v0.2.0-platform-runtime` tag created to lock Milestone 2 baseline
4. Out-of-scope list acknowledged by all contributors
5. Nav manifest extension design approved before Phase 2 merge

### Stop condition

**Stop all Sprint 003 implementation** after this review until:

1. Owner reviews and approves planning documents and architecture refinement report
2. Phase 0 ADRs are written and approved
3. Explicit instruction to begin Phase 1

---

## Next steps (after approval)

1. Owner approves architecture refinement report and readiness review
2. Create git tag `v0.2.0-platform-runtime` (when instructed)
3. Execute Phase 0 — ADRs for workbench-framework package and Workbench Request model
4. Architecture review gate for Phase 1
5. Begin Phase 1 implementation

---

_SPR-003 readiness review — planning complete. Awaiting owner approval._
