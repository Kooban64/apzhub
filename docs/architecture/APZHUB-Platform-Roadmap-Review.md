# APZHUB Platform — Roadmap Review

> **Milestone:** M16 — Platform Stabilisation & Engineering Review  
> **Date:** 2026-07-08  
> **Authority:** [platform-roadmap.md](./platform-roadmap.md) · [APZHUB Platform Roadmap v2](../roadmap/APZHUB-Platform-Roadmap-v2.md) · [LAW Persistence Roadmap](../roadmap/LAW-Persistence-Roadmap.md)

---

## 1. Purpose

Review platform and product roadmaps; identify completed, obsolete, duplicate, and missing milestones. Propose updated roadmap.

---

## 2. Platform roadmap status (M1–M10)

| Milestone | Title                                   | Status          | Evidence                  |
| --------- | --------------------------------------- | --------------- | ------------------------- |
| M1        | Foundation (SPR-001)                    | ✅ **Complete** | v0.1.0-foundation         |
| M2        | Platform Runtime (SPR-002)              | ✅ **Complete** | v0.2.0                    |
| M3        | Workbench Framework (SPR-003)           | ✅ **Complete** | v0.3.0                    |
| M4        | Action Framework (SPR-004)              | ✅ **Complete** | v0.4.0                    |
| M5        | Knowledge & Discovery (SPR-005)         | ✅ **Complete** | v0.5.0                    |
| M6        | Event & Notification (SPR-006)          | ✅ **Complete** | v0.6.0                    |
| M7        | Activity & Timeline (SPR-007)           | ✅ **Complete** | v0.7.0                    |
| —         | **Platform v5.0 baseline**              | ✅ **Frozen**   | Permanent reference       |
| M8        | Identity, Administration & UX (SPR-008) | ⏸ **Planning**  | Readiness review exists   |
| M9        | Business Capabilities                   | ⏸ **Deferred**  | Per original roadmap      |
| M10       | Enterprise Operations                   | ⏸ **Deferred**  | External bus, ops console |

### New milestones (not in original platform-roadmap.md)

| ID                 | Title                                       | Status                           | Notes                    |
| ------------------ | ------------------------------------------- | -------------------------------- | ------------------------ |
| **M16**            | Platform Stabilisation & Engineering Review | ✅ **This sprint**               | Analysis only            |
| **Law validation** | Product Validation Phase 1                  | ✅ **In progress → substantial** | LAW-001–015              |
| **FIN-001**        | Financial Engine extraction (planning)      | ⏸ **Deferred**                   | DEFER EXTRACTION verdict |

---

## 3. Law Platform roadmap status

| Milestone                       | Status                  | Notes                   |
| ------------------------------- | ----------------------- | ----------------------- |
| LAW-001 UX Foundation           | ✅ Complete             |                         |
| LAW-002 Legal Business Core     | ✅ Complete             |                         |
| LAW-003–011 Domain modules      | ✅ Complete             | Clients through billing |
| LAW-012 Persistence             | ✅ Complete             | Phase 1 closed          |
| LAW-013 Product readiness       | ✅ Complete             | Planning/assessment     |
| LAW-014 API Framework           | ✅ Complete             | REST APIs delivered     |
| LAW-015 Trust Accounting        | ✅ **Milestone closed** | LAW-015-14              |
| LAW-015-15 Production Readiness | ⏸ Await approval        | Recommended             |
| Trust Phase 2                   | ⏸ Deferred              | Bank, integration       |
| FIN-001 Extraction              | ⏸ Deferred              | Owner gate              |

---

## 4. Obsolete roadmap items

| Item                                                      | Reason                                 |
| --------------------------------------------------------- | -------------------------------------- |
| "Trust Accounting planning only" in persistence roadmap   | **Obsolete** — LAW-015 delivered       |
| "Await LAW-015-02" gates                                  | **Obsolete** — milestone closed        |
| LAW-015-16 separate closeout story                        | **Merged** into LAW-015-14             |
| TD-P21 "trust not implemented"                            | **Resolved**                           |
| TD-P24 "no API layer"                                     | **Resolved**                           |
| Platform "Milestone 9 business capabilities" as next step | **Superseded** by Law validation track |

---

## 5. Duplicate / merge candidates

| Duplicate                                      | Merge recommendation                       |
| ---------------------------------------------- | ------------------------------------------ |
| LAW-015-14 Documentation + LAW-015-16 Closeout | ✅ Already merged                          |
| LAW-015-15 Production Readiness + M8 RBAC      | Coordinate — RBAC is M8 scope              |
| FIN-001 extraction + Trust Phase 2             | Keep separate — FIN-001 deferred           |
| SPR-008 M8 + TD-M8-RBAC                        | M8 should own RBAC seed                    |
| Outbox workers (LAW-014-08) + TD-P18           | Same work — single story                   |
| App bootstrap debt (M16) + M8 app integration  | Sequence: M8 first, then bootstrap package |

---

## 6. Missing milestones (recommended)

| ID             | Title                                       | Rationale                                 |
| -------------- | ------------------------------------------- | ----------------------------------------- |
| **M16**        | Platform Stabilisation & Engineering Review | ✅ Delivered this sprint                  |
| **M17**        | CI/CD & App Bootstrap Consolidation         | GitHub Actions, bootstrap package, E2E CI |
| **M8**         | Identity, Administration & UX               | Already planned — elevate priority        |
| **LAW-015-15** | Trust Production Readiness                  | RBAC seed, OpenAPI, client bundle         |
| **LAW-016**    | Law Platform Integration                    | Events, notifications, matter tabs        |
| **Worker-001** | Outbox Worker Service                       | Critical path for events/projections      |
| **OPS-001**    | Platform Operator Tooling                   | Deployment, monitoring, runbooks          |

---

## 7. Future platform capabilities (post-M8)

| Capability                              | Roadmap slot | Dependency          |
| --------------------------------------- | ------------ | ------------------- |
| PermissionService (real RBAC)           | M8           | SPR-008             |
| Preference persistence                  | M8           | 023                 |
| Persistent notification/activity stores | M8+          | M6/M7 debt          |
| External Event Bus                      | M10          | Scale requirement   |
| Administration Workspace                | M10          | 014 observability   |
| Search index (OpenSearch/FTS)           | M9+          | 020                 |
| Command Palette AI ranking              | M9+          | 019                 |
| Module SDK auto-discovery (025)         | M9+          | Law modules         |
| Connector SDK (026)                     | M9+          | Engine integrations |
| Financial Engine (FIN-001)              | Deferred     | Owner approval      |

---

## 8. Updated platform roadmap (proposed)

```text
M1–M7   Platform Frameworks                    ✅ Complete
v5.0    Platform Baseline (frozen)              ✅ Established
Law     Product Validation Phase 1              ✅ Substantial (LAW-001–015)
M16     Engineering Review & Stabilisation      ✅ Complete (this sprint)
        ↓
M8      Identity, Administration & UX           ← NEXT (owner approval)
M17     CI/CD, App Bootstrap, E2E CI            ← Recommended parallel
        ↓
Worker  Outbox Workers & Projections            ← Critical path
LAW-015-15  Trust Production Readiness        ← Optional (owner approval)
LAW-016 Law Platform Integration                ← Optional (owner approval)
        ↓
M9      Business Capabilities (or additional Law modules)
M10     Enterprise Operations
FIN-001 Financial Engine Extraction             ← Deferred indefinitely
```

---

## 9. Roadmap risks

| Risk                                     | Mitigation                                  |
| ---------------------------------------- | ------------------------------------------- |
| M8 delayed while Law features continue   | Freeze Law implementation until M8 approved |
| Parallel Law + Platform roadmaps confuse | This document + updated indexes             |
| FIN-001 scope creep from Trust           | Maintain DEFER EXTRACTION gate              |
| Outbox workers deferred too long         | Block pilot on worker delivery              |

---

## 10. Verdict

**Roadmap health: GOOD**

Clear completed history; M8 is the correct next platform gate. Law validation track advanced further than original platform roadmap anticipated — documentation must reflect this. M16 adds the stabilisation gate before further implementation.

---

_Related: [M16 Completion Report](../sprint/M16-completion-report.md) · [v6.0 Platform Review](../releases/APZHUB-v6.0-Platform-Review.md)_
