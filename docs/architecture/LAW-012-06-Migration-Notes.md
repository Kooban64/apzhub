# LAW-012-06 — Migration Notes

> **Story:** LAW-012-06 — Billing Persistence

---

## New migrations

| Tag                    | File                                               | Purpose                                        |
| ---------------------- | -------------------------------------------------- | ---------------------------------------------- |
| `0007_law_invoice`     | `packages/config/drizzle/0007_law_invoice.sql`     | `law_invoice` + `law_invoice_line_item` tables |
| `0008_law_invoice_rls` | `packages/config/drizzle/0008_law_invoice_rls.sql` | RLS policies                                   |

---

## Apply

```bash
pnpm db:migrate
```

---

## Truncate order (tests)

```
law_outbox_event → law_invoice_line_item → law_invoice → law_calendar_event → law_time_entry → law_task → law_document → law_matter → law_client
```

---

## Verification

`verifyLawMigrations()` requires eight tags through `0008_law_invoice_rls`.
