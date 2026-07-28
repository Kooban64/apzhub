# Operational Readiness

## Deployable

- Migrations `0074`–`0076` are additive and ordered in the Drizzle journal.
- RLS policies deploy with `0075`.
- No data-destructive baseline migration exists.

## Supportability

- Locate baselines by number, id, and correlation id.
- Audit rows use baseline id context.
- Integrity verification is on-demand via API / Workbench action.
- Failure modes: permission denial, empty lock, duplicate membership,
  integrity mismatch, cross-tenant denial — all return Platform-standard errors.

## Limits (practical)

| Concern | Guidance |
|---|---|
| Membership size | Prefer bounded UI pages; fingerprint cost scales with membership |
| Comparison | Membership-only; large baselines may need progressive UI |
| Search | Eventual consistency via publication hooks |

## Forbidden support actions

Do **not** edit Locked baseline membership or fingerprints directly in SQL.
Escalate through Platform operational processes with correlation evidence.

See [SUPPORT-AND-RECOVERY.md](./SUPPORT-AND-RECOVERY.md) and
[KNOWN-LIMITATIONS.md](./KNOWN-LIMITATIONS.md).
