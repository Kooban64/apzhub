# APZ Law Platform 1.0.0 — Administrator Guide

> **Product:** APZ Law Platform  
> **Version:** **1.0.0**  
> **Audience:** Firm admins · platform operators · superadmins  
> **Date:** 2026-07-19

---

## Enablement

1. Deploy / enable `apps/law-platform` (default port **3301** — see ENVIRONMENT.md for coexistence).
2. Ensure platform PostgreSQL migrations for Law schemas are applied.
3. Configure Better Auth and legal permission keys (server authoritative).
4. Review governance / security / health routes under `/api/platform/v1/*` and `/api/health`.
5. Communicate Known Limitations (placeholder UX, FIN-001, no Email SoR).

## Permissions

- Use APZHUB PermissionService — never invent Law-local IAM.
- Superadmin is an explicit audited tier — not a bypass.
- OBS-LAW-01: closed under APZHUB-1.1-001 — Law uses session AuthorizationService grants (auth adapter).

## Trust

- Trust Accounting is an in-product Law capability (LAW-015).
- Restrict trust permissions to trust accountants / authorised roles.
- Backup Law schemas including trust ledgers.

## Operations checklist

See [Operational Readiness](../APZ-LAW-1.0-OPERATIONAL-READINESS.md) and [Post-Release Verification](../1.0.0/POST-RELEASE-VERIFICATION.md).

## Related

- [Licensing](../APZ-LAW-1.0-LICENSING.md)
- [Compatibility](../APZ-LAW-1.0-COMPATIBILITY.md)
- [Known Limitations](../../../products/apz-law/KNOWN-LIMITATIONS.md)
