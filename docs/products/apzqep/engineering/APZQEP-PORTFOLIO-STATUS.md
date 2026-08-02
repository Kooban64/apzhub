# APZQEP / APZHUB — Portfolio Status Snapshot

| Field     | Value                                             |
| --------- | ------------------------------------------------- |
| Date      | 2026-08-02                                        |
| Authority | Product Board — post APZQEP-120-S08 **CERTIFIED** |
| Status    | **IN FORCE**                                      |

---

## Programme portfolio

| Programme                | Status                                                              |
| ------------------------ | ------------------------------------------------------------------- |
| APZHUB Foundation        | ✅ Closed                                                           |
| APZHUB Product Framework | ✅ Closed                                                           |
| APZQEP v1.0 Release      | ✅ Closed                                                           |
| APZQEP v1.1 Planning     | ✅ Closed                                                           |
| APZQEP-120 S01–S08       | ✅ Complete · S08 Product Board **CERTIFIED**                       |
| APZQEP-120 S09           | ⏳ Recommended next · Reliable Processing · Owner instruction req.  |
| APZQEP-ENG-001           | ✅ **Closed** (CERTIFIED / ARCHIVED)                                |
| APZHUB-ENG-002           | ✅ Foundation COMPLETE · Phase 1 CLOSED · ES promotions **ON HOLD** |

---

## APZQEP product state

| Area                            | Status                                     |
| ------------------------------- | ------------------------------------------ |
| Governance                      | ✅ Complete                                |
| Engineering Framework           | ✅ Complete                                |
| Evidence Platform (S01–S06)     | ✅ Complete                                |
| Event Platform foundation (S07) | ✅ Complete · catalogue v1.0.2             |
| Reliable delivery (S08)         | ✅ **CERTIFIED** · outbox **0.2.0**        |
| Reliable processing (S09)       | ⏳ Not authorised                          |
| Core Platform Engineering       | 🚧 In Progress                             |
| Product Feature Engineering     | 🚧 Ready after event processing foundation |

---

## Maturity snapshot (Board — revised post-S08 CERTIFIED)

| Area                   | Completion |
| ---------------------- | ---------: |
| Governance             |       100% |
| Engineering Framework  |       100% |
| Evidence Platform      |       ~65% |
| Event Platform         |       ~45% |
| Backend Overall        |    ~72–74% |
| Frontend               |       ~20% |
| Overall Product Vision |    ~62–64% |

Increase reflects authoritative events, durable delivery, retry, and transport abstraction — enough infrastructure to begin consuming events (via S09 processing, not yet Search/Notifications).

---

## Critical path (current)

```text
S01–S08 ✅ (Evidence + Domain Events + Reliable Delivery)
        │
        ▼
S09  Reliable Processing          ← next (awaiting Owner)
        │
        ▼
S10  Operational Event Processing
        │
        ├──────────────┐
        ▼              ▼
S11 Search      S12 Notifications
        │              │
        └──────┬───────┘
               ▼
S13 Command Palette
               ▼
        Product Features
```

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
