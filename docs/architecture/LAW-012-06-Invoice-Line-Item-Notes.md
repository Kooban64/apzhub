# LAW-012-06 — Invoice Line Item Notes

> **Story:** LAW-012-06 — Billing Persistence

---

## Schema

Table: `law_invoice_line_item`

| Column                                            | Notes                                                        |
| ------------------------------------------------- | ------------------------------------------------------------ |
| `line_item_id`                                    | Primary key                                                  |
| `invoice_id`                                      | Parent invoice (no DB FK — consistent with other law tables) |
| `tenant_id`                                       | Tenant scope                                                 |
| `description`, `quantity`, `unit_price`, `amount` | Line totals                                                  |
| `matter_id`                                       | Must match invoice matter                                    |
| `time_entry_id`                                   | Optional link to `law_time_entry`                            |
| `expense_id`                                      | Optional placeholder for future expense entity               |

---

## Persistence strategy

- Line items are **owned children** of the invoice.
- On **create:** all line items inserted after header.
- On **update:** all line items deleted and re-inserted (full replace).
- On **read:** batch-loaded for list; per-invoice load for `getById`.

---

## References

| Reference    | Validation                                                   |
| ------------ | ------------------------------------------------------------ |
| Time entry   | Must exist, not soft-deleted, same tenant, same matter       |
| Expense      | Column present; no expense entity yet — not validated        |
| Disbursement | Stored on invoice header as `disbursements_placeholder` only |

---

## Mapper

`packages/config/src/db/law-mappers/invoice-row-mapper.ts`:

- `lineItemToRow()` — domain → insert row
- `rowToLineItem()` — select row → domain
