# OSS-101 Readiness Review — APZHUB Projects / Plane Integration Planning

**Milestone:** OSS-101  
**Date:** 2026-07-09  
**Reviewer:** Architecture (planning gate)  
**Verdict:** **READY FOR IMPLEMENTATION PLANNING SIGN-OFF** — await owner approval before OSS-101-01

---

## Scope reviewed

Planning deliverables for Wave 1 — Plane behind APZHUB Projects capability. No production code reviewed.

---

## Deliverables assessment

| Deliverable                           | Status       | Notes                         |
| ------------------------------------- | ------------ | ----------------------------- |
| Projects Plane Reference Architecture | ✅ Complete  | Full stack, Platform Core map |
| Projects Domain Mapping               | ✅ Complete  | 12+ concepts mapped           |
| Plane Adapter Design                  | ✅ Complete  | 13 adapter responsibilities   |
| Projects Workbench UX                 | ✅ Complete  | Native UI; Plane hidden       |
| OSS-101 Backlog                       | ✅ Complete  | 10 phases defined             |
| Capability Abstraction compliance     | ✅ Pass      | OSS-002 pattern followed      |
| No production code                    | ✅ Confirmed | Docs only                     |
| No Platform Core changes              | ✅ Confirmed |                               |

---

## Architecture assessment

| Criterion                          | Result                                     |
| ---------------------------------- | ------------------------------------------ |
| Module → Service → Adapter → Plane | ✅ Defined                                 |
| No client → Plane bypass           | ✅ Prohibited                              |
| Native APZHUB UI preferred         | ✅ Required                                |
| Plane UI hidden from users         | ✅ Required                                |
| Single SSO                         | ✅ Auth bridge defined                     |
| Tenant isolation                   | ✅ 1:1 tenant workspace                    |
| Replacement strategy               | ✅ Adapter swap documented                 |
| SoR clarity                        | ✅ Plane for domain; platform for metadata |

---

## Platform Core consumption

| Capability         | Planned consumption         | Duplication risk |
| ------------------ | --------------------------- | ---------------- |
| Identity           | ✅ User mapping             | None             |
| Authorization      | ✅ Permission translation   | None             |
| Personalisation    | ✅ Dashboard, my work prefs | None             |
| Governance         | ✅ Capability enablement    | None             |
| Provisioning       | ✅ Workspace + project      | None             |
| Security           | ✅ API guards               | None             |
| Configuration      | ✅ Engine config refs       | None             |
| Traffic Governance | ✅ Rate limits              | None             |
| Operations         | ✅ Control plane entry      | None             |
| Lifecycle          | ✅ Product registration     | None             |
| Search             | ✅ Provider registration    | None             |
| Knowledge          | ✅ Provider registration    | None             |
| Notifications      | ✅ Event routes             | None             |
| Activity           | ✅ Mappers                  | None             |
| API Framework      | ✅ Gateway envelope         | None             |
| Workbench          | ✅ Module registration      | None             |

**Verdict:** No Platform Core duplication identified.

---

## Prerequisites for OSS-101-01

| Prerequisite                   | Status                        |
| ------------------------------ | ----------------------------- |
| OSS-001 Master Plan            | ✅ Complete                   |
| OSS-002 Capability Abstraction | ✅ Complete                   |
| OSS-101 planning               | ✅ Complete                   |
| PCv2-02 Workers                | ⏳ Required before OSS-101-04 |
| M17 CI/CD                      | ⏳ Required before OSS-101-10 |
| Owner approval OSS-101         | ⏳ Pending                    |
| Owner approval OSS-101-01      | ⏳ Pending                    |

---

## Observations

| ID         | Observation                                                    | Severity | Recommendation                                   |
| ---------- | -------------------------------------------------------------- | -------- | ------------------------------------------------ |
| OBS-101-01 | Plane CE version not yet pinned                                | Low      | Pin in OSS-101-02 environment guide              |
| OBS-101-02 | Epic/intake views deferred                                     | Low      | Acceptable for Wave 1 MVP                        |
| OBS-101-03 | PCv2-02 blocks adapter sync                                    | Medium   | Do not start OSS-101-04 until workers delivered  |
| OBS-101-04 | User-attributed Plane token strategy needs spike in OSS-101-04 | Medium   | Time-box auth bridge spike in adapter foundation |

---

## Risks (planning)

| Risk                            | Mitigation                          |
| ------------------------------- | ----------------------------------- |
| Plane API breaking changes      | Version pin + contract tests        |
| Board drag-drop complexity      | Menu fallback for a11y              |
| Sync lag perception             | Optimistic UI + outbox status       |
| Scope creep into Plane UI embed | Architecture gate rejects embed PRs |

---

## Recommendation

**Approve OSS-101 planning.** Proceed to **OSS-101-01 (Architecture & ADR)** only after explicit owner approval.

Do not implement adapter, UI, or Plane deployment until OSS-101-01 is approved.

---

## Related

- [OSS-101 Completion Report](../sprint/OSS-101-completion-report.md)
- [OSS-101 Backlog](../backlog/OSS-101-Plane-Integration-Backlog.md)
