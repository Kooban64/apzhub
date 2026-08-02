# Backup and Restore

## Backup

```bash
source .env
pg_dump "$DATABASE_URL" --format=custom --file="/tmp/apzqep-151-$(date -u +%Y%m%dT%H%M%SZ).dump"
```

## Restore (certification / non-prod)

```bash
pg_restore --clean --if-exists --no-owner --dbname="$DATABASE_URL" /tmp/apzqep-151-….dump
```

## After restore

1. Verify Cap tables exist and row counts
2. Run `auditCoreQeDataIntegrity`
3. Drain/inspect `platform_outbox_event` for stuck processing leases
4. Rebuild QKI / reporting projections from authoritative events/sources

## Ownership

Platform operations owns backup schedules. APZQEP-151 validates readiness; does not deploy production jobs.
