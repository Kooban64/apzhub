# SUP-P1-04 — Attachment surface honesty

| Field  | Value            |
| ------ | ---------------- |
| ID     | **SUP-P1-04**    |
| Slice  | **APZSUP-104**   |
| Status | **Closed**       |
| Date   | 20260808T172500Z |

## Disposition

Keep ENG-0004 limits: **1 MiB max** per file; **no attachment delete** in product UI/API.

## Runtime match

| Layer           | Behaviour                                                                |
| --------------- | ------------------------------------------------------------------------ |
| Client read     | `SUPPORT_MAX_ATTACHMENT_BYTES = 1_048_576` in `read-attachment-files.ts` |
| Composers       | Visible “Max 1 MiB per file. Attachment delete is not available.”        |
| Attachment list | Download only — no delete control                                        |
| Help            | Limitations section restates both rules                                  |

## Tests

- `apps/web/lib/support/read-attachment-files.test.ts`
- `apps/web/components/support/customer-reply-composer.test.tsx` (limit copy)
