# SUP-PR-04 — Migration verification

| Field  | Value            |
| ------ | ---------------- |
| ID     | **SUP-PR-04**    |
| Slice  | **APZSUP-204**   |
| Status | **Closed**       |
| Date   | 20260808T174000Z |

## Commands

```bash
set -a && . ./.env && set +a && pnpm db:migrate
DATABASE_URL="$DATABASE_URL_TEST" pnpm db:migrate
```

## Tables / constraints verified

| Relation                                  | Check                                       |
| ----------------------------------------- | ------------------------------------------- |
| `platform_entity_mapping`                 | Present                                     |
| `platform_entity_mapping_entity_type_chk` | Includes Support entity types (`support_*`) |

Migration: `0141_platform_entity_mapping_support_types.sql`.

No new Support System-of-Record tables (011 — engines own ticket business data).
