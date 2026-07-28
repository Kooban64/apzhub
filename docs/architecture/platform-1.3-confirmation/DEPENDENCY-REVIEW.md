# Dependency Review — Platform 1.3 Architecture Confirmation

> **Programme:** Platform-1.3-ARCH-001  
> **Date:** 2026-07-22

---

## Hard dependencies (frozen baselines)

| Dependency                       | Status                                            | Impact on 1.3                                |
| -------------------------------- | ------------------------------------------------- | -------------------------------------------- |
| Platform 1.2.0 Certified Release | Frozen / CLOSED                                   | Baseline for all epics                       |
| Integration SDK 1.0.0            | Frozen (ADR-0065)                                 | Additive adapters only; no SDK redesign      |
| Search Publication Freeze        | Frozen                                            | E01 = wiring inside freeze                   |
| Observe Freeze                   | Frozen absences include alert evaluation/delivery | E02 needs ADR-0070                           |
| Notification Freeze              | No delivery providers without milestone           | E04 needs ADR-0071 + ENG-004                 |
| Workflow Execute gate            | Gated                                             | E06 must not unlock                          |
| Architecture Freeze (1.2.0)      | Frozen                                            | Confirmation programme only may propose ADRs |

---

## Epic dependency graph

```text
PLAN-001 ACCEPTED
    └─ ARCH-001 (this) ──► Owner Architecture Acceptance
            ├─ ENG-001 (E01 Search) ── no new ADR
            ├─ ADR-0070 ──► ENG-002 (E02 Observe)
            ├─ ADR-0072 ──► ENG-003 (E03 Support realtime)
            ├─ ADR-0071 (AWAITING OWNER ADR ACCEPTANCE) ──► ENG-004 (E04 Notify delivery) [STOP until ADR + ENG Approval]
            ├─ ENG-005 (E05 Analytics) ── ADR-0066/0067 sufficient
            ├─ ENG-006 (E06 Workflow designer) ── Execute remains gated
            ├─ ENG-007 (E07 Law) ── STOP FIN/Email
            ├─ ENG-008 (E08 Time) ── prefer after ENG-001
            ├─ ENG-009 (E09 Projects)
            ├─ ENG-010 (E10 Perf)
            ├─ ENG-011 (E11 SemVer)
            └─ CERT-001 (E12) ── after scoped ENG outcomes
```

---

## Cross-epic couplings

| From         | To                  | Coupling                                          | Ruling                                                               |
| ------------ | ------------------- | ------------------------------------------------- | -------------------------------------------------------------------- |
| E01 Search   | E08 Time            | Time publisher drain improves Time search honesty | Soft — prefer E01 before or with E08                                 |
| E01 Search   | E07 Law             | Law publisher drain                               | Soft                                                                 |
| E04 Notify   | E02 Observe         | Observe delivery may use Notify providers         | Soft — do not block E02 on full E04; honesty on channels             |
| E03 Realtime | E04 Notify          | Shared transport patterns possible                | Soft — ADR-0072 owns product realtime; ADR-0071 owns notify channels |
| E06 Workflow | STOP Execute        | Must remain gated                                 | Hard                                                                 |
| All          | Email SoR / FIN-001 | Out of 1.3                                        | Hard STOP                                                            |

---

## Package / service dependency matrix (Must epics)

| Epic | Packages                                                                                   | Services                                       | Integrations                            |
| ---- | ------------------------------------------------------------------------------------------ | ---------------------------------------------- | --------------------------------------- |
| E01  | search-orchestrator, search-time, search-law, search-publication-admin, search-integration | Time/Law Platform Services → composition hooks | Meilisearch                             |
| E02  | observe-core/contracts/persistence, platform-operations alert-strategy                     | Observe Platform Services + worker             | Delivery hooks (via Notify plane later) |
| E03  | platform-event-bus, support domain events, workbench Support                               | Support Platform Services                      | Zammad CE                               |
| E04  | notification-*, event-notification-framework                                               | Notification Platform Services + workers       | SMTP/WS/SSE providers (CE)              |

---

## Scalability dependencies

| Item               | Depends on                                          |
| ------------------ | --------------------------------------------------- |
| Live Search drain  | OPS capacity / Meilisearch host coexistence         |
| Observe evaluation | Async job infrastructure (existing 012 patterns)    |
| Support realtime   | Shared-host connection limits; Gateway edge (Caddy) |
| Notify delivery    | Secrets management; worker identity least privilege |

---

## Conclusion

Dependencies are **governance and freeze-control**, not missing structural layers. ENG-001 has no blocking ADR dependency. Wave A remaining Must epics are blocked only by proposed ADR acceptance + named ENG Approvals.
