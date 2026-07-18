# Zammad Analytics (`adapter.core.analytics`)

**Milestone:** OSS-102-05  
**Package:** `@apzhub/integration-zammad` **v0.4.0**  
**Access:** `adapter.core.analytics` (`ZammadAnalyticsService`)

---

## Purpose

Read-only **Support intelligence** metrics derived from ticket inventory (and article counts where available). Does **not** invent unsupported engine metrics and does **not** implement an SLA engine.

```text
adapter.core.analytics
  → ZammadAnalyticsService
  → ZammadOperationRunner
  → ZammadRestClient
  → list tickets (+ article totals for sampled tickets)
```

---

## Supported operations

| Method                   | Operation | Notes                                 |
| ------------------------ | --------- | ------------------------------------- |
| `getSupportIntelligence` | primary   | Returns `SupportIntelligenceSnapshot` |
| `getSnapshot`            | alias     | Naming symmetry with Plane analytics  |

---

## Metrics included when available

- Ticket counts: total, open, closed, pending, new
- Overdue (heuristic when SLA API absent: open/new untouched > 7 days)
- Unassigned
- Distributions: by priority, state, organization, group, owner
- Article count (sampled inventory)

### Explicitly omitted unless engine provides signal

- `averageFirstResponseMinutes` — omitted in CE inventory mode
- SLA breach clocks, macros, triggers

---

## Canonical model

`SupportIntelligenceSnapshot` / `SupportDistributionBucket` from `@apzhub/platform-service-contracts`.

---

## Limitations

- Derived from ticket list inventory (no mandatory dedicated CE stats API)
- Overdue is a documented heuristic, not SLA truth
- Article count may be sampled for large inventories
- Read-only — no write analytics / no PlatformService wiring

---

## Related

- [ZAMMAD-ADAPTER.md](./ZAMMAD-ADAPTER.md)
- [OSS-102-05 Completion Report](../../docs/sprint/OSS-102-05-completion-report.md)
