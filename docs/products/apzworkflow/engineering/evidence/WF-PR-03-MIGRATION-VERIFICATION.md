# WF-PR-03 — Migration verification

| Field  | Value            |
| ------ | ---------------- |
| ID     | **WF-PR-03**     |
| Status | **Closed**       |
| Date   | 20260808T133000Z |

## Commands

```bash
set -a && . ./.env && set +a && pnpm db:migrate
DATABASE_URL="$DATABASE_URL_TEST" pnpm db:migrate
```

Both reported `[db] Migrations applied` (20260808).

## Tables verified (apzhub + apzhub_test)

| Relation                                                       | Present |
| -------------------------------------------------------------- | ------- |
| `platform_workflow` (+ audit/category/folder/template/version) | Yes     |
| `platform_business_journey` (+ audit/instance/template)        | Yes     |
| `apz_platform_projects_approval_binding`                       | Yes     |

Migrations covered: `0044`/`0045`, `0103`/`0104`, `0114`.
