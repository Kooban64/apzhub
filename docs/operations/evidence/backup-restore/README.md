# Backup restore drill evidence

> **Programme:** APZHUB-1.2-002 · **Backlog:** R12-OPS-01 · **Risk:** OPS-R-04

Store dated recovery evidence JSON files produced by:

```bash
pnpm ops:backup-restore-drill -- --mode live
```

## Naming

`YYYYMMDDTHHMMSSZ-R12-OPS-01-{dry-run|live}-{PASS|FAIL|BLOCKED}.json`

## Rules

- No connection strings, passwords, or dump contents in evidence files
- Platform PostgreSQL only
- Live **PASS** evidence younger than 90 days = current for ops currency checks
