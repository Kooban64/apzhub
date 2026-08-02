# Migration Plan

1. Apply `0095` then `0096` via `pnpm db:migrate`
2. Fresh install: journal includes 0095/0096
3. Upgrade from pre-151: additive only — no drops
4. Ephemeral Cap A–F in-memory process state is **not** migrated as production data
5. Seeds/demo data are separate from schema migrations
6. Rollback: reverse additive tables only when empty / non-production; production rollback is restore-from-backup
