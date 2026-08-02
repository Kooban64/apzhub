# APZQEP / APZHUB — Portfolio Status Snapshot

| Field     | Value                                                        |
| --------- | ------------------------------------------------------------ |
| Date      | 2026-08-02                                                   |
| Authority | Product Board — S08 **CERTIFIED** · S09 recommended for auth |
| Status    | **IN FORCE**                                                 |

---

## Programme portfolio

| Programme                | Status                                                              |
| ------------------------ | ------------------------------------------------------------------- |
| APZHUB Foundation        | ✅ Closed                                                           |
| APZHUB Product Framework | ✅ Closed                                                           |
| APZQEP v1.0 Release      | ✅ Closed                                                           |
| APZQEP v1.1 Planning     | ✅ Closed                                                           |
| APZQEP-120 S01–S08       | ✅ Complete · S08 Product Board **CERTIFIED**                       |
| APZQEP-120 S09           | ⏳ Recommended for authorisation · Reliable Processing (engine)     |
| APZQEP-ENG-001           | ✅ **Closed** (CERTIFIED / ARCHIVED)                                |
| APZHUB-ENG-002           | ✅ Foundation COMPLETE · Phase 1 CLOSED · ES promotions **ON HOLD** |

---

## APZQEP product state

| Area                            | Status                                               |
| ------------------------------- | ---------------------------------------------------- |
| Governance                      | ✅ Complete                                          |
| Engineering Framework           | ✅ Complete                                          |
| Evidence Platform (S01–S06)     | ✅ Complete                                          |
| Event Platform foundation (S07) | ✅ Complete · catalogue v1.0.2                       |
| Reliable delivery (S08)         | ✅ **CERTIFIED** · outbox **0.2.0**                  |
| Reliable processing (S09)       | ⏳ Recommended — awaits Owner Authorisation Pack     |
| Core Platform Engineering       | 🚧 In Progress → entering Capability phase after S09 |
| Product Feature Engineering     | 🚧 Dominant path after S09–S13                       |

---

## Maturity snapshot (Board — revised post-S08 final CERTIFIED)

| Area                   | Previous |     Current |
| ---------------------- | -------: | ----------: |
| Governance             |     100% |        100% |
| Engineering Framework  |     100% |        100% |
| Evidence Platform      |     ~65% |    **~72%** |
| Event Platform         |     ~45% |    **~60%** |
| Backend Overall        |  ~72–74% | **~76–78%** |
| Frontend               |     ~20% |        ~20% |
| Overall Product Vision |  ~65–68% | **~68–70%** |

S08 completed **reliable delivery infrastructure** — Event Platform moves from “events exist” to “events are operationally reliable.”

---

## Critical path (current)

```text
S01–S08 ✅
        │
        ▼
S09  Reliable Processing (execution engine)  ← next (Owner Auth Pack)
        │
        ▼
S10  Operational Processing
        │
        ▼
S11 Search → S12 Notifications → S13 Command Palette
        │
        ▼
S14 Suites → S15 Runs → S16 Execution → S17 Defects
        │
        ▼
S18 Traceability → S19 Reporting → S20 Close-out
```

---

## Governance layering (Board note)

Not every architectural decision becomes an Enterprise Standard.

| Level      | Example                                          |
| ---------- | ------------------------------------------------ |
| Product    | Evidence catalogue semantics                     |
| Platform   | Outbox ownership rule (`OUTBOX-ARCHITECTURE.md`) |
| Enterprise | ES-001 / ES-002 / ES-003                         |

Keeping these layers separate prevents Enterprise Standards from becoming bloated. Platform rules may later be promoted when portfolio reuse justifies it.

---

## Platform Outbox rule

No APZHUB product may implement its own Outbox engine. Products SHALL consume `@apzhub/platform-outbox`. See [OUTBOX-ARCHITECTURE.md](../v1.1/apzqep-120/OUTBOX-ARCHITECTURE.md).

---

## Inversion

```text
APZHUB owns engineering methodology.
APZQEP consumes and demonstrates it.
Future products inherit governance from day one.
```

---

## Related

- [S08-PRODUCT-BOARD-CERTIFICATION.md](../v1.1/apzqep-120/S08-PRODUCT-BOARD-CERTIFICATION.md)
- [S09-PRODUCT-BOARD-RECOMMENDATION.md](../v1.1/apzqep-120/S09-PRODUCT-BOARD-RECOMMENDATION.md)
- [EVENT-CATALOGUE.md](../events/EVENT-CATALOGUE.md)
- [STANDING-PROGRAMME-RECORD.md](../STANDING-PROGRAMME-RECORD.md)
- [APZHUB-ENG-002 PHASE-1-CLOSED](../../../engineering/APZHUB-ENG-002/PHASE-1-CLOSED.md)
