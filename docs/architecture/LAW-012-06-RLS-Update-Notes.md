# LAW-012-06 — RLS Update Notes

> **Story:** LAW-012-06 — Billing Persistence

---

## New policies

Migration `0008_law_invoice_rls.sql`:

| Table                   | Policy                                   |
| ----------------------- | ---------------------------------------- |
| `law_invoice`           | `law_invoice_tenant_isolation`           |
| `law_invoice_line_item` | `law_invoice_line_item_tenant_isolation` |

Both use `tenant_id = current_setting('app.tenant_id', true)` with FORCE RLS.

---

## Verification

`verifyLawMigrations()` checks ≥ 2 policies on `law_invoice` and `law_invoice_line_item`.

---

## Outbox

Existing `law_outbox_event` RLS covers new aggregate type `invoice`.
