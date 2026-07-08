# LAW-012-05 — RLS Update Notes

> **Story:** LAW-012-05 — Calendar + Time Persistence

---

## New policies

Migration `0006_law_calendar_time_rls.sql`:

| Table                | Policy                                |
| -------------------- | ------------------------------------- |
| `law_calendar_event` | `law_calendar_event_tenant_isolation` |
| `law_time_entry`     | `law_time_entry_tenant_isolation`     |

Both use `tenant_id = current_setting('app.tenant_id', true)` with FORCE RLS.

---

## Verification

`verifyLawMigrations()` checks ≥ 2 policies on `law_calendar_event` and `law_time_entry`.

---

## Outbox

Existing `law_outbox_event` RLS covers new aggregate types `calendar` and `time`.
