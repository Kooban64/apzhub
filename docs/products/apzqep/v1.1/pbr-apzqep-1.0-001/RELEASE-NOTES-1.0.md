# Release Notes — APZQEP Version 1.0

| Field      | Value                      |
| ---------- | -------------------------- |
| Product    | APZQEP                     |
| Version    | **1.0**                    |
| Release    | General Production Release |
| Resolution | PBR-APZQEP-1.0-001         |
| Timestamp  | 20260803T071607Z           |

## Summary

APZQEP Version 1.0 is authorised for General Availability after:

- Platform Foundation (APZQEP-120)
- Core Quality Engineering Caps A–F (APZQEP-140)
- Independent readiness audit historical NO-GO (APZQEP-150 — immutable)
- Durable Postgres persistence (APZQEP-151 — RB-001 cleared)
- Production RBAC & security hardening (APZQEP-152 — RB-002 cleared)
- Independent re-certification GO recommendation (APZQEP-150R)
- Product Board GO (this resolution)

## Capabilities

Enterprise Test Suite Management, Execution Plans, Execution Workspace, Defects, Requirements Traceability, and Enterprise Reporting — with durable persistence and fail-closed Cap RBAC.

## Known limitations

- Shell Cap navigation may show Cap routes until API 403 (UX).
- Project membership attribute ACL refinement deferred.
- Cap packages remain **0.1.0** until promotion execution under release governance.
- Cap-specific accessibility coverage will evolve in future releases.
- External ALM / AI integrations deferred.

## Security & persistence

- Cap A–F SoR: PostgreSQL with RLS and transactional outbox (APZQEP-151).
- Cap HTTP handlers: fail-closed permissions; no Cap write elevation (APZQEP-152).

## Upgrade / operations

Follow operational guides under `docs/products/apzqep/v1.1/apzqep-150/ops/` as current operational baseline, as re-certified under APZQEP-150R and authorised by this Board decision.
