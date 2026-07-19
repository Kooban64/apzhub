# Time Platform Services — Compatibility Statement

> **Programme:** APZHUB-PLATFORM-TIME-001

| Component                  | Version           | Compatibility                                         |
| -------------------------- | ----------------- | ----------------------------------------------------- |
| Integration SDK            | **1.0.0**         | Unchanged — consumed only                             |
| Kimai Integration          | **0.2.0**         | Domain CE via `adapter.core` (KIMAI-002 **ACCEPTED**) |
| Platform service contracts | **0.17.1**        | `foundationOnly` boolean; Time contracts retained     |
| Platform services          | **0.26.1**        | `createKimaiDomainProvider` / `domainMode: kimai`     |
| APZ Projects / Plane       | **1.1.0 / 0.6.0** | Unaffected                                            |

Production Kimai domain path no longer uses foundation-only CRUD fallback for implemented CE domains. Reporting remains foundation-only.
