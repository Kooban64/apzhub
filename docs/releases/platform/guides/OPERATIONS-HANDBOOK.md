# APZHUB Platform 1.0.0 — Operations Handbook

> **Audience:** Platform operators · SREs · superadmins  
> **Date:** 2026-07-19

## Day-2 operations

1. Monitor health hierarchy (platform → products → connectors → engines).
2. Preserve correlation IDs end-to-end.
3. Back up PostgreSQL and configured object storage.
4. Rotate secrets via refs — never commit secrets.
5. Prefer Administration Workspace over exposing engine admin UIs.
6. Respect ENVIRONMENT.md coexistence constraints.
7. Communicate product Known Limitations to support staff.

## Incident posture

- Classify by product vs platform vs connector vs engine.
- Do not bypass Module → Service → Connector path as a “hotfix”.
- Escalate architecture freezes via ADR + Owner.

## Related

- [Operational Readiness](../1.0.0/OPERATIONAL-READINESS.md)
- [Operational Matrix](../1.0.0/OPERATIONAL-MATRIX.md)
- [Platform Administration Guide](./PLATFORM-ADMINISTRATION-GUIDE.md)
