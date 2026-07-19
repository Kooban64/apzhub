# APZ Time 1.0 — Implementation Strategy

> **Product:** APZ Time  
> **Classification:** Documentation only — **no implementation authorised**  
> **Related:** [Readiness](./APZ-TIME-1.0-READINESS-ASSESSMENT.md) · [Gaps](./APZ-TIME-1.0-GAP-ANALYSIS.md) · [Recommendation](./APZ-TIME-1.0-RECOMMENDATION.md)  
> **Basis:** Definition Pack ROADMAP · Reference Implementation · APZ Projects proven path · disk evidence

---

## Strategy principle

Do **not** start Workbench Time until:

1. Kimai adapter exists under Integration SDK **1.0.0**
2. Platform TimeTrackingService + HTTP exist on disk
3. Implementation Ready is declared in the Definition Pack / CURRENT-MILESTONE
4. Owner Approves a Product Release (or equivalent) for Workbench 1.0

Skipping to UI violates layered architecture and the Projects lesson (UI only after HTTP).

---

## Phase model (repository-supported)

Owner-suggested product phases (Core → Projects/Activities/Approvals → Reporting) are **valid only after** Dependency Phase **D1**. Evidence does not support starting Phase 1 Workbench now.

### Phase D1 — Dependency stack (Critical — blocks IR)

| Step | Deliverable                                                                                            | Layer            | Evidence that this is required |
| ---- | ------------------------------------------------------------------------------------------------------ | ---------------- | ------------------------------ |
| D1.1 | ADR: Kimai adapter approach (CE/self-hosted, Integration SDK 1.0.0)                                    | Decision         | Pack ROADMAP · ARCHITECTURE    |
| D1.2 | `integrations/kimai` — adapter, health, error translation, CE APIs only                                | Integration      | G-01 · Integration SDK frozen  |
| D1.3 | `services/time` — TimeTrackingService, contracts, persistence (platform metadata only), `service.yaml` | Platform Service | G-02 · docs 009/027            |
| D1.4 | Gateway HTTP `/api/v1/...` Time routes — authz, validation, envelope                                   | Gateway          | G-03 · docs 010                |
| D1.5 | Module manifest + permissions + nav registration hooks                                                 | Module contract  | G-04 · docs 025                |
| D1.6 | Contract/integration tests for adapter + service + HTTP                                                | Quality          | G-07 · docs 015                |

**Exit:** Disk shows adapter + service + HTTP; IR checklist updated; Owner may then Approve Workbench release.

**Not started.** Requires separate Owner Approval (not this planning delivery).

---

### Phase P1 — Core Time Tracking (Workbench)

| In scope (indicative — freeze in future Sprint Guide)      | Out of scope                    |
| ---------------------------------------------------------- | ------------------------------- |
| Timer / time entry list-create-edit-stop via existing HTTP | New Platform Services redesign  |
| Permission-filtered Workbench surfaces                     | Direct Kimai calls from UI      |
| Typed client + Playwright cert (Projects pattern)          | Approvals, reporting, analytics |
| Product health/diagnostics honesty                         | Module-to-module coupling       |

**Prerequisite:** D1 complete + IR + Owner Approval.  
**Pattern:** APZ Projects 1.1 Workbench on frozen HTTP — not greenfield HTTP in the same PR as UI if avoidable.

---

### Phase P2 — Projects, Activities, Tags, Approvals

| Theme                                  | Notes                                                                                  |
| -------------------------------------- | -------------------------------------------------------------------------------------- |
| Link entries to Projects (Wave 1 HTTP) | Platform orchestration; no Plane client in Time UI                                     |
| Activities / tags                      | Domain design + Kimai capability discovery — no invented fields                        |
| Approvals                              | Pack CAPABILITIES planned; may need events + workflow — scope only after P1 Production |

**Prerequisite:** P1 Production (or Owner-approved parallel only if D1 already complete).

---

### Phase P3 — Reporting, Exports, Administration

| Theme             | Notes                                                          |
| ----------------- | -------------------------------------------------------------- |
| Reports / exports | Prefer Platform reporting hooks; not module-owned SoR          |
| Administration    | Product admin surfaces; permission-gated                       |
| Search provider   | Register with Platform Search (020) when indexing events exist |

**Prerequisite:** P1 (minimum); prefer after P2 if approvals affect report correctness.

---

## What this planning delivery does **not** authorise

- Creating `integrations/kimai` or `services/time`
- Creating Time APIs or Workbench code
- Modifying Integration SDK, Platform Services frameworks, or Plane
- Declaring Implementation Ready

---

## Sequencing diagram

```text
[Planning — NOW]
       │
       ▼
 Owner Acceptance of this planning suite
       │
       ▼
 Owner Approval: D1 (Kimai + TimeTrackingService + HTTP)
       │
       ▼
 Implementation Ready declared on disk
       │
       ▼
 Owner Approval: Product Release APZ Time 1.0 (P1 Workbench)
       │
       ▼
 P2 → P3 (separate Approvals / Releases)
```

---

## Effort honesty

No story points invented. D1 is a multi-layer delivery comparable to establishing Projects HTTP + Plane adapter — **larger** than Projects 1.1 (which reused existing HTTP). Treat D1 as a Platform/Integration Product Release, not a Workbench-only sprint.
