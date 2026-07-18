# APZHUB Platform Boundary Review

**Milestone:** PRH-011  
**Date:** 2026-07-09

---

## Boundary model

| Boundary          | Owns                                                         | Must not own                               |
| ----------------- | ------------------------------------------------------------ | ------------------------------------------ |
| **Platform Core** | Identity, authz, security, config, ops, lifecycle, bootstrap | Product business rules                     |
| **Products**      | Domain workflows (Law, Trust)                                | Platform lifecycle, IAM, ops control plane |
| **Frameworks**    | Presentation patterns (workbench, commands, search)          | Business logic                             |
| **Adapters**      | Persistence mapping in `@apzhub/config`                      | UI or API orchestration                    |

---

## Platform vs product ownership

### Platform owns

- Lifecycle state machine (`@apzhub/platform-lifecycle`)
- Operations control plane (`@apzhub/platform-operations`)
- Tenant membership validation (`validateUserTenantMembership`)
- Session security policy (`@apzhub/auth` + `@apzhub/platform-security`)
- Traffic governance and rate limiting
- Bootstrap and consolidated diagnostics

### Products participate

- Law Platform and Trust Accounting register in lifecycle product participation
- Products expose diagnostics extensions via bootstrap loader
- Products consume platform services — never bypass to raw persistence for platform concerns

---

## API boundaries

| Surface                         | Boundary             | Guard                                |
| ------------------------------- | -------------------- | ------------------------------------ |
| `/api/platform/v1/operations/*` | Platform ops         | `requirePlatformAdminRoute`          |
| `/api/platform/v1/tenants`      | Platform admin       | `requirePlatformAdminRoute`          |
| `/api/platform/v1/system/*`     | Health probes        | Public by design                     |
| `/api/law/v1/*`                 | Product API          | `withLawApiAuth` + tenant membership |
| `/api/platform/v1/preferences`  | User personalisation | Session auth                         |

---

## Data boundaries

| Datum                   | System of record                            |
| ----------------------- | ------------------------------------------- |
| Platform metadata       | Platform PostgreSQL via `@apzhub/config`    |
| Law business data       | Law schema via persistence adapters         |
| Trust accounting        | Law trust module — product-owned            |
| Operational diagnostics | Derived — never authoritative business data |

---

## Violations found

| Violation                                       | Status                                 |
| ----------------------------------------------- | -------------------------------------- |
| Platform package importing apps                 | None                                   |
| Product bypassing platform identity for Law API | None                                   |
| Circular lifecycle/operations dependency        | **Fixed PRH-011**                      |
| Config package law domain coupling              | Documented (TD-M16-M01) — not a bypass |

---

## Related

- [Architecture Compliance Report](./APZHUB-Architecture-Compliance-Report.md)
- [Capability Certification Matrix](./APZHUB-Capability-Certification-Matrix.md)
