# APZQEP / APZHUB — Portfolio Status Snapshot

| Field     | Value                                                     |
| --------- | --------------------------------------------------------- |
| Date      | 2026-08-02                                                |
| Authority | Engineering — APZQEP-120 Platform Foundation **COMPLETE** |
| Status    | **IN FORCE**                                              |

---

## Programme portfolio

| Programme                | Status                                                               |
| ------------------------ | -------------------------------------------------------------------- |
| APZHUB Foundation        | ✅ Closed                                                            |
| APZHUB Product Framework | ✅ Closed                                                            |
| APZQEP v1.0 Release      | ✅ Closed                                                            |
| APZQEP v1.1 Planning     | ✅ Closed                                                            |
| **APZQEP-120**           | ✅ **Platform Foundation COMPLETE** (S01–S13)                        |
| **APZQEP-140**           | ⏳ Recommended · Core Quality Engineering · Owner Auth Pack required |
| APZQEP-160               | ⏳ Future · Intelligence & AI                                        |
| APZQEP-ENG-001           | ✅ **Closed** (CERTIFIED / ARCHIVED)                                 |
| APZHUB-ENG-002           | ✅ Foundation COMPLETE · Phase 1 CLOSED · ES promotions **ON HOLD**  |

---

## Architectural backbone (COMPLETE)

```text
Business Domain → Domain Events → Outbox → Processing
  → Business Processors
  → Quality Knowledge Index → Search
  → Notification Processors (subscribers)
  → Command Platform (QKI discovery + handlers)
```

---

## Maturity snapshot (post-S13)

| Area                  | Completion |
| --------------------- | ---------: |
| Governance            |   **100%** |
| Engineering Framework |   **100%** |
| Platform Foundation   |   **100%** |
| Evidence Platform     |    **90%** |
| Event Platform        |    **95%** |
| Knowledge Platform    |    **75%** |
| Notification Platform |    **60%** |
| Command Platform      |    **55%** |
| Backend               | **90–92%** |
| Frontend              | **20–25%** |
| Overall Product       | **82–85%** |

---

## Critical path

```text
APZQEP-120 S01–S13 ✅ Platform Foundation COMPLETE
        │
        ▼
APZQEP-140 Core Quality Engineering  ← next programme (Owner Auth Pack)
        │
        ▼
Suites → Runs → Execution → Defects → Traceability → Reporting
        │
        ▼
APZQEP-160 Intelligence & AI (future)
```

---

## Platform rules (not ES promotions)

| Rule                                                  | Location                                                                    |
| ----------------------------------------------------- | --------------------------------------------------------------------------- |
| No product-private Outbox engines                     | [OUTBOX-ARCHITECTURE.md](../v1.1/apzqep-120/OUTBOX-ARCHITECTURE.md)         |
| Processing Engine executes registered processors only | [PROCESSING-ENGINE.md](../v1.1/apzqep-120/PROCESSING-ENGINE.md)             |
| Search consumes Event Platform (projections)          | [QUALITY-KNOWLEDGE-INDEX.md](../v1.1/apzqep-120/QUALITY-KNOWLEDGE-INDEX.md) |
| Notifications subscribe to QKI or Domain Events       | [NOTIFICATION-PLATFORM.md](../v1.1/apzqep-120/NOTIFICATION-PLATFORM.md)     |
| Commands consume QKI; execute via registered handlers | [COMMAND-PLATFORM.md](../v1.1/apzqep-120/COMMAND-PLATFORM.md)               |

---

## Related

- [APZQEP-120-PLATFORM-FOUNDATION-COMPLETE.md](../v1.1/apzqep-120/APZQEP-120-PLATFORM-FOUNDATION-COMPLETE.md)
- [S13-COMPLETION.md](../v1.1/apzqep-120/S13-COMPLETION.md)
- [STANDING-PROGRAMME-RECORD.md](../STANDING-PROGRAMME-RECORD.md)
