# LAW-015-12 — Trust CSV Format Notes

---

## General rules

- UTF-8 encoding
- RFC 4180-style quoting via `buildCsvContent()` (`apps/law-platform/lib/ux/export-csv.ts`)
- First row is always column headers
- Filename pattern: `trust-{reportType}-{reportId}.csv`

---

## Column maps by report type

| Report type              | Columns                                                                                                                    |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `trial_balance`          | Scope, Client ID, Matter ID, Balance, Currency                                                                             |
| `ledger`                 | Opened At, Journal Entries, Transactions                                                                                   |
| `journal`                | Journal Entry ID, Reference, Entry Date, Transaction ID, Debit Total, Credit Total, Line Count                             |
| `transactions`           | Transaction ID, Reference, Type, Amount, Currency, Transaction Date, Posting Date, Client ID, Matter ID, Status, Narrative |
| `client_statement`       | Client ID, Opening Balance, Closing Balance, Line Date, Line Type, Reference, Description, Amount, Effect                  |
| `matter_statement`       | Client ID, Matter ID, Opening Balance, Closing Balance, Line Date, Line Type, Reference, Description, Amount, Effect       |
| `allocation_summary`     | Allocation ID, Transaction ID, Client ID, Matter ID, Amount, Effect, Type, Date                                            |
| `interest_summary`       | Posting ID, Status, Period Start, Period End, Total Interest, Line Count                                                   |
| `transfer_summary`       | Transfer ID, Type, Status, Amount, Source Client, Destination Client, Created At                                           |
| `reconciliation_summary` | Reconciliation ID, Status, Started At, Completed At, Warnings, Errors, Transactions                                        |

Empty optional fields export as blank quoted cells.

---

## Empty reports

Reports with zero data lines still include the header row.
