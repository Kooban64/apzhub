# APZHUB Platform 1.0.0 — Platform Administration Guide

> **Audience:** Platform administrators · firm admins · superadmins  
> **Date:** 2026-07-19

## Responsibilities

| Area               | Admin actions                                                                 |
| ------------------ | ----------------------------------------------------------------------------- |
| Identity           | User lifecycle via platform identity; never engine-local logins as primary UX |
| Permissions        | PermissionService keys; least privilege; audit superadmin                     |
| Product enablement | Provisioning flows / feature flags as configured                              |
| Workbench          | Layout/preferences are personalisation — never grant permissions              |
| Integrations       | Configure connector refs; CE/self-hosted first                                |
| Observability      | Use platform metrics/observe/admin surfaces                                   |

## Product-specific admin

Follow each product’s Administrator Guide under `docs/releases/*/guides/` (or product packs).

## Related

- [Portfolio Governance Guide](./PORTFOLIO-GOVERNANCE-GUIDE.md)
- [Known Limitations Register](../1.0.0/KNOWN-LIMITATIONS-REGISTER.md)
