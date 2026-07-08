# LAW-012-05 — Migration Notes

> **Story:** LAW-012-05 — Calendar + Time Persistence

---

## New migrations

| Tag                          | File                                                     | Purpose                                        |
| ---------------------------- | -------------------------------------------------------- | ---------------------------------------------- |
| `0005_law_calendar_time`     | `packages/config/drizzle/0005_law_calendar_time.sql`     | `law_calendar_event` + `law_time_entry` tables |
| `0006_law_calendar_time_rls` | `packages/config/drizzle/0006_law_calendar_time_rls.sql` | RLS policies                                   |

---

## Apply

```bash
pnpm db:migrate
```

---

## Truncate order (tests)

```
law_outbox_event → law_calendar_event → law_time_entry → law_task → law_document → law_matter → law_client
```

---

## Verification

`verifyLawMigrations()` requires six tags through `0006_law_calendar_time_rls`.
