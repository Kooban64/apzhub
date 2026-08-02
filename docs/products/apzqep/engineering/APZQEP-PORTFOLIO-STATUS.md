# APZQEP / APZHUB — Portfolio Status Snapshot

| Field     | Value                                      |
| --------- | ------------------------------------------ |
| Date      | 2026-08-02                                 |
| Authority | Engineering — post APZQEP-120-S12 **PASS** |
| Status    | **IN FORCE**                               |

---

## Programme portfolio

| Programme                | Status                                                              |
| ------------------------ | ------------------------------------------------------------------- |
| APZHUB Foundation        | ✅ Closed                                                           |
| APZHUB Product Framework | ✅ Closed                                                           |
| APZQEP v1.0 Release      | ✅ Closed                                                           |
| APZQEP v1.1 Planning     | ✅ Closed                                                           |
| APZQEP-120 S01–S12       | ✅ Complete · S12 Notification Platform **PASS**                    |
| APZQEP-120 S13           | ⏳ Recommended · Command Palette · Owner Auth Pack required         |
| APZQEP-ENG-001           | ✅ **Closed** (CERTIFIED / ARCHIVED)                                |
| APZHUB-ENG-002           | ✅ Foundation COMPLETE · Phase 1 CLOSED · ES promotions **ON HOLD** |

---

## Architectural backbone

```text
Business Domain → Domain Events → Outbox → Delivery → Processing
  → Business Processors → Quality Knowledge Index → Search
  → Notification Processors → Subscription → Internal Channel
```

Notifications are **subscribers**, not callers.

---

## Maturity snapshot (Board — post-S11; S12 engineering PASS)

| Area                  | Completion |
| --------------------- | ---------: |
| Governance            |   **100%** |
| Engineering Framework |   **100%** |
| Evidence Platform     |    **90%** |
| Event Platform        |    **95%** |
| Knowledge Platform    |    **70%** |
| Notification Platform |    **60%** |
| Backend               | **87–89%** |
| Frontend              | **20–25%** |
| Overall Product       | **80–82%** |

---

## Critical path

```text
S01–S12 ✅
        │
        ▼
S13 Command Palette  ← next (Owner Auth Pack)
        │
        ▼
S14 Suites → S15 Runs → S16 Execution → S17 Defects
        │
        ▼
S18 Traceability → S19 Reporting → S20 Close-out
```

---

## Platform rules (not ES promotions)

| Rule                                                  | Location                                                                    |
| ----------------------------------------------------- | --------------------------------------------------------------------------- |
| No product-private Outbox engines                     | [OUTBOX-ARCHITECTURE.md](../v1.1/apzqep-120/OUTBOX-ARCHITECTURE.md)         |
| Processing Engine executes registered processors only | [PROCESSING-ENGINE.md](../v1.1/apzqep-120/PROCESSING-ENGINE.md)             |
| Search consumes Event Platform (projections)          | [QUALITY-KNOWLEDGE-INDEX.md](../v1.1/apzqep-120/QUALITY-KNOWLEDGE-INDEX.md) |
| Notifications subscribe to QKI or Domain Events       | [NOTIFICATION-PLATFORM.md](../v1.1/apzqep-120/NOTIFICATION-PLATFORM.md)     |

---

## Related

- [S12-COMPLETION.md](../v1.1/apzqep-120/S12-COMPLETION.md)
- [NOTIFICATION-PLATFORM.md](../v1.1/apzqep-120/NOTIFICATION-PLATFORM.md)
- [STANDING-PROGRAMME-RECORD.md](../STANDING-PROGRAMME-RECORD.md)
