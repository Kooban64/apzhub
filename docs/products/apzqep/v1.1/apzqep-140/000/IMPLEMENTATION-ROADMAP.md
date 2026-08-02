# Implementation Roadmap — APZQEP-140-000

| Field     | Value                       |
| --------- | --------------------------- |
| Programme | APZQEP-140-000              |
| Status    | **COMPLETE** (architecture) |
| Timestamp | 20260802T163547Z            |

Architecture-approved sequencing only. **Engineering remains NOT AUTHORISED** until Product Board approves this pack and issues per-programme Owner Auth Packs.

---

## Sequencing principles

1. Author before execute (A before B/C)
2. Execute before defect volume (C before heavy D) — light defect create-from-execution may ship with C
3. Traceability after link targets exist (E after A/C/D foundations)
4. Reporting last among Core QE (F consumes projections)
5. Each wave ends with CERT gate (ES-002) before the next starts

---

## Delivery waves

### Wave 1 — Test Management

| Item       | Detail                                       |
| ---------- | -------------------------------------------- |
| Capability | **A** Suites / Libraries                     |
| Programme  | APZQEP-140-A (see breakdown)                 |
| Depends on | APZQEP-120 CLOSED; 140-000 approved          |
| Exit gate  | Suites CRUD + events + QKI + commands + CERT |

### Wave 2 — Execution Planning

| Item       | Detail                                      |
| ---------- | ------------------------------------------- |
| Capability | **B** Enterprise Test Execution Planning    |
| Programme  | APZQEP-140-B — **COMPLETE** (in-memory LA)  |
| Depends on | Wave 1                                      |
| Exit gate  | Plan/assign/schedule + notifications + CERT |

### Wave 3 — Execution

| Item       | Detail                                            |
| ---------- | ------------------------------------------------- |
| Capability | **C** Test Execution (evolve TE)                  |
| Programme  | APZQEP-140-C                                      |
| Depends on | Wave 2; Evidence Platform                         |
| Exit gate  | Manual path complete; evidence link; events; CERT |

### Wave 4 — Defects

| Item       | Detail                         |
| ---------- | ------------------------------ |
| Capability | **D** Defect & Findings        |
| Programme  | APZQEP-140-D                   |
| Depends on | Wave 3 (context links)         |
| Exit gate  | Lifecycle + links + QKI + CERT |

### Wave 5 — Traceability

| Item       | Detail                                           |
| ---------- | ------------------------------------------------ |
| Capability | **E** Requirements & Traceability                |
| Programme  | APZQEP-140-E                                     |
| Depends on | Waves 1, 3, 4 (+ existing Requirements baseline) |
| Exit gate  | Trace matrix + coverage projection + CERT        |

### Wave 6 — Reporting

| Item       | Detail                                     |
| ---------- | ------------------------------------------ |
| Capability | **F** Reporting                            |
| Programme  | APZQEP-140-F                               |
| Depends on | Waves 1–5 events/QKI                       |
| Exit gate  | Operational + executive read models + CERT |

---

## Acceptance gates (every wave)

| Gate                    | Standard                                                      |
| ----------------------- | ------------------------------------------------------------- |
| Owner Auth Pack         | ES-003                                                        |
| Tests                   | ES-001                                                        |
| Certification           | ES-002                                                        |
| Architecture compliance | This pack + 001–029                                           |
| Platform rules          | No SoR dual-write; QKI projection-only; notify subscribe-only |

---

## Release strategy

| Track        | Approach                                             |
| ------------ | ---------------------------------------------------- |
| Availability | Remain LIMITED_AVAILABILITY until Board expands      |
| Packaging    | Capability packages versioned independently          |
| Rollback     | Feature flags / module registration off              |
| Data         | Migrations per capability; no cross-DB joins from UI |

---

## Parallelism

Limited parallelisation allowed after Wave 1:

- Documentation / UX specs for next wave
- Not parallel SoR for same entity
- Reporting spikes only against **synthetic projections** until Wave 6 auth
