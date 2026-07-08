# APZHUB Platform Version 3.0 — Platform Review

> **Platform Version:** 3.0  
> **Review date:** 2026-07-03  
> **Scope:** Milestones 1–5 collective baseline — Runtime, Workbench, Action Framework, Knowledge & Discovery Framework  
> **Type:** Observations only — no redesign  
> **Verdict:** **PASS WITH OBSERVATIONS — Platform 3.0 baseline approved**

---

## Executive summary

Platform Version 3.0 consolidates five milestones into a coherent enterprise platform: manifest-driven Runtime, registry-based Workbench, unified Action execution, and unified Knowledge discovery. Lower layers remain intact; Milestone 5 added the Knowledge layer without introducing parallel execution paths.

**872 unit tests**, **24 E2E tests**, **91.55%** statement coverage at Milestone 5 closeout. ADRs 0010–0029 accepted.

This review records **observations** across the four primary subsystems. It does not propose architectural redesign.

---

## Runtime

### Layering

| Observation                | Assessment                                                              |
| -------------------------- | ----------------------------------------------------------------------- |
| UI-agnostic boundary       | **Strong** — no React in `platform-runtime`                             |
| Subsystem decomposition    | **Strong** — orchestrator, manifest engine, registry, lifecycle, health |
| Server/client export split | **Strong** — enforced via package exports                               |

### Dependency direction

| Observation           | Assessment                                                    |
| --------------------- | ------------------------------------------------------------- |
| Downward imports only | **Strong** — no upward imports from Workbench or frameworks   |
| Capability discovery  | **Strong** — filesystem manifests; normalised envelope        |
| Bootstrap authority   | **Strong** — server-side registration before client hydration |

### Platform consistency

| Observation                | Assessment                                                                      |
| -------------------------- | ------------------------------------------------------------------------------- |
| Registry Pattern alignment | **Strong** — Capability Registry sets template for M3–M5                        |
| Health reporting           | **Good** — `/api/health` aggregates runtime, DB, Redis; extended by M4/M5       |
| Diagnostics                | **Good** — structured subsystem diagnostics; dev vs production separation clear |

### Reuse

| Observation          | Assessment                                                     |
| -------------------- | -------------------------------------------------------------- |
| Manifest Engine      | **Strong** — reused by Workbench, Action, Knowledge extraction |
| Permission adapter   | **Good** — shared pattern; RBAC population deferred to M8      |
| Shared types package | **Good** — cross-package DTO contracts                         |

### Technical debt

| ID        | Observation                                                                 | Severity       |
| --------- | --------------------------------------------------------------------------- | -------------- |
| TD-RT-M6  | Event manifest validation exists as stub from SPR-002 — needs ENF bootstrap | Low            |
| TD-RT-M8  | RBAC keys declared but not populated in permission adapter                  | Known — M8     |
| TD-RT-M10 | No centralised observability beyond health endpoint                         | Expected — M10 |

### Readiness for M6

| Observation                 | Assessment                                                |
| --------------------------- | --------------------------------------------------------- |
| Manifest extension path     | **Ready** — ADR-gated `events` block fits existing engine |
| Bootstrap chain             | **Ready** — parallel hydration pattern proven (M4, M5)    |
| No Runtime rewrite required | **Confirmed**                                             |

---

## Workbench Framework

### Layering

| Observation      | Assessment                                               |
| ---------------- | -------------------------------------------------------- |
| Engine isolation | **Strong** — capabilities use Workbench API, not engines |
| React boundary   | **Strong** — `/react` export; server types separate      |
| Request Bus      | **Strong** — single in-process transport (ADR-0020)      |

### Dependency direction

| Observation                                 | Assessment                                         |
| ------------------------------------------- | -------------------------------------------------- |
| Consumes Runtime DTOs                       | **Strong** — hydration from server registry        |
| Does not import Action/Knowledge frameworks | **Strong** — shell composes at apps/web            |
| Surface Pattern                             | **Strong** — presentation separated from execution |

### Platform consistency

| Observation                 | Assessment                                           |
| --------------------------- | ---------------------------------------------------- |
| Navigation registry         | **Strong** — consistent with Registry Pattern        |
| Session persistence         | **Good** — scaffold functional; production depth M8+ |
| Workbench commands manifest | **Good** — bridge to Action Framework (ADR-0025)     |

### Reuse

| Observation                      | Assessment                                                                     |
| -------------------------------- | ------------------------------------------------------------------------------ |
| Navigation DTO consumed by KDF   | **Strong** — WorkbenchNavigationKnowledgeProvider                              |
| Shell structural regions         | **Good** — Activity Bar, Sidebar, Status Bar stable for M6 notification region |
| Workbench API executor injection | **Strong** — shared Action executor in apps/web                                |

### Technical debt

| ID       | Observation                                                        | Severity           |
| -------- | ------------------------------------------------------------------ | ------------------ |
| TD-WB-M6 | Notification region in Document 016 not yet implemented — M6 scope | Planned            |
| TD-WB-Q2 | Request transport Event Bus bridge deferred (ADR-0020)             | Low — optional M6+ |
| TD-WB-UX | Duplicate theme controls in shell                                  | Low — UX story     |

### Readiness for M6

| Observation                          | Assessment                                              |
| ------------------------------------ | ------------------------------------------------------- |
| Shell extension points               | **Ready** — notification region follows Surface Pattern |
| No Workbench engine changes required | **Confirmed** for planned M6 scope                      |

---

## Action Framework

### Layering

| Observation                     | Assessment                                                                  |
| ------------------------------- | --------------------------------------------------------------------------- |
| Registry vs executor separation | **Strong** — registration server-side; execute client/server boundary clear |
| Platform Capability placement   | **Strong** — sits above Workbench API via bridge                            |
| Surface consumption             | **Strong** — palette, shortcuts, toolbar, context menu read-only            |

### Dependency direction

| Observation               | Assessment                                                |
| ------------------------- | --------------------------------------------------------- |
| Bridge to Workbench       | **Strong** — `WorkbenchCommandBridge`; no engine bypass   |
| Does not import Knowledge | **Strong** — palette knowledge mode composed in workspace |
| apps/web composition      | **Strong** — single shared executor instance              |

### Platform consistency

| Observation                | Assessment                                     |
| -------------------------- | ---------------------------------------------- |
| Single execution pipeline  | **Strong** — ADR-0026 enforced                 |
| Actor model                | **Good** — user/system/ai-agent/voice scaffold |
| Audit hook extension point | **Good** — no-op stub ready for Event Bus (M6) |

### Reuse

| Observation                 | Assessment                                       |
| --------------------------- | ------------------------------------------------ |
| Action DTO projected to KDF | **Strong** — ActionRegistryKnowledgeProvider     |
| Shortcut normalisation      | **Strong** — single chord registry               |
| Manifest extraction         | **Strong** — shared with Runtime manifest engine |

### Technical debt

| ID         | Observation                                   | Severity            |
| ---------- | --------------------------------------------- | ------------------- |
| TD-AF20-01 | Manifest bridge id resolution edge cases      | Medium — documented |
| TD-AF20-02 | Service/event handler actors NOT_IMPLEMENTED  | Expected — M9       |
| TD-AF-M6   | Audit hook publishes nothing — wire in EN-014 | Planned             |

### Readiness for M6

| Observation                   | Assessment                                             |
| ----------------------------- | ------------------------------------------------------ |
| Audit → Event Bus integration | **Ready** — extension point exists; no executor change |
| Action executed events        | **Ready** — natural first platform event               |

---

## Knowledge & Discovery Framework

### Layering

| Observation                         | Assessment                                                                    |
| ----------------------------------- | ----------------------------------------------------------------------------- |
| Six-layer canonical model           | **Strong** — Sources → Registry → Query → Service → Presentation → Experience |
| Public API boundary                 | **Strong** — `KnowledgeService`, `useKnowledgeService()`                      |
| No Experience → Orchestrator import | **Strong** — enforced in production paths                                     |

### Dependency direction

| Observation              | Assessment                                  |
| ------------------------ | ------------------------------------------- |
| Provider projection only | **Strong** — consumes Action/Workbench DTOs |
| ADR-0029 compliance      | **Strong** — no parallel execution pipeline |
| Package boundaries       | **Strong** — ADR-0027 exports respected     |

### Platform consistency

| Observation           | Assessment                              |
| --------------------- | --------------------------------------- |
| Registry Pattern      | **Strong** — matches M2–M4 conventions  |
| Hydration diagnostics | **Strong** — mirrors Action Framework   |
| Health field          | **Good** — `knowledge` on `/api/health` |

### Reuse

| Observation                     | Assessment                                                    |
| ------------------------------- | ------------------------------------------------------------- |
| Ranking strategy scaffold       | **Good** — extensible without orchestrator rewrite            |
| Presentation Layer in workspace | **Strong** — reusable mapping helpers                         |
| Palette knowledge mode          | **Good** — integrates with Command Palette without AF changes |

### Technical debt

| ID       | Observation                                           | Severity          |
| -------- | ----------------------------------------------------- | ----------------- |
| TD-DF-01 | In-process orchestrator only — no HTTP query endpoint | Accepted — future |
| TD-DF-02 | Overlay not globally shell-mounted                    | Low — UX story    |
| TD-DF-03 | Semantic/AI ranking scaffolds inactive                | Expected — future |
| TD-DF-04 | Deprecated `useKnowledgeQuery()` retained             | Low — migration   |

### Readiness for M6

| Observation                               | Assessment                                                             |
| ----------------------------------------- | ---------------------------------------------------------------------- |
| Optional event subscriber                 | **Ready** — KDF can subscribe to refresh index without changes to core |
| No KDF changes required for M6 foundation | **Confirmed**                                                          |

---

## Cross-cutting observations

### Layering (collective)

Platform 3.0 maintains strict downward dependency flow. Composition occurs exclusively in `apps/web`. No subsystem violates Baseline v1.0 layer rules.

### Dependency direction (collective)

```text
Runtime → Workbench → Action / Knowledge (peer platform capabilities) → Shell Experiences
```

Action and Knowledge are **peers** — both consume Runtime/Workbench DTOs; neither owns the other. M6 Event & Notification fits as an additional peer capability.

### Platform consistency (collective)

| Pattern            | M2  | M3      | M4      | M5  | Observation                           |
| ------------------ | --- | ------- | ------- | --- | ------------------------------------- |
| Registry Pattern   | ✅  | ✅      | ✅      | ✅  | Converged standard                    |
| Hydration Pattern  | ✅  | ✅      | ✅      | ✅  | Parallel server bootstrap             |
| Service Pattern    | —   | Partial | Partial | ✅  | KDF establishes full Service boundary |
| Experience Pattern | —   | Partial | ✅      | ✅  | Shell-composed experiences            |
| Health Pattern     | ✅  | ✅      | ✅      | ✅  | Incremental health fields             |

Design Patterns document ([APZHUB-Platform-Design-Patterns.md](../architecture/APZHUB-Platform-Design-Patterns.md)) codifies these for M6+.

### Reuse (collective)

Cross-framework DTO projection (Action → Knowledge) demonstrates the intended extension model. M6 should follow the same pattern: Event Bus as shared infrastructure; Notification Service as public boundary; no duplication of Action or Knowledge registries.

### Technical debt (collective)

No blocking debt for M6 planning. Known deferred items are documented in sprint closeouts and tracked with IDs. Highest attention: TD-AF20-01 (manifest bridge resolution) — does not block Event Bus work.

### Readiness (collective)

| Criterion                     | Verdict                                               |
| ----------------------------- | ----------------------------------------------------- |
| Platform 3.0 as M6 foundation | **Approved**                                          |
| Extension without redesign    | **Confirmed**                                         |
| Test and coverage baseline    | **Strong** — 872 tests, 91.55%                        |
| Documentation completeness    | **Strong** — M5 docs complete; patterns authoritative |
| Commercial GA                 | **Not claimed** — platform evolution baseline only    |

---

## Summary verdict

**PASS WITH OBSERVATIONS**

Platform Version 3.0 is architecturally coherent, consistently patterned, and ready to serve as the baseline for Milestone 6 (Event & Notification Framework). Observations above are tracked limitations or planned M6/M7/M8 work — not design failures.

---

## Related documents

| Document              | Path                                                                                                             |
| --------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Platform v3.0 release | [APZHUB-Platform-v3.0.md](../releases/APZHUB-Platform-v3.0.md)                                                   |
| Milestone 5 review    | [MILESTONE-005-knowledge-discovery-framework-review.md](./MILESTONE-005-knowledge-discovery-framework-review.md) |
| SPR-006 readiness     | [SPR-006-readiness-review.md](./SPR-006-readiness-review.md)                                                     |
| Design patterns       | [APZHUB-Platform-Design-Patterns.md](../architecture/APZHUB-Platform-Design-Patterns.md)                         |

---

_APZHUB Platform Version 3.0 Platform Review — observations only._
