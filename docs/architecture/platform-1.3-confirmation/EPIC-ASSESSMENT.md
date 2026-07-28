# Epic Assessment — Platform 1.3 Architecture Confirmation

> **Programme:** Platform-1.3-ARCH-001  
> **Epics SoT:** [EPICS.md](../../strategy/platform-1.3/EPICS.md)  
> **Date:** 2026-07-22

**Legend:** `COMPATIBLE` · `COMPATIBLE_WITH_ADR` · `INCOMPATIBLE`

---

## Summary

| Epic                            | Programme | Verdict                         | Redesign |
| ------------------------------- | --------- | ------------------------------- | -------- |
| P13-E01 Search live drain       | ENG-001   | **COMPATIBLE**                  | No       |
| P13-E02 Observe live alerts     | ENG-002   | **COMPATIBLE_WITH_ADR** (0070)  | No       |
| P13-E03 Support realtime        | ENG-003   | **COMPATIBLE_WITH_ADR** (0072)  | No       |
| P13-E04 Notify delivery         | ENG-004   | **COMPATIBLE_WITH_ADR** (0071)  | No       |
| P13-E05 Analytics embed         | ENG-005   | **COMPATIBLE**                  | No       |
| P13-E06 Workflow designer       | ENG-006   | **COMPATIBLE** (milestone gate) | No       |
| P13-E07 Law UX                  | ENG-007   | **COMPATIBLE**                  | No       |
| P13-E08 Time approvals          | ENG-008   | **COMPATIBLE**                  | No       |
| P13-E09 Projects sprint/My Work | ENG-009   | **COMPATIBLE**                  | No       |
| P13-E10 Perf baselines          | ENG-010   | **COMPATIBLE**                  | No       |
| P13-E11 SemVer hygiene          | ENG-011   | **COMPATIBLE**                  | No       |
| P13-E12 Portfolio re-cert       | CERT-001  | **COMPATIBLE**                  | No       |

**Zero INCOMPATIBLE.**

---

## P13-E01 — Search Live Composition & Drain

| Field                   | Assessment                                                                                                                 |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Compatibility**       | COMPATIBLE                                                                                                                 |
| **Existing**            | Frozen publication chain; `search-orchestrator`; `search-time` / `search-law`; publication admin HTTP; Meilisearch adapter |
| **Required interfaces** | Wire Product Services → existing composition hooks → journal (additive)                                                    |
| **APIs / contracts**    | Existing `/api/v1/search/publication/*`; no new query SoR                                                                  |
| **Scalability**         | Enable orchestration with OPS capacity; multi-instance coordination out of 1.3                                             |
| **Risk**                | Over-claim Search GA; bypass hooks; host load                                                                              |
| **Sequence**            | **First engineering programme** — ENG-001                                                                                  |

---

## P13-E02 — Observe Live Alert Evaluation & Delivery

| Field                | Assessment                                                           |
| -------------------- | -------------------------------------------------------------------- |
| **Compatibility**    | COMPATIBLE_WITH_ADR                                                  |
| **Existing**         | Observe SoR CRUD; `gateway.observe.*`; ops `alert-strategy` (manual) |
| **Required**         | **ADR-0070** + async evaluator/worker + delivery hooks               |
| **APIs / contracts** | Additive; preserve metadata SoR; no Grafana UI bypass                |
| **Scalability**      | Async evaluation; rate-limit delivery                                |
| **Risk**             | Scope into live telemetry/streaming; conflate with Email SoR         |
| **Sequence**         | ENG-002 after ADR-0070 accepted; may parallel ENG-001                |

---

## P13-E03 — Support Realtime (R12-SUP-03)

| Field                | Assessment                                                            |
| -------------------- | --------------------------------------------------------------------- |
| **Compatibility**    | COMPATIBLE_WITH_ADR                                                   |
| **Existing**         | Support domain events; webhook fanout; event bus; Zammad CE connector |
| **Required**         | **ADR-0072** realtime subscription via Gateway → Services → Bus       |
| **APIs / contracts** | Additive SSE/WS surface; optional CE attachment delete                |
| **Scalability**      | Prefer SSE; shared-host capacity                                      |
| **Risk**             | Module-owned sockets; EE features; Support 2.0 scope creep            |
| **Sequence**         | ENG-003 after ADR-0072                                                |

---

## P13-E04 — Notification Delivery Providers

| Field                | Assessment                                                                                    |
| -------------------- | --------------------------------------------------------------------------------------------- |
| **Compatibility**    | COMPATIBLE_WITH_ADR                                                                           |
| **Existing**         | Notification metadata SoR; Attention routing; `deliveryEnabled: false`; Future Delivery Guide |
| **Required**         | **ADR-0071** provider framework (SMTP/WS/SSE as approved)                                     |
| **APIs / contracts** | Additive providers; **explicitly not Email SoR**                                              |
| **Scalability**      | Workers, retry/DLQ, connector secrets                                                         |
| **Risk**             | Marketing as Email SoR; UI→SMTP bypass                                                        |
| **Sequence**         | ENG-004 after ADR-0071                                                                        |

---

## P13-E05 — Analytics Live Embed

| Field             | Assessment                                                                      |
| ----------------- | ------------------------------------------------------------------------------- |
| **Compatibility** | COMPATIBLE                                                                      |
| **Existing**      | ADR-0066/0067; analytics contracts `issueEmbed`; Metabase adapter planned embed |
| **Required**      | Wire live embed issuance in connector + AnalyticsService                        |
| **Risk**          | Direct Metabase iframe; overstating foundation maturity                         |
| **Sequence**      | ENG-005 (Wave B)                                                                |

---

## P13-E06 — Workflow Designer Adjacency

| Field             | Assessment                                                      |
| ----------------- | --------------------------------------------------------------- |
| **Compatibility** | COMPATIBLE (requires named ENG-006; optional ADR-0074 deferred) |
| **Existing**      | Workflow 1.0; Execute gated tests/handlers                      |
| **Required**      | Presentation/UX only; **no execute APIs**                       |
| **Risk**          | Accidental Execute unlock                                       |
| **Sequence**      | ENG-006 (Wave B)                                                |

---

## P13-E07 — Law UX Polish

| Field             | Assessment                                                             |
| ----------------- | ---------------------------------------------------------------------- |
| **Compatibility** | COMPATIBLE                                                             |
| **Required**      | Presentation/preference polish; prefer API SoR honesty over dual-write |
| **STOP**          | No FIN-001 · no Email                                                  |
| **Sequence**      | ENG-007 (Wave C)                                                       |

---

## P13-E08 — Time Approvals & Reporting UI

| Field             | Assessment                                                                    |
| ----------------- | ----------------------------------------------------------------------------- |
| **Compatibility** | COMPATIBLE                                                                    |
| **Existing**      | TimesheetService (no approve yet); Kimai domain; Time workbench; search-time  |
| **Required**      | Additive CE-backed approve/export via Time Platform Service → Kimai connector |
| **Sequence**      | ENG-008; prefer after/with ENG-001                                            |

---

## P13-E09 — Projects Sprint & My Work

| Field             | Assessment                                                    |
| ----------------- | ------------------------------------------------------------- |
| **Compatibility** | COMPATIBLE                                                    |
| **Existing**      | ProjectService sprint ops; My Work view; Plane connector      |
| **Required**      | Expose HTTP/typed client over existing service ops; deepen UI |
| **Sequence**      | ENG-009 (Wave C)                                              |

---

## P13-E10 — Performance Baselines

| Field             | Assessment                                        |
| ----------------- | ------------------------------------------------- |
| **Compatibility** | COMPATIBLE                                        |
| **Required**      | Harness + capacity docs; no opportunistic rewrite |
| **Sequence**      | ENG-010 (Wave C)                                  |

---

## P13-E11 — SemVer & Portfolio Hygiene

| Field             | Assessment                           |
| ----------------- | ------------------------------------ |
| **Compatibility** | COMPATIBLE                           |
| **Required**      | Policy/register alignment (KL-11/12) |
| **Sequence**      | ENG-011 (Wave C)                     |

---

## P13-E12 — Portfolio Re-certification

| Field             | Assessment                                  |
| ----------------- | ------------------------------------------- |
| **Compatibility** | COMPATIBLE                                  |
| **Existing**      | `portfolio-recert` · prior CERT packs       |
| **Required**      | Process/evidence only                       |
| **Sequence**      | CERT-001 (Wave D) after scoped ENG outcomes |

---

## Recommended engineering sequence (unchanged from PLAN-001)

1. **ENG-001** (Search) — architecture-ready now
2. Wave A: ENG-002 ∥ ENG-003 ∥ ENG-004 (after ADRs 0070–0072)
3. Wave B: ENG-005 ∥ ENG-006
4. Wave C: ENG-007…011
5. Wave D: CERT-001
